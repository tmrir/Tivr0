import { useState, useEffect, useCallback } from 'react';
import { SiteSettings } from '../types';
import { db } from '../services/db';

const DEFAULT_SETTINGS: SiteSettings = {
    siteName: { ar: '', en: '' },
    contactEmail: '',
    contactPhone: '',
    address: { ar: '', en: '' },
    socialLinks: [],
    
    // Logos & Branding
    logoUrl: '',
    iconUrl: '',
    footerLogoUrl: '',
    faviconUrl: '',

    // Banners
    topBanner: { enabled: false, title: {ar:'',en:''} },
    bottomBanner: { enabled: false, title: {ar:'',en:''} },

    // Sections
    sectionTexts: { workTitle: {ar:'',en:''}, workSubtitle: {ar:'',en:''} },
    homeSections: {
        heroTitle: {ar:'',en:''}, heroSubtitle: {ar:'',en:''},
        servicesTitle: {ar:'',en:''}, servicesSubtitle: {ar:'',en:''},
        teamTitle: {ar:'',en:''}, teamSubtitle: {ar:'',en:''},
        packagesTitle: {ar:'',en:''},
        contactTitle: {ar:'',en:''}, contactSubtitle: {ar:'',en:''}
    },

    // Legal
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
      // Try API first
      const res = await fetch(`/api/settings/get?t=${Date.now()}`);
      
      let data = {};
      if (res.ok) {
          data = await res.json();
      } else {
          console.warn('API fetch failed, trying direct DB fallback');
          // Fallback to DB service if API fails
          data = await db.settings.get();
      }

      // Robust Merge: Combine defaults with fetched data
      // This ensures NO field is undefined, preventing white screen
      const merged = { 
          ...DEFAULT_SETTINGS, 
          ...data,
          // Deep merge objects
          homeSections: { ...DEFAULT_SETTINGS.homeSections, ...(data.home_sections || {}) },
          sectionTexts: { ...DEFAULT_SETTINGS.sectionTexts, ...(data.section_texts || {}) },
          topBanner: { ...DEFAULT_SETTINGS.topBanner, ...(data.top_banner || {}) },
          bottomBanner: { ...DEFAULT_SETTINGS.bottomBanner, ...(data.bottom_banner || {}) },
          siteName: { ...DEFAULT_SETTINGS.siteName, ...(data.site_name || {}) },
          address: { ...DEFAULT_SETTINGS.address, ...(data.address || {}) },
          privacyPolicy: { ...DEFAULT_SETTINGS.privacyPolicy, ...(data.privacy_policy || {}) },
          termsOfService: { ...DEFAULT_SETTINGS.termsOfService, ...(data.terms_of_service || {}) },
      };
      
      setSettings(merged);
      setError(null);

    } catch (err: any) {
      console.error('Error fetching settings:', err);
      setError(err.message);
      // Even on error, set default settings so the UI shows up
      setSettings(DEFAULT_SETTINGS);
    } finally {
      setLoading(false);
    }
  }, []);

  const saveSettings = async (newData: SiteSettings) => {
    setSaving(true);
    setError(null);
    try {
        // Flatten payload for API
        const social_facebook = newData.socialLinks.find(l => l.platform.includes('Facebook'))?.url || '';
        const social_twitter = newData.socialLinks.find(l => l.platform.includes('Twitter'))?.url || '';
        const social_instagram = newData.socialLinks.find(l => l.platform.includes('Instagram'))?.url || '';

        const flatPayload = {
            site_name: newData.siteName,
            contact_email: newData.contactEmail,
            contact_phone: newData.contactPhone,
            address: newData.address,
            logo_url: newData.logoUrl,
            icon_url: newData.iconUrl,
            footer_logo_url: newData.footerLogoUrl,
            favicon_url: newData.faviconUrl,
            social_facebook, 
            social_twitter, 
            social_instagram,
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
        body: JSON.stringify(flatPayload),
      });
      
      if (!res.ok) {
          const err = await res.json();
          throw new Error(err.error || 'Failed to save settings');
      }
      
      await fetchSettings();
      return true;
    } catch (err: any) {
      console.error('Save Error:', err);
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