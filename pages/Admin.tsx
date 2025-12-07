import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { db } from '../services/db';
import { supabase } from '../services/supabase';
import { Layout } from '../components/Layout';
import { Service, TeamMember, Package, CaseStudy, LocalizedString, BlogPost, ContactMessage, SiteSettings } from '../types';
import { Plus, Trash2, Edit2, BarChart2, List, Settings as SettingsIcon, Users as UsersIcon, Package as PackageIcon, Briefcase, Loader2, FileText, MessageCircle, Type, Palette } from 'lucide-react';
import { SettingsPage } from './Settings';
import { BrandIdentity } from './BrandIdentity';
import { SortableList } from '../components/SortableList';

interface ManagerProps {
  onUpdate: () => void;
}

/* --- HELPER COMPONENTS --- */
const LocalizedInput = ({ label, value, onChange }: { label: string, value: LocalizedString, onChange: (v: LocalizedString) => void }) => {
    const { t } = useApp();
    const safeValue = value || { ar: '', en: '' };
    return (
        <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
                <label className="block text-xs font-bold text-slate-500 mb-1">{label} ({t('admin.form.title_ar')})</label>
                <input required className="w-full border p-2 rounded" value={safeValue.ar} onChange={e => onChange({...safeValue, ar: e.target.value})} />
            </div>
            <div>
                <label className="block text-xs font-bold text-slate-500 mb-1">{label} ({t('admin.form.title_en')})</label>
                <input required className="w-full border p-2 rounded" value={safeValue.en} onChange={e => onChange({...safeValue, en: e.target.value})} />
            </div>
        </div>
    );
};

const StatCard = ({ title, value }: any) => (
  <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
    <p className="text-sm text-slate-500 mb-1">{title}</p>
    <h3 className="text-2xl font-bold text-slate-900">{value}</h3>
  </div>
);

