import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { Layout } from '../components/Layout';
import { db } from '../services/db';
import { ArrowRight, ArrowLeft, CheckCircle, TrendingUp, Loader2, User } from 'lucide-react';
import * as Icons from 'lucide-react';
import { Service, CaseStudy, TeamMember, Package, SiteSettings } from '../types';
import { ContactUsSection } from '../components/ContactUsSection';
import { PackageRequestModal } from '../components/PackageRequestModal';
import { defaultSettings } from '../defaultSettings';

export const Home = () => {
  const { t, lang, dir } = useApp();
  const [loading, setLoading] = useState(true);
  const [services, setServices] = useState<Service[]>([]);
  const [cases, setCases] = useState<CaseStudy[]>([]);
  const [team, setTeam] = useState<TeamMember[]>([]);
  const [packages, setPackages] = useState<Package[]>([]);
  const [settings, setSettings] = useState<SiteSettings | null>(null);
  const [customPages, setCustomPages] = useState<any[]>([]);
  
  // State for navigation visibility and labels
  const [navigationState, setNavigationState] = useState<any[]>([
    { key: 'services', visible: true },
    { key: 'team', visible: true },
    { key: 'packages', visible: true },
    { key: 'work', visible: true },
    { key: 'blog', visible: true },
    { key: 'contact', visible: true },
    { key: 'pages', visible: true }
  ]);
  
  const [navigationLabels, setNavigationLabels] = useState<any>({
    services: t('section.services'),
    team: t('section.team'),
    packages: t('admin.tab.packages'),
    work: t('section.work'),
    blog: t('admin.tab.blog'),
    contact: lang === 'ar' ? 'تواصل معنا' : 'Contact Us',
    pages: lang === 'ar' ? 'مدير الصفحات' : 'Page Manager'
  });
  
  const [contactName, setContactName] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [contactSending, setContactSending] = useState(false);
  
  // State for package request modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedPackage, setSelectedPackage] = useState<Package | null>(null);

  const openPackageModal = (pkg: Package) => {
    setSelectedPackage(pkg);
    setIsModalOpen(true);
  };

  const closePackageModal = () => {
    setIsModalOpen(false);
    setSelectedPackage(null);
  };

  useEffect(() => {
    // Load custom pages from localStorage
    const savedPages = localStorage.getItem('customPages');
    if (savedPages) {
      try {
        setCustomPages(JSON.parse(savedPages));
      } catch (error) {
        console.error('Failed to load custom pages:', error);
      }
    }

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

    const fetchSettings = async () => {
      try {
        // Use db.settings.get() instead of direct API call to avoid 500 errors
        const settingsData = await db.settings.get();
        if (settingsData) {
          setSettings(settingsData);
        }
      } catch (error) {
        console.error('Failed to fetch settings:', error);
      }
    };

    const loadData = async () => {
        try {
            const [s, c, tData, p, set] = await Promise.all([
                db.services.getAll(),
                db.caseStudies.getAll(),
                db.team.getAll(),
                db.packages.getAll(),
                db.settings.get()
            ]);
            setServices(s);
            setCases(c);
            
            // تطبيق ترتيب الفريق المحفوظ في LocalStorage
            const savedOrder = localStorage.getItem('tivro_team_order');
            if (savedOrder) {
                try {
                    const orderedIds = JSON.parse(savedOrder);
                    // ترتيب الفريق حسب الترتيب المحفوظ
                    const orderedTeam = orderedIds.map((id: string) => 
                        tData.find(member => member.id === id)
                    ).filter(Boolean);
                    // إضافة الأعضاء الجديد غير المرتبين في النهاية
                    const newMembers = tData.filter(member => !orderedIds.includes(member.id));
                    setTeam([...orderedTeam, ...newMembers]);
                } catch (error) {
                    console.error('Failed to load saved team order in Home:', error);
                    setTeam(tData);
                }
            } else {
                setTeam(tData);
            }
            
            setPackages(p);
            setSettings(set);
            console.log('✅ [Home] Data loaded successfully:', { settings: set });
        } catch (e) {
            console.error("Home Data Load Error", e);
        } finally {
            setLoading(false);
        }
    };

    // Listen for custom pages updates
    const handleCustomPagesUpdate = () => {
      const savedPages = localStorage.getItem('customPages');
      if (savedPages) {
        try {
          setCustomPages(JSON.parse(savedPages));
        } catch (error) {
          console.error('Failed to load custom pages:', error);
        }
      }
    };

    // Listen for storage events
    window.addEventListener('storage', handleCustomPagesUpdate);

    // Also listen for custom events
    window.addEventListener('customPagesUpdated', handleCustomPagesUpdate);

    // Listen for settings changes
    const handleSettingsUpdate = () => {
        console.log('🔄 [Home] Settings update detected, reloading...');
        loadData();
    };

    // Listen for admin navigation updates
    const handleAdminNavigationUpdate = (event: any) => {
      console.log('🔄 [Home] Admin navigation update detected:', event.detail);
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

    window.addEventListener('settingsUpdated', handleSettingsUpdate as EventListener);
    window.addEventListener('storage', handleSettingsUpdate as EventListener);
    window.addEventListener('adminNavigationUpdated', handleAdminNavigationUpdate);
    window.addEventListener('storage', handleStorageNavigationUpdate);

    // تحميل البيانات عند تحميل المكون
    loadData();

    // دعم التمرير التلقائي عند تحميل الهاش
    const handleHashScroll = () => {
        const hash = window.location.hash.substring(1);
        if (hash) {
            // انتظر قليلاً حتى يتم تحميل البيانات
            setTimeout(() => {
                const targetElement = document.getElementById(hash);
                if (targetElement) {
                    targetElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }
            }, 100);
        }
    };

    // تحقق من الهاش عند التحميل الأولي
    handleHashScroll();

    // الاستماع لتغييرات الهاش
    window.addEventListener('hashchange', handleHashScroll);

    const handleVisibilityChange = () => {
      if (!document.hidden) {
        fetchSettings();
      }
    };

    const handleFocus = () => {
      fetchSettings();
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('focus', handleFocus);

    return () => {
        window.removeEventListener('settingsUpdated', handleSettingsUpdate as EventListener);
        window.removeEventListener('hashchange', handleHashScroll);
        window.removeEventListener('storage', handleCustomPagesUpdate);
        window.removeEventListener('customPagesUpdated', handleCustomPagesUpdate);
        document.removeEventListener('visibilitychange', handleVisibilityChange);
        window.removeEventListener('focus', handleFocus);
        window.removeEventListener('adminNavigationUpdated', handleAdminNavigationUpdate);
        window.removeEventListener('storage', handleStorageNavigationUpdate);
    };
  }, []);

  const handleContactSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      setContactSending(true);
      try {
          const { error } = await db.messages.send(contactName, contactPhone);
          if (!error) {
              alert(lang === 'ar' ? 'شكراً لك! سيتم التواصل معك قريباً.' : 'Thank you! We will contact you shortly.');
              setContactName('');
              setContactPhone('');
          } else {
              alert('Error sending message. Please try again.');
          }
      } catch (error) {
          console.error('Contact error', error);
      } finally {
          setContactSending(false);
      }
  };

  // Custom Pages Renderer
  const renderCustomPage = (page: any) => {
    if (!page.isVisible || !page.components || page.components.length === 0) return null;

    if (page.displayType === 'cards') {
      return (
        <section key={page.id} className="py-16 bg-slate-50">
          <div className="container mx-auto px-4 md:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-tivro-dark mb-4">
                {page.title?.[lang] || page.name}
              </h2>
              <p className="text-slate-500 max-w-2xl mx-auto">
                {page.description?.[lang]}
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {page.components.map((component: any) => (
                <div key={component.id} className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 hover:shadow-md transition-shadow">
                  {component.type === 'text' && (
                    <div className="text-slate-800">
                      {component.content.text?.[lang]}
                    </div>
                  )}
                  {component.type === 'image' && (
                    <div className="text-center">
                      {component.content.src ? (
                        <img 
                          src={component.content.src} 
                          alt={component.content.alt?.[lang]} 
                          className="w-full h-48 object-cover rounded-lg mb-4" 
                        />
                      ) : (
                        <div className="w-full h-48 bg-slate-200 rounded-lg flex items-center justify-center text-slate-400 mb-4">
                          {component.content.alt?.[lang] || 'Image'}
                        </div>
                      )}
                      {component.content.alt?.[lang] && (
                        <p className="text-sm text-slate-600">{component.content.alt[lang]}</p>
                      )}
                    </div>
                  )}
                  {component.type === 'button' && (
                    <div className="text-center">
                      <button 
                        onClick={() => window.open(component.content.href, '_blank')}
                        className={`px-6 py-3 rounded-lg font-medium transition ${
                          component.content.style === 'primary' ? 'bg-tivro-primary text-white hover:bg-emerald-500' :
                          component.content.style === 'secondary' ? 'bg-slate-600 text-white hover:bg-slate-700' :
                          'border border-slate-300 text-slate-700 hover:bg-slate-50'
                        }`}
                      >
                        {component.content.text?.[lang]}
                      </button>
                    </div>
                  )}
                  {component.type === 'link' && (
                    <div className="text-center">
                      <a 
                        href={component.content.href}
                        target={component.content.target}
                        className={`inline-block px-6 py-3 rounded-lg font-medium transition ${
                          component.content.style === 'primary' ? 'bg-tivro-primary text-white hover:bg-emerald-500' :
                          component.content.style === 'secondary' ? 'bg-slate-600 text-white hover:bg-slate-700' :
                          'border border-slate-300 text-slate-700 hover:bg-slate-50'
                        }`}
                      >
                        {component.content.text?.[lang]}
                      </a>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>
      );
    }

    // Section display type
    return (
      <section key={page.id} className="py-16 bg-white">
        <div className="container mx-auto px-4 md:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-tivro-dark mb-4">
              {page.title?.[lang] || page.name}
            </h2>
            <p className="text-slate-500 max-w-2xl mx-auto">
              {page.description?.[lang]}
            </p>
          </div>
          <div className="space-y-8">
            {page.components.map((component: any) => (
              <div key={component.id} className="text-center">
                {component.type === 'text' && (
                  <div className="max-w-4xl mx-auto">
                    <p className="text-lg text-slate-700 leading-relaxed">
                      {component.content.text?.[lang]}
                    </p>
                  </div>
                )}
                {component.type === 'image' && (
                  <div className="max-w-4xl mx-auto">
                    {component.content.src ? (
                      <img 
                        src={component.content.src} 
                        alt={component.content.alt?.[lang]} 
                        className="w-full h-96 object-cover rounded-xl" 
                      />
                    ) : (
                      <div className="w-full h-96 bg-slate-200 rounded-xl flex items-center justify-center text-slate-400">
                        {component.content.alt?.[lang] || 'Image'}
                      </div>
                    )}
                  </div>
                )}
                {component.type === 'button' && (
                  <button 
                    onClick={() => window.open(component.content.href, '_blank')}
                    className={`px-8 py-4 rounded-lg font-medium text-lg transition ${
                      component.content.style === 'primary' ? 'bg-tivro-primary text-white hover:bg-emerald-500' :
                      component.content.style === 'secondary' ? 'bg-slate-600 text-white hover:bg-slate-700' :
                      'border border-slate-300 text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    {component.content.text?.[lang]}
                  </button>
                )}
                {component.type === 'link' && (
                  <a 
                    href={component.content.href}
                    target={component.content.target}
                    className={`inline-block px-8 py-4 rounded-lg font-medium text-lg transition ${
                      component.content.style === 'primary' ? 'bg-tivro-primary text-white hover:bg-emerald-500' :
                      component.content.style === 'secondary' ? 'bg-slate-600 text-white hover:bg-slate-700' :
                      'border border-slate-300 text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    {component.content.text?.[lang]}
                  </a>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  };

  // Helper function to render pages at specific locations
  const renderPagesAtLocation = (location: string) => {
    return customPages
      .filter(page => page.displayLocation === location && page.isVisible)
      .map(page => renderCustomPage(page));
  };

  const IconComponent = ({ name, className }: { name: string, className?: string }) => {
    const Icon = (Icons as any)[name] ? (Icons as any)[name] : Icons.HelpCircle;
    return <Icon className={className} />;
  };

  if (loading) {
      return (
          <Layout>
             <div className="min-h-[60vh] flex flex-col items-center justify-center text-slate-400">
                 <Loader2 className="animate-spin mb-4" size={40} />
                 <p>{lang === 'ar' ? 'جاري تحميل المحتوى...' : 'Loading content...'}</p>
             </div>
          </Layout>
      )
  }

  return (
    <Layout>
      {/* Hero Section */}
      <section className="relative bg-tivro-dark text-white overflow-hidden pt-20 pb-32">
        <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-tivro-primary/20 to-transparent pointer-events-none" />
        <div className="container mx-auto px-4 md:px-8 relative z-10">
          <div className="max-w-3xl">
            <div className="inline-block px-4 py-1 bg-tivro-primary/20 text-tivro-primary rounded-full text-sm font-bold mb-6 border border-tivro-primary/30">
              {settings?.homeSections?.heroBadge?.[lang] || (lang === 'ar' ? '🚀 الوكالة الرقمية الأسرع نمواً' : '🚀 Fastest Growing Digital Agency')}
            </div>
            <h1 className="text-5xl md:text-7xl font-bold mb-8 leading-tight">
              {settings?.homeSections?.heroTitle?.[lang] || t('hero.title')}
            </h1>
            <p className="text-xl text-slate-300 mb-10 leading-relaxed max-w-2xl">
              {settings?.homeSections?.heroSubtitle?.[lang] || t('hero.subtitle')}
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <a href="#contact" className="bg-tivro-primary hover:bg-emerald-500 text-white px-8 py-4 rounded-full font-bold text-lg transition transform hover:-translate-y-1 shadow-lg shadow-tivro-primary/30 flex items-center justify-center gap-2">
                {t('cta.start')}
                {dir === 'rtl' ? <ArrowLeft /> : <ArrowRight />}
              </a>
              <a href="#work" className="bg-white/10 hover:bg-white/20 backdrop-blur text-white px-8 py-4 rounded-full font-bold text-lg transition flex items-center justify-center">
                {t('nav.work')}
              </a>
            </div>
          </div>
        </div>
        <div className="absolute bottom-0 w-full border-t border-white/10 bg-white/5 backdrop-blur-sm py-6">
          <div className="container mx-auto px-4 flex justify-around text-center">
             <div><div className="text-2xl font-bold text-tivro-primary">+150%</div><div className="text-sm text-slate-400">{lang === 'ar' ? 'متوسط نمو العملاء' : 'Avg Client Growth'}</div></div>
             <div><div className="text-2xl font-bold text-tivro-primary">+50</div><div className="text-sm text-slate-400">{lang === 'ar' ? 'عميل سعيد' : 'Happy Client'}</div></div>
             <div><div className="text-2xl font-bold text-tivro-primary">24/7</div><div className="text-sm text-slate-400">{lang === 'ar' ? 'دعم فني' : 'Support'}</div></div>
          </div>
        </div>
      </section>

      {/* Custom Pages - After Header */}
      {renderPagesAtLocation('after-header')}

      {/* Services Section */}
      {navigationState.find(item => item.key === 'services')?.visible && (
      <section id="services" className="py-24 bg-slate-50">
        <div className="container mx-auto px-4 md:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-tivro-dark mb-4">
                {settings?.homeSections?.servicesTitle?.[lang] || navigationLabels.services || t('section.services')}
            </h2>
            <p className="text-slate-500 max-w-2xl mx-auto">{settings?.homeSections?.servicesSubtitle?.[lang]}</p>
            <div className="w-20 h-1 bg-tivro-primary mx-auto rounded-full mt-4"></div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {services.map(s => (
              <div key={s.id} className="bg-white p-8 rounded-2xl shadow-sm hover:shadow-xl transition duration-300 group border border-slate-100">
                <div className="w-14 h-14 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition duration-300">
                  <IconComponent name={s.iconName} className="w-7 h-7" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-3">{s.title[lang]}</h3>
                <p className="text-slate-600 mb-6 text-sm leading-relaxed">{s.description[lang]}</p>
                <ul className="space-y-2">
                  {s.features.map((f, idx) => (
                    <li key={idx} className="flex items-center gap-2 text-sm text-slate-500">
                      <CheckCircle size={14} className="text-tivro-primary" />
                      {f[lang]}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>
      )}

      {/* Custom Pages - Before Packages */}
      {renderPagesAtLocation('before-packages')}

      {/* Packages */}
      {navigationState.find(item => item.key === 'packages')?.visible && (
      <section id="packages" className="py-24 bg-slate-50">
        <div className="container mx-auto px-4 md:px-8">
          <div className="text-center mb-16">
             <h2 className="text-3xl md:text-4xl font-bold text-tivro-dark">
                 {settings?.homeSections?.packagesTitle?.[lang] || navigationLabels.packages || (lang === 'ar' ? 'باقات تناسب الجميع' : 'Packages for Everyone')}
             </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {packages.map(pkg => (
              <div key={pkg.id} className={`relative bg-white rounded-2xl p-8 ${pkg.isPopular ? 'border-2 border-tivro-primary shadow-xl scale-105 z-10' : 'border border-slate-100 shadow-sm'}`}>
                {pkg.isPopular && (
                  <div className="absolute top-0 left-1/2 transform -translate-x-1/2 bg-tivro-primary text-white px-4 py-1 rounded-full text-sm font-bold">
                    {lang === 'ar' ? 'الأكثر طلباً' : 'Most Popular'}
                  </div>
                )}
                <h3 className="text-xl font-bold text-slate-900 mb-2">{pkg.name[lang]}</h3>
                <div className="text-4xl font-bold text-tivro-dark mb-6">{pkg.price}</div>
                <ul className="space-y-4 mb-8">
                  {pkg.features.map((f, i) => (
                    <li key={i} className="flex items-center gap-3 text-slate-600">
                      <div className="w-5 h-5 rounded-full bg-green-100 flex items-center justify-center text-green-600 text-xs flex-shrink-0">✓</div>
                      {f[lang]}
                    </li>
                  ))}
                </ul>
                <button 
                  onClick={() => openPackageModal(pkg)}
                  className={`w-full py-3 rounded-xl font-bold transition ${pkg.isPopular ? 'bg-tivro-dark text-white hover:bg-slate-800' : 'bg-slate-100 text-slate-900 hover:bg-slate-200'}`}
                >
                  {lang === 'ar' ? 'اطلب الباقة' : 'Request Package'}
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>
      )}

      {/* Custom Pages - After Packages */}

      {/* Custom Pages - Before Work */}
      {renderPagesAtLocation('before-work')}

      {/* Case Studies - EXACT DESIGN MATCH */}
      {navigationState.find(item => item.key === 'work')?.visible && (
      <section id="work" className="py-24 bg-white">
        <div className="container mx-auto px-4 md:px-8">
          <div className="flex justify-between items-end mb-12">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-tivro-dark mb-2">
                {settings?.sectionTexts?.workTitle?.[lang] || navigationLabels.work || t('section.work')}
              </h2>
              <p className="text-slate-500">
                {settings?.sectionTexts?.workSubtitle?.[lang] || (lang === 'ar' ? 'أرقام تتحدث عن إنجازاتنا' : 'Numbers speaking our achievements')}
              </p>
            </div>
            <a href="#" className="text-tivro-primary font-bold hover:underline hidden md:block">{lang === 'ar' ? 'مشاهدة الكل' : 'View All'}</a>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            {cases.map(c => (
              <div key={c.id} className="group relative rounded-2xl overflow-hidden shadow-lg">
                <div className="aspect-video overflow-hidden bg-slate-200">
                   <img src={c.image} alt={c.title[lang]} className="w-full h-full object-cover transform group-hover:scale-105 transition duration-700" />
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/90 via-slate-900/20 to-transparent flex flex-col justify-end p-8">
                  <span className="text-tivro-primary font-bold text-sm mb-2 bg-black/20 backdrop-blur-sm px-2 py-1 rounded w-fit">{c.category[lang]}</span>
                  <h3 className="text-white text-2xl font-bold mb-2">{c.title[lang]}</h3>
                  <p className="text-slate-200 text-sm mb-4">{c.result[lang]}</p>
                  <div className="flex gap-4 flex-wrap">
                    {(c.stats || []).map((stat, idx) => {
                      const link = stat.label?.en && stat.label.en.trim().startsWith('http')
                        ? stat.label.en.trim()
                        : undefined;
                      const isClickable = !!link;
                      return (
                        <div
                          key={idx}
                          className={`bg-white/10 backdrop-blur rounded px-3 py-1 border border-white/10 ${isClickable ? 'cursor-pointer' : ''}`}
                          onClick={() => {
                            if (link) {
                              window.open(link, '_blank');
                            }
                          }}
                        >
                          <span className="block text-white font-bold">{stat.value}</span>
                          <span className="text-xs text-slate-300">{stat.label[lang]}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
      )}

      {/* Team Section */}
      {navigationState.find(item => item.key === 'team')?.visible && (
      <section id="team" className="py-24 bg-white border-t border-slate-100">
        <div className="container mx-auto px-4 md:px-8">
          <div className="text-center mb-16">
             <h2 className="text-3xl md:text-4xl font-bold text-tivro-dark mb-2">
                 {settings?.homeSections?.teamTitle?.[lang] || navigationLabels.team || t('section.team')}
             </h2>
             <p className="text-slate-500">{settings?.homeSections?.teamSubtitle?.[lang]}</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
             {team.map(t => (
               <div key={t.id} className="text-center group">
                 <div className="w-40 h-40 mx-auto mb-6 rounded-full overflow-hidden border-4 border-slate-50 shadow-lg bg-slate-100 flex items-center justify-center">
                   {t.image ? (
                     <img src={t.image} alt={t.name[lang]} className="w-full h-full object-cover group-hover:scale-110 transition duration-500" />
                   ) : (
                     <User className="w-16 h-16 text-slate-400" />
                   )}
                 </div>
                 <h3 className="text-xl font-bold text-slate-900">{t.name[lang]}</h3>
                 <p className="text-tivro-primary font-medium text-sm mb-2">{t.role[lang]}</p>
               </div>
             ))}
          </div>
        </div>
      </section>
      )}

      {/* Custom Pages - After Work */}
      {renderPagesAtLocation('after-work')}

      {/* Custom Pages - Before Footer */}

      {/* CTA / Contact */}
      {navigationState.find(item => item.key === 'contact')?.visible && (
      <section id="contact" className="py-24 bg-tivro-dark text-white">
         <ContactUsSection settings={settings?.contactUs} fallbackSettings={defaultSettings.contactUs} />
      </section>
      )}

      {/* Package Request Modal */}
      <PackageRequestModal
        isOpen={isModalOpen}
        onClose={closePackageModal}
        package={selectedPackage}
        lang={lang}
      />

      {/* Legal Sections - Hidden anchor targets for smooth scrolling */}
      <section id="privacy" className="sr-only">
        <div className="container mx-auto px-4 py-16">
          <h1 className="text-4xl font-bold text-slate-900 mb-8">{settings?.sectionTexts?.privacyLink?.[lang] || (lang === 'ar' ? 'سياسة الخصوصية' : 'Privacy Policy')}</h1>
          <div className="prose prose-lg max-w-none text-slate-700 whitespace-pre-wrap">
            {settings?.privacyPolicy?.[lang] || (lang === 'ar' ? 'سياسة الخصوصية' : 'Privacy Policy')}
          </div>
        </div>
      </section>

      <section id="terms" className="sr-only">
        <div className="container mx-auto px-4 py-16">
          <h1 className="text-4xl font-bold text-slate-900 mb-8">{settings?.sectionTexts?.termsLink?.[lang] || (lang === 'ar' ? 'شروط الخدمة' : 'Terms of Service')}</h1>
          <div className="prose prose-lg max-w-none text-slate-700 whitespace-pre-wrap">
            {settings?.termsOfService?.[lang] || (lang === 'ar' ? 'لا يوجد محتوى حالياً.' : 'No content available.')}
          </div>
        </div>
      </section>
    </Layout>
  );
};