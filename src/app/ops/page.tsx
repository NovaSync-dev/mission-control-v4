'use client';

import { Suspense } from 'react';
import { PageWrapper, PageHeader } from '@/components/page-wrapper';
import { TabBar } from '@/components/tab-bar';
import { GlassCard, CardHeader } from '@/components/glass-card';
import { StatusDot } from '@/components/status-dot';
import { CardSkeleton, GridSkeleton } from '@/components/loading-skeleton';
import { EmptyState } from '@/components/empty-state';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useAutoRefresh, useTab } from '@/lib/hooks';
import { Settings2, ListChecks, Calendar, Check, X, Filter } from 'lucide-react';
import { useState } from 'react';
import type { ServerStatus, BranchStatus, SuggestedTask, Observation } from '@/lib/types';

const CATEGORY_EMOJI: Record<string, string> = {
  Revenue: '💰', Product: '🚀', Community: '🤝', Content: '📝',
  Operations: '⚙️', Clients: '👥', Trading: '📈', Brand: '🎨',
};
const PRIORITY_COLORS: Record<string, string> = {
  critical: 'bg-status-down/20 text-status-down border-status-down/30',
  high: 'bg-status-warn/20 text-status-warn border-status-warn/30',
  medium: 'bg-cyan/20 text-cyan border-cyan/30',
  low: 'bg-white/10 text-muted-foreground border-white/10',
};

function OperationsTab() {
  const { data: stateData, loading: stateLoading } = useAutoRefresh<{ servers: ServerStatus[]; branches: BranchStatus[] }>('/api/system-state');
  const { data: obsData } = useAutoRefresh<{ observations: Observation[] }>('/api/observations');
  const { data: priData } = useAutoRefresh<{ content: string }>('/api/priorities');

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      <GlassCard delay={0}>
        <CardHeader title="Server Health" icon={<Settings2 className="w-4 h-4" />} />
        {stateLoading ? <CardSkeleton /> : (
          <div className="space-y-2">
            {(stateData?.servers || []).length === 0 ? (
              <p className="text-xs text-muted-foreground">No servers found in state/servers.json</p>
            ) : (stateData?.servers || []).map((s, i) => (
              <div key={i} className="flex items-center justify-between text-xs p-2 rounded-lg bg-white/[0.02]">
                <div className="flex items-center gap-2">
                  <StatusDot status={s.status} />
                  <span className="font-medium">{s.name}</span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  {s.port && <span className="font-mono">:{s.port}</span>}
                  {s.responseTime && <span>{s.responseTime}ms</span>}
                </div>
              </div>
            ))}
          </div>
        )}
      </GlassCard>

      <GlassCard delay={0.05}>
        <CardHeader title="Branch Status" />
        {(stateData?.branches || []).length === 0 ? (
          <p className="text-xs text-muted-foreground">No branch data in state/branch-check.json</p>
        ) : (
          <div className="space-y-2">
            {(stateData?.branches || []).map((b, i) => (
              <div key={i} className="flex items-center justify-between text-xs p-2 rounded-lg bg-white/[0.02]">
                <span className="font-mono">{b.repo}/{b.branch}</span>
                <div className="flex gap-2">
                  {b.behind > 0 && <Badge variant="outline" className="text-[9px] border-status-warn/30 text-status-warn">↓{b.behind}</Badge>}
                  {b.ahead > 0 && <Badge variant="outline" className="text-[9px] border-status-up/30 text-status-up">↑{b.ahead}</Badge>}
                </div>
              </div>
            ))}
          </div>
        )}
      </GlassCard>

      <GlassCard delay={0.1}>
        <CardHeader title="Observations" />
        {(obsData?.observations || []).length === 0 ? (
          <p className="text-xs text-muted-foreground">No observations in state/observations.md</p>
        ) : (
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {(obsData?.observations || []).slice(0, 15).map((o) => (
              <div key={o.id} className="text-xs p-2 rounded-lg bg-white/[0.02]">
                {o.date && <span className="text-[10px] text-muted-foreground font-mono mr-2">{o.date}</span>}
                <span>{o.content}</span>
              </div>
            ))}
          </div>
        )}
      </GlassCard>

      <GlassCard delay={0.15}>
        <CardHeader title="Priorities" />
        {priData?.content ? (
          <div className="text-xs leading-relaxed whitespace-pre-wrap max-h-64 overflow-y-auto text-muted-foreground">
            {priData.content}
          </div>
        ) : (
          <p className="text-xs text-muted-foreground">No priorities in shared-context/priorities.md</p>
        )}
      </GlassCard>
    </div>
  );
}

