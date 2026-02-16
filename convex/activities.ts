import { query, mutation } from './_generated/server';
import { v } from 'convex/values';

export const list = query({
  args: { limit: v.optional(v.number()) },
  handler: async (ctx, args) => {
    return await ctx.db
      .query('activities')
      .withIndex('by_timestamp')
      .order('desc')
      .take(args.limit ?? 50);
  },
});

export const create = mutation({
  args: {
    type: v.string(),
    message: v.string(),
    source: v.optional(v.string()),
    metadata: v.optional(v.any()),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert('activities', {
      ...args,
      timestamp: Date.now(),
    });
  },
});
