import React, { useState } from 'react';
import { useSettings } from '../hooks/useSettings';
import { useApp } from '../context/AppContext';
import { Loader2, Save, RotateCcw, AlertCircle, CheckCircle, Globe, Phone, Share2, Image as ImageIcon, Database, FileText, LayoutTemplate, Flag, Wand2 } from 'lucide-react';
import { translateText } from '../services/translationService';
import { SiteSettings, LocalizedString } from '../types';

const AutoTranslateButton = ({ text, onTranslate }: { text: string, onTranslate: (v: string) => void }) => {
    const [translating, setTranslating] = React.useState(false);
    if (!text) return null;
    return (
        <button
            type="button"
            onClick={async () => {
                // Blur active element to ensure state is committed
                if (document.activeElement instanceof HTMLElement) {
                    document.activeElement.blur();
                }
                setTranslating(true);
                try {
                    const translated = await translateText(text, 'ar', 'en');
                    if (translated) onTranslate(translated);
                } finally {
                    setTranslating(false);
                }
            }}
            className="flex items-center gap-1.5 text-tivro-primary hover:text-emerald-700 transition px-2 py-0.5 rounded-md hover:bg-emerald-50"
            title="ترجمة تلقائية للإنجليزية"
            disabled={translating}
        >
            {translating ? <Loader2 size={12} className="animate-spin" /> : <Wand2 size={12} />}
            <span className="text-[10px] font-bold">ترجمة فورية</span>
        </button>
    );
};

const LocalizedArea = ({ label, value, onChange }: { label: string, value: LocalizedString, onChange: (v: LocalizedString) => void }) => (
    <div className="mb-6">
        <label className="block text-sm font-bold text-slate-700 mb-2">{label}</label>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="relative">
                <div className="flex justify-between items-center mb-1">
                    <span className="text-[10px] uppercase tracking-wider font-bold text-slate-400">العربية</span>
                    <AutoTranslateButton text={value?.ar || ''} onTranslate={v => onChange({ ...value, en: v })} />
                </div>
                <textarea
                    className="w-full border border-slate-200 p-3 rounded-lg h-28 text-sm focus:ring-2 focus:ring-tivro-primary/20 focus:border-tivro-primary outline-none transition"
                    dir="rtl"
                    placeholder="اكتب النص العربي هنا..."
                    value={value?.ar || ''}
                    onChange={e => onChange({ ...value, ar: e.target.value })}
                />
            </div>
            <div>
                <div className="flex justify-between items-center mb-1">
                    <span className="text-[10px] uppercase tracking-wider font-bold text-slate-400">English (Translated)</span>
                </div>
                <textarea
                    className="w-full border border-slate-200 p-3 rounded-lg h-28 text-sm focus:ring-2 focus:ring-emerald-600/20 focus:border-emerald-600 outline-none transition bg-slate-50/30"
                    dir="ltr"
                    placeholder="English translation will appear here..."
                    value={value?.en || ''}
                    onChange={e => onChange({ ...value, en: e.target.value })}
                />
            </div>
        </div>
    </div>
);

const LocalizedInput = ({ label, value, onChange }: { label: string, value: LocalizedString, onChange: (v: LocalizedString) => void }) => (
    <div className="mb-5">
        <label className="block text-sm font-bold text-slate-700 mb-2">{label}</label>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="relative">
                <div className="flex justify-between items-center mb-1">
                    <span className="text-[10px] uppercase tracking-wider font-bold text-slate-400">العربية</span>
                    <AutoTranslateButton text={value?.ar || ''} onTranslate={v => onChange({ ...value, en: v })} />
                </div>
                <input
                    className="w-full border border-slate-200 p-2.5 rounded-lg text-sm focus:ring-2 focus:ring-tivro-primary/20 focus:border-tivro-primary outline-none transition"
                    dir="rtl"
                    placeholder="نص عربي..."
                    value={value?.ar || ''}
                    onChange={e => onChange({ ...value, ar: e.target.value })}
                />
            </div>
            <div>
                <div className="mb-1">
                    <span className="text-[10px] uppercase tracking-wider font-bold text-slate-400">English</span>
                </div>
                <input
                    className="w-full border border-slate-200 p-2.5 rounded-lg text-sm focus:ring-2 focus:ring-emerald-600/20 focus:border-emerald-600 outline-none transition bg-slate-50/30"
                    dir="ltr"
                    placeholder="English..."
                    value={value?.en || ''}
                    onChange={e => onChange({ ...value, en: e.target.value })}
                />
            </div>
        </div>
    </div>
);

