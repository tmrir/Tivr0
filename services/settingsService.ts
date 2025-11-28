import { supabaseAdmin } from '../utils/supabase-admin';
import { supabase } from '../services/supabase';
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
      
      // أولاً، تحقق من localStorage أولاً (للأسبقية)
      const localSettings = localStorage.getItem('tivro_settings');
      const localTimestamp = localStorage.getItem('tivro_settings_timestamp');
      
      if (localSettings && localTimestamp) {
        const localAge = Date.now() - parseInt(localTimestamp);
        const localAgeMinutes = localAge / (1000 * 60);
        
        console.log(`📱 [SettingsService] Found localStorage data, age: ${localAgeMinutes.toFixed(1)} minutes`);
        
        // إذا كانت بيانات localStorage أحدث من 5 دقائق، استخدمها مباشرة
        if (localAgeMinutes < 5) {
          console.log('✅ [SettingsService] Using fresh localStorage data');
          return JSON.parse(localSettings);
        }
        
        // إذا كانت أقدم، جرب Supabase ولكن احتفظ بالبيانات المحلية كـ backup
        console.log('🔄 [SettingsService] LocalStorage data is old, trying Supabase...');
      }
      
      // ثانياً، جلب من Supabase
      const { data, error } = await supabase
        .from('site_settings')
        .select('*')
        .eq('id', 1)
        .single();

      if (error) {
        console.error('❌ [SettingsService] Supabase fetch error:', error);
        
        // إذا فشل Supabase، استخدم localStorage
        if (localSettings) {
          console.log('✅ [SettingsService] Fallback to localStorage');
          return JSON.parse(localSettings);
        }
        
        throw new Error(`Failed to fetch settings: ${error.message}`);
      }

      console.log('✅ [SettingsService] Settings fetched from Supabase');
      
      // قارن الطوابع الزمنية لتحديد الأحدث
      const dbTimestamp = data.updated_at ? new Date(data.updated_at).getTime() : 0;
      const localTime = localTimestamp ? parseInt(localTimestamp) : 0;
      
      if (localSettings && localTime > dbTimestamp) {
        console.log('🔄 [SettingsService] LocalStorage data is newer than DB, using localStorage');
        return JSON.parse(localSettings);
      }
      
      console.log('📊 [SettingsService] Using Supabase data (newer or same age)');
      
      // حفظ بيانات Supabase في localStorage كـ backup
      localStorage.setItem('tivro_settings', JSON.stringify(data));
      localStorage.setItem('tivro_settings_timestamp', Date.now().toString());
      
      return this.mapFromDB(data);
    } catch (error) {
      console.error('❌ [SettingsService] Critical error:', error);
      console.log('🔄 [SettingsService] Final fallback to localStorage...');
      
      // الحل النهائي: localStorage
      const localSettings = localStorage.getItem('tivro_settings');
      if (localSettings) {
        console.log('✅ [SettingsService] Loaded from localStorage as final fallback');
        return JSON.parse(localSettings);
      }
      
      console.log('🔄 [SettingsService] Using default settings...');
      return this.getDefaultSettings();
    }
  }

  // حفظ الإعدادات
  async saveSettings(settings: SiteSettings): Promise<boolean> {
    try {
      console.log('💾 [SettingsService] Saving settings...');
      
      const payload = this.mapToDB(settings);
      console.log('📦 [SettingsService] Payload:', payload);

      // أولاً، احفظ في localStorage دائماً (لضمان عدم ضياع البيانات)
      localStorage.setItem('tivro_settings', JSON.stringify(settings));
      localStorage.setItem('tivro_settings_timestamp', Date.now().toString());
      console.log('✅ [SettingsService] Saved to localStorage immediately');

      // ثانياً، حاول الحفظ في Supabase
      const { data, error } = await supabase
        .from('site_settings')
        .upsert(payload, { 
          onConflict: 'id',
          ignoreDuplicates: false 
        })
        .select()
        .single();

      if (error) {
        console.error('❌ [SettingsService] Supabase save error:', error);
        console.log('✅ [SettingsService] Data saved to localStorage only (Supabase failed)');
        return true; // نعتبره نجاح لأن localStorage تم حفظه
      }

      console.log('✅ [SettingsService] Settings saved to Supabase successfully:', data);
      
      // التحقق من الحفظ عن طريق قراءة البيانات مرة أخرى
      const { data: verifyData, error: verifyError } = await supabase
        .from('site_settings')
        .select('*')
        .eq('id', 1)
        .single();
        
      if (verifyError) {
        console.error('❌ [SettingsService] Verification error:', verifyError);
        console.log('⚠️ [SettingsService] Could not verify Supabase save, but localStorage has data');
      } else {
        console.log('🔍 [SettingsService] Verified saved data in Supabase:', verifyData);
        console.log('✅ [SettingsService] Data saved and verified in both localStorage and Supabase');
      }
      
      return true;
    } catch (error) {
      console.error('❌ [SettingsService] Critical save error:', error);
      console.log('🔄 [SettingsService] Falling back to localStorage...');
      
      // الحل النهائي: localStorage فقط
      localStorage.setItem('tivro_settings', JSON.stringify(settings));
      localStorage.setItem('tivro_settings_timestamp', Date.now().toString());
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
