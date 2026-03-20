import { clsx, type ClassValue } from 'clsx';

export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}

export function formatCredits(credits: number): string {
  return new Intl.NumberFormat('en-IN').format(credits);
}

export function formatCurrency(paise: number): string {
  return `₹${(paise / 100).toLocaleString('en-IN')}`;
}

export function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

export function formatRelativeTime(dateStr: string): string {
  const now = Date.now();
  const diff = now - new Date(dateStr).getTime();
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (minutes < 1) return 'Just now';
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days < 7) return `${days}d ago`;
  return formatDate(dateStr);
}

export function truncate(str: string, maxLen: number): string {
  if (str.length <= maxLen) return str;
  return str.slice(0, maxLen - 3) + '...';
}

export function getToolDisplayName(toolName: string): string {
  const map: Record<string, string> = {
    summarizer: 'Summarizer',
    resume_roaster: 'Resume Roaster',
    email_pacifier: 'Email Pacifier',
  };
  return map[toolName] ?? toolName;
}

export function getToolIcon(toolName: string): string {
  const map: Record<string, string> = {
    summarizer: '📄',
    resume_roaster: '🔥',
    email_pacifier: '✉️',
  };
  return map[toolName] ?? '🔧';
}

export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
