
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { supabaseAdmin } from '../../utils/supabaseAdmin';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ ok: false, error: 'Method Not Allowed' });
  }

  try {
    const { table, action, data, id } = req.body;

    if (!table || !action) {
        return res.status(400).json({ ok: false, error: 'Missing table or action' });
    }

    // Allowed tables to prevent arbitrary DB access
    const ALLOWED_TABLES = ['services', 'team_members', 'packages', 'case_studies', 'blog_posts', 'contact_messages', 'package_requests'];
    if (!ALLOWED_TABLES.includes(table)) {
        return res.status(403).json({ ok: false, error: 'Table not allowed' });
    }

    if (action === 'upsert') {
        const { data: result, error } = await supabaseAdmin
            .from(table)
            .upsert(data)
            .select()
            .single();
        
        if (error) throw error;
        return res.status(200).json({ ok: true, data: result });
    }

    if (action === 'delete') {
        if (!id) return res.status(400).json({ ok: false, error: 'Missing ID for delete' });
        
        const { error } = await supabaseAdmin
            .from(table)
            .delete()
            .eq('id', id);
            
        if (error) throw error;
        return res.status(200).json({ ok: true });
    }

    return res.status(400).json({ ok: false, error: 'Invalid action' });
  } catch (err: any) {
    console.error('Content Action API Error:', err);
    return res.status(500).json({ ok: false, error: err.message });
  }
}
