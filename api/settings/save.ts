import type { VercelRequest, VercelResponse } from '@vercel/node';
import { supabaseAdmin } from '../../utils/supabaseAdmin';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method Not Allowed' });

  try {
    const body = req.body;
    console.log('💾 Saving Settings Payload:', JSON.stringify(body, null, 2));

    const socialLinks = [
      { platform: 'Facebook', url: body.social_facebook },
      { platform: 'Twitter', url: body.social_twitter },
      { platform: 'Instagram', url: body.social_instagram }
    ].filter(l => l.url);

    // Ensure address is formatted correctly
    const addressPayload = typeof body.address === 'string' 
        ? { ar: body.address, en: body.address } 
        : (body.address || { ar: '', en: '' });

    const dbPayload = {
      contact_email: body.contact_email,
      contact_phone: body.contact_phone,
      address: addressPayload,
      
      // Logos
      logo_url: body.logo_url,
      icon_url: body.icon_url,
      footer_logo_url: body.footer_logo_url,
      favicon_url: body.favicon_url,

      // Arrays/JSONs
      social_links: socialLinks,
      
      // CMS JSON Fields
      top_banner: body.top_banner || {},
      bottom_banner: body.bottom_banner || {},
      section_texts: body.section_texts || {},
      home_sections: body.home_sections || {},
      privacy_policy: body.privacy_policy || {},
      terms_of_service: body.terms_of_service || {},

      updated_at: new Date().toISOString()
    };

    // Explicitly check for site_name to avoid NOT NULL violation if it's missing from UI payload
    if (body.site_name) {
        (dbPayload as any).site_name = body.site_name;
    }

    console.log('💾 DB Payload Prepared');

    const { data, error } = await supabaseAdmin
      .from('site_settings')
      .upsert({ 
        id: 1, 
        ...dbPayload,
        default_snapshot: dbPayload
      })
      .select()
      .single();

    if (error) {
        console.error('❌ Supabase Write Error:', error);
        throw error;
    }

    console.log('✅ Settings Saved Successfully');
    return res.status(200).json({ success: true, data });
  } catch (err: any) {
    console.error('❌ Save API Error:', err);
    return res.status(500).json({ error: err.message });
  }
}