import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { Menu, X, Globe, LayoutDashboard, LogOut, Instagram, Linkedin, Twitter, Facebook } from 'lucide-react';
import { db } from '../services/db';
import { supabase } from '../services/supabase';
import { SiteSettings, Service, Package } from '../types';
import * as Icons from 'lucide-react';
import { ZeigarnikRing } from './ZeigarnikRing';

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
  const [settings, setSettings] = useState<SiteSettings | null>(null);
  const [settingsReady, setSettingsReady] = useState(false);
  const [footerServices, setFooterServices] = useState<Service[]>([]);
  const [packages, setPackages] = useState<Package[]>([]);
  const [navigationPages, setNavigationPages] = useState<any[]>([]);

  const [isMobileViewport, setIsMobileViewport] = useState(false);

  const [mobileIndicatorProgress, setMobileIndicatorProgress] = useState(0.72);
  const [mobileIndicatorVisible, setMobileIndicatorVisible] = useState(true);
  const [mobileIndicatorStyle, setMobileIndicatorStyle] = useState<React.CSSProperties>({
    left: '50%',
    bottom: 18,
    transform: 'translateX(-50%)',
    opacity: 0.34
  });

  const hasArabicChars = (value: string) => /[\u0600-\u06FF]/.test(value);
  const resolveNavLabel = (label: any, fallback: string) => {
    if (!label) return fallback;
    if (typeof label === 'object' && (label.ar || label.en)) {
      return (label?.[lang] || label.ar || label.en || fallback) as string;
    }
    if (typeof label === 'string') {
      if (lang === 'en' && hasArabicChars(label)) return fallback;
      return label;
    }
    return fallback;
  };
  
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
    packages: t('admin.tab.packages'),
    work: t('nav.work'),
    blog: t('nav.blog')
  });

  useEffect(() => {
    const fetchData = async () => {
        try {
            const services = await db.services.getAll();
            setFooterServices(services.slice(0, 4));
            const packagesData = await db.packages.getAll();
            setPackages(packagesData);
        } catch(e) { console.error(e); }
    };

    const applyAdminNavigation = (items: any[]) => {
      const visibilityState = items.map((item: any) => ({
        key: item.key,
        visible: item.visible
      }));
      setNavigationState(visibilityState);

      const labelsState: any = {};
      items.forEach((item: any) => {
        labelsState[item.key] = item.label;
      });
      setNavigationLabels(labelsState);
    };

    const loadAdminNavigation = async () => {
      try {
        const settings = await db.settings.get();
        const fromDb = (settings as any)?.adminNavigation;
        if (Array.isArray(fromDb) && fromDb.length > 0) {
          applyAdminNavigation(fromDb);
          try {
            localStorage.setItem('adminNavigation', JSON.stringify(fromDb));
          } catch {
            // ignore cache errors
          }
        }
      } catch {
        // ignore and fallback
      }
    };
    
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
          if (Array.isArray(navigationItems)) {
            applyAdminNavigation(navigationItems);
          }
        } catch (error) {
          console.error('Failed to parse navigation update:', error);
        }
      }
    };

    const loadSettingsAndNav = async () => {
      try {
        const s = await db.settings.get();
        if (s) {
          setSettings(s);
          if (s.faviconUrl) {
            const link = (document.querySelector("link[rel~='icon']") as HTMLLinkElement) || document.createElement('link');
            link.type = 'image/x-icon';
            link.rel = 'shortcut icon';
            link.href = s.faviconUrl;
            document.getElementsByTagName('head')[0].appendChild(link);
          }

          const fromDb = (s as any)?.adminNavigation;
          if (Array.isArray(fromDb) && fromDb.length > 0) {
            applyAdminNavigation(fromDb);
            try {
              localStorage.setItem('adminNavigation', JSON.stringify(fromDb));
            } catch {
              // ignore cache errors
            }
          }

          const pages = (s as any)?.customPages;
          if (Array.isArray(pages)) {
            const navPages = (pages as any[]).filter((p: any) => !!p && p.showInNavigation);
            setNavigationPages(navPages);
            try {
              localStorage.setItem('navigationPages', JSON.stringify(navPages));
            } catch {
              // ignore cache failures
            }
          } else {
            setNavigationPages([]);
          }
        }
      } catch {
        setNavigationPages([]);
      } finally {
        setSettingsReady(true);
      }
    };

    const handleCustomPagesUpdated = () => {
      loadSettingsAndNav();
    };

    window.addEventListener('adminNavigationUpdated', handleAdminNavigationUpdate);
    window.addEventListener('storage', handleStorageNavigationUpdate);

    loadSettingsAndNav();
    window.addEventListener('customPagesUpdated', handleCustomPagesUpdated as EventListener);
    
    fetchData();
    
    return () => {
      window.removeEventListener('adminNavigationUpdated', handleAdminNavigationUpdate);
      window.removeEventListener('storage', handleStorageNavigationUpdate);
      window.removeEventListener('customPagesUpdated', handleCustomPagesUpdated as EventListener);
    };
  }, [lang]);

  useEffect(() => {
    const mql = window.matchMedia('(max-width: 768px)');
    let sectionObserver: IntersectionObserver | null = null;
    let anchorObserver: IntersectionObserver | null = null;
    let handoffTimeout: number | null = null;
    let anchorRetryTimeout: number | null = null;
    let destroyed = false;

    const cleanup = () => {
      if (sectionObserver) sectionObserver.disconnect();
      if (anchorObserver) anchorObserver.disconnect();
      if (handoffTimeout) window.clearTimeout(handoffTimeout);
      if (anchorRetryTimeout) window.clearTimeout(anchorRetryTimeout);
      sectionObserver = null;
      anchorObserver = null;
      handoffTimeout = null;
      anchorRetryTimeout = null;
    };

    const resetIndicatorBase = () => {
      setMobileIndicatorStyle({
        left: '50%',
        bottom: 18,
        top: 'auto',
        transform: 'translateX(-50%)',
        opacity: 0.34,
        transition: 'none'
      });
    };

    const init = () => {
      cleanup();
      if (!mql.matches) {
        setIsMobileViewport(false);
        setMobileIndicatorVisible(false);
        return;
      }

      setIsMobileViewport(true);

      resetIndicatorBase();
      setMobileIndicatorVisible(true);

      const baseIds = ['services', 'packages', 'work', 'team', 'blog'];
      const customIds = (navigationPages || [])
        .filter((p: any) => !!p && !!p.slug)
        .map((p: any) => `page-${p.slug}`);
      const sectionIds = [...baseIds, ...customIds, 'contact'];

      const observed: HTMLElement[] = sectionIds
        .map((id) => document.getElementById(id))
        .filter(Boolean) as HTMLElement[];

      if (observed.length > 0) {
        const total = observed.length;
        const range = 0.22;

        const setStep = (i: number) => {
          const clamped = Math.max(0, Math.min(total - 1, i));
          const pct = total <= 1 ? 0 : clamped / (total - 1);
          setMobileIndicatorProgress(0.72 + pct * range);
        };

        sectionObserver = new IntersectionObserver(
          (entries) => {
            const visibleEntries = entries
              .filter((e) => e.isIntersecting)
              .sort((a, b) => (a.boundingClientRect.top || 0) - (b.boundingClientRect.top || 0));

            if (visibleEntries.length === 0) return;

            const topMost = visibleEntries[0].target as HTMLElement;
            const idx = observed.findIndex((el) => el === topMost);
            if (idx >= 0) setStep(idx);
          },
          { root: null, threshold: 0.35 }
        );

        observed.forEach((el) => sectionObserver?.observe(el));
      }

      const attachAnchorObserver = () => {
        if (destroyed) return;
        const anchor = document.getElementById('cta-zeigarnik-ring-anchor');
        if (!anchor) {
          anchorRetryTimeout = window.setTimeout(attachAnchorObserver, 400);
          return;
        }

        anchorObserver = new IntersectionObserver(
          (entries) => {
            const hit = entries.some((e) => e.isIntersecting);
            if (!hit) return;

            const rect = anchor.getBoundingClientRect();
            const size = 18;
            const x = rect.left + rect.width / 2 - size / 2;
            const y = rect.top + rect.height / 2 - size / 2;

            setMobileIndicatorStyle({
              left: x,
              top: y,
              bottom: 'auto',
              transform: 'none',
              opacity: 0,
              transition: 'all 700ms cubic-bezier(0.4, 0, 0.2, 1)'
            });

            if (handoffTimeout) window.clearTimeout(handoffTimeout);
            handoffTimeout = window.setTimeout(() => {
              setMobileIndicatorVisible(false);
            }, 750);
          },
          { root: null, threshold: 0.6 }
        );

        anchorObserver.observe(anchor);
      };

      attachAnchorObserver();
    };

    const onChange = () => init();
    init();

    try {
      mql.addEventListener('change', onChange);
    } catch {
      mql.addListener(onChange);
    }

    return () => {
      destroyed = true;
      cleanup();
      try {
        mql.removeEventListener('change', onChange);
      } catch {
        mql.removeListener(onChange);
      }
    };
  }, [navigationPages]);

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

  const customNavItems = (settingsReady ? (navigationPages || []) : [])
    .filter((p: any) => {
      const visible = typeof p.visible === 'boolean' ? p.visible : !!p.isVisible;
      const show = typeof p.showInNavigation === 'boolean' ? p.showInNavigation : false;
      return visible && show && !!p.slug;
    })
    .slice()
    .sort((a: any, b: any) => {
      const ao = typeof a.navigationOrder === 'number' ? a.navigationOrder : 0;
      const bo = typeof b.navigationOrder === 'number' ? b.navigationOrder : 0;
      return ao - bo;
    })
    .map((p: any) => ({
      href: `#page-${p.slug}`,
      label: resolveNavLabel(p.title, p.name || p.slug)
    }));

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
            {settingsReady && settings?.logoUrl ? (
                <img src={settings.logoUrl} alt="Logo" className="h-10 object-contain" onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.style.display = 'none';
                    target.nextElementSibling?.classList.remove('hidden');
                }} />
            ) : null}
            {!settingsReady ? (
              <div className="w-10 h-10 rounded-lg bg-slate-200 animate-pulse" />
            ) : (
              <div className={`w-10 h-10 bg-tivro-dark rounded-lg flex items-center justify-center text-white font-bold text-xl ${settings?.logoUrl ? 'hidden' : ''}`}>T</div>
            )}
            <div className="flex flex-col items-start">
              {!settingsReady ? (
                <span className="h-6 w-24 rounded bg-slate-200 animate-pulse" />
              ) : (
                <span className="text-2xl font-bold text-tivro-dark tracking-tight leading-tight">{settings?.siteName?.[lang] || DEFAULT_SETTINGS.siteName?.[lang] || 'Tivro'}</span>
              )}
              <span className="text-xs text-slate-500 font-medium leading-none">{t('brand.tagline')}</span>
            </div>
          </a>

          <nav className="hidden md:flex items-center gap-8">
            {navigationState.find(item => item.key === 'services')?.visible && <NavLink href="#services" label={resolveNavLabel(navigationLabels.services, t('nav.services'))} />}
            {packages.length > 0 && navigationState.find(item => item.key === 'packages')?.visible && <NavLink href="#packages" label={resolveNavLabel(navigationLabels.packages, t('admin.tab.packages'))} />}
            {navigationState.find(item => item.key === 'work')?.visible && <NavLink href="#work" label={resolveNavLabel(navigationLabels.work, t('nav.work'))} />}
            {navigationState.find(item => item.key === 'team')?.visible && <NavLink href="#team" label={resolveNavLabel(navigationLabels.team, t('nav.team'))} />}
            {navigationState.find(item => item.key === 'blog')?.visible && <NavLink href="#blog" label={resolveNavLabel(navigationLabels.blog, t('nav.blog'))} />}
            {customNavItems.map((item) => (
              <NavLink key={item.href} href={item.href} label={item.label} />
            ))}
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
        </div>
      </header>

      {isMobileViewport && mobileIndicatorVisible && (
        <div
          className="md:hidden fixed z-[65] pointer-events-none"
          style={mobileIndicatorStyle}
        >
          <div className="text-tivro-primary">
            <ZeigarnikRing progress={mobileIndicatorProgress} size={18} strokeWidth={2} trackOpacity={0.10} />
          </div>
        </div>
      )}

      {isMobileViewport && (
        <div className="md:hidden fixed bottom-0 left-0 right-0 z-[66] bg-white/85 backdrop-blur-md border-t border-slate-200">
          <div className="px-3 py-2 flex items-center justify-between gap-2 overflow-x-auto">
            <button
              type="button"
              onClick={() => {
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="shrink-0 px-3 py-2 rounded-xl text-slate-700 hover:bg-slate-100 font-semibold text-sm"
            >
              {lang === 'ar' ? 'أعلى' : 'Top'}
            </button>

            {navigationState.find(item => item.key === 'services')?.visible && (
              <button
                type="button"
                onClick={() => {
                  const el = document.getElementById('services');
                  el?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }}
                className="shrink-0 px-3 py-2 rounded-xl text-slate-700 hover:bg-slate-100 font-semibold text-sm"
              >
                {resolveNavLabel(navigationLabels.services, t('nav.services'))}
              </button>
            )}

            {packages.length > 0 && navigationState.find(item => item.key === 'packages')?.visible && (
              <button
                type="button"
                onClick={() => {
                  const el = document.getElementById('packages');
                  el?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }}
                className="shrink-0 px-3 py-2 rounded-xl text-slate-700 hover:bg-slate-100 font-semibold text-sm"
              >
                {resolveNavLabel(navigationLabels.packages, t('admin.tab.packages'))}
              </button>
            )}

            {navigationState.find(item => item.key === 'work')?.visible && (
              <button
                type="button"
                onClick={() => {
                  const el = document.getElementById('work');
                  el?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }}
                className="shrink-0 px-3 py-2 rounded-xl text-slate-700 hover:bg-slate-100 font-semibold text-sm"
              >
                {resolveNavLabel(navigationLabels.work, t('nav.work'))}
              </button>
            )}

            {navigationState.find(item => item.key === 'team')?.visible && (
              <button
                type="button"
                onClick={() => {
                  const el = document.getElementById('team');
                  el?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }}
                className="shrink-0 px-3 py-2 rounded-xl text-slate-700 hover:bg-slate-100 font-semibold text-sm"
              >
                {resolveNavLabel(navigationLabels.team, t('nav.team'))}
              </button>
            )}

            <button
              type="button"
              onClick={() => {
                const el = document.getElementById('contact');
                el?.scrollIntoView({ behavior: 'smooth', block: 'start' });
              }}
              className="shrink-0 px-3 py-2 rounded-xl bg-tivro-dark text-white font-bold text-sm"
            >
              {lang === 'ar' ? 'تواصل' : 'Contact'}
            </button>

            <button
              type="button"
              onClick={() => toggleLang()}
              className="shrink-0 px-3 py-2 rounded-xl text-slate-700 hover:bg-slate-100 font-semibold text-sm"
            >
              {lang === 'ar' ? 'EN' : 'AR'}
            </button>

            {isAdmin && (
              <a
                href="#admin"
                className="shrink-0 px-3 py-2 rounded-xl text-slate-700 hover:bg-slate-100 font-semibold text-sm"
              >
                {t('admin.dashboard')}
              </a>
            )}
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="flex-grow">{children}</main>

      {/* Footer */}
      {!hideFooter && (
        <footer className="bg-tivro-dark text-white pt-16 pb-8">
          <div className="container mx-auto px-4 md:px-8">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
              <div className="col-span-1 md:col-span-2">
                <div className="flex items-center gap-2 mb-6">
                  {settingsReady && settings?.footerLogoUrl ? (
                      <img src={settings.footerLogoUrl} alt="Logo" className="h-12 object-contain" onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.style.display = 'none';
                          target.nextElementSibling?.classList.remove('hidden');
                      }} />
                  ) : null}
                  {!settingsReady ? (
                    <div className="w-8 h-8 rounded bg-slate-200 animate-pulse" />
                  ) : (
                    <div className={`w-8 h-8 bg-tivro-primary rounded flex items-center justify-center text-white font-bold ${settings?.footerLogoUrl ? 'hidden' : ''}`}>T</div>
                  )}
                  {!settingsReady ? (
                    <span className="h-6 w-28 rounded bg-slate-200 animate-pulse" />
                  ) : (
                    <span className="text-2xl font-bold">{settings?.siteName?.[lang] || DEFAULT_SETTINGS.siteName?.[lang] || 'Tivro'}</span>
                  )}
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
