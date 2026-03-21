'use client';

import { useState, useCallback } from 'react';
import { useKeyboardShortcut } from '@/hooks/useKeyboardShortcut';
import { useUser } from '@/hooks/useUser';
import { useToolSubmit } from '@/hooks/useToolSubmit';
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
  const { user } = useUser();
  const { result, provider, loading, error, submit, reset } = useToolSubmit({
    endpoint: '/api/tools/email-pacify',
    toolName: 'Email Pacifier',
    successTitle: 'Email transformed',
  });
  const [email, setEmail] = useState('');
  const [tweaks, setTweaks] = useState<EmailPacifierTweaks>(DEFAULT_TWEAKS);
  const [validationError, setValidationError] = useState('');

  const creditCost = calculateCreditCost('email_pacifier', tweaks);

  const handleSubmit = useCallback(async () => {
    if (!email.trim()) { setValidationError('Please paste your email content.'); return; }
    setValidationError('');
    await submit({ email, tweaks });
  }, [email, tweaks, submit]);

  useKeyboardShortcut('Enter', handleSubmit, { ctrlOrMeta: true, disabled: loading || !email.trim() });

  const displayError = validationError || error;

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-emerald-500/20 to-teal-500/20 flex items-center justify-center">
          <Mail className="w-5 h-5 text-emerald-400" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-surface-800">Email Pacifier</h1>
          <p className="text-sm text-surface-500">Transform aggressive emails into professional responses</p>
        </div>
        <LiveCreditCost cost={creditCost} className="ml-auto" />
      </div>

      {/* Input */}
      <div className="glass-card p-5">
        <textarea
          value={email} onChange={(e) => setEmail(e.target.value)}
          placeholder="Paste the angry/aggressive email here..."
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
            <label className="block text-xs font-medium text-surface-500 mb-1.5">Tone</label>
            <MultiToggle options={TONE_OPTIONS} value={tweaks.tone} onChange={(v) => setTweaks(p => ({ ...p, tone: v as EmailPacifierTweaks['tone'] }))} />
          </div>
          <div>
            <label className="block text-xs font-medium text-surface-500 mb-1.5">Relationship</label>
            <MultiToggle options={REL_OPTIONS} value={tweaks.relationship} onChange={(v) => setTweaks(p => ({ ...p, relationship: v as EmailPacifierTweaks['relationship'] }))} />
          </div>
          <div>
            <label className="block text-xs font-medium text-surface-500 mb-1.5">Goal</label>
            <MultiToggle options={GOAL_OPTIONS} value={tweaks.goal} onChange={(v) => setTweaks(p => ({ ...p, goal: v as EmailPacifierTweaks['goal'] }))} />
          </div>
          <div>
            <label className="block text-xs font-medium text-surface-500 mb-1.5">
              Response Length: {['', 'Very Short', 'Short', 'Medium', 'Long', 'Detailed'][tweaks.length]}
            </label>
            <input type="range" min={1} max={5} value={tweaks.length}
              onChange={(e) => setTweaks(p => ({ ...p, length: parseInt(e.target.value) }))}
              className="w-full accent-primary" />
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <input
            value={tweaks.context} onChange={(e) => setTweaks(p => ({ ...p, context: e.target.value }))}
            placeholder="Extra context (optional)"
            className="bg-surface-200/50 border border-surface-300/50 rounded-lg px-3 py-2 text-sm text-surface-700 placeholder-surface-500 focus:outline-none focus:ring-2 focus:ring-primary/50"
          />
          <input
            value={tweaks.senderName} onChange={(e) => setTweaks(p => ({ ...p, senderName: e.target.value }))}
            placeholder="Your name (optional)"
            className="bg-surface-200/50 border border-surface-300/50 rounded-lg px-3 py-2 text-sm text-surface-700 placeholder-surface-500 focus:outline-none focus:ring-2 focus:ring-primary/50"
          />
        </div>
      </TweakPanel>

      {/* Error */}
      {displayError && <div className="glass-card border-danger/30 bg-danger/5 p-4 text-sm text-danger">{displayError}</div>}

      {/* Submit */}
      <button onClick={handleSubmit} disabled={loading || !email.trim()}
        className={cn('w-full py-3 rounded-lg font-medium text-white transition-all duration-300 flex items-center justify-center gap-2',
          loading || !email.trim() ? 'bg-surface-300 cursor-not-allowed' : 'bg-gradient-to-r from-primary to-accent hover:opacity-90 glow-primary')}
      >
        {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Processing...</> : <><Send className="w-4 h-4" /> Transform Email — {creditCost} credits <kbd className="ml-2 text-[10px] opacity-60 px-1 py-0.5 rounded bg-white/10">⌘↵</kbd></>}
      </button>

      {/* Result */}
      {result && (
        <EmailPacifierResult
          result={result} provider={provider}
          showProvider={user?.show_provider_badge} onReset={() => { reset(); setEmail(''); }}
        />
      )}
    </div>
  );
}
