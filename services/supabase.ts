import { createClient } from '@supabase/supabase-js';

// Helper to safely get environment variables
const getEnv = (key: string) => {
  try {
    // @ts-ignore
    if (typeof import.meta !== 'undefined' && (import.meta as any).env) {
      // @ts-ignore
      return (import.meta as any).env[key];
    }
    // @ts-ignore
    if (typeof process !== 'undefined' && process.env) {
      // @ts-ignore
      return process.env[key];
    }
  } catch (e) {
    // Ignore errors in strict environments
  }
  return '';
};

const rawUrl = getEnv('VITE_SUPABASE_URL');
const rawKey = getEnv('VITE_SUPABASE_ANON_KEY');

// Check if keys are actually present
export const isSupabaseConfigured = !!rawUrl && !!rawKey && rawUrl.includes('supabase.co');

// Use valid-looking placeholders if missing to prevent 'createClient' from throwing a syntax error immediately.
// We will handle the connection error gracefully in db.ts
const supabaseUrl = isSupabaseConfigured ? rawUrl : 'https://placeholder-project.supabase.co';
const supabaseKey = isSupabaseConfigured ? rawKey : 'public-anon-key-placeholder';

if (!isSupabaseConfigured) {
  console.warn('Supabase credentials missing. App will run in Demo Mode with local data.');
}

export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
});