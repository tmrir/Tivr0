import type { VercelRequest, VercelResponse } from '@vercel/node';
import { supabaseAdmin } from '../../utils/supabaseAdmin';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Cache-Control', 'no-store, max-age=0');

  try {
    const { data, error } = await supabaseAdmin
      .from('site_settings')
      .select('*')
      .eq('id', 1)
      .single();

    if (error) throw error;
    if (!data) return res.status(200).json({});

    const socialLinks = Array.isArray(data.social_links) ? data.social_links : [];
    
    const getLink = (platform: string) => 
      socialLinks.find((l: any) => l.platform.toLowerCase().includes(platform))?.url || '';

    const mappedData = {
      contact_email: data.contact_email || '',
      contact_phone: data.contact_phone || '',
      address: typeof data.address === 'object' ? (data.address.ar || '') : (data.address || ''),
      logo_url: data.logo_url || '',
      icon_url: data.icon_url || '',
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