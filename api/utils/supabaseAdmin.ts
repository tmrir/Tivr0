
import { createClient } from '@supabase/supabase-js';

// In Vercel Serverless Functions, environment variables are accessed via process.env
const SUPABASE_URL = process.env.VITE_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL) {
  console.error('❌ MISSING ENV VAR: VITE_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_URL');
}

if (!SUPABASE_SERVICE_ROLE_KEY) {
  console.error('❌ MISSING ENV VAR: SUPABASE_SERVICE_ROLE_KEY. Admin operations will fail.');
}

// Create a client with the SERVICE_ROLE_KEY which bypasses RLS policies
export const supabaseAdmin = createClient(
  SUPABASE_URL || '',
  SUPABASE_SERVICE_ROLE_KEY || '',
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
);
