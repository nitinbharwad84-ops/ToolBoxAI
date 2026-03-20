'use client';

import { cn } from '@/lib/utils';
import { type ReactNode, useState } from 'react';

interface Tab {
  id: string;
  label: string;
  icon?: ReactNode;
  content: ReactNode;
}

interface TabsProps {
  tabs: Tab[];
  defaultTab?: string;
  className?: string;
}

export default function Tabs({ tabs, defaultTab, className }: TabsProps) {
  const [active, setActive] = useState(defaultTab ?? tabs[0]?.id);
  const currentTab = tabs.find((t) => t.id === active);

  return (
    <div className={className}>
      <div className="flex gap-1.5 mb-4">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActive(tab.id)}
            className={cn(
              'flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-all',
              active === tab.id
                ? 'bg-primary/20 text-primary'
                : 'bg-surface-200/50 text-surface-500 hover:bg-surface-300/50'
            )}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>
      <div>{currentTab?.content}</div>
    </div>
  );
}
