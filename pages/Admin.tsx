
import React, { useState, useEffect, useCallback } from 'react';
import { useApp } from '../context/AppContext';
import { db } from '../services/db';
import { supabase } from '../services/supabase';
import { Layout } from '../components/Layout';
import { Service, TeamMember, Package, CaseStudy, LocalizedString, BlogPost, ContactMessage, SiteSettings, PackageRequest } from '../types';
import { Plus, Trash2, Edit2, BarChart2, List, Settings as SettingsIcon, Users as UsersIcon, Package as PackageIcon, Briefcase, Loader2, FileText, MessageCircle, Type, Inbox, Eye, EyeOff, Check, X, ChartNoAxesColumn, PanelsTopLeft } from 'lucide-react';
import { SettingsPage } from './Settings';
import { BrandIdentity } from './BrandIdentity';
import { SortableList } from '../components/SortableList';

interface ManagerProps {
  onUpdate: () => void;
}

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

/* --- EXTRACTED SIDEBAR ITEM (FIXES FOCUS LOSS & RE-RENDER ISSUES) --- */
interface AdminSidebarItemProps {
    id: string;
    icon: React.ReactNode;
    label: string;
    activeTab: string;
    setActiveTab: (id: string) => void;
    sectionKey?: string;
    settings?: SiteSettings | null;
    editingSection?: string | null;
    setEditingSection?: (key: string | null) => void;
    tempTitle?: LocalizedString;
    setTempTitle?: (val: LocalizedString) => void;
    saveRename?: (key: string) => void;
    startRename?: (key: string, current: LocalizedString) => void;
    toggleVisibility?: (key: string) => void;
    getSectionTitle?: (key: string) => LocalizedString;
}

const AdminSidebarItem: React.FC<AdminSidebarItemProps> = React.memo(({ 
    id, icon, label, activeTab, setActiveTab, 
    sectionKey, settings, 
    editingSection, setEditingSection, 
    tempTitle, setTempTitle, 
    saveRename, startRename, toggleVisibility, getSectionTitle
}) => {
    const isVisible = sectionKey && settings ? settings.sectionVisibility?.[sectionKey] !== false : true;
    const isEditing = editingSection === sectionKey && sectionKey;
    
    // Get actual DB title or fallback to label
    const dbTitle = (sectionKey && getSectionTitle) ? getSectionTitle(sectionKey) : null;
    const displayLabel = dbTitle?.ar || label;
    const safeTempTitle = tempTitle || { ar: '', en: '' };

    return (
        <div className={`group flex items-center justify-between pr-2 rounded-lg transition mb-1 ${activeTab === id ? 'bg-tivro-primary/10' : 'hover:bg-slate-50'}`}>
            <button onClick={() => setActiveTab(id)} className={`flex-1 flex items-center gap-3 px-4 py-3 text-sm font-medium transition text-left ${activeTab === id ? 'text-tivro-primary' : 'text-slate-600'} ${!isVisible ? 'opacity-50 grayscale' : ''}`}>
                {icon}
                {isEditing && setTempTitle ? (
                    <div className="flex gap-2" onClick={e => e.stopPropagation()}>
                        <input className="w-20 border rounded text-xs p-1" value={safeTempTitle.ar} onChange={e => setTempTitle({...safeTempTitle, ar: e.target.value})} placeholder="Ar" autoFocus onClick={e=>e.stopPropagation()} />
                        <input className="w-20 border rounded text-xs p-1" value={safeTempTitle.en} onChange={e => setTempTitle({...safeTempTitle, en: e.target.value})} placeholder="En" onClick={e=>e.stopPropagation()} />
                    </div>
                ) : <span className={`flex-1 text-left ${!isVisible ? 'line-through decoration-slate-400' : ''}`}>{displayLabel}</span>}
            </button>

            {sectionKey && settings && (
                 <div className="flex items-center gap-1">
                     {isEditing ? (
                         <>
                              <button onClick={(e) => { e.stopPropagation(); saveRename && saveRename(sectionKey); }} className="p-1 text-green-600 hover:bg-green-100 rounded"><Check size={14}/></button>
                              <button onClick={(e) => { e.stopPropagation(); setEditingSection && setEditingSection(null); }} className="p-1 text-red-600 hover:bg-red-100 rounded"><X size={14}/></button>
                         </>
                     ) : (
                         <>
                              <button onClick={(e) => { e.stopPropagation(); startRename && startRename(sectionKey, dbTitle!); }} className="p-1 text-slate-300 hover:text-blue-600 hover:bg-blue-50 rounded opacity-0 group-hover:opacity-100 transition" title="تعديل اسم القسم"><Edit2 size={14}/></button>
                              <button onClick={(e) => { e.stopPropagation(); toggleVisibility && toggleVisibility(sectionKey); }} className={`p-1 rounded transition ${!isVisible ? 'text-red-500 bg-red-50' : 'text-slate-300 hover:text-slate-600 hover:bg-slate-100'}`} title={isVisible ? "إخفاء القسم" : "إظهار القسم"}>
                                  {isVisible ? <Eye size={14}/> : <EyeOff size={14}/>}
                              </button>
                         </>
                     )}
                 </div>
             )}
        </div>
    );
});

