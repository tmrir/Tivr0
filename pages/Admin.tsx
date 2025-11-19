import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { db } from '../services/db';
import { supabase } from '../services/supabase';
import { Layout } from '../components/Layout';
import { Service, TeamMember, LocalizedString } from '../types';
import { Plus, Trash2, Edit2, Save, BarChart2, List, Settings as SettingsIcon, Users as UsersIcon, FileText, RefreshCw, Loader2 } from 'lucide-react';

export const Admin = () => {
  const { isAdmin, lang, t, loading } = useApp();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [activeTab, setActiveTab] = useState<'dashboard' | 'services' | 'team' | 'settings'>('dashboard');
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
      <div className="min-h-screen flex items-center justify-center bg-slate-100">
        <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-slate-900">{t('admin.login')}</h2>
            <p className="text-slate-500 text-sm mt-2">Sign in via Supabase</p>
          </div>
          <form onSubmit={handleLogin}>
            <div className="space-y-4">
              {authError && <div className="text-red-500 text-sm bg-red-50 p-2 rounded">{authError}</div>}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
                <input type="email" className="w-full p-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-tivro-primary outline-none" value={email} onChange={e => setEmail(e.target.value)} required />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Password</label>
                <input type="password" className="w-full p-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-tivro-primary outline-none" value={password} onChange={e => setPassword(e.target.value)} required />
              </div>
              <button disabled={isLoggingIn} className="w-full bg-tivro-dark text-white py-3 rounded-lg font-bold hover:bg-slate-800 transition flex justify-center">
                 {isLoggingIn ? <Loader2 className="animate-spin"/> : 'Login'}
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  return (
    <Layout hideFooter>
      <div className="flex h-[calc(100vh-80px)] bg-slate-50">
        {/* Sidebar */}
        <aside className="w-64 bg-white border-r border-slate-200 flex-shrink-0 hidden md:block">
          <div className="p-6">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">Main Menu</h3>
            <nav className="space-y-1">
              <SidebarLink icon={<BarChart2 size={20}/>} label="Dashboard" active={activeTab === 'dashboard'} onClick={() => setActiveTab('dashboard')} />
              <SidebarLink icon={<List size={20}/>} label="Services" active={activeTab === 'services'} onClick={() => setActiveTab('services')} />
              <SidebarLink icon={<UsersIcon size={20}/>} label="Team" active={activeTab === 'team'} onClick={() => setActiveTab('team')} />
              <SidebarLink icon={<SettingsIcon size={20}/>} label="Settings" active={activeTab === 'settings'} onClick={() => setActiveTab('settings')} />
            </nav>
          </div>
        </aside>

        {/* Content Area */}
        <main className="flex-1 overflow-y-auto p-8">
          {activeTab === 'dashboard' && <DashboardTab />}
          {activeTab === 'services' && <ServicesManager key={refresh} onUpdate={() => setRefresh(p => p+1)} />}
          {activeTab === 'team' && <TeamManager key={refresh} onUpdate={() => setRefresh(p => p+1)} />}
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
  const [stats, setStats] = useState({ services: 0, team: 0 });

  useEffect(() => {
      const load = async () => {
          const s = await db.services.getAll();
          const t = await db.team.getAll();
          setStats({ services: s.length, team: t.length });
      }
      load();
  }, []);

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-slate-800">Dashboard Overview</h2>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <StatCard title="Total Visits" value="-" change="Pending Analytics" />
        <StatCard title="Active Services" value={stats.services.toString()} />
        <StatCard title="Team Members" value={stats.team.toString()} />
      </div>
      
      <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
        <h3 className="font-bold mb-4 text-slate-700">System Info</h3>
        <p className="text-sm text-slate-500">Connected to Supabase Database.</p>
      </div>
    </div>
  );
};

const StatCard = ({ title, value, change }: any) => (
  <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
    <p className="text-sm text-slate-500 mb-1">{title}</p>
    <div className="flex items-end justify-between">
      <h3 className="text-2xl font-bold text-slate-900">{value}</h3>
      {change && <span className="text-xs font-bold text-emerald-500 bg-emerald-50 px-2 py-1 rounded">{change}</span>}
    </div>
  </div>
);

