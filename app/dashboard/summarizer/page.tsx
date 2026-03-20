'use client';

import { useState, useCallback } from 'react';
import { useUser } from '@/hooks/useUser';
import { calculateCreditCost } from '@/lib/credit-calculator';
import type { SummarizerTweaks } from '@/types';
import { cn } from '@/lib/utils';
import { FileText, Send, Loader2 } from 'lucide-react';
import TweakPanel from '@/components/tools/TweakPanel';
import MultiToggle from '@/components/tools/MultiToggle';
import LiveCreditCost from '@/components/tools/LiveCreditCost';
import PresetManager from '@/components/tools/PresetManager';
import FileDropzone from '@/components/tools/FileDropzone';
import CheckboxGroup from '@/components/tools/CheckboxGroup';
import SummarizerResult from '@/components/tools/ResultCard/SummarizerResult';

const DEFAULT_TWEAKS: SummarizerTweaks = {
  keyPoints: 5, outputStyle: 'bullet', focusArea: 'entire', depth: 3,
  audience: 'general', language: 'English', includeTldr: true,
  includeActionItems: true, includeSentiment: false, includeStats: true,
};

const STYLE_OPTIONS = ['bullet', 'numbered', 'prose', 'executive', 'eli5'].map(v => ({ value: v, label: v }));
const AUDIENCE_OPTIONS = ['general', 'executive', 'technical', 'student', 'legal'].map(v => ({ value: v, label: v }));

export default function SummarizerPage() {
  const { user, refetch } = useUser();
  const [content, setContent] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [tweaks, setTweaks] = useState<SummarizerTweaks>(DEFAULT_TWEAKS);
  const [result, setResult] = useState<Record<string, unknown> | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [provider, setProvider] = useState('');

  const creditCost = calculateCreditCost('summarizer', tweaks);
  const maxSizeMb = user?.plan === 'pro' ? 25 : 5;

  const handleSubmit = useCallback(async () => {
    if (!content.trim() && !file) { setError('Please paste content or upload a file.'); return; }
    setLoading(true); setError(''); setResult(null);

    const body: Record<string, unknown> = { tweaks };
    if (file) {
      const buffer = await file.arrayBuffer();
      body.fileBase64 = Buffer.from(buffer).toString('base64');
      body.fileName = file.name;
      body.fileType = file.type;
    } else {
      body.content = content;
    }

    try {
      const res = await fetch('/api/tools/summarize', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.message || data.error); return; }
      setResult(data.result); setProvider(data.provider); refetch();
    } catch {
      setError('Something went wrong.');
    } finally {
      setLoading(false);
    }
  }, [content, file, tweaks, refetch]);

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500/20 to-cyan-500/20 flex items-center justify-center">
          <FileText className="w-5 h-5 text-blue-400" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-surface-800">Summarizer</h1>
          <p className="text-sm text-surface-500">Summarize documents, PDFs, and text</p>
        </div>
        <LiveCreditCost cost={creditCost} className="ml-auto" />
      </div>

      {/* File Upload */}
      <div className="glass-card p-5 space-y-3">
        <FileDropzone accept=".pdf,.xlsx,.xls" maxSizeMb={maxSizeMb} file={file} onFileChange={setFile} disabled={!!content.trim()} />
        {!file && (
          <textarea
            value={content} onChange={(e) => setContent(e.target.value)}
            placeholder="Or paste your document text here..."
            className="w-full h-40 bg-surface-200/50 border border-surface-300/50 rounded-lg px-4 py-3 text-surface-700 placeholder-surface-500 resize-none focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
          />
        )}
      </div>

      {/* Tweak Panel */}
      <TweakPanel creditCost={creditCost} onReset={() => setTweaks(DEFAULT_TWEAKS)}>
        <PresetManager
          toolName="summarizer" isPro={user?.plan === 'pro'}
          currentConfig={tweaks as unknown as Record<string, unknown>}
          onLoad={(c) => setTweaks(c as unknown as SummarizerTweaks)}
        />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-surface-500 mb-1.5">Key Points: {tweaks.keyPoints}</label>
            <MultiToggle
              options={[3, 5, 7, 10].map(n => ({ value: String(n), label: String(n) }))}
              value={String(tweaks.keyPoints)}
              onChange={(v) => setTweaks(p => ({ ...p, keyPoints: parseInt(v) }))}
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-surface-500 mb-1.5">Output Style</label>
            <MultiToggle options={STYLE_OPTIONS} value={tweaks.outputStyle} onChange={(v) => setTweaks(p => ({ ...p, outputStyle: v as SummarizerTweaks['outputStyle'] }))} />
          </div>
          <div>
            <label className="block text-xs font-medium text-surface-500 mb-1.5">
              Depth: {['', 'Very Brief', 'Brief', 'Standard', 'Detailed', 'Comprehensive'][tweaks.depth]}
              {tweaks.depth > 3 && <span className="text-primary"> (+{tweaks.depth - 3} cr)</span>}
            </label>
            <input type="range" min={1} max={5} value={tweaks.depth}
              onChange={(e) => setTweaks(p => ({ ...p, depth: parseInt(e.target.value) }))}
              className="w-full accent-primary" />
          </div>
          <div>
            <label className="block text-xs font-medium text-surface-500 mb-1.5">Target Audience</label>
            <MultiToggle options={AUDIENCE_OPTIONS} value={tweaks.audience} onChange={(v) => setTweaks(p => ({ ...p, audience: v as SummarizerTweaks['audience'] }))} />
          </div>
        </div>
        <CheckboxGroup
          options={{ TLDR: tweaks.includeTldr, 'Action Items': tweaks.includeActionItems, Sentiment: tweaks.includeSentiment, 'Key Stats': tweaks.includeStats }}
          onChange={(key, val) => {
            const map: Record<string, keyof SummarizerTweaks> = { TLDR: 'includeTldr', 'Action Items': 'includeActionItems', Sentiment: 'includeSentiment', 'Key Stats': 'includeStats' };
            setTweaks(p => ({ ...p, [map[key]]: val }));
          }}
        />
      </TweakPanel>

      {/* Error */}
      {error && <div className="glass-card border-danger/30 bg-danger/5 p-4 text-sm text-danger">{error}</div>}

      {/* Submit */}
      <button onClick={handleSubmit} disabled={loading || (!content.trim() && !file)}
        className={cn('w-full py-3 rounded-lg font-medium text-white transition-all duration-300 flex items-center justify-center gap-2',
          loading || (!content.trim() && !file) ? 'bg-surface-300 cursor-not-allowed' : 'bg-gradient-to-r from-primary to-accent hover:opacity-90 glow-primary')}
      >
        {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Summarizing...</> : <><Send className="w-4 h-4" /> Summarize — {creditCost} credits</>}
      </button>

      {/* Result */}
      {result && (
        <SummarizerResult
          result={result} provider={provider}
          showProvider={user?.show_provider_badge}
          onReset={() => { setResult(null); setContent(''); setFile(null); }}
        />
      )}
    </div>
  );
}
