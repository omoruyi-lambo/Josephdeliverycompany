import Head from 'next/head';
import Link from 'next/link';
import { useState } from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { isValidTrackingNumber, normaliseTrackingNumber } from '../lib/tracking';

const COLORS = {
  navy: '#0a1f3c',
  red: '#c0392b',
  redHover: '#a93226',
  gray: '#f4f5f7',
  border: '#e2e6ea',
  text: '#1a1a2e',
  muted: '#64748b',
};

export default function ContactPage() {
  const [form, setForm] = useState({
    fullName: '',
    email: '',
    phone: '',
    subject: '',
    message: '',
    trackingNumber: '',
  });
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [submitResult, setSubmitResult] = useState(null);

  function validate() {
    const e = {};

    if (!form.fullName.trim()) e.fullName = 'Full name is required.';
    if (!form.email.trim()) e.email = 'Email is required.';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(form.email)) e.email = 'Please enter a valid email address.';
    if (!form.subject.trim()) e.subject = 'Subject is required.';
    if (!form.message.trim()) e.message = 'Message is required.';
    else if (form.message.length < 10) e.message = 'Message must be at least 10 characters.';
    else if (form.message.length > 5000) e.message = 'Message must be less than 5000 characters.';

    if (form.trackingNumber.trim()) {
      const normalized = normaliseTrackingNumber(form.trackingNumber);
      if (!isValidTrackingNumber(normalized)) {
        e.trackingNumber = 'Please enter a valid tracking number (e.g., JDC-2026-00127).';
      }
    }

    return e;
  }

  function handle(e) {
    const { name, value } = e.target;
    setForm(p => ({ ...p, [name]: value }));
    setErrors(p => ({ ...p, [name]: undefined }));
    if (submitResult) setSubmitResult(null);
  }

  async function submit(e) {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) {
      setErrors(errs);
      return;
    }

    setSubmitting(true);
    setSubmitResult(null);

    try {
      const payload = {
        fullName: form.fullName.trim(),
        email: form.email.trim(),
        phone: form.phone.trim(),
        subject: form.subject.trim(),
        message: form.message.trim(),
        trackingNumber: form.trackingNumber.trim() ? normaliseTrackingNumber(form.trackingNumber) : '',
      };

      const res = await fetch('/api/contact-messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json().catch(() => ({}));

      if (res.status === 201) {
        setSubmitResult({ ok: true });
      } else {
        setSubmitResult({
          ok: false,
          message: data?.error || 'Unable to send your message right now. Please try again.',
          errors: data?.errors || [],
        });
      }
    } catch (err) {
      setSubmitResult({
        ok: false,
        message: 'Unable to send your message right now. Please try again.',
        errors: [],
      });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <>
      <Head>
        <title>Contact Us — Josephdeliverycompany</title>
        <meta name="description" content="Contact Josephdeliverycompany by phone, email, or our online form. We respond within 2 business hours." />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <Header />

      <section style={{ position: 'relative', backgroundColor: COLORS.navy, overflow: 'hidden', padding: '72px 24px 64px' }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="https://images.unsplash.com/photo-1551836022-d5d88e9218df?auto=format&fit=crop&w=1800&q=80"
          alt="Contact and customer support operations"
          style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', opacity: 0.3 }}
        />
        <div style={{ position: 'absolute', inset: 0, backgroundColor: 'rgba(10,31,60,0.8)' }} />
        <div style={{ position: 'relative', maxWidth: 760, margin: '0 auto' }}>
          <p style={eyebrow}>Get in Touch</p>
          <h1 style={{ fontSize: 'clamp(30px,5vw,50px)', fontWeight: 800, color: '#fff', letterSpacing: '-0.04em', marginBottom: 16, lineHeight: 1.08 }}>Contact Us</h1>
          <p style={{ fontSize: 'clamp(14px,1.8vw,17px)', color: '#94a3b8', lineHeight: 1.7, maxWidth: 480 }}>
            Questions about a shipment, pricing, or partnership? Send us a message and we'll get back to you within 2 hours.
          </p>
        </div>
      </section>

      <main style={{ backgroundColor: COLORS.gray, padding: '56px 24px 80px' }}>
        <div style={{ maxWidth: 960, margin: '0 auto', display: 'grid', gridTemplateColumns: '1fr 380px', gap: 32, alignItems: 'start' }} className="contact-grid">

          {/* Form */}
          <div style={{ backgroundColor: '#fff', border: '1px solid #e2e6ea', borderRadius: 12, padding: 'clamp(24px,5vw,40px)' }}>
            {submitResult?.ok ? (
              <div style={{ textAlign: 'center', padding: '32px 0' }}>
                <div style={{ width: 64, height: 64, borderRadius: '50%', backgroundColor: '#dcfce7', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
                  <i className="fa-solid fa-check" style={{ color: '#16a34a', fontSize: 24 }} />
                </div>
                <h2 style={{ fontSize: 22, fontWeight: 700, color: '#0a1f3c', marginBottom: 10 }}>Message Sent Successfully</h2>
                <p style={{ fontSize: 14, color: '#64748b', lineHeight: 1.6, maxWidth: 400, margin: '0 auto' }}>
                  Your message has been sent successfully. Our support team will review it and respond when appropriate.
                </p>
              </div>
            ) : (
              <form onSubmit={submit} noValidate>
                <h2 style={{ fontSize: 20, fontWeight: 700, color: '#0a1f3c', marginBottom: 24 }}>Send a Message</h2>

                {submitResult?.ok === false && (
                  <div style={{ backgroundColor: '#fee2e2', border: '1px solid #fecaca', borderRadius: 8, padding: '16px', marginBottom: 24, display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                    <i className="fa-solid fa-exclamation-circle" style={{ color: COLORS.red, fontSize: 20, marginTop: 2 }} />
                    <div style={{ flex: 1 }}>
                      <p style={{ color: COLORS.red, fontWeight: 600, margin: 0, marginBottom: 6 }}>{submitResult.message}</p>
                      {submitResult.errors && submitResult.errors.length > 0 && (
                        <ul style={{ margin: 0, paddingLeft: 18, color: '#991b1b', fontSize: 13 }}>
                          {submitResult.errors.map((err, i) => <li key={i}>{err}</li>)}
                        </ul>
                      )}
                    </div>
                  </div>
                )}

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
                  <Field label="Full Name" name="fullName" value={form.fullName} onChange={handle} error={errors.fullName} placeholder="John Doe" required />
                  <Field label="Phone Number" name="phone" type="tel" value={form.phone} onChange={handle} placeholder="+1 (305) 555-0100" />
                </div>
                <Field label="Email" name="email" type="email" value={form.email} onChange={handle} error={errors.email} placeholder="john@example.com" mb={16} required />
                <Field label="Subject" name="subject" value={form.subject} onChange={handle} error={errors.subject} placeholder="Re: Tracking number JDC-2026-00127" mb={16} required />
                <Field label="Tracking Number (Optional)" name="trackingNumber" value={form.trackingNumber} onChange={handle} error={errors.trackingNumber} placeholder="JDC-2026-00127" mb={16} />
                <div style={{ marginBottom: 24 }}>
                  <label style={labelStyle}>Message</label>
                  <textarea name="message" value={form.message} onChange={handle} rows={5} placeholder="Tell us how we can help…"
                    style={{ ...inputStyle, resize: 'vertical', fontFamily: 'inherit', borderColor: errors.message ? COLORS.red : '#d1d5db' }} />
                  {errors.message && <p style={errStyle}>{errors.message}</p>}
                </div>
                <button type="submit" disabled={submitting} style={{ width: '100%', padding: '14px', backgroundColor: submitting ? '#94a3b8' : COLORS.red, color: '#fff', fontWeight: 700, fontSize: 15, border: 'none', borderRadius: 6, cursor: submitting ? 'not-allowed' : 'pointer', letterSpacing: '0.4px' }}
                  onMouseOver={e => { if (!submitting) e.currentTarget.style.backgroundColor = COLORS.redHover; }}
                  onMouseOut={e => { if (!submitting) e.currentTarget.style.backgroundColor = COLORS.red; }}>
                  {submitting ? 'SENDING...' : 'SEND MESSAGE'}
                </button>
              </form>
            )}
          </div>

          {/* Sidebar */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {[
              { icon: 'fa-solid fa-phone', title: 'Phone', lines: ['+1 (305) 555-0192', '24/7 for urgent issues'] },
              { icon: 'fa-solid fa-envelope', title: 'Email', lines: ['info@josephdeliverycompany.com', 'support@josephdeliverycompany.com'] },
              { icon: 'fa-solid fa-location-dot', title: 'Head Office', lines: ['14 Marina Street', 'Lagos Island, Lagos, Nigeria'] },
              { icon: 'fa-regular fa-clock', title: 'Office Hours', lines: ['Mon–Fri: 7am – 9pm', 'Sat: 8am – 6pm · Sun: 10am – 4pm'] },
            ].map(item => (
              <div key={item.title} style={{ backgroundColor: '#fff', border: `1px solid ${COLORS.border}`, borderRadius: 10, padding: '20px 22px', display: 'flex', gap: 16 }}>
                <div style={{ width: 40, height: 40, borderRadius: 8, backgroundColor: '#fff5f4', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <i className={item.icon} style={{ fontSize: 16, color: COLORS.red }} />
                </div>
                <div>
                  <p style={{ fontSize: 12, fontWeight: 700, color: '#374151', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: 6 }}>{item.title}</p>
                  {item.lines.map(l => <p key={l} style={{ fontSize: 13, color: COLORS.muted, lineHeight: 1.5 }}>{l}</p>)}
                </div>
              </div>
            ))}
            <Link href="/support" style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '14px 20px', backgroundColor: COLORS.navy, color: '#fff', fontWeight: 700, fontSize: 13, textDecoration: 'none', borderRadius: 8, justifyContent: 'center' }}>
              <i className="fa-solid fa-headset" /> View All Support Options
            </Link>
          </div>
        </div>
      </main>

      <style jsx global>{`
        @media(max-width:768px){
          .contact-grid{grid-template-columns:1fr !important}
        }
      `}</style>
      <Footer />
    </>
  );
}

function Field({ label, name, type = 'text', value, onChange, error, placeholder, mb = 0, required = false }) {
  return (
    <div style={{ marginBottom: mb }}>
      <label style={labelStyle}>
        {label}
        {required && <span style={{ color: COLORS.red, marginLeft: 3 }}>*</span>}
      </label>
      <input id={name} name={name} type={type} value={value} onChange={onChange} placeholder={placeholder}
        style={{ ...inputStyle, borderColor: error ? COLORS.red : '#d1d5db' }}
        onFocus={e => e.currentTarget.style.borderColor = COLORS.navy}
        onBlur={e => e.currentTarget.style.borderColor = error ? COLORS.red : '#d1d5db'} />
      {error && <p style={errStyle}>{error}</p>}
    </div>
  );
}

const eyebrow = { fontSize: 11, fontWeight: 700, letterSpacing: '3px', textTransform: 'uppercase', color: COLORS.red, marginBottom: 12 };
const labelStyle = { display: 'block', fontSize: 11, fontWeight: 700, color: '#374151', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.8px' };
const inputStyle = { display: 'block', width: '100%', padding: '11px 14px', fontSize: 14, color: COLORS.text, backgroundColor: '#fff', border: '1px solid #d1d5db', borderRadius: 6, outline: 'none', boxSizing: 'border-box' };
const errStyle = { fontSize: 12, color: COLORS.red, marginTop: 4 };
