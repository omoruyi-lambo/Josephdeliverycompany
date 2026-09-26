import { requireAdminAuth } from '../../../../../lib/adminAuth';
import { supabaseAdmin } from '../../../../../lib/supabase/admin';

const STATUS_CODE_TO_LABEL = {
  BOOKED: 'Booked',
  PICKED_UP: 'Picked Up',
  COLLECTED: 'Collected',
  IN_TRANSIT: 'In Transit',
  ARRIVED: 'Arrived',
  ON_HOLD: 'On Hold',
  OUT_FOR_DELIVERY: 'Out for Delivery',
  DELIVERED: 'Delivered',
  FAILED_DELIVERY: 'Failed Delivery',
  RETURNED: 'Returned',
};

const VALID_STATUS_CODES = new Set(Object.keys(STATUS_CODE_TO_LABEL));

function parseCoordinate(raw) {
  if (raw === null || raw === undefined || raw === '') return null;
  const n = typeof raw === 'number' ? raw : parseFloat(String(raw));
  if (!Number.isFinite(n)) return null;
  return n;
}

function isValidDateString(value) {
  if (!value || typeof value !== 'string') return false;
  const d = new Date(value);
  return Number.isFinite(d.getTime());
}

function buildCurrentPosition(oLat, oLng, cLat, cLng, dLat, dLng) {
  const hasAll = [oLat, oLng, cLat, cLng, dLat, dLng].every(
    (v) => v !== null && v !== undefined,
  );
  if (!hasAll) return undefined;
  const total = Math.hypot(dLat - oLat, dLng - oLng);
  if (total === 0) return undefined;
  const progress = Math.hypot(cLat - oLat, cLng - oLng) / total;
  return Math.max(0, Math.min(1, progress));
}

function nonEmptyString(raw) {
  if (raw === null || raw === undefined) return null;
  const s = String(raw).trim();
  return s.length ? s : null;
}

function validatePayload(body) {
  const errors = [];
  const clean = {};

  if (!body || typeof body !== 'object') {
    return { errors: ['Request body is required.'], clean: null };
  }

  if (!body.statusCode || typeof body.statusCode !== 'string' || !body.statusCode.trim()) {
    errors.push('statusCode is required.');
  } else {
    const sc = body.statusCode.trim();
    if (!VALID_STATUS_CODES.has(sc)) {
      errors.push(
        `statusCode must be one of: ${[...VALID_STATUS_CODES].join(', ')}.`,
      );
    } else {
      clean.status_code = sc;
      clean.status_label = STATUS_CODE_TO_LABEL[sc];
    }
  }

  if (!body.description || typeof body.description !== 'string' || !body.description.trim()) {
    errors.push('description is required.');
  } else {
    clean.description = body.description.trim();
  }

  const location = nonEmptyString(body.location);
  const city = nonEmptyString(body.city);
  const country = nonEmptyString(body.country);
  const address =
    body.address != null ? String(body.address).trim() : '';

  if (!location && (!city || !country)) {
    errors.push('Either location or both city and country are required.');
  } else {
    clean.location = location || `${city}, ${country}`;
    clean.city = city;
    clean.country = country;
    clean.address = address;
  }

  let eventDate = new Date().toISOString();
  if (body.eventDate) {
    if (!isValidDateString(body.eventDate)) {
      errors.push('eventDate must be a valid date.');
    } else {
      const d = new Date(body.eventDate);
      if (!Number.isNaN(d.getTime())) eventDate = d.toISOString();
    }
  }
  clean.event_date = eventDate;

  clean.lat = parseCoordinate(body.latitude ?? body.lat);
  clean.lng = parseCoordinate(body.longitude ?? body.lng);

  if (clean.lat !== null && (clean.lat < -90 || clean.lat > 90))
    errors.push('latitude must be between -90 and 90.');
  if (clean.lng !== null && (clean.lng < -180 || clean.lng > 180))
    errors.push('longitude must be between -180 and 180.');

  if (errors.length) return { errors, clean: null };
  return { errors: [], clean };
}

export default async function handler(req, res) {
  const id = Array.isArray(req.query.id) ? req.query.id[0] : req.query.id;

  if (!id) {
    return res.status(400).json({ error: 'Shipment id is required.' });
  }

  const authResult = await requireAdminAuth(req, res);
  if (!authResult.isAdmin) {
    return res.status(401).json({
      error:
        authResult.redirectTo === '/signin'
          ? 'Authentication required.'
          : 'Admin authorization required.',
    });
  }

  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed.' });
  }

  const { errors, clean } = validatePayload(req.body);
  if (errors.length) {
    return res.status(400).json({ error: 'Validation failed.', errors });
  }

  const { data: shipment, error: sError } = await supabaseAdmin
    .from('shipments')
    .select('*')
    .eq('id', id)
    .maybeSingle();

  if (sError) {
    console.error('[tracking events API] Shipment fetch error:', sError.message);
    return res.status(500).json({ error: 'Unable to locate shipment record.' });
  }
  if (!shipment) {
    return res.status(404).json({ error: 'Shipment not found.' });
  }

  const eventRecord = {
    shipment_id: shipment.id,
    status: clean.status_label,
    description: clean.description,
    location: clean.location,
    event_date: clean.event_date,
  };

  const { data: insertedEvent, error: evError } = await supabaseAdmin
    .from('tracking_events')
    .insert(eventRecord)
    .select('id')
    .single();

  if (evError || !insertedEvent) {
    console.error(
      '[tracking events API] Event insert error:',
      evError?.message ?? 'no data returned',
    );
    return res.status(500).json({ error: 'Failed to store tracking event.' });
  }

  const shipmentPatch = {};
  shipmentPatch.status_code = clean.status_code;
  shipmentPatch.status = clean.status_label;

  if (clean.city) shipmentPatch.current_city = clean.city;
  if (clean.country) shipmentPatch.current_country = clean.country;
  if (clean.address !== undefined && clean.address !== '')
    shipmentPatch.current_address = clean.address;
  if (clean.city && clean.country) {
    shipmentPatch.current_location = `${clean.city}, ${clean.country}`;
  }
  if (clean.lat !== null) shipmentPatch.current_lat = clean.lat;
  if (clean.lng !== null) shipmentPatch.current_lng = clean.lng;

  const effOriginLat =
    clean.lat !== null && shipmentPatch.current_lat != null
      ? shipmentPatch.current_lat
      : shipment.current_lat ?? shipment.origin_lat;
  const effOriginLng =
    clean.lng !== null && shipmentPatch.current_lng != null
      ? shipmentPatch.current_lng
      : shipment.current_lng ?? shipment.origin_lng;

  const pos = buildCurrentPosition(
    shipment.origin_lat,
    shipment.origin_lng,
    effOriginLat,
    effOriginLng,
    shipment.destination_lat,
    shipment.destination_lng,
  );
  if (pos !== undefined) shipmentPatch.current_position = pos;

  if (Object.keys(shipmentPatch).length > 0) {
    const { error: upErr } = await supabaseAdmin
      .from('shipments')
      .update(shipmentPatch)
      .eq('id', shipment.id);
    if (upErr) {
      console.error(
        '[tracking events API] Post-event shipment update failed:',
        upErr.message,
      );
      return res.status(500).json({
        error:
          'Tracking event was saved, but the shipment status/location could not be updated.',
        event: { id: insertedEvent.id },
        shipmentSyncFailed: true,
      });
    }
  }

  return res.status(201).json({
    ok: true,
    event: { id: insertedEvent.id },
    shipment: {
      id: shipment.id,
      trackingNumber: shipment.tracking_number,
    },
  });
}