/* --- MANAGERS --- */

const DashboardTab = ({ setActiveTab }: { setActiveTab: (t: any) => void }) => {
  const [stats, setStats] = useState({ services: 0, team: 0, cases: 0, packages: 0, requests: 0, posts: 0, messages: 0 });

  useEffect(() => {
      const load = async () => {
          try {
            const [s, t, c, p, r, b, m] = await Promise.all([
                db.services.getAll(),
                db.team.getAll(),
                db.caseStudies.getAll(),
                db.packages.getAll(),
                db.packageRequests.getAll(),
                db.blog.getAll(),
                db.messages.getAll()
            ]);
            setStats({ services: s.length, team: t.length, cases: c.length, packages: p.length, requests: r.length, posts: b.length, messages: m.length });
          } catch (e) { console.error('Error loading stats', e); }
      }
      load();
  }, []);

  const Card = ({ title, count, icon, colorClass, onClick }: any) => (
      <div onClick={onClick} className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 hover:shadow-md transition-shadow cursor-pointer">
          <div className="flex items-center justify-between">
              <div>
                  <p className="text-sm font-medium text-slate-600 mb-1">{title}</p>
                  <p className="text-3xl font-bold text-slate-900">{count}</p>
              </div>
              <div className={`${colorClass} p-3 rounded-lg text-white`}>
                  {icon}
              </div>
          </div>
      </div>
  );

  return (
    <main className="flex-1 overflow-y-auto p-8">
        <div>
            <h1 className="text-3xl font-bold text-slate-800 mb-8">نظرة عامة</h1>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                <Card title="الخدمات" count={stats.services} icon={<List size={24}/>} colorClass="bg-blue-500" onClick={()=>setActiveTab('services')}/>
                <Card title="الفريق" count={stats.team} icon={<UsersIcon size={24}/>} colorClass="bg-green-500" onClick={()=>setActiveTab('team')}/>
                <Card title="الباقات" count={stats.packages} icon={<PackageIcon size={24}/>} colorClass="bg-purple-500" onClick={()=>setActiveTab('packages')}/>
                <Card title="أعمالنا" count={stats.cases} icon={<Briefcase size={24}/>} colorClass="bg-orange-500" onClick={()=>setActiveTab('work')}/>
                <Card title="المدونة" count={stats.posts} icon={<FileText size={24}/>} colorClass="bg-pink-500" onClick={()=>setActiveTab('blog')}/>
                <Card title="رسائل التواصل" count={stats.messages} icon={<MessageCircle size={24}/>} colorClass="bg-red-500" onClick={()=>setActiveTab('messages')}/>
            </div>
        </div>
    </main>
  );
};

/* --- CONTENT MANAGERS --- */

