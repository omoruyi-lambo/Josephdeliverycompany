import { createSupabaseServerClient } from '../../lib/supabase/server';

function isEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function validate(input) {
  const fullName = String(input.fullName || '').trim();
  const email = String(input.email || '').trim();
  const subject = String(input.subject || '').trim();
  const message = String(input.message || '').trim();
  const trackingNumber = String(input.trackingNumber || '').trim();
  if (!fullName || !email || !subject || !message) return 'Please complete all required fields.';
  if (!isEmail(email)) return 'Please enter a valid email address.';
  if (message.length < 10) return 'Message must be at least 10 characters.';
  if (fullName.length > 120 || email.length > 254 || subject.length > 160 || message.length > 5000) return 'One or more fields are too long.';
  if (trackingNumber && !/^[A-Z0-9][A-Z0-9-]{4,31}$/i.test(trackingNumber)) return 'Please enter a valid tracking number.';
  return null;
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed.' });
  const input = req.body || {};
  const validationError = validate(input);
  if (validationError) return res.status(400).json({ error: validationError });

  const supabase = createSupabaseServerClient(req, res);
  const { error } = await supabase.from('contact_messages').insert({
    full_name: String(input.fullName).trim(),
    email: String(input.email).trim().toLowerCase(),
    phone: String(input.phone || '').trim() || null,
    subject: String(input.subject).trim(),
    message: String(input.message).trim(),
    tracking_number: String(input.trackingNumber || '').trim() || null,
  });

  if (error) return res.status(500).json({ error: 'Unable to send your message right now. Please try again.' });
  return res.status(201).json({ ok: true });
}
