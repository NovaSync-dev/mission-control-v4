import { mutation } from './_generated/server';

export const seed = mutation({
  handler: async (ctx) => {
    const now = Date.now();
    const day = 86400000;
    const hour = 3600000;

    // Activities — real recent events
    const activities = [
      { type: 'system', message: 'Mission Control v4 populated with real workspace data', source: 'subagent', timestamp: now },
      { type: 'agent', message: 'Nightly Builder cron completed — 5 OpenClaw content sites checked', source: 'cron', timestamp: now - 4 * hour },
      { type: 'agent', message: 'Morning Briefing delivered to Telegram', source: 'cron', timestamp: now - 12 * hour },
      { type: 'alert', message: 'SC cert REJECTED for viihdepelit.com — games did not function on review', source: 'google', timestamp: now - 7 * day },
      { type: 'deploy', message: 'OpenClaw content network: 5 sites deployed (openclawdashboard.com cluster)', source: 'github', timestamp: now - 6 * day },
      { type: 'content', message: 'Pouch Italy ad angles drafted — 4 smoking cessation variants ready', source: 'content', timestamp: now - 3 * day },
      { type: 'system', message: 'OpenClaw gateway upgraded on Mac Mini — all services stable', source: 'system', timestamp: now - 5 * day },
      { type: 'agent', message: 'Morning Ideas Scanner found 3 new pipeline opportunities', source: 'cron', timestamp: now - 12 * hour },
    ];
    for (const a of activities) await ctx.db.insert('activities', a);

    // Calendar Events
    const events = [
      { title: 'SC Cert Resubmission Deadline', startTime: now + 2 * day, endTime: now + 2 * day + hour, type: 'deadline', color: '#ef4444', description: 'Resubmit viihdepelit.com Social Casino certification after fixing iframe games' },
      { title: 'Pouch Italy Ad Launch', startTime: now + 5 * day, endTime: now + 5 * day + hour, type: 'launch', color: '#10b981', description: 'Launch Google Ads test campaigns for pouchitalia.com' },
      { title: 'Content Network 30-Day Review', startTime: now + 14 * day, endTime: now + 14 * day + hour, type: 'review', color: '#f59e0b', description: 'Check GA4/GSC for all 5 OpenClaw content sites' },
    ];
    for (const e of events) await ctx.db.insert('calendarEvents', e);

    // Tasks — from real PROJECTS.md
    const tasks = [
      { title: 'Verify viihdepelit.com iframe games function', status: 'todo', priority: 'high', category: 'Revenue', description: 'SC cert rejected because games didn\'t work on review. Fix and test all embeds.', createdAt: now - 7 * day, updatedAt: now },
      { title: 'Resubmit SC cert (CID 500-781-5735)', status: 'blocked', priority: 'high', category: 'Revenue', description: 'Blocked on game verification. Casino PPC revenue depends on this.', createdAt: now - 7 * day, updatedAt: now },
      { title: 'Set up payment gateway for pouchitalia.com', status: 'todo', priority: 'high', category: 'Revenue', description: 'Tower Payments or Tasker Gateways. Stripe/PayPal block nicotine.', createdAt: now - 12 * day, updatedAt: now },
      { title: 'Launch Italy pouch Google Ads (4 angles)', status: 'blocked', priority: 'high', category: 'Revenue', description: 'Blocked on payment gateway setup. Smoking cessation framing.', createdAt: now - 12 * day, updatedAt: now },
      { title: 'Build AI benchmark tracker site', status: 'todo', priority: 'high', category: 'Product', description: 'Pipeline score 75. Quick build with existing SEO infra.', createdAt: now - 3 * day, updatedAt: now },
      { title: 'Monitor content network organic traffic', status: 'in-progress', priority: 'medium', category: 'Content', description: '5 sites live since Feb 10. GA4 + GSC tracking active.', createdAt: now - 6 * day, updatedAt: now },
      { title: 'Mission Control v4 — production ready', status: 'in-progress', priority: 'medium', category: 'Product', description: 'Populate with real data, test all panels, deploy.', createdAt: now - 2 * day, updatedAt: now },
      { title: 'Audit running dev servers on Mac Mini', status: 'todo', priority: 'medium', category: 'Operations', description: '11+ node processes. Some may be unused.', createdAt: now, updatedAt: now },
    ];
    for (const t of tasks) await ctx.db.insert('tasks', t);

    // Contacts — real names only, no private info
    const contacts = [
      { name: 'Jack', role: 'Casino PPC partner', notes: 'Has Google/Gemini meeting recording. Account content reusable.', tags: ['casino', 'ppc'], createdAt: now - 10 * day },
      { name: 'Magnus DTA', role: 'Pouch business partner', notes: 'Working with Conrad on nicotine pouches. Also interested in casino PBN.', tags: ['pouches', 'partner'], createdAt: now - 12 * day },
      { name: 'Adrian', role: 'Collaborator', tags: ['network'], createdAt: now - 10 * day },
      { name: 'Henrik', role: 'Casino insider', notes: 'Finnish market knowledge. Tracks CIDs internally.', tags: ['casino', 'finland'], createdAt: now - 10 * day },
    ];
    for (const c of contacts) await ctx.db.insert('contacts', c);

    // Content Drafts
    const drafts = [
      { title: 'Pouch Italy Google Ads — Smoking Cessation Angle 1', body: 'Target: Italian smokers looking to quit. Focus on health benefits of switching to pouches.', platform: 'google-ads', status: 'draft', createdAt: now - 3 * day, updatedAt: now - 3 * day },
      { title: 'OpenClaw Weekly Newsletter #1', body: 'AI agent orchestration news, tips, and builds from the OpenClaw ecosystem.', platform: 'blog', status: 'draft', createdAt: now - 4 * day, updatedAt: now - 2 * day },
      { title: 'viihdepelit.com — Casino Game Reviews (Finnish)', body: 'Social casino game reviews for Finnish audience. SEO-optimized content.', platform: 'website', status: 'review', createdAt: now - 8 * day, updatedAt: now - 5 * day },
    ];
    for (const d of drafts) await ctx.db.insert('contentDrafts', d);

    // Ecosystem Products — real sites and tools
    const products = [
      { slug: 'openclaw-gateway', name: 'OpenClaw Gateway', description: 'AI agent orchestration platform running on Mac Mini. Gateway on port 8080.', status: 'active', health: 'healthy', url: 'http://localhost:8080', updatedAt: now },
      { slug: 'mission-control-v4', name: 'Mission Control v4', description: 'Real-time monitoring dashboard with Convex backend. Next.js + shadcn/ui.', status: 'development', health: 'healthy', url: 'http://localhost:3004', updatedAt: now },
      { slug: 'viihdepelit', name: 'viihdepelit.com', description: 'Finnish social casino site with iframe game embeds. SC cert pending.', status: 'active', health: 'degraded', url: 'https://viihdepelit.com', metrics: { sc_cert: 'rejected', resubmission: 'pending' }, updatedAt: now },
      { slug: 'pouchitalia', name: 'pouchitalia.com', description: 'Italian nicotine pouch e-commerce. Payment gateway needed.', status: 'development', health: 'warning', url: 'https://pouchitalia.com', updatedAt: now },
      { slug: 'pouchesitaly', name: 'pouchesitaly.com', description: 'Italian pouch affiliate/SEO site.', status: 'active', health: 'healthy', url: 'https://pouchesitaly.com', updatedAt: now },
      { slug: 'openclaw-content-network', name: 'OpenClaw Content Network', description: '5 sites: openclawdashboard.com, openclawdashboards.com, openclawstarter.com, openclawweekly.com, clawbotdesktop.com', status: 'active', health: 'healthy', url: 'https://openclawdashboard.com', metrics: { sites: 5, ga4: 'G-KL1XKPVHH4' }, updatedAt: now },
      { slug: 'knowledge-base', name: 'Knowledge Base', description: 'Internal knowledge search tool.', status: 'active', health: 'healthy', url: 'http://localhost:3015', updatedAt: now },
    ];
    for (const p of products) await ctx.db.insert('ecosystemProducts', p);

    return {
      seeded: true,
      counts: {
        activities: activities.length,
        events: events.length,
        tasks: tasks.length,
        contacts: contacts.length,
        drafts: drafts.length,
        products: products.length,
      },
    };
  },
});
