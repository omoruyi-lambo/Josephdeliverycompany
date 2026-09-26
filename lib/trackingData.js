/**
 * JOSEPHDELIVERYCOMPANY — Tracking Data Access Layer
 *
 * Supabase is the SINGLE SOURCE OF TRUTH.
 * No demo fallback — if Supabase is not configured or the record is not
 * found, this layer returns null and the UI displays "not found".
 *
 * ─── DATA FLOW ───────────────────────────────────────────────────────────────
 *
 *   getShipmentByTrackingNumber(trackingNumber)
 *         │
 *         ▼
 *   1. Query Supabase: shipments table (by tracking_number)
 *   2. Query Supabase: tracking_events table (by shipment_id, ordered)
 *   3. Transform DB rows → Shipment object (same shape the UI expects)
 *         │
 *         ▼
 *   pages/track.js  →  ShipmentMap, ShipmentSummary, TrackingTimeline, ShipmentDetails
 *
 * ─── DATABASE → UI FIELD MAPPING ─────────────────────────────────────────────
 *
 *   DB column              UI field
 *   ─────────────────────  ───────────────────────────────────────────────
 *   tracking_number     →  trackingNumber
 *   customer_name       →  customer.name
 *   customer_email      →  customer.email
 *   customer_phone      →  customer.phone
 *   status              →  status
 *   status_code         →  statusCode
 *   current_location    →  currentLocation
 *   current_country     →  currentCountry
 *   current_city        →  currentCity
 *   current_address     →  currentAddress
 *   estimated_delivery  →  estimatedDelivery
 *   shipment_type       →  shipmentType
 *   service             →  service
 *   package_type        →  packageType
 *   shipment_date       →  shipmentDate
 *   origin              →  origin (display: "City, Country")
 *   origin_country      →  originCountry
 *   origin_city         →  originCity
 *   origin_address      →  originAddress
 *   origin_lat/lng      →  map.originCoords.{ lat, lng }
 *   destination         →  destination (display: "City, Country")
 *   destination_country →  destinationCountry
 *   destination_city    →  destinationCity
 *   destination_address →  destinationAddress
 *   destination_lat/lng →  map.destinationCoords.{ lat, lng }
 *   current_lat/lng     →  map.currentCoords.{ lat, lng }
 *   current_position    →  map.currentPosition
 *   tracking_events[]   →  timeline[]
 *
 * ─── TRACKING EVENT → TIMELINE STEP MAPPING ──────────────────────────────────
 *
 *   DB column        UI field
 *   ───────────────  ──────────────────
 *   id             →  id  (React key)
 *   status         →  label
 *   description    →  detail
 *   location       →  location
 *   event_date     →  date  (formatted string, or null if upcoming)
 *   derived        →  status  ('completed' | 'current' | 'upcoming')
 *
 *   Step status derivation:
 *     - 'completed' : event_date is not null AND not the last dated event
 *     - 'current'   : the LAST event that has a non-null event_date
 *     - 'upcoming'  : event_date is null
 */

import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL  = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_ANON = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

let _supabase = null;