const SimpleManagerLayout = ({ title, onAdd, children }: any) => (
    <div className="p-8">
        <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-slate-800">{title}</h2>
            {onAdd && (
                <button onClick={onAdd} className="bg-tivro-primary text-white px-4 py-2 rounded-lg font-bold flex items-center gap-2 shadow-sm hover:bg-emerald-700 transition">
                    <Plus size={18}/> إضافة جديد
                </button>
            )}
        </div>
        {children}
    </div>
);

const PackageRequestsManager: React.FC<ManagerProps> = ({ onUpdate }) => {
    const [requests, setRequests] = useState<PackageRequest[]>([]);
    useEffect(() => { db.packageRequests.getAll().then(setRequests); }, []);
    const handleDelete = async (id: string) => { if(confirm('Are you sure?')) { await db.packageRequests.delete(id); onUpdate(); setRequests(requests.filter(r => r.id !== id)); }};

    return (
        <SimpleManagerLayout title="طلبات الباقات">
             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                 {requests.map(req => (
                     <div key={req.id} className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm relative group">
                         <div className="flex justify-between items-start mb-4">
                             <div><span className="text-xs font-bold bg-green-100 text-green-800 px-2 py-1 rounded">{req.packageName}</span><p className="text-xs text-slate-400 mt-2">{new Date(req.createdAt).toLocaleDateString()}</p></div>
                             <button onClick={() => handleDelete(req.id)} className="text-slate-300 hover:text-red-500"><Trash2 size={16}/></button>
                         </div>
                         <h3 className="font-bold text-lg text-slate-900 mb-1">{req.name}</h3>
                         <div className="space-y-1 text-sm text-slate-600">
                             <div className="flex items-center gap-2"><span className="font-bold">📱</span> <span dir="ltr">{req.phone}</span></div>
                             {req.email && <div className="flex items-center gap-2"><span className="font-bold">📧</span> <span>{req.email}</span></div>}
                         </div>
                     </div>
                 ))}
                 {requests.length === 0 && <div className="col-span-full py-20 text-center text-slate-400"><Inbox size={48} className="mx-auto mb-4 opacity-20"/><p>No package requests yet.</p></div>}
             </div>
        </SimpleManagerLayout>
    );
};

const ServicesManager: React.FC<ManagerProps> = ({ onUpdate }) => {
    const { t, lang } = useApp();
    const [services, setServices] = useState<Service[]>([]);
    const [editing, setEditing] = useState<Service | null>(null);
    useEffect(() => { db.services.getAll().then(setServices); }, []);

    const handleSave = async (e: React.FormEvent) => { e.preventDefault(); if (!editing) return; await db.services.save(editing); setEditing(null); onUpdate(); setServices(await db.services.getAll()); };
    const handleDelete = async (id: string) => { if(confirm('Sure?')) { await db.services.delete(id); onUpdate(); setServices(services.filter(s => s.id !== id)); }};
    const handleReorder = (items: Service[]) => { setServices(items); db.reorder('services', items); };

    return (
        <SimpleManagerLayout title="الخدمات" onAdd={() => setEditing({ id: 'new', title: {ar:'', en:''}, description: {ar:'', en:''}, iconName: 'Star', features: [{ar:'',en:''}] })}>
            {editing ? (
                <form onSubmit={handleSave} className="bg-white p-6 rounded-xl border border-slate-200"><h3 className="font-bold mb-4">Edit Service</h3><LocalizedInput label="Title" value={editing.title} onChange={v=>setEditing({...editing, title:v})}/><LocalizedInput label="Desc" value={editing.description} onChange={v=>setEditing({...editing, description:v})}/><div className="flex gap-2 justify-end mt-4"><button type="button" onClick={()=>setEditing(null)} className="px-4 py-2 border rounded">Cancel</button><button className="px-4 py-2 bg-tivro-dark text-white rounded">Save</button></div></form>
            ) : (
                <SortableList items={services} onReorder={handleReorder} keyExtractor={s=>s.id} className="grid grid-cols-1 md:grid-cols-3 gap-6" renderItem={(s)=>(<div className="bg-white p-6 rounded-xl border border-slate-200 relative group"><h3 className="font-bold">{s.title[lang]}</h3><div className="absolute top-2 right-2 hidden group-hover:flex gap-1"><button onClick={()=>setEditing(s)} className="p-1 bg-blue-50 text-blue-600 rounded"><Edit2 size={14}/></button><button onClick={()=>handleDelete(s.id)} className="p-1 bg-red-50 text-red-600 rounded"><Trash2 size={14}/></button></div></div>)}/>
            )}
        </SimpleManagerLayout>
    );
}

