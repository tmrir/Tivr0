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
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  const saveSettings = async (newData: SiteSettings) => {
    setSaving(true);
    setError(null);
    try {
        // Ensure we send flat fields for the API to map correctly to DB columns
        const social_facebook = newData.socialLinks.find(l => l.platform.includes('Facebook'))?.url || '';
        const social_twitter = newData.socialLinks.find(l => l.platform.includes('Twitter'))?.url || '';
        const social_instagram = newData.socialLinks.find(l => l.platform.includes('Instagram'))?.url || '';

        const payload = {
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
            
            // These objects map directly to JSONB columns
            top_banner: newData.topBanner,
            bottom_banner: newData.bottomBanner,
            section_texts: newData.sectionTexts,
            home_sections: newData.homeSections,
            privacy_policy: newData.privacyPolicy,
            terms_of_service: newData.termsOfService
        };

      console.log('Sending Save Payload:', payload);

      const res = await fetch('/api/settings/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      
      if (!res.ok) {
          const errData = await res.json();
          throw new Error(errData.error || 'Failed to save settings');
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