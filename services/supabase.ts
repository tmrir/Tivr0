
import { createClient } from '@supabase/supabase-js';

// 1. محاولة قراءة المتغيرات البيئية بالطرق المختلفة
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
    return undefined;
  }
  return undefined;
};

// 2. استخدام المفاتيح المزودة كاحتياطي استراتيجي (Hard Fallback)
// هذا يضمن أن التطبيق سيعمل 100% حتى لو فشلت قراءة المتغيرات البيئية في Vercel
const PROMPT_URL = 'https://udxgxfwzpipxptqumxrx.supabase.co';
const PROMPT_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVkeGd4Znd6cGlweHB0cXVteHJ4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM1NDYwMDQsImV4cCI6MjA3OTEyMjAwNH0.azCJFR68ThudDE-VTcBG_qetIojIwnqLzYsqkFrCsFE';

const supabaseUrl = getEnv('VITE_SUPABASE_URL') || PROMPT_URL;
const supabaseKey = getEnv('VITE_SUPABASE_ANON_KEY') || PROMPT_KEY;

console.log('🔌 Initializing Supabase Connection...');

export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
});

// نلغي التحقق الشرطي، نفترض دائماً أننا متصلون لأننا نملك المفاتيح
export const isSupabaseConfigured = true;
