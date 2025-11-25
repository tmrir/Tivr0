import type { VercelRequest, VercelResponse } from '@vercel/node';
import { supabaseAdmin } from '../../utils/supabaseAdmin';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ ok: false, error: 'Method Not Allowed' });
  }

  try {
    // 1. Fetch current snapshot
    const { data: current, error: fetchError } = await supabaseAdmin
      .from('site_settings')
      .select('default_snapshot')
      .eq('id', 1)
      .single();

    if (fetchError || !current?.default_snapshot) {
      return res.status(400).json({ ok: false, error: 'No snapshot found to restore.' });
    }

    console.log('♻️ [RESTORE Settings] Found snapshot, restoring...');

    // 2. Apply snapshot to main columns
    const snapshot = current.default_snapshot;
    const { data, error: updateError } = await supabaseAdmin
      .from('site_settings')
      .update({
        ...snapshot,
        updated_at: new Date().toISOString()
      })
      .eq('id', 1)
      .select()
      .single();

    if (updateError) {
      console.error('❌ [RESTORE Settings] Update Failed:', updateError);
      return res.status(500).json({ ok: false, error: updateError.message });
    }

    return res.status(200).json({ ok: true, data });
  } catch (err: any) {
    console.error('❌ [RESTORE Settings] Fatal Error:', err);
    return res.status(500).json({ ok: false, error: err.message });
  }
}