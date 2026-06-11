import { createClient } from '@supabase/supabase-js';

// Service-role client: kickflip_ tables have RLS on with no anon policies,
// so every read/write must come through these API routes.
export function serviceClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY,
    { auth: { persistSession: false } }
  );
}
