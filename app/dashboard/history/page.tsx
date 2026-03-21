'use client';

import { useHistory } from '@/hooks/useHistory';
import { useUser } from '@/hooks/useUser';
import { cn, formatRelativeTime, getToolIcon } from '@/lib/utils';
import CopyButton from '@/components/ui/CopyButton';
import ConfirmDialog from '@/components/ui/ConfirmDialog';
import { History, Trash2, ChevronLeft, ChevronRight, Download, ChevronDown, Loader2 } from 'lucide-react';
import { useState, useCallback } from 'react';
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
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [expandedData, setExpandedData] = useState<Record<string, unknown> | null>(null);
  const [expandLoading, setExpandLoading] = useState(false);

  const toggleExpand = useCallback(async (id: string) => {
    if (expandedId === id) {
      setExpandedId(null);
      setExpandedData(null);
      return;
    }
    setExpandedId(id);
    setExpandedData(null);
    setExpandLoading(true);
    try {
      const res = await fetch(`/api/history/${id}`);
      if (res.ok) {
        const data = await res.json();
        setExpandedData(data.output_data ?? data);
      }
    } finally {
      setExpandLoading(false);
    }
  }, [expandedId]);

  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);

  const confirmDelete = () => {
    if (deleteTarget) {
      deleteItem(deleteTarget);
      if (expandedId === deleteTarget) {
        setExpandedId(null);
        setExpandedData(null);
      }
      setDeleteTarget(null);
    }
  };

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
            <div key={item.id} className="glass-card overflow-hidden group hover:border-surface-400/50 transition-colors">
              <button
                onClick={() => toggleExpand(item.id)}
                className="w-full p-4 flex items-center gap-4 text-left"
              >
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
                  <ChevronDown className={cn('w-4 h-4 text-surface-400 transition-transform', expandedId === item.id && 'rotate-180')} />
                </div>
              </button>
              {expandedId === item.id && (
                <div className="border-t border-surface-300/30 p-4 space-y-3 animate-fade-in">
                  {expandLoading ? (
                    <div className="flex justify-center py-4">
                      <Loader2 className="w-4 h-4 animate-spin text-surface-400" />
                    </div>
                  ) : expandedData ? (
                    <>
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-medium text-surface-500">Full Result</span>
                        <div className="flex items-center gap-2">
                          <CopyButton text={JSON.stringify(expandedData, null, 2)} label="Copy Result" />
                          <button
                            onClick={(e) => { e.stopPropagation(); setDeleteTarget(item.id); }}
                            className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium text-danger hover:bg-danger/10 transition-colors"
                          >
                            <Trash2 className="w-3 h-3" /> Delete
                          </button>
                        </div>
                      </div>
                      <pre className="bg-surface-200/30 rounded-lg p-3 text-xs text-surface-600 overflow-x-auto max-h-64 overflow-y-auto whitespace-pre-wrap">
                        {JSON.stringify(expandedData, null, 2)}
                      </pre>
                    </>
                  ) : (
                    <p className="text-sm text-surface-500 text-center">Could not load result</p>
                  )}
                </div>
              )}
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

      <ConfirmDialog
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={confirmDelete}
        title="Delete History Item"
        message="This will permanently remove this result. This cannot be undone."
      />
    </div>
  );
}
