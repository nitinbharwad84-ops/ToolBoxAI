'use client';

import { ToastProvider } from '@/hooks/useToast';
import ToastContainer from '@/components/ui/ToastContainer';
import type { ReactNode } from 'react';

export default function DashboardProviders({ children }: { children: ReactNode }) {
  return (
    <ToastProvider>
      {children}
      <ToastContainer />
    </ToastProvider>
  );
}
