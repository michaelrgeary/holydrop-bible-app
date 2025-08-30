import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

// Mock data for when Supabase isn't configured
const MOCK_ANNOTATIONS = [
  {
    id: '1',
    content: 'In the beginning - This phrase marks the absolute beginning of time and creation.',
    author: { username: 'theologian', reputation: 1250 },
    votes: 42,
    created_at: new Date().toISOString(),
  },
  {
    id: '2',
    content: 'The Hebrew word used here is "Elohim", which is plural, suggesting the Trinity.',
    author: { username: 'hebrew_scholar', reputation: 890 },
    votes: 38,
    created_at: new Date().toISOString(),
  },
];

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const book = searchParams.get('book');
  const chapter = searchParams.get('chapter');
  const verse = searchParams.get('verse');

  // Check if Supabase is configured
  const isSupabaseConfigured = 
    process.env.NEXT_PUBLIC_SUPABASE_URL && 
    !process.env.NEXT_PUBLIC_SUPABASE_URL.includes('your-project-id');

  if (!isSupabaseConfigured) {
    // Return mock data
    return NextResponse.json({ 
      annotations: MOCK_ANNOTATIONS,
      source: 'mock' 
    });
  }

  try {
    const supabase = await createClient();
    
    // Build query
    let query = supabase
      .from('annotations')
      .select(`
        *,
        author:profiles!author_id (
          username,
          display_name,
          reputation
        )
      `)
      .eq('is_public', true);

    if (book) query = query.eq('book', book);
    if (chapter) query = query.eq('chapter', parseInt(chapter));
    if (verse) {
      const verseNum = parseInt(verse);
      query = query.lte('verse_start', verseNum)
                  .gte('verse_end', verseNum);
    }

    const { data, error } = await query
      .order('vote_count', { ascending: false })
      .limit(20);

    if (error) {
      console.error('Supabase error:', error);
      // Fallback to mock data on error
      return NextResponse.json({ 
        annotations: MOCK_ANNOTATIONS,
        source: 'mock',
        error: error.message 
      });
    }

    return NextResponse.json({ 
      annotations: data || [],
      source: 'database' 
    });
  } catch (error) {
    console.error('API error:', error);
    // Fallback to mock data
    return NextResponse.json({ 
      annotations: MOCK_ANNOTATIONS,
      source: 'mock' 
    });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { book, chapter, verse_start, verse_end, content } = body;

    // Validate required fields
    if (!book || !chapter || !verse_start || !content) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Check if Supabase is configured
    const isSupabaseConfigured = 
      process.env.NEXT_PUBLIC_SUPABASE_URL && 
      !process.env.NEXT_PUBLIC_SUPABASE_URL.includes('your-project-id');

    if (!isSupabaseConfigured) {
      // Return mock response
      const mockAnnotation = {
        id: Math.random().toString(36).substring(7),
        book,
        chapter,
        verse_start,
        verse_end: verse_end || verse_start,
        content,
        author: { 
          username: 'current_user', 
          reputation: 100 
        },
        vote_count: 0,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      return NextResponse.json({ 
        annotation: mockAnnotation,
        source: 'mock' 
      });
    }

    const supabase = await createClient();
    
    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized - Please sign in' },
        { status: 401 }
      );
    }

    // Insert annotation
    const { data, error } = await supabase
      .from('annotations')
      .insert({
        book,
        chapter,
        verse_start,
        verse_end: verse_end || verse_start,
        content,
        author_id: user.id,
        is_public: true,
      })
      .select(`
        *,
        author:profiles!author_id (
          username,
          display_name,
          reputation
        )
      `)
      .single();

    if (error) {
      console.error('Supabase error:', error);
      return NextResponse.json(
        { error: 'Failed to create annotation' },
        { status: 500 }
      );
    }

    return NextResponse.json({ 
      annotation: data,
      source: 'database' 
    });
  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}