import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { CustomPage, PageComponent, SectionTemplate, NavigationItem } from '../types';
import { db } from '../services/db';
import { Plus, Edit2, Trash2, Eye, EyeOff, GripVertical, Save, X, ArrowUp, ArrowDown, Copy, Settings, Layout, Type, Image, Video, Link, Square, Code, Sliders, MousePointer, ChevronUp, ChevronDown, Wand2, Loader2 } from 'lucide-react';
import { WordLikeEditor } from './WordLikeEditor';
import { translateText } from '../services/translationService';

interface PageManagerProps {
  onUpdate?: () => void;
}

export const PageManager: React.FC<PageManagerProps> = ({ onUpdate }) => {
  const { t, lang } = useApp();

  const [translatingFields, setTranslatingFields] = useState<Record<string, boolean>>({});

  const handleTranslate = async (text: string, fieldId: string, onTranslate: (translated: string) => void) => {
    if (!text) return;

    // Explicitly blur the active element to ensure any onBlur handlers have finished
    if (document.activeElement instanceof HTMLElement) {
      document.activeElement.blur();
    }

    setTranslatingFields(prev => ({ ...prev, [fieldId]: true }));
    try {
      const translated = await translateText(text, 'ar', 'en');
      if (translated) {
        onTranslate(translated);
      }
    } finally {
      setTranslatingFields(prev => ({ ...prev, [fieldId]: false }));
    }
  };

  const TranslateButton = ({ text, fieldId, onTranslate }: { text: string, fieldId: string, onTranslate: (v: string) => void }) => {
    const isTranslating = translatingFields[fieldId];
    if (!text) return null;
    return (
      <button
        type="button"
        onClick={() => handleTranslate(text, fieldId, onTranslate)}
        disabled={isTranslating}
        className="flex items-center gap-1.5 text-tivro-primary hover:text-emerald-700 transition px-2 py-0.5 rounded-md hover:bg-emerald-50"
        title="ترجمة فورية للإنجليزية"
      >
        {isTranslating ? <Loader2 size={12} className="animate-spin" /> : <Wand2 size={12} />}
        <span className="text-[10px] font-bold">ترجمة فورية</span>
      </button>
    );
  };

  const [pages, setPages] = useState<CustomPage[]>([]);
  const [templates, setTemplates] = useState<SectionTemplate[]>([]);
  const [editingPage, setEditingPage] = useState<CustomPage | null>(null);
  const [selectedComponent, setSelectedComponent] = useState<PageComponent | null>(null);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'pages' | 'templates' | 'navigation'>('pages');

  const clamp = (n: number, min: number, max: number) => Math.max(min, Math.min(max, n));

  const normalizeHex = (hex: string): string => {
    const h = (hex || '').trim();
    if (!h) return '#000000';
    if (h.startsWith('#')) {
      if (h.length === 4) {
        return `#${h[1]}${h[1]}${h[2]}${h[2]}${h[3]}${h[3]}`.toLowerCase();
      }
      if (h.length === 7) return h.toLowerCase();
    }
    return '#000000';
  };

  const hexToRgb = (hex: string): { r: number; g: number; b: number } => {
    const h = normalizeHex(hex);
    const r = parseInt(h.slice(1, 3), 16);
    const g = parseInt(h.slice(3, 5), 16);
    const b = parseInt(h.slice(5, 7), 16);
    return { r, g, b };
  };

  const srgbToLin = (c: number) => {
    const v = clamp(c, 0, 255) / 255;
    return v <= 0.04045 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
  };

  const relativeLuminance = (hex: string) => {
    const { r, g, b } = hexToRgb(hex);
    const R = srgbToLin(r);
    const G = srgbToLin(g);
    const B = srgbToLin(b);
    return 0.2126 * R + 0.7152 * G + 0.0722 * B;
  };

  const contrastRatio = (a: string, b: string) => {
    const L1 = relativeLuminance(a);
    const L2 = relativeLuminance(b);
    const lighter = Math.max(L1, L2);
    const darker = Math.min(L1, L2);
    return (lighter + 0.05) / (darker + 0.05);
  };

  const bestTextColorBW = (bg: string) => {
    const white = contrastRatio(bg, '#ffffff');
    const black = contrastRatio(bg, '#000000');
    return white >= black ? '#ffffff' : '#000000';
  };

  // Load pages from global settings (Supabase)
  useEffect(() => {
    const load = async () => {
      try {
        const settings = await db.settings.get();
        const fromSettings = (settings as any)?.customPages;
        if (Array.isArray(fromSettings)) {
          setPages(fromSettings as CustomPage[]);
          localStorage.setItem('customPages', JSON.stringify(fromSettings));
          localStorage.setItem('navigationPages', JSON.stringify((fromSettings as CustomPage[]).filter(p => p.showInNavigation)));
          return;
        }
      } catch (error) {
        console.error('Error loading pages from settings:', error);
      }

      // No localStorage fallback as a source of truth (prevents cross-device divergence)
      setPages([]);
    };
    load();
  }, []);

  const persistPages = async (updatedPages: CustomPage[]) => {
    // Always keep a local copy for fast render / offline.
    localStorage.setItem('customPages', JSON.stringify(updatedPages));
    localStorage.setItem('navigationPages', JSON.stringify(updatedPages.filter(p => p.showInNavigation)));

    try {
      const settings = await db.settings.get();
      const merged = { ...(settings as any), customPages: updatedPages };
      await db.settings.save(merged as any);
    } catch (error) {
      console.error('Error saving pages to settings:', error);
    }
  };

  // Default templates
  useEffect(() => {
    const defaultTemplates: SectionTemplate[] = [
      {
        id: 'hero',
        name: 'hero',
        displayName: { ar: 'القسم الرئيسي', en: 'Hero Section' },
        description: { ar: 'قسم البداية الجذاب', en: 'Attractive introduction section' },
        category: 'hero',
        defaultComponents: [
          {
            id: 'hero-title',
            type: 'text',
            content: { text: { ar: 'مرحباً بك في عالمنا', en: 'Welcome to Our World' } },
            display: 'section',
            styles: {
              colors: { primary: '#1e293b' },
              sizes: { fontSize: 'text-4xl', padding: 'p-6' }
            },
            orderIndex: 0,
            isVisible: true
          },
          {
            id: 'hero-subtitle',
            type: 'text',
            content: { text: { ar: 'نقدم لك أفضل الحلول', en: 'We offer the best solutions' } },
            display: 'section',
            styles: {
              colors: { text: '#64748b' },
              sizes: { fontSize: 'text-lg', padding: 'p-4' }
            },
            orderIndex: 1,
            isVisible: true
          },
          {
            id: 'hero-cta',
            type: 'button',
            content: {
              text: { ar: 'ابدأ الآن', en: 'Get Started' },
              href: '#contact',
              style: 'primary'
            },
            display: 'section',
            styles: {
              margins: { top: 'mt-4' }
            },
            orderIndex: 1,
            isVisible: true
          }
        ]
      },
      {
        id: 'pricing',
        name: 'pricing',
        displayName: { ar: 'الأسعار', en: 'Pricing' },
        description: { ar: 'عرض خطط الأسعار', en: 'Display pricing plans' },
        category: 'pricing',
        defaultComponents: [
          {
            id: 'pricing-title',
            type: 'text',
            content: { text: { ar: 'خطط الأسعار', en: 'Pricing Plans' } },
            display: 'section',
            styles: {
              colors: { primary: '#1e293b' },
              sizes: { fontSize: 'text-3xl', padding: 'p-6' }
            },
            orderIndex: 0,
            isVisible: true
          }
        ]
      },
      {
        id: 'faq',
        name: 'faq',
        displayName: { ar: 'الأسئلة الشائعة', en: 'FAQ' },
        description: { ar: 'قسم الأسئلة والأجوبة الشائعة', en: 'Frequently asked questions section' },
        category: 'faq',
        defaultComponents: [
          {
            id: 'faq-title',
            type: 'text',
            content: { text: { ar: 'الأسئلة الشائعة', en: 'Frequently Asked Questions' } },
            display: 'section',
            styles: {
              colors: { primary: '#1e293b' },
              sizes: { fontSize: 'text-2xl', padding: 'p-6' }
            },
            orderIndex: 0,
            isVisible: true
          }
        ]
      }
    ];
    setTemplates(defaultTemplates);
  }, []);

  const createNewPage = () => {
    const newPage: CustomPage = {
      id: `page-${Date.now()}`,
      name: '',
      slug: '',
      title: { ar: '', en: '' },
      description: { ar: '', en: '' },
      components: [],
      isVisible: true,
      placement: undefined,
      sectionVariant: undefined,
      underConstruction: false,
      underConstructionButton: { label: { ar: '', en: '' }, href: '' },
      order: undefined,
      showInNavigation: true,
      navigationOrder: pages.length,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    setEditingPage(newPage);
  };

  const savePage = async () => {
    if (!editingPage) return;

    setSaving(true);
    try {
      // Generate slug from name if empty
      if (!editingPage.slug && editingPage.name) {
        editingPage.slug = editingPage.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
      }

      const existingIndex = pages.findIndex(p => p.id === editingPage.id);
      let updatedPages;

      if (existingIndex >= 0) {
        updatedPages = [...pages];
        updatedPages[existingIndex] = { ...editingPage, updatedAt: new Date().toISOString() };
      } else {
        updatedPages = [...pages, editingPage];
      }

      setPages(updatedPages);

      await persistPages(updatedPages);

      window.dispatchEvent(new CustomEvent('customPagesUpdated'));

      setEditingPage(null);
      onUpdate?.();
    } catch (error) {
      console.error('Error saving page:', error);
    } finally {
      setSaving(false);
    }
  };

  const deletePage = (pageId: string) => {
    if (confirm(lang === 'ar' ? 'هل أنت متأكد من حذف هذه الصفحة؟' : 'Are you sure you want to delete this page?')) {
      const updatedPages = pages.filter(p => p.id !== pageId);
      setPages(updatedPages);
      persistPages(updatedPages);

      window.dispatchEvent(new CustomEvent('customPagesUpdated'));
      onUpdate?.();
    }
  };

  const togglePageVisibility = (pageId: string) => {
    const updatedPages = pages.map(p =>
      p.id === pageId ? { ...p, isVisible: !p.isVisible } : p
    );
    setPages(updatedPages);
    persistPages(updatedPages);

    window.dispatchEvent(new CustomEvent('customPagesUpdated'));
    onUpdate?.();
  };

  const movePageUp = (pageId: string) => {
    const index = pages.findIndex(p => p.id === pageId);
    if (index <= 0) return;

    const updatedPages = [...pages];
    [updatedPages[index - 1], updatedPages[index]] = [updatedPages[index], updatedPages[index - 1]];

    // Update navigationOrder for both pages
    updatedPages[index - 1].navigationOrder = index - 1;
    updatedPages[index].navigationOrder = index;

    setPages(updatedPages);
    persistPages(updatedPages);

    window.dispatchEvent(new CustomEvent('customPagesUpdated'));
    onUpdate?.();
  };

  const movePageDown = (pageId: string) => {
    const index = pages.findIndex(p => p.id === pageId);
    if (index === -1 || index >= pages.length - 1) return;

    const updatedPages = [...pages];
    [updatedPages[index], updatedPages[index + 1]] = [updatedPages[index + 1], updatedPages[index]];

    // Update navigationOrder for both pages
    updatedPages[index].navigationOrder = index;
    updatedPages[index + 1].navigationOrder = index + 1;

    setPages(updatedPages);
    persistPages(updatedPages);

    window.dispatchEvent(new CustomEvent('customPagesUpdated'));
    onUpdate?.();
  };

  const addComponentToPage = (templateId: string) => {
    if (!editingPage) return;

    const template = templates.find(t => t.id === templateId);
    if (!template) return;

    const newComponents = template.defaultComponents.map(comp => ({
      ...comp,
      id: `${comp.id}-${Date.now()}`
    }));

    setEditingPage({
      ...editingPage,
      components: [...editingPage.components, ...newComponents]
    });
  };

  const addCustomComponent = (type: PageComponent['type']) => {
    if (!editingPage) return;

    const newComponent: PageComponent = {
      id: `component-${Date.now()}`,
      type,
      content: getDefaultContent(type),
      display: 'section',
      styles: getDefaultStyles(type),
      orderIndex: editingPage.components.length,
      isVisible: true
    };

    setEditingPage({
      ...editingPage,
      components: [...editingPage.components, newComponent]
    });
  };

  const getDefaultContent = (type: PageComponent['type']) => {
    switch (type) {
      case 'text':
        return { text: { ar: 'نص جديد', en: 'New Text' } };
      case 'image':
        return { src: '', alt: { ar: 'صورة', en: 'Image' } };
      case 'video':
        return { src: '', poster: '', autoplay: false };
      case 'button':
        return { text: { ar: 'زر', en: 'Button' }, href: '#', style: 'primary' };
      case 'html':
        return { html: '' };
      default:
        return {};
    }
  };

  const getDefaultStyles = (type: PageComponent['type']) => {
    return {
      colors: { primary: '#1e293b', text: '#64748b' },
      sizes: { fontSize: 'text-base', padding: 'p-4' },
      margins: { top: 'mt-4', bottom: 'mb-4' }
    };
  };

  const moveComponent = (index: number, direction: 'up' | 'down') => {
    if (!editingPage) return;

    const components = [...editingPage.components];
    const newIndex = direction === 'up' ? index - 1 : index + 1;

    if (newIndex >= 0 && newIndex < components.length) {
      [components[index], components[newIndex]] = [components[newIndex], components[index]];
      components.forEach((comp, i) => comp.orderIndex = i);

      setEditingPage({
        ...editingPage,
        components
      });
    }
  };

  const deleteComponent = (componentId: string) => {
    if (!editingPage) return;

    setEditingPage({
      ...editingPage,
      components: editingPage.components.filter(c => c.id !== componentId)
    });
  };

  const updateComponentInPage = (updatedComponent: PageComponent) => {
    if (!editingPage) return;

    setEditingPage({
      ...editingPage,
      components: editingPage.components.map(c =>
        c.id === updatedComponent.id ? updatedComponent : c
      )
    });
  };

  const uploadMediaFile = async (file: File): Promise<{ url: string; mime: string } | null> => {
    setUploadError(null);

    const maxBytes = 4 * 1024 * 1024;
    if (file.size <= 0 || file.size > maxBytes) {
      setUploadError(lang === 'ar' ? 'حجم الملف غير مسموح' : 'File size not allowed');
      return null;
    }

    const allowed = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'application/pdf']);
    const mime = (file.type || '').toLowerCase();
    if (!allowed.has(mime)) {
      setUploadError(lang === 'ar' ? 'نوع الملف غير مسموح' : 'File type not allowed');
      return null;
    }

    setUploading(true);
    try {
      const currentSrc = (selectedComponent as any)?.content?.src as string | undefined;
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
        setUploadError(
          (json?.error as string) || (lang === 'ar' ? 'فشل رفع الملف' : 'Upload failed')
        );
        return null;
      }

      return { url: json.data.url as string, mime: (json.data.mime as string) || mime };
    } catch (e: any) {
      setUploadError(e?.message || (lang === 'ar' ? 'فشل رفع الملف' : 'Upload failed'));
      return null;
    } finally {
      setUploading(false);
    }
  };

  const getComponentIcon = (type: PageComponent['type']) => {
    switch (type) {
      case 'text': return <Type size={16} />;
      case 'image': return <Image size={16} />;
      case 'video': return <Video size={16} />;
      case 'link': return <Link size={16} />;
      case 'button':
        return <Square size={16} />;
      case 'html': return <Code size={16} />;
      case 'slider': return <Sliders size={16} />;
      case 'interactive': return <MousePointer size={16} />;
      default: return <Layout size={16} />;
    }
  };

  if (editingPage) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-bold text-slate-900">
            {editingPage.name ? lang === 'ar' ? `تعديل: ${editingPage.name}` : `Edit: ${editingPage.name}` : lang === 'ar' ? 'صفحة جديدة' : 'New Page'}
          </h3>
          <div className="flex gap-2">
            <button
              onClick={savePage}
              disabled={saving || !editingPage.name}
              className="bg-tivro-primary text-white px-4 py-2 rounded-lg font-medium hover:bg-emerald-500 disabled:opacity-50 flex items-center gap-2"
            >
              <Save size={16} />
              {saving ? (lang === 'ar' ? 'جاري الحفظ...' : 'Saving...') : (lang === 'ar' ? 'حفظ' : 'Save')}
            </button>
            <button
              onClick={() => setEditingPage(null)}
              className="bg-slate-100 text-slate-700 px-4 py-2 rounded-lg font-medium hover:bg-slate-200 flex items-center gap-2"
            >
              <X size={16} />
              {lang === 'ar' ? 'إلغاء' : 'Cancel'}
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Page Settings */}
          <div className="space-y-4">
            <div>
              <label className="flex justify-between items-center text-sm font-bold text-slate-700 mb-1">
                <span>{lang === 'ar' ? 'اسم الصفحة' : 'Page Name'}</span>
                <TranslateButton
                  text={editingPage.name}
                  fieldId="page-name-translate"
                  onTranslate={(val) => setEditingPage({ ...editingPage, title: { ...(editingPage.title || { ar: editingPage.name, en: '' }), en: val } })}
                />
              </label>
              <input
                type="text"
                value={editingPage.name}
                onChange={(e) => setEditingPage({ ...editingPage, name: e.target.value })}
                className="w-full border border-slate-200 rounded-lg p-2.5 focus:ring-2 focus:ring-tivro-primary/20 focus:border-tivro-primary outline-none transition"
                placeholder={lang === 'ar' ? 'أدخل اسم الصفحة' : 'Enter page name'}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                {lang === 'ar' ? 'المسار (URL)' : 'URL Path'}
              </label>
              <input
                type="text"
                value={editingPage.slug}
                onChange={(e) => setEditingPage({ ...editingPage, slug: e.target.value })}
                className="w-full border border-slate-200 rounded-lg p-2"
                placeholder={lang === 'ar' ? 'page-url' : 'page-url'}
              />
            </div>

            <div>
              <label className="flex justify-between items-center text-sm font-bold text-slate-700 mb-1">
                <span>{lang === 'ar' ? 'العنوان (عربي)' : 'Title (Arabic)'}</span>
                <TranslateButton
                  text={editingPage.title?.ar || ''}
                  fieldId="page-title"
                  onTranslate={(val) => setEditingPage({ ...editingPage, title: { ...(editingPage.title || { ar: '', en: '' }), en: val } })}
                />
              </label>
              <input
                type="text"
                value={editingPage.title?.ar || ''}
                onChange={(e) => setEditingPage({
                  ...editingPage,
                  title: { ...(editingPage.title || { ar: '', en: '' }), ar: e.target.value }
                })}
                className="w-full border border-slate-200 rounded-lg p-2.5 focus:ring-2 focus:ring-tivro-primary/20 focus:border-tivro-primary outline-none transition"
                dir="rtl"
                placeholder={lang === 'ar' ? 'أدخل العنوان بالعربي' : 'Enter title in Arabic'}
              />
            </div>

            <div>
              <label className="flex justify-between items-center text-sm font-bold text-slate-700 mb-1">
                <span>{lang === 'ar' ? 'الوصف (عربي)' : 'Description (Arabic)'}</span>
                <TranslateButton
                  text={editingPage.description?.ar || ''}
                  fieldId="page-desc"
                  onTranslate={(val) => setEditingPage({ ...editingPage, description: { ...(editingPage.description || { ar: '', en: '' }), en: val } })}
                />
              </label>
              <textarea
                value={editingPage.description?.ar || ''}
                onChange={(e) => setEditingPage({
                  ...editingPage,
                  description: { ...(editingPage.description || { ar: '', en: '' }), ar: e.target.value }
                })}
                className="w-full border border-slate-200 rounded-lg p-2.5 focus:ring-2 focus:ring-tivro-primary/20 focus:border-tivro-primary outline-none transition h-24"
                rows={3}
                dir="rtl"
                placeholder={lang === 'ar' ? 'أدخل الوصف بالعربي' : 'Enter description in Arabic'}
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1">
                {lang === 'ar' ? 'العنوان (إنجليزي)' : 'Title (English)'}
              </label>
              <input
                type="text"
                value={editingPage.title?.en || ''}
                onChange={(e) => setEditingPage({
                  ...editingPage,
                  title: { ...(editingPage.title || { ar: '', en: '' }), en: e.target.value }
                })}
                className="w-full border border-slate-200 rounded-lg p-2.5 bg-slate-50/50 focus:ring-2 focus:ring-emerald-600/20 focus:border-emerald-600 outline-none transition"
                dir="ltr"
                placeholder="English title..."
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1">
                {lang === 'ar' ? 'الوصف (إنجليزي)' : 'Description (English)'}
              </label>
              <textarea
                value={editingPage.description?.en || ''}
                onChange={(e) => setEditingPage({
                  ...editingPage,
                  description: { ...(editingPage.description || { ar: '', en: '' }), en: e.target.value }
                })}
                className="w-full border border-slate-200 rounded-lg p-2.5 bg-slate-50/50 focus:ring-2 focus:ring-emerald-600/20 focus:border-emerald-600 outline-none transition h-24"
                rows={3}
                dir="ltr"
                placeholder="English description..."
              />
            </div>

            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={editingPage.isVisible}
                  onChange={(e) => setEditingPage({ ...editingPage, isVisible: e.target.checked })}
                  className="rounded"
                />
                {lang === 'ar' ? 'مرئي' : 'Visible'}
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={editingPage.showInNavigation}
                  onChange={(e) => setEditingPage({ ...editingPage, showInNavigation: e.target.checked })}
                  className="rounded"
                />
                {lang === 'ar' ? 'إظهار في القائمة' : 'Show in Navigation'}
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={!!editingPage.underConstruction}
                  onChange={(e) =>
                    setEditingPage({
                      ...editingPage,
                      underConstruction: e.target.checked
                    })
                  }
                  className="rounded"
                />
                {lang === 'ar' ? 'تحت الإنشاء' : 'Under Construction'}
              </label>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                {lang === 'ar' ? 'مكان الظهور' : 'Placement'}
              </label>
              <select
                value={editingPage.placement || ''}
                onChange={(e) => setEditingPage({ ...editingPage, placement: (e.target.value || undefined) as any })}
                className="w-full border border-slate-200 rounded-lg p-2"
              >
                <option value="">{lang === 'ar' ? 'افتراضي (بدون تحديد)' : 'Default (not set)'}</option>
                <option value="after_header">{lang === 'ar' ? 'بعد الهيدر' : 'After Header'}</option>
                <option value="after_services">{lang === 'ar' ? 'بعد الخدمات' : 'After Services'}</option>
                <option value="before_packages">{lang === 'ar' ? 'قبل الباقات' : 'Before Packages'}</option>
                <option value="after_team">{lang === 'ar' ? 'بعد الفريق' : 'After Team'}</option>
                <option value="before_work">{lang === 'ar' ? 'قبل الأعمال' : 'Before Work'}</option>
                <option value="after_work">{lang === 'ar' ? 'بعد الأعمال' : 'After Work'}</option>
                <option value="before_footer">{lang === 'ar' ? 'قبل الفوتر' : 'Before Footer'}</option>
              </select>
            </div>

            {editingPage.underConstruction && (
              <div className="space-y-2 p-3 border border-slate-200 rounded-lg bg-slate-50">
                <div>
                  <label className="flex justify-between items-center text-sm font-bold text-slate-700 mb-1">
                    <span>{lang === 'ar' ? 'نص الزر (عربي)' : 'Button Label (Arabic)'}</span>
                    <TranslateButton
                      text={editingPage.underConstructionButton?.label?.ar || ''}
                      fieldId="uc-btn"
                      onTranslate={(val) => setEditingPage({
                        ...editingPage,
                        underConstructionButton: {
                          ...editingPage.underConstructionButton,
                          label: {
                            ...(editingPage.underConstructionButton?.label || { ar: '', en: '' }),
                            en: val
                          }
                        }
                      })}
                    />
                  </label>
                  <input
                    type="text"
                    value={editingPage.underConstructionButton?.label?.ar || ''}
                    onChange={(e) =>
                      setEditingPage({
                        ...editingPage,
                        underConstructionButton: {
                          ...editingPage.underConstructionButton,
                          label: {
                            ...(editingPage.underConstructionButton?.label || { ar: '', en: '' }),
                            ar: e.target.value
                          }
                        }
                      })
                    }
                    className="w-full border border-slate-200 rounded-lg p-2.5 focus:ring-2 focus:ring-tivro-primary/20 focus:border-tivro-primary outline-none transition"
                    dir="rtl"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1">
                    {lang === 'ar' ? 'نص الزر (إنجليزي)' : 'Button Label (English)'}
                  </label>
                  <input
                    type="text"
                    value={editingPage.underConstructionButton?.label?.en || ''}
                    onChange={(e) =>
                      setEditingPage({
                        ...editingPage,
                        underConstructionButton: {
                          ...editingPage.underConstructionButton,
                          label: {
                            ...(editingPage.underConstructionButton?.label || { ar: '', en: '' }),
                            en: e.target.value
                          }
                        }
                      })
                    }
                    className="w-full border border-slate-200 rounded-lg p-2.5 bg-slate-50/50 focus:ring-2 focus:ring-emerald-600/20 focus:border-emerald-600 outline-none transition"
                    dir="ltr"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    {lang === 'ar' ? 'رابط الزر' : 'Button Link'}
                  </label>
                  <input
                    type="text"
                    value={editingPage.underConstructionButton?.href || ''}
                    onChange={(e) =>
                      setEditingPage({
                        ...editingPage,
                        underConstructionButton: {
                          ...editingPage.underConstructionButton,
                          href: e.target.value
                        }
                      })
                    }
                    className="w-full border border-slate-200 rounded-lg p-2"
                    placeholder="#contact"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                {lang === 'ar' ? 'شكل القسم' : 'Section Style'}
              </label>
              <select
                value={editingPage.sectionVariant || ''}
                onChange={(e) => setEditingPage({ ...editingPage, sectionVariant: (e.target.value || undefined) as any })}
                className="w-full border border-slate-200 rounded-lg p-2"
              >
                <option value="">{lang === 'ar' ? 'افتراضي' : 'Default'}</option>
                <option value="hero">{lang === 'ar' ? 'مثل الهيدر (Hero)' : 'Hero-like'}</option>
              </select>
            </div>

            {editingPage.sectionVariant === 'hero' && (
              <div className="space-y-3 p-3 border border-slate-200 rounded-lg bg-slate-50">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    {lang === 'ar' ? 'لون خلفية القسم' : 'Section Background Color'}
                  </label>
                  <input
                    type="color"
                    value={editingPage.heroSettings?.backgroundColor || '#0f172a'}
                    onChange={(e) =>
                      setEditingPage({
                        ...editingPage,
                        heroSettings: { ...editingPage.heroSettings, backgroundColor: e.target.value }
                      })
                    }
                    className="w-full h-10 border border-slate-200 rounded-lg"
                  />

                  <div className="mt-2">
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      {lang === 'ar' ? 'شفافية خلفية القسم' : 'Section Background Opacity'}
                    </label>
                    <div className="flex items-center gap-3">
                      <input
                        type="range"
                        min={0}
                        max={100}
                        value={Math.round(editingPage.heroSettings?.backgroundOpacity ?? 100)}
                        onChange={(e) => {
                          const v = Number(e.target.value);
                          setEditingPage({
                            ...editingPage,
                            heroSettings: { ...editingPage.heroSettings, backgroundOpacity: v }
                          });
                        }}
                        className="w-full"
                      />
                      <div className="text-sm text-slate-700 w-16 text-end">
                        {Math.round(editingPage.heroSettings?.backgroundOpacity ?? 100)}%
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    {lang === 'ar' ? 'لون الخط' : 'Text Color'}
                  </label>
                  <input
                    type="color"
                    value={editingPage.heroSettings?.textColor || '#ffffff'}
                    onChange={(e) =>
                      setEditingPage({
                        ...editingPage,
                        heroSettings: { ...editingPage.heroSettings, textColor: e.target.value }
                      })
                    }
                    className="w-full h-10 border border-slate-200 rounded-lg"
                  />

                  <button
                    type="button"
                    onClick={() => {
                      setEditingPage((prev) => {
                        if (!prev) return prev;
                        const bg = prev.heroSettings?.backgroundColor || '#0f172a';
                        const suggested = bestTextColorBW(bg);
                        return {
                          ...prev,
                          heroSettings: { ...prev.heroSettings, textColor: suggested }
                        };
                      });
                    }}
                    className="mt-2 w-full border border-slate-200 rounded-lg py-2 text-sm bg-white hover:bg-slate-50"
                  >
                    {lang === 'ar' ? 'اقتراح لون نص مناسب تلقائياً' : 'Auto-pick readable text color'}
                  </button>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    {lang === 'ar' ? 'لون خلفية صندوق النص' : 'Text Box Background'}
                  </label>
                  <input
                    type="color"
                    value={editingPage.heroSettings?.textBoxBackgroundColor || '#0b1220'}
                    onChange={(e) =>
                      setEditingPage({
                        ...editingPage,
                        heroSettings: { ...editingPage.heroSettings, textBoxBackgroundColor: e.target.value }
                      })
                    }
                    className="w-full h-10 border border-slate-200 rounded-lg"
                  />

                  <div className="mt-2">
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      {lang === 'ar' ? 'شفافية خلفية صندوق النص' : 'Text Box Background Opacity'}
                    </label>
                    <div className="flex items-center gap-3">
                      <input
                        type="range"
                        min={0}
                        max={100}
                        value={Math.round(editingPage.heroSettings?.textBoxBackgroundOpacity ?? 40)}
                        onChange={(e) => {
                          const v = Number(e.target.value);
                          setEditingPage({
                            ...editingPage,
                            heroSettings: { ...editingPage.heroSettings, textBoxBackgroundOpacity: v }
                          });
                        }}
                        className="w-full"
                      />
                      <div className="text-sm text-slate-700 w-16 text-end">
                        {Math.round(editingPage.heroSettings?.textBoxBackgroundOpacity ?? 40)}%
                      </div>
                    </div>
                  </div>
                </div>

                {(() => {
                  const bg = editingPage.heroSettings?.backgroundColor || '#0f172a';
                  const text = editingPage.heroSettings?.textColor || '#ffffff';
                  const box = editingPage.heroSettings?.textBoxBackgroundColor || '#0b1220';
                  const sectionRatio = contrastRatio(bg, text);
                  const boxRatio = contrastRatio(box, text);
                  const status = (r: number) => {
                    if (r >= 7) return { label: lang === 'ar' ? 'AAA' : 'AAA', cls: 'text-emerald-700' };
                    if (r >= 4.5) return { label: lang === 'ar' ? 'AA' : 'AA', cls: 'text-emerald-700' };
                    if (r >= 3) return { label: lang === 'ar' ? 'AA (نص كبير)' : 'AA (Large)', cls: 'text-amber-700' };
                    return { label: lang === 'ar' ? 'ضعيف' : 'Low', cls: 'text-red-700' };
                  };
                  const s1 = status(sectionRatio);
                  const s2 = status(boxRatio);

                  return (
                    <div className="space-y-2 p-3 border border-slate-200 rounded-lg bg-white">
                      <div className="text-sm font-medium text-slate-700">
                        {lang === 'ar' ? 'إمكانية القراءة (التباين)' : 'Readability (Contrast)'}
                      </div>

                      <div className="flex items-center justify-between text-sm">
                        <div className="text-slate-600">
                          {lang === 'ar' ? 'تباين النص مع خلفية القسم' : 'Text vs section background'}
                        </div>
                        <div className="font-medium text-slate-900">
                          {sectionRatio.toFixed(2)}:1 <span className={`${s1.cls} ml-2`}>{s1.label}</span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between text-sm">
                        <div className="text-slate-600">
                          {lang === 'ar' ? 'تباين النص مع خلفية صندوق النص' : 'Text vs text box background'}
                        </div>
                        <div className="font-medium text-slate-900">
                          {boxRatio.toFixed(2)}:1 <span className={`${s2.cls} ml-2`}>{s2.label}</span>
                        </div>
                      </div>
                    </div>
                  );
                })()}

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    {lang === 'ar' ? 'مكان الصورة' : 'Image Position'}
                  </label>
                  <select
                    value={editingPage.heroSettings?.imagePosition || 'right'}
                    onChange={(e) =>
                      setEditingPage({
                        ...editingPage,
                        heroSettings: { ...editingPage.heroSettings, imagePosition: e.target.value as any }
                      })
                    }
                    className="w-full border border-slate-200 rounded-lg p-2"
                  >
                    <option value="right">{lang === 'ar' ? 'يمين' : 'Right'}</option>
                    <option value="left">{lang === 'ar' ? 'يسار' : 'Left'}</option>
                    <option value="top">{lang === 'ar' ? 'أعلى' : 'Top'}</option>
                    <option value="bottom">{lang === 'ar' ? 'أسفل' : 'Bottom'}</option>
                    <option value="background">{lang === 'ar' ? 'خلف النص (خلفية)' : 'Background'}
                    </option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    {lang === 'ar' ? 'حجم العنوان' : 'Title Size'}
                  </label>
                  <select
                    value={editingPage.heroSettings?.titleSize || 'md'}
                    onChange={(e) =>
                      setEditingPage({
                        ...editingPage,
                        heroSettings: { ...editingPage.heroSettings, titleSize: e.target.value as any }
                      })
                    }
                    className="w-full border border-slate-200 rounded-lg p-2"
                  >
                    <option value="sm">{lang === 'ar' ? 'صغير' : 'Small'}</option>
                    <option value="md">{lang === 'ar' ? 'متوسط' : 'Medium'}</option>
                    <option value="lg">{lang === 'ar' ? 'كبير' : 'Large'}</option>
                    <option value="xl">{lang === 'ar' ? 'كبير جداً' : 'Extra Large'}</option>
                  </select>
                </div>
              </div>
            )}
          </div>

          {/* Component Editor */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex justify-between items-center">
              <h4 className="font-bold text-slate-900">
                {lang === 'ar' ? 'المكونات' : 'Components'}
              </h4>
              <div className="flex gap-2">
                <select
                  onChange={(e) => {
                    if (e.target.value) {
                      addComponentToPage(e.target.value);
                      e.target.value = '';
                    }
                  }}
                  className="border border-slate-200 rounded-lg p-2 text-sm"
                >
                  <option value="">{lang === 'ar' ? 'إضافة قالب جاهز' : 'Add Template'}</option>
                  {templates.map(template => (
                    <option key={template.id} value={template.id}>
                      {template.displayName[lang]}
                    </option>
                  ))}
                </select>
                <button
                  onClick={() => addCustomComponent('text')}
                  className="bg-blue-50 text-blue-600 px-3 py-1 rounded text-sm font-medium"
                >
                  + {lang === 'ar' ? 'نص' : 'Text'}
                </button>
                <button
                  onClick={() => addCustomComponent('image')}
                  className="bg-green-50 text-green-600 px-3 py-1 rounded text-sm font-medium"
                >
                  + {lang === 'ar' ? 'صورة' : 'Image'}
                </button>
                <button
                  onClick={() => addCustomComponent('button')}
                  className="bg-purple-50 text-purple-600 px-3 py-1 rounded text-sm font-medium"
                >
                  + {lang === 'ar' ? 'زر' : 'Button'}
                </button>
              </div>
            </div>

            {/* Component Editor */}
            {selectedComponent && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex justify-between items-center mb-4">
                  <h5 className="font-bold text-blue-900">
                    {lang === 'ar' ? 'تحرير المكون' : 'Edit Component'}: {selectedComponent.type}
                  </h5>
                  <button
                    onClick={() => setSelectedComponent(null)}
                    className="text-blue-600 hover:text-blue-700"
                  >
                    <X size={16} />
                  </button>
                </div>

                {/* Text Component Editor */}
                {selectedComponent.type === 'text' && (
                  <div className="space-y-3">
                    <div>
                      <label className="flex justify-between items-center text-sm font-bold text-slate-700 mb-1">
                        <span>{lang === 'ar' ? 'النص (عربي)' : 'Text (Arabic)'}</span>
                        <TranslateButton
                          text={selectedComponent.content.text?.ar || ''}
                          fieldId="comp-text"
                          onTranslate={(val) => {
                            const updatedComponent = {
                              ...selectedComponent,
                              content: {
                                ...selectedComponent.content,
                                text: {
                                  ...(selectedComponent.content.text || { ar: '', en: '' }),
                                  en: val
                                }
                              }
                            };
                            setSelectedComponent(updatedComponent);
                            updateComponentInPage(updatedComponent);
                          }}
                        />
                      </label>
                      <WordLikeEditor
                        dir="rtl"
                        value={selectedComponent.content.text?.ar || ''}
                        placeholder={lang === 'ar' ? 'اكتب النص هنا...' : 'Write here...'}
                        onChange={(html) => {
                          const updatedComponent = {
                            ...selectedComponent,
                            content: {
                              ...selectedComponent.content,
                              text: {
                                ...(selectedComponent.content.text || { ar: '', en: '' }),
                                ar: html
                              }
                            }
                          };
                          setSelectedComponent(updatedComponent);
                          updateComponentInPage(updatedComponent);
                        }}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-1">
                        {lang === 'ar' ? 'النص (إنجليزي)' : 'Text (English)'}
                      </label>
                      <WordLikeEditor
                        dir="ltr"
                        value={selectedComponent.content.text?.en || ''}
                        placeholder={lang === 'ar' ? 'اكتب النص هنا...' : 'Write here...'}
                        onChange={(html) => {
                          const updatedComponent = {
                            ...selectedComponent,
                            content: {
                              ...selectedComponent.content,
                              text: {
                                ...selectedComponent.content.text,
                                en: html
                              }
                            }
                          };
                          setSelectedComponent(updatedComponent);
                          updateComponentInPage(updatedComponent);
                        }}
                      />
                    </div>
                  </div>
                )}

                {/* Button Component Editor */}
                {selectedComponent.type === 'button' && (
                  <div className="space-y-3">
                    <div>
                      <label className="flex justify-between items-center text-sm font-bold text-slate-700 mb-1">
                        <span>{lang === 'ar' ? 'نص الزر (عربي)' : 'Button Text (Arabic)'}</span>
                        <TranslateButton
                          text={selectedComponent.content.text?.ar || ''}
                          fieldId="comp-btn-text"
                          onTranslate={(val) => {
                            const updatedComponent = {
                              ...selectedComponent,
                              content: {
                                ...selectedComponent.content,
                                text: {
                                  ...(selectedComponent.content.text || { ar: '', en: '' }),
                                  en: val
                                }
                              }
                            };
                            setSelectedComponent(updatedComponent);
                            updateComponentInPage(updatedComponent);
                          }}
                        />
                      </label>
                      <input
                        type="text"
                        value={selectedComponent.content.text?.ar || ''}
                        onChange={(e) => {
                          const updatedComponent = {
                            ...selectedComponent,
                            content: {
                              ...selectedComponent.content,
                              text: {
                                ...selectedComponent.content.text,
                                ar: e.target.value
                              }
                            }
                          };
                          setSelectedComponent(updatedComponent);
                          updateComponentInPage(updatedComponent);
                        }}
                        className="w-full border border-slate-200 rounded-lg p-2"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-1">
                        {lang === 'ar' ? 'نص الزر (إنجليزي)' : 'Button Text (English)'}
                      </label>
                      <input
                        type="text"
                        value={selectedComponent.content.text?.en || ''}
                        onChange={(e) => {
                          const updatedComponent = {
                            ...selectedComponent,
                            content: {
                              ...selectedComponent.content,
                              text: {
                                ...selectedComponent.content.text,
                                en: e.target.value
                              }
                            }
                          };
                          setSelectedComponent(updatedComponent);
                          updateComponentInPage(updatedComponent);
                        }}
                        className="w-full border border-slate-200 rounded-lg p-2"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">
                        {lang === 'ar' ? 'الرابط' : 'Link'}
                      </label>
                      <input
                        type="text"
                        value={selectedComponent.content.href || ''}
                        onChange={(e) => {
                          const updatedComponent = {
                            ...selectedComponent,
                            content: {
                              ...selectedComponent.content,
                              href: e.target.value
                            }
                          };
                          setSelectedComponent(updatedComponent);
                          updateComponentInPage(updatedComponent);
                        }}
                        className="w-full border border-slate-200 rounded-lg p-2"
                        placeholder="#"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">
                        {lang === 'ar' ? 'النمط' : 'Style'}
                      </label>
                      <select
                        value={selectedComponent.content.style || 'primary'}
                        onChange={(e) => {
                          const updatedComponent = {
                            ...selectedComponent,
                            content: {
                              ...selectedComponent.content,
                              style: e.target.value
                            }
                          };
                          setSelectedComponent(updatedComponent);
                          updateComponentInPage(updatedComponent);
                        }}
                        className="w-full border border-slate-200 rounded-lg p-2"
                      >
                        <option value="primary">{lang === 'ar' ? 'أساسي' : 'Primary'}</option>
                        <option value="secondary">{lang === 'ar' ? 'ثانوي' : 'Secondary'}</option>
                        <option value="outline">{lang === 'ar' ? 'إطار' : 'Outline'}</option>
                      </select>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">
                          {lang === 'ar' ? 'لون خلفية الزر' : 'Button Background'}
                        </label>
                        <input
                          type="color"
                          value={selectedComponent.content.bgColor || '#10b981'}
                          onChange={(e) => {
                            const updatedComponent = {
                              ...selectedComponent,
                              content: {
                                ...selectedComponent.content,
                                bgColor: e.target.value
                              }
                            };
                            setSelectedComponent(updatedComponent);
                            updateComponentInPage(updatedComponent);
                          }}
                          className="w-full h-10 border border-slate-200 rounded-lg"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">
                          {lang === 'ar' ? 'لون نص الزر' : 'Button Text Color'}
                        </label>
                        <input
                          type="color"
                          value={selectedComponent.content.textColor || '#ffffff'}
                          onChange={(e) => {
                            const updatedComponent = {
                              ...selectedComponent,
                              content: {
                                ...selectedComponent.content,
                                textColor: e.target.value
                              }
                            };
                            setSelectedComponent(updatedComponent);
                            updateComponentInPage(updatedComponent);
                          }}
                          className="w-full h-10 border border-slate-200 rounded-lg"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">
                          {lang === 'ar' ? 'لون إطار الزر' : 'Button Border Color'}
                        </label>
                        <input
                          type="color"
                          value={selectedComponent.content.borderColor || '#10b981'}
                          onChange={(e) => {
                            const updatedComponent = {
                              ...selectedComponent,
                              content: {
                                ...selectedComponent.content,
                                borderColor: e.target.value
                              }
                            };
                            setSelectedComponent(updatedComponent);
                            updateComponentInPage(updatedComponent);
                          }}
                          className="w-full h-10 border border-slate-200 rounded-lg"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* Image Component Editor */}
                {selectedComponent.type === 'image' && (
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">
                        {lang === 'ar' ? 'رابط الصورة' : 'Image URL'}
                      </label>
                      <input
                        type="text"
                        value={selectedComponent.content.src || ''}
                        onChange={(e) => {
                          const updatedComponent = {
                            ...selectedComponent,
                            content: {
                              ...selectedComponent.content,
                              src: e.target.value
                            }
                          };
                          setSelectedComponent(updatedComponent);
                          updateComponentInPage(updatedComponent);
                        }}
                        className="w-full border border-slate-200 rounded-lg p-2"
                        placeholder="https://example.com/image.jpg"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">
                        {lang === 'ar' ? 'رفع ملف (صور/PDF)' : 'Upload File (Images/PDF)'}
                      </label>
                      <input
                        type="file"
                        accept="image/jpeg,image/png,image/webp,image/gif,application/pdf"
                        disabled={uploading}
                        onChange={async (e) => {
                          const file = e.target.files?.[0];
                          e.target.value = '';
                          if (!file) return;

                          const uploaded = await uploadMediaFile(file);
                          if (!uploaded) return;

                          const updatedComponent = {
                            ...selectedComponent,
                            content: {
                              ...selectedComponent.content,
                              src: uploaded.url,
                              mime: uploaded.mime
                            }
                          };
                          setSelectedComponent(updatedComponent);
                          updateComponentInPage(updatedComponent);
                        }}
                        className="w-full border border-slate-200 rounded-lg p-2 bg-white"
                      />

                      {uploading && (
                        <div className="text-sm text-slate-600">
                          {lang === 'ar' ? 'جاري الرفع...' : 'Uploading...'}
                        </div>
                      )}
                      {uploadError && (
                        <div className="text-sm text-red-600">{uploadError}</div>
                      )}
                    </div>

                    <div>
                      <label className="flex justify-between items-center text-sm font-bold text-slate-700 mb-1">
                        <span>{lang === 'ar' ? 'النص البديل (عربي)' : 'Alt Text (Arabic)'}</span>
                        <TranslateButton
                          text={selectedComponent.content.alt?.ar || ''}
                          fieldId="comp-img-alt"
                          onTranslate={(val) => {
                            const updatedComponent = {
                              ...selectedComponent,
                              content: {
                                ...selectedComponent.content,
                                alt: {
                                  ...(selectedComponent.content.alt || { ar: '', en: '' }),
                                  en: val
                                }
                              }
                            };
                            setSelectedComponent(updatedComponent);
                            updateComponentInPage(updatedComponent);
                          }}
                        />
                      </label>
                      <input
                        type="text"
                        value={selectedComponent.content.alt?.ar || ''}
                        onChange={(e) => {
                          const updatedComponent = {
                            ...selectedComponent,
                            content: {
                              ...selectedComponent.content,
                              alt: {
                                ...selectedComponent.content.alt,
                                ar: e.target.value
                              }
                            }
                          };
                          setSelectedComponent(updatedComponent);
                          updateComponentInPage(updatedComponent);
                        }}
                        className="w-full border border-slate-200 rounded-lg p-2"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-1">
                        {lang === 'ar' ? 'النص البديل (إنجليزي)' : 'Alt Text (English)'}
                      </label>
                      <input
                        type="text"
                        value={selectedComponent.content.alt?.en || ''}
                        onChange={(e) => {
                          const updatedComponent = {
                            ...selectedComponent,
                            content: {
                              ...selectedComponent.content,
                              alt: {
                                ...selectedComponent.content.alt,
                                en: e.target.value
                              }
                            }
                          };
                          setSelectedComponent(updatedComponent);
                          updateComponentInPage(updatedComponent);
                        }}
                        className="w-full border border-slate-200 rounded-lg p-2"
                      />
                    </div>
                  </div>
                )}
              </div>
            )}

            <div className="space-y-2">
              {editingPage.components.map((component, index) => (
                <div
                  key={component.id}
                  className="border border-slate-200 rounded-lg p-4 bg-slate-50"
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <GripVertical className="text-slate-400" size={16} />
                      {getComponentIcon(component.type)}
                      <span className="font-medium text-slate-700">
                        {component.type} - {component.display}
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => moveComponent(index, 'up')}
                        disabled={index === 0}
                        className="p-1 text-slate-400 hover:text-slate-600 disabled:opacity-50"
                      >
                        <ArrowUp size={14} />
                      </button>
                      <button
                        onClick={() => moveComponent(index, 'down')}
                        disabled={index === editingPage.components.length - 1}
                        className="p-1 text-slate-400 hover:text-slate-600 disabled:opacity-50"
                      >
                        <ArrowDown size={14} />
                      </button>
                      <button
                        onClick={() => setSelectedComponent(component)}
                        className="p-1 text-blue-600 hover:text-blue-700"
                      >
                        <Edit2 size={14} />
                      </button>
                      <button
                        onClick={() => deleteComponent(component.id)}
                        className="p-1 text-red-600 hover:text-red-700"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>

                  {/* Component Preview */}
                  <div className="text-sm text-slate-600">
                    {component.type === 'text' && component.content.text?.[lang]}
                    {component.type === 'button' && component.content.text?.[lang]}
                    {component.type === 'image' && component.content.alt?.[lang]}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div >
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-slate-900">
          {lang === 'ar' ? 'مدير الصفحات' : 'Page Manager'}
        </h2>
        <button
          onClick={createNewPage}
          className="bg-tivro-primary text-white px-4 py-2 rounded-lg font-medium hover:bg-emerald-500 flex items-center gap-2"
        >
          <Plus size={16} />
          {lang === 'ar' ? 'صفحة جديدة' : 'New Page'}
        </button>
      </div>

      {/* Tabs */}
      <div className="border-b border-slate-200">
        <nav className="flex space-x-8">
          <button
            onClick={() => setActiveTab('pages')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${activeTab === 'pages'
              ? 'border-tivro-primary text-tivro-primary'
              : 'border-transparent text-slate-500 hover:text-slate-700'
              }`}
          >
            {lang === 'ar' ? 'الصفحات' : 'Pages'}
          </button>
          <button
            onClick={() => setActiveTab('templates')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${activeTab === 'templates'
              ? 'border-tivro-primary text-tivro-primary'
              : 'border-transparent text-slate-500 hover:text-slate-700'
              }`}
          >
            {lang === 'ar' ? 'القوالب' : 'Templates'}
          </button>
          <button
            onClick={() => setActiveTab('navigation')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${activeTab === 'navigation'
              ? 'border-tivro-primary text-tivro-primary'
              : 'border-transparent text-slate-500 hover:text-slate-700'
              }`}
          >
            {lang === 'ar' ? 'القائمة' : 'Navigation'}
          </button>
        </nav>
      </div>

      {/* Pages Tab */}
      {activeTab === 'pages' && (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="text-left p-4 font-medium text-slate-700">
                    {lang === 'ar' ? 'الاسم' : 'Name'}
                  </th>
                  <th className="text-left p-4 font-medium text-slate-700">
                    {lang === 'ar' ? 'المسار' : 'Path'}
                  </th>
                  <th className="text-left p-4 font-medium text-slate-700">
                    {lang === 'ar' ? 'الحالة' : 'Status'}
                  </th>
                  <th className="text-left p-4 font-medium text-slate-700">
                    {lang === 'ar' ? 'المكونات' : 'Components'}
                  </th>
                  <th className="text-left p-4 font-medium text-slate-700">
                    {lang === 'ar' ? 'الترتيب' : 'Order'}
                  </th>
                  <th className="text-left p-4 font-medium text-slate-700">
                    {lang === 'ar' ? 'إجراءات' : 'Actions'}
                  </th>
                </tr>
              </thead>
              <tbody>
                {pages.sort((a, b) => (a.navigationOrder ?? 999) - (b.navigationOrder ?? 999)).map((page, index) => (
                  <tr key={page.id} className="border-b border-slate-100">
                    <td className="p-4">
                      <div>
                        <div className="font-medium text-slate-900">{page.name}</div>
                        <div className="text-sm text-slate-500">{page.title[lang]}</div>
                      </div>
                    </td>
                    <td className="p-4">
                      <code className="bg-slate-100 px-2 py-1 rounded text-sm">
                        /{page.slug}
                      </code>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${page.isVisible
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                          }`}>
                          {page.isVisible
                            ? (lang === 'ar' ? 'مرئي' : 'Visible')
                            : (lang === 'ar' ? 'مخفي' : 'Hidden')
                          }
                        </span>
                        {page.showInNavigation && (
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            {lang === 'ar' ? 'في القائمة' : 'In Nav'}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="p-4">
                      <span className="text-sm text-slate-500">
                        {page.components.length} {lang === 'ar' ? 'مكون' : 'components'}
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => movePageUp(page.id)}
                          disabled={index === 0}
                          className="p-1 text-slate-400 hover:text-slate-600 disabled:opacity-50 disabled:cursor-not-allowed"
                          title={lang === 'ar' ? 'تحريك للأعلى' : 'Move Up'}
                        >
                          <ChevronUp size={16} />
                        </button>
                        <button
                          onClick={() => movePageDown(page.id)}
                          disabled={index === pages.length - 1}
                          className="p-1 text-slate-400 hover:text-slate-600 disabled:opacity-50 disabled:cursor-not-allowed"
                          title={lang === 'ar' ? 'تحريك للأسفل' : 'Move Down'}
                        >
                          <ChevronDown size={16} />
                        </button>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => togglePageVisibility(page.id)}
                          className="p-1 text-slate-400 hover:text-slate-600"
                        >
                          {page.isVisible ? <Eye size={16} /> : <EyeOff size={16} />}
                        </button>
                        <button
                          onClick={() => setEditingPage(page)}
                          className="p-1 text-blue-600 hover:text-blue-700"
                        >
                          <Edit2 size={16} />
                        </button>
                        <button
                          onClick={() => deletePage(page.id)}
                          className="p-1 text-red-600 hover:text-red-700"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Templates Tab */}
      {activeTab === 'templates' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {templates.map((template) => (
            <div key={template.id} className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
              <div className="mb-4">
                <h3 className="font-bold text-slate-900 mb-2">
                  {template.displayName[lang]}
                </h3>
                <p className="text-sm text-slate-600 mb-2">
                  {template.description[lang]}
                </p>
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-800">
                  {template.category}
                </span>
              </div>
              <div className="text-sm text-slate-500 mb-4">
                {template.defaultComponents.length} {lang === 'ar' ? 'مكون' : 'components'}
              </div>
              <button
                onClick={() => {
                  if (editingPage) {
                    addComponentToPage(template.id);
                  }
                }}
                disabled={!editingPage}
                className="w-full bg-tivro-primary text-white px-4 py-2 rounded-lg font-medium hover:bg-emerald-500 disabled:opacity-50"
              >
                {lang === 'ar' ? 'استخدم القالب' : 'Use Template'}
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Navigation Tab */}
      {activeTab === 'navigation' && (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <h3 className="font-bold text-slate-900 mb-4">
            {lang === 'ar' ? 'إدارة القائمة' : 'Navigation Management'}
          </h3>
          <p className="text-slate-600">
            {lang === 'ar'
              ? 'سيتم إضافة إدارة القائمة في التحديث القادم'
              : 'Navigation management will be added in the next update'
            }
          </p>
        </div>
      )}
    </div>
  );
};
