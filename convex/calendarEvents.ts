import { query, mutation } from './_generated/server';
import { v } from 'convex/values';

export const list = query({
  args: {
    startAfter: v.optional(v.number()),
    startBefore: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    let q = ctx.db.query('calendarEvents').withIndex('by_start');
    const results = await q.collect();
    return results.filter(e => {
      if (args.startAfter && e.startTime < args.startAfter) return false;
      if (args.startBefore && e.startTime > args.startBefore) return false;
      return true;
    });
  },
});

export const create = mutation({
  args: {
    title: v.string(),
    description: v.optional(v.string()),
    startTime: v.number(),
    endTime: v.number(),
    type: v.string(),
    color: v.optional(v.string()),
    allDay: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert('calendarEvents', args);
  },
});

export const remove = mutation({
  args: { id: v.id('calendarEvents') },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id);
  },
});