const TeamManager: React.FC<ManagerProps> = ({ onUpdate }) => {
    const { t, lang } = useApp();
    const [team, setTeam] = useState<TeamMember[]>([]);
    const [editing, setEditing] = useState<TeamMember | null>(null);
    useEffect(() => { db.team.getAll().then(setTeam); }, []);
    const handleSave = async (e: React.FormEvent) => { e.preventDefault(); if (!editing) return; await db.team.save(editing); setEditing(null); onUpdate(); setTeam(await db.team.getAll()); };
    const handleDelete = async (id: string) => { if(confirm('Sure?')) { await db.team.delete(id); onUpdate(); setTeam(team.filter(x=>x.id !== id)); }};
    const handleReorder = (items: TeamMember[]) => { setTeam(items); db.reorder('team_members', items); };

    return (
        <SimpleManagerLayout title="الفريق" onAdd={() => setEditing({id:'new', name:{ar:'',en:''}, role:{ar:'',en:''}, image:''})}>
            {editing ? (
                <form onSubmit={handleSave} className="bg-white p-6 rounded-xl border border-slate-200"><h3 className="font-bold mb-4">Edit Team</h3><LocalizedInput label="Name" value={editing.name} onChange={v=>setEditing({...editing, name:v})}/><LocalizedInput label="Role" value={editing.role} onChange={v=>setEditing({...editing, role:v})}/><div className="mb-4"><label className="block text-xs">Image URL</label><input className="w-full border p-2" value={editing.image} onChange={e=>setEditing({...editing, image:e.target.value})}/></div><div className="flex gap-2 justify-end mt-4"><button type="button" onClick={()=>setEditing(null)} className="px-4 py-2 border rounded">Cancel</button><button className="px-4 py-2 bg-tivro-dark text-white rounded">Save</button></div></form>
            ) : (
                <SortableList items={team} onReorder={handleReorder} keyExtractor={m=>m.id} className="grid grid-cols-1 md:grid-cols-4 gap-6" renderItem={(m)=>(<div className="bg-white p-6 rounded-xl border border-slate-200 relative group text-center"><img src={m.image} className="w-16 h-16 rounded-full mx-auto mb-2 object-cover"/><h3 className="font-bold">{m.name[lang]}</h3><div className="absolute top-2 right-2 hidden group-hover:flex gap-1"><button onClick={()=>setEditing(m)} className="p-1 bg-blue-50 text-blue-600 rounded"><Edit2 size={14}/></button><button onClick={()=>handleDelete(m.id)} className="p-1 bg-red-50 text-red-600 rounded"><Trash2 size={14}/></button></div></div>)}/>
            )}
        </SimpleManagerLayout>
    );
};

