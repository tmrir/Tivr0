import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { db } from '../services/db';
import { supabase, isSupabaseConfigured } from '../services/supabase';
import { Layout } from '../components/Layout';
import { Service, TeamMember, Package, CaseStudy, LocalizedString } from '../types';
import { Plus, Trash2, Edit2, Save, BarChart2, List, Settings as SettingsIcon, Users as UsersIcon, Package as PackageIcon, Briefcase, Loader2, Database, RefreshCw } from 'lucide-react';

export const Admin = () => {
  const { isAdmin, t, loading, dir } = useApp();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [activeTab, setActiveTab] = useState<'dashboard' | 'services' | 'team' | 'packages' | 'work' | 'settings'>('dashboard');
  const [refresh, setRefresh] = useState(0);
  const [authError, setAuthError] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoggingIn(true);
    setAuthError('');
    
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setAuthError(error.message);
    }
    setIsLoggingIn(false);
  };

  if (loading) return <div className="h-screen flex items-center justify-center"><Loader2 className="animate-spin"/></div>;

  // Redirect or Show Login
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
        {/* Sidebar */}
        <aside className="w-64 bg-white border-r border-slate-200 flex-shrink-0 hidden md:block overflow-y-auto">
          <div className="p-6">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">{t('admin.menu.main')}</h3>
            <nav className="space-y-1">
              <SidebarLink icon={<BarChart2 size={20}/>} label={t('admin.tab.dashboard')} active={activeTab === 'dashboard'} onClick={() => setActiveTab('dashboard')} />
              <SidebarLink icon={<List size={20}/>} label={t('admin.tab.services')} active={activeTab === 'services'} onClick={() => setActiveTab('services')} />
              <SidebarLink icon={<UsersIcon size={20}/>} label={t('admin.tab.team')} active={activeTab === 'team'} onClick={() => setActiveTab('team')} />
              <SidebarLink icon={<PackageIcon size={20}/>} label={t('admin.tab.packages')} active={activeTab === 'packages'} onClick={() => setActiveTab('packages')} />
              <SidebarLink icon={<Briefcase size={20}/>} label={t('admin.tab.work')} active={activeTab === 'work'} onClick={() => setActiveTab('work')} />
              <SidebarLink icon={<SettingsIcon size={20}/>} label={t('admin.tab.settings')} active={activeTab === 'settings'} onClick={() => setActiveTab('settings')} />
            </nav>
          </div>
        </aside>

        {/* Content Area */}
        <main className="flex-1 overflow-y-auto p-8">
          {activeTab === 'dashboard' && <DashboardTab />}
          {activeTab === 'services' && <ServicesManager key={refresh} onUpdate={() => setRefresh(p => p+1)} />}
          {activeTab === 'team' && <TeamManager key={refresh} onUpdate={() => setRefresh(p => p+1)} />}
          {activeTab === 'packages' && <PackagesManager key={refresh} onUpdate={() => setRefresh(p => p+1)} />}
          {activeTab === 'work' && <CaseStudiesManager key={refresh} onUpdate={() => setRefresh(p => p+1)} />}
          {activeTab === 'settings' && <SettingsManager />}
        </main>
      </div>
    </Layout>
  );
};

