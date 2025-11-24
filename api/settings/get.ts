import type { VercelRequest, VercelResponse } from '@vercel/node';
import { supabaseAdmin } from '../../utils/supabaseAdmin';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Kill Cache
  res.setHeader('Cache-Control', 'no-store, max-age=0');

  try {
    const { data, error } = await supabaseAdmin
      .from('site_settings')
      .select('*')
      .eq('id', 1)
      .single();

    if (error) throw error;
    if (!data) return res.status(200).json({});

    // Convert DB Social Links (JSONB array) to Frontend Format
    const socialLinks = Array.isArray(data.social_links) ? data.social_links : [];
    
    const getLink = (platform: string) => 
      socialLinks.find((l: any) => l.platform.toLowerCase().includes(platform))?.url || '';

    // Map DB columns to Frontend Types
    const mappedData = {
      site_name: data.site_name,
      contact_email: data.contact_email || '',
      contact_phone: data.contact_phone || '',
      address: typeof data.address === 'string' ? { ar: data.address, en: data.address } : (data.address || { ar: '', en: '' }),
      
      logo_url: data.logo_url || '',
      icon_url: data.icon_url || '',
      footer_logo_url: data.footer_logo_url || '',
      favicon_url: data.favicon_url || '',

      // Flatten for UI if needed, but sending array is fine too. 
      // Here we send what useSettings expects.
      social_links: socialLinks,
      social_facebook: getLink('facebook'),
      social_twitter: getLink('twitter'),
      social_instagram: getLink('instagram'),

      top_banner: data.top_banner || {},
      bottom_banner: data.bottom_banner || {},
      section_texts: data.section_texts || {},
      home_sections: data.home_sections || {},
      privacy_policy: data.privacy_policy || {},
      terms_of_service: data.terms_of_service || {}
    };

    return res.status(200).json(mappedData);
  } catch (err: any) {
    console.error('GET Settings Error:', err);
    return res.status(500).json({ error: err.message });
  }
}