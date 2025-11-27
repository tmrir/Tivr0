import React, { useState } from 'react';
import { useSettingsNew } from '../hooks/useSettingsNew';
import { useApp } from '../context/AppContext';
import { Loader2, Save, RotateCcw, AlertCircle, CheckCircle, Globe, Phone, Share2, Image as ImageIcon, Database, FileText, LayoutTemplate } from 'lucide-react';
import { SiteSettings, LocalizedString } from '../types';

const LocalizedArea = ({ label, value, onChange }: {label:string, value: LocalizedString, onChange: (v: LocalizedString)=>void}) => (
    <div className="mb-4">
        <label className="block text-sm font-bold text-slate-700 mb-2">{label}</label>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            <div>
                <span className="text-xs text-slate-400 block mb-1">🇸🇦 العربية</span>
                <textarea className="w-full border p-2 rounded h-24 text-sm" dir="rtl" placeholder="النص المفصل باللغة العربية" value={value?.ar || ''} onChange={e => onChange({...value, ar: e.target.value})} />
            </div>
            <div>
                <span className="text-xs text-slate-400 block mb-1">🇺🇸 English</span>
                <textarea className="w-full border p-2 rounded h-24 text-sm" dir="ltr" placeholder="Detailed English text" value={value?.en || ''} onChange={e => onChange({...value, en: e.target.value})} />
            </div>
        </div>
    </div>
);

const LocalizedInput = ({ label, value, onChange }: {label:string, value: LocalizedString, onChange: (v: LocalizedString)=>void}) => (
    <div className="mb-4">
        <label className="block text-sm font-bold text-slate-700 mb-2">{label}</label>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            <div>
                <span className="text-xs text-slate-400 block mb-1">🇸🇦 العربية</span>
                <input className="w-full border p-2 rounded" placeholder="النص باللغة العربية" dir="rtl" value={value?.ar || ''} onChange={e => onChange({...value, ar: e.target.value})} />
            </div>
            <div>
                <span className="text-xs text-slate-400 block mb-1">🇺🇸 English</span>
                <input className="w-full border p-2 rounded" placeholder="English text" dir="ltr" value={value?.en || ''} onChange={e => onChange({...value, en: e.target.value})} />
            </div>
        </div>
    </div>
);

