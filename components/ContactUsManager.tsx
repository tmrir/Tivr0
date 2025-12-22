import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { db } from '../services/db';
import { ContactUsSettings, ContactFormField, ContactCard, ContactSocialLink } from '../types';
import { Plus, Trash2, Save, RotateCcw, Eye, EyeOff, Edit2, CheckCircle, AlertCircle, Wand2, Loader2 } from 'lucide-react';
import * as Icons from 'lucide-react';
import { translateText } from '../services/translationService';

interface ContactUsManagerProps {
  onUpdate?: () => void;
}

const IconComponent = ({ name, className }: { name: string, className?: string }) => {
  const Icon = (Icons as any)[name] || Icons.HelpCircle;
  return <Icon className={className} />;
};

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
      title="ترجمة فورية للإنجليزية"
      disabled={translating}
    >
      {translating ? <Loader2 size={12} className="animate-spin" /> : <Wand2 size={12} />}
      <span className="text-[10px] font-bold">ترجمة فورية</span>
    </button>
  );
};

const sanitizeHTML = (html: string): string => {
  const allowedTags = ['div', 'p', 'span', 'strong', 'em', 'br', 'ul', 'ol', 'li'];
  return html.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<[^>]*>/g, (match) => {
      const tagName = match.replace(/[<>]/g, '').split(' ')[0];
      return allowedTags.includes(tagName) ? match : '';
    });
};

