# Mission Control v4 — Real Data Status

**Populated:** 2026-02-16 19:20 CET  
**By:** Subagent (populate-mc4-real-data)

## ✅ Convex Database — Seeded with Real Data

Ran `npx convex run seed:seed` successfully:

| Table | Count | Source |
|-------|-------|--------|
| activities | 8 | Real recent events (cron runs, SC cert rejection, deploys) |
| tasks | 8 | From PROJECTS.md (casino cert, pouch payment, AI benchmark, etc.) |
| contacts | 4 | Jack, Magnus DTA, Adrian, Henrik (names + roles only) |
| contentDrafts | 3 | Pouch ads, OpenClaw newsletter, Finnish casino reviews |
| calendarEvents | 3 | SC cert resubmission, pouch ad launch, content review |
| ecosystemProducts | 7 | OpenClaw Gateway, MC v4, viihdepelit, pouchitalia, pouchesitaly, content network, knowledge base |

## ✅ Workspace State Files Created

All at `/Users/ai-hub/.openclaw/workspace/`:

| File | Status |
|------|--------|
| `state/servers.json` | ✅ 11 services from `lsof` (ports 3001-3022, 8080) |
| `state/crons.json` | ✅ 3 cron jobs from `openclaw cron list` |
| `state/revenue.json` | ✅ Placeholder with real pipeline context |
| `state/observations.md` | ✅ Current system observations |
| `state/suggested-tasks.json` | ✅ 14 tasks from PROJECTS.md + PIPELINE.md |
| `state/branch-check.json` | ✅ Git status of 8 repos in ~/Projects/ |
| `agents/registry.json` | ✅ Main agent + default + active subagent |
| `content/queue.md` | ✅ Content sites, ideas, affiliate links |
| `shared-context/priorities.md` | ✅ Prioritized from PROJECTS.md + PIPELINE.md |

## ⚠️ Not Applicable (Yet)

| Item | Reason |
|------|--------|
| Chat history API | MC v4 has no API routes yet — purely Convex. Transcripts exist at `~/.openclaw/agents/main/sessions/*.jsonl` |
| Knowledge base API | No API routes in MC v4. WORKSPACE_PATH is set correctly in `.env.local` |

## Notes

- Running `seed:seed` again will **duplicate** data (it inserts, doesn't upsert). Clear tables in Convex dashboard first if re-seeding.
- Convex `_generated` files were regenerated via `npx convex dev --once`.
- `.env.local` has correct `WORKSPACE_PATH=/Users/ai-hub/.openclaw/workspace`.
