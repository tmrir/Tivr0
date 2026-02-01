
import { supabase } from '../services/supabase';
import { SiteSettings, FontSizeSettings } from '../types';
import { defaultSettings, mergeWithDefaults, validateSettings } from '../defaultSettings';

// Service متخصص للإعدادات فقط
export class SettingsService {
  private static instance: SettingsService;

  private inFlightGet: Promise<SiteSettings> | null = null;

  private static readonly SETTINGS_CACHE_KEY = 'tivro_settings';
  private static readonly SETTINGS_CACHE_TS_KEY = 'tivro_settings_timestamp';
  private static readonly SETTINGS_CACHE_TTL_MS = 24 * 60 * 60 * 1000;

  private static readonly EXTENSION_KEYS = {
    adminNavigation: '__tivro_admin_navigation',
    customPages: '__tivro_custom_pages',
    contactUs: '__tivro_contact_us'
  } as const;

  private coerceJsonObject(value: any): Record<string, any> {
    if (value && typeof value === 'object' && !Array.isArray(value)) return value as Record<string, any>;
    if (typeof value === 'string') {
      try {
        const parsed = JSON.parse(value);
        if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) return parsed as Record<string, any>;
      } catch {
        // ignore
      }
    }
    return {};
  }

  private stableStringify(value: any): string {
    const seen = new WeakSet();
    const normalize = (v: any): any => {
      if (v === null || v === undefined) return v;
      if (typeof v !== 'object') return v;
      if (seen.has(v)) return undefined;
      seen.add(v);

      if (Array.isArray(v)) return v.map(normalize);
      const keys = Object.keys(v).sort();
      const out: any = {};
      for (const k of keys) out[k] = normalize(v[k]);
      return out;
    };

    return JSON.stringify(normalize(value));
  }

  static getInstance(): SettingsService {
    if (!SettingsService.instance) {
      SettingsService.instance = new SettingsService();
    }
    return SettingsService.instance;
  }

  // جلب الإعدادات مع التوحيد الكامل
  async getSettings(): Promise<SiteSettings> {
    if (this.inFlightGet) return this.inFlightGet;

    this.inFlightGet = (async () => {
      try {
        // 24h cache policy: prefer last known good settings to prevent any UI flicker.
        // We only refetch from Supabase when cache is missing or older than TTL.
        const cachedRaw = localStorage.getItem(SettingsService.SETTINGS_CACHE_KEY);
        const cachedTsRaw = localStorage.getItem(SettingsService.SETTINGS_CACHE_TS_KEY);
        const cachedTs = cachedTsRaw ? Number(cachedTsRaw) : 0;
        const cacheFresh = !!cachedRaw && Number.isFinite(cachedTs) && cachedTs > 0 && (Date.now() - cachedTs) < SettingsService.SETTINGS_CACHE_TTL_MS;

        if (cacheFresh) {
          try {
            const parsed = JSON.parse(cachedRaw as string);
            const validated = validateSettings(parsed);
            // console.log('✅ [SettingsService] Using cached settings (<24h)');
            return validated;
          } catch {
            // ignore invalid cache and continue to Supabase
          }
        }

        // console.log('🔧 [SettingsService] Fetching settings with unified structure...');

        // أولاً، جلب من Supabase مع دمج مع الإعدادات الافتراضية
        const { data, error } = await supabase
          .from('site_settings')
          .select('*')
          .eq('id', 1)
          .single();

        if (error) {
          console.error('❌ [SettingsService] Supabase fetch error:', error);
          // console.log('🔄 [SettingsService] Falling back to localStorage/default settings');

          // محاولة التحميل من localStorage كخيار احتياطي
          const localSettings = localStorage.getItem(SettingsService.SETTINGS_CACHE_KEY);
          if (localSettings) {
            try {
              const parsed = JSON.parse(localSettings);
              const validated = validateSettings(parsed);
              // console.log('✅ [SettingsService] Loaded and validated from localStorage (fallback)');
              return validated;
            } catch (parseError) {
              console.error('❌ [SettingsService] LocalStorage parse error in fallback:', parseError);
            }
          }

          // في حال فشل Supabase و localStorage، نعود للافتراضي (بدون الكتابة إلى localStorage لتجنب فلاش بيانات قديمة)
          return defaultSettings;
        }

        // console.log('✅ [SettingsService] Settings fetched from Supabase');

        // تحويل بيانات Supabase (snake_case) إلى SiteSettings (camelCase) ثم دمجها مع الافتراضيات والتحقق منها
        const mappedFromDB = this.mapFromDB(data);
        console.log('[SettingsService] mappedFromDB customPages count:', (mappedFromDB as any)?.customPages?.length);
        const validated = validateSettings(mappedFromDB);
        console.log('[SettingsService] validated customPages count:', (validated as any)?.customPages?.length);

        // حفظ البيانات المدمجة في localStorage (cache only)
        localStorage.setItem(SettingsService.SETTINGS_CACHE_KEY, JSON.stringify(validated));
        localStorage.setItem(SettingsService.SETTINGS_CACHE_TS_KEY, Date.now().toString());

        // console.log('🔗 [SettingsService] Merged Supabase data with defaults');
        return validated;
      } catch (error) {
        console.error('❌ [SettingsService] Critical error:', error);
        // console.log('🔄 [SettingsService] Using default settings as final fallback');
        return defaultSettings;
      } finally {
        this.inFlightGet = null;
      }
    })();

    return this.inFlightGet;
  }

  // حفظ الإعدادات مع التوحيد الكامل
  async saveSettings(settings: SiteSettings): Promise<boolean> {
    try {
      // console.log('💾 [SettingsService] Saving unified settings...');

      // التحقق من صحة الإعدادات ودمجها مع الافتراضيات
      const validated = validateSettings(settings);
      // console.log('📦 [SettingsService] Validated settings:', validated);

      // أولاً، احفظ في localStorage دائماً
      localStorage.setItem(SettingsService.SETTINGS_CACHE_KEY, JSON.stringify(validated));
      localStorage.setItem(SettingsService.SETTINGS_CACHE_TS_KEY, Date.now().toString());
      // console.log('✅ [SettingsService] Saved to localStorage immediately');

      // Ensure subsequent getSettings() calls will serve this latest value immediately
      this.inFlightGet = null;
      
      // Clear localStorage cache timestamp to force fresh fetch on next read
      localStorage.removeItem(SettingsService.SETTINGS_CACHE_TS_KEY);

      // ثانياً، حاول الحفظ في Supabase
      const payload = this.mapToDB(validated);
      const upsertOnce = async (dataToSave: any) => {
        return await supabase
          .from('site_settings')
          .upsert(dataToSave, {
            onConflict: 'id',
            ignoreDuplicates: false
          })
          .select()
          .single();
      };

      let workingPayload: any = { ...(payload as any) };
      let { data, error } = await upsertOnce(workingPayload);

      let safety = 0;
      while (error && (error as any).code === 'PGRST204' && safety < 25) {
        const message = (error as any).message || '';
        const match = message.match(/Could not find the '([^']+)' column/i);
        const missingColumn = match?.[1];
        if (!missingColumn || !Object.prototype.hasOwnProperty.call(workingPayload, missingColumn)) {
          break;
        }

        console.warn(`⚠️ [SettingsService] Missing column '${missingColumn}' in Supabase schema. Retrying save without it...`);
        delete workingPayload[missingColumn];
        ({ data, error } = await upsertOnce(workingPayload));
        safety += 1;
      }

      if (error) {
        console.error('❌ [SettingsService] Supabase save error:', error);
        // Restore cache timestamp since save failed
        localStorage.setItem(SettingsService.SETTINGS_CACHE_TS_KEY, Date.now().toString());
        // console.log('⚠️ [SettingsService] Data saved to localStorage only (Supabase failed)');
        // نُرجع فشل لأن البيانات لم تُحفظ بشكل عام (DB)
        return false;
      }

      // Save successful - ensure cache stays cleared for fresh reads
      localStorage.removeItem(SettingsService.SETTINGS_CACHE_TS_KEY);
      this.inFlightGet = null;

      // console.log('✅ [SettingsService] Settings saved to Supabase successfully:', data);

      // Verify persistence: refetch and ensure key fields match what we attempted to save
      try {
        const { data: verifyRow, error: verifyError } = await supabase
          .from('site_settings')
          .select('id, updated_at, section_texts')
          .eq('id', 1)
          .single();

        if (verifyError) {
          console.error('❌ [SettingsService] Verification fetch failed after save:', verifyError);
          return false;
        }

        const expectedAdminNav = Array.isArray(validated.adminNavigation) ? validated.adminNavigation : [];
        const expectedCustomPages = Array.isArray(validated.customPages) ? validated.customPages : [];
        
        console.log('[SettingsService] Verification - Expected customPages:', expectedCustomPages.length);

        const sectionTexts = this.coerceJsonObject((verifyRow as any)?.section_texts);
        
        console.log('[SettingsService] Verification - section_texts keys:', Object.keys(sectionTexts));

        const dbAdminNav = Array.isArray(sectionTexts[SettingsService.EXTENSION_KEYS.adminNavigation])
          ? sectionTexts[SettingsService.EXTENSION_KEYS.adminNavigation]
          : [];
        const dbCustomPages = Array.isArray(sectionTexts[SettingsService.EXTENSION_KEYS.customPages])
          ? sectionTexts[SettingsService.EXTENSION_KEYS.customPages]
          : [];
          
        console.log('[SettingsService] Verification - DB customPages:', dbCustomPages.length);

        const sameAdminNav = this.stableStringify(dbAdminNav) === this.stableStringify(expectedAdminNav);
        const sameCustomPages = this.stableStringify(dbCustomPages) === this.stableStringify(expectedCustomPages);
        
        console.log('[SettingsService] Verification - sameCustomPages:', sameCustomPages);

        if (!sameAdminNav || !sameCustomPages) {
          console.error('❌ [SettingsService] Save verification failed: DB does not reflect saved values.');
          console.log('   expected.customPages.length:', expectedCustomPages.length);
          console.log('   db.__tivro_custom_pages.length:', dbCustomPages.length);
          return false;
        }
      } catch (e) {
        console.error('❌ [SettingsService] Verification exception after save:', e);
        return false;
      }

      // console.log('🔗 [SettingsService] Data synchronized between localStorage and Supabase');
      return true;
    } catch (error) {
      console.error('❌ [SettingsService] Critical save error:', error);
      // console.log('🔄 [SettingsService] Falling back to localStorage...');

      // الحل النهائي: localStorage مع التحقق
      const validated = validateSettings(settings);
      localStorage.setItem('tivro_settings', JSON.stringify(validated));
      localStorage.setItem('tivro_settings_timestamp', Date.now().toString());
      // console.log('✅ [SettingsService] Saved to localStorage as fallback');
      return false;
    }
  }

  // تحويل من قاعدة البيانات إلى الواجهة
  private mapFromDB(row: any): SiteSettings {
    const sectionTextsObj = this.coerceJsonObject(row?.section_texts);
    const extAdminNav = sectionTextsObj[SettingsService.EXTENSION_KEYS.adminNavigation];
    const extCustomPages = sectionTextsObj[SettingsService.EXTENSION_KEYS.customPages];
    const extContactUs = sectionTextsObj[SettingsService.EXTENSION_KEYS.contactUs];

    return {
      siteName: row.site_name || { ar: 'تيفرو', en: 'Tivro' },
      contactEmail: row.contact_email || 'info@tivro.sa',
      contactPhone: row.contact_phone || '+966 50 000 0000',
      address: typeof row.address === 'string'
        ? { ar: row.address, en: row.address }
        : (row.address || { ar: 'الرياض', en: 'Riyadh' }),
      socialLinks: Array.isArray(row.social_links) ? row.social_links : [],
      enableEnglish: row.enable_english ?? true,
      tabTitle: row.tab_title || { ar: 'تيفرو - وكالة تسويق رقمي', en: 'Tivro - Digital Marketing Agency' },
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
      contactUs:
        (extContactUs && typeof extContactUs === 'object' ? extContactUs : null) ||
        row.contact_us ||
        defaultSettings.contactUs,
      // استرجاع إعدادات الفوتر المخزنة داخل section_texts في قاعدة البيانات
      footerDescription: (row.section_texts && row.section_texts.footerDescription) || defaultSettings.footerDescription,
      copyrightText: (row.section_texts && row.section_texts.copyrightText) || defaultSettings.copyrightText,
      footerLinks: (row.section_texts && row.section_texts.footerLinks) || defaultSettings.footerLinks,
      privacyPolicy: row.privacy_policy || { ar: '', en: '' },
      termsOfService: row.terms_of_service || { ar: '', en: '' },
      customPages: Array.isArray(extCustomPages)
        ? extCustomPages
        : (Array.isArray(row.custom_pages) ? row.custom_pages : []),
      adminNavigation: Array.isArray(extAdminNav)
        ? extAdminNav
        : (Array.isArray(row.admin_navigation) ? row.admin_navigation : [])
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
      enable_english: settings.enableEnglish,
      tab_title: settings.tabTitle,
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
        // Extensions (fallback persistence when dedicated columns are missing)
        [SettingsService.EXTENSION_KEYS.adminNavigation]: Array.isArray(settings.adminNavigation) ? settings.adminNavigation : [],
        [SettingsService.EXTENSION_KEYS.customPages]: Array.isArray(settings.customPages) ? settings.customPages : [],
        [SettingsService.EXTENSION_KEYS.contactUs]: settings.contactUs,
      },
      home_sections: settings.homeSections,
      // Dedicated columns if present in schema (will be automatically stripped if missing)
      contact_us: settings.contactUs,
      privacy_policy: settings.privacyPolicy,
      terms_of_service: settings.termsOfService,
      custom_pages: Array.isArray(settings.customPages) ? settings.customPages : [],
      admin_navigation: Array.isArray(settings.adminNavigation) ? settings.adminNavigation : [],
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
      enableEnglish: true,
      tabTitle: { ar: 'تيفرو - وكالة تسويق رقمي', en: 'Tivro - Digital Marketing Agency' },
      logoUrl: '',
      iconUrl: '',
      footerLogoUrl: '',
      faviconUrl: '',
      topBanner: { enabled: false, title: { ar: '', en: '' } },
      bottomBanner: { enabled: false, title: { ar: '', en: '' } },
      sectionTexts: {
        workTitle: { ar: 'قصص نجاح نفخر بها', en: 'Success Stories We Are Proud Of' },
        workSubtitle: { ar: 'أرقام تتحدث عن إنجازاتنا', en: 'Numbers speaking our achievements' },
        privacyLink: { ar: 'سياسة الخصوصية', en: 'Privacy Policy' },
        termsLink: { ar: 'شروط الخدمة', en: 'Terms of Service' }
      },
      homeSections: {
        heroBadge: { ar: '🚀 الوكالة الرقمية الأسرع نمواً', en: '🚀 Fastest Growing Digital Agency' },
        heroTitle: { ar: '🚀 الوكالة الرقمية الأسرع نمواً', en: '🚀 Fastest Growing Digital Agency' },
        heroSubtitle: { ar: 'شريكك الاستراتيجي للنمو الرقمي', en: 'Your Strategic Partner for Digital Growth' },
        heroButtonsEnabled: true,
        heroStatsEnabled: true,
        heroPrimaryCta: { label: { ar: 'ابدأ رحلة النمو', en: 'Start Growth Journey' }, href: '#contact' },
        heroSecondaryCta: { label: { ar: 'أعمالنا', en: 'Our Work' }, href: '#work' },
        heroStats: [
          { value: '+150%', label: { ar: 'متوسط نمو العملاء', en: 'Avg Client Growth' } },
          { value: '+50', label: { ar: 'عميل سعيد', en: 'Happy Client' } },
          { value: '24/7', label: { ar: 'دعم فني', en: 'Support' } }
        ],
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
      contactUs: defaultSettings.contactUs,
      footerDescription: defaultSettings.footerDescription,
      copyrightText: defaultSettings.copyrightText,
      footerLinks: defaultSettings.footerLinks,
      privacyPolicy: { ar: '', en: '' },
      termsOfService: { ar: '', en: '' },
      customPages: [],
      adminNavigation: []
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
