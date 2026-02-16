#!/usr/bin/env node
/**
 * State Sync Script — Reads live Mac Mini state and pushes to Convex.
 * Run: node scripts/sync-state.mjs
 */
import { ConvexHttpClient } from 'convex/browser';
import { api } from '../convex/_generated/api.js';
import { execSync } from 'child_process';
import { readFileSync, readdirSync, statSync, existsSync } from 'fs';
import { join, resolve } from 'path';

const CONVEX_URL = process.env.NEXT_PUBLIC_CONVEX_URL;
if (!CONVEX_URL) {
  console.error('Missing NEXT_PUBLIC_CONVEX_URL');
  process.exit(1);
}

const client = new ConvexHttpClient(CONVEX_URL);
const WORKSPACE = process.env.WORKSPACE_PATH || join(process.env.HOME, '.openclaw/workspace');
const PROJECTS_DIR = join(process.env.HOME, 'Projects');

function readJson(path) {
  try { return JSON.parse(readFileSync(path, 'utf-8')); } catch { return null; }
}

function readText(path) {
  try { return readFileSync(path, 'utf-8'); } catch { return null; }
}

function run(cmd, opts = {}) {
  try { return execSync(cmd, { encoding: 'utf-8', timeout: 10000, ...opts }).trim(); } catch { return ''; }
}

const now = new Date().toISOString();
let synced = [];

// 1. System Services (TCP listeners)
async function syncServices() {
  const raw = run('lsof -iTCP -sTCP:LISTEN -P -n 2>/dev/null');
  const seen = new Map();
  for (const line of raw.split('\n').slice(1)) {
    const parts = line.split(/\s+/);
    if (parts.length < 9) continue;
    const name = parts[0];
    const pid = parseInt(parts[1]);
    const portMatch = parts[8]?.match(/:(\d+)$/);
    const port = portMatch ? parseInt(portMatch[1]) : undefined;
    const key = `${name}:${port}`;
    if (!seen.has(key)) {
      seen.set(key, { name, port, status: 'up', pid, lastCheck: now });
    }
  }
  const services = [...seen.values()];
  await client.mutation(api.sync.syncSystemServices, { services });
  synced.push(`services: ${services.length}`);
}

// 2. Cron Jobs
async function syncCrons() {
  const data = readJson(join(WORKSPACE, 'state/crons.json'));
  if (!data) { synced.push('crons: skipped (no file)'); return; }
  const crons = (Array.isArray(data) ? data : []).map(c => ({
    jobId: c.id || c.name,
    name: c.name,
    schedule: c.schedule || '',
    status: c.status || 'unknown',
    lastStatus: c.status === 'ok' ? 'success' : c.status,
    lastRun: c.last_run || undefined,
    nextRun: c.next_run || undefined,
    consecutiveErrors: 0,
    agent: c.agent || undefined,
  }));
  await client.mutation(api.sync.syncCronJobs, { crons });
  synced.push(`crons: ${crons.length}`);
}

// 3. Agent Status
async function syncAgents() {
  const data = readJson(join(WORKSPACE, 'agents/registry.json'));
  if (!data) { synced.push('agents: skipped'); return; }
  const agents = (Array.isArray(data) ? data : []).map(a => ({
    agentId: a.id,
    name: a.name,
    model: a.model || undefined,
    status: a.status || 'unknown',
    role: a.role || undefined,
    level: a.autonomy_level || a.level || undefined,
    channels: a.channels || undefined,
    capabilities: a.capabilities || undefined,
    description: a.description || undefined,
    cronJobs: a.cron_jobs || undefined,
  }));
  await client.mutation(api.sync.syncAgentStatus, { agents });
  synced.push(`agents: ${agents.length}`);
}

// 4. Revenue
async function syncRevenue() {
  const data = readJson(join(WORKSPACE, 'state/revenue.json'));
  if (!data) { synced.push('revenue: skipped'); return; }
  await client.mutation(api.sync.syncRevenue, {
    currentMRR: data.current_month ?? data.currentMRR ?? 0,
    monthlyBurn: data.monthly_burn ?? data.monthlyBurn ?? 0,
    net: data.net ?? 0,
    currency: data.currency || 'EUR',
    note: data.note || undefined,
    sources: undefined,
    projects: data.projects_with_revenue_potential || undefined,
    syncedAt: now,
  });
  synced.push('revenue: ok');
}

