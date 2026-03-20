'use client';

import Link from 'next/link';
import { useAuth } from '@clerk/nextjs';
import { FileText, Flame, Mail, Zap, Shield, ArrowRight, Check, Sparkles } from 'lucide-react';

const tools = [
  {
    name: 'Summarizer',
    desc: 'Paste text or upload PDFs — get structured summaries with key points, TLDRs, and action items.',
    icon: FileText,
    color: 'from-blue-500/20 to-cyan-500/20',
    iconColor: 'text-blue-400',
    cost: 'From 5 credits',
  },
  {
    name: 'Resume Roaster',
    desc: 'Get brutally honest feedback from Marcus, the most feared tech recruiter. ATS scoring, bullet rewrites, and more.',
    icon: Flame,
    color: 'from-orange-500/20 to-red-500/20',
    iconColor: 'text-orange-400',
    cost: 'From 15 credits',
    pro: true,
  },
  {
    name: 'Email Pacifier',
    desc: 'Transform angry or unprofessional emails into polished communication. Multiple tones and alternatives.',
    icon: Mail,
    color: 'from-emerald-500/20 to-teal-500/20',
    iconColor: 'text-emerald-400',
    cost: 'From 5 credits',
  },
];

const features = [
  { icon: Zap, title: '100 Free Credits', desc: 'Start using tools immediately — no credit card required.' },
  { icon: Shield, title: 'BYO API Key', desc: 'Bring your own Gemini, Grok, or Groq key for unlimited free usage.' },
  { icon: Sparkles, title: '5 AI Providers', desc: 'Automatic failover across Gemini, Grok, Groq, OpenRouter, and Mistral.' },
];

export default function LandingPage() {
  const { isSignedIn } = useAuth();

  return (
    <div className="min-h-screen bg-surface-900">
      {/* Nav */}
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

      {/* Hero */}
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

      {/* Tools */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <h2 className="text-3xl font-bold text-surface-800 text-center mb-4">Three Tools. Infinite Productivity.</h2>
        <p className="text-surface-500 text-center mb-12 max-w-xl mx-auto">
          Each tool is fine-tuned with customizable parameters and powered by AI models with automatic failover.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {tools.map((tool) => (
            <div key={tool.name} className="glass-card p-6 space-y-4 hover:border-primary/30 transition-all duration-300 hover:-translate-y-1 group">
              <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${tool.color} flex items-center justify-center`}>
                <tool.icon className={`w-6 h-6 ${tool.iconColor}`} />
              </div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-semibold text-surface-800 group-hover:text-primary transition-colors">{tool.name}</h3>
                {tool.pro && <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-accent/20 text-accent">PRO</span>}
              </div>
              <p className="text-sm text-surface-500">{tool.desc}</p>
              <p className="text-xs text-surface-400">{tool.cost}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="border-t border-surface-300/30 bg-surface-100/30">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {features.map(({ icon: Icon, title, desc }) => (
              <div key={title} className="text-center space-y-3">
                <div className="w-12 h-12 rounded-xl bg-primary/15 flex items-center justify-center mx-auto">
                  <Icon className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-lg font-semibold text-surface-800">{title}</h3>
                <p className="text-sm text-surface-500">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <h2 className="text-3xl font-bold text-surface-800 text-center mb-12">Simple, Credit-Based Pricing</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-2xl mx-auto">
          {/* Free */}
          <div className="glass-card p-6 space-y-4">
            <h3 className="font-bold text-surface-800 text-lg">Free</h3>
            <p className="text-2xl font-bold text-surface-800">₹0 <span className="text-sm font-normal text-surface-500">/forever</span></p>
            <ul className="space-y-2">
              {['100 credits on signup', 'Summarizer + Email Pacifier', '5MB file uploads', '7-day history', 'BYO API key'].map((f) => (
                <li key={f} className="flex items-center gap-2 text-sm text-surface-500">
                  <Check className="w-4 h-4 text-primary flex-shrink-0" /> {f}
                </li>
              ))}
            </ul>
            <Link href="/sign-up" className="block text-center py-2.5 rounded-lg border border-surface-300 text-surface-700 font-medium hover:bg-surface-200/50 transition-colors">
              Get Started
            </Link>
          </div>
          {/* Pro */}
          <div className="glass-card p-6 space-y-4 border-primary/30 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-accent/5 pointer-events-none" />
            <div className="relative">
              <h3 className="font-bold text-surface-800 text-lg">Pro</h3>
              <p className="text-2xl font-bold text-surface-800">₹999 <span className="text-sm font-normal text-surface-500">/month</span></p>
              <ul className="space-y-2 mt-4">
                {['1000 credits/month', 'All 3 tools (inc. Resume Roaster)', '25MB file uploads', 'Unlimited history', 'Export & presets', 'Priority support'].map((f) => (
                  <li key={f} className="flex items-center gap-2 text-sm text-surface-600">
                    <Check className="w-4 h-4 text-accent flex-shrink-0" /> {f}
                  </li>
                ))}
              </ul>
              <Link href="/sign-up" className="block text-center py-2.5 rounded-lg mt-4 bg-gradient-to-r from-primary to-accent text-white font-medium hover:opacity-90 transition-opacity">
                Start Pro
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-surface-300/30 py-8">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md bg-gradient-to-br from-primary to-accent flex items-center justify-center">
              <Zap className="w-3 h-3 text-white" />
            </div>
            <span className="text-sm font-semibold text-surface-600">
              Toolbox<span className="gradient-text">AI</span>
            </span>
          </div>
          <p className="text-xs text-surface-400">© 2025 ToolboxAI. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
