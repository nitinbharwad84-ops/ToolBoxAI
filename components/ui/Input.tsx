import { cn } from '@/lib/utils';
import { forwardRef, type InputHTMLAttributes } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, className, ...props }, ref) => (
    <div className="space-y-1.5">
      {label && <label className="block text-xs font-medium text-surface-500">{label}</label>}
      <input
        ref={ref}
        className={cn(
          'w-full bg-surface-200/50 border rounded-lg px-4 py-2.5 text-sm text-surface-700',
          'placeholder-surface-500 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all',
          error ? 'border-danger/50' : 'border-surface-300/50',
          className
        )}
        {...props}
      />
      {error && <p className="text-xs text-danger">{error}</p>}
    </div>
  )
);

Input.displayName = 'Input';
export default Input;
