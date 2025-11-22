
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { supabaseAdmin } from '../../utils/supabaseAdmin';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return res.status(405).send('Method Not Allowed');

  const newData = req.body;

  // تنظيف البيانات (حذف id و updated_at لتجنب المشاكل)
  delete newData.id;
  delete newData.updated_at;
  delete newData.default_snapshot; // لا نريد تخزين سناب شوت داخل سناب شوت

  try {
    // 1. تحديث الأعمدة + تحديث الـ snapshot ليكون هو النسخة الحالية
    const { data, error } = await supabaseAdmin
      .from('settings')
      .update({
        ...newData,
        updated_at: new Date().toISOString(),
        default_snapshot: newData // <-- التحديث التلقائي للمحتوى الافتراضي
      })
      .eq('id', 1)
      .select()
      .single();

    if (error) throw error;

    return res.status(200).json({ success: true, data });
  } catch (error: any) {
    console.error('Save Error:', error);
    return res.status(500).json({ error: error.message });
  }
}
