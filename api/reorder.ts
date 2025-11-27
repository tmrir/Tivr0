import type { VercelRequest, VercelResponse } from '@vercel/node';
// Correct relative path: up one level to 'api', then into 'utils'
import { supabaseAdmin } from './utils/supabaseAdmin';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method Not Allowed' });

  try {
    const { table, items } = req.body;
    console.log(`🔄 [API] Reordering ${table} with ${items?.length || 0} items`);
    
    if (!table || !items) {
      console.error('❌ [API] Invalid payload:', { table, items });
      return res.status(400).json({ error: 'Invalid payload' });
    }

    // تحديث كل عنصر بالترتيب الجديد
    const updatePromises = items.map((item: any, index: number) => {
      console.log(`📝 [API] Updating item ${item.id} to order_index ${index}`);
      return supabaseAdmin.from(table).update({ order_index: index }).eq('id', item.id);
    });

    // انتظر كل التحديثات
    const results = await Promise.all(updatePromises);
    
    // تحقق من الأخطاء
    const errors = results.filter(result => result.error);
    if (errors.length > 0) {
      console.error('❌ [API] Some updates failed:', errors);
      return res.status(500).json({ error: 'Some updates failed', details: errors });
    }

    console.log('✅ [API] Reorder completed successfully');
    return res.status(200).json({ success: true, updatedCount: items.length });
  } catch (err: any) {
    console.error('❌ [API] Reorder error:', err);
    return res.status(500).json({ error: err.message });
  }
}