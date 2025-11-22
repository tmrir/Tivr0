
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { supabaseAdmin } from '../../utils/supabaseAdmin';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return res.status(405).send('Method Not Allowed');

  const newData = req.body;

  // تنظيف البيانات: حذف الحقول التي لا يجب تعديلها يدوياً
  delete newData.id;
  delete newData.updated_at;
  
  // ملاحظة: نقوم بحذف default_snapshot من البيانات الواردة لأننا سنقوم ببنائها بأنفسنا
  delete newData.default_snapshot;

  try {
    // المنطق: تحديث الأعمدة العادية + وضع نسخة من البيانات في default_snapshot
    // هذا يحقق طلبك: "آخر نسخة حفظتها تصبح النسخة الافتراضية الجديدة"
    
    const payload = {
      ...newData,
      updated_at: new Date().toISOString(),
      default_snapshot: newData // حفظ نسخة كاملة من البيانات كـ JSON
    };

    // استخدام upsert لضمان الإنشاء إذا لم يكن الصف موجوداً
    const { data, error } = await supabaseAdmin
      .from('settings')
      .upsert({ id: 1, ...payload }) 
      .select()
      .single();

    if (error) throw error;

    return res.status(200).json({ success: true, data });
  } catch (error: any) {
    console.error('Save Settings Error:', error);
    return res.status(500).json({ error: error.message });
  }
}
