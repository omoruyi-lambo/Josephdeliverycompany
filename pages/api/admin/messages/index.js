import { requireAdmin } from '../../../../lib/adminAuth';
import { getSupabaseAdminClient } from '../../../../lib/supabase/admin';

const STATUSES = ['NEW', 'READ', 'IN_PROGRESS', 'RESOLVED'];

export default async function handler(req, res) {
  const auth = await requireAdmin(req, res);
  if (!auth.ok) return res.status(auth.status).json({ error: auth.error });
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed.' });

  const admin = getSupabaseAdminClient();
  const search = String(req.query.search || '').trim();
  const status = String(req.query.status || '').trim();
  let query = admin.from('contact_messages').select('*', { count: 'exact' }).order('created_at', { ascending: false });
  if (status && STATUSES.includes(status)) query = query.eq('status', status);
  if (search) {
    const escaped = search.replace(/[(),]/g, ' ');
    query = query.or(`full_name.ilike.%${escaped}%,email.ilike.%${escaped}%,subject.ilike.%${escaped}%,tracking_number.ilike.%${escaped}%`);
  }
  const { data, count, error } = await query;
  if (error) return res.status(500).json({ error: error.message });
  return res.status(200).json({ messages: data || [], count: count || 0 });
}
