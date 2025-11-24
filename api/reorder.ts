import type { VercelRequest, VercelResponse } from '@vercel/node';
import { supabaseAdmin } from './utils/supabaseAdmin';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method Not Allowed' });

  try {
    const { table, items } = req.body;

    if (!table || !items || !Array.isArray(items)) {
      return res.status(400).json({ error: 'Invalid payload.' });
    }

    console.log(`🔄 Reordering ${items.length} items in ${table}...`);

    // Sequential update to ensure lock consistency
    for (let i = 0; i < items.length; i++) {
        const item = items[i];
        // Using supabaseAdmin (Service Role) to bypass RLS on updates
        const { error } = await supabaseAdmin
            .from(table)
            .update({ order_index: i })
            .eq('id', item.id);
        
        if (error) {
            console.error(`❌ Failed index update for ${item.id}:`, error);
        }
    }

    return res.status(200).json({ success: true });
  } catch (err: any) {
    console.error('Reorder API Error:', err);
    return res.status(500).json({ error: err.message });
  }
}