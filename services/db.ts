import { supabase, isSupabaseConfigured } from './supabase';
import { Service, CaseStudy, Package, TeamMember, SiteSettings } from '../types';

/* --- FALLBACK / SEED DATA --- */

const SEED_SERVICES: Service[] = [
  {
    id: '1',
    title: { ar: 'تحسين محركات البحث', en: 'SEO Optimization' },
    description: { ar: 'نساعدك في تصدر نتائج البحث والوصول لجمهورك المستهدف.', en: 'We help you rank higher and reach your target audience.' },
    iconName: 'Search',
    features: [{ ar: 'تحليل الكلمات المفتاحية', en: 'Keyword Analysis' }, { ar: 'تحسين تقني', en: 'Technical SEO' }]
  },
  {
    id: '2',
    title: { ar: 'إدارة حملات إعلانية', en: 'PPC Campaigns' },
    description: { ar: 'حملات مدفوعة على جوجل ومنصات التواصل تحقق أعلى عائد.', en: 'Paid campaigns on Google and Social Media with high ROI.' },
    iconName: 'BarChart',
    features: [{ ar: 'استهداف دقيق', en: 'Precise Targeting' }, { ar: 'تقارير أداء', en: 'Performance Reports' }]
  },
  {
    id: '3',
    title: { ar: 'إدارة منصات التواصل', en: 'Social Media Management' },
    description: { ar: 'بناء مجتمع متفاعل حول علامتك التجارية.', en: 'Building an engaged community around your brand.' },
    iconName: 'Share2',
    features: [{ ar: 'صناعة محتوى', en: 'Content Creation' }, { ar: 'جدولة منشورات', en: 'Scheduling' }]
  },
  {
    id: '4',
    title: { ar: 'تصميم وتطوير المواقع', en: 'Web Development' },
    description: { ar: 'مواقع سريعة، متجاوبة، ومصممة للتحويل.', en: 'Fast, responsive, and conversion-optimized websites.' },
    iconName: 'Code',
    features: [{ ar: 'واجهة احترافية', en: 'Professional UI' }, { ar: 'سرعة تحميل', en: 'Fast Loading' }]
  }
];

const SEED_PACKAGES: Package[] = [
  {
    id: '1',
    name: { ar: 'انطلاق', en: 'Startup' },
    price: '2,500 SAR',
    features: [{ ar: 'إدارة منصتين', en: '2 Platforms' }, { ar: '12 منشور شهرياً', en: '12 Posts/mo' }],
    isPopular: false
  },
  {
    id: '2',
    name: { ar: 'نمو', en: 'Growth' },
    price: '5,000 SAR',
    features: [{ ar: 'إدارة 4 منصات', en: '4 Platforms' }, { ar: 'حملة إعلانية واحدة', en: '1 Ad Campaign' }, { ar: 'تقارير أسبوعية', en: 'Weekly Reports' }],
    isPopular: true
  },
  {
    id: '3',
    name: { ar: 'احتراف', en: 'Pro' },
    price: '9,500 SAR',
    features: [{ ar: 'كل المنصات', en: 'All Platforms' }, { ar: 'ميزانية إعلانية مفتوحة', en: 'Open Ad Budget' }, { ar: 'مدير حساب خاص', en: 'Dedicated Manager' }],
    isPopular: false
  }
];

const SEED_TEAM: TeamMember[] = [
  {
    id: '1',
    name: { ar: 'سارة أحمد', en: 'Sara Ahmed' },
    role: { ar: 'مديرة التسويق', en: 'Marketing Manager' },
    image: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&h=400&fit=crop',
    linkedin: '#'
  },
  {
    id: '2',
    name: { ar: 'خالد الدوسري', en: 'Khaled Al-Dossari' },
    role: { ar: 'خبير SEO', en: 'SEO Expert' },
    image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&fit=crop',
    linkedin: '#'
  },
  {
    id: '3',
    name: { ar: 'نورة العتيبي', en: 'Noura Al-Otaibi' },
    role: { ar: 'مصممة جرافيك', en: 'Graphic Designer' },
    image: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=400&h=400&fit=crop',
    linkedin: '#'
  }
];

