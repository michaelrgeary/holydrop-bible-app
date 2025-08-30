export const mockAnnotation = {
  id: '1',
  content: 'Test annotation',
  book: 'genesis',
  chapter: 1,
  verse_start: 1,
  verse_end: 1,
  author: { username: 'testuser', reputation: 100 },
  vote_count: 0,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
}

export const mockUser = {
  id: 'mock-user-id',
  email: 'test@example.com',
  username: 'testuser',
  app_metadata: {},
  user_metadata: { username: 'testuser' },
  aud: 'authenticated',
  created_at: new Date().toISOString(),
}

// Detect which mode we're in
export const isInMockMode = () => {
  return process.env.NEXT_PUBLIC_SUPABASE_URL?.includes('your-project-id')
}

// Create appropriate client based on mode
export const createTestClient = () => {
  if (isInMockMode()) {
    return {
      from: jest.fn(() => ({
        select: jest.fn().mockReturnThis(),
        insert: jest.fn().mockReturnThis(),
        update: jest.fn().mockReturnThis(),
        delete: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({ data: mockAnnotation, error: null }),
        limit: jest.fn().mockReturnThis(),
        order: jest.fn().mockReturnThis(),
      })),
      auth: {
        getUser: jest.fn().mockResolvedValue({ data: { user: mockUser }, error: null }),
        signInWithPassword: jest.fn().mockResolvedValue({ data: { user: mockUser, session: {} }, error: null }),
        signUp: jest.fn().mockResolvedValue({ data: { user: mockUser }, error: null }),
        signOut: jest.fn().mockResolvedValue({ error: null }),
        getSession: jest.fn().mockResolvedValue({ data: { session: null }, error: null }),
        onAuthStateChange: jest.fn(() => ({ data: { subscription: { unsubscribe: jest.fn() } } })),
      }
    }
  }
  // Return real client mock for "real" mode testing
  return createSupabaseMock()
}

export const createSupabaseMock = () => {
  return {
    from: jest.fn(() => ({
      select: jest.fn().mockReturnThis(),
      insert: jest.fn().mockReturnThis(),
      update: jest.fn().mockReturnThis(),
      delete: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      lte: jest.fn().mockReturnThis(),
      gte: jest.fn().mockReturnThis(),
      single: jest.fn().mockResolvedValue({ data: mockAnnotation, error: null }),
      limit: jest.fn().mockReturnThis(),
      order: jest.fn().mockReturnThis(),
    })),
    auth: {
      getUser: jest.fn().mockResolvedValue({ data: { user: mockUser }, error: null }),
      signInWithPassword: jest.fn().mockResolvedValue({ data: { user: mockUser, session: {} }, error: null }),
      signUp: jest.fn().mockResolvedValue({ data: { user: mockUser }, error: null }),
      signOut: jest.fn().mockResolvedValue({ error: null }),
      getSession: jest.fn().mockResolvedValue({ data: { session: {} }, error: null }),
      onAuthStateChange: jest.fn(() => ({ data: { subscription: { unsubscribe: jest.fn() } } })),
    }
  }
}

// Mock response helper
export const mockFetch = (response: any, status = 200) => {
  return jest.fn().mockResolvedValue({
    ok: status >= 200 && status < 300,
    status,
    json: jest.fn().mockResolvedValue(response),
    text: jest.fn().mockResolvedValue(JSON.stringify(response)),
  })
}