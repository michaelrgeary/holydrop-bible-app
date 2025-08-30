import { createClient } from "@/lib/supabase/server";
import type {
  Annotation,
  AnnotationWithVotes,
  InsertAnnotation,
  InsertUserHighlight,
  UserHighlight,
  ChapterAnnotations,
  User
} from "./types";

// ============================================
// ANNOTATION QUERIES
// ============================================

/**
 * Get all annotations for a specific chapter
 * Includes user information and current user's vote if logged in
 */
export async function getAnnotationsForChapter(
  book: string,
  chapter: number,
  userId?: string
): Promise<AnnotationWithVotes[]> {
  const supabase = await createClient();
  
  const query = supabase
    .from("annotations")
    .select(`
      *,
      user:users!user_id (*),
      annotation_votes!left (
        vote_type,
        user_id
      )
    `)
    .eq("book", book)
    .eq("chapter", chapter)
    .order("verse_start", { ascending: true })
    .order("created_at", { ascending: false });

  const { data, error } = await query;

  if (error) {
    console.error("Error fetching annotations:", error);
    throw error;
  }

  // Transform the data to include user_vote for current user
  const annotationsWithVotes: AnnotationWithVotes[] = (data || []).map((annotation: any) => {
    const user_vote = userId
      ? annotation.annotation_votes?.find((vote: any) => vote.user_id === userId)
      : undefined;

    return {
      ...annotation,
      user: annotation.user,
      user_vote: user_vote ? {
        annotation_id: annotation.id,
        user_id: user_vote.user_id,
        vote_type: user_vote.vote_type,
        created_at: annotation.created_at
      } : undefined,
      annotation_votes: undefined // Remove the raw votes array
    };
  });

  return annotationsWithVotes;
}

/**
 * Create a new annotation
 */
export async function createAnnotation(data: Omit<InsertAnnotation, 'id' | 'user_id'>) {
  const supabase = await createClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    throw new Error("User must be authenticated to create annotations");
  }

  const { data: annotation, error } = await supabase
    .from("annotations")
    .insert({
      ...data,
      user_id: user.id
    })
    .select(`
      *,
      user:users!user_id (*)
    `)
    .single();

  if (error) {
    console.error("Error creating annotation:", error);
    throw error;
  }

  return annotation;
}

/**
 * Update an existing annotation
 */
export async function updateAnnotation(
  annotationId: string,
  updates: Partial<Omit<Annotation, 'id' | 'user_id' | 'created_at' | 'updated_at'>>
) {
  const supabase = await createClient();
  
  const { data: annotation, error } = await supabase
    .from("annotations")
    .update(updates)
    .eq("id", annotationId)
    .select()
    .single();

  if (error) {
    console.error("Error updating annotation:", error);
    throw error;
  }

  return annotation;
}

/**
 * Delete an annotation
 */
export async function deleteAnnotation(annotationId: string) {
  const supabase = await createClient();
  
  const { error } = await supabase
    .from("annotations")
    .delete()
    .eq("id", annotationId);

  if (error) {
    console.error("Error deleting annotation:", error);
    throw error;
  }

  return { success: true };
}

// ============================================
// VOTING QUERIES
// ============================================

/**
 * Vote on an annotation (upvote or downvote)
 * If user has already voted, it updates their vote
 */
export async function voteOnAnnotation(
  annotationId: string,
  voteType: number
) {
  const supabase = await createClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    throw new Error("User must be authenticated to vote");
  }

  // Check if user has already voted
  const { data: existingVote } = await supabase
    .from("annotation_votes")
    .select("vote_type")
    .eq("annotation_id", annotationId)
    .eq("user_id", user.id)
    .single();

  if (existingVote) {
    if (existingVote.vote_type === voteType) {
      // Same vote, remove it (toggle off)
      const { error } = await supabase
        .from("annotation_votes")
        .delete()
        .eq("annotation_id", annotationId)
        .eq("user_id", user.id);
      
      if (error) throw error;
      return { action: "removed", vote_type: voteType };
    } else {
      // Different vote, update it
      const { error } = await supabase
        .from("annotation_votes")
        .update({ vote_type: voteType })
        .eq("annotation_id", annotationId)
        .eq("user_id", user.id);
      
      if (error) throw error;
      return { action: "updated", vote_type: voteType };
    }
  } else {
    // No existing vote, create new
    const { error } = await supabase
      .from("annotation_votes")
      .insert({
        annotation_id: annotationId,
        user_id: user.id,
        vote_type: voteType
      });
    
    if (error) throw error;
    return { action: "created", vote_type: voteType };
  }
}

// ============================================
// HIGHLIGHT QUERIES
// ============================================

/**
 * Get user's highlights
 */