const SEED_CASES: CaseStudy[] = [
  {
    id: '1',
    client: 'TechStore',
    title: { ar: 'زيادة المبيعات 200%', en: '200% Sales Increase' },
    category: { ar: 'تجارة إلكترونية', en: 'E-Commerce' },
    result: { ar: 'تحسين معدل التحويل للمتجر الإلكتروني', en: 'Optimized conversion rate for online store' },
    image: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&h=500&fit=crop',
    stats: [{ label: { ar: 'عائد', en: 'ROAS' }, value: '5.4x' }]
  },
  {
    id: '2',
    client: 'HealthyLife',
    title: { ar: 'إطلاق علامة تجارية', en: 'Brand Launch' },
    category: { ar: 'صحة', en: 'Health' },
    result: { ar: 'بناء هوية بصرية كاملة وحملة إطلاق', en: 'Full visual identity and launch campaign' },
    image: 'https://images.unsplash.com/photo-1556761175-5973dc0f32e7?w=800&h=500&fit=crop',
    stats: [{ label: { ar: 'وصول', en: 'Reach' }, value: '1M+' }]
  }
];

const FALLBACK_SETTINGS: SiteSettings = {
  siteName: { ar: 'تيفرو', en: 'Tivro' },
  contactEmail: 'hello@tivro.sa',
  contactPhone: '+966 50 123 4567',
  address: { ar: 'الرياض، المملكة العربية السعودية', en: 'Riyadh, Saudi Arabia' },
  socialLinks: {
    twitter: 'https://twitter.com',
    linkedin: 'https://linkedin.com',
    instagram: 'https://instagram.com'
  }
};

/* --- API WRAPPER --- */

