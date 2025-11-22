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
    contact_email: '', contact_phone: '', social_facebook: '', social_twitter: '',
    social_instagram: '', address: '', logo_url: '', icon_url: ''
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchSettings = useCallback(async () => {
    setLoading(true);
    try {
      // Cache busting using timestamp
      const res = await fetch(`/api/settings/get?t=${Date.now()}`);
      const json = await res.json();

      if (!res.ok) throw new Error(json.error || 'Failed to fetch');
      
      // Mapping API response to state
      if (Object.keys(json).length > 0) {
          setSettings({
            contact_email: json.contact_email || '',
            contact_phone: json.contact_phone || '',
            social_facebook: json.social_facebook || '',
            social_twitter: json.social_twitter || '',
            social_instagram: json.social_instagram || '',
            address: json.address || '',
            logo_url: json.logo_url || '',
            icon_url: json.icon_url || '',
          });
      }
    } catch (err: any) {
      console.error('Hook Error:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  const saveSettings = async (newData: SettingsData) => {
    setSaving(true);
    setError(null);
    try {
      console.log('Sending data to save:', newData);
      const res = await fetch('/api/settings/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newData),
      });
      const json = await res.json();

      if (!res.ok) throw new Error(json.error || 'Failed to save');

      // Re-fetch to ensure we have the server's version
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
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Failed to restore');
      
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