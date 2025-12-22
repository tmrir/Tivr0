import { supabase } from './supabase';
import { Service, CaseStudy, Package, TeamMember, SiteSettings, BlogPost, ContactMessage, SocialLink, Page, PackageRequest } from '../types';
import { settingsService } from './settingsService';

/* --- DATA MAPPERS --- */
const mapServiceFromDB = (row: any): Service => ({
  id: row.id,
  title: row.title || { ar: '', en: '' },
  description: row.description || { ar: '', en: '' },
  features: row.features || [],
  iconName: row.icon_name || 'HelpCircle',
  orderIndex: row.order_index
});
const mapServiceToDB = (item: Service) => ({ title: item.title, description: item.description, features: item.features, icon_name: item.iconName });

const mapPackageFromDB = (row: any): Package => ({
  id: row.id,
  name: row.name || { ar: '', en: '' },
  price: row.price || '',
  features: row.features || [],
  isPopular: row.is_popular || false,
  orderIndex: row.order_index
});
const mapPackageToDB = (item: Package) => ({ name: item.name, price: item.price, features: item.features, is_popular: item.isPopular });

const mapTeamFromDB = (row: any): TeamMember => ({
  id: row.id,
  name: row.name || { ar: '', en: '' },
  role: row.role || { ar: '', en: '' },
  image: row.image || '',
  linkedin: row.linkedin || '',
  orderIndex: row.order_index
});
const mapTeamToDB = (item: TeamMember) => ({ name: item.name, role: item.role, image: item.image, linkedin: item.linkedin });

const mapCaseFromDB = (row: any): CaseStudy => {
  let stats: any[] = [];

  if (Array.isArray(row.stats)) {
    stats = row.stats;
  } else if (typeof row.stats === 'string') {
    try {
      const parsed = JSON.parse(row.stats);
      if (Array.isArray(parsed)) {
        stats = parsed;
      }
    } catch {
      stats = [];
    }
  }

  return {
    id: row.id,
    client: row.client || '',
    title: row.title || { ar: '', en: '' },
    category: row.category || { ar: '', en: '' },
    result: row.result || { ar: '', en: '' },
    image: row.image || '',
    url: row.url || row.project_url || row.link || '',
    stats,
    orderIndex: row.order_index,
  };
};
const mapCaseToDB = (item: CaseStudy) => ({
  client: item.client,
  title: item.title,
  category: item.category,
  result: item.result,
  image: item.image,
  url: item.url || '',
  stats: item.stats || [],
  order_index: item.orderIndex || 0
});

const mapBlogFromDB = (row: any): BlogPost => ({
  id: row.id,
  title: row.title || { ar: '', en: '' },
  excerpt: row.excerpt || { ar: '', en: '' },
  content: row.content || { ar: '', en: '' },
  date: row.date || '',
  image: row.image || '',
  author: row.author || '',
  orderIndex: row.order_index
});
const mapBlogToDB = (item: BlogPost) => ({ title: item.title, excerpt: item.excerpt, content: item.content, date: item.date, image: item.image, author: item.author });

const mapPackageRequestFromDB = (row: any): PackageRequest => ({
  id: row.id,
  customerName: row.customer_name || '',
  phoneNumber: row.phone_number || '',
  email: row.email || '',
  packageName: row.package_name || '',
  packageId: row.package_id || '',
  createdAt: row.created_at || '',
  status: row.status || 'pending',
  notes: row.notes
});
const mapPackageRequestToDB = (item: Omit<PackageRequest, 'id' | 'createdAt'>) => ({
  customer_name: item.customerName,
  phone_number: item.phoneNumber,
  email: item.email,
  package_name: item.packageName,
  package_id: item.packageId,
  status: item.status,
  notes: item.notes
});

const mapMessageFromDB = (row: any): ContactMessage => ({
  id: row.id,
  name: row.name || '',
  phone: row.phone || '',
  createdAt: row.created_at
});

