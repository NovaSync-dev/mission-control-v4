'use client';

import { PageWrapper } from '@/components/page-wrapper';
import { GlassCard, CardHeader } from '@/components/glass-card';
import { StatusDot } from '@/components/status-dot';
import { CardSkeleton } from '@/components/loading-skeleton';
import { EmptyState } from '@/components/empty-state';
import { useAutoRefresh } from '@/lib/hooks';
import { Badge } from '@/components/ui/badge';
import {
  Server, Bot, Clock, DollarSign, FileText, Activity,
  CheckCircle2, AlertCircle, Users, Zap,
} from 'lucide-react';
import type { ServerStatus, AgentInfo, CronJob, RevenueData, ContentItem } from '@/lib/types';

function SystemHealthCard() {
  const { data, loading } = useAutoRefresh<{ servers: ServerStatus[] }>('/api/system-state');
  if (loading) return <CardSkeleton lines={4} />;
  const servers = data?.servers || [];

  return (
    <GlassCard delay={0}>
      <CardHeader title="System Health" icon={<Server className="w-4 h-4" />}
        badge={<Badge variant="outline" className="text-[10px] ml-2 border-white/10">
          {servers.filter(s => s.status === 'up').length}/{servers.length} UP
        </Badge>} />
      {servers.length === 0 ? (
        <p className="text-xs text-muted-foreground">No servers configured</p>
      ) : (
        <div className="space-y-2">
          {servers.map((s, i) => (
            <div key={i} className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <StatusDot status={s.status} />
                <span className="font-mono">{s.name}</span>
              </div>
              <div className="flex items-center gap-3 text-muted-foreground">
                {s.port && <span className="font-mono">:{s.port}</span>}
                {s.lastCheck && <span className="text-[10px]">{new Date(s.lastCheck).toLocaleTimeString()}</span>}
              </div>
            </div>
          ))}
        </div>
      )}
    </GlassCard>
  );
}

function AgentStatusCard() {
  const { data, loading } = useAutoRefresh<{ agents: AgentInfo[]; count: number }>('/api/agents');
  if (loading) return <CardSkeleton />;
  const agents = data?.agents || [];
  const active = agents.filter(a => a.status === 'active').length;
  const total = agents.length;

  return (
    <GlassCard delay={0.05}>
      <CardHeader title="Agent Status" icon={<Bot className="w-4 h-4" />} />
      <div className="grid grid-cols-3 gap-3">
        <div>
          <p className="text-2xl font-bold">{total}</p>
          <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Total</p>
        </div>
        <div>
          <p className="text-2xl font-bold text-status-up">{active}</p>
          <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Active</p>
        </div>
        <div>
          <p className="text-2xl font-bold text-status-warn">{total - active}</p>
          <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Idle</p>
        </div>
      </div>
    </GlassCard>
  );
}

