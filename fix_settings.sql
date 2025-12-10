-- SQL لإنشاء جدول الإعدادات وإدخال سجل مبدئي
-- قم بتشغيل هذا الكود في Supabase SQL Editor

-- إنشاء جدول الإعدادات إذا لم يكن موجوداً
CREATE TABLE IF NOT EXISTS site_settings (
    id INTEGER PRIMARY KEY DEFAULT 1,
    site_name JSONB NOT NULL DEFAULT '{"ar": "تيفرو", "en": "Tivro"}',
    contact_email TEXT DEFAULT 'info@tivro.sa',
    contact_phone TEXT DEFAULT '+966 50 000 0000',
    address JSONB DEFAULT '{"ar": "الرياض", "en": "Riyadh"}',
    social_links JSONB DEFAULT '[]',
    logo_url TEXT DEFAULT '',
    icon_url TEXT DEFAULT '',
    footer_logo_url TEXT DEFAULT '',
    favicon_url TEXT DEFAULT '',
    top_banner JSONB DEFAULT '{"enabled": false, "title": {"ar": "", "en": ""}}',
    bottom_banner JSONB DEFAULT '{"enabled": false, "title": {"ar": "", "en": ""}}',
    section_texts JSONB DEFAULT '{"workTitle": {"ar": "قصص نجاح نفخر بها", "en": "Success Stories We Are Proud Of"}, "workSubtitle": {"ar": "أرقام تتحدث عن إنجازاتنا", "en": "Numbers speaking our achievements"}}',
    home_sections JSONB DEFAULT '{"heroTitle": {"ar": "", "en": ""}, "heroSubtitle": {"ar": "", "en": ""}, "servicesTitle": {"ar": "", "en": ""}, "servicesSubtitle": {"ar": "", "en": ""}, "teamTitle": {"ar": "", "en": ""}, "teamSubtitle": {"ar": "", "en": ""}, "packagesTitle": {"ar": "", "en": ""}, "contactTitle": {"ar": "", "en": ""}, "contactSubtitle": {"ar": "", "en": ""}}',
    privacy_policy JSONB DEFAULT '{"ar": "", "en": ""}',
    terms_of_service JSONB DEFAULT '{"ar": "", "en": ""}',
    default_snapshot JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- إدخال سجل مبدئي إذا لم يكن موجوداً
INSERT INTO site_settings (id, site_name, contact_email, contact_phone, address, social_links)
VALUES (
    1, 
    '{"ar": "تيفرو", "en": "Tivro"}',
    'info@tivro.sa',
    '+966 50 000 0000',
    '{"ar": "الرياض", "en": "Riyadh"}',
    '[{"platform": "Twitter", "url": "#"}, {"platform": "Linkedin", "url": "#"}, {"platform": "Instagram", "url": "#"}]'
) ON CONFLICT (id) DO NOTHING;

-- تعطيل RLS مؤقتاً للجدول (إذا كانت هناك مشاكل في الصلاحيات)
-- ALTER TABLE site_settings DISABLE ROW LEVEL SECURITY;

-- أو إنشاء سياسة RLS تسمح بالوصول الكامل
-- DROP POLICY IF EXISTS "site_settings_full_access" ON site_settings;
-- CREATE POLICY "site_settings_full_access" ON site_settings
--   FOR ALL USING (true)
--   WITH CHECK (true);