const PackagesManager: React.FC<ManagerProps> = ({ onUpdate }) => {
    const { t, lang } = useApp();
    const [items, setItems] = useState<Package[]>([]);
    const [editing, setEditing] = useState<Package | null>(null);
    useEffect(() => { db.packages.getAll().then(setItems); }, []);
    const handleSave = async (e: React.FormEvent) => { e.preventDefault(); if (!editing) return; await db.packages.save(editing); setEditing(null); onUpdate(); setItems(await db.packages.getAll()); };
    const handleDelete = async (id: string) => { if(confirm('Sure?')) { await db.packages.delete(id); onUpdate(); setItems(items.filter(x=>x.id!==id)); }};
    const handleReorder = (newItems: Package[]) => { setItems(newItems); db.reorder('packages', newItems); };

    return (
        <SimpleManagerLayout title="الباقات" onAdd={() => setEditing({id:'new', name:{ar:'',en:''}, price:'', features:[{ar:'', en:''}], isPopular: false})}>
            {editing ? (
                <form onSubmit={handleSave} className="bg-white p-6 rounded-xl border border-slate-200"><h3 className="font-bold mb-4">Edit Package</h3><LocalizedInput label="Name" value={editing.name} onChange={v=>setEditing({...editing, name:v})}/><div className="mb-4"><label className="block text-xs">Price</label><input className="w-full border p-2" value={editing.price} onChange={e=>setEditing({...editing, price:e.target.value})}/></div><div className="flex gap-2 justify-end mt-4"><button type="button" onClick={()=>setEditing(null)} className="px-4 py-2 border rounded">Cancel</button><button className="px-4 py-2 bg-tivro-dark text-white rounded">Save</button></div></form>
            ) : (
                <SortableList items={items} onReorder={handleReorder} keyExtractor={p=>p.id} className="grid grid-cols-1 md:grid-cols-3 gap-6" renderItem={(p)=>(<div className="bg-white p-6 rounded-xl border border-slate-200 relative group"><h3 className="font-bold">{p.name[lang]}</h3><div className="absolute top-2 right-2 hidden group-hover:flex gap-1"><button onClick={()=>setEditing(p)} className="p-1 bg-blue-50 text-blue-600 rounded"><Edit2 size={14}/></button><button onClick={()=>handleDelete(p.id)} className="p-1 bg-red-50 text-red-600 rounded"><Trash2 size={14}/></button></div></div>)}/>
            )}
        </SimpleManagerLayout>
    );
};

const CaseStudiesManager: React.FC<ManagerProps> = ({ onUpdate }) => {
    const { t, lang } = useApp();
    const [items, setItems] = useState<CaseStudy[]>([]);
    const [editing, setEditing] = useState<CaseStudy | null>(null);
    useEffect(() => { db.caseStudies.getAll().then(setItems); }, []);
    const handleSave = async (e: React.FormEvent) => { e.preventDefault(); if (!editing) return; await db.caseStudies.save(editing); setEditing(null); onUpdate(); setItems(await db.caseStudies.getAll()); };
    const handleDelete = async (id: string) => { if(confirm('Sure?')) { await db.caseStudies.delete(id); onUpdate(); setItems(items.filter(x=>x.id!==id)); }};
    const handleReorder = (newItems: CaseStudy[]) => { setItems(newItems); db.reorder('case_studies', newItems); };

    return (
        <SimpleManagerLayout title="أعمالنا" onAdd={() => setEditing({id:'new', title:{ar:'',en:''}, client:'', category:{ar:'',en:''}, result:{ar:'',en:''}, image:'', stats:[]})}>
            {editing ? (
                <form onSubmit={handleSave} className="bg-white p-6 rounded-xl border border-slate-200"><h3 className="font-bold mb-4">Edit Case Study</h3><LocalizedInput label="Title" value={editing.title} onChange={v=>setEditing({...editing, title:v})}/><LocalizedInput label="Result" value={editing.result} onChange={v=>setEditing({...editing, result:v})}/><div className="flex gap-2 justify-end mt-4"><button type="button" onClick={()=>setEditing(null)} className="px-4 py-2 border rounded">Cancel</button><button className="px-4 py-2 bg-tivro-dark text-white rounded">Save</button></div></form>
            ) : (
                <SortableList items={items} onReorder={handleReorder} keyExtractor={c=>c.id} className="grid grid-cols-1 md:grid-cols-3 gap-6" renderItem={(c)=>(<div className="bg-white p-6 rounded-xl border border-slate-200 relative group"><h3 className="font-bold">{c.title[lang]}</h3><div className="absolute top-2 right-2 hidden group-hover:flex gap-1"><button onClick={()=>setEditing(c)} className="p-1 bg-blue-50 text-blue-600 rounded"><Edit2 size={14}/></button><button onClick={()=>handleDelete(c.id)} className="p-1 bg-red-50 text-red-600 rounded"><Trash2 size={14}/></button></div></div>)}/>
            )}
        </SimpleManagerLayout>
    );
};

/* --- MAIN ADMIN LAYOUT & SIDEBAR --- */

