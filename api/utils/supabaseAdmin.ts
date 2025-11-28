import { createClient } from '@supabase/supabase-js';

// Try multiple environment variable names for Vercel compatibility
const SUPABASE_URL = process.env.VITE_SUPABASE_URL || 
                     process.env.NEXT_PUBLIC_SUPABASE_URL || 
                     process.env.SUPABASE_URL ||
                     'https://udxgxfwzpipxptqumxrx.supabase.co';

const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY ||
                                  process.env.SERVICE_ROLE_KEY ||
                                  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVkeGd4Znd6cGlweHB0cXVteHJ4Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTY5ODc4MjM0NCwiZXhwIjoyMDE0MzU4MzQ0fQ.7M7HnTnJdR2oNqTv1jKXZS3JhBn9vLjYkZQJd7o8X9o';

// Log environment variables for debugging
console.log('🔧 Supabase Admin Config:', {
  envVars: {
    VITE_SUPABASE_URL: !!process.env.VITE_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_URL: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
    SUPABASE_URL: !!process.env.SUPABASE_URL,
    SUPABASE_SERVICE_ROLE_KEY: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
    SERVICE_ROLE_KEY: !!process.env.SERVICE_ROLE_KEY
  },
  finalUrl: SUPABASE_URL,
  hasKey: !!SUPABASE_SERVICE_ROLE_KEY
});

// Create client with fallback values
export const supabaseAdmin = createClient(
  SUPABASE_URL,
  SUPABASE_SERVICE_ROLE_KEY,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  }
);