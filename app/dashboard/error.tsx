'use client';

import { useEffect } from 'react';
import { AlertTriangle, RefreshCw, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('[Dashboard Error]', error);
  }, [error]);

  return (
    <div className="flex items-center justify-center min-h-[60vh] animate-fade-in">
      <div className="text-center space-y-5 max-w-md">
        <div className="w-14 h-14 rounded-xl bg-danger/15 flex items-center justify-center mx-auto">
          <AlertTriangle className="w-7 h-7 text-danger" />
        </div>
        <h1 className="text-xl font-bold text-surface-800">Something went wrong</h1>
        <p className="text-sm text-surface-500">
          {error.message || 'An unexpected error occurred. Your data is safe.'}
        </p>
        {error.digest && (
          <p className="text-xs text-surface-400 font-mono">Error ID: {error.digest}</p>
        )}
        <div className="flex items-center justify-center gap-3 pt-2">
          <Link
            href="/dashboard"
            className="flex items-center gap-2 px-4 py-2 rounded-lg border border-surface-300 text-surface-700 font-medium text-sm hover:bg-surface-200/50 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> Dashboard
          </Link>
          <button
            onClick={reset}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-primary to-accent text-white font-medium text-sm hover:opacity-90 transition-opacity"
          >
            <RefreshCw className="w-4 h-4" /> Try Again
          </button>
        </div>
      </div>
    </div>
  );
}
