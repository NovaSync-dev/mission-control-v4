'use client';

import { motion } from 'framer-motion';
import { Inbox } from 'lucide-react';

export function EmptyState({ title = 'No data yet', description = 'Data will appear here once available.', icon }: {
  title?: string;
  description?: string;
  icon?: React.ReactNode;
}) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex flex-col items-center justify-center py-16 text-center"
    >
      <div className="w-12 h-12 rounded-2xl bg-white/[0.03] border border-white/[0.06] flex items-center justify-center mb-4">
        {icon || <Inbox className="w-5 h-5 text-muted-foreground" />}
      </div>
      <h3 className="text-sm font-medium text-foreground mb-1">{title}</h3>
      <p className="text-xs text-muted-foreground max-w-xs">{description}</p>
    </motion.div>
  );
}
