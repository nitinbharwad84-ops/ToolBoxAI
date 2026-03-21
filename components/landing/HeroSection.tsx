'use client';

import Link from 'next/link';
import { useAuth } from '@clerk/nextjs';
import { Sparkles, ArrowRight } from 'lucide-react';

export default function HeroSection() {
  const { isSignedIn } = useAuth();

  return (
    <section className="relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-transparent to-transparent pointer-events-none" />
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-24 sm:py-32 text-center relative">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6 animate-fade-in">
          <Sparkles className="w-4 h-4" /> 100 free credits on signup
        </div>
        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-surface-800 leading-tight tracking-tight animate-fade-in">
          AI-Powered <span className="gradient-text">Productivity</span> Tools
        </h1>
        <p className="mt-6 text-lg sm:text-xl text-surface-500 max-w-2xl mx-auto animate-fade-in">
          Summarize documents. Roast resumes. Transform emails.
          Three AI tools, five providers, one simple credit system.
        </p>
        <div className="mt-10 flex items-center justify-center gap-4 animate-fade-in">
          <Link href={isSignedIn ? '/dashboard' : '/sign-up'}
            className="px-8 py-3 rounded-lg bg-gradient-to-r from-primary to-accent text-white font-semibold text-lg hover:opacity-90 transition-opacity glow-primary flex items-center gap-2">
            {isSignedIn ? 'Go to Dashboard' : 'Start Free'} <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </div>
    </section>
  );
}
