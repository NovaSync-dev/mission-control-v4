'use client';

import { PageWrapper, PageHeader } from '@/components/page-wrapper';
import { GlassCard } from '@/components/glass-card';
import { GridSkeleton } from '@/components/loading-skeleton';
import { EmptyState } from '@/components/empty-state';
import { Badge } from '@/components/ui/badge';
import { useAutoRefresh } from '@/lib/hooks';
import { Code2, GitBranch, GitCommit, AlertCircle } from 'lucide-react';
import type { RepoInfo } from '@/lib/types';

const LANG_COLORS: Record<string, string> = {
  TypeScript: 'bg-blue-400', JavaScript: 'bg-yellow-400', Python: 'bg-green-400',
  Rust: 'bg-orange-400', Go: 'bg-cyan', CSS: 'bg-purple-400', HTML: 'bg-red-400',
  Markdown: 'bg-white/40', JSON: 'bg-white/20', YAML: 'bg-pink-400',
};

export default function CodePage() {
  const { data, loading } = useAutoRefresh<{ repos: RepoInfo[] }>('/api/repos');

  if (loading) return <PageWrapper><PageHeader title="Code" /><GridSkeleton count={6} /></PageWrapper>;

  const repos = data?.repos || [];

  return (
    <PageWrapper>
      <PageHeader title="Code" description="Repository overview">
        <Badge variant="outline" className="text-[10px]">{repos.length} repos</Badge>
      </PageHeader>

      {repos.length === 0 ? (
        <EmptyState title="No repositories found" description="Git repositories in ~/Projects/ will appear here." icon={<Code2 className="w-5 h-5 text-muted-foreground" />} />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {repos.map((repo, i) => {
            const totalFiles = Object.values(repo.languages).reduce((a, b) => a + b, 0);
            const topLangs = Object.entries(repo.languages)
              .sort((a, b) => b[1] - a[1])
              .slice(0, 5);

            return (
              <GlassCard key={repo.name} delay={i * 0.05}>
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="text-sm font-semibold flex items-center gap-1.5">
                      <Code2 className="w-3.5 h-3.5 text-cyan" />
                      {repo.name}
                    </h3>
                    <div className="flex items-center gap-2 mt-1 text-[10px] text-muted-foreground">
                      <GitBranch className="w-3 h-3" />
                      <span className="font-mono">{repo.branch}</span>
                    </div>
                  </div>
                  {repo.dirtyFiles > 0 && (
                    <Badge variant="outline" className="text-[9px] border-status-warn/30 text-status-warn flex items-center gap-1">
                      <AlertCircle className="w-2.5 h-2.5" />
                      {repo.dirtyFiles} dirty
                    </Badge>
                  )}
                </div>

                <div className="flex items-center gap-1.5 mb-3 text-[10px] text-muted-foreground">
                  <GitCommit className="w-3 h-3" />
                  <span className="truncate">{repo.lastCommit}</span>
                </div>

                <div className="text-[10px] text-muted-foreground mb-2">
                  {new Date(repo.lastCommitDate).toLocaleDateString()} · {new Date(repo.lastCommitDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>

                {topLangs.length > 0 && (
                  <>
                    <div className="flex h-1.5 rounded-full overflow-hidden mb-2">
                      {topLangs.map(([lang, count]) => (
                        <div
                          key={lang}
                          className={`${LANG_COLORS[lang] || 'bg-white/20'} opacity-70`}
                          style={{ width: `${(count / totalFiles) * 100}%` }}
                        />
                      ))}
                    </div>
                    <div className="flex flex-wrap gap-x-3 gap-y-1">
                      {topLangs.map(([lang, count]) => (
                        <span key={lang} className="flex items-center gap-1 text-[9px] text-muted-foreground">
                          <span className={`w-1.5 h-1.5 rounded-full ${LANG_COLORS[lang] || 'bg-white/20'}`} />
                          {lang} {((count / totalFiles) * 100).toFixed(0)}%
                        </span>
                      ))}
                    </div>
                  </>
                )}
              </GlassCard>
            );
          })}
        </div>
      )}
    </PageWrapper>
  );
}
