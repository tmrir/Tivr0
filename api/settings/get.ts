import type { VercelRequest, VercelResponse } from '@vercel/node';
import { supabaseAdmin } from '../../utils/supabaseAdmin';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Prevent caching completely
  res.setHeader('Cache-Control', 'no-store, max-age=0');

  if (req.method !== 'GET') {
    return res.status(405).json({ ok: false, error: 'Method Not Allowed' });
  }

  try {
    const { data, error } = await supabaseAdmin
      .from('site_settings')
      .select('*')
      .eq('id', 1)
      .single();

    if (error) {
      console.error('❌ [GET Settings] DB Error:', error);
      // Return empty object if no settings found instead of crashing
      if (error.code === 'PGRST116') return res.status(200).json({ ok: true, data: {} });
      return res.status(500).json({ ok: false, error: error.message });
    }

    // Transform array social links to flat object if needed by frontend, 
    // or keep as is if frontend handles it. Assuming frontend handles array now.
    return res.status(200).json({ ok: true, data });
  } catch (err: any) {
    console.error('❌ [GET Settings] Server Error:', err);
    return res.status(500).json({ ok: false, error: err.message });
  }
}