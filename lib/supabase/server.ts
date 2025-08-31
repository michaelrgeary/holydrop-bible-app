import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { createMockClient } from "./mock-client";

export async function createClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  // Check if Supabase credentials are available
  if (!supabaseUrl || !supabaseAnonKey || supabaseUrl.includes('example.supabase.co')) {
    if (process.env.NODE_ENV === 'development') {
      console.warn('🔄 Supabase credentials not found, using mock client for offline mode');
    }
    return createMockClient();
  }

  const cookieStore = await cookies();

  return createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => {
            cookieStore.set(name, value, options);
          });
        } catch (error) {
          // The `set` method was called from a Server Component.
          // This can be ignored if you have middleware refreshing
          // user sessions.
        }
      },
    },
  });
}