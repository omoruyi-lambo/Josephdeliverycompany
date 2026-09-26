import { requireAdmin } from '../../../lib/adminAuth';
import { getSupabaseAdminClient } from '../../../lib/supabase/admin';

const STATUS_CODES = ['BOOKED', 'PICKED_UP', 'COLLECTED', 'IN_TRANSIT', 'ARRIVED', 'ON_HOLD', 'OUT_FOR_DELIVERY', 'DELIVERED'];

function required(value) { return typeof value === 'string' && value.trim().length > 0; }
function numberOrNull(value) { if (value === '' || value === null || value === undefined) return null; const n = Number(value); return Number.isFinite(n) ? n : NaN; }

function validateShipment(input) {
  const requiredFields = ['customerName', 'originCountry', 'originCity', 'destinationCountry', 'destinationCity', 'shipmentType', 'service', 'packageType', 'status'];
  const missing = requiredFields.filter((field) => !required(input[field]));
  if (missing.length) return `Required fields missing: ${missing.join(', ')}.`;
  if (!STATUS_CODES.includes(input.status)) return 'Invalid shipment status.';
  const coordinateRanges = { originLat: [-90, 90], destinationLat: [-90, 90], currentLat: [-90, 90], originLng: [-180, 180], destinationLng: [-180, 180], currentLng: [-180, 180] };
  for (const [field, [min, max]] of Object.entries(coordinateRanges)) {
    const value = numberOrNull(input[field]);
    if (Number.isNaN(value)) return `${field} must be a valid number.`;
    if (value !== null && (value < min || value > max)) return `${field} must be between ${min} and ${max}.`;
  }
  const currentPosition = Number(input.currentPosition || 0);
  if (!Number.isFinite(currentPosition) || currentPosition < 0 || currentPosition > 1) return 'Current position must be between 0 and 1.';
  if (input.estimatedDelivery && Number.isNaN(Date.parse(input.estimatedDelivery))) return 'Estimated delivery must be a valid date.';
  if (input.shipmentDate && Number.isNaN(Date.parse(input.shipmentDate))) return 'Shipment date must be a valid date.';
  if (!required(input.eventDescription) || !required(input.eventLocation) || !required(input.eventDate)) return 'Initial tracking event details are required.';
  return null;
}

export default async function handler(req, res) {
  const auth = await requireAdmin(req, res);
  if (!auth.ok) return res.status(auth.status).json({ error: auth.error });
  const admin = getSupabaseAdminClient();

  if (req.method === 'GET') {
    const { data, error } = await admin.from('shipments').select('id, tracking_number, customer_name, origin, destination, current_location, status, status_code, estimated_delivery, updated_at').order('updated_at', { ascending: false });
    if (error) return res.status(500).json({ error: error.message });
    return res.status(200).json({ shipments: data || [] });
  }

  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed.' });
  const input = req.body || {};
  const validationError = validateShipment(input);
  if (validationError) return res.status(400).json({ error: validationError });

  const { data: trackingData, error: trackingError } = await admin.rpc('generate_tracking_number');
  if (trackingError || !trackingData) return res.status(500).json({ error: trackingError?.message || 'Could not generate a tracking number. Run the current database schema first.' });

  const shipment = {
    tracking_number: trackingData,
    customer_name: input.customerName.trim(),
    customer_email: input.customerEmail?.trim() || null,
    customer_phone: input.customerPhone?.trim() || null,
    status: input.status.replaceAll('_', ' '),
    status_code: input.status,
    current_location: [input.currentCity, input.currentCountry].filter(Boolean).join(', '),
    current_city: input.currentCity.trim(),
    current_country: input.currentCountry?.trim() || null,
    current_address: input.currentAddress?.trim() || null,
    origin: [input.originCity, input.originCountry].join(', '),
    origin_city: input.originCity.trim(),
    origin_country: input.originCountry.trim(),
    origin_address: input.originAddress?.trim() || null,
    destination: [input.destinationCity, input.destinationCountry].join(', '),
    destination_city: input.destinationCity.trim(),
    destination_country: input.destinationCountry.trim(),
    destination_address: input.destinationAddress?.trim() || null,
    origin_lat: numberOrNull(input.originLat), origin_lng: numberOrNull(input.originLng),
    destination_lat: numberOrNull(input.destinationLat), destination_lng: numberOrNull(input.destinationLng),
    current_lat: numberOrNull(input.currentLat), current_lng: numberOrNull(input.currentLng),
    current_position: Number(input.currentPosition || 0),
    shipment_type: input.shipmentType.trim(), service: input.service.trim(), package_type: input.packageType.trim(),
    shipment_date: input.shipmentDate || null, estimated_delivery: input.estimatedDelivery || null,
  };

  const { data: created, error: shipmentError } = await admin.from('shipments').insert(shipment).select('id, tracking_number').single();
  if (shipmentError) return res.status(500).json({ error: shipmentError.message });

  const { error: eventError } = await admin.from('tracking_events').insert({ shipment_id: created.id, status: input.status, description: input.eventDescription.trim(), location: input.eventLocation.trim(), event_date: input.eventDate });
  if (eventError) {
    await admin.from('shipments').delete().eq('id', created.id);
    return res.status(500).json({ error: `Shipment was not completed because the initial tracking event failed: ${eventError.message}` });
  }

  return res.status(201).json({ shipment: created });
}
