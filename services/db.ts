
import { supabase } from './supabase';
import { Service, CaseStudy, Package, TeamMember, SiteSettings, BlogPost, ContactMessage, SocialLink } from '../types';

/* --- DATA MAPPERS --- */
const mapServiceFromDB = (row: any): Service => ({
  id: row.id,
  title: row.title || { ar: '', en: '' },
  description: row.description || { ar: '', en: '' },
  features: row.features || [],
  iconName: row.icon_name || 'HelpCircle'
});
const mapServiceToDB = (item: Service) => ({ title: item.title, description: item.description, features: item.features, icon_name: item.iconName });

const mapPackageFromDB = (row: any): Package => ({
  id: row.id,
  name: row.name || { ar: '', en: '' },
  price: row.price || '',
  features: row.features || [],
  isPopular: row.is_popular || false
});
const mapPackageToDB = (item: Package) => ({ name: item.name, price: item.price, features: item.features, is_popular: item.isPopular });

const mapTeamFromDB = (row: any): TeamMember => ({
  id: row.id,
  name: row.name || { ar: '', en: '' },
  role: row.role || { ar: '', en: '' },
  image: row.image || '',
  linkedin: row.linkedin || ''
});
const mapTeamToDB = (item: TeamMember) => ({ name: item.name, role: item.role, image: item.image, linkedin: item.linkedin });

const mapCaseFromDB = (row: any): CaseStudy => ({
  id: row.id,
  client: row.client || '',
  title: row.title || { ar: '', en: '' },
  category: row.category || { ar: '', en: '' },
  result: row.result || { ar: '', en: '' },
  image: row.image || '',
  stats: Array.isArray(row.stats) ? row.stats : []
});
const mapCaseToDB = (item: CaseStudy) => ({ client: item.client, title: item.title, category: item.category, result: item.result, image: item.image, stats: item.stats });

