import type { VercelRequest, VercelResponse } from '@vercel/node';
import { supabaseAdmin } from './utils/supabaseAdmin';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method Not Allowed' });

  try {
    const { table, items } = req.body;

    if (!table || !items || !Array.isArray(items)) {
      return res.status(400).json({ error: 'Invalid payload. Requires table and items array.' });
    }

    console.log(`🔄 Reordering ${items.length} items in ${table}...`);

    // Perform updates sequentially to avoid race conditions or lock contention
    // Using a transaction would be ideal, but simple updates are safer for now
    for (let i = 0; i < items.length; i++) {
        const item = items[i];
        const { error } = await supabaseAdmin
            .from(table)
            .update({ order_index: i })
            .eq('id', item.id);
        
        if (error) {
            console.error(`❌ Failed to update index for item ${item.id}:`, error);
            // Continue trying others, or throw? Continuing is safer for partial success.
        }
    }

    return res.status(200).json({ success: true });
  } catch (err: any) {
    console.error('Reorder API Error:', err);
    return res.status(500).json({ error: err.message });
  }
}