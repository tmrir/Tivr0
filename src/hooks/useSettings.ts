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
  // NEVER allow null. Always start with defaults.
  const [settings, setSettings] = useState<SiteSettings>(DEFAULT_SETTINGS);
  const [loading, setLoading] = useState(true); // Keep loading true initially
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchSettings = useCallback(async () => {
    setLoading(true);
    try {
      // Attempt fetch
      const res = await fetch(`/api/settings/get?t=${Date.now()}`);
      
      let data: any = {};
      if (res.ok) {
          data = await res.json();
      } else {
          console.warn('API fetch failed, trying DB fallback');
          data = await db.settings.get();
      }

      // Robust Merge
      const merged: SiteSettings = { 
          ...DEFAULT_SETTINGS, 
          ...data,
          // Ensure sub-objects are merged safely
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
      console.error('Error fetching settings:', err);
      // Don't set error state that blocks UI, just log it.
      // The UI will show DEFAULT_SETTINGS, which is better than a crash.
    } finally {
      setLoading(false);
    }
  }, []);

  const saveSettings = async (newData: SiteSettings) => {
    setSaving(true);
    setError(null);
    try {
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
          throw new Error('Failed to save settings');
      }
      
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
    settings, // Guaranteed to be non-null
    setSettings,
    loading,
    saving,
    error,
    saveSettings,
    restoreDefaultSettings
  };
};