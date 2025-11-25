import type { VercelRequest, VercelResponse } from '@vercel/node';
// Correct relative path: up one level to 'settings', up one to 'api', then into 'utils'
import { supabaseAdmin } from '../../utils/supabaseAdmin';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Cache-Control', 'no-store, max-age=0');

  try {
    const { data, error } = await supabaseAdmin
      .from('site_settings')
      .select('*')
      .eq('id', 1)
      .single();

    if (error) {
      // Return empty object if row missing (fresh DB)
      if (error.code === 'PGRST116') return res.status(200).json({ ok: true, data: {} });
      throw error;
    }

    return res.status(200).json({ ok: true, data });
  } catch (err: any) {
    console.error('Get Settings API Error:', err);
    return res.status(500).json({ ok: false, error: err.message });
  }
}