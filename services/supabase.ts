
import { createClient } from '@supabase/supabase-js';

// استخدام المفاتيح المزودة مباشرة لضمان العمل الفوري
// في بيئة الإنتاج الحقيقية، يفضل استخدام process.env، لكن لحل المشكلة الحالية سنستخدم القيم المباشرة
const SUPABASE_URL = process.env.VITE_SUPABASE_URL || 'https://udxgxfwzpipxptqumxrx.supabase.co';
const SUPABASE_ANON_KEY = process.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVkeGd4Znd6cGlweHB0cXVteHJ4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM1NDYwMDQsImV4cCI6MjA3OTEyMjAwNH0.azCJFR68ThudDE-VTcBG_qetIojIwnqLzYsqkFrCsFE';

console.log('🔌 Connecting to Supabase:', SUPABASE_URL);

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
});

// دائماً صحيح لأننا وضعنا المفاتيح يدوياً
export const isSupabaseConfigured = true;
