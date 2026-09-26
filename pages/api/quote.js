import { createSupabaseServerClient } from '../../lib/supabase/server';

function validate(input) {
  const required = ['serviceType', 'originCity', 'originState', 'destCity', 'destState', 'weight', 'pickupDate', 'name', 'email', 'phone'];
  if (required.some(key => !String(input[key] || '').trim())) return 'Please complete all required fields.';
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(input.email).trim())) return 'Please enter a valid email address.';
  if (Number.isNaN(Date.parse(input.pickupDate))) return 'Please select a valid pickup date.';
  if (new Date(input.pickupDate) < new Date(new Date().toDateString())) return 'Pickup date cannot be in the past.';
  if (String(input.description || '').length > 3000 || String(input.notes || '').length > 5000) return 'Additional details are too long.';
  return null;
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed.' });
  const input = req.body || {};
  const errorMessage = validate(input);
  if (errorMessage) return res.status(400).json({ error: errorMessage });
  const supabase = createSupabaseServerClient(req, res);
  const { error } = await supabase.from('quote_requests').insert({
    service_type: String(input.serviceType).trim(), origin_city: String(input.originCity).trim(), origin_state: String(input.originState).trim(), destination_city: String(input.destCity).trim(), destination_state: String(input.destState).trim(), weight: String(input.weight).trim(), description: String(input.description || '').trim() || null, pickup_date: input.pickupDate, full_name: String(input.name).trim(), email: String(input.email).trim().toLowerCase(), phone: String(input.phone).trim(), company: String(input.company || '').trim() || null, notes: String(input.notes || '').trim() || null,
  });
  if (error) return res.status(500).json({ error: 'Unable to submit your quote request right now. Please try again.' });
  return res.status(201).json({ ok: true });
}
