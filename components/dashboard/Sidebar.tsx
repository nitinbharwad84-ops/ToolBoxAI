'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { UserButton } from '@clerk/nextjs';
import { useUser } from '@/hooks/useUser';
import CreditMeter from '@/components/dashboard/CreditMeter';
import {
  LayoutDashboard, FileText, Flame, Mail, History,
  CreditCard, Settings, Zap, ChevronLeft, ChevronRight, Menu, X,
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';

const navItems = [
  { href: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { href: '/dashboard/summarizer', icon: FileText, label: 'Summarizer' },
  { href: '/dashboard/resume-roaster', icon: Flame, label: 'Resume Roaster', pro: true },
  { href: '/dashboard/email-pacifier', icon: Mail, label: 'Email Pacifier' },
  { href: '/dashboard/history', icon: History, label: 'History' },
  { href: '/dashboard/billing', icon: CreditCard, label: 'Billing' },
  { href: '/dashboard/settings', icon: Settings, label: 'Settings' },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { user } = useUser();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  // Close mobile drawer on route change
  useEffect(() => { setMobileOpen(false); }, [pathname]);

  // Lock body scroll when mobile drawer is open
  useEffect(() => {
    document.body.style.overflow = mobileOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [mobileOpen]);

  const sidebarContent = (
    <>
      {/* Logo */}
      <div className="flex items-center gap-2 px-4 h-16 border-b border-surface-300/50">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center flex-shrink-0">
          <Zap className="w-4 h-4 text-white" />
        </div>
        {!collapsed && (
          <span className="font-bold text-lg text-surface-800 tracking-tight">
            Toolbox<span className="gradient-text">AI</span>
          </span>
        )}
        {/* Mobile close */}
        <button onClick={() => setMobileOpen(false)} className="ml-auto lg:hidden p-1 rounded hover:bg-surface-200/50">
          <X className="w-5 h-5 text-surface-500" />
        </button>
      </div>

      {/* Credit Meter */}
      {!collapsed && user && (
        <div className="mx-3 mt-4 p-3 rounded-lg glass-card space-y-2">
          <CreditMeter credits={user.credits} plan={user.plan} />
          <span className={cn(
            'text-[10px] font-medium px-1.5 py-0.5 rounded-full inline-block',
            user.plan === 'pro' ? 'bg-accent/20 text-accent' : 'bg-surface-300 text-surface-500'
          )}>
            {user.plan === 'pro' ? '✦ PRO' : 'FREE'}
          </span>
        </div>
      )}
      {collapsed && user && (
        <div className="mx-2 mt-4 p-2">
          <CreditMeter credits={user.credits} plan={user.plan} compact />
        </div>
      )}

      {/* Nav */}
      <nav className="flex-1 px-2 mt-4 space-y-0.5 overflow-y-auto">
        {navItems.map(({ href, icon: Icon, label, pro }) => {
          const isActive = pathname === href;
          return (
            <Link key={href} href={href}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200',
                isActive ? 'bg-primary/15 text-primary' : 'text-surface-500 hover:text-surface-700 hover:bg-surface-200/50',
                collapsed && 'justify-center px-0'
              )}
            >
              <Icon className={cn('w-[18px] h-[18px] flex-shrink-0', isActive && 'text-primary')} />
              {!collapsed && (
                <>
                  <span>{label}</span>
                  {pro && <span className="ml-auto text-[9px] font-bold px-1.5 py-0.5 rounded bg-accent/20 text-accent">PRO</span>}
                </>
              )}
            </Link>
          );
        })}
      </nav>

      {/* User */}
      <div className="p-3 border-t border-surface-300/50">
        <div className={cn('flex items-center', collapsed ? 'justify-center' : 'gap-3')}>
          <UserButton appearance={{ elements: { avatarBox: 'w-8 h-8' } }} />
          {!collapsed && user && (
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-surface-700 truncate">{user.first_name ?? 'User'}</p>
              <p className="text-xs text-surface-500 truncate">{user.email}</p>
            </div>
          )}
        </div>
      </div>
    </>
  );

  return (
    <>
      {/* Mobile Hamburger */}
      <button
        onClick={() => setMobileOpen(true)}
        className="lg:hidden fixed top-4 left-4 z-50 w-10 h-10 rounded-lg bg-surface-200/80 backdrop-blur-sm border border-surface-300/50 flex items-center justify-center"
        aria-label="Open menu"
      >
        <Menu className="w-5 h-5 text-surface-600" />
      </button>

      {/* Mobile Overlay */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-40 bg-black/50 backdrop-blur-sm" onClick={() => setMobileOpen(false)} />
      )}

      {/* Mobile Drawer */}
      <aside className={cn(
        'lg:hidden fixed inset-y-0 left-0 z-50 w-64 flex flex-col bg-surface-100/95 backdrop-blur-xl border-r border-surface-300/50 transition-transform duration-300',
        mobileOpen ? 'translate-x-0' : '-translate-x-full'
      )}>
        {sidebarContent}
      </aside>

      {/* Desktop Sidebar */}
      <aside className={cn(
        'hidden lg:flex flex-col h-screen sticky top-0 transition-all duration-300 border-r border-surface-300/50 bg-surface-100/80 backdrop-blur-xl',
        collapsed ? 'w-16' : 'w-64'
      )}>
        {sidebarContent}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="absolute -right-3 top-20 w-6 h-6 rounded-full bg-surface-200 border border-surface-300 flex items-center justify-center hover:bg-surface-300 transition-colors"
        >
          {collapsed ? <ChevronRight className="w-3 h-3" /> : <ChevronLeft className="w-3 h-3" />}
        </button>
      </aside>
    </>
  );
}