function CronHealthCard() {
  const { data, loading } = useAutoRefresh<{ crons: CronJob[] }>('/api/cron-health');
  if (loading) return <CardSkeleton lines={5} />;
  const crons = data?.crons || [];

  return (
    <GlassCard delay={0.1}>
      <CardHeader title="Cron Health" icon={<Clock className="w-4 h-4" />}
        badge={<Badge variant="outline" className="text-[10px] ml-2 border-white/10">
          {crons.length} jobs
        </Badge>} />
      {crons.length === 0 ? (
        <p className="text-xs text-muted-foreground">No cron jobs found</p>
      ) : (
        <div className="space-y-1.5 max-h-40 overflow-y-auto">
          {crons.map((c, i) => (
            <div key={i} className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <StatusDot status={c.lastStatus === 'success' ? 'up' : c.lastStatus === 'error' ? 'down' : 'unknown'} />
                <span className="font-mono truncate max-w-[120px]">{c.name}</span>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <span className="text-[10px] font-mono">{c.schedule}</span>
                {c.consecutiveErrors > 0 && (
                  <Badge variant="destructive" className="text-[9px] px-1 py-0">{c.consecutiveErrors}✗</Badge>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </GlassCard>
  );
}

function RevenueCard() {
  const { data, loading } = useAutoRefresh<RevenueData>('/api/revenue');
  if (loading) return <CardSkeleton />;

  const fmt = (n: number) => `$${Math.abs(n).toLocaleString()}`;

  return (
    <GlassCard delay={0.15}>
      <CardHeader title="Revenue" icon={<DollarSign className="w-4 h-4" />} />
      <div className="grid grid-cols-3 gap-3">
        <div>
          <p className="text-2xl font-bold">{fmt(data?.currentMRR || 0)}</p>
          <p className="text-[10px] text-muted-foreground uppercase tracking-wider">MRR</p>
        </div>
        <div>
          <p className="text-2xl font-bold text-status-down">{fmt(data?.monthlyBurn || 0)}</p>
          <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Burn</p>
        </div>
        <div>
          <p className={`text-2xl font-bold ${(data?.net || 0) >= 0 ? 'text-status-up' : 'text-status-down'}`}>
            {(data?.net || 0) >= 0 ? '+' : '-'}{fmt(data?.net || 0)}
          </p>
          <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Net</p>
        </div>
      </div>
      {data?.sources && data.sources.length > 0 && (
        <div className="mt-3 pt-3 border-t border-white/[0.06] space-y-1">
          {data.sources.map((s, i) => (
            <div key={i} className="flex justify-between text-xs">
              <span className="text-muted-foreground">{s.name}</span>
              <span className="font-mono">{fmt(s.amount)}</span>
            </div>
          ))}
        </div>
      )}
    </GlassCard>
  );
}

function ContentPipelineCard() {
  const { data, loading } = useAutoRefresh<{ counts: Record<string, number>; total: number }>('/api/content-pipeline');
  if (loading) return <CardSkeleton />;
  const counts = data?.counts || { draft: 0, review: 0, approved: 0, published: 0 };

  const stages = [
    { label: 'Draft', count: counts.draft, color: 'bg-white/20' },
    { label: 'Review', count: counts.review, color: 'bg-status-warn' },
    { label: 'Approved', count: counts.approved, color: 'bg-cyan' },
    { label: 'Published', count: counts.published, color: 'bg-status-up' },
  ];

  return (
    <GlassCard delay={0.2}>
      <CardHeader title="Content Pipeline" icon={<FileText className="w-4 h-4" />}
        badge={<Badge variant="outline" className="text-[10px] ml-2 border-white/10">{data?.total || 0} items</Badge>} />
      <div className="flex gap-2">
        {stages.map((s) => (
          <div key={s.label} className="flex-1 text-center">
            <div className={`h-1 rounded-full ${s.color} mb-2 opacity-60`} />
            <p className="text-lg font-bold">{s.count}</p>
            <p className="text-[10px] text-muted-foreground uppercase tracking-wider">{s.label}</p>
          </div>
        ))}
      </div>
    </GlassCard>
  );
}

function QuickStatsCard() {
  const { data: health } = useAutoRefresh<{ uptime: number; uptimeFormatted: string }>('/api/health');

  return (
    <GlassCard delay={0.25}>
      <CardHeader title="Quick Stats" icon={<Activity className="w-4 h-4" />} />
      <div className="grid grid-cols-2 gap-4">
        {[
          { icon: <CheckCircle2 className="w-3.5 h-3.5 text-status-up" />, label: 'Uptime', value: health?.uptimeFormatted || '...' },
          { icon: <Zap className="w-3.5 h-3.5 text-status-warn" />, label: 'Active Sessions', value: '—' },
          { icon: <AlertCircle className="w-3.5 h-3.5 text-cyan" />, label: 'Pending', value: '—' },
          { icon: <Users className="w-3.5 h-3.5 text-muted-foreground" />, label: 'Tasks', value: '—' },
        ].map((s) => (
          <div key={s.label} className="flex items-center gap-2">
            {s.icon}
            <div>
              <p className="text-sm font-semibold">{s.value}</p>
              <p className="text-[10px] text-muted-foreground">{s.label}</p>
            </div>
          </div>
        ))}
      </div>
    </GlassCard>
  );
}

export default function HomePage() {
  return (
    <PageWrapper>
      <div className="mb-6">
        <h1 className="text-lg font-semibold tracking-tight">Dashboard</h1>
        <p className="text-xs text-muted-foreground mt-0.5">Real-time system overview</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        <SystemHealthCard />
        <AgentStatusCard />
        <CronHealthCard />
        <RevenueCard />
        <ContentPipelineCard />
        <QuickStatsCard />
      </div>
    </PageWrapper>
  );
}
