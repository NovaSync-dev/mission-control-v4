'use client';

import { Suspense } from 'react';
import { PageWrapper, PageHeader } from '@/components/page-wrapper';
import { TabBar } from '@/components/tab-bar';
import { GlassCard, CardHeader } from '@/components/glass-card';
import { EmptyState } from '@/components/empty-state';
import { Badge } from '@/components/ui/badge';
import { useAutoRefresh, useTab } from '@/lib/hooks';
import { Radio, Users, MessageCircle, Bell } from 'lucide-react';
import type { ClientInfo } from '@/lib/types';

const CRM_COLUMNS: Array<{ key: ClientInfo['status']; label: string; emoji: string }> = [
  { key: 'prospect', label: 'Prospect', emoji: '🎯' },
  { key: 'contacted', label: 'Contacted', emoji: '📧' },
  { key: 'meeting', label: 'Meeting', emoji: '📅' },
  { key: 'proposal', label: 'Proposal', emoji: '📝' },
  { key: 'active', label: 'Active', emoji: '✅' },
];

function CommsTab() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      <GlassCard delay={0}>
        <CardHeader title="Discord Digest" icon={<MessageCircle className="w-4 h-4" />} />
        <EmptyState title="No digest" description="Discord digest will appear when connected" />
      </GlassCard>
      <GlassCard delay={0.05}>
        <CardHeader title="Telegram" icon={<MessageCircle className="w-4 h-4" />} />
        <EmptyState title="No messages" description="Telegram messages will appear here" />
      </GlassCard>
      <GlassCard delay={0.1}>
        <CardHeader title="Notifications" icon={<Bell className="w-4 h-4" />} />
        <EmptyState title="No notifications" description="System notifications will appear here" />
      </GlassCard>
    </div>
  );
}

function CRMTab() {
  const { data, loading } = useAutoRefresh<{ clients: ClientInfo[] }>('/api/clients');
  const clients = data?.clients || [];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 xl:grid-cols-5 gap-4">
      {CRM_COLUMNS.map(col => {
        const colClients = clients.filter(c => c.status === col.key);
        return (
          <div key={col.key}>
            <div className="flex items-center gap-2 mb-3">
              <span>{col.emoji}</span>
              <h3 className="text-xs font-semibold uppercase tracking-wider">{col.label}</h3>
              <span className="text-[10px] text-muted-foreground">{colClients.length}</span>
            </div>
            <div className="space-y-3">
              {colClients.map((client, i) => (
                <GlassCard key={client.id} delay={i * 0.05} className="p-4">
                  <h4 className="text-xs font-medium mb-1">{client.name}</h4>
                  {client.contact && <p className="text-[10px] text-muted-foreground mb-1">{client.contact}</p>}
                  {client.value && <Badge variant="outline" className="text-[9px]">${client.value.toLocaleString()}</Badge>}
                  <p className="text-[10px] text-muted-foreground mt-2 line-clamp-2">{client.notes}</p>
                </GlassCard>
              ))}
              {colClients.length === 0 && (
                <div className="text-center py-8 text-[10px] text-muted-foreground border border-dashed border-white/[0.06] rounded-2xl">
                  No clients
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function CommsContent() {
  const [tab, setTab] = useTab('comms');
  const tabs = [
    { id: 'comms', label: 'Comms', icon: <Radio className="w-3 h-3" /> },
    { id: 'crm', label: 'CRM', icon: <Users className="w-3 h-3" /> },
  ];

  return (
    <PageWrapper>
      <PageHeader title="Communications" description="Channels & client pipeline">
        <TabBar tabs={tabs} activeTab={tab} onTabChange={setTab} layoutId="comms-tab" />
      </PageHeader>
      {tab === 'comms' && <CommsTab />}
      {tab === 'crm' && <CRMTab />}
    </PageWrapper>
  );
}

export default function CommsPage() {
  return <Suspense><CommsContent /></Suspense>;
}
