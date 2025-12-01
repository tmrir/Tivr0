import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { Layout } from '../components/Layout';
import { db } from '../services/db';
import { ArrowRight, ArrowLeft, CheckCircle, TrendingUp, Loader2, User } from 'lucide-react';
import * as Icons from 'lucide-react';
import { Service, CaseStudy, TeamMember, Package, SiteSettings } from '../types';
import ContactUsSection from '../components/ContactUsSection';

export const Home = () => {
  const { t, lang, dir } = useApp();
  const [loading, setLoading] = useState(true);
  const [services, setServices] = useState<Service[]>([]);
  const [cases, setCases] = useState<CaseStudy[]>([]);
  const [team, setTeam] = useState<TeamMember[]>([]);
  const [packages, setPackages] = useState<Package[]>([]);
  const [settings, setSettings] = useState<SiteSettings | null>(null);
  
  const [contactName, setContactName] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [contactSending, setContactSending] = useState(false);

  useEffect(() => {
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

    // تحميل البيانات عند تحميل المكون
    loadData();

    // الاستماع لتحديثات الإعدادات من لوحة التحكم
    const handleSettingsUpdate = (event: CustomEvent) => {
        console.log('🔄 [Home] Settings updated event received:', event.detail);
        setSettings(event.detail);
    };

    window.addEventListener('settingsUpdated', handleSettingsUpdate as EventListener);

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

    // تنظيف event listeners عند unmount
    return () => {
        window.removeEventListener('settingsUpdated', handleSettingsUpdate as EventListener);
        window.removeEventListener('hashchange', handleHashScroll);
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

      {/* Services Section */}
      <section id="services" className="py-24 bg-slate-50">
        <div className="container mx-auto px-4 md:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-tivro-dark mb-4">
                {settings?.homeSections?.servicesTitle?.[lang] || t('section.services')}
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

      {/* Case Studies - EXACT DESIGN MATCH */}
      <section id="work" className="py-24 bg-white">
        <div className="container mx-auto px-4 md:px-8">
          <div className="flex justify-between items-end mb-12">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-tivro-dark mb-2">
                {settings?.sectionTexts?.workTitle?.[lang] || t('section.work')}
              </h2>
              <p className="text-slate-500">
                {settings?.sectionTexts?.workSubtitle?.[lang] || (lang === 'ar' ? 'أرقام تتحدث عن إنجازاتنا' : 'Numbers speaking our achievements')}
              </p>
            </div>
            <a href="#" className="text-tivro-primary font-bold hover:underline hidden md:block">{lang === 'ar' ? 'مشاهدة الكل' : 'View All'}</a>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            {cases.map(c => (
              <div key={c.id} className="group relative rounded-2xl overflow-hidden shadow-lg cursor-pointer">
                <div className="aspect-video overflow-hidden bg-slate-200">
                   <img src={c.image} alt={c.title[lang]} className="w-full h-full object-cover transform group-hover:scale-105 transition duration-700" />
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/90 via-slate-900/20 to-transparent flex flex-col justify-end p-8">
                  <span className="text-tivro-primary font-bold text-sm mb-2 bg-black/20 backdrop-blur-sm px-2 py-1 rounded w-fit">{c.category[lang]}</span>
                  <h3 className="text-white text-2xl font-bold mb-2">{c.title[lang]}</h3>
                  <p className="text-slate-200 text-sm mb-4">{c.result[lang]}</p>
                  <div className="flex gap-4 flex-wrap">
                    {(c.stats || []).map((stat, idx) => (
                      <div key={idx} className="bg-white/10 backdrop-blur rounded px-3 py-1 border border-white/10">
                        <span className="block text-white font-bold">{stat.value}</span>
                        <span className="text-xs text-slate-300">{stat.label[lang]}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Packages */}
      <section id="packages" className="py-24 bg-slate-50">
        <div className="container mx-auto px-4 md:px-8">
          <div className="text-center mb-16">
             <h2 className="text-3xl md:text-4xl font-bold text-tivro-dark">
                 {settings?.homeSections?.packagesTitle?.[lang] || (lang === 'ar' ? 'باقات تناسب الجميع' : 'Packages for Everyone')}
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
                <button className={`w-full py-3 rounded-xl font-bold transition ${pkg.isPopular ? 'bg-tivro-dark text-white hover:bg-slate-800' : 'bg-slate-100 text-slate-900 hover:bg-slate-200'}`}>
                  {lang === 'ar' ? 'اطلب العرض' : 'Request Offer'}
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section id="team" className="py-24 bg-white border-t border-slate-100">
        <div className="container mx-auto px-4 md:px-8">
          <div className="text-center mb-16">
             <h2 className="text-3xl md:text-4xl font-bold text-tivro-dark mb-2">
                 {settings?.homeSections?.teamTitle?.[lang] || t('section.team')}
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

      {/* CTA / Contact */}
      <section id="contact" className="py-24 bg-tivro-dark text-white">
         <div className="container mx-auto px-4 text-center">
           <h2 className="text-3xl md:text-5xl font-bold mb-6">
               {settings?.homeSections?.contactTitle?.[lang] || (lang === 'ar' ? 'جاهز لنقل مشروعك للمستوى التالي؟' : 'Ready to take your business to the next level?')}
           </h2>
           <p className="text-slate-300 mb-10 max-w-2xl mx-auto text-lg">
               {settings?.homeSections?.contactSubtitle?.[lang] || (lang === 'ar' ? 'دعنا نناقش أهدافك ونضع استراتيجية مخصصة لنجاحك.' : 'Let\'s discuss your goals and craft a custom strategy for your success.')}
           </p>
           <div className="flex flex-col md:flex-row justify-center gap-6">
             <div className="bg-white/5 p-8 rounded-2xl border border-white/10 backdrop-blur text-left">
               <h4 className="text-xl font-bold mb-4 flex items-center gap-2"><TrendingUp className="text-tivro-primary"/> {lang === 'ar' ? 'حجز استشارة' : 'Consultation'}</h4>
               {/* Social Links Display - Using Settings */}
               <div className="flex gap-4 mt-4 mb-6">
                  {settings?.socialLinks?.map((link, idx) => (
                    <a key={idx} href={link.url} target="_blank" rel="noopener noreferrer" className="w-8 h-8 rounded bg-slate-800 hover:bg-tivro-primary flex items-center justify-center transition text-white">
                      <IconComponent name={link.platform} className="w-4 h-4" />
                    </a>
                  ))}
               </div>
               <form className="space-y-4 w-full md:w-80" onSubmit={handleContactSubmit}>
                 <input 
                    type="text" 
                    placeholder={lang === 'ar' ? 'الاسم' : 'Name'} 
                    className="w-full bg-slate-800 border-none rounded-lg p-3 text-white placeholder-slate-500 focus:ring-2 focus:ring-tivro-primary outline-none" 
                    value={contactName}
                    onChange={(e) => setContactName(e.target.value)}
                    required
                 />
                 <input 
                    type="tel" 
                    placeholder={lang === 'ar' ? 'رقم الجوال' : 'Phone'} 
                    className="w-full bg-slate-800 border-none rounded-lg p-3 text-white placeholder-slate-500 focus:ring-2 focus:ring-tivro-primary outline-none" 
                    value={contactPhone}
                    onChange={(e) => setContactPhone(e.target.value)}
                    required
                 />
                 <button disabled={contactSending} className="w-full bg-tivro-primary hover:bg-emerald-500 py-3 rounded-lg font-bold transition flex items-center justify-center gap-2 text-white">
                    {contactSending && <Loader2 className="animate-spin" size={18}/>}
                    {lang === 'ar' ? 'إرسال الطلب' : 'Send Request'}
                 </button>
               </form>
             </div>
           </div>
         </div>
      </section>

            
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