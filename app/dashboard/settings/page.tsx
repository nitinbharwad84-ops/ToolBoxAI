'use client';

import { useUser } from '@/hooks/useUser';
import { useState } from 'react';
import { cn } from '@/lib/utils';
import Toggle from '@/components/ui/Toggle';
import ConfirmDialog from '@/components/ui/ConfirmDialog';
import { Settings, Key, Globe, Eye, Save, Loader2, Check, AlertTriangle, Trash2, TestTube } from 'lucide-react';

const PROVIDERS = [
  { id: 'gemini', name: 'Gemini', note: 'Recommended — generous free tier' },
  { id: 'grok', name: 'Grok', note: 'X.AI — fast and capable' },
  { id: 'groq', name: 'Groq', note: 'Very fast inference, free tier' },
  { id: 'openrouter', name: 'OpenRouter', note: 'Multiple free models' },
  { id: 'mistral', name: 'Mistral', note: 'European AI — free tier' },
];

export default function SettingsPage() {
  const { user, updatePreferences } = useUser();
  const [apiKey, setApiKey] = useState('');
  const [apiProvider, setApiProvider] = useState('gemini');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ working: boolean; latencyMs?: number } | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState(false);

  const saveApiKey = async () => {
    if (!apiKey.trim()) return;
    setSaving(true);
    try {
      await fetch('/api/user/api-key', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ provider: apiProvider, key: apiKey }),
      });
      setApiKey('');
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } finally {
      setSaving(false);
    }
  };

  const deleteApiKey = async () => {
    await fetch('/api/user/api-key', { method: 'DELETE' });
    setTestResult(null);
    window.location.reload();
  };

  const testApiKey = async () => {
    setTesting(true);
    setTestResult(null);
    try {
      const res = await fetch('/api/user/api-key/test');
      const data = await res.json();
      setTestResult(data);
    } catch {
      setTestResult({ working: false });
    } finally {
      setTesting(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8 animate-fade-in">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-lg bg-primary/15 flex items-center justify-center">
          <Settings className="w-5 h-5 text-primary" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-surface-800">Settings</h1>
          <p className="text-sm text-surface-500">Manage your account and preferences</p>
        </div>
      </div>

      {/* API Key Section */}
      <div className="glass-card p-5 space-y-4">
        <div className="flex items-center gap-2">
          <Key className="w-4 h-4 text-accent" />
          <h2 className="font-semibold text-surface-800">Your Own API Key</h2>
        </div>
        <p className="text-sm text-surface-500">
          Add your personal AI API key to use tools <span className="text-accent font-medium">without spending credits</span>.
          Your key is encrypted at rest with AES-256-GCM.
        </p>

        {user?.user_api_key_set ? (
          <div className="space-y-3">
            <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-accent/10">
              <Check className="w-4 h-4 text-accent" />
              <span className="text-sm text-accent font-medium">
                {user.user_api_provider} key is active
              </span>
            </div>
            <div className="flex gap-2">
              <button onClick={testApiKey} disabled={testing}
                className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium bg-surface-200 text-surface-600 hover:bg-surface-300 transition-colors">
                {testing ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <TestTube className="w-3.5 h-3.5" />}
                {testing ? 'Testing...' : 'Test Key'}
              </button>
              <button onClick={() => setDeleteConfirm(true)}
                className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium text-danger hover:bg-danger/10 transition-colors">
                <Trash2 className="w-3.5 h-3.5" /> Remove Key
              </button>
            </div>
            {testResult && (
              <div className={cn('flex items-center gap-2 px-3 py-2 rounded-lg text-sm',
                testResult.working ? 'bg-success/10 text-success' : 'bg-danger/10 text-danger')}>
                {testResult.working ? <Check className="w-4 h-4" /> : <AlertTriangle className="w-4 h-4" />}
                {testResult.working
                  ? `Working — ${testResult.latencyMs}ms latency`
                  : 'Key is not working. Please check and re-enter.'}
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-medium text-surface-500 mb-1.5">Provider</label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {PROVIDERS.map((p) => (
                  <button key={p.id} onClick={() => setApiProvider(p.id)}
                    className={cn('px-3 py-2 rounded-lg text-left text-sm transition-all border',
                      apiProvider === p.id
                        ? 'border-primary/50 bg-primary/10'
                        : 'border-surface-300/50 bg-surface-200/30 hover:bg-surface-200/50')}>
                    <span className={cn('font-medium', apiProvider === p.id ? 'text-primary' : 'text-surface-700')}>{p.name}</span>
                    <span className="block text-xs text-surface-400 mt-0.5">{p.note}</span>
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium text-surface-500 mb-1.5">API Key</label>
              <input
                type="password"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="Paste your API key here..."
                className="w-full bg-surface-200/50 border border-surface-300/50 rounded-lg px-4 py-2.5 text-sm text-surface-700 placeholder-surface-500 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
              />
            </div>
            <button onClick={saveApiKey} disabled={saving || !apiKey.trim()}
              className={cn('flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-all',
                saving || !apiKey.trim()
                  ? 'bg-surface-300 text-surface-500 cursor-not-allowed'
                  : 'bg-gradient-to-r from-primary to-accent text-white hover:opacity-90')}>
              {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : saved ? <Check className="w-3.5 h-3.5" /> : <Save className="w-3.5 h-3.5" />}
              {saving ? 'Saving...' : saved ? 'Saved!' : 'Save Key'}
            </button>
          </div>
        )}
      </div>

      {/* Preferences */}
      <div className="glass-card p-5 space-y-4">
        <div className="flex items-center gap-2">
          <Globe className="w-4 h-4 text-primary" />
          <h2 className="font-semibold text-surface-800">Preferences</h2>
        </div>

        <div className="space-y-4">
          {/* Language */}
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-surface-700">Default Language</p>
              <p className="text-xs text-surface-500">Used as the default for all tools</p>
            </div>
            <select
              value={user?.default_language ?? 'English'}
              onChange={(e) => updatePreferences({ default_language: e.target.value } as Partial<typeof user & { default_language: string }>)}
              className="bg-surface-200/50 border border-surface-300/50 rounded-md px-3 py-1.5 text-sm text-surface-700 focus:outline-none focus:ring-2 focus:ring-primary/50"
            >
              {['English', 'Hindi', 'Spanish', 'French', 'German', 'Japanese', 'Chinese', 'Korean', 'Arabic'].map((lang) => (
                <option key={lang} value={lang}>{lang}</option>
              ))}
            </select>
          </div>

          <Toggle
            label="Show AI Provider"
            description="Display which AI model processed your request"
            checked={!!user?.show_provider_badge}
            onChange={(v) => updatePreferences({ show_provider_badge: v } as Partial<typeof user & { show_provider_badge: boolean }>)}
          />

          {/* Auto Save */}
          <Toggle
            label="Auto-Save History"
            description="Automatically save all tool results"
            checked={!!user?.auto_save_history}
            onChange={(v) => updatePreferences({ auto_save_history: v } as Partial<typeof user & { auto_save_history: boolean }>)}
          />

          {/* Provider Badge */}
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-surface-700">
                <Eye className="w-3.5 h-3.5 inline mr-1" />
                Response Format
              </p>
              <p className="text-xs text-surface-500">How results are displayed</p>
            </div>
            <div className="flex gap-1.5">
              {['formatted', 'raw_json'].map((f) => (
                <button key={f}
                  onClick={() => updatePreferences({ response_format: f } as Partial<typeof user & { response_format: string }>)}
                  className={cn('px-3 py-1.5 rounded-md text-xs font-medium transition-all',
                    user?.response_format === f ? 'bg-primary/20 text-primary' : 'bg-surface-200/50 text-surface-500')}>
                  {f === 'formatted' ? 'Formatted' : 'Raw JSON'}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      <ConfirmDialog
        open={deleteConfirm}
        onClose={() => setDeleteConfirm(false)}
        onConfirm={() => { setDeleteConfirm(false); deleteApiKey(); }}
        title="Remove API Key"
        message="Your encrypted API key will be permanently deleted. You'll need to re-enter it to use BYO key again."
        confirmLabel="Remove Key"
      />
    </div>
  );
}
