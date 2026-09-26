import { createSupabaseServerClient } from '../../lib/supabase/server';

const VALID_STATUSES = new Set(['NEW', 'REVIEWING', 'QUOTED', 'CLOSED']);
const VALID_SERVICES = new Set([
  'Express Delivery',
  'Express',
  'Domestic Shipping',
  'Standard',
  'International Shipping',
  'International',
  'Freight & Cargo',
  'Freight',
]);
const VALID_SHIPMENT_TYPES = new Set([
  'Domestic',
  'International',
  'Express',
  'Freight',
]);
const VALID_PACKAGE_TYPES = new Set([
  'Document',
  'Parcel',
  'Box',
  'Pallet',
  'Commercial Package',
  'Container',
  'Other',
]);

function validateEmail(email) {
  return (
    typeof email === 'string' &&
    /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email.trim())
  );
}

function nonEmpty(raw) {
  if (raw === null || raw === undefined) return null;
  const s = String(raw).trim();
  return s.length ? s : null;
}

function parsePositiveInt(raw, def = null) {
  if (raw === null || raw === undefined || raw === '') return def;
  const n = Number.parseInt(String(raw), 10);
  if (!Number.isFinite(n) || n <= 0) return null;
  return n;
}

function parseWeight(raw) {
  if (raw === null || raw === undefined || raw === '') return null;
  const n = Number.parseFloat(String(raw));
  if (!Number.isFinite(n) || n <= 0) return null;
  return n;
}

function validatePayload(body) {
  const errors = [];
  const clean = {};

  if (!body || typeof body !== 'object') {
    return { errors: ['Request body is required.'], clean: null };
  }

  clean.full_name = nonEmpty(body.fullName);
  clean.email = nonEmpty(body.email);
  clean.phone = nonEmpty(body.phone);
  clean.company_name =
    body.companyName != null ? String(body.companyName).trim() : '';

  clean.shipment_type = nonEmpty(body.shipmentType);
  clean.service = nonEmpty(body.service);
  clean.package_type = nonEmpty(body.packageType);

  clean.package_count = parsePositiveInt(body.packageCount, 1);
  if (body.packageCount != null && String(body.packageCount).trim() !== '') {
    if (clean.package_count === null)
      errors.push('packageCount must be a positive integer.');
  }

  const w = parseWeight(body.weight);
  if (body.weight != null && String(body.weight).trim() !== '') {
    if (w === null) errors.push('weight must be a valid positive number.');
  }
  clean.weight = w;

  clean.origin_country = nonEmpty(body.originCountry);
  clean.origin_city = nonEmpty(body.originCity);
  clean.destination_country = nonEmpty(body.destinationCountry);
  clean.destination_city = nonEmpty(body.destinationCity);
  clean.message =
    body.message != null ? String(body.message).trim() : '';

  if (!clean.full_name) errors.push('fullName is required.');
  if (!clean.email) errors.push('email is required.');
  else if (!validateEmail(clean.email)) errors.push('email format is invalid.');
  if (!clean.phone) errors.push('phone is required.');
  if (!clean.shipment_type) errors.push('shipmentType is required.');
  if (!clean.service) errors.push('service is required.');
  if (!clean.package_type) errors.push('packageType is required.');
  if (!clean.origin_country) errors.push('originCountry is required.');
  if (!clean.origin_city) errors.push('originCity is required.');
  if (!clean.destination_country) errors.push('destinationCountry is required.');
  if (!clean.destination_city) errors.push('destinationCity is required.');

  if (errors.length) return { errors, clean: null };

  clean.status = 'NEW';
  return { errors: [], clean };
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed.' });
  }

  const { errors, clean } = validatePayload(req.body);
  if (errors.length) {
    return res
      .status(400)
      .json({ error: 'Validation failed.', errors });
  }

  try {
    const supabase = createSupabaseServerClient(req, res);
    const { data: inserted, error: insErr } = await supabase
      .from('quote_requests')
      .insert({
        full_name: clean.full_name,
        email: clean.email,
        phone: clean.phone,
        company_name: clean.company_name,
        shipment_type: clean.shipment_type,
        service: clean.service,
        package_type: clean.package_type,
        package_count: clean.package_count,
        weight: clean.weight,
        origin_country: clean.origin_country,
        origin_city: clean.origin_city,
        destination_country: clean.destination_country,
        destination_city: clean.destination_city,
        message: clean.message,
        status: clean.status,
      })
      .select('id, status, created_at')
      .single();

    if (insErr) {
      console.error('[quote-requests API] Insert error:', insErr.message);
      return res.status(500).json({
        error:
          'Unable to submit your quote request right now. Please try again.',
      });
    }

    return res.status(201).json({
      ok: true,
      quote: {
        id: inserted.id,
        status: inserted.status,
      },
    });
  } catch (err) {
    console.error(
      '[quote-requests API] Unexpected error:',
      err?.message ?? err,
    );
    return res.status(500).json({
      error:
        'Unable to submit your quote request right now. Please try again.',
    });
  }
}
