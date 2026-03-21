'use client';

import { useEffect } from 'react';
import { AlertTriangle, RefreshCw, ArrowLeft } from 'lucide-react';
import { Zap } from 'lucide-react';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('[Global Error]', error);
  }, [error]);

  return (
    <html lang="en">
      <body style={{ margin: 0, fontFamily: 'system-ui, -apple-system, sans-serif', background: '#18181b', color: '#a1a1aa', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center', maxWidth: '28rem', padding: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', marginBottom: '2rem' }}>
            <div style={{ width: '2.5rem', height: '2.5rem', borderRadius: '0.5rem', background: 'linear-gradient(135deg, #3b82f6, #10b981)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Zap style={{ width: '1.25rem', height: '1.25rem', color: 'white' }} />
            </div>
            <span style={{ fontWeight: 'bold', fontSize: '1.25rem', color: '#e4e4e7' }}>ToolboxAI</span>
          </div>

          <div style={{ width: '3.5rem', height: '3.5rem', borderRadius: '0.75rem', background: 'rgba(239,68,68,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem' }}>
            <AlertTriangle style={{ width: '1.75rem', height: '1.75rem', color: '#ef4444' }} />
          </div>

          <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#e4e4e7', margin: '0 0 0.75rem' }}>Critical Error</h1>
          <p style={{ fontSize: '0.875rem', margin: '0 0 1.5rem' }}>
            Something went seriously wrong. This error has been logged.
          </p>
          {error.digest && (
            <p style={{ fontSize: '0.75rem', fontFamily: 'monospace', marginBottom: '1.5rem', opacity: 0.7 }}>
              Error: {error.digest}
            </p>
          )}

          <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center' }}>
            <a
              href="/"
              style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.625rem 1rem', borderRadius: '0.5rem', border: '1px solid #3f3f46', color: '#d4d4d8', fontWeight: 500, fontSize: '0.875rem', textDecoration: 'none' }}
            >
              <ArrowLeft style={{ width: '1rem', height: '1rem' }} /> Home
            </a>
            <button
              onClick={reset}
              style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.625rem 1rem', borderRadius: '0.5rem', background: 'linear-gradient(90deg, #3b82f6, #10b981)', color: 'white', fontWeight: 500, fontSize: '0.875rem', border: 'none', cursor: 'pointer' }}
            >
              <RefreshCw style={{ width: '1rem', height: '1rem' }} /> Retry
            </button>
          </div>
        </div>
      </body>
    </html>
  );
}
