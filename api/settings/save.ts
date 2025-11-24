import type { VercelRequest, VercelResponse } from '@vercel/node';
import { supabaseAdmin } from '../../utils/supabaseAdmin';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method Not Allowed' });

  const { slug, title, content } = req.body;

  if (!slug || !title) {
    return res.status(400).json({ error: 'Slug and Title are required' });
  }

  try {
    const { data, error } = await supabaseAdmin
      .from('cms_pages')
      .upsert(
        { 
          slug, 
          title, 
          content, 
          updated_at: new Date().toISOString() 
        }, 
        { onConflict: 'slug' }
      )
      .select()
      .single();

    if (error) throw error;

    return res.status(200).json({ success: true, data });
  } catch (err: any) {
    console.error('Save Page Error:', err);
    return res.status(500).json({ error: err.message });
  }
}