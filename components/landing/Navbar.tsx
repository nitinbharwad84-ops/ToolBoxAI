'use client';

import Link from 'next/link';
import { useAuth } from '@clerk/nextjs';
import { Zap } from 'lucide-react';

export default function Navbar() {
  const { isSignedIn } = useAuth();

  return (
    <nav className="border-b border-surface-300/30 backdrop-blur-xl bg-surface-900/80 sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center">
            <Zap className="w-4 h-4 text-white" />
          </div>
          <span className="font-bold text-lg text-surface-800 tracking-tight">
            Toolbox<span className="gradient-text">AI</span>
          </span>
        </div>
        <div className="flex items-center gap-3">
          {isSignedIn ? (
            <Link href="/dashboard"
              className="text-sm font-medium px-4 py-2 rounded-lg bg-gradient-to-r from-primary to-accent text-white hover:opacity-90 transition-opacity">
              Dashboard
            </Link>
          ) : (
            <>
              <Link href="/sign-in" className="text-sm font-medium text-surface-500 hover:text-surface-700 transition-colors">
                Sign In
              </Link>
              <Link href="/sign-up"
                className="text-sm font-medium px-4 py-2 rounded-lg bg-gradient-to-r from-primary to-accent text-white hover:opacity-90 transition-opacity">
                Get Started Free
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
