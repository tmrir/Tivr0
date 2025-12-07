
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { supabaseAdmin } from '../utils/supabaseAdmin';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ ok: false, error: 'Method Not Allowed' });
  }

  try {
    const { name, phone, email, packageName } = req.body;

    if (!name || !phone || !packageName) {
        return res.status(400).json({ ok: false, error: 'Missing required fields' });
    }

    const { data, error } = await supabaseAdmin
      .from('package_requests')
      .insert([
        { 
            name, 
            phone, 
            email: email || '', 
            package_name: packageName,
            created_at: new Date().toISOString()
        }
      ])
      .select();

    if (error) throw error;

    return res.status(200).json({ ok: true, data });
  } catch (err: any) {
    console.error('Create Package Request Error:', err);
    return res.status(500).json({ ok: false, error: err.message });
  }
}
