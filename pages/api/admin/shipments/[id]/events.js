import { requireAdmin } from '../../../../../lib/adminAuth';
import { getSupabaseAdminClient } from '../../../../../lib/supabase/admin';

const STATUSES = ['BOOKED', 'PICKED_UP', 'IN_TRANSIT', 'ARRIVED', 'ON_HOLD', 'OUT_FOR_DELIVERY', 'DELIVERED'];

export default async function handler(req, res) {
  const auth = await requireAdmin(req, res);
  if (!auth.ok) return res.status(auth.status).json({ error: auth.error });
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed.' });
  const { id } = req.query;
  const input = req.body || {};
  if (!STATUSES.includes(input.status)) return res.status(400).json({ error: 'Invalid event status.' });
  if (!input.description?.trim() || !input.location?.trim() || !input.eventDate) return res.status(400).json({ error: 'Status, location, description, and event date are required.' });
  if (Number.isNaN(Date.parse(input.eventDate))) return res.status(400).json({ error: 'Event date must be valid.' });
  const lat = input.latitude === '' || input.latitude == null ? null : Number(input.latitude);
  const lng = input.longitude === '' || input.longitude == null ? null : Number(input.longitude);
  if ((lat !== null && (!Number.isFinite(lat) || lat < -90 || lat > 90)) || (lng !== null && (!Number.isFinite(lng) || lng < -180 || lng > 180))) return res.status(400).json({ error: 'Event coordinates are invalid.' });

  const admin = getSupabaseAdminClient();
  const { data: shipment, error: shipmentError } = await admin.from('shipments').select('id').eq('id', id).single();
  if (shipmentError || !shipment) return res.status(404).json({ error: 'Shipment not found.' });
  const event = { shipment_id: id, status: input.status, location: input.location.trim(), country: input.country?.trim() || null, city: input.city?.trim() || null, address: input.address?.trim() || null, latitude: lat, longitude: lng, description: input.description.trim(), event_date: input.eventDate };
  const { data: created, error: eventError } = await admin.from('tracking_events').insert(event).select('*').single();
  if (eventError) return res.status(500).json({ error: eventError.message });

  const updates = { status_code: input.status, status: input.status.replaceAll('_', ' '), current_location: input.location.trim() };
  if (input.country) updates.current_country = input.country.trim();
  if (input.city) updates.current_city = input.city.trim();
  if (input.address) updates.current_address = input.address.trim();
  if (lat !== null) updates.current_lat = lat;
  if (lng !== null) updates.current_lng = lng;
  const { error: updateError } = await admin.from('shipments').update(updates).eq('id', id);
  if (updateError) {
    await admin.from('tracking_events').delete().eq('id', created.id);
    return res.status(500).json({ error: `Event was not completed because the shipment update failed: ${updateError.message}` });
  }
  return res.status(201).json({ event: created });
}
