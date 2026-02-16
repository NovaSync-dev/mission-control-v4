import { mutation, query } from './_generated/server';
import { v } from 'convex/values';

// ============ MUTATIONS (used by sync script) ============

export const syncSystemServices = mutation({
  args: { services: v.array(v.object({
    name: v.string(),
    port: v.optional(v.number()),
    status: v.string(),
    pid: v.optional(v.number()),
    lastCheck: v.optional(v.string()),
    responseTime: v.optional(v.number()),
  })) },
  handler: async (ctx, { services }) => {
    const existing = await ctx.db.query('systemServices').collect();
    for (const doc of existing) await ctx.db.delete(doc._id);
    for (const s of services) await ctx.db.insert('systemServices', s);
  },
});

export const syncCronJobs = mutation({
  args: { crons: v.array(v.object({
    jobId: v.string(),
    name: v.string(),
    schedule: v.string(),
    status: v.string(),
    lastStatus: v.optional(v.string()),
    lastRun: v.optional(v.string()),
    nextRun: v.optional(v.string()),
    consecutiveErrors: v.optional(v.number()),
    agent: v.optional(v.string()),
  })) },
  handler: async (ctx, { crons }) => {
    const existing = await ctx.db.query('cronJobs').collect();
    for (const doc of existing) await ctx.db.delete(doc._id);
    for (const c of crons) await ctx.db.insert('cronJobs', c);
  },
});

export const syncAgentStatus = mutation({
  args: { agents: v.array(v.object({
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
  })) },
  handler: async (ctx, { agents }) => {
    const existing = await ctx.db.query('agentStatus').collect();
    for (const doc of existing) await ctx.db.delete(doc._id);
    for (const a of agents) await ctx.db.insert('agentStatus', a);
  },
});

export const syncRevenue = mutation({
  args: {
    currentMRR: v.number(),
    monthlyBurn: v.number(),
    net: v.number(),
    currency: v.optional(v.string()),
    note: v.optional(v.string()),
    sources: v.optional(v.array(v.object({ name: v.string(), amount: v.number() }))),
    projects: v.optional(v.any()),
    syncedAt: v.string(),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db.query('revenue').collect();
    for (const doc of existing) await ctx.db.delete(doc._id);
    await ctx.db.insert('revenue', args);
  },
});

export const syncRepos = mutation({
  args: { repos: v.array(v.object({
    name: v.string(),
    path: v.optional(v.string()),
    branch: v.string(),
    lastCommit: v.optional(v.string()),
    lastCommitDate: v.optional(v.string()),
    dirtyFiles: v.optional(v.number()),
    clean: v.optional(v.boolean()),
    changes: v.optional(v.array(v.string())),
    languages: v.optional(v.any()),
  })) },
  handler: async (ctx, { repos }) => {
    const existing = await ctx.db.query('repos').collect();
    for (const doc of existing) await ctx.db.delete(doc._id);
    for (const r of repos) await ctx.db.insert('repos', r);
  },
});

export const syncSystemState = mutation({
  args: { key: v.string(), value: v.string(), syncedAt: v.string() },
  handler: async (ctx, args) => {
    const existing = await ctx.db.query('systemState').withIndex('by_key', q => q.eq('key', args.key)).first();
    if (existing) {
      await ctx.db.replace(existing._id, args);
    } else {
      await ctx.db.insert('systemState', args);
    }
  },
});

export const syncSuggestedTasks = mutation({
  args: { tasks: v.array(v.object({
    taskId: v.union(v.string(), v.number()),
    title: v.string(),
    category: v.optional(v.string()),
    reasoning: v.optional(v.string()),
    nextAction: v.optional(v.string()),
    priority: v.optional(v.string()),
    effort: v.optional(v.number()),
    status: v.string(),
    createdAt: v.optional(v.string()),
  })) },
  handler: async (ctx, { tasks }) => {
    const existing = await ctx.db.query('suggestedTasks').collect();
    for (const doc of existing) await ctx.db.delete(doc._id);
    for (const t of tasks) await ctx.db.insert('suggestedTasks', t);
  },
});

export const syncContentPipeline = mutation({
  args: { items: v.array(v.object({
    itemId: v.string(),
    title: v.string(),
    platform: v.optional(v.string()),
    status: v.string(),
    preview: v.optional(v.string()),
    createdAt: v.optional(v.string()),
  })) },
  handler: async (ctx, { items }) => {
    const existing = await ctx.db.query('contentPipeline').collect();
    for (const doc of existing) await ctx.db.delete(doc._id);
    for (const i of items) await ctx.db.insert('contentPipeline', i);
  },
});

// ============ QUERIES (used by API routes on Vercel) ============

export const getSystemServices = query({
  handler: async (ctx) => await ctx.db.query('systemServices').collect(),
});

export const getCronJobs = query({
  handler: async (ctx) => await ctx.db.query('cronJobs').collect(),
});

export const getAgentStatus = query({
  handler: async (ctx) => await ctx.db.query('agentStatus').collect(),
});

export const getRevenue = query({
  handler: async (ctx) => await ctx.db.query('revenue').first(),
});

export const getRepos = query({
  handler: async (ctx) => await ctx.db.query('repos').collect(),
});

export const getSystemState = query({
  args: { key: v.string() },
  handler: async (ctx, { key }) => {
    return await ctx.db.query('systemState').withIndex('by_key', q => q.eq('key', key)).first();
  },
});

export const getSuggestedTasks = query({
  handler: async (ctx) => await ctx.db.query('suggestedTasks').collect(),
});

export const getContentPipeline = query({
  handler: async (ctx) => await ctx.db.query('contentPipeline').collect(),
});
