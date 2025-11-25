import { useState, useEffect, useCallback } from 'react';
import { SiteSettings } from '../types';
// REMOVED: import { supabaseAdmin } ... This was the cause of the build error!

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
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchSettings = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/settings/get?t=${Date.now()}`);
      const json = await res.json();
      
      if (json.ok && json.data) {
          // Deep merge to ensure no UI crashes
          const data = json.data;
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
      }
    } catch (err: any) {
      console.error('Fetch error:', err);
      // On error, keep default settings
    } finally {
      setLoading(false);
    }
  }, []);

  const saveSettings = async (newData: SiteSettings) => {
    setSaving(true);
    setError(null);
    try {
        // Flatten structure for API if needed, but passing full object usually works if API expects it
        // We'll pass the structured object and let API/DB handle JSON columns
        
        const res = await fetch('/api/settings/save', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(newData)
        });
        
        const json = await res.json();
        
        if (!res.ok || !json.ok) {
            throw new Error(json.error || 'Save failed');
        }

        await fetchSettings();
        return true;
    } catch (err: any) {
        console.error('Save error:', err);
        setError(err.message);
        return false;
    } finally {
        setSaving(false);
    }
  };

  const restoreDefaultSettings = async () => {
      setSaving(true);
      try {
          const res = await fetch('/api/settings/restore', { method: 'POST' });
          const json = await res.json();
          if (res.ok && json.ok) {
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

  return { settings, setSettings, loading, saving, error, saveSettings, restoreDefaultSettings };
};