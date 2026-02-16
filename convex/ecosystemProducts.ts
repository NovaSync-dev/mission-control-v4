import { query, mutation } from './_generated/server';
import { v } from 'convex/values';

export const list = query({
  handler: async (ctx) => {
    return await ctx.db.query('ecosystemProducts').collect();
  },
});

export const getBySlug = query({
  args: { slug: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db.query('ecosystemProducts').withIndex('by_slug', q => q.eq('slug', args.slug)).first();
  },
});

export const upsert = mutation({
  args: {
    slug: v.string(),
    name: v.string(),
    description: v.string(),
    status: v.string(),
    health: v.string(),
    url: v.optional(v.string()),
    metrics: v.optional(v.any()),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db.query('ecosystemProducts').withIndex('by_slug', q => q.eq('slug', args.slug)).first();
    if (existing) {
      await ctx.db.patch(existing._id, { ...args, updatedAt: Date.now() });
      return existing._id;
    }
    return await ctx.db.insert('ecosystemProducts', { ...args, updatedAt: Date.now() });
  },
});
