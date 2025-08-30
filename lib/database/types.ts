// Database Types for holydrop.app
// These types match the database schema defined in schema.sql

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

// ============================================
// TABLE TYPES
// ============================================

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          username: string
          avatar_url: string | null
          bio: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          username: string
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          username?: string
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      annotations: {
        Row: {
          id: string
          book: string
          chapter: number
          verse_start: number
          verse_end: number
          text_selection: string
          annotation_text: string
          user_id: string
          upvotes: number
          downvotes: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          book: string
          chapter: number
          verse_start: number
          verse_end: number
          text_selection: string
          annotation_text: string
          user_id: string
          upvotes?: number
          downvotes?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          book?: string
          chapter?: number
          verse_start?: number
          verse_end?: number
          text_selection?: string
          annotation_text?: string
          user_id?: string
          upvotes?: number
          downvotes?: number
          created_at?: string
          updated_at?: string
        }
      }
      user_highlights: {
        Row: {
          id: string
          user_id: string
          book: string
          chapter: number
          verse_start: number
          verse_end: number
          color: string
          category: string | null
          note: string | null
          is_public: boolean
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          book: string
          chapter: number
          verse_start: number
          verse_end: number
          color?: string
          category?: string | null
          note?: string | null
          is_public?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          book?: string
          chapter?: number
          verse_start?: number
          verse_end?: number
          color?: string
          category?: string | null
          note?: string | null
          is_public?: boolean
          created_at?: string
        }
      }
      annotation_votes: {
        Row: {
          annotation_id: string
          user_id: string
          vote_type: number
          created_at: string
        }
        Insert: {
          annotation_id: string
          user_id: string
          vote_type: number
          created_at?: string
        }
        Update: {
          annotation_id?: string
          user_id?: string
          vote_type?: number
          created_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}

// ============================================
// HELPER TYPES
// ============================================

export type Tables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Row']
export type InsertTables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Insert']
export type UpdateTables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Update']

// Specific table types for easier imports
export type User = Tables<'users'>
export type Annotation = Tables<'annotations'>
export type UserHighlight = Tables<'user_highlights'>
export type AnnotationVote = Tables<'annotation_votes'>

// Insert types
export type InsertUser = InsertTables<'users'>
export type InsertAnnotation = InsertTables<'annotations'>
export type InsertUserHighlight = InsertTables<'user_highlights'>
export type InsertAnnotationVote = InsertTables<'annotation_votes'>

// Update types
export type UpdateUser = UpdateTables<'users'>
export type UpdateAnnotation = UpdateTables<'annotations'>
export type UpdateUserHighlight = UpdateTables<'user_highlights'>
export type UpdateAnnotationVote = UpdateTables<'annotation_votes'>

// ============================================
// EXTENDED TYPES WITH RELATIONS
// ============================================

export interface AnnotationWithUser extends Annotation {
  user: User
}

export interface AnnotationWithVotes extends Annotation {
  user: User
  user_vote?: AnnotationVote
}

export interface UserHighlightWithUser extends UserHighlight {
  user: User
}

// ============================================
// ENUMS AND CONSTANTS
// ============================================

export enum VoteType {
  DOWNVOTE = -1,
  UPVOTE = 1
}

export const HIGHLIGHT_CATEGORIES = [
  'promises',
  'wisdom',
  'comfort',
  'warning',
  'prophecy',
  'prayer',
  'praise',
  'commands',
  'love',
  'faith',
  'hope',
  'salvation'
] as const;

export type HighlightCategory = typeof HIGHLIGHT_CATEGORIES[number];

export const HIGHLIGHT_COLORS = {
  gold: '#FFD700',
  blue: '#03A9F4',
  green: '#4CAF50',
  purple: '#9C27B0',
  red: '#F44336',
  orange: '#FF9800',
  pink: '#E91E63',
  teal: '#009688'
} as const;

export type HighlightColor = keyof typeof HIGHLIGHT_COLORS;

// ============================================
// QUERY RESULT TYPES
// ============================================

export interface ChapterAnnotations {
  book: string
  chapter: number
  annotations: AnnotationWithVotes[]
  highlights: UserHighlight[]
}

export interface VerseReference {
  book: string
  chapter: number
  verse_start: number
  verse_end: number
}