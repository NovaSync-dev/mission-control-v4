import { query, mutation } from './_generated/server';
import { v } from 'convex/values';

export const list = query({
  args: { status: v.optional(v.string()) },
  handler: async (ctx, args) => {
    if (args.status) {
      return await ctx.db.query('tasks').withIndex('by_status', q => q.eq('status', args.status!)).collect();
    }
    return await ctx.db.query('tasks').collect();
  },
});

export const create = mutation({
  args: {
    title: v.string(),
    description: v.optional(v.string()),
    status: v.string(),
    priority: v.string(),
    category: v.optional(v.string()),
    assignee: v.optional(v.string()),
    dueDate: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    return await ctx.db.insert('tasks', { ...args, createdAt: now, updatedAt: now });
  },
});

export const updateStatus = mutation({
  args: { id: v.id('tasks'), status: v.string() },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.id, { status: args.status, updatedAt: Date.now() });
  },
});
