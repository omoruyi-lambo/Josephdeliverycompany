import { requireAdmin } from '../../../../lib/adminAuth';
import { getSupabaseAdminClient } from '../../../../lib/supabase/admin';

const STATUSES = ['NEW', 'READ', 'IN_PROGRESS', 'QUOTED', 'RESOLVED'];

export default async function handler(req, res) {
  const auth = await requireAdmin(req, res);
  if (!auth.ok) return res.status(auth.status).json({ error: auth.error });
  const admin = getSupabaseAdminClient();
  const { id } = req.query;
  if (req.method === 'GET') {
    const { data, error } = await admin.from('quote_requests').select('*').eq('id', id).single();
    if (error) return res.status(404).json({ error: 'Quote request not found.' });
    return res.status(200).json({ quote: data });
  }
  if (req.method !== 'PATCH') return res.status(405).json({ error: 'Method not allowed.' });
  const input = req.body || {};
  if (!STATUSES.includes(input.status)) return res.status(400).json({ error: 'Invalid quote status.' });
  const adminReply = typeof input.adminReply === 'string' ? input.adminReply.trim() : null;
  const { data, error } = await admin.from('quote_requests').update({ status: input.status, admin_reply: adminReply || null }).eq('id', id).select('*').single();
  if (error) return res.status(500).json({ error: error.message });
  return res.status(200).json({ quote: data });
}