export async function getUserHighlights(
  userId?: string,
  includePublic: boolean = true
): Promise<UserHighlight[]> {
  const supabase = await createClient();
  
  let query = supabase
    .from("user_highlights")
    .select("*")
    .order("book", { ascending: true })
    .order("chapter", { ascending: true })
    .order("verse_start", { ascending: true });

  if (userId) {
    // Get user's own highlights and optionally public highlights from others
    if (includePublic) {
      query = query.or(`user_id.eq.${userId},is_public.eq.true`);
    } else {
      query = query.eq("user_id", userId);
    }
  } else {
    // Only get public highlights for anonymous users
    query = query.eq("is_public", true);
  }

  const { data, error } = await query;

  if (error) {
    console.error("Error fetching highlights:", error);
    throw error;
  }

  return data || [];
}

/**
 * Get highlights for a specific chapter
 */
export async function getHighlightsForChapter(
  book: string,
  chapter: number,
  userId?: string
): Promise<UserHighlight[]> {
  const supabase = await createClient();
  
  let query = supabase
    .from("user_highlights")
    .select("*")
    .eq("book", book)
    .eq("chapter", chapter)
    .order("verse_start", { ascending: true });

  if (userId) {
    // Get user's own highlights and public highlights from others
    query = query.or(`user_id.eq.${userId},is_public.eq.true`);
  } else {
    // Only get public highlights for anonymous users
    query = query.eq("is_public", true);
  }

  const { data, error } = await query;

  if (error) {
    console.error("Error fetching chapter highlights:", error);
    throw error;
  }

  return data || [];
}

/**
 * Create a new highlight
 */
export async function createHighlight(
  data: Omit<InsertUserHighlight, 'id' | 'user_id'>
): Promise<UserHighlight> {
  const supabase = await createClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    throw new Error("User must be authenticated to create highlights");
  }

  const { data: highlight, error } = await supabase
    .from("user_highlights")
    .insert({
      ...data,
      user_id: user.id
    })
    .select()
    .single();

  if (error) {
    console.error("Error creating highlight:", error);
    throw error;
  }

  return highlight;
}

/**
 * Update a highlight
 */
export async function updateHighlight(
  highlightId: string,
  updates: Partial<Omit<UserHighlight, 'id' | 'user_id' | 'created_at'>>
) {
  const supabase = await createClient();
  
  const { data: highlight, error } = await supabase
    .from("user_highlights")
    .update(updates)
    .eq("id", highlightId)
    .select()
    .single();

  if (error) {
    console.error("Error updating highlight:", error);
    throw error;
  }

  return highlight;
}

/**
 * Delete a highlight
 */
export async function deleteHighlight(highlightId: string) {
  const supabase = await createClient();
  
  const { error } = await supabase
    .from("user_highlights")
    .delete()
    .eq("id", highlightId);

  if (error) {
    console.error("Error deleting highlight:", error);
    throw error;
  }

  return { success: true };
}

// ============================================
// COMBINED QUERIES
// ============================================

/**
 * Get all annotations and highlights for a chapter
 */
export async function getChapterData(
  book: string,
  chapter: number,
  userId?: string
): Promise<ChapterAnnotations> {
  const [annotations, highlights] = await Promise.all([
    getAnnotationsForChapter(book, chapter, userId),
    getHighlightsForChapter(book, chapter, userId)
  ]);

  return {
    book,
    chapter,
    annotations,
    highlights
  };
}

// ============================================
// USER QUERIES
// ============================================

/**
 * Get or create user profile
 */
export async function getOrCreateUserProfile(userId: string): Promise<User> {
  const supabase = await createClient();
  
  // First try to get existing profile
  const { data: existingUser, error: fetchError } = await supabase
    .from("users")
    .select("*")
    .eq("id", userId)
    .single();

  if (existingUser) {
    return existingUser;
  }

  // If no profile exists and it's not a "not found" error, throw
  if (fetchError && fetchError.code !== 'PGRST116') {
    throw fetchError;
  }

  // Get auth user details
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user || user.id !== userId) {
    throw new Error("User not found");
  }

  // Create new profile with email username as default
  const username = user.email?.split('@')[0] || `user_${userId.substring(0, 8)}`;
  
  const { data: newUser, error: createError } = await supabase
    .from("users")
    .insert({
      id: userId,
      username: username,
      avatar_url: user.user_metadata?.avatar_url || null,
    })
    .select()
    .single();

  if (createError) {
    throw createError;
  }

  return newUser;
}

/**
 * Update user profile
 */
export async function updateUserProfile(
  userId: string,
  updates: Partial<Omit<User, 'id' | 'created_at' | 'updated_at'>>
) {
  const supabase = await createClient();
  
  const { data: user, error } = await supabase
    .from("users")
    .update(updates)
    .eq("id", userId)
    .select()
    .single();

  if (error) {
    console.error("Error updating user profile:", error);
    throw error;
  }

  return user;
}