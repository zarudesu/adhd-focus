'use client';

import { useEffect, useRef, useCallback } from 'react';
import { useCreateBlockNote } from '@blocknote/react';
import { BlockNoteView } from '@blocknote/shadcn';
import type { Block } from '@blocknote/core';
import '@blocknote/shadcn/style.css';

interface WikiEditorProps {
  content: unknown;
  onChange: (content: unknown) => void;
}

export function WikiEditor({ content, onChange }: WikiEditorProps) {
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const initialContentRef = useRef(content);

  const editor = useCreateBlockNote({
    initialContent: (Array.isArray(initialContentRef.current) && initialContentRef.current.length > 0
      ? initialContentRef.current
      : undefined) as Block[] | undefined,
  });

  // Replace content when switching pages
  useEffect(() => {
    if (content !== initialContentRef.current && editor) {
      try {
        if (Array.isArray(content) && content.length > 0) {
          editor.replaceBlocks(editor.document, content as Block[]);
        } else {
          editor.replaceBlocks(editor.document, [{ type: 'paragraph' as const } as Block]);
        }
      } catch {
        editor.replaceBlocks(editor.document, [{ type: 'paragraph' as const } as Block]);
      }
      initialContentRef.current = content;
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
    <div className="min-h-[300px] border rounded-lg overflow-hidden">
      <BlockNoteView
        editor={editor}
        onChange={handleChange}
        theme="light"
      />
    </div>
  );
}
