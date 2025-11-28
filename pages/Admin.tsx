import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { db } from '../services/db';
import { supabase } from '../services/supabase';
import { Layout } from '../components/Layout';
import { Service, TeamMember, Package, CaseStudy, LocalizedString, BlogPost, ContactMessage } from '../types';
import { Plus, Trash2, Edit2, BarChart2, List, Settings as SettingsIcon, Users as UsersIcon, Package as PackageIcon, Briefcase, Loader2, FileText, MessageCircle, Type, CheckCircle, AlertCircle } from 'lucide-react';
import SettingsNewPage from './SettingsNew';
import { SortableList } from '../components/SortableList';
import { ImageWithFallback, DefaultTeamAvatar, DefaultCaseStudyImage, DefaultBlogImage } from '../components/DefaultIcons';

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
          <strong>System Status:</strong> Connected to Supabase. Drag & Drop Enabled.
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

  useEffect(() => {
      db.services.getAll().then(data => {
          setServices(data);
          setLoading(false);
      });
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault(); if (!editing) return; setSaving(true);
    await db.services.save(editing); setSaving(false); setEditing(null); onUpdate(); setServices(await db.services.getAll());
  };

  const handleDelete = async (id: string) => {
    if (confirm(t('admin.confirm'))) { await db.services.delete(id); onUpdate(); setServices(services.filter(s => s.id !== id)); }
  };

  const handleReorder = (newItems: Service[]) => {
      setServices(newItems);
      db.reorder('services', newItems);
  };

  const addFeature = () => editing && setEditing({...editing, features: [...(editing.features || []), {ar: '', en: ''}]});
  const updateFeature = (idx: number, field: 'ar'|'en', val: string) => {
      if(!editing) return; const feats = [...(editing.features || [])]; feats[idx] = {...feats[idx], [field]: val}; setEditing({...editing, features: feats});
  };
  const removeFeature = (idx: number) => editing && setEditing({...editing, features: (editing.features || []).filter((_, i) => i !== idx)});

  if (loading) return <div>{t('admin.loading')}</div>;

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-slate-800">{t('admin.tab.services')}</h2>
        <button onClick={() => setEditing({ id: 'new', title: {ar:'', en:''}, description: {ar:'', en:''}, iconName: 'Star', features: [{ar:'',en:''}] })} className="bg-tivro-primary text-white px-4 py-2 rounded-lg flex items-center gap-2 font-bold shadow-sm hover:bg-emerald-700 transition"><Plus size={18}/> {t('admin.btn.add')}</button>
      </div>
      {editing ? (
        <form onSubmit={handleSave} className="bg-white p-8 rounded-xl shadow-lg border border-slate-200 max-w-3xl mx-auto animate-fade-in">
           <h3 className="font-bold text-xl text-slate-800 mb-6 pb-4 border-b">{editing.id === 'new' ? t('admin.btn.add') : t('admin.btn.edit')}</h3>
           <div className="mb-6">
               <LocalizedInput label={t('admin.form.title_ar')} value={editing.title} onChange={v => setEditing({...editing, title: v})} />
               <LocalizedInput label={t('admin.form.desc_ar')} value={editing.description} onChange={v => setEditing({...editing, description: v})} />
               <div>
                   <label className="block text-xs font-bold text-slate-500 mb-1">{t('admin.form.icon')}</label>
                   <input className="w-full border p-3 rounded-lg outline-none" value={editing.iconName} onChange={e => setEditing({...editing, iconName: e.target.value})} />
               </div>
           </div>
           <div className="mb-8">
                <div className="flex justify-between items-center mb-3">
                    <label className="block text-sm font-bold text-slate-700">Features</label>
                    <button type="button" onClick={addFeature} className="text-xs bg-slate-100 px-3 py-1 rounded-full flex items-center gap-1 font-bold"><Plus size={14}/> Add</button>
                </div>
                <div className="space-y-3 bg-slate-50 p-4 rounded-xl border border-slate-100">
                    {(editing.features || []).map((f, i) => (
                        <div key={i} className="flex gap-3 items-start">
                            <div className="flex-1 grid grid-cols-2 gap-3">
                                <input className="border p-2 rounded text-sm outline-none" placeholder="Ar" value={f.ar} onChange={e=>updateFeature(i, 'ar', e.target.value)} required />
                                <input className="border p-2 rounded text-sm outline-none" placeholder="En" value={f.en} onChange={e=>updateFeature(i, 'en', e.target.value)} required />
                            </div>
                            <button type="button" onClick={()=>removeFeature(i)} className="text-red-500"><Trash2 size={18}/></button>
                        </div>
                    ))}
                </div>
           </div>
           <div className="flex gap-3 justify-end pt-4 border-t">
             <button type="button" onClick={() => setEditing(null)} className="px-6 py-2 text-slate-600 font-bold">{t('admin.btn.cancel')}</button>
             <button disabled={saving} type="submit" className="bg-tivro-dark text-white px-8 py-2 rounded-lg font-bold flex items-center gap-2">{saving && <Loader2 size={16} className="animate-spin"/>} {t('admin.btn.save')}</button>
           </div>
        </form>
      ) : (
        <SortableList
            items={services}
            onReorder={handleReorder}
            keyExtractor={(s) => s.id}
            className="grid grid-cols-1 md:grid-cols-3 gap-6"
            renderItem={(s) => (
                <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 relative group h-full">
                    <h3 className="font-bold text-lg text-slate-800 mb-2">{s.title[lang]}</h3>
                    <div className="absolute top-3 right-3 hidden group-hover:flex gap-1">
                        <button onClick={() => setEditing(s)} className="p-2 text-blue-600 hover:bg-blue-50 rounded"><Edit2 size={16}/></button>
                        <button onClick={() => handleDelete(s.id)} className="p-2 text-red-600 hover:bg-red-50 rounded"><Trash2 size={16}/></button>
                    </div>
                </div>
            )}
        />
      )}
    </div>
  );
};

