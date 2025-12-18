import React, { useEffect, useMemo, useState } from 'react';
import { useApp } from '../context/AppContext';
import { CustomPage, PageComponent } from '../types';
import { db } from '../services/db';

type PagesPlacement = NonNullable<CustomPage['placement']>;

interface PagesRendererProps {
  placement: PagesPlacement;
}

export const PagesRenderer: React.FC<PagesRendererProps> = ({ placement }) => {
  const { lang } = useApp();
  const [pages, setPages] = useState<CustomPage[]>([]);

  // السبب الفعلي لعدم ظهور الصفحات سابقاً: Home كان يعتمد على displayLocation (غير محفوظ من PageManager) لذلك كانت الفلترة تُرجع 0 صفحات.
  const normalizePages = (input: any[]): { pages: CustomPage[]; didMigrate: boolean } => {
    const mapLegacyLocationToPlacement = (legacy?: string): CustomPage['placement'] | undefined => {
      if (!legacy) return undefined;
      const normalized = legacy.trim();

      // Legacy strings were kebab-case and sometimes represented more positions than the new enum.
      // We map them to the closest supported placement so old saved data still renders.
      switch (normalized) {
        case 'after-header':
          return 'after_header';
        case 'after-services':
          return 'after_services';
        case 'after-team':
          return 'after_team';
        case 'after-work':
          return 'after_work';
        case 'before-footer':
          return 'before_footer';

        // Older locations no longer exist; map them to the nearest supported one.
        case 'before-packages':
          return 'before_packages';
        case 'before-work':
          return 'before_work';
        default:
          return undefined;
      }
    };

    let didMigrate = false;
    const migrated = (input || []).map((p) => {
      const anyP: any = p;
      const currentPlacement = anyP.placement as string | undefined;
      const currentLegacy = anyP.displayLocation as string | undefined;

      // Normalize placement if it was stored in kebab-case.
      const normalizedPlacement = typeof currentPlacement === 'string'
        ? currentPlacement.replace(/-/g, '_')
        : undefined;

      const derivedPlacement = normalizedPlacement || mapLegacyLocationToPlacement(currentLegacy);

      if (derivedPlacement && derivedPlacement !== currentPlacement) {
        didMigrate = true;
        return { ...anyP, placement: derivedPlacement };
      }

      return anyP;
    });

    return { pages: migrated as CustomPage[], didMigrate };
  };

  const loadPages = async () => {
    try {
      const settings = await db.settings.get();
      const fromSettings = (settings as any)?.customPages;
      if (Array.isArray(fromSettings)) {
        const { pages: normalized, didMigrate } = normalizePages(fromSettings as any[]);
        setPages(normalized);
        try {
          localStorage.setItem('customPages', JSON.stringify(normalized));
          if (didMigrate) {
            const merged = { ...(settings as any), customPages: normalized };
            await db.settings.save(merged as any);
          }
        } catch {
          // ignore persistence failures
        }
        return;
      }
    } catch {
      // ignore
    }

    // No localStorage fallback as a source of truth (prevents stale pages flash / re-add)
    setPages([]);
  };

  useEffect(() => {
    loadPages();

    const onStorage = (e: StorageEvent) => {
      if (!e.key || e.key === 'customPages') {
        loadPages();
      }
    };

    const onCustom = () => loadPages();

    window.addEventListener('storage', onStorage);
    window.addEventListener('customPagesUpdated', onCustom as EventListener);

    return () => {
      window.removeEventListener('storage', onStorage);
      window.removeEventListener('customPagesUpdated', onCustom as EventListener);
    };
  }, []);

  const filtered = useMemo(() => {
    return pages
      .filter((p: any) => {
        const visible = typeof p.visible === 'boolean' ? p.visible : !!p.isVisible;
        const pPlacement = (p.placement as PagesPlacement | undefined) || undefined;
        return visible && pPlacement === placement;
      })
      .sort((a: any, b: any) => {
        const ao = typeof a.order === 'number' ? a.order : (typeof a.navigationOrder === 'number' ? a.navigationOrder : 0);
        const bo = typeof b.order === 'number' ? b.order : (typeof b.navigationOrder === 'number' ? b.navigationOrder : 0);
        return ao - bo;
      });
  }, [pages, placement]);

  const sanitizeHtml = (input: string) => {
    return input
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
      .replace(/\son\w+\s*=\s*"[^"]*"/gi, '')
      .replace(/\son\w+\s*=\s*'[^']*'/gi, '')
      .replace(/\son\w+\s*=\s*[^\s>]+/gi, '');
  };

  const scrollToHash = (hash: string) => {
    const targetId = hash.replace(/^#/, '');
    if (!targetId) return;
    const target = document.getElementById(targetId);
    if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const renderUnderConstruction = (page: any) => {
    const label = (page?.underConstructionButton?.label?.[lang] || page?.underConstructionButton?.label?.ar || page?.underConstructionButton?.label?.en) as string | undefined;
    const href = page?.underConstructionButton?.href as string | undefined;
    const buttonLabel = label || (lang === 'ar' ? 'قريباً' : 'Coming Soon');
    const title = (page as any).title?.[lang] || page.name;
    const desc = (page as any).description?.[lang];
    const kicker = lang === 'ar' ? 'قيد التطوير' : 'In Development';
    const heading = lang === 'ar' ? 'شيء قوي قادم قريباً' : 'Something powerful is coming soon';
    const body = desc || (lang === 'ar'
      ? 'نجهّز تجربة جديدة بتفاصيل أدقّ وأثر أكبر. ترقّب الإطلاق قريباً.'
      : 'We’re crafting a new experience with sharper details and bigger impact. Stay tuned for launch.');
    return (
      <div className="relative overflow-hidden rounded-3xl border border-slate-200 bg-slate-950 text-white">
        <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-slate-950 to-emerald-950/60" />

        <div className="absolute -top-24 -right-24 h-64 w-64 rounded-full bg-tivro-primary/20 blur-3xl" />
        <div className="absolute -bottom-24 -left-24 h-64 w-64 rounded-full bg-blue-500/10 blur-3xl" />
        <div className="absolute inset-0 opacity-30" style={{
          backgroundImage:
            'radial-gradient(circle at 1px 1px, rgba(255,255,255,0.12) 1px, transparent 0)',
          backgroundSize: '26px 26px'
        }} />

        <div className="relative container mx-auto px-4 md:px-8 py-14 md:py-20">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-4 py-2 text-sm font-bold">
              <span className="h-2 w-2 rounded-full bg-tivro-primary shadow-[0_0_0_3px_rgba(16,185,129,0.15)]" />
              {kicker}
            </div>

            <h2 className="mt-8 text-3xl md:text-5xl font-extrabold tracking-tight">
              {heading}
            </h2>
            <p className="mt-4 text-base md:text-lg text-slate-200/90 leading-relaxed">
              {body}
            </p>

            <div className="mt-10 rounded-2xl border border-white/10 bg-white/5 p-6 md:p-8">
              <div className="text-sm font-bold text-slate-200/90">
                {lang === 'ar' ? 'الصفحة' : 'Page'}
              </div>
              <div className="mt-2 text-2xl md:text-3xl font-extrabold">
                {title}
              </div>

              {href ? (
                <div className="mt-6 flex justify-center">
                  <button
                    onClick={() => {
                      if (!href) return;
                      if (href.startsWith('#')) {
                        scrollToHash(href);
                        return;
                      }
                      window.open(href, '_blank');
                    }}
                    className="bg-tivro-primary hover:bg-emerald-500 text-white px-8 py-4 rounded-full font-bold text-lg transition transform hover:-translate-y-1 shadow-lg shadow-tivro-primary/30"
                  >
                    {buttonLabel}
                  </button>
                </div>
              ) : (
                <div className="mt-6 text-sm text-slate-200/70">
                  {lang === 'ar' ? 'تابعنا قريباً للمزيد.' : 'Check back soon for more.'}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

  if (filtered.length === 0) return null;

  const renderComponent = (component: PageComponent, ctx?: { isHero?: boolean }) => {
    if ((component as any).isVisible === false) return null;
    const isHero = !!ctx?.isHero;

    switch (component.type) {
      case 'text':
        {
          const value = ((component as any).content?.text?.[lang] || '') as string;
          const looksLikeHtml = /<\/?[a-z][\s\S]*>/i.test(value);
          return (
            <div className="max-w-4xl mx-auto">
              {looksLikeHtml ? (
                <div
                  className={isHero ? 'text-lg leading-relaxed' : 'text-lg text-slate-700 leading-relaxed'}
                  dangerouslySetInnerHTML={{ __html: sanitizeHtml(value) }}
                />
              ) : (
                <p className={isHero ? 'text-lg leading-relaxed' : 'text-lg text-slate-700 leading-relaxed'}>{value}</p>
              )}
            </div>
          );
        }

      case 'image': {
        const src = (component as any).content?.src || (component as any).content?.url;
        const alt = (component as any).content?.alt?.[lang] || '';
        if (!src) return null;
        return (
          <div className="max-w-4xl mx-auto">
            <img src={src} alt={alt} className="w-full h-auto rounded-xl" />
          </div>
        );
      }

      case 'video': {
        const src = (component as any).content?.src;
        const poster = (component as any).content?.poster;
        const autoplay = !!(component as any).content?.autoplay;
        if (!src) return null;
        return (
          <div className="max-w-4xl mx-auto">
            <video src={src} poster={poster} controls autoPlay={autoplay} className="w-full rounded-xl" />
          </div>
        );
      }

      case 'button': {
        const text = (component as any).content?.text?.[lang];
        const href = (component as any).content?.href;
        const style = (component as any).content?.style || 'primary';
        const bgColor = (component as any).content?.bgColor as string | undefined;
        const textColor = (component as any).content?.textColor as string | undefined;
        const borderColor = (component as any).content?.borderColor as string | undefined;
        if (!text) return null;

        const className =
          style === 'secondary'
            ? 'bg-white/10 hover:bg-white/20 backdrop-blur text-white'
            : style === 'outline'
              ? 'bg-transparent border border-slate-300 text-slate-700 hover:bg-slate-50'
              : 'bg-tivro-primary text-white hover:bg-emerald-500';

        return (
          <div className="text-center">
            <button
              onClick={() => {
                if (!href) return;
                if (href.startsWith('#')) {
                  scrollToHash(href);
                  return;
                }
                window.open(href, '_blank');
              }}
              style={{
                backgroundColor: bgColor,
                color: textColor,
                borderColor: borderColor
              }}
              className={`px-8 py-4 rounded-full font-bold text-lg transition transform hover:-translate-y-1 shadow-lg flex items-center justify-center gap-2 ${className} ${borderColor ? 'border' : ''}`}
            >
              {text}
            </button>
          </div>
        );
      }

      case 'link': {
        const text = (component as any).content?.text?.[lang];
        const href = (component as any).content?.href;
        const target = (component as any).content?.target || '_blank';
        if (!text || !href) return null;
        return (
          <div className="text-center">
            <a
              href={href}
              target={target}
              rel={target === '_blank' ? 'noreferrer' : undefined}
              className="inline-block px-8 py-4 rounded-lg font-medium text-lg transition border border-slate-300 text-slate-700 hover:bg-slate-50"
            >
              {text}
            </a>
          </div>
        );
      }

      case 'html': {
        const html = (component as any).content?.html;
        if (!html) return null;
        return <div className="prose prose-lg max-w-none" dangerouslySetInnerHTML={{ __html: html }} />;
      }

      default:
        return null;
    }
  };

  return (
    <>
      {filtered.map((page) => (
        <section
          key={page.id}
          id={(page as any).slug ? `page-${(page as any).slug}` : undefined}
          className={((page as any).sectionVariant || 'default') === 'hero' ? 'relative overflow-hidden pt-20 pb-24' : 'py-16 bg-white'}
          style={((page as any).sectionVariant || 'default') === 'hero' ? {
            backgroundColor: (page as any).heroSettings?.backgroundColor || '#0f172a',
            color: (page as any).heroSettings?.textColor || '#ffffff',
            backgroundImage: ((page as any).heroSettings?.imagePosition === 'background' && (page.components || []).find((c: any) => c.type === 'image' && c.isVisible !== false)?.content?.src)
              ? `url(${(page.components || []).find((c: any) => c.type === 'image' && c.isVisible !== false)?.content?.src})`
              : undefined,
            backgroundSize: ((page as any).heroSettings?.imagePosition === 'background') ? 'cover' : undefined,
            backgroundPosition: ((page as any).heroSettings?.imagePosition === 'background') ? 'center' : undefined
          } : undefined}
        >
          {((page as any).sectionVariant || 'default') === 'hero' && (
            <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-tivro-primary/20 to-transparent pointer-events-none" />
          )}

          <div className={`container mx-auto px-4 md:px-8 ${((page as any).sectionVariant || 'default') === 'hero' ? 'relative z-10' : ''}`}>
            {!!(page as any).underConstruction ? (
              renderUnderConstruction(page)
            ) : (((page as any).sectionVariant || 'default') === 'hero' ? (() => {
              const heroSettings = (page as any).heroSettings || {};
              const imagePosition = heroSettings.imagePosition || 'right';
              const all = (page.components || []).slice().sort((a: any, b: any) => (a.orderIndex ?? 0) - (b.orderIndex ?? 0));
              const images = all.filter((c: any) => c.type === 'image' && c.isVisible !== false);
              const heroImage = images[0] as any;
              const nonImage = all.filter((c: any) => c.type !== 'image');
              const buttons = nonImage.filter((c: any) => c.type === 'button');
              const contentComponents = nonImage.filter((c: any) => c.type !== 'button');

              const textBoxStyle: React.CSSProperties = {
                backgroundColor: heroSettings.textBoxBackgroundColor || 'rgba(15, 23, 42, 0.4)'
              };

              const ImageBlock = () => {
                if (!heroImage) return null;
                const src = heroImage.content?.src || heroImage.content?.url;
                const alt = heroImage.content?.alt?.[lang] || '';
                if (!src) return null;
                return (
                  <div className="w-full">
                    <img src={src} alt={alt} className="w-full h-auto rounded-2xl shadow-2xl" />
                  </div>
                );
              };

              const TextBox = () => (
                <div className="w-full rounded-2xl border border-white/10 p-6 md:p-10 backdrop-blur" style={textBoxStyle}>
                  <div className="mb-6">
                    <h2 className="text-4xl md:text-6xl font-bold leading-tight">
                      {(page as any).title?.[lang] || page.name}
                    </h2>
                    {(page as any).description?.[lang] && (
                      <p className="mt-6 text-lg md:text-xl opacity-90 leading-relaxed max-w-2xl">
                        {(page as any).description?.[lang]}
                      </p>
                    )}
                  </div>

                  <div className="space-y-6">
                    {contentComponents.map((component: any) => (
                      <div key={component.id} className="text-start">
                        {renderComponent(component, { isHero: true })}
                      </div>
                    ))}
                  </div>

                  {buttons.length > 0 && (
                    <div className="mt-8 flex flex-col sm:flex-row gap-4">
                      {buttons.map((component: any) => (
                        <div key={component.id} className="text-start">
                          {renderComponent(component, { isHero: true })}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );

              if (imagePosition === 'top') {
                return (
                  <div className="space-y-8">
                    <ImageBlock />
                    <TextBox />
                  </div>
                );
              }

              if (imagePosition === 'bottom') {
                return (
                  <div className="space-y-8">
                    <TextBox />
                    <ImageBlock />
                  </div>
                );
              }

              if (imagePosition === 'left') {
                return (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
                    <ImageBlock />
                    <TextBox />
                  </div>
                );
              }

              if (imagePosition === 'right') {
                return (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
                    <TextBox />
                    <ImageBlock />
                  </div>
                );
              }

              // background
              return (
                <div className="max-w-5xl">
                  <TextBox />
                </div>
              );
            })() : (
              <>
                <div className="text-center mb-12">
                  <h2 className="text-3xl md:text-4xl font-bold text-tivro-dark mb-4">{(page as any).title?.[lang] || page.name}</h2>
                  {(page as any).description?.[lang] && (
                    <p className="text-slate-500 max-w-2xl mx-auto">{(page as any).description?.[lang]}</p>
                  )}
                </div>

                <div className="space-y-8">
                  {(page.components || [])
                    .slice()
                    .sort((a: any, b: any) => (a.orderIndex ?? 0) - (b.orderIndex ?? 0))
                    .map((component) => (
                      <div key={component.id} className="text-center">
                        {renderComponent(component, { isHero: false })}
                      </div>
                    ))}
                </div>
              </>
            ))}
          </div>
        </section>
      ))}
    </>
  );
};
