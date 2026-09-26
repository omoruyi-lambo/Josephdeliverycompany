import { requireAdmin } from '../../../lib/adminAuth';
import { getSupabaseAdminClient } from '../../../lib/supabase/admin';

export default async function handler(req, res) {
  const auth = await requireAdmin(req, res);
  if (!auth.ok) return res.status(auth.status).json({ error: auth.error });
  const admin = getSupabaseAdminClient();
  if (req.method === 'GET') {
    const { data, error } = await admin.from('profiles').select('id, first_name, last_name, phone, account_type, created_at').eq('id', auth.user.id).single();
    if (error) return res.status(500).json({ error: 'Could not load administrator settings.' });
    return res.status(200).json({ profile: data, email: auth.user.email });
  }
  if (req.method !== 'PATCH') return res.status(405).json({ error: 'Method not allowed.' });
  const input = req.body || {};
  const firstName = String(input.firstName || '').trim();
  const lastName = String(input.lastName || '').trim();
  const phone = String(input.phone || '').trim();
  if (!firstName || !lastName) return res.status(400).json({ error: 'First name and last name are required.' });
  if (firstName.length > 80 || lastName.length > 80 || phone.length > 40) return res.status(400).json({ error: 'One or more fields are too long.' });
  const { data, error } = await admin.from('profiles').update({ first_name: firstName, last_name: lastName, phone: phone || null }).eq('id', auth.user.id).select('id, first_name, last_name, phone, account_type, created_at').single();
  if (error) return res.status(500).json({ error: 'Could not save administrator settings.' });
  return res.status(200).json({ profile: data, email: auth.user.email });
}
