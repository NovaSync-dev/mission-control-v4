import { NextResponse } from 'next/server';
import { readWorkspaceFile, readWorkspaceJson } from '@/lib/workspace';

export const dynamic = 'force-dynamic';

export async function GET(_req: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;

  // Try reading from memory/ecosystem or products directory
  const memoryFile = await readWorkspaceFile(`memory/ecosystem/${slug}.md`);
  const productFile = await readWorkspaceFile(`products/${slug}.md`);
  const productJson = await readWorkspaceJson(`products/${slug}.json`);

  return NextResponse.json({
    slug,
    content: memoryFile || productFile || null,
    data: productJson || null,
  });
}
