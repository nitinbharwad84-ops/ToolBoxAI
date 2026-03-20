import { cn } from '@/lib/utils';

interface SliderProps {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  label?: string;
  valueLabel?: string;
  className?: string;
}

export default function Slider({ value, onChange, min = 1, max = 5, step = 1, label, valueLabel, className }: SliderProps) {
  return (
    <div className={className}>
      {(label || valueLabel) && (
        <div className="flex items-center justify-between mb-1.5">
          {label && <label className="text-xs font-medium text-surface-500">{label}</label>}
          {valueLabel && <span className="text-xs font-medium text-primary">{valueLabel}</span>}
        </div>
      )}
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(parseInt(e.target.value))}
        className={cn('w-full accent-primary', className)}
      />
    </div>
  );
}
