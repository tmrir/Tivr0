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
  const [settings, setSettings] = useState<SiteSettings>(DEFAULT_SETTINGS);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchSettings = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/settings/get?t=${Date.now()}`);
      let data: any = {};
      if (res.ok) {
          data = await res.json();
      } else {
          // Fallback to DB if API fails
          data = await db.settings.get();
      }

      const merged: SiteSettings = { 
          ...DEFAULT_SETTINGS, 
          ...data,
          siteName: { ...DEFAULT_SETTINGS.siteName, ...(data.site_name || data.siteName || {}) },
          address: { ...DEFAULT_SETTINGS.address, ...(data.address || {}) },
          topBanner: { ...DEFAULT_SETTINGS.topBanner, ...(data.top_banner || data.topBanner || {}) },
          bottomBanner: { ...DEFAULT_SETTINGS.bottomBanner, ...(data.bottom_banner || data.bottomBanner || {}) },
          sectionTexts: { ...DEFAULT_SETTINGS.sectionTexts, ...(data.section_texts || data.sectionTexts || {}) },
          homeSections: { ...DEFAULT_SETTINGS.homeSections, ...(data.home_sections || data.homeSections || {}) },
          privacyPolicy: { ...DEFAULT_SETTINGS.privacyPolicy, ...(data.privacy_policy || data.privacyPolicy || {}) },
          termsOfService: { ...DEFAULT_SETTINGS.termsOfService, ...(data.terms_of_service || data.termsOfService || {}) },
      };
      
      setSettings(merged);
    } catch (err: any) {
      console.error('Settings fetch error:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const saveSettings = async (newData: SiteSettings) => {
    setSaving(true);
    setError(null);
    try {
        // Use direct DB save (client-side authenticated) to bypass API key issues
        const { error: dbError } = await db.settings.save(newData);
        
        if (dbError) throw dbError;

        // Also try API for backup/snapshot
        try {
            fetch('/api/settings/save', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newData)
            }).catch(e => console.warn('API backup failed', e));
        } catch (e) {}
      
        await fetchSettings();
        return true;
    } catch (err: any) {
      console.error('Save Error:', err);
      setError(err.message || 'Failed to save');
      return false;
    } finally {
      setSaving(false);
    }
  };

  const restoreDefaultSettings = async () => {
      setSaving(true); 
      try {
        const res = await fetch('/api/settings/restore', { method: 'POST' });
        if (res.ok) {
            await fetchSettings();
            return true;
        }
        return false;
      } catch (e) {
          return false;
      } finally {
          setSaving(false);
      }
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