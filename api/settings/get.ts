import type { VercelRequest, VercelResponse } from '@vercel/node';
import { supabaseAdmin } from '../../utils/supabaseAdmin';

// ===============================
// 1) حماية: فحص تهيئة Supabase
// ===============================
if (!supabaseAdmin) {
  console.error('❌ Supabase Admin is undefined at load time.');
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // ===============================
  // 2) إجبار الاستجابة على JSON + إلغاء الكاش
  // ===============================
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, max-age=0, proxy-revalidate');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');
  res.setHeader('Surrogate-Control', 'no-store');
  res.setHeader('Vary', '*');

  // ===============================
  // 3) منع غير GET
  // ===============================
  if (req.method !== 'GET') {
    return res.status(405).json({ ok: false, error: 'Method Not Allowed' });
  }

  // ===============================
  // 4) حماية إضافية: supabaseAdmin غير مُهيأ
  // ===============================
  if (!supabaseAdmin) {
    console.error('❌ Supabase Admin is NOT initialized during request.');
    return res
      .status(500)
      .json({ ok: false, error: 'Supabase Admin not initialized', details: 'Instance is undefined' });
  }

  try {
    console.log('📡 [API] Fetching site settings…');

    // ===============================
    // 5) تنفيذ الاستعلام
    // ===============================
    const { data, error } = await supabaseAdmin
      .from('site_settings')
      .select('*')
      .eq('id', 1)
      .single();

    // ===============================
    // 6) معالجة خطأ Supabase
    // ===============================
    if (error) {
      console.error('❌ [API] Supabase Get Error:', error);
      return res.status(500).json({
        ok: false,
        error: error.message,
        details: error,
      });
    }

    // ===============================
    // 7) نتيجة ناجحة
    // ===============================
    console.log('✅ [API] Settings Loaded Successfully');

    return res.status(200).json({
      ok: true,
      data: data || {},
    });

  } catch (err: any) {
    // ===============================
    // 8) انهيار كامل محمي
    // ===============================
    console.error('❌ [API] Fatal Get Error:', err);

    return res.status(500).json({
      ok: false,
      error: 'Internal Server Error',
      message: err?.message || 'Unknown error',
    });
  }
}
