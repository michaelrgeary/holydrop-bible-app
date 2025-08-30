'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { User, Session } from '@supabase/supabase-js';
import { useRouter } from 'next/navigation';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signUp: (email: string, password: string, username?: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  session: null,
  loading: true,
  signIn: async () => ({ error: null }),
  signUp: async () => ({ error: null }),
  signOut: async () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    // Check active session
    const initializeAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        setSession(session);
        setUser(session?.user ?? null);
      } catch (error) {
        console.error('Auth initialization error:', error);
        // If Supabase is not configured, fall back to mock auth
        if (process.env.NEXT_PUBLIC_SUPABASE_URL?.includes('your-project-id')) {
          console.log('Using mock authentication (Supabase not configured)');
          // Check localStorage for mock user
          const savedUser = localStorage.getItem('user');
          if (savedUser) {
            const mockUser = JSON.parse(savedUser);
            setUser({
              id: mockUser.id,
              email: mockUser.email,
              app_metadata: {},
              user_metadata: {},
              aud: 'authenticated',
              created_at: new Date().toISOString(),
            } as User);
          }
        }
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);
      }
    );

    return () => subscription.unsubscribe();
  }, [supabase]);

  const signIn = async (email: string, password: string) => {
    try {
      // Check if Supabase is configured
      if (process.env.NEXT_PUBLIC_SUPABASE_URL?.includes('your-project-id')) {
        // Mock authentication
        console.log('Mock sign in:', email);
        const mockUser = {
          id: `user-${Date.now()}`,
          email,
          app_metadata: {},
          user_metadata: {},
          aud: 'authenticated',
          created_at: new Date().toISOString(),
        } as User;
        
        localStorage.setItem('user', JSON.stringify({ id: mockUser.id, email }));
        setUser(mockUser);
        return { error: null };
      }

      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      return { error: null };
    } catch (error) {
      return { error: error as Error };
    }
  };

  const signUp = async (email: string, password: string, username?: string) => {
    try {
      // Check if Supabase is configured
      if (process.env.NEXT_PUBLIC_SUPABASE_URL?.includes('your-project-id')) {
        // Mock sign up
        console.log('Mock sign up:', email, username);
        const mockUser = {
          id: `user-${Date.now()}`,
          email,
          app_metadata: {},
          user_metadata: { username: username || email.split('@')[0] },
          aud: 'authenticated',
          created_at: new Date().toISOString(),
        } as User;
        
        localStorage.setItem('user', JSON.stringify({ 
          id: mockUser.id, 
          email,
          username: username || email.split('@')[0]
        }));
        setUser(mockUser);
        return { error: null };
      }

      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            username: username || email.split('@')[0],
          },
        },
      });

      if (error) throw error;

      // Create profile entry
      if (data.user) {
        const { error: profileError } = await supabase
          .from('profiles')
          .insert({
            id: data.user.id,
            username: username || email.split('@')[0],
            email: email,
          });
        
        if (profileError) {
          console.error('Profile creation error:', profileError);
        }
      }

      return { error: null };
    } catch (error) {
      return { error: error as Error };
    }
  };

  const signOut = async () => {
    try {
      // Check if Supabase is configured
      if (process.env.NEXT_PUBLIC_SUPABASE_URL?.includes('your-project-id')) {
        // Mock sign out
        localStorage.removeItem('user');
        setUser(null);
        setSession(null);
        router.push('/');
        return;
      }

      await supabase.auth.signOut();
      router.push('/');
    } catch (error) {
      console.error('Sign out error:', error);
    }
  };

  return (
    <AuthContext.Provider value={{
      user,
      session,
      loading,
      signIn,
      signUp,
      signOut,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};