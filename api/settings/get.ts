import type { VercelRequest, VercelResponse } from '@vercel/node';
import { supabaseAdmin } from '../../utils/supabaseAdmin';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Content-Type', 'application/json');

  if (req.method !== 'GET') {
    return res.status(405).json({ ok: false, error: 'Method Not Allowed' });
  }

  try {
    const { data, error } = await supabaseAdmin
      .from('site_settings')
      .select('*')
      .eq('id', 1)
      .single();

    if (error) {
      console.error('❌ [API] Supabase Get Error:', error);
      return res.status(500).json({ ok: false, error: error.message, details: error });
    }

    return res.status(200).json({ ok: true, data });
  } catch (err: any) {
    console.error('❌ [API] Fatal Get Error:', err);
    return res.status(500).json({ ok: false, error: 'Internal Server Error', message: err.message || 'Unknown error' });
  }
}