export const SettingsNewPage: React.FC = () => {
  const { t, lang } = useApp();
  const { settings, loading, saving, error, saveSettings, testConnection, updateField, updateNestedField } = useSettingsNew();
  const [activeTab, setActiveTab] = useState<'general' | 'logos' | 'home_content' | 'legal' | 'db'>('general');
  const [msg, setMsg] = useState<{type:'success'|'error', text:string} | null>(null);

  const onSave = async () => {
      console.log('🔧 [SettingsNewPage] onSave called');
      const success = await saveSettings(settings);
      if (success) {
          console.log('✅ [SettingsNewPage] Save successful');
          setMsg({type: 'success', text: t('admin.settings.saved')});
          setTimeout(() => setMsg(null), 3000);
      } else {
          console.log('❌ [SettingsNewPage] Save failed');
          setMsg({type: 'error', text: 'Error saving settings'});
          setTimeout(() => setMsg(null), 3000);
      }
  };

  const onTestConnection = async () => {
      console.log('🔍 Testing database connection...');
      const success = await testConnection();
      if (success) {
          setMsg({type: 'success', text: 'Database connection successful'});
      } else {
          setMsg({type: 'error', text: 'Database connection failed'});
      }
      setTimeout(() => setMsg(null), 5000);
  };

  const TabButton = ({ id, icon: Icon, label }: any) => (
      <button onClick={() => setActiveTab(id)} className={`w-full text-left px-4 py-3 rounded-lg font-medium flex items-center gap-3 ${activeTab === id ? 'bg-tivro-primary text-white' : 'bg-white text-slate-600 hover:bg-slate-50'}`}>
          <Icon size={18}/> {label}
      </button>
  );

  return (
    <div className="max-w-5xl mx-auto relative">
        {/* Loading indicator */}
        {loading && (
            <div className="absolute top-4 right-4 z-50 bg-white p-2 rounded shadow">
                <Loader2 className="animate-spin text-slate-400" size={20}/>
            </div>
        )}

        <h2 className="text-2xl font-bold text-slate-800 mb-6">{t('admin.tab.settings')} (New Version)</h2>
        
        {msg && <div className={`p-4 rounded mb-6 flex items-center gap-2 ${msg.type==='success'?'bg-green-100 text-green-800':'bg-red-100 text-red-800'}`}>{msg.type==='success'?<CheckCircle size={18}/>:<AlertCircle size={18}/>}{msg.text}</div>}
        {error && <div className="p-4 rounded mb-6 bg-red-100 text-red-800 flex items-center gap-2"><AlertCircle size={18}/> {error}</div>}

        <div className="flex flex-col md:flex-row gap-8">
            <div className="w-full md:w-64 flex-shrink-0 space-y-2">
                <TabButton id="general" icon={Globe} label={t('admin.settings.general')} />
                <TabButton id="logos" icon={ImageIcon} label="Logos & Branding" />
                <TabButton id="home_content" icon={LayoutTemplate} label="Home Content" />
                <TabButton id="legal" icon={FileText} label={t('admin.settings.legal')} />
                <TabButton id="db" icon={Database} label={t('admin.settings.db')} />
            </div>

            <div className="flex-1 bg-white p-8 rounded-xl shadow-sm border border-slate-200">
                
                {activeTab === 'general' && (
                    <div className="space-y-6 animate-fade-in">
                        <h3 className="font-bold text-lg border-b pb-3 mb-4">{t('admin.settings.general')}</h3>
                        <LocalizedInput label="Site Name" value={settings.siteName} onChange={v => updateField('siteName', v)} />
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-bold mb-1">{t('admin.set.email')}</label>
                                <input className="w-full border p-2 rounded" value={settings.contactEmail || ''} onChange={e => updateField('contactEmail', e.target.value)} />
                            </div>
                            <div>
                                <label className="block text-sm font-bold mb-1">{t('admin.set.phone')}</label>
                                <input className="w-full border p-2 rounded" value={settings.contactPhone || ''} onChange={e => updateField('contactPhone', e.target.value)} />
                            </div>
                        </div>
                        <LocalizedInput label="Address" value={settings.address} onChange={v => updateField('address', v)} />

                        <div className="pt-4 border-t">
                            <div className="flex justify-between items-center mb-2">
                                <h4 className="font-bold">{t('admin.settings.social')}</h4>
                                <button onClick={() => updateField('socialLinks', [...settings.socialLinks, {platform: 'Twitter', url: ''}])} className="text-xs bg-blue-50 text-blue-600 px-2 py-1 rounded font-bold">+ Add</button>
                            </div>
                            {settings.socialLinks.map((link, i) => (
                                <div key={i} className="flex gap-2 mb-2">
                                    <input className="w-1/3 border p-2 rounded text-sm" value={link.platform} onChange={e => { 
                                        const l = [...settings.socialLinks]; 
                                        l[i].platform = e.target.value; 
                                        updateField('socialLinks', l);
                                    }} />
                                    <input className="flex-1 border p-2 rounded text-sm" value={link.url} onChange={e => { 
                                        const l = [...settings.socialLinks]; 
                                        l[i].url = e.target.value; 
                                        updateField('socialLinks', l);
                                    }} />
                                    <button onClick={() => { 
                                        const l = settings.socialLinks.filter((_, idx) => idx !== i); 
                                        updateField('socialLinks', l);
                                    }} className="text-red-500 px-2">x</button>
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
                            <input className="w-full border p-2 rounded" value={settings.logoUrl || ''} onChange={e => updateField('logoUrl', e.target.value)} />
                            {settings.logoUrl && <img src={settings.logoUrl} className="h-10 mt-2 border p-1"/>}
                        </div>
                        <div>
                            <label className="block text-sm font-bold mb-1">Footer Logo URL</label>
                            <input className="w-full border p-2 rounded" value={settings.footerLogoUrl || ''} onChange={e => updateField('footerLogoUrl', e.target.value)} />
                            {settings.footerLogoUrl && <img src={settings.footerLogoUrl} className="h-10 mt-2 border p-1 bg-slate-800"/>}
                        </div>
                        <div>
                            <label className="block text-sm font-bold mb-1">Favicon URL (ICO/PNG)</label>
                            <input className="w-full border p-2 rounded" value={settings.faviconUrl || ''} onChange={e => updateField('faviconUrl', e.target.value)} />
                            {settings.faviconUrl && <img src={settings.faviconUrl} className="h-8 w-8 mt-2 border p-1"/>}
                        </div>
                    </div>
                )}

                {activeTab === 'home_content' && (
                    <div className="space-y-6 animate-fade-in">
                        <h3 className="font-bold text-lg border-b pb-3 mb-4">🏠 Home Page Content</h3>
                        
                        <div className="bg-slate-50 p-4 rounded-lg mb-6">
                            <p className="text-sm text-slate-600">
                                {lang === 'ar' 
                                    ? 'هنا يمكنك تعديل محتوى البانر العلوي والفوتر السفلي في الصفحة الرئيسية.'
                                    : 'Here you can edit the top banner and footer content on the home page.'
                                }
                            </p>
                        </div>

                        {/* Top Banner Section */}
                        <div className="border border-slate-200 rounded-lg overflow-hidden">
                            <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white p-3">
                                <h4 className="font-bold flex items-center gap-2">
                                    🚀 البانر العلوي (Top Banner)
                                </h4>
                            </div>
                            <div className="p-4 space-y-3">
                                <LocalizedInput label="العنوان الرئيسي" value={settings.homeSections.heroTitle} onChange={v => updateNestedField('homeSections', 'heroTitle', v)} />
                                <LocalizedInput label="العنوان الفرعي" value={settings.homeSections.heroSubtitle} onChange={v => updateNestedField('homeSections', 'heroSubtitle', v)} />
                                <LocalizedInput label="عنوان الأعمال" value={settings.homeSections.servicesTitle} onChange={v => updateNestedField('homeSections', 'servicesTitle', v)} />
                                <LocalizedInput label="وصف الأعمال" value={settings.homeSections.servicesSubtitle} onChange={v => updateNestedField('homeSections', 'servicesSubtitle', v)} />
                                <LocalizedInput label="زر البدء" value={settings.homeSections.teamTitle} onChange={v => updateNestedField('homeSections', 'teamTitle', v)} />
                            </div>
                        </div>

                        {/* Font Size Controls */}
                        <div className="border border-slate-200 rounded-lg overflow-hidden">
                            <div className="bg-gradient-to-r from-purple-500 to-purple-600 text-white p-3">
                                <h4 className="font-bold flex items-center gap-2">
                                    📏 أحجام الخطوط (Font Sizes)
                                </h4>
                            </div>
                            <div className="p-4 space-y-4">
                                <div className="bg-blue-50 border border-blue-200 p-3 rounded">
                                    <p className="text-sm text-blue-800 mb-3">
                                        💡 <strong>ملاحظة:</strong> اختر حجم الخط المناسب لكل عنصر. تستخدم قيم Tailwind CSS مثل: text-xs, text-sm, text-base, text-lg, text-xl, text-2xl, text-3xl, text-4xl, text-5xl, text-6xl
                                    </p>
                                </div>
                                
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-bold mb-1">حجم خط العنوان الرئيسي</label>
                                        <select 
                                            value={settings.fontSizes.heroTitle} 
                                            onChange={e => updateNestedField('fontSizes', 'heroTitle', e.target.value)}
                                            className="w-full border p-2 rounded"
                                        >
                                            <option value="text-2xl">صغير (text-2xl)</option>
                                            <option value="text-3xl">متوسط (text-3xl)</option>
                                            <option value="text-4xl">كبير (text-4xl)</option>
                                            <option value="text-5xl">كبير جداً (text-5xl)</option>
                                            <option value="text-6xl">ضخم (text-6xl)</option>
                                        </select>
                                    </div>
                                    
                                    <div>
                                        <label className="block text-sm font-bold mb-1">حجم خط العنوان الفرعي</label>
                                        <select 
                                            value={settings.fontSizes.heroSubtitle} 
                                            onChange={e => updateNestedField('fontSizes', 'heroSubtitle', e.target.value)}
                                            className="w-full border p-2 rounded"
                                        >
                                            <option value="text-sm">صغير جداً (text-sm)</option>
                                            <option value="text-base">صغير (text-base)</option>
                                            <option value="text-lg">متوسط (text-lg)</option>
                                            <option value="text-xl">كبير (text-xl)</option>
                                            <option value="text-2xl">كبير جداً (text-2xl)</option>
                                        </select>
                                    </div>
                                    
                                    <div>
                                        <label className="block text-sm font-bold mb-1">حجم خط عنوان الأعمال</label>
                                        <select 
                                            value={settings.fontSizes.servicesTitle} 
                                            onChange={e => updateNestedField('fontSizes', 'servicesTitle', e.target.value)}
                                            className="w-full border p-2 rounded"
                                        >
                                            <option value="text-xl">صغير (text-xl)</option>
                                            <option value="text-2xl">متوسط (text-2xl)</option>
                                            <option value="text-3xl">كبير (text-3xl)</option>
                                            <option value="text-4xl">كبير جداً (text-4xl)</option>
                                            <option value="text-5xl">ضخم (text-5xl)</option>
                                        </select>
                                    </div>
                                    
                                    <div>
                                        <label className="block text-sm font-bold mb-1">حجم خط وصف الأعمال</label>
                                        <select 
                                            value={settings.fontSizes.servicesSubtitle} 
                                            onChange={e => updateNestedField('fontSizes', 'servicesSubtitle', e.target.value)}
                                            className="w-full border p-2 rounded"
                                        >
                                            <option value="text-sm">صغير جداً (text-sm)</option>
                                            <option value="text-base">صغير (text-base)</option>
                                            <option value="text-lg">متوسط (text-lg)</option>
                                            <option value="text-xl">كبير (text-xl)</option>
                                            <option value="text-2xl">كبير جداً (text-2xl)</option>
                                        </select>
                                    </div>
                                    
                                    <div>
                                        <label className="block text-sm font-bold mb-1">حجم خط زر البدء</label>
                                        <select 
                                            value={settings.fontSizes.teamTitle} 
                                            onChange={e => updateNestedField('fontSizes', 'teamTitle', e.target.value)}
                                            className="w-full border p-2 rounded"
                                        >
                                            <option value="text-sm">صغير جداً (text-sm)</option>
                                            <option value="text-base">صغير (text-base)</option>
                                            <option value="text-lg">متوسط (text-lg)</option>
                                            <option value="text-xl">كبير (text-xl)</option>
                                            <option value="text-2xl">كبير جداً (text-2xl)</option>
                                        </select>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Footer Section */}
                        <div className="border border-slate-200 rounded-lg overflow-hidden">
                            <div className="bg-gradient-to-r from-slate-600 to-slate-700 text-white p-3">
                                <h4 className="font-bold flex items-center gap-2">
                                    📄 الفوتر السفلي (Footer)
                                </h4>
                            </div>
                            <div className="p-4 space-y-3">
                                <div className="bg-yellow-50 border border-yellow-200 p-3 rounded">
                                    <p className="text-sm text-yellow-800">
                                        💡 <strong>ملاحظة:</strong> الفوتر حالياً يعرض نص ثابت "وكالة تسويق رقمي سعودية متكاملة." و "جميع الحقوق محفوظة لشركة تيفرو © 2024" وروابط الخصوصية والشروط.
                                    </p>
                                    <p className="text-xs text-yellow-600 mt-2">
                                        يمكن إضافة خيارات تعديل الفوتر في المستقبل.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'legal' && (
                    <div className="space-y-6 animate-fade-in">
                        <h3 className="font-bold text-lg border-b pb-3 mb-4">{t('admin.settings.legal')}</h3>
                        <LocalizedArea label={t('admin.set.privacy')} value={settings.privacyPolicy} onChange={(v: LocalizedString) => updateField('privacyPolicy', v)} />
                        <div className="border-t my-6"></div>
                        <LocalizedArea label={t('admin.set.terms')} value={settings.termsOfService} onChange={(v: LocalizedString) => updateField('termsOfService', v)} />
                    </div>
                )}

                {activeTab === 'db' && (
                    <div className="space-y-6 animate-fade-in">
                         <h3 className="font-bold text-lg border-b pb-3 mb-4">{t('admin.settings.db')}</h3>
                         
                         {/* Database Connection Test */}
                         <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg mb-6">
                             <h4 className="font-bold text-blue-800 mb-2">اختبار الاتصال بقاعدة البيانات</h4>
                             <p className="text-sm text-blue-700 mb-3">اضغط هنا لاختبار الاتصال بقاعدة البيانات وتشخيص المشاكل</p>
                             <button 
                                 onClick={onTestConnection}
                                 className="bg-blue-600 text-white px-4 py-2 rounded font-medium hover:bg-blue-700 transition"
                             >
                                 اختبار الاتصال
                             </button>
                         </div>
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

export default SettingsNewPage;
