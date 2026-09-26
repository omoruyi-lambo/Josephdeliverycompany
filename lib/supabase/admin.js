/**
 * lib/supabase/admin.js
 *
 * Service-role Supabase client.
 *
 * ╔══════════════════════════════════════════════════════════════════╗
 * ║  WARNING — NEVER import this file in browser code or in any     ║
 * ║  file that is sent to the client (components, pages, client-    ║
 * ║  side hooks).                                                    ║
 * ║                                                                  ║
 * ║  The service-role key bypasses ALL Row Level Security policies.  ║
 * ║  It must only be used in:                                        ║
 * ║    - pages/api/* (server-side API routes)                        ║
 * ║    - Server-only utility scripts                                 ║
 * ║    - Future admin API routes that are additionally protected     ║
 * ║      by your own authentication middleware                       ║
 * ╚══════════════════════════════════════════════════════════════════╝
 *
 * Usage in an API route:
 *   import { supabaseAdmin } from '../../lib/supabase/admin';
 *
 *   export default async function handler(req, res) {
 *     // Verify the caller is an authenticated admin FIRST
 *     // then use supabaseAdmin for write operations
 *     const { data, error } = await supabaseAdmin
 *       .from('shipments')
 *       .insert({ ... });
 *   }
 */

import { createClient } from '@supabase/supabase-js';

/**
 * Returns a service-role client that bypasses RLS.
 * Uses a lazy singleton — only created when first called.
 */
let _adminClient = null;

export function getSupabaseAdminClient() {
  if (_adminClient) return _adminClient;

  const url  = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key  = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !key) {
    throw new Error(
      '[supabase/admin] NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY ' +
      'is not set. Check your .env.local file.',
    );
  }

  _adminClient = createClient(url, key, {
    auth: {
      /* Service-role client should never persist sessions or
         auto-refresh tokens — it is a stateless server credential. */
      autoRefreshToken:  false,
      persistSession:    false,
      detectSessionInUrl: false,
    },
  });

  return _adminClient;
}

/**
 * Call getSupabaseAdminClient() from protected API routes only. The client is
 * created lazily so public pages do not fail when the server key is absent.
 */
