'use client';

import { cn } from '@/lib/utils';
import ProviderBadge from '@/components/dashboard/ProviderBadge';
import CopyButton from '@/components/ui/CopyButton';
import { RotateCcw } from 'lucide-react';

interface ResumeRoasterResultProps {
  result: Record<string, unknown>;
  provider?: string;
  showProvider?: boolean;
  onReset: () => void;
}

export default function ResumeRoasterResult({ result, provider, showProvider, onReset }: ResumeRoasterResultProps) {
  return (
    <div className="glass-card p-5 space-y-4 animate-slide-in">
      <div className="flex items-center justify-between">
        <h2 className="font-semibold text-surface-800">🔥 Roast Complete</h2>
        <div className="flex items-center gap-2">
          <ProviderBadge provider={provider ?? ''} show={showProvider} />
          <CopyButton text={JSON.stringify(result, null, 2)} iconOnly />
        </div>
      </div>

      {result.overall_score !== undefined && (
        <div className="flex items-center gap-4">
          <div className={cn('text-3xl font-bold',
            (result.overall_score as number) >= 70 ? 'text-success' :
            (result.overall_score as number) >= 40 ? 'text-warning' : 'text-danger')}>
            {String(result.overall_score)}/100
          </div>
          {result.verdict ? (
            <p className="text-sm text-surface-600 italic">&ldquo;{String(result.verdict)}&rdquo;</p>
          ) : null}
        </div>
      )}

      {Array.isArray(result.top_fixes) && (
        <div>
          <h4 className="text-sm font-medium text-danger mb-2">🚨 Top Fixes</h4>
          <ol className="space-y-1 list-decimal list-inside">
            {(result.top_fixes as string[]).map((f, i) => (
              <li key={i} className="text-sm text-surface-600">{f}</li>
            ))}
          </ol>
        </div>
      )}

      <button onClick={onReset} className="text-sm text-surface-500 hover:text-primary transition-colors flex items-center gap-1">
        <RotateCcw className="w-3 h-3" /> Run again
      </button>
    </div>
  );
}
