import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { SiteSectionControl, SectionTemplate, CustomPage } from '../types';
import { Eye, EyeOff, Plus, Trash2, Settings, ArrowUp, ArrowDown, Copy, Edit2, Save, X } from 'lucide-react';

interface SectionManagerProps {
  onUpdate?: () => void;
}

export const SectionManager: React.FC<SectionManagerProps> = ({ onUpdate }) => {
  const { t, lang } = useApp();
  const [sectionControls, setSectionControls] = useState<Record<string, SiteSectionControl>>({});
  const [customPages, setCustomPages] = useState<CustomPage[]>([]);
  const [availableTemplates, setAvailableTemplates] = useState<SectionTemplate[]>([]);
  const [editingSection, setEditingSection] = useState<string | null>(null);

  // Initialize default section controls
  useEffect(() => {
    const defaultControls: Record<string, SiteSectionControl> = {
      hero: { id: 'hero', name: lang === 'ar' ? 'القسم الرئيسي' : 'Hero Section', isVisible: true, canBeRemoved: false },
      services: { id: 'services', name: lang === 'ar' ? 'الخدمات' : 'Services', isVisible: true, canBeRemoved: true },
      work: { id: 'work', name: lang === 'ar' ? 'الأعمال' : 'Work', isVisible: true, canBeRemoved: true },
      team: { id: 'team', name: lang === 'ar' ? 'الفريق' : 'Team', isVisible: true, canBeRemoved: true },
      packages: { id: 'packages', name: lang === 'ar' ? 'الباقات' : 'Packages', isVisible: true, canBeRemoved: true },
      contact: { id: 'contact', name: lang === 'ar' ? 'تواصل معنا' : 'Contact', isVisible: true, canBeRemoved: false },
      footer: { id: 'footer', name: lang === 'ar' ? 'الفوتر' : 'Footer', isVisible: true, canBeRemoved: false }
    };
    
    // Check for saved sections in localStorage
    const savedSections = localStorage.getItem('sectionControls');
    if (savedSections) {
      try {
        const parsed = JSON.parse(savedSections);
        setSectionControls({ ...defaultControls, ...parsed });
      } catch (error) {
        console.error('Error loading sections:', error);
        setSectionControls(defaultControls);
      }
    } else {
      setSectionControls(defaultControls);
    }
  }, [lang]);

  const toggleSectionVisibility = (sectionId: string) => {
    const updated = {
      ...sectionControls,
      [sectionId]: {
        ...sectionControls[sectionId],
        isVisible: !sectionControls[sectionId].isVisible
      }
    };
    setSectionControls(updated);
    localStorage.setItem('sectionControls', JSON.stringify(updated));
    onUpdate?.();
  };

  const reorderSections = (fromIndex: number, toIndex: number) => {
    const sections = Object.entries(sectionControls);
    const [moved] = sections.splice(fromIndex, 1);
    sections.splice(toIndex, 0, moved);
    
    const reorderedControls: Record<string, SiteSectionControl> = {};
    sections.forEach(([id, control]) => {
      reorderedControls[id] = control as SiteSectionControl;
    });
    
    setSectionControls(reorderedControls);
    localStorage.setItem('sectionControls', JSON.stringify(reorderedControls));
    onUpdate?.();
  };

  const duplicateSection = (sectionId: string) => {
    const section = sectionControls[sectionId] as SiteSectionControl;
    if (!section) return;
    
    const newId = `${section.id}-copy-${Date.now()}`;
    const newSection: SiteSectionControl = {
      ...section,
      id: newId,
      name: `${section.name} (${lang === 'ar' ? 'نسخة' : 'Copy'})`,
      canBeRemoved: true
    };
    
    const updated = { ...sectionControls, [newId]: newSection };
    setSectionControls(updated);
    localStorage.setItem('sectionControls', JSON.stringify(updated));
    onUpdate?.();
  };

  const addNewSection = () => {
    const newId = `custom-section-${Date.now()}`;
    const newSection: SiteSectionControl = {
      id: newId,
      name: lang === 'ar' ? 'قسم مخصص جديد' : 'New Custom Section',
      isVisible: true,
      canBeRemoved: true
    };
    
    const updated = { ...sectionControls, [newId]: newSection };
    setSectionControls(updated);
    localStorage.setItem('sectionControls', JSON.stringify(updated));
    onUpdate?.();
  };

  const removeSection = (sectionId: string) => {
    if (!sectionControls[sectionId]?.canBeRemoved) return;
    
    if (confirm(lang === 'ar' ? 'هل أنت متأكد من إزالة هذا القسم؟' : 'Are you sure you want to remove this section?')) {
      const newControls = { ...sectionControls };
      delete newControls[sectionId];
      setSectionControls(newControls);
      localStorage.setItem('sectionControls', JSON.stringify(newControls));
      onUpdate?.();
    }
  };

  const getSectionIcon = (sectionId: string) => {
    const icons: Record<string, string> = {
      hero: '🚀',
      services: '⚙️',
      work: '💼',
      team: '👥',
      packages: '📦',
      contact: '📞',
      footer: '🏢'
    };
    return icons[sectionId] || '📄';
  };

  const sections = Object.entries(sectionControls);
  const visibleSections = sections.filter(([_, control]) => (control as any).isVisible);
  const hiddenSections = sections.filter(([_, control]) => !(control as any).isVisible);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-slate-900">
          {lang === 'ar' ? 'مدير الأقسام' : 'Section Manager'}
        </h2>
        <div className="flex gap-2">
          <button 
            onClick={addNewSection}
            className="bg-blue-50 text-blue-600 px-4 py-2 rounded-lg font-medium hover:bg-blue-100 flex items-center gap-2"
          >
            <Plus size={16} />
            {lang === 'ar' ? 'قسم جديد' : 'New Section'}
          </button>
        </div>
      </div>

      {/* Section Visibility Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Visible Sections */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
            <Eye size={20} className="text-green-600" />
            {lang === 'ar' ? 'الأقسام المرئية' : 'Visible Sections'} ({visibleSections.length})
          </h3>
          <div className="space-y-2">
            {visibleSections.map(([sectionId, control], index) => (
              <div
                key={sectionId}
                className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg"
              >
                <div className="flex items-center gap-3">
                  <span className="text-lg">{getSectionIcon(sectionId)}</span>
                  <div>
                    <div className="font-medium text-slate-900">{(control as any).name}</div>
                    <div className="text-xs text-slate-500">{sectionId}</div>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  {index > 0 && (
                    <button
                      onClick={() => reorderSections(sections.findIndex(([id]) => id === sectionId), index - 1)}
                      className="p-1 text-slate-400 hover:text-slate-600"
                      title={lang === 'ar' ? 'تحريك للأعلى' : 'Move Up'}
                    >
                      <ArrowUp size={14} />
                    </button>
                  )}
                  {index < visibleSections.length - 1 && (
                    <button
                      onClick={() => reorderSections(sections.findIndex(([id]) => id === sectionId), index + 1)}
                      className="p-1 text-slate-400 hover:text-slate-600"
                      title={lang === 'ar' ? 'تحريك للأسفل' : 'Move Down'}
                    >
                      <ArrowDown size={14} />
                    </button>
                  )}
                  <button
                    onClick={() => duplicateSection(sectionId)}
                    className="p-1 text-blue-600 hover:text-blue-700"
                    title={lang === 'ar' ? 'نسخ' : 'Duplicate'}
                  >
                    <Copy size={14} />
                  </button>
                  <button
                    onClick={() => toggleSectionVisibility(sectionId)}
                    className="p-1 text-orange-600 hover:text-orange-700"
                    title={lang === 'ar' ? 'إخفاء' : 'Hide'}
                  >
                    <EyeOff size={14} />
                  </button>
                  {(control as any).canBeRemoved && (
                    <button
                      onClick={() => removeSection(sectionId)}
                      className="p-1 text-red-600 hover:text-red-700"
                      title={lang === 'ar' ? 'إزالة' : 'Remove'}
                    >
                      <Trash2 size={14} />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Hidden Sections */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
            <EyeOff size={20} className="text-red-600" />
            {lang === 'ar' ? 'الأقسام المخفية' : 'Hidden Sections'} ({hiddenSections.length})
          </h3>
          <div className="space-y-2">
            {hiddenSections.map(([sectionId, control]) => (
              <div
                key={sectionId}
                className="flex items-center justify-between p-3 bg-red-50 border border-red-200 rounded-lg"
              >
                <div className="flex items-center gap-3">
                  <span className="text-lg opacity-50">{getSectionIcon(sectionId)}</span>
                  <div>
                    <div className="font-medium text-slate-700">{(control as any).name}</div>
                    <div className="text-xs text-slate-500">{sectionId}</div>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => toggleSectionVisibility(sectionId)}
                    className="p-1 text-green-600 hover:text-green-700"
                    title={lang === 'ar' ? 'إظهار' : 'Show'}
                  >
                    <Eye size={14} />
                  </button>
                  {(control as any).canBeRemoved && (
                    <button
                      onClick={() => removeSection(sectionId)}
                      className="p-1 text-red-600 hover:text-red-700"
                      title={lang === 'ar' ? 'إزالة' : 'Remove'}
                    >
                      <Trash2 size={14} />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Section Templates */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
        <h3 className="font-bold text-slate-900 mb-4">
          {lang === 'ar' ? 'قوالب الأقسام الجاهزة' : 'Ready Section Templates'}
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[
            {
              id: 'testimonials',
              name: { ar: 'شهادات العملاء', en: 'Testimonials' },
              description: { ar: 'عرض آراء العملاء', en: 'Display customer reviews' },
              icon: '⭐',
              color: 'blue'
            },
            {
              id: 'pricing',
              name: { ar: 'الأسعار', en: 'Pricing' },
              description: { ar: 'عرض خطط الأسعار', en: 'Display pricing plans' },
              icon: '💰',
              color: 'green'
            },
            {
              id: 'faq',
              name: { ar: 'الأسئلة الشائعة', en: 'FAQ' },
              description: { ar: 'الأسئلة والأجوبة', en: 'Questions and answers' },
              icon: '❓',
              color: 'purple'
            },
            {
              id: 'gallery',
              name: { ar: 'معرض الصور', en: 'Gallery' },
              description: { ar: 'معرض الصور والفيديو', en: 'Image and video gallery' },
              icon: '🖼️',
              color: 'yellow'
            },
            {
              id: 'stats',
              name: { ar: 'إحصائيات', en: 'Statistics' },
              description: { ar: 'عرض الأرقام والإنجازات', en: 'Display numbers and achievements' },
              icon: '📊',
              color: 'red'
            },
            {
              id: 'features',
              name: { ar: 'المميزات', en: 'Features' },
              description: { ar: 'عرض مميزات الخدمة', en: 'Display service features' },
              icon: '✨',
              color: 'indigo'
            }
          ].map((template) => (
            <div
              key={template.id}
              className="border border-slate-200 rounded-lg p-4 hover:border-tivro-primary transition-colors cursor-pointer"
              onClick={() => addNewSection()}
            >
              <div className="flex items-center gap-3 mb-2">
                <span className="text-2xl">{template.icon}</span>
                <h4 className="font-medium text-slate-900">{template.name[lang]}</h4>
              </div>
              <p className="text-sm text-slate-600 mb-3">{template.description[lang]}</p>
              <button className={`w-full bg-${template.color}-50 text-${template.color}-600 px-3 py-2 rounded text-sm font-medium hover:bg-${template.color}-100`}>
                {lang === 'ar' ? 'إضافة قسم' : 'Add Section'}
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Section Settings */}
      {editingSection && (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-bold text-slate-900">
              {lang === 'ar' ? 'إعدادات القسم' : 'Section Settings'}
            </h3>
            <button
              onClick={() => setEditingSection(null)}
              className="text-slate-400 hover:text-slate-600"
            >
              <X size={20} />
            </button>
          </div>
          <p className="text-slate-600">
            {lang === 'ar' 
              ? 'سيتم إضافة إعدادات تفصيلية للأقسام في التحديث القادم' 
              : 'Detailed section settings will be added in the next update'
            }
          </p>
        </div>
      )}
    </div>
  );
};
