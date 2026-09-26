import { requireAdmin } from '../../../../lib/adminAuth';
import { getSupabaseAdminClient } from '../../../../lib/supabase/admin';

export default async function handler(req, res) {
  const auth = await requireAdmin(req, res);
  if (!auth.ok) return res.status(auth.status).json({ error: auth.error });
  const admin = getSupabaseAdminClient();

  if (req.method === 'GET') {
    const { data, error } = await admin
      .from('locations')
      .select('*')
      .order('country', { ascending: true });
    
    if (error) return res.status(500).json({ error: error.message });
    return res.status(200).json({ locations: data || [] });
  }

  if (req.method === 'POST') {
    const { country, country_code, region, city, office_name, office_type, address, phone, email, opening_hours, latitude, longitude, image_url, image_alt, description, is_active } = req.body;

    // Validation
    if (!country || !country_code || !region || !city || !image_url?.trim()) {
      return res.status(400).json({ error: 'Country, country code, region, city, and a photographic image URL are required.' });
    }

    const parsedLatitude = latitude === '' || latitude === null || latitude === undefined ? null : Number(latitude);
    const parsedLongitude = longitude === '' || longitude === null || longitude === undefined ? null : Number(longitude);
    if (Number.isNaN(parsedLatitude) || (parsedLatitude !== null && (parsedLatitude < -90 || parsedLatitude > 90))) {
      return res.status(400).json({ error: 'Latitude must be between -90 and 90.' });
    }

    if (Number.isNaN(parsedLongitude) || (parsedLongitude !== null && (parsedLongitude < -180 || parsedLongitude > 180))) {
      return res.status(400).json({ error: 'Longitude must be between -180 and 180.' });
    }

    const { data, error } = await admin
      .from('locations')
      .insert({
        country: country.trim(),
        country_code: country_code.trim(),
        region: region.trim(),
        city: city.trim(),
        office_name: office_name?.trim() || '',
        office_type: office_type?.trim() || 'Regional Office',
        address: address?.trim() || '',
        phone: phone?.trim() || '',
        email: email?.trim() || '',
        opening_hours: opening_hours?.trim() || '',
        latitude: parsedLatitude,
        longitude: parsedLongitude,
        image_url: image_url?.trim() || '',
        image_alt: image_alt?.trim() || '',
        description: description?.trim() || '',
        is_active: is_active !== undefined ? is_active : true,
      })
      .select()
      .single();

    if (error) return res.status(500).json({ error: error.message });
    return res.status(201).json({ location: data });
  }

  if (req.method === 'PATCH') {
    const { id, ...updates } = req.body;

    if (!id) {
      return res.status(400).json({ error: 'Location ID is required.' });
    }

    const parsedLatitude = updates.latitude === '' || updates.latitude === null || updates.latitude === undefined ? null : Number(updates.latitude);
    const parsedLongitude = updates.longitude === '' || updates.longitude === null || updates.longitude === undefined ? null : Number(updates.longitude);
    if (Number.isNaN(parsedLatitude) || (parsedLatitude !== null && (parsedLatitude < -90 || parsedLatitude > 90))) {
      return res.status(400).json({ error: 'Latitude must be between -90 and 90.' });
    }

    if (Number.isNaN(parsedLongitude) || (parsedLongitude !== null && (parsedLongitude < -180 || parsedLongitude > 180))) {
      return res.status(400).json({ error: 'Longitude must be between -180 and 180.' });
    }

    const locationUpdates = { ...updates };
    if (Object.prototype.hasOwnProperty.call(updates, 'latitude')) locationUpdates.latitude = parsedLatitude;
    if (Object.prototype.hasOwnProperty.call(updates, 'longitude')) locationUpdates.longitude = parsedLongitude;

    const { data, error } = await admin
      .from('locations')
      .update({
        ...locationUpdates,
        ...(updates.country !== undefined && { country: updates.country.trim() }),
        ...(updates.country_code !== undefined && { country_code: updates.country_code.trim() }),
        ...(updates.region !== undefined && { region: updates.region.trim() }),
        ...(updates.city !== undefined && { city: updates.city.trim() }),
        ...(updates.office_name !== undefined && { office_name: updates.office_name.trim() }),
        ...(updates.office_type !== undefined && { office_type: updates.office_type.trim() }),
        ...(updates.address !== undefined && { address: updates.address.trim() }),
        ...(updates.phone !== undefined && { phone: updates.phone.trim() }),
        ...(updates.email !== undefined && { email: updates.email.trim() }),
        ...(updates.opening_hours !== undefined && { opening_hours: updates.opening_hours.trim() }),
        ...(updates.image_url !== undefined && { image_url: updates.image_url.trim() }),
        ...(updates.image_alt !== undefined && { image_alt: updates.image_alt.trim() }),
        ...(updates.description !== undefined && { description: updates.description.trim() }),
      })
      .eq('id', id)
      .select()
      .single();

    if (error) return res.status(500).json({ error: error.message });
    return res.status(200).json({ location: data });
  }

  return res.status(405).json({ error: 'Method not allowed.' });
}
