import React, { useState, useEffect, useCallback, createContext, useContext } from 'react';
import { SiteSettings } from '../types';
import { settingsService } from '../services/settingsService';

interface SettingsContextType {
  settings: SiteSettings;
  loading: boolean;
  saving: boolean;
  error: string | null;
  hasUnsavedChanges: boolean;
  updateSettings: (newSettings: Partial<SiteSettings>) => void;
  updateField: (field: keyof SiteSettings, value: any) => void;
  saveSettings: () => Promise<boolean>;
  refreshSettings: () => Promise<void>;
  resetChanges: () => void;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export const useSettingsContext = () => {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error('useSettingsContext must be used within a SettingsProvider');
  }
  return context;
};

interface SettingsProviderProps {
  children: ReactNode;
}

export const SettingsProvider: React.FC<SettingsProviderProps> = ({ children }) => {
  const defaultSettings: SiteSettings = {
    siteName: { ar: 'تيفرو', en: 'Tivro' },
    contactEmail: 'info@tivro.sa',
    contactPhone: '+966 50 000 0000',
    address: { ar: 'الرياض', en: 'Riyadh' },
    socialLinks: [
      { platform: 'Twitter', url: '#' },
      { platform: 'Linkedin', url: '#' },
      { platform: 'Instagram', url: '#' }
    ],
    logoUrl: '',
    iconUrl: '',
    footerLogoUrl: '',
    faviconUrl: '',
    sectionTexts: {
      workTitle: { ar: 'قصص نجاح نفخر بها', en: 'Success Stories We Are Proud Of' },
      workSubtitle: { ar: 'أرقام تتحدث عن إنجازاتنا', en: 'Numbers speaking our achievements' }
    },
    homeSections: {
      heroTitle: { ar: 'نحول أفكارك إلى واقع رقمي', en: 'We Turn Your Ideas into Digital Reality' },
      heroSubtitle: { ar: 'وكالة تسويق رقمي متكاملة تقدم حلولاً مبتكرة لنمو عملك', en: 'A full-service digital marketing agency offering innovative solutions for your business growth' },
      servicesTitle: { ar: 'خدماتنا', en: 'Our Services' },
      servicesSubtitle: { ar: 'نقدم حلولاً رقمية متكاملة تنمو مع عملك', en: 'We provide integrated digital solutions that grow with your business' },
      teamTitle: { ar: 'فريقنا', en: 'Our Team' },
      teamSubtitle: { ar: 'نلتقي بفريقنا من الخبراء', en: 'Meet our expert team' },
      packagesTitle: { ar: 'باقاتنا', en: 'Our Packages' },
      contactTitle: { ar: 'تواصل معنا', en: 'Contact Us' },
      contactSubtitle: { ar: 'جاهز لنقل مشروعك للمستوى التالي؟', en: 'Ready to take your business to the next level?' }
    },
    fontSizes: {
      heroTitle: 'text-4xl',
      heroSubtitle: 'text-xl',
      servicesTitle: 'text-3xl',
      servicesSubtitle: 'text-lg',
      teamTitle: 'text-2xl'
    },
    topBanner: { enabled: false, title: { ar: '', en: '' } },
    bottomBanner: { enabled: false, title: { ar: '', en: '' } },
    privacyPolicy: { ar: '', en: '' },
    termsOfService: { ar: '', en: '' }
  };

  const [settings, setSettings] = useState<SiteSettings>(defaultSettings);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [originalSettings, setOriginalSettings] = useState<SiteSettings>(settings);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  // جلب الإعدادات عند تحميل المكون
  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      console.log('🔧 [SettingsContext] Fetching settings...');
      const data = await settingsService.getSettings();
      console.log('✅ [SettingsContext] Settings fetched:', data);
      setSettings(data);
      setOriginalSettings(data);
      setHasUnsavedChanges(false);
    } catch (err: any) {
      console.error('❌ [SettingsContext] Fetch error:', err);
      setError(err.message || 'Failed to fetch settings');
    } finally {
      setLoading(false);
    }
  }, []);

  const saveSettings = useCallback(async () => {
    if (!hasUnsavedChanges) return true;

    setSaving(true);
    setError(null);
    try {
      console.log('💾 [SettingsContext] Saving settings...');
      console.log('📦 [SettingsContext] Settings to save:', settings);
      
      const success = await settingsService.saveSettings(settings);
      
      if (success) {
        console.log('✅ [SettingsContext] Settings saved successfully');
        
        // تحديث originalSettings لمطابقة الإعدادات الحالية
        setOriginalSettings(JSON.parse(JSON.stringify(settings)));
        setHasUnsavedChanges(false);
        
        window.dispatchEvent(new CustomEvent('settingsUpdated', { detail: settings }));
        return true;
      } else {
        throw new Error('Failed to save settings');
      }
    } catch (err: any) {
      console.error('❌ [SettingsContext] Save error:', err);
      setError(err.message || 'Failed to save settings');
      return false;
    } finally {
      setSaving(false);
    }
  }, [hasUnsavedChanges, settings]);

  const updateSettings = useCallback((newSettings: Partial<SiteSettings>) => {
    const updatedSettings = { ...settings, ...newSettings };
    setSettings(updatedSettings);
    setHasUnsavedChanges(JSON.stringify(updatedSettings) !== JSON.stringify(originalSettings));
  }, [settings, originalSettings]);

  const updateField = useCallback((field: keyof SiteSettings, value: any) => {
    const updatedSettings = { ...settings, [field]: value };
    setSettings(updatedSettings);
    setHasUnsavedChanges(JSON.stringify(updatedSettings) !== JSON.stringify(originalSettings));
  }, [settings, originalSettings]);

  const resetChanges = useCallback(() => {
    setSettings(originalSettings);
    setHasUnsavedChanges(false);
    setError(null);
  }, [originalSettings]);

  const refreshSettings = useCallback(async () => {
    await fetchSettings();
  }, [fetchSettings]);

  // الاستماع لتحديثات الإعدادات من مكونات أخرى
  useEffect(() => {
    const handleSettingsUpdate = (event: CustomEvent) => {
      console.log('🔄 [SettingsContext] Settings updated event received:', event.detail);
      setSettings(event.detail);
      setOriginalSettings(event.detail);
      setHasUnsavedChanges(false);
    };

    window.addEventListener('settingsUpdated', handleSettingsUpdate as EventListener);
    
    return () => {
      window.removeEventListener('settingsUpdated', handleSettingsUpdate as EventListener);
    };
  }, []);

  const value: SettingsContextType = {
    settings,
    loading,
    saving,
    error,
    hasUnsavedChanges,
    updateSettings,
    updateField,
    saveSettings,
    refreshSettings,
    resetChanges
  };

  return (
    <SettingsContext.Provider value={value}>
      {children}
    </SettingsContext.Provider>
  );
};
