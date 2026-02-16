import { NextResponse } from 'next/server';
import { readWorkspaceJson } from '@/lib/workspace';
import type { ServerStatus, BranchStatus } from '@/lib/types';

export const dynamic = 'force-dynamic';

export async function GET() {
  const servers = await readWorkspaceJson<ServerStatus[]>('state/servers.json');
  const branches = await readWorkspaceJson<BranchStatus[]>('state/branch-check.json');

  return NextResponse.json({
    servers: servers || [],
    branches: branches || [],
    timestamp: new Date().toISOString(),
  });
}
