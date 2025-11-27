import type { VercelRequest, VercelResponse } from '@vercel/node';
// Correct relative path: up one level to 'api', then into 'utils'
import { supabaseAdmin } from './utils/supabaseAdmin';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method Not Allowed' });

  try {
    const { table, items } = req.body;
    if (!table || !items) return res.status(400).json({ error: 'Invalid payload' });

    for (let i = 0; i < items.length; i++) {
        await supabaseAdmin.from(table).update({ order_index: i }).eq('id', items[i].id);
    }

    return res.status(200).json({ success: true });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
}