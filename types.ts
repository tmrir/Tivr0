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

export interface FontSizeSettings {
    heroTitle: string;
    heroSubtitle: string;
    servicesTitle: string;
    servicesSubtitle: string;
    teamTitle: string;
}

export interface HomeSectionsSettings {
    heroBadge: LocalizedString;
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
    privacyLink: LocalizedString;
    termsLink: LocalizedString;
  };
  
  // CMS - Home Page General Content
  homeSections: HomeSectionsSettings;

  // CMS - Font Sizes
  fontSizes: FontSizeSettings;

  // CMS - Contact Us Section
  contactUs: ContactUsSettings;

  // CMS - Footer Settings
  footerDescription: LocalizedString;
  copyrightText: LocalizedString;
  footerLinks: {
    privacy: LocalizedString;
    terms: LocalizedString;
  };

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

// Contact Us Section Types
export interface ContactFormField {
  name: string;
  label: LocalizedString;
  placeholder: LocalizedString;
  type: 'text' | 'tel' | 'email' | 'textarea';
  required: boolean;
}

export interface ContactSocialLink {
  name: string;
  url: string;
  iconSVG_or_name: string;
}

export interface ContactCard {
  heading: LocalizedString;
  iconType: 'svg' | 'iconName';
  iconSVG: string;
  contentHTML: string;
}

export interface ContactUsSettings {
  title: LocalizedString;
  subtitle: LocalizedString;
  cards: ContactCard[];
  socialLinks: ContactSocialLink[];
  form: {
    fields: ContactFormField[];
    submitText: LocalizedString;
    submitAction?: string;
  };
  cssClasses?: string;
}

export interface PageComponent {
  id: string;
  type: 'text' | 'video' | 'image' | 'link' | 'button' | 'html' | 'slider' | 'interactive' | 'custom';
  content: any;
  display: 'modal' | 'banner' | 'box' | 'section';
  styles: {
    colors?: ComponentColors;
    sizes?: ComponentSizes;
    margins?: ComponentMargins;
    backgrounds?: ComponentBackgrounds;
    layout?: ComponentLayout;
  };
  orderIndex: number;
  isVisible: boolean;
}

export interface ComponentColors {
  primary?: string;
  secondary?: string;
  background?: string;
  text?: string;
  accent?: string;
}

export interface ComponentSizes {
  width?: string;
  height?: string;
  fontSize?: string;
  padding?: string;
}

export interface ComponentMargins {
  top?: string;
  bottom?: string;
  left?: string;
  right?: string;
}

export interface ComponentBackgrounds {
  color?: string;
  image?: string;
  gradient?: string;
  video?: string;
}

export interface ComponentLayout {
  direction?: 'row' | 'column';
  alignment?: 'start' | 'center' | 'end';
  spacing?: string;
}

export interface CustomPage {
  id: string;
  name: string;
  slug: string;
  title: LocalizedString;
  description?: LocalizedString;
  components: PageComponent[];
  isVisible: boolean;
  showInNavigation: boolean;
  navigationOrder: number;
  createdAt: string;
  updatedAt: string;
}

export interface SectionTemplate {
  id: string;
  name: string;
  displayName: LocalizedString;
  description: LocalizedString;
  category: 'gallery' | 'testimonials' | 'cta' | 'pricing' | 'faq' | 'hero' | 'features' | 'contact';
  defaultComponents: PageComponent[];
  previewImage?: string;
}

export interface SiteSectionControl {
  id: string;
  name: string;
  isVisible: boolean;
  canBeRemoved: boolean;
  customPageId?: string; // If replaced with custom page
}

export interface ExtendedSiteSettings extends SiteSettings {
  // Page Management
  customPages: CustomPage[];
  sectionTemplates: SectionTemplate[];
  
  // Section Visibility Controls
  sectionControls: {
    hero: SiteSectionControl;
    services: SiteSectionControl;
    work: SiteSectionControl;
    team: SiteSectionControl;
    packages: SiteSectionControl;
    contact: SiteSectionControl;
    footer: SiteSectionControl;
  };
  
  // Navigation Management
  navigationItems: NavigationItem[];
}

export interface NavigationItem {
  id: string;
  type: 'page' | 'section' | 'external';
  label: LocalizedString;
  href: string;
  orderIndex: number;
  isVisible: boolean;
  pageId?: string; // For custom pages
}