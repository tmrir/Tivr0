import { Service, CaseStudy, Package, TeamMember, BlogPost, SiteSettings } from '../types';

// SEED DATA
const INITIAL_SERVICES: Service[] = [
  {
    id: '1',
    title: { ar: 'إدارة وسائل التواصل', en: 'Social Media Management' },
    description: { ar: 'نبني مجتمعك الرقمي ونزيد تفاعل جمهورك باستراتيجيات محتوى إبداعية.', en: 'We build your digital community and increase engagement with creative content strategies.' },
    iconName: 'Share2',
    features: [{ ar: 'تصاميم إبداعية', en: 'Creative Designs' }, { ar: 'جدولة ونشر', en: 'Scheduling' }, { ar: 'إدارة تعليقات', en: 'Community Mgmt' }]
  },
  {
    id: '2',
    title: { ar: 'تحسين محركات البحث (SEO)', en: 'SEO Optimization' },
    description: { ar: 'تصدر نتائج البحث واجذب عملاء مهتمين بخدماتك بشكل عضوي.', en: 'Rank higher in search results and attract organic traffic to your business.' },
    iconName: 'Search',
    features: [{ ar: 'تدقيق شامل', en: 'Full Audit' }, { ar: 'كلمات مفتاحية', en: 'Keywords' }, { ar: 'بناء روابط', en: 'Link Building' }]
  },
  {
    id: '3',
    title: { ar: 'الحملات الإعلانية الممولة', en: 'Paid Advertising (PPC)' },
    description: { ar: 'نستهدف عميلك المثالي بدقة لتحقيق أعلى عائد على الاستثمار.', en: 'We target your ideal customer precisely to achieve the highest ROAS.' },
    iconName: 'Target',
    features: [{ ar: 'إعلانات جوجل', en: 'Google Ads' }, { ar: 'سوشيال ميديا', en: 'Social Ads' }, { ar: 'تتبع التحويلات', en: 'Conversion Tracking' }]
  },
  {
    id: '4',
    title: { ar: 'تصميم وتطوير المتاجر', en: 'E-commerce Development' },
    description: { ar: 'نطلق متجرك على سلة أو زد بتصميم احترافي وتجهيز كامل.', en: 'We launch your store on Salla or Zid with professional design and full setup.' },
    iconName: 'ShoppingCart',
    features: [{ ar: 'تصميم واجهة', en: 'UI Design' }, { ar: 'ربط بوابات الدفع', en: 'Payment Integration' }, { ar: 'تكاملات', en: 'Integrations' }]
  }
];

const INITIAL_PACKAGES: Package[] = [
  {
    id: 'p1',
    name: { ar: 'باقة الانطلاق', en: 'Startup Package' },
    price: '2500 SAR',
    features: [
      { ar: 'إدارة منصتين', en: '2 Platforms Management' },
      { ar: '12 تصميم شهرياً', en: '12 Designs/Month' },
      { ar: 'تقارير شهرية', en: 'Monthly Reports' }
    ]
  },
  {
    id: 'p2',
    name: { ar: 'باقة النمو', en: 'Growth Package' },
    price: '4500 SAR',
    features: [
      { ar: 'إدارة 3 منصات', en: '3 Platforms Management' },
      { ar: '20 تصميم شهرياً', en: '20 Designs/Month' },
      { ar: 'حملة إعلانية واحدة', en: '1 Ad Campaign' },
      { ar: 'موديريتور للردود', en: 'Reply Moderator' }
    ],
    isPopular: true
  },
  {
    id: 'p3',
    name: { ar: 'باقة الاحتراف', en: 'Pro Package' },
    price: '8000 SAR',
    features: [
      { ar: 'إدارة شاملة', en: 'Full Management' },
      { ar: 'فيديو موشن جرافيك', en: 'Motion Graphic Video' },
      { ar: 'حملات إعلانية مفتوحة', en: 'Unlimited Campaigns' },
      { ar: 'تحسين SEO', en: 'SEO Optimization' }
    ]
  }
];

const INITIAL_CASE_STUDIES: CaseStudy[] = [
  {
    id: 'c1',
    client: 'مطاعم الذواق',
    title: { ar: 'زيادة المبيعات بنسبة 150%', en: 'Increasing Sales by 150%' },
    category: { ar: 'إدارة حملات', en: 'Ad Campaigns' },
    result: { ar: 'تحقيق عائد 1:5 على الإعلانات', en: 'Achieved 1:5 ROAS' },
    image: 'https://picsum.photos/800/600?random=1',
    stats: [{ label: { ar: 'مبيعات', en: 'Sales' }, value: '+150%' }, { label: { ar: 'وصول', en: 'Reach' }, value: '1M+' }]
  },
  {
    id: 'c2',
    client: 'تطبيق صحتي',
    title: { ar: 'مليون تحميل في 6 أشهر', en: '1 Million Downloads in 6 Months' },
    category: { ar: 'تسويق التطبيقات', en: 'App Marketing' },
    result: { ar: 'تخفيض تكلفة التحميل 40%', en: 'Reduced CPI by 40%' },
    image: 'https://picsum.photos/800/600?random=2',
    stats: [{ label: { ar: 'تحميلات', en: 'Downloads' }, value: '1M' }, { label: { ar: 'تكلفة', en: 'CPI' }, value: '$0.5' }]
  }
];

