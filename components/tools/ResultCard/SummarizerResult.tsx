'use client';

import ProviderBadge from '@/components/dashboard/ProviderBadge';
import { Copy, Check, RotateCcw } from 'lucide-react';
import { useState } from 'react';

interface SummarizerResultProps {
  result: Record<string, unknown>;
  provider?: string;
  showProvider?: boolean;
  onReset: () => void;
}

export default function SummarizerResult({ result, provider, showProvider, onReset }: SummarizerResultProps) {
  const [copied, setCopied] = useState(false);

  const copy = () => {
    navigator.clipboard.writeText(JSON.stringify(result, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="glass-card p-5 space-y-4 animate-slide-in">
      <div className="flex items-center justify-between">
        <h2 className="font-semibold text-surface-800">📝 Summary</h2>
        <div className="flex items-center gap-2">
          <ProviderBadge provider={provider ?? ''} show={showProvider} />
          <button onClick={copy} className="p-1.5 rounded-md hover:bg-surface-200/50 transition-colors">
            {copied ? <Check className="w-4 h-4 text-success" /> : <Copy className="w-4 h-4 text-surface-500" />}
          </button>
        </div>
      </div>

      {result.title ? <h3 className="text-lg font-semibold text-surface-700">{String(result.title)}</h3> : null}
      {result.tldr ? (
        <div className="bg-primary/5 rounded-lg p-3 text-sm text-surface-600">
          <span className="font-medium text-primary">TLDR: </span>{String(result.tldr)}
        </div>
      ) : null}

      {Array.isArray(result.key_points) && (
        <div>
          <h4 className="text-sm font-medium text-surface-600 mb-2">Key Points</h4>
          <ul className="space-y-1.5">
            {(result.key_points as string[]).map((p, i) => (
              <li key={i} className="text-sm text-surface-600 flex items-start gap-2">
                <span className="text-primary mt-0.5">•</span>{p}
              </li>
            ))}
          </ul>
        </div>
      )}

      {Array.isArray(result.action_items) && (result.action_items as string[]).length > 0 && (
        <div>
          <h4 className="text-sm font-medium text-surface-600 mb-2">Action Items</h4>
          <ul className="space-y-1">
            {(result.action_items as string[]).map((a, i) => (
              <li key={i} className="text-sm text-accent flex items-start gap-2">
                <span className="mt-0.5">→</span>{a}
              </li>
            ))}
          </ul>
        </div>
      )}

      {result.sentiment ? (
        <p className="text-sm text-surface-500">
          Sentiment: <span className="font-medium text-surface-600">{String(result.sentiment)}</span>
        </p>
      ) : null}

      <button onClick={onReset} className="text-sm text-surface-500 hover:text-primary transition-colors flex items-center gap-1">
        <RotateCcw className="w-3 h-3" /> Run again
      </button>
    </div>
  );
}
