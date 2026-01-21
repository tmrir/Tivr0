import React, { useEffect, useMemo, useState } from 'react';
import { useApp } from '../context/AppContext';
import { Layout } from '../components/Layout';
import { db } from '../services/db';
import { CustomPage, PageComponent } from '../types';
import { Loader2 } from 'lucide-react';

interface CustomPageStandaloneProps {
  slug: string;
}

export const CustomPageStandalone: React.FC<CustomPageStandaloneProps> = ({ slug }) => {
  const { lang } = useApp();
  const [loading, setLoading] = useState(true);
  const [pages, setPages] = useState<CustomPage[]>([]);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      try {
        const settings = await db.settings.get();
        const fromSettings = (settings as any)?.customPages;
        if (!cancelled) setPages(Array.isArray(fromSettings) ? (fromSettings as CustomPage[]) : []);
      } catch {
        if (!cancelled) setPages([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    load();
    return () => {
      cancelled = true;
    };
  }, []);

  const page = useMemo(() => {
    const normalizedSlug = String(slug || '').trim().toLowerCase();
    return (pages || []).find((p: any) => String(p?.slug || '').trim().toLowerCase() === normalizedSlug) as any;
  }, [pages, slug]);

  const buildSafeSrcDoc = (raw: string) => {
    const html = String(raw || '');
    const trimmed = html.trim();
    if (!trimmed) return '<!doctype html><html><head><meta charset="utf-8" /></head><body></body></html>';
    if (/<html[\s>]/i.test(trimmed)) return trimmed;
    return `<!doctype html><html><head><meta charset="utf-8" /></head><body>${trimmed}</body></html>`;
  };

  const hexToRgba = (hex: string, opacity01: number) => {
    const h = (hex || '').trim();
    let full = h;
    if (full.startsWith('#') && full.length === 4) {
      full = `#${full[1]}${full[1]}${full[2]}${full[2]}${full[3]}${full[3]}`;
    }
    const a = Math.max(0, Math.min(1, opacity01));
    if (!full.startsWith('#') || full.length !== 7) {
      return `rgba(0,0,0,${a})`;
    }
    const r = parseInt(full.slice(1, 3), 16);
    const g = parseInt(full.slice(3, 5), 16);
    const b = parseInt(full.slice(5, 7), 16);
    return `rgba(${r}, ${g}, ${b}, ${a})`;
  };

  const sanitizeHtml = (input: string) => {
    if (typeof window === 'undefined') return input;
    const parser = new DOMParser();
    const doc = parser.parseFromString(input, 'text/html');

    const dangerousTags = ['script', 'iframe', 'object', 'embed', 'link', 'style'];
    const isDangerousUrl = (value: string) => {
      const v = String(value || '').trim().toLowerCase();
      return v.startsWith('javascript:') || v.startsWith('data:') || v.startsWith('vbscript:');
    };

    dangerousTags.forEach(tag => {
      doc.querySelectorAll(tag).forEach(el => el.remove());
    });

    doc.querySelectorAll('*').forEach(el => {
      Array.from(el.attributes).forEach(attr => {
        const name = attr.name.toLowerCase();
        const value = attr.value;
        if (name.startsWith('on')) {
          el.removeAttribute(attr.name);
          return;
        }
        if ((name === 'href' || name === 'src' || name === 'xlink:href' || name === 'action' || name === 'formaction') && isDangerousUrl(value)) {
          el.removeAttribute(attr.name);
        }
      });
    });

    return doc.body.innerHTML;
  };

  const scrollToHash = (hash: string) => {
    const targetId = hash.replace(/^#/, '');
    if (!targetId) return;
    const target = document.getElementById(targetId);
    if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const formatUrlForDisplay = (raw: string, maxLen = 28) => {
    const v = String(raw || '').trim();
    if (!v) return v;
    if (v.length <= maxLen) return v;

    try {
      const hasScheme = /^https?:\/\//i.test(v);
      const u = new URL(hasScheme ? v : `https://${v}`);
      const host = u.hostname.replace(/^www\./i, '');
      const path = (u.pathname || '').replace(/\/$/, '');

      if (host === 'drive.google.com') {
        return 'tivro.sa/profile';
      }

      const short = `${host}${path}`;
      if (short.length <= maxLen) return short;
      return `${short.slice(0, Math.max(0, maxLen - 1))}…`;
    } catch {
      return `${v.slice(0, Math.max(0, maxLen - 1))}…`;
    }
  };

  const looksLikeUrl = (v: string) => {
    const s = String(v || '').trim();
    if (!s) return false;
    if (/^https?:\/\//i.test(s)) return true;
    if (/^[a-z0-9-]+(\.[a-z0-9-]+)+\//i.test(s)) return true;
    return false;
  };

  const renderComponent = (component: PageComponent, ctx?: { isHero?: boolean }) => {
    if ((component as any).isVisible === false) return null;
    const isHero = !!ctx?.isHero;

    switch (component.type) {
      case 'text': {
        const value = ((component as any).content?.text?.[lang] || '') as string;
        const looksLikeHtml = /<\/?[a-z][\s\S]*>/i.test(value);
        return (
          <div className="max-w-4xl mx-auto">
            {looksLikeHtml ? (
              <div
                className={isHero
                  ? 'prose prose-lg max-w-none prose-invert leading-relaxed'
                  : 'prose prose-lg max-w-none text-slate-700 leading-relaxed'}
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
        const mime = ((component as any).content?.mime || '') as string;
        const alt = (component as any).content?.alt?.[lang] || '';
        if (!src) return null;

        const isPdf = (mime && mime.toLowerCase() === 'application/pdf') || /\.pdf(\?|#|$)/i.test(String(src));
        if (isPdf) {
          return (
            <div className="max-w-4xl mx-auto">
              <a
                href={src}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center px-6 py-3 rounded-lg font-medium bg-slate-900 text-white hover:bg-slate-800 transition"
              >
                {alt || (lang === 'ar' ? 'فتح ملف PDF' : 'Open PDF')}
              </a>
            </div>
          );
        }

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

        const rawText = String(text || '').trim();
        const rawHref = typeof href === 'string' ? href.trim() : '';
        const displayText = (looksLikeUrl(rawText) || (!!rawHref && rawText === rawHref))
          ? formatUrlForDisplay(rawText)
          : rawText;

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
              {displayText}
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
        return <div className="prose prose-lg max-w-none" dangerouslySetInnerHTML={{ __html: sanitizeHtml(html) }} />;
      }

      default:
        return null;
    }
  };

  const renderUnderConstruction = (p: any) => {
    const title = p?.title?.[lang] || p?.name || '';
    const desc = p?.description?.[lang];
    return (
      <div className="max-w-4xl mx-auto text-center">
        <h1 className="text-3xl md:text-5xl font-extrabold text-slate-900">{title}</h1>
        <p className="mt-4 text-slate-600">{desc || (lang === 'ar' ? 'هذه الصفحة قيد التطوير.' : 'This page is under construction.')}</p>
      </div>
    );
  };

  const renderPageBody = (p: any) => {
    if (!!p?.underConstruction) return renderUnderConstruction(p);

    if (p?.renderMode === 'html') {
      return (
        <div className="max-w-6xl mx-auto">
          <div className="border border-slate-200 rounded-2xl overflow-hidden bg-white">
            <iframe
              title={p?.slug ? `page-${p.slug}` : p.id}
              sandbox="allow-same-origin allow-scripts allow-popups allow-popups-to-escape-sandbox allow-top-navigation-by-user-activation"
              referrerPolicy="no-referrer"
              srcDoc={buildSafeSrcDoc(p?.fullHtml || '')}
              style={{ width: '100%', height: 900, border: 0, background: 'white' }}
            />
          </div>
        </div>
      );
    }

    const variant = (p?.sectionVariant || 'default') as string;
    if (variant !== 'hero') {
      return (
        <>
          <div className="text-center mb-12">
            <h1 className="text-3xl md:text-4xl font-bold text-tivro-dark mb-4">{p?.title?.[lang] || p?.name}</h1>
            {p?.description?.[lang] && (
              <p className="text-slate-500 max-w-2xl mx-auto">{p?.description?.[lang]}</p>
            )}
          </div>

          <div className="space-y-8">
            {(p.components || [])
              .slice()
              .sort((a: any, b: any) => (a.orderIndex ?? 0) - (b.orderIndex ?? 0))
              .map((component: any) => (
                <div key={component.id} className="text-center">
                  {renderComponent(component, { isHero: false })}
                </div>
              ))}
          </div>
        </>
      );
    }

    const heroSettings = p.heroSettings || {};
    const bg = (() => {
      const color = heroSettings.backgroundColor || '#0f172a';
      const opacityPct = typeof heroSettings.backgroundOpacity === 'number' ? heroSettings.backgroundOpacity : 100;
      return hexToRgba(color, opacityPct / 100);
    })();

    return (
      <div
        className="relative overflow-hidden rounded-3xl py-14 md:py-20 px-4 md:px-10"
        style={{ backgroundColor: bg, color: heroSettings.textColor || '#ffffff' }}
      >
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-10">
            <h1 className="text-4xl md:text-6xl font-extrabold">{p?.title?.[lang] || p?.name}</h1>
            {p?.description?.[lang] && (
              <p className="mt-6 text-lg md:text-xl opacity-90 leading-relaxed">{p?.description?.[lang]}</p>
            )}
          </div>

          <div className="space-y-8">
            {(p.components || [])
              .slice()
              .sort((a: any, b: any) => (a.orderIndex ?? 0) - (b.orderIndex ?? 0))
              .map((component: any) => (
                <div key={component.id} className="text-center">
                  {renderComponent(component, { isHero: true })}
                </div>
              ))}
          </div>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex justify-center p-20">
          <Loader2 className="animate-spin" />
        </div>
      </Layout>
    );
  }

  if (!page) {
    return (
      <Layout>
        <div className="container mx-auto px-4 md:px-8 py-20">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-3xl font-bold text-slate-900">{lang === 'ar' ? 'الصفحة غير موجودة' : 'Page not found'}</h1>
            <p className="mt-4 text-slate-600">
              {lang === 'ar' ? 'تأكد من رابط الصفحة أو من قيمة الـ slug في مدير الصفحات.' : 'Check the URL or the slug in Page Manager.'}
            </p>
            <a href="#" className="inline-block mt-8 px-6 py-3 rounded-lg bg-slate-900 text-white hover:bg-slate-800 transition">
              {lang === 'ar' ? 'العودة للرئيسية' : 'Back to Home'}
            </a>
          </div>
        </div>
      </Layout>
    );
  }

  // Normalize slug for comparison
  const normalizedSlug = String(slug || '').trim().toLowerCase();

  // Special handling for profile-readonly to ensure full screen and injected fixes
  // We check slug prop directly to catch it even if page object properties aren't perfectly synced yet
  if (normalizedSlug === 'profile-readonly' && page?.fullHtml) {
    const originalHtml = page.fullHtml;

    // Inject Logo at the top of the body
    // Using inline styles to ensure it renders correctly regardless of external CSS
    const logoHtml = `
    <div id="injected-logo-container" style="text-align: center; padding: 20px 0 10px 0; background: #0F2133; width: 100%; display: flex; justify-content: center; align-items: center;">
      <img src="/logo.png" style="height: 48px; width: auto; max-width: 200px; object-fit: contain;" alt="Tivro" />
    </div>`;

    // Comprehensive CSS fixes
    const styles = `
      <style>
        /* Global Reset for Standalone View */
        html, body { 
          margin: 0 !important; 
          padding: 0 !important; 
          background: #0F2133 !important; 
          height: 100% !important; 
          width: 100% !important;
          overflow-x: hidden !important;
        }

        /* Hide all Standard App Headers/Footers/Toolbars */
        header, nav, footer, .toolbar, .no-print, [class*="app-shell"] { 
          display: none !important; 
        }

        /* Ensure Root is Full Width/Height */
        #root { 
          max-width: 100% !important; 
          width: 100% !important; 
          margin: 0 !important; 
          padding: 0 !important;
          background: #0F2133 !important; 
        }
        
        /* Fix Social Cards Container */
        /* Targeting the specific container classes used in profile.html */
        div[class*="max-w-4xl"], [data-clickable-social] {
          margin-left: auto !important;
          margin-right: auto !important;
          float: none !important;
          width: 90% !important;
          max-width: 900px !important;
          display: block !important;
        }

        /* Fix Grid Alignment for Social Cards */
        .grid {
          display: grid !important;
          justify-content: center !important;
          justify-items: center !important; /* Centers items in grid cells */
          margin: 0 auto !important;
          gap: 1rem !important;
        }
        
        /* Ensure Cards themselves are full width of their grid cell */
        .grid > a, .grid > div {
          width: 100% !important;
          max-width: 100% !important;
        }

        /* Enforce Read-Only Mode Aggressively */
        [contenteditable] { 
          pointer-events: none !important; 
          user-select: none !important;
          -webkit-user-modify: read-only !important;
          contenteditable: false !important;
        }
        
        /* Hide Input Controls Completely */
        input, textarea, select, button {
          display: none !important; 
        }

        /* Allow Link Interaction */
        a { 
          pointer-events: auto !important; 
          cursor: pointer !important; 
        }

        /* Remove top spacing from page sections */
        .page-section {
           padding-top: 0 !important;
           margin-top: 0 !important;
           min-height: auto !important;
        }
      </style>
    `;

    // Inject into HTML safely
    let finalHtml = originalHtml;

    // Inject Logo
    if (finalHtml.includes('<body')) {
      finalHtml = finalHtml.replace(/<body[^>]*>/, (match) => `${match}${logoHtml}`);
    } else {
      finalHtml = `<body>${logoHtml}${finalHtml}</body>`;
    }

    // Inject Styles
    if (finalHtml.includes('</head>')) {
      finalHtml = finalHtml.replace('</head>', `${styles}</head>`);
    } else {
      finalHtml = `<head>${styles}</head>${finalHtml}`;
    }

    return (
      <div className="fixed inset-0 w-full h-full z-[9999] bg-[#0F2133] overflow-hidden">
        <iframe
          title="profile-readonly"
          sandbox="allow-same-origin allow-scripts allow-popups allow-popups-to-escape-sandbox allow-top-navigation-by-user-activation"
          referrerPolicy="no-referrer"
          srcDoc={buildSafeSrcDoc(finalHtml)}
          className="w-full h-full border-0 block"
          style={{ width: '100vw', height: '100vh', border: 0, background: '#0F2133' }}
        />
      </div>
    );
  }

  const resolvedTitle = page?.title?.[lang] || page?.name || '';

  return (
    <Layout hideFooter>
      <div className="container mx-auto px-4 md:px-8 py-10">
        <div className="mb-8">
          <h1 className="text-2xl md:text-3xl font-bold text-slate-900">{resolvedTitle}</h1>
        </div>
        {renderPageBody(page)}
      </div>
    </Layout>
  );
};
