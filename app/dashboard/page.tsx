'use client';

import Link from 'next/link';
import { useUser } from '@/hooks/useUser';
import { useHistory } from '@/hooks/useHistory';
import { FileText, Flame, Mail, ArrowRight, Zap, TrendingUp, Clock } from 'lucide-react';
import { formatCredits, formatRelativeTime, getToolIcon } from '@/lib/utils';
import { cn } from '@/lib/utils';

const tools = [
  {
    name: 'Summarizer',
    desc: 'Summarize documents, PDFs, and text instantly',
    icon: FileText,
    href: '/dashboard/summarizer',
    cost: '10 cr',
    color: 'from-blue-500/20 to-cyan-500/20',
    iconColor: 'text-blue-400',
  },
  {
    name: 'Resume Roaster',
    desc: 'Get brutal, honest resume feedback',
    icon: Flame,
    href: '/dashboard/resume-roaster',
    cost: '15 cr',
    color: 'from-orange-500/20 to-red-500/20',
    iconColor: 'text-orange-400',
    pro: true,
  },
  {
    name: 'Email Pacifier',
    desc: 'Transform harsh emails into professional ones',
    icon: Mail,
    href: '/dashboard/email-pacifier',
    cost: '5 cr',
    color: 'from-emerald-500/20 to-teal-500/20',
    iconColor: 'text-emerald-400',
  },
];

export default function DashboardPage() {
  const { user, loading: userLoading } = useUser();
  const { items: recentHistory, loading: historyLoading } = useHistory({ limit: 5 });

  if (userLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-surface-800">
          Welcome{user?.first_name ? `, ${user.first_name}` : ''} 👋
        </h1>
        <p className="text-surface-500 mt-1">Here&apos;s your productivity dashboard</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="glass-card p-5 flex items-center gap-4">
          <div className="w-10 h-10 rounded-lg bg-primary/15 flex items-center justify-center">
            <Zap className="w-5 h-5 text-primary" />
          </div>
          <div>
            <p className="text-sm text-surface-500">Credits Available</p>
            <p className={cn('text-xl font-bold', (user?.credits ?? 0) < 20 ? 'text-danger' : 'text-surface-800')}>
              {formatCredits(user?.credits ?? 0)}
            </p>
          </div>
        </div>
        <div className="glass-card p-5 flex items-center gap-4">
          <div className="w-10 h-10 rounded-lg bg-accent/15 flex items-center justify-center">
            <TrendingUp className="w-5 h-5 text-accent" />
          </div>
          <div>
            <p className="text-sm text-surface-500">Total Used</p>
            <p className="text-xl font-bold text-surface-800">
              {formatCredits(user?.total_credits_used ?? 0)}
            </p>
          </div>
        </div>
        <div className="glass-card p-5 flex items-center gap-4">
          <div className="w-10 h-10 rounded-lg bg-emerald-500/15 flex items-center justify-center">
            <Clock className="w-5 h-5 text-emerald-400" />
          </div>
          <div>
            <p className="text-sm text-surface-500">Plan</p>
            <p className="text-xl font-bold text-surface-800 flex items-center gap-2">
              {user?.plan === 'pro' ? '✦ Pro' : 'Free'}
              {user?.user_api_key_set && (
                <span className="text-xs font-normal px-2 py-0.5 rounded-full bg-primary/15 text-primary">
                  Own Key
                </span>
              )}
            </p>
          </div>
        </div>
      </div>

      {/* Low Credit Warning */}
      {(user?.credits ?? 100) < 20 && (
        <div className="glass-card border-danger/30 bg-danger/5 p-4 flex items-center gap-3">
          <span className="text-danger text-lg">⚠</span>
          <div className="flex-1">
            <p className="text-sm font-medium text-danger">Low on credits</p>
            <p className="text-xs text-surface-500">Buy more credits or add your own API key in Settings to continue using tools for free.</p>
          </div>
          <Link href="/dashboard/billing" className="text-sm font-medium text-primary hover:text-primary-hover transition-colors">
            Buy Credits →
          </Link>
        </div>
      )}

      {/* Quick Actions */}
      <div>
        <h2 className="text-lg font-semibold text-surface-800 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {tools.map((tool) => (
            <Link
              key={tool.name}
              href={tool.href}
              className="glass-card p-5 group hover:border-primary/30 transition-all duration-300 hover:-translate-y-0.5"
            >
              <div className={cn('w-10 h-10 rounded-lg bg-gradient-to-br flex items-center justify-center mb-3', tool.color)}>
                <tool.icon className={cn('w-5 h-5', tool.iconColor)} />
              </div>
              <div className="flex items-center gap-2 mb-1">
                <h3 className="font-semibold text-surface-800 group-hover:text-primary transition-colors">
                  {tool.name}
                </h3>
                {tool.pro && (
                  <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-accent/20 text-accent">PRO</span>
                )}
              </div>
              <p className="text-sm text-surface-500 mb-3">{tool.desc}</p>
              <div className="flex items-center justify-between">
                <span className="text-xs text-surface-400">{tool.cost} per use</span>
                <ArrowRight className="w-4 h-4 text-surface-400 group-hover:text-primary group-hover:translate-x-1 transition-all" />
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Recent History */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-surface-800">Recent Activity</h2>
          <Link href="/dashboard/history" className="text-sm text-primary hover:text-primary-hover transition-colors">
            View all →
          </Link>
        </div>

        {historyLoading ? (
          <div className="glass-card p-8 text-center text-surface-500">Loading...</div>
        ) : recentHistory.length === 0 ? (
          <div className="glass-card p-8 text-center">
            <p className="text-surface-500">No activity yet. Try one of the tools above!</p>
          </div>
        ) : (
          <div className="space-y-2">
            {recentHistory.map((item) => (
              <div key={item.id} className="glass-card p-4 flex items-center gap-4 hover:border-surface-400/50 transition-colors">
                <span className="text-xl">{getToolIcon(item.tool_name)}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-surface-700 truncate">{item.tool_display_name}</p>
                  <p className="text-xs text-surface-500 truncate">{item.input_preview ?? 'No preview'}</p>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="text-sm font-medium text-surface-600">−{item.credits_used} cr</p>
                  <p className="text-xs text-surface-400">{formatRelativeTime(item.created_at)}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
