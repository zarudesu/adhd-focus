'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Plus, FileText, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface WikiPageSummary {
  id: string;
  title: string;
  sortOrder: number;
  updatedAt: string;
}

interface WikiPageListProps {
  pages: WikiPageSummary[];
  activePageId: string | null;
  onSelectPage: (pageId: string) => void;
  onCreatePage: (title?: string) => void;
  onDeletePage: (pageId: string) => void;
}

export function WikiPageList({ pages, activePageId, onSelectPage, onCreatePage, onDeletePage }: WikiPageListProps) {
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  return (
    <div className="space-y-2">
      <Button
        size="sm"
        variant="outline"
        className="w-full gap-1.5"
        onClick={() => onCreatePage()}
      >
        <Plus className="h-4 w-4" />
        New Page
      </Button>

      {pages.length === 0 ? (
        <p className="text-xs text-muted-foreground text-center py-4">
          No wiki pages yet
        </p>
      ) : (
        <div className="space-y-1">
          {pages.map(page => (
            <div
              key={page.id}
              className={cn(
                'flex items-center gap-2 px-2 py-1.5 rounded-md cursor-pointer text-sm group',
                activePageId === page.id
                  ? 'bg-accent text-accent-foreground'
                  : 'hover:bg-muted'
              )}
              onClick={() => onSelectPage(page.id)}
            >
              <FileText className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
              <span className="truncate flex-1">{page.title}</span>
              {confirmDelete === page.id ? (
                <div className="flex gap-1" onClick={e => e.stopPropagation()}>
                  <Button
                    size="sm"
                    variant="destructive"
                    className="h-5 px-1.5 text-xs"
                    onClick={() => { onDeletePage(page.id); setConfirmDelete(null); }}
                  >
                    Yes
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-5 px-1.5 text-xs"
                    onClick={() => setConfirmDelete(null)}
                  >
                    No
                  </Button>
                </div>
              ) : (
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-5 w-5 p-0 opacity-0 group-hover:opacity-100"
                  onClick={(e) => { e.stopPropagation(); setConfirmDelete(page.id); }}
                >
                  <Trash2 className="h-3 w-3 text-muted-foreground" />
                </Button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
