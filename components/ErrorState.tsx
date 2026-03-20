import { AlertTriangle, WifiOff, CreditCard, Clock, ShieldX } from 'lucide-react';
import type { ReactNode } from 'react';

type ErrorType = 'generic' | 'no_credits' | 'rate_limit' | 'network' | 'auth';

const errorConfig: Record<ErrorType, { icon: typeof AlertTriangle; title: string; bg: string }> = {
  generic:    { icon: AlertTriangle, title: 'Something went wrong', bg: 'bg-danger/15' },
  no_credits: { icon: CreditCard,   title: 'Insufficient Credits', bg: 'bg-warning/15' },
  rate_limit: { icon: Clock,        title: 'Rate Limited',         bg: 'bg-warning/15' },
  network:    { icon: WifiOff,      title: 'Network Error',        bg: 'bg-danger/15' },
  auth:       { icon: ShieldX,      title: 'Not Authorized',       bg: 'bg-danger/15' },
};

interface ErrorStateProps {
  type?: ErrorType;
  message: string;
  action?: ReactNode;
}

export default function ErrorState({ type = 'generic', message, action }: ErrorStateProps) {
  const { icon: Icon, title, bg } = errorConfig[type];

  return (
    <div className="glass-card border-danger/20 p-6 text-center space-y-3 max-w-md mx-auto">
      <div className={`w-12 h-12 rounded-xl ${bg} flex items-center justify-center mx-auto`}>
        <Icon className="w-6 h-6 text-danger" />
      </div>
      <h3 className="font-semibold text-surface-800">{title}</h3>
      <p className="text-sm text-surface-500">{message}</p>
      {action}
    </div>
  );
}
