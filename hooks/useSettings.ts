import { useState, useEffect, useCallback } from 'react';
import { SiteSettings } from '../types';

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
      
      if (!json.ok) throw new Error(json.error || 'Failed to fetch settings');

      // Deep merge with defaults to prevent undefined errors
      const data = json.data || {};
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
      setError(null);
    } catch (err: any) {
      console.error('Settings Fetch Error:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  const saveSettings = async (newData: SiteSettings) => {
    setSaving(true);
    setError(null);
    try {
        // Prepare flat payload for DB columns
        const payload = {
            site_name: newData.siteName,
            contact_email: newData.contactEmail,
            contact_phone: newData.contactPhone,
            address: newData.address,
            logo_url: newData.logoUrl,
            icon_url: newData.iconUrl,
            footer_logo_url: newData.footerLogoUrl,
            favicon_url: newData.faviconUrl,
            social_links: newData.socialLinks, // Send as array directly
            top_banner: newData.topBanner,
            bottom_banner: newData.bottomBanner,
            section_texts: newData.sectionTexts,
            home_sections: newData.homeSections,
            privacy_policy: newData.privacyPolicy,
            terms_of_service: newData.termsOfService
        };

      const res = await fetch('/api/settings/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      
      const json = await res.json();

      if (!res.ok || !json.ok) {
          throw new Error(json.error || 'Failed to save settings');
      }
      
      // Refresh state with server response
      await fetchSettings();
      return true;
    } catch (err: any) {
      console.error('Settings Save Error:', err);
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
        
        if (!res.ok || !json.ok) {
            throw new Error(json.error || 'Failed to restore');
        }
        
        await fetchSettings();
        return true;
      } catch (e: any) {
          setError(e.message);
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