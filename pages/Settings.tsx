import React, { useState } from 'react';
import { useSettings } from '../hooks/useSettings';
import { useApp } from '../context/AppContext';
import { Loader2, Save, RotateCcw, AlertCircle, CheckCircle, Globe, Phone, Share2, Image as ImageIcon, Database, FileText, LayoutTemplate, Flag } from 'lucide-react';
import { SiteSettings, LocalizedString } from '../types';

const LocalizedArea = ({ label, value, onChange }: {label:string, value: LocalizedString, onChange: (v: LocalizedString)=>void}) => (
    <div className="mb-4">
        <label className="block text-sm font-bold text-slate-700 mb-2">{label}</label>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            <div>
                <span className="text-xs text-slate-400 block mb-1">Arabic</span>
                <textarea className="w-full border p-2 rounded h-24 text-sm" dir="rtl" value={value?.ar || ''} onChange={e => onChange({...value, ar: e.target.value})} />
            </div>
            <div>
                <span className="text-xs text-slate-400 block mb-1">English</span>
                <textarea className="w-full border p-2 rounded h-24 text-sm" dir="ltr" value={value?.en || ''} onChange={e => onChange({...value, en: e.target.value})} />
            </div>
        </div>
    </div>
);

const LocalizedInput = ({ label, value, onChange }: {label:string, value: LocalizedString, onChange: (v: LocalizedString)=>void}) => (
    <div className="mb-4">
        <label className="block text-sm font-bold text-slate-700 mb-2">{label}</label>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            <input className="w-full border p-2 rounded" placeholder="Ar" dir="rtl" value={value?.ar || ''} onChange={e => onChange({...value, ar: e.target.value})} />
            <input className="w-full border p-2 rounded" placeholder="En" dir="ltr" value={value?.en || ''} onChange={e => onChange({...value, en: e.target.value})} />
        </div>
    </div>
);

