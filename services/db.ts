
import { supabase, isSupabaseConfigured } from './supabase';
import { Service, CaseStudy, Package, TeamMember, SiteSettings, LocalizedString } from '../types';

/* --- DATA MAPPERS --- */
// Convert DB (snake_case) to App (camelCase) and vice versa

const mapServiceFromDB = (row: any): Service => ({
  id: row.id,
  title: row.title,
  description: row.description,
  features: row.features,
  iconName: row.icon_name || 'HelpCircle' // Map icon_name -> iconName
});

const mapServiceToDB = (item: Service) => ({
  title: item.title,
  description: item.description,
  features: item.features,
  icon_name: item.iconName // Map iconName -> icon_name
});

const mapPackageFromDB = (row: any): Package => ({
  id: row.id,
  name: row.name,
  price: row.price,
  features: row.features,
  isPopular: row.is_popular // Map is_popular -> isPopular
});

const mapPackageToDB = (item: Package) => ({
  name: item.name,
  price: item.price,
  features: item.features,
  is_popular: item.isPopular // Map isPopular -> is_popular
});

const mapSettingsFromDB = (row: any): SiteSettings => ({
  siteName: row.site_name || { ar: '', en: '' },
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

/* --- SEED DATA --- */

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

const FALLBACK_SETTINGS = {
  site_name: { ar: 'تيفرو', en: 'Tivro' },
  contact_email: 'info@tivro.sa',
  contact_phone: '+966 50 000 0000',
  address: { ar: 'الرياض', en: 'Riyadh' },
  social_links: { twitter: '#', linkedin: '#', instagram: '#' }
};

// Helper to remove ID for new inserts
const cleanForSave = (item: any) => {
  const payload = { ...item };
  if (payload.id === 'new' || (typeof payload.id === 'string' && !payload.id.includes('-'))) {
      delete payload.id;
  }
  return payload;
};

export const db = {
  services: {
    getAll: async (): Promise<Service[]> => {
      if (!isSupabaseConfigured) return [];
      
      const { data, error } = await supabase.from('services').select('*').order('created_at', { ascending: true });
      
      // Auto-Seed if empty
      if (!error && (!data || data.length === 0)) {
         console.log('🌱 Seeding Services...');
         const { error: seedError } = await supabase.from('services').insert(SEED_SERVICES);
         if (!seedError) {
             const { data: seeded } = await supabase.from('services').select('*').order('created_at', { ascending: true });
             return seeded?.map(mapServiceFromDB) || [];
         }
      }
      
      return data?.map(mapServiceFromDB) || [];
    },
    save: async (item: Service) => {
      if (!isSupabaseConfigured) return;
      const payload = cleanForSave(mapServiceToDB(item));
      // Preserve ID if it exists for updates
      if (item.id && item.id !== 'new') (payload as any).id = item.id;
      return await supabase.from('services').upsert([payload]);
    },
    delete: async (id: string) => {
      if (!isSupabaseConfigured) return;
      return await supabase.from('services').delete().eq('id', id);
    }
  },

  packages: {
    getAll: async (): Promise<Package[]> => {
      if (!isSupabaseConfigured) return [];
      const { data, error } = await supabase.from('packages').select('*').order('created_at', { ascending: true });
      
      if (!error && (!data || data.length === 0)) {
          console.log('🌱 Seeding Packages...');
          await supabase.from('packages').insert(SEED_PACKAGES);
          const { data: seeded } = await supabase.from('packages').select('*').order('created_at', { ascending: true });
          return seeded?.map(mapPackageFromDB) || [];
      }
      return data?.map(mapPackageFromDB) || [];
    },
    save: async (item: Package) => {
       if (!isSupabaseConfigured) return;
       const payload = cleanForSave(mapPackageToDB(item));
       if (item.id && item.id !== 'new') (payload as any).id = item.id;
       return await supabase.from('packages').upsert([payload]);
    },
    delete: async (id: string) => await supabase.from('packages').delete().eq('id', id)
  },

  team: {
    getAll: async (): Promise<TeamMember[]> => {
      if (!isSupabaseConfigured) return [];
      const { data, error } = await supabase.from('team_members').select('*').order('created_at', { ascending: true });
      
      if (!error && (!data || data.length === 0)) {
          console.log('🌱 Seeding Team...');
          await supabase.from('team_members').insert(SEED_TEAM);
          const { data: seeded } = await supabase.from('team_members').select('*').order('created_at', { ascending: true });
          return seeded as TeamMember[] || [];
      }
      return data as TeamMember[] || [];
    },
    save: async (item: TeamMember) => {
       if (!isSupabaseConfigured) return;
       const payload = cleanForSave(item); // No mapping needed for Team currently
       return await supabase.from('team_members').upsert([payload]);
    },
    delete: async (id: string) => await supabase.from('team_members').delete().eq('id', id)
  },

  caseStudies: {
    getAll: async (): Promise<CaseStudy[]> => {
      if (!isSupabaseConfigured) return [];
      const { data, error } = await supabase.from('case_studies').select('*').order('created_at', { ascending: true });
      
      if (!error && (!data || data.length === 0)) {
          console.log('🌱 Seeding Cases...');
          await supabase.from('case_studies').insert(SEED_CASES);
          const { data: seeded } = await supabase.from('case_studies').select('*').order('created_at', { ascending: true });
          return seeded as CaseStudy[] || [];
      }
      return data as CaseStudy[] || [];
    },
    save: async (item: CaseStudy) => {
       if (!isSupabaseConfigured) return;
       const payload = cleanForSave(item);
       return await supabase.from('case_studies').upsert([payload]);
    },
    delete: async (id: string) => await supabase.from('case_studies').delete().eq('id', id)
  },

  settings: {
    get: async (): Promise<SiteSettings> => {
      if (!isSupabaseConfigured) return mapSettingsFromDB(FALLBACK_SETTINGS);
      
      try {
        const { data, error } = await supabase.from('site_settings').select('*').single();
        
        if (error || !data) {
             console.log('🌱 Seeding Settings...');
             const payload = { id: 1, ...FALLBACK_SETTINGS };
             await supabase.from('site_settings').upsert(payload);
             return mapSettingsFromDB(payload);
        }

        return mapSettingsFromDB(data);

      } catch (error) {
        console.error("Settings fetch error", error);
        return mapSettingsFromDB(FALLBACK_SETTINGS);
      }
    },
    save: async (settings: SiteSettings) => {
      if (!isSupabaseConfigured) return;
      const payload = { id: 1, ...mapSettingsToDB(settings) };
      return await supabase.from('site_settings').upsert(payload);
    }
  },
  
  seedDatabase: async () => {
      await db.services.getAll();
      await db.packages.getAll();
      await db.team.getAll();
      await db.caseStudies.getAll();
      await db.settings.get();
      return true;
  }
};
