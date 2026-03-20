'use client';

import { useUser } from '@/hooks/useUser';
import { useState } from 'react';
import { cn, formatCredits } from '@/lib/utils';
import { CreditCard, Zap, Crown, Check, Shield, Loader2 } from 'lucide-react';

const CREDIT_PACKS = [
  { id: 'pack_50', name: 'Starter', credits: 50, priceInr: '₹99', desc: 'Try it out' },
  { id: 'pack_200', name: 'Standard', credits: 200, priceInr: '₹349', desc: 'Most popular', popular: true },
  { id: 'pack_500', name: 'Power', credits: 500, priceInr: '₹799', desc: 'Best value', best: true },
];

const PRO_FEATURES = [
  'Resume Roaster (exclusive)',
  '1000 credits / month',
  '25MB file uploads (vs 5MB free)',
  'Unlimited history',
  'Export history (JSON/CSV)',
  'Save presets (5 per tool)',
  'Priority support',
];

export default function BillingPage() {
  const { user } = useUser();
  const [buyingPack, setBuyingPack] = useState<string | null>(null);
  const [subscribing, setSubscribing] = useState(false);
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');

  const handleBuyCredits = async (packageId: string) => {
    setBuyingPack(packageId);
    try {
      const res = await fetch('/api/razorpay/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ packageId }),
      });
      const data = await res.json();
      if (!res.ok) return;

      const options = {
        key: data.keyId,
        amount: data.amount,
        currency: data.currency,
        name: 'ToolboxAI',
        description: `${data.credits} Credits — ${data.packageName}`,
        order_id: data.orderId,
        handler: async (response: { razorpay_order_id: string; razorpay_payment_id: string; razorpay_signature: string }) => {
          await fetch('/api/razorpay/verify-payment', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ ...response, packageId }),
          });
          window.location.reload();
        },
        theme: { color: '#0ea5e9' },
      };

      const rzp = new (window as unknown as { Razorpay: new (opts: typeof options) => { open: () => void } }).Razorpay(options);
      rzp.open();
    } finally {
      setBuyingPack(null);
    }
  };

  const handleSubscribe = async () => {
    setSubscribing(true);
    try {
      const res = await fetch('/api/razorpay/create-subscription', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ billingCycle }),
      });
      const data = await res.json();
      if (data.shortUrl) {
        window.location.href = data.shortUrl;
      }
    } finally {
      setSubscribing(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-fade-in">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-lg bg-primary/15 flex items-center justify-center">
          <CreditCard className="w-5 h-5 text-primary" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-surface-800">Billing</h1>
          <p className="text-sm text-surface-500">
            {formatCredits(user?.credits ?? 0)} credits available • {user?.plan === 'pro' ? '✦ Pro' : 'Free'} plan
          </p>
        </div>
      </div>

      {/* Pro Plan */}
      {user?.plan !== 'pro' && (
        <div className="glass-card border-primary/30 overflow-hidden relative">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-accent/5 pointer-events-none" />
          <div className="relative p-6 space-y-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                <Crown className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-surface-800">Upgrade to Pro</h2>
                <p className="text-sm text-surface-500">Unlock all features and more credits</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button onClick={() => setBillingCycle('monthly')}
                className={cn('px-4 py-2 rounded-lg text-sm font-medium transition-all',
                  billingCycle === 'monthly' ? 'bg-primary/20 text-primary' : 'bg-surface-200/50 text-surface-500')}>
                Monthly
              </button>
              <button onClick={() => setBillingCycle('yearly')}
                className={cn('px-4 py-2 rounded-lg text-sm font-medium transition-all',
                  billingCycle === 'yearly' ? 'bg-primary/20 text-primary' : 'bg-surface-200/50 text-surface-500')}>
                Yearly <span className="text-accent">-16%</span>
              </button>
            </div>

            <div className="flex items-end gap-1">
              <span className="text-3xl font-bold text-surface-800">
                ₹{billingCycle === 'monthly' ? '999' : '839'}
              </span>
              <span className="text-surface-500 mb-1">/month</span>
              {billingCycle === 'yearly' && (
                <span className="text-xs text-surface-400 mb-1 ml-2">billed ₹10,068/year</span>
              )}
            </div>

            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {PRO_FEATURES.map((f) => (
                <li key={f} className="flex items-center gap-2 text-sm text-surface-600">
                  <Check className="w-4 h-4 text-accent flex-shrink-0" /> {f}
                </li>
              ))}
            </ul>

            <button onClick={handleSubscribe} disabled={subscribing}
              className="w-full py-3 rounded-lg font-medium text-white bg-gradient-to-r from-primary to-accent hover:opacity-90 transition-opacity glow-primary flex items-center justify-center gap-2">
              {subscribing ? <><Loader2 className="w-4 h-4 animate-spin" /> Processing...</> : 'Subscribe to Pro'}
            </button>
          </div>
        </div>
      )}

      {/* Credit Packs */}
      <div>
        <h2 className="text-lg font-semibold text-surface-800 mb-4 flex items-center gap-2">
          <Zap className="w-5 h-5 text-primary" /> Buy Credit Packs
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {CREDIT_PACKS.map((pack) => (
            <div key={pack.id}
              className={cn('glass-card p-5 space-y-3 relative overflow-hidden',
                pack.popular && 'border-primary/30',
                pack.best && 'border-accent/30')}>
              {pack.popular && (
                <span className="absolute top-0 right-0 text-[10px] font-bold px-2 py-0.5 rounded-bl-lg bg-primary/20 text-primary">POPULAR</span>
              )}
              {pack.best && (
                <span className="absolute top-0 right-0 text-[10px] font-bold px-2 py-0.5 rounded-bl-lg bg-accent/20 text-accent">BEST VALUE</span>
              )}
              <h3 className="font-semibold text-surface-800">{pack.name}</h3>
              <p className="text-xs text-surface-500">{pack.desc}</p>
              <div>
                <span className="text-2xl font-bold text-surface-800">{pack.credits}</span>
                <span className="text-surface-500 text-sm"> credits</span>
              </div>
              <p className="text-lg font-bold text-surface-700">{pack.priceInr}</p>
              <button onClick={() => handleBuyCredits(pack.id)} disabled={buyingPack === pack.id}
                className={cn('w-full py-2 rounded-lg text-sm font-medium transition-all flex items-center justify-center gap-1.5',
                  'bg-surface-200 text-surface-700 hover:bg-surface-300')}>
                {buyingPack === pack.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Zap className="w-3.5 h-3.5" />}
                {buyingPack === pack.id ? 'Processing...' : 'Buy Now'}
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* BYO Key */}
      <div className="glass-card p-5 flex items-center gap-4 border-accent/20">
        <div className="w-10 h-10 rounded-lg bg-accent/15 flex items-center justify-center flex-shrink-0">
          <Shield className="w-5 h-5 text-accent" />
        </div>
        <div className="flex-1">
          <h3 className="font-semibold text-surface-800">Bring Your Own API Key</h3>
          <p className="text-sm text-surface-500">Use tools for free with your own Gemini/Grok key. Set up in Settings.</p>
        </div>
      </div>
    </div>
  );
}
