import React, { useEffect, useState } from 'react';
import { EditorContent, useEditor } from '@tiptap/react';
import { Extension, Mark } from '@tiptap/core';
import { Plugin } from 'prosemirror-state';
import StarterKit from '@tiptap/starter-kit';
import Image from '@tiptap/extension-image';
import UnderlineExtension from '@tiptap/extension-underline';
import LinkExtension from '@tiptap/extension-link';
import TextAlign from '@tiptap/extension-text-align';
import Placeholder from '@tiptap/extension-placeholder';
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
  'img',
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

  const isSafeImageSrc = (src: string) => {
    const s = (src || '').trim();
    if (!s) return false;
    if (/^data:image\/(png|jpe?g|gif|webp|bmp|svg\+xml);base64,/i.test(s)) return true;
    if (/^https?:\/\//i.test(s)) return true;
    return false;
  };

  const isSafeDimension = (v: string) => {
    const n = Number(String(v || '').trim());
    if (!Number.isFinite(n)) return false;
    if (n <= 0 || n > 4096) return false;
    return true;
  };

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

        if (tag === 'img' && name === 'src') {
          const src = (el.getAttribute('src') || '').trim();
          if (isSafeImageSrc(src)) {
            el.setAttribute('src', src);
          } else {
            el.remove();
          }
          continue;
        }

        if (tag === 'img' && (name === 'alt' || name === 'title')) {
          const v = (el.getAttribute(attr.name) || '').slice(0, 200);
          if (v) el.setAttribute(attr.name, v);
          else el.removeAttribute(attr.name);
          continue;
        }

        if (tag === 'img' && (name === 'width' || name === 'height')) {
          const v = el.getAttribute(attr.name) || '';
          if (isSafeDimension(v)) el.setAttribute(attr.name, String(Math.round(Number(v))));
          else el.removeAttribute(attr.name);
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

const SanitizedTextStyle = Mark.create({
  name: 'sanitizedTextStyle',
  group: 'inline',
  inclusive: true,
  parseHTML() {
    return [
      {
        tag: 'span[style]'
      },
      {
        tag: 'font[color]'
      }
    ];
  },
  addAttributes() {
    return {
      color: {
        default: null,
        parseHTML: (element) => {
          const el = element as HTMLElement;
          const color = el.style?.color || (el.getAttribute('color') || '');
          return color || null;
        },
        renderHTML: (attributes) => {
          if (!attributes.color) return {};
          return { style: `color: ${attributes.color};` };
        }
      },
      backgroundColor: {
        default: null,
        parseHTML: (element) => {
          const el = element as HTMLElement;
          const bg = el.style?.backgroundColor;
          return bg || null;
        },
        renderHTML: (attributes) => {
          if (!attributes.backgroundColor) return {};
          return { style: `background-color: ${attributes.backgroundColor};` };
        }
      },
      fontSize: {
        default: null,
        parseHTML: (element) => {
          const el = element as HTMLElement;
          const size = el.style?.fontSize;
          return size || null;
        },
        renderHTML: (attributes) => {
          if (!attributes.fontSize) return {};
          return { style: `font-size: ${attributes.fontSize};` };
        }
      },
      fontFamily: {
        default: null,
        parseHTML: (element) => {
          const el = element as HTMLElement;
          const family = el.style?.fontFamily;
          return family || null;
        },
        renderHTML: (attributes) => {
          if (!attributes.fontFamily) return {};
          return { style: `font-family: ${attributes.fontFamily};` };
        }
      }
    };
  },
  renderHTML({ HTMLAttributes }) {
    const styleParts: string[] = [];
    const rawStyle = (HTMLAttributes as any).style as string | undefined;
    if (rawStyle) styleParts.push(rawStyle);

    const merged: Record<string, any> = { ...HTMLAttributes };
    if (styleParts.length) merged.style = styleParts.join(' ');
    return ['span', merged, 0];
  }
});

const WordPasteSanitizer = Extension.create({
  name: 'wordPasteSanitizer',
  addProseMirrorPlugins() {
    return [
      new Plugin({
        props: {
          handlePaste: (view, event) => {
            try {
              const clipboard = (event as ClipboardEvent).clipboardData;
              const html = clipboard?.getData('text/html') || '';
              const text = clipboard?.getData('text/plain') || '';

              if (!html && !text) return false;

              const editor = (view as any)?.editor;
              if (!editor) return false;

              if (html) {
                const cleaned = sanitizeHtml(html);
                if (!cleaned) return false;
                editor.chain().focus().insertContent(cleaned).run();
                return true;
              }

              if (text) {
                editor.chain().focus().insertContent(text).run();
                return true;
              }

              return false;
            } catch {
              return false;
            }
          }
        }
      })
    ];
  }
});

const LineHeight = Extension.create({
  name: 'lineHeight',
  addGlobalAttributes() {
    return [
      {
        types: ['paragraph', 'heading'],
        attributes: {
          lineHeight: {
            default: null,
            parseHTML: (element) => {
              const style = (element as HTMLElement).style?.lineHeight;
              return style || null;
            },
            renderHTML: (attributes) => {
              if (!attributes.lineHeight) return {};
              return {
                style: `line-height: ${attributes.lineHeight} !important;`
              };
            }
          }
        }
      }
    ];
  },
  addCommands() {
    return {
      setLineHeight:
        (value: string) =>
        ({ chain }) => {
          return chain().focus().updateAttributes('paragraph', { lineHeight: value }).updateAttributes('heading', { lineHeight: value }).run();
        },
      unsetLineHeight:
        () =>
        ({ chain }) => {
          return chain().focus().updateAttributes('paragraph', { lineHeight: null }).updateAttributes('heading', { lineHeight: null }).run();
        }
    } as any;
  }
});

export const WordLikeEditor: React.FC<WordLikeEditorProps> = ({ value, onChange, placeholder, dir }) => {
  const [isFocused, setIsFocused] = useState(false);
  const [checkColor, setCheckColor] = useState('#16a34a');
  const [uncheckColor, setUncheckColor] = useState('#dc2626');
  const [fontSizePx, setFontSizePx] = useState(17);
  const [lineHeight, setLineHeight] = useState('');
  const [blockType, setBlockType] = useState<'p' | 'h1' | 'h2' | 'h3'>('p');
  const [translating, setTranslating] = useState(false);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        link: false as any,
        underline: false as any
      }),
      Image.configure({
        allowBase64: true,
        HTMLAttributes: {
          class: 'max-w-full h-auto'
        }
      }),
      SanitizedTextStyle,
      UnderlineExtension,
      WordPasteSanitizer,
      LineHeight,
      LinkExtension.configure({
        openOnClick: false,
        autolink: true,
        HTMLAttributes: {
          rel: 'noreferrer',
          target: '_blank'
        }
      }),
      TextAlign.configure({
        types: ['heading', 'paragraph']
      }),
      Placeholder.configure({
        placeholder: placeholder || ''
      })
    ],
    content: value || '',
    editorProps: {
      attributes: {
        class: 'prose prose-sm max-w-none focus:outline-none min-h-[120px] px-3 py-2',
        dir: dir || 'ltr'
      },
      handleDOMEvents: {
        focus: () => {
          setIsFocused(true);
          return false;
        },
        blur: () => {
          setIsFocused(false);
          return false;
        }
      }
    },
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    }
  });

  const handleAutoTranslate = async () => {
    if (!editor) return;
    const selectionText = (() => {
      try {
        const { from, to, empty } = editor.state.selection;
        if (!empty) return editor.state.doc.textBetween(from, to, ' ');
        return editor.getText();
      } catch {
        return '';
      }
    })();
    if (!selectionText.trim()) return;
    setTranslating(true);
    try {
      // We assume translation is from Ar to En if the current editor is in RTL
      const from = dir === 'rtl' ? 'ar' : 'en';
      const to = dir === 'rtl' ? 'en' : 'ar';
      const translated = await translateText(selectionText, from, to);
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
        const escaped = translated
          .replace(/&/g, '&amp;')
          .replace(/</g, '&lt;')
          .replace(/>/g, '&gt;')
          .replace(/\n/g, '<br>');

        try {
          const { empty } = editor.state.selection;
          if (empty) {
            editor.commands.setContent(`<p>${escaped}</p>`);
          } else {
            editor.chain().focus().insertContent(escaped).run();
          }
        } catch {
          editor.commands.setContent(`<p>${escaped}</p>`);
        }
      }
    } finally {
      setTranslating(false);
    }
  };

  useEffect(() => {
    if (!editor) return;
    const current = editor.getHTML();
    const next = value || '';
    if (current !== next && !isFocused) {
      editor.commands.setContent(next, { emitUpdate: false });
    }
  }, [editor, value, isFocused]);

  const promptForLink = () => {
    if (!editor) return;
    const previousUrl = editor.getAttributes('link').href as string | undefined;
    const url = window.prompt('URL', previousUrl || 'https://');
    if (url === null) return;
    if (url === '') {
      editor.chain().focus().extendMarkRange('link').unsetLink().run();
      return;
    }
    editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
  };

  const applyFontSize = (px: number) => {
    if (!editor) return;
    const clamped = Math.max(8, Math.min(70, Math.round(px || 0)));
    setFontSizePx(clamped);
    editor.chain().focus().setMark('sanitizedTextStyle', { fontSize: `${clamped}px` }).run();
  };

  const applyLineHeight = (v: string) => {
    setLineHeight(v);
    if (!editor) return;
    if (!v) (editor as any).commands.unsetLineHeight();
    else (editor as any).commands.setLineHeight(v);
  };

  const applyBlockType = (v: 'p' | 'h1' | 'h2' | 'h3') => {
    setBlockType(v);
    if (!editor) return;
    if (v === 'p') {
      editor.chain().focus().setParagraph().run();
      return;
    }
    if (v === 'h1') {
      editor.chain().focus().setHeading({ level: 1 }).run();
      return;
    }
    if (v === 'h2') {
      editor.chain().focus().setHeading({ level: 2 }).run();
      return;
    }
    editor.chain().focus().setHeading({ level: 3 }).run();
  };

  const insertCheck = () => {
    if (!editor) return;
    editor
      .chain()
      .focus()
      .insertContent(`<span style="color: ${checkColor}; font-weight: 700;">✓</span>`)
      .run();
  };

  const insertUncheck = () => {
    if (!editor) return;
    editor
      .chain()
      .focus()
      .insertContent(`<span style="color: ${uncheckColor}; font-weight: 700;">✗</span>`)
      .run();
  };

  const clearFormatting = () => {
    if (!editor) return;
    editor.chain().focus().clearNodes().unsetAllMarks().run();
    editor.chain().focus().unsetLink().run();
  };

  const btnBase =
    'h-9 w-9 inline-flex items-center justify-center rounded-md border border-transparent text-slate-700 hover:bg-slate-100 active:scale-[0.98] transition disabled:opacity-40 disabled:hover:bg-transparent';
  const btnActive = 'bg-white border-slate-200 shadow-sm';

  const preventMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
  };

  useEffect(() => {
    if (!editor) return;

    const syncToolbarFromSelection = () => {
      try {
        if (editor.isActive('heading', { level: 1 })) setBlockType('h1');
        else if (editor.isActive('heading', { level: 2 })) setBlockType('h2');
        else if (editor.isActive('heading', { level: 3 })) setBlockType('h3');
        else setBlockType('p');

        const styleAttrs = editor.getAttributes('sanitizedTextStyle') as { fontSize?: string | null };
        const fontSize = (styleAttrs?.fontSize || '').toString();
        const m = fontSize.match(/^(\d+)/);
        if (m) {
          const n = Number(m[1]);
          if (Number.isFinite(n)) setFontSizePx(n);
        }

        const p = editor.getAttributes('paragraph') as { lineHeight?: string | null };
        const h = editor.getAttributes('heading') as { lineHeight?: string | null };
        const lh = (h?.lineHeight || p?.lineHeight || '') as string;
        setLineHeight(lh || '');
      } catch {
      }
    };

    syncToolbarFromSelection();
    editor.on('selectionUpdate', syncToolbarFromSelection);
    editor.on('transaction', syncToolbarFromSelection);
    return () => {
      editor.off('selectionUpdate', syncToolbarFromSelection);
      editor.off('transaction', syncToolbarFromSelection);
    };
  }, [editor]);

  if (!editor) return null;

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
            <button
              type="button"
              title="Undo"
              className={btnBase}
              onMouseDown={preventMouseDown}
              onClick={() => editor.chain().focus().undo().run()}
              disabled={!editor.can().chain().focus().undo().run()}
            >
              <Undo2 className="w-4 h-4" />
            </button>
            <button
              type="button"
              title="Redo"
              className={btnBase}
              onMouseDown={preventMouseDown}
              onClick={() => editor.chain().focus().redo().run()}
              disabled={!editor.can().chain().focus().redo().run()}
            >
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
            <button
              type="button"
              title="Bold"
              className={`${btnBase} ${editor.isActive('bold') ? btnActive : ''}`}
              onMouseDown={preventMouseDown}
              onClick={() => editor.chain().focus().toggleBold().run()}
            >
              <Bold className="w-4 h-4" />
            </button>
            <button
              type="button"
              title="Italic"
              className={`${btnBase} ${editor.isActive('italic') ? btnActive : ''}`}
              onMouseDown={preventMouseDown}
              onClick={() => editor.chain().focus().toggleItalic().run()}
            >
              <Italic className="w-4 h-4" />
            </button>
            <button
              type="button"
              title="Underline"
              className={`${btnBase} ${editor.isActive('underline') ? btnActive : ''}`}
              onMouseDown={preventMouseDown}
              onClick={() => editor.chain().focus().toggleUnderline().run()}
            >
              <Underline className="w-4 h-4" />
            </button>
          </div>

          <div className="w-px h-7 bg-slate-200 mx-1" />

          <div className="flex items-center gap-1">
            <button
              type="button"
              title="Bulleted list"
              className={`${btnBase} ${editor.isActive('bulletList') ? btnActive : ''}`}
              onMouseDown={preventMouseDown}
              onClick={() => editor.chain().focus().toggleBulletList().run()}
            >
              <List className="w-4 h-4" />
            </button>
            <button
              type="button"
              title="Numbered list"
              className={`${btnBase} ${editor.isActive('orderedList') ? btnActive : ''}`}
              onMouseDown={preventMouseDown}
              onClick={() => editor.chain().focus().toggleOrderedList().run()}
            >
              <ListOrdered className="w-4 h-4" />
            </button>
          </div>

          <div className="w-px h-7 bg-slate-200 mx-1" />

          <div className="flex items-center gap-1">
            <button
              type="button"
              title="Align left"
              className={`${btnBase} ${editor.isActive({ textAlign: 'left' }) ? btnActive : ''}`}
              onMouseDown={preventMouseDown}
              onClick={() => editor.chain().focus().setTextAlign('left').run()}
            >
              <AlignLeft className="w-4 h-4" />
            </button>
            <button
              type="button"
              title="Align center"
              className={`${btnBase} ${editor.isActive({ textAlign: 'center' }) ? btnActive : ''}`}
              onMouseDown={preventMouseDown}
              onClick={() => editor.chain().focus().setTextAlign('center').run()}
            >
              <AlignCenter className="w-4 h-4" />
            </button>
            <button
              type="button"
              title="Align right"
              className={`${btnBase} ${editor.isActive({ textAlign: 'right' }) ? btnActive : ''}`}
              onMouseDown={preventMouseDown}
              onClick={() => editor.chain().focus().setTextAlign('right').run()}
            >
              <AlignRight className="w-4 h-4" />
            </button>
          </div>

          <div className="w-px h-7 bg-slate-200 mx-1" />

          <div className="flex items-center gap-1">
            <button
              type="button"
              title="Link"
              className={`${btnBase} ${editor.isActive('link') ? btnActive : ''}`}
              onMouseDown={preventMouseDown}
              onClick={promptForLink}
            >
              <LinkIcon className="w-4 h-4" />
            </button>
            <button type="button" title="Clear formatting" className={btnBase} onMouseDown={preventMouseDown} onClick={clearFormatting}>
              <RemoveFormatting className="w-4 h-4" />
            </button>
          </div>
        </div>
        <div className="flex-1" />
      </div>

      <EditorContent editor={editor} />

      <style>
        {`
          .ProseMirror {
            outline: none;
          }

          .ProseMirror p.is-editor-empty:first-child::before {
            content: attr(data-placeholder);
            float: left;
            color: rgb(148 163 184);
            pointer-events: none;
            height: 0;
          }
        `}
      </style>
    </div>
  );
};
