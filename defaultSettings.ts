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
    workSubtitle: { ar: 'أرقام تتحدث عن إنجازاتنا', en: 'Numbers speaking our achievements' }
  },
  
  // أقسام الصفحة الرئيسية
  homeSections: {
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
  
  // الصفحات القانونية
  privacyPolicy: { 
    ar: `سياسة الخصوصية

نحن في تيفرو نلتزم بحماية خصوصيتك. هذه السياسة توضح كيف نجمع ونستخدم ونحمي معلوماتك.

1. جمع المعلومات
نقوم بجمع المعلومات التي تقدمها لنا طواعية عند استخدام خدماتنا.

2. استخدام المعلومات
نستخدم المعلومات لتقديم خدماتنا وتحسينها والتواصل معكم.

3. حماية المعلومات
نتخذ جميع التدابير اللازمة لحماية معلوماتكم من الوصول غير المصرح به.

4. حقوقكم
لديكم الحق في الوصول إلى معلوماتكم وتعديلها وحذفها.`,
    en: `Privacy Policy

At Tivro, we are committed to protecting your privacy. This policy explains how we collect, use, and protect your information.

1. Information Collection
We collect information that you voluntarily provide to us when using our services.

2. Information Use
We use the information to provide and improve our services and communicate with you.

3. Information Protection
We take all necessary measures to protect your information from unauthorized access.

4. Your Rights
You have the right to access, modify, and delete your information.`
  },
  
  termsOfService: { 
    ar: `شروط الخدمة

باستخدام خدمات تيفرو، فإنك توافق على الشروط التالية:

1. استخدام الخدمات
يجب استخدام خدماتنا للأغراض المشروعة وبما يتوافق مع القوانين المعمول بها.

2. المحتوى
أنت مسؤول عن أي محتوى تقدمه من خلال خدماتنا.

3. عدم الضمان
نقدم خدماتنا "كما هي" دون أي ضمانات صريحة أو ضمنية.

4. مسؤولية محدودة
لا نكون مسؤولين عن أي أضرار غير مباشرة أو عرضية ناتجة عن استخدام خدماتنا.`,
    en: `Terms of Service

By using Tivro services, you agree to the following terms:

1. Service Use
You must use our services for lawful purposes and in compliance with applicable laws.

2. Content
You are responsible for any content you provide through our services.

3. No Warranty
We provide our services "as is" without any express or implied warranties.

4. Limited Liability
We are not liable for any indirect or incidental damages resulting from your use of our services.`
  }
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
  
  return validated;
}
