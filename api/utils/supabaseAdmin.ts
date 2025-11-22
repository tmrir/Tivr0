
import { createClient } from '@supabase/supabase-js';

// استخدام متغيرات البيئة المناسبة لـ Vercel و Vite
const SUPABASE_URL = process.env.VITE_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  throw new Error('Missing Supabase Env Vars on Server (SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY)');
}

// هذا العميل يستخدم مفتاح الخدمة (Service Role)
// يتجاوز هذا المفتاح جميع سياسات RLS ويسمح بالكتابة والقراءة الكاملة
export const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});
