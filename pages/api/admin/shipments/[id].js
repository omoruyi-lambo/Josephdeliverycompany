import { requireAdminAuth } from '../../../../lib/adminAuth';
import { supabaseAdmin } from '../../../../lib/supabase/admin';

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
  if (raw === null || raw === undefined || raw === '') return undefined;
  const n = typeof raw === 'number' ? raw : parseFloat(String(raw));
  if (!Number.isFinite(n)) return undefined;
  return n;
}

function isValidDateString(value) {
  if (!value || typeof value !== 'string') return false;
  const d = new Date(value);
  return Number.isFinite(d.getTime());
}

function buildCurrentPosition(oLat, oLng, cLat, cLng, dLat, dLng) {
  const hasAll = [oLat, oLng, cLat, cLng, dLat, dLng].every(
    (v) => v !== null && v !== undefined && typeof v === 'number',
  );
  if (!hasAll) return undefined;
  const total = Math.hypot(dLat - oLat, dLng - oLng);
  if (total === 0) return undefined;
  const progress = Math.hypot(cLat - oLat, cLng - oLng) / total;
  return Math.max(0, Math.min(1, progress));
}

function nonEmptyString(raw) {
  if (raw === null || raw === undefined) return undefined;
  const s = String(raw).trim();
  return s.length ? s : undefined;
}

