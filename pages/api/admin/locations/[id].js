import { requireAdminAuth } from '../../../../lib/adminAuth';
import { supabaseAdmin } from '../../../../lib/supabase/admin';

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

function parseCoordinate(raw) {
  if (raw === null || raw === undefined || raw === '') return undefined;
  const n = typeof raw === 'number' ? raw : parseFloat(String(raw));
  if (!Number.isFinite(n)) return undefined;
  return n;
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

  const candidateCountry = nonEmptyString(body.country) ?? existing.country;
  patch.country = candidateCountry;

  if (body.countryCode !== undefined) {
    patch.country_code = nonEmptyString(body.countryCode) || COUNTRY_CODE_MAP[candidateCountry] || candidateCountry.slice(0, 3).toUpperCase();
  } else {
    patch.country_code = existing.country_code || COUNTRY_CODE_MAP[candidateCountry] || candidateCountry.slice(0, 3).toUpperCase();
  }

  if (body.region !== undefined) {
    patch.region = nonEmptyString(body.region) || REGION_MAP[candidateCountry] || existing.region || 'International';
  } else {
    patch.region = existing.region || REGION_MAP[candidateCountry] || 'International';
  }

  if (body.city !== undefined) {
    patch.city = body.city ? String(body.city).trim() : '';
  } else {
    patch.city = existing.city;
  }

  if (body.officeName !== undefined) {
    patch.office_name = body.officeName ? String(body.officeName).trim() : '';
  } else {
    patch.office_name = existing.office_name;
  }

  if (body.officeType !== undefined) {
    patch.office_type = body.officeType ? String(body.officeType).trim() : existing.office_type || 'Regional Office';
  } else {
    patch.office_type = existing.office_type || 'Regional Office';
  }

  if (body.address !== undefined) {
    patch.address = body.address ? String(body.address).trim() : '';
  } else {
    patch.address = existing.address;
  }

  if (body.phone !== undefined) {
    patch.phone = body.phone ? String(body.phone).trim() : '';
  } else {
    patch.phone = existing.phone;
  }

  if (body.email !== undefined) {
    patch.email = body.email ? String(body.email).trim() : '';
  } else {
    patch.email = existing.email;
  }

  if (body.openingHours !== undefined) {
    patch.opening_hours = body.openingHours ? String(body.openingHours).trim() : '';
  } else {
    patch.opening_hours = existing.opening_hours;
  }

  if (body.description !== undefined) {
    patch.description = body.description ? String(body.description).trim() : '';
  } else {
    patch.description = existing.description;
  }

  if (body.imageUrl !== undefined) {
    const imageUrl = String(body.imageUrl).trim();
    patch.image_url = imageUrl;
    if (!imageUrl) errors.push('Image URL is required.');
  } else {
    patch.image_url = existing.image_url;
  }

  if (body.imageAlt !== undefined) {
    patch.image_alt = body.imageAlt ? String(body.imageAlt).trim() : `${candidateCountry} logistics facility`;
  } else {
    patch.image_alt = existing.image_alt || `${candidateCountry} logistics facility`;
  }

  if (body.latitude !== undefined) {
    const lat = parseCoordinate(body.latitude);
    if (lat === undefined && body.latitude !== '' && body.latitude !== null) {
      errors.push('Latitude must be a valid number.');
    } else {
      patch.latitude = lat === undefined ? null : lat;
    }
  } else {
    patch.latitude = existing.latitude;
  }

  if (body.longitude !== undefined) {
    const lng = parseCoordinate(body.longitude);
    if (lng === undefined && body.longitude !== '' && body.longitude !== null) {
      errors.push('Longitude must be a valid number.');
    } else {
      patch.longitude = lng === undefined ? null : lng;
    }
  } else {
    patch.longitude = existing.longitude;
  }

  if (patch.latitude != null && (patch.latitude < -90 || patch.latitude > 90)) {
    errors.push('Latitude must be between -90 and 90.');
  }
  if (patch.longitude != null && (patch.longitude < -180 || patch.longitude > 180)) {
    errors.push('Longitude must be between -180 and 180.');
  }

  if (body.isActive !== undefined) {
    patch.is_active = typeof body.isActive === 'boolean' ? body.isActive : existing.is_active;
  } else {
    patch.is_active = existing.is_active;
  }

  if (!patch.country) errors.push('Country is required.');
  if (!patch.image_url) errors.push('Image URL is required.');

  if (errors.length) return { errors, patch: null };
  return { errors: [], patch };
}

export default async function handler(req, res) {
  const id = Array.isArray(req.query.id) ? req.query.id[0] : req.query.id;

  if (!id) {
    return res.status(400).json({ error: 'Location id is required.' });
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

  if (req.method === 'GET') {
    try {
      const { data, error } = await supabaseAdmin
        .from('locations')
        .select('*')
        .eq('id', id)
        .maybeSingle();

      if (error) {
        console.error('[location API] GET fetch error:', error.message);
        return res.status(500).json({ error: 'Unable to fetch location record.' });
      }
      if (!data) {
        return res.status(404).json({ error: 'Location not found.' });
      }

      return res.status(200).json({ ok: true, location: data });
    } catch (err) {
      console.error('[location API] GET unexpected error:', err?.message ?? err);
      return res.status(500).json({ error: 'Failed to fetch location.' });
    }
  }

  if (req.method === 'PATCH') {
    const { data: existing, error: fetchError } = await supabaseAdmin
      .from('locations')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (fetchError) {
      console.error('[location API] PATCH fetch error:', fetchError.message);
      return res.status(500).json({ error: 'Unable to locate location record.' });
    }
    if (!existing) {
      return res.status(404).json({ error: 'Location not found.' });
    }

    const { errors, patch } = validatePayload(req.body, existing);
    if (errors.length) {
      return res.status(400).json({ error: 'Validation failed.', errors });
    }

    const { data: updated, error: updateError } = await supabaseAdmin
      .from('locations')
      .update(patch)
      .eq('id', id)
      .select('id, updated_at')
      .single();

    if (updateError || !updated) {
      console.error(
        '[location API] PATCH update error:',
        updateError?.message ?? 'no data returned',
      );
      return res.status(500).json({ error: 'Failed to update location in database.' });
    }

    return res.status(200).json({
      ok: true,
      location: {
        id: updated.id,
        updatedAt: updated.updated_at,
      },
    });
  }

  res.setHeader('Allow', 'GET, PATCH');
  return res.status(405).json({ error: 'Method not allowed.' });
}
