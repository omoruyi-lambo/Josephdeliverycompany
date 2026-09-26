import { requireAdminAuth } from '../../../lib/adminAuth';
import { supabaseAdmin } from '../../../lib/supabase/admin';

const STATUS_CODE_TO_LABEL = {
  BOOKED:           'Booked',
  PICKED_UP:        'Picked Up',
  COLLECTED:        'Collected',
  IN_TRANSIT:       'In Transit',
  ARRIVED:          'Arrived',
  ON_HOLD:          'On Hold',
  OUT_FOR_DELIVERY: 'Out for Delivery',
  DELIVERED:        'Delivered',
  FAILED_DELIVERY:  'Failed Delivery',
  RETURNED:         'Returned',
};

const VALID_STATUS_CODES = new Set(Object.keys(STATUS_CODE_TO_LABEL));

function isFiniteNumber(value) {
  return typeof value === 'number' && Number.isFinite(value);
}

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
  if (!hasAll) return 0.0;

  const total = Math.hypot(dLat - oLat, dLng - oLng);
  if (total === 0) return 0.0;

  const progress = Math.hypot(cLat - oLat, cLng - oLng) / total;
  return Math.max(0, Math.min(1, progress));
}

function validatePayload(body) {
  const errors = [];
  const clean = {};

  if (!body) {
    return { errors: ['Request body is required.'], clean: null };
  }

  const requiredStrings = [
    ['customerName', 'customer_name'],
    ['originCountry', 'origin_country'],
    ['originCity', 'origin_city'],
    ['destinationCountry', 'destination_country'],
    ['destinationCity', 'destination_city'],
    ['shipmentType', 'shipment_type'],
    ['service', 'service'],
    ['statusCode', 'status_code'],
  ];

  for (const [inKey, outKey] of requiredStrings) {
    const raw = body[inKey];
    if (!raw || typeof raw !== 'string' || !raw.trim()) {
      errors.push(`${inKey} is required.`);
    } else {
      clean[outKey] = raw.trim();
    }
  }

  clean.customer_email =
    body.customerEmail && typeof body.customerEmail === 'string'
      ? body.customerEmail.trim()
      : null;

  clean.customer_phone =
    body.customerPhone && typeof body.customerPhone === 'string'
      ? body.customerPhone.trim()
      : null;

  clean.origin_address = body.originAddress
    ? String(body.originAddress).trim()
    : '';
  clean.destination_address = body.destinationAddress
    ? String(body.destinationAddress).trim()
    : '';
  clean.package_type = body.packageType
    ? String(body.packageType).trim()
    : '';

  clean.current_country =
    body.currentCountry && typeof body.currentCountry === 'string'
      ? body.currentCountry.trim()
      : clean.origin_country || '';

  clean.current_city =
    body.currentCity && typeof body.currentCity === 'string'
      ? body.currentCity.trim()
      : clean.origin_city || '';

  clean.current_address = body.currentAddress
    ? String(body.currentAddress).trim()
    : '';

  if (body.shipmentDate && isValidDateString(body.shipmentDate)) {
    clean.shipment_date = body.shipmentDate;
  } else if (body.shipmentDate) {
    errors.push('shipmentDate must be a valid date.');
  } else {
    clean.shipment_date = new Date().toISOString().slice(0, 10);
  }

  if (body.estimatedDelivery) {
    if (isValidDateString(body.estimatedDelivery)) {
      clean.estimated_delivery = body.estimatedDelivery;
    } else {
      errors.push('estimatedDelivery must be a valid date.');
    }
  }

  clean.origin_lat = parseCoordinate(body.originLat);
  clean.origin_lng = parseCoordinate(body.originLng);
  clean.destination_lat = parseCoordinate(body.destinationLat);
  clean.destination_lng = parseCoordinate(body.destinationLng);
  clean.current_lat = parseCoordinate(body.currentLat);
  clean.current_lng = parseCoordinate(body.currentLng);

  if (
    clean.origin_lat !== null &&
    (clean.origin_lat < -90 || clean.origin_lat > 90)
  )
    errors.push('originLat must be between -90 and 90.');
  if (
    clean.origin_lng !== null &&
    (clean.origin_lng < -180 || clean.origin_lng > 180)
  )
    errors.push('originLng must be between -180 and 180.');
  if (
    clean.destination_lat !== null &&
    (clean.destination_lat < -90 || clean.destination_lat > 90)
  )
    errors.push('destinationLat must be between -90 and 90.');
  if (
    clean.destination_lng !== null &&
    (clean.destination_lng < -180 || clean.destination_lng > 180)
  )
    errors.push('destinationLng must be between -180 and 180.');
  if (
    clean.current_lat !== null &&
    (clean.current_lat < -90 || clean.current_lat > 90)
  )
    errors.push('currentLat must be between -90 and 90.');
  if (
    clean.current_lng !== null &&
    (clean.current_lng < -180 || clean.current_lng > 180)
  )
    errors.push('currentLng must be between -180 and 180.');

  if (clean.status_code && !VALID_STATUS_CODES.has(clean.status_code)) {
    errors.push(
      `statusCode must be one of: ${[...VALID_STATUS_CODES].join(', ')}.`,
    );
  }

  if (errors.length) return { errors, clean: null };

  clean.origin = `${clean.origin_city}, ${clean.origin_country}`;
  clean.destination = `${clean.destination_city}, ${clean.destination_country}`;

  clean.current_location =
    clean.current_city && clean.current_country
      ? `${clean.current_city}, ${clean.current_country}`
      : clean.origin;

  clean.status =
    clean.status_code && STATUS_CODE_TO_LABEL[clean.status_code]
      ? STATUS_CODE_TO_LABEL[clean.status_code]
      : 'Booked';

  const effectiveCurrentLat = clean.current_lat ?? clean.origin_lat;
  const effectiveCurrentLng = clean.current_lng ?? clean.origin_lng;

  clean.current_position = buildCurrentPosition(
    clean.origin_lat,
    clean.origin_lng,
    effectiveCurrentLat,
    effectiveCurrentLng,
    clean.destination_lat,
    clean.destination_lng,
  );

  if (clean.current_lat === null) clean.current_lat = clean.origin_lat;
  if (clean.current_lng === null) clean.current_lng = clean.origin_lng;

  return { errors: [], clean };
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed.' });
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

  const { errors, clean } = validatePayload(req.body);
  if (errors.length) {
    return res
      .status(400)
      .json({ error: 'Validation failed.', errors });
  }

  let trackingNumber = null;

  try {
    const { data: tnData, error: tnError } = await supabaseAdmin.rpc(
      'generate_tracking_number',
    );

    if (tnError) {
      console.error(
        '[shipments API] generate_tracking_number RPC error:',
        tnError.message,
      );
    } else if (tnData) {
      trackingNumber = String(tnData).trim().toUpperCase();
    }
  } catch (rpcErr) {
    console.error(
      '[shipments API] generate_tracking_number RPC unexpected error:',
      rpcErr?.message ?? rpcErr,
    );
  }

  if (!trackingNumber) {
    const year = new Date().getFullYear();
    const prefix = `JDC-${year}-`;
    try {
      const { count, error: countErr } = await supabaseAdmin
        .from('shipments')
        .select('tracking_number', { count: 'exact', head: true })
        .like('tracking_number', `${prefix}%`);

      if (!countErr) {
        const seq = (count || 0) + 1;
        trackingNumber = `${prefix}${String(seq).padStart(5, '0')}`;
      }
    } catch (fallbackErr) {
      console.error(
        '[shipments API] Fallback tracking count error:',
        fallbackErr?.message ?? fallbackErr,
      );
    }
  }

  if (!trackingNumber) {
    const year = new Date().getFullYear();
    const rnd = Math.floor(Math.random() * 90000) + 10000;
    trackingNumber = `JDC-${year}-${rnd}`;
  }

  const shipmentRecord = {
    tracking_number: trackingNumber,
    customer_name: clean.customer_name,
    customer_email: clean.customer_email,
    customer_phone: clean.customer_phone,
    status: clean.status,
    status_code: clean.status_code,
    origin: clean.origin,
    origin_country: clean.origin_country,
    origin_city: clean.origin_city,
    origin_address: clean.origin_address,
    origin_lat: clean.origin_lat,
    origin_lng: clean.origin_lng,
    destination: clean.destination,
    destination_country: clean.destination_country,
    destination_city: clean.destination_city,
    destination_address: clean.destination_address,
    destination_lat: clean.destination_lat,
    destination_lng: clean.destination_lng,
    current_location: clean.current_location,
    current_country: clean.current_country,
    current_city: clean.current_city,
    current_address: clean.current_address,
    current_lat: clean.current_lat,
    current_lng: clean.current_lng,
    current_position: clean.current_position,
    shipment_type: clean.shipment_type,
    service: clean.service,
    package_type: clean.package_type,
    shipment_date: clean.shipment_date,
    estimated_delivery: clean.estimated_delivery || null,
  };

  const { data: inserted, error: insertError } = await supabaseAdmin
    .from('shipments')
    .insert(shipmentRecord)
    .select('id, tracking_number')
    .single();

  if (insertError || !inserted) {
    console.error(
      '[shipments API] Shipment insert error:',
      insertError?.message ?? 'no data returned',
    );
    const isDuplicate =
      insertError?.code === '23505' ||
      /tracking_number/.test(insertError?.message || '');
    return res.status(isDuplicate ? 409 : 500).json({
      error: isDuplicate
        ? 'A duplicate tracking number was generated. Please try again.'
        : 'Failed to create shipment in the database.',
    });
  }

  const eventStatusCode = clean.status_code;
  const eventStatusLabel = clean.status;
  const eventDescription =
    req.body.eventDescription &&
    typeof req.body.eventDescription === 'string' &&
    req.body.eventDescription.trim()
      ? req.body.eventDescription.trim()
      : `Shipment ${eventStatusLabel.toLowerCase()} and added to the system.`;

  const eventLocation =
    req.body.eventLocation &&
    typeof req.body.eventLocation === 'string' &&
    req.body.eventLocation.trim()
      ? req.body.eventLocation.trim()
      : clean.current_location;

  const eventDateRaw = req.body.eventDate;
  let eventDate = new Date().toISOString();
  if (eventDateRaw && isValidDateString(eventDateRaw)) {
    const asDate = new Date(eventDateRaw);
    if (!Number.isNaN(asDate.getTime())) {
      eventDate = asDate.toISOString();
    }
  }

  const eventRecord = {
    shipment_id: inserted.id,
    status: eventStatusLabel,
    description: eventDescription,
    location: eventLocation,
    event_date: eventDate,
  };

  const { error: eventError } = await supabaseAdmin
    .from('tracking_events')
    .insert(eventRecord);

  if (eventError) {
    console.error(
      '[shipments API] Tracking event insert error:',
      eventError.message,
    );
    return res.status(500).json({
      error:
        'Shipment was created, but the initial tracking event could not be saved.',
      shipment: {
        id: inserted.id,
        trackingNumber: inserted.tracking_number,
      },
      eventFailed: true,
    });
  }

  return res.status(201).json({
    ok: true,
    shipment: {
      id: inserted.id,
      trackingNumber: inserted.tracking_number,
    },
  });
}
