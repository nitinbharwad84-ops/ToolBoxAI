import Link from 'next/link';
import { Check } from 'lucide-react';

const FREE_FEATURES = ['100 credits on signup', 'Summarizer + Email Pacifier', '5MB file uploads', '7-day history', 'BYO API key'];
const PRO_FEATURES = ['1000 credits/month', 'All 3 tools (inc. Resume Roaster)', '25MB file uploads', 'Unlimited history', 'Export & presets', 'Priority support'];

export default function PricingSection() {
  return (
    <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
      <h2 className="text-3xl font-bold text-surface-800 text-center mb-12">Simple, Credit-Based Pricing</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-2xl mx-auto">
        {/* Free */}
        <div className="glass-card p-6 space-y-4">
          <h3 className="font-bold text-surface-800 text-lg">Free</h3>
          <p className="text-2xl font-bold text-surface-800">₹0 <span className="text-sm font-normal text-surface-500">/forever</span></p>
          <ul className="space-y-2">
            {FREE_FEATURES.map((f) => (
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
              {PRO_FEATURES.map((f) => (
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
  );
}