function TasksTab() {
  const { data, loading, refetch } = useAutoRefresh<{ tasks: SuggestedTask[] }>('/api/suggested-tasks');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');

  const handleAction = async (id: string, action: 'approve' | 'reject') => {
    await fetch('/api/suggested-tasks', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, action }),
    });
    refetch();
  };

  if (loading) return <GridSkeleton count={6} />;
  const tasks = data?.tasks || [];
  const filtered = tasks.filter(t =>
    (statusFilter === 'all' || t.status === statusFilter) &&
    (categoryFilter === 'all' || t.category === categoryFilter)
  );

  const categories = [...new Set(tasks.map(t => t.category))];
  const grouped = categories.reduce((acc, cat) => {
    acc[cat] = filtered.filter(t => t.category === cat);
    return acc;
  }, {} as Record<string, SuggestedTask[]>);

  return (
    <div>
      <div className="flex flex-wrap items-center gap-2 mb-4">
        <Filter className="w-3.5 h-3.5 text-muted-foreground" />
        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
          className="text-xs bg-white/[0.03] border border-white/[0.06] rounded-lg px-2 py-1 text-foreground">
          <option value="all">All Status</option>
          <option value="pending">Pending</option>
          <option value="approved">Approved</option>
          <option value="rejected">Rejected</option>
        </select>
        <select value={categoryFilter} onChange={e => setCategoryFilter(e.target.value)}
          className="text-xs bg-white/[0.03] border border-white/[0.06] rounded-lg px-2 py-1 text-foreground">
          <option value="all">All Categories</option>
          {categories.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
      </div>

      {filtered.length === 0 ? (
        <EmptyState title="No tasks" description="No suggested tasks found. They'll appear when added to state/suggested-tasks.json." />
      ) : (
        <div className="space-y-6">
          {Object.entries(grouped).filter(([, tasks]) => tasks.length > 0).map(([category, tasks]) => (
            <div key={category}>
              <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
                <span>{CATEGORY_EMOJI[category] || '📋'}</span>
                {category}
                <Badge variant="outline" className="text-[10px] border-white/10">{tasks.length}</Badge>
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
                {tasks.map((task, i) => (
                  <GlassCard key={task.id} delay={i * 0.03}>
                    <div className="flex items-start justify-between mb-2">
                      <h4 className="text-sm font-medium leading-tight">{task.title}</h4>
                      <div className="flex gap-1 shrink-0 ml-2">
                        <Badge className={`text-[9px] px-1.5 border ${PRIORITY_COLORS[task.priority] || ''}`}>{task.priority}</Badge>
                        <Badge variant="outline" className="text-[9px] px-1.5 border-white/10">{task.effort}</Badge>
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground mb-2 line-clamp-2">{task.reasoning}</p>
                    <p className="text-xs text-cyan mb-3">→ {task.nextAction}</p>
                    {task.status === 'pending' && (
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline" onClick={() => handleAction(task.id, 'approve')}
                          className="h-7 text-[10px] border-status-up/30 text-status-up hover:bg-status-up/10">
                          <Check className="w-3 h-3 mr-1" />Approve
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => handleAction(task.id, 'reject')}
                          className="h-7 text-[10px] border-status-down/30 text-status-down hover:bg-status-down/10">
                          <X className="w-3 h-3 mr-1" />Reject
                        </Button>
                      </div>
                    )}
                    {task.status !== 'pending' && (
                      <Badge variant={task.status === 'approved' ? 'default' : 'secondary'} className="text-[10px]">
                        {task.status}
                      </Badge>
                    )}
                  </GlassCard>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function CalendarTab() {
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const hours = Array.from({ length: 14 }, (_, i) => i + 7); // 7am to 8pm

  return (
    <div className="glass-card p-4 overflow-x-auto">
      <div className="min-w-[700px]">
        <div className="grid grid-cols-8 gap-px mb-1">
          <div className="text-[10px] text-muted-foreground p-2" />
          {days.map(d => (
            <div key={d} className="text-[10px] text-muted-foreground font-medium p-2 text-center">{d}</div>
          ))}
        </div>
        {hours.map(h => (
          <div key={h} className="grid grid-cols-8 gap-px">
            <div className="text-[10px] text-muted-foreground p-1 text-right pr-2 font-mono">{h}:00</div>
            {days.map(d => (
              <div key={`${d}-${h}`}
                className="h-8 bg-white/[0.02] border border-white/[0.03] rounded-sm hover:bg-white/[0.05] transition-colors cursor-pointer" />
            ))}
          </div>
        ))}
      </div>
      <p className="text-[10px] text-muted-foreground mt-3 text-center">
        Connect Convex to enable calendar events. Click cells to create events.
      </p>
    </div>
  );
}

function OpsContent() {
  const [tab, setTab] = useTab('operations');

  const tabs = [
    { id: 'operations', label: 'Operations', icon: <Settings2 className="w-3 h-3" /> },
    { id: 'tasks', label: 'Tasks', icon: <ListChecks className="w-3 h-3" /> },
    { id: 'calendar', label: 'Calendar', icon: <Calendar className="w-3 h-3" /> },
  ];

  return (
    <PageWrapper>
      <PageHeader title="Operations" description="System operations and task management">
        <TabBar tabs={tabs} activeTab={tab} onTabChange={setTab} layoutId="ops-tab" />
      </PageHeader>
      {tab === 'operations' && <OperationsTab />}
      {tab === 'tasks' && <TasksTab />}
      {tab === 'calendar' && <CalendarTab />}
    </PageWrapper>
  );
}

export default function OpsPage() {
  return <Suspense><OpsContent /></Suspense>;
}
