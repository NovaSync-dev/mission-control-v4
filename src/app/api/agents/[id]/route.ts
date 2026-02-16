import { NextResponse } from 'next/server';
import { readWorkspaceFile, readWorkspaceJson, listDir } from '@/lib/workspace';

export const dynamic = 'force-dynamic';

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const soul = await readWorkspaceFile(`agents/${id}/SOUL.md`);
  const rules = await readWorkspaceFile(`agents/${id}/RULES.md`);
  const registry = await readWorkspaceJson<Array<Record<string, unknown>>>('agents/registry.json');
  const entry = registry?.find((a) => a.id === id);

  const outputs = await listDir(`agents/${id}/outputs`);

  return NextResponse.json({
    id,
    soul: soul || null,
    rules: rules || null,
    registry: entry || null,
    outputs: outputs.slice(0, 20),
  });
}
