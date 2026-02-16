import { NextResponse } from 'next/server';
import { readWorkspaceJson } from '@/lib/workspace';
import { convexQuery, api } from '@/lib/convex-fallback';
import type { RevenueData } from '@/lib/types';

export const dynamic = 'force-dynamic';

export async function GET() {
  const revenue = await readWorkspaceJson<any>('state/revenue.json');

  if (revenue) {
    return NextResponse.json({
      currentMRR: revenue.current_month ?? revenue.currentMRR ?? 0,
      monthlyBurn: revenue.monthly_burn ?? revenue.monthlyBurn ?? 0,
      net: revenue.net ?? 0,
      sources: revenue.sources || [],
      history: revenue.history || [],
    });
  }

  // Fallback to Convex
  const convexRevenue = await convexQuery<any>(api.sync.getRevenue);
  if (convexRevenue) {
    return NextResponse.json({
      currentMRR: convexRevenue.currentMRR,
      monthlyBurn: convexRevenue.monthlyBurn,
      net: convexRevenue.net,
      sources: convexRevenue.sources || [],
      history: [],
    });
  }

  return NextResponse.json({ currentMRR: 0, monthlyBurn: 0, net: 0, sources: [], history: [] });
}
