import type { VercelRequest, VercelResponse } from '@vercel/node';
import { supabaseAdmin } from '../utils/supabaseAdmin';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // STRICT CACHE CONTROL FOR MOBILE BROWSERS & VERCEL EDGE
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0');
  res.setHeader('Pragma', 'no-cache'); // HTTP 1.0
  res.setHeader('Expires', '0'); // Proxies
  res.setHeader('Surrogate-Control', 'no-store');

  try {
    const { data, error } = await supabaseAdmin
      .from('site_settings')
      .select('*')
      .eq('id', 1)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return res.status(200).json({ ok: true, data: {} });
      throw error;
    }

    return res.status(200).json({ ok: true, data });
  } catch (err: any) {
    console.error('Get Settings API Error:', err);
    return res.status(500).json({ ok: false, error: err.message });
  }
}