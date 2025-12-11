import React, { useState } from 'react';
import { useSettings } from '../../hooks/useSettings';
import { useApp } from '../../context/AppContext';
import { Loader2, Save, RotateCcw, AlertCircle, CheckCircle, Globe, Phone, Share2, Image as ImageIcon, Database, FileText, LayoutTemplate, Flag } from 'lucide-react';
import { SiteSettings, LocalizedString } from '../../types';

const LocalizedArea = ({ label, value, onChange }: {label:string, value: LocalizedString, onChange: (v: LocalizedString)=>void}) => (
    <div className="mb-4">
        <label className="block text-sm font-bold text-slate-700 mb-2">{label}</label>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            <textarea className="w-full border p-2 rounded h-24 text-sm" dir="rtl" placeholder="Arabic" value={value?.ar || ''} onChange={e => onChange({...value, ar: e.target.value})} />
            <textarea className="w-full border p-2 rounded h-24 text-sm" dir="ltr" placeholder="English" value={value?.en || ''} onChange={e => onChange({...value, en: e.target.value})} />
        </div>
    </div>
);

const LocalizedInput = ({ label, value, onChange }: {label:string, value: LocalizedString, onChange: (v: LocalizedString)=>void}) => (
    <div className="mb-4">
        <label className="block text-sm font-bold text-slate-700 mb-2">{label}</label>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            <input className="w-full border p-2 rounded" placeholder="Arabic" dir="rtl" value={value?.ar || ''} onChange={e => onChange({...value, ar: e.target.value})} />
            <input className="w-full border p-2 rounded" placeholder="English" dir="ltr" value={value?.en || ''} onChange={e => onChange({...value, en: e.target.value})} />
        </div>
    </div>
);

export const SettingsPage: React.FC = () => {
  const { t } = useApp();
  const { settings, loading, error, saveSettings, restoreSettings } = useSettings();
  const [activeTab, setActiveTab] = useState('general');
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<{type:'success'|'error', text:string} | null>(null);

  const onSave = async () => {
      setSaving(true);
      try {
          if (!settings) return;
          await saveSettings(settings);
          setMsg({type: 'success', text: 'Settings saved successfully'});
          setTimeout(() => setMsg(null), 3000);
      } catch (err) {
          setMsg({type: 'error', text: 'Failed to save settings'});
          setTimeout(() => setMsg(null), 3000);
      } finally {
          setSaving(false);
      }
  };

  const TabButton = ({ id, icon: Icon, label }: any) => (
      <button onClick={() => setActiveTab(id)} className={`w-full text-left px-4 py-3 rounded-lg font-medium flex items-center gap-3 ${activeTab === id ? 'bg-tivro-primary text-white' : 'bg-white text-slate-600 hover:bg-slate-50'}`}>
          <Icon size={18}/> {label}
      </button>
  );

  if (loading) return <div className="flex justify-center p-10"><Loader2 className="animate-spin"/></div>;
  if (!settings) return null;

  return (
    <div className="max-w-5xl mx-auto">
        <h2 className="text-2xl font-bold text-slate-800 mb-6">Settings</h2>
        {msg && <div className={`p-4 rounded mb-6 ${msg.type==='success'?'bg-green-100 text-green-800':'bg-red-100 text-red-800'}`}>{msg.text}</div>}
        {error && <div className="p-4 mb-6 bg-red-100 text-red-800">{error}</div>}

        <div className="flex flex-col md:flex-row gap-8">
            <div className="w-full md:w-64 flex-shrink-0 space-y-2">
                <TabButton id="general" icon={Globe} label="General" />
                <TabButton id="logos" icon={ImageIcon} label="Logos" />
                <TabButton id="home" icon={LayoutTemplate} label="Home Content" />
                <TabButton id="banners" icon={Flag} label="Banners" />
                <TabButton id="legal" icon={FileText} label="Legal Pages" />
                <TabButton id="db" icon={Database} label="Database" />
            </div>

            <div className="flex-1 bg-white p-8 rounded-xl shadow-sm border border-slate-200">
                {activeTab === 'general' && (
                    <div className="space-y-4">
                        <LocalizedInput label="Site Name" value={settings.siteName} onChange={v => settings.siteName = v} />
                        <div className="grid grid-cols-2 gap-4">
                            <div><label className="block text-sm font-bold mb-1">Email</label><input className="w-full border p-2 rounded" value={settings.contactEmail} onChange={e => settings.contactEmail = e.target.value} /></div>
                            <div><label className="block text-sm font-bold mb-1">Phone</label><input className="w-full border p-2 rounded" value={settings.contactPhone} onChange={e => settings.contactPhone = e.target.value} /></div>
                        </div>
                    </div>
                )}
                
                {activeTab === 'logos' && (
                    <div className="space-y-4">
                         <div><label className="block text-sm font-bold mb-1">Logo URL</label><input className="w-full border p-2 rounded" value={settings.logoUrl} onChange={e => settings.logoUrl = e.target.value} /></div>
                         <div><label className="block text-sm font-bold mb-1">Favicon URL</label><input className="w-full border p-2 rounded" value={settings.faviconUrl} onChange={e => settings.faviconUrl = e.target.value} /></div>
                    </div>
                )}

                {activeTab === 'home' && (
                    <div className="space-y-4">
                        <LocalizedInput label="Hero Title" value={settings.homeSections.heroTitle} onChange={v => settings.homeSections.heroTitle = v} />
                        <LocalizedInput label="Hero Subtitle" value={settings.homeSections.heroSubtitle} onChange={v => settings.homeSections.heroSubtitle = v} />
                    </div>
                )}

                {activeTab === 'banners' && (
                    <div className="space-y-4">
                        <div className="flex items-center gap-2"><input type="checkbox" checked={settings.topBanner.enabled} onChange={e => settings.topBanner.enabled = e.target.checked} /> <strong>Enable Top Banner</strong></div>
                        {settings.topBanner.enabled && <LocalizedInput label="Banner Text" value={settings.topBanner.title} onChange={v => settings.topBanner.title = v} />}
                    </div>
                )}

                {activeTab === 'legal' && (
                    <div className="space-y-4">
                        <LocalizedArea label="Privacy Policy" value={settings.privacyPolicy} onChange={v => settings.privacyPolicy = v} />
                        <LocalizedArea label="Terms of Service" value={settings.termsOfService} onChange={v => settings.termsOfService = v} />
                    </div>
                )}

                {activeTab === 'db' && (
                    <button onClick={restoreSettings} className="w-full bg-slate-800 text-white py-3 rounded-lg font-bold flex justify-center gap-2"><RotateCcw/> Restore Defaults</button>
                )}

                {activeTab !== 'db' && (
                    <div className="mt-6 pt-6 border-t flex justify-end">
                        <button onClick={onSave} disabled={saving} className="bg-emerald-600 text-white px-8 py-3 rounded-lg font-bold flex items-center gap-2">
                            {saving && <Loader2 className="animate-spin"/>} Save Changes
                        </button>
                    </div>
                )}
            </div>
        </div>
    </div>
  );
};