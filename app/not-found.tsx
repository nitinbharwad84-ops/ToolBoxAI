import Link from 'next/link';
import { Zap, ArrowLeft, Search } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-surface-50 flex items-center justify-center px-4">
      <div className="text-center space-y-6 max-w-md">
        {/* Logo */}
        <div className="flex items-center justify-center gap-2 mb-8">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center">
            <Zap className="w-5 h-5 text-white" />
          </div>
          <span className="font-bold text-xl text-surface-800">
            Toolbox<span className="gradient-text">AI</span>
          </span>
        </div>

        {/* 404 */}
        <div className="relative">
          <p className="text-8xl font-black text-surface-200/50 select-none">404</p>
          <Search className="w-10 h-10 text-primary absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
        </div>

        <h1 className="text-2xl font-bold text-surface-800">Page not found</h1>
        <p className="text-surface-500">
          The page you&apos;re looking for doesn&apos;t exist or has been moved.
        </p>

        <div className="flex items-center justify-center gap-3 pt-2">
          <Link
            href="/"
            className="flex items-center gap-2 px-5 py-2.5 rounded-lg border border-surface-300 text-surface-700 font-medium hover:bg-surface-200/50 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> Home
          </Link>
          <Link
            href="/dashboard"
            className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-gradient-to-r from-primary to-accent text-white font-medium hover:opacity-90 transition-opacity"
          >
            Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}
