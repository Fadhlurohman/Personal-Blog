import { createClient } from '@supabase/supabase-js';
import { getCleanSupabaseUrl } from '@/lib/supabase/config';
import type { Database } from '@/types/database';

export function createAdminClient() {
  const supabaseUrl =
    getCleanSupabaseUrl(process.env.NEXT_PUBLIC_SUPABASE_URL) ||
    'https://placeholder.supabase.co';
  const serviceRoleKey =
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.placeholder';

  return createClient<Database>(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}
