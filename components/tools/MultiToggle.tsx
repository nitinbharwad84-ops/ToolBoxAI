import { cn } from '@/lib/utils';

interface MultiToggleProps<T extends string> {
  options: Array<{ value: T; label: string }>;
  value: T;
  onChange: (value: T) => void;
  size?: 'sm' | 'md';
}

export default function MultiToggle<T extends string>({ options, value, onChange, size = 'sm' }: MultiToggleProps<T>) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {options.map((opt) => (
        <button
          key={opt.value}
          onClick={() => onChange(opt.value)}
          className={cn(
            'rounded-md font-medium transition-all',
            size === 'sm' ? 'px-3 py-1.5 text-xs' : 'px-4 py-2 text-sm',
            value === opt.value
              ? 'bg-primary/20 text-primary'
              : 'bg-surface-200/50 text-surface-500 hover:bg-surface-300/50'
          )}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}
