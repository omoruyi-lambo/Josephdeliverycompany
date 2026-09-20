/**
 * JOSEPHDELIVERYCOMPANY — Demo Tracking Data
 *
 * ─── HOW TO REPLACE WITH A REAL DATABASE ────────────────────────────────────
 * This file exports a single function: getShipmentByTrackingNumber(trackingNumber)
 * When you connect Supabase (or any backend), replace ONLY this function body.
 * All UI components call only this function and never touch DEMO_SHIPMENTS
 * directly, so the rest of the codebase stays unchanged.
 *
 * Future Supabase implementation example:
 *   export async function getShipmentByTrackingNumber(trackingNumber) {
 *     const { data } = await supabase
 *       .from('shipments')
 *       .select('*')
 *       .eq('tracking_number', trackingNumber)
 *       .single();
 *     return data ?? null;
 *   }
 * ────────────────────────────────────────────────────────────────────────────
 *
 * MAP COORDINATES
 * ────────────────────────────────────────────────────────────────────────────
 * Each city has { lat, lng } in real geographic coordinates (WGS 84).
 * The ShipmentMap component converts these to SVG viewport coordinates.
 * currentPosition is a value 0–1 representing how far along the route
 * the shipment currently is (0 = at origin, 1 = at destination).
 * ────────────────────────────────────────────────────────────────────────────
 */

/** @typedef {'completed'|'current'|'upcoming'} StepStatus */
/** @typedef {{ id: number, label: string, detail: string, status: StepStatus, date: string|null }} TimelineStep */

/**
 * @typedef {{
 *   trackingNumber: string,
 *   status: string,
 *   statusCode: string,
 *   currentLocation: string,
 *   estimatedDelivery: string,
 *   shipmentType: string,
 *   service: string,
 *   origin: string,
 *   destination: string,
 *   shipmentDate: string,
 *   packageType: string,
 *   map: {
 *     originCity: string,
 *     destinationCity: string,
 *     currentCity: string,
 *     originCoords: { lat: number, lng: number },
 *     destinationCoords: { lat: number, lng: number },
 *     currentPosition: number,
 *   },
 *   timeline: TimelineStep[],
 * }} Shipment
 */

