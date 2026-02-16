#!/bin/bash
# State sync wrapper — pushes Mac Mini state to both Convex deployments
cd "$(dirname "$0")/.."

# Sync to dev (graceful-cassowary-350)
NEXT_PUBLIC_CONVEX_URL=https://graceful-cassowary-350.convex.cloud node scripts/sync-state.mjs

# Sync to prod (helpful-starfish-277)
NEXT_PUBLIC_CONVEX_URL=https://helpful-starfish-277.convex.cloud node scripts/sync-state.mjs
