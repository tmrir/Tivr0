import type { VercelRequest, VercelResponse } from '@vercel/node';
import { supabaseAdmin } from '../../utils/supabaseAdmin';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return res.status(405).json({ ok: false, error: 'Method Not Allowed' });

  try {
    const { data: current } = await supabaseAdmin
      .from('site_settings')
      .select('default_snapshot')
      .eq('id', 1)
      .single();

    if (!current?.default_snapshot) {
      return res.status(400).json({ ok: false, error: 'No snapshot found' });
    }

    const { data, error } = await supabaseAdmin
      .from('site_settings')
      .update({
        ...current.default_snapshot,
        updated_at: new Date().toISOString()
      })
      .eq('id', 1)
      .select()
      .single();

    if (error) throw error;

    return res.status(200).json({ ok: true, data });
  } catch (err: any) {
    return res.status(500).json({ ok: false, error: err.message });
  }
}