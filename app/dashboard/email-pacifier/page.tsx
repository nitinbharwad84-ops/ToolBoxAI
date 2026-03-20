'use client';

import { useState, useCallback } from 'react';
import { useUser } from '@/hooks/useUser';
import { calculateCreditCost } from '@/lib/credit-calculator';
import type { EmailPacifierTweaks } from '@/types';
import { cn } from '@/lib/utils';
import { Mail, Send, Copy, RotateCcw, Check, Loader2, ChevronDown, ChevronUp } from 'lucide-react';

const DEFAULT_TWEAKS: EmailPacifierTweaks = {
  tone: 'professional',
  relationship: 'colleague',
  goal: 'resolve',
  alternatives: 1,
  length: 3,
  context: '',
  senderName: '',
  preserveDemands: true,
  language: 'English',
};

const TONE_OPTIONS = ['professional', 'warm', 'firm', 'apologetic', 'assertive'] as const;
const RELATIONSHIP_OPTIONS = ['colleague', 'manager', 'report', 'client', 'vendor', 'stranger'] as const;
const GOAL_OPTIONS = ['resolve', 'apology', 'urgent', 'boundary', 'escalate'] as const;

export default function EmailPacifierPage() {
  const { user, refetch } = useUser();
  const [email, setEmail] = useState('');
  const [tweaks, setTweaks] = useState<EmailPacifierTweaks>(DEFAULT_TWEAKS);
  const [result, setResult] = useState<Record<string, unknown> | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showTweaks, setShowTweaks] = useState(false);
  const [copied, setCopied] = useState(false);
  const [provider, setProvider] = useState('');

  const creditCost = calculateCreditCost('email_pacifier', tweaks);

  const handleSubmit = useCallback(async () => {
    if (!email.trim()) { setError('Please paste your email content.'); return; }
    setLoading(true);
    setError('');
    setResult(null);

    try {
      const res = await fetch('/api/tools/email-pacify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, tweaks }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.message || data.error); return; }
      setResult(data.result);
      setProvider(data.provider);
      refetch();
    } catch {
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [email, tweaks, refetch]);

  const copyResult = () => {
    navigator.clipboard.writeText(JSON.stringify(result, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

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
        <span className="ml-auto text-sm font-medium px-3 py-1 rounded-full bg-primary/15 text-primary">
          {creditCost} credits
        </span>
      </div>

      {/* Input */}
      <div className="glass-card p-5">
        <label className="block text-sm font-medium text-surface-600 mb-2">Paste the email to transform</label>
        <textarea
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Paste the email you want to make more professional..."
          className="w-full h-40 bg-surface-200/50 border border-surface-300/50 rounded-lg px-4 py-3 text-surface-700 placeholder-surface-500 resize-none focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
        />
      </div>

      {/* Tweak Panel */}
      <div className="glass-card overflow-hidden">
        <button
          onClick={() => setShowTweaks(!showTweaks)}
          className="w-full flex items-center justify-between px-5 py-3 hover:bg-surface-200/30 transition-colors"
        >
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-surface-600">⚙ Customize</span>
            <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-primary/15 text-primary">
              {creditCost} credits
            </span>
          </div>
          {showTweaks ? <ChevronUp className="w-4 h-4 text-surface-500" /> : <ChevronDown className="w-4 h-4 text-surface-500" />}
        </button>

        {showTweaks && (
          <div className="px-5 pb-5 space-y-4 border-t border-surface-300/30">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4">
              {/* Tone */}
              <div>
                <label className="block text-xs font-medium text-surface-500 mb-1.5">Output Tone</label>
                <div className="flex flex-wrap gap-1.5">
                  {TONE_OPTIONS.map((t) => (
                    <button
                      key={t}
                      onClick={() => setTweaks((p) => ({ ...p, tone: t }))}
                      className={cn(
                        'px-3 py-1.5 rounded-md text-xs font-medium transition-all',
                        tweaks.tone === t ? 'bg-primary/20 text-primary' : 'bg-surface-200/50 text-surface-500 hover:bg-surface-300/50'
                      )}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>

              {/* Relationship */}
              <div>
                <label className="block text-xs font-medium text-surface-500 mb-1.5">Relationship</label>
                <div className="flex flex-wrap gap-1.5">
                  {RELATIONSHIP_OPTIONS.map((r) => (
                    <button
                      key={r}
                      onClick={() => setTweaks((p) => ({ ...p, relationship: r }))}
                      className={cn(
                        'px-3 py-1.5 rounded-md text-xs font-medium transition-all',
                        tweaks.relationship === r ? 'bg-primary/20 text-primary' : 'bg-surface-200/50 text-surface-500 hover:bg-surface-300/50'
                      )}
                    >
                      {r}
                    </button>
                  ))}
                </div>
              </div>

              {/* Goal */}
              <div>
                <label className="block text-xs font-medium text-surface-500 mb-1.5">Email Goal</label>
                <div className="flex flex-wrap gap-1.5">
                  {GOAL_OPTIONS.map((g) => (
                    <button
                      key={g}
                      onClick={() => setTweaks((p) => ({ ...p, goal: g }))}
                      className={cn(
                        'px-3 py-1.5 rounded-md text-xs font-medium transition-all',
                        tweaks.goal === g ? 'bg-primary/20 text-primary' : 'bg-surface-200/50 text-surface-500 hover:bg-surface-300/50'
                      )}
                    >
                      {g}
                    </button>
                  ))}
                </div>
              </div>

              {/* Alternatives */}
              <div>
                <label className="block text-xs font-medium text-surface-500 mb-1.5">
                  Alternatives: {tweaks.alternatives}
                  {tweaks.alternatives > 1 && <span className="text-primary"> (+{(tweaks.alternatives - 1) * 2} cr)</span>}
                </label>
                <div className="flex gap-1.5">
                  {[1, 2, 3].map((n) => (
                    <button
                      key={n}
                      onClick={() => setTweaks((p) => ({ ...p, alternatives: n }))}
                      className={cn(
                        'w-10 h-8 rounded-md text-xs font-medium transition-all',
                        tweaks.alternatives === n ? 'bg-primary/20 text-primary' : 'bg-surface-200/50 text-surface-500 hover:bg-surface-300/50'
                      )}
                    >
                      {n}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Context */}
            <div>
              <label className="block text-xs font-medium text-surface-500 mb-1.5">Additional Context (optional)</label>
              <input
                value={tweaks.context}
                onChange={(e) => setTweaks((p) => ({ ...p, context: e.target.value }))}
                placeholder="e.g., We've had this ongoing project delay..."
                className="w-full bg-surface-200/50 border border-surface-300/50 rounded-md px-3 py-2 text-sm text-surface-700 placeholder-surface-500 focus:outline-none focus:ring-2 focus:ring-primary/50"
              />
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-surface-300/30">
              <span className="text-xs text-surface-500">Credits for this run: <span className="font-bold text-primary">{creditCost}</span></span>
              <button
                onClick={() => setTweaks(DEFAULT_TWEAKS)}
                className="text-xs text-surface-500 hover:text-surface-700 transition-colors flex items-center gap-1"
              >
                <RotateCcw className="w-3 h-3" /> Reset
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Error */}
      {error && (
        <div className="glass-card border-danger/30 bg-danger/5 p-4 text-sm text-danger">{error}</div>
      )}

      {/* Submit */}
      <button
        onClick={handleSubmit}
        disabled={loading || !email.trim()}
        className={cn(
          'w-full py-3 rounded-lg font-medium text-white transition-all duration-300 flex items-center justify-center gap-2',
          loading || !email.trim()
            ? 'bg-surface-300 cursor-not-allowed'
            : 'bg-gradient-to-r from-primary to-accent hover:opacity-90 glow-primary'
        )}
      >
        {loading ? (
          <><Loader2 className="w-4 h-4 animate-spin" /> Processing...</>
        ) : (
          <><Send className="w-4 h-4" /> Transform Email — {creditCost} credits</>
        )}
      </button>

      {/* Result */}
      {result && (
        <div className="glass-card p-5 space-y-4 animate-slide-in">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-surface-800">✨ Transformed Email</h2>
            <div className="flex items-center gap-2">
              {user?.show_provider_badge && provider && (
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-surface-200 text-surface-500">
                  Powered by {provider}
                </span>
              )}
              <button onClick={copyResult} className="p-1.5 rounded-md hover:bg-surface-200/50 transition-colors">
                {copied ? <Check className="w-4 h-4 text-success" /> : <Copy className="w-4 h-4 text-surface-500" />}
              </button>
            </div>
          </div>

          {/* Render versions */}
          {[1, 2, 3].map((num) => {
            const version = result[`version_${num}`] as { subject?: string; body?: string; tone_used?: string } | undefined;
            if (!version) return null;
            return (
              <div key={num} className="bg-surface-200/30 rounded-lg p-4 space-y-2">
                {tweaks.alternatives > 1 && (
                  <span className="text-xs font-medium text-primary">Version {num}</span>
                )}
                {version.subject && (
                  <p className="text-sm font-medium text-surface-700">Subject: {version.subject}</p>
                )}
                <div className="text-sm text-surface-600 whitespace-pre-wrap">{version.body}</div>
                {version.tone_used && (
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-surface-300/50 text-surface-500">
                    Tone: {version.tone_used}
                  </span>
                )}
              </div>
            );
          })}

          {/* Original issues & tips */}
          {Array.isArray(result.original_issues) && (result.original_issues as string[]).length > 0 && (
            <div>
              <h3 className="text-sm font-medium text-surface-600 mb-2">Issues Found in Original</h3>
              <ul className="space-y-1">
                {(result.original_issues as string[]).map((issue, i) => (
                  <li key={i} className="text-xs text-surface-500 flex items-start gap-2">
                    <span className="text-danger mt-0.5">•</span> {issue}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {Array.isArray(result.diplomacy_tips) && (result.diplomacy_tips as string[]).length > 0 && (
            <div>
              <h3 className="text-sm font-medium text-surface-600 mb-2">💡 Communication Tips</h3>
              <ul className="space-y-1">
                {(result.diplomacy_tips as string[]).map((tip, i) => (
                  <li key={i} className="text-xs text-accent flex items-start gap-2">
                    <span className="mt-0.5">→</span> {tip}
                  </li>
                ))}
              </ul>
            </div>
          )}

          <button
            onClick={() => { setResult(null); setEmail(''); }}
            className="text-sm text-surface-500 hover:text-primary transition-colors flex items-center gap-1"
          >
            <RotateCcw className="w-3 h-3" /> Run again
          </button>
        </div>
      )}
    </div>
  );
}
