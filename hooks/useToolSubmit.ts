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
      // Vercel/Next.js Body Size Limit Check (Base64 overhead is ~33%)
      const base64 = (body as any).fileBase64;
      if (base64 && base64.length > 4.4 * 1024 * 1024) {
        throw new Error('FILE_TOO_LARGE: The encoded file is too large for the server (Max ~3MB PDF). Try a smaller file.');
      }

      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      
      const responseText = await res.text();
      let data;
      try {
        data = JSON.parse(responseText);
      } catch (e) {
        console.error('API Response was not JSON:', res.status, responseText.slice(0, 500));
        throw new Error(`Server returned HTML or invalid JSON (Status ${res.status})`);
      }

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
