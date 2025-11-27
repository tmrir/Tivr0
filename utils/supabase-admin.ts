import { createClient } from '@supabase/supabase-js';

// Fallback values for development
const FALLBACK_URL = 'https://udxgxfwzpipxptqumxrx.supabase.co';
const FALLBACK_SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVkeGd4Znd6cGlweHB0cXVteHJ4Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MzU0NjAwNCwiZXhwIjoyMDc5MTIyMDA0fQ.l_NKToQ78NKqKxtheVMl0LYUO6uP043YCBEZApyDhi8';

// Try to get environment variables (Vite uses import.meta.env)
const SUPABASE_URL = (import.meta as any).env?.VITE_SUPABASE_URL || FALLBACK_URL;
const SUPABASE_SERVICE_ROLE_KEY = (import.meta as any).env?.SUPABASE_SERVICE_ROLE_KEY || FALLBACK_SERVICE_KEY;

// Global singleton instance
declare global {
  interface Window {
    __supabaseAdminInstance?: any;
  }
}

console.log('🔧 Initializing Supabase Admin Client...');
console.log('   URL:', SUPABASE_URL);
console.log('   Service Key Present:', !!SUPABASE_SERVICE_ROLE_KEY);
console.log('   Service Key Length:', SUPABASE_SERVICE_ROLE_KEY?.length || 0);
console.log('   Using Fallback:', SUPABASE_SERVICE_ROLE_KEY === FALLBACK_SERVICE_KEY);

// Create singleton instance using window object to persist across imports
if (!window.__supabaseAdminInstance) {
  window.__supabaseAdminInstance = createClient(
    SUPABASE_URL,
    SUPABASE_SERVICE_ROLE_KEY,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  );
  console.log('🔧 Created new Supabase Admin instance');
} else {
  console.log('🔧 Using existing Supabase Admin instance');
}

export const supabaseAdmin = window.__supabaseAdminInstance;