/**
 * JOSEPHDELIVERYCOMPANY — Tracking Data Access Layer
 *
 * This file is the ONLY place that knows about the data source.
 * All UI components receive the same Shipment object shape regardless
 * of whether data comes from Supabase or the demo fallback below.
 *
 * ─── DATA FLOW ───────────────────────────────────────────────────────────────
 *
 *   getShipmentByTrackingNumber(trackingNumber)
 *         │
 *         ▼
 *   1. Query Supabase: shipments table (by tracking_number)
 *   2. Query Supabase: tracking_events table (by shipment_id, ordered by event_date)
 *   3. Transform DB rows → Shipment object (same shape the UI has always used)
 *         │
 *         ▼
 *   pages/track.js  →  ShipmentMap, ShipmentSummary, TrackingTimeline, ShipmentDetails
 *
 * ─── FALLBACK ────────────────────────────────────────────────────────────────
 *
 *   If Supabase is not configured (empty env vars) OR if the Supabase query
 *   throws an unexpected error, the function falls back to DEMO_SHIPMENTS.
 *   This keeps development working before credentials are set.
 *
 *   TODO (Phase 3): Remove the demo fallback once real shipments are in Supabase.
 *
 * ─── DATABASE → UI FIELD MAPPING ─────────────────────────────────────────────
 *
 *   DB column              UI field
 *   ─────────────────────  ──────────────────────
 *   tracking_number     →  trackingNumber
 *   status              →  status
 *   status_code         →  statusCode
 *   current_location    →  currentLocation
 *   estimated_delivery  →  estimatedDelivery
 *   shipment_type       →  shipmentType
 *   service             →  service
 *   origin              →  origin
 *   destination         →  destination
 *   shipment_date       →  shipmentDate
 *   package_type        →  packageType
 *   origin_city         →  map.originCity
 *   destination_city    →  map.destinationCity
 *   current_city        →  map.currentCity
 *   origin_lat/lng      →  map.originCoords.{ lat, lng }
 *   destination_lat/lng →  map.destinationCoords.{ lat, lng }
 *   current_position    →  map.currentPosition
 *   tracking_events[]   →  timeline[]
 *
 * ─── TRACKING EVENT → TIMELINE STEP MAPPING ──────────────────────────────────
 *
 *   DB column        UI field
 *   ───────────────  ──────────────────
 *   id (UUID)     →  id  (kept as-is; TrackingTimeline uses it as React key)
 *   status        →  label
 *   description   →  detail
 *   event_date    →  date  (formatted string, or null if upcoming)
 *   derived       →  status  ('completed' | 'current' | 'upcoming')
 *
 *   Step status derivation:
 *     - 'completed' : event_date is not null AND it is not the last event with a date
 *     - 'current'   : the LAST event that has a non-null event_date
 *     - 'upcoming'  : event_date is null
 */

import { createClient } from '@supabase/supabase-js';

/* ── Supabase client (server-side, anon key with RLS) ──────────────────────
 *
 * We use createClient directly here rather than the SSR client because
 * this module is called from getServerSideProps and does not need to read
 * cookies or manage a user session — it only needs to do a public SELECT
 * (permitted by the "Public can read shipments by tracking number" RLS policy).
 *
 * The anon key is safe to use here: RLS prevents any data leakage.
 */
const SUPABASE_URL  = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_ANON = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

/* Lazy singleton — created once per server process, not per request */
let _supabase = null;