const SidebarLink = ({ icon, label, active, onClick }: any) => (
  <button 
    onClick={onClick}
    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition ${active ? 'bg-tivro-primary/10 text-tivro-primary' : 'text-slate-600 hover:bg-slate-50'}`}
  >
    {icon}
    {label}
  </button>
);

/* --- MANAGERS --- */

const DashboardTab = () => {
  const { t } = useApp();
  const [stats, setStats] = useState({ services: 0, team: 0, cases: 0, packages: 0 });

  useEffect(() => {
      const load = async () => {
          const s = await db.services.getAll();
          const teamData = await db.team.getAll();
          const c = await db.caseStudies.getAll();
          const p = await db.packages.getAll();
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
      <div className="bg-green-50 border border-green-100 p-4 rounded-lg text-green-800">
          <strong>System Status:</strong> Mobile Cache Fixed. Brand Identity System Active.
      </div>
    </div>
  );
};

const ServicesManager: React.FC<ManagerProps> = ({ onUpdate }) => {
  const { t, lang } = useApp();
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Service | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => { db.services.getAll().then(data => { setServices(data); setLoading(false); }); }, []);
  const handleSave = async (e: React.FormEvent) => { e.preventDefault(); if (!editing) return; setSaving(true); await db.services.save(editing); setSaving(false); setEditing(null); onUpdate(); setServices(await db.services.getAll()); };
  const handleDelete = async (id: string) => { if (confirm(t('admin.confirm'))) { await db.services.delete(id); onUpdate(); setServices(services.filter(s => s.id !== id)); } };
  const handleReorder = (n: Service[]) => { setServices(n); db.reorder('services', n); };
  
  if (loading) return <div>{t('admin.loading')}</div>;

  return (
    <div>
      <div className="flex justify-between items-center mb-6"><h2 className="text-2xl font-bold">{t('admin.tab.services')}</h2><button onClick={() => setEditing({ id: 'new', title: {ar:'', en:''}, description: {ar:'', en:''}, iconName: 'Star', features: [{ar:'',en:''}] })} className="bg-tivro-primary text-white px-4 py-2 rounded-lg font-bold flex gap-2"><Plus size={18}/> {t('admin.btn.add')}</button></div>
      {editing ? (
        <form onSubmit={handleSave} className="bg-white p-8 rounded-xl shadow-lg">
           <LocalizedInput label={t('admin.form.title_ar')} value={editing.title} onChange={v => setEditing({...editing, title: v})} />
           <LocalizedInput label={t('admin.form.desc_ar')} value={editing.description} onChange={v => setEditing({...editing, description: v})} />
           <div className="mb-4"><label className="block text-xs font-bold mb-1">Icon</label><input className="w-full border p-2 rounded" value={editing.iconName} onChange={e=>setEditing({...editing, iconName: e.target.value})}/></div>
           <div className="flex gap-2 justify-end"><button type="button" onClick={()=>setEditing(null)} className="px-4 py-2">{t('admin.btn.cancel')}</button><button className="bg-tivro-dark text-white px-4 py-2 rounded">{saving && <Loader2 className="animate-spin inline mr-2"/>}{t('admin.btn.save')}</button></div>
        </form>
      ) : (
        <SortableList items={services} onReorder={handleReorder} keyExtractor={s=>s.id} renderItem={(s: Service)=><div className="bg-white p-4 border rounded relative group"><h3 className="font-bold">{s.title[lang]}</h3><div className="absolute top-2 right-2 hidden group-hover:flex gap-1"><button onClick={()=>setEditing(s)}><Edit2 size={16}/></button><button onClick={()=>handleDelete(s.id)}><Trash2 size={16}/></button></div></div>} className="grid grid-cols-1 md:grid-cols-3 gap-4"/>
      )}
    </div>
  );
};

const TeamManager: React.FC<ManagerProps> = ({ onUpdate }) => {
    const { t, lang } = useApp();
    const [team, setTeam] = useState<TeamMember[]>([]);
    const [editing, setEditing] = useState<TeamMember | null>(null);
    useEffect(() => { db.team.getAll().then(setTeam); }, []);
    const handleSave = async (e: React.FormEvent) => { e.preventDefault(); if (!editing) return; await db.team.save(editing); setEditing(null); onUpdate(); setTeam(await db.team.getAll()); };
    const handleDelete = async (id: string) => { if(confirm(t('admin.confirm'))) { await db.team.delete(id); onUpdate(); setTeam(team.filter(x=>x.id !== id)); }};
    return (
        <div>
            <div className="flex justify-between mb-6"><h2 className="text-2xl font-bold">{t('admin.tab.team')}</h2><button onClick={()=>setEditing({id:'new', name:{ar:'',en:''}, role:{ar:'',en:''}, image:''})} className="bg-tivro-primary text-white px-4 py-2 rounded font-bold flex gap-2"><Plus size={18}/>{t('admin.btn.add')}</button></div>
            {editing ? (<form onSubmit={handleSave} className="bg-white p-6 rounded shadow"><LocalizedInput label="Name" value={editing.name} onChange={v=>setEditing({...editing, name: v})}/><LocalizedInput label="Role" value={editing.role} onChange={v=>setEditing({...editing, role: v})}/><input className="w-full border p-2 mb-4" placeholder="Image URL" value={editing.image} onChange={e=>setEditing({...editing, image: e.target.value})}/><button className="bg-black text-white px-4 py-2 rounded">Save</button></form>) : (
                <SortableList items={team} onReorder={(n)=>{setTeam(n); db.reorder('team_members', n)}} keyExtractor={m=>m.id} renderItem={(m: TeamMember)=><div className="bg-white p-4 border rounded text-center group"><img src={m.image} className="w-20 h-20 rounded-full mx-auto mb-2 object-cover"/><h3 className="font-bold">{m.name[lang]}</h3><button onClick={()=>handleDelete(m.id)} className="text-red-500 hidden group-hover:block mx-auto mt-2"><Trash2 size={16}/></button></div>} className="grid grid-cols-2 md:grid-cols-4 gap-4"/>
            )}
        </div>
    );
}

const PackagesManager: React.FC<ManagerProps> = ({ onUpdate }) => {
    const { t, lang } = useApp();
    const [items, setItems] = useState<Package[]>([]);
    const [editing, setEditing] = useState<Package | null>(null);
    useEffect(() => { db.packages.getAll().then(setItems); }, []);
    const handleSave = async (e: React.FormEvent) => { e.preventDefault(); if (!editing) return; await db.packages.save(editing); setEditing(null); onUpdate(); setItems(await db.packages.getAll()); };
    return (<div><div className="flex justify-between mb-6"><h2 className="text-2xl font-bold">{t('admin.tab.packages')}</h2><button onClick={()=>setEditing({id:'new', name:{ar:'',en:''}, price:'', features:[], isPopular:false})} className="bg-tivro-primary text-white px-4 py-2 rounded"><Plus size={18}/></button></div>
    {editing ? <form onSubmit={handleSave} className="bg-white p-6"><LocalizedInput label="Name" value={editing.name} onChange={v=>setEditing({...editing, name:v})}/><input className="w-full border p-2 mb-4" value={editing.price} onChange={e=>setEditing({...editing, price:e.target.value})}/><button className="bg-black text-white px-4 py-2 rounded">Save</button></form> 
    : <SortableList items={items} onReorder={(n)=>{setItems(n); db.reorder('packages', n)}} keyExtractor={p=>p.id} renderItem={(p: Package)=><div className="bg-white p-4 border rounded"><h3 className="font-bold">{p.name[lang]}</h3><p>{p.price}</p><button onClick={()=>setEditing(p)} className="text-blue-500 mr-2"><Edit2 size={16}/></button></div>} className="grid grid-cols-1 md:grid-cols-3 gap-4"/>}</div>)
}

const CaseStudiesManager: React.FC<ManagerProps> = ({ onUpdate }) => {
    const { t, lang } = useApp();
    const [items, setItems] = useState<CaseStudy[]>([]);
    const [editing, setEditing] = useState<CaseStudy | null>(null);
    useEffect(() => { db.caseStudies.getAll().then(setItems); }, []);
    const handleSave = async (e: React.FormEvent) => { e.preventDefault(); if (!editing) return; await db.caseStudies.save(editing); setEditing(null); onUpdate(); setItems(await db.caseStudies.getAll()); };
    return (<div><div className="flex justify-between mb-6"><h2 className="text-2xl font-bold">{t('admin.tab.work')}</h2><button onClick={()=>setEditing({id:'new', title:{ar:'',en:''}, client:'', category:{ar:'',en:''}, result:{ar:'',en:''}, image:'', stats:[]})} className="bg-tivro-primary text-white px-4 py-2 rounded"><Plus size={18}/></button></div>
    {editing ? <form onSubmit={handleSave} className="bg-white p-6"><LocalizedInput label="Title" value={editing.title} onChange={v=>setEditing({...editing, title:v})}/><input className="w-full border p-2 mb-4" placeholder="Image" value={editing.image} onChange={e=>setEditing({...editing, image:e.target.value})}/><button className="bg-black text-white px-4 py-2 rounded">Save</button></form> 
    : <SortableList items={items} onReorder={(n)=>{setItems(n); db.reorder('case_studies', n)}} keyExtractor={c=>c.id} renderItem={(c: CaseStudy)=><div className="bg-white p-4 border rounded"><img src={c.image} className="h-32 w-full object-cover mb-2"/><h3 className="font-bold">{c.title[lang]}</h3><button onClick={()=>setEditing(c)} className="text-blue-500"><Edit2 size={16}/></button></div>} className="grid grid-cols-1 md:grid-cols-3 gap-4"/>}</div>)
}

const BlogManager: React.FC<ManagerProps> = ({ onUpdate }) => {
    const { t, lang } = useApp();
    const [posts, setPosts] = useState<BlogPost[]>([]);
    const [editing, setEditing] = useState<BlogPost | null>(null);
    useEffect(() => { db.blog.getAll().then(setPosts); }, []);
    const handleSave = async (e: React.FormEvent) => { e.preventDefault(); if(!editing) return; await db.blog.save(editing); setEditing(null); onUpdate(); setPosts(await db.blog.getAll()); };
    return (<div><div className="flex justify-between mb-6"><h2 className="text-2xl font-bold">{t('admin.tab.blog')}</h2><button onClick={()=>setEditing({id:'new', title:{ar:'',en:''}, excerpt:{ar:'',en:''}, content:{ar:'',en:''}, image:'', author:'Admin', date:''})} className="bg-tivro-primary text-white px-4 py-2 rounded"><Plus size={18}/></button></div>
    {editing ? <form onSubmit={handleSave} className="bg-white p-6"><LocalizedInput label="Title" value={editing.title} onChange={v=>setEditing({...editing, title:v})}/><button className="bg-black text-white px-4 py-2 rounded">Save</button></form> 
    : <div className="space-y-2">{posts.map(p=><div key={p.id} className="bg-white p-4 border rounded flex justify-between"><span>{p.title[lang]}</span><button onClick={()=>setEditing(p)}><Edit2 size={16}/></button></div>)}</div>}</div>)
}

const MessagesManager: React.FC<ManagerProps> = () => {
    const { t } = useApp();
    const [messages, setMessages] = useState<ContactMessage[]>([]);
    useEffect(() => { db.messages.getAll().then(setMessages); }, []);
    return (<div><h2 className="text-2xl font-bold mb-6">{t('admin.tab.messages')}</h2><div className="bg-white rounded border">{messages.map(m=><div key={m.id} className="p-4 border-b flex justify-between"><div><div className="font-bold">{m.name}</div><div className="text-sm text-slate-500">{m.phone}</div></div><span className="text-xs">{m.createdAt}</span></div>)}</div></div>)
}

export const Admin = () => {
  const { isAdmin, t, loading, dir } = useApp();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [activeTab, setActiveTab] = useState<'dashboard' | 'services' | 'team' | 'packages' | 'work' | 'blog' | 'messages' | 'settings' | 'brand'>('dashboard');
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
              <SidebarLink icon={<Palette size={20}/>} label={t('admin.tab.brand')} active={activeTab === 'brand'} onClick={() => setActiveTab('brand')} />
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
          {activeTab === 'brand' && <BrandIdentity />}
          {activeTab === 'settings' && <SettingsPage />}
        </main>
      </div>
    </Layout>
  );
};