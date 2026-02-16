import { defineSchema, defineTable } from 'convex/server';
import { v } from 'convex/values';

export default defineSchema({
  activities: defineTable({
    type: v.string(),
    message: v.string(),
    source: v.optional(v.string()),
    metadata: v.optional(v.any()),
    timestamp: v.number(),
  }).index('by_timestamp', ['timestamp']),

  calendarEvents: defineTable({
    title: v.string(),
    description: v.optional(v.string()),
    startTime: v.number(),
    endTime: v.number(),
    type: v.string(),
    color: v.optional(v.string()),
    allDay: v.optional(v.boolean()),
  }).index('by_start', ['startTime']),

  tasks: defineTable({
    title: v.string(),
    description: v.optional(v.string()),
    status: v.string(),
    priority: v.string(),
    category: v.optional(v.string()),
    assignee: v.optional(v.string()),
    dueDate: v.optional(v.number()),
    createdAt: v.number(),
    updatedAt: v.number(),
  }).index('by_status', ['status']).index('by_priority', ['priority']),

  contacts: defineTable({
    name: v.string(),
    email: v.optional(v.string()),
    company: v.optional(v.string()),
    role: v.optional(v.string()),
    notes: v.optional(v.string()),
    tags: v.optional(v.array(v.string())),
    lastContact: v.optional(v.number()),
    createdAt: v.number(),
  }).index('by_name', ['name']),

  contentDrafts: defineTable({
    title: v.string(),
    body: v.optional(v.string()),
    platform: v.string(),
    status: v.string(),
    author: v.optional(v.string()),
    scheduledFor: v.optional(v.number()),
    createdAt: v.number(),
    updatedAt: v.number(),
  }).index('by_status', ['status']).index('by_platform', ['platform']),

  ecosystemProducts: defineTable({
    slug: v.string(),
    name: v.string(),
    description: v.string(),
    status: v.string(),
    health: v.string(),
    url: v.optional(v.string()),
    metrics: v.optional(v.any()),
    updatedAt: v.number(),
  }).index('by_slug', ['slug']).index('by_status', ['status']),

  // === State Sync Tables (pushed from Mac Mini) ===

  systemServices: defineTable({
    name: v.string(),
    port: v.optional(v.number()),
    status: v.string(),
    pid: v.optional(v.number()),
    lastCheck: v.optional(v.string()),
    responseTime: v.optional(v.number()),
  }),

  cronJobs: defineTable({
    jobId: v.string(),
    name: v.string(),
    schedule: v.string(),
    status: v.string(),
    lastStatus: v.optional(v.string()),
    lastRun: v.optional(v.string()),
    nextRun: v.optional(v.string()),
    consecutiveErrors: v.optional(v.number()),
    agent: v.optional(v.string()),
  }).index('by_jobId', ['jobId']),

  agentStatus: defineTable({
    agentId: v.string(),
    name: v.string(),
    model: v.optional(v.string()),
    status: v.string(),
    role: v.optional(v.string()),
    level: v.optional(v.string()),
    channels: v.optional(v.array(v.string())),
    capabilities: v.optional(v.array(v.string())),
    description: v.optional(v.string()),
    cronJobs: v.optional(v.array(v.string())),
    soul: v.optional(v.string()),
    rules: v.optional(v.string()),
  }).index('by_agentId', ['agentId']),

  revenue: defineTable({
    currentMRR: v.number(),
    monthlyBurn: v.number(),
    net: v.number(),
    currency: v.optional(v.string()),
    note: v.optional(v.string()),
    sources: v.optional(v.array(v.object({
      name: v.string(),
      amount: v.number(),
    }))),
    projects: v.optional(v.any()),
    syncedAt: v.string(),
  }),

  repos: defineTable({
    name: v.string(),
    path: v.optional(v.string()),
    branch: v.string(),
    lastCommit: v.optional(v.string()),
    lastCommitDate: v.optional(v.string()),
    dirtyFiles: v.optional(v.number()),
    clean: v.optional(v.boolean()),
    changes: v.optional(v.array(v.string())),
    languages: v.optional(v.any()),
  }).index('by_name', ['name']),

  systemState: defineTable({
    key: v.string(),
    value: v.string(),
    syncedAt: v.string(),
  }).index('by_key', ['key']),

  suggestedTasks: defineTable({
    taskId: v.union(v.string(), v.number()),
    title: v.string(),
    category: v.optional(v.string()),
    reasoning: v.optional(v.string()),
    nextAction: v.optional(v.string()),
    priority: v.optional(v.string()),
    effort: v.optional(v.number()),
    status: v.string(),
    createdAt: v.optional(v.string()),
  }).index('by_taskId', ['taskId']),

  contentPipeline: defineTable({
    itemId: v.string(),
    title: v.string(),
    platform: v.optional(v.string()),
    status: v.string(),
    preview: v.optional(v.string()),
    createdAt: v.optional(v.string()),
  }).index('by_status', ['status']),
});
