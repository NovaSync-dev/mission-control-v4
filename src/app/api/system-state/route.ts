import { NextResponse } from 'next/server';
import { readWorkspaceJson } from '@/lib/workspace';
import { convexQuery, api } from '@/lib/convex-fallback';
import type { ServerStatus, BranchStatus } from '@/lib/types';

export const dynamic = 'force-dynamic';

export async function GET() {
  // Try filesystem first (local dev on Mac Mini)
  let servers = await readWorkspaceJson<ServerStatus[]>('state/servers.json');
  let branches = await readWorkspaceJson<BranchStatus[]>('state/branch-check.json');

  // Fallback to Convex (Vercel deployment)
  if (!servers) {
    const convexServices = await convexQuery<any[]>(api.sync.getSystemServices);
    if (convexServices) {
      servers = convexServices.map(s => ({
        name: s.name, port: s.port, status: s.status,
        lastCheck: s.lastCheck, responseTime: s.responseTime,
      }));
    }
    // Also try servers from systemState
    if (!servers || servers.length === 0) {
      const stateServers = await convexQuery<any>(api.sync.getSystemState, { key: 'servers' });
      if (stateServers?.value) {
        try { servers = JSON.parse(stateServers.value); } catch {}
      }
    }
  }

  if (!branches) {
    const branchState = await convexQuery<any>(api.sync.getSystemState, { key: 'branchCheck' });
    if (branchState?.value) {
      try {
        const data = JSON.parse(branchState.value);
        branches = (data.repos || []).map((r: any) => ({
          repo: r.name, branch: r.branch || 'main',
          behind: 0, ahead: 0, clean: r.clean !== false,
          ...r,
        }));
      } catch {}
    }
  }

  return NextResponse.json({
    servers: servers || [],
    branches: branches || [],
    timestamp: new Date().toISOString(),
  });
}
