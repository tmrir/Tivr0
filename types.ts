import React from 'react';

export type Language = 'ar' | 'en';

export interface LocalizedString {
  ar: string;
  en: string;
}

export interface Service {
  id: string;
  title: LocalizedString;
  description: LocalizedString;
  iconName: string;
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
  orderIndex?: number;
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
  
  // CMS - Logos & Branding
  logoUrl: string;
  footerLogoUrl: string;
  faviconUrl: string;
  iconUrl: string; // Legacy support

  // CMS - Banners
  topBanner: BannerSettings;
  bottomBanner: BannerSettings;

  // CMS - Section Texts
  sectionTexts: {
    workTitle: LocalizedString;
    workSubtitle: LocalizedString;
  };
  
  // CMS - Home Page General Content
  homeSections: HomeSectionsSettings;

  // CMS - Legal Pages (Legacy fallback, moved to Pages table ideally)
  privacyPolicy: LocalizedString; 
  termsOfService: LocalizedString; 
}

// New Page Interface
export interface Page {
  id: string;
  slug: string;
  title: string;
  content: string;
  updated_at: string;
}

export interface Translations {
  [key: string]: {
    ar: string;
    en: string;
  };
}

// --- BRAND IDENTITY TYPES ---
export interface DesignElement {
    id: string;
    type: 'text' | 'image' | 'icon' | 'shape';
    x: number;
    y: number;
    content: string; // Text content or Image URL or Icon Name
    style: React.CSSProperties;
    label?: string; // For UI identification
}

export interface BrandAsset {
    id: string;
    name: LocalizedString;
    type: 'logo' | 'favicon' | 'app_icon' | 'poster' | 'social_ad' | 'profile_pic' | 'stationery';
    width: number;
    height: number;
    elements: DesignElement[];
}