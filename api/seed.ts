
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { supabaseAdmin } from './utils/supabaseAdmin';

// Seed Data Content
const SEED_DATA = {
  services: [
    { title: { ar: 'تحسين محركات البحث', en: 'SEO Optimization' }, description: { ar: 'نساعدك في تصدر نتائج البحث.', en: 'Rank higher in search results.' }, icon_name: 'Search', features: [{ ar: 'تحليل', en: 'Analysis' }] },
    { title: { ar: 'إدارة حملات إعلانية', en: 'PPC Campaigns' }, description: { ar: 'حملات مدفوعة عالية العائد.', en: 'High ROI paid campaigns.' }, icon_name: 'BarChart', features: [{ ar: 'استهداف', en: 'Targeting' }] },
    { title: { ar: 'إدارة التواصل', en: 'Social Media' }, description: { ar: 'بناء مجتمع متفاعل.', en: 'Building engaged communities.' }, icon_name: 'Share2', features: [{ ar: 'محتوى', en: 'Content' }] },
    { title: { ar: 'تطوير الويب', en: 'Web Dev' }, description: { ar: 'مواقع سريعة ومتجاوبة.', en: 'Fast responsive websites.' }, icon_name: 'Code', features: [{ ar: 'تصميم', en: 'Design' }] }
  ],
  packages: [
    { name: { ar: 'انطلاق', en: 'Startup' }, price: '2,500 SAR', features: [{ ar: 'منصة واحدة', en: '1 Platform' }], is_popular: false },
    { name: { ar: 'نمو', en: 'Growth' }, price: '5,000 SAR', features: [{ ar: '3 منصات', en: '3 Platforms' }], is_popular: true },
    { name: { ar: 'احتراف', en: 'Pro' }, price: '9,500 SAR', features: [{ ar: 'شامل', en: 'All Inclusive' }], is_popular: false }
  ],
  team: [
    { name: { ar: 'سارة أحمد', en: 'Sara Ahmed' }, role: { ar: 'مديرة تسويق', en: 'Marketing Mgr' }, image: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400', linkedin: '#' },
    { name: { ar: 'خالد الدوسري', en: 'Khaled Al' }, role: { ar: 'خبير SEO', en: 'SEO Expert' }, image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400', linkedin: '#' },
    { name: { ar: 'نورة العتيبي', en: 'Noura Al' }, role: { ar: 'مصممة', en: 'Designer' }, image: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=400', linkedin: '#' }
  ],
  cases: [
    { client: 'TechStore', title: { ar: 'زيادة 200%', en: '200% Growth' }, category: { ar: 'تجارة', en: 'E-Com' }, result: { ar: 'تحسين التحويل', en: 'CRO' }, image: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800', stats: [{ label: { ar: 'ROI', en: 'ROI' }, value: '5x' }] },
    { client: 'HealthApp', title: { ar: 'إطلاق تطبيق', en: 'App Launch' }, category: { ar: 'تطبيق', en: 'App' }, result: { ar: 'مليون تحميل', en: '1M Downloads' }, image: 'https://images.unsplash.com/photo-1556761175-5973dc0f32e7?w=800', stats: [{ label: { ar: 'Users', en: 'Users' }, value: '1M' }] }
  ],
  blog: [
    { title: { ar: '5 نصائح للتسويق في رمضان', en: '5 Tips for Ramadan Marketing' }, excerpt: { ar: 'كيف تستعد لموسم رمضان وتحقق أعلى المبيعات.', en: 'How to prepare for Ramadan season.' }, content: { ar: 'التفاصيل الكاملة هنا...', en: 'Full details here...' }, image: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800', author: 'Admin', date: '2024-03-01' }
  ],
  settings: {
    id: 1,
    site_name: { ar: 'تيفرو', en: 'Tivro' },
    contact_email: 'info@tivro.sa',
    contact_phone: '+966 50 000 0000',
    address: { ar: 'الرياض', en: 'Riyadh' },
    social_links: { twitter: '#', linkedin: '#', instagram: '#' }
  }
};

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    console.log('🌱 Starting Server-Side Seed...');
    
    const { error: err1 } = await supabaseAdmin.from('services').upsert(SEED_DATA.services, { onConflict: 'title' });
    const { error: err2 } = await supabaseAdmin.from('packages').upsert(SEED_DATA.packages, { onConflict: 'name' });
    const { error: err3 } = await supabaseAdmin.from('team_members').upsert(SEED_DATA.team, { onConflict: 'name' });
    const { error: err4 } = await supabaseAdmin.from('case_studies').upsert(SEED_DATA.cases, { onConflict: 'client' });
    // Blog posts seed - no conflict constraint usually on title, but simple insert is okay for seed
    const { error: err5 } = await supabaseAdmin.from('blog_posts').insert(SEED_DATA.blog); 
    const { error: err6 } = await supabaseAdmin.from('site_settings').upsert(SEED_DATA.settings);

    if (err1 || err2 || err3 || err4 || err5 || err6) {
        return res.status(500).json({ 
            success: false, 
            message: 'Partial failure in seeding.', 
            errors: { services: err1, packages: err2, team: err3, cases: err4, blog: err5, settings: err6 } 
        });
    }

    return res.status(200).json({ success: true, message: 'Database seeded successfully with Service Role.' });
  } catch (error: any) {
    console.error('❌ Seed Fatal Error:', error);
    return res.status(500).json({ success: false, error: error.message });
  }
}
