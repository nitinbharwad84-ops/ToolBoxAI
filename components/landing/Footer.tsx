import { Zap } from 'lucide-react';

export default function Footer() {
  return (
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
  );
}
