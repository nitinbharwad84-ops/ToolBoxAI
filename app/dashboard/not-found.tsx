import Link from 'next/link';
import { ArrowLeft, Search } from 'lucide-react';

export default function DashboardNotFound() {
  return (
    <div className="flex items-center justify-center min-h-[60vh] animate-fade-in">
      <div className="text-center space-y-5 max-w-sm">
        <div className="relative mx-auto w-fit">
          <p className="text-7xl font-black text-surface-200/50 select-none">404</p>
          <Search className="w-8 h-8 text-primary absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
        </div>
        <h1 className="text-xl font-bold text-surface-800">Tool not found</h1>
        <p className="text-sm text-surface-500">
          This dashboard page doesn&apos;t exist. Check the sidebar for available tools.
        </p>
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-primary to-accent text-white font-medium text-sm hover:opacity-90 transition-opacity"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Dashboard
        </Link>
      </div>
    </div>
  );
}
