import { BrandAsset } from '../types';

export const INITIAL_TEMPLATES: BrandAsset[] = [
    // 1. Site Header Logo
    {
        id: 'site_logo',
        name: { ar: 'شعار الموقع (الرئيسي)', en: 'Site Header Logo' },
        type: 'logo',
        width: 200,
        height: 60,
        elements: [
            { id: 'l1', type: 'shape', x: 0, y: 10, content: 'rect', style: { width: '40px', height: '40px', backgroundColor: '#059669', borderRadius: '8px' } },
            { id: 'l2', type: 'text', x: 50, y: 15, content: 'Tivro', style: { fontSize: '24px', fontWeight: 'bold', color: '#0f172a', fontFamily: 'Cairo' } },
            { id: 'l3', type: 'icon', x: 8, y: 18, content: 'TrendingUp', style: { color: 'white', width: '24px', height: '24px' } }
        ]
    },
    // 2. Footer Logo
    {
        id: 'footer_logo',
        name: { ar: 'شعار الفوتر (داكن)', en: 'Footer Logo' },
        type: 'logo',
        width: 200,
        height: 60,
        elements: [
            { id: 'fl1', type: 'shape', x: 0, y: 10, content: 'rect', style: { width: '40px', height: '40px', backgroundColor: '#059669', borderRadius: '8px' } },
            { id: 'fl2', type: 'text', x: 50, y: 15, content: 'Tivro', style: { fontSize: '24px', fontWeight: 'bold', color: '#ffffff', fontFamily: 'Cairo' } },
            { id: 'fl3', type: 'icon', x: 8, y: 18, content: 'TrendingUp', style: { color: 'white', width: '24px', height: '24px' } }
        ]
    },
    // 3. Favicon
    {
        id: 'favicon',
        name: { ar: 'أيقونة المتصفح (Favicon)', en: 'Favicon' },
        type: 'favicon',
        width: 32,
        height: 32,
        elements: [
            { id: 'f1', type: 'shape', x: 0, y: 0, content: 'rect', style: { width: '32px', height: '32px', backgroundColor: '#059669', borderRadius: '4px' } },
            { id: 'f2', type: 'text', x: 8, y: 4, content: 'T', style: { fontSize: '20px', fontWeight: 'bold', color: '#ffffff', fontFamily: 'sans-serif' } }
        ]
    },
    // 4. App Icon
    {
        id: 'app_icon',
        name: { ar: 'أيقونة التطبيق', en: 'App Icon' },
        type: 'app_icon',
        width: 512,
        height: 512,
        elements: [
             { id: 'a1', type: 'shape', x: 0, y: 0, content: 'rect', style: { width: '512px', height: '512px', backgroundColor: '#0f172a' } },
             { id: 'a2', type: 'shape', x: 128, y: 128, content: 'rect', style: { width: '256px', height: '256px', backgroundColor: '#059669', borderRadius: '40px' } },
             { id: 'a3', type: 'icon', x: 156, y: 156, content: 'TrendingUp', style: { width: '200px', height: '200px', color: '#ffffff' } }
        ]
    },
    // 5. Social Media Ads
    {
        id: 'social_ad_1',
        name: { ar: 'إعلان انستقرام (مربع)', en: 'Instagram Ad (Square)' },
        type: 'social_ad',
        width: 1080,
        height: 1080,
        elements: [
            { id: 's1', type: 'image', x: 0, y: 0, content: 'https://images.unsplash.com/photo-1557804506-669a67965ba0?w=1080', style: { width: '1080px', height: '1080px', opacity: 0.8 } },
            { id: 's2', type: 'shape', x: 100, y: 100, content: 'rect', style: { width: '880px', height: '880px', border: '10px solid white', backgroundColor: 'transparent' } },
            { id: 's3', type: 'text', x: 150, y: 400, content: 'BIG SALE', style: { fontSize: '120px', fontWeight: '900', color: '#ffffff', textShadow: '0 4px 20px rgba(0,0,0,0.5)' } },
            { id: 's4', type: 'text', x: 150, y: 550, content: '50% OFF', style: { fontSize: '80px', fontWeight: 'bold', color: '#f97316' } },
            { id: 's5', type: 'icon', x: 800, y: 800, content: 'ShoppingBag', style: { width: '100px', height: '100px', color: 'white' } }
        ]
    },
    // 6. Poster
    {
        id: 'poster_1',
        name: { ar: 'بوستر إعلاني (عمودي)', en: 'Vertical Poster' },
        type: 'poster',
        width: 1080,
        height: 1920,
        elements: [
            { id: 'p1', type: 'shape', x: 0, y: 0, content: 'rect', style: { width: '1080px', height: '1920px', backgroundColor: '#0f172a' } },
            { id: 'p2', type: 'text', x: 100, y: 200, content: 'FUTURE', style: { fontSize: '150px', fontWeight: 'bold', color: '#ffffff', letterSpacing: '10px' } },
            { id: 'p3', type: 'text', x: 100, y: 350, content: 'MARKETING', style: { fontSize: '100px', fontWeight: '300', color: '#059669' } },
            { id: 'p4', type: 'icon', x: 440, y: 800, content: 'Zap', style: { width: '200px', height: '200px', color: '#f97316' } }
        ]
    },
    // 7. Profile Picture
    {
        id: 'profile_pic',
        name: { ar: 'صورة البروفايل (موحدة)', en: 'Unified Profile Pic' },
        type: 'profile_pic',
        width: 400,
        height: 400,
        elements: [
            { id: 'pp1', type: 'shape', x: 0, y: 0, content: 'circle', style: { width: '400px', height: '400px', backgroundColor: '#f8fafc', borderRadius: '50%' } },
            { id: 'pp2', type: 'image', x: 50, y: 50, content: '', style: { width: '300px', height: '300px', objectFit: 'contain' } }
        ]
    },
    // 8. Stationery (Tag)
    {
        id: 'stationery_tag',
        name: { ar: 'بطاقة عمل (Tag)', en: 'Business Tag' },
        type: 'stationery',
        width: 300,
        height: 500,
        elements: [
            { id: 'st1', type: 'shape', x: 0, y: 0, content: 'rect', style: { width: '300px', height: '500px', backgroundColor: '#ffffff', border: '1px solid #e2e8f0' } },
            { id: 'st2', type: 'text', x: 50, y: 100, content: 'Tivro', style: { fontSize: '40px', fontWeight: 'bold', color: '#0f172a', textAlign: 'center' } },
            { id: 'st3', type: 'text', x: 70, y: 400, content: 'SCAN ME', style: { fontSize: '20px', color: '#64748b' } },
            { id: 'st4', type: 'icon', x: 125, y: 200, content: 'QrCode', style: { width: '50px', height: '50px', color: '#000' } }
        ]
    }
];