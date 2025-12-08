
import { supabase } from './supabase';
import { Service, CaseStudy, Package, TeamMember, SiteSettings, BlogPost, ContactMessage, SocialLink, Page, PackageRequest, LocalizedString } from '../types';

/* --- HELPER: SAFE LOCALIZED STRING --- */
const ensureLocalized = (val: any): LocalizedString => {
    if (!val) return { ar: '', en: '' };
    if (typeof val === 'object' && val !== null) {
        return {
            ar: val.ar || val.ar === '' ? val.ar : '',
            en: val.en || val.en === '' ? val.en : ''
        };
    }
    if (typeof val === 'string') {
        if (val.trim().startsWith('{')) {
            try {
                const parsed = JSON.parse(val);
                if (typeof parsed === 'object') {
                    return { ar: parsed.ar || '', en: parsed.en || '' };
                }
            } catch { }
        }
        return { ar: val, en: val };
    }
    return { ar: '', en: '' };
};

/* --- DATA MAPPERS --- */
const mapServiceFromDB = (row: any): Service => ({
  id: row.id,
  title: ensureLocalized(row.title),
  description: ensureLocalized(row.description),
  features: Array.isArray(row.features) ? row.features.map(ensureLocalized) : [],
  iconName: row.icon_name || 'HelpCircle',
  orderIndex: row.order_index
});
const mapServiceToDB = (item: Service) => ({ title: item.title, description: item.description, features: item.features, icon_name: item.iconName });

const mapPackageFromDB = (row: any): Package => ({
  id: row.id,
  name: ensureLocalized(row.name),
  price: row.price || '',
  features: Array.isArray(row.features) ? row.features.map(ensureLocalized) : [],
  isPopular: row.is_popular || false,
  orderIndex: row.order_index
});
const mapPackageToDB = (item: Package) => ({ name: item.name, price: item.price, features: item.features, is_popular: item.isPopular });

const mapTeamFromDB = (row: any): TeamMember => ({
  id: row.id,
  name: ensureLocalized(row.name),
  role: ensureLocalized(row.role),
  image: row.image || '',
  linkedin: row.linkedin || '',
  orderIndex: row.order_index
});
const mapTeamToDB = (item: TeamMember) => ({ name: item.name, role: item.role, image: item.image, linkedin: item.linkedin });

const mapCaseFromDB = (row: any): CaseStudy => ({
  id: row.id,
  client: row.client || '',
  title: ensureLocalized(row.title),
  category: ensureLocalized(row.category),
  result: ensureLocalized(row.result),
  image: row.image || '',
  stats: Array.isArray(row.stats) ? row.stats.map((s: any) => ({ value: s.value, label: ensureLocalized(s.label) })) : [],
  orderIndex: row.order_index
});
const mapCaseToDB = (item: CaseStudy) => ({ client: item.client, title: item.title, category: item.category, result: item.result, image: item.image, stats: item.stats });

const mapBlogFromDB = (row: any): BlogPost => ({
  id: row.id,
  title: ensureLocalized(row.title),
  excerpt: ensureLocalized(row.excerpt),
  content: ensureLocalized(row.content),
  image: row.image || '',
  author: row.author || '',
  date: row.date || new Date().toISOString().split('T')[0]
});
const mapBlogToDB = (item: BlogPost) => ({ title: item.title, excerpt: item.excerpt, content: item.content, image: item.image, author: item.author, date: item.date });

const mapMessageFromDB = (row: any): ContactMessage => ({
  id: row.id,
  name: row.name || '',
  phone: row.phone || '',
  createdAt: row.created_at
});

const mapPackageRequestFromDB = (row: any): PackageRequest => ({
  id: row.id,
  name: row.name || row.customer_name || '',
  phone: row.phone || row.phone_number || '',
  email: row.email || '',
  packageName: row.package_name || '',
  createdAt: row.created_at
});

