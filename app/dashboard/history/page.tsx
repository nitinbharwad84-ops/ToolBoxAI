'use client';

import { useHistory } from '@/hooks/useHistory';
import { useUser } from '@/hooks/useUser';
import { cn, formatRelativeTime, getToolIcon } from '@/lib/utils';
import { History, Trash2, ChevronLeft, ChevronRight, Download } from 'lucide-react';
import { useState } from 'react';
import type { ToolName } from '@/types';

const TOOL_FILTERS: Array<{ label: string; value: ToolName | undefined }> = [
  { label: 'All', value: undefined },
  { label: '📝 Summarizer', value: 'summarizer' },
  { label: '🔥 Resume Roaster', value: 'resume_roaster' },
  { label: '📧 Email Pacifier', value: 'email_pacifier' },
];

export default function HistoryPage() {
  const { user } = useUser();
  const [filter, setFilter] = useState<ToolName | undefined>(undefined);
  const { items, total, loading, deleteItem, nextPage, prevPage, hasMore, hasPrev } = useHistory({ tool: filter });

  const handleExport = async (format: 'json' | 'csv') => {
    const res = await fetch(`/api/history/export?format=${format}`);
    if (!res.ok) return;
    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `toolboxai-history.${format}`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-primary/15 flex items-center justify-center">
            <History className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-surface-800">History</h1>
            <p className="text-sm text-surface-500">
              {total} result{total !== 1 ? 's' : ''}
              {user?.plan === 'free' && ' • 7 day retention'}
            </p>
          </div>
        </div>

        {user?.plan === 'pro' && (
          <div className="flex gap-2">
            <button onClick={() => handleExport('json')} className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium bg-surface-200/50 text-surface-500 hover:bg-surface-300/50 transition-colors">
              <Download className="w-3 h-3" /> JSON
            </button>
            <button onClick={() => handleExport('csv')} className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium bg-surface-200/50 text-surface-500 hover:bg-surface-300/50 transition-colors">
              <Download className="w-3 h-3" /> CSV
            </button>
          </div>
        )}
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-1.5">
        {TOOL_FILTERS.map(({ label, value }) => (
          <button key={label} onClick={() => setFilter(value)}
            className={cn('px-3 py-1.5 rounded-md text-xs font-medium transition-all',
              filter === value ? 'bg-primary/20 text-primary' : 'bg-surface-200/50 text-surface-500 hover:bg-surface-300/50')}
          >{label}</button>
        ))}
      </div>

      {/* List */}
      {loading ? (
        <div className="glass-card p-12 text-center text-surface-500">
          <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
        </div>
      ) : items.length === 0 ? (
        <div className="glass-card p-12 text-center text-surface-500">
          <p>No history yet. Start using the tools!</p>
        </div>
      ) : (
        <div className="space-y-2">
          {items.map((item) => (
            <div key={item.id} className="glass-card p-4 flex items-center gap-4 group hover:border-surface-400/50 transition-colors">
              <span className="text-xl flex-shrink-0">{getToolIcon(item.tool_name)}</span>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <p className="text-sm font-medium text-surface-700">{item.tool_display_name}</p>
                  {item.ai_provider_used && (
                    <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-surface-200 text-surface-400">{item.ai_provider_used}</span>
                  )}
                </div>
                <p className="text-xs text-surface-500 truncate">{item.input_preview ?? 'No preview'}</p>
              </div>
              <div className="text-right flex-shrink-0 flex items-center gap-3">
                <div>
                  <p className="text-sm font-medium text-surface-600">−{item.credits_used} cr</p>
                  <p className="text-xs text-surface-400">{formatRelativeTime(item.created_at)}</p>
                </div>
                <button onClick={() => deleteItem(item.id)}
                  className="p-1.5 rounded-md opacity-0 group-hover:opacity-100 hover:bg-danger/10 transition-all">
                  <Trash2 className="w-3.5 h-3.5 text-danger" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {(hasPrev || hasMore) && (
        <div className="flex items-center justify-center gap-4">
          <button onClick={prevPage} disabled={!hasPrev}
            className={cn('flex items-center gap-1.5 px-4 py-2 rounded-md text-sm font-medium transition-all',
              hasPrev ? 'bg-surface-200 text-surface-600 hover:bg-surface-300' : 'bg-surface-200/50 text-surface-400 cursor-not-allowed')}>
            <ChevronLeft className="w-4 h-4" /> Previous
          </button>
          <button onClick={nextPage} disabled={!hasMore}
            className={cn('flex items-center gap-1.5 px-4 py-2 rounded-md text-sm font-medium transition-all',
              hasMore ? 'bg-surface-200 text-surface-600 hover:bg-surface-300' : 'bg-surface-200/50 text-surface-400 cursor-not-allowed')}>
            Next <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
}