const TeamManager: React.FC<ManagerProps> = ({ onUpdate }) => {
    const { t, lang } = useApp();
    const [team, setTeam] = useState<TeamMember[]>([]);
    const [editing, setEditing] = useState<TeamMember | null>(null);
    const [saving, setSaving] = useState(false);
    useEffect(() => { db.team.getAll().then(setTeam); }, []);
    const handleSave = async (e: React.FormEvent) => { e.preventDefault(); if (!editing) return; setSaving(true); await db.team.save(editing); setSaving(false); setEditing(null); onUpdate(); setTeam(await db.team.getAll()); };
    const handleDelete = async (id: string) => { if(confirm(t('admin.confirm'))) { await db.team.delete(id); onUpdate(); setTeam(team.filter(x=>x.id !== id)); }};
    
    const handleReorder = (newItems: TeamMember[]) => {
        setTeam(newItems);
        db.reorder('team_members', newItems);
    };

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-slate-800">{t('admin.tab.team')}</h2>
                <button onClick={() => setEditing({id:'new', name:{ar:'',en:''}, role:{ar:'',en:''}, image:''})} className="bg-tivro-primary text-white px-4 py-2 rounded-lg font-bold flex gap-2 shadow-sm hover:bg-emerald-700 transition"><Plus size={18}/>{t('admin.btn.add')}</button>
            </div>
            {editing ? (
                <form onSubmit={handleSave} className="bg-white p-8 rounded-xl shadow-lg border border-slate-200 max-w-3xl mx-auto animate-fade-in">
                     <h3 className="font-bold text-xl text-slate-800 mb-6 pb-4 border-b">{editing.id === 'new' ? t('admin.btn.add') : t('admin.btn.edit')}</h3>
                     <LocalizedInput label={t('admin.form.name_ar')} value={editing.name} onChange={v => setEditing({...editing, name: v})} />
                     <LocalizedInput label={t('admin.form.role_ar')} value={editing.role} onChange={v => setEditing({...editing, role: v})} />
                     <div className="mb-6">
                         <label className="block text-xs font-bold text-slate-500 mb-1">{t('admin.form.image')}</label>
                         <input className="w-full border p-3 rounded-lg outline-none" placeholder="Image URL" value={editing.image} onChange={e=>setEditing({...editing, image:e.target.value})} />
                     </div>
                     <div className="flex gap-3 justify-end pt-4 border-t">
                         <button type="button" onClick={()=>setEditing(null)} className="px-6 py-2 text-slate-600 font-bold">{t('admin.btn.cancel')}</button>
                         <button type="submit" disabled={saving} className="bg-tivro-dark text-white px-8 py-2 rounded-lg font-bold flex items-center gap-2">{saving && <Loader2 size={16} className="animate-spin"/>} {t('admin.btn.save')}</button>
                     </div>
                </form>
            ) : (
                <SortableList
                    items={team}
                    onReorder={handleReorder}
                    keyExtractor={(m) => m.id}
                    className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
                    renderItem={(m) => (
                        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 text-center relative group hover:-translate-y-1 transition duration-300 h-full">
                            <div className="w-24 h-24 mx-auto mb-4 rounded-full overflow-hidden border-4 border-slate-50 shadow-md">
                                <ImageWithFallback 
                                  src={m.image} 
                                  alt={m.name[lang]} 
                                  fallback={() => <DefaultTeamAvatar size={96} />}
                                  className="w-full h-full object-cover" 
                                />
                            </div>
                            <h3 className="font-bold text-lg text-slate-900">{m.name[lang]}</h3>
                            <p className="text-tivro-primary text-sm font-medium">{m.role[lang]}</p>
                            <div className="absolute top-3 right-3 hidden group-hover:flex bg-white/90 backdrop-blur shadow-sm rounded-lg border border-slate-100 p-1 z-10 gap-1">
                                <button onClick={()=>setEditing(m)} className="p-2 text-blue-600 hover:bg-blue-50 rounded-md transition"><Edit2 size={16}/></button>
                                <button onClick={()=>handleDelete(m.id)} className="p-2 text-red-600 hover:bg-red-50 rounded-md transition"><Trash2 size={16}/></button>
                            </div>
                        </div>
                    )}
                />
            )}
        </div>
    );
};