function getSupabase() {
  if (_supabase) return _supabase;
  if (!SUPABASE_URL || !SUPABASE_ANON) return null;
  _supabase = createClient(SUPABASE_URL, SUPABASE_ANON, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
  return _supabase;
}

function formatEventDate(isoString) {
  if (!isoString) return null;
  try {
    const d = new Date(isoString);
    const month = d.toLocaleString('en-US', { month: 'short', timeZone: 'UTC' });
    const day   = d.toLocaleString('en-US', { day:   '2-digit', timeZone: 'UTC' });
    const year  = d.toLocaleString('en-US', { year:  'numeric', timeZone: 'UTC' });
    const time  = d.toLocaleString('en-US', {
      hour:   '2-digit', minute: '2-digit',
      hour12: false,
      timeZone: 'UTC',
    });
    return `${month} ${day}, ${year} — ${time}`;
  } catch {
    return isoString;
  }
}

function deriveTimelineStatus(events) {
  let lastCompletedIndex = -1;
  for (let i = 0; i < events.length; i++) {
    if (events[i].event_date !== null && events[i].event_date !== undefined) {
      lastCompletedIndex = i;
    }
  }

  return events.map((event, index) => {
    if (event.event_date === null || event.event_date === undefined) {
      return 'upcoming';
    }
    if (index === lastCompletedIndex) {
      return 'current';
    }
    return 'completed';
  });
}

function transformShipment(row, events) {
  const statuses = deriveTimelineStatus(events);

  const timeline = events.map((event, index) => ({
    id:       event.id,
    label:    event.status,
    detail:   event.description,
    location: event.location || null,
    status:   statuses[index],
    date:     formatEventDate(event.event_date),
  }));

  const originCountry      = row.origin_country      || '';
  const originCity         = row.origin_city         || '';
  const destinationCountry = row.destination_country || '';
  const destinationCity    = row.destination_city    || '';

  return {
    id:                 row.id,
    trackingNumber:     row.tracking_number,
    status:             row.status,
    statusCode:         row.status_code,
    currentLocation:    row.current_location,
    estimatedDelivery:  row.estimated_delivery,
    shipmentType:       row.shipment_type,
    service:            row.service,
    origin:             row.origin || (originCity && originCountry ? `${originCity}, ${originCountry}` : ''),
    destination:        row.destination || (destinationCity && destinationCountry ? `${destinationCity}, ${destinationCountry}` : ''),
    shipmentDate:       row.shipment_date,
    packageType:        row.package_type,
    updatedAt:          row.updated_at,
    createdAt:          row.created_at,

    customer: {
      name:  row.customer_name  || null,
      email: row.customer_email || null,
      phone: row.customer_phone || null,
    },

    originCountry,
    originCity,
    originAddress: row.origin_address || '',

    destinationCountry,
    destinationCity,
    destinationAddress: row.destination_address || '',

    currentCountry: row.current_country || '',
    currentCity:    row.current_city    || '',
    currentAddress: row.current_address || '',

    map: {
      originCity,
      destinationCity,
      currentCity: row.current_city || '',
      originCoords: {
        lat: row.origin_lat      != null ? parseFloat(row.origin_lat)      : null,
        lng: row.origin_lng      != null ? parseFloat(row.origin_lng)      : null,
      },
      destinationCoords: {
        lat: row.destination_lat != null ? parseFloat(row.destination_lat) : null,
        lng: row.destination_lng != null ? parseFloat(row.destination_lng) : null,
      },
      currentCoords: {
        lat: row.current_lat     != null ? parseFloat(row.current_lat)     : null,
        lng: row.current_lng     != null ? parseFloat(row.current_lng)     : null,
      },
      currentPosition: row.current_position != null ? parseFloat(row.current_position) : 0.0,
    },

    timeline,
  };
}

export async function getShipmentByTrackingNumber(trackingNumber) {
  if (!trackingNumber) return null;

  const normalised = trackingNumber.trim().toUpperCase();
  const supabase   = getSupabase();

  if (!supabase) {
    console.error('[trackingData] Supabase is not configured. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY.');
    return null;
  }

  try {
    const { data: shipmentRow, error: shipmentError } = await supabase
      .from('shipments')
      .select('id, tracking_number, status, status_code, current_location, current_city, estimated_delivery, shipment_type, service, origin, destination, shipment_date, package_type, origin_city, destination_city, origin_lat, origin_lng, destination_lat, destination_lng, current_position, updated_at, created_at')
      .eq('tracking_number', normalised)
      .maybeSingle();

    if (shipmentError) {
      console.error('[trackingData] Supabase shipment query error:', shipmentError.message);
      return null;
    }

    if (!shipmentRow) {
      return null;
    }

    const { data: eventRows, error: eventsError } = await supabase
      .from('tracking_events')
      .select('id, status, description, location, event_date')
      .eq('shipment_id', shipmentRow.id)
      .order('event_date', { ascending: true, nullsFirst: false });

    if (eventsError) {
      console.error('[trackingData] Supabase events query error:', eventsError.message);
    }

    return transformShipment(shipmentRow, eventRows ?? []);
  } catch (err) {
    console.error('[trackingData] Supabase unexpected error:', err?.message ?? err);
    return null;
  }
}

export async function getShipmentById(id) {
  if (!id) return null;

  const supabase = getSupabase();
  if (!supabase) {
    console.error('[trackingData] Supabase is not configured.');
    return null;
  }

  try {
    const { data: shipmentRow, error: shipmentError } = await supabase
      .from('shipments')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (shipmentError) {
      console.error('[trackingData] Supabase shipment by-id query error:', shipmentError.message);
      return null;
    }
    if (!shipmentRow) return null;

    const { data: eventRows, error: eventsError } = await supabase
      .from('tracking_events')
      .select('id, status, description, location, event_date')
      .eq('shipment_id', shipmentRow.id)
      .order('event_date', { ascending: true, nullsFirst: false });

    if (eventsError) {
      console.error('[trackingData] Supabase events query error:', eventsError.message);
    }

    return transformShipment(shipmentRow, eventRows ?? []);
  } catch (err) {
    console.error('[trackingData] Supabase by-id unexpected error:', err?.message ?? err);
    return null;
  }
}