const mapSettingsFromDB = (row: any): SiteSettings => {
  let socialLinks: SocialLink[] = [];
  if (Array.isArray(row.social_links)) {
    socialLinks = row.social_links;
  } else if (typeof row.social_links === 'object' && row.social_links !== null) {
    Object.keys(row.social_links).forEach(key => {
      socialLinks.push({ platform: key, url: row.social_links[key] });
    });
  }

  return {
    siteName: row.site_name || { ar: 'Tivro', en: 'Tivro' },
    contactEmail: row.contact_email || '',
    contactPhone: row.contact_phone || '',
    address: typeof row.address === 'string' ? { ar: row.address, en: row.address } : (row.address || { ar: '', en: '' }),
    socialLinks: socialLinks,
    enableEnglish: row.enable_english ?? true,
    tabTitle: row.tab_title || { ar: 'تيفرو - وكالة تسويق رقمي', en: 'Tivro - Digital Marketing Agency' },

    logoUrl: row.logo_url || '',
    iconUrl: row.icon_url || '',
    footerLogoUrl: row.footer_logo_url || row.logo_url || '',
    faviconUrl: row.favicon_url || '',

    topBanner: row.top_banner || { enabled: false, title: { ar: '', en: '' } },
    bottomBanner: row.bottom_banner || { enabled: false, title: { ar: '', en: '' } },

    sectionTexts: row.section_texts || {
      workTitle: { ar: 'قصص نجاح نفخر بها', en: 'Success Stories We Are Proud Of' },
      workSubtitle: { ar: 'أرقام تتحدث عن إنجازاتنا', en: 'Numbers speaking our achievements' },
      privacyLink: { ar: 'سياسة الخصوصية', en: 'Privacy Policy' },
      termsLink: { ar: 'شروط الاستخدام', en: 'Terms of Service' }
    },
    homeSections: row.home_sections || {
      heroTitle: { ar: '', en: '' }, heroSubtitle: { ar: '', en: '' },
      servicesTitle: { ar: '', en: '' }, servicesSubtitle: { ar: '', en: '' },
      teamTitle: { ar: '', en: '' }, teamSubtitle: { ar: '', en: '' },
      packagesTitle: { ar: '', en: '' },
      contactTitle: { ar: '', en: '' }, contactSubtitle: { ar: '', en: '' }
    },

    fontSizes: row.font_sizes || {
      heroTitle: 'text-5xl md:text-7xl',
      heroSubtitle: 'text-xl',
      servicesTitle: 'text-3xl md:text-4xl',
      servicesSubtitle: 'text-slate-500',
      teamTitle: 'text-3xl md:text-4xl'
    },

    contactUs: row.contact_us || {
      title: { ar: 'تواصل معنا', en: 'Contact Us' },
      subtitle: { ar: 'نحن هنا لمساعدتك', en: 'We are here to help you' },
      cards: [],
      socialLinks: [],
      form: {
        fields: [],
        submitText: { ar: 'إرسال', en: 'Send' }
      }
    },

    footerDescription: (row.section_texts && row.section_texts.footerDescription) || { ar: 'وكالة تسويق رقمي سعودية متكاملة.', en: 'A full-service Saudi digital marketing agency.' },
    copyrightText: (row.section_texts && row.section_texts.copyrightText) || { ar: 'جميع الحقوق محفوظة', en: 'All rights reserved' },
    footerLinks: (row.section_texts && row.section_texts.footerLinks) || {
      privacy: { ar: 'سياسة الخصوصية', en: 'Privacy Policy' },
      terms: { ar: 'شروط الاستخدام', en: 'Terms of Service' }
    },

    privacyPolicy: row.privacy_policy || { ar: '', en: '' },
    termsOfService: row.terms_of_service || { ar: '', en: '' }
  };
};

const mapSettingsToDB = (item: SiteSettings) => ({
  site_name: item.siteName,
  contact_email: item.contactEmail,
  contact_phone: item.contactPhone,
  address: item.address,
  social_links: item.socialLinks,
  enable_english: item.enableEnglish,
  tab_title: item.tabTitle,
  logo_url: item.logoUrl,
  icon_url: item.iconUrl,
  footer_logo_url: item.footerLogoUrl,
  favicon_url: item.faviconUrl,
  top_banner: item.topBanner,
  bottom_banner: item.bottomBanner,
  section_texts: item.sectionTexts,
  home_sections: item.homeSections,
  contact_us: item.contactUs,
  privacy_policy: item.privacyPolicy,
  terms_of_service: item.termsOfService
});

/* --- SERVER SEED TRIGGER --- */
let seedUnavailable = false;
const triggerServerSeed = async () => {
  if (seedUnavailable) return false;
  try {
    // In local/preview environments (vite preview), serverless functions may not exist.
    // Avoid calling the endpoint to prevent console noise and unnecessary retries.
    const host = typeof window !== 'undefined' ? window.location.hostname : '';
    if (host === 'localhost' || host === '127.0.0.1' || host === '::1') {
      seedUnavailable = true;
      return false;
    }
  } catch {
    // ignore
  }
  try {
    const res = await fetch('/api/seed', { method: 'POST' });
    if (!res.ok) {
      // If endpoint is missing/disabled in this environment, stop retrying.
      if (res.status === 404) seedUnavailable = true;
      return false;
    }
    return true;
  } catch (e) {
    seedUnavailable = true;
    return false;
  }
};

/* --- SAFE FETCH HELPER WITH FALLBACK --- */
const fetchWithOrder = async (table: string, mapper: Function) => {
  let { data, error } = await supabase
    .from(table)
    .select('*')
    .order('order_index', { ascending: true });

  if (error || !data) {
    const res = await supabase.from(table).select('*').order('created_at', { ascending: true });
    data = res.data;
    error = res.error;
  }

  if (!error && (!data || data.length === 0)) {
    await triggerServerSeed();
    const { data: retry } = await supabase.from(table).select('*').order('created_at', { ascending: true });
    return retry?.map(row => mapper(row)) || [];
  }

  return data?.map(row => mapper(row)) || [];
}

