
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { supabaseAdmin } from '../../utils/supabaseAdmin';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return res.status(405).send('Method Not Allowed');

  try {
    // 1. جلب النسخة الاحتياطية الحالية
    const { data: current, error: fetchError } = await supabaseAdmin
      .from('settings')
      .select('default_snapshot')
      .eq('id', 1)
      .single();

    if (fetchError || !current?.default_snapshot) {
      throw new Error('No default snapshot found to restore from.');
    }

    const snapshotData = current.default_snapshot;

    // 2. تطبيق النسخة الاحتياطية على الأعمدة الرئيسية
    const { data, error: updateError } = await supabaseAdmin
      .from('settings')
      .update({
        ...snapshotData,
        updated_at: new Date().toISOString()
      })
      .eq('id', 1)
      .select()
      .single();

    if (updateError) throw updateError;

    return res.status(200).json({ success: true, data });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
}
