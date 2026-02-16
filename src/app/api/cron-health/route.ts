import { NextResponse } from 'next/server';
import { readWorkspaceJson } from '@/lib/workspace';
import type { CronJob } from '@/lib/types';

export const dynamic = 'force-dynamic';

export async function GET() {
  const crons = await readWorkspaceJson<CronJob[]>('state/crons.json');
  return NextResponse.json({ crons: crons || [], timestamp: new Date().toISOString() });
}