export const Admin = () => {
  const { isAdmin, t, loading, dir } = useApp();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [refresh, setRefresh] = useState(0);
  
  // Sidebar State for Inline Editing
  const [settings, setSettings] = useState<SiteSettings | null>(null);
  const [editingSection, setEditingSection] = useState<string | null>(null);
  const [tempTitle, setTempTitle] = useState<{ar:string, en:string}>({ar:'', en:''});

  // Force fetch settings on mount/refresh
  useEffect(() => { 
      if(isAdmin) {
          db.settings.get().then(setSettings); 
      }
  }, [isAdmin, refresh]);

  const toggleVisibility = useCallback(async (key: string) => {
      if(!settings) return;
      const newVisibility = { ...settings.sectionVisibility, [key]: !settings.sectionVisibility[key] };
      const updatedSettings = { ...settings, sectionVisibility: newVisibility };
      setSettings(updatedSettings);

      try {
        await db.settings.save(updatedSettings);
      } catch (e) {
        console.error("Failed to save visibility", e);
        setSettings(settings); // Revert on error
      }
  }, [settings]);

  const startRename = useCallback((key: string, current: LocalizedString) => {
      setEditingSection(key);
      setTempTitle(current || {ar: '', en: ''});
  }, []);

  const saveRename = useCallback(async (key: string) => {
      if(!settings) return;
      
      let newHomeSections = { ...settings.homeSections };
      let newSectionTexts = { ...settings.sectionTexts };

      // Ensure we are updating the correct object key based on section
      if(key === 'services') newHomeSections.servicesTitle = tempTitle;
      else if(key === 'team') newHomeSections.teamTitle = tempTitle;
      else if(key === 'packages') newHomeSections.packagesTitle = tempTitle;
      else if(key === 'contact') newHomeSections.contactTitle = tempTitle;
      else if(key === 'work') newSectionTexts.workTitle = tempTitle;
      else if(key === 'hero') newHomeSections.heroTitle = tempTitle;

      const updatedSettings = { 
          ...settings, 
          homeSections: newHomeSections, 
          sectionTexts: newSectionTexts 
      };
      
      try {
          await db.settings.save(updatedSettings);
          setSettings(updatedSettings);
          setEditingSection(null);
      } catch (e) {
          console.error("Failed to save rename", e);
      }
  }, [settings, tempTitle]);

  const getSectionTitle = useCallback((key: string): LocalizedString => {
      if(!settings) return {ar:'', en:''};
      switch(key) {
          case 'services': return settings.homeSections.servicesTitle;
          case 'team': return settings.homeSections.teamTitle;
          case 'packages': return settings.homeSections.packagesTitle;
          case 'work': return settings.sectionTexts.workTitle;
          case 'contact': return settings.homeSections.contactTitle;
          case 'hero': return settings.homeSections.heroTitle;
          default: return {ar: key, en: key};
      }
  }, [settings]);

  if (!isAdmin) return <div className="p-20 text-center">Please login</div>;

  return (
    <Layout hideFooter>
      <div className="flex h-[calc(100vh-80px)] bg-slate-50" dir={dir}>
        <aside className="w-64 bg-white border-r border-slate-200 flex-shrink-0 hidden md:block overflow-y-auto shadow-sm z-10">
          <div className="p-6">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">القائمة الرئيسية</h3>
            <nav className="space-y-1">
              <AdminSidebarItem id="dashboard" icon={<ChartNoAxesColumn size={20}/>} label="نظرة عامة" activeTab={activeTab} setActiveTab={setActiveTab} />
              <AdminSidebarItem id="services" icon={<List size={20}/>} label="الخدمات" sectionKey="services" activeTab={activeTab} setActiveTab={setActiveTab} settings={settings} editingSection={editingSection} setEditingSection={setEditingSection} tempTitle={tempTitle} setTempTitle={setTempTitle} saveRename={saveRename} startRename={startRename} toggleVisibility={toggleVisibility} getSectionTitle={getSectionTitle} />
              <AdminSidebarItem id="work" icon={<Briefcase size={20}/>} label="أعمالنا" sectionKey="work" activeTab={activeTab} setActiveTab={setActiveTab} settings={settings} editingSection={editingSection} setEditingSection={setEditingSection} tempTitle={tempTitle} setTempTitle={setTempTitle} saveRename={saveRename} startRename={startRename} toggleVisibility={toggleVisibility} getSectionTitle={getSectionTitle} />
              <AdminSidebarItem id="packages" icon={<PackageIcon size={20}/>} label="الباقات" sectionKey="packages" activeTab={activeTab} setActiveTab={setActiveTab} settings={settings} editingSection={editingSection} setEditingSection={setEditingSection} tempTitle={tempTitle} setTempTitle={setTempTitle} saveRename={saveRename} startRename={startRename} toggleVisibility={toggleVisibility} getSectionTitle={getSectionTitle} />
              <AdminSidebarItem id="team" icon={<UsersIcon size={20}/>} label="الفريق" sectionKey="team" activeTab={activeTab} setActiveTab={setActiveTab} settings={settings} editingSection={editingSection} setEditingSection={setEditingSection} tempTitle={tempTitle} setTempTitle={setTempTitle} saveRename={saveRename} startRename={startRename} toggleVisibility={toggleVisibility} getSectionTitle={getSectionTitle} />
              <AdminSidebarItem id="blog" icon={<FileText size={20}/>} label="المدونة" sectionKey="blog" activeTab={activeTab} setActiveTab={setActiveTab} settings={settings} editingSection={editingSection} setEditingSection={setEditingSection} tempTitle={tempTitle} setTempTitle={setTempTitle} saveRename={saveRename} startRename={startRename} toggleVisibility={toggleVisibility} getSectionTitle={getSectionTitle} />
              <AdminSidebarItem id="messages" icon={<MessageCircle size={20}/>} label="رسائل التواصل" sectionKey="contact" activeTab={activeTab} setActiveTab={setActiveTab} settings={settings} editingSection={editingSection} setEditingSection={setEditingSection} tempTitle={tempTitle} setTempTitle={setTempTitle} saveRename={saveRename} startRename={startRename} toggleVisibility={toggleVisibility} getSectionTitle={getSectionTitle} />
              <AdminSidebarItem id="requests" icon={<Inbox size={20}/>} label="طلبات الباقات" activeTab={activeTab} setActiveTab={setActiveTab} />
              <AdminSidebarItem id="brand" icon={<PanelsTopLeft size={20}/>} label="مدير الصفحات" activeTab={activeTab} setActiveTab={setActiveTab} />
              <AdminSidebarItem id="settings" icon={<SettingsIcon size={20}/>} label="الإعدادات" activeTab={activeTab} setActiveTab={setActiveTab} />
            </nav>
          </div>
        </aside>

        {activeTab === 'dashboard' && <DashboardTab setActiveTab={setActiveTab} />}
        {activeTab === 'services' && <ServicesManager onUpdate={()=>setRefresh(p=>p+1)} />}
        {activeTab === 'packages' && <PackagesManager onUpdate={()=>setRefresh(p=>p+1)} />}
        {activeTab === 'team' && <TeamManager onUpdate={()=>setRefresh(p=>p+1)} />}
        {activeTab === 'work' && <CaseStudiesManager onUpdate={()=>setRefresh(p=>p+1)} />}
        {activeTab === 'requests' && <PackageRequestsManager onUpdate={()=>setRefresh(p=>p+1)} />}
        {activeTab === 'brand' && <div className="p-8 w-full"><BrandIdentity /></div>}
        {activeTab === 'settings' && <div className="p-8 w-full"><SettingsPage /></div>}
        
        {/* Fallback for tabs not yet implemented */}
        {['blog', 'messages'].includes(activeTab) && (
            <div className="p-8 flex items-center justify-center h-full text-slate-400">
                <div className="text-center">
                    <Loader2 className="animate-spin mx-auto mb-2"/>
                    <p>Loading module...</p>
                </div>
            </div>
        )}
      </div>
    </Layout>
  );
};
