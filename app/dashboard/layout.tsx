import type { Metadata } from 'next';
import Sidebar from '@/components/dashboard/Sidebar';
import DashboardProviders from '@/components/dashboard/DashboardProviders';

export const metadata: Metadata = {
  title: 'Dashboard — ToolboxAI',
  description: 'Your AI productivity dashboard. Summarize documents, roast resumes, and transform emails.',
  robots: { index: false, follow: false },
};

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <DashboardProviders>
      <div className="flex min-h-screen">
        <Sidebar />
        <main className="flex-1 overflow-x-hidden">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {children}
          </div>
        </main>
      </div>
    </DashboardProviders>
  );
}
