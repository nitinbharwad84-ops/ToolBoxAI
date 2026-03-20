import { cn } from '@/lib/utils';
import { forwardRef, type TextareaHTMLAttributes } from 'react';

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
}

const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ label, error, className, ...props }, ref) => (
    <div className="space-y-1.5">
      {label && <label className="block text-xs font-medium text-surface-500">{label}</label>}
      <textarea
        ref={ref}
        className={cn(
          'w-full bg-surface-200/50 border rounded-lg px-4 py-3 text-sm text-surface-700',
          'placeholder-surface-500 resize-none focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all',
          error ? 'border-danger/50' : 'border-surface-300/50',
          className
        )}
        {...props}
      />
      {error && <p className="text-xs text-danger">{error}</p>}
    </div>
  )
);

Textarea.displayName = 'Textarea';
export default Textarea;
