import type { VercelRequest, VercelResponse } from '@vercel/node';
import { supabaseAdmin } from '../../utils/supabaseAdmin';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // 1. قتل الكاش نهائياً
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');

  try {
    console.log('📥 [GET] Fetching settings...');

    const { data, error } = await supabaseAdmin
      .from('settings')
      .select('*')
      .eq('id', 1)
      .single();

    if (error) {
      console.error('❌ [GET] Supabase Error:', error);
      // If table doesn't exist or row missing, try to return empty object to prevent crash
      if (error.code === 'PGRST116') {
          return res.status(200).json({});
      }
      return res.status(500).json({ error: error.message });
    }

    console.log('✅ [GET] Success');
    return res.status(200).json(data);

  } catch (err: any) {
    console.error('❌ [GET] Server Error:', err.message);
    return res.status(500).json({ error: err.message });
  }
}