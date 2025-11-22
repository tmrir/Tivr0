
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { supabaseAdmin } from '../../utils/supabaseAdmin';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return res.status(405).send('Method Not Allowed');

  try {
    // 1. قراءة حقل default_snapshot الحالي
    const { data: currentRecord, error: fetchError } = await supabaseAdmin
      .from('settings')
      .select('default_snapshot')
      .eq('id', 1)
      .single();

    if (fetchError || !currentRecord?.default_snapshot) {
      throw new Error('لا توجد نسخة احتياطية (default_snapshot) لاستعادتها.');
    }

    const snapshotData = currentRecord.default_snapshot;

    // 2. تحديث الأعمدة الرئيسية باستخدام البيانات المخزنة في الـ snapshot
    const { data, error: updateError } = await supabaseAdmin
      .from('settings')
      .update({
        ...snapshotData,
        updated_at: new Date().toISOString()
        // لا نحدث default_snapshot هنا، لأننا نستعيد منه فقط
      })
      .eq('id', 1)
      .select()
      .single();

    if (updateError) throw updateError;

    return res.status(200).json({ success: true, data });
  } catch (error: any) {
    console.error('Restore Settings Error:', error.message);
    return res.status(500).json({ error: error.message });
  }
}
