import React, { useEffect } from 'react';
import { EditorContent, useEditor } from '@tiptap/react';
import { Extension } from '@tiptap/core';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import Link from '@tiptap/extension-link';
import TextAlign from '@tiptap/extension-text-align';
import Highlight from '@tiptap/extension-highlight';
import Placeholder from '@tiptap/extension-placeholder';
import {
  Bold,
  Italic,
  Underline as UnderlineIcon,
  Strikethrough,
  Code as CodeIcon,
  Quote,
  List,
  ListOrdered,
  Undo2,
  Redo2,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Link as LinkIcon,
  Unlink,
  Highlighter,
  RemoveFormatting,
} from 'lucide-react';

interface RichTextEditorProps {
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
  dir?: 'rtl' | 'ltr';
}

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

const ParagraphSpacing = Extension.create({
  name: 'paragraphSpacing',
  addGlobalAttributes() {
    return [
      {
        types: ['paragraph', 'heading'],
        attributes: {
          paragraphSpacing: {
            default: null,
            parseHTML: (element) => {
              const style = (element as HTMLElement).style?.marginBottom;
              return style || null;
            },
            renderHTML: (attributes) => {
              if (!attributes.paragraphSpacing) return {};
              return {
                style: `margin-bottom: ${attributes.paragraphSpacing} !important;`
              };
            }
          }
        }
      }
    ];
  },
  addCommands() {
    return {
      setParagraphSpacing:
        (value: string) =>
        ({ chain }) => {
          return chain().focus().updateAttributes('paragraph', { paragraphSpacing: value }).updateAttributes('heading', { paragraphSpacing: value }).run();
        },
      unsetParagraphSpacing:
        () =>
        ({ chain }) => {
          return chain().focus().updateAttributes('paragraph', { paragraphSpacing: null }).updateAttributes('heading', { paragraphSpacing: null }).run();
        }
    } as any;
  }
});

