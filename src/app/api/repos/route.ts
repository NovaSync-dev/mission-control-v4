import { NextResponse } from 'next/server';
import { readdir, stat, readFile } from 'fs/promises';
import { join } from 'path';
import { execSync } from 'child_process';
import { convexQuery, api } from '@/lib/convex-fallback';

export const dynamic = 'force-dynamic';

const PROJECTS_DIR = join(process.env.HOME || '/root', 'Projects');

export async function GET() {
  const repos: Array<{
    name: string;
    path: string;
    branch: string;
    lastCommit: string;
    lastCommitDate: string;
    dirtyFiles: number;
    languages: Record<string, number>;
  }> = [];

  try {
    const dirs = await readdir(PROJECTS_DIR, { withFileTypes: true });
    for (const dir of dirs) {
      if (!dir.isDirectory() || dir.name.startsWith('.')) continue;
      const repoPath = join(PROJECTS_DIR, dir.name);
      const gitDir = join(repoPath, '.git');

      try {
        await stat(gitDir);
      } catch {
        continue; // Not a git repo
      }

      try {
        const branch = execSync('git rev-parse --abbrev-ref HEAD', { cwd: repoPath, encoding: 'utf-8', timeout: 5000 }).trim();
        const lastCommit = execSync('git log -1 --pretty=format:"%s"', { cwd: repoPath, encoding: 'utf-8', timeout: 5000 }).trim();
        const lastCommitDate = execSync('git log -1 --pretty=format:"%ci"', { cwd: repoPath, encoding: 'utf-8', timeout: 5000 }).trim();
        const dirtyOutput = execSync('git status --porcelain', { cwd: repoPath, encoding: 'utf-8', timeout: 5000 });
        const dirtyFiles = dirtyOutput.split('\n').filter(l => l.trim()).length;

        // Simple language detection by file extension
        const languages: Record<string, number> = {};
        try {
          const allFiles = execSync('git ls-files', { cwd: repoPath, encoding: 'utf-8', timeout: 5000 });
          for (const f of allFiles.split('\n').filter(Boolean)) {
            const ext = f.split('.').pop()?.toLowerCase() || 'other';
            const langMap: Record<string, string> = {
              ts: 'TypeScript', tsx: 'TypeScript', js: 'JavaScript', jsx: 'JavaScript',
              py: 'Python', rs: 'Rust', go: 'Go', md: 'Markdown', json: 'JSON',
              css: 'CSS', html: 'HTML', scss: 'SCSS', yaml: 'YAML', yml: 'YAML',
            };
            const lang = langMap[ext] || ext;
            languages[lang] = (languages[lang] || 0) + 1;
          }
        } catch { /* ignore */ }

        repos.push({ name: dir.name, path: repoPath, branch, lastCommit, lastCommitDate, dirtyFiles, languages });
      } catch { /* git command failed */ }
    }
  } catch { /* can't read projects dir */ }

  // Fallback to Convex if no local repos found
  if (repos.length === 0) {
    const convexRepos = await convexQuery<any[]>(api.sync.getRepos);
    if (convexRepos && convexRepos.length > 0) {
      return NextResponse.json({
        repos: convexRepos.map(r => ({
          name: r.name, path: r.path, branch: r.branch,
          lastCommit: r.lastCommit, lastCommitDate: r.lastCommitDate,
          dirtyFiles: r.dirtyFiles || 0, languages: r.languages || {},
        })),
        count: convexRepos.length,
      });
    }
  }

  return NextResponse.json({ repos, count: repos.length });
}
