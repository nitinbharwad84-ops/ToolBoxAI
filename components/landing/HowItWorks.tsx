export default function HowItWorks() {
  const steps = [
    { step: '1', title: 'Pick a Tool', desc: 'Choose Summarizer, Resume Roaster, or Email Pacifier from your dashboard.' },
    { step: '2', title: 'Customize & Submit', desc: 'Paste your content, tweak the parameters, and hit run. Costs update in real-time.' },
    { step: '3', title: 'Get Results', desc: 'Receive structured AI output in seconds. Copy, export, or save to history.' },
  ];

  return (
    <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
      <h2 className="text-3xl font-bold text-surface-800 text-center mb-4">How It Works</h2>
      <p className="text-surface-500 text-center mb-12 max-w-lg mx-auto">Three steps. No learning curve.</p>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {steps.map(({ step, title, desc }) => (
          <div key={step} className="text-center space-y-3 relative">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-accent text-white font-bold text-lg flex items-center justify-center mx-auto">
              {step}
            </div>
            <h3 className="text-lg font-semibold text-surface-800">{title}</h3>
            <p className="text-sm text-surface-500">{desc}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
