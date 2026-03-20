'use client';

import { useState, useEffect, useCallback } from 'react';
import type { ToolPreset, ToolName } from '@/types';

export function usePresets(toolName: ToolName) {
  const [presets, setPresets] = useState<ToolPreset[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchPresets = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/presets?tool=${toolName}`);
      if (!res.ok) return;
      const data = await res.json();
      setPresets(data);
    } catch {
      setPresets([]);
    } finally {
      setLoading(false);
    }
  }, [toolName]);

  useEffect(() => { fetchPresets(); }, [fetchPresets]);

  const savePreset = async (name: string, config: Record<string, unknown>) => {
    const res = await fetch('/api/presets', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ tool_name: toolName, preset_name: name, config }),
    });
    if (res.ok) await fetchPresets();
    return res.ok;
  };

  const deletePreset = async (id: string) => {
    await fetch(`/api/presets/${id}`, { method: 'DELETE' });
    await fetchPresets();
  };

  return { presets, loading, savePreset, deletePreset, refetch: fetchPresets };
}
