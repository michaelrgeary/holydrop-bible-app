import { GET, POST } from '@/app/api/annotations/route'
import { NextRequest } from 'next/server'
import { mockAnnotation } from '../utils/test-helpers'

// Mock the Supabase server client
jest.mock('@/lib/supabase/server', () => ({
  createClient: jest.fn().mockResolvedValue({
    from: jest.fn(() => ({
      select: jest.fn().mockReturnThis(),
      insert: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      lte: jest.fn().mockReturnThis(),
      gte: jest.fn().mockReturnThis(),
      order: jest.fn().mockReturnThis(),
      limit: jest.fn().mockReturnThis(),
      single: jest.fn().mockResolvedValue({ data: mockAnnotation, error: null }),
    })),
    auth: {
      getUser: jest.fn().mockResolvedValue({ 
        data: { user: { id: 'test-user', email: 'test@example.com' } }, 
        error: null 
      }),
    },
  }),
}))

describe('Annotations API Route', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('GET /api/annotations', () => {
    testBothModes('returns annotations with correct source', async (mode) => {
      const url = 'http://localhost:3001/api/annotations?book=Genesis&chapter=1'
      const request = new NextRequest(url)
      
      const response = await GET(request)
      const data = await response.json()
      
      expect(response.status).toBe(200)
      expect(data).toHaveProperty('annotations')
      expect(data).toHaveProperty('source')
      
      if (mode === 'mock') {
        expect(data.source).toBe('mock')
        expect(data.annotations).toHaveLength(2) // Mock data has 2 annotations
      } else {
        // In real mode, it would attempt database connection
        expect(data.source).toBe('database')
      }
    })

    it('filters by book, chapter, and verse', async () => {
      const url = 'http://localhost:3001/api/annotations?book=Genesis&chapter=1&verse=1'
      const request = new NextRequest(url)
      
      const response = await GET(request)
      const data = await response.json()
      
      expect(response.status).toBe(200)
      expect(data).toHaveProperty('annotations')
    })
  })

  describe('POST /api/annotations', () => {
    testBothModes('creates annotation with correct source', async (mode) => {
      const request = new NextRequest('http://localhost:3001/api/annotations', {
        method: 'POST',
        body: JSON.stringify({
          book: 'Genesis',
          chapter: 1,
          verse_start: 1,
          content: 'Test annotation content',
        }),
      })
      
      const response = await POST(request)
      const data = await response.json()
      
      expect(response.status).toBe(200)
      expect(data).toHaveProperty('annotation')
      expect(data).toHaveProperty('source')
      
      if (mode === 'mock') {
        expect(data.source).toBe('mock')
        expect(data.annotation.id).toBeTruthy()
        expect(data.annotation.content).toBe('Test annotation content')
      } else {
        expect(data.source).toBe('database')
      }
    })

    it('returns error for missing required fields', async () => {
      const request = new NextRequest('http://localhost:3001/api/annotations', {
        method: 'POST',
        body: JSON.stringify({
          book: 'Genesis',
          // Missing chapter, verse_start, content
        }),
      })
      
      const response = await POST(request)
      const data = await response.json()
      
      expect(response.status).toBe(400)
      expect(data).toHaveProperty('error')
      expect(data.error).toContain('Missing required fields')
    })
  })
})