export const SettingsPage: React.FC = () => {
    const { t } = useApp();
    const { settings, setSettings, loading, error, saveSettings, restoreSettings } = useSettings();
    const [activeTab, setActiveTab] = useState<'general' | 'logos' | 'banners' | 'home_content' | 'legal' | 'db'>('general');
    const [msg, setMsg] = useState<{ type: 'success' | 'error', text: string } | null>(null);

    const onSave = async () => {
        if (!settings) return;
        const success = await saveSettings(settings);
        if (success) {
            setMsg({ type: 'success', text: t('admin.settings.saved') });
            setTimeout(() => setMsg(null), 3000);
        } else {
            setMsg({ type: 'error', text: 'Error saving settings' });
        }
    };

    const TabButton = ({ id, icon: Icon, label }: any) => (
        <button onClick={() => setActiveTab(id)} className={`w-full text-left px-4 py-3 rounded-lg font-medium flex items-center gap-3 ${activeTab === id ? 'bg-tivro-primary text-white' : 'bg-white text-slate-600 hover:bg-slate-50'}`}>
            <Icon size={18} /> {label}
        </button>
    );

    // Fallback render if settings is null (should be handled by hook defaults now, but just in case)
    if (!settings) return <div className="p-10 text-center"><Loader2 className="animate-spin mx-auto" /> Loading...</div>;

    return (
        <div className="max-w-5xl mx-auto relative">
            {/* Non-blocking loading indicator */}
            {loading && (
                <div className="absolute top-4 right-4 z-50 bg-white p-2 rounded shadow">
                    <Loader2 className="animate-spin text-slate-400" size={20} />
                </div>
            )}

            <h2 className="text-2xl font-bold text-slate-800 mb-6">{t('admin.tab.settings')}</h2>

            {msg && <div className={`p-4 rounded mb-6 flex items-center gap-2 ${msg.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>{msg.type === 'success' ? <CheckCircle size={18} /> : <AlertCircle size={18} />}{msg.text}</div>}
            {error && <div className="p-4 rounded mb-6 bg-red-100 text-red-800 flex items-center gap-2"><AlertCircle size={18} /> {error}</div>}

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
                            <LocalizedInput label="Site Name" value={settings.siteName} onChange={v => setSettings({ ...settings, siteName: v })} />

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div><label className="block text-sm font-bold mb-1">{t('admin.set.email')}</label><input type="email" className="w-full border p-2 rounded" value={settings.contactEmail || ''} onChange={e => setSettings({ ...settings, contactEmail: e.target.value })} /></div>
                                <div><label className="block text-sm font-bold mb-1">{t('admin.set.phone')}</label><input type="tel" className="w-full border p-2 rounded" value={settings.contactPhone || ''} onChange={e => setSettings({ ...settings, contactPhone: e.target.value })} /></div>
                            </div>
                            <LocalizedInput label="Address" value={settings.address} onChange={v => setSettings({ ...settings, address: v })} />

                            <div className="pt-4 border-t">
                                <div className="flex justify-between items-center mb-2">
                                    <h4 className="font-bold">{t('admin.settings.social')}</h4>
                                    <button onClick={() => setSettings({ ...settings, socialLinks: [...settings.socialLinks, { platform: 'Twitter', url: '' }] })} className="text-xs bg-blue-50 text-blue-600 px-2 py-1 rounded font-bold">+ Add</button>
                                </div>
                                {settings.socialLinks.map((link, i) => (
                                    <div key={i} className="flex flex-col gap-2 mb-3 border border-slate-200 rounded-lg p-3 bg-white">
                                        <div className="flex gap-2">
                                            <input className="w-1/3 border p-2 rounded text-sm" value={link.platform} onChange={e => { const l = [...settings.socialLinks] as any[]; l[i].platform = e.target.value; setSettings({ ...settings, socialLinks: l as any }) }} />
                                            <input className="flex-1 border p-2 rounded text-sm" value={link.url} onChange={e => { const l = [...settings.socialLinks] as any[]; l[i].url = e.target.value; setSettings({ ...settings, socialLinks: l as any }) }} />
                                            <button onClick={() => { const l = settings.socialLinks.filter((_, idx) => idx !== i); setSettings({ ...settings, socialLinks: l }) }} className="text-red-500 px-2">x</button>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                                            <select
                                                className="border p-2 rounded text-sm"
                                                value={(link as any).iconType || ''}
                                                onChange={e => {
                                                    const v = e.target.value;
                                                    const l = [...settings.socialLinks] as any[];
                                                    if (!v) {
                                                        delete l[i].iconType;
                                                        delete l[i].iconValue;
                                                    } else {
                                                        l[i].iconType = v;
                                                        if (typeof l[i].iconValue !== 'string') l[i].iconValue = '';
                                                    }
                                                    setSettings({ ...settings, socialLinks: l as any });
                                                }}
                                            >
                                                <option value="">Auto (from platform)</option>
                                                <option value="lucide">Lucide Icon Name</option>
                                                <option value="svg">SVG Code</option>
                                            </select>

                                            <input
                                                className="border p-2 rounded text-sm md:col-span-2"
                                                placeholder={(link as any).iconType === 'svg' ? '<svg ...>...</svg>' : 'e.g. Instagram / Linkedin / Ghost'}
                                                value={(link as any).iconValue || ''}
                                                onChange={e => {
                                                    const l = [...settings.socialLinks] as any[];
                                                    l[i].iconValue = e.target.value;
                                                    setSettings({ ...settings, socialLinks: l as any });
                                                }}
                                                disabled={!(link as any).iconType}
                                            />
                                        </div>
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
                                <input className="w-full border p-2 rounded" value={settings.logoUrl || ''} onChange={e => setSettings({ ...settings, logoUrl: e.target.value })} />
                                {settings.logoUrl && <img src={settings.logoUrl} className="h-10 mt-2 border p-1" />}
                            </div>
                            <div>
                                <label className="block text-sm font-bold mb-1">Footer Logo URL</label>
                                <input className="w-full border p-2 rounded" value={settings.footerLogoUrl || ''} onChange={e => setSettings({ ...settings, footerLogoUrl: e.target.value })} />
                                {settings.footerLogoUrl && <img src={settings.footerLogoUrl} className="h-10 mt-2 border p-1 bg-slate-800" />}
                            </div>
                            <div>
                                <label className="block text-sm font-bold mb-1">Favicon URL (ICO/PNG)</label>
                                <input className="w-full border p-2 rounded" value={settings.faviconUrl || ''} onChange={e => setSettings({ ...settings, faviconUrl: e.target.value })} />
                                {settings.faviconUrl && <img src={settings.faviconUrl} className="h-8 w-8 mt-2 border p-1" />}
                            </div>
                            <div className="border border-slate-200 rounded-lg p-4 bg-slate-50">
                                <label className="flex items-center gap-2 text-sm font-bold text-slate-700">
                                    <input
                                        type="checkbox"
                                        checked={!!(settings as any).enableEnglish}
                                        onChange={e => setSettings({ ...(settings as any), enableEnglish: e.target.checked })}
                                    />
                                    Enable English language option on the site
                                </label>
                            </div>
                            <LocalizedInput
                                label="Tab Title (Browser Tab)"
                                value={settings.tabTitle}
                                onChange={v => setSettings({ ...settings, tabTitle: v })}
                            />
                        </div>
                    )}

                    {activeTab === 'home_content' && (
                        <div className="space-y-6 animate-fade-in">
                            <h3 className="font-bold text-lg border-b pb-3 mb-4">محتوى الصفحة الرئيسية (Home Page Content)</h3>
                            <div className="bg-slate-50 p-4 rounded-lg mb-6">
                                <p className="text-sm text-slate-600">من هنا يمكنك التحكم في النصوص الرئيسية للصفحة الرئيسية مثل شريط الهيرو، عناوين الأقسام، ووصف الفوتر.</p>
                            </div>

                            <div className="border border-slate-200 rounded-lg overflow-hidden">
                                <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white p-3">
                                    <h4 className="font-bold flex items-center gap-2">شريط الهيرو العلوي (Top Banner)</h4>
                                </div>
                                <div className="p-4 space-y-4">
                                    <LocalizedInput label="Hero Badge (Small text above title)" value={settings.homeSections.heroBadge} onChange={v => setSettings({ ...settings, homeSections: { ...settings.homeSections, heroBadge: v } })} />
                                    <LocalizedInput label="Hero Title" value={settings.homeSections.heroTitle} onChange={v => setSettings({ ...settings, homeSections: { ...settings.homeSections, heroTitle: v } })} />
                                    <LocalizedArea label="Hero Subtitle" value={settings.homeSections.heroSubtitle} onChange={v => setSettings({ ...settings, homeSections: { ...settings.homeSections, heroSubtitle: v } })} />

                                    <div className="border-t pt-4">
                                        <label className="block text-sm font-bold mb-2">Hero Image</label>
                                        <input className="w-full border p-2 rounded mb-2" placeholder="Image URL" value={settings.homeSections.heroImage?.src || ''} onChange={e => setSettings({ ...settings, homeSections: { ...settings.homeSections, heroImage: { ...(settings.homeSections.heroImage || { src: '', alt: { ar: '', en: '' } }), src: e.target.value } } })} />
                                        <LocalizedInput label="Image Alt Text" value={settings.homeSections.heroImage?.alt || { ar: '', en: '' }} onChange={v => setSettings({ ...settings, homeSections: { ...settings.homeSections, heroImage: { ...(settings.homeSections.heroImage || { src: '', alt: { ar: '', en: '' } }), alt: v } } })} />
                                    </div>
                                </div>
                            </div>

                            <div className="border border-slate-200 rounded-lg overflow-hidden">
                                <div className="bg-gradient-to-r from-green-500 to-green-600 text-white p-3">
                                    <h4 className="font-bold flex items-center gap-2">عناوين الأقسام الرئيسية</h4>
                                </div>
                                <div className="p-4 space-y-4">
                                    <LocalizedInput label="عنوان قسم الخدمات" value={settings.homeSections.servicesTitle} onChange={v => setSettings({ ...settings, homeSections: { ...settings.homeSections, servicesTitle: v } })} />
                                    <LocalizedArea label="وصف قسم الخدمات" value={settings.homeSections.servicesSubtitle} onChange={v => setSettings({ ...settings, homeSections: { ...settings.homeSections, servicesSubtitle: v } })} />
                                    <hr />
                                    <LocalizedInput label="عنوان قسم أعمالنا" value={settings.sectionTexts.workTitle} onChange={v => setSettings({ ...settings, sectionTexts: { ...settings.sectionTexts, workTitle: v } })} />
                                    <LocalizedInput label="عنوان قسم الفريق" value={settings.homeSections.teamTitle} onChange={v => setSettings({ ...settings, homeSections: { ...settings.homeSections, teamTitle: v } })} />
                                </div>
                            </div>

                            <div className="border border-slate-200 rounded-lg overflow-hidden">
                                <div className="bg-gradient-to-r from-purple-500 to-purple-600 text-white p-3">
                                    <h4 className="font-bold flex items-center gap-2">التحكم في أحجام الخطوط (Font Sizes)</h4>
                                </div>
                                <div className="p-4 space-y-4">
                                    <div className="bg-blue-50 border border-blue-200 p-3 rounded text-sm">
                                        <p className="text-blue-800 mb-1 font-bold">ملاحظة هامة:</p>
                                        <p className="text-blue-700">هذه الحقول تقبل كلاسات Tailwind للخطوط مثل: text-xs, text-sm, text-base, text-lg, text-xl, text-2xl, text-3xl, text-4xl, text-5xl, text-6xl.</p>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-bold mb-1">حجم خط عنوان الهيرو</label>
                                            <select className="w-full border p-2 rounded" value={settings.fontSizes.heroTitle} onChange={e => setSettings({ ...settings, fontSizes: { ...settings.fontSizes, heroTitle: e.target.value } })}>
                                                <option value="text-2xl">كبير (text-2xl)</option>
                                                <option value="text-3xl">أكبر (text-3xl)</option>
                                                <option value="text-4xl">ضخم (text-4xl)</option>
                                                <option value="text-5xl">ضخم جداً (text-5xl)</option>
                                                <option value="text-6xl">هائل (text-6xl)</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-bold mb-1">حجم خط عنوان الخدمات</label>
                                            <select className="w-full border p-2 rounded" value={settings.fontSizes.servicesTitle} onChange={e => setSettings({ ...settings, fontSizes: { ...settings.fontSizes, servicesTitle: e.target.value } })}>
                                                <option value="text-xl">Regular (text-xl)</option>
                                                <option value="text-2xl">Large (text-2xl)</option>
                                                <option value="text-3xl">Extra Large (text-3xl)</option>
                                                <option value="text-4xl">Huge (text-4xl)</option>
                                            </select>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="border border-slate-200 rounded-lg overflow-hidden">
                                <div className="bg-gradient-to-r from-slate-600 to-slate-700 text-white p-3">
                                    <h4 className="font-bold flex items-center gap-2">إعدادات الفوتر (Footer)</h4>
                                </div>
                                <div className="p-4 space-y-4">
                                    <LocalizedArea label="وصف الفوتر" value={settings.footerDescription} onChange={v => setSettings({ ...settings, footerDescription: v })} />
                                    <LocalizedInput label="نص حقوق النشر" value={settings.copyrightText} onChange={v => setSettings({ ...settings, copyrightText: v })} />
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <LocalizedInput label="نص رابط سياسة الخصوصية" value={settings.footerLinks.privacy} onChange={v => setSettings({ ...settings, footerLinks: { ...settings.footerLinks, privacy: v } })} />
                                        <LocalizedInput label="نص رابط شروط الاستخدام" value={settings.footerLinks.terms} onChange={v => setSettings({ ...settings, footerLinks: { ...settings.footerLinks, terms: v } })} />
                                    </div>
                                    <div className="bg-green-50 border border-green-200 p-3 rounded">
                                        <p className="text-sm text-green-800 font-bold">✅ ملاحظة:</p>
                                        <p className="text-xs text-green-600 mt-1">تغييرات الفوتر يتم حفظها مع بقية إعدادات الموقع عند الضغط على زر "حفظ التغييرات".</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'banners' && (
                        <div className="space-y-8 animate-fade-in">
                            <div>
                                <div className="flex items-center gap-2 mb-4">
                                    <input type="checkbox" checked={settings.topBanner?.enabled || false} onChange={e => setSettings({ ...settings, topBanner: { ...settings.topBanner, enabled: e.target.checked } })} className="w-5 h-5" />
                                    <h3 className="font-bold text-lg">Top Banner</h3>
                                </div>
                                {settings.topBanner?.enabled && (
                                    <div className="bg-slate-50 p-4 rounded border space-y-3">
                                        <LocalizedInput label="عنوان البانر" value={settings.topBanner.title} onChange={v => setSettings({ ...settings, topBanner: { ...settings.topBanner, title: v } })} />
                                        <LocalizedInput label="نص الزر" value={settings.topBanner.buttonText || { ar: '', en: '' }} onChange={v => setSettings({ ...settings, topBanner: { ...settings.topBanner, buttonText: v } })} />
                                        <div><label className="text-xs font-bold">رابط البانر (URL)</label><input className="w-full border p-2 rounded" value={settings.topBanner.link || ''} onChange={e => setSettings({ ...settings, topBanner: { ...settings.topBanner, link: e.target.value } })} /></div>
                                    </div>
                                )}
                            </div>

                            <div>
                                <div className="flex items-center gap-2 mb-4">
                                    <input type="checkbox" checked={settings.bottomBanner?.enabled || false} onChange={e => setSettings({ ...settings, bottomBanner: { ...settings.bottomBanner, enabled: e.target.checked } })} className="w-5 h-5" />
                                    <h3 className="font-bold text-lg">Bottom Banner</h3>
                                </div>
                                {settings.bottomBanner?.enabled && (
                                    <div className="bg-slate-50 p-4 rounded border space-y-3">
                                        <LocalizedInput label="عنوان البانر" value={settings.bottomBanner.title} onChange={v => setSettings({ ...settings, bottomBanner: { ...settings.bottomBanner, title: v } })} />
                                        <LocalizedArea label="وصف البانر" value={settings.bottomBanner.subtitle || { ar: '', en: '' }} onChange={(v: LocalizedString) => setSettings({ ...settings, bottomBanner: { ...settings.bottomBanner, subtitle: v } })} />
                                        <div><label className="text-xs font-bold">رابط صورة الخلفية (URL)</label><input className="w-full border p-2 rounded" value={settings.bottomBanner.bgImage || ''} onChange={e => setSettings({ ...settings, bottomBanner: { ...settings.bottomBanner, bgImage: e.target.value } })} /></div>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {activeTab === 'legal' && (
                        <div className="space-y-6 animate-fade-in">
                            <h3 className="font-bold text-lg border-b pb-3 mb-4">{t('admin.settings.legal')}</h3>
                            <LocalizedArea label={t('admin.set.privacy')} value={settings.privacyPolicy} onChange={(v: LocalizedString) => setSettings({ ...settings, privacyPolicy: v })} />
                            <div className="border-t my-6"></div>
                            <LocalizedArea label={t('admin.set.terms')} value={settings.termsOfService} onChange={(v: LocalizedString) => setSettings({ ...settings, termsOfService: v })} />
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
                                    if (confirm(t('admin.seed.warning'))) {
                                        const success = await restoreSettings();
                                        if (success) alert(t('admin.seed.success'));
                                        else alert('Error seeding DB');
                                    }
                                }}
                                className="bg-slate-800 text-white px-6 py-3 rounded-lg font-bold hover:bg-slate-900 transition w-full flex justify-center gap-2"
                            >
                                <RotateCcw size={18} /> {t('admin.seed.btn')}
                            </button>
                        </div>
                    )}

                    <div className="pt-6 mt-6 border-t flex justify-end">
                        <button onClick={onSave} disabled={loading} className="bg-tivro-primary text-white px-8 py-3 rounded-lg font-bold hover:bg-emerald-700 flex items-center gap-2 shadow-lg shadow-tivro-primary/20">
                            {loading && <Loader2 className="animate-spin" size={18} />}
                            {t('admin.btn.save')}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};