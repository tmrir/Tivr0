import type { VercelRequest, VercelResponse } from '@vercel/node';
import { supabaseAdmin } from '../../utils/supabaseAdmin';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method Not Allowed' });

  try {
    const body = req.body;
    console.log('💾 [SAVE] Request Body received:', body);

    // تنظيف البيانات: إزالة الحقول التي يولدها النظام
    const { id, updated_at, default_snapshot, ...editableFields } = body;

    // تجهيز البيانات للحفظ: نحدث الحقول + نأخذ نسخة منها في default_snapshot
    // هذا يحقق طلب "آخر نسخة حفظتها تصبح النسخة الافتراضية"
    const payload = {
      ...editableFields,
      updated_at: new Date().toISOString(),
      default_snapshot: editableFields // Auto-Backup logic
    };

    console.log('💾 [SAVE] Payload to Supabase:', payload);

    const { data, error } = await supabaseAdmin
      .from('settings')
      .upsert({ id: 1, ...payload }) // Upsert لضمان الإنشاء أو التحديث
      .select()
      .single();

    if (error) {
      console.error('❌ [SAVE] Supabase Error:', error);
      return res.status(500).json({ error: error.message, details: error });
    }

    console.log('✅ [SAVE] Success. Snapshot updated.');
    return res.status(200).json({ success: true, data });

  } catch (err: any) {
    console.error('❌ [SAVE] Server Error:', err.message);
    return res.status(500).json({ error: err.message });
  }
}