import { createClient } from '@supabase/supabase-js';

// استخدام متغيرات البيئة المناسبة لـ Vercel و Vite
const SUPABASE_URL = process.env.VITE_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error('❌ Missing Supabase Env Vars in Server Context');
  // We don't throw immediately to allow check-env scripts to run, but logging is critical
}

// هذا العميل يستخدم مفتاح الخدمة (Service Role)
// يتجاوز هذا المفتاح جميع سياسات RLS ويسمح بالكتابة والقراءة الكاملة
export const supabaseAdmin = createClient(
  SUPABASE_URL || '',
  SUPABASE_SERVICE_ROLE_KEY || '',
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  }
);