import type { VercelRequest, VercelResponse } from '@vercel/node';
import { supabaseAdmin } from '../../utils/supabaseAdmin';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Ensure content type is JSON for all responses
  res.setHeader('Content-Type', 'application/json');

  // Guard against invalid method
  if (req.method !== 'POST') {
    return res.status(405).json({ ok: false, error: 'Method Not Allowed' });
  }

  try {
    // 1. Parse and Validate Payload
    const body = req.body;

    if (!body || typeof body !== 'object') {
      return res.status(400).json({ ok: false, error: 'Invalid or missing JSON payload' });
    }

    console.log('💾 [API] Saving Settings Payload...');

    // 2. Normalize Data (Ensure correct types for JSONB)
    const socialLinks = Array.isArray(body.social_links) ? body.social_links : [];
    
    // Fallback for address if it comes as string
    const addressPayload = typeof body.address === 'string' 
        ? { ar: body.address, en: body.address } 
        : (body.address || { ar: '', en: '' });

    // 3. Construct DB Payload
    const dbPayload = {
      // Standard fields
      contact_email: body.contact_email,
      contact_phone: body.contact_phone,
      address: addressPayload,
      
      // Images
      logo_url: body.logo_url,
      icon_url: body.icon_url,
      footer_logo_url: body.footer_logo_url,
      favicon_url: body.favicon_url,

      // Arrays/JSONs
      social_links: socialLinks,
      
      // CMS Blocks (JSONB) - Ensure they are objects, not null
      top_banner: body.top_banner || {},
      bottom_banner: body.bottom_banner || {},
      section_texts: body.section_texts || {},
      home_sections: body.home_sections || {},
      privacy_policy: body.privacy_policy || {},
      terms_of_service: body.terms_of_service || {},

      // Metadata
      id: 1, // Force singleton row
      updated_at: new Date().toISOString(),
      default_snapshot: body // Save backup
    };

    // Optional: Update site_name if provided (to avoid wiping it if missing)
    if (body.site_name) {
        (dbPayload as any).site_name = body.site_name;
    }

    // 4. Execute Update via Supabase Admin (Bypasses RLS)
    const { data, error } = await supabaseAdmin
      .from('site_settings')
      .upsert(dbPayload)
      .select()
      .single();

    // 5. Handle Database Error
    if (error) {
        console.error('❌ [API] Supabase Error:', error);
        return res.status(500).json({ ok: false, error: error.message, details: error });
    }

    // 6. Success Response
    console.log('✅ [API] Settings Saved Successfully');
    return res.status(200).json({ ok: true, data });

  } catch (err: any) {
    // 7. Catch-All Error Handler (Prevents HTML Error Pages)
    console.error('❌ [API] Fatal Crash:', err);
    return res.status(500).json({ 
        ok: false, 
        error: 'Internal Server Error', 
        message: err.message || 'Unknown error occurred' 
    });
  }
}