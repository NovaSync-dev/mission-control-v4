import { NextResponse } from 'next/server';
import { writeWorkspaceFile, readWorkspaceFile } from '@/lib/workspace';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  const { message, channel = 'web' } = await req.json();
  if (!message) return NextResponse.json({ error: 'No message' }, { status: 400 });

  const queueFile = 'state/chat-queue.json';
  const existing = await readWorkspaceFile(queueFile);
  const queue = existing ? JSON.parse(existing) : [];
  queue.push({ message, channel, timestamp: new Date().toISOString() });
  await writeWorkspaceFile(queueFile, JSON.stringify(queue, null, 2));

  return NextResponse.json({ success: true, queued: queue.length });
}
