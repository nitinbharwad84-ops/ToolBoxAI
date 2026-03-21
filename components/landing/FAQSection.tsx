'use client';

import { useState } from 'react';
import { ChevronDown } from 'lucide-react';

const faqs = [
  { q: 'Is ToolboxAI really free to start?', a: 'Yes! You get 100 credits on signup. No credit card required. You can also bring your own API key for unlimited free usage.' },
  { q: 'What are credits?', a: 'Credits are the currency for using tools. Each tool costs a base amount (5-15 credits) that adjusts based on your customization settings.' },
  { q: 'What AI models power the tools?', a: 'We use 5 providers — Gemini, Grok, Groq, OpenRouter, and Mistral — with automatic failover. If one is down, the next picks up seamlessly.' },
  { q: 'What does the Pro plan include?', a: 'Pro gives you 1000 credits/month, access to Resume Roaster, 25MB file uploads, unlimited history, export, and saved presets for ₹999/mo.' },
  { q: 'Can I use my own API key?', a: 'Absolutely! Add your Gemini, Grok, Groq, OpenRouter, or Mistral key in Settings. Tools become free when using your own key.' },
  { q: 'Is my data secure?', a: 'Yes. API keys are encrypted with AES-256-GCM. We never store raw keys. Tool inputs are only saved if you enable auto-save history.' },
];

export default function FAQSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <section className="border-t border-surface-300/30">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <h2 className="text-3xl font-bold text-surface-800 text-center mb-12">Frequently Asked Questions</h2>
        <div className="space-y-2">
          {faqs.map((faq, i) => (
            <div key={i} className="glass-card overflow-hidden">
              <button
                onClick={() => setOpenIndex(openIndex === i ? null : i)}
                className="w-full flex items-center justify-between px-5 py-4 text-left hover:bg-surface-200/30 transition-colors"
              >
                <span className="text-sm font-medium text-surface-700">{faq.q}</span>
                <ChevronDown className={`w-4 h-4 text-surface-500 transition-transform duration-200 flex-shrink-0 ml-4 ${openIndex === i ? 'rotate-180' : ''}`} />
              </button>
              {openIndex === i && (
                <div className="px-5 pb-4 text-sm text-surface-500 animate-fade-in">{faq.a}</div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
