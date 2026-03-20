'use client';

import { useState, useCallback } from 'react';
import { useUser } from '@/hooks/useUser';
import { calculateCreditCost } from '@/lib/credit-calculator';
import type { ResumeRoasterTweaks } from '@/types';
import { cn } from '@/lib/utils';
import { Flame, Send, Loader2, Lock } from 'lucide-react';
import TweakPanel from '@/components/tools/TweakPanel';
import MultiToggle from '@/components/tools/MultiToggle';
import LiveCreditCost from '@/components/tools/LiveCreditCost';
import PresetManager from '@/components/tools/PresetManager';
import CheckboxGroup from '@/components/tools/CheckboxGroup';
import ResumeRoasterResult from '@/components/tools/ResultCard/ResumeRoasterResult';

const DEFAULT_TWEAKS: ResumeRoasterTweaks = {
  intensity: 3, targetRole: 'auto', targetRoleCustom: '', experienceLevel: 'auto',
  companyTarget: 'any', focusSections: { summary: true, experience: true, skills: true, education: true, atsCheck: true, formatting: true },
  rewriteBullets: true, numFixes: 3, persona: 'marcus', language: 'English',
};

const ROLE_OPTIONS = ['auto', 'swe', 'pm', 'designer', 'marketing', 'finance'].map(v => ({ value: v, label: v }));
const EXP_OPTIONS = ['auto', 'entry', 'mid', 'senior', 'executive'].map(v => ({ value: v, label: v }));
const COMPANY_OPTIONS = ['any', 'faang', 'startup', 'consulting', 'govt'].map(v => ({ value: v, label: v }));
const PERSONA_OPTIONS = [
  { value: 'marcus', label: '🔥 Marcus (brutal)' },
  { value: 'coach', label: '🎯 Career Coach' },
  { value: 'hr', label: '📋 HR Manager' },
];

