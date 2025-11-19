import { supabase, isSupabaseConfigured } from './supabase';
import { Service, CaseStudy, Package, TeamMember, SiteSettings } from '../types';

/* --- FALLBACK / SEED DATA --- */
/* Used when Supabase is not connected or returns errors */

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
      const { data, error } = await supabase.from('services').select('*').order('created_at', { ascending: true });
      if (error) { 
        console.warn('DB Fetch Error (Services), using fallback:', error.message); 
        return SEED_SERVICES; 
      }
      return (data as unknown as Service[]) || [];
    },
    save: async (item: Service) => {
      if (!isSupabaseConfigured) return { error: null, data: [item] };
      if (item.id === 'new' || !item.id.includes('-')) {
        const { id, ...rest } = item;
        return await supabase.from('services').insert([rest]);
      }
      return await supabase.from('services').upsert([item]);
    },
    delete: async (id: string) => {
      if (!isSupabaseConfigured) return;
      return await supabase.from('services').delete().eq('id', id);
    }
  },
  packages: {
    getAll: async (): Promise<Package[]> => {
      if (!isSupabaseConfigured) return SEED_PACKAGES;
      const { data, error } = await supabase.from('packages').select('*').order('created_at', { ascending: true });
      if (error) { 
        console.warn('DB Fetch Error (Packages), using fallback:', error.message);
        return SEED_PACKAGES; 
      }
      return (data as unknown as Package[]) || [];
    },
    save: async (item: Package) => {
       if (!isSupabaseConfigured) return;
       if (item.id === 'new' || !item.id.includes('-')) {
         const { id, ...rest } = item;
         return await supabase.from('packages').insert([rest]);
       }
       return await supabase.from('packages').upsert([item]);
    }
  },
  caseStudies: {
    getAll: async (): Promise<CaseStudy[]> => {
      if (!isSupabaseConfigured) return SEED_CASES;
      const { data, error } = await supabase.from('case_studies').select('*').order('created_at', { ascending: true });
      if (error) { 
        console.warn('DB Fetch Error (Cases), using fallback:', error.message);
        return SEED_CASES; 
      }
      return (data as unknown as CaseStudy[]) || [];
    },
    save: async (item: CaseStudy) => {
       if (!isSupabaseConfigured) return;
       if (item.id === 'new' || !item.id.includes('-')) {
         const { id, ...rest } = item;
         return await supabase.from('case_studies').insert([rest]);
       }
       return await supabase.from('case_studies').upsert([item]);
    }
  },
  team: {
    getAll: async (): Promise<TeamMember[]> => {
      if (!isSupabaseConfigured) return SEED_TEAM;
      const { data, error } = await supabase.from('team_members').select('*').order('created_at', { ascending: true });
      if (error) { 
        console.warn('DB Fetch Error (Team), using fallback:', error.message);
        return SEED_TEAM; 
      }
      return (data as unknown as TeamMember[]) || [];
    },
    save: async (item: TeamMember) => {
       if (!isSupabaseConfigured) return;
       if (item.id === 'new' || !item.id.includes('-')) {
         const { id, ...rest } = item;
         return await supabase.from('team_members').insert([rest]);
       }
       return await supabase.from('team_members').upsert([item]);
    }
  },
  settings: {
    get: async (): Promise<SiteSettings> => {
      if (!isSupabaseConfigured) return FALLBACK_SETTINGS;
      const { data, error } = await supabase.from('site_settings').select('*').single();
      if (error || !data) {
        return FALLBACK_SETTINGS; 
      }
      return {
         siteName: data.site_name,
         contactEmail: data.contact_email,
         contactPhone: data.contact_phone,
         address: data.address,
         socialLinks: data.social_links
      } as unknown as SiteSettings;
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
  }
};