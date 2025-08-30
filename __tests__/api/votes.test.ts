import { POST } from '@/app/api/votes/route'
import { NextRequest } from 'next/server'

// Mock the Supabase server client
jest.mock('@/lib/supabase/server', () => ({
  createClient: jest.fn().mockResolvedValue({
    from: jest.fn(() => ({
      select: jest.fn().mockReturnThis(),
      insert: jest.fn().mockReturnThis(),
      update: jest.fn().mockReturnThis(),
      delete: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      single: jest.fn().mockResolvedValue({ data: null, error: null }),
    })),
    auth: {
      getUser: jest.fn().mockResolvedValue({ 
        data: { user: { id: 'test-user', email: 'test@example.com' } }, 
        error: null 
      }),
    },
  }),
}))

describe('Votes API Route', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('POST /api/votes', () => {
    testBothModes('processes vote with correct source', async (mode) => {
      const request = new NextRequest('http://localhost:3001/api/votes', {
        method: 'POST',
        body: JSON.stringify({
          annotation_id: 'test-annotation-id',
          vote_type: 'up',
        }),
      })
      
      const response = await POST(request)
      const data = await response.json()
      
      expect(response.status).toBe(200)
      expect(data).toHaveProperty('success')
      expect(data).toHaveProperty('source')
      expect(data.success).toBe(true)
      
      if (mode === 'mock') {
        expect(data.source).toBe('mock')
        expect(data.vote_count).toBeGreaterThanOrEqual(0)
        expect(data.vote_count).toBeLessThanOrEqual(100)
      } else {
        expect(data.source).toBe('database')
      }
    })

    it('handles upvote correctly', async () => {
      const request = new NextRequest('http://localhost:3001/api/votes', {
        method: 'POST',
        body: JSON.stringify({
          annotation_id: 'test-id',
          vote_type: 'up',
        }),
      })
      
      const response = await POST(request)
      const data = await response.json()
      
      expect(response.status).toBe(200)
      expect(data.vote_type).toBe('up')
    })

    it('handles downvote correctly', async () => {
      const request = new NextRequest('http://localhost:3001/api/votes', {
        method: 'POST',
        body: JSON.stringify({
          annotation_id: 'test-id',
          vote_type: 'down',
        }),
      })
      
      const response = await POST(request)
      const data = await response.json()
      
      expect(response.status).toBe(200)
      expect(data.vote_type).toBe('down')
    })

    it('returns error for invalid vote type', async () => {
      const request = new NextRequest('http://localhost:3001/api/votes', {
        method: 'POST',
        body: JSON.stringify({
          annotation_id: 'test-id',
          vote_type: 'invalid',
        }),
      })
      
      const response = await POST(request)
      const data = await response.json()
      
      expect(response.status).toBe(400)
      expect(data).toHaveProperty('error')
      expect(data.error).toContain('Invalid vote type')
    })

    it('returns error for missing annotation_id', async () => {
      const request = new NextRequest('http://localhost:3001/api/votes', {
        method: 'POST',
        body: JSON.stringify({
          vote_type: 'up',
        }),
      })
      
      const response = await POST(request)
      const data = await response.json()
      
      expect(response.status).toBe(400)
      expect(data).toHaveProperty('error')
      expect(data.error).toContain('annotation_id')
    })
  })
})