function validatePayload(body, existing) {
  const errors = [];
  const patch = {};

  if (!body || typeof body !== 'object') {
    return { errors: ['Request body is required.'], patch: null };
  }

  const candidateFields = {};

  candidateFields.customer_name = nonEmptyString(body.customerName) ?? existing.customer_name;
  candidateFields.customer_email =
    body.customerEmail === null || body.customerEmail === ''
      ? null
      : nonEmptyString(body.customerEmail) ?? existing.customer_email;
  candidateFields.customer_phone =
    body.customerPhone === null || body.customerPhone === ''
      ? null
      : nonEmptyString(body.customerPhone) ?? existing.customer_phone;

  candidateFields.origin_country = nonEmptyString(body.originCountry) ?? existing.origin_country;
  candidateFields.origin_city = nonEmptyString(body.originCity) ?? existing.origin_city;
  candidateFields.origin_address =
    body.originAddress != null
      ? String(body.originAddress).trim()
      : existing.origin_address;
  candidateFields.destination_country =
    nonEmptyString(body.destinationCountry) ?? existing.destination_country;
  candidateFields.destination_city =
    nonEmptyString(body.destinationCity) ?? existing.destination_city;
  candidateFields.destination_address =
    body.destinationAddress != null
      ? String(body.destinationAddress).trim()
      : existing.destination_address;

  candidateFields.shipment_type = nonEmptyString(body.shipmentType) ?? existing.shipment_type;
  candidateFields.service = nonEmptyString(body.service) ?? existing.service;
  candidateFields.package_type =
    body.packageType != null
      ? String(body.packageType).trim()
      : existing.package_type;

  if (body.shipmentDate === '' || body.shipmentDate === null) {
    candidateFields.shipment_date = null;
  } else if (body.shipmentDate != null) {
    if (!isValidDateString(body.shipmentDate)) {
      errors.push('shipmentDate must be a valid date.');
    } else {
      candidateFields.shipment_date = String(body.shipmentDate).trim();
    }
  } else {
    candidateFields.shipment_date = existing.shipment_date;
  }

  if (body.estimatedDelivery === '' || body.estimatedDelivery === null) {
    candidateFields.estimated_delivery = null;
  } else if (body.estimatedDelivery != null) {
    if (!isValidDateString(body.estimatedDelivery)) {
      errors.push('estimatedDelivery must be a valid date.');
    } else {
      candidateFields.estimated_delivery = String(body.estimatedDelivery).trim();
    }
  } else {
    candidateFields.estimated_delivery = existing.estimated_delivery;
  }

  candidateFields.current_country =
    nonEmptyString(body.currentCountry) ?? existing.current_country;
  candidateFields.current_city =
    nonEmptyString(body.currentCity) ?? existing.current_city;
  candidateFields.current_address =
    body.currentAddress != null
      ? String(body.currentAddress).trim()
      : existing.current_address;

  const rawOriginLat = parseCoordinate(body.originLat);
  const rawOriginLng = parseCoordinate(body.originLng);
  const rawDestLat = parseCoordinate(body.destinationLat);
  const rawDestLng = parseCoordinate(body.destinationLng);
  const rawCurrLat = parseCoordinate(body.currentLat);
  const rawCurrLng = parseCoordinate(body.currentLng);

  const oc = (co) => (co === undefined ? null : co);
  candidateFields.origin_lat = body.originLat != null ? oc(rawOriginLat) : existing.origin_lat;
  candidateFields.origin_lng = body.originLng != null ? oc(rawOriginLng) : existing.origin_lng;
  candidateFields.destination_lat =
    body.destinationLat != null ? oc(rawDestLat) : existing.destination_lat;
  candidateFields.destination_lng =
    body.destinationLng != null ? oc(rawDestLng) : existing.destination_lng;
  candidateFields.current_lat = body.currentLat != null ? oc(rawCurrLat) : existing.current_lat;
  candidateFields.current_lng = body.currentLng != null ? oc(rawCurrLng) : existing.current_lng;

  if (candidateFields.origin_lat != null && (candidateFields.origin_lat < -90 || candidateFields.origin_lat > 90))
    errors.push('originLat must be between -90 and 90.');
  if (candidateFields.origin_lng != null && (candidateFields.origin_lng < -180 || candidateFields.origin_lng > 180))
    errors.push('originLng must be between -180 and 180.');
  if (candidateFields.destination_lat != null && (candidateFields.destination_lat < -90 || candidateFields.destination_lat > 90))
    errors.push('destinationLat must be between -90 and 90.');
  if (candidateFields.destination_lng != null && (candidateFields.destination_lng < -180 || candidateFields.destination_lng > 180))
    errors.push('destinationLng must be between -180 and 180.');
  if (candidateFields.current_lat != null && (candidateFields.current_lat < -90 || candidateFields.current_lat > 90))
    errors.push('currentLat must be between -90 and 90.');
  if (candidateFields.current_lng != null && (candidateFields.current_lng < -180 || candidateFields.current_lng > 180))
    errors.push('currentLng must be between -180 and 180.');

  if (body.statusCode !== undefined && body.statusCode !== null) {
    const sc = String(body.statusCode).trim();
    if (!VALID_STATUS_CODES.has(sc)) {
      errors.push(
        `statusCode must be one of: ${[...VALID_STATUS_CODES].join(', ')}.`,
      );
    } else {
      candidateFields.status_code = sc;
      candidateFields.status = STATUS_CODE_TO_LABEL[sc];
    }
  }

  if (!candidateFields.customer_name || !String(candidateFields.customer_name).trim())
    errors.push('customerName is required.');
  if (!candidateFields.origin_country) errors.push('originCountry is required.');
  if (!candidateFields.origin_city) errors.push('originCity is required.');
  if (!candidateFields.destination_country) errors.push('destinationCountry is required.');
  if (!candidateFields.destination_city) errors.push('destinationCity is required.');
  if (!candidateFields.shipment_type) errors.push('shipmentType is required.');
  if (!candidateFields.service) errors.push('service is required.');

  if (errors.length) return { errors, patch: null };

  patch.customer_name = candidateFields.customer_name;
  patch.customer_email = candidateFields.customer_email ?? null;
  patch.customer_phone = candidateFields.customer_phone ?? null;

  patch.origin_country = candidateFields.origin_country;
  patch.origin_city = candidateFields.origin_city;
  patch.origin_address = candidateFields.origin_address || '';
  patch.origin_lat = candidateFields.origin_lat ?? null;
  patch.origin_lng = candidateFields.origin_lng ?? null;
  patch.origin = `${patch.origin_city}, ${patch.origin_country}`;

  patch.destination_country = candidateFields.destination_country;
  patch.destination_city = candidateFields.destination_city;
  patch.destination_address = candidateFields.destination_address || '';
  patch.destination_lat = candidateFields.destination_lat ?? null;
  patch.destination_lng = candidateFields.destination_lng ?? null;
  patch.destination = `${patch.destination_city}, ${patch.destination_country}`;

  patch.current_country = candidateFields.current_country || patch.origin_country;
  patch.current_city = candidateFields.current_city || patch.origin_city;
  patch.current_address = candidateFields.current_address || '';
  patch.current_lat = candidateFields.current_lat ?? null;
  patch.current_lng = candidateFields.current_lng ?? null;
  patch.current_location =
    patch.current_city && patch.current_country
      ? `${patch.current_city}, ${patch.current_country}`
      : patch.origin;

  patch.shipment_type = candidateFields.shipment_type;
  patch.service = candidateFields.service;
  patch.package_type = candidateFields.package_type || '';
  patch.shipment_date = candidateFields.shipment_date ?? null;
  patch.estimated_delivery = candidateFields.estimated_delivery ?? null;

  if (candidateFields.status_code) {
    patch.status_code = candidateFields.status_code;
    patch.status = candidateFields.status;
  }

  const pos = buildCurrentPosition(
    patch.origin_lat ?? existing.origin_lat,
    patch.origin_lng ?? existing.origin_lng,
    patch.current_lat ?? (patch.origin_lat ?? existing.origin_lat),
    patch.current_lng ?? (patch.origin_lng ?? existing.origin_lng),
    patch.destination_lat ?? existing.destination_lat,
    patch.destination_lng ?? existing.destination_lng,
  );
  if (pos !== undefined) patch.current_position = pos;

  return { errors: [], patch };
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

  if (req.method === 'PATCH') {
    const { data: existing, error: fetchError } = await supabaseAdmin
      .from('shipments')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (fetchError) {
      console.error('[shipment API] PATCH fetch error:', fetchError.message);
      return res.status(500).json({ error: 'Unable to locate shipment record.' });
    }
    if (!existing) {
      return res.status(404).json({ error: 'Shipment not found.' });
    }

    const { errors, patch } = validatePayload(req.body, existing);
    if (errors.length) {
      return res.status(400).json({ error: 'Validation failed.', errors });
    }

    const { data: updated, error: updateError } = await supabaseAdmin
      .from('shipments')
      .update(patch)
      .eq('id', id)
      .select('id, tracking_number, updated_at')
      .single();

    if (updateError || !updated) {
      console.error(
        '[shipment API] PATCH update error:',
        updateError?.message ?? 'no data returned',
      );
      return res.status(500).json({ error: 'Failed to update shipment in database.' });
    }

    return res.status(200).json({
      ok: true,
      shipment: {
        id: updated.id,
        trackingNumber: updated.tracking_number,
        updatedAt: updated.updated_at,
      },
    });
  }

  res.setHeader('Allow', 'PATCH');
  return res.status(405).json({ error: 'Method not allowed.' });
}