const SidebarLink = ({ icon, label, active, onClick }: any) => (
  <button 
    onClick={onClick}
    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition ${active ? 'bg-tivro-primary/10 text-tivro-primary' : 'text-slate-600 hover:bg-slate-50'}`}
  >
    {icon}
    {label}
  </button>
);

/* --- Sub Components for Admin --- */

const DashboardTab = () => {
  const { t } = useApp();
  const [stats, setStats] = useState({ services: 0, team: 0, cases: 0, packages: 0 });

  useEffect(() => {
      const load = async () => {
          const s = await db.services.getAll({ useFallback: false });
          const teamData = await db.team.getAll({ useFallback: false });
          const c = await db.caseStudies.getAll({ useFallback: false });
          const p = await db.packages.getAll({ useFallback: false });
          setStats({ services: s.length, team: teamData.length, cases: c.length, packages: p.length });
      }
      load();
  }, []);

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-slate-800">{t('admin.tab.dashboard')}</h2>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <StatCard title={t('admin.dash.active_services')} value={stats.services.toString()} />
        <StatCard title={t('admin.dash.team_members')} value={stats.team.toString()} />
        <StatCard title={t('admin.dash.case_studies')} value={stats.cases.toString()} />
        <StatCard title={t('admin.dash.packages')} value={stats.packages.toString()} />
      </div>
      
      <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
        <h3 className="font-bold mb-4 text-slate-700">{t('admin.dash.info')}</h3>
        <p className="text-sm text-slate-500">{t('admin.dash.connected')}</p>
      </div>
    </div>
  );
};

const StatCard = ({ title, value }: any) => (
  <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
    <p className="text-sm text-slate-500 mb-1">{title}</p>
    <div className="flex items-end justify-between">
      <h3 className="text-2xl font-bold text-slate-900">{value}</h3>
    </div>
  </div>
);

// --- Generic Form Helper for Localization ---
const LocalizedInput = ({ label, value, onChange }: { label: string, value: LocalizedString, onChange: (v: LocalizedString) => void }) => {
    const { t } = useApp();
    return (
        <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
                <label className="block text-xs font-bold text-slate-500 mb-1">{label} ({t('admin.form.title_ar')})</label>
                <input required className="w-full border p-2 rounded" value={value.ar} onChange={e => onChange({...value, ar: e.target.value})} />
            </div>
            <div>
                <label className="block text-xs font-bold text-slate-500 mb-1">{label} ({t('admin.form.title_en')})</label>
                <input required className="w-full border p-2 rounded" value={value.en} onChange={e => onChange({...value, en: e.target.value})} />
            </div>
        </div>
    );
};

const ServicesManager: React.FC<{ onUpdate: () => void }> = ({ onUpdate }) => {
  const { t, lang } = useApp();
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Service | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
      const init = async () => {
        let data = await db.services.getAll({ useFallback: false });
        // Auto Seed if connected but empty
        if (data.length === 0 && isSupabaseConfigured) {
            await db.services.seed();
            data = await db.services.getAll({ useFallback: false });
        }
        setServices(data);
        setLoading(false);
      };
      init();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editing) return;
    setSaving(true);
    await db.services.save(editing);
    setSaving(false);
    setEditing(null);
    onUpdate();
    // Reload list
    const data = await db.services.getAll({ useFallback: false });
    setServices(data);
  };

  const handleDelete = async (id: string) => {
    if (confirm(t('admin.confirm'))) {
      await db.services.delete(id);
      onUpdate();
      setServices(services.filter(s => s.id !== id));
    }
  };

  if (loading) return <div>{t('admin.loading')}</div>;

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-slate-800">{t('admin.tab.services')}</h2>
        <button 
          onClick={() => setEditing({ id: 'new', title: {ar:'', en:''}, description: {ar:'', en:''}, iconName: 'Star', features: [] })}
          className="bg-tivro-primary text-white px-4 py-2 rounded-lg flex items-center gap-2 text-sm font-bold hover:bg-emerald-700"
        >
          <Plus size={18}/> {t('admin.btn.add')}
        </button>
      </div>

      {services.length === 0 && !editing && (
           <div className="bg-yellow-50 p-4 rounded border border-yellow-200 text-yellow-800 mb-4">
               {t('admin.empty')}
           </div>
      )}

      {editing ? (
        <form onSubmit={handleSave} className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 max-w-2xl">
           <h3 className="font-bold mb-4">{editing.id === 'new' ? t('admin.btn.add') : t('admin.btn.edit')}</h3>
           <LocalizedInput label={t('admin.form.title_ar')} value={editing.title} onChange={v => setEditing({...editing, title: v})} />
           <LocalizedInput label={t('admin.form.desc_ar')} value={editing.description} onChange={v => setEditing({...editing, description: v})} />
           <div className="mb-4">
               <label className="block text-xs font-bold text-slate-500 mb-1">{t('admin.form.icon')}</label>
               <input className="w-full border p-2 rounded" value={editing.iconName} onChange={e => setEditing({...editing, iconName: e.target.value})} />
           </div>
           <div className="flex gap-2 justify-end">
             <button type="button" onClick={() => setEditing(null)} className="px-4 py-2 text-slate-500">{t('admin.btn.cancel')}</button>
             <button disabled={saving} type="submit" className="px-4 py-2 bg-tivro-dark text-white rounded flex items-center gap-2">
                 {saving && <Loader2 size={14} className="animate-spin"/>} {t('admin.btn.save')}
             </button>
           </div>
        </form>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <table className="w-full text-left">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="p-4 text-sm font-bold text-slate-600">{t('admin.form.title_ar')}</th>
                <th className="p-4 text-sm font-bold text-slate-600">{t('admin.form.icon')}</th>
                <th className="p-4 text-right text-sm font-bold text-slate-600">{t('admin.settings.db')}</th>
              </tr>
            </thead>
            <tbody>
              {services.map(s => (
                <tr key={s.id} className="border-b border-slate-100 last:border-0 hover:bg-slate-50">
                  <td className="p-4 font-medium">{s.title[lang]}</td>
                  <td className="p-4 text-slate-500">{s.iconName}</td>
                  <td className="p-4 flex justify-end gap-2">
                    <button onClick={() => setEditing(s)} className="p-2 text-blue-600 hover:bg-blue-50 rounded"><Edit2 size={16}/></button>
                    <button onClick={() => handleDelete(s.id)} className="p-2 text-red-600 hover:bg-red-50 rounded"><Trash2 size={16}/></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

const TeamManager: React.FC<{ onUpdate: () => void }> = ({ onUpdate }) => {
    const { t, lang } = useApp();
    const [team, setTeam] = useState<TeamMember[]>([]);
    const [editing, setEditing] = useState<TeamMember | null>(null);
    const [saving, setSaving] = useState(false);
    const [loading, setLoading] = useState(true);
  
    useEffect(() => {
        const init = async () => {
            let data = await db.team.getAll({ useFallback: false });
            if (data.length === 0 && isSupabaseConfigured) {
                await db.team.seed();
                data = await db.team.getAll({ useFallback: false });
            }
            setTeam(data);
            setLoading(false);
        };
        init();
    }, []);
  
    const handleSave = async (e: React.FormEvent) => {
      e.preventDefault();
      if (!editing) return;
      setSaving(true);
      await db.team.save(editing);
      setSaving(false);
      setEditing(null);
      onUpdate();
      const data = await db.team.getAll({ useFallback: false });
      setTeam(data);
    };

    const handleDelete = async (id: string) => {
        if (confirm(t('admin.confirm'))) {
          await db.team.delete(id);
          onUpdate();
          setTeam(team.filter(x => x.id !== id));
        }
    };

    if (loading) return <div>{t('admin.loading')}</div>;
  
    return (
      <div>
        <div className="flex justify-between items-center mb-6">
             <h2 className="text-2xl font-bold text-slate-800">{t('admin.tab.team')}</h2>
             <button onClick={() => setEditing({ id: 'new', name: {ar:'', en:''}, role: {ar:'', en:''}, image: 'https://placehold.co/400' })} className="bg-tivro-primary text-white px-4 py-2 rounded-lg flex items-center gap-2 font-bold"><Plus size={18}/> {t('admin.btn.add')}</button>
        </div>

        {team.length === 0 && !editing && <div className="bg-yellow-50 p-4 rounded text-yellow-800 mb-4">{t('admin.empty')}</div>}

        {editing ? (
             <form onSubmit={handleSave} className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 max-w-2xl mb-6">
                <h3 className="font-bold mb-4">{t('admin.btn.edit')}</h3>
                <LocalizedInput label={t('admin.form.name_ar')} value={editing.name} onChange={v => setEditing({...editing, name: v})} />
                <LocalizedInput label={t('admin.form.role_ar')} value={editing.role} onChange={v => setEditing({...editing, role: v})} />
                <div className="mb-4">
                    <label className="block text-xs font-bold text-slate-500 mb-1">{t('admin.form.image')}</label>
                    <input className="w-full border p-2 rounded" value={editing.image} onChange={e => setEditing({...editing, image: e.target.value})} />
                </div>
                <div className="flex gap-2 justify-end">
                    <button type="button" onClick={() => setEditing(null)} className="px-4 py-2 text-slate-500">{t('admin.btn.cancel')}</button>
                    <button disabled={saving} type="submit" className="px-4 py-2 bg-tivro-dark text-white rounded flex items-center gap-2">{saving && <Loader2 size={14} className="animate-spin"/>} {t('admin.btn.save')}</button>
                </div>
             </form>
        ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {team.map(member => (
                <div key={member.id} className="bg-white p-4 rounded-lg shadow border flex flex-col items-center text-center relative group">
                <div className="absolute top-2 right-2 hidden group-hover:flex gap-2">
                    <button onClick={() => setEditing(member)} className="bg-blue-50 p-1 rounded text-blue-600"><Edit2 size={14}/></button>
                    <button onClick={() => handleDelete(member.id)} className="bg-red-50 p-1 rounded text-red-600"><Trash2 size={14}/></button>
                </div>
                <img src={member.image} className="w-20 h-20 rounded-full bg-slate-200 object-cover mb-3" />
                <div>
                    <p className="font-bold">{member.name[lang]}</p>
                    <p className="text-xs text-slate-500">{member.role[lang]}</p>
                </div>
                </div>
            ))}
            </div>
        )}
      </div>
    );
};

const PackagesManager: React.FC<{ onUpdate: () => void }> = ({ onUpdate }) => {
    const { t, lang } = useApp();
    const [items, setItems] = useState<Package[]>([]);
    const [editing, setEditing] = useState<Package | null>(null);
    const [saving, setSaving] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => { 
        const init = async () => {
            let data = await db.packages.getAll({ useFallback: false });
            if (data.length === 0 && isSupabaseConfigured) {
                await db.packages.seed();
                data = await db.packages.getAll({ useFallback: false });
            }
            setItems(data);
            setLoading(false);
        };
        init();
    }, []);

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!editing) return;
        setSaving(true);
        await db.packages.save(editing);
        setSaving(false);
        setEditing(null);
        onUpdate();
        setItems(await db.packages.getAll({ useFallback: false }));
    };

    const handleDelete = async (id: string) => {
        if (confirm(t('admin.confirm'))) { 
            await db.packages.delete(id); 
            onUpdate();
            setItems(items.filter(x => x.id !== id));
        }
    };

    if (loading) return <div>{t('admin.loading')}</div>;

    return (
        <div>
             <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-slate-800">{t('admin.tab.packages')}</h2>
                <button onClick={() => setEditing({ id: 'new', name: {ar:'', en:''}, price: '0 SAR', features: [], isPopular: false })} className="bg-tivro-primary text-white px-4 py-2 rounded-lg flex items-center gap-2 font-bold"><Plus size={18}/> {t('admin.btn.add')}</button>
             </div>
             {items.length === 0 && !editing && <div className="bg-yellow-50 p-4 rounded text-yellow-800 mb-4">{t('admin.empty')}</div>}
             {editing ? (
                 <form onSubmit={handleSave} className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 max-w-2xl">
                    <h3 className="font-bold mb-4">{t('admin.btn.edit')}</h3>
                    <LocalizedInput label={t('admin.form.name_ar')} value={editing.name} onChange={v => setEditing({...editing, name: v})} />
                    <div className="mb-4">
                        <label className="block text-xs font-bold text-slate-500 mb-1">{t('admin.form.price')}</label>
                        <input className="w-full border p-2 rounded" value={editing.price} onChange={e => setEditing({...editing, price: e.target.value})} />
                    </div>
                    <div className="mb-4">
                        <label className="flex items-center gap-2 cursor-pointer">
                            <input type="checkbox" checked={editing.isPopular} onChange={e => setEditing({...editing, isPopular: e.target.checked})} />
                            <span className="text-sm font-bold text-slate-700">{t('admin.form.popular')}</span>
                        </label>
                    </div>
                    <div className="flex gap-2 justify-end">
                        <button type="button" onClick={() => setEditing(null)} className="px-4 py-2 text-slate-500">{t('admin.btn.cancel')}</button>
                        <button disabled={saving} type="submit" className="px-4 py-2 bg-tivro-dark text-white rounded">{t('admin.btn.save')}</button>
                    </div>
                 </form>
             ) : (
                 <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                     {items.map(p => (
                         <div key={p.id} className="bg-white p-6 rounded-xl border shadow-sm relative group">
                             <div className="absolute top-4 right-4 hidden group-hover:flex gap-2">
                                <button onClick={() => setEditing(p)} className="text-blue-600"><Edit2 size={16}/></button>
                                <button onClick={() => handleDelete(p.id)} className="text-red-600"><Trash2 size={16}/></button>
                             </div>
                             {p.isPopular && <span className="bg-amber-100 text-amber-700 text-xs px-2 py-1 rounded font-bold mb-2 inline-block">Popular</span>}
                             <h3 className="font-bold">{p.name[lang]}</h3>
                             <p className="text-2xl font-bold text-tivro-primary my-2">{p.price}</p>
                         </div>
                     ))}
                 </div>
             )}
        </div>
    )
}

const CaseStudiesManager: React.FC<{ onUpdate: () => void }> = ({ onUpdate }) => {
    const { t, lang } = useApp();
    const [items, setItems] = useState<CaseStudy[]>([]);
    const [editing, setEditing] = useState<CaseStudy | null>(null);
    const [saving, setSaving] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => { 
        const init = async () => {
            let data = await db.caseStudies.getAll({ useFallback: false });
            if (data.length === 0 && isSupabaseConfigured) {
                await db.caseStudies.seed();
                data = await db.caseStudies.getAll({ useFallback: false });
            }
            setItems(data);
            setLoading(false);
        };
        init();
    }, []);

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!editing) return;
        setSaving(true);
        await db.caseStudies.save(editing);
        setSaving(false);
        setEditing(null);
        onUpdate();
        setItems(await db.caseStudies.getAll({ useFallback: false }));
    };

    const handleDelete = async (id: string) => {
        if (confirm(t('admin.confirm'))) { 
            await db.caseStudies.delete(id); 
            onUpdate();
            setItems(items.filter(x => x.id !== id));
        }
    };

    if (loading) return <div>{t('admin.loading')}</div>;

    return (
        <div>
             <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-slate-800">{t('admin.tab.work')}</h2>
                <button onClick={() => setEditing({ id: 'new', client: '', title: {ar:'', en:''}, category: {ar:'', en:''}, result: {ar:'', en:''}, image: 'https://placehold.co/600x400', stats: [] })} className="bg-tivro-primary text-white px-4 py-2 rounded-lg flex items-center gap-2 font-bold"><Plus size={18}/> {t('admin.btn.add')}</button>
             </div>
             {items.length === 0 && !editing && <div className="bg-yellow-50 p-4 rounded text-yellow-800 mb-4">{t('admin.empty')}</div>}
             {editing ? (
                 <form onSubmit={handleSave} className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 max-w-2xl">
                    <h3 className="font-bold mb-4">{t('admin.btn.edit')}</h3>
                    <div className="mb-4">
                        <label className="block text-xs font-bold text-slate-500 mb-1">{t('admin.form.client')}</label>
                        <input className="w-full border p-2 rounded" value={editing.client} onChange={e => setEditing({...editing, client: e.target.value})} />
                    </div>
                    <LocalizedInput label={t('admin.form.title_ar')} value={editing.title} onChange={v => setEditing({...editing, title: v})} />
                    <LocalizedInput label={t('admin.form.category_ar')} value={editing.category} onChange={v => setEditing({...editing, category: v})} />
                    <LocalizedInput label={t('admin.form.desc_ar')} value={editing.result} onChange={v => setEditing({...editing, result: v})} />
                    <div className="mb-4">
                        <label className="block text-xs font-bold text-slate-500 mb-1">{t('admin.form.image')}</label>
                        <input className="w-full border p-2 rounded" value={editing.image} onChange={e => setEditing({...editing, image: e.target.value})} />
                    </div>
                    <div className="flex gap-2 justify-end">
                        <button type="button" onClick={() => setEditing(null)} className="px-4 py-2 text-slate-500">{t('admin.btn.cancel')}</button>
                        <button disabled={saving} type="submit" className="px-4 py-2 bg-tivro-dark text-white rounded">{t('admin.btn.save')}</button>
                    </div>
                 </form>
             ) : (
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                     {items.map(c => (
                         <div key={c.id} className="bg-white p-0 rounded-xl border shadow-sm overflow-hidden group relative">
                             <div className="h-40 bg-slate-200">
                                 <img src={c.image} className="w-full h-full object-cover" />
                             </div>
                             <div className="p-4">
                                <h3 className="font-bold">{c.title[lang]}</h3>
                                <p className="text-sm text-slate-500">{c.client} - {c.category[lang]}</p>
                             </div>
                             <div className="absolute top-2 right-2 hidden group-hover:flex gap-2 bg-white/80 p-1 rounded backdrop-blur">
                                <button onClick={() => setEditing(c)} className="text-blue-600 p-1 hover:bg-blue-100 rounded"><Edit2 size={16}/></button>
                                <button onClick={() => handleDelete(c.id)} className="text-red-600 p-1 hover:bg-red-100 rounded"><Trash2 size={16}/></button>
                             </div>
                         </div>
                     ))}
                 </div>
             )}
        </div>
    )
}

const SettingsManager = () => {
  const { t } = useApp();
  const [settings, setSettings] = useState<any>(null);
  const [saving, setSaving] = useState(false);
  const [seeding, setSeeding] = useState(false);

  useEffect(() => {
      db.settings.get().then(setSettings);
  }, []);

  const save = async () => {
    setSaving(true);
    await db.settings.save(settings);
    setSaving(false);
    alert(t('admin.seed.success'));
    window.location.reload();
  };

  const handleSeed = async () => {
      if (confirm(t('admin.seed.warning'))) {
          setSeeding(true);
          const success = await db.seedDatabase();
          setSeeding(false);
          if (success) {
              alert(t('admin.seed.success'));
              window.location.reload();
          } else {
              alert('Failed to seed database. Check console.');
          }
      }
  }

  if (!settings) return <div>{t('admin.loading')}</div>;

  return (
    <div className="max-w-2xl space-y-8">
       <div>
            <h2 className="text-2xl font-bold text-slate-800 mb-6">{t('admin.settings.general')}</h2>
            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 space-y-4">
                <div>
                    <label className="block text-sm font-bold text-slate-700 mb-1">Site Name (EN)</label>
                    <input className="w-full border p-2 rounded" value={settings.siteName.en} onChange={e => setSettings({...settings, siteName: {...settings.siteName, en: e.target.value}})} />
                </div>
                <div>
                    <label className="block text-sm font-bold text-slate-700 mb-1">Site Name (AR)</label>
                    <input className="w-full border p-2 rounded" value={settings.siteName.ar} onChange={e => setSettings({...settings, siteName: {...settings.siteName, ar: e.target.value}})} />
                </div>
                <div>
                    <label className="block text-sm font-bold text-slate-700 mb-1">Contact Email</label>
                    <input className="w-full border p-2 rounded" value={settings.contactEmail} onChange={e => setSettings({...settings, contactEmail: e.target.value})} />
                </div>
                <button onClick={save} disabled={saving} className="bg-tivro-primary text-white px-6 py-2 rounded-lg font-bold hover:bg-emerald-700 flex items-center gap-2">
                    {saving && <Loader2 className="animate-spin" size={16}/>} {t('admin.btn.save')}
                </button>
            </div>
       </div>

       <div>
           <h2 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2"><Database size={18}/> {t('admin.settings.db')}</h2>
           <div className="bg-slate-100 p-6 rounded-xl border border-slate-200">
               <p className="text-sm text-slate-600 mb-4">{t('admin.seed.desc')}</p>
               <button onClick={handleSeed} disabled={seeding} className="bg-slate-900 text-white px-6 py-3 rounded-lg font-bold hover:bg-black flex items-center gap-2 shadow-lg">
                   {seeding ? <Loader2 className="animate-spin" size={18}/> : <RefreshCw size={18}/>} 
                   {t('admin.seed.btn')}
               </button>
           </div>
       </div>
    </div>
  );
};