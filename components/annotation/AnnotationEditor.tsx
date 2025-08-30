'use client';

import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Link from '@tiptap/extension-link';
import CharacterCount from '@tiptap/extension-character-count';
import { useState } from 'react';

interface AnnotationEditorProps {
  onSubmit: (content: string) => void;
  onCancel: () => void;
  isSubmitting?: boolean;
  initialContent?: string;
}

const CHARACTER_LIMIT = 1500;

export function AnnotationEditor({ 
  onSubmit, 
  onCancel, 
  isSubmitting = false,
  initialContent = '' 
}: AnnotationEditorProps) {
  const [isFocused, setIsFocused] = useState(false);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: false,
        codeBlock: false,
        code: false,
        blockquote: false,
        horizontalRule: false,
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: 'text-water-600 dark:text-water-400 underline hover:text-water-700',
        },
      }),
      CharacterCount.configure({
        limit: CHARACTER_LIMIT,
      }),
    ],
    content: initialContent,
    editorProps: {
      attributes: {
        class: `
          prose prose-sm max-w-none dark:prose-invert
          focus:outline-none min-h-[120px] max-h-[300px] overflow-y-auto
          text-gray-800 dark:text-gray-200
        `,
      },
    },
    onFocus: () => setIsFocused(true),
    onBlur: () => setIsFocused(false),
  });

  const characterCount = editor?.storage.characterCount.characters() || 0;
  const isOverLimit = characterCount > CHARACTER_LIMIT;

  const handleSubmit = () => {
    if (!editor || editor.isEmpty || isOverLimit) return;
    
    const html = editor.getHTML();
    onSubmit(html);
  };

  const setLink = () => {
    const url = window.prompt('Enter URL:');
    if (!url) return;

    editor?.chain().focus().setLink({ href: url }).run();
  };

  return (
    <div className="space-y-3">
      {/* Toolbar */}
      <div className="flex items-center gap-1 p-2 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
        <button
          type="button"
          onClick={() => editor?.chain().focus().toggleBold().run()}
          className={`
            p-2 rounded hover:bg-water-100 dark:hover:bg-water-900/20 transition-colors
            ${editor?.isActive('bold') ? 'bg-water-100 dark:bg-water-900/20 text-water-600' : 'text-gray-600 dark:text-gray-400'}
          `}
          title="Bold"
        >
          <svg className="w-4 h-4" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
            <path d="M6 4h8a4 4 0 014 4 4 4 0 01-4 4H6zM6 12h9a4 4 0 014 4 4 4 0 01-4 4H6z" />
          </svg>
        </button>

        <button
          type="button"
          onClick={() => editor?.chain().focus().toggleItalic().run()}
          className={`
            p-2 rounded hover:bg-water-100 dark:hover:bg-water-900/20 transition-colors
            ${editor?.isActive('italic') ? 'bg-water-100 dark:bg-water-900/20 text-water-600' : 'text-gray-600 dark:text-gray-400'}
          `}
          title="Italic"
        >
          <svg className="w-4 h-4" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
            <path d="M10 4h4M14 4l-4 16M8 20h4" />
          </svg>
        </button>

        <button
          type="button"
          onClick={setLink}
          className={`
            p-2 rounded hover:bg-water-100 dark:hover:bg-water-900/20 transition-colors
            ${editor?.isActive('link') ? 'bg-water-100 dark:bg-water-900/20 text-water-600' : 'text-gray-600 dark:text-gray-400'}
          `}
          title="Add link"
        >
          <svg className="w-4 h-4" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
            <path d="M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71" />
            <path d="M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71" />
          </svg>
        </button>

        <div className="flex-1" />

        {/* Character count */}
        <span className={`
          text-xs px-2
          ${isOverLimit ? 'text-red-500' : 'text-gray-500 dark:text-gray-400'}
        `}>
          {characterCount}/{CHARACTER_LIMIT}
        </span>
      </div>

      {/* Editor */}
      <div className={`
        relative p-4 bg-white dark:bg-gray-900 rounded-lg border-2 transition-all duration-200
        ${isFocused 
          ? 'border-water-500 shadow-lg shadow-water-500/10' 
          : 'border-gray-200 dark:border-gray-700'
        }
        ${isOverLimit ? 'border-red-500' : ''}
      `}>
        <EditorContent editor={editor} />
        
        {/* Water drop animation on focus */}
        {isFocused && (
          <div className="absolute -top-2 -right-2 pointer-events-none">
            <div className="w-4 h-4 bg-water-500 rounded-full animate-water-drop opacity-50" />
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex items-center justify-end gap-3">
        <button
          type="button"
          onClick={onCancel}
          disabled={isSubmitting}
          className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors disabled:opacity-50"
        >
          Cancel
        </button>

        <button
          type="button"
          onClick={handleSubmit}
          disabled={isSubmitting || !editor || editor.isEmpty || isOverLimit}
          className={`
            px-6 py-2 bg-gradient-to-r from-water-500 to-water-600 
            text-white font-medium rounded-lg
            hover:from-water-600 hover:to-water-700
            transform transition-all duration-200
            hover:scale-[1.02] active:scale-[0.98]
            disabled:opacity-50 disabled:cursor-not-allowed
            disabled:hover:scale-100
            shadow-lg shadow-water-500/20
          `}
        >
          {isSubmitting ? (
            <span className="flex items-center gap-2">
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Dropping...
            </span>
          ) : (
            <span className="flex items-center gap-1">
              💧 Drop wisdom
            </span>
          )}
        </button>
      </div>
    </div>
  );
}