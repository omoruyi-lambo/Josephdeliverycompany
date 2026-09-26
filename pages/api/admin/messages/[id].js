import { requireAdmin } from '../../../../lib/adminAuth';
import { getSupabaseAdminClient } from '../../../../lib/supabase/admin';

const STATUSES = ['NEW', 'READ', 'IN_PROGRESS', 'RESOLVED'];

export default async function handler(req, res) {
  const auth = await requireAdmin(req, res);
  if (!auth.ok) return res.status(auth.status).json({ error: auth.error });
  const admin = getSupabaseAdminClient();
  const { id } = req.query;

  if (req.method === 'GET') {
    const { data, error } = await admin.from('contact_messages').select('*').eq('id', id).single();
    if (error) return res.status(404).json({ error: 'Message not found.' });
    return res.status(200).json({ message: data });
  }

  if (req.method !== 'PATCH') return res.status(405).json({ error: 'Method not allowed.' });
  const input = req.body || {};
  const updates = {};
  if (input.status !== undefined) {
    if (!STATUSES.includes(input.status)) return res.status(400).json({ error: 'Invalid message status.' });
    updates.status = input.status;
  }
  if (input.adminReply !== undefined) {
    if (typeof input.adminReply !== 'string' || input.adminReply.length > 10000) return res.status(400).json({ error: 'Admin reply is too long.' });
    updates.admin_reply = input.adminReply.trim() || null;
  }
  if (!Object.keys(updates).length) return res.status(400).json({ error: 'No changes supplied.' });
  const { data, error } = await admin.from('contact_messages').update(updates).eq('id', id).select('*').single();
  if (error) return res.status(500).json({ error: error.message });
  return res.status(200).json({ message: data });
}
