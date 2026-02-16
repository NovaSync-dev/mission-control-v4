import { NextResponse } from 'next/server';
import { readWorkspaceJson, readWorkspaceFile, listDir } from '@/lib/workspace';
import { convexQuery, api } from '@/lib/convex-fallback';
import type { AgentInfo } from '@/lib/types';

export const dynamic = 'force-dynamic';

export async function GET() {
  const registry = await readWorkspaceJson<AgentInfo[]>('agents/registry.json');

  if (registry && Array.isArray(registry)) {
    const enriched = await Promise.all(
      registry.map(async (agent) => {
        const soul = await readWorkspaceFile(`agents/${agent.id}/SOUL.md`);
        const rules = await readWorkspaceFile(`agents/${agent.id}/RULES.md`);
        return { ...agent, soul: soul || undefined, rules: rules || undefined };
      })
    );
    return NextResponse.json({ agents: enriched, count: enriched.length });
  }

  // Fallback to Convex
  const convexAgents = await convexQuery<any[]>(api.sync.getAgentStatus);
  if (convexAgents && convexAgents.length > 0) {
    const agents = convexAgents.map(a => ({
      id: a.agentId, name: a.name, model: a.model, status: a.status,
      role: a.role, level: a.level, channels: a.channels,
      capabilities: a.capabilities, description: a.description,
      cron_jobs: a.cronJobs, soul: a.soul, rules: a.rules,
    }));
    return NextResponse.json({ agents, count: agents.length });
  }

  // Final fallback: scan agents directory
  const dirs = await listDir('agents');
  const agents: AgentInfo[] = [];
  for (const dir of dirs) {
    if (dir.startsWith('.') || dir.endsWith('.json')) continue;
    const soul = await readWorkspaceFile(`agents/${dir}/SOUL.md`);
    agents.push({
      id: dir,
      name: dir.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase()),
      role: 'Agent', model: 'unknown', level: 'L1', status: 'idle',
      soul: soul || undefined,
    });
  }

  return NextResponse.json({ agents, count: agents.length });
}
