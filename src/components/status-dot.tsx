'use client';

import { cn } from '@/lib/utils';

export function StatusDot({ status, size = 'sm' }: { status: 'up' | 'down' | 'unknown' | 'success' | 'error' | 'active' | 'idle' | 'offline' | 'warning' | 'healthy' | 'critical'; size?: 'xs' | 'sm' | 'md' }) {
  const colorMap: Record<string, string> = {
    up: 'bg-status-up',
    down: 'bg-status-down',
    success: 'bg-status-up',
    error: 'bg-status-down',
    active: 'bg-status-up',
    idle: 'bg-status-warn',
    offline: 'bg-muted-foreground',
    unknown: 'bg-muted-foreground',
    warning: 'bg-status-warn',
    healthy: 'bg-status-up',
    critical: 'bg-status-down',
  };
  const sizeMap = { xs: 'w-1.5 h-1.5', sm: 'w-2 h-2', md: 'w-2.5 h-2.5' };
  const pulse = ['up', 'success', 'active', 'healthy'].includes(status);

  return (
    <span className={cn('inline-block rounded-full', sizeMap[size], colorMap[status] || 'bg-muted-foreground', pulse && 'animate-pulse')} />
  );
}
