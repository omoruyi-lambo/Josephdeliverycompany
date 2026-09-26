import { requireAdmin } from '../../../../lib/adminAuth';
import { getSupabaseAdminClient } from '../../../../lib/supabase/admin';

const STATUSES = ['NEW', 'READ', 'IN_PROGRESS', 'QUOTED', 'RESOLVED'];

export default async function handler(req, res) {
  const auth = await requireAdmin(req, res);
  if (!auth.ok) return res.status(auth.status).json({ error: auth.error });
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed.' });
  const admin = getSupabaseAdminClient();
  const search = String(req.query.search || '').trim();
  const status = String(req.query.status || '').trim();
  let query = admin.from('quote_requests').select('*', { count: 'exact' }).order('created_at', { ascending: false });
  if (status && STATUSES.includes(status)) query = query.eq('status', status);
  if (search) query = query.or(`full_name.ilike.%${search.replace(/[(),]/g, ' ')}%,email.ilike.%${search.replace(/[(),]/g, ' ')}%,origin_city.ilike.%${search.replace(/[(),]/g, ' ')}%,destination_city.ilike.%${search.replace(/[(),]/g, ' ')}%`);
  const { data, count, error } = await query;
  if (error) return res.status(500).json({ error: error.message });
  return res.status(200).json({ quotes: data || [], count: count || 0 });
}
