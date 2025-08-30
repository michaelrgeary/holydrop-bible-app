-- holydrop.app Database Schema
-- Community-powered Bible annotations platform

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- USERS TABLE
-- ============================================
-- Extends Supabase auth.users with additional profile information
CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT UNIQUE NOT NULL,
  avatar_url TEXT,
  bio TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create index for username lookups
CREATE INDEX IF NOT EXISTS idx_users_username ON public.users(username);

-- ============================================
-- ANNOTATIONS TABLE
-- ============================================
-- Stores community annotations on Bible verses
CREATE TABLE IF NOT EXISTS public.annotations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  book TEXT NOT NULL,
  chapter INTEGER NOT NULL CHECK (chapter > 0),
  verse_start INTEGER NOT NULL CHECK (verse_start > 0),
  verse_end INTEGER NOT NULL CHECK (verse_end >= verse_start),
  text_selection TEXT NOT NULL, -- The highlighted text from the verse
  annotation_text TEXT NOT NULL, -- The actual annotation/commentary
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  upvotes INTEGER DEFAULT 0 CHECK (upvotes >= 0),
  downvotes INTEGER DEFAULT 0 CHECK (downvotes >= 0),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create composite index for efficient verse lookups
CREATE INDEX IF NOT EXISTS idx_annotations_book_chapter ON public.annotations(book, chapter);
CREATE INDEX IF NOT EXISTS idx_annotations_user_id ON public.annotations(user_id);
CREATE INDEX IF NOT EXISTS idx_annotations_created_at ON public.annotations(created_at DESC);