/** @type {Record<string, Shipment>} */
const DEMO_SHIPMENTS = {

  /* ── JDC-2026-00127  Lagos → Benin City ─────────────────────────── */
  'JDC-2026-00127': {
    trackingNumber:   'JDC-2026-00127',
    status:           'In Transit',
    statusCode:       'IN_TRANSIT',
    currentLocation:  'En route — between Lagos and Benin City',
    estimatedDelivery:'September 24, 2026',
    shipmentType:     'Express Delivery',
    service:          'Express Delivery',
    origin:           'Lagos, Nigeria',
    destination:      'Benin City, Nigeria',
    shipmentDate:     'September 20, 2026',
    packageType:      'Parcel',
    map: {
      originCity:      'Lagos',
      destinationCity: 'Benin City',
      currentCity:     'En route',
      /* Real coordinates (WGS 84) */
      originCoords:      { lat: 6.5244,  lng: 3.3792  },
      destinationCoords: { lat: 6.3350,  lng: 5.6037  },
      /* 0 = origin, 1 = destination — shipment is ~55% of the way */
      currentPosition: 0.55,
    },
    timeline: [
      { id: 1, label: 'Shipment Booked',          detail: 'Shipment information received.',                          status: 'completed', date: 'Sep 20, 2026 — 08:14' },
      { id: 2, label: 'Package Picked Up',         detail: 'Package collected from sender.',                          status: 'completed', date: 'Sep 20, 2026 — 11:32' },
      { id: 3, label: 'Arrived at Lagos Facility', detail: 'Shipment processed at the Lagos facility.',               status: 'completed', date: 'Sep 20, 2026 — 15:47' },
      { id: 4, label: 'In Transit',                detail: 'Shipment is currently moving to its destination.',        status: 'current',   date: 'Sep 21, 2026 — 07:05' },
      { id: 5, label: 'Out for Delivery',          detail: 'Shipment will be delivered soon.',                        status: 'upcoming',  date: null },
      { id: 6, label: 'Delivered',                 detail: 'Shipment successfully delivered.',                        status: 'upcoming',  date: null },
    ],
  },

  /* ── JDC-2026-00128  Abuja → Lagos ──────────────────────────────── */
  'JDC-2026-00128': {
    trackingNumber:   'JDC-2026-00128',
    status:           'In Transit',
    statusCode:       'IN_TRANSIT',
    currentLocation:  'En route — between Abuja and Lagos',
    estimatedDelivery:'September 22, 2026',
    shipmentType:     'Domestic Shipping',
    service:          'Domestic Shipping',
    origin:           'Abuja, Nigeria',
    destination:      'Lagos, Nigeria',
    shipmentDate:     'September 20, 2026',
    packageType:      'Document',
    map: {
      originCity:      'Abuja',
      destinationCity: 'Lagos',
      currentCity:     'En route',
      originCoords:      { lat: 9.0765,  lng: 7.3986  },
      destinationCoords: { lat: 6.5244,  lng: 3.3792  },
      currentPosition: 0.40,
    },
    timeline: [
      { id: 1, label: 'Shipment Booked',           detail: 'Shipment information received.',                          status: 'completed', date: 'Sep 20, 2026 — 07:00' },
      { id: 2, label: 'Package Picked Up',          detail: 'Package collected from sender.',                          status: 'completed', date: 'Sep 20, 2026 — 10:20' },
      { id: 3, label: 'Arrived at Abuja Facility',  detail: 'Shipment processed at the Abuja facility.',               status: 'completed', date: 'Sep 20, 2026 — 13:00' },
      { id: 4, label: 'In Transit',                 detail: 'Shipment is currently moving to its destination.',        status: 'current',   date: 'Sep 21, 2026 — 06:00' },
      { id: 5, label: 'Out for Delivery',           detail: 'Shipment will be delivered soon.',                        status: 'upcoming',  date: null },
      { id: 6, label: 'Delivered',                  detail: 'Shipment successfully delivered.',                        status: 'upcoming',  date: null },
    ],
  },

  /* ── JDC-2026-00129  Port Harcourt → Abuja ──────────────────────── */
  'JDC-2026-00129': {
    trackingNumber:   'JDC-2026-00129',
    status:           'Out for Delivery',
    statusCode:       'OUT_FOR_DELIVERY',
    currentLocation:  'Abuja, Nigeria',
    estimatedDelivery:'September 20, 2026',
    shipmentType:     'Express Delivery',
    service:          'Express Delivery',
    origin:           'Port Harcourt, Nigeria',
    destination:      'Abuja, Nigeria',
    shipmentDate:     'September 18, 2026',
    packageType:      'Parcel',
    map: {
      originCity:      'Port Harcourt',
      destinationCity: 'Abuja',
      currentCity:     'Abuja',
      originCoords:      { lat: 4.8156,  lng: 7.0498  },
      destinationCoords: { lat: 9.0765,  lng: 7.3986  },
      currentPosition: 0.95,
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

  /* ── Legacy alias kept for backward compatibility ────────────────── */
  'JDC-2026-45821': {
    trackingNumber:   'JDC-2026-45821',
    status:           'Out for Delivery',
    statusCode:       'OUT_FOR_DELIVERY',
    currentLocation:  'Benin City, Nigeria',
    estimatedDelivery:'September 20, 2026',
    shipmentType:     'Domestic Shipping',
    service:          'Domestic Shipping',
    origin:           'Abuja, Nigeria',
    destination:      'Benin City, Nigeria',
    shipmentDate:     'September 18, 2026',
    packageType:      'Document',
    map: {
      originCity:      'Abuja',
      destinationCity: 'Benin City',
      currentCity:     'Benin City',
      originCoords:      { lat: 9.0765,  lng: 7.3986  },
      destinationCoords: { lat: 6.3350,  lng: 5.6037  },
      currentPosition: 0.92,
    },
    timeline: [
      { id: 1, label: 'Shipment Booked',           detail: 'Shipment information received.',                          status: 'completed', date: 'Sep 18, 2026 — 09:00' },
      { id: 2, label: 'Package Picked Up',          detail: 'Package collected from sender.',                          status: 'completed', date: 'Sep 18, 2026 — 13:15' },
      { id: 3, label: 'Arrived at Abuja Facility',  detail: 'Shipment processed at the Abuja facility.',               status: 'completed', date: 'Sep 18, 2026 — 17:00' },
      { id: 4, label: 'In Transit',                 detail: 'Shipment is currently moving to its destination.',        status: 'completed', date: 'Sep 19, 2026 — 06:30' },
      { id: 5, label: 'Out for Delivery',           detail: 'Shipment is with the delivery driver.',                   status: 'current',   date: 'Sep 20, 2026 — 08:45' },
      { id: 6, label: 'Delivered',                  detail: 'Shipment successfully delivered.',                        status: 'upcoming',  date: null },
    ],
  },
};

/**
 * Returns a shipment record for the given tracking number, or null if not found.
 * Replace this function body with a real database call when ready.
 *
 * @param {string} trackingNumber  Normalised (uppercase) tracking number
 * @returns {Shipment|null}
 */
export function getShipmentByTrackingNumber(trackingNumber) {
  if (!trackingNumber) return null;
  return DEMO_SHIPMENTS[trackingNumber.trim().toUpperCase()] ?? null;
}
