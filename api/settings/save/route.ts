import { NextResponse } from 'next/server';
import { supabaseAdmin } from '../../utils/supabaseAdmin';

export async function POST(request: Request) {
  const baseHeaders: HeadersInit = {
    'Content-Type': 'application/json',
    'Cache-Control': 'no-store, no-cache, must-revalidate, max-age=0, proxy-revalidate',
    Pragma: 'no-cache',
    Expires: '0',
    'Surrogate-Control': 'no-store',
    Vary: '*',
  };

  if (!supabaseAdmin) {
    console.error('Supabase Admin is undefined');
    return NextResponse.json(
      { ok: false, error: 'Supabase Admin not initialized' },
      { status: 500, headers: baseHeaders }
    );
  }

  try {
    const body = await request.json().catch(() => null);

    if (!body || typeof body !== 'object') {
      return NextResponse.json(
        { ok: false, error: 'Invalid or missing JSON payload' },
        { status: 400, headers: baseHeaders }
      );
    }

    console.log('💾 [API] Saving Settings Payload...');

    const socialLinks = Array.isArray(body.social_links) ? body.social_links : [];

    const addressPayload =
      typeof body.address === 'string'
        ? { ar: body.address, en: body.address }
        : body.address || { ar: '', en: '' };

    const dbPayload: any = {
      contact_email: body.contact_email,
      contact_phone: body.contact_phone,
      address: addressPayload,
      logo_url: body.logo_url,
      icon_url: body.icon_url,
      footer_logo_url: body.footer_logo_url,
      favicon_url: body.favicon_url,
      social_links: socialLinks,
      top_banner: body.top_banner || {},
      bottom_banner: body.bottom_banner || {},
      section_texts: body.section_texts || {},
      home_sections: body.home_sections || {},
      font_sizes: body.font_sizes || {},
      privacy_policy: body.privacy_policy || {},
      terms_of_service: body.terms_of_service || {},
      id: 1,
      updated_at: new Date().toISOString(),
      default_snapshot: body,
    };

    if (body.site_name) {
      dbPayload.site_name = body.site_name;
    }

    const { data, error } = await supabaseAdmin
      .from('site_settings')
      .upsert(dbPayload)
      .select()
      .single();

    if (error) {
      console.error('❌ [API] Supabase Error:', error);
      return NextResponse.json(
        { ok: false, error: error.message, details: error },
        { status: 500, headers: baseHeaders }
      );
    }

    console.log('✅ [API] Settings Saved Successfully');
    return NextResponse.json({ ok: true, data }, { status: 200, headers: baseHeaders });
  } catch (err: any) {
    console.error('❌ [API] Fatal Crash:', err);
    return NextResponse.json(
      {
        ok: false,
        error: 'Internal Server Error',
        message: err.message || 'Unknown error occurred',
      },
      { status: 500, headers: baseHeaders }
    );
  }
}
