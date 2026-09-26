import { requireAdminAuth } from '../../../lib/adminAuth';
import { supabaseAdmin } from '../../../lib/supabase/admin';

const PRIMARY_COUNTRIES = [
  'United States',
  'Brazil',
  'Japan',
  'India',
  'South Korea',
  'France',
];

const REGION_MAP = {
  'United States': 'Americas',
  Brazil: 'Americas',
  Japan: 'Asia-Pacific',
  India: 'Asia-Pacific',
  'South Korea': 'Asia-Pacific',
  France: 'Europe',
};

const COUNTRY_CODE_MAP = {
  'United States': 'USA',
  Brazil: 'BRA',
  Japan: 'JPN',
  India: 'IND',
  'South Korea': 'KOR',
  France: 'FRA',
};

const OFFICE_TYPES = [
  'Regional Office',
  'Headquarters',
  'Distribution Center',
  'Cargo Terminal',
  'Warehouse',
  'Logistics Hub',
  'Freight Center',
];

function parseCoordinate(raw) {
  if (raw === null || raw === undefined || raw === '') return null;
  const n = typeof raw === 'number' ? raw : parseFloat(String(raw));
  if (!Number.isFinite(n)) return null;
  return n;
}

function nonEmptyString(raw) {
  if (raw === null || raw === undefined) return '';
  const s = String(raw).trim();
  return s;
}

function validatePayload(body) {
  const errors = [];
  const clean = {};

  if (!body || typeof body !== 'object') {
    return { errors: ['Request body is required.'], clean: null };
  }

  clean.country = nonEmptyString(body.country);
  if (!clean.country) errors.push('Country is required.');

  clean.image_url = nonEmptyString(body.imageUrl);
  if (!clean.image_url) errors.push('Image URL is required.');

  clean.country_code =
    nonEmptyString(body.countryCode) ||
    COUNTRY_CODE_MAP[clean.country] ||
    clean.country.slice(0, 3).toUpperCase();

  clean.region =
    nonEmptyString(body.region) ||
    REGION_MAP[clean.country] ||
    'International';

  clean.city = nonEmptyString(body.city);
  clean.office_name = nonEmptyString(body.officeName);
  clean.office_type =
    nonEmptyString(body.officeType) || 'Regional Office';

  if (clean.office_type && !OFFICE_TYPES.includes(clean.office_type)) {
    if (!OFFICE_TYPES.find((t) => t.toLowerCase() === clean.office_type.toLowerCase())) {
      // Accept custom office types, just validate it's a reasonable string
    }
  }

  clean.address = nonEmptyString(body.address);
  clean.phone = nonEmptyString(body.phone);
  clean.email = nonEmptyString(body.email);
  clean.opening_hours = nonEmptyString(body.openingHours);
  clean.description = nonEmptyString(body.description);

  clean.latitude = parseCoordinate(body.latitude);
  clean.longitude = parseCoordinate(body.longitude);

  if (clean.latitude !== null && (clean.latitude < -90 || clean.latitude > 90)) {
    errors.push('Latitude must be between -90 and 90.');
  }
  if (clean.longitude !== null && (clean.longitude < -180 || clean.longitude > 180)) {
    errors.push('Longitude must be between -180 and 180.');
  }

  clean.is_active =
    typeof body.isActive === 'boolean' ? body.isActive : true;

  if (errors.length) return { errors, clean: null };
  return { errors: [], clean };
}

export default async function handler(req, res) {
  const authResult = await requireAdminAuth(req, res);
  if (!authResult.isAdmin) {
    return res.status(401).json({
      error:
        authResult.redirectTo === '/signin'
          ? 'Authentication required.'
          : 'Admin authorization required.',
    });
  }

  if (req.method === 'GET') {
    try {
      const { data, error } = await supabaseAdmin
        .from('locations')
        .select('*')
        .order('country', { ascending: true })
        .order('city', { ascending: true });

      if (error) {
        console.error('[locations API] GET error:', error.message);
        return res.status(500).json({ error: 'Failed to fetch locations.' });
      }

      return res.status(200).json({ ok: true, locations: data || [] });
    } catch (err) {
      console.error('[locations API] GET unexpected error:', err?.message ?? err);
      return res.status(500).json({ error: 'Failed to fetch locations.' });
    }
  }

  if (req.method === 'POST') {
    const { errors, clean } = validatePayload(req.body);
    if (errors.length) {
      return res.status(400).json({ error: 'Validation failed.', errors });
    }

    try {
      const record = {
        country: clean.country,
        country_code: clean.country_code,
        region: clean.region,
        city: clean.city,
        office_name: clean.office_name,
        office_type: clean.office_type,
        address: clean.address,
        phone: clean.phone,
        email: clean.email,
        opening_hours: clean.opening_hours,
        latitude: clean.latitude,
        longitude: clean.longitude,
        image_url: clean.image_url,
        image_alt: nonEmptyString(req.body.imageAlt) || `${clean.country} logistics facility`,
        description: clean.description,
        is_active: clean.is_active,
      };

      const { data, error } = await supabaseAdmin
        .from('locations')
        .insert(record)
        .select('*')
        .single();

      if (error || !data) {
        console.error('[locations API] POST insert error:', error?.message ?? 'no data');
        return res.status(500).json({ error: 'Failed to create location in the database.' });
      }

      return res.status(201).json({ ok: true, location: data });
    } catch (err) {
      console.error('[locations API] POST unexpected error:', err?.message ?? err);
      return res.status(500).json({ error: 'Failed to create location.' });
    }
  }

  res.setHeader('Allow', 'GET, POST');
  return res.status(405).json({ error: 'Method not allowed.' });
}
