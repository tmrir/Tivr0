import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Language, Translations } from '../types';

interface AppContextProps {
  lang: Language;
  setLang: (lang: Language) => void;
  t: (key: string) => string;
  dir: 'rtl' | 'ltr';
  isAdmin: boolean;
  login: () => void;
  logout: () => void;
}

const TRANSLATIONS: Translations = {
  'nav.home': { ar: 'الرئيسية', en: 'Home' },
  'nav.services': { ar: 'خدماتنا', en: 'Services' },
  'nav.work': { ar: 'أعمالنا', en: 'Our Work' },
  'nav.team': { ar: 'الفريق', en: 'Team' },
  'nav.blog': { ar: 'المدونة', en: 'Blog' },
  'nav.contact': { ar: 'تواصل معنا', en: 'Contact' },
  'hero.title': { ar: 'شريكك الاستراتيجي للنمو الرقمي', en: 'Your Strategic Partner for Digital Growth' },
  'hero.subtitle': { ar: 'نحول الأفكار إلى أرقام، ونقود علامتك التجارية نحو الصدارة في السوق السعودي.', en: 'We turn ideas into numbers, leading your brand to the forefront of the Saudi market.' },
  'cta.start': { ar: 'ابدأ رحلة النمو', en: 'Start Growth Journey' },
  'cta.contact': { ar: 'احجز استشارة مجانية', en: 'Book Free Consultation' },
  'section.services': { ar: 'خدمات نصنع بها الفرق', en: 'Services That Make a Difference' },
  'section.work': { ar: 'قصص نجاح نفخر بها', en: 'Success Stories We Are Proud Of' },
  'section.team': { ar: 'عقول تيفرو', en: 'Tivro Minds' },
  'footer.rights': { ar: 'جميع الحقوق محفوظة لشركة تيفرو © 2024', en: 'All rights reserved Tivro © 2024' },
  'admin.dashboard': { ar: 'لوحة التحكم', en: 'Dashboard' },
  'admin.login': { ar: 'دخول المشرفين', en: 'Admin Login' },
  'admin.logout': { ar: 'تسجيل خروج', en: 'Logout' },
};

const AppContext = createContext<AppContextProps | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [lang, setLangState] = useState<Language>('ar');
  const [isAdmin, setIsAdmin] = useState<boolean>(false);

  useEffect(() => {
    const savedLang = localStorage.getItem('tivro_lang') as Language;
    if (savedLang) setLangState(savedLang);
    
    const auth = localStorage.getItem('tivro_auth');
    if (auth === 'true') setIsAdmin(true);
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

  const login = () => {
    setIsAdmin(true);
    localStorage.setItem('tivro_auth', 'true');
  };

  const logout = () => {
    setIsAdmin(false);
    localStorage.removeItem('tivro_auth');
  };

  const dir = lang === 'ar' ? 'rtl' : 'ltr';

  return (
    <AppContext.Provider value={{ lang, setLang, t, dir, isAdmin, login, logout }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within AppProvider');
  return context;
};