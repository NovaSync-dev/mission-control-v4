import { NextResponse } from 'next/server';
import { readWorkspaceFile } from '@/lib/workspace';

export const dynamic = 'force-dynamic';

export async function GET() {
  const content = await readWorkspaceFile('shared-context/priorities.md');
  return NextResponse.json({ content: content || '', timestamp: new Date().toISOString() });
}
