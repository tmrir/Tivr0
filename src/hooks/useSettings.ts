
import { useState, useEffect, useCallback } from 'react';

export interface SettingsData {
  contact_email: string;
  contact_phone: string;
  social_facebook: string;
  social_twitter: string;
  social_instagram: string;
  address: string;
  logo_url: string;
  icon_url: string;
}

export const useSettings = () => {
  const [settings, setSettings] = useState<SettingsData>({
    contact_email: '',
    contact_phone: '',
    social_facebook: '',
    social_twitter: '',
    social_instagram: '',
    address: '',
    logo_url: '',
    icon_url: ''
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // دالة جلب البيانات
  const fetchSettings = useCallback(async () => {
    setLoading(true);
    try {
      // إضافة timestamp لمنع الكاش من المتصفح
      const res = await fetch(`/api/settings/get?t=${Date.now()}`);
      const data = await res.json();
      if (res.ok && data) {
        setSettings({
            contact_email: data.contact_email || '',
            contact_phone: data.contact_phone || '',
            social_facebook: data.social_facebook || '',
            social_twitter: data.social_twitter || '',
            social_instagram: data.social_instagram || '',
            address: data.address || '',
            logo_url: data.logo_url || '',
            icon_url: data.icon_url || '',
        });
      } else {
        throw new Error(data.error || 'Failed to fetch');
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  // دالة الحفظ
  const saveSettings = async (newData: SettingsData) => {
    setSaving(true);
    setError(null);
    try {
      const res = await fetch('/api/settings/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newData),
      });
      const result = await res.json();
      if (!res.ok) throw new Error(result.error);
      
      // تحديث الحالة المحلية بالبيانات الجديدة المؤكدة من السيرفر
      await fetchSettings();
      return true;
    } catch (err: any) {
      setError(err.message);
      return false;
    } finally {
      setSaving(false);
    }
  };

  // دالة الاستعادة
  const restoreDefault = async () => {
    setSaving(true);
    try {
      const res = await fetch('/api/settings/restore', { method: 'POST' });
      const result = await res.json();
      if (!res.ok) throw new Error(result.error);
      
      await fetchSettings(); // تحديث الواجهة بالبيانات المستعادة
      return true;
    } catch (err: any) {
      setError(err.message);
      return false;
    } finally {
      setSaving(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  return { settings, loading, saving, error, saveSettings, restoreDefault, setSettings };
};
