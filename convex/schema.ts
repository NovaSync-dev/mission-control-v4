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
});
