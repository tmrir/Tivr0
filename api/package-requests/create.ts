
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { supabaseAdmin } from '../utils/supabaseAdmin';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ ok: false, error: 'Method Not Allowed' });
  }

  try {
    const { name, phone, email, packageName } = req.body;

    // Strict validation
    if (!name || !phone || !packageName) {
        return res.status(400).json({ ok: false, error: 'Missing required fields' });
    }

    // Combine name and email to save email even if column is missing
    const safeName = email ? `${name} | ${email}` : name;

    // Insert into DB mapping payload to DB columns
    // Using standard 'name' and 'phone' as fallback for failures with 'customer_name'
    const { data, error } = await supabaseAdmin
      .from('package_requests')
      .insert([
        { 
            name: safeName,
            phone: phone,
            package_name: packageName,
            created_at: new Date().toISOString()
        }
      ])
      .select();

    if (error) {
        console.error("DB Insert Error:", error);
        throw error;
    }

    return res.status(200).json({ ok: true, data });
  } catch (err: any) {
    console.error('Create Package Request Error:', err);
    return res.status(500).json({ ok: false, error: err.message });
  }
}
