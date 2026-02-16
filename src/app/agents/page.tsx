'use client';

import { Suspense, useState } from 'react';
import { PageWrapper, PageHeader } from '@/components/page-wrapper';
import { TabBar } from '@/components/tab-bar';
import { GlassCard, CardHeader } from '@/components/glass-card';
import { StatusDot } from '@/components/status-dot';
import { GridSkeleton } from '@/components/loading-skeleton';
import { EmptyState } from '@/components/empty-state';
import { Badge } from '@/components/ui/badge';
import { useAutoRefresh, useTab } from '@/lib/hooks';
import { Bot, Cpu, X, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import type { AgentInfo } from '@/lib/types';

const LEVEL_COLORS: Record<string, string> = {
  L1: 'border-white/10 text-muted-foreground',
  L2: 'border-cyan/30 text-cyan',
  L3: 'border-status-warn/30 text-status-warn',
  L4: 'border-status-up/30 text-status-up',
};

function AgentDetailPanel({ agent, onClose }: { agent: AgentInfo; onClose: () => void }) {
  const { data } = useAutoRefresh<{ soul: string | null; rules: string | null; outputs: string[] }>(`/api/agents/${agent.id}`, 30000);

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      className="fixed inset-y-0 right-0 w-full max-w-lg z-50 bg-background/95 backdrop-blur-xl border-l border-white/[0.06] overflow-y-auto"
    >
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <StatusDot status={agent.status} size="md" />
            <div>
              <h2 className="text-base font-semibold">{agent.name}</h2>
              <p className="text-xs text-muted-foreground">{agent.role} · {agent.model}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-white/[0.05]">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="flex gap-2 mb-6">
          <Badge variant="outline" className={`text-[10px] ${LEVEL_COLORS[agent.level]}`}>{agent.level}</Badge>
          <Badge variant="outline" className="text-[10px]">{agent.status}</Badge>
          <Badge variant="outline" className="text-[10px]">{agent.model}</Badge>
        </div>

        {data?.soul && (
          <div className="mb-6">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">Personality (SOUL.md)</h3>
            <div className="text-xs leading-relaxed whitespace-pre-wrap bg-white/[0.02] rounded-xl p-4 max-h-64 overflow-y-auto border border-white/[0.04]">
              {data.soul}
            </div>
          </div>
        )}

        {data?.rules && (
          <div className="mb-6">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">Capabilities (RULES.md)</h3>
            <div className="text-xs leading-relaxed whitespace-pre-wrap bg-white/[0.02] rounded-xl p-4 max-h-64 overflow-y-auto border border-white/[0.04]">
              {data.rules}
            </div>
          </div>
        )}

        {agent.subAgents && agent.subAgents.length > 0 && (
          <div className="mb-6">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">Sub-Agents</h3>
            <div className="space-y-1">
              {agent.subAgents.map(sa => (
                <div key={sa} className="text-xs p-2 rounded-lg bg-white/[0.02] flex items-center gap-2">
                  <Bot className="w-3 h-3 text-cyan" />
                  {sa}
                </div>
              ))}
            </div>
          </div>
        )}

        {data?.outputs && data.outputs.length > 0 && (
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">Recent Outputs</h3>
            <div className="space-y-1">
              {data.outputs.map((o, i) => (
                <div key={i} className="text-xs p-2 rounded-lg bg-white/[0.02] font-mono truncate">{o}</div>
              ))}
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
}

function AgentsTab() {
  const { data, loading } = useAutoRefresh<{ agents: AgentInfo[] }>('/api/agents');
  const [selectedAgent, setSelectedAgent] = useState<AgentInfo | null>(null);

  if (loading) return <GridSkeleton count={6} />;
  const agents = data?.agents || [];

  return (
    <>
      {agents.length === 0 ? (
        <EmptyState title="No agents" description="Register agents in agents/registry.json" />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {agents.map((agent, i) => (
            <GlassCard key={agent.id} delay={i * 0.05} hoverable onClick={() => setSelectedAgent(agent)}>
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                  <StatusDot status={agent.status} />
                  <h3 className="text-sm font-semibold">{agent.name}</h3>
                </div>
                <Badge variant="outline" className={`text-[10px] ${LEVEL_COLORS[agent.level]}`}>{agent.level}</Badge>
              </div>
              <p className="text-xs text-muted-foreground mb-2">{agent.role}</p>
              <div className="flex items-center justify-between text-[10px] text-muted-foreground">
                <span className="font-mono">{agent.model}</span>
                <ChevronRight className="w-3 h-3" />
              </div>
            </GlassCard>
          ))}
        </div>
      )}

      <AnimatePresence>
        {selectedAgent && <AgentDetailPanel agent={selectedAgent} onClose={() => setSelectedAgent(null)} />}
      </AnimatePresence>
    </>
  );
}

function ModelsTab() {
  const models = [
    { name: 'Claude Opus 4', id: 'claude-opus-4-6', tier: 'T1', cost: '$15/75 per MTok', routing: 'Primary', failover: 'claude-sonnet-4' },
    { name: 'Claude Sonnet 4', id: 'claude-sonnet-4', tier: 'T2', cost: '$3/15 per MTok', routing: 'Secondary', failover: 'gpt-4o' },
    { name: 'GPT-4o', id: 'gpt-4o', tier: 'T2', cost: '$2.5/10 per MTok', routing: 'Fallback', failover: 'claude-haiku' },
    { name: 'Claude Haiku 3.5', id: 'claude-3-5-haiku', tier: 'T3', cost: '$0.25/1.25 per MTok', routing: 'Light tasks', failover: 'gpt-4o-mini' },
    { name: 'GPT-4o Mini', id: 'gpt-4o-mini', tier: 'T3', cost: '$0.15/0.6 per MTok', routing: 'Budget', failover: 'none' },
  ];

  return (
    <GlassCard>
      <CardHeader title="Model Inventory" icon={<Cpu className="w-4 h-4" />} />
      <div className="overflow-x-auto">
        <table className="w-full text-xs">
          <thead>
            <tr className="border-b border-white/[0.06]">
              {['Model', 'ID', 'Tier', 'Cost', 'Routing', 'Failover'].map(h => (
                <th key={h} className="text-left p-2 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {models.map(m => (
              <tr key={m.id} className="border-b border-white/[0.03] hover:bg-white/[0.02]">
                <td className="p-2 font-medium">{m.name}</td>
                <td className="p-2 font-mono text-muted-foreground">{m.id}</td>
                <td className="p-2"><Badge variant="outline" className="text-[9px]">{m.tier}</Badge></td>
                <td className="p-2 text-muted-foreground">{m.cost}</td>
                <td className="p-2">{m.routing}</td>
                <td className="p-2 font-mono text-muted-foreground">{m.failover}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </GlassCard>
  );
}

function AgentsContent() {
  const [tab, setTab] = useTab('agents');
  const tabs = [
    { id: 'agents', label: 'Agents', icon: <Bot className="w-3 h-3" /> },
    { id: 'models', label: 'Models', icon: <Cpu className="w-3 h-3" /> },
  ];

  return (
    <PageWrapper>
      <PageHeader title="Agents" description="Agent fleet management">
        <TabBar tabs={tabs} activeTab={tab} onTabChange={setTab} layoutId="agents-tab" />
      </PageHeader>
      {tab === 'agents' && <AgentsTab />}
      {tab === 'models' && <ModelsTab />}
    </PageWrapper>
  );
}

export default function AgentsPage() {
  return <Suspense><AgentsContent /></Suspense>;
}
