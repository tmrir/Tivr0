import React, { useState, useEffect } from 'react';
import { useSettingsContext } from '../context/SettingsContext';
import { useApp } from '../context/AppContext';
import { Loader2, Save, RotateCcw, AlertCircle, CheckCircle, Globe, Phone, Share2, Image as ImageIcon, Database, FileText, LayoutTemplate, Wand2 } from 'lucide-react';
import { translateText } from '../services/translationService';
import { SiteSettings, LocalizedString } from '../types';
import { settingsService } from '../services/settingsService';

const AutoTranslateButton = ({ text, onTranslate }: { text: string, onTranslate: (v: string) => void }) => {
    const [translating, setTranslating] = React.useState(false);
    if (!text) return null;
    return (
        <button
            type="button"
            onClick={async () => {
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

export const SettingsNewPage: React.FC = () => {
    const { t, lang } = useApp();
    const { settings, loading, saving: savingFromContext, updateField, saveSettings } = useSettingsContext();
    const [activeTab, setActiveTab] = useState<'general' | 'logos' | 'home_content' | 'legal' | 'db'>('general');
    const [msg, setMsg] = useState<{ type: 'success' | 'error', text: string } | null>(null);
    const [hasLoaded, setHasLoaded] = useState(false);
    const [testingDb, setTestingDb] = useState(false);
    const [heroImageUploading, setHeroImageUploading] = useState(false);
    const [heroImageUploadError, setHeroImageUploadError] = useState<string | null>(null);

    // إبقاء this component aware of first mount فقط لأغراض لوجية/عرضية
    useEffect(() => {
        if (!hasLoaded) {
            console.log('≡ƒöº [SettingsNewPage] Component mounted');
            setHasLoaded(true);
        }
    }, [hasLoaded]);

    // إعداد قيم افتراضية في حال عدم وجود إعدادات من الخادم
    const safeSettings = {
        siteName: settings?.siteName || { ar: 'تيفرو', en: 'Tivro' },
        contactEmail: settings?.contactEmail || 'info@tivro.sa',
        contactPhone: settings?.contactPhone || '+966 50 2026 151',
        address: settings?.address || { ar: 'الرياض، المملكة العربية السعودية', en: 'Riyadh, Saudi Arabia' },
        socialLinks: Array.isArray(settings?.socialLinks) ? settings.socialLinks : [],

        enableEnglish: settings?.enableEnglish ?? false,
        tabTitle: (settings as any)?.tabTitle || { ar: 'وكالة التسويق الرقمي', en: 'Digital Marketing Agency' },

        logoUrl: settings?.logoUrl || '',
        iconUrl: settings?.iconUrl || '',
        footerLogoUrl: settings?.footerLogoUrl || '',
        faviconUrl: settings?.faviconUrl || '',
        topBanner: settings?.topBanner || { enabled: false, title: { ar: '', en: '' } },
        bottomBanner: settings?.bottomBanner || { enabled: false, title: { ar: '', en: '' } },
        sectionTexts: settings?.sectionTexts || {
            workTitle: { ar: 'قصص نجاح نفخر بها', en: 'Success Stories We Are Proud Of' },
            workSubtitle: { ar: 'أرقام ونتائج تعكس إنجازاتنا', en: 'Numbers speaking our achievements' }
        },
        homeSections: settings?.homeSections || {
            heroTitle: { ar: 'نحو حضور رقمي أقوى', en: 'We Turn Your Ideas into Digital Reality' },
            heroSubtitle: { ar: 'وكالة تسويق رقمي متكاملة الخدمات', en: 'A full-service digital marketing agency' },
            servicesTitle: { ar: 'خدماتنا', en: 'Our Services' },
            servicesSubtitle: { ar: 'حلول رقمية متكاملة تناسب نمو عملك', en: 'Integrated digital solutions' },
            teamTitle: { ar: 'فريق العمل', en: 'Our Team' },
            teamSubtitle: { ar: 'فريق مختص في مجالات التسويق الرقمي', en: 'Expert team' },
            packagesTitle: { ar: 'الباقات والعروض', en: 'Our Packages' },
            contactTitle: { ar: 'تواصل معنا', en: 'Contact Us' },
            contactSubtitle: { ar: 'يسعدنا الرد على جميع استفساراتك', en: 'Contact Us' }
        },
        fontSizes: settings?.fontSizes || {
            heroTitle: 'text-4xl',
            heroSubtitle: 'text-xl',
            servicesTitle: 'text-3xl',
            servicesSubtitle: 'text-lg',
            teamTitle: 'text-2xl'
        },
        privacyPolicy: settings?.privacyPolicy || { ar: '', en: '' },
        termsOfService: settings?.termsOfService || { ar: '', en: '' },
        footerDescription: settings?.footerDescription || { ar: 'وكالة سعودية متخصصة في التسويق الرقمي والخدمات الإبداعية.', en: 'A full-service Saudi digital marketing agency.' },
        copyrightText: settings?.copyrightText || { ar: 'جميع الحقوق محفوظة 2024', en: 'All rights reserved 2024' },
        footerLinks: settings?.footerLinks || {
            privacy: { ar: 'سياسة الخصوصية', en: 'Privacy Policy' },
            terms: { ar: 'شروط الاستخدام', en: 'Terms of Service' }
        }
    };

    const onSave = async () => {
        console.log('≡ƒöº [SettingsNewPage] onSave called');
        try {
            const success = await saveSettings();
            if (success) {
                console.log('Γ£à [SettingsNewPage] Save successful');
                setMsg({ type: 'success', text: t('admin.settings.saved') });
            } else {
                console.log('Γ¥î [SettingsNewPage] Save failed');
                setMsg({ type: 'error', text: 'Error saving settings' });
            }
        } catch (e) {
            console.error('Γ¥î [SettingsNewPage] Save exception:', e);
            setMsg({ type: 'error', text: 'Error saving settings' });
        } finally {
            setTimeout(() => setMsg(null), 3000);
        }
    };

    const uploadHeroMediaFile = async (file: File): Promise<{ url: string; mime: string } | null> => {
        setHeroImageUploadError(null);

        const maxBytes = 4 * 1024 * 1024;
        if (file.size <= 0 || file.size > maxBytes) {
            setHeroImageUploadError(lang === 'ar' ? 'حجم الملف غير مسموح' : 'File size not allowed');
            return null;
        }

        const allowed = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'application/pdf']);
        const mime = (file.type || '').toLowerCase();
        if (!allowed.has(mime)) {
            setHeroImageUploadError(lang === 'ar' ? 'نوع الملف غير مسموح' : 'File type not allowed');
            return null;
        }

        setHeroImageUploading(true);
        try {
            const currentSrc = (safeSettings as any)?.homeSections?.heroImage?.src as string | undefined;
            const extractOldPath = (url?: string): string | null => {
                if (!url) return null;
                try {
                    const marker = '/storage/v1/object/public/';
                    const idx = url.indexOf(marker);
                    if (idx === -1) return null;
                    const rest = url.slice(idx + marker.length);
                    const parts = rest.split('/');
                    if (parts.length < 2) return null;
                    parts.shift();
                    const path = parts.join('/');
                    return path || null;
                } catch {
                    return null;
                }
            };

            const formData = new FormData();
            formData.append('file', file);

            const oldPath = extractOldPath(currentSrc);
            if (oldPath) {
                formData.append('oldPath', oldPath);
            }

            const res = await fetch('/api/uploads/create', {
                method: 'POST',
                body: formData
            });

            const json = await res.json().catch(() => null);
            if (!res.ok || !json?.ok || !json?.data?.url) {
                setHeroImageUploadError((json?.error as string) || (lang === 'ar' ? 'فشل رفع الملف' : 'Upload failed'));
                return null;
            }

            return { url: json.data.url as string, mime: (json.data.mime as string) || mime };
        } catch (e: any) {
            setHeroImageUploadError(e?.message || (lang === 'ar' ? 'فشل رفع الملف' : 'Upload failed'));
            return null;
        } finally {
            setHeroImageUploading(false);
        }
    };

    const updateNestedField = (parentPath: keyof SiteSettings | string, childKey: string, value: any) => {
        // يدعم مسارات مثل "homeSections" أو "footerLinks.privacy"
        const path = String(parentPath);

        if (path.includes('.')) {
            const [rootKey, subKey] = path.split('.');
            const rootObj = (settings as any)[rootKey] || {};
            const currentSub = rootObj[subKey] || {};
            const updatedSub = { ...currentSub, [childKey]: value };
            const updatedRoot = { ...rootObj, [subKey]: updatedSub };
            updateField(rootKey as keyof SiteSettings, updatedRoot);
        } else {
            const parent = (settings as any)[path] || {};
            const updatedParent = { ...parent, [childKey]: value };
            updateField(path as keyof SiteSettings, updatedParent);
        }
    };

    const onTestConnection = async () => {
        setTestingDb(true);
        try {
            const ok = await settingsService.testConnection();
            if (ok) {
                setMsg({ type: 'success', text: lang === 'ar' ? 'تم الاتصال بقاعدة البيانات بنجاح.' : 'Database connection successful.' });
            } else {
                setMsg({ type: 'error', text: lang === 'ar' ? 'فشل اختبار الاتصال بقاعدة البيانات.' : 'Database connection test failed.' });
            }
        } catch (e) {
            setMsg({ type: 'error', text: lang === 'ar' ? 'حدث خطأ أثناء اختبار الاتصال.' : 'Error while testing connection.' });
        } finally {
            setTestingDb(false);
            setTimeout(() => setMsg(null), 3000);
        }
    };

    const TabButton = ({ id, icon: Icon, label }: any) => (
        <button onClick={() => setActiveTab(id)} className={`w-full text-left px-4 py-3 rounded-lg font-medium flex items-center gap-3 ${activeTab === id ? 'bg-tivro-primary text-white' : 'bg-white text-slate-600 hover:bg-slate-50'}`}>
            <Icon size={18} /> {label}
        </button>
    );

    return (
        <div className="max-w-5xl mx-auto relative">
            {/* Loading indicator */}
            {loading && (
                <div className="absolute top-4 right-4 z-50 bg-white p-2 rounded shadow">
                    <Loader2 className="animate-spin text-slate-400" size={20} />
                </div>
            )}

            <h2 className="text-2xl font-bold text-slate-800 mb-6">{t('admin.tab.settings')} (New Version)</h2>

            {msg && <div className={`p-4 rounded mb-6 flex items-center gap-2 ${msg.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>{msg.type === 'success' ? <CheckCircle size={18} /> : <AlertCircle size={18} />}{msg.text}</div>}

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
                            <LocalizedInput label="Site Name" value={safeSettings.siteName} onChange={v => updateField('siteName', v)} />

                            <div className="border border-slate-200 rounded-lg p-4 bg-slate-50">
                                <label className="flex items-center gap-2 text-sm font-bold text-slate-700">
                                    <input
                                        type="checkbox"
                                        checked={!!safeSettings.enableEnglish}
                                        onChange={(e) => updateField('enableEnglish', e.target.checked)}
                                    />
                                    {lang === 'ar' ? 'إظهار خيار اللغة الإنجليزية في الموقع' : 'Enable English language option on the site'}
                                </label>
                                {!safeSettings.enableEnglish && (
                                    <div className="text-xs text-slate-500 mt-2">
                                        {lang === 'ar' ? 'عند الإيقاف: سيتم قفل اللغة على العربية وإخفاء زر التبديل.' : 'When disabled: the site is locked to Arabic and the toggle is hidden.'}
                                    </div>
                                )}
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-bold mb-1">{t('admin.set.email')}</label>
                                    <input className="w-full border p-2 rounded" value={safeSettings.contactEmail || ''} onChange={e => updateField('contactEmail', e.target.value)} />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold mb-1">{t('admin.set.phone')}</label>
                                    <input className="w-full border p-2 rounded" value={safeSettings.contactPhone || ''} onChange={e => updateField('contactPhone', e.target.value)} />
                                </div>
                            </div>
                            <LocalizedInput label="Address" value={safeSettings.address} onChange={v => updateField('address', v)} />

                            <div className="pt-4 border-t">
                                <div className="flex justify-between items-center mb-2">
                                    <h4 className="font-bold">{t('admin.settings.social')}</h4>
                                    <button onClick={() => updateField('socialLinks', [...safeSettings.socialLinks, { platform: 'Twitter', url: '' }])} className="text-xs bg-blue-50 text-blue-600 px-2 py-1 rounded font-bold">+ Add</button>
                                </div>
                                {safeSettings.socialLinks.map((link, i) => (
                                    <div key={i} className="flex gap-2 mb-2">
                                        <input className="w-1/3 border p-2 rounded text-sm" value={link.platform} onChange={e => {
                                            const l = [...safeSettings.socialLinks];
                                            l[i].platform = e.target.value;
                                            updateField('socialLinks', l);
                                        }} />
                                        <input className="flex-1 border p-2 rounded text-sm" value={link.url} onChange={e => {
                                            const l = [...safeSettings.socialLinks];
                                            l[i].url = e.target.value;
                                            updateField('socialLinks', l);
                                        }} />
                                        <button onClick={() => {
                                            const l = safeSettings.socialLinks.filter((_, idx) => idx !== i);
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
                                <input className="w-full border p-2 rounded" value={safeSettings.logoUrl || ''} onChange={e => updateField('logoUrl', e.target.value)} />
                                {settings.logoUrl && <img src={safeSettings.logoUrl} className="h-10 mt-2 border p-1" />}
                            </div>
                            <div>
                                <label className="block text-sm font-bold mb-1">Footer Logo URL</label>
                                <input className="w-full border p-2 rounded" value={safeSettings.footerLogoUrl || ''} onChange={e => updateField('footerLogoUrl', e.target.value)} />
                                {settings.footerLogoUrl && <img src={safeSettings.footerLogoUrl} className="h-10 mt-2 border p-1 bg-slate-800" />}
                            </div>
                            <div>
                                <label className="block text-sm font-bold mb-1">Favicon URL (ICO/PNG)</label>
                                <input className="w-full border p-2 rounded" value={safeSettings.faviconUrl || ''} onChange={e => updateField('faviconUrl', e.target.value)} />
                                {settings.faviconUrl && <img src={safeSettings.faviconUrl} className="h-8 w-8 mt-2 border p-1" />}
                            </div>

                            <LocalizedInput
                                label="عنوان تبويب المتصفح (Tab Title)"
                                value={safeSettings.tabTitle}
                                onChange={v => updateField('tabTitle', v)}
                            />
                        </div>
                    )}

                    {activeTab === 'home_content' && (
                        <div className="space-y-6 animate-fade-in">
                            <h3 className="font-bold text-lg border-b pb-3 mb-4">محتوى الصفحة الرئيسية (Home Page Content)</h3>

                            <div className="bg-slate-50 p-4 rounded-lg mb-6">
                                <p className="text-sm text-slate-600">
                                    {lang === 'ar'
                                        ? 'من هنا يمكنك التحكم في النصوص الرئيسية للصفحة الرئيسية مثل شريط الهيرو، عناوين الأقسام، ووصف الفوتر.'
                                        : 'Here you can edit the main home page content such as hero, section titles, and footer texts.'
                                    }
                                </p>
                            </div>

                            {/* Top Banner Section */}
                            <div className="border border-slate-200 rounded-lg overflow-hidden">
                                <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white p-3">
                                    <h4 className="font-bold flex items-center gap-2">
                                        شريط الهيرو العلوي (Top Banner)
                                    </h4>
                                </div>
                                <div className="p-4 space-y-3">
                                    <LocalizedInput label="شريط صغير فوق العنوان (Hero Badge)" value={safeSettings.homeSections.heroBadge} onChange={v => updateNestedField('homeSections', 'heroBadge', v)} />
                                    <LocalizedInput label="عنوان قسم الهيرو" value={safeSettings.homeSections.heroTitle} onChange={v => updateNestedField('homeSections', 'heroTitle', v)} />
                                    <LocalizedArea label="وصف قسم الهيرو" value={safeSettings.homeSections.heroSubtitle} onChange={v => updateNestedField('homeSections', 'heroSubtitle', v)} />

                                    <div className="border border-slate-200 rounded-lg p-4 bg-white space-y-3">
                                        <h5 className="font-bold text-slate-800">صورة الهيرو</h5>

                                        <div>
                                            <label className="block text-sm font-bold text-slate-700 mb-2">رابط صورة الهيرو (URL)</label>
                                            <input
                                                className="w-full border p-2 rounded"
                                                value={safeSettings.homeSections.heroImage?.src || safeSettings.homeSections.heroImageUrl || ''}
                                                onChange={(e) => {
                                                    const v = e.target.value;
                                                    updateNestedField('homeSections', 'heroImage', {
                                                        ...(safeSettings.homeSections.heroImage || { src: '', alt: { ar: 'صورة', en: 'Image' } }),
                                                        src: v
                                                    });
                                                    updateNestedField('homeSections', 'heroImageUrl', v);
                                                }}
                                                placeholder="https://... أو /images/..."
                                            />
                                            {!!(safeSettings.homeSections.heroImage?.src || safeSettings.homeSections.heroImageUrl) && (
                                                <div className="mt-3">
                                                    <img
                                                        src={safeSettings.homeSections.heroImage?.src || safeSettings.homeSections.heroImageUrl}
                                                        className="h-24 w-auto rounded border border-slate-200 bg-slate-50"
                                                    />
                                                </div>
                                            )}
                                        </div>

                                        <div>
                                            <label className="block text-sm font-bold text-slate-700 mb-2">رفع ملف (صور/PDF)</label>
                                            <input
                                                type="file"
                                                accept="image/jpeg,image/png,image/webp,image/gif,application/pdf"
                                                disabled={heroImageUploading}
                                                onChange={async (e) => {
                                                    const file = e.target.files?.[0];
                                                    e.target.value = '';
                                                    if (!file) return;

                                                    const uploaded = await uploadHeroMediaFile(file);
                                                    if (!uploaded) return;

                                                    updateNestedField('homeSections', 'heroImage', {
                                                        ...(safeSettings.homeSections.heroImage || { src: '', alt: { ar: 'صورة', en: 'Image' } }),
                                                        src: uploaded.url,
                                                        mime: uploaded.mime
                                                    });
                                                    updateNestedField('homeSections', 'heroImageUrl', uploaded.url);
                                                }}
                                                className="w-full border p-2 rounded bg-white"
                                            />

                                            {heroImageUploading && (
                                                <div className="text-sm text-slate-600">
                                                    {lang === 'ar' ? 'جاري الرفع...' : 'Uploading...'}
                                                </div>
                                            )}
                                            {heroImageUploadError && (
                                                <div className="text-sm text-red-600">{heroImageUploadError}</div>
                                            )}
                                        </div>

                                        <LocalizedInput
                                            label={lang === 'ar' ? 'النص البديل (Alt) للصورة' : 'Image Alt Text'}
                                            value={safeSettings.homeSections.heroImage?.alt || { ar: 'صورة', en: 'Image' }}
                                            onChange={(v) => {
                                                updateNestedField('homeSections', 'heroImage', {
                                                    ...(safeSettings.homeSections.heroImage || { src: '', alt: { ar: 'صورة', en: 'Image' } }),
                                                    alt: v
                                                });
                                            }}
                                        />

                                        <div>
                                            <label className="block text-sm font-bold text-slate-700 mb-2">موضع الصورة</label>
                                            <select
                                                className="w-full border p-2 rounded"
                                                value={safeSettings.homeSections.heroImagePosition || 'right'}
                                                onChange={(e) => updateNestedField('homeSections', 'heroImagePosition', e.target.value)}
                                            >
                                                <option value="right">يمين (Right)</option>
                                                <option value="left">يسار (Left)</option>
                                                <option value="top">أعلى (Top)</option>
                                                <option value="bottom">أسفل (Bottom)</option>
                                                <option value="background">خلف النص (Background)</option>
                                            </select>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                                        <label className="flex items-center gap-2 text-sm font-bold text-slate-700">
                                            <input
                                                type="checkbox"
                                                checked={safeSettings.homeSections.heroButtonsEnabled !== false}
                                                onChange={(e) => updateNestedField('homeSections', 'heroButtonsEnabled', e.target.checked)}
                                            />
                                            إظهار أزرار الهيرو (CTA Buttons)
                                        </label>
                                        <label className="flex items-center gap-2 text-sm font-bold text-slate-700">
                                            <input
                                                type="checkbox"
                                                checked={safeSettings.homeSections.heroStatsEnabled !== false}
                                                onChange={(e) => updateNestedField('homeSections', 'heroStatsEnabled', e.target.checked)}
                                            />
                                            إظهار شريط الإحصائيات أسفل الهيرو
                                        </label>
                                    </div>

                                    {safeSettings.homeSections.heroButtonsEnabled !== false && (
                                        <div className="border border-slate-200 rounded-lg p-4 bg-white space-y-4">
                                            <h5 className="font-bold text-slate-800">إعدادات أزرار الهيرو</h5>

                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <div>
                                                    <label className="block text-sm font-bold text-slate-700 mb-2">رابط الزر الأساسي</label>
                                                    <input
                                                        className="w-full border p-2 rounded"
                                                        value={safeSettings.homeSections.heroPrimaryCta?.href || ''}
                                                        onChange={(e) => updateNestedField('homeSections', 'heroPrimaryCta', {
                                                            ...(safeSettings.homeSections.heroPrimaryCta || { label: { ar: '', en: '' }, href: '' }),
                                                            href: e.target.value
                                                        })}
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-sm font-bold text-slate-700 mb-2">رابط الزر الثانوي</label>
                                                    <input
                                                        className="w-full border p-2 rounded"
                                                        value={safeSettings.homeSections.heroSecondaryCta?.href || ''}
                                                        onChange={(e) => updateNestedField('homeSections', 'heroSecondaryCta', {
                                                            ...(safeSettings.homeSections.heroSecondaryCta || { label: { ar: '', en: '' }, href: '' }),
                                                            href: e.target.value
                                                        })}
                                                    />
                                                </div>
                                            </div>

                                            <LocalizedInput
                                                label="نص الزر الأساسي"
                                                value={safeSettings.homeSections.heroPrimaryCta?.label || { ar: '', en: '' }}
                                                onChange={(v) => updateNestedField('homeSections', 'heroPrimaryCta', {
                                                    ...(safeSettings.homeSections.heroPrimaryCta || { label: { ar: '', en: '' }, href: '' }),
                                                    label: v
                                                })}
                                            />

                                            <LocalizedInput
                                                label="نص الزر الثانوي"
                                                value={safeSettings.homeSections.heroSecondaryCta?.label || { ar: '', en: '' }}
                                                onChange={(v) => updateNestedField('homeSections', 'heroSecondaryCta', {
                                                    ...(safeSettings.homeSections.heroSecondaryCta || { label: { ar: '', en: '' }, href: '' }),
                                                    label: v
                                                })}
                                            />
                                        </div>
                                    )}

                                    {safeSettings.homeSections.heroStatsEnabled !== false && (
                                        <div className="border border-slate-200 rounded-lg p-4 bg-white space-y-4">
                                            <h5 className="font-bold text-slate-800">إعدادات شريط الإحصائيات</h5>

                                            {(safeSettings.homeSections.heroStats || []).slice(0, 3).map((stat: any, idx: number) => (
                                                <div key={idx} className="border border-slate-100 rounded-lg p-3">
                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                                        <div>
                                                            <label className="block text-sm font-bold text-slate-700 mb-2">القيمة</label>
                                                            <input
                                                                className="w-full border p-2 rounded"
                                                                value={stat?.value || ''}
                                                                onChange={(e) => {
                                                                    const next = [...(safeSettings.homeSections.heroStats || [])];
                                                                    next[idx] = { ...(next[idx] || {}), value: e.target.value, label: (next[idx]?.label || { ar: '', en: '' }) };
                                                                    updateNestedField('homeSections', 'heroStats', next);
                                                                }}
                                                            />
                                                        </div>
                                                        <div>
                                                            <LocalizedInput
                                                                label="عنوان الإحصائية"
                                                                value={stat?.label || { ar: '', en: '' }}
                                                                onChange={(v) => {
                                                                    const next = [...(safeSettings.homeSections.heroStats || [])];
                                                                    next[idx] = { ...(next[idx] || {}), value: (next[idx]?.value || ''), label: v };
                                                                    updateNestedField('homeSections', 'heroStats', next);
                                                                }}
                                                            />
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}

                                    <LocalizedInput label="عنوان قسم الخدمات" value={safeSettings.homeSections.servicesTitle} onChange={v => updateNestedField('homeSections', 'servicesTitle', v)} />
                                    <LocalizedArea label="وصف قسم الخدمات" value={safeSettings.homeSections.servicesSubtitle} onChange={v => updateNestedField('homeSections', 'servicesSubtitle', v)} />
                                    <LocalizedInput label="عنوان قسم الفريق" value={safeSettings.homeSections.teamTitle} onChange={v => updateNestedField('homeSections', 'teamTitle', v)} />
                                </div>
                            </div>

                            {/* Legal Links Section */}
                            <div className="border border-slate-200 rounded-lg overflow-hidden">
                                <div className="bg-gradient-to-r from-green-500 to-green-600 text-white p-3">
                                    <h4 className="font-bold flex items-center gap-2">
                                        روابط الصفحات القانونية (Legal Links)
                                    </h4>
                                </div>
                                <div className="p-4 space-y-3">
                                    <LocalizedInput label="نص رابط سياسة الخصوصية" value={safeSettings.sectionTexts.privacyLink} onChange={v => updateNestedField('sectionTexts', 'privacyLink', v)} />
                                    <LocalizedInput label="نص رابط شروط الاستخدام" value={safeSettings.sectionTexts.termsLink} onChange={v => updateNestedField('sectionTexts', 'termsLink', v)} />
                                </div>
                            </div>

                            {/* Font Size Controls */}
                            <div className="border border-slate-200 rounded-lg overflow-hidden">
                                <div className="bg-gradient-to-r from-purple-500 to-purple-600 text-white p-3">
                                    <h4 className="font-bold flex items-center gap-2">
                                        التحكم في أحجام الخطوط (Font Sizes)
                                    </h4>
                                </div>
                                <div className="p-4 space-y-4">
                                    <div className="bg-blue-50 border border-blue-200 p-3 rounded">
                                        <p className="text-sm text-blue-800 mb-3">
                                            ملاحظة <strong>هامة:</strong> هذه الحقول تقبل كلاسات Tailwind للخطوط مثل: text-xs, text-sm, text-base, text-lg, text-xl, text-2xl, text-3xl, text-4xl, text-5xl, text-6xl.
                                        </p>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-bold mb-1">حجم خط عنوان الهيرو الرئيسي</label>
                                            <select
                                                value={safeSettings.fontSizes.heroTitle}
                                                onChange={e => updateNestedField('fontSizes', 'heroTitle', e.target.value)}
                                                className="w-full border p-2 rounded"
                                            >
                                                <option value="text-2xl">كبير (text-2xl)</option>
                                                <option value="text-3xl">أكبر (text-3xl)</option>
                                                <option value="text-4xl">ضخم (text-4xl)</option>
                                                <option value="text-5xl">ضخم جدًا (text-5xl)</option>
                                                <option value="text-6xl">هائل (text-6xl)</option>
                                            </select>
                                        </div>

                                        <div>
                                            <label className="block text-sm font-bold mb-1">حجم خط وصف الهيرو</label>
                                            <select
                                                value={safeSettings.fontSizes.heroSubtitle}
                                                onChange={e => updateNestedField('fontSizes', 'heroSubtitle', e.target.value)}
                                                className="w-full border p-2 rounded"
                                            >
                                                <option value="text-sm">صغير (text-sm)</option>
                                                <option value="text-base">افتراضي (text-base)</option>
                                                <option value="text-lg">متوسط (text-lg)</option>
                                                <option value="text-xl">كبير (text-xl)</option>
                                                <option value="text-2xl">أكبر (text-2xl)</option>
                                            </select>
                                        </div>

                                        <div>
                                            <label className="block text-sm font-bold mb-1">حجم خط عنوان قسم الخدمات</label>
                                            <select
                                                value={safeSettings.fontSizes.servicesTitle}
                                                onChange={e => updateNestedField('fontSizes', 'servicesTitle', e.target.value)}
                                                className="w-full border p-2 rounded"
                                            >
                                                <option value="text-xl">كبير (text-xl)</option>
                                                <option value="text-2xl">أكبر (text-2xl)</option>
                                                <option value="text-3xl">بارز (text-3xl)</option>
                                                <option value="text-4xl">بارز جدًا (text-4xl)</option>
                                                <option value="text-5xl">هائل (text-5xl)</option>
                                            </select>
                                        </div>

                                        <div>
                                            <label className="block text-sm font-bold mb-1">حجم خط وصف قسم الخدمات</label>
                                            <select
                                                value={safeSettings.fontSizes.servicesSubtitle}
                                                onChange={e => updateNestedField('fontSizes', 'servicesSubtitle', e.target.value)}
                                                className="w-full border p-2 rounded"
                                            >
                                                <option value="text-sm">صغير (text-sm)</option>
                                                <option value="text-base">افتراضي (text-base)</option>
                                                <option value="text-lg">متوسط (text-lg)</option>
                                                <option value="text-xl">كبير (text-xl)</option>
                                                <option value="text-2xl">أكبر (text-2xl)</option>
                                            </select>
                                        </div>

                                        <div>
                                            <label className="block text-sm font-bold mb-1">حجم خط عنوان قسم الفريق</label>
                                            <select
                                                value={safeSettings.fontSizes.teamTitle}
                                                onChange={e => updateNestedField('fontSizes', 'teamTitle', e.target.value)}
                                                className="w-full border p-2 rounded"
                                            >
                                                <option value="text-sm">صغير (text-sm)</option>
                                                <option value="text-base">افتراضي (text-base)</option>
                                                <option value="text-lg">متوسط (text-lg)</option>
                                                <option value="text-xl">كبير (text-xl)</option>
                                                <option value="text-2xl">أكبر (text-2xl)</option>
                                            </select>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Footer Section */}
                            <div className="border border-slate-200 rounded-lg overflow-hidden">
                                <div className="bg-gradient-to-r from-slate-600 to-slate-700 text-white p-3">
                                    <h4 className="font-bold flex items-center gap-2">
                                        إعدادات الفوتر (Footer)
                                    </h4>
                                </div>
                                <div className="p-4 space-y-3">
                                    <LocalizedArea label="وصف الفوتر" value={safeSettings.footerDescription} onChange={v => updateField('footerDescription', v)} />
                                    <LocalizedInput label="نص حقوق النشر" value={safeSettings.copyrightText} onChange={v => updateField('copyrightText', v)} />

                                    <div>
                                        <label className="block text-sm font-bold text-slate-700 mb-2">روابط الفوتر</label>
                                        <div className="space-y-4">
                                            <LocalizedInput label="رابط سياسة الخصوصية" value={safeSettings.footerLinks.privacy} onChange={v => updateField('footerLinks', { ...safeSettings.footerLinks, privacy: v })} />
                                            <LocalizedInput label="رابط شروط الاستخدام" value={safeSettings.footerLinks.terms} onChange={v => updateField('footerLinks', { ...safeSettings.footerLinks, terms: v })} />
                                        </div>
                                    </div>

                                    {/* Footer Status */}
                                    <div className="bg-green-50 border border-green-200 p-3 rounded">
                                        <p className="text-sm text-green-800">
                                            ✅ <strong>ملاحظة:</strong> تغييرات الفوتر يتم حفظها مع بقية إعدادات الموقع عند الضغط على زر "حفظ التغييرات".
                                        </p>
                                        <p className="text-xs text-green-600 mt-1">
                                            يمكنك تعديل النصوص هنا لرؤية تأثيرها مباشرة على الفوتر في الواجهة الأمامية بعد الحفظ.
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
                                <h4 className="font-bold text-blue-800 mb-2">اختبار اتصال قاعدة البيانات</h4>
                                <p className="text-sm text-blue-700 mb-3">استخدم هذا الزر للتأكد من أن اتصال لوحة التحكم بقاعدة البيانات يعمل بشكل صحيح بدون مشاكل.</p>
                                <button
                                    onClick={onTestConnection}
                                    className="bg-blue-600 text-white px-4 py-2 rounded font-medium hover:bg-blue-700 transition"
                                >
                                    تنفيذ اختبار الاتصال
                                </button>
                            </div>
                        </div>
                    )}

                    {activeTab !== 'db' && (
                        <div className="pt-6 mt-6 border-t flex justify-end">
                            <button onClick={onSave} disabled={savingFromContext} className="bg-tivro-primary text-white px-8 py-3 rounded-lg font-bold hover:bg-emerald-700 flex items-center gap-2 shadow-lg shadow-tivro-primary/20">
                                {savingFromContext && <Loader2 className="animate-spin" size={18} />}
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
