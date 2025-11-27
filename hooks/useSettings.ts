import { useState, useEffect } from 'react';
import { db } from '../services/db';
import { SiteSettings } from '../types';

// Default settings fallback
const DEFAULT_SETTINGS: SiteSettings = {
  siteName: { ar: 'تيفرو', en: 'Tivro' },
  contactEmail: 'info@tivro.sa',
  contactPhone: '+966 50 000 0000',
  address: { ar: 'الرياض', en: 'Riyadh' },
  socialLinks: [
    { platform: 'Twitter', url: '#' },
    { platform: 'Linkedin', url: '#' },
    { platform: 'Instagram', url: '#' }
  ],
  logoUrl: '',
  footerLogoUrl: '',
  faviconUrl: '',
  iconUrl: '',
  topBanner: { enabled: false, title: { ar: '', en: '' } },
  bottomBanner: { enabled: false, title: { ar: '', en: '' } },
  sectionTexts: {
    workTitle: { ar: 'قصص نجاح نفخر بها', en: 'Success Stories We Are Proud Of' },
    workSubtitle: { ar: 'أرقام تتحدث عن إنجازاتنا', en: 'Numbers speaking our achievements' }
  },
  homeSections: {
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
  privacyPolicy: { ar: '', en: '' },
  termsOfService: { ar: '', en: '' }
};

export function useSettings() {
  const [settings, setSettings] = useState<SiteSettings>(DEFAULT_SETTINGS);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Test database connection
  const testConnection = async () => {
    try {
      console.log('🔍 Testing database connection...');
      const { supabase } = await import('../services/supabase');
      const { data, error } = await supabase.from('site_settings').select('count', { count: 'exact', head: true });
      console.log('🔍 Connection test result:', { data, error });
      return !error;
    } catch (err) {
      console.error('🔍 Connection test failed:', err);
      return false;
    }
  };

  // Test simple database operation
  const testSimpleSave = async () => {
    try {
      console.log('🧪 Testing simple database save...');
      const { supabase } = await import('../services/supabase');
      
      // Try to update just one field
      const testPayload = {
        id: 1,
        contact_email: 'test@example.com'
      };
      
      const result = await supabase.from('site_settings').upsert(testPayload);
      console.log('🧪 Simple save result:', result);
      
      if (result.error) {
        console.error('🧪 Simple save failed:', result.error);
        return false;
      }
      
      // Read it back
      const { data } = await supabase.from('site_settings').select('contact_email').eq('id', 1).single();
      console.log('🧪 Read back result:', data);
      
      return data?.contact_email === 'test@example.com';
    } catch (err) {
      console.error('🧪 Simple test failed:', err);
      return false;
    }
  };

  async function fetchSettings() {
    setLoading(true);
    setError(null);
    try {
      console.log('🔧 [Hook] Fetching settings from database...');
      const data = await db.settings.get();
      console.log('📋 [Hook] Settings received:', data);
      console.log('📋 [Hook] Settings JSON:', JSON.stringify(data, null, 2));
      
      // If database returns null/undefined, use default settings
      if (data) {
        setSettings(data);
        console.log('✅ [Hook] Settings applied to state');
      } else {
        console.log('⚠️ [Hook] No settings found, using defaults');
        setSettings(DEFAULT_SETTINGS);
      }
    } catch (err: any) {
      console.error('❌ [Hook] Fetch Settings Error:', err);
      setError(err.message || 'Unknown error');
      // On error, still provide default settings
      setSettings(DEFAULT_SETTINGS);
    } finally {
      setLoading(false);
    }
  }

  async function saveSettings(payload: Partial<SiteSettings>) {
    setLoading(true);
    setError(null);
    try {
      console.log('💾 [Hook] Saving settings:', payload);
      
      // Create a complete settings object
      const fullSettings = { ...settings, ...payload } as SiteSettings;
      console.log('💾 [Hook] Full settings to save:', fullSettings);
      
      // Save to database
      const result = await db.settings.save(fullSettings);
      console.log('✅ [Hook] Database save result:', result);
      
      // Check if there was an error in the result
      if (result && result.error) {
        throw new Error(`Database error: ${result.error.message}`);
      }
      
      // Update local state
      console.log('🔄 [Hook] Updating local state');
      setSettings(fullSettings);
      
      // Verify the save by reading back from database
      setTimeout(async () => {
        try {
          const verifiedSettings = await db.settings.get();
          console.log('📋 [Hook] Verified settings from DB:', verifiedSettings);
          if (JSON.stringify(verifiedSettings) !== JSON.stringify(fullSettings)) {
            console.error('❌ [Hook] Data mismatch! Expected:', fullSettings, 'Got:', verifiedSettings);
          } else {
            console.log('✅ [Hook] Data verified successfully');
          }
        } catch (err) {
          console.error('❌ [Hook] Verification failed:', err);
        }
      }, 1000);
      
      return true;
    } catch (err: any) {
      console.error('❌ [Hook] Save Settings Error:', err);
      setError(err.message || 'Unknown error');
      return false;
    } finally {
      setLoading(false);
    }
  }

  async function restoreSettings() {
    setLoading(true);
    setError(null);
    try {
      // This would need to be implemented in the db service
      // For now, we'll just re-fetch current settings
      await fetchSettings();
      return true;
    } catch (err: any) {
      console.error('❌ [Hook] Restore Settings Error:', err);
      setError(err.message || 'Unknown error');
      return false;
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchSettings();
  }, []);

  return { settings, setSettings, loading, saving: loading, error, fetchSettings, saveSettings, restoreSettings, testConnection, testSimpleSave };
}