const ServicesManager: React.FC<{ onUpdate: () => void }> = ({ onUpdate }) => {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Service | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
      db.services.getAll().then((d) => {
          setServices(d);
          setLoading(false);
      });
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editing) return;
    setSaving(true);
    await db.services.save(editing);
    setSaving(false);
    setEditing(null);
    onUpdate();
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure?')) {
      await db.services.delete(id);
      onUpdate();
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-slate-800">Manage Services</h2>
        <button 
          onClick={() => setEditing({ id: 'new', title: {ar:'', en:''}, description: {ar:'', en:''}, iconName: 'Star', features: [] })}
          className="bg-tivro-primary text-white px-4 py-2 rounded-lg flex items-center gap-2 text-sm font-bold hover:bg-emerald-700"
        >
          <Plus size={18}/> Add Service
        </button>
      </div>

      {editing ? (
        <form onSubmit={handleSave} className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 max-w-2xl">
           <h3 className="font-bold mb-4">{editing.id === 'new' ? 'New Service' : 'Edit Service'}</h3>
           <div className="grid grid-cols-2 gap-4 mb-4">
             <div>
               <label className="block text-xs font-bold text-slate-500 mb-1">Title (AR)</label>
               <input required className="w-full border p-2 rounded" value={editing.title.ar} onChange={e => setEditing({...editing, title: {...editing.title, ar: e.target.value}})} />
             </div>
             <div>
               <label className="block text-xs font-bold text-slate-500 mb-1">Title (EN)</label>
               <input required className="w-full border p-2 rounded" value={editing.title.en} onChange={e => setEditing({...editing, title: {...editing.title, en: e.target.value}})} />
             </div>
           </div>
           <div className="mb-4">
               <label className="block text-xs font-bold text-slate-500 mb-1">Description (AR)</label>
               <textarea className="w-full border p-2 rounded" value={editing.description.ar} onChange={e => setEditing({...editing, description: {...editing.description, ar: e.target.value}})} />
           </div>
           <div className="mb-4">
               <label className="block text-xs font-bold text-slate-500 mb-1">Icon Name (Lucide)</label>
               <input className="w-full border p-2 rounded" value={editing.iconName} onChange={e => setEditing({...editing, iconName: e.target.value})} />
           </div>
           <div className="flex gap-2 justify-end">
             <button type="button" onClick={() => setEditing(null)} className="px-4 py-2 text-slate-500">Cancel</button>
             <button disabled={saving} type="submit" className="px-4 py-2 bg-tivro-dark text-white rounded flex items-center gap-2">
                 {saving && <Loader2 size={14} className="animate-spin"/>} Save
             </button>
           </div>
        </form>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <table className="w-full text-left">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="p-4 text-sm font-bold text-slate-600">Title</th>
                <th className="p-4 text-sm font-bold text-slate-600">Icon</th>
                <th className="p-4 text-right text-sm font-bold text-slate-600">Actions</th>
              </tr>
            </thead>
            <tbody>
              {services.map(s => (
                <tr key={s.id} className="border-b border-slate-100 last:border-0 hover:bg-slate-50">
                  <td className="p-4 font-medium">{s.title['en']} / {s.title['ar']}</td>
                  <td className="p-4 text-slate-500">{s.iconName}</td>
                  <td className="p-4 flex justify-end gap-2">
                    <button onClick={() => setEditing(s)} className="p-2 text-blue-600 hover:bg-blue-50 rounded"><Edit2 size={16}/></button>
                    <button onClick={() => handleDelete(s.id)} className="p-2 text-red-600 hover:bg-red-50 rounded"><Trash2 size={16}/></button>
                  </td>
                </tr>
              ))}
              {services.length === 0 && <tr><td colSpan={3} className="p-4 text-center text-slate-400">No services found.</td></tr>}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

const TeamManager: React.FC<{ onUpdate: () => void }> = ({ onUpdate }) => {
  const [team, setTeam] = useState<TeamMember[]>([]);
  
  useEffect(() => {
      db.team.getAll().then(setTeam);
  }, []);

  return (
    <div>
      <h2 className="text-2xl font-bold text-slate-800 mb-6">Manage Team</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {team.map(member => (
          <div key={member.id} className="bg-white p-4 rounded-lg shadow border flex items-center gap-4">
            <img src={member.image} className="w-12 h-12 rounded-full bg-slate-200 object-cover" />
            <div>
              <p className="font-bold">{member.name['en']}</p>
              <p className="text-xs text-slate-500">{member.role['en']}</p>
            </div>
          </div>
        ))}
        <div className="border-2 border-dashed border-slate-300 rounded-lg flex flex-col items-center justify-center text-slate-400 p-6">
          <span className="text-sm font-bold mt-2 text-center">For full CRUD, implement similar logic to ServicesManager</span>
        </div>
      </div>
    </div>
  );
};

const SettingsManager = () => {
  const [settings, setSettings] = useState<any>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
      db.settings.get().then(setSettings);
  }, []);

  const save = async () => {
    setSaving(true);
    await db.settings.save(settings);
    setSaving(false);
    alert('Settings saved!');
    window.location.reload();
  };

  if (!settings) return <div>Loading...</div>;

  return (
    <div className="max-w-2xl">
       <h2 className="text-2xl font-bold text-slate-800 mb-6">General Settings</h2>
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
              {saving && <Loader2 className="animate-spin" size={16}/>} Save Changes
          </button>
       </div>
    </div>
  );
};
