'use client';

import { useState, useEffect, useCallback } from 'react';
import type { ToolHistory, ToolName } from '@/types';

interface UseHistoryOptions {
  tool?: ToolName;
  limit?: number;
}

export function useHistory(options: UseHistoryOptions = {}) {
  const [items, setItems] = useState<ToolHistory[]>([]);
  const [total, setTotal] = useState(0);
  const [offset, setOffset] = useState(0);
  const [loading, setLoading] = useState(true);
  const limit = options.limit ?? 20;

  const fetchHistory = useCallback(async (newOffset = 0) => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        limit: limit.toString(),
        offset: newOffset.toString(),
      });
      if (options.tool) params.set('tool', options.tool);

      const res = await fetch(`/api/history?${params}`);
      if (!res.ok) throw new Error('Failed to fetch history');
      const data = await res.json();
      setItems(data.items);
      setTotal(data.total);
      setOffset(newOffset);
    } catch {
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, [limit, options.tool]);

  useEffect(() => { fetchHistory(); }, [fetchHistory]);

  const deleteItem = async (id: string) => {
    await fetch(`/api/history/${id}`, { method: 'DELETE' });
    await fetchHistory(offset);
  };

  const nextPage = () => fetchHistory(offset + limit);
  const prevPage = () => fetchHistory(Math.max(0, offset - limit));
  const hasMore = offset + limit < total;
  const hasPrev = offset > 0;

  return { items, total, loading, deleteItem, nextPage, prevPage, hasMore, hasPrev, refetch: fetchHistory };
}
