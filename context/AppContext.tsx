
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Language, Translations } from '../types';
import { supabase } from '../services/supabase';

interface AppContextProps {
  lang: Language;
  setLang: (lang: Language) => void;
  t: (key: string) => string;
  dir: 'rtl' | 'ltr';
  isAdmin: boolean;
  loading: boolean;
}

const TRANSLATIONS: Translations = {
  // Nav & Public
  'nav.home': { ar: 'الرئيسية', en: 'Home' },
  'nav.services': { ar: 'خدماتنا', en: 'Services' },
  'nav.work': { ar: 'أعمالنا', en: 'Our Work' },
  'nav.team': { ar: 'الفريق', en: 'Team' },
  'nav.blog': { ar: 'المدونة', en: 'Blog' },
  'nav.contact': { ar: 'تواصل معنا', en: 'Contact' },
  'hero.title': { ar: 'شريكك الاستراتيجي للنمو الرقمي', en: 'Your Strategic Partner for Digital Growth' },
  'hero.subtitle': { ar: 'نحول الأفكار إلى أرقام، ونقود علامتك التجارية نحو الصدارة في السوق السعودي.', en: 'We turn ideas into numbers, leading your brand to the forefront of the Saudi market.' },
  'cta.start': { ar: 'ابدأ رحلة النمو', en: 'Start Growth Journey' },
  'section.services': { ar: 'خدمات نصنع بها الفرق', en: 'Services That Make a Difference' },
  'section.work': { ar: 'قصص نجاح نفخر بها', en: 'Success Stories We Are Proud Of' },
  'section.team': { ar: 'عقول تيفرو', en: 'Tivro Minds' },
  'footer.rights': { ar: 'جميع الحقوق محفوظة لشركة تيفرو © 2024', en: 'All rights reserved Tivro © 2024' },
  
  // Admin Auth
  'admin.login': { ar: 'دخول المشرفين', en: 'Admin Login' },
  'admin.dashboard': { ar: 'لوحة التحكم', en: 'Dashboard' },
  'admin.logout': { ar: 'تسجيل خروج', en: 'Logout' },
  'admin.login.email': { ar: 'البريد الإلكتروني', en: 'Email' },
  'admin.login.password': { ar: 'كلمة المرور', en: 'Password' },
  'admin.login.btn': { ar: 'دخول', en: 'Login' },

  // Admin Sidebar
  'admin.menu.main': { ar: 'القائمة الرئيسية', en: 'Main Menu' },
  'admin.tab.dashboard': { ar: 'نظرة عامة', en: 'Overview' },
  'admin.tab.services': { ar: 'الخدمات', en: 'Services' },
  'admin.tab.team': { ar: 'الفريق', en: 'Team' },
  'admin.tab.packages': { ar: 'الباقات', en: 'Packages' },
  'admin.tab.work': { ar: 'أعمالنا', en: 'Case Studies' },
  'admin.tab.blog': { ar: 'المدونة', en: 'Blog' },
  'admin.tab.messages': { ar: 'رسائل التواصل', en: 'Contact Messages' },
  'admin.tab.settings': { ar: 'الإعدادات', en: 'Settings' },

  // Admin Dashboard
  'admin.dash.active_services': { ar: 'الخدمات المفعلة', en: 'Active Services' },
  'admin.dash.team_members': { ar: 'أعضاء الفريق', en: 'Team Members' },
  'admin.dash.case_studies': { ar: 'دراسات الحالة', en: 'Case Studies' },
  'admin.dash.packages': { ar: 'باقات الأسعار', en: 'Packages' },
  'admin.dash.info': { ar: 'معلومات النظام', en: 'System Info' },
  'admin.dash.connected': { ar: 'متصل بقاعدة البيانات. استخدم القوائم الجانبية لإدارة المحتوى.', en: 'Connected to Database. Use sidebar to manage content.' },

  // Admin Common Actions
  'admin.btn.add': { ar: 'إضافة جديد', en: 'Add New' },
  'admin.btn.save': { ar: 'حفظ التغييرات', en: 'Save Changes' },
  'admin.btn.cancel': { ar: 'إلغاء', en: 'Cancel' },
  'admin.btn.delete': { ar: 'حذف', en: 'Delete' },
  'admin.btn.edit': { ar: 'تعديل', en: 'Edit' },
  'admin.confirm': { ar: 'هل أنت متأكد؟', en: 'Are you sure?' },
  'admin.loading': { ar: 'جاري التحميل...', en: 'Loading...' },
  'admin.empty': { ar: 'لا توجد بيانات.', en: 'No data found.' },

  // Admin Forms
  'admin.form.title_ar': { ar: 'العنوان (عربي)', en: 'Title (Arabic)' },
  'admin.form.title_en': { ar: 'العنوان (إنجليزي)', en: 'Title (English)' },
  'admin.form.desc_ar': { ar: 'الوصف (عربي)', en: 'Description (Arabic)' },
  'admin.form.desc_en': { ar: 'الوصف (إنجليزي)', en: 'Description (English)' },
  'admin.form.content_ar': { ar: 'المحتوى (عربي)', en: 'Content (Arabic)' },
  'admin.form.content_en': { ar: 'المحتوى (إنجليزي)', en: 'Content (English)' },
  'admin.form.excerpt_ar': { ar: 'مقتطف (عربي)', en: 'Excerpt (Arabic)' },
  'admin.form.excerpt_en': { ar: 'مقتطف (إنجليزي)', en: 'Excerpt (English)' },
  'admin.form.author': { ar: 'الكاتب', en: 'Author' },
  'admin.form.date': { ar: 'التاريخ', en: 'Date' },
  'admin.form.name_ar': { ar: 'الاسم (عربي)', en: 'Name (Arabic)' },
  'admin.form.name_en': { ar: 'الاسم (إنجليزي)', en: 'Name (English)' },
  'admin.form.role_ar': { ar: 'المسمى الوظيفي (عربي)', en: 'Role (Arabic)' },
  'admin.form.role_en': { ar: 'المسمى الوظيفي (إنجليزي)', en: 'Role (English)' },
  'admin.form.price': { ar: 'السعر', en: 'Price' },
  'admin.form.popular': { ar: 'تمييز كباقة شائعة؟', en: 'Mark as Popular?' },
  'admin.form.client': { ar: 'اسم العميل', en: 'Client Name' },
  'admin.form.category_ar': { ar: 'التصنيف (عربي)', en: 'Category (Arabic)' },
  'admin.form.category_en': { ar: 'التصنيف (إنجليزي)', en: 'Category (English)' },
  'admin.form.image': { ar: 'رابط الصورة', en: 'Image URL' },
  'admin.form.icon': { ar: 'اسم الأيقونة (Lucide)', en: 'Icon Name (Lucide)' },
  'admin.messages.name': { ar: 'الاسم', en: 'Name' },
  'admin.messages.phone': { ar: 'الجوال', en: 'Phone' },
  'admin.messages.date': { ar: 'التاريخ', en: 'Date' },

  // Admin Settings & Seed
  'admin.settings.general': { ar: 'الإعدادات العامة', en: 'General Settings' },
  'admin.settings.contact': { ar: 'بيانات التواصل', en: 'Contact Info' },
  'admin.settings.social': { ar: 'التواصل الاجتماعي', en: 'Social Media' },
  'admin.settings.sections': { ar: 'نصوص الأقسام', en: 'Section Texts' },
  'admin.settings.db': { ar: 'إجراءات قاعدة البيانات', en: 'Database Actions' },
  'admin.seed.desc': { ar: 'إذا كانت قاعدة البيانات فارغة، يمكنك استعادة المحتوى الافتراضي بضغطة زر.', en: 'If database is empty, you can restore default content with one click.' },
  'admin.seed.btn': { ar: 'استعادة البيانات الافتراضية', en: 'Reset & Seed Database' },
  'admin.seed.warning': { ar: 'سيتم إضافة البيانات الافتراضية إلى قاعدة البيانات. هل تود الاستمرار؟', en: 'Default data will be added to DB. Continue?' },
  'admin.seed.success': { ar: 'تمت الاستعادة بنجاح! جاري التحديث...', en: 'Seeding successful! Refreshing...' },
  'admin.settings.saved': { ar: 'تم حفظ الإعدادات بنجاح.', en: 'Settings saved successfully.' },

  // Settings Fields
  'admin.set.email': { ar: 'البريد الإلكتروني', en: 'Contact Email' },
  'admin.set.phone': { ar: 'رقم الهاتف', en: 'Phone Number' },
  'admin.set.address_ar': { ar: 'العنوان (عربي)', en: 'Address (Arabic)' },
  'admin.set.address_en': { ar: 'العنوان (إنجليزي)', en: 'Address (English)' },
  'admin.set.work_title_ar': { ar: 'عنوان "أعمالنا" (عربي)', en: 'Work Title (Arabic)' },
  'admin.set.work_title_en': { ar: 'عنوان "أعمالنا" (إنجليزي)', en: 'Work Title (English)' },
  'admin.set.work_sub_ar': { ar: 'وصف "أعمالنا" (عربي)', en: 'Work Subtitle (Arabic)' },
  'admin.set.work_sub_en': { ar: 'وصف "أعمالنا" (إنجليزي)', en: 'Work Subtitle (English)' },
  'admin.social.platform': { ar: 'اسم المنصة (لأيقونة Lucide)', en: 'Platform Name (for Lucide Icon)' },
  'admin.social.url': { ar: 'الرابط', en: 'URL' },
  'admin.social.add': { ar: 'إضافة منصة', en: 'Add Platform' },
  'admin.section.settings': { ar: 'إعدادات القسم', en: 'Section Settings' },
};

