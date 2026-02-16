import { NextResponse } from 'next/server';
import { readWorkspaceJson, writeWorkspaceFile } from '@/lib/workspace';
import { convexQuery, api } from '@/lib/convex-fallback';
import type { SuggestedTask } from '@/lib/types';

export const dynamic = 'force-dynamic';

export async function GET() {
  let tasks = await readWorkspaceJson<SuggestedTask[]>('state/suggested-tasks.json');

  if (!tasks) {
    const convexTasks = await convexQuery<any[]>(api.sync.getSuggestedTasks);
    if (convexTasks) {
      tasks = convexTasks.map(t => ({
        id: String(t.taskId), title: t.title, category: t.category,
        reasoning: t.reasoning, nextAction: t.nextAction,
        priority: t.priority, effort: t.effort, status: t.status,
        createdAt: t.createdAt,
      })) as SuggestedTask[];
    }
  }

  return NextResponse.json({ tasks: tasks || [] });
}

export async function POST(req: Request) {
  const body = await req.json();
  const tasks = (await readWorkspaceJson<SuggestedTask[]>('state/suggested-tasks.json')) || [];

  if (body.action === 'approve' && body.id) {
    const task = tasks.find(t => t.id === body.id);
    if (task) task.status = 'approved';
  } else if (body.action === 'reject' && body.id) {
    const task = tasks.find(t => t.id === body.id);
    if (task) task.status = 'rejected';
  } else if (body.task) {
    tasks.push({ ...body.task, id: `task-${Date.now()}`, createdAt: new Date().toISOString(), status: 'pending' });
  }

  await writeWorkspaceFile('state/suggested-tasks.json', JSON.stringify(tasks, null, 2));
  return NextResponse.json({ tasks, success: true });
}
