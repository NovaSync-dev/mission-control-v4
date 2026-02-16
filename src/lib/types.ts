export interface ServerStatus {
  name: string;
  url?: string;
  port?: number;
  status: 'up' | 'down' | 'unknown';
  lastCheck?: string;
  responseTime?: number;
}

export interface AgentInfo {
  id: string;
  name: string;
  role: string;
  model: string;
  level: 'L1' | 'L2' | 'L3' | 'L4';
  status: 'active' | 'idle' | 'error' | 'offline';
  soul?: string;
  rules?: string;
  subAgents?: string[];
  recentOutputs?: string[];
}

export interface CronJob {
  name: string;
  schedule: string;
  lastRun?: string;
  lastStatus: 'success' | 'error' | 'unknown';
  consecutiveErrors: number;
  nextRun?: string;
}

export interface RevenueData {
  currentMRR: number;
  monthlyBurn: number;
  net: number;
  sources: Array<{ name: string; amount: number }>;
  history: Array<{ month: string; revenue: number; burn: number }>;
}

export interface ContentItem {
  id: string;
  title: string;
  platform: string;
  status: 'draft' | 'review' | 'approved' | 'published';
  preview: string;
  createdAt: string;
  updatedAt?: string;
}

export interface SuggestedTask {
  id: string;
  title: string;
  category: string;
  reasoning: string;
  nextAction: string;
  priority: 'critical' | 'high' | 'medium' | 'low';
  effort: 'quick' | 'medium' | 'large' | 'epic';
  status: 'pending' | 'approved' | 'rejected' | 'completed';
  createdAt: string;
}

export interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: string;
  channel?: string;
}

export interface ChatSession {
  id: string;
  name: string;
  channel: string;
  lastMessage: string;
  messageCount: number;
  updatedAt: string;
}

export interface ClientInfo {
  id: string;
  name: string;
  status: 'prospect' | 'contacted' | 'meeting' | 'proposal' | 'active';
  notes: string;
  contact?: string;
  value?: number;
  lastContact?: string;
}

export interface RepoInfo {
  name: string;
  path: string;
  branch: string;
  lastCommit: string;
  lastCommitDate: string;
  dirtyFiles: number;
  languages: Record<string, number>;
}

export interface EcosystemProduct {
  slug: string;
  name: string;
  status: 'active' | 'development' | 'planned' | 'archived';
  health: 'healthy' | 'warning' | 'critical';
  description: string;
  metrics?: Record<string, string | number>;
}

export interface BranchStatus {
  repo: string;
  branch: string;
  behind: number;
  ahead: number;
  lastCheck: string;
}

export interface Observation {
  id: number;
  date: string | null;
  content: string;
  category?: string;
}
