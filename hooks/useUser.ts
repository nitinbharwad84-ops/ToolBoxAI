'use client';

import { useState, useEffect, useCallback } from 'react';
import type { UserProfile } from '@/types';

export function useUser() {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchUser = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/user');
      if (!res.ok) throw new Error('Failed to fetch user');
      const data = await res.json();
      setUser(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchUser(); }, [fetchUser]);

  const updatePreferences = async (prefs: Partial<UserProfile>) => {
    const res = await fetch('/api/user', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(prefs),
    });
    if (res.ok) await fetchUser();
  };

  return { user, loading, error, refetch: fetchUser, updatePreferences };
}
