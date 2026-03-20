'use client';

import { useState, useCallback } from 'react';
import { useUser } from '@/hooks/useUser';
import Link from 'next/link';
import { calculateCreditCost } from '@/lib/credit-calculator';
import type { ResumeRoasterTweaks } from '@/types';
import { cn } from '@/lib/utils';
import { Flame, Send, Copy, RotateCcw, Check, Loader2, ChevronDown, ChevronUp, Lock } from 'lucide-react';

const DEFAULT_TWEAKS: ResumeRoasterTweaks = {
  intensity: 3, targetRole: 'auto', targetRoleCustom: '', experienceLevel: 'auto',
  companyTarget: 'any', focusSections: { summary: true, experience: true, skills: true, education: true, atsCheck: true, formatting: true },
  rewriteBullets: true, numFixes: 3, persona: 'marcus', language: 'English',
};

export default function ResumeRoasterPage() {
  const { user, refetch } = useUser();
  const [content, setContent] = useState('');
  const [tweaks, setTweaks] = useState<ResumeRoasterTweaks>(DEFAULT_TWEAKS);
  const [result, setResult] = useState<Record<string, unknown> | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showTweaks, setShowTweaks] = useState(false);
  const [copied, setCopied] = useState(false);
  const [provider, setProvider] = useState('');

  const creditCost = calculateCreditCost('resume_roaster', tweaks);
  const isPro = user?.plan === 'pro';

  const handleSubmit = useCallback(async () => {
    if (!content.trim()) { setError('Please paste your resume content.'); return; }
    setLoading(true); setError(''); setResult(null);
    try {
      const res = await fetch('/api/tools/resume-roast', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content, tweaks }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.message || data.error); return; }
      setResult(data.result);
      setProvider(data.provider);
      refetch();
    } catch {
      setError('Something went wrong.');
    } finally {
      setLoading(false);
    }
  }, [content, tweaks, refetch]);

  // Pro gate
  if (!isPro && user) {
    return (
      <div className="max-w-2xl mx-auto text-center py-20 space-y-6 animate-fade-in">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-orange-500/20 to-red-500/20 flex items-center justify-center mx-auto">
          <Lock className="w-8 h-8 text-orange-400" />
        </div>
        <h1 className="text-2xl font-bold text-surface-800">Resume Roaster is Pro Only</h1>
        <p className="text-surface-500 max-w-md mx-auto">Get brutal, honest feedback on your resume from Marcus, the most feared recruiter in tech. Upgrade to Pro to unlock.</p>
        <Link href="/dashboard/billing"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-gradient-to-r from-primary to-accent text-white font-medium hover:opacity-90 transition-opacity glow-primary">
          Upgrade to Pro — ₹999/mo
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-fade-in">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-orange-500/20 to-red-500/20 flex items-center justify-center">
          <Flame className="w-5 h-5 text-orange-400" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-surface-800">Resume Roaster</h1>
          <p className="text-sm text-surface-500">Get brutally honest resume feedback</p>
        </div>
        <span className="ml-auto text-sm font-medium px-3 py-1 rounded-full bg-primary/15 text-primary">{creditCost} credits</span>
      </div>

      <div className="glass-card p-5">
        <label className="block text-sm font-medium text-surface-600 mb-2">Paste your resume content</label>
        <textarea value={content} onChange={(e) => setContent(e.target.value)}
          placeholder="Paste your entire resume text here..."
          className="w-full h-48 bg-surface-200/50 border border-surface-300/50 rounded-lg px-4 py-3 text-surface-700 placeholder-surface-500 resize-none focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all" />
      </div>

      {/* Tweak Panel */}
      <div className="glass-card overflow-hidden">
        <button onClick={() => setShowTweaks(!showTweaks)} className="w-full flex items-center justify-between px-5 py-3 hover:bg-surface-200/30 transition-colors">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-surface-600">⚙ Customize</span>
            <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-primary/15 text-primary">{creditCost} credits</span>
          </div>
          {showTweaks ? <ChevronUp className="w-4 h-4 text-surface-500" /> : <ChevronDown className="w-4 h-4 text-surface-500" />}
        </button>
        {showTweaks && (
          <div className="px-5 pb-5 space-y-4 border-t border-surface-300/30 pt-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-surface-500 mb-1.5">
                  Roast Intensity: {['', 'Gentle', 'Constructive', 'Direct', 'Harsh', 'Savage'][tweaks.intensity]}
                </label>
                <input type="range" min={1} max={5} value={tweaks.intensity}
                  onChange={(e) => setTweaks((p) => ({ ...p, intensity: parseInt(e.target.value) }))}
                  className="w-full accent-orange-500" />
              </div>
              <div>
                <label className="block text-xs font-medium text-surface-500 mb-1.5">Persona</label>
                <div className="flex gap-1.5">
                  {(['marcus', 'coach', 'hr'] as const).map((p) => (
                    <button key={p} onClick={() => setTweaks((prev) => ({ ...prev, persona: p }))}
                      className={cn('px-3 py-1.5 rounded-md text-xs font-medium transition-all flex-1',
                        tweaks.persona === p ? 'bg-orange-500/20 text-orange-400' : 'bg-surface-200/50 text-surface-500 hover:bg-surface-300/50')}
                    >{p === 'marcus' ? '🔥 Marcus' : p === 'coach' ? '💼 Coach' : '📋 HR'}</button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-surface-500 mb-1.5">Target Role</label>
                <div className="flex flex-wrap gap-1.5">
                  {(['auto', 'swe', 'pm', 'designer', 'marketing', 'finance'] as const).map((r) => (
                    <button key={r} onClick={() => setTweaks((p) => ({ ...p, targetRole: r }))}
                      className={cn('px-3 py-1.5 rounded-md text-xs font-medium transition-all',
                        tweaks.targetRole === r ? 'bg-primary/20 text-primary' : 'bg-surface-200/50 text-surface-500 hover:bg-surface-300/50')}
                    >{r}</button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-surface-500 mb-1.5">
                  Priority Fixes: {tweaks.numFixes}
                  {tweaks.numFixes > 3 && <span className="text-primary"> (+{tweaks.numFixes === 5 ? 2 : 5} cr)</span>}
                </label>
                <div className="flex gap-1.5">
                  {[3, 5, 10].map((n) => (
                    <button key={n} onClick={() => setTweaks((p) => ({ ...p, numFixes: n }))}
                      className={cn('px-3 py-1.5 rounded-md text-xs font-medium transition-all',
                        tweaks.numFixes === n ? 'bg-primary/20 text-primary' : 'bg-surface-200/50 text-surface-500 hover:bg-surface-300/50')}
                    >{n}</button>
                  ))}
                </div>
              </div>
            </div>
            {/* Focus Sections */}
            <div>
              <label className="block text-xs font-medium text-surface-500 mb-1.5">Focus Sections</label>
              <div className="flex flex-wrap gap-1.5">
                {Object.entries(tweaks.focusSections).map(([key, val]) => (
                  <button key={key}
                    onClick={() => setTweaks((p) => ({ ...p, focusSections: { ...p.focusSections, [key]: !val } }))}
                    className={cn('px-3 py-1.5 rounded-md text-xs font-medium transition-all',
                      val ? 'bg-accent/20 text-accent' : 'bg-surface-200/50 text-surface-500 hover:bg-surface-300/50')}
                  >{val ? '✓ ' : ''}{key}</button>
                ))}
              </div>
            </div>
            <div className="flex items-center justify-between pt-2 border-t border-surface-300/30">
              <span className="text-xs text-surface-500">Credits: <span className="font-bold text-primary">{creditCost}</span></span>
              <button onClick={() => setTweaks(DEFAULT_TWEAKS)} className="text-xs text-surface-500 hover:text-surface-700 transition-colors flex items-center gap-1">
                <RotateCcw className="w-3 h-3" /> Reset
              </button>
            </div>
          </div>
        )}
      </div>

      {error && <div className="glass-card border-danger/30 bg-danger/5 p-4 text-sm text-danger">{error}</div>}

      <button onClick={handleSubmit} disabled={loading || !content.trim()}
        className={cn('w-full py-3 rounded-lg font-medium text-white transition-all duration-300 flex items-center justify-center gap-2',
          loading || !content.trim() ? 'bg-surface-300 cursor-not-allowed' : 'bg-gradient-to-r from-orange-500 to-red-500 hover:opacity-90')}
      >
        {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Roasting...</> : <><Flame className="w-4 h-4" /> Roast Resume — {creditCost} credits</>}
      </button>

      {result && (
        <div className="glass-card p-5 space-y-4 animate-slide-in">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-surface-800">🔥 Roast Complete</h2>
            <div className="flex items-center gap-2">
              {user?.show_provider_badge && provider && <span className="text-[10px] px-2 py-0.5 rounded-full bg-surface-200 text-surface-500">{provider}</span>}
              <button onClick={() => { navigator.clipboard.writeText(JSON.stringify(result, null, 2)); setCopied(true); setTimeout(() => setCopied(false), 2000); }}
                className="p-1.5 rounded-md hover:bg-surface-200/50 transition-colors">
                {copied ? <Check className="w-4 h-4 text-success" /> : <Copy className="w-4 h-4 text-surface-500" />}
              </button>
            </div>
          </div>

          {result.overall_score !== undefined && (
            <div className="flex items-center gap-4">
              <div className={cn('text-3xl font-bold', (result.overall_score as number) >= 70 ? 'text-success' : (result.overall_score as number) >= 40 ? 'text-warning' : 'text-danger')}>
                {String(result.overall_score)}/100
              </div>
              {result.verdict ? <p className="text-sm text-surface-600 italic">&ldquo;{String(result.verdict)}&rdquo;</p> : null}
            </div>
          )}

          {Array.isArray(result.top_fixes) && (
            <div>
              <h4 className="text-sm font-medium text-danger mb-2">🚨 Top Fixes</h4>
              <ol className="space-y-1 list-decimal list-inside">
                {(result.top_fixes as string[]).map((f, i) => (<li key={i} className="text-sm text-surface-600">{f}</li>))}
              </ol>
            </div>
          )}

          <button onClick={() => { setResult(null); setContent(''); }}
            className="text-sm text-surface-500 hover:text-primary transition-colors flex items-center gap-1"><RotateCcw className="w-3 h-3" /> Run again</button>
        </div>
      )}
    </div>
  );
}
