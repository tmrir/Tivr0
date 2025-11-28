import { supabaseAdmin } from '../utils/supabase-admin';
import { supabase } from '../supabase';
import { SiteSettings, FontSizeSettings } from '../types';

// Service متخصص للإعدادات فقط
export class SettingsService {
  private static instance: SettingsService;

  static getInstance(): SettingsService {
    if (!SettingsService.instance) {
      SettingsService.instance = new SettingsService();
    }
    return SettingsService.instance;
  }

  // جلب الإعدادات من قاعدة البيانات
  async getSettings(): Promise<SiteSettings> {
    try {
      console.log('🔧 [SettingsService] Fetching settings...');
      
      // استخدام supabase العادي بدلاً من supabaseAdmin للعمل المحلي
      const { data, error } = await supabase
        .from('site_settings')
        .select('*')
        .eq('id', 1)
        .single();

      if (error) {
        console.error('❌ [SettingsService] Fetch error:', error);
        console.log('🔄 [SettingsService] Falling back to localStorage...');
        
        // Fallback to localStorage if Supabase fails
        const localSettings = localStorage.getItem('tivro_settings');
        if (localSettings) {
          console.log('✅ [SettingsService] Loaded from localStorage');
          return JSON.parse(localSettings);
        }
        
        throw new Error(`Failed to fetch settings: ${error.message}`);
      }

      console.log('✅ [SettingsService] Settings fetched from Supabase');
      
      // Save to localStorage as backup
      localStorage.setItem('tivro_settings', JSON.stringify(data));
      
      return this.mapFromDB(data);
    } catch (error) {
      console.error('❌ [SettingsService] Critical error:', error);
      return this.getDefaultSettings();
    }
  }

  // حفظ الإعدادات
  async saveSettings(settings: SiteSettings): Promise<boolean> {
    try {
      console.log('💾 [SettingsService] Saving settings...');
      
      const payload = this.mapToDB(settings);
      console.log('📦 [SettingsService] Payload:', payload);

      // استخدام supabase العادي بدلاً من supabaseAdmin للعمل المحلي
      const { data, error } = await supabase
        .from('site_settings')
        .upsert(payload, { 
          onConflict: 'id',
          ignoreDuplicates: false 
        })
        .select()
        .single();

      if (error) {
        console.error('❌ [SettingsService] Save error:', error);
        console.log('🔄 [SettingsService] Falling back to localStorage...');
        
        // Fallback to localStorage if Supabase fails
        localStorage.setItem('tivro_settings', JSON.stringify(settings));
        console.log('✅ [SettingsService] Saved to localStorage');
        return true;
      }

      console.log('✅ [SettingsService] Settings saved successfully:', data);
      
      // Save to localStorage as backup
      localStorage.setItem('tivro_settings', JSON.stringify(settings));
      
      // التحقق من الحفظ عن طريق قراءة البيانات مرة أخرى
      const { data: verifyData, error: verifyError } = await supabase
        .from('site_settings')
        .select('*')
        .eq('id', 1)
        .single();
        
      if (verifyError) {
        console.error('❌ [SettingsService] Verification error:', verifyError);
      } else {
        console.log('🔍 [SettingsService] Verified saved data:', verifyData);
        console.log('🔍 [SettingsService] site_name in DB:', verifyData.site_name);
        console.log('🔍 [SettingsService] Expected site_name:', payload.site_name);
        
        if (JSON.stringify(verifyData.site_name) !== JSON.stringify(payload.site_name)) {
          console.error('❌ [SettingsService] CRITICAL: Data not saved correctly!');
          console.error('❌ [SettingsService] Expected:', payload.site_name);
          console.error('❌ [SettingsService] Got:', verifyData.site_name);
        } else {
          console.log('✅ [SettingsService] Data verified successfully in DB');
        }
      }
      
      return true;
    } catch (error) {
      console.error('❌ [SettingsService] Critical save error:', error);
      console.log('🔄 [SettingsService] Falling back to localStorage...');
      
      // Fallback to localStorage if everything fails
      localStorage.setItem('tivro_settings', JSON.stringify(settings));
      console.log('✅ [SettingsService] Saved to localStorage as fallback');
      return true;
    }
  }

