'use client';

import ProviderBadge from '@/components/dashboard/ProviderBadge';
import CopyButton from '@/components/ui/CopyButton';
import { RotateCcw } from 'lucide-react';

interface EmailPacifierResultProps {
  result: Record<string, unknown>;
  provider?: string;
  showProvider?: boolean;
  onReset: () => void;
}

export default function EmailPacifierResult({ result, provider, showProvider, onReset }: EmailPacifierResultProps) {
  return (
    <div className="glass-card p-5 space-y-4 animate-slide-in">
      <div className="flex items-center justify-between">
        <h2 className="font-semibold text-surface-800">📧 Pacified Email</h2>
        <div className="flex items-center gap-2">
          <ProviderBadge provider={provider ?? ''} show={showProvider} />
          <CopyButton text={JSON.stringify(result, null, 2)} iconOnly />
        </div>
      </div>

      {result.analysis ? (
        <div className="bg-primary/5 rounded-lg p-3 text-sm text-surface-600">
          <span className="font-medium text-primary">Analysis: </span>{String(result.analysis)}
        </div>
      ) : null}

      {result.rewritten_email ? (
        <div className="bg-surface-200/30 rounded-lg p-4">
          <h4 className="text-xs font-medium text-surface-500 mb-2">Rewritten Email</h4>
          <p className="text-sm text-surface-700 whitespace-pre-wrap">{String(result.rewritten_email)}</p>
        </div>
      ) : null}

      {Array.isArray(result.alternatives) && (result.alternatives as string[]).length > 0 && (
        <div className="space-y-3">
          <h4 className="text-xs font-medium text-surface-500">Alternatives</h4>
          {(result.alternatives as string[]).map((alt, i) => (
            <div key={i} className="bg-surface-200/20 rounded-lg p-3 text-sm text-surface-600 whitespace-pre-wrap">
              <span className="text-xs font-medium text-surface-400 mb-1 block">Option {i + 2}</span>
              {alt}
            </div>
          ))}
        </div>
      )}

      {result.subject_line ? (
        <p className="text-sm text-surface-500">
          Suggested subject: <span className="font-medium text-surface-700">{String(result.subject_line)}</span>
        </p>
      ) : null}

      <button onClick={onReset} className="text-sm text-surface-500 hover:text-primary transition-colors flex items-center gap-1">
        <RotateCcw className="w-3 h-3" /> Run again
      </button>
    </div>
  );
}
