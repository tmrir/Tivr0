
import { createClient } from '@supabase/supabase-js';

// 1. Fallback Keys: Used if environment variables fail in Vercel (Common in static builds)
const FALLBACK_URL = 'https://udxgxfwzpipxptqumxrx.supabase.co';
const FALLBACK_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVkeGd4Znd6cGlweHB0cXVteHJ4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM1NDYwMDQsImV4cCI6MjA3OTEyMjAwNH0.azCJFR68ThudDE-VTcBG_qetIojIwnqLzYsqkFrCsFE';

// 2. Try to get env vars (Vite uses import.meta.env)
const supabaseUrl = (import.meta as any).env?.VITE_SUPABASE_URL || FALLBACK_URL;
const supabaseAnonKey = (import.meta as any).env?.VITE_SUPABASE_ANON_KEY || FALLBACK_KEY;

try {
  const isDev = !!(import.meta as any).env?.DEV;
  if (isDev) {
    console.log('🔌 Initializing Supabase Client...');
    console.log('   URL:', supabaseUrl);
    // Don't log the full key for security, just check existence
    console.log('   Key Present:', !!supabaseAnonKey);
  }
} catch {
  // ignore
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
});

// Export a helper to check connection status (simplified)
export const checkConnection = async () => {
    try {
        const { error } = await supabase.from('site_settings').select('count', { count: 'exact', head: true });
        return !error;
    } catch (e) {
        return false;
    }
};
