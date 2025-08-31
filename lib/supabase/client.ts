import { createBrowserClient } from "@supabase/ssr";
import { createMockClient } from "./mock-client";

export function createClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  // Check if Supabase credentials are available
  if (!supabaseUrl || !supabaseAnonKey || supabaseUrl.includes('example.supabase.co')) {
    if (process.env.NODE_ENV === 'development') {
      console.warn('🔄 Supabase credentials not found, using mock client for offline mode');
    }
    return createMockClient();
  }

  return createBrowserClient(supabaseUrl, supabaseAnonKey);
}