const INITIAL_TEAM: TeamMember[] = [
  { id: 't1', name: { ar: 'سارة العتيبي', en: 'Sarah Al-Otaibi' }, role: { ar: 'مديرة المشاريع', en: 'Project Manager' }, image: 'https://picsum.photos/200/200?random=10' },
  { id: 't2', name: { ar: 'خالد السديري', en: 'Khaled Al-Sudairi' }, role: { ar: 'كبير المسوقين', en: 'Senior Marketer' }, image: 'https://picsum.photos/200/200?random=11' },
  { id: 't3', name: { ar: 'عمر فاروق', en: 'Omar Farouk' }, role: { ar: 'مطور ويب', en: 'Web Developer' }, image: 'https://picsum.photos/200/200?random=12' },
];

const INITIAL_POSTS: BlogPost[] = [
  {
    id: 'b1',
    title: { ar: 'كيف تختار منصة التسويق المناسبة؟', en: 'How to choose the right marketing platform?' },
    excerpt: { ar: 'دليلك الشامل لاختيار المنصة الأنسب لنشاطك التجاري في السعودية.', en: 'Your comprehensive guide to choosing the best platform for your business in Saudi Arabia.' },
    content: { ar: 'المحتوى الكامل للمقال هنا...', en: 'Full article content here...' },
    date: '2023-10-15',
    image: 'https://picsum.photos/800/400?random=20',
    author: 'Khaled Al-Sudairi'
  },
  {
    id: 'b2',
    title: { ar: 'مستقبل التجارة الإلكترونية 2024', en: 'The Future of E-commerce 2024' },
    excerpt: { ar: 'أبرز التوجهات التي ستشكل مستقبل التجارة الإلكترونية.', en: 'Key trends shaping the future of e-commerce.' },
    content: { ar: '...', en: '...' },
    date: '2023-11-01',
    image: 'https://picsum.photos/800/400?random=21',
    author: 'Sarah Al-Otaibi'
  }
];

const INITIAL_SETTINGS: SiteSettings = {
  siteName: { ar: 'تيفرو', en: 'Tivro' },
  contactEmail: 'hello@tivro.sa',
  contactPhone: '+966 50 000 0000',
  address: { ar: 'الرياض، طريق الملك فهد', en: 'Riyadh, King Fahd Rd' },
  socialLinks: {
    twitter: 'https://twitter.com',
    linkedin: 'https://linkedin.com',
    instagram: 'https://instagram.com'
  }
};

// STORAGE KEYS
const KEYS = {
  SERVICES: 'tivro_services',
  PACKAGES: 'tivro_packages',
  CASE_STUDIES: 'tivro_cases',
  TEAM: 'tivro_team',
  POSTS: 'tivro_posts',
  SETTINGS: 'tivro_settings'
};

// DB HELPER
const getList = <T>(key: string, defaultData: T[]): T[] => {
  const stored = localStorage.getItem(key);
  if (!stored) {
    localStorage.setItem(key, JSON.stringify(defaultData));
    return defaultData;
  }
  return JSON.parse(stored);
};

const saveList = <T>(key: string, data: T[]) => {
  localStorage.setItem(key, JSON.stringify(data));
};

const getSettings = (): SiteSettings => {
  const stored = localStorage.getItem(KEYS.SETTINGS);
  if (!stored) {
    localStorage.setItem(KEYS.SETTINGS, JSON.stringify(INITIAL_SETTINGS));
    return INITIAL_SETTINGS;
  }
  return JSON.parse(stored);
};

// EXPORTED API
export const db = {
  services: {
    getAll: () => getList<Service>(KEYS.SERVICES, INITIAL_SERVICES),
    save: (data: Service[]) => saveList(KEYS.SERVICES, data),
  },
  packages: {
    getAll: () => getList<Package>(KEYS.PACKAGES, INITIAL_PACKAGES),
    save: (data: Package[]) => saveList(KEYS.PACKAGES, data),
  },
  caseStudies: {
    getAll: () => getList<CaseStudy>(KEYS.CASE_STUDIES, INITIAL_CASE_STUDIES),
    save: (data: CaseStudy[]) => saveList(KEYS.CASE_STUDIES, data),
  },
  team: {
    getAll: () => getList<TeamMember>(KEYS.TEAM, INITIAL_TEAM),
    save: (data: TeamMember[]) => saveList(KEYS.TEAM, data),
  },
  posts: {
    getAll: () => getList<BlogPost>(KEYS.POSTS, INITIAL_POSTS),
    save: (data: BlogPost[]) => saveList(KEYS.POSTS, data),
  },
  settings: {
    get: () => getSettings(),
    save: (data: SiteSettings) => localStorage.setItem(KEYS.SETTINGS, JSON.stringify(data)),
  },
  reset: () => {
    localStorage.clear();
    window.location.reload();
  }
};