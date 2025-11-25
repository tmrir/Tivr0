import type { VercelRequest, VercelResponse } from '@vercel/node';
import { supabaseAdmin } from '../../utils/supabaseAdmin';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method Not Allowed' });

  try {
    const body = req.body;
    
    // Prepare payload (Assuming frontend sends structured data, we flatten/map it here if needed)
    // But since we updated DB schema to use JSONB for complex fields, we can save directly mostly.
    
    const dbPayload = {
      ...body, // Spread all fields
      id: 1, // Force ID 1
      updated_at: new Date().toISOString(),
      default_snapshot: body // Save snapshot
    };

    // Map camelCase to snake_case if needed (DB uses snake_case)
    if (body.siteName) dbPayload.site_name = body.siteName;
    if (body.contactEmail) dbPayload.contact_email = body.contactEmail;
    if (body.contactPhone) dbPayload.contact_phone = body.contactPhone;
    if (body.logoUrl) dbPayload.logo_url = body.logoUrl;
    if (body.iconUrl) dbPayload.icon_url = body.iconUrl;
    if (body.footerLogoUrl) dbPayload.footer_logo_url = body.footerLogoUrl;
    if (body.faviconUrl) dbPayload.favicon_url = body.faviconUrl;
    if (body.topBanner) dbPayload.top_banner = body.topBanner;
    if (body.bottomBanner) dbPayload.bottom_banner = body.bottomBanner;
    if (body.homeSections) dbPayload.home_sections = body.homeSections;
    if (body.sectionTexts) dbPayload.section_texts = body.sectionTexts;
    if (body.privacyPolicy) dbPayload.privacy_policy = body.privacyPolicy;
    if (body.termsOfService) dbPayload.terms_of_service = body.termsOfService;
    if (body.socialLinks) dbPayload.social_links = body.socialLinks;

    // Remove camelCase keys to keep DB clean (optional but good practice)
    delete dbPayload.siteName;
    delete dbPayload.contactEmail;
    // ... etc

    const { data, error } = await supabaseAdmin
      .from('site_settings')
      .upsert(dbPayload)
      .select()
      .single();

    if (error) throw error;

    return res.status(200).json({ success: true, data });
  } catch (err: any) {
    console.error('Save API Error:', err);
    return res.status(500).json({ error: err.message });
  }
}