'use client';

import { useCallback, useEffect, useRef } from 'react';

export function useAutoResize(minHeight = 160, maxHeight = 400) {
  const ref = useRef<HTMLTextAreaElement>(null);

  const resize = useCallback(() => {
    const el = ref.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = `${Math.min(Math.max(el.scrollHeight, minHeight), maxHeight)}px`;
  }, [minHeight, maxHeight]);

  useEffect(() => { resize(); }, [resize]);

  return { ref, resize };
}
