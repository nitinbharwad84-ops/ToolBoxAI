'use client';

import { useState, useCallback } from 'react';
import { useUser } from '@/hooks/useUser';
import { calculateCreditCost } from '@/lib/credit-calculator';
import type { SummarizerTweaks } from '@/types';
import { cn } from '@/lib/utils';
import { FileText, Upload, Send, Copy, RotateCcw, Check, Loader2, ChevronDown, ChevronUp, X } from 'lucide-react';

const DEFAULT_TWEAKS: SummarizerTweaks = {
  keyPoints: 5, outputStyle: 'bullet', focusArea: 'entire', depth: 3,
  audience: 'general', language: 'English', includeTldr: true,
  includeActionItems: true, includeSentiment: false, includeStats: true,
};

export default function SummarizerPage() {
  const { user, refetch } = useUser();
  const [content, setContent] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [tweaks, setTweaks] = useState<SummarizerTweaks>(DEFAULT_TWEAKS);
  const [result, setResult] = useState<Record<string, unknown> | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showTweaks, setShowTweaks] = useState(false);
  const [copied, setCopied] = useState(false);
  const [provider, setProvider] = useState('');

  const creditCost = calculateCreditCost('summarizer', tweaks);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) setFile(f);
  };

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
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
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
  }, [content, file, tweaks, refetch]);

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-fade-in">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500/20 to-cyan-500/20 flex items-center justify-center">
          <FileText className="w-5 h-5 text-blue-400" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-surface-800">Summarizer</h1>
          <p className="text-sm text-surface-500">Summarize documents, PDFs, and text</p>
        </div>
        <span className="ml-auto text-sm font-medium px-3 py-1 rounded-full bg-primary/15 text-primary">{creditCost} credits</span>
      </div>

      {/* File Upload */}
      <div className="glass-card p-5">
        <div className="flex items-center gap-4 mb-3">
          <label className="cursor-pointer flex items-center gap-2 px-4 py-2 rounded-lg bg-surface-200/50 hover:bg-surface-300/50 transition-colors text-sm text-surface-600">
            <Upload className="w-4 h-4" /> Upload PDF
            <input type="file" accept=".pdf,.xlsx,.xls" className="hidden" onChange={handleFileChange} />
          </label>
          {file && (
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-primary/10 text-sm text-primary">
              {file.name}
              <button onClick={() => setFile(null)}><X className="w-3 h-3" /></button>
            </div>
          )}
          <span className="text-xs text-surface-400">
            Max {user?.plan === 'pro' ? '25' : '5'}MB • PDF & Excel
          </span>
        </div>

        <div className="relative">
          <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full text-center text-xs text-surface-400 pointer-events-none">
            {!content && !file && 'OR paste text below'}
          </div>
        </div>

        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Paste your document text here..."
          className="w-full h-40 bg-surface-200/50 border border-surface-300/50 rounded-lg px-4 py-3 text-surface-700 placeholder-surface-500 resize-none focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all mt-2"
          disabled={!!file}
        />
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
              {/* Key Points */}
              <div>
                <label className="block text-xs font-medium text-surface-500 mb-1.5">Key Points: {tweaks.keyPoints}</label>
                <div className="flex gap-1.5">
                  {[3, 5, 7, 10].map((n) => (
                    <button key={n} onClick={() => setTweaks((p) => ({ ...p, keyPoints: n }))}
                      className={cn('px-3 py-1.5 rounded-md text-xs font-medium transition-all',
                        tweaks.keyPoints === n ? 'bg-primary/20 text-primary' : 'bg-surface-200/50 text-surface-500 hover:bg-surface-300/50')}
                    >{n}</button>
                  ))}
                </div>
              </div>
              {/* Output Style */}
              <div>
                <label className="block text-xs font-medium text-surface-500 mb-1.5">Output Style</label>
                <div className="flex flex-wrap gap-1.5">
                  {(['bullet', 'numbered', 'prose', 'executive', 'eli5'] as const).map((s) => (
                    <button key={s} onClick={() => setTweaks((p) => ({ ...p, outputStyle: s }))}
                      className={cn('px-3 py-1.5 rounded-md text-xs font-medium transition-all',
                        tweaks.outputStyle === s ? 'bg-primary/20 text-primary' : 'bg-surface-200/50 text-surface-500 hover:bg-surface-300/50')}
                    >{s}</button>
                  ))}
                </div>
              </div>
              {/* Depth slider */}
              <div>
                <label className="block text-xs font-medium text-surface-500 mb-1.5">
                  Depth: {['', 'Very Brief', 'Brief', 'Standard', 'Detailed', 'Comprehensive'][tweaks.depth]}
                  {tweaks.depth > 3 && <span className="text-primary"> (+{tweaks.depth - 3} cr)</span>}
                </label>
                <input type="range" min={1} max={5} value={tweaks.depth}
                  onChange={(e) => setTweaks((p) => ({ ...p, depth: parseInt(e.target.value) }))}
                  className="w-full accent-primary" />
              </div>
              {/* Audience */}
              <div>
                <label className="block text-xs font-medium text-surface-500 mb-1.5">Target Audience</label>
                <div className="flex flex-wrap gap-1.5">
                  {(['general', 'executive', 'technical', 'student', 'legal'] as const).map((a) => (
                    <button key={a} onClick={() => setTweaks((p) => ({ ...p, audience: a }))}
                      className={cn('px-3 py-1.5 rounded-md text-xs font-medium transition-all',
                        tweaks.audience === a ? 'bg-primary/20 text-primary' : 'bg-surface-200/50 text-surface-500 hover:bg-surface-300/50')}
                    >{a}</button>
                  ))}
                </div>
              </div>
            </div>
            {/* Toggles */}
            <div className="flex flex-wrap gap-3">
              {[
                { key: 'includeTldr', label: 'TLDR' },
                { key: 'includeActionItems', label: 'Action Items' },
                { key: 'includeSentiment', label: 'Sentiment' },
                { key: 'includeStats', label: 'Key Stats' },
              ].map(({ key, label }) => (
                <button key={key}
                  onClick={() => setTweaks((p) => ({ ...p, [key]: !p[key as keyof SummarizerTweaks] }))}
                  className={cn('px-3 py-1.5 rounded-md text-xs font-medium transition-all',
                    tweaks[key as keyof SummarizerTweaks] ? 'bg-accent/20 text-accent' : 'bg-surface-200/50 text-surface-500 hover:bg-surface-300/50')}
                >
                  {tweaks[key as keyof SummarizerTweaks] ? '✓ ' : ''}{label}
                </button>
              ))}
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

      <button onClick={handleSubmit} disabled={loading || (!content.trim() && !file)}
        className={cn('w-full py-3 rounded-lg font-medium text-white transition-all duration-300 flex items-center justify-center gap-2',
          loading || (!content.trim() && !file) ? 'bg-surface-300 cursor-not-allowed' : 'bg-gradient-to-r from-primary to-accent hover:opacity-90 glow-primary')}
      >
        {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Summarizing...</> : <><Send className="w-4 h-4" /> Summarize — {creditCost} credits</>}
      </button>

      {result && (
        <div className="glass-card p-5 space-y-4 animate-slide-in">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-surface-800">📝 Summary</h2>
            <div className="flex items-center gap-2">
              {user?.show_provider_badge && provider && <span className="text-[10px] px-2 py-0.5 rounded-full bg-surface-200 text-surface-500">Powered by {provider}</span>}
              <button onClick={() => { navigator.clipboard.writeText(JSON.stringify(result, null, 2)); setCopied(true); setTimeout(() => setCopied(false), 2000); }}
                className="p-1.5 rounded-md hover:bg-surface-200/50 transition-colors">
                {copied ? <Check className="w-4 h-4 text-success" /> : <Copy className="w-4 h-4 text-surface-500" />}
              </button>
            </div>
          </div>

          {result.title ? <h3 className="text-lg font-semibold text-surface-700">{String(result.title)}</h3> : null}
          {result.tldr ? <div className="bg-primary/5 rounded-lg p-3 text-sm text-surface-600"><span className="font-medium text-primary">TLDR: </span>{String(result.tldr)}</div> : null}
          {Array.isArray(result.key_points) && (
            <div>
              <h4 className="text-sm font-medium text-surface-600 mb-2">Key Points</h4>
              <ul className="space-y-1.5">
                {(result.key_points as string[]).map((p, i) => (
                  <li key={i} className="text-sm text-surface-600 flex items-start gap-2"><span className="text-primary mt-0.5">•</span>{p}</li>
                ))}
              </ul>
            </div>
          )}
          {Array.isArray(result.action_items) && (result.action_items as string[]).length > 0 && (
            <div>
              <h4 className="text-sm font-medium text-surface-600 mb-2">Action Items</h4>
              <ul className="space-y-1">{(result.action_items as string[]).map((a, i) => (<li key={i} className="text-sm text-accent flex items-start gap-2"><span className="mt-0.5">→</span>{a}</li>))}</ul>
            </div>
          )}
          {result.sentiment ? <p className="text-sm text-surface-500">Sentiment: <span className="font-medium text-surface-600">{String(result.sentiment)}</span></p> : null}

          <button onClick={() => { setResult(null); setContent(''); setFile(null); }}
            className="text-sm text-surface-500 hover:text-primary transition-colors flex items-center gap-1"><RotateCcw className="w-3 h-3" /> Run again</button>
        </div>
      )}
    </div>
  );
}
