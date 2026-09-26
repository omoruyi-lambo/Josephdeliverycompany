import { requireAdminAuth } from '../../../../lib/adminAuth';
import { supabaseAdmin } from '../../../../lib/supabase/admin';

const VALID_STATUSES = new Set(['NEW', 'REVIEWING', 'QUOTED', 'CLOSED']);

export default async function handler(req, res) {
  const id = Array.isArray(req.query.id) ? req.query.id[0] : req.query.id;
  if (!id) return res.status(400).json({ error: 'Quote request id is required.' });

  const authResult = await requireAdminAuth(req, res);
  if (!authResult.isAdmin) {
    return res.status(401).json({
      error:
        authResult.redirectTo === '/signin'
          ? 'Authentication required.'
          : 'Admin authorization required.',
    });
  }

  const { data: existing, error: fetchErr } = await supabaseAdmin
    .from('quote_requests')
    .select('id')
    .eq('id', id)
    .maybeSingle();
  if (fetchErr) {
    console.error('[quotes detail API] Fetch error:', fetchErr.message);
    return res.status(500).json({ error: 'Unable to load quote request.' });
  }
  if (!existing) {
    return res.status(404).json({ error: 'Quote request not found.' });
  }

  if (req.method === 'PATCH') {
    const body = req.body || {};
    const patch = {};

    if (body.status !== undefined) {
      const s = String(body.status).trim().toUpperCase();
      if (!VALID_STATUSES.has(s)) {
        return res.status(400).json({
          error: `status must be one of: ${[...VALID_STATUSES].join(', ')}.`,
        });
      }
      patch.status = s;
    }

    if (Object.keys(patch).length === 0) {
      return res
        .status(400)
        .json({ error: 'No valid fields provided to update.' });
    }

    const { data: updated, error: upErr } = await supabaseAdmin
      .from('quote_requests')
      .update(patch)
      .eq('id', id)
      .select('id, status, updated_at')
      .single();

    if (upErr || !updated) {
      console.error(
        '[quotes detail API] Update error:',
        upErr?.message ?? 'no data returned',
      );
      return res
        .status(500)
        .json({ error: 'Failed to update quote request status.' });
    }

    return res.status(200).json({
      ok: true,
      quote: {
        id: updated.id,
        status: updated.status,
        updatedAt: updated.updated_at,
      },
    });
  }

  res.setHeader('Allow', 'PATCH');
  return res.status(405).json({ error: 'Method not allowed.' });
}
