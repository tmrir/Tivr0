import type { VercelRequest, VercelResponse } from '@vercel/node';
import { supabaseAdmin } from '../../utils/supabaseAdmin';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method Not Allowed' });

  try {
    const body = req.body;
    console.log('💾 Saving Settings...', body);

    const socialLinks = [
      { platform: 'Facebook', url: body.social_facebook },
      { platform: 'Twitter', url: body.social_twitter },
      { platform: 'Instagram', url: body.social_instagram }
    ].filter(l => l.url);

    // لجعل العنوان متوافق مع النوع LocalizedString في DB، نرسله ككائن
    const addressPayload = { ar: body.address, en: body.address };

    const dbPayload = {
      contact_email: body.contact_email,
      contact_phone: body.contact_phone,
      address: addressPayload,
      logo_url: body.logo_url,
      icon_url: body.icon_url,
      social_links: socialLinks,
      updated_at: new Date().toISOString()
    };

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
        console.error('Supabase Write Error:', error);
        throw error;
    }

    return res.status(200).json({ success: true, data });
  } catch (err: any) {
    console.error('Save API Error:', err);
    return res.status(500).json({ error: err.message });
  }
}