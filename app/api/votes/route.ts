import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { annotation_id, vote_type } = body;

    if (!annotation_id || !vote_type) {
      return NextResponse.json(
        { error: 'annotation_id and vote_type are required' },
        { status: 400 }
      );
    }

    if (!['up', 'down'].includes(vote_type)) {
      return NextResponse.json(
        { error: 'Invalid vote type. Must be "up" or "down"' },
        { status: 400 }
      );
    }

    // Convert vote_type to numeric for database
    const numericVoteType = vote_type === 'up' ? 1 : -1;

    // Check if Supabase is configured
    const isSupabaseConfigured = 
      process.env.NEXT_PUBLIC_SUPABASE_URL && 
      !process.env.NEXT_PUBLIC_SUPABASE_URL.includes('your-project-id');

    if (!isSupabaseConfigured) {
      // Return mock response
      return NextResponse.json({ 
        success: true,
        vote_count: Math.floor(Math.random() * 100),
        vote_type,
        source: 'mock' 
      });
    }

    const supabase = await createClient();
    
    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized - Please sign in to vote' },
        { status: 401 }
      );
    }

    // Check if user already voted
    const { data: existingVote } = await supabase
      .from('votes')
      .select('*')
      .eq('annotation_id', annotation_id)
      .eq('user_id', user.id)
      .single();

    if (existingVote) {
      if (existingVote.vote_type === numericVoteType) {
        // Remove vote if clicking same button
        await supabase
          .from('votes')
          .delete()
          .eq('id', existingVote.id);
      } else {
        // Update vote if changing vote type
        await supabase
          .from('votes')
          .update({ vote_type: numericVoteType })
          .eq('id', existingVote.id);
      }
    } else {
      // Create new vote
      await supabase
        .from('votes')
        .insert({
          annotation_id,
          user_id: user.id,
          vote_type: numericVoteType,
        });
    }

    // Get updated vote count
    const { count } = await supabase
      .from('votes')
      .select('*', { count: 'exact' })
      .eq('annotation_id', annotation_id);

    // Update annotation vote count
    await supabase
      .from('annotations')
      .update({ vote_count: count || 0 })
      .eq('id', annotation_id);

    return NextResponse.json({ 
      success: true,
      vote_count: count || 0,
      vote_type,
      source: 'database' 
    });
  } catch (error) {
    console.error('Vote error:', error);
    return NextResponse.json(
      { error: 'Failed to process vote' },
      { status: 500 }
    );
  }
}