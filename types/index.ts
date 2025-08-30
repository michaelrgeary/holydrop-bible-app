export interface BibleVerse {
  book: string
  chapter: number
  verse: number
  text: string
}

export interface Annotation {
  id: string
  userId: string
  verseRef: string
  content: string
  drops: number
  createdAt: Date
  updatedAt: Date
}

export interface User {
  id: string
  username: string
  email: string
  avatar?: string
  createdAt: Date
}