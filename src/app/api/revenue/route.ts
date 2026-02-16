import { NextResponse } from 'next/server';
import { readWorkspaceJson } from '@/lib/workspace';
import type { RevenueData } from '@/lib/types';

export const dynamic = 'force-dynamic';

export async function GET() {
  const revenue = await readWorkspaceJson<RevenueData>('state/revenue.json');
  return NextResponse.json(revenue || { currentMRR: 0, monthlyBurn: 0, net: 0, sources: [], history: [] });
}
