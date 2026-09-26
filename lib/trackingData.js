import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_ANON = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
let client;

function getSupabase() {
  if (client) return client;
  if (!SUPABASE_URL || !SUPABASE_ANON) return null;
  client = createClient(SUPABASE_URL, SUPABASE_ANON, { auth: { autoRefreshToken: false, persistSession: false } });
  return client;
}

function formatEventDate(value) {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString('en-US', { month: 'short', day: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit', hour12: false, timeZone: 'Africa/Lagos' });
}

function transformShipment(row, events) {
  let lastDated = -1;
  events.forEach((event, index) => { if (event.event_date) lastDated = index; });
  return {
    id: row.id,
    trackingNumber: row.tracking_number,
    status: row.status,
    statusCode: row.status_code,
    currentLocation: row.current_location,
    currentCountry: row.current_country || '',
    currentCity: row.current_city || '',
    currentAddress: row.current_address || '',
    estimatedDelivery: row.estimated_delivery,
    shipmentType: row.shipment_type,
    service: row.service,
    packageType: row.package_type,
    shipmentDate: row.shipment_date,
    origin: row.origin,
    originCountry: row.origin_country || '',
    originCity: row.origin_city || '',
    originAddress: row.origin_address || '',
    destination: row.destination,
    destinationCountry: row.destination_country || '',
    destinationCity: row.destination_city || '',
    destinationAddress: row.destination_address || '',
    customer: { name: row.customer_name || null, email: row.customer_email || null, phone: row.customer_phone || null },
    map: {
      originCity: row.origin_city,
      destinationCity: row.destination_city,
      currentCity: row.current_city,
      originCoords: { lat: row.origin_lat == null ? null : Number(row.origin_lat), lng: row.origin_lng == null ? null : Number(row.origin_lng) },
      destinationCoords: { lat: row.destination_lat == null ? null : Number(row.destination_lat), lng: row.destination_lng == null ? null : Number(row.destination_lng) },
      currentCoords: { lat: row.current_lat == null ? null : Number(row.current_lat), lng: row.current_lng == null ? null : Number(row.current_lng) },
      currentPosition: row.current_position == null ? 0 : Number(row.current_position),
    },
    timeline: events.map((event, index) => ({ id: event.id, label: event.status, detail: event.description, location: event.location, status: !event.event_date ? 'upcoming' : index === lastDated ? 'current' : 'completed', date: formatEventDate(event.event_date) })),
  };
}

export async function getShipmentByTrackingNumber(trackingNumber) {
  if (!trackingNumber) return null;
  const supabase = getSupabase();
  if (!supabase) return null;
  const normalised = trackingNumber.trim().toUpperCase();

  try {
    const { data: shipment, error: shipmentError } = await supabase.from('shipments').select('*').eq('tracking_number', normalised).maybeSingle();
    if (shipmentError) { console.error('[trackingData] shipment query error:', shipmentError.message); return null; }
    if (!shipment) return null;
    const { data: events, error: eventsError } = await supabase.from('tracking_events').select('id, status, description, location, event_date').eq('shipment_id', shipment.id).order('event_date', { ascending: true, nullsFirst: false });
    if (eventsError) console.error('[trackingData] event query error:', eventsError.message);
    return transformShipment(shipment, events || []);
  } catch (error) {
    console.error('[trackingData] unexpected error:', error?.message || error);
    return null;
  }
}
