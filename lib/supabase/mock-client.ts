// Mock Supabase client for development/deployment without Supabase credentials

export function createMockClient() {
  const mockClient = {
    auth: {
      getSession: () => Promise.resolve({ data: { session: null }, error: null }),
      getUser: () => Promise.resolve({ data: { user: null }, error: null }),
      signUp: () => Promise.resolve({ data: null, error: new Error('Supabase not configured') }),
      signInWithPassword: () => Promise.resolve({ data: null, error: new Error('Supabase not configured') }),
      signOut: () => Promise.resolve({ error: null }),
      onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } }, error: null }),
    },
    from: (_table: string) => ({
      select: () => Promise.resolve({ data: [], error: null }),
      insert: () => Promise.resolve({ data: null, error: new Error('Supabase not configured') }),
      update: () => Promise.resolve({ data: null, error: new Error('Supabase not configured') }),
      delete: () => Promise.resolve({ data: null, error: new Error('Supabase not configured') }),
      upsert: () => Promise.resolve({ data: null, error: new Error('Supabase not configured') }),
    }),
    storage: {
      from: (_bucket: string) => ({
        upload: () => Promise.resolve({ data: null, error: new Error('Supabase not configured') }),
        download: () => Promise.resolve({ data: null, error: new Error('Supabase not configured') }),
        remove: () => Promise.resolve({ data: null, error: new Error('Supabase not configured') }),
        list: () => Promise.resolve({ data: [], error: null }),
        getPublicUrl: (_path: string) => ({ data: { publicUrl: '' } }),
      }),
    },
    rpc: () => Promise.resolve({ data: null, error: new Error('Supabase not configured') }),
  };

  return mockClient as any;
}