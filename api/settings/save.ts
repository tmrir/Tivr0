import type { VercelRequest, VercelResponse } from '@vercel/node';
import { supabaseAdmin } from '../../utils/supabaseAdmin';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method Not Allowed' });

  try {
    const body = req.body;
    console.log('💾 Saving Settings Payload...');

    const socialLinks = [
      { platform: 'Facebook', url: body.social_facebook },
      { platform: 'Twitter', url: body.social_twitter },
      { platform: 'Instagram', url: body.social_instagram }
    ].filter(l => l.url && l.url.length > 0);

    const addressPayload = typeof body.address === 'string' 
        ? { ar: body.address, en: body.address } 
        : (body.address || { ar: '', en: '' });

    const dbPayload = {
      contact_email: body.contact_email,
      contact_phone: body.contact_phone,
      address: addressPayload,
      
      logo_url: body.logo_url,
      icon_url: body.icon_url,
      footer_logo_url: body.footer_logo_url,
      favicon_url: body.favicon_url,

      social_links: socialLinks,
      
      top_banner: body.top_banner || {},
      bottom_banner: body.bottom_banner || {},
      section_texts: body.section_texts || {},
      home_sections: body.home_sections || {},
      privacy_policy: body.privacy_policy || {},
      terms_of_service: body.terms_of_service || {},

      updated_at: new Date().toISOString()
    };

    if (body.site_name) {
        (dbPayload as any).site_name = body.site_name;
    }

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
        console.error('❌ Supabase Save Error:', error);
        throw error;
    }

    return res.status(200).json({ success: true, data });
  } catch (err: any) {
    console.error('❌ Save API Error:', err);
    return res.status(500).json({ error: err.message });
  }
}