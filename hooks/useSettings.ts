import { useState, useEffect } from 'react';
import { SiteSettings, LocalizedString } from '../types';

// Mobile Storage Helper
const mobileStorageHelper = {
  isAvailable: () => {
    try {
      const test = '__storage_test__';
      localStorage.setItem(test, test);
      localStorage.removeItem(test);
      return true;
    } catch {
      return false;
    }
  },

  getItem: (key: string) => {
    try {
      if (mobileStorageHelper.isAvailable()) {
        return localStorage.getItem(key);
      }
      return sessionStorage.getItem(key);
    } catch {
      return null;
    }
  },

  setItem: (key: string, value: string) => {
    try {
      if (mobileStorageHelper.isAvailable()) {
        localStorage.setItem(key, value);
        return true;
      }
      sessionStorage.setItem(key, value);
      return true;
    } catch {
      return false;
    }
  },

  removeItem: (key: string) => {
    try {
      if (mobileStorageHelper.isAvailable()) {
        localStorage.removeItem(key);
      } else {
        sessionStorage.removeItem(key);
      }
      return true;
    } catch {
      return false;
    }
  }
};

// Default settings fallback
const DEFAULT_SETTINGS: SiteSettings = {
  siteName: { ar: '', en: '' },
  contactEmail: '',
  contactPhone: '',
  address: { ar: '', en: '' },
  socialLinks: [],
  logoUrl: '',
  footerLogoUrl: '',
  faviconUrl: '',
  iconUrl: '',
  topBanner: { enabled: false, title: { ar: '', en: '' } },
  bottomBanner: { enabled: false, title: { ar: '', en: '' } },
  sectionTexts: {
    workTitle: { ar: '', en: '' },
    workSubtitle: { ar: '', en: '' },
    privacyLink: { ar: '', en: '' },
    termsLink: { ar: '', en: '' }
  },
  homeSections: {
    heroBadge: { ar: '', en: '' },
    heroTitle: { ar: '', en: '' },
    heroSubtitle: { ar: '', en: '' },
    servicesTitle: { ar: '', en: '' },
    servicesSubtitle: { ar: '', en: '' },
    teamTitle: { ar: '', en: '' },
    teamSubtitle: { ar: '', en: '' },
    packagesTitle: { ar: '', en: '' },
    contactTitle: { ar: '', en: '' },
    contactSubtitle: { ar: '', en: '' }
  },
  fontSizes: {
    heroTitle: '',
    heroSubtitle: '',
    servicesTitle: '',
    servicesSubtitle: '',
    teamTitle: ''
  },
  contactUs: {
    title: { ar: '', en: '' },
    subtitle: { ar: '', en: '' },
    email: '',
    phone: '',
    address: { ar: '', en: '' }
  },
  footerDescription: { ar: '', en: '' },
  copyrightText: { ar: '', en: '' },
  footerLinks: {
    privacy: { ar: '', en: '' },
    terms: { ar: '', en: '' }
  },
  privacyPolicy: { ar: '', en: '' },
  termsOfService: { ar: '', en: '' }
};

// نسخة التطبيق الحالية للتعامل مع النسخ القديمة في الجوال
const APP_VERSION = '1.0.0';

export function useSettings() {
  const [settings, setSettings] = useState<SiteSettings>(DEFAULT_SETTINGS);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function fetchSettings() {
    setLoading(true);
    setError(null);

    try {
      const url = `/api/settings/get?t=${Date.now()}`;
      const res = await fetch(url, { cache: 'no-store' });

      const contentType = res.headers.get('content-type') || '';
      if (!contentType.includes('application/json')) {
        throw new Error('Invalid response from server');
      }

      const json = await res.json();
      if (!json.ok) throw new Error(json.error || 'Failed to fetch settings');

      mobileStorageHelper.setItem('app_settings_cache', JSON.stringify(json.data));
      setSettings(json.data);

    } catch (err: any) {
      console.error('❌ [Hook] Fetch Settings Error:', err);
      setError(err.message || 'Unknown error');

      // fallback to last known cache
      const cached = mobileStorageHelper.getItem('app_settings_cache');
      if (cached) {
        setSettings(JSON.parse(cached));
      }

    } finally {
      setLoading(false);
    }
  }

  async function saveSettings(payload: Partial<SiteSettings>) {
    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/settings/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        cache: 'no-store'
      });

      const contentType = res.headers.get('content-type') || '';
      if (!contentType.includes('application/json')) {
        throw new Error('Invalid response from server');
      }

      const json = await res.json();
      if (!json.ok) throw new Error(json.error || 'Failed to save settings');

      mobileStorageHelper.setItem('app_settings_cache', JSON.stringify(json.data));
      setSettings(json.data);

      // إعادة الجلب من السيرفر لضمان التزامن الكامل
      await fetchSettings();

    } catch (err: any) {
      console.error('❌ [Hook] Save Settings Error:', err);
      setError(err.message || 'Unknown error');
    } finally {
      setLoading(false);
    }
  }

  async function restoreSettings() {
    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/settings/restore', { method: 'POST', cache: 'no-store' });

      const contentType = res.headers.get('content-type') || '';
      if (!contentType.includes('application/json')) {
        throw new Error('Invalid response from server');
      }

      const json = await res.json();
      if (!json.ok) throw new Error(json.error || 'Failed to restore settings');

      mobileStorageHelper.setItem('app_settings_cache', JSON.stringify(json.data));
      setSettings(json.data);

      // إعادة الجلب من السيرفر لضمان التزامن الكامل
      await fetchSettings();

    } catch (err: any) {
      console.error('❌ [Hook] Restore Settings Error:', err);
      setError(err.message || 'Unknown error');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    // Clear old cache if app version changed
    const storedVersion = mobileStorageHelper.getItem('app_version');
    if (storedVersion !== APP_VERSION) {
      mobileStorageHelper.removeItem('app_settings_cache');
      mobileStorageHelper.setItem('app_version', APP_VERSION);
    }

    fetchSettings();
  }, []);

  return { settings, loading, error, fetchSettings, saveSettings, restoreSettings };
}