export const SettingsPage: React.FC = () => {
  const { t } = useApp();
  const { settings, setSettings, loading, saving, error, saveSettings, restoreDefaultSettings } = useSettings();
  const [activeTab, setActiveTab] = useState<'general' | 'logos' | 'banners' | 'home_content' | 'legal' | 'db'>('general');
  const [msg, setMsg] = useState<{type:'success'|'error', text:string} | null>(null);

  const onSave = async () => {
      if (!settings) return;
      const success = await saveSettings(settings);
      if (success) {
          setMsg({type: 'success', text: t('admin.settings.saved')});
          setTimeout(() => setMsg(null), 3000);
      } else {
          setMsg({type: 'error', text: 'Error saving settings'});
      }
  };

  const TabButton = ({ id, icon: Icon, label }: any) => (
      <button onClick={() => setActiveTab(id)} className={`w-full text-left px-4 py-3 rounded-lg font-medium flex items-center gap-3 ${activeTab === id ? 'bg-tivro-primary text-white' : 'bg-white text-slate-600 hover:bg-slate-50'}`}>
          <Icon size={18}/> {label}
      </button>
  );

  // Fallback render if settings is null (should be handled by hook defaults now, but just in case)
  if (!settings) return <div className="p-10 text-center"><Loader2 className="animate-spin mx-auto"/> Loading...</div>;

  return (
    <div className="max-w-5xl mx-auto relative">
        {/* Non-blocking loading indicator */}
        {loading && (
            <div className="absolute top-4 right-4 z-50 bg-white p-2 rounded shadow">
                <Loader2 className="animate-spin text-slate-400" size={20}/>
            </div>
        )}

        <h2 className="text-2xl font-bold text-slate-800 mb-6">{t('admin.tab.settings')}</h2>
        
        {msg && <div className={`p-4 rounded mb-6 flex items-center gap-2 ${msg.type==='success'?'bg-green-100 text-green-800':'bg-red-100 text-red-800'}`}>{msg.type==='success'?<CheckCircle size={18}/>:<AlertCircle size={18}/>}{msg.text}</div>}
        {error && <div className="p-4 rounded mb-6 bg-red-100 text-red-800 flex items-center gap-2"><AlertCircle size={18}/> {error}</div>}

        <div className="flex flex-col md:flex-row gap-8">
            <div className="w-full md:w-64 flex-shrink-0 space-y-2">
                <TabButton id="general" icon={Globe} label={t('admin.settings.general')} />
                <TabButton id="logos" icon={ImageIcon} label="Logos & Branding" />
                <TabButton id="home_content" icon={LayoutTemplate} label="Home Content" />
                <TabButton id="banners" icon={Flag} label="Banners" />
                <TabButton id="legal" icon={FileText} label={t('admin.settings.legal')} />
                <TabButton id="db" icon={Database} label={t('admin.settings.db')} />
            </div>

            <div className="flex-1 bg-white p-8 rounded-xl shadow-sm border border-slate-200">
                
                {activeTab === 'general' && (
                    <div className="space-y-6 animate-fade-in">
                        <h3 className="font-bold text-lg border-b pb-3 mb-4">{t('admin.settings.general')}</h3>
                        <LocalizedInput label="Site Name" value={settings.siteName} onChange={v => setSettings({...settings, siteName: v})} />
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div><label className="block text-sm font-bold mb-1">{t('admin.set.email')}</label><input className="w-full border p-2 rounded" value={settings.contactEmail || ''} onChange={e => setSettings({...settings, contactEmail: e.target.value})} /></div>
                            <div><label className="block text-sm font-bold mb-1">{t('admin.set.phone')}</label><input className="w-full border p-2 rounded" value={settings.contactPhone || ''} onChange={e => setSettings({...settings, contactPhone: e.target.value})} /></div>
                        </div>
                        <LocalizedInput label="Address" value={settings.address} onChange={v => setSettings({...settings, address: v})} />

                        <div className="pt-4 border-t">
                            <div className="flex justify-between items-center mb-2">
                                <h4 className="font-bold">{t('admin.settings.social')}</h4>
                                <button onClick={() => setSettings({...settings, socialLinks: [...settings.socialLinks, {platform: 'Twitter', url: ''}]})} className="text-xs bg-blue-50 text-blue-600 px-2 py-1 rounded font-bold">+ Add</button>
                            </div>
                            {settings.socialLinks.map((link, i) => (
                                <div key={i} className="flex gap-2 mb-2">
                                    <input className="w-1/3 border p-2 rounded text-sm" value={link.platform} onChange={e => { const l = [...settings.socialLinks]; l[i].platform = e.target.value; setSettings({...settings, socialLinks: l})}} />
                                    <input className="flex-1 border p-2 rounded text-sm" value={link.url} onChange={e => { const l = [...settings.socialLinks]; l[i].url = e.target.value; setSettings({...settings, socialLinks: l})}} />
                                    <button onClick={() => { const l = settings.socialLinks.filter((_, idx) => idx !== i); setSettings({...settings, socialLinks: l})}} className="text-red-500 px-2">x</button>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {activeTab === 'logos' && (
                    <div className="space-y-6 animate-fade-in">
                        <h3 className="font-bold text-lg border-b pb-3 mb-4">Logos & Branding</h3>
                        <div>
                            <label className="block text-sm font-bold mb-1">Main Logo URL</label>
                            <input className="w-full border p-2 rounded" value={settings.logoUrl || ''} onChange={e => setSettings({...settings, logoUrl: e.target.value})} />
                            {settings.logoUrl && <img src={settings.logoUrl} className="h-10 mt-2 border p-1"/>}
                        </div>
                        <div>
                            <label className="block text-sm font-bold mb-1">Footer Logo URL</label>
                            <input className="w-full border p-2 rounded" value={settings.footerLogoUrl || ''} onChange={e => setSettings({...settings, footerLogoUrl: e.target.value})} />
                            {settings.footerLogoUrl && <img src={settings.footerLogoUrl} className="h-10 mt-2 border p-1 bg-slate-800"/>}
                        </div>
                        <div>
                            <label className="block text-sm font-bold mb-1">Favicon URL (ICO/PNG)</label>
                            <input className="w-full border p-2 rounded" value={settings.faviconUrl || ''} onChange={e => setSettings({...settings, faviconUrl: e.target.value})} />
                            {settings.faviconUrl && <img src={settings.faviconUrl} className="h-8 w-8 mt-2 border p-1"/>}
                        </div>
                    </div>
                )}

                {activeTab === 'home_content' && (
                    <div className="space-y-6 animate-fade-in">
                        <h3 className="font-bold text-lg border-b pb-3 mb-4">Home Page Content</h3>
                        <LocalizedInput label="Hero Title" value={settings.homeSections.heroTitle} onChange={v => setSettings({...settings, homeSections: {...settings.homeSections, heroTitle: v}})} />
                        <LocalizedInput label="Hero Subtitle" value={settings.homeSections.heroSubtitle} onChange={v => setSettings({...settings, homeSections: {...settings.homeSections, heroSubtitle: v}})} />
                        <hr/>
                        <LocalizedInput label="Services Title" value={settings.homeSections.servicesTitle} onChange={v => setSettings({...settings, homeSections: {...settings.homeSections, servicesTitle: v}})} />
                        <hr/>
                        <LocalizedInput label="Work (Case Studies) Title" value={settings.sectionTexts.workTitle} onChange={v => setSettings({...settings, sectionTexts: {...settings.sectionTexts, workTitle: v}})} />
                        <LocalizedInput label="Work Subtitle" value={settings.sectionTexts.workSubtitle} onChange={v => setSettings({...settings, sectionTexts: {...settings.sectionTexts, workSubtitle: v}})} />
                        <hr/>
                        <LocalizedInput label="Packages Title" value={settings.homeSections.packagesTitle} onChange={v => setSettings({...settings, homeSections: {...settings.homeSections, packagesTitle: v}})} />
                        <hr/>
                        <LocalizedInput label="Team Title" value={settings.homeSections.teamTitle} onChange={v => setSettings({...settings, homeSections: {...settings.homeSections, teamTitle: v}})} />
                        <hr/>
                        <LocalizedInput label="Contact Title" value={settings.homeSections.contactTitle} onChange={v => setSettings({...settings, homeSections: {...settings.homeSections, contactTitle: v}})} />
                        <LocalizedInput label="Contact Subtitle" value={settings.homeSections.contactSubtitle} onChange={v => setSettings({...settings, homeSections: {...settings.homeSections, contactSubtitle: v}})} />
                    </div>
                )}

                {activeTab === 'banners' && (
                    <div className="space-y-8 animate-fade-in">
                        <div>
                            <div className="flex items-center gap-2 mb-4">
                                <input type="checkbox" checked={settings.topBanner?.enabled || false} onChange={e => setSettings({...settings, topBanner: {...settings.topBanner, enabled: e.target.checked}})} className="w-5 h-5"/>
                                <h3 className="font-bold text-lg">Top Banner</h3>
                            </div>
                            {settings.topBanner?.enabled && (
                                <div className="bg-slate-50 p-4 rounded border space-y-3">
                                    <LocalizedInput label="Title" value={settings.topBanner.title} onChange={v => setSettings({...settings, topBanner: {...settings.topBanner, title: v}})} />
                                    <LocalizedInput label="Button Text" value={settings.topBanner.buttonText || {ar:'',en:''}} onChange={v => setSettings({...settings, topBanner: {...settings.topBanner, buttonText: v}})} />
                                    <div><label className="text-xs font-bold">Link</label><input className="w-full border p-2 rounded" value={settings.topBanner.link || ''} onChange={e => setSettings({...settings, topBanner: {...settings.topBanner, link: e.target.value}})} /></div>
                                </div>
                            )}
                        </div>
                        
                        <div>
                            <div className="flex items-center gap-2 mb-4">
                                <input type="checkbox" checked={settings.bottomBanner?.enabled || false} onChange={e => setSettings({...settings, bottomBanner: {...settings.bottomBanner, enabled: e.target.checked}})} className="w-5 h-5"/>
                                <h3 className="font-bold text-lg">Bottom Banner</h3>
                            </div>
                            {settings.bottomBanner?.enabled && (
                                <div className="bg-slate-50 p-4 rounded border space-y-3">
                                    <LocalizedInput label="Title" value={settings.bottomBanner.title} onChange={v => setSettings({...settings, bottomBanner: {...settings.bottomBanner, title: v}})} />
                                    <LocalizedArea label="Description" value={settings.bottomBanner.subtitle || {ar:'',en:''}} onChange={(v: LocalizedString) => setSettings({...settings, bottomBanner: {...settings.bottomBanner, subtitle: v}})} />
                                    <div><label className="text-xs font-bold">Background Image URL</label><input className="w-full border p-2 rounded" value={settings.bottomBanner.bgImage || ''} onChange={e => setSettings({...settings, bottomBanner: {...settings.bottomBanner, bgImage: e.target.value}})} /></div>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {activeTab === 'legal' && (
                    <div className="space-y-6 animate-fade-in">
                        <h3 className="font-bold text-lg border-b pb-3 mb-4">{t('admin.settings.legal')}</h3>
                        <LocalizedArea label={t('admin.set.privacy')} value={settings.privacyPolicy} onChange={(v: LocalizedString) => setSettings({...settings, privacyPolicy: v})} />
                        <div className="border-t my-6"></div>
                        <LocalizedArea label={t('admin.set.terms')} value={settings.termsOfService} onChange={(v: LocalizedString) => setSettings({...settings, termsOfService: v})} />
                    </div>
                )}

                {activeTab === 'db' && (
                    <div className="space-y-6 animate-fade-in">
                         <h3 className="font-bold text-lg border-b pb-3 mb-4">{t('admin.settings.db')}</h3>
                         <div className="bg-amber-50 border border-amber-200 p-4 rounded-lg mb-6">
                             <p className="text-sm text-amber-800">{t('admin.seed.desc')}</p>
                         </div>
                         <button 
                             onClick={async () => {
                                 if(confirm(t('admin.seed.warning'))) {
                                     const success = await restoreDefaultSettings();
                                     if(success) alert(t('admin.seed.success'));
                                     else alert('Error seeding DB');
                                 }
                             }} 
                             className="bg-slate-800 text-white px-6 py-3 rounded-lg font-bold hover:bg-slate-900 transition w-full flex justify-center gap-2"
                         >
                             <RotateCcw size={18}/> {t('admin.seed.btn')}
                         </button>
                    </div>
                )}

                {activeTab !== 'db' && (
                     <div className="pt-6 mt-6 border-t flex justify-end">
                        <button onClick={onSave} disabled={saving} className="bg-tivro-primary text-white px-8 py-3 rounded-lg font-bold hover:bg-emerald-700 flex items-center gap-2 shadow-lg shadow-tivro-primary/20">
                            {saving && <Loader2 className="animate-spin" size={18}/>} 
                            {t('admin.btn.save')}
                        </button>
                    </div>
                )}
            </div>
        </div>
    </div>
  );
};