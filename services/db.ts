
import { supabase } from './supabase';
import { Service, CaseStudy, Package, TeamMember, SiteSettings } from '../types';

/* --- DATA MAPPERS (Snake_Case <-> CamelCase) --- */
// ... (Mappers remain the same as previous version, assuming they are correct)
const mapServiceFromDB = (row: any): Service => ({
  id: row.id,
  title: row.title || { ar: '', en: '' },
  description: row.description || { ar: '', en: '' },
  features: row.features || [],
  iconName: row.icon_name || 'HelpCircle'
});

const mapServiceToDB = (item: Service) => ({
  title: item.title,
  description: item.description,
  features: item.features,
  icon_name: item.iconName
});

const mapPackageFromDB = (row: any): Package => ({
  id: row.id,
  name: row.name || { ar: '', en: '' },
  price: row.price || '',
  features: row.features || [],
  isPopular: row.is_popular || false
});

const mapPackageToDB = (item: Package) => ({
  name: item.name,
  price: item.price,
  features: item.features,
  is_popular: item.isPopular
});

const mapTeamFromDB = (row: any): TeamMember => ({
  id: row.id,
  name: row.name || { ar: '', en: '' },
  role: row.role || { ar: '', en: '' },
  image: row.image || '',
  linkedin: row.linkedin || ''
});

const mapTeamToDB = (item: TeamMember) => ({
  name: item.name,
  role: item.role,
  image: item.image,
  linkedin: item.linkedin
});

const mapCaseFromDB = (row: any): CaseStudy => ({
  id: row.id,
  client: row.client || '',
  title: row.title || { ar: '', en: '' },
  category: row.category || { ar: '', en: '' },
  result: row.result || { ar: '', en: '' },
  image: row.image || '',
  stats: row.stats || []
});

const mapCaseToDB = (item: CaseStudy) => ({
  client: item.client,
  title: item.title,
  category: item.category,
  result: item.result,
  image: item.image,
  stats: item.stats
});

const mapSettingsFromDB = (row: any): SiteSettings => ({
  siteName: row.site_name || { ar: 'Tivro', en: 'Tivro' },
  contactEmail: row.contact_email || '',
  contactPhone: row.contact_phone || '',
  address: row.address || { ar: '', en: '' },
  socialLinks: row.social_links || { twitter: '', linkedin: '', instagram: '' }
});

const mapSettingsToDB = (item: SiteSettings) => ({
  site_name: item.siteName,
  contact_email: item.contactEmail,
  contact_phone: item.contactPhone,
  address: item.address,
  social_links: item.socialLinks
});

/* --- HELPER: Call Server-Side Seed --- */
const callServerSeed = async () => {
  try {
    console.log('🌱 Calling Server-Side Seed API...');
    const res = await fetch('/api/seed', { method: 'POST' });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || 'Unknown error');
    console.log('✅ Server Seed Success:', json.message);
    return true;
  } catch (error) {
    console.error('❌ Server Seed Failed:', error);
    return false;
  }
};

const cleanIdForSave = (item: any) => {
  const payload = { ...item };
  if (payload.id === 'new' || (typeof payload.id === 'string' && payload.id.length < 10)) {
    delete payload.id;
  }
  return payload;
};

/* --- DB IMPLEMENTATION --- */
export const db = {
  services: {
    getAll: async (): Promise<Service[]> => {
      const { data, error } = await supabase.from('services').select('*').order('created_at', { ascending: true });
      
      // If empty, trigger server seed then retry fetch
      if (!error && (!data || data.length === 0)) {
         await callServerSeed();
         const { data: retry } = await supabase.from('services').select('*').order('created_at', { ascending: true });
         return retry?.map(mapServiceFromDB) || [];
      }

      return data?.map(mapServiceFromDB) || [];
    },
    save: async (item: Service) => {
      const payload = cleanIdForSave(mapServiceToDB(item));
      if (item.id && item.id !== 'new') (payload as any).id = item.id;
      return await supabase.from('services').upsert([payload]);
    },
    delete: async (id: string) => await supabase.from('services').delete().eq('id', id)
  },

  packages: {
    getAll: async (): Promise<Package[]> => {
      const { data, error } = await supabase.from('packages').select('*').order('created_at', { ascending: true });
      
      if (!error && (!data || data.length === 0)) {
         await callServerSeed();
         const { data: retry } = await supabase.from('packages').select('*').order('created_at', { ascending: true });
         return retry?.map(mapPackageFromDB) || [];
      }
      return data?.map(mapPackageFromDB) || [];
    },
    save: async (item: Package) => {
      const payload = cleanIdForSave(mapPackageToDB(item));
      if (item.id && item.id !== 'new') (payload as any).id = item.id;
      return await supabase.from('packages').upsert([payload]);
    },
    delete: async (id: string) => await supabase.from('packages').delete().eq('id', id)
  },

  team: {
    getAll: async (): Promise<TeamMember[]> => {
      const { data, error } = await supabase.from('team_members').select('*').order('created_at', { ascending: true });
      
      if (!error && (!data || data.length === 0)) {
         await callServerSeed();
         const { data: retry } = await supabase.from('team_members').select('*').order('created_at', { ascending: true });
         return retry?.map(mapTeamFromDB) || [];
      }
      return data?.map(mapTeamFromDB) || [];
    },
    save: async (item: TeamMember) => {
      const payload = cleanIdForSave(mapTeamToDB(item));
      if (item.id && item.id !== 'new') (payload as any).id = item.id;
      return await supabase.from('team_members').upsert([payload]);
    },
    delete: async (id: string) => await supabase.from('team_members').delete().eq('id', id)
  },

  caseStudies: {
    getAll: async (): Promise<CaseStudy[]> => {
      const { data, error } = await supabase.from('case_studies').select('*').order('created_at', { ascending: true });
      
      if (!error && (!data || data.length === 0)) {
         await callServerSeed();
         const { data: retry } = await supabase.from('case_studies').select('*').order('created_at', { ascending: true });
         return retry?.map(mapCaseFromDB) || [];
      }
      return data?.map(mapCaseFromDB) || [];
    },
    save: async (item: CaseStudy) => {
      const payload = cleanIdForSave(mapCaseToDB(item));
      if (item.id && item.id !== 'new') (payload as any).id = item.id;
      return await supabase.from('case_studies').upsert([payload]);
    },
    delete: async (id: string) => await supabase.from('case_studies').delete().eq('id', id)
  },

  settings: {
    get: async (): Promise<SiteSettings> => {
      try {
        const { data, error } = await supabase.from('site_settings').select('*').single();
        if (error || !data) {
          await callServerSeed();
          const { data: retry } = await supabase.from('site_settings').select('*').single();
          return mapSettingsFromDB(retry || {});
        }
        return mapSettingsFromDB(data);
      } catch (e) {
        return mapSettingsFromDB({});
      }
    },
    save: async (settings: SiteSettings) => {
      const payload = { id: 1, ...mapSettingsToDB(settings) };
      return await supabase.from('site_settings').upsert(payload);
    }
  }
};
