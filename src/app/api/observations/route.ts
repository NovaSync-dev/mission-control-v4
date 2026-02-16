import { NextResponse } from 'next/server';
import { readWorkspaceFile } from '@/lib/workspace';

export const dynamic = 'force-dynamic';

export async function GET() {
  const content = await readWorkspaceFile('state/observations.md');
  if (!content) return NextResponse.json({ observations: [] });

  const observations = content.split('\n').filter(l => l.trim()).map((line, i) => {
    const dateMatch = line.match(/^(\d{4}-\d{2}-\d{2})\s*[-:]\s*(.*)/);
    if (dateMatch) return { id: i, date: dateMatch[1], content: dateMatch[2].trim() };
    return { id: i, date: null, content: line.replace(/^[-*]\s*/, '').trim() };
  }).filter(o => o.content);

  return NextResponse.json({ observations });
}