export const db = {
  services: {
    getAll: async (): Promise<Service[]> => {
      if (!isSupabaseConfigured) return SEED_SERVICES;
      try {
        const { data, error } = await supabase.from('services').select('*').order('created_at', { ascending: true });
        // If error occurs, or if data is empty (fresh DB), return SEED data for display
        if (error) throw error;
        if (!data || data.length === 0) return SEED_SERVICES;
        return (data as unknown as Service[]);
      } catch (error) {
        console.warn('DB Services fallback:', error);
        return SEED_SERVICES;
      }
    },
    save: async (item: Service) => {
      if (!isSupabaseConfigured) return { error: null, data: [item] };
      const payload = { ...item };
      // Convert seed IDs (numeric strings) to new inserts so they get valid UUIDs
      if (payload.id === 'new' || !payload.id.includes('-')) {
        // @ts-ignore
        delete payload.id;
        return await supabase.from('services').insert([payload]);
      }
      return await supabase.from('services').upsert([payload]);
    },
    delete: async (id: string) => {
      if (!isSupabaseConfigured) return;
      return await supabase.from('services').delete().eq('id', id);
    }
  },
  packages: {
    getAll: async (): Promise<Package[]> => {
      if (!isSupabaseConfigured) return SEED_PACKAGES;
      try {
        const { data, error } = await supabase.from('packages').select('*').order('created_at', { ascending: true });
        if (error) throw error;
        if (!data || data.length === 0) return SEED_PACKAGES;
        return (data as unknown as Package[]);
      } catch (error) {
        console.warn('DB Packages fallback:', error);
        return SEED_PACKAGES;
      }
    },
    save: async (item: Package) => {
       if (!isSupabaseConfigured) return;
       const payload = { ...item };
       if (payload.id === 'new' || !payload.id.includes('-')) {
         // @ts-ignore
         delete payload.id;
         return await supabase.from('packages').insert([payload]);
       }
       return await supabase.from('packages').upsert([payload]);
    },
    delete: async (id: string) => {
      if (!isSupabaseConfigured) return;
      return await supabase.from('packages').delete().eq('id', id);
    }
  },
  caseStudies: {
    getAll: async (): Promise<CaseStudy[]> => {
      if (!isSupabaseConfigured) return SEED_CASES;
      try {
        const { data, error } = await supabase.from('case_studies').select('*').order('created_at', { ascending: true });
        if (error) throw error;
        if (!data || data.length === 0) return SEED_CASES;
        return (data as unknown as CaseStudy[]);
      } catch (error) {
        console.warn('DB CaseStudies fallback:', error);
        return SEED_CASES;
      }
    },
    save: async (item: CaseStudy) => {
       if (!isSupabaseConfigured) return;
       const payload = { ...item };
       if (payload.id === 'new' || !payload.id.includes('-')) {
         // @ts-ignore
         delete payload.id;
         return await supabase.from('case_studies').insert([payload]);
       }
       return await supabase.from('case_studies').upsert([payload]);
    },
    delete: async (id: string) => {
      if (!isSupabaseConfigured) return;
      return await supabase.from('case_studies').delete().eq('id', id);
    }
  },
  team: {
    getAll: async (): Promise<TeamMember[]> => {
      if (!isSupabaseConfigured) return SEED_TEAM;
      try {
        const { data, error } = await supabase.from('team_members').select('*').order('created_at', { ascending: true });
        if (error) throw error;
        if (!data || data.length === 0) return SEED_TEAM;
        return (data as unknown as TeamMember[]);
      } catch (error) {
        console.warn('DB Team fallback:', error);
        return SEED_TEAM;
      }
    },
    save: async (item: TeamMember) => {
       if (!isSupabaseConfigured) return;
       const payload = { ...item };
       if (payload.id === 'new' || !payload.id.includes('-')) {
         // @ts-ignore
         delete payload.id;
         return await supabase.from('team_members').insert([payload]);
       }
       return await supabase.from('team_members').upsert([payload]);
    },
    delete: async (id: string) => {
      if (!isSupabaseConfigured) return;
      return await supabase.from('team_members').delete().eq('id', id);
    }
  },
  settings: {
    get: async (): Promise<SiteSettings> => {
      if (!isSupabaseConfigured) return FALLBACK_SETTINGS;
      try {
        const { data, error } = await supabase.from('site_settings').select('*').single();
        if (error || !data) return FALLBACK_SETTINGS;
        return {
           siteName: data.site_name,
           contactEmail: data.contact_email,
           contactPhone: data.contact_phone,
           address: data.address,
           socialLinks: data.social_links
        } as unknown as SiteSettings;
      } catch (error) {
        return FALLBACK_SETTINGS;
      }
    },
    save: async (settings: SiteSettings) => {
      if (!isSupabaseConfigured) return;
      const payload = {
        id: 1,
        site_name: settings.siteName,
        contact_email: settings.contactEmail,
        contact_phone: settings.contactPhone,
        address: settings.address,
        social_links: settings.socialLinks
      };
      return await supabase.from('site_settings').upsert(payload);
    }
  },
  seedDatabase: async () => {
    if (!isSupabaseConfigured) return false;
    try {
        // Insert Seed Data (remove IDs to let Supabase generate UUIDs)
        const { error: e1 } = await supabase.from('services').insert(SEED_SERVICES.map(({id, ...rest}) => rest));
        const { error: e2 } = await supabase.from('packages').insert(SEED_PACKAGES.map(({id, ...rest}) => rest));
        const { error: e3 } = await supabase.from('team_members').insert(SEED_TEAM.map(({id, ...rest}) => rest));
        const { error: e4 } = await supabase.from('case_studies').insert(SEED_CASES.map(({id, ...rest}) => rest));
        
        // Ensure settings exist
        await db.settings.save(FALLBACK_SETTINGS);

        if (e1 || e2 || e3 || e4) throw new Error('Some inserts failed');
        return true;
    } catch (error) {
        console.error('Seed Error:', error);
        return false;
    }
  }
};