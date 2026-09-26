import { requireAdmin } from '../../../../lib/adminAuth';
import { getSupabaseAdminClient } from '../../../../lib/supabase/admin';

export default async function handler(req, res) {
  const auth = await requireAdmin(req, res);
  if (!auth.ok) return res.status(auth.status).json({ error: auth.error });
  const admin = getSupabaseAdminClient();
  const { id } = req.query;

  if (req.method === 'GET') {
    const [{ data: shipment, error: shipmentError }, { data: events, error: eventError }] = await Promise.all([
      admin.from('shipments').select('*').eq('id', id).single(),
      admin.from('tracking_events').select('*').eq('shipment_id', id).order('event_date', { ascending: true }),
    ]);
    if (shipmentError) return res.status(404).json({ error: shipmentError.message });
    if (eventError) return res.status(500).json({ error: eventError.message });
    return res.status(200).json({ shipment, events: events || [] });
  }

  if (req.method !== 'PATCH') return res.status(405).json({ error: 'Method not allowed.' });
  const allowed = ['customer_name', 'customer_email', 'customer_phone', 'origin', 'origin_country', 'origin_city', 'origin_address', 'origin_lat', 'origin_lng', 'destination', 'destination_country', 'destination_city', 'destination_address', 'destination_lat', 'destination_lng', 'shipment_type', 'service', 'package_type', 'shipment_date', 'estimated_delivery', 'status', 'status_code', 'current_location', 'current_country', 'current_city', 'current_address', 'current_lat', 'current_lng', 'current_position'];
  const updates = Object.fromEntries(Object.entries(req.body || {}).filter(([key, value]) => allowed.includes(key) && value !== undefined));
  const coordinates = ['origin_lat', 'origin_lng', 'destination_lat', 'destination_lng', 'current_lat', 'current_lng'];
  for (const key of coordinates) {
    if (updates[key] !== null && updates[key] !== '' && !Number.isFinite(Number(updates[key]))) return res.status(400).json({ error: `${key} must be a valid number.` });
  }
  for (const [key, min, max, label] of [['origin_lat', -90, 90, 'Origin latitude'], ['destination_lat', -90, 90, 'Destination latitude'], ['current_lat', -90, 90, 'Current latitude'], ['origin_lng', -180, 180, 'Origin longitude'], ['destination_lng', -180, 180, 'Destination longitude'], ['current_lng', -180, 180, 'Current longitude']]) {
    if (updates[key] !== undefined && updates[key] !== '' && (Number(updates[key]) < min || Number(updates[key]) > max)) return res.status(400).json({ error: `${label} must be between ${min} and ${max}.` });
  }
  if (updates.status_code) updates.status = updates.status || updates.status_code.replaceAll('_', ' ');
  const { data, error } = await admin.from('shipments').update(updates).eq('id', id).select('*').single();
  if (error) return res.status(500).json({ error: error.message });
  return res.status(200).json({ shipment: data });
}
