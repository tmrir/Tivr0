import type { VercelRequest, VercelResponse } from '@vercel/node';
import { supabaseAdmin } from '../../utils/supabaseAdmin';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Ensure we always return JSON
  res.setHeader('Content-Type', 'application/json');

  try {
    if (req.method !== 'POST') {
      return res.status(405).json({ ok: false, error: 'Method Not Allowed' });
    }

    const payload = req.body;
    
    // Validation: Ensure payload exists
    if (!payload) {
        return res.status(400).json({ ok: false, error: 'Empty payload' });
    }

    console.log('💾 [SAVE] Processing...');

    // Prepare DB Payload
    const dbPayload = {
      ...payload,
      id: 1,
      updated_at: new Date().toISOString(),
      default_snapshot: payload 
    };

    // Execute Update
    const { data, error } = await supabaseAdmin
      .from('site_settings')
      .upsert(dbPayload)
      .select()
      .single();

    if (error) {
      console.error('❌ [SAVE] DB Error:', error);
      return res.status(500).json({ ok: false, error: error.message });
    }

    console.log('✅ [SAVE] Success');
    return res.status(200).json({ ok: true, data });

  } catch (err: any) {
    console.error('❌ [SAVE] Crash:', err);
    // Catch-all for server crashes to ensure JSON response
    return res.status(500).json({ ok: false, error: 'Internal Server Error: ' + (err.message || 'Unknown') });
  }
}