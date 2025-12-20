import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  AlignCenter,
  AlignLeft,
  AlignRight,
  Bold,
  CheckSquare,
  Italic,
  Link as LinkIcon,
  List,
  ListOrdered,
  Redo2,
  RemoveFormatting,
  Underline,
  Undo2,
  XSquare,
} from 'lucide-react';

interface WordLikeEditorProps {
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
  dir?: 'rtl' | 'ltr';
}

const allowedTags = new Set([
  'p',
  'br',
  'b',
  'strong',
  'i',
  'em',
  'u',
  's',
  'span',
  'ul',
  'ol',
  'li',
  'a',
  'h1',
  'h2',
  'h3',
  'blockquote',
  'pre',
  'code',
]);

const allowedStyleProps = new Set([
  'color',
  'background-color',
  'font-size',
  'font-family',
  'text-align',
  'line-height',
  'margin-bottom',
]);

const normalizeFontSize = (v: string) => {
  const raw = (v || '').trim();
  if (!raw) return '';

  const m = raw.match(/^([0-9]+(\.[0-9]+)?)(px|pt|rem|em|%)$/i);
  if (!m) return '';

  const num = Number(m[1]);
  const unit = m[3].toLowerCase();
  if (!Number.isFinite(num) || num <= 0) return '';

  if (unit === 'px') {
    if (num < 8 || num > 96) return '';
    return `${num}px`;
  }

  if (unit === 'pt') {
    if (num < 6 || num > 72) return '';
    return `${num}pt`;
  }

  if (unit === 'rem' || unit === 'em') {
    if (num < 0.5 || num > 6) return '';
    return `${num}${unit}`;
  }

  if (unit === '%') {
    if (num < 50 || num > 400) return '';
    return `${num}%`;
  }

  return '';
};

