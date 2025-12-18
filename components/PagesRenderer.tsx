import React, { useEffect, useMemo, useState } from 'react';
import { useApp } from '../context/AppContext';
import { CustomPage, PageComponent } from '../types';

type PagesPlacement = NonNullable<CustomPage['placement']>;

interface PagesRendererProps {
  placement: PagesPlacement;
}

export const PagesRenderer: React.FC<PagesRendererProps> = ({ placement }) => {
  const { lang } = useApp();
  const [pages, setPages] = useState<CustomPage[]>([]);

  // السبب الفعلي لعدم ظهور الصفحات سابقاً: Home كان يعتمد على displayLocation (غير محفوظ من PageManager) لذلك كانت الفلترة تُرجع 0 صفحات.
  const loadPages = () => {
    const raw = localStorage.getItem('customPages');
    if (!raw) {
      setPages([]);
      return;
    }

    try {
      const parsed = JSON.parse(raw);
      setPages(Array.isArray(parsed) ? (parsed as CustomPage[]) : []);
    } catch {
      setPages([]);
    }
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

  if (filtered.length === 0) return null;

  const renderComponent = (component: PageComponent) => {
    if ((component as any).isVisible === false) return null;

    switch (component.type) {
      case 'text':
        {
          const value = ((component as any).content?.text?.[lang] || '') as string;
          const looksLikeHtml = /<\/?[a-z][\s\S]*>/i.test(value);
          return (
            <div className="max-w-4xl mx-auto">
              {looksLikeHtml ? (
                <div
                  className="text-lg text-slate-700 leading-relaxed"
                  dangerouslySetInnerHTML={{ __html: sanitizeHtml(value) }}
                />
              ) : (
                <p className="text-lg text-slate-700 leading-relaxed">{value}</p>
              )}
            </div>
          );
        }

      case 'image': {
        const src = (component as any).content?.src;
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
        if (!text) return null;
        return (
          <div className="text-center">
            <button
              onClick={() => {
                if (href) window.open(href, '_blank');
              }}
              className="px-8 py-4 rounded-lg font-medium text-lg transition bg-tivro-primary text-white hover:bg-emerald-500"
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
        <section key={page.id} className="py-16 bg-white">
          <div className="container mx-auto px-4 md:px-8">
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
                    {renderComponent(component)}
                  </div>
                ))}
            </div>
          </div>
        </section>
      ))}
    </>
  );
};
