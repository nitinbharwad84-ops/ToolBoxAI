import { cn } from '@/lib/utils';
import type { HTMLAttributes, ReactNode } from 'react';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  glow?: boolean;
  hoverable?: boolean;
}

export default function Card({ children, glow, hoverable, className, ...props }: CardProps) {
  return (
    <div
      className={cn(
        'glass-card p-5',
        hoverable && 'hover:border-primary/30 hover:-translate-y-0.5 transition-all duration-300 cursor-pointer',
        glow && 'glow-primary',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}
