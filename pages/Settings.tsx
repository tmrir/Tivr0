import React, { useState } from 'react';
import { useSettings } from '../hooks/useSettings';
import { useApp } from '../context/AppContext';
import { Loader2, Globe, Image as ImageIcon, LayoutTemplate, FileText, Database } from 'lucide-react';
import { SiteSettings, LocalizedString } from '../types';

const LocalizedInput = ({ label, value, onChange }: {label:string, value: LocalizedString, onChange: (v: LocalizedString)=>void}) => (
    <div className="mb-4">
        <label className="block text-sm font-bold text-slate-700 mb-2">{label}</label>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            <div><span className="text-xs text-slate-400 block mb-1">🇸🇦 العربية</span><input className="w-full border p-2 rounded" dir="rtl" value={value?.ar || ''} onChange={e => onChange({...value, ar: e.target.value})} /></div>
            <div><span className="text-xs text-slate-400 block mb-1">🇺🇸 English</span><input className="w-full border p-2 rounded" dir="ltr" value={value?.en || ''} onChange={e => onChange({...value, en: e.target.value})} /></div>
        </div>
    </div>
);

const LocalizedTextarea = ({ label, value, onChange }: {label:string, value: LocalizedString, onChange: (v: LocalizedString)=>void}) => (
    <div className="mb-4">
        <label className="block text-sm font-bold text-slate-700 mb-2">{label}</label>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            <div><span className="text-xs text-slate-400 block mb-1">🇸🇦 العربية</span><textarea className="w-full border p-2 rounded h-24 text-sm" dir="rtl" value={value?.ar || ''} onChange={e => onChange({...value, ar: e.target.value})} /></div>
            <div><span className="text-xs text-slate-400 block mb-1">🇺🇸 English</span><textarea className="w-full border p-2 rounded h-24 text-sm" dir="ltr" value={value?.en || ''} onChange={e => onChange({...value, en: e.target.value})} /></div>
        </div>
    </div>
);