const PackagesManager: React.FC<ManagerProps> = ({ onUpdate }) => {
    const { t, lang } = useApp();
    const [items, setItems] = useState<Package[]>([]);
    const [editing, setEditing] = useState<Package | null>(null);
    const [saving, setSaving] = useState(false);
    useEffect(() => { db.packages.getAll().then(setItems); }, []);
    const handleSave = async (e: React.FormEvent) => { e.preventDefault(); if (!editing) return; setSaving(true); await db.packages.save(editing); setSaving(false); setEditing(null); onUpdate(); setItems(await db.packages.getAll()); };
    const handleDelete = async (id: string) => { if(confirm(t('admin.confirm'))) { await db.packages.delete(id); onUpdate(); setItems(items.filter(x=>x.id!==id)); }};
    
    const handleReorder = (newItems: Package[]) => {
        setItems(newItems);
        db.reorder('packages', newItems);
    };

    const addFeature = () => editing && setEditing({...editing, features: [...editing.features, {ar: '', en: ''}]});
    const updateFeature = (idx: number, field: 'ar'|'en', val: string) => { if(!editing) return; const feats = [...editing.features]; feats[idx] = {...feats[idx], [field]: val}; setEditing({...editing, features: feats}); };
    const removeFeature = (idx: number) => editing && setEditing({...editing, features: editing.features.filter((_, i) => i !== idx)});
    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-slate-800">{t('admin.tab.packages')}</h2>
                <button onClick={() => setEditing({id:'new', name:{ar:'',en:''}, price:'', features:[{ar:'', en:''}], isPopular: false})} className="bg-tivro-primary text-white px-4 py-2 rounded-lg font-bold flex gap-2 items-center shadow-sm hover:bg-emerald-700 transition"><Plus size={18}/>{t('admin.btn.add')}</button>
            </div>
            {editing ? (
                <form onSubmit={handleSave} className="bg-white p-8 rounded-xl shadow-lg border border-slate-200 max-w-3xl mx-auto animate-fade-in">
                     <div className="flex justify-between items-center mb-6 border-b pb-4">
                        <h3 className="font-bold text-xl text-slate-800">{editing.id === 'new' ? t('admin.btn.add') : t('admin.btn.edit')}</h3>
                        <div className="flex items-center gap-2">
                            <input type="checkbox" checked={editing.isPopular || false} onChange={e=>setEditing({...editing, isPopular: e.target.checked})} className="w-5 h-5 cursor-pointer"/>
                            <label className="font-bold text-slate-700 cursor-pointer">{t('admin.form.popular')}</label>
                        </div>
                     </div>
                     <div className="grid grid-cols-1 gap-6 mb-6">
                        <LocalizedInput label={t('admin.form.name_ar')} value={editing.name} onChange={v => setEditing({...editing, name: v})} />
                        <div><label className="block text-xs font-bold text-slate-500 mb-1">{t('admin.form.price')}</label><input className="w-full border p-3 rounded-lg font-bold text-lg" value={editing.price} onChange={e=>setEditing({...editing, price:e.target.value})} required /></div>
                     </div>
                     <div className="mb-8">
                        <div className="flex justify-between items-center mb-3"><label className="block text-sm font-bold text-slate-700">Features</label><button type="button" onClick={addFeature} className="text-xs bg-slate-100 px-3 py-1 rounded-full flex items-center gap-1 font-bold"><Plus size={14}/> Add</button></div>
                        <div className="space-y-3 bg-slate-50 p-4 rounded-xl border border-slate-100">
                            {editing.features.map((f, i) => (
                                <div key={i} className="flex gap-3 items-start">
                                    <div className="flex-1 grid grid-cols-2 gap-3"><input className="border p-2 rounded text-sm" value={f.ar} onChange={e=>updateFeature(i, 'ar', e.target.value)} required /><input className="border p-2 rounded text-sm" value={f.en} onChange={e=>updateFeature(i, 'en', e.target.value)} required /></div>
                                    <button type="button" onClick={()=>removeFeature(i)} className="text-red-500"><Trash2 size={18}/></button>
                                </div>
                            ))}
                        </div>
                     </div>
                     <div className="flex gap-3 justify-end pt-4 border-t">
                        <button type="button" onClick={()=>setEditing(null)} className="px-6 py-2 text-slate-600 font-bold">{t('admin.btn.cancel')}</button>
                        <button type="submit" disabled={saving} className="bg-tivro-dark text-white px-8 py-2 rounded-lg font-bold flex items-center gap-2">{saving && <Loader2 size={18}/>} {t('admin.btn.save')}</button>
                     </div>
                </form>
            ) : (
                <SortableList
                    items={items}
                    onReorder={handleReorder}
                    keyExtractor={(p) => p.id}
                    className="grid grid-cols-1 md:grid-cols-3 gap-6"
                    renderItem={(p) => (
                        <div className={`bg-white rounded-xl p-6 relative group transition-all duration-300 hover:-translate-y-1 h-full ${p.isPopular ? 'border-2 border-tivro-primary shadow-xl' : 'border border-slate-200 shadow-sm hover:shadow-md'}`}>
                            {p.isPopular && <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-tivro-primary text-white text-xs font-bold px-3 py-1 rounded-full shadow-sm">{t('admin.form.popular')}</div>}
                            <div className="text-center mb-4 pt-2"><h3 className="font-bold text-xl text-slate-800 mb-1">{p.name[lang]}</h3><div className="text-3xl font-bold text-tivro-dark">{p.price}</div></div>
                            <div className="absolute top-3 right-3 hidden group-hover:flex gap-1"><button onClick={()=>setEditing(p)} className="p-2 text-blue-600 hover:bg-blue-50 rounded"><Edit2 size={16}/></button><button onClick={()=>handleDelete(p.id)} className="p-2 text-red-600 hover:bg-red-50 rounded"><Trash2 size={16}/></button></div>
                        </div>
                    )}
                />
            )}
        </div>
    );
};

