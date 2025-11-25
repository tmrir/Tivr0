import type { VercelRequest, VercelResponse } from '@vercel/node';
import { supabaseAdmin } from '../../utils/supabaseAdmin';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ ok: false, error: 'Method Not Allowed' });
  }

  try {
    const payload = req.body;
    console.log('💾 [SAVE Settings] Payload:', JSON.stringify(payload, null, 2));

    // Ensure we don't overwrite ID or create a new row
    const dbPayload = {
      ...payload,
      id: 1,
      updated_at: new Date().toISOString(),
      default_snapshot: payload // Auto-Backup: Save current state as snapshot
    };

    // Remove fields that shouldn't be in top-level columns if payload is nested
    // Assuming payload structure matches DB columns exactly based on frontend hook

    const { data, error } = await supabaseAdmin
      .from('site_settings')
      .upsert(dbPayload)
      .select()
      .single();

    if (error) {
      console.error('❌ [SAVE Settings] Supabase Error:', error);
      return res.status(500).json({ ok: false, error: error.message, details: error });
    }

    console.log('✅ [SAVE Settings] Success:', data.id);
    return res.status(200).json({ ok: true, data });
  } catch (err: any) {
    console.error('❌ [SAVE Settings] Fatal Error:', err);
    return res.status(500).json({ ok: false, error: err.message });
  }
}