-- SQL لإصلاح أعمدة جدول الإعدادات
-- قم بتشغيل هذا الكود في Supabase SQL Editor

-- التحقق من وجود الجدول والأعمدة
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'site_settings' 
ORDER BY ordinal_position;

-- إضافة الأعمدة المفقودة إذا لم تكن موجودة
ALTER TABLE site_settings 
ADD COLUMN IF NOT EXISTS icon_url TEXT DEFAULT '';

ALTER TABLE site_settings 
ADD COLUMN IF NOT EXISTS footer_logo_url TEXT DEFAULT '';

ALTER TABLE site_settings 
ADD COLUMN IF NOT EXISTS favicon_url TEXT DEFAULT '';

ALTER TABLE site_settings 
ADD COLUMN IF NOT EXISTS top_banner JSONB DEFAULT '{"enabled": false, "title": {"ar": "", "en": ""}}';

ALTER TABLE site_settings 
ADD COLUMN IF NOT EXISTS bottom_banner JSONB DEFAULT '{"enabled": false, "title": {"ar": "", "en": ""}}';

ALTER TABLE site_settings 
ADD COLUMN IF NOT EXISTS section_texts JSONB DEFAULT '{"workTitle": {"ar": "قصص نجاح نفخر بها", "en": "Success Stories We Are Proud Of"}, "workSubtitle": {"ar": "أرقام تتحدث عن إنجازاتنا", "en": "Numbers speaking our achievements"}}';

ALTER TABLE site_settings 
ADD COLUMN IF NOT EXISTS home_sections JSONB DEFAULT '{"heroTitle": {"ar": "", "en": ""}, "heroSubtitle": {"ar": "", en: ""}, "servicesTitle": {"ar": "", en: ""}, "servicesSubtitle": {"ar": "", en: ""}, "teamTitle": {"ar": "", en: ""}, "teamSubtitle": {"ar": "", en: ""}, "packagesTitle": {"ar": "", en: ""}, "contactTitle": {"ar": "", en: ""}, "contactSubtitle": {"ar": "", en: ""}}';

ALTER TABLE site_settings 
ADD COLUMN IF NOT EXISTS privacy_policy JSONB DEFAULT '{"ar": "", "en": ""}';

ALTER TABLE site_settings 
ADD COLUMN IF NOT EXISTS terms_of_service JSONB DEFAULT '{"ar": "", "en": ""}';

ALTER TABLE site_settings 
ADD COLUMN IF NOT EXISTS default_snapshot JSONB;

ALTER TABLE site_settings 
ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT NOW();

ALTER TABLE site_settings 
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

-- التأكد من وجود سجل بالمعرف 1
INSERT INTO site_settings (id, site_name, contact_email, contact_phone, address, social_links, logo_url, icon_url, footer_logo_url, favicon_url)
VALUES (
    1, 
    '{"ar": "تيفرو", "en": "Tivro"}',
    'info@tivro.sa',
    '+966 50 000 0000',
    '{"ar": "الرياض", "en": "Riyadh"}',
    '[{"platform": "Twitter", "url": "#"}, {"platform": "Linkedin", "url": "#"}, {"platform": "Instagram", "url": "#"}]',
    '',
    '',
    '',
    ''
) ON CONFLICT (id) DO UPDATE SET
    site_name = EXCLUDED.site_name,
    contact_email = EXCLUDED.contact_email,
    contact_phone = EXCLUDED.contact_phone,
    address = EXCLUDED.address,
    social_links = EXCLUDED.social_links,
    logo_url = EXCLUDED.logo_url,
    icon_url = EXCLUDED.icon_url,
    footer_logo_url = EXCLUDED.footer_logo_url,
    favicon_url = EXCLUDED.favicon_url,
    updated_at = NOW();

-- عرض البيانات الحالية للتأكد
SELECT * FROM site_settings WHERE id = 1;
