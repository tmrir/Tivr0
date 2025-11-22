import type { VercelRequest, VercelResponse } from '@vercel/node';
import { supabaseAdmin } from '../../utils/supabaseAdmin';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method Not Allowed' });

  try {
    // 1. جلب Snapshot
    const { data: current, error: fetchError } = await supabaseAdmin
      .from('site_settings')
      .select('default_snapshot')
      .eq('id', 1)
      .single();

    if (fetchError || !current?.default_snapshot) {
      return res.status(400).json({ error: 'No snapshot found' });
    }

    // 2. استعادة البيانات
    const snapshot = current.default_snapshot;
    const { error: updateError } = await supabaseAdmin
      .from('site_settings')
      .update({
        ...snapshot,
        updated_at: new Date().toISOString()
      })
      .eq('id', 1);

    if (updateError) throw updateError;

    return res.status(200).json({ success: true });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
}