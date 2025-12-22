import { createClient } from '@supabase/supabase-js';

// Fallback Keys: Used if environment variables fail
const FALLBACK_URL = 'https://udxgxfwzpipxptqumxrx.supabase.co';
// CRITICAL: NEVER hardcode Service Role Key in client-side code / fallback
const FALLBACK_SERVICE_ROLE_KEY = '';

// Try to get env vars (Vite uses import.meta.env)
const supabaseUrl = (import.meta as any).env?.VITE_SUPABASE_URL || process.env.VITE_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || FALLBACK_URL;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || FALLBACK_SERVICE_ROLE_KEY;

export const supabaseAdmin = createClient(
  supabaseUrl,
  supabaseServiceRoleKey,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  }
);