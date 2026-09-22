/**
 * lib/supabase/server.js
 *
 * Server-side Supabase client for use inside:
 *   - getServerSideProps
 *   - getStaticProps
 *   - API routes (pages/api/*)
 *
 * createServerClient from @supabase/ssr handles cookie-based session
 * management on the server. For Pages Router, we pass req/res cookies
 * directly so the server can read the authenticated session.
 *
 * Usage in getServerSideProps:
 *   import { createSupabaseServerClient } from '../lib/supabase/server';
 *
 *   export async function getServerSideProps({ req, res }) {
 *     const supabase = createSupabaseServerClient(req, res);
 *     const { data } = await supabase.from('shipments').select('*');
 *     return { props: { data } };
 *   }
 *
 * Usage in API routes:
 *   import { createSupabaseServerClient } from '../../lib/supabase/server';
 *
 *   export default async function handler(req, res) {
 *     const supabase = createSupabaseServerClient(req, res);
 *     // ...
 *   }
 *
 * NOTE: For unauthenticated server-side reads (e.g. public tracking lookup),
 * you can also call createSupabaseServerClient(req, res) without a session —
 * it will fall back to the anon key, and RLS will apply as for a public user.
 */

import { createServerClient, parseCookieHeader, serializeCookieHeader } from '@supabase/ssr';

/**
 * Creates a new server-side Supabase client for each request.
 * Must be called once per request — do not cache or reuse across requests.
 *
 * @param {import('http').IncomingMessage} req  — Next.js request object
 * @param {import('http').ServerResponse}  res  — Next.js response object
 * @returns {import('@supabase/supabase-js').SupabaseClient}
 */
export function createSupabaseServerClient(req, res) {
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll() {
          return parseCookieHeader(req.headers.cookie ?? '');
        },
        setAll(cookiesToSet) {
          const existingSetCookie = res.getHeader('Set-Cookie') ?? [];
          const existing = Array.isArray(existingSetCookie)
            ? existingSetCookie
            : [String(existingSetCookie)];

          res.setHeader('Set-Cookie', [
            ...existing,
            ...cookiesToSet.map(({ name, value, options }) =>
              serializeCookieHeader(name, value, options),
            ),
          ]);
        },
      },
    },
  );
}