export default function ResumeRoasterPage() {
  const { user, refetch } = useUser();
  const [resumeText, setResumeText] = useState('');
  const [tweaks, setTweaks] = useState<ResumeRoasterTweaks>(DEFAULT_TWEAKS);
  const [result, setResult] = useState<Record<string, unknown> | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [provider, setProvider] = useState('');

  const creditCost = calculateCreditCost('resume_roaster', tweaks);
  const isPro = user?.plan === 'pro';

  const handleSubmit = useCallback(async () => {
    if (!resumeText.trim()) { setError('Please paste your resume content.'); return; }
    setLoading(true); setError(''); setResult(null);
    try {
      const res = await fetch('/api/tools/resume-roast', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: resumeText, tweaks }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.message || data.error); return; }
      setResult(data.result); setProvider(data.provider); refetch();
    } catch {
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [resumeText, tweaks, refetch]);

  /* Pro gate */
  if (!isPro && user !== null) {
    return (
      <div className="max-w-4xl mx-auto flex items-center justify-center min-h-[60vh]">
        <div className="glass-card p-8 text-center space-y-4 max-w-md">
          <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-orange-500/20 to-red-500/20 flex items-center justify-center mx-auto">
            <Lock className="w-7 h-7 text-orange-400" />
          </div>
          <h2 className="text-xl font-bold text-surface-800">Resume Roaster is Pro Only</h2>
          <p className="text-sm text-surface-500">Upgrade to Pro to get brutal resume feedback from our AI reviewers.</p>
          <a href="/dashboard/billing" className="block py-2.5 rounded-lg bg-gradient-to-r from-primary to-accent text-white font-medium hover:opacity-90 transition-opacity">
            Upgrade to Pro — ₹999/mo
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-orange-500/20 to-red-500/20 flex items-center justify-center">
          <Flame className="w-5 h-5 text-orange-400" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-surface-800">Resume Roaster</h1>
          <p className="text-sm text-surface-500">Get brutally honest resume feedback</p>
        </div>
        <LiveCreditCost cost={creditCost} className="ml-auto" />
      </div>

      {/* Input */}
      <div className="glass-card p-5">
        <label className="block text-sm font-medium text-surface-600 mb-2">Paste your resume text</label>
        <textarea
          value={resumeText} onChange={(e) => setResumeText(e.target.value)}
          placeholder="Paste your resume content here..."
          className="w-full h-48 bg-surface-200/50 border border-surface-300/50 rounded-lg px-4 py-3 text-surface-700 placeholder-surface-500 resize-none focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
        />
      </div>

      {/* Tweak Panel */}
      <TweakPanel creditCost={creditCost} onReset={() => setTweaks(DEFAULT_TWEAKS)}>
        <PresetManager
          toolName="resume_roaster" isPro={isPro ?? false}
          currentConfig={tweaks as unknown as Record<string, unknown>}
          onLoad={(c) => setTweaks(c as unknown as ResumeRoasterTweaks)}
        />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-surface-500 mb-1.5">
              Roast Intensity: {['', 'Gentle', 'Mild', 'Standard', 'Harsh', 'Savage'][tweaks.intensity]}
            </label>
            <input type="range" min={1} max={5} value={tweaks.intensity}
              onChange={(e) => setTweaks(p => ({ ...p, intensity: parseInt(e.target.value) }))}
              className="w-full accent-primary" />
          </div>
          <div>
            <label className="block text-xs font-medium text-surface-500 mb-1.5">Reviewer Persona</label>
            <MultiToggle options={PERSONA_OPTIONS} value={tweaks.persona} onChange={(v) => setTweaks(p => ({ ...p, persona: v as ResumeRoasterTweaks['persona'] }))} />
          </div>
          <div>
            <label className="block text-xs font-medium text-surface-500 mb-1.5">Target Role</label>
            <MultiToggle options={ROLE_OPTIONS} value={tweaks.targetRole} onChange={(v) => setTweaks(p => ({ ...p, targetRole: v as ResumeRoasterTweaks['targetRole'] }))} />
          </div>
          <div>
            <label className="block text-xs font-medium text-surface-500 mb-1.5">Experience Level</label>
            <MultiToggle options={EXP_OPTIONS} value={tweaks.experienceLevel} onChange={(v) => setTweaks(p => ({ ...p, experienceLevel: v as ResumeRoasterTweaks['experienceLevel'] }))} />
          </div>
          <div>
            <label className="block text-xs font-medium text-surface-500 mb-1.5">Company Target</label>
            <MultiToggle options={COMPANY_OPTIONS} value={tweaks.companyTarget} onChange={(v) => setTweaks(p => ({ ...p, companyTarget: v as ResumeRoasterTweaks['companyTarget'] }))} />
          </div>
          <div>
            <label className="block text-xs font-medium text-surface-500 mb-1.5">Priority Fixes: {tweaks.numFixes}</label>
            <MultiToggle
              options={[{ value: '3', label: '3' }, { value: '5', label: '5 (+2cr)' }, { value: '10', label: '10 (+5cr)' }]}
              value={String(tweaks.numFixes)}
              onChange={(v) => setTweaks(p => ({ ...p, numFixes: parseInt(v) }))}
            />
          </div>
        </div>
        <CheckboxGroup
          options={tweaks.focusSections}
          onChange={(key, val) => setTweaks(p => ({ ...p, focusSections: { ...p.focusSections, [key]: val } }))}
        />
      </TweakPanel>

      {/* Error */}
      {error && <div className="glass-card border-danger/30 bg-danger/5 p-4 text-sm text-danger">{error}</div>}

      {/* Submit */}
      <button onClick={handleSubmit} disabled={loading || !resumeText.trim()}
        className={cn('w-full py-3 rounded-lg font-medium text-white transition-all duration-300 flex items-center justify-center gap-2',
          loading || !resumeText.trim() ? 'bg-surface-300 cursor-not-allowed' : 'bg-gradient-to-r from-primary to-accent hover:opacity-90 glow-primary')}
      >
        {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Roasting...</> : <><Send className="w-4 h-4" /> Roast Resume — {creditCost} credits</>}
      </button>

      {/* Result */}
      {result && (
        <ResumeRoasterResult
          result={result} provider={provider}
          showProvider={user?.show_provider_badge}
          onReset={() => { setResult(null); setResumeText(''); }}
        />
      )}
    </div>
  );
}
