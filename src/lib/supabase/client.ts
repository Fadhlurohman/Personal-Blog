import { createBrowserClient } from '@supabase/ssr';
import { getCleanSupabaseUrl } from '@/lib/supabase/config';
import type { Database } from '@/types/database';

export function createClient() {
  const supabaseUrl =
    getCleanSupabaseUrl(process.env.NEXT_PUBLIC_SUPABASE_URL) ||
    'https://placeholder.supabase.co';
  const supabaseAnonKey =
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.placeholder';

  return createBrowserClient<Database>(supabaseUrl, supabaseAnonKey);
}
