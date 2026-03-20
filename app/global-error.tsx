'use client';

import { AlertTriangle, RotateCcw, Home } from 'lucide-react';
import Link from 'next/link';

export default function GlobalError({ error, reset }: { error: Error; reset: () => void }) {
  return (
    <html>
      <body className="min-h-screen flex items-center justify-center bg-surface-100">
        <div className="max-w-md text-center space-y-4 p-8">
          <div className="w-14 h-14 rounded-xl bg-danger/15 flex items-center justify-center mx-auto">
            <AlertTriangle className="w-7 h-7 text-danger" />
          </div>
          <h2 className="text-lg font-bold text-surface-800">Something went wrong</h2>
          <p className="text-sm text-surface-500">{error.message || 'An unexpected error occurred.'}</p>
          <div className="flex items-center gap-3 justify-center">
            <button
              onClick={reset}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary/15 text-primary text-sm font-medium hover:bg-primary/25 transition-colors"
            >
              <RotateCcw className="w-4 h-4" /> Try Again
            </button>
            <Link
              href="/"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-surface-200 text-surface-700 text-sm font-medium hover:bg-surface-300 transition-colors"
            >
              <Home className="w-4 h-4" /> Home
            </Link>
          </div>
        </div>
      </body>
    </html>
  );
}
