import { supabaseAdmin } from '../utils/supabase-admin';
import { supabase } from '../services/supabase';
import { SiteSettings, FontSizeSettings } from '../types';
import { defaultSettings, mergeWithDefaults, validateSettings } from '../defaultSettings';

// Service متخصص للإعدادات فقط
export class SettingsService {
  private static instance: SettingsService;

  static getInstance(): SettingsService {
    if (!SettingsService.instance) {
      SettingsService.instance = new SettingsService();
    }
    return SettingsService.instance;
  }

  // جلب الإعدادات مع التوحيد الكامل
  async getSettings(): Promise<SiteSettings> {
    try {
      console.log('🔧 [SettingsService] Fetching settings with unified structure...');
      
      // أولاً، جلب من Supabase مع دمج مع الإعدادات الافتراضية
      const { data, error } = await supabase
        .from('site_settings')
        .select('*')
        .eq('id', 1)
        .single();

      if (error) {
        console.error('❌ [SettingsService] Supabase fetch error:', error);
        console.log('🔄 [SettingsService] Falling back to localStorage/default settings');

        // محاولة التحميل من localStorage كخيار احتياطي
        const localSettings = localStorage.getItem('tivro_settings');
        if (localSettings) {
          try {
            const parsed = JSON.parse(localSettings);
            const validated = validateSettings(parsed);
            console.log('✅ [SettingsService] Loaded and validated from localStorage (fallback)');
            return validated;
          } catch (parseError) {
            console.error('❌ [SettingsService] LocalStorage parse error in fallback:', parseError);
          }
        }

        // في حال فشل Supabase و localStorage، نعود للافتراضي
        localStorage.setItem('tivro_settings', JSON.stringify(defaultSettings));
        localStorage.setItem('tivro_settings_timestamp', Date.now().toString());
        return defaultSettings;
      }

      console.log('✅ [SettingsService] Settings fetched from Supabase');
      
      // تحويل بيانات Supabase (snake_case) إلى SiteSettings (camelCase) ثم دمجها مع الافتراضيات والتحقق منها
      const mappedFromDB = this.mapFromDB(data);
      const validated = validateSettings(mappedFromDB);
      
      // حفظ البيانات المدمجة في localStorage
      localStorage.setItem('tivro_settings', JSON.stringify(validated));
      localStorage.setItem('tivro_settings_timestamp', Date.now().toString());
      
      console.log('🔗 [SettingsService] Merged Supabase data with defaults');
      return validated;
    } catch (error) {
      console.error('❌ [SettingsService] Critical error:', error);
      console.log('🔄 [SettingsService] Using default settings as final fallback');
      
      // الحل النهائي: الإعدادات الافتراضية
      localStorage.setItem('tivro_settings', JSON.stringify(defaultSettings));
      localStorage.setItem('tivro_settings_timestamp', Date.now().toString());
      
      return defaultSettings;
    }
  }

  // حفظ الإعدادات مع التوحيد الكامل
  async saveSettings(settings: SiteSettings): Promise<boolean> {
    try {
      console.log('💾 [SettingsService] Saving unified settings...');
      
      // التحقق من صحة الإعدادات ودمجها مع الافتراضيات
      const validated = validateSettings(settings);
      console.log('📦 [SettingsService] Validated settings:', validated);

      // أولاً، احفظ في localStorage دائماً
      localStorage.setItem('tivro_settings', JSON.stringify(validated));
      localStorage.setItem('tivro_settings_timestamp', Date.now().toString());
      console.log('✅ [SettingsService] Saved to localStorage immediately');

      // ثانياً، حاول الحفظ في Supabase
      const payload = this.mapToDB(validated);
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
        console.log('⚠️ [SettingsService] Data saved to localStorage only (Supabase failed)');
        // نرجع "false" حتى تعرف الواجهة أن الحفظ لم يصل لقاعدة البيانات
        return false;
      }

      console.log('✅ [SettingsService] Settings saved to Supabase successfully:', data);
      console.log('🔗 [SettingsService] Data synchronized between localStorage and Supabase');
      
      return true;
    } catch (error) {
      console.error('❌ [SettingsService] Critical save error:', error);
      console.log('🔄 [SettingsService] Falling back to localStorage...');
      
      // الحل النهائي: localStorage مع التحقق
      const validated = validateSettings(settings);
      localStorage.setItem('tivro_settings', JSON.stringify(validated));
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
      // استرجاع إعدادات الفوتر المخزنة داخل section_texts في قاعدة البيانات
      footerDescription: (row.section_texts && row.section_texts.footerDescription) || defaultSettings.footerDescription,
      copyrightText: (row.section_texts && row.section_texts.copyrightText) || defaultSettings.copyrightText,
      footerLinks: (row.section_texts && row.section_texts.footerLinks) || defaultSettings.footerLinks,
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
      // نخزن إعدادات الفوتر داخل حقل section_texts كـ JSON إضافي
      section_texts: {
        ...settings.sectionTexts,
        footerDescription: settings.footerDescription,
        copyrightText: settings.copyrightText,
        footerLinks: settings.footerLinks,
      },
      home_sections: settings.homeSections,
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
