
import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { Layout } from '../components/Layout';
import { db } from '../services/db';
import { ArrowRight, ArrowLeft, CheckCircle, Loader2, X, Send, User, Phone, Mail, MapPin } from 'lucide-react';
import * as Icons from 'lucide-react';
import { Service, CaseStudy, TeamMember, Package, SiteSettings, BlogPost } from '../types';

export const Home = () => {
  const { t, lang, dir } = useApp();
  const [loading, setLoading] = useState(true);
  
  // Data State
  const [services, setServices] = useState<Service[]>([]);
  const [cases, setCases] = useState<CaseStudy[]>([]);
  const [team, setTeam] = useState<TeamMember[]>([]);
  const [packages, setPackages] = useState<Package[]>([]);
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [settings, setSettings] = useState<SiteSettings | null>(null);
  
  // Contact Form State
  const [contactName, setContactName] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [contactSending, setContactSending] = useState(false);
  const [contactSuccess, setContactSuccess] = useState(false);

  // Package Modal State
  const [pkgModalOpen, setPkgModalOpen] = useState(false);
  const [selectedPkgName, setSelectedPkgName] = useState<string | null>(null);
  const [pkgName, setPkgName] = useState('');
  const [pkgPhone, setPkgPhone] = useState('');
  const [pkgEmail, setPkgEmail] = useState('');
  const [pkgSending, setPkgSending] = useState(false);
  const [pkgSuccess, setPkgSuccess] = useState(false);
  const [pkgError, setPkgError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [s, c, tData, p, b, set] = await Promise.all([
          db.services.getAll(),
          db.caseStudies.getAll(),
          db.team.getAll(),
          db.packages.getAll(),
          db.blog.getAll(),
          db.settings.get()
        ]);
        setServices(s);
        setCases(c);
        setTeam(tData);
        setPackages(p);
        setPosts(b);
        setSettings(set);
      } catch (e) {
        console.error("Fetch error", e);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // SCROLL FIX FOR NAVIGATION
  useEffect(() => {
      if (!loading && window.location.hash) {
          const id = window.location.hash.replace('#', '');
          const element = document.getElementById(id);
          if (element) {
              setTimeout(() => {
                  element.scrollIntoView({ behavior: 'smooth' });
              }, 300);
          }
      }
  }, [loading]);

  // Helper to scroll to contact section explicitly
  const scrollToContact = (e: React.MouseEvent) => {
      e.preventDefault();
      const contactSection = document.getElementById('contact');
      if (contactSection) {
          contactSection.scrollIntoView({ behavior: 'smooth' });
          window.history.pushState(null, '', '#contact');
      }
  };

  const handleContactSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setContactSending(true);
    try {
      await db.messages.send(contactName, contactPhone);
      setContactSuccess(true);
      setContactName('');
      setContactPhone('');
      setTimeout(() => setContactSuccess(false), 3000);
    } catch(e) { console.error(e); } finally { setContactSending(false); }
  };

  const openPackageModal = (pkgName: string) => {
      setSelectedPkgName(pkgName);
      setPkgModalOpen(true);
      setPkgError(null);
      setPkgSuccess(false);
  };

  const submitPackageRequest = async (e: React.FormEvent) => {
      e.preventDefault();
      
      if (!selectedPkgName) return;
      
      setPkgSending(true);
      setPkgError(null);
      setPkgSuccess(false);

      try {
          console.log("Submitting request...", { pkgName, pkgPhone, pkgEmail, selectedPkgName });
          
          await db.packageRequests.create(pkgName, pkgPhone, pkgEmail, selectedPkgName);
          
          console.log("Submission successful");
          setPkgSuccess(true);
          
          // Clear form and close modal after delay
          setTimeout(() => {
            setPkgSuccess(false);
            setPkgModalOpen(false);
            setPkgName(''); 
            setPkgPhone(''); 
            setPkgEmail('');
          }, 3000);

      } catch (e: any) {
          const errMsg = e.message || JSON.stringify(e);
          console.error("Package submit error:", errMsg);
          setPkgError(errMsg);
      } finally {
          setPkgSending(false);
      }
  };

  const RenderIcon = ({ name }: { name: string }) => {
    const Icon = (Icons as any)[name] || Icons.Star;
    return <Icon className="w-8 h-8 text-tivro-primary mb-4" />;
  };

  if (loading) return <div className="h-screen flex items-center justify-center bg-white"><Loader2 className="animate-spin w-10 h-10 text-tivro-primary"/></div>;
  
  // PREVENT CRASH IF SETTINGS NOT LOADED
  if (!settings) return <div className="min-h-screen flex items-center justify-center">Error loading settings. Please refresh.</div>;

  return (
    <Layout>
      {/* Hero Section */}
      {settings?.sectionVisibility?.hero !== false && (
      <section className="relative py-20 lg:py-32 overflow-hidden bg-slate-50">
        <div className="container mx-auto px-4 md:px-8 relative z-10">
          <div className="max-w-3xl animate-fade-in-up">
            <h1 className={`text-4xl md:${settings?.fontSettings?.heroTitle || 'text-6xl'} font-bold text-slate-900 mb-6 leading-tight`}>
              {settings?.homeSections.heroTitle[lang]}
            </h1>
            <p className={`text-xl md:${settings?.fontSettings?.heroSubtitle || 'text-2xl'} text-slate-600 mb-8 leading-relaxed`}>
              {settings?.homeSections.heroSubtitle[lang]}
            </p>
            {/* CTA LINKED TO CONTACT */}
            <a href="#contact" onClick={scrollToContact} className="inline-flex items-center gap-2 bg-tivro-primary text-white px-8 py-4 rounded-full font-bold text-lg hover:bg-emerald-700 transition shadow-lg shadow-tivro-primary/30 cursor-pointer">
              {t('cta.start')} {dir === 'rtl' ? <ArrowLeft/> : <ArrowRight/>}
            </a>
          </div>
        </div>
        <div className="absolute top-0 right-0 w-1/3 h-full bg-gradient-to-l from-emerald-50 to-transparent opacity-50 -z-0"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-orange-100 rounded-full blur-3xl opacity-30 -z-0"></div>
      </section>
      )}

      {/* Services Section */}
      {settings?.sectionVisibility?.services !== false && (
      <section id="services" className="py-20 bg-white">
        <div className="container mx-auto px-4 md:px-8">
          <div className="text-center mb-16 max-w-2xl mx-auto">
            <h2 className={`font-bold text-slate-900 mb-4 ${settings?.fontSettings?.sectionTitle || 'text-4xl'}`}>{settings?.homeSections.servicesTitle[lang]}</h2>
            <p className={`text-slate-500 ${settings?.fontSettings?.sectionDesc || 'text-lg'}`}>{settings?.homeSections.servicesSubtitle?.[lang]}</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {services.map((service) => (
              <div key={service.id} className="p-8 rounded-2xl bg-slate-50 hover:bg-white border border-slate-100 hover:shadow-xl transition duration-300 group">
                <div className="w-16 h-16 bg-white rounded-xl shadow-sm flex items-center justify-center mb-6 group-hover:scale-110 transition">
                  <RenderIcon name={service.iconName} />
                </div>
                <h3 className={`font-bold text-slate-900 mb-3 ${settings?.fontSettings?.cardTitle || 'text-xl'}`}>{service.title[lang]}</h3>
                <p className="text-slate-600 mb-6 leading-relaxed">{service.description[lang]}</p>
                <ul className="space-y-2">
                  {service.features.map((f, i) => (
                    <li key={i} className="flex items-center gap-2 text-sm text-slate-500">
                      <CheckCircle size={14} className="text-tivro-primary"/> {f[lang]}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>
      )}

      {/* Work Section */}
      {settings?.sectionVisibility?.work !== false && (
      <section id="work" className="py-20 bg-slate-900 text-white">
        <div className="container mx-auto px-4 md:px-8">
          <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-6">
            <div className="max-w-2xl">
              <h2 className={`font-bold mb-4 ${settings?.fontSettings?.sectionTitle || 'text-4xl'}`}>{settings?.sectionTexts.workTitle[lang]}</h2>
              <p className={`text-slate-400 ${settings?.fontSettings?.sectionDesc || 'text-lg'}`}>{settings?.sectionTexts.workSubtitle[lang]}</p>
            </div>
            {/* CTA LINKED TO CONTACT */}
            <a href="#contact" onClick={scrollToContact} className="text-tivro-primary hover:text-white transition font-bold flex items-center gap-2 cursor-pointer">{t('cta.start')} {dir === 'rtl' ? <ArrowLeft/> : <ArrowRight/>}</a>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {cases.map((item) => (
              <div key={item.id} className="group relative rounded-xl overflow-hidden bg-slate-800 border border-slate-700 hover:border-tivro-primary transition duration-300">
                <div className="h-64 overflow-hidden relative">
                  <img src={item.image} alt={item.title[lang]} className="w-full h-full object-cover group-hover:scale-110 transition duration-700"/>
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent opacity-90"></div>
                  <div className="absolute bottom-4 right-4 left-4">
                    <span className="bg-tivro-primary text-white text-xs font-bold px-3 py-1 rounded-full mb-2 inline-block">{item.category[lang]}</span>
                  </div>
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-bold mb-2">{item.title[lang]}</h3>
                  <p className="text-slate-400 text-sm mb-4">{item.result[lang]}</p>
                  <div className="flex gap-4 pt-4 border-t border-slate-700">
                    {item.stats.map((stat, i) => (
                      <div key={i}>
                        <p className="text-xl font-bold text-white">{stat.value}</p>
                        <p className="text-xs text-slate-500">{stat.label[lang]}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
      )}

      {/* Team Section */}
      {settings?.sectionVisibility?.team !== false && (
      <section id="team" className="py-20 bg-slate-50">
        <div className="container mx-auto px-4 md:px-8">
          <div className="text-center mb-16">
            <h2 className={`font-bold text-slate-900 mb-4 ${settings?.fontSettings?.sectionTitle || 'text-4xl'}`}>{settings?.homeSections.teamTitle[lang]}</h2>
            <p className={`text-slate-500 ${settings?.fontSettings?.sectionDesc || 'text-lg'}`}>{settings?.homeSections.teamSubtitle?.[lang]}</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {team.map((member) => (
              <div key={member.id} className="bg-white p-6 rounded-2xl shadow-sm text-center border border-slate-100 hover:shadow-lg transition">
                <div className="w-32 h-32 mx-auto mb-4 rounded-full overflow-hidden border-4 border-slate-50">
                  <img src={member.image} alt={member.name[lang]} className="w-full h-full object-cover"/>
                </div>
                <h3 className="font-bold text-lg text-slate-900">{member.name[lang]}</h3>
                <p className="text-tivro-primary font-medium text-sm">{member.role[lang]}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
      )}

      {/* Packages Section */}
      {settings?.sectionVisibility?.packages !== false && (
      <section id="packages" className="py-20 bg-white">
        <div className="container mx-auto px-4 md:px-8">
          <div className="text-center mb-16">
            <h2 className={`font-bold text-slate-900 mb-4 ${settings?.fontSettings?.sectionTitle || 'text-4xl'}`}>{settings?.homeSections.packagesTitle[lang]}</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {packages.map((pkg) => (
              <div key={pkg.id} className={`rounded-2xl p-8 transition duration-300 relative ${pkg.isPopular ? 'bg-slate-900 text-white shadow-2xl scale-105 z-10' : 'bg-slate-50 text-slate-900 border border-slate-200 hover:shadow-xl'}`}>
                {pkg.isPopular && (
                  <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-gradient-to-r from-orange-500 to-red-500 text-white text-sm font-bold px-4 py-1 rounded-full shadow-lg">
                    {t('admin.form.popular')}
                  </div>
                )}
                <div className="text-center mb-8">
                  <h3 className="text-xl font-bold mb-2 opacity-90">{pkg.name[lang]}</h3>
                  <div className="text-4xl font-bold mb-1">{pkg.price}</div>
                </div>
                <ul className="space-y-4 mb-8">
                  {pkg.features.map((f, i) => (
                    <li key={i} className="flex items-center gap-3 text-sm opacity-80">
                      <CheckCircle size={16} className={pkg.isPopular ? 'text-tivro-primary' : 'text-slate-400'}/>
                      {f[lang]}
                    </li>
                  ))}
                </ul>
                <button 
                  onClick={() => openPackageModal(pkg.name[lang])}
                  className={`w-full py-4 rounded-xl font-bold transition ${pkg.isPopular ? 'bg-tivro-primary text-white hover:bg-emerald-600' : 'bg-slate-200 text-slate-800 hover:bg-slate-300'}`}
                >
                  {t('pkg.select_btn')}
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>
      )}

      {/* Blog Section */}
      {posts.length > 0 && settings?.sectionVisibility?.blog !== false && (
        <section id="blog" className="py-20 bg-slate-50">
            <div className="container mx-auto px-4 md:px-8">
                <div className="text-center mb-12">
                   <h2 className={`font-bold text-slate-900 mb-4 ${settings?.fontSettings?.sectionTitle || 'text-4xl'}`}>{t('nav.blog')}</h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {posts.slice(0,3).map(post => (
                        <div key={post.id} className="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-md transition">
                            <div className="h-48 overflow-hidden"><img src={post.image} className="w-full h-full object-cover hover:scale-105 transition duration-500"/></div>
                            <div className="p-6">
                                <p className="text-xs text-slate-500 mb-2">{post.date}</p>
                                <h3 className="font-bold text-lg text-slate-900 mb-2">{post.title[lang]}</h3>
                                <p className="text-sm text-slate-600 line-clamp-2">{post.excerpt[lang]}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
      )}

      {/* Contact Section */}
      {settings?.sectionVisibility?.contact !== false && (
      <section id="contact" className="py-20 bg-white">
        <div className="container mx-auto px-4 md:px-8">
          <div className="max-w-4xl mx-auto bg-slate-900 rounded-3xl overflow-hidden shadow-2xl flex flex-col md:flex-row">
            <div className="p-8 md:p-12 md:w-1/2 text-white flex flex-col justify-center bg-gradient-to-br from-slate-900 to-slate-800">
              <h2 className="text-3xl font-bold mb-6">{settings?.homeSections.contactTitle[lang]}</h2>
              <p className="text-slate-300 mb-8 leading-relaxed">
                {settings?.homeSections.contactSubtitle?.[lang] || (lang === 'ar' ? 'نحن جاهزون لمساعدتك. اترك بياناتك وسنتواصل معك فوراً.' : 'We are ready to help. Leave your details and we will contact you immediately.')}
              </p>
              <div className="space-y-4 text-sm opacity-80">
                <div className="flex items-center gap-4 p-3 bg-white/5 rounded-lg"><div className="w-8 h-8 rounded-full bg-tivro-primary flex items-center justify-center"><Icons.Phone size={14}/></div> <span dir="ltr">{settings?.contactPhone}</span></div>
                <div className="flex items-center gap-4 p-3 bg-white/5 rounded-lg"><div className="w-8 h-8 rounded-full bg-tivro-primary flex items-center justify-center"><Icons.Mail size={14}/></div> <span>{settings?.contactEmail}</span></div>
                <div className="flex items-center gap-4 p-3 bg-white/5 rounded-lg"><div className="w-8 h-8 rounded-full bg-tivro-primary flex items-center justify-center"><Icons.MapPin size={14}/></div> <span>{settings?.address[lang]}</span></div>
              </div>
            </div>
            
            <div className="p-8 md:p-12 md:w-1/2 bg-white">
              {contactSuccess ? (
                 <div className="h-full flex flex-col items-center justify-center text-center text-green-600 animate-fade-in">
                    <CheckCircle size={64} className="mb-4"/>
                    <h3 className="text-2xl font-bold mb-2">شكراً لك!</h3>
                    <p className="text-slate-500">تم استلام رسالتك بنجاح.</p>
                 </div>
              ) : (
                <form onSubmit={handleContactSubmit} className="space-y-6">
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">{t('admin.messages.name')}</label>
                    <input required className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-tivro-primary outline-none" placeholder={lang==='ar'?'الاسم الكريم':'Your Name'} value={contactName} onChange={e => setContactName(e.target.value)} />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">{t('admin.messages.phone')}</label>
                    <input required className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-tivro-primary outline-none" placeholder="05xxxxxxxx" dir="ltr" value={contactPhone} onChange={e => setContactPhone(e.target.value)} />
                  </div>
                  <button disabled={contactSending} className="w-full bg-tivro-dark text-white py-4 rounded-xl font-bold hover:bg-slate-800 transition flex justify-center items-center gap-2">
                    {contactSending ? <Loader2 className="animate-spin"/> : <>{t('pkg.send_btn')} {dir==='rtl'?<ArrowLeft size={18}/>:<ArrowRight size={18}/>}</>}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </section>
      )}

      {/* Package Request Modal */}
      {pkgModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md animate-fade-in">
            <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden relative border border-white/20">
                <button onClick={() => setPkgModalOpen(false)} className="absolute top-4 right-4 text-slate-400 hover:text-red-500 transition hover:bg-red-50 p-2 rounded-full z-10"><X size={20}/></button>
                
                {pkgSuccess ? (
                    <div className="p-12 text-center animate-fade-in-up">
                        <div className="w-24 h-24 bg-green-50 text-green-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm">
                            <CheckCircle size={48}/>
                        </div>
                        <h3 className="text-xl font-bold text-slate-900 mb-3">{t('pkg.success')}</h3>
                        <p className="text-slate-500 mb-6">{selectedPkgName}</p>
                        <button onClick={() => setPkgModalOpen(false)} className="bg-slate-100 text-slate-700 px-6 py-2 rounded-full font-bold hover:bg-slate-200 transition">
                            {t('admin.btn.cancel')}
                        </button>
                    </div>
                ) : (
                    <div className="p-8 md:p-10">
                        <div className="text-center mb-8">
                            <h3 className="text-2xl font-bold text-slate-900 mb-3">{t('pkg.request_title')}</h3>
                            <div className="inline-flex items-center gap-2 px-4 py-2 bg-tivro-primary/10 text-tivro-primary rounded-full font-bold text-sm">
                                <span>{t('pkg.selected_package')}:</span>
                                <span className="text-slate-900">{selectedPkgName}</span>
                            </div>
                        </div>
                        
                        {pkgError && (
                            <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm text-center mb-4 border border-red-100">
                                {t('pkg.error')} <br/>
                                <span className="text-xs text-slate-500 mt-1 block" dir="ltr">{pkgError}</span>
                            </div>
                        )}

                        <form onSubmit={submitPackageRequest} className="space-y-5">
                            <div className="relative group">
                                <label className="block text-xs font-bold text-slate-500 mb-1.5">{t('pkg.name_placeholder')}</label>
                                <div className="relative">
                                    <div className="absolute top-3.5 right-3 text-slate-400 pointer-events-none group-focus-within:text-tivro-primary transition"><User size={18}/></div>
                                    <input required className="w-full pl-4 pr-10 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-tivro-primary focus:border-transparent outline-none transition" placeholder={t('pkg.name_placeholder')} value={pkgName} onChange={e => setPkgName(e.target.value)} />
                                </div>
                            </div>
                            
                            <div className="relative group">
                                <label className="block text-xs font-bold text-slate-500 mb-1.5">{t('pkg.phone_placeholder')}</label>
                                <div className="relative">
                                    <div className="absolute top-3.5 right-3 text-slate-400 pointer-events-none group-focus-within:text-tivro-primary transition"><Phone size={18}/></div>
                                    <input required type="tel" className="w-full pl-4 pr-10 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-tivro-primary focus:border-transparent outline-none transition" dir="ltr" placeholder="05xxxxxxxx" value={pkgPhone} onChange={e => setPkgPhone(e.target.value)} />
                                </div>
                            </div>

                            <div className="relative group">
                                <label className="block text-xs font-bold text-slate-500 mb-1.5">{t('pkg.email_placeholder')}</label>
                                <div className="relative">
                                    <div className="absolute top-3.5 right-3 text-slate-400 pointer-events-none group-focus-within:text-tivro-primary transition"><Mail size={18}/></div>
                                    <input required type="email" className="w-full pl-4 pr-10 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-tivro-primary focus:border-transparent outline-none transition" dir="ltr" placeholder="example@gmail.com" value={pkgEmail} onChange={e => setPkgEmail(e.target.value)} />
                                </div>
                            </div>

                            <button type="submit" disabled={pkgSending} className="w-full bg-tivro-primary text-white py-4 rounded-xl font-bold hover:bg-emerald-600 transition flex justify-center items-center gap-2 shadow-lg shadow-tivro-primary/20">
                                {pkgSending ? <Loader2 className="animate-spin"/> : <>{t('pkg.send_btn')} {dir==='rtl'?<ArrowLeft size={18}/>:<ArrowRight size={18}/>}</>}
                            </button>
                        </form>
                    </div>
                )}
            </div>
        </div>
      )}
    </Layout>
  );
};