const CaseStudiesManager: React.FC<ManagerProps> = ({ onUpdate }) => {
    const { t, lang } = useApp();
    const [items, setItems] = useState<CaseStudy[]>([]);
    const [editing, setEditing] = useState<CaseStudy | null>(null);
    const [saving, setSaving] = useState(false);
    const [sectionSettings, setSectionSettings] = useState<any>({workTitle: {ar:'', en:''}, workSubtitle: {ar:'', en:''}});
    const [settingsSaving, setSettingsSaving] = useState(false);

    useEffect(() => { 
        db.caseStudies.getAll().then(setItems); 
        db.settings.get().then(s => {
            if(s?.sectionTexts) setSectionSettings(s.sectionTexts);
        });
    }, []);

    const handleSave = async (e: React.FormEvent) => { e.preventDefault(); if (!editing) return; setSaving(true); await db.caseStudies.save(editing); setSaving(false); setEditing(null); onUpdate(); setItems(await db.caseStudies.getAll()); };
    const handleDelete = async (id: string) => { if(confirm(t('admin.confirm'))) { await db.caseStudies.delete(id); onUpdate(); setItems(items.filter(x=>x.id!==id)); }};
    
    const handleReorder = (newItems: CaseStudy[]) => {
        setItems(newItems);
        db.reorder('case_studies', newItems);
    };

    const saveSectionSettings = async () => {
        setSettingsSaving(true);
        const currentSettings = await db.settings.get();
        if(currentSettings) {
            await db.settings.save({...currentSettings, sectionTexts: sectionSettings});
            alert(t('admin.settings.saved'));
        }
        setSettingsSaving(false);
    };

    // --- Dynamic Stats Logic ---
    const addStat = () => {
        if (!editing) return;
        const currentStats = editing.stats || [];
        setEditing({...editing, stats: [...currentStats, { label: {ar:'', en:''}, value: '' }]});
    };

    const updateStat = (idx: number, field: 'value' | 'labelAr' | 'labelEn', val: string) => {
        if(!editing || !editing.stats) return;
        const newStats = [...editing.stats];
        if(field === 'value') newStats[idx].value = val;
        else if(field === 'labelAr') newStats[idx].label = { ...newStats[idx].label, ar: val };
        else if(field === 'labelEn') newStats[idx].label = { ...newStats[idx].label, en: val };
        setEditing({...editing, stats: newStats});
    };

    const removeStat = (idx: number) => {
        if(!editing || !editing.stats) return;
        setEditing({...editing, stats: editing.stats.filter((_, i) => i !== idx)});
    };

    return (
        <div>
             {/* Section Texts Editor */}
             <div className="bg-slate-50 p-6 rounded-xl border border-slate-200 mb-8">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="font-bold text-lg text-slate-700 flex items-center gap-2"><Type size={18}/> {t('admin.section.settings')}</h3>
                    <button onClick={saveSectionSettings} disabled={settingsSaving} className="text-sm bg-slate-800 text-white px-4 py-2 rounded-lg font-bold hover:bg-slate-900 flex items-center gap-2">
                        {settingsSaving && <Loader2 size={12} className="animate-spin"/>} {t('admin.btn.save')}
                    </button>
                </div>
                <LocalizedInput label={t('admin.set.work_title_ar')} value={sectionSettings.workTitle} onChange={v => setSectionSettings({...sectionSettings, workTitle: v})} />
                <LocalizedInput label={t('admin.set.work_sub_ar')} value={sectionSettings.workSubtitle} onChange={v => setSectionSettings({...sectionSettings, workSubtitle: v})} />
            </div>

            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-slate-800">{t('admin.tab.work')}</h2>
                <button onClick={() => setEditing({id:'new', title:{ar:'',en:''}, client:'', category:{ar:'',en:''}, result:{ar:'',en:''}, image:'', stats:[]})} className="bg-tivro-primary text-white px-4 py-2 rounded-lg font-bold flex gap-2 shadow-sm hover:bg-emerald-700 transition"><Plus size={18}/>{t('admin.btn.add')}</button>
            </div>
            
            {editing ? (
                <form onSubmit={handleSave} className="bg-white p-8 rounded-xl shadow-lg border border-slate-200 max-w-3xl mx-auto animate-fade-in">
                     <h3 className="font-bold text-xl text-slate-800 mb-6 pb-4 border-b">{editing.id === 'new' ? t('admin.btn.add') : t('admin.btn.edit')}</h3>
                     
                     {/* Basic Info */}
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                        <div><label className="block text-xs font-bold text-slate-500 mb-1">{t('admin.form.client')}</label><input className="w-full border p-2 rounded" value={editing.client} onChange={e=>setEditing({...editing, client:e.target.value})} /></div>
                        <div><label className="block text-xs font-bold text-slate-500 mb-1">{t('admin.form.image')}</label><input className="w-full border p-2 rounded" value={editing.image} onChange={e=>setEditing({...editing, image:e.target.value})} /></div>
                     </div>

                     <LocalizedInput label={t('admin.form.title_ar')} value={editing.title} onChange={v => setEditing({...editing, title: v})} />
                     <LocalizedInput label={t('admin.form.category_ar')} value={editing.category} onChange={v => setEditing({...editing, category: v})} />
                     <LocalizedInput label="النتيجة / Result (e.g. زيادة المبيعات 200%)" value={editing.result} onChange={v => setEditing({...editing, result: v})} />

                     {/* Stats Management */}
                     <div className="mt-6 mb-6 bg-slate-50 p-4 rounded-xl border border-slate-200">
                        <div className="flex justify-between items-center mb-3">
                            <label className="font-bold text-slate-700">الإحصائيات (Stats)</label>
                            <button type="button" onClick={addStat} className="text-xs bg-white border px-3 py-1 rounded-full flex items-center gap-1 hover:bg-slate-100"><Plus size={12}/> إضافة رقم</button>
                        </div>
                        {(editing.stats || []).map((stat, i) => (
                            <div key={i} className="flex gap-2 items-center mb-2">
                                <input className="w-24 border p-2 rounded text-sm font-bold" placeholder="Value (e.g 200%)" value={stat.value} onChange={e=>updateStat(i, 'value', e.target.value)} />
                                <input className="flex-1 border p-2 rounded text-sm" placeholder="Label (Ar)" value={stat.label.ar} onChange={e=>updateStat(i, 'labelAr', e.target.value)} />
                                <input className="flex-1 border p-2 rounded text-sm" placeholder="Label (En)" value={stat.label.en} onChange={e=>updateStat(i, 'labelEn', e.target.value)} />
                                <button type="button" onClick={()=>removeStat(i)} className="text-red-500 p-2 bg-white rounded border hover:bg-red-50"><Trash2 size={16}/></button>
                            </div>
                        ))}
                        {(!editing.stats || editing.stats.length === 0) && <p className="text-xs text-slate-400 italic">لا توجد إحصائيات مضافة لهذا العمل.</p>}
                     </div>

                     <div className="flex gap-3 justify-end pt-4 border-t">
                        <button type="button" onClick={()=>setEditing(null)} className="px-6 py-2 text-slate-600 font-bold">{t('admin.btn.cancel')}</button>
                        <button type="submit" disabled={saving} className="bg-tivro-dark text-white px-8 py-2 rounded-lg font-bold flex items-center gap-2">{saving && <Loader2 size={16} className="animate-spin"/>} {t('admin.btn.save')}</button>
                     </div>
                </form>
            ) : (
                <SortableList
                    items={items}
                    onReorder={handleReorder}
                    keyExtractor={(c) => c.id}
                    className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                    renderItem={(c) => (
                        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden group relative hover:shadow-md transition duration-300 h-full">
                            <div className="h-40 w-full overflow-hidden relative">
                                <ImageWithFallback 
                                  src={c.image} 
                                  alt={c.title[lang]} 
                                  fallback={() => <DefaultCaseStudyImage className="w-full h-full" />}
                                  className="w-full h-full object-cover group-hover:scale-110 transition duration-500"
                                />
                                <div className="absolute bottom-0 left-0 w-full bg-gradient-to-t from-black/70 to-transparent p-4">
                                    <span className="text-tivro-primary text-xs font-bold bg-black/50 px-2 py-1 rounded">{c.category[lang]}</span>
                                </div>
                            </div>
                            <div className="p-4">
                                <h3 className="font-bold text-slate-800 mb-1">{c.title[lang]}</h3>
                                <p className="text-sm text-slate-500 mb-3 line-clamp-2">{c.result[lang]}</p>
                                <div className="flex flex-wrap gap-2">
                                    {(c.stats || []).map((s, idx) => (
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
                    )}
                />
            )}
        </div>
    );
};

const BlogManager: React.FC<ManagerProps> = ({ onUpdate }) => {
    const { t, lang } = useApp();
    const [posts, setPosts] = useState<BlogPost[]>([]);
    const [editing, setEditing] = useState<BlogPost | null>(null);
    const [saving, setSaving] = useState(false);
    
    useEffect(() => { db.blog.getAll().then(setPosts); }, []);
    
    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault(); if(!editing) return; setSaving(true);
        await db.blog.save(editing); setSaving(false); setEditing(null); onUpdate(); setPosts(await db.blog.getAll());
    };
    const handleDelete = async (id: string) => { if(confirm(t('admin.confirm'))) { await db.blog.delete(id); onUpdate(); setPosts(posts.filter(x=>x.id!==id)); }};

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-slate-800">{t('admin.tab.blog')}</h2>
                <button onClick={() => setEditing({id:'new', title:{ar:'',en:''}, excerpt:{ar:'',en:''}, content:{ar:'',en:''}, image:'', author:'Admin', date: new Date().toISOString().split('T')[0]})} className="bg-tivro-primary text-white px-4 py-2 rounded-lg font-bold flex gap-2 shadow-sm hover:bg-emerald-700 transition"><Plus size={18}/>{t('admin.btn.add')}</button>
            </div>
            {editing ? (
                <form onSubmit={handleSave} className="bg-white p-8 rounded-xl shadow-lg border border-slate-200 max-w-3xl mx-auto animate-fade-in">
                     <h3 className="font-bold text-xl text-slate-800 mb-6 pb-4 border-b">{editing.id === 'new' ? t('admin.btn.add') : t('admin.btn.edit')}</h3>
                     <LocalizedInput label={t('admin.form.title_ar')} value={editing.title} onChange={v => setEditing({...editing, title: v})} />
                     <LocalizedInput label={t('admin.form.excerpt_ar')} value={editing.excerpt} onChange={v => setEditing({...editing, excerpt: v})} />
                     <div className="grid grid-cols-2 gap-4 mb-4">
                         <div>
                             <label className="block text-xs font-bold text-slate-500 mb-1">{t('admin.form.content_ar')}</label>
                             <textarea className="w-full border p-2 rounded h-32" value={editing.content.ar} onChange={e => setEditing({...editing, content: {...editing.content, ar: e.target.value}})} />
                         </div>
                         <div>
                             <label className="block text-xs font-bold text-slate-500 mb-1">{t('admin.form.content_en')}</label>
                             <textarea className="w-full border p-2 rounded h-32" value={editing.content.en} onChange={e => setEditing({...editing, content: {...editing.content, en: e.target.value}})} />
                         </div>
                     </div>
                     <div className="grid grid-cols-2 gap-4 mb-6">
                        <div>
                            <label className="block text-xs font-bold text-slate-500 mb-1">{t('admin.form.image')}</label>
                            <input className="w-full border p-2 rounded" value={editing.image} onChange={e=>setEditing({...editing, image:e.target.value})} />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-500 mb-1">{t('admin.form.date')}</label>
                            <input type="date" className="w-full border p-2 rounded" value={editing.date} onChange={e=>setEditing({...editing, date:e.target.value})} />
                        </div>
                     </div>
                     <div className="flex gap-3 justify-end pt-4 border-t">
                        <button type="button" onClick={()=>setEditing(null)} className="px-6 py-2 text-slate-600 font-bold">{t('admin.btn.cancel')}</button>
                        <button type="submit" disabled={saving} className="bg-tivro-dark text-white px-8 py-2 rounded-lg font-bold flex items-center gap-2">{saving && <Loader2 size={16} className="animate-spin"/>} {t('admin.btn.save')}</button>
                     </div>
                </form>
            ) : (
                <div className="space-y-4">
                    {posts.map(p => (
                        <div key={p.id} className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 flex items-center justify-between group">
                            <div className="flex items-center gap-4">
                                <div className="w-16 h-16 bg-slate-100 rounded-lg overflow-hidden flex-shrink-0">
                                    <ImageWithFallback 
                                      src={p.image} 
                                      alt={p.title[lang]} 
                                      fallback={() => <DefaultBlogImage className="w-full h-full" />}
                                      className="w-full h-full object-cover" 
                                    />
                                </div>
                                <div>
                                    <h3 className="font-bold text-slate-800">{p.title[lang]}</h3>
                                    <p className="text-sm text-slate-500">{p.date} • {p.author}</p>
                                </div>
                            </div>
                            <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition">
                                <button onClick={()=>setEditing(p)} className="p-2 text-blue-600 hover:bg-blue-50 rounded"><Edit2 size={18}/></button>
                                <button onClick={()=>handleDelete(p.id)} className="p-2 text-red-600 hover:bg-red-50 rounded"><Trash2 size={18}/></button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

const MessagesManager: React.FC<ManagerProps> = ({ onUpdate }) => {
    const { t } = useApp();
    const [messages, setMessages] = useState<ContactMessage[]>([]);
    
    useEffect(() => { db.messages.getAll().then(setMessages); }, []);

    const handleDelete = async (id: string) => {
        if(confirm(t('admin.confirm'))) {
            await db.messages.delete(id);
            onUpdate();
            setMessages(messages.filter(m => m.id !== id));
        }
    };

    return (
        <div>
            <h2 className="text-2xl font-bold text-slate-800 mb-6">{t('admin.tab.messages')}</h2>
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                <table className="w-full text-sm text-left">
                    <thead className="bg-slate-50 text-slate-500 font-bold border-b border-slate-200">
                        <tr>
                            <th className="p-4">{t('admin.messages.name')}</th>
                            <th className="p-4">{t('admin.messages.phone')}</th>
                            <th className="p-4">{t('admin.messages.date')}</th>
                            <th className="p-4"></th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {messages.map(m => (
                            <tr key={m.id} className="hover:bg-slate-50">
                                <td className="p-4 font-medium text-slate-900">{m.name}</td>
                                <td className="p-4 text-slate-600" dir="ltr">{m.phone}</td>
                                <td className="p-4 text-slate-500">{new Date(m.createdAt).toLocaleDateString()}</td>
                                <td className="p-4 text-right">
                                    <button onClick={()=>handleDelete(m.id)} className="text-red-500 hover:bg-red-50 p-2 rounded"><Trash2 size={16}/></button>
                                </td>
                            </tr>
                        ))}
                        {messages.length === 0 && (
                            <tr><td colSpan={4} className="p-8 text-center text-slate-400 italic">No messages found.</td></tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

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
          {activeTab === 'settings' && <SettingsNewPage />}
        </main>
      </div>
    </Layout>
  );
};