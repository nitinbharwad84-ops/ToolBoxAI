'use client';

import { usePresets } from '@/hooks/usePresets';
import type { ToolName } from '@/types';
import { cn } from '@/lib/utils';
import { Save, Trash2, Loader2 } from 'lucide-react';
import { useState } from 'react';

interface PresetManagerProps {
  toolName: ToolName;
  currentConfig: Record<string, unknown>;
  onLoad: (config: Record<string, unknown>) => void;
  isPro: boolean;
}

export default function PresetManager({ toolName, currentConfig, onLoad, isPro }: PresetManagerProps) {
  const { presets, loading, savePreset, deletePreset } = usePresets(toolName);
  const [saving, setSaving] = useState(false);
  const [newName, setNewName] = useState('');
  const [showInput, setShowInput] = useState(false);

  if (!isPro) {
    return (
      <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-surface-200/30 text-xs text-surface-500">
        <span>🔒 Presets are a Pro feature</span>
      </div>
    );
  }

  const handleSave = async () => {
    if (!newName.trim()) return;
    setSaving(true);
    await savePreset(newName.trim(), currentConfig);
    setNewName('');
    setShowInput(false);
    setSaving(false);
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-1.5 flex-wrap">
        {loading ? (
          <Loader2 className="w-3 h-3 animate-spin text-surface-400" />
        ) : (
          presets.map((p) => (
            <div key={p.id} className="group flex items-center gap-1">
              <button
                onClick={() => onLoad(p.config as Record<string, unknown>)}
                className={cn(
                  'px-2.5 py-1 rounded-md text-xs font-medium transition-all',
                  p.is_default
                    ? 'bg-primary/20 text-primary'
                    : 'bg-surface-200/50 text-surface-500 hover:bg-surface-300/50'
                )}
              >
                {p.preset_name}
              </button>
              <button
                onClick={() => deletePreset(p.id)}
                className="opacity-0 group-hover:opacity-100 p-0.5 rounded hover:bg-danger/10 transition-all"
              >
                <Trash2 className="w-2.5 h-2.5 text-danger" />
              </button>
            </div>
          ))
        )}
        {showInput ? (
          <div className="flex items-center gap-1">
            <input
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSave()}
              placeholder="Name..."
              autoFocus
              className="w-24 px-2 py-1 rounded-md text-xs bg-surface-200/50 border border-surface-300/50 text-surface-700 focus:outline-none focus:ring-1 focus:ring-primary/50"
            />
            <button onClick={handleSave} disabled={saving} className="p-1 rounded hover:bg-primary/10">
              {saving ? <Loader2 className="w-3 h-3 animate-spin" /> : <Save className="w-3 h-3 text-primary" />}
            </button>
          </div>
        ) : (
          <button
            onClick={() => setShowInput(true)}
            className="px-2.5 py-1 rounded-md text-xs font-medium bg-surface-200/30 text-surface-400 hover:bg-surface-300/50 transition-all"
          >
            + Save
          </button>
        )}
      </div>
    </div>
  );
}
