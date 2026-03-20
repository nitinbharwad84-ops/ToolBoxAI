import { cn } from '@/lib/utils';

interface CheckboxGroupProps {
  options: Record<string, boolean>;
  onChange: (key: string, value: boolean) => void;
}

export default function CheckboxGroup({ options, onChange }: CheckboxGroupProps) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {Object.entries(options).map(([key, checked]) => (
        <button
          key={key}
          onClick={() => onChange(key, !checked)}
          className={cn(
            'px-3 py-1.5 rounded-md text-xs font-medium transition-all',
            checked
              ? 'bg-accent/20 text-accent'
              : 'bg-surface-200/50 text-surface-500 hover:bg-surface-300/50'
          )}
        >
          {checked ? '✓ ' : ''}{key}
        </button>
      ))}
    </div>
  );
}
