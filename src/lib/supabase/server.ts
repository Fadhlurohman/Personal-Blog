import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { getCleanSupabaseUrl } from '@/lib/supabase/config';
import type { Database } from '@/types/database';

export async function createClient() {
  const cookieStore = await cookies();

  const supabaseUrl =
    getCleanSupabaseUrl(process.env.NEXT_PUBLIC_SUPABASE_URL) ||
    'https://placeholder.supabase.co';
  const supabaseAnonKey =
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.placeholder';

  return createServerClient<Database>(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        try {
          return cookieStore.getAll();
        } catch {
          return [];
        }
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options as CookieOptions)
          );
        } catch {
          // Ignored in Server Component renders
        }
      },
    },
  });
}
