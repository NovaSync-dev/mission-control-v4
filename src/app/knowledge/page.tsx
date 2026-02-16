'use client';

import { Suspense, useState } from 'react';
import { PageWrapper, PageHeader } from '@/components/page-wrapper';
import { TabBar } from '@/components/tab-bar';
import { GlassCard } from '@/components/glass-card';
import { EmptyState } from '@/components/empty-state';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { useTab, useDebounce } from '@/lib/hooks';
import { Brain, Globe, Search, FileText, ExternalLink } from 'lucide-react';
import { useEffect, useCallback } from 'react';

function KnowledgeTab() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Array<{ path: string; line: number; content: string }>>([]);
  const [loading, setLoading] = useState(false);
  const debouncedQuery = useDebounce(query, 300);

  useEffect(() => {
    if (!debouncedQuery || debouncedQuery.length < 2) { setResults([]); return; }
    setLoading(true);
    fetch(`/api/knowledge?q=${encodeURIComponent(debouncedQuery)}`)
      .then(r => r.json())
      .then(d => { setResults(d.results || []); setLoading(false); })
      .catch(() => { setResults([]); setLoading(false); });
  }, [debouncedQuery]);

  return (
    <div>
      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder="Search across all workspace files..."
          className="pl-10 text-sm bg-white/[0.03] border-white/[0.06]"
        />
      </div>

      {!query ? (
        <EmptyState title="Search the knowledge base" description="Type to search across all workspace files" icon={<Brain className="w-5 h-5 text-muted-foreground" />} />
      ) : loading ? (
        <p className="text-xs text-muted-foreground text-center py-8">Searching...</p>
      ) : results.length === 0 ? (
        <EmptyState title="No results" description={`No matches found for "${query}"`} />
      ) : (
        <div className="space-y-2">
          <p className="text-[10px] text-muted-foreground mb-3">{results.length} results</p>
          {results.map((r, i) => (
            <GlassCard key={i} delay={i * 0.02} className="p-3">
              <div className="flex items-center gap-2 mb-1">
                <FileText className="w-3 h-3 text-cyan shrink-0" />
                <span className="text-[10px] font-mono text-cyan truncate">{r.path}</span>
                <Badge variant="outline" className="text-[9px] shrink-0">L{r.line}</Badge>
              </div>
              <p className="text-xs text-muted-foreground line-clamp-2">{r.content}</p>
            </GlassCard>
          ))}
        </div>
      )}
    </div>
  );
}

function EcosystemTab() {
  const products = [
    { slug: 'openclaw', name: 'OpenClaw', status: 'active', health: 'healthy', description: 'AI agent orchestration platform' },
    { slug: 'mission-control', name: 'Mission Control', status: 'development', health: 'healthy', description: 'Dashboard & monitoring' },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
      {products.map((p, i) => (
        <GlassCard key={p.slug} delay={i * 0.05} hoverable>
          <div className="flex items-start justify-between mb-2">
            <div className="flex items-center gap-2">
              <Globe className="w-4 h-4 text-cyan" />
              <h3 className="text-sm font-semibold">{p.name}</h3>
            </div>
            <div className="flex gap-1">
              <Badge variant="outline" className="text-[9px]">{p.status}</Badge>
            </div>
          </div>
          <p className="text-xs text-muted-foreground mb-3">{p.description}</p>
          <a href={`/knowledge?tab=ecosystem&product=${p.slug}`}
            className="text-[10px] text-cyan flex items-center gap-1 hover:underline">
            View details <ExternalLink className="w-3 h-3" />
          </a>
        </GlassCard>
      ))}
    </div>
  );
}

function KnowledgeContent() {
  const [tab, setTab] = useTab('knowledge');
  const tabs = [
    { id: 'knowledge', label: 'Knowledge', icon: <Brain className="w-3 h-3" /> },
    { id: 'ecosystem', label: 'Ecosystem', icon: <Globe className="w-3 h-3" /> },
  ];

  return (
    <PageWrapper>
      <PageHeader title="Knowledge" description="Search & explore">
        <TabBar tabs={tabs} activeTab={tab} onTabChange={setTab} layoutId="knowledge-tab" />
      </PageHeader>
      {tab === 'knowledge' && <KnowledgeTab />}
      {tab === 'ecosystem' && <EcosystemTab />}
    </PageWrapper>
  );
}

export default function KnowledgePage() {
  return <Suspense><KnowledgeContent /></Suspense>;
}
