export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          username: string | null
          display_name: string | null
          avatar_url: string | null
          reputation: number
          created_at: string
        }
        Insert: {
          id: string
          username?: string | null
          display_name?: string | null
          avatar_url?: string | null
          reputation?: number
          created_at?: string
        }
        Update: {
          id?: string
          username?: string | null
          display_name?: string | null
          avatar_url?: string | null
          reputation?: number
          created_at?: string
        }
      }
      annotations: {
        Row: {
          id: string
          book: string
          chapter: number
          verse_start: number
          verse_end: number | null
          content: string
          author_id: string
          is_public: boolean
          vote_count: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          book: string
          chapter: number
          verse_start: number
          verse_end?: number | null
          content: string
          author_id: string
          is_public?: boolean
          vote_count?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          book?: string
          chapter?: number
          verse_start?: number
          verse_end?: number | null
          content?: string
          author_id?: string
          is_public?: boolean
          vote_count?: number
          created_at?: string
          updated_at?: string
        }
      }
      votes: {
        Row: {
          id: string
          annotation_id: string
          user_id: string
          vote_type: number
          created_at: string
        }
        Insert: {
          id?: string
          annotation_id: string
          user_id: string
          vote_type: number
          created_at?: string
        }
        Update: {
          id?: string
          annotation_id?: string
          user_id?: string
          vote_type?: number
          created_at?: string
        }
      }
      highlights: {
        Row: {
          id: string
          user_id: string
          book: string
          chapter: number
          verse_start: number
          verse_end: number | null
          color: string
          note: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          book: string
          chapter: number
          verse_start: number
          verse_end?: number | null
          color?: string
          note?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          book?: string
          chapter?: number
          verse_start?: number
          verse_end?: number | null
          color?: string
          note?: string | null
          created_at?: string
        }
      }
    }
  }
}