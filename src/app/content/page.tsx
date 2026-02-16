'use client';

import { PageWrapper, PageHeader } from '@/components/page-wrapper';
import { GlassCard } from '@/components/glass-card';
import { CardSkeleton } from '@/components/loading-skeleton';
import { EmptyState } from '@/components/empty-state';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useAutoRefresh } from '@/lib/hooks';
import { FileText, Edit, Check, X } from 'lucide-react';
import type { ContentItem } from '@/lib/types';

const STATUS_COLUMNS: Array<{ key: ContentItem['status']; label: string; color: string }> = [
  { key: 'draft', label: 'Draft', color: 'bg-white/20' },
  { key: 'review', label: 'Review', color: 'bg-status-warn' },
  { key: 'approved', label: 'Approved', color: 'bg-cyan' },
  { key: 'published', label: 'Published', color: 'bg-status-up' },
];

export default function ContentPage() {
  const { data, loading } = useAutoRefresh<{ items: ContentItem[] }>('/api/content-pipeline');

  if (loading) return <PageWrapper><PageHeader title="Content" /><div className="grid grid-cols-4 gap-4">{Array.from({ length: 4 }).map((_, i) => <CardSkeleton key={i} />)}</div></PageWrapper>;

  const items = data?.items || [];

  return (
    <PageWrapper>
      <PageHeader title="Content Pipeline" description="Manage content across all stages">
        <Badge variant="outline" className="text-[10px]">{items.length} items</Badge>
      </PageHeader>

      {items.length === 0 ? (
        <EmptyState title="No content items" description="Add content to content/queue.md to see it here." icon={<FileText className="w-5 h-5 text-muted-foreground" />} />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
          {STATUS_COLUMNS.map(col => {
            const colItems = items.filter(i => i.status === col.key);
            return (
              <div key={col.key}>
                <div className="flex items-center gap-2 mb-3">
                  <div className={`w-2 h-2 rounded-full ${col.color}`} />
                  <h3 className="text-xs font-semibold uppercase tracking-wider">{col.label}</h3>
                  <span className="text-[10px] text-muted-foreground">{colItems.length}</span>
                </div>
                <div className="space-y-3">
                  {colItems.map((item, i) => (
                    <GlassCard key={item.id} delay={i * 0.05} className="p-4">
                      <h4 className="text-xs font-medium mb-1 line-clamp-2">{item.title}</h4>
                      <Badge variant="outline" className="text-[9px] mb-2">{item.platform}</Badge>
                      {item.preview && <p className="text-[10px] text-muted-foreground line-clamp-2 mb-3">{item.preview}</p>}
                      <div className="flex items-center justify-between">
                        <span className="text-[9px] text-muted-foreground">
                          {new Date(item.createdAt).toLocaleDateString()}
                        </span>
                        <div className="flex gap-1">
                          <Button size="icon" variant="ghost" className="h-6 w-6"><Edit className="w-3 h-3" /></Button>
                          <Button size="icon" variant="ghost" className="h-6 w-6 text-status-up"><Check className="w-3 h-3" /></Button>
                          <Button size="icon" variant="ghost" className="h-6 w-6 text-status-down"><X className="w-3 h-3" /></Button>
                        </div>
                      </div>
                    </GlassCard>
                  ))}
                  {colItems.length === 0 && (
                    <div className="text-center py-8 text-[10px] text-muted-foreground border border-dashed border-white/[0.06] rounded-2xl">
                      No items
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </PageWrapper>
  );
}
