import type { VercelRequest, VercelResponse } from '@vercel/node';
import { supabaseAdmin } from '../utils/supabaseAdmin';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // STRICT CACHE CONTROL
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');

  if (req.method !== 'POST') {
    return res.status(405).json({ ok: false, error: 'Method not allowed' });
  }

  try {
    const payload = req.body;
    
    // Ensure ID is 1 for the single settings row
    // payload should contain mapped fields like section_visibility from the client logic or mapped there
    // If client sends snake_case keys (which our useSettings hook does), this passes through cleanly
    const dataToSave = { ...payload, id: 1, updated_at: new Date().toISOString() };

    const { data, error } = await supabaseAdmin
      .from('site_settings')
      .upsert(dataToSave)
      .select()
      .single();

    if (error) throw error;

    return res.status(200).json({ ok: true, data });
  } catch (err: any) {
    console.error('Save Settings API Error:', err);
    return res.status(500).json({ ok: false, error: err.message });
  }
}