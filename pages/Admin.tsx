import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { SettingsProvider } from '../context/SettingsContext';
import { db } from '../services/db';
import { supabase } from '../services/supabase';
import { Layout } from '../components/Layout';
import { Service, TeamMember, Package, CaseStudy, LocalizedString, BlogPost, ContactMessage } from '../types';
import { Plus, Trash2, Edit2, BarChart2, List, Settings as SettingsIcon, Users as UsersIcon, Package as PackageIcon, Briefcase, Loader2, FileText, MessageCircle, Type, CheckCircle, AlertCircle, Phone, MessageSquare, Layout as LayoutIcon, Eye, EyeOff, Star } from 'lucide-react';
import SettingsNewPage from './SettingsNew';
import { SortableList } from '../components/SortableList';
import { ImageWithFallback, DefaultTeamAvatar, DefaultCaseStudyImage, DefaultBlogImage } from '../components/DefaultIcons';
import ContactUsManager from '../components/ContactUsManager';
import { PageManager } from '../components/PageManager';

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

const SidebarLink = ({ icon, label, active, onClick, editable = false, onLabelChange, visible = true, onVisibilityToggle }: any) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(label);

  const handleLabelClick = (e: React.MouseEvent) => {
    if (editable) {
      e.stopPropagation();
      setIsEditing(true);
      setEditValue(label);
    }
  };

  const handleLabelSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (onLabelChange && editValue.trim() !== label) {
      onLabelChange(editValue.trim());
    }
    setIsEditing(false);
  };

  const handleLabelKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      setIsEditing(false);
      setEditValue(label);
    }
  };

  const handleVisibilityToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onVisibilityToggle) {
      onVisibilityToggle();
    }
  };

  return (
    <button 
      onClick={onClick}
      className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition ${active ? 'bg-tivro-primary/10 text-tivro-primary' : 'text-slate-600 hover:bg-slate-50'}`}
    >
      {icon}
      {isEditing && editable ? (
        <form onSubmit={handleLabelSubmit} className="flex-1">
          <input
            type="text"
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            onBlur={handleLabelSubmit}
            onKeyDown={handleLabelKeyDown}
            className="flex-1 bg-transparent border-b border-tivro-primary outline-none text-inherit"
            autoFocus
          />
        </form>
      ) : (
        <span 
          onClick={handleLabelClick}
          className={`flex-1 text-left ${editable ? 'cursor-text hover:text-tivro-primary' : ''}`}
        >
          {label}
        </span>
      )}
      {editable && (
        <button
          onClick={handleVisibilityToggle}
          className={`p-1 rounded hover:bg-slate-200 transition ${visible ? 'text-slate-600' : 'text-slate-300'}`}
          title={visible ? 'إخفاء' : 'إظهار'}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
            <circle cx="12" cy="12" r="3"/>
          </svg>
        </button>
      )}
    </button>
  );
};

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
    
    useEffect(() => {
        const loadTeam = async () => {
            // محاولة تحميل الترتيب المحفوظ من LocalStorage أولاً
            const savedOrder = localStorage.getItem('tivro_team_order');
            if (savedOrder) {
                try {
                    const orderedIds = JSON.parse(savedOrder);
                    const allTeam = await db.team.getAll();
                    // ترتيب الفريق حسب الترتيب المحفوظ
                    const orderedTeam = orderedIds.map((id: string) => 
                        allTeam.find(member => member.id === id)
                    ).filter(Boolean) as TeamMember[];
                    // إضافة الأعضاء الجديد غير المرتبين في النهاية
                    const newMembers = allTeam.filter(member => !orderedIds.includes(member.id));
                    setTeam([...orderedTeam, ...newMembers]);
                } catch (error) {
                    console.error('Failed to load saved team order:', error);
                    // في حالة الخطأ، تحميل الترتيب الافتراضي
                    db.team.getAll().then(setTeam);
                }
            } else {
                db.team.getAll().then(setTeam);
            }
        };
        loadTeam();
    }, []);
    
    const handleSave = async (e: React.FormEvent) => { e.preventDefault(); if (!editing) return; setSaving(true); await db.team.save(editing); setSaving(false); setEditing(null); onUpdate(); setTeam(await db.team.getAll()); };
    const handleDelete = async (id: string) => { if(confirm(t('admin.confirm'))) { await db.team.delete(id); onUpdate(); setTeam(team.filter(x=>x.id !== id)); }};
    
    const handleReorder = async (newItems: TeamMember[]) => {
        setTeam(newItems);
        // حفظ الترتيب الجديد في LocalStorage فوراً
        const newOrder = newItems.map(item => item.id);
        localStorage.setItem('tivro_team_order', JSON.stringify(newOrder));
        
        // حفظ الترتيب الجديد في قاعدة البيانات أيضاً
        try {
            await db.reorder('team_members', newItems);
            console.log('✅ Team order saved successfully to both LocalStorage and Database');
        } catch (error) {
            console.error('❌ Failed to save team order to database:', error);
            // الترتيب محفوظ في LocalStorage على الأقل
        }
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
                        <div className={`relative group transition-all duration-300 ${p.isPopular ? 'scale-105' : ''}`}>
                            {/* Popular Badge */}
                            {p.isPopular && (
                                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 z-10">
                                    <div className="bg-gradient-to-r from-tivro-primary to-emerald-600 text-white text-sm font-bold px-4 py-2 rounded-full shadow-lg flex items-center gap-2">
                                        <Star size={16} className="fill-current" />
                                        {t('admin.form.popular')}
                                    </div>
                                </div>
                            )}
                            
                            {/* Package Card */}
                            <div className={`bg-white rounded-2xl p-8 h-full relative overflow-hidden transition-all duration-300 hover:-translate-y-2 ${
                                p.isPopular 
                                    ? 'border-2 border-tivro-primary shadow-2xl ring-4 ring-tivro-primary/10' 
                                    : 'border border-slate-200 shadow-lg hover:shadow-xl'
                            }`}>
                                {/* Background Pattern for Popular */}
                                {p.isPopular && (
                                    <div className="absolute top-0 right-0 w-32 h-32 bg-tivro-primary/5 rounded-full -mr-16 -mt-16"></div>
                                )}
                                
                                {/* Header */}
                                <div className="text-center mb-6 relative z-10">
                                    <div className={`inline-block px-4 py-2 rounded-full text-sm font-bold mb-4 ${
                                        p.isPopular 
                                            ? 'bg-tivro-primary text-white' 
                                            : 'bg-slate-100 text-slate-600'
                                    }`}>
                                        {p.id === 'new' ? 'باقة جديدة' : 'باقة مميزة'}
                                    </div>
                                    <h3 className={`text-2xl font-bold mb-3 ${
                                        p.isPopular ? 'text-tivro-primary' : 'text-slate-800'
                                    }`}>
                                        {p.name[lang]}
                                    </h3>
                                    <div className="flex items-center justify-center gap-2 mb-4">
                                        <span className="text-4xl font-bold text-slate-900">{p.price}</span>
                                        <span className="text-slate-500 font-medium">/شهرياً</span>
                                    </div>
                                </div>
                                
                                {/* Features List */}
                                <div className="space-y-3 mb-6">
                                    {p.features.slice(0, 3).map((feature, idx) => (
                                        <div key={idx} className="flex items-center gap-3">
                                            <div className={`w-2 h-2 rounded-full ${
                                                p.isPopular ? 'bg-tivro-primary' : 'bg-slate-300'
                                            }`}></div>
                                            <span className="text-slate-600 text-sm">{feature[lang]}</span>
                                        </div>
                                    ))}
                                    {p.features.length > 3 && (
                                        <div className="text-center text-sm text-slate-500 font-medium">
                                            +{p.features.length - 3} ميزات أخرى
                                        </div>
                                    )}
                                </div>
                                
                                {/* Action Buttons */}
                                <div className="flex gap-2 justify-center relative z-20">
                                    <button 
                                        onClick={() => setEditing(p)}
                                        className={`px-4 py-2 rounded-lg font-bold transition-all duration-200 flex items-center gap-2 relative z-20 ${
                                            p.isPopular
                                                ? 'bg-tivro-primary text-white hover:bg-emerald-600'
                                                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                                        }`}
                                    >
                                        <Edit2 size={16} />
                                        تعديل
                                    </button>
                                    <button 
                                        onClick={() => handleDelete(p.id)}
                                        className="px-4 py-2 rounded-lg font-bold bg-red-50 text-red-600 hover:bg-red-100 transition-all duration-200 flex items-center gap-2 relative z-20"
                                    >
                                        <Trash2 size={16} />
                                        حذف
                                    </button>
                                </div>
                                
                                {/* Hover Effect Overlay */}
                                <div className="absolute inset-0 bg-gradient-to-t from-black/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl pointer-events-none"></div>
                            </div>
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

const DashboardOverview: React.FC<{ setActiveTab: (tab: string) => void }> = ({ setActiveTab }) => {
    const { t, lang } = useApp();
    const [stats, setStats] = useState({
        services: 0,
        team: 0,
        packages: 0,
        caseStudies: 0,
        blog: 0,
        messages: 0
    });

    useEffect(() => {
        const loadStats = async () => {
            const [
                services,
                team,
                packages,
                caseStudies,
                blog,
                messages
            ] = await Promise.all([
                db.services.getAll(),
                db.team.getAll(),
                db.packages.getAll(),
                db.caseStudies.getAll(),
                db.blog.getAll(),
                db.messages.getAll()
            ]);

            setStats({
                services: services.length,
                team: team.length,
                packages: packages.length,
                caseStudies: caseStudies.length,
                blog: blog.length,
                messages: messages.length
            });
        };

        loadStats();
    }, []);

    const statCards = [
        { 
            key: 'services', 
            icon: <List size={24} />, 
            color: 'bg-blue-500', 
            label: t('admin.tab.services'),
            count: stats.services
        },
        { 
            key: 'team', 
            icon: <UsersIcon size={24} />, 
            color: 'bg-green-500', 
            label: t('admin.tab.team'),
            count: stats.team
        },
        { 
            key: 'packages', 
            icon: <PackageIcon size={24} />, 
            color: 'bg-purple-500', 
            label: t('admin.tab.packages'),
            count: stats.packages
        },
        { 
            key: 'caseStudies', 
            icon: <Briefcase size={24} />, 
            color: 'bg-orange-500', 
            label: t('admin.tab.work'),
            count: stats.caseStudies
        },
        { 
            key: 'blog', 
            icon: <FileText size={24} />, 
            color: 'bg-pink-500', 
            label: t('admin.tab.blog'),
            count: stats.blog
        },
        { 
            key: 'messages', 
            icon: <MessageCircle size={24} />, 
            color: 'bg-red-500', 
            label: t('admin.tab.messages'),
            count: stats.messages
        }
    ];

    return (
        <div>
            <h1 className="text-3xl font-bold text-slate-800 mb-8">{t('admin.tab.dashboard')}</h1>
            
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                {statCards.map((card) => (
                    <div key={card.key} className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 hover:shadow-md transition-shadow">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-slate-600 mb-1">{card.label}</p>
                                <p className="text-3xl font-bold text-slate-900">{card.count}</p>
                            </div>
                            <div className={`${card.color} p-3 rounded-lg text-white`}>
                                {card.icon}
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                <h2 className="text-xl font-bold text-slate-800 mb-4">إجراءات سريعة</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <button 
                        onClick={() => setActiveTab('services')}
                        className="flex items-center gap-3 p-4 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors"
                    >
                        <List size={20} />
                        <span className="font-medium">إضافة خدمة جديدة</span>
                    </button>
                    <button 
                        onClick={() => setActiveTab('team')}
                        className="flex items-center gap-3 p-4 bg-green-50 text-green-700 rounded-lg hover:bg-green-100 transition-colors"
                    >
                        <UsersIcon size={20} />
                        <span className="font-medium">إضافة عضو فريق</span>
                    </button>
                    <button 
                        onClick={() => setActiveTab('packages')}
                        className="flex items-center gap-3 p-4 bg-purple-50 text-purple-700 rounded-lg hover:bg-purple-100 transition-colors"
                    >
                        <PackageIcon size={20} />
                        <span className="font-medium">إضافة باقة جديدة</span>
                    </button>
                    <button 
                        onClick={() => setActiveTab('work')}
                        className="flex items-center gap-3 p-4 bg-orange-50 text-orange-700 rounded-lg hover:bg-orange-100 transition-colors"
                    >
                        <Briefcase size={20} />
                        <span className="font-medium">إضافة عمل جديد</span>
                    </button>
                    <button 
                        onClick={() => setActiveTab('blog')}
                        className="flex items-center gap-3 p-4 bg-pink-50 text-pink-700 rounded-lg hover:bg-pink-100 transition-colors"
                    >
                        <FileText size={20} />
                        <span className="font-medium">إضافة مقال جديد</span>
                    </button>
                    <button 
                        onClick={() => setActiveTab('settings')}
                        className="flex items-center gap-3 p-4 bg-slate-50 text-slate-700 rounded-lg hover:bg-slate-100 transition-colors"
                    >
                        <SettingsIcon size={20} />
                        <span className="font-medium">إعدادات الموقع</span>
                    </button>
                </div>
            </div>
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
  const { isAdmin, t, loading, dir, lang } = useApp();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [activeTab, setActiveTab] = useState<'dashboard' | 'services' | 'team' | 'packages' | 'work' | 'blog' | 'contact' | 'messages' | 'settings' | 'pages'>('dashboard');
  const [refresh, setRefresh] = useState(0);
  const [authError, setAuthError] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  // Navigation state for editable sidebar
  const [navigationItems, setNavigationItems] = useState([
    { key: 'dashboard', label: t('admin.tab.dashboard'), visible: true },
    { key: 'services', label: t('admin.tab.services'), visible: true },
    { key: 'team', label: t('admin.tab.team'), visible: true },
    { key: 'packages', label: t('admin.tab.packages'), visible: true },
    { key: 'work', label: t('admin.tab.work'), visible: true },
    { key: 'blog', label: t('admin.tab.blog'), visible: true },
    { key: 'contact', label: lang === 'ar' ? 'تواصل معنا' : 'Contact Us', visible: true },
    { key: 'messages', label: t('admin.tab.messages'), visible: true },
    { key: 'pages', label: lang === 'ar' ? 'مدير الصفحات' : 'Page Manager', visible: true },
    { key: 'settings', label: t('admin.tab.settings'), visible: true }
  ]);

  // Load navigation state from localStorage
  useEffect(() => {
    const savedNavigation = localStorage.getItem('adminNavigation');
    if (savedNavigation) {
      try {
        setNavigationItems(JSON.parse(savedNavigation));
      } catch (error) {
        console.error('Failed to load navigation state:', error);
      }
    }
  }, []);

  // Save navigation state to localStorage
  const saveNavigationState = (newItems: typeof navigationItems) => {
    setNavigationItems(newItems);
    localStorage.setItem('adminNavigation', JSON.stringify(newItems));
  };

  const updateNavigationLabel = (key: string, newLabel: string) => {
    const newItems = navigationItems.map(item => 
      item.key === key ? { ...item, label: newLabel } : item
    );
    saveNavigationState(newItems);
    
    // Trigger immediate update in Home page
    window.dispatchEvent(new CustomEvent('adminNavigationUpdated', { detail: { navigationItems: newItems } }));
    
    // Also trigger storage event for cross-tab sync
    window.localStorage.setItem('adminNavigation', JSON.stringify(newItems));
    window.dispatchEvent(new StorageEvent('storage', {
      key: 'adminNavigation',
      newValue: JSON.stringify(newItems)
    }));
  };

  const toggleNavigationVisibility = (key: string) => {
    const newItems = navigationItems.map(item => 
      item.key === key ? { ...item, visible: !item.visible } : item
    );
    saveNavigationState(newItems);
    
    // Trigger immediate update in Home page
    window.dispatchEvent(new CustomEvent('adminNavigationUpdated', { detail: { navigationItems: newItems } }));
    
    // Also trigger storage event for cross-tab sync
    window.localStorage.setItem('adminNavigation', JSON.stringify(newItems));
    window.dispatchEvent(new StorageEvent('storage', {
      key: 'adminNavigation',
      newValue: JSON.stringify(newItems)
    }));
  };

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

  const getIconForItem = (key: string) => {
    switch (key) {
      case 'dashboard': return <BarChart2 size={20}/>;
      case 'services': return <List size={20}/>;
      case 'team': return <UsersIcon size={20}/>;
      case 'packages': return <PackageIcon size={20}/>;
      case 'work': return <Briefcase size={20}/>;
      case 'blog': return <FileText size={20}/>;
      case 'contact': return <Phone size={20}/>;
      case 'messages': return <MessageCircle size={20}/>;
      case 'pages': return <LayoutIcon size={20}/>;
      case 'settings': return <SettingsIcon size={20}/>;
      default: return <LayoutIcon size={20}/>;
    }
  };

  return (
    <Layout hideFooter>
      <div className="flex h-[calc(100vh-80px)] bg-slate-50" dir={dir}>
        <aside className="w-64 bg-white border-r border-slate-200 flex-shrink-0 hidden md:block overflow-y-auto">
          <div className="p-6">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">{t('admin.menu.main')}</h3>
            <nav className="space-y-1">
              {navigationItems.map(item => (
                <SidebarLink 
                  key={item.key}
                  icon={getIconForItem(item.key)} 
                  label={item.label} 
                  active={activeTab === item.key} 
                  onClick={() => setActiveTab(item.key as any)}
                  editable={true}
                  onLabelChange={(newLabel) => updateNavigationLabel(item.key, newLabel)}
                  visible={item.visible}
                  onVisibilityToggle={() => toggleNavigationVisibility(item.key)}
                />
              ))}
            </nav>
          </div>
        </aside>
        <main className="flex-1 overflow-y-auto p-8">
          {activeTab === 'dashboard' && <DashboardOverview setActiveTab={setActiveTab} />}
          {activeTab === 'services' && <ServicesManager key={refresh} onUpdate={() => setRefresh(p => p+1)} />}
          {activeTab === 'team' && <TeamManager key={refresh} onUpdate={() => setRefresh(p => p+1)} />}
          {activeTab === 'packages' && <PackagesManager key={refresh} onUpdate={() => setRefresh(p => p+1)} />}
          {activeTab === 'work' && <CaseStudiesManager key={refresh} onUpdate={() => setRefresh(p => p+1)} />}
          {activeTab === 'blog' && <BlogManager key={refresh} onUpdate={() => setRefresh(p => p+1)} />}
          {activeTab === 'contact' && <ContactUsManager key={refresh} onUpdate={() => setRefresh(p => p+1)} />}
          {activeTab === 'messages' && <MessagesManager key={refresh} onUpdate={() => setRefresh(p => p+1)} />}
          {activeTab === 'pages' && <PageManager key={refresh} onUpdate={() => setRefresh(p => p+1)} />}
          {activeTab === 'settings' && (
            <SettingsProvider>
              <SettingsNewPage />
            </SettingsProvider>
          )}
        </main>
      </div>
    </Layout>
  );
};