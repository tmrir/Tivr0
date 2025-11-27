import type { VercelRequest, VercelResponse } from '@vercel/node';
import { supabaseAdmin } from '../utils/supabaseAdmin';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Content-Type', 'application/json');

  if (req.method !== 'POST') {
    return res.status(405).json({ ok: false, error: 'Method Not Allowed' });
  }

  try {
    // Get the last snapshot
    const { data: current, error: fetchError } = await supabaseAdmin
      .from('site_settings')
      .select('default_snapshot')
      .eq('id', 1)
      .single();

    if (fetchError || !current?.default_snapshot) {
      console.error('❌ [API] Supabase Fetch Snapshot Error:', fetchError);
      return res.status(500).json({ ok: false, error: fetchError?.message || 'No snapshot found' });
    }

    // Restore snapshot
    const { data, error: restoreError } = await supabaseAdmin
      .from('site_settings')
      .upsert({ id: 1, ...current.default_snapshot })
      .select()
      .single();

    if (restoreError) {
      console.error('❌ [API] Supabase Restore Error:', restoreError);
      return res.status(500).json({ ok: false, error: restoreError.message, details: restoreError });
    }

    return res.status(200).json({ ok: true, data });
  } catch (err: any) {
    console.error('❌ [API] Fatal Restore Error:', err);
    return res.status(500).json({ ok: false, error: 'Internal Server Error', message: err.message || 'Unknown error' });
  }
}