-- ============================================
-- USER_HIGHLIGHTS TABLE  
-- ============================================
-- Personal highlights and notes on verses
CREATE TABLE IF NOT EXISTS public.user_highlights (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  book TEXT NOT NULL,
  chapter INTEGER NOT NULL CHECK (chapter > 0),
  verse_start INTEGER NOT NULL CHECK (verse_start > 0),
  verse_end INTEGER NOT NULL CHECK (verse_end >= verse_start),
  color TEXT NOT NULL DEFAULT '#FFD700', -- Default gold/holy color
  category TEXT, -- Categories like "promises", "wisdom", "comfort", etc.
  note TEXT, -- Optional personal note
  is_public BOOLEAN DEFAULT FALSE, -- Whether others can see this highlight
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create indexes for highlight lookups
CREATE INDEX IF NOT EXISTS idx_user_highlights_user_id ON public.user_highlights(user_id);
CREATE INDEX IF NOT EXISTS idx_user_highlights_book_chapter ON public.user_highlights(book, chapter);
CREATE INDEX IF NOT EXISTS idx_user_highlights_is_public ON public.user_highlights(is_public) WHERE is_public = TRUE;

-- ============================================
-- ANNOTATION_VOTES TABLE
-- ============================================
-- Tracks user votes on annotations (one vote per user per annotation)
CREATE TABLE IF NOT EXISTS public.annotation_votes (
  annotation_id UUID NOT NULL REFERENCES public.annotations(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  vote_type INTEGER NOT NULL CHECK (vote_type IN (-1, 1)), -- -1 for downvote, 1 for upvote
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  PRIMARY KEY (annotation_id, user_id)
);

-- Create index for vote lookups
CREATE INDEX IF NOT EXISTS idx_annotation_votes_annotation_id ON public.annotation_votes(annotation_id);
CREATE INDEX IF NOT EXISTS idx_annotation_votes_user_id ON public.annotation_votes(user_id);

-- ============================================
-- TRIGGERS FOR UPDATED_AT
-- ============================================
-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = TIMEZONE('utc'::text, NOW());
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for tables with updated_at
DROP TRIGGER IF EXISTS update_users_updated_at ON public.users;
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON public.users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_annotations_updated_at ON public.annotations;
CREATE TRIGGER update_annotations_updated_at BEFORE UPDATE ON public.annotations
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================

-- Enable RLS on all tables
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.annotations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_highlights ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.annotation_votes ENABLE ROW LEVEL SECURITY;

-- ============================================
-- USERS TABLE POLICIES
-- ============================================
-- Anyone can view user profiles
CREATE POLICY "Public profiles are viewable by everyone" 
  ON public.users FOR SELECT 
  USING (true);

-- Users can insert their own profile
CREATE POLICY "Users can insert own profile" 
  ON public.users FOR INSERT 
  WITH CHECK (auth.uid() = id);

-- Users can update their own profile
CREATE POLICY "Users can update own profile" 
  ON public.users FOR UPDATE 
  USING (auth.uid() = id);

-- ============================================
-- ANNOTATIONS TABLE POLICIES  
-- ============================================
-- Anyone can view all annotations
CREATE POLICY "Annotations are viewable by everyone" 
  ON public.annotations FOR SELECT 
  USING (true);

-- Authenticated users can create annotations
CREATE POLICY "Authenticated users can create annotations" 
  ON public.annotations FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own annotations
CREATE POLICY "Users can update own annotations" 
  ON public.annotations FOR UPDATE 
  USING (auth.uid() = user_id);

-- Users can delete their own annotations
CREATE POLICY "Users can delete own annotations" 
  ON public.annotations FOR DELETE 
  USING (auth.uid() = user_id);

-- ============================================
-- USER_HIGHLIGHTS TABLE POLICIES
-- ============================================
-- Users can view all public highlights and their own private highlights
CREATE POLICY "View public highlights or own highlights" 
  ON public.user_highlights FOR SELECT 
  USING (is_public = true OR auth.uid() = user_id);

-- Users can create their own highlights
CREATE POLICY "Users can create own highlights" 
  ON public.user_highlights FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own highlights
CREATE POLICY "Users can update own highlights" 
  ON public.user_highlights FOR UPDATE 
  USING (auth.uid() = user_id);

-- Users can delete their own highlights
CREATE POLICY "Users can delete own highlights" 
  ON public.user_highlights FOR DELETE 
  USING (auth.uid() = user_id);

-- ============================================
-- ANNOTATION_VOTES TABLE POLICIES
-- ============================================
-- Anyone can view votes (for counting)
CREATE POLICY "Votes are viewable by everyone" 
  ON public.annotation_votes FOR SELECT 
  USING (true);

-- Authenticated users can vote (one vote per annotation)
CREATE POLICY "Authenticated users can vote" 
  ON public.annotation_votes FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own votes (change vote type)
CREATE POLICY "Users can update own votes" 
  ON public.annotation_votes FOR UPDATE 
  USING (auth.uid() = user_id);

-- Users can delete their own votes
CREATE POLICY "Users can delete own votes" 
  ON public.annotation_votes FOR DELETE 
  USING (auth.uid() = user_id);

-- ============================================
-- HELPER FUNCTIONS
-- ============================================

-- Function to handle vote updates and update annotation vote counts
CREATE OR REPLACE FUNCTION update_annotation_vote_counts()
RETURNS TRIGGER AS $$
BEGIN
  -- Update the annotation vote counts
  UPDATE public.annotations
  SET 
    upvotes = (
      SELECT COUNT(*) 
      FROM public.annotation_votes 
      WHERE annotation_id = COALESCE(NEW.annotation_id, OLD.annotation_id) 
      AND vote_type = 1
    ),
    downvotes = (
      SELECT COUNT(*) 
      FROM public.annotation_votes 
      WHERE annotation_id = COALESCE(NEW.annotation_id, OLD.annotation_id) 
      AND vote_type = -1
    )
  WHERE id = COALESCE(NEW.annotation_id, OLD.annotation_id);
  
  RETURN COALESCE(NEW, OLD);
END;
$$ language 'plpgsql';

-- Create triggers for vote count updates
DROP TRIGGER IF EXISTS update_annotation_votes_on_insert ON public.annotation_votes;
CREATE TRIGGER update_annotation_votes_on_insert
  AFTER INSERT ON public.annotation_votes
  FOR EACH ROW EXECUTE FUNCTION update_annotation_vote_counts();

DROP TRIGGER IF EXISTS update_annotation_votes_on_update ON public.annotation_votes;
CREATE TRIGGER update_annotation_votes_on_update
  AFTER UPDATE ON public.annotation_votes
  FOR EACH ROW EXECUTE FUNCTION update_annotation_vote_counts();

DROP TRIGGER IF EXISTS update_annotation_votes_on_delete ON public.annotation_votes;
CREATE TRIGGER update_annotation_votes_on_delete
  AFTER DELETE ON public.annotation_votes
  FOR EACH ROW EXECUTE FUNCTION update_annotation_vote_counts();

-- ============================================
-- COMMENTS
-- ============================================
-- This schema is designed for:
-- 1. Efficient verse lookups with composite indexes
-- 2. Vote tracking with automatic count updates
-- 3. Personal and public highlighting system
-- 4. Strong data integrity with foreign keys and constraints
-- 5. Row-level security for proper access control
-- 6. Automatic timestamp updates with triggers