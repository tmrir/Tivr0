import { SiteSettings } from './types';

// النموذج الافتراضي الكامل للإعدادات
export const defaultSettings: SiteSettings = {
  // معلومات الموقع الأساسية
  siteName: { ar: 'تيفرو', en: 'Tivro' },
  contactEmail: 'info@tivro.sa',
  contactPhone: '+966 50 2026 151',
  address: { ar: 'الرياض، المملكة العربية السعودية', en: 'Riyadh, Saudi Arabia' },

  enableEnglish: false,
  tabTitle: { ar: 'وكالة التسويق الرقمي', en: 'Digital Marketing Agency' },

  // روابط التواصل الاجتماعي
  socialLinks: [
    { platform: 'Twitter', url: 'https://twitter.com/tivro', iconType: 'fontawesome', iconValue: 'fa-brands fa-x-twitter' },
    { platform: 'Linkedin', url: 'https://linkedin.com/company/tivro', iconType: 'fontawesome', iconValue: 'fa-brands fa-linkedin' },
    { platform: 'Instagram', url: 'https://instagram.com/tivro', iconType: 'fontawesome', iconValue: 'fa-brands fa-instagram' },
    { platform: 'Facebook', url: 'https://facebook.com/tivro', iconType: 'fontawesome', iconValue: 'fa-brands fa-facebook' }
  ],

  // الشعارات والأيقونات
  logoUrl: '/logo.png',
  iconUrl: '/favicon.ico',
  footerLogoUrl: '/footer-logo.png',
  faviconUrl: '/favicon.ico',

  // البanners العلوية والسفلية
  topBanner: {
    enabled: false,
    title: { ar: 'عرض خاص', en: 'Special Offer' },
    subtitle: { ar: 'احصل على خصم 20% الآن', en: 'Get 20% discount now' },
    link: '/contact',
    buttonText: { ar: 'تواصل معنا', en: 'Contact Us' },
    bgImage: '/banner-bg.jpg'
  },
  bottomBanner: {
    enabled: false,
    title: { ar: 'نشرة أخبار', en: 'Newsletter' },
    subtitle: { ar: 'اشترك للحصول على آخر الأخبار', en: 'Subscribe to get latest news' },
    link: '/newsletter',
    buttonText: { ar: 'اشترك الآن', en: 'Subscribe Now' },
    bgImage: '/newsletter-bg.jpg'
  },

  // نصوص الأقسام
  sectionTexts: {
    workTitle: { ar: 'قصص نجاح نفخر بها', en: 'Success Stories We Are Proud Of' },
    workSubtitle: { ar: 'أرقام تتحدث عن إنجازاتنا', en: 'Numbers speaking our achievements' },
    // الروابط القانونية
    privacyLink: { ar: 'سياسة الخصوصية', en: 'Privacy Policy' },
    termsLink: { ar: 'شروط الخدمة', en: 'Terms of Service' }
  },

  // CMS - Legal Pages (Legacy fallback, moved to Pages table ideally)
  privacyPolicy: {
    ar: 'سياسة الخصوصية...',
    en: 'Privacy Policy content...'
  },
  termsOfService: {
    ar: 'شروط الخدمة...',
    en: 'Terms of Service content...'
  },

  // CMS - Contact Us Section
  contactUs: {
    title: { ar: 'تواصل معنا', en: 'Contact Us' },
    subtitle: { ar: 'جاهز لنقل مشروعك للمستوى التالي؟', en: 'Ready to take your business to the next level?' },
    cards: [
      {
        heading: { ar: 'الوصول ليس متاحًا للجميع', en: 'Access Not Available to Everyone' },
        iconType: 'svg',
        iconSVG: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-trending-up text-tivro-primary"><path d="M16 7h6v6"></path><path d="m22 7-8.5 8.5-5-5L2 17"></path></svg>',
        contentHTML: '<div class="space-y-4"><p class="text-slate-300">سيفتح الوصول لعدد محدود ممن يدركون أن المشكلة ليست في التنفيذ.</p></div>'
      }
    ],
    socialLinks: [
      {
        name: 'Twitter',
        url: 'https://twitter.com/tivro',
        iconSVG_or_name: 'Twitter'
      },
      {
        name: 'LinkedIn',
        url: 'https://linkedin.com/company/tivro',
        iconSVG_or_name: 'Linkedin'
      },
      {
        name: 'Instagram',
        url: 'https://instagram.com/tivro',
        iconSVG_or_name: 'Instagram'
      },
      {
        name: 'Facebook',
        url: 'https://facebook.com/tivro',
        iconSVG_or_name: 'Facebook'
      }
    ],
    form: {
      fields: [
        {
          name: 'name',
          label: { ar: 'اسمك الكريم', en: 'Your Name' },
          placeholder: { ar: 'اسمك الكريم', en: 'Your Name' },
          type: 'text',
          required: true
        },
        {
          name: 'phone',
          label: { ar: 'رقم الجوال', en: 'Phone Number' },
          placeholder: { ar: 'رقم الجوال', en: 'Phone Number' },
          type: 'tel',
          required: true
        }
      ],
      submitText: { ar: 'اطلب الوصول', en: 'Request Access' },
      submitAction: '/api/contact'
    },
    cssClasses: 'container mx-auto px-4 text-center'
  },

  // أقسام الصفحة الرئيسية
  homeSections: {
    // Hero Badge/Tag (العنوان العلوي فوق العنوان الرئيسي)
    heroBadge: { ar: '🚀 الوكالة الرقمية الأسرع نمواً', en: '🚀 Fastest Growing Digital Agency' },

    // Hero Section
    heroTitle: { ar: 'نحول أفكارك إلى واقع رقمي', en: 'We Turn Your Ideas into Digital Reality' },
    heroSubtitle: { ar: 'وكالة تسويق رقمي متكاملة تقدم حلولاً مبتكرة لنمو عملك', en: 'A full-service digital marketing agency offering innovative solutions for your business growth' },
    heroImageUrl: '',
    heroImage: { src: '', alt: { ar: 'صورة', en: 'Image' } },
    heroImagePosition: 'right',
    heroButtonsEnabled: true,
    heroStatsEnabled: true,
    heroPrimaryCta: {
      label: { ar: 'ابدأ رحلة النمو', en: 'Start Growth Journey' },
      href: '#contact'
    },
    heroSecondaryCta: {
      label: { ar: 'أعمالنا', en: 'Our Work' },
      href: '#work'
    },
    heroStats: [
      { value: '+150%', label: { ar: 'متوسط نمو العملاء', en: 'Avg Client Growth' } },
      { value: '+50', label: { ar: 'عميل سعيد', en: 'Happy Client' } },
      { value: '24/7', label: { ar: 'دعم فني', en: 'Support' } }
    ],

    // Services Section
    servicesTitle: { ar: 'خدماتنا', en: 'Our Services' },
    servicesSubtitle: { ar: 'نقدم حلولاً رقمية متكاملة تنمو مع عملك', en: 'We provide integrated digital solutions that grow with your business' },

    // Team Section
    teamTitle: { ar: 'فريقنا', en: 'Our Team' },
    teamSubtitle: { ar: 'نلتقي بفريقنا من الخبراء', en: 'Meet our expert team' },

    // Packages Section
    packagesTitle: { ar: 'باقاتنا', en: 'Our Packages' },

    // Contact Section
    contactTitle: { ar: 'تواصل معنا', en: 'Contact Us' },
    contactSubtitle: { ar: 'جاهز لنقل مشروعك للمستوى التالي؟', en: 'Ready to take your business to the next level?' }
  },

  // أحجام الخطوط
  fontSizes: {
    heroTitle: 'text-4xl',
    heroSubtitle: 'text-xl',
    servicesTitle: 'text-3xl',
    servicesSubtitle: 'text-lg',
    teamTitle: 'text-2xl'
  },

  // إعدادات الفوتر
  footerDescription: { ar: 'وكالة تسويق رقمي سعودية متكاملة.', en: 'A full-service Saudi digital marketing agency.' },
  copyrightText: { ar: 'جميع الحقوق محفوظة لشركة تيفرو © 2024', en: 'All rights reserved © Tivro Company 2024' },
  footerLinks: {
    privacy: { ar: 'سياسة الخصوصية', en: 'Privacy Policy' },
    terms: { ar: 'شروط الخدمة', en: 'Terms of Service' }
  },
  footerImportantLinksTitle: { ar: 'روابط مهمة', en: 'Important Links' },
  footerBusinessInfo: {
    crNumber: '',
    taxNumber: '',
    image: '',
    showCr: true,
    showTax: true,
    showImage: true
  },

  customPages: [
    {
      id: 'page-profile-readonly',
      name: 'Profile (Read Only)',
      slug: 'profile-readonly',
      title: { ar: 'الملف التعريفي (عرض فقط)', en: 'Profile (Read-Only)' },
      description: { ar: 'نسخة عرض فقط بدون إمكانية تعديل.', en: 'Read-only version with editing disabled.' },
      components: [],
      openInStandalone: false,
      renderMode: 'html',
      fullHtml: `<!doctype html>
<html lang="ar" dir="rtl">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <base href="https://profile-rho-three.vercel.app/" />
  <title>الملف التعريفي (عرض فقط)</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <link href="https://fonts.googleapis.com/css2?family=Cairo:wght@300;400;600;700;900&display=swap" rel="stylesheet" />
  <style>
    :root { --tivro-navy:#0F2133; }
    html, body { height: 100%; background: var(--tivro-navy); font-family: 'Cairo', sans-serif; }
    /* Disable editing & selection affordances without changing layout */
    [contenteditable], [contenteditable="true"] { -webkit-user-modify: read-only !important; user-modify: read-only !important; }
    input, textarea, select { caret-color: transparent; }
    input[type="file"] { pointer-events: none !important; }
    /* Center the social cards section wrapper (same wrapper used in profile.html) */
    #root div.space-y-4.max-w-4xl.mx-auto.mb-10.w-full {
      margin-left: auto !important;
      margin-right: auto !important;
      width: 100% !important;
    }
    /* Keep links clickable */
    a[href] { pointer-events: auto; }
  </style>
</head>
<body class="bg-[#0F2133]">
  <div id="root"></div>

  <!-- Original profile app bundle -->
  <script type="module" crossorigin src="https://profile-rho-three.vercel.app/assets/index-CIzMSglX.js"></script>

  <!-- Read-only enforcement (no DOM removal) -->
  <script>
    (function () {
      function removeByText(root, text) {
        try {
          if (!root || !text) return;
          var needle = String(text).trim();
          if (!needle) return;
          // Only remove explicit small action controls (avoid removing large containers)
          var all = root.querySelectorAll('button, a, [role="button"]');
          all.forEach(function (el) {
            try {
              if (!el || !el.textContent) return;
              var t = el.textContent.trim();
              if (!t) return;
              // Guardrails: only match exact label, and keep it short
              if (t.length > 24) return;
              if (t === needle) {
                // Don't remove root containers.
                if (el.id === 'root') return;
                el.remove();
              }
            } catch (e) {}
          });
        } catch (e) {}
      }

      function removePrintControls(root) {
        if (!root) return;
        try {
          var candidates = root.querySelectorAll('button, a, [role="button"], [data-print], [data-download]');
          candidates.forEach(function (el) {
            try {
              if (!el) return;
              if (el.id === 'root') return;
              var text = (el.textContent || '').trim();
              var aria = (el.getAttribute && (el.getAttribute('aria-label') || '')) || '';
              var title = (el.getAttribute && (el.getAttribute('title') || '')) || '';
              var hay = (text + ' ' + aria + ' ' + title).toLowerCase();
              if (!hay) return;
              var isPrint = hay.indexOf('طباعة') !== -1 || hay.indexOf('pdf') !== -1 || hay.indexOf('print') !== -1;
              if (!isPrint) return;
              el.remove();
            } catch (e) {}
          });
        } catch (e) {}

        try {
          // Known toolbar container
          var toolbars = root.querySelectorAll('.toolbar');
          toolbars.forEach(function (el) {
            try { if (el && el.id !== 'root') el.remove(); } catch (e) {}
          });
        } catch (e) {}
      }

      function lock(root) {
        if (!root) return;
        try {
          root.querySelectorAll('[contenteditable]').forEach(function (el) {
            try { el.contentEditable = 'false'; } catch (e) {}
            el.removeAttribute('contenteditable');
          });
        } catch (e) {}
        try {
          root.querySelectorAll('input, textarea').forEach(function (el) {
            try { el.setAttribute('readonly', ''); el.readOnly = true; } catch (e) {}
          });
        } catch (e) {}
        try {
          root.querySelectorAll('select, input[type="file"], button').forEach(function (el) {
            try { el.setAttribute('disabled', ''); el.disabled = true; } catch (e) {}
          });
        } catch (e) {}

        // Remove any print/edit UI controls from DOM (not just hiding)
        removePrintControls(root);
        removeByText(root, 'تعديل');
      }

      function guardEvents() {
        var root = document.getElementById('root');
        if (!root) return;
        function inside(t) { return !!(t && root.contains(t)); }
        function allowClick(t) {
          try { return !!(t && t.closest && t.closest('a[href]')); } catch { return false; }
        }
        function block(e) {
          if (!inside(e.target)) return;
          if (e.type === 'click' && allowClick(e.target)) return;
          try { e.preventDefault(); } catch (err) {}
          try { e.stopPropagation(); } catch (err) {}
          try { if (e.stopImmediatePropagation) e.stopImmediatePropagation(); } catch (err) {}
        }
        ['beforeinput','input','keydown','keypress','keyup','paste','cut','drop','dragstart','dblclick','contextmenu','change'].forEach(function (t) {
          document.addEventListener(t, block, true);
        });
      }

      function boot() {
        var root = document.getElementById('root');
        lock(document);
        guardEvents();
        if (!root || !window.MutationObserver) return;
        var mo = new MutationObserver(function () {
          lock(document);
        });
        mo.observe(root, { childList: true, subtree: true, attributes: true, attributeFilter: ['contenteditable', 'class', 'style'] });
        [0, 250, 750, 1500, 3000].forEach(function (ms) { setTimeout(function () { lock(document); }, ms); });
      }

      if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
      else boot();
    })();
  </script>
</body>
</html>`,
      isVisible: true,
      placement: undefined,
      sectionVariant: undefined,
      underConstruction: false,
      underConstructionButton: { label: { ar: '', en: '' }, href: '' },
      order: undefined,
      showInNavigation: false,
      showInImportantLinks: false,
      navigationOrder: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
  ],
  adminNavigation: []
};

// دالة لدمج الإعدادات مع الإعدادات الافتراضية
export function mergeWithDefaults(userSettings: Partial<SiteSettings>): SiteSettings {
  const merged = { ...defaultSettings };

  // دمج recursively مع التأكد من وجود Arrays دائماً
  function mergeDeep(target: any, source: any): any {
    const result = { ...target };

    for (const key in source) {
      if (source[key] === undefined || source[key] === null) {
        continue;
      }

      if (Array.isArray(source[key])) {
        result[key] = Array.isArray(source[key]) ? source[key] : [];
      } else if (typeof source[key] === 'object' && !Array.isArray(source[key])) {
        result[key] = mergeDeep(result[key] || {}, source[key]);
      } else {
        result[key] = source[key];
      }
    }

    return result;
  }

  return mergeDeep(merged, userSettings);
}

// دالة للتحقق من صحة الإعدادات وضمان وجود Arrays
export function validateSettings(settings: any): SiteSettings {
  const validated = mergeWithDefaults(settings);

  // التأكد من أن جميع Arrays موجودة
  validated.socialLinks = Array.isArray(validated.socialLinks) ? validated.socialLinks : [];
  (validated as any).customPages = Array.isArray((validated as any).customPages) ? (validated as any).customPages : [];
  (validated as any).adminNavigation = Array.isArray((validated as any).adminNavigation) ? (validated as any).adminNavigation : [];

  // Note: We no longer forcibly add required pages here.
  // validateSettings is called on every save, and adding required pages here
  // would re-add deleted pages. Required pages should only be added during
  // initial app setup, not during validation.

  return validated;
}
