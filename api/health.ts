
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { supabaseAdmin } from './utils/supabaseAdmin';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const vars = {
    VITE_SUPABASE_URL: !!process.env.VITE_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_URL: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
    SUPABASE_SERVICE_ROLE_KEY: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
  };

  // Test connection
  let connectionStatus = 'unknown';
  let errorDetails = null;
  try {
      const { data, error } = await supabaseAdmin.from('site_settings').select('count', { count: 'exact', head: true });
      if (error) {
          connectionStatus = 'error';
          errorDetails = error;
      } else {
          connectionStatus = 'connected';
      }
  } catch (e) {
      connectionStatus = 'exception';
      errorDetails = e;
  }

  res.status(200).json({
    environment_check: vars,
    connection_status: connectionStatus,
    error: errorDetails
  });
}
