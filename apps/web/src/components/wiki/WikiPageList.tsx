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

function timeAgo(dateStr: string): string {
  const now = Date.now();
  const date = new Date(dateStr).getTime();
  const diff = now - date;

  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return 'just now';
  if (minutes < 60) return `${minutes}m ago`;

  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;

  const days = Math.floor(hours / 24);
  if (days === 1) return 'yesterday';
  if (days < 7) return `${days}d ago`;

  return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

export function WikiPageList({ pages, activePageId, onSelectPage, onCreatePage, onDeletePage }: WikiPageListProps) {
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between mb-1">
        <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
          Pages {pages.length > 0 && `(${pages.length})`}
        </span>
        <Button
          size="sm"
          variant="ghost"
          className="h-6 w-6 p-0"
          onClick={() => onCreatePage()}
        >
          <Plus className="h-3.5 w-3.5" />
        </Button>
      </div>

      {pages.length === 0 ? (
        <Button
          size="sm"
          variant="outline"
          className="w-full gap-1.5"
          onClick={() => onCreatePage()}
        >
          <Plus className="h-4 w-4" />
          New Page
        </Button>
      ) : (
        <div className="space-y-0.5">
          {pages.map(page => (
            <div
              key={page.id}
              className={cn(
                'flex items-start gap-2 px-2 py-2 rounded-md cursor-pointer text-sm group transition-colors',
                activePageId === page.id
                  ? 'bg-primary/10 border-l-2 border-primary pl-1.5'
                  : 'hover:bg-muted'
              )}
              onClick={() => onSelectPage(page.id)}
            >
              <FileText className={cn(
                'h-3.5 w-3.5 shrink-0 mt-0.5',
                activePageId === page.id ? 'text-primary' : 'text-muted-foreground'
              )} />
              <div className="flex-1 min-w-0">
                <span className={cn(
                  'truncate block leading-tight',
                  activePageId === page.id && 'font-medium'
                )}>
                  {page.title}
                </span>
                <span className="text-[11px] text-muted-foreground">
                  {timeAgo(page.updatedAt)}
                </span>
              </div>
              {confirmDelete === page.id ? (
                <div className="flex gap-1 shrink-0" onClick={e => e.stopPropagation()}>
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
                  className="h-5 w-5 p-0 opacity-0 group-hover:opacity-100 shrink-0"
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
