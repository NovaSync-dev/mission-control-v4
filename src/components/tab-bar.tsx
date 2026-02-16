'use client';

import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface TabBarProps {
  tabs: Array<{ id: string; label: string; icon?: React.ReactNode }>;
  activeTab: string;
  onTabChange: (tab: string) => void;
  layoutId?: string;
}

export function TabBar({ tabs, activeTab, onTabChange, layoutId = 'tab-pill' }: TabBarProps) {
  return (
    <div className="flex items-center gap-1 p-1 rounded-xl bg-white/[0.03] border border-white/[0.06] w-fit">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onTabChange(tab.id)}
          className={cn(
            'relative px-4 py-1.5 rounded-lg text-xs font-medium tracking-wider transition-colors duration-200',
            activeTab === tab.id
              ? 'text-primary'
              : 'text-muted-foreground hover:text-foreground'
          )}
        >
          <span className="relative z-10 flex items-center gap-1.5">
            {tab.icon}
            {tab.label}
          </span>
          {activeTab === tab.id && (
            <motion.div
              layoutId={layoutId}
              className="absolute inset-0 rounded-lg bg-primary/[0.1] border border-primary/[0.2]"
              transition={{ type: 'spring', stiffness: 500, damping: 35 }}
            />
          )}
        </button>
      ))}
    </div>
  );
}
