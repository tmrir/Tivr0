import React, { useEffect } from 'react';
import { EditorContent, useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import Link from '@tiptap/extension-link';
import TextAlign from '@tiptap/extension-text-align';
import Highlight from '@tiptap/extension-highlight';
import Placeholder from '@tiptap/extension-placeholder';

interface RichTextEditorProps {
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
  dir?: 'rtl' | 'ltr';
}

export const RichTextEditor: React.FC<RichTextEditorProps> = ({ value, onChange, placeholder, dir }) => {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Underline,
      Highlight,
      Link.configure({
        openOnClick: true,
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
      editor.commands.setContent(next, false);
    }
  }, [editor, value]);

  if (!editor) return null;

  const buttonBase = 'px-2 py-1 rounded border border-slate-200 bg-white text-xs hover:bg-slate-50';
  const active = 'bg-slate-100';

  return (
    <div className="border border-slate-200 rounded-lg overflow-hidden bg-white">
      <div className="flex flex-wrap gap-2 p-2 border-b border-slate-200 bg-slate-50">
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBold().run()}
          className={`${buttonBase} ${editor.isActive('bold') ? active : ''}`}
        >
          B
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className={`${buttonBase} ${editor.isActive('italic') ? active : ''}`}
        >
          I
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleUnderline().run()}
          className={`${buttonBase} ${editor.isActive('underline') ? active : ''}`}
        >
          U
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleStrike().run()}
          className={`${buttonBase} ${editor.isActive('strike') ? active : ''}`}
        >
          S
        </button>

        <div className="w-px h-6 bg-slate-200 mx-1" />

        <button
          type="button"
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          className={`${buttonBase} ${editor.isActive('heading', { level: 2 }) ? active : ''}`}
        >
          H2
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
          className={`${buttonBase} ${editor.isActive('heading', { level: 3 }) ? active : ''}`}
        >
          H3
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().setParagraph().run()}
          className={`${buttonBase} ${editor.isActive('paragraph') ? active : ''}`}
        >
          P
        </button>

        <div className="w-px h-6 bg-slate-200 mx-1" />

        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          className={`${buttonBase} ${editor.isActive('bulletList') ? active : ''}`}
        >
          UL
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          className={`${buttonBase} ${editor.isActive('orderedList') ? active : ''}`}
        >
          OL
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          className={`${buttonBase} ${editor.isActive('blockquote') ? active : ''}`}
        >
          “ ”
        </button>

        <div className="w-px h-6 bg-slate-200 mx-1" />

        <button
          type="button"
          onClick={() => editor.chain().focus().setTextAlign('left').run()}
          className={`${buttonBase} ${editor.isActive({ textAlign: 'left' }) ? active : ''}`}
        >
          Left
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().setTextAlign('center').run()}
          className={`${buttonBase} ${editor.isActive({ textAlign: 'center' }) ? active : ''}`}
        >
          Center
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().setTextAlign('right').run()}
          className={`${buttonBase} ${editor.isActive({ textAlign: 'right' }) ? active : ''}`}
        >
          Right
        </button>

        <div className="w-px h-6 bg-slate-200 mx-1" />

        <button
          type="button"
          onClick={() => editor.chain().focus().toggleHighlight().run()}
          className={`${buttonBase} ${editor.isActive('highlight') ? active : ''}`}
        >
          Mark
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleCode().run()}
          className={`${buttonBase} ${editor.isActive('code') ? active : ''}`}
        >
          Code
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleCodeBlock().run()}
          className={`${buttonBase} ${editor.isActive('codeBlock') ? active : ''}`}
        >
          CodeBlock
        </button>

        <div className="w-px h-6 bg-slate-200 mx-1" />

        <button
          type="button"
          onClick={() => {
            const previousUrl = editor.getAttributes('link').href as string | undefined;
            const url = window.prompt('URL', previousUrl || '');
            if (url === null) return;
            if (url === '') {
              editor.chain().focus().extendMarkRange('link').unsetLink().run();
              return;
            }
            editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
          }}
          className={`${buttonBase} ${editor.isActive('link') ? active : ''}`}
        >
          Link
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().unsetLink().run()}
          className={buttonBase}
        >
          Unlink
        </button>

        <div className="w-px h-6 bg-slate-200 mx-1" />

        <button type="button" onClick={() => editor.chain().focus().undo().run()} className={buttonBase}>
          Undo
        </button>
        <button type="button" onClick={() => editor.chain().focus().redo().run()} className={buttonBase}>
          Redo
        </button>
      </div>

      <EditorContent editor={editor} />
    </div>
  );
};
