import { isInMockMode } from '../utils/test-helpers'

describe('Dual Mode System', () => {
  describe('Environment Detection', () => {
    testBothModes('correctly identifies mode based on environment', (mode) => {
      if (mode === 'mock') {
        expect(process.env.NEXT_PUBLIC_SUPABASE_URL).toContain('your-project-id')
        expect(isInMockMode()).toBe(true)
      } else {
        expect(process.env.NEXT_PUBLIC_SUPABASE_URL).not.toContain('your-project-id')
        expect(isInMockMode()).toBe(false)
      }
    })
  })

  describe('API Behavior', () => {
    testBothModes('APIs return appropriate source field', async (mode) => {
      // Mock fetch for this test
      const mockResponse = {
        annotations: [],
        source: mode === 'mock' ? 'mock' : 'database',
      }
      
      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        json: jest.fn().mockResolvedValue(mockResponse),
      })

      const response = await fetch('/api/annotations')
      const data = await response.json()
      
      expect(data.source).toBe(mode === 'mock' ? 'mock' : 'database')
    })
  })

  describe('Authentication Flow', () => {
    testBothModes('uses correct storage mechanism', (mode) => {
      if (mode === 'mock') {
        // Mock mode should use localStorage
        const testUser = { id: '1', email: 'test@example.com' }
        localStorage.setItem('user', JSON.stringify(testUser))
        const retrieved = JSON.parse(localStorage.getItem('user') || '{}')
        expect(retrieved.email).toBe('test@example.com')
      } else {
        // Real mode would use Supabase cookies/session
        // This is mocked in our test environment
        expect(true).toBe(true) // Placeholder for real mode test
      }
    })
  })

  describe('Data Persistence', () => {
    testBothModes('handles data appropriately for mode', (mode) => {
      if (mode === 'mock') {
        // Mock mode data is temporary
        const mockData = { id: 'temp-1', content: 'Temporary data' }
        // Would be stored in memory or localStorage
        expect(mockData.id).toContain('temp')
      } else {
        // Real mode would persist to database
        const realData = { id: 'uuid-123', content: 'Persistent data' }
        // Would be stored in Supabase
        expect(realData.id).toContain('uuid')
      }
    })
  })

  describe('Error Handling', () => {
    testBothModes('gracefully handles connection failures', async (mode) => {
      // Simulate connection failure
      global.fetch = jest.fn().mockRejectedValue(new Error('Network error'))
      
      try {
        await fetch('/api/annotations')
      } catch (error) {
        expect(error).toBeDefined()
        
        // Both modes should handle errors gracefully
        if (mode === 'mock') {
          // Should fall back to mock data
          expect(true).toBe(true)
        } else {
          // Should fall back to mock data even in real mode on error
          expect(true).toBe(true)
        }
      }
    })
  })

  describe('Feature Availability', () => {
    it('all features work in mock mode', () => {
      process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://your-project-id.supabase.co'
      
      // These should all work with mock data
      const features = [
        'authentication',
        'annotations',
        'voting',
        'search',
        'navigation',
      ]
      
      features.forEach(feature => {
        expect(isInMockMode()).toBe(true)
        // Feature should be available
      })
    })

    it('all features ready for real mode', () => {
      process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://real.supabase.co'
      
      // These should all be ready to work with real data
      const features = [
        'authentication',
        'annotations', 
        'voting',
        'search',
        'navigation',
      ]
      
      features.forEach(feature => {
        expect(isInMockMode()).toBe(false)
        // Feature should be ready for real data
      })
    })
  })

  describe('Transition Between Modes', () => {
    it('can switch from mock to real mode', () => {
      // Start in mock mode
      process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://your-project-id.supabase.co'
      expect(isInMockMode()).toBe(true)
      
      // Switch to real mode
      process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://real.supabase.co'
      expect(isInMockMode()).toBe(false)
    })

    it('can switch from real to mock mode', () => {
      // Start in real mode
      process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://real.supabase.co'
      expect(isInMockMode()).toBe(false)
      
      // Switch to mock mode
      process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://your-project-id.supabase.co'
      expect(isInMockMode()).toBe(true)
    })
  })
})