export const RichTextEditor: React.FC<RichTextEditorProps> = ({ value, onChange, placeholder, dir }) => {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Underline,
      Highlight,
      LineHeight,
      ParagraphSpacing,
      Link.configure({
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
        class:
          'prose prose-sm max-w-none focus:outline-none min-h-[120px] px-3 py-2',
        dir: dir || 'ltr'
      }
    },
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    }
  });

  useEffect(() => {
    if (!editor) return;
    const current = editor.getHTML();
    const next = value || '';
    if (current !== next) {
      editor.commands.setContent(next, { emitUpdate: false });
    }
  }, [editor, value]);

  if (!editor) return null;

  const preventMouseDown = (e: React.MouseEvent) => {
    // Keep selection inside the editor when interacting with the toolbar.
    e.preventDefault();
  };

  const btnBase =
    'h-9 w-9 inline-flex items-center justify-center rounded-md border border-transparent text-slate-700 hover:bg-slate-100 active:scale-[0.98] transition disabled:opacity-40 disabled:hover:bg-transparent';
  const btnActive = 'bg-white border-slate-200 shadow-sm';
  const groupBase = 'flex items-center gap-1';
  const separator = <div className="w-px h-7 bg-slate-200 mx-2" />;

  const getCurrentLineHeight = () => {
    const p = editor.getAttributes('paragraph') as { lineHeight?: string | null };
    const h = editor.getAttributes('heading') as { lineHeight?: string | null };
    return (h?.lineHeight || p?.lineHeight || '') as string;
  };

  const getCurrentParagraphSpacing = () => {
    const p = editor.getAttributes('paragraph') as { paragraphSpacing?: string | null };
    const h = editor.getAttributes('heading') as { paragraphSpacing?: string | null };
    return (h?.paragraphSpacing || p?.paragraphSpacing || '') as string;
  };

  const promptForLink = () => {
    const previousUrl = editor.getAttributes('link').href as string | undefined;
    const url = window.prompt('URL', previousUrl || '');
    if (url === null) return;
    if (url === '') {
      editor.chain().focus().extendMarkRange('link').unsetLink().run();
      return;
    }
    editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
  };

  const pasteAsPlainText = async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (text) editor.chain().focus().insertContent(text).run();
    } catch {
      // ignore
    }
  };

  return (
    <div className="border border-slate-200 rounded-xl overflow-hidden bg-white">
      <div
        role="toolbar"
        aria-label="toolbar"
        className="sticky top-0 z-20 flex items-start justify-center p-2 border-b border-slate-200 bg-slate-100"
      >
        <div className="flex-1" />

        <div className="flex items-center flex-wrap justify-center">
          <div className={groupBase}>
            <button type="button" title={dir === 'rtl' ? 'لصق كنص عادي' : 'Paste as plain text'} className={btnBase} onMouseDown={preventMouseDown} onClick={pasteAsPlainText}>
              <RemoveFormatting className="w-4 h-4" />
            </button>
            <button
              type="button"
              title={dir === 'rtl' ? 'مسح التنسيق' : 'Clear formatting'}
              className={btnBase}
              onMouseDown={preventMouseDown}
              onClick={() => editor.chain().focus().clearNodes().unsetAllMarks().run()}
            >
              <RemoveFormatting className="w-4 h-4" />
            </button>
            <button
              type="button"
              title="Redo"
              className={btnBase}
              disabled={!editor.can().chain().focus().redo().run()}
              onMouseDown={preventMouseDown}
              onClick={() => editor.chain().focus().redo().run()}
            >
              <Redo2 className="w-4 h-4" />
            </button>
            <button
              type="button"
              title="Undo"
              className={btnBase}
              disabled={!editor.can().chain().focus().undo().run()}
              onMouseDown={preventMouseDown}
              onClick={() => editor.chain().focus().undo().run()}
            >
              <Undo2 className="w-4 h-4" />
            </button>
          </div>

          {separator}

          <div className={groupBase}>
            <select
              value={editor.isActive('heading', { level: 2 }) ? 'h2' : editor.isActive('heading', { level: 3 }) ? 'h3' : 'p'}
              onChange={(e) => {
                const v = e.target.value;
                if (v === 'h2') editor.chain().focus().toggleHeading({ level: 2 }).run();
                else if (v === 'h3') editor.chain().focus().toggleHeading({ level: 3 }).run();
                else editor.chain().focus().setParagraph().run();
              }}
              className="h-9 rounded-md border border-slate-200 bg-white px-2 text-sm"
            >
              <option value="p">P</option>
              <option value="h2">H2</option>
              <option value="h3">H3</option>
            </select>
          </div>

          {separator}

          <div className={groupBase}>
            <select
              value={getCurrentLineHeight()}
              onChange={(e) => {
                const v = e.target.value;
                if (!v) (editor as any).commands.unsetLineHeight();
                else (editor as any).commands.setLineHeight(v);
              }}
              className="h-9 rounded-md border border-slate-200 bg-white px-2 text-sm"
              title={dir === 'rtl' ? 'تباعد الأسطر' : 'Line height'}
            >
              <option value="">LH</option>
              <option value="1">1</option>
              <option value="1.15">1.15</option>
              <option value="1.5">1.5</option>
              <option value="2">2</option>
            </select>
          </div>

          <div className={groupBase}>
            <select
              value={getCurrentParagraphSpacing()}
              onChange={(e) => {
                const v = e.target.value;
                if (!v) (editor as any).commands.unsetParagraphSpacing();
                else (editor as any).commands.setParagraphSpacing(v);
              }}
              className="h-9 rounded-md border border-slate-200 bg-white px-2 text-sm"
              title={dir === 'rtl' ? 'مسافة بين الفقرات' : 'Paragraph spacing'}
            >
              <option value="">PS</option>
              <option value="0">0</option>
              <option value="0.25rem">4px</option>
              <option value="0.5rem">8px</option>
              <option value="0.75rem">12px</option>
              <option value="1rem">16px</option>
            </select>
          </div>

          {separator}

          <div className={groupBase}>
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
              <UnderlineIcon className="w-4 h-4" />
            </button>
            <button
              type="button"
              title="Strike"
              className={`${btnBase} ${editor.isActive('strike') ? btnActive : ''}`}
              onMouseDown={preventMouseDown}
              onClick={() => editor.chain().focus().toggleStrike().run()}
            >
              <Strikethrough className="w-4 h-4" />
            </button>
            <button
              type="button"
              title="Highlight"
              className={`${btnBase} ${editor.isActive('highlight') ? btnActive : ''}`}
              onMouseDown={preventMouseDown}
              onClick={() => editor.chain().focus().toggleHighlight().run()}
            >
              <Highlighter className="w-4 h-4" />
            </button>
            <button
              type="button"
              title="Code"
              className={`${btnBase} ${editor.isActive('code') ? btnActive : ''}`}
              onMouseDown={preventMouseDown}
              onClick={() => editor.chain().focus().toggleCode().run()}
            >
              <CodeIcon className="w-4 h-4" />
            </button>
          </div>

          {separator}

          <div className={groupBase}>
            <button
              type="button"
              title="Bullet List"
              className={`${btnBase} ${editor.isActive('bulletList') ? btnActive : ''}`}
              onMouseDown={preventMouseDown}
              onClick={() => editor.chain().focus().toggleBulletList().run()}
            >
              <List className="w-4 h-4" />
            </button>
            <button
              type="button"
              title="Ordered List"
              className={`${btnBase} ${editor.isActive('orderedList') ? btnActive : ''}`}
              onMouseDown={preventMouseDown}
              onClick={() => editor.chain().focus().toggleOrderedList().run()}
            >
              <ListOrdered className="w-4 h-4" />
            </button>
            <button
              type="button"
              title="Blockquote"
              className={`${btnBase} ${editor.isActive('blockquote') ? btnActive : ''}`}
              onMouseDown={preventMouseDown}
              onClick={() => editor.chain().focus().toggleBlockquote().run()}
            >
              <Quote className="w-4 h-4" />
            </button>
          </div>

          {separator}

          <div className={groupBase}>
            <button
              type="button"
              title="Align Left"
              className={`${btnBase} ${editor.isActive({ textAlign: 'left' }) ? btnActive : ''}`}
              onMouseDown={preventMouseDown}
              onClick={() => editor.chain().focus().setTextAlign('left').run()}
            >
              <AlignLeft className="w-4 h-4" />
            </button>
            <button
              type="button"
              title="Align Center"
              className={`${btnBase} ${editor.isActive({ textAlign: 'center' }) ? btnActive : ''}`}
              onMouseDown={preventMouseDown}
              onClick={() => editor.chain().focus().setTextAlign('center').run()}
            >
              <AlignCenter className="w-4 h-4" />
            </button>
            <button
              type="button"
              title="Align Right"
              className={`${btnBase} ${editor.isActive({ textAlign: 'right' }) ? btnActive : ''}`}
              onMouseDown={preventMouseDown}
              onClick={() => editor.chain().focus().setTextAlign('right').run()}
            >
              <AlignRight className="w-4 h-4" />
            </button>
          </div>

          {separator}

          <div className={groupBase}>
            <button
              type="button"
              title="Link"
              className={`${btnBase} ${editor.isActive('link') ? btnActive : ''}`}
              onMouseDown={preventMouseDown}
              onClick={promptForLink}
            >
              <LinkIcon className="w-4 h-4" />
            </button>
            <button
              type="button"
              title="Unlink"
              className={btnBase}
              disabled={!editor.isActive('link')}
              onMouseDown={preventMouseDown}
              onClick={() => editor.chain().focus().unsetLink().run()}
            >
              <Unlink className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="flex-1" />
      </div>

      <EditorContent editor={editor} />
    </div>
  );
};
