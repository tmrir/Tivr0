import { createClient } from '@supabase/supabase-js';

// Fallback Keys: Used if environment variables fail
const FALLBACK_URL = 'https://udxgxfwzpipxptqumxrx.supabase.co';
const FALLBACK_SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVkeGd4Znd6cGlweHB0cXVteHJ4Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MzU0NjAwNCwiZXhwIjoyMDc5MTIyMDA0fQ.q4pJ2wLHzJZoT9L2J2J2J2J2J2J2J2J2J2J2J2J2J2J';

// Try to get env vars (Vite uses import.meta.env)
const supabaseUrl = (import.meta as any).env?.VITE_SUPABASE_URL || process.env.VITE_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || FALLBACK_URL;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || FALLBACK_SERVICE_ROLE_KEY;

console.log('🔌 Initializing Supabase Admin Client...');
console.log('   URL:', supabaseUrl);
console.log('   Service Role Key Present:', !!supabaseServiceRoleKey);

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