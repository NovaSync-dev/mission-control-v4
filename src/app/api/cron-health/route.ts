import { NextResponse } from 'next/server';
import { readWorkspaceJson } from '@/lib/workspace';
import { convexQuery, api } from '@/lib/convex-fallback';
import type { CronJob } from '@/lib/types';

export const dynamic = 'force-dynamic';

export async function GET() {
  let crons = await readWorkspaceJson<CronJob[]>('state/crons.json');

  if (!crons) {
    const convexCrons = await convexQuery<any[]>(api.sync.getCronJobs);
    if (convexCrons) {
      crons = convexCrons.map(c => ({
        name: c.name, schedule: c.schedule, status: c.status,
        lastStatus: c.lastStatus || c.status,
        lastRun: c.lastRun, nextRun: c.nextRun,
        consecutiveErrors: c.consecutiveErrors || 0,
        agent: c.agent,
      })) as CronJob[];
    }
  }

  return NextResponse.json({ crons: crons || [], timestamp: new Date().toISOString() });
}
