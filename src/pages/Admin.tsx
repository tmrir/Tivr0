import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { db } from '../services/db';
import { supabase } from '../services/supabase';
import { Layout } from '../components/Layout';
import { Service, TeamMember, Package, CaseStudy, LocalizedString, BlogPost, ContactMessage } from '../types';
import { Plus, Trash2, Edit2, BarChart2, List, Settings as SettingsIcon, Users as UsersIcon, Package as PackageIcon, Briefcase, Loader2, FileText, MessageCircle } from 'lucide-react';
import { SettingsPage } from './Settings';

interface ManagerProps {
  onUpdate: () => void;
}

// ... (Keep Admin, SidebarLink, DashboardTab, StatCard, LocalizedInput components as they are)
// I will focus on updating CaseStudiesManager which is the core request

const CaseStudiesManager: React.FC<ManagerProps> = ({ onUpdate }) => {
    const { t, lang } = useApp();
    const [items, setItems] = useState<CaseStudy[]>([]);
    const [editing, setEditing] = useState<CaseStudy | null>(null);
    const [saving, setSaving] = useState(false);
    
    useEffect(() => { 
        db.caseStudies.getAll().then(setItems); 
    }, []);

    const handleSave = async (e: React.FormEvent) => { 
        e.preventDefault(); 
        if (!editing) return; 
        setSaving(true); 
        await db.caseStudies.save(editing); 
        setSaving(false); 
        setEditing(null); 
        onUpdate(); 
        setItems(await db.caseStudies.getAll()); 
    };

    const handleDelete = async (id: string) => { 
        if(confirm(t('admin.confirm'))) { 
            await db.caseStudies.delete(id); 
            onUpdate(); 
            setItems(items.filter(x=>x.id!==id)); 
        }
    };

    // Helper for dynamic stats
    const addStat = () => editing && setEditing({...editing, stats: [...editing.stats, { label: {ar:'', en:''}, value: '' }]});
    const updateStat = (idx: number, field: 'value' | 'labelAr' | 'labelEn', val: string) => {
        if(!editing) return;
        const newStats = [...editing.stats];
        if(field === 'value') newStats[idx].value = val;
        else if(field === 'labelAr') newStats[idx].label.ar = val;
        else if(field === 'labelEn') newStats[idx].label.en = val;
        setEditing({...editing, stats: newStats});
    };
    const removeStat = (idx: number) => editing && setEditing({...editing, stats: editing.stats.filter((_, i) => i !== idx)});
    
    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-slate-800">{t('admin.tab.work')}</h2>
                <button onClick={() => setEditing({id:'new', title:{ar:'',en:''}, client:'', category:{ar:'',en:''}, result:{ar:'',en:''}, image:'', stats:[]})} className="bg-tivro-primary text-white px-4 py-2 rounded-lg font-bold flex gap-2 shadow-sm hover:bg-emerald-700 transition"><Plus size={18}/>{t('admin.btn.add')}</button>
            </div>
            {editing ? (
                <form onSubmit={handleSave} className="bg-white p-8 rounded-xl shadow-lg border border-slate-200 max-w-3xl mx-auto animate-fade-in">
                     <h3 className="font-bold text-xl text-slate-800 mb-6 pb-4 border-b">{editing.id === 'new' ? t('admin.btn.add') : t('admin.btn.edit')}</h3>
                     
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                        <div><label className="block text-xs font-bold text-slate-500 mb-1">{t('admin.form.client')}</label><input className="w-full border p-2 rounded" value={editing.client} onChange={e=>setEditing({...editing, client:e.target.value})} /></div>
                        <div><label className="block text-xs font-bold text-slate-500 mb-1">{t('admin.form.image')}</label><input className="w-full border p-2 rounded" value={editing.image} onChange={e=>setEditing({...editing, image:e.target.value})} /></div>
                     </div>

                     <LocalizedInput label={t('admin.form.title_ar')} value={editing.title} onChange={v => setEditing({...editing, title: v})} />
                     <LocalizedInput label={t('admin.form.category_ar')} value={editing.category} onChange={v => setEditing({...editing, category: v})} />
                     <LocalizedInput label="النتيجة / Result" value={editing.result} onChange={v => setEditing({...editing, result: v})} />

                     {/* إدارة الإحصائيات */}
                     <div className="mt-6 mb-6 bg-slate-50 p-4 rounded-xl border border-slate-200">
                        <div className="flex justify-between items-center mb-3">
                            <label className="font-bold text-slate-700">الإحصائيات (Stats)</label>
                            <button type="button" onClick={addStat} className="text-xs bg-white border px-3 py-1 rounded-full flex items-center gap-1 hover:bg-slate-100"><Plus size={12}/> إضافة رقم</button>
                        </div>
                        {editing.stats.map((stat, i) => (
                            <div key={i} className="flex gap-2 items-center mb-2">
                                <input className="w-20 border p-2 rounded text-sm font-bold" placeholder="Value (e.g. 50%)" value={stat.value} onChange={e=>updateStat(i, 'value', e.target.value)} />
                                <input className="flex-1 border p-2 rounded text-sm" placeholder="Label (Ar)" value={stat.label.ar} onChange={e=>updateStat(i, 'labelAr', e.target.value)} />
                                <input className="flex-1 border p-2 rounded text-sm" placeholder="Label (En)" value={stat.label.en} onChange={e=>updateStat(i, 'labelEn', e.target.value)} />
                                <button type="button" onClick={()=>removeStat(i)} className="text-red-500 p-2"><Trash2 size={16}/></button>
                            </div>
                        ))}
                        {editing.stats.length === 0 && <p className="text-xs text-slate-400 italic">لا توجد إحصائيات مضافة لهذا العمل.</p>}
                     </div>

                     <div className="flex gap-3 justify-end pt-4 border-t">
                        <button type="button" onClick={()=>setEditing(null)} className="px-6 py-2 text-slate-600 font-bold">{t('admin.btn.cancel')}</button>
                        <button type="submit" disabled={saving} className="bg-tivro-dark text-white px-8 py-2 rounded-lg font-bold flex items-center gap-2">{saving && <Loader2 size={16} className="animate-spin"/>} {t('admin.btn.save')}</button>
                     </div>
                </form>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {items.map(c => (
                        <div key={c.id} className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden group relative hover:shadow-md transition duration-300">
                            <div className="h-48 w-full overflow-hidden relative">
                                <img src={c.image} className="w-full h-full object-cover group-hover:scale-110 transition duration-500"/>
                                <div className="absolute bottom-0 left-0 w-full bg-gradient-to-t from-black/70 to-transparent p-4">
                                    <span className="text-tivro-primary text-xs font-bold bg-black/50 px-2 py-1 rounded">{c.category[lang]}</span>
                                </div>
                            </div>
                            <div className="p-5">
                                <h3 className="font-bold text-lg text-slate-800 mb-1">{c.title[lang]}</h3>
                                <p className="text-sm text-slate-500 mb-4 line-clamp-2">{c.result[lang]}</p>
                                <div className="flex flex-wrap gap-2">
                                    {c.stats.map((s, idx) => (
                                        <div key={idx} className="text-xs bg-slate-100 px-2 py-1 rounded text-slate-600">
                                            <strong>{s.value}</strong> {s.label[lang]}
                                        </div>
                                    ))}
                                </div>
                            </div>
                            <div className="absolute top-3 right-3 hidden group-hover:flex gap-1 bg-white/90 p-1 rounded shadow">
                                <button onClick={()=>setEditing(c)} className="p-2 text-blue-600 hover:bg-blue-50 rounded"><Edit2 size={16}/></button>
                                <button onClick={()=>handleDelete(c.id)} className="p-2 text-red-600 hover:bg-red-50 rounded"><Trash2 size={16}/></button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

// Exporting the full Admin component with imports
export const Admin = () => {
  const { isAdmin, t, loading, dir } = useApp();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [activeTab, setActiveTab] = useState<'dashboard' | 'services' | 'team' | 'packages' | 'work' | 'blog' | 'messages' | 'settings'>('dashboard');
  const [refresh, setRefresh] = useState(0);
  const [authError, setAuthError] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoggingIn(true);
    setAuthError('');
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) setAuthError(error.message);
    setIsLoggingIn(false);
  };

  if (loading) return <div className="h-screen flex items-center justify-center"><Loader2 className="animate-spin"/></div>;

  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-100" dir={dir}>
        <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-slate-900">{t('admin.login')}</h2>
          </div>
          <form onSubmit={handleLogin}>
            <div className="space-y-4">
              {authError && <div className="text-red-500 text-sm bg-red-50 p-2 rounded">{authError}</div>}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">{t('admin.login.email')}</label>
                <input type="email" className="w-full p-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-tivro-primary outline-none" value={email} onChange={e => setEmail(e.target.value)} required />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">{t('admin.login.password')}</label>
                <input type="password" className="w-full p-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-tivro-primary outline-none" value={password} onChange={e => setPassword(e.target.value)} required />
              </div>
              <button disabled={isLoggingIn} className="w-full bg-tivro-dark text-white py-3 rounded-lg font-bold hover:bg-slate-800 transition flex justify-center">
                 {isLoggingIn ? <Loader2 className="animate-spin"/> : t('admin.login.btn')}
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  return (
    <Layout hideFooter>
      <div className="flex h-[calc(100vh-80px)] bg-slate-50" dir={dir}>
        <aside className="w-64 bg-white border-r border-slate-200 flex-shrink-0 hidden md:block overflow-y-auto">
          <div className="p-6">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">{t('admin.menu.main')}</h3>
            <nav className="space-y-1">
              <SidebarLink icon={<BarChart2 size={20}/>} label={t('admin.tab.dashboard')} active={activeTab === 'dashboard'} onClick={() => setActiveTab('dashboard')} />
              <SidebarLink icon={<List size={20}/>} label={t('admin.tab.services')} active={activeTab === 'services'} onClick={() => setActiveTab('services')} />
              <SidebarLink icon={<UsersIcon size={20}/>} label={t('admin.tab.team')} active={activeTab === 'team'} onClick={() => setActiveTab('team')} />
              <SidebarLink icon={<PackageIcon size={20}/>} label={t('admin.tab.packages')} active={activeTab === 'packages'} onClick={() => setActiveTab('packages')} />
              <SidebarLink icon={<Briefcase size={20}/>} label={t('admin.tab.work')} active={activeTab === 'work'} onClick={() => setActiveTab('work')} />
              <SidebarLink icon={<FileText size={20}/>} label={t('admin.tab.blog')} active={activeTab === 'blog'} onClick={() => setActiveTab('blog')} />
              <SidebarLink icon={<MessageCircle size={20}/>} label={t('admin.tab.messages')} active={activeTab === 'messages'} onClick={() => setActiveTab('messages')} />
              <SidebarLink icon={<SettingsIcon size={20}/>} label={t('admin.tab.settings')} active={activeTab === 'settings'} onClick={() => setActiveTab('settings')} />
            </nav>
          </div>
        </aside>
        <main className="flex-1 overflow-y-auto p-8">
          {activeTab === 'dashboard' && <DashboardTab />}
          {activeTab === 'services' && <ServicesManager key={refresh} onUpdate={() => setRefresh(p => p+1)} />}
          {activeTab === 'team' && <TeamManager key={refresh} onUpdate={() => setRefresh(p => p+1)} />}
          {activeTab === 'packages' && <PackagesManager key={refresh} onUpdate={() => setRefresh(p => p+1)} />}
          {activeTab === 'work' && <CaseStudiesManager key={refresh} onUpdate={() => setRefresh(p => p+1)} />}
          {activeTab === 'blog' && <BlogManager key={refresh} onUpdate={() => setRefresh(p => p+1)} />}
          {activeTab === 'messages' && <MessagesManager key={refresh} onUpdate={() => setRefresh(p => p+1)} />}
          {activeTab === 'settings' && <SettingsPage />}
        </main>
      </div>
    </Layout>
  );
};

// Re-export other managers for complete file structure (simplified for this block, but assuming they exist in the full file I pasted before)
const SidebarLink = ({ icon, label, active, onClick }: any) => (<button onClick={onClick} className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition ${active ? 'bg-tivro-primary/10 text-tivro-primary' : 'text-slate-600 hover:bg-slate-50'}`}>{icon}{label}</button>);
const DashboardTab = () => { const { t } = useApp(); return <div className="space-y-6"><h2 className="text-2xl font-bold text-slate-800">{t('admin.tab.dashboard')}</h2><div className="bg-green-50 border border-green-100 p-4 rounded-lg text-green-800">System Status: Ready.</div></div>; };
const ServicesManager = ({onUpdate}: any) => <div>Services Manager (Use Previous Code)</div>;
const TeamManager = ({onUpdate}: any) => <div>Team Manager (Use Previous Code)</div>;
const PackagesManager = ({onUpdate}: any) => <div>Packages Manager (Use Previous Code)</div>;
const BlogManager = ({onUpdate}: any) => <div>Blog Manager (Use Previous Code)</div>;
const MessagesManager = ({onUpdate}: any) => <div>Messages Manager (Use Previous Code)</div>;
const LocalizedInput = ({ label, value, onChange }: { label: string, value: LocalizedString, onChange: (v: LocalizedString) => void }) => { const { t } = useApp(); const safeValue = value || { ar: '', en: '' }; return (<div className="grid grid-cols-2 gap-4 mb-4"><div><label className="block text-xs font-bold text-slate-500 mb-1">{label} ({t('admin.form.title_ar')})</label><input required className="w-full border p-2 rounded" value={safeValue.ar} onChange={e => onChange({...safeValue, ar: e.target.value})} /></div><div><label className="block text-xs font-bold text-slate-500 mb-1">{label} ({t('admin.form.title_en')})</label><input required className="w-full border p-2 rounded" value={safeValue.en} onChange={e => onChange({...safeValue, en: e.target.value})} /></div></div>); };
const StatCard = ({ title, value }: any) => (<div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100"><p className="text-sm text-slate-500 mb-1">{title}</p><h3 className="text-2xl font-bold text-slate-900">{value}</h3></div>);