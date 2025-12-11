import { NextResponse } from 'next/server';
import { supabaseAdmin } from '../../utils/supabaseAdmin';

// حماية: فحص تهيئة Supabase عند تحميل الملف
if (!supabaseAdmin) {
  console.error('❌ Supabase Admin is undefined at load time.');
}

export async function GET(request: Request) {
  // إعداد الاستجابة كـ JSON + تعطيل الكاش
  const baseHeaders: HeadersInit = {
    'Content-Type': 'application/json',
    'Cache-Control': 'no-store, no-cache, must-revalidate, max-age=0, proxy-revalidate',
    Pragma: 'no-cache',
    Expires: '0',
    'Surrogate-Control': 'no-store',
    Vary: '*',
  };

  // حماية إضافية: supabaseAdmin غير مُهيأ
  if (!supabaseAdmin) {
    console.error('Supabase Admin is undefined');
    return NextResponse.json(
      { ok: false, error: 'Supabase Admin not initialized' },
      { status: 500, headers: baseHeaders }
    );
  }

  try {
    console.log('📡 [API] Fetching site settings…');

    const { data, error } = await supabaseAdmin
      .from('site_settings')
      .select('*')
      .eq('id', 1)
      .single();

    if (error) {
      console.error('❌ [API] Supabase Get Error:', error);
      return NextResponse.json(
        { ok: false, error: error.message, details: error },
        { status: 500, headers: baseHeaders }
      );
    }

    console.log('✅ [API] Settings Loaded Successfully');

    return NextResponse.json(
      { ok: true, data: data || {} },
      { status: 200, headers: baseHeaders }
    );
  } catch (err: any) {
    console.error('❌ [API] Fatal Get Error:', err);

    return NextResponse.json(
      {
        ok: false,
        error: 'Internal Server Error',
        message: err?.message || 'Unknown error',
      },
      { status: 500, headers: baseHeaders }
    );
  }
}
