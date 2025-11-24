export type Language = 'ar' | 'en';

export interface LocalizedString {
  ar: string;
  en: string;
}

export interface Service {
  id: string;
  title: LocalizedString;
  description: LocalizedString;
  iconName: string; // Using Lucide icon names
  features: LocalizedString[];
  orderIndex?: number;
}

export interface CaseStudy {
  id: string;
  client: string;
  title: LocalizedString;
  category: LocalizedString;
  result: LocalizedString;
  image: string;
  stats: { label: LocalizedString; value: string }[];
  orderIndex?: number;
}

export interface Package {
  id: string;
  name: LocalizedString;
  price: string;
  features: LocalizedString[];
  isPopular?: boolean;
  orderIndex?: number;
}

export interface TeamMember {
  id: string;
  name: LocalizedString;
  role: LocalizedString;
  image: string;
  linkedin?: string;
  orderIndex?: number;
}

export interface BlogPost {
  id: string;
  title: LocalizedString;
  excerpt: LocalizedString;
  content: LocalizedString;
  date: string;
  image: string;
  author: string;
}

export interface ContactMessage {
  id: string;
  name: string;
  phone: string;
  createdAt: string;
}

export interface SocialLink {
  platform: string;
  url: string;
}

export interface BannerSettings {
    enabled: boolean;
    title: LocalizedString;
    subtitle?: LocalizedString;
    link?: string;
    buttonText?: LocalizedString;
    bgImage?: string;
}

export interface HomeSectionsSettings {
    heroTitle: LocalizedString;
    heroSubtitle: LocalizedString;
    servicesTitle: LocalizedString;
    servicesSubtitle: LocalizedString;
    teamTitle: LocalizedString;
    teamSubtitle: LocalizedString;
    packagesTitle: LocalizedString;
    contactTitle: LocalizedString;
    contactSubtitle: LocalizedString;
}

export interface SiteSettings {
  siteName: LocalizedString;
  contactEmail: string;
  contactPhone: string;
  address: LocalizedString;
  socialLinks: SocialLink[];
  
  // CMS - Logos
  logoUrl: string; // Main Logo
  footerLogoUrl: string; // Footer Logo (New)
  faviconUrl: string; // Favicon (New)
  iconUrl: string; // Old icon url, keeping for compatibility

  // CMS - Banners (New)
  topBanner: BannerSettings;
  bottomBanner: BannerSettings;

  // CMS - Section Texts
  sectionTexts: {
    workTitle: LocalizedString;
    workSubtitle: LocalizedString;
  };
  
  // CMS - Home Sections Content (New)
  homeSections: HomeSectionsSettings;

  privacyPolicy: LocalizedString; 
  termsOfService: LocalizedString; 
}

export interface Translations {
  [key: string]: {
    ar: string;
    en: string;
  };
}