const mapSettingsFromDB = (row: any): SiteSettings => {
  if (!row) row = {};
  const safeMerge = (defaultObj: any, sourceObj: any) => {
      if (!sourceObj) return defaultObj;
      const result = { ...defaultObj };
      for (const key in defaultObj) {
          if (sourceObj[key] !== undefined && sourceObj[key] !== null) {
              result[key] = sourceObj[key];
          }
      }
      return result;
  };

  let socialLinks: SocialLink[] = [];
  if (Array.isArray(row.social_links)) {
      socialLinks = row.social_links;
  } else if (typeof row.social_links === 'object' && row.social_links !== null) {
      Object.keys(row.social_links).forEach(key => {
          socialLinks.push({ platform: key, url: row.social_links[key] });
      });
  }

  const defaultHomeSections = {
      heroTitle: { ar: 'شريكك الاستراتيجي للنمو الرقمي', en: 'Your Strategic Partner for Digital Growth' },
      heroSubtitle: { ar: 'نحول الأفكار إلى أرقام.', en: 'We turn ideas into numbers.' },
      servicesTitle: { ar: 'خدمات نصنع بها الفرق', en: 'Services That Make a Difference' },
      servicesSubtitle: { ar: '', en: '' },
      teamTitle: { ar: 'عقول تيفرو', en: 'Tivro Minds' },
      teamSubtitle: { ar: '', en: '' },
      packagesTitle: { ar: 'باقات تناسب الجميع', en: 'Packages for Everyone' },
      contactTitle: { ar: 'تواصل معنا', en: 'Contact Us' },
      contactSubtitle: { ar: '', en: '' }
  };

  const defaultSectionTexts = { 
      workTitle: { ar: 'قصص نجاح نفخر بها', en: 'Success Stories We Are Proud Of' }, 
      workSubtitle: { ar: 'أرقام تتحدث عن إنجازاتنا', en: 'Numbers speaking our achievements' } 
  };

  const defaultVisibility = { hero: true, services: true, work: true, packages: true, team: true, contact: true };
  const defaultFont = { heroTitle: 'text-5xl', heroSubtitle: 'text-xl', sectionTitle: 'text-4xl', sectionDesc: 'text-lg', cardTitle: 'text-xl' };
  const defaultFooter = { description: {ar:'',en:''}, copyright: {ar:'',en:''}, links: {privacyLabel: {ar:'',en:''}, termsLabel: {ar:'',en:''}} };
  const defaultBanner = { enabled: false, title: {ar:'',en:''} };

  const rawHomeSections = row.home_sections || {};
  const homeSections = safeMerge(defaultHomeSections, rawHomeSections);
  Object.keys(homeSections).forEach(key => {
      // @ts-ignore
      homeSections[key] = ensureLocalized(homeSections[key]);
  });

  const rawSectionTexts = row.section_texts || {};
  const sectionTexts = safeMerge(defaultSectionTexts, rawSectionTexts);
  Object.keys(sectionTexts).forEach(key => {
       // @ts-ignore
      sectionTexts[key] = ensureLocalized(sectionTexts[key]);
  });

  const rawFooter = row.footer_settings || {};
  const footerSettings = safeMerge(defaultFooter, rawFooter);
  footerSettings.description = ensureLocalized(footerSettings.description);
  footerSettings.copyright = ensureLocalized(footerSettings.copyright);
  if(footerSettings.links) {
     footerSettings.links.privacyLabel = ensureLocalized(footerSettings.links?.privacyLabel);
     footerSettings.links.termsLabel = ensureLocalized(footerSettings.links?.termsLabel);
  }

  return {
    siteName: ensureLocalized(row.site_name || { ar: 'Tivro', en: 'Tivro' }),
    contactEmail: row.contact_email || '',
    contactPhone: row.contact_phone || '',
    address: ensureLocalized(row.address),
    socialLinks: socialLinks,
    
    logoUrl: row.logo_url || '',
    iconUrl: row.icon_url || '',
    footerLogoUrl: row.footer_logo_url || row.logo_url || '',
    faviconUrl: row.favicon_url || '',

    topBanner: { 
        ...defaultBanner, 
        ...(row.top_banner || {}), 
        title: ensureLocalized(row.top_banner?.title),
        buttonText: ensureLocalized(row.top_banner?.buttonText),
        subtitle: ensureLocalized(row.top_banner?.subtitle)
    },
    bottomBanner: {
        ...defaultBanner,
        ...(row.bottom_banner || {}),
        title: ensureLocalized(row.bottom_banner?.title),
        subtitle: ensureLocalized(row.bottom_banner?.subtitle)
    },

    sectionTexts: sectionTexts,
    homeSections: homeSections,

    sectionVisibility: { ...defaultVisibility, ...(row.section_visibility || {}) },
    fontSettings: { ...defaultFont, ...(row.font_settings || {}) },
    footerSettings: footerSettings,

    privacyPolicy: ensureLocalized(row.privacy_policy),
    termsOfService: ensureLocalized(row.terms_of_service)
  };
};

