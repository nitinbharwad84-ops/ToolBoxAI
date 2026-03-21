import { FileText, Flame, Mail, Zap, Shield, Sparkles } from 'lucide-react';

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

export function ToolsSection() {
  return (
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
  );
}

export function FeaturesSection() {
  return (
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
  );
}