const AppContext = createContext<AppContextProps | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [lang, setLangState] = useState<Language>('ar');
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const savedLang = (localStorage.getItem('tivro_lang') as Language) || 'ar';
    setLangState(savedLang);
    document.documentElement.dir = savedLang === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = savedLang;

    // Add timeout to prevent infinite loading - reduced to 2 seconds
    const loadingTimeout = setTimeout(() => {
      console.log('⏰ Loading timeout reached, forcing loading to false');
      setLoading(false);
    }, 2000);

    supabase.auth.getSession().then(({ data: { session } }) => {
      clearTimeout(loadingTimeout);
      console.log('🔐 Auth session retrieved:', !!session);
      setIsAdmin(!!session);
      setLoading(false);
    }).catch((error) => {
      console.error('❌ Auth session error:', error);
      clearTimeout(loadingTimeout);
      setLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      console.log('🔄 Auth state changed:', !!session);
      setIsAdmin(!!session);
    });

    return () => {
      clearTimeout(loadingTimeout);
      subscription.unsubscribe();
    };
  }, []);

  const setLang = (l: Language) => {
    setLangState(l);
    localStorage.setItem('tivro_lang', l);
    document.documentElement.dir = l === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = l;
  };

  const t = (key: string): string => {
    return TRANSLATIONS[key]?.[lang] || key;
  };

  const dir = lang === 'ar' ? 'rtl' : 'ltr';

  return (
    <AppContext.Provider value={{ lang, setLang, t, dir, isAdmin, loading }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within AppProvider');
  return context;
};
