import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { Menu, X, Globe, LayoutDashboard, LogOut, Instagram, Linkedin, Twitter, Facebook } from 'lucide-react';
import { db } from '../services/db';
import { supabase } from '../services/supabase';
import { SiteSettings, Service, Package } from '../types';
import * as Icons from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
  hideFooter?: boolean;
}

const DEFAULT_SETTINGS: Partial<SiteSettings> = {
    siteName: { ar: 'Tivro', en: 'Tivro' },
    contactEmail: '',
    contactPhone: '',
    socialLinks: []
};

export const Layout: React.FC<LayoutProps> = ({ children, hideFooter = false }) => {
  const { t, lang, setLang, isAdmin } = useApp();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [settings, setSettings] = useState<SiteSettings | any>(DEFAULT_SETTINGS);
  const [footerServices, setFooterServices] = useState<Service[]>([]);
  const [packages, setPackages] = useState<Package[]>([]);
  
  // State for navigation visibility and labels from admin panel
  const [navigationState, setNavigationState] = useState<any[]>([
    { key: 'services', visible: true },
    { key: 'team', visible: true },
    { key: 'packages', visible: true },
    { key: 'work', visible: true },
    { key: 'blog', visible: true }
  ]);
  
  const [navigationLabels, setNavigationLabels] = useState<any>({
    services: t('nav.services'),
    team: t('nav.team'),
    packages: lang === 'ar' ? 'الباقات' : 'Packages',
    work: t('nav.work'),
    blog: t('nav.blog')
  });

  useEffect(() => {
    const fetchData = async () => {
        try {
            const s = await db.settings.get();
            if (s) {
                setSettings(s);
                if (s.faviconUrl) {
                    const link = document.querySelector("link[rel~='icon']") as HTMLLinkElement || document.createElement('link');
                    link.type = 'image/x-icon';
                    link.rel = 'shortcut icon';
                    link.href = s.faviconUrl;
                    document.getElementsByTagName('head')[0].appendChild(link);
                }
            }
            const services = await db.services.getAll();
            setFooterServices(services.slice(0, 4));
            const packagesData = await db.packages.getAll();
            setPackages(packagesData);
        } catch(e) { console.error(e); }
    };
    
    // Load navigation state from admin panel
    const savedNavigation = localStorage.getItem('adminNavigation');
    if (savedNavigation) {
      try {
        const navigationItems = JSON.parse(savedNavigation);
        // Update visibility state
        const visibilityState = navigationItems.map((item: any) => ({
          key: item.key,
          visible: item.visible
        }));
        setNavigationState(visibilityState);
        
        // Update labels state
        const labelsState: any = {};
        navigationItems.forEach((item: any) => {
          labelsState[item.key] = item.label;
        });
        setNavigationLabels(labelsState);
      } catch (error) {
        console.error('Failed to load navigation state:', error);
      }
    }
    
    // Listen for admin navigation updates
    const handleAdminNavigationUpdate = (event: any) => {
      console.log(' [Layout] Admin navigation update detected:', event.detail);
      const { navigationItems } = event.detail;
      
      // Update visibility state
      const visibilityState = navigationItems.map((item: any) => ({
        key: item.key,
        visible: item.visible
      }));
      setNavigationState(visibilityState);
      
      // Update labels state
      const labelsState: any = {};
      navigationItems.forEach((item: any) => {
        labelsState[item.key] = item.label;
      });
      setNavigationLabels(labelsState);
    };

    // Listen for storage changes in navigation
    const handleStorageNavigationUpdate = (event: StorageEvent) => {
      if (event.key === 'adminNavigation' && event.newValue) {
        try {
          const navigationItems = JSON.parse(event.newValue);
          
          // Update visibility state
          const visibilityState = navigationItems.map((item: any) => ({
            key: item.key,
            visible: item.visible
          }));
          setNavigationState(visibilityState);
          
          // Update labels state
          const labelsState: any = {};
          navigationItems.forEach((item: any) => {
            labelsState[item.key] = item.label;
          });
          setNavigationLabels(labelsState);
        } catch (error) {
          console.error('Failed to parse navigation update:', error);
        }
      }
    };

    window.addEventListener('adminNavigationUpdated', handleAdminNavigationUpdate);
    window.addEventListener('storage', handleStorageNavigationUpdate);
    
    fetchData();
    
    return () => {
      window.removeEventListener('adminNavigationUpdated', handleAdminNavigationUpdate);
      window.removeEventListener('storage', handleStorageNavigationUpdate);
    };
  }, [lang]);

  const toggleLang = () => setLang(lang === 'ar' ? 'en' : 'ar');
  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.hash = '#';
    window.location.reload();
  };

  const NavLink = ({ href, label }: { href: string; label: string }) => (
    <a href={href} className="text-slate-600 hover:text-tivro-primary font-medium transition-colors duration-200 text-sm md:text-base" onClick={(e) => {
      if (href.startsWith('#')) {
        e.preventDefault();
        if (href === '#') {
          // Return to top of page
          window.scrollTo({ top: 0, behavior: 'smooth' });
        } else {
          const targetId = href.substring(1);
          const targetElement = document.getElementById(targetId);
          if (targetElement) {
            targetElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
          }
        }
        setIsMenuOpen(false);
      }
    }}>{label}</a>
  );

  const IconComponent = ({ name }: { name: string }) => {
    const Icon = (Icons as any)[name] || Icons.Link;
    return <Icon size={18} />;
  };

  return (
    <div className={`min-h-screen flex flex-col bg-white ${lang === 'ar' ? 'font-sans' : ''}`}>
      
      {/* Top Banner */}
      {settings?.topBanner?.enabled && (
          <div className="bg-tivro-dark text-white text-sm py-2 px-4 text-center relative z-[60]">
              <span className="font-medium">{settings.topBanner.title?.[lang]}</span>
              {settings.topBanner.link && (
                  <a href={settings.topBanner.link} className="ml-2 underline hover:text-tivro-primary">
                      {settings.topBanner.buttonText?.[lang] || (lang === 'ar' ? 'اضغط هنا' : 'Click here')}
                  </a>
              )}
          </div>
      )}

      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-slate-100 shadow-sm">
        <div className="container mx-auto px-4 md:px-8 h-20 flex items-center justify-between">
          <a href="#" className="flex items-center gap-2">
            {settings?.logoUrl ? (
                <img src={settings.logoUrl} alt="Logo" className="h-10 object-contain" />
            ) : (
                <div className="w-10 h-10 bg-tivro-dark rounded-lg flex items-center justify-center text-white font-bold text-xl">T</div>
            )}
            <div className="flex flex-col items-start">
              <span className="text-2xl font-bold text-tivro-dark tracking-tight leading-tight">{settings?.siteName?.[lang] || 'Tivro'}</span>
              <span className="text-xs text-slate-500 font-medium leading-none">لخدمات الأعمال</span>
            </div>
          </a>

          <nav className="hidden md:flex items-center gap-8">
            <NavLink href="#" label={t('nav.home')} />
            {navigationState.find(item => item.key === 'services')?.visible && <NavLink href="#services" label={navigationLabels.services || t('nav.services')} />}
            {packages.length > 0 && navigationState.find(item => item.key === 'packages')?.visible && <NavLink href="#packages" label={navigationLabels.packages || (lang === 'ar' ? 'الباقات' : 'Packages')} />}
            {navigationState.find(item => item.key === 'work')?.visible && <NavLink href="#work" label={navigationLabels.work || t('nav.work')} />}
            {navigationState.find(item => item.key === 'team')?.visible && <NavLink href="#team" label={navigationLabels.team || t('nav.team')} />}
            {navigationState.find(item => item.key === 'blog')?.visible && <NavLink href="#blog" label={navigationLabels.blog || t('nav.blog')} />}
          </nav>

          <div className="hidden md:flex items-center gap-4">
            <button onClick={toggleLang} className="flex items-center gap-1 text-slate-500 hover:text-tivro-primary transition">
              <Globe size={18} /> <span className="uppercase text-sm font-bold">{lang === 'ar' ? 'EN' : 'AR'}</span>
            </button>
            
            {isAdmin ? (
              <div className="flex items-center gap-2">
                <a href="#admin" className="btn-secondary flex items-center gap-2 px-4 py-2 rounded-full text-sm"><LayoutDashboard size={16} /> {t('admin.dashboard')}</a>
                <button onClick={handleLogout} className="text-red-500 p-2 hover:bg-red-50 rounded-full"><LogOut size={18} /></button>
              </div>
            ) : (
              <a href="#contact" className="bg-tivro-dark text-white px-6 py-2.5 rounded-full font-semibold hover:bg-slate-800 transition shadow-lg shadow-tivro-dark/20">{t('nav.contact')}</a>
            )}
          </div>

          <button className="md:hidden text-slate-700" onClick={() => setIsMenuOpen(!isMenuOpen)}>{isMenuOpen ? <X size={28} /> : <Menu size={28} />}</button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-grow">{children}</main>

      {/* Footer */}
      {!hideFooter && (
        <footer className="bg-tivro-dark text-white pt-16 pb-8">
          <div className="container mx-auto px-4 md:px-8">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
              <div className="col-span-1 md:col-span-2">
                <div className="flex items-center gap-2 mb-6">
                  {settings?.footerLogoUrl ? (
                      <img src={settings.footerLogoUrl} alt="Logo" className="h-12 object-contain" />
                  ) : (
                      <div className="w-8 h-8 bg-tivro-primary rounded flex items-center justify-center text-white font-bold">T</div>
                  )}
                  <span className="text-2xl font-bold">{settings?.siteName?.[lang]}</span>
                </div>
                <p className="text-slate-400 max-w-md leading-relaxed mb-6">
                  {settings?.footerDescription?.[lang] || (lang === 'ar' ? 'وكالة تسويق رقمي سعودية متكاملة.' : 'A full-service Saudi digital marketing agency.')}
                </p>
                <div className="flex gap-4">
                  {settings?.socialLinks?.map((link: any, i: number) => (
                      <a key={i} href={link.url} className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center hover:bg-tivro-primary transition">
                          <IconComponent name={link.platform} />
                      </a>
                  ))}
                </div>
              </div>
              
              <div>
                <h4 className="font-bold text-lg mb-6 text-tivro-primary">{t('nav.services')}</h4>
                <ul className="space-y-3 text-slate-400">
                  {footerServices.map(s => <li key={s.id}><a href="#services" className="hover:text-white transition">{s.title?.[lang]}</a></li>)}
                </ul>
              </div>

              <div>
                <h4 className="font-bold text-lg mb-6 text-tivro-primary">{t('nav.contact')}</h4>
                <ul className="space-y-3 text-slate-400">
                  <li>{settings?.contactPhone}</li>
                  <li>{settings?.contactEmail}</li>
                  <li>{settings?.address?.[lang]}</li>
                </ul>
              </div>
            </div>
            
            <div className="pt-8 border-t border-slate-800 flex flex-col md:flex-row justify-between items-center text-slate-500 text-sm">
              <p>{settings?.copyrightText?.[lang] || t('footer.rights')}</p>
              <div className="flex gap-6 mt-4 md:mt-0">
                <a href="#privacy" className="hover:text-white" onClick={(e) => {
                  e.preventDefault();
                  const targetElement = document.getElementById('privacy');
                  if (targetElement) {
                    targetElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
                  }
                }}>{settings?.footerLinks?.privacy?.[lang] || (lang === 'ar' ? 'سياسة الخصوصية' : 'Privacy Policy')}</a>
                <a href="#terms" className="hover:text-white" onClick={(e) => {
                  e.preventDefault();
                  const targetElement = document.getElementById('terms');
                  if (targetElement) {
                    targetElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
                  }
                }}>{settings?.footerLinks?.terms?.[lang] || (lang === 'ar' ? 'شروط الخدمة' : 'Terms of Service')}</a>
              </div>
            </div>
          </div>
        </footer>
      )}

      {/* Bottom Banner */}
      {settings?.bottomBanner?.enabled && (
          <div className="fixed bottom-0 w-full bg-tivro-primary text-white py-3 px-6 z-[60] shadow-lg flex justify-between items-center animate-fade-in-up" style={settings.bottomBanner.bgImage ? {backgroundImage: `url(${settings.bottomBanner.bgImage})`, backgroundSize: 'cover'} : {}}>
              <div>
                  <h4 className="font-bold">{settings.bottomBanner.title?.[lang]}</h4>
                  <p className="text-sm opacity-90">{settings.bottomBanner.subtitle?.[lang]}</p>
              </div>
              <button onClick={(e) => e.currentTarget.parentElement?.remove()} className="bg-white/20 hover:bg-white/30 p-1 rounded-full"><X size={16}/></button>
          </div>
      )}
    </div>
  );
};