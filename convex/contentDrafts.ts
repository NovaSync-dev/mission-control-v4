import { query, mutation } from './_generated/server';
import { v } from 'convex/values';

export const list = query({
  args: { status: v.optional(v.string()) },
  handler: async (ctx, args) => {
    if (args.status) {
      return await ctx.db.query('contentDrafts').withIndex('by_status', q => q.eq('status', args.status!)).collect();
    }
    return await ctx.db.query('contentDrafts').collect();
  },
});

export const create = mutation({
  args: {
    title: v.string(),
    body: v.optional(v.string()),
    platform: v.string(),
    status: v.string(),
    author: v.optional(v.string()),
    scheduledFor: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    return await ctx.db.insert('contentDrafts', { ...args, createdAt: now, updatedAt: now });
  },
});

export const updateStatus = mutation({
  args: { id: v.id('contentDrafts'), status: v.string() },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.id, { status: args.status, updatedAt: Date.now() });
  },
});
