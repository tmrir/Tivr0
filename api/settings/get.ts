import type { VercelRequest, VercelResponse } from '@vercel/node';
import { supabaseAdmin } from '../../utils/supabaseAdmin';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // منع الكاش نهائياً
  res.setHeader('Cache-Control', 'no-store, max-age=0');

  try {
    const { data, error } = await supabaseAdmin
      .from('site_settings')
      .select('*')
      .eq('id', 1)
      .single();

    if (error) throw error;
    if (!data) return res.status(200).json({});

    // تحويل البيانات من هيكل DB (Arrays/JSON) إلى هيكل UI (Flat Fields)
    const socialLinks = Array.isArray(data.social_links) ? data.social_links : [];
    
    const getLink = (platform: string) => 
      socialLinks.find((l: any) => l.platform.toLowerCase().includes(platform))?.url || '';

    const mappedData = {
      contact_email: data.contact_email || '',
      contact_phone: data.contact_phone || '',
      address: data.address || '', // Address is now text based on SQL migration
      logo_url: data.logo_url || '',
      icon_url: data.icon_url || '',
      // استخراج الروابط من المصفوفة
      social_facebook: getLink('facebook'),
      social_twitter: getLink('twitter'),
      social_instagram: getLink('instagram')
    };

    return res.status(200).json(mappedData);
  } catch (err: any) {
    console.error('GET Error:', err);
    return res.status(500).json({ error: err.message });
  }
}