export const SettingsPage: React.FC = () => {
  const { t } = useApp();
  const { settings, setSettings, loading, saving, saveSettings, restoreDefaultSettings } = useSettings();
  const [activeTab, setActiveTab] = useState('general');

  const onSave = async () => { if (!settings) return; await saveSettings(settings); alert(t('admin.settings.saved')); };

  const TabButton = ({ id, icon: Icon, label }: any) => (
      <button onClick={() => setActiveTab(id)} className={`w-full text-left px-4 py-3 rounded-lg font-medium flex items-center gap-3 ${activeTab === id ? 'bg-tivro-primary text-white' : 'bg-white text-slate-600 hover:bg-slate-50'}`}>
          <Icon size={18}/> {label}
      </button>
  );

  if (loading || !settings) return <div className="p-10 text-center"><Loader2 className="animate-spin mx-auto"/> Loading...</div>;

  return (
    <main className="flex-1 overflow-y-auto p-8">
        <div className="max-w-5xl mx-auto relative">
            <h2 className="text-2xl font-bold text-slate-800 mb-6">الإعدادات (New Version)</h2>
            <div className="flex flex-col md:flex-row gap-8">
                <div className="w-full md:w-64 flex-shrink-0 space-y-2">
                    <TabButton id="general" icon={Globe} label="الإعدادات العامة" />
                    <TabButton id="branding" icon={ImageIcon} label="Logos & Branding" />
                    <TabButton id="home" icon={LayoutTemplate} label="Home Content" />
                    <TabButton id="legal" icon={FileText} label="admin.settings.legal" />
                    <TabButton id="db" icon={Database} label="إجراءات قاعدة البيانات" />
                </div>
                
                <div className="flex-1 bg-white p-8 rounded-xl shadow-sm border border-slate-200">
                    {activeTab === 'general' && (
                        <div className="space-y-6 animate-fade-in">
                            <h3 className="font-bold text-lg border-b pb-3 mb-4">الإعدادات العامة</h3>
                            <LocalizedInput label="Site Name" value={settings.siteName} onChange={v => setSettings({...settings, siteName: v})} />
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div><label className="block text-sm font-bold mb-1">البريد الإلكتروني</label><input className="w-full border p-2 rounded" value={settings.contactEmail} onChange={e=>setSettings({...settings, contactEmail: e.target.value})}/></div>
                                <div><label className="block text-sm font-bold mb-1">رقم الهاتف</label><input className="w-full border p-2 rounded" value={settings.contactPhone} onChange={e=>setSettings({...settings, contactPhone: e.target.value})}/></div>
                            </div>
                            <LocalizedInput label="Address" value={settings.address} onChange={v => setSettings({...settings, address: v})} />
                            
                            <div className="pt-4 border-t">
                                <div className="flex justify-between items-center mb-2"><h4 className="font-bold">التواصل الاجتماعي</h4><button onClick={()=>setSettings({...settings, socialLinks:[...settings.socialLinks, {platform:'Twitter', url:''}]})} className="text-xs bg-blue-50 text-blue-600 px-2 py-1 rounded font-bold">+ Add</button></div>
                                {settings.socialLinks.map((l, i) => (
                                    <div key={i} className="flex gap-2 mb-2">
                                        <input className="w-1/3 border p-2 rounded text-sm" value={l.platform} onChange={e=>{const n=[...settings.socialLinks]; n[i].platform=e.target.value; setSettings({...settings, socialLinks:n})}} />
                                        <input className="flex-1 border p-2 rounded text-sm" value={l.url} onChange={e=>{const n=[...settings.socialLinks]; n[i].url=e.target.value; setSettings({...settings, socialLinks:n})}} />
                                        <button onClick={()=>{const n=settings.socialLinks.filter((_,x)=>x!==i); setSettings({...settings, socialLinks:n})}} className="text-red-500 px-2">x</button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {activeTab === 'home' && (
                        <div className="space-y-6 animate-fade-in">
                            <h3 className="font-bold text-lg border-b pb-3 mb-4">🏠 Home Page Content</h3>
                            <div className="bg-slate-50 p-4 rounded-lg mb-6"><p className="text-sm text-slate-600">هنا يمكنك تعديل محتوى البانر العلوي والفوتر السفلي في الصفحة الرئيسية.</p></div>
                            
                            {/* Top Banner */}
                            <div className="border border-slate-200 rounded-lg overflow-hidden">
                                <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white p-3"><h4 className="font-bold flex items-center gap-2">🚀 البانر العلوي (Top Banner)</h4></div>
                                <div className="p-4 space-y-3">
                                    <LocalizedInput label="العنوان الرئيسي" value={settings.homeSections.heroTitle} onChange={v => setSettings({...settings, homeSections: {...settings.homeSections, heroTitle: v}})} />
                                    <LocalizedInput label="العنوان الفرعي" value={settings.homeSections.heroSubtitle} onChange={v => setSettings({...settings, homeSections: {...settings.homeSections, heroSubtitle: v}})} />
                                    <LocalizedInput label="عنوان الأعمال" value={settings.sectionTexts.workTitle} onChange={v => setSettings({...settings, sectionTexts: {...settings.sectionTexts, workTitle: v}})} />
                                    <LocalizedInput label="وصف الأعمال" value={settings.sectionTexts.workSubtitle} onChange={v => setSettings({...settings, sectionTexts: {...settings.sectionTexts, workSubtitle: v}})} />
                                </div>
                            </div>

                            {/* Font Sizes */}
                            <div className="border border-slate-200 rounded-lg overflow-hidden">
                                <div className="bg-gradient-to-r from-purple-500 to-purple-600 text-white p-3"><h4 className="font-bold flex items-center gap-2">📏 أحجام الخطوط (Font Sizes)</h4></div>
                                <div className="p-4 space-y-4">
                                    <div className="bg-blue-50 border border-blue-200 p-3 rounded"><p className="text-sm text-blue-800 mb-3">💡 <strong>ملاحظة:</strong> اختر حجم الخط المناسب لكل عنصر.</p></div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div><label className="block text-sm font-bold mb-1">Hero Title Size</label><select className="w-full border p-2 rounded" value={settings.fontSettings?.heroTitle || 'text-5xl'} onChange={e => setSettings({...settings, fontSettings: {...settings.fontSettings, heroTitle: e.target.value}})}><option value="text-4xl">4xl</option><option value="text-5xl">5xl</option><option value="text-6xl">6xl</option></select></div>
                                        <div><label className="block text-sm font-bold mb-1">Section Title Size</label><select className="w-full border p-2 rounded" value={settings.fontSettings?.sectionTitle || 'text-4xl'} onChange={e => setSettings({...settings, fontSettings: {...settings.fontSettings, sectionTitle: e.target.value}})}><option value="text-2xl">2xl</option><option value="text-3xl">3xl</option><option value="text-4xl">4xl</option></select></div>
                                    </div>
                                </div>
                            </div>

                            {/* Footer */}
                            <div className="border border-slate-200 rounded-lg overflow-hidden">
                                <div className="bg-gradient-to-r from-slate-600 to-slate-700 text-white p-3"><h4 className="font-bold flex items-center gap-2">📄 الفوتر السفلي (Footer)</h4></div>
                                <div className="p-4 space-y-3">
                                    <LocalizedTextarea label="وصف الفوتر" value={settings.footerSettings?.description} onChange={v => setSettings({...settings, footerSettings: {...settings.footerSettings, description: v}})} />
                                    <LocalizedInput label="نص حقوق الطبع والنشر" value={settings.footerSettings?.copyright} onChange={v => setSettings({...settings, footerSettings: {...settings.footerSettings, copyright: v}})} />
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'legal' && (
                        <div className="space-y-6 animate-fade-in">
                            <h3 className="font-bold text-lg border-b pb-3 mb-4">admin.settings.legal</h3>
                            <LocalizedTextarea label="admin.set.privacy" value={settings.privacyPolicy} onChange={v => setSettings({...settings, privacyPolicy: v})} />
                            <div className="border-t my-6"></div>
                            <LocalizedTextarea label="admin.set.terms" value={settings.termsOfService} onChange={v => setSettings({...settings, termsOfService: v})} />
                        </div>
                    )}

                    {activeTab === 'db' && (
                        <div className="space-y-6">
                            <h3 className="font-bold text-lg border-b pb-3 mb-4">إجراءات قاعدة البيانات</h3>
                            <button onClick={async () => { if(confirm('Are you sure?')) await restoreDefaultSettings(); }} className="w-full bg-slate-800 text-white py-3 rounded-lg font-bold flex justify-center gap-2">استعادة البيانات الافتراضية</button>
                        </div>
                    )}

                    {activeTab !== 'db' && (
                        <div className="pt-6 mt-6 border-t flex justify-end">
                            <button onClick={onSave} disabled={saving} className="bg-tivro-primary text-white px-8 py-3 rounded-lg font-bold hover:bg-emerald-700 flex items-center gap-2 shadow-lg shadow-tivro-primary/20">
                                {saving && <Loader2 className="animate-spin" size={18}/>} حفظ التغييرات
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    </main>
  );
};