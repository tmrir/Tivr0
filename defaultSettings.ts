import { SiteSettings } from './types';

// النموذج الافتراضي الكامل للإعدادات
export const defaultSettings: SiteSettings = {
  // معلومات الموقع الأساسية
  siteName: { ar: 'تيفرو', en: 'Tivro' },
  contactEmail: 'info@tivro.sa',
  contactPhone: '+966 50 2026 151',
  address: { ar: 'الرياض، المملكة العربية السعودية', en: 'Riyadh, Saudi Arabia' },
  
  // روابط التواصل الاجتماعي
  socialLinks: [
    { platform: 'Twitter', url: 'https://twitter.com/tivro' },
    { platform: 'Linkedin', url: 'https://linkedin.com/company/tivro' },
    { platform: 'Instagram', url: 'https://instagram.com/tivro' },
    { platform: 'Facebook', url: 'https://facebook.com/tivro' }
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
        heading: { ar: 'حجز استشارة', en: 'Book Consultation' },
        iconType: 'svg',
        iconSVG: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-trending-up text-tivro-primary"><path d="M16 7h6v6"></path><path d="m22 7-8.5 8.5-5-5L2 17"></path></svg>',
        contentHTML: '<div class="space-y-4"><p class="text-slate-300">دعنا نناقش أهدافك ونضع استراتيجية مخصصة لنجاحك.</p></div>'
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
          label: { ar: 'الاسم', en: 'Name' },
          placeholder: { ar: 'الاسم', en: 'Name' },
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
      submitText: { ar: 'إرسال الطلب', en: 'Send Request' },
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

  customPages: [],
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
  
  return validated;
}
