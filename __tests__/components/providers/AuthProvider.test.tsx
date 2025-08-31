import React from 'react'
import { render, screen, waitFor } from '@testing-library/react'
import { AuthProvider, useAuth } from '@/components/providers/AuthProvider'
import { createTestClient } from '../../utils/test-helpers'

// Mock the Supabase client
jest.mock('@/lib/supabase/client', () => ({
  createClient: () => createTestClient(),
}))

// Mock next/navigation
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
  }),
}))

// Test component that uses the auth context
const TestComponent = () => {
  const { user, loading, signIn, signOut } = useAuth()
  return (
    <div>
      {loading ? (
        <div>Loading...</div>
      ) : user ? (
        <div>Logged in as {user.email}</div>
      ) : (
        <div>Not logged in</div>
      )}
      <button onClick={() => signIn('test@example.com', 'password')}>Sign In</button>
      <button onClick={signOut}>Sign Out</button>
    </div>
  )
}

describe('AuthProvider', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    localStorage.clear()
  })

  testBothModes('handles authentication correctly', async (mode) => {
    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    )

    // Wait for initial load
    await waitFor(() => {
      expect(screen.queryByText('Loading...')).not.toBeInTheDocument()
    })

    if (mode === 'mock') {
      // In mock mode, should check localStorage
      expect(localStorage.getItem).toHaveBeenCalled()
      expect(screen.getByText('Not logged in')).toBeInTheDocument()
    } else {
      // In real mode, would check Supabase session
      expect(screen.getByText('Not logged in')).toBeInTheDocument()
    }
  })

  it('handles sign in', async () => {
    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    )

    await waitFor(() => {
      expect(screen.queryByText('Loading...')).not.toBeInTheDocument()
    })

    const signInButton = screen.getByText('Sign In')
    signInButton.click()

    // In mock mode, should update localStorage
    if (process.env.NEXT_PUBLIC_SUPABASE_URL?.includes('your-project-id')) {
      await waitFor(() => {
        expect(localStorage.setItem).toHaveBeenCalledWith(
          'user',
          expect.stringContaining('test@example.com')
        )
      })
    }
  })

  it('handles sign out', async () => {
    // Set up a logged-in state
    localStorage.setItem('user', JSON.stringify({ id: '1', email: 'test@example.com' }))

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    )

    await waitFor(() => {
      expect(screen.queryByText('Loading...')).not.toBeInTheDocument()
    })

    const signOutButton = screen.getByText('Sign Out')
    signOutButton.click()

    // Should clear localStorage in mock mode
    if (process.env.NEXT_PUBLIC_SUPABASE_URL?.includes('your-project-id')) {
      await waitFor(() => {
        expect(localStorage.removeItem).toHaveBeenCalledWith('user')
      })
    }
  })

  it('persists session across renders', async () => {
    localStorage.setItem('user', JSON.stringify({ id: '1', email: 'persisted@example.com' }))

    const { rerender } = render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    )

    await waitFor(() => {
      expect(screen.queryByText('Loading...')).not.toBeInTheDocument()
    })

    // Rerender to test persistence
    rerender(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    )

    await waitFor(() => {
      expect(localStorage.getItem).toHaveBeenCalledWith('user')
    })
  })
})