/* --- DB SERVICE EXPORT --- */
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
    getAll: async () => await fetchWithOrder('services', mapServiceFromDB),
    save: async (item: Service) => {
      const payload = mapServiceToDB(item);
      if (item.id && item.id !== 'new') (payload as any).id = item.id;
      return await supabase.from('services').upsert([payload]);
    },
    delete: async (id: string) => await supabase.from('services').delete().eq('id', id)
  },

  packages: {
    getAll: async () => await fetchWithOrder('packages', mapPackageFromDB),
    save: async (item: Package) => {
      const payload = mapPackageToDB(item);
      if (item.id && item.id !== 'new') (payload as any).id = item.id;
      return await supabase.from('packages').upsert([payload]);
    },
    delete: async (id: string) => await supabase.from('packages').delete().eq('id', id)
  },

  team: {
    getAll: async () => await fetchWithOrder('team_members', mapTeamFromDB),
    save: async (item: TeamMember) => {
      const payload = mapTeamToDB(item);
      if (item.id && item.id !== 'new') (payload as any).id = item.id;
      return await supabase.from('team_members').upsert([payload]);
    },
    delete: async (id: string) => await supabase.from('team_members').delete().eq('id', id)
  },

  caseStudies: {
    getAll: async () => await fetchWithOrder('case_studies', mapCaseFromDB),
    save: async (item: CaseStudy) => {
      const payload = mapCaseToDB(item);
      if (item.id && item.id !== 'new') (payload as any).id = item.id;

      const res = await supabase.from('case_studies').upsert([payload]);
      if (res.error && (res.error as any).code === 'PGRST204' && /\burl\b/i.test(res.error.message || '')) {
        const retryPayload = { ...(payload as any) };
        delete retryPayload.url;
        return await supabase.from('case_studies').upsert([retryPayload]);
      }

      return res;
    },
    delete: async (id: string) => await supabase.from('case_studies').delete().eq('id', id)
  },

  blog: {
    getAll: async () => {
      const { data, error } = await supabase.from('blog_posts').select('*').order('created_at', { ascending: false });
      if (!error && (!data || data.length === 0)) {
        await triggerServerSeed();
        const { data: retry } = await supabase.from('blog_posts').select('*').order('created_at', { ascending: false });
        return retry?.map(mapBlogFromDB) || [];
      }
      return data?.map(mapBlogFromDB) || [];
    },
    save: async (item: BlogPost) => {
      const payload = mapBlogToDB(item);
      if (item.id && item.id !== 'new') (payload as any).id = item.id;
      return await supabase.from('blog_posts').upsert([payload]);
    },
    delete: async (id: string) => await supabase.from('blog_posts').delete().eq('id', id)
  },

  messages: {
    getAll: async (): Promise<ContactMessage[]> => {
      const { data } = await supabase.from('contact_messages').select('*').order('created_at', { ascending: false });
      return data?.map(mapMessageFromDB) || [];
    },
    send: async (name: string, phone: string) => {
      return await supabase.from('contact_messages').insert([{ name, phone }]);
    },
    delete: async (id: string) => await supabase.from('contact_messages').delete().eq('id', id)
  },

  settings: {
    get: async (): Promise<SiteSettings> => {
      // console.log('🔧 [db.settings] Getting unified settings from settingsService...');
      // استخدام نفس المصدر الموحد الذي تستخدمه لوحة التحكم
      return await settingsService.getSettings();
    },
    save: async (newSettings: SiteSettings) => {
      // console.log('🔧 [db.settings] Saving through settingsService...');
      // استخدام نفس الحفظ الموحد
      return await settingsService.saveSettings(newSettings);
    }
  },

  pages: {
    get: async (slug: string): Promise<Page | null> => {
      try {
        const res = await fetch(`/api/pages/${slug}`);
        if (!res.ok) return null;
        return await res.json();
      } catch {
        return null;
      }
    },
    getAll: async (): Promise<Page[]> => {
      try {
        const res = await fetch('/api/pages/list');
        if (!res.ok) return [];
        return await res.json();
      } catch {
        return [];
      }
    },
    save: async (slug: string, title: string, content: string) => {
      const res = await fetch('/api/pages/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slug, title, content })
      });
      return res.ok;
    }
  },

  packageRequests: {
    getAll: async (): Promise<PackageRequest[]> => {
      const { data, error } = await supabase
        .from('package_requests')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data.map(mapPackageRequestFromDB);
    },

    create: async (request: Omit<PackageRequest, 'id' | 'createdAt'>): Promise<PackageRequest> => {
      const { data, error } = await supabase
        .from('package_requests')
        .insert(mapPackageRequestToDB(request))
        .select()
        .single();

      if (error) throw error;
      return mapPackageRequestFromDB(data);
    },

    updateStatus: async (id: string, status: PackageRequest['status']): Promise<void> => {
      const { error } = await supabase
        .from('package_requests')
        .update({ status })
        .eq('id', id);

      if (error) throw error;
    },

    delete: async (id: string): Promise<void> => {
      const { error } = await supabase
        .from('package_requests')
        .delete()
        .eq('id', id);

      if (error) throw error;
    }
  }
};