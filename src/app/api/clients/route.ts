import { NextResponse } from 'next/server';
import { listDir, readWorkspaceFile } from '@/lib/workspace';
import type { ClientInfo } from '@/lib/types';

export const dynamic = 'force-dynamic';

export async function GET() {
  const files = await listDir('clients');
  const clients: ClientInfo[] = [];

  for (const file of files) {
    if (!file.endsWith('.md')) continue;
    const content = await readWorkspaceFile(`clients/${file}`);
    if (!content) continue;

    const name = file.replace('.md', '').replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
    const statusMatch = content.match(/status:\s*(prospect|contacted|meeting|proposal|active)/i);
    const contactMatch = content.match(/contact:\s*(.+)/i);
    const valueMatch = content.match(/value:\s*\$?([\d,]+)/i);

    clients.push({
      id: file.replace('.md', ''),
      name,
      status: (statusMatch?.[1]?.toLowerCase() as ClientInfo['status']) || 'prospect',
      notes: content.slice(0, 200),
      contact: contactMatch?.[1]?.trim(),
      value: valueMatch ? parseInt(valueMatch[1].replace(/,/g, '')) : undefined,
    });
  }

  return NextResponse.json({ clients });
}
