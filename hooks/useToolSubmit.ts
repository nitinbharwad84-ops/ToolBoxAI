'use client';

import { useState, useCallback } from 'react';
import { useUser } from '@/hooks/useUser';
import { useToast } from '@/hooks/useToast';

interface UseToolSubmitOptions {
  endpoint: string;
  toolName: string;
  successTitle: string;
}

interface ToolResult {
  result: Record<string, unknown> | null;
  provider: string;
  creditsUsed: number;
  loading: boolean;
  error: string;
  submit: (body: Record<string, unknown>) => Promise<void>;
  reset: () => void;
}

export function useToolSubmit({ endpoint, toolName, successTitle }: UseToolSubmitOptions): ToolResult {
  const { refetch } = useUser();
  const { addToast } = useToast();
  const [result, setResult] = useState<Record<string, unknown> | null>(null);
  const [provider, setProvider] = useState('');
  const [creditsUsed, setCreditsUsed] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const submit = useCallback(async (body: Record<string, unknown>) => {
    setLoading(true);
    setError('');
    setResult(null);

    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const data = await res.json();

      if (!res.ok) {
        const msg = data.message || data.error || `${toolName} failed`;
        setError(msg);
        addToast({ type: 'error', title: `${toolName} failed`, message: msg });
        return;
      }

      setResult(data.result);
      setProvider(data.provider ?? '');
      setCreditsUsed(data.creditsUsed ?? 0);
      refetch();
      addToast({
        type: 'success',
        title: successTitle,
        message: `Used ${data.creditsUsed ?? 0} credits via ${data.provider ?? 'AI'}`,
      });
    } catch {
      setError('Something went wrong. Please try again.');
      addToast({ type: 'error', title: 'Network error', message: 'Could not reach the server.' });
    } finally {
      setLoading(false);
    }
  }, [endpoint, toolName, successTitle, refetch, addToast]);

  const reset = useCallback(() => {
    setResult(null);
    setError('');
    setProvider('');
    setCreditsUsed(0);
  }, []);

  return { result, provider, creditsUsed, loading, error, submit, reset };
}
