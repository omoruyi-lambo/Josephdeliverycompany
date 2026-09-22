/**
 * lib/supabase/client.js
 *
 * Browser-side Supabase client.
 *
 * Use this in:
 *   - React components (useEffect, event handlers)
 *   - Client-side pages that need Supabase access
 *
 * This uses the NEXT_PUBLIC_ prefixed variables which are safe to expose
 * to the browser. The anon key is intentionally public — Row Level Security
 * in Supabase controls what data is actually accessible.
 *
 * Usage:
 *   import { supabase } from '../lib/supabase/client';
 *   const { data } = await supabase.from('shipments').select('*');
 */

import { createBrowserClient } from '@supabase/ssr';

/**
 * Singleton pattern — only one client instance is created per browser session.
 * This avoids creating multiple connections on hot-reloads in development.
 */
let _client = null;

export function getSupabaseBrowserClient() {
  if (_client) return _client;

  _client = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  );

  return _client;
}

/**
 * Named export for convenience — the singleton browser client.
 * Import this directly in components.
 */
export const supabase = getSupabaseBrowserClient();
