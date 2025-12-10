-- إدخال الإعدادات الافتراضية في قاعدة البيانات
-- هذا يضمن أن لوحة التحكم ستعرض المحتوى الصحيح

-- حذف أي بيانات موجودة أولاً
DELETE FROM site_settings WHERE id = 1;

-- إدخال الإعدادات الافتراضية الجديدة مع محتوى البانر العلوي والفوتر وأحجام الخط
INSERT INTO site_settings (
    id,
    site_name,
    contact_email,
    contact_phone,
    address,
    social_links,
    logo_url,
    icon_url,
    footer_logo_url,
    favicon_url,
    top_banner,
    bottom_banner,
    section_texts,
    home_sections,
    font_sizes,
    privacy_policy,
    terms_of_service,
    created_at,
    updated_at
) VALUES (
    1,
    '{"ar": "تيفرو", "en": "Tivro"}',
    'info@tivro.sa',
    '+966 50 000 0000',
    '{"ar": "الرياض", "en": "Riyadh"}',
    '[{"platform": "Twitter", "url": "#"}, {"platform": "Linkedin", "url": "#"}, {"platform": "Instagram", "url": "#"}]',
    '',
    '',
    '',
    '',
    '{"enabled": false, "title": {"ar": "", "en": ""}}',
    '{"enabled": false, "title": {"ar": "", "en": ""}}',
    '{"workTitle": {"ar": "قصص نجاح نفخر بها", "en": "Success Stories We Are Proud Of"}, "workSubtitle": {"ar": "أرقام تتحدث عن إنجازاتنا", "en": "Numbers speaking our achievements"}}',
    '{
        "heroTitle": {"ar": "🚀 الوكالة الرقمية الأسرع نمواً", "en": "🚀 Fastest Growing Digital Agency"},
        "heroSubtitle": {"ar": "شريكك الاستراتيجي للنمو الرقمي", "en": "Your Strategic Partner for Digital Growth"},
        "servicesTitle": {"ar": "أعمالنا", "en": "Our Work"},
        "servicesSubtitle": {"ar": "نحول الأفكار إلى أرقام، ونقود علامتك التجارية نحو الصدارة في السوق السعودي.", "en": "We turn ideas into numbers, leading your brand to the forefront of the Saudi market."},
        "teamTitle": {"ar": "ابدأ رحلة النمو", "en": "Start Your Growth Journey"},
        "teamSubtitle": {"ar": "", "en": ""},
        "packagesTitle": {"ar": "", "en": ""},
        "contactTitle": {"ar": "", "en": ""},
        "contactSubtitle": {"ar": "", "en": ""}
    }',
    '{
        "heroTitle": "text-4xl",
        "heroSubtitle": "text-xl",
        "servicesTitle": "text-3xl",
        "servicesSubtitle": "text-lg",
        "teamTitle": "text-2xl"
    }',
    '{"ar": "", "en": ""}',
    '{"ar": "", "en": ""}',
    NOW(),
    NOW()
);

-- التحقق من الإدخال
SELECT * FROM site_settings WHERE id = 1;

-- عرض محتوى home_sections و font_sizes للتأكد
SELECT 
    id,
    site_name,
    home_sections->>'heroTitle' as hero_title,
    home_sections->>'heroSubtitle' as hero_subtitle,
    home_sections->>'servicesTitle' as services_title,
    home_sections->>'servicesSubtitle' as services_subtitle,
    home_sections->>'teamTitle' as team_title,
    font_sizes->>'heroTitle' as hero_title_font,
    font_sizes->>'heroSubtitle' as hero_subtitle_font,
    font_sizes->>'servicesTitle' as services_title_font,
    font_sizes->>'servicesSubtitle' as services_subtitle_font,
    font_sizes->>'teamTitle' as team_title_font
FROM site_settings 
WHERE id = 1;