// 5. Git Repos
async function syncRepos() {
  const repos = [];
  try {
    const dirs = readdirSync(PROJECTS_DIR, { withFileTypes: true });
    for (const dir of dirs) {
      if (!dir.isDirectory() || dir.name.startsWith('.')) continue;
      const repoPath = join(PROJECTS_DIR, dir.name);
      if (!existsSync(join(repoPath, '.git'))) continue;
      const branch = run('git branch --show-current', { cwd: repoPath }) || 'unknown';
      const lastCommit = run('git log -1 --pretty=format:"%s"', { cwd: repoPath });
      const lastCommitDate = run('git log -1 --pretty=format:"%ci"', { cwd: repoPath });
      const dirty = run('git status --porcelain', { cwd: repoPath });
      const dirtyFiles = dirty ? dirty.split('\n').filter(Boolean).length : 0;
      const changes = dirty ? dirty.split('\n').filter(Boolean).map(l => l.trim()) : undefined;
      // Simple language detection
      const languages = {};
      const files = run('git ls-files', { cwd: repoPath });
      for (const f of files.split('\n').filter(Boolean)) {
        const ext = f.split('.').pop()?.toLowerCase() || 'other';
        const map = { ts: 'TypeScript', tsx: 'TypeScript', js: 'JavaScript', jsx: 'JavaScript', py: 'Python', rs: 'Rust', go: 'Go', md: 'Markdown', json: 'JSON', css: 'CSS', html: 'HTML' };
        const lang = map[ext] || ext;
        languages[lang] = (languages[lang] || 0) + 1;
      }
      repos.push({
        name: dir.name, path: repoPath, branch, lastCommit, lastCommitDate,
        dirtyFiles, clean: dirtyFiles === 0, changes: changes?.length ? changes : undefined, languages,
      });
    }
  } catch {}
  await client.mutation(api.sync.syncRepos, { repos });
  synced.push(`repos: ${repos.length}`);
}

// 6. Observations
async function syncObservations() {
  const content = readText(join(WORKSPACE, 'state/observations.md'));
  if (!content) { synced.push('observations: skipped'); return; }
  await client.mutation(api.sync.syncSystemState, { key: 'observations', value: content, syncedAt: now });
  synced.push('observations: ok');
}

// 7. Priorities
async function syncPriorities() {
  const content = readText(join(WORKSPACE, 'shared-context/priorities.md'));
  if (!content) { synced.push('priorities: skipped'); return; }
  await client.mutation(api.sync.syncSystemState, { key: 'priorities', value: content, syncedAt: now });
  synced.push('priorities: ok');
}

// 8. Suggested Tasks
async function syncSuggestedTasks() {
  const data = readJson(join(WORKSPACE, 'state/suggested-tasks.json'));
  if (!data) { synced.push('tasks: skipped'); return; }
  const tasks = (Array.isArray(data) ? data : []).map(t => ({
    taskId: String(t.id),
    title: t.title,
    category: t.category || undefined,
    reasoning: t.reasoning || undefined,
    nextAction: t.next_action || t.nextAction || undefined,
    priority: t.priority || undefined,
    effort: t.effort || undefined,
    status: t.status || 'pending',
    createdAt: t.createdAt || undefined,
  }));
  await client.mutation(api.sync.syncSuggestedTasks, { tasks });
  synced.push(`tasks: ${tasks.length}`);
}

// 9. Content Pipeline
async function syncContent() {
  const raw = readText(join(WORKSPACE, 'content/queue.md'));
  if (!raw) { synced.push('content: skipped'); return; }
  // Store raw markdown as systemState
  await client.mutation(api.sync.syncSystemState, { key: 'contentQueue', value: raw, syncedAt: now });
  synced.push('content: ok');
}

// 10. Branch Check (also merge into systemState)
async function syncBranchCheck() {
  const data = readJson(join(WORKSPACE, 'state/branch-check.json'));
  if (!data) { synced.push('branches: skipped'); return; }
  await client.mutation(api.sync.syncSystemState, { key: 'branchCheck', value: JSON.stringify(data), syncedAt: now });
  synced.push('branches: ok');
}

// 11. Servers.json (static server config)
async function syncServersJson() {
  const data = readJson(join(WORKSPACE, 'state/servers.json'));
  if (!data) return;
  await client.mutation(api.sync.syncSystemState, { key: 'servers', value: JSON.stringify(data), syncedAt: now });
}

// Run all
async function main() {
  console.log(`[sync] Starting state sync at ${now}`);
  const tasks = [
    syncServices(), syncCrons(), syncAgents(), syncRevenue(),
    syncRepos(), syncObservations(), syncPriorities(),
    syncSuggestedTasks(), syncContent(), syncBranchCheck(), syncServersJson(),
  ];
  const results = await Promise.allSettled(tasks);
  results.forEach((r, i) => {
    if (r.status === 'rejected') console.error(`[sync] Task ${i} failed:`, r.reason?.message || r.reason);
  });
  console.log(`[sync] Done: ${synced.join(', ')}`);
}

main().catch(e => { console.error('[sync] Fatal:', e); process.exit(1); });
