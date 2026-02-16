/**
 * Convex fallback helper for API routes.
 * When running on Vercel (no filesystem), queries Convex for synced data.
 */
import { ConvexHttpClient } from 'convex/browser';
import { api } from '../../convex/_generated/api';

let _client: ConvexHttpClient | null = null;

function getClient(): ConvexHttpClient | null {
  if (_client) return _client;
  const url = process.env.NEXT_PUBLIC_CONVEX_URL;
  if (!url) return null;
  _client = new ConvexHttpClient(url);
  return _client;
}

export async function convexQuery<T>(queryFn: any, args?: any): Promise<T | null> {
  const client = getClient();
  if (!client) return null;
  try {
    return await client.query(queryFn, args || {});
  } catch (e) {
    console.error('[convex-fallback] Query failed:', e);
    return null;
  }
}

export { api };
