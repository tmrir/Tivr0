import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { Menu, X, Globe, LayoutDashboard, LogOut, Instagram, Linkedin, Twitter, Facebook } from 'lucide-react';
import { db } from '../services/db';
import { supabase } from '../services/supabase';
import { SiteSettings, Service } from '../types';
import * as Icons from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
  hideFooter?: boolean;
}

// Minimal default to prevent crash
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

  useEffect(() => {
    const fetchData = async () => {
        try {
            const s = await db.settings.get();
            if (s) {
                setSettings(s);
                // Update Favicon if exists
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
        } catch(e) { console.error(e); }
    };
    fetchData();
  }, []);

  const toggleLang = () => setLang(lang === 'ar' ? 'en' : 'ar');
  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.hash = '#';
    window.location.reload();
  };

  const NavLink = ({ href, label }: { href: string; label: string }) => (
    <a href={href} className="text-slate-600 hover:text-tivro-primary font-medium transition-colors duration-200 text-sm md:text-base" onClick={() => setIsMenuOpen(false)}>{label}</a>
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
            <span className="text-2xl font-bold text-tivro-dark tracking-tight">{settings?.siteName?.[lang] || 'Tivro'}</span>
          </a>

          <nav className="hidden md:flex items-center gap-8">
            <NavLink href="#" label={t('nav.home')} />
            <NavLink href="#services" label={t('nav.services')} />
            <NavLink href="#work" label={t('nav.work')} />
            <NavLink href="#team" label={t('nav.team')} />
            <NavLink href="#blog" label={t('nav.blog')} />
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

        {isMenuOpen && (
          <div className="md:hidden absolute top-20 left-0 w-full bg-white border-b border-slate-100 p-6 shadow-xl flex flex-col gap-6 animate-fade-in">
            <NavLink href="#" label={t('nav.home')} />
            <NavLink href="#services" label={t('nav.services')} />
            <NavLink href="#work" label={t('nav.work')} />
            <NavLink href="#team" label={t('nav.team')} />
            <NavLink href="#blog" label={t('nav.blog')} />
            <div className="h-px bg-slate-100 my-2"></div>
            <div className="flex justify-between items-center">
               <button onClick={toggleLang} className="flex items-center gap-2 font-bold text-slate-600"><Globe size={20} /> {lang === 'ar' ? 'English' : 'العربية'}</button>
               {isAdmin && <a href="#admin" className="text-tivro-primary font-bold flex gap-2 items-center"><LayoutDashboard size={20}/> Admin</a>}
            </div>
          </div>
        )}
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
                  {lang === 'ar' ? 'وكالة تسويق رقمي سعودية متكاملة.' : 'A full-service Saudi digital marketing agency.'}
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
              <p>{t('footer.rights')}</p>
              <div className="flex gap-6 mt-4 md:mt-0">
                <a href="#privacy" className="hover:text-white">{t('nav.privacy')}</a>
                <a href="#terms" className="hover:text-white">{t('nav.terms')}</a>
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