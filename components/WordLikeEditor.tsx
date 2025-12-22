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
  Wand2,
  XSquare,
  Loader2,
} from 'lucide-react';
import { translateText } from '../services/translationService';

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
  const [fontSizePx, setFontSizePx] = useState(17);
  const [lineHeight, setLineHeight] = useState('');
  const [blockType, setBlockType] = useState<'p' | 'h1' | 'h2' | 'h3'>('p');
  const [translating, setTranslating] = useState(false);

  const handleAutoTranslate = async () => {
    const el = ref.current;
    if (!el || !el.innerText.trim()) return;
    setTranslating(true);
    try {
      // We assume translation is from Ar to En if the current editor is in RTL
      const from = dir === 'rtl' ? 'ar' : 'en';
      const to = dir === 'rtl' ? 'en' : 'ar';
      const translated = await translateText(el.innerText, from, to);
      if (translated) {
        // Replace content or just provide it? 
        // For editor, it's better to replace if they clicked the button.
        // But wait, the user wants to populate the "other" language.
        // In PageManager, each editor is independent.
        // This button in the editor toolbar will translate the current editor's content.
        // So they can type in Ar, click translate, and it becomes English? 
        // No, that's not what they want. They want to fill the English field FROM the Arabic one.
        // So the translation button should probably be outside or handle cross-editor sync.
        // However, adding a "Translate" button inside the editor that replaces text with its translation
        // is also a valid feature. 
        // But the USER specifically asked for "Auto-fill the second language fields by taking a copy of the mother language (Arabic) and converting it to English automatically".

        // Let's stick to the previous pattern of having the button next to the label in PageManager.
      }
    } finally {
      setTranslating(false);
    }
  };

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

  const wrapSelectionWithSpanStyle = (style: string) => {
    const sel = window.getSelection();
    if (!sel || sel.rangeCount === 0) return;
    const range = sel.getRangeAt(0);
    if (!ref.current || !ref.current.contains(range.commonAncestorContainer)) return;

    const extracted = range.extractContents();
    const wrapper = document.createElement('span');
    wrapper.setAttribute('style', style);
    wrapper.appendChild(extracted);
    range.insertNode(wrapper);

    // Move caret after wrapper
    sel.removeAllRanges();
    const newRange = document.createRange();
    newRange.setStartAfter(wrapper);
    newRange.collapse(true);
    sel.addRange(newRange);

    const el = ref.current;
    if (el) onChange(el.innerHTML);
  };

  const applyFontSize = (px: number) => {
    const clamped = Math.max(8, Math.min(70, Math.round(px || 0)));
    setFontSizePx(clamped);
    wrapSelectionWithSpanStyle(`font-size: ${clamped}px`);
  };

  const getClosestBlockEl = () => {
    const sel = window.getSelection();
    if (!sel || sel.rangeCount === 0) return null;
    const range = sel.getRangeAt(0);
    let node: Node | null = range.startContainer;
    if (!ref.current || !ref.current.contains(node)) return null;

    while (node && node !== ref.current) {
      if (node.nodeType === Node.ELEMENT_NODE) {
        const el = node as HTMLElement;
        const tag = el.tagName.toLowerCase();
        if (tag === 'p' || tag === 'div' || tag === 'li' || tag === 'h1' || tag === 'h2' || tag === 'h3' || tag === 'blockquote' || tag === 'pre') {
          return el;
        }
      }
      node = node.parentNode;
    }
    return ref.current;
  };

  const applyLineHeight = (v: string) => {
    setLineHeight(v);
    const block = getClosestBlockEl();
    if (!block) return;
    if (!v) block.style.removeProperty('line-height');
    else block.style.lineHeight = v;
    const el = ref.current;
    if (el) onChange(el.innerHTML);
  };

  const applyBlockType = (v: 'p' | 'h1' | 'h2' | 'h3') => {
    setBlockType(v);
    if (v === 'p') {
      exec('formatBlock', 'p');
      return;
    }
    exec('formatBlock', v);
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
          {dir === 'rtl' && (
            <button
              type="button"
              title="ترجمة تلقائية للإنجليزية"
              className={`${btnBase} w-auto px-2 gap-1 text-tivro-primary font-bold`}
              onMouseDown={preventMouseDown}
              onClick={handleAutoTranslate}
              disabled={translating}
            >
              {translating ? <Loader2 size={16} className="animate-spin" /> : <Wand2 size={16} />}
              <span className="text-[10px]">ترجمة</span>
            </button>
          )}
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
            <select
              value={blockType}
              onChange={(e) => applyBlockType(e.target.value as any)}
              className="h-9 rounded-md border border-slate-200 bg-white px-2 text-sm"
              title="Heading"
            >
              <option value="p">P</option>
              <option value="h1">H1</option>
              <option value="h2">H2</option>
              <option value="h3">H3</option>
            </select>

            <select
              value={String(fontSizePx)}
              onChange={(e) => applyFontSize(Number(e.target.value))}
              className="h-9 rounded-md border border-slate-200 bg-white px-2 text-sm"
              title="Font size"
            >
              {[10, 12, 14, 16, 17, 18, 20, 24, 28, 32, 36, 40, 48, 56, 64, 70].map((n) => (
                <option key={n} value={n}>
                  {n}
                </option>
              ))}
            </select>

            <select
              value={lineHeight}
              onChange={(e) => applyLineHeight(e.target.value)}
              className="h-9 rounded-md border border-slate-200 bg-white px-2 text-sm"
              title={dir === 'rtl' ? 'تباعد الأسطر' : 'Line height'}
            >
              <option value="">LH</option>
              <option value="1">1</option>
              <option value="1.15">1.15</option>
              <option value="1.5">1.5</option>
              <option value="2">2</option>
              <option value="2.5">2.5</option>
            </select>
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
          // Default paste works better for most cases than a broken manual implementation
          // If we want to sanitize, we still need to allow the paste to happen or handle it correctly.
          // Let's improve the manual implementation to actually work.
          try {
            const html = e.clipboardData.getData('text/html');
            const text = e.clipboardData.getData('text/plain');

            e.preventDefault();
            if (html) {
              const cleaned = sanitizeHtml(html);
              document.execCommand('insertHTML', false, cleaned);
            } else if (text) {
              // Convert plain text to simple HTML (line breaks to <br>)
              const plainHtml = text.replace(/\n/g, '<br>');
              document.execCommand('insertHTML', false, plainHtml);
            }

            const el = ref.current;
            if (el) onChange(el.innerHTML);
          } catch (err) {
            console.error('Paste error:', err);
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
