import Link from 'next/link';
import { FileSearch, ArrowLeft } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="max-w-md text-center space-y-4">
        <div className="w-14 h-14 rounded-xl bg-surface-200/50 flex items-center justify-center mx-auto">
          <FileSearch className="w-7 h-7 text-surface-400" />
        </div>
        <h1 className="text-6xl font-bold gradient-text">404</h1>
        <h2 className="text-lg font-semibold text-surface-800">Page Not Found</h2>
        <p className="text-sm text-surface-500">The page you&apos;re looking for doesn&apos;t exist or has been moved.</p>
        <Link
          href="/"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-primary to-accent text-white text-sm font-medium hover:opacity-90 transition-opacity"
        >
          <ArrowLeft className="w-4 h-4" /> Back Home
        </Link>
      </div>
    </div>
  );
}
