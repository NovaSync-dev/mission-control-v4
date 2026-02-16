import { NextResponse } from 'next/server';
import { readWorkspaceFile } from '@/lib/workspace';
import { convexQuery, api } from '@/lib/convex-fallback';

export const dynamic = 'force-dynamic';

export async function GET() {
  const content = await readWorkspaceFile('shared-context/priorities.md');
  if (content) return NextResponse.json({ content, timestamp: new Date().toISOString() });

  const state = await convexQuery<any>(api.sync.getSystemState, { key: 'priorities' });
  if (state?.value) return NextResponse.json({ content: state.value, timestamp: state.syncedAt });

  return NextResponse.json({ content: '', timestamp: new Date().toISOString() });
}
