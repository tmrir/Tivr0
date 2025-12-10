
import type { NextApiRequest, NextApiResponse } from 'next';
import { supabaseAdmin } from '../../utils/supabase-admin';

// Define Seed Data (Same as in db.ts but server-side)
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
  id: 1,
  site_name: { ar: 'تيفرو', en: 'Tivro' },
  contact_email: 'info@tivro.sa',
  contact_phone: '+966 50 000 0000',
  address: { ar: 'الرياض', en: 'Riyadh' },
  social_links: { twitter: '#', linkedin: '#', instagram: '#' }
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Security Check: Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  // Optional: Add secret header check here for extra security
  // if (req.headers['x-admin-secret'] !== process.env.ADMIN_SECRET) return res.status(401).json({ message: 'Unauthorized' });

  try {
    console.log('🌱 Starting Server-Side Seed...');

    // 1. Clear existing data (Optional - careful!)
    // await supabaseAdmin.from('services').delete().neq('id', '00000000-0000-0000-0000-000000000000'); 
    
    // 2. Seed Services
    const { error: servicesError } = await supabaseAdmin.from('services').insert(SEED_SERVICES);
    if (servicesError) throw new Error(`Services Seed Error: ${servicesError.message}`);

    // 3. Seed Packages
    const { error: packagesError } = await supabaseAdmin.from('packages').insert(SEED_PACKAGES);
    if (packagesError) throw new Error(`Packages Seed Error: ${packagesError.message}`);

    // 4. Seed Team
    const { error: teamError } = await supabaseAdmin.from('team_members').insert(SEED_TEAM);
    if (teamError) throw new Error(`Team Seed Error: ${teamError.message}`);

    // 5. Seed Cases
    const { error: casesError } = await supabaseAdmin.from('case_studies').insert(SEED_CASES);
    if (casesError) throw new Error(`Cases Seed Error: ${casesError.message}`);

    // 6. Seed Settings
    const { error: settingsError } = await supabaseAdmin.from('site_settings').upsert(DEFAULT_SETTINGS);
    if (settingsError) throw new Error(`Settings Seed Error: ${settingsError.message}`);

    console.log('✅ Seeding Completed Successfully');
    return res.status(200).json({ success: true, message: 'Database seeded successfully' });

  } catch (error: any) {
    console.error('❌ Seeding Failed:', error.message);
    return res.status(500).json({ success: false, error: error.message });
  }
}
