'use client';

import { useState, useCallback } from 'react';
import { useUser } from '@/hooks/useUser';
import { calculateCreditCost } from '@/lib/credit-calculator';
import type { EmailPacifierTweaks } from '@/types';
import { cn } from '@/lib/utils';
import { Mail, Send, Loader2 } from 'lucide-react';
import TweakPanel from '@/components/tools/TweakPanel';
import MultiToggle from '@/components/tools/MultiToggle';
import LiveCreditCost from '@/components/tools/LiveCreditCost';
import PresetManager from '@/components/tools/PresetManager';
import EmailPacifierResult from '@/components/tools/ResultCard/EmailPacifierResult';

const DEFAULT_TWEAKS: EmailPacifierTweaks = {
  tone: 'professional', relationship: 'colleague', goal: 'resolve',
  alternatives: 1, length: 3, context: '', senderName: '', preserveDemands: true, language: 'English',
};

const TONE_OPTIONS = ['professional', 'warm', 'firm', 'apologetic', 'assertive'].map(v => ({ value: v, label: v }));
const REL_OPTIONS = ['colleague', 'manager', 'report', 'client', 'vendor', 'stranger'].map(v => ({ value: v, label: v }));
const GOAL_OPTIONS = ['resolve', 'apology', 'urgent', 'boundary', 'escalate'].map(v => ({ value: v, label: v }));

export default function EmailPacifierPage() {
  const { user, refetch } = useUser();
  const [email, setEmail] = useState('');
  const [tweaks, setTweaks] = useState<EmailPacifierTweaks>(DEFAULT_TWEAKS);
  const [result, setResult] = useState<Record<string, unknown> | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [provider, setProvider] = useState('');

  const creditCost = calculateCreditCost('email_pacifier', tweaks);

  const handleSubmit = useCallback(async () => {
    if (!email.trim()) { setError('Please paste your email content.'); return; }
    setLoading(true); setError(''); setResult(null);
    try {
      const res = await fetch('/api/tools/email-pacify', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, tweaks }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.message || data.error); return; }
      setResult(data.result); setProvider(data.provider); refetch();
    } catch {
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [email, tweaks, refetch]);

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-emerald-500/20 to-teal-500/20 flex items-center justify-center">
          <Mail className="w-5 h-5 text-emerald-400" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-surface-800">Email Pacifier</h1>
          <p className="text-sm text-surface-500">Transform aggressive emails into professional ones</p>
        </div>
        <LiveCreditCost cost={creditCost} className="ml-auto" />
      </div>

      {/* Input */}
      <div className="glass-card p-5">
        <label className="block text-sm font-medium text-surface-600 mb-2">Paste the email to transform</label>
        <textarea
          value={email} onChange={(e) => setEmail(e.target.value)}
          placeholder="Paste the email you want to make more professional..."
          className="w-full h-40 bg-surface-200/50 border border-surface-300/50 rounded-lg px-4 py-3 text-surface-700 placeholder-surface-500 resize-none focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
        />
      </div>

      {/* Tweak Panel */}
      <TweakPanel creditCost={creditCost} onReset={() => setTweaks(DEFAULT_TWEAKS)}>
        <PresetManager
          toolName="email_pacifier" isPro={user?.plan === 'pro'}
          currentConfig={tweaks as unknown as Record<string, unknown>}
          onLoad={(c) => setTweaks(c as unknown as EmailPacifierTweaks)}
        />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-surface-500 mb-1.5">Output Tone</label>
            <MultiToggle options={TONE_OPTIONS} value={tweaks.tone} onChange={(v) => setTweaks(p => ({ ...p, tone: v as EmailPacifierTweaks['tone'] }))} />
          </div>
          <div>
            <label className="block text-xs font-medium text-surface-500 mb-1.5">Relationship</label>
            <MultiToggle options={REL_OPTIONS} value={tweaks.relationship} onChange={(v) => setTweaks(p => ({ ...p, relationship: v as EmailPacifierTweaks['relationship'] }))} />
          </div>
          <div>
            <label className="block text-xs font-medium text-surface-500 mb-1.5">Email Goal</label>
            <MultiToggle options={GOAL_OPTIONS} value={tweaks.goal} onChange={(v) => setTweaks(p => ({ ...p, goal: v as EmailPacifierTweaks['goal'] }))} />
          </div>
          <div>
            <label className="block text-xs font-medium text-surface-500 mb-1.5">
              Alternatives: {tweaks.alternatives}
              {tweaks.alternatives > 1 && <span className="text-primary"> (+{(tweaks.alternatives - 1) * 2} cr)</span>}
            </label>
            <MultiToggle
              options={[{ value: '1', label: '1' }, { value: '2', label: '2' }, { value: '3', label: '3' }]}
              value={String(tweaks.alternatives)} onChange={(v) => setTweaks(p => ({ ...p, alternatives: parseInt(v) }))}
            />
          </div>
        </div>
        <div>
          <label className="block text-xs font-medium text-surface-500 mb-1.5">Additional Context (optional)</label>
          <input
            value={tweaks.context} onChange={(e) => setTweaks(p => ({ ...p, context: e.target.value }))}
            placeholder="e.g., We've had this ongoing project delay..."
            className="w-full bg-surface-200/50 border border-surface-300/50 rounded-md px-3 py-2 text-sm text-surface-700 placeholder-surface-500 focus:outline-none focus:ring-2 focus:ring-primary/50"
          />
        </div>
      </TweakPanel>

      {/* Error */}
      {error && <div className="glass-card border-danger/30 bg-danger/5 p-4 text-sm text-danger">{error}</div>}

      {/* Submit */}
      <button onClick={handleSubmit} disabled={loading || !email.trim()}
        className={cn('w-full py-3 rounded-lg font-medium text-white transition-all duration-300 flex items-center justify-center gap-2',
          loading || !email.trim() ? 'bg-surface-300 cursor-not-allowed' : 'bg-gradient-to-r from-primary to-accent hover:opacity-90 glow-primary')}
      >
        {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Processing...</> : <><Send className="w-4 h-4" /> Transform Email — {creditCost} credits</>}
      </button>

      {/* Result */}
      {result && (
        <EmailPacifierResult
          result={result} provider={provider}
          showProvider={user?.show_provider_badge} onReset={() => { setResult(null); setEmail(''); }}
        />
      )}
    </div>
  );
}
