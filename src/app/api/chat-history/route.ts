import { NextResponse } from 'next/server';
import { readdir, readFile, stat } from 'fs/promises';
import { join } from 'path';
import { WORKSPACE } from '@/lib/workspace';

export const dynamic = 'force-dynamic';

interface TranscriptLine {
  role: string;
  content: string;
  timestamp?: string;
  channel?: string;
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const sessionId = searchParams.get('session');
  const search = searchParams.get('q');
  const channel = searchParams.get('channel');
  const limit = parseInt(searchParams.get('limit') || '50');
  const offset = parseInt(searchParams.get('offset') || '0');

  // Find transcript files
  const transcriptDirs = ['transcripts', 'chat', 'logs'];
  const sessions: Array<{
    id: string;
    name: string;
    channel: string;
    lastMessage: string;
    messageCount: number;
    updatedAt: string;
    path: string;
  }> = [];

  for (const dir of transcriptDirs) {
    const dirPath = join(WORKSPACE, dir);
    try {
      const files = await readdir(dirPath);
      for (const file of files) {
        if (!file.endsWith('.jsonl') && !file.endsWith('.json')) continue;
        const filePath = join(dirPath, file);
        const fileStat = await stat(filePath);
        const id = file.replace(/\.(jsonl|json)$/, '');
        const channelMatch = file.match(/^(telegram|discord|web|cli)/i);

        sessions.push({
          id,
          name: id.replace(/[-_]/g, ' ').replace(/\b\w/g, c => c.toUpperCase()),
          channel: channelMatch ? channelMatch[1].toLowerCase() : 'unknown',
          lastMessage: '',
          messageCount: 0,
          updatedAt: fileStat.mtime.toISOString(),
          path: filePath,
        });
      }
    } catch { /* dir doesn't exist */ }
  }

  // If specific session requested, return messages
  if (sessionId) {
    const session = sessions.find(s => s.id === sessionId);
    if (!session) return NextResponse.json({ messages: [], error: 'Session not found' });

    try {
      const content = await readFile(session.path, 'utf-8');
      let messages: TranscriptLine[] = [];

      if (session.path.endsWith('.jsonl')) {
        messages = content.split('\n').filter(l => l.trim()).map(l => {
          try { return JSON.parse(l); } catch { return null; }
        }).filter(Boolean);
      } else {
        const parsed = JSON.parse(content);
        messages = Array.isArray(parsed) ? parsed : parsed.messages || [];
      }

      if (search) {
        messages = messages.filter(m => m.content?.toLowerCase().includes(search.toLowerCase()));
      }
      if (channel) {
        messages = messages.filter(m => m.channel === channel);
      }

      const total = messages.length;
      messages = messages.slice(offset, offset + limit);

      return NextResponse.json({ messages, total, session });
    } catch {
      return NextResponse.json({ messages: [], error: 'Failed to parse' });
    }
  }

  // Filter sessions
  let filtered = sessions;
  if (channel) filtered = filtered.filter(s => s.channel === channel);
  filtered.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());

  return NextResponse.json({ sessions: filtered.slice(offset, offset + limit), total: filtered.length });
}