const mapSettingsToDB = (item: SiteSettings) => ({ 
  site_name: item.siteName, 
  contact_email: item.contactEmail, 
  contact_phone: item.contactPhone, 
  address: item.address, 
  social_links: item.socialLinks,
  logo_url: item.logoUrl,
  icon_url: item.iconUrl,
  footer_logo_url: item.footerLogoUrl,
  favicon_url: item.faviconUrl,
  top_banner: item.topBanner,
  bottom_banner: item.bottomBanner,
  section_texts: item.sectionTexts,
  home_sections: item.homeSections,
  section_visibility: item.sectionVisibility,
  font_settings: item.fontSettings,
  footer_settings: item.footerSettings,
  privacy_policy: item.privacyPolicy,
  terms_of_service: item.termsOfService
});

const apiContentAction = async (table: string, action: 'upsert' | 'delete', data?: any, id?: string) => {
    try {
        const res = await fetch('/api/content/action', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ table, action, data, id })
        });
        if (!res.ok) throw new Error('API Action Failed');
        return await res.json();
    } catch (e) {
        console.error(`Failed to ${action} on ${table}`, e);
        throw e;
    }
};

export const db = {
  reorder: async (table: string, items: any[]) => {
    try {
      await fetch('/api/reorder', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ table, items })
      });
    } catch (e) {
      console.error('Reorder failed', e);
    }
  },

  services: {
    getAll: async () => {
        const { data } = await supabase.from('services').select('*').order('order_index', { ascending: true });
        return data?.map(mapServiceFromDB) || [];
    },
    save: async (item: Service) => {
      const payload = mapServiceToDB(item);
      if (item.id && item.id !== 'new') (payload as any).id = item.id;
      return await apiContentAction('services', 'upsert', payload);
    },
    delete: async (id: string) => await apiContentAction('services', 'delete', undefined, id)
  },

  packages: {
    getAll: async () => {
        const { data } = await supabase.from('packages').select('*').order('order_index', { ascending: true });
        return data?.map(mapPackageFromDB) || [];
    },
    save: async (item: Package) => {
      const payload = mapPackageToDB(item);
      if (item.id && item.id !== 'new') (payload as any).id = item.id;
      return await apiContentAction('packages', 'upsert', payload);
    },
    delete: async (id: string) => await apiContentAction('packages', 'delete', undefined, id)
  },

  team: {
    getAll: async () => {
        const { data } = await supabase.from('team_members').select('*').order('order_index', { ascending: true });
        return data?.map(mapTeamFromDB) || [];
    },
    save: async (item: TeamMember) => {
      const payload = mapTeamToDB(item);
      if (item.id && item.id !== 'new') (payload as any).id = item.id;
      return await apiContentAction('team_members', 'upsert', payload);
    },
    delete: async (id: string) => await apiContentAction('team_members', 'delete', undefined, id)
  },

  caseStudies: {
    getAll: async () => {
        const { data } = await supabase.from('case_studies').select('*').order('order_index', { ascending: true });
        return data?.map(mapCaseFromDB) || [];
    },
    save: async (item: CaseStudy) => {
      const payload = mapCaseToDB(item);
      if (item.id && item.id !== 'new') (payload as any).id = item.id;
      return await apiContentAction('case_studies', 'upsert', payload);
    },
    delete: async (id: string) => await apiContentAction('case_studies', 'delete', undefined, id)
  },

  blog: {
    getAll: async () => {
        const { data } = await supabase.from('blog_posts').select('*').order('created_at', { ascending: false });
        return data?.map(mapBlogFromDB) || [];
    },
    save: async (item: BlogPost) => {
      const payload = mapBlogToDB(item);
      if (item.id && item.id !== 'new') (payload as any).id = item.id;
      return await apiContentAction('blog_posts', 'upsert', payload);
    },
    delete: async (id: string) => await apiContentAction('blog_posts', 'delete', undefined, id)
  },

  messages: {
    getAll: async (): Promise<ContactMessage[]> => {
        const { data } = await supabase.from('contact_messages').select('*').order('created_at', { ascending: false });
        return data?.map(mapMessageFromDB) || [];
    },
    send: async (name: string, phone: string) => {
        return await supabase.from('contact_messages').insert([{ name, phone }]);
    },
    delete: async (id: string) => await apiContentAction('contact_messages', 'delete', undefined, id)
  },

  packageRequests: {
      getAll: async (): Promise<PackageRequest[]> => {
          const { data } = await supabase.from('package_requests').select('*').order('created_at', { ascending: false });
          return data?.map(mapPackageRequestFromDB) || [];
      },
      create: async (name: string, phone: string, email: string, packageName: string) => {
          // DIRECT SUPABASE INSERT
          // Mapped to standard 'name' and 'phone' columns as 'customer_name'/'phone_number' failed schema check
          
          const safeName = email ? `${name} | ${email}` : name;

          const payload = {
              name: safeName,
              phone: phone,
              package_name: packageName
              // created_at is automatic default usually
          };

          const { data, error } = await supabase
              .from('package_requests')
              .insert([payload])
              .select();
          
          if (error) {
              console.error("Supabase Direct Insert Error:", error);
              throw error;
          }
          return data;
      },
      delete: async (id: string) => await apiContentAction('package_requests', 'delete', undefined, id)
  },

  settings: {
    get: async (): Promise<SiteSettings> => {
      try {
        const res = await fetch('/api/settings/get?t='+Date.now());
        if(res.ok) {
            const json = await res.json();
            if(json.ok && json.data) {
                return mapSettingsFromDB(json.data);
            }
        }
      } catch (e) { console.warn("API Settings fetch failed, falling back to client DB", e); }

      const { data, error } = await supabase.from('site_settings').select('*').single();
      return mapSettingsFromDB(data || {});
    },
    save: async (newSettings: SiteSettings) => {
      const payload = { ...mapSettingsToDB(newSettings), id: 1 };
      const res = await fetch('/api/settings/save', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
      });
      if (!res.ok) throw new Error('Failed to save settings via API');
      return await res.json();
    }
  },

  pages: {
    get: async (slug: string): Promise<Page | null> => {
        try {
            const res = await fetch(`/api/pages/${slug}`);
            if (!res.ok) return null;
            return await res.json();
        } catch { return null; }
    },
    getAll: async (): Promise<Page[]> => {
        try {
            const res = await fetch('/api/pages/list');
            if (!res.ok) return [];
            return await res.json();
        } catch { return []; }
    },
    save: async (slug: string, title: string, content: string) => {
        const res = await fetch('/api/pages/save', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ slug, title, content })
        });
        return res.ok;
    }
  }
};