const mapBlogFromDB = (row: any): BlogPost => ({
  id: row.id,
  title: row.title || { ar: '', en: '' },
  excerpt: row.excerpt || { ar: '', en: '' },
  content: row.content || { ar: '', en: '' },
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

const mapSettingsFromDB = (row: any): SiteSettings => {
  // Robust handling for legacy social_links object vs new array
  let socialLinks: SocialLink[] = [];
  if (Array.isArray(row.social_links)) {
      socialLinks = row.social_links;
  } else if (typeof row.social_links === 'object' && row.social_links !== null) {
      // Convert legacy object to array safely
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
    sectionTexts: row.section_texts || { 
      workTitle: { ar: 'قصص نجاح نفخر بها', en: 'Success Stories We Are Proud Of' }, 
      workSubtitle: { ar: 'أرقام تتحدث عن إنجازاتنا', en: 'Numbers speaking our achievements' } 
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
  section_texts: item.sectionTexts,
  privacy_policy: item.privacyPolicy,
  terms_of_service: item.termsOfService
});

/* --- SERVER SEED TRIGGER --- */
const triggerServerSeed = async () => {
  try {
    console.log('🔄 Triggering Server-Side Seed...');
    const res = await fetch('/api/seed', { method: 'POST' });
    const json = await res.json();
    if (res.ok) {
      console.log('✅ Seed Success:', json);
      return true;
    } else {
      console.error('⚠️ Seed Error:', json);
      return false;
    }
  } catch (e) {
    console.error('❌ Network Error triggering seed:', e);
    return false;
  }
};

/* --- DB SERVICE --- */
export const db = {
  // Helper to save new order
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
    getAll: async (): Promise<Service[]> => {
      // CHANGED: sort by order_index first, then created_at
      const { data, error } = await supabase.from('services').select('*').order('order_index', { ascending: true }).order('created_at', { ascending: true });
      if (!error && (!data || data.length === 0)) {
         await triggerServerSeed();
         const { data: retry } = await supabase.from('services').select('*').order('created_at', { ascending: true });
         return retry?.map(mapServiceFromDB) || [];
      }
      return data?.map(mapServiceFromDB) || [];
    },
    save: async (item: Service) => {
      const payload = mapServiceToDB(item);
      if (item.id && item.id !== 'new') (payload as any).id = item.id;
      return await supabase.from('services').upsert([payload]);
    },
    delete: async (id: string) => await supabase.from('services').delete().eq('id', id)
  },

  packages: {
    getAll: async (): Promise<Package[]> => {
      // CHANGED: sort by order_index
      const { data, error } = await supabase.from('packages').select('*').order('order_index', { ascending: true }).order('created_at', { ascending: true });
      if (!error && (!data || data.length === 0)) {
         await triggerServerSeed();
         const { data: retry } = await supabase.from('packages').select('*').order('created_at', { ascending: true });
         return retry?.map(mapPackageFromDB) || [];
      }
      return data?.map(mapPackageFromDB) || [];
    },
    save: async (item: Package) => {
      const payload = mapPackageToDB(item);
      if (item.id && item.id !== 'new') (payload as any).id = item.id;
      return await supabase.from('packages').upsert([payload]);
    },
    delete: async (id: string) => await supabase.from('packages').delete().eq('id', id)
  },

  team: {
    getAll: async (): Promise<TeamMember[]> => {
      // CHANGED: sort by order_index
      const { data, error } = await supabase.from('team_members').select('*').order('order_index', { ascending: true }).order('created_at', { ascending: true });
      if (!error && (!data || data.length === 0)) {
         await triggerServerSeed();
         const { data: retry } = await supabase.from('team_members').select('*').order('created_at', { ascending: true });
         return retry?.map(mapTeamFromDB) || [];
      }
      return data?.map(mapTeamFromDB) || [];
    },
    save: async (item: TeamMember) => {
      const payload = mapTeamToDB(item);
      if (item.id && item.id !== 'new') (payload as any).id = item.id;
      return await supabase.from('team_members').upsert([payload]);
    },
    delete: async (id: string) => await supabase.from('team_members').delete().eq('id', id)
  },

  caseStudies: {
    getAll: async (): Promise<CaseStudy[]> => {
      // CHANGED: sort by order_index
      const { data, error } = await supabase.from('case_studies').select('*').order('order_index', { ascending: true }).order('created_at', { ascending: true });
      if (!error && (!data || data.length === 0)) {
         await triggerServerSeed();
         const { data: retry } = await supabase.from('case_studies').select('*').order('created_at', { ascending: true });
         return retry?.map(mapCaseFromDB) || [];
      }
      return data?.map(mapCaseFromDB) || [];
    },
    save: async (item: CaseStudy) => {
      const payload = mapCaseToDB(item);
      if (item.id && item.id !== 'new') (payload as any).id = item.id;
      return await supabase.from('case_studies').upsert([payload]);
    },
    delete: async (id: string) => await supabase.from('case_studies').delete().eq('id', id)
  },

  blog: {
    getAll: async (): Promise<BlogPost[]> => {
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
      const { data, error } = await supabase.from('site_settings').select('*').single();
      if (!data || error) {
          const shouldSeed = !data; 
          if (shouldSeed) {
              await triggerServerSeed(); 
              const { data: retry } = await supabase.from('site_settings').select('*').single();
              return mapSettingsFromDB(retry || {});
          }
      }
      return mapSettingsFromDB(data || {});
    },
    save: async (newSettings: SiteSettings) => {
      const { data: currentDB } = await supabase.from('site_settings').select('*').single();
      const current = currentDB ? mapSettingsFromDB(currentDB) : null;
      
      const mergedSettings = current ? { ...current, ...newSettings } : newSettings;
      
      if (current && newSettings.sectionTexts) {
          mergedSettings.sectionTexts = { ...current.sectionTexts, ...newSettings.sectionTexts };
      }
      
      const payload = { id: 1, ...mapSettingsToDB(mergedSettings) };
      return await supabase.from('site_settings').upsert(payload);
    }
  }
};
