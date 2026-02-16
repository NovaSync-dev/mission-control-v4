import { mutation } from './_generated/server';

export const seed = mutation({
  handler: async (ctx) => {
    const now = Date.now();

    // Activities
    const activities = [
      { type: 'deploy', message: 'Mission Control v4 deployed successfully', source: 'github', timestamp: now - 3600000 },
      { type: 'agent', message: 'Agent fleet health check completed - all systems nominal', source: 'system', timestamp: now - 7200000 },
      { type: 'content', message: 'New blog post drafted: AI Agent Orchestration Patterns', source: 'content', timestamp: now - 14400000 },
      { type: 'alert', message: 'Revenue milestone reached: $1,000 MRR', source: 'revenue', timestamp: now - 86400000 },
      { type: 'system', message: 'Cron health check: 12/12 jobs passing', source: 'system', timestamp: now - 172800000 },
    ];
    for (const a of activities) await ctx.db.insert('activities', a);

    // Calendar Events
    const events = [
      { title: 'Sprint Planning', startTime: now + 86400000, endTime: now + 86400000 + 3600000, type: 'meeting', color: '#3b82f6' },
      { title: 'Content Review', startTime: now + 172800000, endTime: now + 172800000 + 1800000, type: 'review', color: '#f59e0b' },
      { title: 'Deploy v4.1', startTime: now + 259200000, endTime: now + 259200000 + 3600000, type: 'deploy', color: '#10b981' },
    ];
    for (const e of events) await ctx.db.insert('calendarEvents', e);

    // Tasks
    const tasks = [
      { title: 'Set up Convex real-time sync', status: 'in-progress', priority: 'high', category: 'Product', createdAt: now, updatedAt: now },
      { title: 'Write API documentation', status: 'todo', priority: 'medium', category: 'Content', createdAt: now, updatedAt: now },
      { title: 'Optimize dashboard performance', status: 'todo', priority: 'high', category: 'Product', createdAt: now, updatedAt: now },
      { title: 'Client outreach campaign', status: 'in-progress', priority: 'high', category: 'Revenue', createdAt: now, updatedAt: now },
    ];
    for (const t of tasks) await ctx.db.insert('tasks', t);

    // Contacts
    const contacts = [
      { name: 'Alex Developer', email: 'alex@example.com', company: 'TechCorp', role: 'CTO', createdAt: now },
      { name: 'Sarah Founder', email: 'sarah@startup.io', company: 'StartupIO', role: 'CEO', createdAt: now },
    ];
    for (const c of contacts) await ctx.db.insert('contacts', c);

    // Content Drafts
    const drafts = [
      { title: 'AI Agent Orchestration Patterns', body: 'Exploring modern patterns...', platform: 'blog', status: 'draft', createdAt: now, updatedAt: now },
      { title: 'OpenClaw Launch Thread', body: 'Excited to announce...', platform: 'twitter', status: 'review', createdAt: now, updatedAt: now },
    ];
    for (const d of drafts) await ctx.db.insert('contentDrafts', d);

    // Ecosystem Products
    const products = [
      { slug: 'openclaw', name: 'OpenClaw', description: 'AI agent orchestration platform', status: 'active', health: 'healthy', url: 'https://openclaw.dev', updatedAt: now },
      { slug: 'mission-control', name: 'Mission Control', description: 'Real-time monitoring dashboard', status: 'development', health: 'healthy', updatedAt: now },
    ];
    for (const p of products) await ctx.db.insert('ecosystemProducts', p);

    return { seeded: true, counts: { activities: activities.length, events: events.length, tasks: tasks.length, contacts: contacts.length, drafts: drafts.length, products: products.length } };
  },
});
