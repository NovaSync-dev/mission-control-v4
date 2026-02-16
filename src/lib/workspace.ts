import { readFile, readdir, stat } from 'fs/promises';
import { join, resolve } from 'path';
import { existsSync } from 'fs';

export const WORKSPACE = process.env.WORKSPACE_PATH || join(process.env.HOME || '/root', '.openclaw/workspace');
export const PROJECTS_DIR = join(process.env.HOME || '/root', 'Desktop/Projects');

export async function readWorkspaceFile(relativePath: string): Promise<string | null> {
  const fullPath = resolve(WORKSPACE, relativePath);
  try {
    return await readFile(fullPath, 'utf-8');
  } catch {
    return null;
  }
}

export async function readWorkspaceJson<T = unknown>(relativePath: string): Promise<T | null> {
  const content = await readWorkspaceFile(relativePath);
  if (!content) return null;
  try {
    return JSON.parse(content) as T;
  } catch {
    return null;
  }
}

export async function writeWorkspaceFile(relativePath: string, content: string): Promise<boolean> {
  const fullPath = resolve(WORKSPACE, relativePath);
  try {
    const { writeFile, mkdir } = await import('fs/promises');
    const { dirname } = await import('path');
    await mkdir(dirname(fullPath), { recursive: true });
    await writeFile(fullPath, content, 'utf-8');
    return true;
  } catch {
    return false;
  }
}

export async function listDir(relativePath: string): Promise<string[]> {
  const fullPath = resolve(WORKSPACE, relativePath);
  try {
    return await readdir(fullPath);
  } catch {
    return [];
  }
}

export async function fileExists(relativePath: string): Promise<boolean> {
  return existsSync(resolve(WORKSPACE, relativePath));
}

export async function fileStat(relativePath: string) {
  try {
    return await stat(resolve(WORKSPACE, relativePath));
  } catch {
    return null;
  }
}

export function parseMarkdownSections(content: string): Record<string, string> {
  const sections: Record<string, string> = {};
  const lines = content.split('\n');
  let currentSection = 'intro';
  let currentContent: string[] = [];

  for (const line of lines) {
    const match = line.match(/^#{1,3}\s+(.+)/);
    if (match) {
      if (currentContent.length > 0) {
        sections[currentSection] = currentContent.join('\n').trim();
      }
      currentSection = match[1].trim().toLowerCase();
      currentContent = [];
    } else {
      currentContent.push(line);
    }
  }
  if (currentContent.length > 0) {
    sections[currentSection] = currentContent.join('\n').trim();
  }
  return sections;
}

export async function searchFiles(query: string, extensions = ['.md', '.json', '.txt', '.ts']): Promise<Array<{ path: string; line: number; content: string }>> {
  const results: Array<{ path: string; line: number; content: string }> = [];
  const lowerQuery = query.toLowerCase();

  async function walk(dir: string, prefix = '') {
    const entries = await readdir(dir, { withFileTypes: true }).catch(() => []);
    for (const entry of entries) {
      if (entry.name.startsWith('.') || entry.name === 'node_modules') continue;
      const fullPath = join(dir, entry.name);
      const relPath = prefix ? `${prefix}/${entry.name}` : entry.name;
      if (entry.isDirectory()) {
        await walk(fullPath, relPath);
      } else if (extensions.some(ext => entry.name.endsWith(ext))) {
        try {
          const content = await readFile(fullPath, 'utf-8');
          const lines = content.split('\n');
          lines.forEach((line, i) => {
            if (line.toLowerCase().includes(lowerQuery)) {
              results.push({ path: relPath, line: i + 1, content: line.trim() });
            }
          });
        } catch { /* skip */ }
      }
      if (results.length >= 100) return;
    }
  }

  await walk(WORKSPACE);
  return results.slice(0, 100);
}
