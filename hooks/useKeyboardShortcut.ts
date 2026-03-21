'use client';

import { useEffect, useCallback, useRef } from 'react';

export function useKeyboardShortcut(
  key: string,
  callback: () => void,
  options: { ctrlOrMeta?: boolean; disabled?: boolean } = {},
) {
  const { ctrlOrMeta = false, disabled = false } = options;
  const callbackRef = useRef(callback);
  callbackRef.current = callback;

  const handler = useCallback(
    (e: KeyboardEvent) => {
      if (disabled) return;
      if (ctrlOrMeta && !(e.ctrlKey || e.metaKey)) return;
      if (e.key !== key) return;
      e.preventDefault();
      callbackRef.current();
    },
    [key, ctrlOrMeta, disabled],
  );

  useEffect(() => {
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [handler]);
}
