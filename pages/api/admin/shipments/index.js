import { requireAdmin } from '../../../../lib/adminAuth';
import { getSupabaseAdminClient } from '../../../../lib/supabase/admin';

export default async function handler(req, res) {
  const auth = await requireAdmin(req, res);
  if (!auth.ok) return res.status(auth.status).json({ error: auth.error });
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed.' });

  const { data, error } = await getSupabaseAdminClient()
    .from('shipments')
    .select('*')
    .order('updated_at', { ascending: false });
  if (error) {
    console.error('[admin shipments] list failed:', error.message);
    return res.status(500).json({ error: 'Unable to load shipments.' });
  }
  return res.status(200).json({ shipments: data || [] });
}
