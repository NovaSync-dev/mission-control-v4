import { NextResponse } from 'next/server';
import { searchFiles } from '@/lib/workspace';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const query = searchParams.get('q');
  if (!query) return NextResponse.json({ results: [], error: 'No query provided' });

  const results = await searchFiles(query);
  return NextResponse.json({ results, count: results.length, query });
}