  // تحويل من قاعدة البيانات إلى الواجهة
  private mapFromDB(row: any): SiteSettings {
    return {
      siteName: row.site_name || { ar: 'تيفرو', en: 'Tivro' },
      contactEmail: row.contact_email || 'info@tivro.sa',
      contactPhone: row.contact_phone || '+966 50 000 0000',
      address: typeof row.address === 'string' 
        ? { ar: row.address, en: row.address } 
        : (row.address || { ar: 'الرياض', en: 'Riyadh' }),
      socialLinks: Array.isArray(row.social_links) ? row.social_links : [],
      logoUrl: row.logo_url || '',
      iconUrl: row.icon_url || '',
      footerLogoUrl: row.footer_logo_url || '',
      faviconUrl: row.favicon_url || '',
      topBanner: row.top_banner || { enabled: false, title: { ar: '', en: '' } },
      bottomBanner: row.bottom_banner || { enabled: false, title: { ar: '', en: '' } },
      sectionTexts: row.section_texts || {
        workTitle: { ar: 'قصص نجاح نفخر بها', en: 'Success Stories We Are Proud Of' },
        workSubtitle: { ar: 'أرقام تتحدث عن إنجازاتنا', en: 'Numbers speaking our achievements' }
      },
      homeSections: row.home_sections || {
        heroTitle: { ar: '🚀 الوكالة الرقمية الأسرع نمواً', en: '🚀 Fastest Growing Digital Agency' },
        heroSubtitle: { ar: 'شريكك الاستراتيجي للنمو الرقمي', en: 'Your Strategic Partner for Digital Growth' },
        servicesTitle: { ar: 'أعمالنا', en: 'Our Work' },
        servicesSubtitle: { ar: 'نحول الأفكار إلى أرقام، ونقود علامتك التجارية نحو الصدارة في السوق السعودي.', en: 'We turn ideas into numbers, leading your brand to the forefront of the Saudi market.' },
        teamTitle: { ar: 'ابدأ رحلة النمو', en: 'Start Your Growth Journey' },
        teamSubtitle: { ar: '', en: '' },
        packagesTitle: { ar: '', en: '' },
        contactTitle: { ar: '', en: '' },
        contactSubtitle: { ar: '', en: '' }
      },
      fontSizes: row.font_sizes || {
        heroTitle: 'text-4xl',
        heroSubtitle: 'text-xl',
        servicesTitle: 'text-3xl',
        servicesSubtitle: 'text-lg',
        teamTitle: 'text-2xl'
      },
      privacyPolicy: row.privacy_policy || { ar: '', en: '' },
      termsOfService: row.terms_of_service || { ar: '', en: '' }
    };
  }

  // تحويل من الواجهة إلى قاعدة البيانات
  private mapToDB(settings: SiteSettings): any {
    return {
      id: 1,
      site_name: settings.siteName,
      contact_email: settings.contactEmail,
      contact_phone: settings.contactPhone,
      address: settings.address,
      social_links: settings.socialLinks,
      logo_url: settings.logoUrl,
      icon_url: settings.iconUrl || '', // تأمين القيمة
      footer_logo_url: settings.footerLogoUrl || '', // تأمين القيمة
      favicon_url: settings.faviconUrl || '', // تأمين القيمة
      top_banner: settings.topBanner,
      bottom_banner: settings.bottomBanner,
      section_texts: settings.sectionTexts,
      home_sections: settings.homeSections,
      font_sizes: settings.fontSizes,
      privacy_policy: settings.privacyPolicy,
      terms_of_service: settings.termsOfService,
      updated_at: new Date().toISOString()
    };
  }

  // إنشاء إعدادات افتراضية
  private async createDefaultSettings(): Promise<SiteSettings> {
    const defaultSettings = this.getDefaultSettings();
    await this.saveSettings(defaultSettings);
    return defaultSettings;
  }

  // الإعدادات الافتراضية
  private getDefaultSettings(): SiteSettings {
    return {
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
      iconUrl: '',
      footerLogoUrl: '',
      faviconUrl: '',
      topBanner: { enabled: false, title: { ar: '', en: '' } },
      bottomBanner: { enabled: false, title: { ar: '', en: '' } },
      sectionTexts: {
        workTitle: { ar: 'قصص نجاح نفخر بها', en: 'Success Stories We Are Proud Of' },
        workSubtitle: { ar: 'أرقام تتحدث عن إنجازاتنا', en: 'Numbers speaking our achievements' }
      },
      homeSections: {
        heroTitle: { ar: '🚀 الوكالة الرقمية الأسرع نمواً', en: '🚀 Fastest Growing Digital Agency' },
        heroSubtitle: { ar: 'شريكك الاستراتيجي للنمو الرقمي', en: 'Your Strategic Partner for Digital Growth' },
        servicesTitle: { ar: 'أعمالنا', en: 'Our Work' },
        servicesSubtitle: { ar: 'نحول الأفكار إلى أرقام، ونقود علامتك التجارية نحو الصدارة في السوق السعودي.', en: 'We turn ideas into numbers, leading your brand to the forefront of the Saudi market.' },
        teamTitle: { ar: 'ابدأ رحلة النمو', en: 'Start Your Growth Journey' },
        teamSubtitle: { ar: '', en: '' },
        packagesTitle: { ar: '', en: '' },
        contactTitle: { ar: '', en: '' },
        contactSubtitle: { ar: '', en: '' }
      },
      fontSizes: {
        heroTitle: 'text-4xl',
        heroSubtitle: 'text-xl',
        servicesTitle: 'text-3xl',
        servicesSubtitle: 'text-lg',
        teamTitle: 'text-2xl'
      },
      privacyPolicy: { ar: '', en: '' },
      termsOfService: { ar: '', en: '' }
    };
  }

  // اختبار الاتصال بقاعدة البيانات
  async testConnection(): Promise<boolean> {
    try {
      // استخدام supabase العادي بدلاً من supabaseAdmin للعمل المحلي
      const { data, error } = await supabase
        .from('site_settings')
        .select('count', { count: 'exact', head: true });
      
      return !error;
    } catch (error) {
      console.error('❌ [SettingsService] Connection test failed:', error);
      return false;
    }
  }
}

// Export singleton instance
export const settingsService = SettingsService.getInstance();
