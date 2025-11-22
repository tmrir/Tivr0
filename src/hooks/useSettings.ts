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
    contact_email: '', contact_phone: '', social_facebook: '', 
    social_twitter: '', social_instagram: '', address: '', 
    logo_url: '', icon_url: ''
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchSettings = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/settings/get?t=${Date.now()}`);
      const data = await res.json();
      if (res.ok) setSettings(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  const saveSettings = async (newData: SettingsData) => {
    setSaving(true);
    setError(null);
    try {
      const res = await fetch('/api/settings/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newData),
      });
      if (!res.ok) throw new Error('Failed to save');
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
      if (!res.ok) throw new Error('Failed to restore');
      await fetchSettings();
      return true;
    } catch (err: any) {
      setError(err.message);
      return false;
    } finally {
      setSaving(false);
    }
  };

  useEffect(() => { fetchSettings(); }, [fetchSettings]);

  return { settings, setSettings, loading, saving, error, saveSettings, restoreDefaultSettings };
};