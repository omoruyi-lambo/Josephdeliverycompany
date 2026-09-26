import { createSupabaseServerClient } from '../../lib/supabase/server';

const VALID_STATUSES = new Set(['NEW', 'READ', 'IN_PROGRESS', 'RESOLVED']);

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

function validatePayload(body) {
  const errors = [];
  const clean = {};

  if (!body || typeof body !== 'object') {
    return { errors: ['Request body is required.'], clean: null };
  }

  clean.full_name = nonEmpty(body.fullName);
  clean.email = nonEmpty(body.email);
  clean.phone = body.phone != null ? String(body.phone).trim() : '';
  clean.subject = nonEmpty(body.subject);
  clean.message = nonEmpty(body.message);
  clean.tracking_number = body.trackingNumber != null ? String(body.trackingNumber).trim() : '';

  if (!clean.full_name) errors.push('fullName is required.');
  if (!clean.email) errors.push('email is required.');
  else if (!validateEmail(clean.email)) errors.push('email format is invalid.');
  if (!clean.subject) errors.push('subject is required.');
  if (!clean.message) errors.push('message is required.');
  else if (clean.message.length < 10) errors.push('message must be at least 10 characters.');
  else if (clean.message.length > 5000) errors.push('message must be less than 5000 characters.');

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
      .from('contact_messages')
      .insert({
        full_name: clean.full_name,
        email: clean.email,
        phone: clean.phone,
        subject: clean.subject,
        message: clean.message,
        tracking_number: clean.tracking_number,
        status: clean.status,
      })
      .select('id, status, created_at')
      .single();

    if (insErr) {
      console.error('[contact-messages API] Insert error:', insErr.message);
      return res.status(500).json({
        error: 'Unable to send your message right now. Please try again.',
      });
    }

    return res.status(201).json({
      ok: true,
      message: {
        id: inserted.id,
        status: inserted.status,
      },
    });
  } catch (err) {
    console.error(
      '[contact-messages API] Unexpected error:',
      err?.message ?? err,
    );
    return res.status(500).json({
      error: 'Unable to send your message right now. Please try again.',
    });
  }
}