function getSupabase() {
  if (_supabase) return _supabase;
  if (!SUPABASE_URL || !SUPABASE_ANON) return null;   /* not configured yet */
  _supabase = createClient(SUPABASE_URL, SUPABASE_ANON, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
  return _supabase;
}

/* ── Supabase date formatter ────────────────────────────────────────────────
 * Converts an ISO timestamp from Supabase to the display format the existing
 * TrackingTimeline component already uses: "Sep 20, 2026 — 08:14"
 */
function formatEventDate(isoString) {
  if (!isoString) return null;
  try {
    const d = new Date(isoString);
    const month = d.toLocaleString('en-US', { month: 'short', timeZone: 'Africa/Lagos' });
    const day   = d.toLocaleString('en-US', { day:   '2-digit', timeZone: 'Africa/Lagos' });
    const year  = d.toLocaleString('en-US', { year:  'numeric', timeZone: 'Africa/Lagos' });
    const time  = d.toLocaleString('en-US', {
      hour:   '2-digit', minute: '2-digit',
      hour12: false,
      timeZone: 'Africa/Lagos',
    });
    return `${month} ${day}, ${year} — ${time}`;
  } catch {
    return isoString;   /* fallback: return raw string rather than crash */
  }
}

/* ── Timeline step status derivation ────────────────────────────────────────
 * Given an array of tracking_events ordered by event_date ASC NULLS LAST,
 * assign 'completed', 'current', or 'upcoming' to each event.
 *
 * Rules:
 *   - Rows with null event_date are 'upcoming'
 *   - Among rows with a non-null event_date, the LAST one is 'current'
 *   - All others with a non-null event_date are 'completed'
 */
function deriveTimelineStatus(events) {
  /* Find the index of the last event that has a real date */
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

/* ── Transform Supabase rows → Shipment UI object ───────────────────────────
 * Adapts the flat DB row + events array into the nested shape all UI
 * components already expect. UI components do not change.
 */
function transformShipment(row, events) {
  const statuses = deriveTimelineStatus(events);

  const timeline = events.map((event, index) => ({
    /* TrackingTimeline uses `id` as a React key */
    id:     event.id,
    label:  event.status,
    detail: event.description,
    status: statuses[index],
    date:   formatEventDate(event.event_date),
  }));

  return {
    /* ── Top-level fields ── */
    trackingNumber:   row.tracking_number,
    status:           row.status,
    statusCode:       row.status_code,
    currentLocation:  row.current_location,
    estimatedDelivery:row.estimated_delivery,
    shipmentType:     row.shipment_type,
    service:          row.service,
    origin:           row.origin,
    destination:      row.destination,
    shipmentDate:     row.shipment_date,
    packageType:      row.package_type,

    /* ── Map data (ShipmentMap.jsx receives this as `mapData` prop) ── */
    map: {
      originCity:      row.origin_city,
      destinationCity: row.destination_city,
      currentCity:     row.current_city,
      originCoords: {
        lat: parseFloat(row.origin_lat),
        lng: parseFloat(row.origin_lng),
      },
      destinationCoords: {
        lat: parseFloat(row.destination_lat),
        lng: parseFloat(row.destination_lng),
      },
      /* Stored as NUMERIC(4,3) in DB — ensure it is a JS number */
      currentPosition: parseFloat(row.current_position),
    },

    /* ── Timeline (TrackingTimeline.jsx receives this as `steps` prop) ── */
    timeline,
  };
}

/* ─────────────────────────────────────────────────────────────────────────────
 * PRIMARY EXPORT
 * getShipmentByTrackingNumber(trackingNumber)
 *
 * This is the ONLY function called by pages/track.js.
 * It is now async. pages/track.js already uses await on this call.
 * ───────────────────────────────────────────────────────────────────────────── */

/**
 * Fetches a shipment and its tracking events from Supabase.
 * Falls back to DEMO_SHIPMENTS if Supabase is not configured or unavailable.
 *
 * @param {string} trackingNumber  Normalised (uppercase) tracking number
 * @returns {Promise<Shipment|null>}
 */
export async function getShipmentByTrackingNumber(trackingNumber) {
  if (!trackingNumber) return null;

  const normalised = trackingNumber.trim().toUpperCase();

  /* ── Try Supabase first ─────────────────────────────────────────────────── */
  const supabase = getSupabase();

  if (supabase) {
    try {
      /* 1. Fetch the shipment row */
      const { data: shipmentRow, error: shipmentError } = await supabase
        .from('shipments')
        .select('*')
        .eq('tracking_number', normalised)
        .maybeSingle();   /* returns null (not an error) when no row found */

      if (shipmentError) {
        /* Log server-side only — never expose DB errors to the customer */
        console.error('[trackingData] Supabase shipment query error:', shipmentError.message);
        /* Fall through to demo fallback rather than crashing the page */
      } else if (shipmentRow) {
        /* 2. Fetch tracking events for this shipment, ordered chronologically */
        const { data: eventRows, error: eventsError } = await supabase
          .from('tracking_events')
          .select('id, status, description, location, event_date')
          .eq('shipment_id', shipmentRow.id)
          .order('event_date', { ascending: true, nullsFirst: false });

        if (eventsError) {
          console.error('[trackingData] Supabase events query error:', eventsError.message);
        }

        /* 3. Transform and return — even if events failed, return shipment with empty timeline */
        return transformShipment(shipmentRow, eventRows ?? []);
      } else {
        /* Valid query, no row found — return null (not-found state) */
        return null;
      }
    } catch (err) {
      /* Network error, timeout, etc. — log and fall through to demo */
      console.error('[trackingData] Supabase unexpected error:', err?.message ?? err);
    }
  }

  /* ── TEMPORARY DEMO FALLBACK ─────────────────────────────────────────────
   * Used when:
   *   a) NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY are not set
   *   b) Supabase threw an unexpected error
   *
   * TODO: Remove this block (and the DEMO_SHIPMENTS constant below) in Phase 3
   *       once real shipments are confirmed working in Supabase.
   * ───────────────────────────────────────────────────────────────────────── */
  console.warn('[trackingData] Using demo fallback for:', normalised);
  return DEMO_SHIPMENTS[normalised] ?? null;
}


/* ═════════════════════════════════════════════════════════════════════════════
 * TEMPORARY DEMO DATA
 * TODO: Remove entirely in Phase 3 once Supabase is the confirmed data source.
 *
 * JDC-2026-00127 matches the real Supabase seed so development without
 * credentials shows the correct scenario.
 * ═════════════════════════════════════════════════════════════════════════════ */

/** @type {Record<string, import('./trackingData').Shipment>} */
const DEMO_SHIPMENTS = {

  /* ── JDC-2026-00127  Miami → São Paulo (ON HOLD — customs) ──────── */
  'JDC-2026-00127': {
    trackingNumber:    'JDC-2026-00127',
    status:            'On Hold',
    statusCode:        'ON_HOLD',
    currentLocation:   'São Paulo, Brazil — Customs Hold',
    estimatedDelivery: 'TBD — Pending customs clearance',
    shipmentType:      'International',
    service:           'International Shipping',
    origin:            'Miami, United States',
    destination:       'São Paulo, Brazil',
    shipmentDate:      'September 18, 2026',
    packageType:       'Commercial Package',
    map: {
      originCity:        'Miami',
      destinationCity:   'São Paulo',
      currentCity:       'São Paulo',
      originCoords:      { lat:  25.7617, lng: -80.1918 },  /* Miami, USA */
      destinationCoords: { lat: -23.5505, lng: -46.6333 },  /* São Paulo, Brazil */
      currentPosition:   1.0,   /* shipment has reached São Paulo, now on hold */
    },
    timeline: [
      { id: 1, label: 'Shipment Booked',         detail: 'Shipment information received and booking confirmed.',                                                                                          status: 'completed', date: 'Sep 18, 2026 — 09:00' },
      { id: 2, label: 'Package Picked Up',        detail: 'Package collected from sender in Miami.',                                                                                                      status: 'completed', date: 'Sep 18, 2026 — 13:30' },
      { id: 3, label: 'Departed Origin Facility', detail: 'Shipment departed Miami International cargo facility.',                                                                                        status: 'completed', date: 'Sep 19, 2026 — 02:15' },
      { id: 4, label: 'Arrived in Brazil',        detail: 'Shipment arrived at São Paulo — Guarulhos International cargo terminal.',                                                                      status: 'completed', date: 'Sep 20, 2026 — 14:45' },
      { id: 5, label: 'Customs Clearance Required', detail: 'Shipment is currently on hold pending customs clearance. Our team is processing the required documentation. No action is needed from the recipient at this time.', status: 'current', date: 'Sep 20, 2026 — 17:30' },
    ],
  },

  /* ── JDC-2026-00128  Abuja → Lagos ──────────────────────────────── */
  'JDC-2026-00128': {
    trackingNumber:    'JDC-2026-00128',
    status:            'In Transit',
    statusCode:        'IN_TRANSIT',
    currentLocation:   'En route — between Abuja and Lagos',
    estimatedDelivery: 'September 22, 2026',
    shipmentType:      'Domestic Shipping',
    service:           'Domestic Shipping',
    origin:            'Abuja, Nigeria',
    destination:       'Lagos, Nigeria',
    shipmentDate:      'September 20, 2026',
    packageType:       'Document',
    map: {
      originCity:        'Abuja',
      destinationCity:   'Lagos',
      currentCity:       'En route',
      originCoords:      { lat: 9.0765, lng: 7.3986 },
      destinationCoords: { lat: 6.5244, lng: 3.3792 },
      currentPosition:   0.40,
    },
    timeline: [
      { id: 1, label: 'Shipment Booked',          detail: 'Shipment information received.',                   status: 'completed', date: 'Sep 20, 2026 — 07:00' },
      { id: 2, label: 'Package Picked Up',         detail: 'Package collected from sender.',                   status: 'completed', date: 'Sep 20, 2026 — 10:20' },
      { id: 3, label: 'Arrived at Abuja Facility', detail: 'Shipment processed at the Abuja facility.',        status: 'completed', date: 'Sep 20, 2026 — 13:00' },
      { id: 4, label: 'In Transit',                detail: 'Shipment is currently moving to its destination.', status: 'current',   date: 'Sep 21, 2026 — 06:00' },
      { id: 5, label: 'Out for Delivery',          detail: 'Shipment will be delivered soon.',                 status: 'upcoming',  date: null },
      { id: 6, label: 'Delivered',                 detail: 'Shipment successfully delivered.',                 status: 'upcoming',  date: null },
    ],
  },

  /* ── JDC-2026-00129  Port Harcourt → Abuja ──────────────────────── */
  'JDC-2026-00129': {
    trackingNumber:    'JDC-2026-00129',
    status:            'Out for Delivery',
    statusCode:        'OUT_FOR_DELIVERY',
    currentLocation:   'Abuja, Nigeria',
    estimatedDelivery: 'September 20, 2026',
    shipmentType:      'Express Delivery',
    service:           'Express Delivery',
    origin:            'Port Harcourt, Nigeria',
    destination:       'Abuja, Nigeria',
    shipmentDate:      'September 18, 2026',
    packageType:       'Parcel',
    map: {
      originCity:        'Port Harcourt',
      destinationCity:   'Abuja',
      currentCity:       'Abuja',
      originCoords:      { lat: 4.8156, lng: 7.0498 },
      destinationCoords: { lat: 9.0765, lng: 7.3986 },
      currentPosition:   0.95,
    },
    timeline: [
      { id: 1, label: 'Shipment Booked',                  detail: 'Shipment information received.',                    status: 'completed', date: 'Sep 18, 2026 — 09:00' },
      { id: 2, label: 'Package Picked Up',                 detail: 'Package collected from sender.',                    status: 'completed', date: 'Sep 18, 2026 — 13:15' },
      { id: 3, label: 'Arrived at Port Harcourt Facility', detail: 'Shipment processed at the Port Harcourt facility.', status: 'completed', date: 'Sep 18, 2026 — 17:00' },
      { id: 4, label: 'In Transit',                        detail: 'Shipment moved to destination city.',               status: 'completed', date: 'Sep 19, 2026 — 06:30' },
      { id: 5, label: 'Out for Delivery',                  detail: 'Shipment is with the delivery driver.',             status: 'current',   date: 'Sep 20, 2026 — 08:45' },
      { id: 6, label: 'Delivered',                         detail: 'Shipment successfully delivered.',                  status: 'upcoming',  date: null },
    ],
  },

  /* ── Legacy alias ────────────────────────────────────────────────── */
  'JDC-2026-45821': {
    trackingNumber:    'JDC-2026-45821',
    status:            'Out for Delivery',
    statusCode:        'OUT_FOR_DELIVERY',
    currentLocation:   'Benin City, Nigeria',
    estimatedDelivery: 'September 20, 2026',
    shipmentType:      'Domestic Shipping',
    service:           'Domestic Shipping',
    origin:            'Abuja, Nigeria',
    destination:       'Benin City, Nigeria',
    shipmentDate:      'September 18, 2026',
    packageType:       'Document',
    map: {
      originCity:        'Abuja',
      destinationCity:   'Benin City',
      currentCity:       'Benin City',
      originCoords:      { lat: 9.0765, lng: 7.3986 },
      destinationCoords: { lat: 6.3350, lng: 5.6037 },
      currentPosition:   0.92,
    },
    timeline: [
      { id: 1, label: 'Shipment Booked',          detail: 'Shipment information received.',                   status: 'completed', date: 'Sep 18, 2026 — 09:00' },
      { id: 2, label: 'Package Picked Up',         detail: 'Package collected from sender.',                   status: 'completed', date: 'Sep 18, 2026 — 13:15' },
      { id: 3, label: 'Arrived at Abuja Facility', detail: 'Shipment processed at the Abuja facility.',        status: 'completed', date: 'Sep 18, 2026 — 17:00' },
      { id: 4, label: 'In Transit',                detail: 'Shipment is currently moving to its destination.', status: 'completed', date: 'Sep 19, 2026 — 06:30' },
      { id: 5, label: 'Out for Delivery',          detail: 'Shipment is with the delivery driver.',            status: 'current',   date: 'Sep 20, 2026 — 08:45' },
      { id: 6, label: 'Delivered',                 detail: 'Shipment successfully delivered.',                 status: 'upcoming',  date: null },
    ],
  },
};
