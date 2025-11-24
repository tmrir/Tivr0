import { useState, useEffect, useCallback } from 'react';
import { SiteSettings } from '../types';
import { db } from '../services/db';

const DEFAULT_SETTINGS: SiteSettings = {
    siteName: { ar: '', en: '' },
    contactEmail: '',
    contactPhone: '',
    address: { ar: '', en: '' },
    socialLinks: [],
    logoUrl: '',
    iconUrl: '',
    footerLogoUrl: '',
    faviconUrl: '',
    topBanner: { enabled: false, title: {ar:'',en:''} },
    bottomBanner: { enabled: false, title: {ar:'',en:''} },
    sectionTexts: { workTitle: {ar:'',en:''}, workSubtitle: {ar:'',en:''} },
    homeSections: {
        heroTitle: {ar:'',en:''}, heroSubtitle: {ar:'',en:''},
        servicesTitle: {ar:'',en:''}, servicesSubtitle: {ar:'',en:''},
        teamTitle: {ar:'',en:''}, teamSubtitle: {ar:'',en:''},
        packagesTitle: {ar:'',en:''},
        contactTitle: {ar:'',en:''}, contactSubtitle: {ar:'',en:''}
    },
    privacyPolicy: { ar: '', en: '' },
    termsOfService: { ar: '', en: '' }
};

export const useSettings = () => {
  const [settings, setSettings] = useState<SiteSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchSettings = useCallback(async () => {
    setLoading(true);
    try {
      const data = await db.settings.get();
      // Merge with default to avoid undefined errors for new fields
      setSettings({ ...DEFAULT_SETTINGS, ...data });
    } catch (err: any) {
      console.error('Error fetching settings:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  const saveSettings = async (newData: SiteSettings) => {
    setSaving(true);
    setError(null);
    try {
      await db.settings.save(newData);
      await fetchSettings();
      return true;
    } catch (err: any) {
      setError(err.message);
      return false;
    } finally {
      setSaving(false);
    }
  };

  const restoreDefaultSettings = async () => {
      const res = await fetch('/api/seed', { method: 'POST' });
      if (res.ok) {
          await fetchSettings();
          return true;
      }
      return false;
  };

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  return {
    settings,
    setSettings,
    loading,
    saving,
    error,
    saveSettings,
    restoreDefaultSettings
  };
};