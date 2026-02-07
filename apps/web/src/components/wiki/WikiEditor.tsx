'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useCreateBlockNote } from '@blocknote/react';
import { BlockNoteView } from '@blocknote/shadcn';
import type { Block } from '@blocknote/core';
import { useTheme } from 'next-themes';
import '@blocknote/shadcn/style.css';
import './wiki-editor.css';

interface WikiEditorProps {
  content: unknown;
  onChange: (content: unknown) => void;
}

export function WikiEditor({ content, onChange }: WikiEditorProps) {
  const { resolvedTheme } = useTheme();
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastContentRef = useRef<unknown>(null);

  const [initialBlocks] = useState(() =>
    Array.isArray(content) && content.length > 0 ? (content as Block[]) : undefined
  );

  const editor = useCreateBlockNote({
    initialContent: initialBlocks,
  });

  // Track initial content in effect (not during render)
  useEffect(() => {
    if (lastContentRef.current === null) {
      lastContentRef.current = content;
    }
  }, [content]);

  // Replace content when switching pages
  useEffect(() => {
    if (content !== lastContentRef.current && editor) {
      try {
        if (Array.isArray(content) && content.length > 0) {
          editor.replaceBlocks(editor.document, content as Block[]);
        } else {
          editor.replaceBlocks(editor.document, [{ type: 'paragraph' as const } as Block]);
        }
      } catch {
        editor.replaceBlocks(editor.document, [{ type: 'paragraph' as const } as Block]);
      }
      lastContentRef.current = content;
    }
  }, [content, editor]);

  const handleChange = useCallback(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      onChange(editor.document);
    }, 1000);
  }, [editor, onChange]);

  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, []);

  return (
    <div className="min-h-[400px] rounded-lg overflow-hidden border border-border">
      <BlockNoteView
        editor={editor}
        onChange={handleChange}
        theme={resolvedTheme === 'dark' ? 'dark' : 'light'}
      />
    </div>
  );
}
