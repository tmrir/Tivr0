
import { supabase } from './supabase';
import { Service, CaseStudy, Package, TeamMember, SiteSettings } from '../types';

/* --- DATA MAPPERS (Snake_Case <-> CamelCase) --- */

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

/* --- SEED DATA (Used for Auto-Seeding) --- */
const SEED_SERVICES = [
  { title: { ar: 'تحسين محركات البحث', en: 'SEO Optimization' }, description: { ar: 'نساعدك في تصدر نتائج البحث.', en: 'Rank higher in search results.' }, icon_name: 'Search', features: [{ ar: 'تحليل', en: 'Analysis' }] },
  { title: { ar: 'إدارة حملات إعلانية', en: 'PPC Campaigns' }, description: { ar: 'حملات مدفوعة عالية العائد.', en: 'High ROI paid campaigns.' }, icon_name: 'BarChart', features: [{ ar: 'استهداف', en: 'Targeting' }] },
  { title: { ar: 'إدارة التواصل', en: 'Social Media' }, description: { ar: 'بناء مجتمع متفاعل.', en: 'Building engaged communities.' }, icon_name: 'Share2', features: [{ ar: 'محتوى', en: 'Content' }] },
  { title: { ar: 'تطوير الويب', en: 'Web Dev' }, description: { ar: 'مواقع سريعة ومتجاوبة.', en: 'Fast responsive websites.' }, icon_name: 'Code', features: [{ ar: 'تصميم', en: 'Design' }] }
];

const SEED_PACKAGES = [
  { name: { ar: 'انطلاق', en: 'Startup' }, price: '2,500 SAR', features: [{ ar: 'منصة واحدة', en: '1 Platform' }], is_popular: false },
  { name: { ar: 'نمو', en: 'Growth' }, price: '5,000 SAR', features: [{ ar: '3 منصات', en: '3 Platforms' }], is_popular: true },
  { name: { ar: 'احتراف', en: 'Pro' }, price: '9,500 SAR', features: [{ ar: 'شامل', en: 'All Inclusive' }], is_popular: false }
];

const SEED_TEAM = [
  { name: { ar: 'سارة أحمد', en: 'Sara Ahmed' }, role: { ar: 'مديرة تسويق', en: 'Marketing Mgr' }, image: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400', linkedin: '#' },
  { name: { ar: 'خالد الدوسري', en: 'Khaled Al' }, role: { ar: 'خبير SEO', en: 'SEO Expert' }, image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400', linkedin: '#' },
  { name: { ar: 'نورة العتيبي', en: 'Noura Al' }, role: { ar: 'مصممة', en: 'Designer' }, image: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=400', linkedin: '#' }
];

const SEED_CASES = [
  { client: 'TechStore', title: { ar: 'زيادة 200%', en: '200% Growth' }, category: { ar: 'تجارة', en: 'E-Com' }, result: { ar: 'تحسين التحويل', en: 'CRO' }, image: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800', stats: [{ label: { ar: 'ROI', en: 'ROI' }, value: '5x' }] },
  { client: 'HealthApp', title: { ar: 'إطلاق تطبيق', en: 'App Launch' }, category: { ar: 'تطبيق', en: 'App' }, result: { ar: 'مليون تحميل', en: '1M Downloads' }, image: 'https://images.unsplash.com/photo-1556761175-5973dc0f32e7?w=800', stats: [{ label: { ar: 'Users', en: 'Users' }, value: '1M' }] }
];

const DEFAULT_SETTINGS = {
  site_name: { ar: 'تيفرو', en: 'Tivro' },
  contact_email: 'info@tivro.sa',
  contact_phone: '+966 50 000 0000',
  address: { ar: 'الرياض', en: 'Riyadh' },
  social_links: { twitter: '#', linkedin: '#', instagram: '#' }
};

/* --- HELPERS --- */
const cleanIdForSave = (item: any) => {
  const payload = { ...item };
  // Removing ID 'new' lets Supabase generate a real UUID
  if (payload.id === 'new' || (typeof payload.id === 'string' && payload.id.length < 10)) {
    delete payload.id;
  }
  return payload;
};

/* --- DB IMPLEMENTATION --- */
export const db = {
  services: {
    getAll: async (): Promise<Service[]> => {
      // 1. Try Fetch
      const { data, error } = await supabase.from('services').select('*').order('created_at', { ascending: true });
      
      // 2. Auto-Seed Logic: If valid response but empty array, Insert Seed Data
      if (!error && (!data || data.length === 0)) {
        console.log('🌱 DB Empty: Seeding Services...');
        const { error: insertError } = await supabase.from('services').insert(SEED_SERVICES);
        if (insertError) console.error("Seeding failed:", insertError);
        
        // 3. Re-Fetch Real Data
        const { data: seeded } = await supabase.from('services').select('*').order('created_at', { ascending: true });
        return seeded?.map(mapServiceFromDB) || [];
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
        console.log('🌱 DB Empty: Seeding Packages...');
        await supabase.from('packages').insert(SEED_PACKAGES);
        const { data: seeded } = await supabase.from('packages').select('*').order('created_at', { ascending: true });
        return seeded?.map(mapPackageFromDB) || [];
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
        console.log('🌱 DB Empty: Seeding Team...');
        await supabase.from('team_members').insert(SEED_TEAM);
        const { data: seeded } = await supabase.from('team_members').select('*').order('created_at', { ascending: true });
        return seeded?.map(mapTeamFromDB) || [];
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
        console.log('🌱 DB Empty: Seeding Cases...');
        await supabase.from('case_studies').insert(SEED_CASES);
        const { data: seeded } = await supabase.from('case_studies').select('*').order('created_at', { ascending: true });
        return seeded?.map(mapCaseFromDB) || [];
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
          console.log('🌱 DB Empty: Seeding Settings...');
          const payload = { id: 1, ...DEFAULT_SETTINGS };
          await supabase.from('site_settings').upsert(payload);
          return mapSettingsFromDB(payload);
        }
        return mapSettingsFromDB(data);
      } catch (e) {
        console.error('Error fetching settings, using fallback', e);
        return mapSettingsFromDB(DEFAULT_SETTINGS);
      }
    },
    save: async (settings: SiteSettings) => {
      const payload = { id: 1, ...mapSettingsToDB(settings) };
      return await supabase.from('site_settings').upsert(payload);
    }
  }
};
