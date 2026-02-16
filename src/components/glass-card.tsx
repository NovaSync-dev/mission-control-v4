'use client';

import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  onClick?: () => void;
  hoverable?: boolean;
}

export function GlassCard({ children, className, delay = 0, onClick, hoverable = false }: GlassCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay, ease: [0.25, 0.46, 0.45, 0.94] }}
      onClick={onClick}
      className={cn(
        'glass-card p-5 transition-all duration-300',
        hoverable && 'cursor-pointer hover:scale-[1.01] hover:border-primary/20',
        className
      )}
    >
      {children}
    </motion.div>
  );
}

export function CardHeader({ title, icon, badge, action }: {
  title: string;
  icon?: React.ReactNode;
  badge?: React.ReactNode;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between mb-4">
      <div className="flex items-center gap-2">
        {icon && <span className="text-primary">{icon}</span>}
        <h3 className="text-xs font-semibold tracking-wider uppercase text-muted-foreground">{title}</h3>
        {badge}
      </div>
      {action}
    </div>
  );
}
