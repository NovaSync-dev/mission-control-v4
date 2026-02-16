import { NextResponse } from 'next/server';
import { readWorkspaceFile } from '@/lib/workspace';
import type { ContentItem } from '@/lib/types';

export const dynamic = 'force-dynamic';

function parseQueueMd(content: string): ContentItem[] {
  const items: ContentItem[] = [];
  const lines = content.split('\n');
  let currentStatus: ContentItem['status'] = 'draft';
  let currentItem: Partial<ContentItem> = {};

  for (const line of lines) {
    const sectionMatch = line.match(/^##\s+(.+)/i);
    if (sectionMatch) {
      const s = sectionMatch[1].toLowerCase();
      if (s.includes('draft')) currentStatus = 'draft';
      else if (s.includes('review')) currentStatus = 'review';
      else if (s.includes('approved')) currentStatus = 'approved';
      else if (s.includes('published')) currentStatus = 'published';
      continue;
    }

    const itemMatch = line.match(/^[-*]\s+\[([^\]]*)\]\s*(.*)/);
    if (itemMatch) {
      if (currentItem.title) {
        items.push({
          id: `content-${items.length}`,
          title: currentItem.title,
          platform: currentItem.platform || 'general',
          status: currentItem.status || currentStatus,
          preview: currentItem.preview || '',
          createdAt: currentItem.createdAt || new Date().toISOString(),
        });
      }
      const checked = itemMatch[1].trim().toLowerCase() === 'x';
      currentItem = {
        title: itemMatch[2].trim(),
        status: checked ? 'published' : currentStatus,
        preview: '',
      };
    } else if (line.match(/^[-*]\s+(.+)/) && !line.match(/^##/)) {
      const simpleMatch = line.match(/^[-*]\s+(.+)/);
      if (simpleMatch && !currentItem.title) {
        currentItem = { title: simpleMatch[1].trim(), status: currentStatus, preview: '' };
      }
    }

    const platformMatch = line.match(/platform:\s*(\w+)/i);
    if (platformMatch) currentItem.platform = platformMatch[1];
  }

  if (currentItem.title) {
    items.push({
      id: `content-${items.length}`,
      title: currentItem.title,
      platform: currentItem.platform || 'general',
      status: currentItem.status || currentStatus,
      preview: currentItem.preview || '',
      createdAt: currentItem.createdAt || new Date().toISOString(),
    });
  }

  return items;
}

export async function GET() {
  const queueMd = await readWorkspaceFile('content/queue.md');
  const items = queueMd ? parseQueueMd(queueMd) : [];

  const counts = {
    draft: items.filter(i => i.status === 'draft').length,
    review: items.filter(i => i.status === 'review').length,
    approved: items.filter(i => i.status === 'approved').length,
    published: items.filter(i => i.status === 'published').length,
  };

  return NextResponse.json({ items, counts, total: items.length });
}