const validateURL = (url: string): boolean => {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

const validateField = (field: ContactFormField): string[] => {
  const errors: string[] = [];

  if (!field.name || field.name.trim().length === 0) {
    errors.push('Field name is required');
  }

  if (!field.label.ar || field.label.ar.trim().length === 0) {
    errors.push('Arabic label is required');
  }

  if (!field.label.en || field.label.en.trim().length === 0) {
    errors.push('English label is required');
  }

  if (!field.placeholder.ar || field.placeholder.ar.trim().length === 0) {
    errors.push('Arabic placeholder is required');
  }

  if (!field.placeholder.en || field.placeholder.en.trim().length === 0) {
    errors.push('English placeholder is required');
  }

  if (field.label.ar.length > 200) errors.push('Arabic label too long (max 200 chars)');
  if (field.label.en.length > 200) errors.push('English label too long (max 200 chars)');
  if (field.placeholder.ar.length > 200) errors.push('Arabic placeholder too long (max 200 chars)');
  if (field.placeholder.en.length > 200) errors.push('English placeholder too long (max 200 chars)');

  return errors;
};

const validateSocialLink = (link: ContactSocialLink): string[] => {
  const errors: string[] = [];

  if (!link.name || link.name.trim().length === 0) {
    errors.push('Social link name is required');
  }

  if (!link.url || link.url.trim().length === 0) {
    errors.push('URL is required');
  } else if (!validateURL(link.url)) {
    errors.push('Invalid URL format');
  }

  if (!link.iconSVG_or_name || link.iconSVG_or_name.trim().length === 0) {
    errors.push('Icon name is required');
  }

  return errors;
};

const ContactUsManager: React.FC<ContactUsManagerProps> = ({ onUpdate }) => {
  const { t, lang } = useApp();
  const [settings, setSettings] = useState<ContactUsSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const allSettings = await db.settings.get();
      if (allSettings?.contactUs) {
        setSettings(allSettings.contactUs);
      }
    } catch (error) {
      console.error('Failed to load contact settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const saveSettings = async () => {
    if (!settings) return;

    // Validate settings
    const validationErrors: string[] = [];

    // Validate title and subtitle
    if (!settings.title.ar || settings.title.ar.trim().length === 0) {
      validationErrors.push('Arabic title is required');
    }
    if (!settings.title.en || settings.title.en.trim().length === 0) {
      validationErrors.push('English title is required');
    }
    if (settings.title.ar.length > 200 || settings.title.en.length > 200) {
      validationErrors.push('Title too long (max 200 chars)');
    }

    // Validate subtitle
    if (!settings.subtitle.ar || settings.subtitle.ar.trim().length === 0) {
      validationErrors.push('Arabic subtitle is required');
    }
    if (!settings.subtitle.en || settings.subtitle.en.trim().length === 0) {
      validationErrors.push('English subtitle is required');
    }
    if (settings.subtitle.ar.length > 1000 || settings.subtitle.en.length > 1000) {
      validationErrors.push('Subtitle too long (max 1000 chars)');
    }

    // Validate form fields
    settings.form.fields.forEach((field, index) => {
      const fieldErrors = validateField(field);
      fieldErrors.forEach(error => validationErrors.push(`Field ${index + 1}: ${error}`));
    });

    // Validate social links
    settings.socialLinks.forEach((link, index) => {
      const linkErrors = validateSocialLink(link);
      linkErrors.forEach(error => validationErrors.push(`Social Link ${index + 1}: ${error}`));
    });

    if (validationErrors.length > 0) {
      setErrors(validationErrors);
      return;
    }

    setErrors([]);
    setSaving(true);

    try {
      const currentSettings = await db.settings.get();
      if (currentSettings) {
        await db.settings.save({
          ...currentSettings,
          contactUs: settings
        });

        if (onUpdate) onUpdate();

        alert(lang === 'ar' ? 'تم حفظ الإعدادات بنجاح' : 'Settings saved successfully');
      }
    } catch (error) {
      console.error('Failed to save settings:', error);
      alert(lang === 'ar' ? 'فشل حفظ الإعدادات' : 'Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  const resetToDefaults = async () => {
    if (confirm(lang === 'ar' ? 'هل أنت متأكد من إعادة تعيين الإعدادات؟' : 'Are you sure you want to reset settings?')) {
      try {
        const { defaultSettings } = await import('../defaultSettings');
        setSettings(defaultSettings.contactUs);
        setErrors([]);
      } catch (error) {
        console.error('Failed to reset settings:', error);
      }
    }
  };

  const updateSettings = (updates: Partial<ContactUsSettings>) => {
    if (!settings) return;
    setSettings({ ...settings, ...updates });
  };

  const addFormField = () => {
    if (!settings) return;

    const newField: ContactFormField = {
      name: `field_${Date.now()}`,
      label: { ar: 'حقل جديد', en: 'New Field' },
      placeholder: { ar: 'أدخل القيمة', en: 'Enter value' },
      type: 'text',
      required: true
    };

    updateSettings({
      form: {
        ...settings.form,
        fields: [...settings.form.fields, newField]
      }
    });
  };

  const updateFormField = (index: number, field: ContactFormField) => {
    if (!settings) return;

    const updatedFields = [...settings.form.fields];
    updatedFields[index] = field;

    updateSettings({
      form: {
        ...settings.form,
        fields: updatedFields
      }
    });
  };

  const removeFormField = (index: number) => {
    if (!settings) return;

    const updatedFields = settings.form.fields.filter((_, i) => i !== index);
    updateSettings({
      form: {
        ...settings.form,
        fields: updatedFields
      }
    });
  };

  const addSocialLink = () => {
    if (!settings) return;

    const newLink: ContactSocialLink = {
      name: 'New Platform',
      url: 'https://',
      iconSVG_or_name: 'Globe'
    };

    updateSettings({
      socialLinks: [...settings.socialLinks, newLink]
    });
  };

  const updateSocialLink = (index: number, link: ContactSocialLink) => {
    if (!settings) return;

    const updatedLinks = [...settings.socialLinks];
    updatedLinks[index] = link;

    updateSettings({
      socialLinks: updatedLinks
    });
  };

  const removeSocialLink = (index: number) => {
    if (!settings) return;

    const updatedLinks = settings.socialLinks.filter((_, i) => i !== index);
    updateSettings({
      socialLinks: updatedLinks
    });
  };

  if (loading) {
    return <div className="text-center py-8">{t('admin.loading')}</div>;
  }

  if (!settings) {
    return <div className="text-center py-8 text-red-500">Failed to load settings</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-slate-800">
          {lang === 'ar' ? 'إعدادات قسم تواصل معنا' : 'Contact Us Section Settings'}
        </h2>
        <div className="flex gap-2">
          <button
            onClick={() => setShowPreview(!showPreview)}
            className="flex items-center gap-2 px-4 py-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition"
          >
            {showPreview ? <EyeOff size={18} /> : <Eye size={18} />}
            {lang === 'ar' ? 'معاينة' : 'Preview'}
          </button>
          <button
            onClick={resetToDefaults}
            className="flex items-center gap-2 px-4 py-2 bg-orange-100 text-orange-700 rounded-lg hover:bg-orange-200 transition"
          >
            <RotateCcw size={18} />
            {lang === 'ar' ? 'إعادة تعيين' : 'Reset'}
          </button>
          <button
            onClick={saveSettings}
            disabled={saving}
            className="flex items-center gap-2 px-4 py-2 bg-tivro-primary text-white rounded-lg hover:bg-emerald-600 transition disabled:opacity-50"
          >
            <Save size={18} />
            {saving ? (lang === 'ar' ? 'جاري الحفظ...' : 'Saving...') : (lang === 'ar' ? 'حفظ' : 'Save')}
          </button>
        </div>
      </div>

      {/* Errors */}
      {errors.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <AlertCircle className="text-red-500" size={20} />
            <h3 className="font-bold text-red-700">
              {lang === 'ar' ? 'خطأ في التحقق' : 'Validation Errors'}
            </h3>
          </div>
          <ul className="text-sm text-red-600 space-y-1">
            {errors.map((error, index) => (
              <li key={index}>• {error}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Preview */}
      {showPreview && (
        <div className="bg-slate-50 border border-slate-200 rounded-lg p-6">
          <h3 className="font-bold text-lg mb-4 text-slate-700">
            {lang === 'ar' ? 'معاينة القسم' : 'Section Preview'}
          </h3>
          <div className="bg-tivro-dark rounded-lg overflow-hidden">
            <div className="transform scale-75 origin-top">
              <ContactUsSection settings={settings} />
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 space-y-8">

        {/* Title and Subtitle */}
        <div>
          <h3 className="font-bold text-lg mb-4 text-slate-700">
            {lang === 'ar' ? 'العنوان والوصف' : 'Title and Description'}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="flex justify-between items-center text-sm font-bold text-slate-700 mb-1">
                <span>{lang === 'ar' ? 'العنوان (عربي)' : 'Title (Arabic)'}</span>
                <AutoTranslateButton
                  text={settings.title.ar}
                  onTranslate={v => updateSettings({ title: { ...settings.title, en: v } })}
                />
              </label>
              <input
                type="text"
                value={settings.title.ar}
                onChange={(e) => updateSettings({
                  title: { ...settings.title, ar: e.target.value }
                })}
                className="w-full border border-slate-300 rounded-lg p-2.5 focus:ring-2 focus:ring-tivro-primary/20 focus:border-tivro-primary outline-none transition"
                dir="rtl"
                placeholder="تواصل معنا..."
                maxLength={200}
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1">
                {lang === 'ar' ? 'العنوان (إنجليزي)' : 'Title (English)'}
              </label>
              <input
                type="text"
                value={settings.title.en}
                onChange={(e) => updateSettings({
                  title: { ...settings.title, en: e.target.value }
                })}
                className="w-full border border-slate-300 rounded-lg p-2.5 bg-slate-50/50 focus:ring-2 focus:ring-emerald-600/20 focus:border-emerald-600 outline-none transition"
                dir="ltr"
                placeholder="Contact Us..."
                maxLength={200}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
            <div>
              <label className="flex justify-between items-center text-sm font-bold text-slate-700 mb-1">
                <span>{lang === 'ar' ? 'الوصف (عربي)' : 'Subtitle (Arabic)'}</span>
                <AutoTranslateButton
                  text={settings.subtitle.ar}
                  onTranslate={v => updateSettings({ subtitle: { ...settings.subtitle, en: v } })}
                />
              </label>
              <textarea
                value={settings.subtitle.ar}
                onChange={(e) => updateSettings({
                  subtitle: { ...settings.subtitle, ar: e.target.value }
                })}
                className="w-full border border-slate-300 rounded-lg p-2.5 focus:ring-2 focus:ring-tivro-primary/20 focus:border-tivro-primary outline-none transition h-24"
                rows={3}
                dir="rtl"
                placeholder="لنكمل الصورة معاً..."
                maxLength={1000}
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1">
                {lang === 'ar' ? 'الوصف (إنجليزي)' : 'Subtitle (English)'}
              </label>
              <textarea
                value={settings.subtitle.en}
                onChange={(e) => updateSettings({
                  subtitle: { ...settings.subtitle, en: e.target.value }
                })}
                className="w-full border border-slate-300 rounded-lg p-2.5 bg-slate-50/50 focus:ring-2 focus:ring-emerald-600/20 focus:border-emerald-600 outline-none transition h-24"
                rows={3}
                dir="ltr"
                placeholder="Ready to take your business..."
                maxLength={1000}
              />
            </div>
          </div>
        </div>

        {/* Cards */}
        <div>
          <h3 className="font-bold text-lg mb-4 text-slate-700">
            {lang === 'ar' ? 'البطاقات' : 'Cards'}
          </h3>
          {settings.cards.map((card, index) => (
            <div key={index} className="border border-slate-200 rounded-lg p-4 mb-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="flex justify-between items-center text-sm font-bold text-slate-700 mb-1">
                    <span>{lang === 'ar' ? 'العنوان (عربي)' : 'Heading (Arabic)'}</span>
                    <AutoTranslateButton
                      text={card.heading.ar}
                      onTranslate={v => {
                        const updatedCards = [...settings.cards];
                        updatedCards[index] = { ...card, heading: { ...card.heading, en: v } };
                        updateSettings({ cards: updatedCards });
                      }}
                    />
                  </label>
                  <input
                    type="text"
                    value={card.heading.ar}
                    onChange={(e) => {
                      const updatedCards = [...settings.cards];
                      updatedCards[index] = {
                        ...card,
                        heading: { ...card.heading, ar: e.target.value }
                      };
                      updateSettings({ cards: updatedCards });
                    }}
                    className="w-full border border-slate-300 rounded-lg p-2.5 focus:ring-2 focus:ring-tivro-primary/20 focus:border-tivro-primary outline-none transition"
                    dir="rtl"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1">
                    {lang === 'ar' ? 'العنوان (إنجليزي)' : 'Heading (English)'}
                  </label>
                  <input
                    type="text"
                    value={card.heading.en}
                    onChange={(e) => {
                      const updatedCards = [...settings.cards];
                      updatedCards[index] = {
                        ...card,
                        heading: { ...card.heading, en: e.target.value }
                      };
                      updateSettings({ cards: updatedCards });
                    }}
                    className="w-full border border-slate-300 rounded-lg p-2.5 bg-slate-50/50 focus:ring-2 focus:ring-emerald-600/20 focus:border-emerald-600 outline-none transition"
                    dir="ltr"
                  />
                </div>
              </div>

              <div className="mt-4">
                <label className="block text-sm font-medium text-slate-600 mb-1">
                  {lang === 'ar' ? 'المحتوى (HTML)' : 'Content (HTML)'}
                </label>
                <textarea
                  value={card.contentHTML}
                  onChange={(e) => {
                    const updatedCards = [...settings.cards];
                    updatedCards[index] = { ...card, contentHTML: e.target.value };
                    updateSettings({ cards: updatedCards });
                  }}
                  className="w-full border border-slate-300 rounded-lg p-2 focus:ring-2 focus:ring-tivro-primary focus:border-tivro-primary outline-none font-mono text-sm"
                  rows={4}
                />
              </div>
            </div>
          ))}
        </div>

        {/* Social Links */}
        <div>
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-bold text-lg text-slate-700">
              {lang === 'ar' ? 'روابط التواصل الاجتماعي' : 'Social Links'}
            </h3>
            <button
              onClick={addSocialLink}
              className="flex items-center gap-2 px-3 py-1 bg-tivro-primary text-white rounded-lg hover:bg-emerald-600 transition text-sm"
            >
              <Plus size={16} />
              {lang === 'ar' ? 'إضافة رابط' : 'Add Link'}
            </button>
          </div>

          {settings.socialLinks.map((link, index) => (
            <div key={index} className="border border-slate-200 rounded-lg p-4 mb-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-600 mb-1">
                    {lang === 'ar' ? 'الاسم' : 'Name'}
                  </label>
                  <input
                    type="text"
                    value={link.name}
                    onChange={(e) => updateSocialLink(index, { ...link, name: e.target.value })}
                    className="w-full border border-slate-300 rounded-lg p-2 focus:ring-2 focus:ring-tivro-primary focus:border-tivro-primary outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-600 mb-1">
                    {lang === 'ar' ? 'الرابط' : 'URL'}
                  </label>
                  <input
                    type="url"
                    value={link.url}
                    onChange={(e) => updateSocialLink(index, { ...link, url: e.target.value })}
                    className="w-full border border-slate-300 rounded-lg p-2 focus:ring-2 focus:ring-tivro-primary focus:border-tivro-primary outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-600 mb-1">
                    {lang === 'ar' ? 'الأيقونة' : 'Icon'}
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={link.iconSVG_or_name}
                      onChange={(e) => updateSocialLink(index, { ...link, iconSVG_or_name: e.target.value })}
                      className="flex-1 border border-slate-300 rounded-lg p-2 focus:ring-2 focus:ring-tivro-primary focus:border-tivro-primary outline-none"
                    />
                    <button
                      onClick={() => removeSocialLink(index)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Form Fields */}
        <div>
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-bold text-lg text-slate-700">
              {lang === 'ar' ? 'حقول النموذج' : 'Form Fields'}
            </h3>
            <button
              onClick={addFormField}
              className="flex items-center gap-2 px-3 py-1 bg-tivro-primary text-white rounded-lg hover:bg-emerald-600 transition text-sm"
            >
              <Plus size={16} />
              {lang === 'ar' ? 'إضافة حقل' : 'Add Field'}
            </button>
          </div>

          {settings.form.fields.map((field, index) => (
            <div key={index} className="border border-slate-200 rounded-lg p-4 mb-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-600 mb-1">
                    {lang === 'ar' ? 'اسم الحقل' : 'Field Name'}
                  </label>
                  <input
                    type="text"
                    value={field.name}
                    onChange={(e) => updateFormField(index, { ...field, name: e.target.value })}
                    className="w-full border border-slate-300 rounded-lg p-2 focus:ring-2 focus:ring-tivro-primary focus:border-tivro-primary outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-600 mb-1">
                    {lang === 'ar' ? 'النوع' : 'Type'}
                  </label>
                  <select
                    value={field.type}
                    onChange={(e) => updateFormField(index, { ...field, type: e.target.value as any })}
                    className="w-full border border-slate-300 rounded-lg p-2 focus:ring-2 focus:ring-tivro-primary focus:border-tivro-primary outline-none"
                  >
                    <option value="text">{lang === 'ar' ? 'نص' : 'Text'}</option>
                    <option value="tel">{lang === 'ar' ? 'هاتف' : 'Phone'}</option>
                    <option value="email">{lang === 'ar' ? 'بريد إلكتروني' : 'Email'}</option>
                    <option value="textarea">{lang === 'ar' ? 'نص طويل' : 'Textarea'}</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-600 mb-1">
                    {lang === 'ar' ? 'مطلوب؟' : 'Required?'}
                  </label>
                  <div className="flex items-center gap-2 mt-2">
                    <input
                      type="checkbox"
                      checked={field.required}
                      onChange={(e) => updateFormField(index, { ...field, required: e.target.checked })}
                      className="w-4 h-4 text-tivro-primary"
                    />
                    <label className="text-sm text-slate-600">
                      {lang === 'ar' ? 'مطلوب' : 'Required'}
                    </label>
                  </div>
                </div>
                <div className="flex items-end">
                  <button
                    onClick={() => removeFormField(index)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                <div>
                  <label className="flex justify-between items-center text-sm font-bold text-slate-700 mb-1">
                    <span>{lang === 'ar' ? 'التسمية (عربي)' : 'Label (Arabic)'}</span>
                    <AutoTranslateButton
                      text={field.label.ar}
                      onTranslate={v => updateFormField(index, { ...field, label: { ...field.label, en: v } })}
                    />
                  </label>
                  <input
                    type="text"
                    value={field.label.ar}
                    onChange={(e) => updateFormField(index, {
                      ...field,
                      label: { ...field.label, ar: e.target.value }
                    })}
                    className="w-full border border-slate-300 rounded-lg p-2.5 focus:ring-2 focus:ring-tivro-primary/20 focus:border-tivro-primary outline-none transition"
                    dir="rtl"
                    maxLength={200}
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1">
                    {lang === 'ar' ? 'التسمية (إنجليزي)' : 'Label (English)'}
                  </label>
                  <input
                    type="text"
                    value={field.label.en}
                    onChange={(e) => updateFormField(index, {
                      ...field,
                      label: { ...field.label, en: e.target.value }
                    })}
                    className="w-full border border-slate-300 rounded-lg p-2.5 bg-slate-50/50 focus:ring-2 focus:ring-emerald-600/20 focus:border-emerald-600 outline-none transition"
                    dir="ltr"
                    maxLength={200}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                <div>
                  <label className="flex justify-between items-center text-sm font-bold text-slate-700 mb-1">
                    <span>{lang === 'ar' ? 'النص التوضيحي (عربي)' : 'Placeholder (Arabic)'}</span>
                    <AutoTranslateButton
                      text={field.placeholder.ar}
                      onTranslate={v => updateFormField(index, { ...field, placeholder: { ...field.placeholder, en: v } })}
                    />
                  </label>
                  <input
                    type="text"
                    value={field.placeholder.ar}
                    onChange={(e) => updateFormField(index, {
                      ...field,
                      placeholder: { ...field.placeholder, ar: e.target.value }
                    })}
                    className="w-full border border-slate-300 rounded-lg p-2.5 focus:ring-2 focus:ring-tivro-primary/20 focus:border-tivro-primary outline-none transition"
                    dir="rtl"
                    maxLength={200}
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1">
                    {lang === 'ar' ? 'النص التوضيحي (إنجليزي)' : 'Placeholder (English)'}
                  </label>
                  <input
                    type="text"
                    value={field.placeholder.en}
                    onChange={(e) => updateFormField(index, {
                      ...field,
                      placeholder: { ...field.placeholder, en: e.target.value }
                    })}
                    className="w-full border border-slate-300 rounded-lg p-2.5 bg-slate-50/50 focus:ring-2 focus:ring-emerald-600/20 focus:border-emerald-600 outline-none transition"
                    dir="ltr"
                    maxLength={200}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Submit Button */}
        <div>
          <h3 className="font-bold text-lg mb-4 text-slate-700">
            {lang === 'ar' ? 'زر الإرسال' : 'Submit Button'}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="flex justify-between items-center text-sm font-bold text-slate-700 mb-1">
                <span>{lang === 'ar' ? 'النص (عربي)' : 'Text (Arabic)'}</span>
                <AutoTranslateButton
                  text={settings.form.submitText.ar}
                  onTranslate={v => updateSettings({
                    form: { ...settings.form, submitText: { ...settings.form.submitText, en: v } }
                  })}
                />
              </label>
              <input
                type="text"
                value={settings.form.submitText.ar}
                onChange={(e) => updateSettings({
                  form: {
                    ...settings.form,
                    submitText: { ...settings.form.submitText, ar: e.target.value }
                  }
                })}
                className="w-full border border-slate-300 rounded-lg p-2.5 focus:ring-2 focus:ring-tivro-primary/20 focus:border-tivro-primary outline-none transition"
                dir="rtl"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1">
                {lang === 'ar' ? 'النص (إنجليزي)' : 'Text (English)'}
              </label>
              <input
                type="text"
                value={settings.form.submitText.en}
                onChange={(e) => updateSettings({
                  form: {
                    ...settings.form,
                    submitText: { ...settings.form.submitText, en: e.target.value }
                  }
                })}
                className="w-full border border-slate-300 rounded-lg p-2.5 bg-slate-50/50 focus:ring-2 focus:ring-emerald-600/20 focus:border-emerald-600 outline-none transition"
                dir="ltr"
              />
            </div>
          </div>

          <div className="mt-4">
            <label className="block text-sm font-medium text-slate-600 mb-1">
              {lang === 'ar' ? 'نقطة النهاية (اختياري)' : 'Endpoint (Optional)'}
            </label>
            <input
              type="text"
              value={settings.form.submitAction || ''}
              onChange={(e) => updateSettings({
                form: {
                  ...settings.form,
                  submitAction: e.target.value
                }
              })}
              className="w-full border border-slate-300 rounded-lg p-2 focus:ring-2 focus:ring-tivro-primary focus:border-tivro-primary outline-none"
              placeholder="/api/contact"
            />
          </div>
        </div>

        {/* CSS Classes */}
        <div>
          <h3 className="font-bold text-lg mb-4 text-slate-700">
            {lang === 'ar' ? 'فئات CSS (اختياري)' : 'CSS Classes (Optional)'}
          </h3>
          <input
            type="text"
            value={settings.cssClasses || ''}
            onChange={(e) => updateSettings({ cssClasses: e.target.value })}
            className="w-full border border-slate-300 rounded-lg p-2 focus:ring-2 focus:ring-tivro-primary focus:border-tivro-primary outline-none"
            placeholder="container mx-auto px-4 text-center"
          />
        </div>
      </div>
    </div>
  );
};

export default ContactUsManager;
