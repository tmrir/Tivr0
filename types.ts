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
}

export interface CaseStudy {
  id: string;
  client: string;
  title: LocalizedString;
  category: LocalizedString;
  result: LocalizedString;
  image: string;
  stats: { label: LocalizedString; value: string }[];
}

export interface Package {
  id: string;
  name: LocalizedString;
  price: string;
  features: LocalizedString[];
  isPopular?: boolean;
}

export interface TeamMember {
  id: string;
  name: LocalizedString;
  role: LocalizedString;
  image: string;
  linkedin?: string;
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

export interface SiteSettings {
  siteName: LocalizedString;
  contactEmail: string;
  contactPhone: string;
  address: LocalizedString;
  socialLinks: {
    twitter: string;
    linkedin: string;
    instagram: string;
  };
}

export interface User {
  id: string;
  username: string;
  role: 'admin' | 'editor';
}

// Translation Keys
export interface Translations {
  [key: string]: {
    ar: string;
    en: string;
  };
}