const sanitizeCssValue = (prop: string, value: string) => {
  const v = (value || '').trim();
  if (!v) return '';

  if (prop === 'font-size') return normalizeFontSize(v);

  if (prop === 'color' || prop === 'background-color') {
    const ok =
      /^#[0-9a-f]{3,8}$/i.test(v) ||
      /^rgb\(\s*\d+\s*,\s*\d+\s*,\s*\d+\s*\)$/.test(v) ||
      /^rgba\(\s*\d+\s*,\s*\d+\s*,\s*\d+\s*,\s*(0|1|0?\.\d+)\s*\)$/.test(v) ||
      /^[a-z]+$/i.test(v);
    return ok ? v : '';
  }

  if (prop === 'text-align') {
    const val = v.toLowerCase();
    return val === 'left' || val === 'right' || val === 'center' || val === 'justify' ? val : '';
  }

  if (prop === 'line-height') {
    const ok =
      /^\d+(\.\d+)?$/.test(v) ||
      /^\d+(\.\d+)?(px|pt|rem|em|%)$/i.test(v);
    return ok ? v : '';
  }

  if (prop === 'margin-bottom') {
    const ok = /^\d+(\.\d+)?(px|pt|rem|em)$/i.test(v);
    return ok ? v : '';
  }

  if (prop === 'font-family') {
    const safe = v.replace(/[^a-zA-Z0-9\s,\-"']/g, '').trim();
    return safe ? safe : '';
  }

  return '';
};

const sanitizeHtml = (html: string) => {
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, 'text/html');

  const stripNode = (node: Node) => {
    if (node.nodeType === Node.ELEMENT_NODE) {
      const el = node as HTMLElement;
      const tag = el.tagName.toLowerCase();

      if (tag === 'script' || tag === 'style' || tag === 'meta' || tag === 'link' || tag === 'iframe') {
        el.remove();
        return;
      }

      if (!allowedTags.has(tag)) {
        const parent = el.parentNode;
        if (!parent) {
          el.remove();
          return;
        }
        while (el.firstChild) parent.insertBefore(el.firstChild, el);
        el.remove();
        return;
      }

      for (const attr of Array.from(el.attributes)) {
        const name = attr.name.toLowerCase();
        if (name.startsWith('on')) {
          el.removeAttribute(attr.name);
          continue;
        }
        if (name === 'style') {
          const style = el.getAttribute('style') || '';
          const out: string[] = [];
          for (const chunk of style.split(';')) {
            const [rawProp, rawVal] = chunk.split(':');
            const prop = (rawProp || '').trim().toLowerCase();
            if (!prop || !allowedStyleProps.has(prop)) continue;
            const val = sanitizeCssValue(prop, (rawVal || '').trim());
            if (!val) continue;
            out.push(`${prop}: ${val}`);
          }
          if (out.length) el.setAttribute('style', out.join('; '));
          else el.removeAttribute('style');
          continue;
        }

        if (tag === 'a' && name === 'href') {
          const href = (el.getAttribute('href') || '').trim();
          if (/^https?:\/\//i.test(href) || /^mailto:/i.test(href)) {
            el.setAttribute('href', href);
            el.setAttribute('rel', 'noreferrer');
            el.setAttribute('target', '_blank');
          } else {
            el.removeAttribute('href');
          }
          continue;
        }

        if (name === 'href' || name === 'rel' || name === 'target') {
          if (tag !== 'a') el.removeAttribute(attr.name);
          continue;
        }

        if (name === 'dir') continue;
        if (name === 'aria-label') continue;

        el.removeAttribute(attr.name);
      }
    }

    for (const child of Array.from(node.childNodes)) stripNode(child);
  };

  stripNode(doc.body);
  return doc.body.innerHTML;
};

export const WordLikeEditor: React.FC<WordLikeEditorProps> = ({ value, onChange, placeholder, dir }) => {
  const ref = useRef<HTMLDivElement | null>(null);
  const [isFocused, setIsFocused] = useState(false);
  const [checkColor, setCheckColor] = useState('#16a34a');
  const [uncheckColor, setUncheckColor] = useState('#dc2626');

  const placeholderText = useMemo(() => {
    return placeholder || '';
  }, [placeholder]);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const current = el.innerHTML;
    const next = value || '';

    if (current !== next && !isFocused) {
      el.innerHTML = next;
    }
  }, [value, isFocused]);

  const exec = (command: string, valueArg?: string) => {
    try {
      document.execCommand(command, false, valueArg);
      const el = ref.current;
      if (el) onChange(el.innerHTML);
    } catch {
      // ignore
    }
  };

  const promptForLink = () => {
    const url = window.prompt('URL', 'https://');
    if (!url) return;
    exec('createLink', url);
  };

  const insertCheck = () => {
    exec('insertHTML', `<span style="color: ${checkColor}; font-weight: 700;">✓</span>`);
  };

  const insertUncheck = () => {
    exec('insertHTML', `<span style="color: ${uncheckColor}; font-weight: 700;">✗</span>`);
  };

  const clearFormatting = () => {
    exec('removeFormat');
    exec('unlink');
  };

  const btnBase =
    'h-9 w-9 inline-flex items-center justify-center rounded-md border border-transparent text-slate-700 hover:bg-slate-100 active:scale-[0.98] transition disabled:opacity-40 disabled:hover:bg-transparent';

  const preventMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
  };

  return (
    <div className="border border-slate-200 rounded-xl overflow-hidden bg-white">
      <div role="toolbar" aria-label="toolbar" className="sticky top-0 z-20 flex items-start justify-center p-2 border-b border-slate-200 bg-slate-100">
        <div className="flex-1" />
        <div className="flex items-center flex-wrap justify-center gap-2">
          <div className="flex items-center gap-1">
            <button type="button" title="Undo" className={btnBase} onMouseDown={preventMouseDown} onClick={() => exec('undo')}>
              <Undo2 className="w-4 h-4" />
            </button>
            <button type="button" title="Redo" className={btnBase} onMouseDown={preventMouseDown} onClick={() => exec('redo')}>
              <Redo2 className="w-4 h-4" />
            </button>
          </div>

          <div className="w-px h-7 bg-slate-200 mx-1" />

          <div className="flex items-center gap-1">
            <button
              type="button"
              title="Checkbox"
              className={btnBase}
              onMouseDown={preventMouseDown}
              onClick={insertCheck}
            >
              <CheckSquare className="w-4 h-4" style={{ color: checkColor }} />
            </button>
            <input
              type="color"
              value={checkColor}
              onChange={(e) => setCheckColor(e.target.value)}
              className="h-9 w-9 rounded-md border border-slate-200 bg-white p-1"
              title="Checkbox color"
            />

            <button
              type="button"
              title="Uncheckbox"
              className={btnBase}
              onMouseDown={preventMouseDown}
              onClick={insertUncheck}
            >
              <XSquare className="w-4 h-4" style={{ color: uncheckColor }} />
            </button>
            <input
              type="color"
              value={uncheckColor}
              onChange={(e) => setUncheckColor(e.target.value)}
              className="h-9 w-9 rounded-md border border-slate-200 bg-white p-1"
              title="Uncheckbox color"
            />
          </div>

          <div className="w-px h-7 bg-slate-200 mx-1" />

          <div className="flex items-center gap-1">
            <button type="button" title="Bold" className={btnBase} onMouseDown={preventMouseDown} onClick={() => exec('bold')}>
              <Bold className="w-4 h-4" />
            </button>
            <button type="button" title="Italic" className={btnBase} onMouseDown={preventMouseDown} onClick={() => exec('italic')}>
              <Italic className="w-4 h-4" />
            </button>
            <button type="button" title="Underline" className={btnBase} onMouseDown={preventMouseDown} onClick={() => exec('underline')}>
              <Underline className="w-4 h-4" />
            </button>
          </div>

          <div className="w-px h-7 bg-slate-200 mx-1" />

          <div className="flex items-center gap-1">
            <button type="button" title="Bulleted list" className={btnBase} onMouseDown={preventMouseDown} onClick={() => exec('insertUnorderedList')}>
              <List className="w-4 h-4" />
            </button>
            <button type="button" title="Numbered list" className={btnBase} onMouseDown={preventMouseDown} onClick={() => exec('insertOrderedList')}>
              <ListOrdered className="w-4 h-4" />
            </button>
          </div>

          <div className="w-px h-7 bg-slate-200 mx-1" />

          <div className="flex items-center gap-1">
            <button type="button" title="Align left" className={btnBase} onMouseDown={preventMouseDown} onClick={() => exec('justifyLeft')}>
              <AlignLeft className="w-4 h-4" />
            </button>
            <button type="button" title="Align center" className={btnBase} onMouseDown={preventMouseDown} onClick={() => exec('justifyCenter')}>
              <AlignCenter className="w-4 h-4" />
            </button>
            <button type="button" title="Align right" className={btnBase} onMouseDown={preventMouseDown} onClick={() => exec('justifyRight')}>
              <AlignRight className="w-4 h-4" />
            </button>
          </div>

          <div className="w-px h-7 bg-slate-200 mx-1" />

          <div className="flex items-center gap-1">
            <button type="button" title="Link" className={btnBase} onMouseDown={preventMouseDown} onClick={promptForLink}>
              <LinkIcon className="w-4 h-4" />
            </button>
            <button type="button" title="Clear formatting" className={btnBase} onMouseDown={preventMouseDown} onClick={clearFormatting}>
              <RemoveFormatting className="w-4 h-4" />
            </button>
          </div>
        </div>
        <div className="flex-1" />
      </div>

      <div
        ref={ref}
        dir={dir || 'ltr'}
        contentEditable
        suppressContentEditableWarning
        onFocus={() => setIsFocused(true)}
        onBlur={() => {
          setIsFocused(false);
          const el = ref.current;
          if (el) onChange(el.innerHTML);
        }}
        onInput={() => {
          const el = ref.current;
          if (el) onChange(el.innerHTML);
        }}
        onPaste={(e) => {
          try {
            const html = e.clipboardData.getData('text/html');
            const text = e.clipboardData.getData('text/plain');
            if (html) {
              e.preventDefault();
              const cleaned = sanitizeHtml(html);
              exec('insertHTML', cleaned);
              return;
            }
            if (text) {
              e.preventDefault();
              exec('insertText', text);
            }
          } catch {
            // ignore
          }
        }}
        className="prose prose-sm max-w-none focus:outline-none min-h-[120px] px-3 py-2"
        data-placeholder={placeholderText}
        style={{
          outline: 'none',
        }}
      />

      <style>
        {`
          [contenteditable][data-placeholder]:empty:before {
            content: attr(data-placeholder);
            color: rgb(148 163 184);
            pointer-events: none;
          }
        `}
      </style>
    </div>
  );
};
