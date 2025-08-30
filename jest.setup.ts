import '@testing-library/jest-dom'

// Mock environment variables - both modes
const MOCK_ENV = {
  NEXT_PUBLIC_SUPABASE_URL: 'https://your-project-id.supabase.co',
  NEXT_PUBLIC_SUPABASE_ANON_KEY: 'mock-anon-key',
  SUPABASE_SERVICE_KEY: 'mock-service-key',
}

const REAL_ENV = {
  NEXT_PUBLIC_SUPABASE_URL: 'https://real.supabase.co',
  NEXT_PUBLIC_SUPABASE_ANON_KEY: 'real-anon-key',
  SUPABASE_SERVICE_KEY: 'real-service-key',
}

// Helper to test both modes
declare global {
  function testBothModes(testName: string, testFn: (mode: 'mock' | 'real') => void): void
}

global.testBothModes = (testName: string, testFn: (mode: 'mock' | 'real') => void) => {
  describe(testName, () => {
    test('mock mode', () => {
      Object.assign(process.env, MOCK_ENV)
      testFn('mock')
    })
    
    test('real mode', () => {
      Object.assign(process.env, REAL_ENV)
      testFn('real')
    })
  })
}

// Mock Next.js navigation
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    refresh: jest.fn(),
    back: jest.fn(),
    forward: jest.fn(),
    prefetch: jest.fn(),
  }),
  useSearchParams: () => new URLSearchParams(),
  usePathname: () => '/',
  useParams: () => ({}),
}))

// Mock next/headers
jest.mock('next/headers', () => ({
  cookies: () => ({
    get: jest.fn(),
    set: jest.fn(),
    getAll: jest.fn(() => []),
  }),
}))

// Mock localStorage for tests
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
}
global.localStorage = localStorageMock as any

// Mock fetch for API tests
global.fetch = jest.fn()

// Reset mocks before each test
beforeEach(() => {
  jest.clearAllMocks()
  localStorageMock.getItem.mockClear()
  localStorageMock.setItem.mockClear()
  localStorageMock.removeItem.mockClear()
  localStorageMock.clear.mockClear()
})