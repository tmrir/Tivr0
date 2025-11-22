import type { VercelRequest, VercelResponse } from '@vercel/node';
import { supabaseAdmin } from '../../utils/supabaseAdmin';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method Not Allowed' });

  try {
    console.log('♻️ [RESTORE] Starting restoration...');

    // 1. قراءة Snapshot
    const { data: current, error: fetchError } = await supabaseAdmin
      .from('settings')
      .select('default_snapshot')
      .eq('id', 1)
      .single();

    if (fetchError || !current?.default_snapshot) {
      console.error('❌ [RESTORE] No snapshot found:', fetchError);
      return res.status(400).json({ error: 'No backup snapshot found to restore.' });
    }

    const snapshot = current.default_snapshot;
    console.log('♻️ [RESTORE] Snapshot found:', snapshot);

    // 2. تطبيق الـ Snapshot على الأعمدة
    const { data, error: updateError } = await supabaseAdmin
      .from('settings')
      .update({
        ...snapshot,
        updated_at: new Date().toISOString()
      })
      .eq('id', 1)
      .select()
      .single();

    if (updateError) {
      console.error('❌ [RESTORE] Update Failed:', updateError);
      return res.status(500).json({ error: updateError.message });
    }

    console.log('✅ [RESTORE] Success');
    return res.status(200).json({ success: true, data });

  } catch (err: any) {
    console.error('❌ [RESTORE] Server Error:', err.message);
    return res.status(500).json({ error: err.message });
  }
}