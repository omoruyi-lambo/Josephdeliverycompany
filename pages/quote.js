import Head from 'next/head';
import Link from 'next/link';
import { useState } from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';

const SERVICE_TYPES = [
  { id: 'express', icon: 'fa-solid fa-bolt', label: 'Express', desc: 'Next-day delivery' },
  { id: 'standard', icon: 'fa-solid fa-box', label: 'Standard', desc: '3–5 business days' },
  { id: 'freight', icon: 'fa-solid fa-truck-ramp-box', label: 'Freight', desc: 'Heavy cargo' },
  { id: 'international', icon: 'fa-solid fa-globe', label: 'International', desc: 'Cross-border' },
];

const WEIGHT_RANGES = ['Under 1 kg', '1–5 kg', '5–20 kg', '20–70 kg', '70 kg+'];

export default function QuotePage() {
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({
    serviceType: '',
    originCity: '',
    originState: '',
    destCity: '',
    destState: '',
    weight: '',
    description: '',
    pickupDate: '',
    name: '',
    email: '',
    phone: '',
    company: '',
    notes: '',
  });
  const [errors, setErrors] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [saving, setSaving] = useState(false);
  const [submitError, setSubmitError] = useState('');

  function update(field, value) {
    setForm((p) => ({ ...p, [field]: value }));
    setErrors((p) => ({ ...p, [field]: undefined }));
  }

  function validateStep(s) {
    const e = {};
    if (s === 1 && !form.serviceType) e.serviceType = 'Please select a service.';
    if (s === 2) {
      if (!form.originCity.trim()) e.originCity = 'Required.';
      if (!form.originState.trim()) e.originState = 'Required.';
      if (!form.destCity.trim()) e.destCity = 'Required.';
      if (!form.destState.trim()) e.destState = 'Required.';
      if (!form.weight) e.weight = 'Please select a weight range.';
      if (!form.pickupDate) e.pickupDate = 'Please choose a pickup date.';
    }
    if (s === 3) {
      if (!form.name.trim()) e.name = 'Full name is required.';
      if (!form.email.trim() || !/\S+@\S+\.\S+/.test(form.email)) e.email = 'Valid email required.';
      if (!form.phone.trim()) e.phone = 'Phone number is required.';
    }
    return e;
  }

  function next() {
    const errs = validateStep(step);
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }
    setStep((s) => s + 1);
  }

  function back() { setStep((s) => s - 1); }

  async function handleSubmit(e) {
    e.preventDefault();
    const errs = validateStep(3);
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }
    setSaving(true);
    setSubmitError('');
    try {
      const response = await fetch('/api/quote', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || 'Unable to submit your quote request right now. Please try again.');
      setSubmitted(true);
    } catch (error) {
      setSubmitError(error.message);
    } finally {
      setSaving(false);
    }
  }

  const STEPS = ['Service', 'Shipment Details', 'Your Info'];

  return (
    <>
      <Head>
        <title>Get a Quote — Josephdeliverycompany</title>
        <meta name="description" content="Get an instant shipping quote from Josephdeliverycompany. Express, standard, freight, and international options available." />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <Header />

      {/* Page hero */}
      <section style={{ backgroundColor: '#0a1f3c', padding: '56px 24px 52px' }}>
        <div style={{ maxWidth: '760px', margin: '0 auto', textAlign: 'center' }}>
          <p style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '3px', textTransform: 'uppercase', color: '#c0392b', marginBottom: '12px' }}>
            Pricing
          </p>
          <h1 style={{ fontSize: 'clamp(28px, 4vw, 44px)', fontWeight: 800, color: '#ffffff', marginBottom: '14px', letterSpacing: '-0.4px' }}>
            Get a Shipping Quote
          </h1>
          <p style={{ fontSize: 'clamp(14px, 1.8vw, 16px)', color: '#94a3b8', lineHeight: 1.7, maxWidth: '520px', margin: '0 auto' }}>
            Fill in the details below and we'll return a competitive rate for your shipment — no obligation, no hidden fees.
          </p>
        </div>
      </section>

      <main style={{ backgroundColor: '#f4f5f7', padding: '48px 24px 80px' }}>
        <div style={{ maxWidth: '680px', margin: '0 auto' }}>

          {submitted ? (
            /* ── Success state ──────────────────────────────────── */
            <div style={{
              backgroundColor: '#ffffff',
              borderRadius: '12px',
              padding: '56px 40px',
              textAlign: 'center',
              border: '1px solid #e2e6ea',
            }}>
              <div style={{
                width: '72px', height: '72px', borderRadius: '50%', backgroundColor: '#c0392b',
                display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 28px',
              }}>
                <i className="fa-solid fa-paper-plane" style={{ color: '#fff', fontSize: '28px' }} />
              </div>
              <h2 style={{ fontSize: '26px', fontWeight: 800, color: '#0a1f3c', marginBottom: '14px' }}>
                Quote Request Received
              </h2>
              <p style={{ fontSize: '15px', color: '#64748b', lineHeight: 1.7, marginBottom: '10px' }}>
                Thanks, <strong>{form.name}</strong>. We've received your request for{' '}
                <strong>{SERVICE_TYPES.find(s => s.id === form.serviceType)?.label}</strong> shipping from{' '}
                <strong>{form.originCity}</strong> to <strong>{form.destCity}</strong>.
              </p>
              <p style={{ fontSize: '14px', color: '#94a3b8', marginBottom: '36px' }}>
                Our team will review the request and follow up using the contact details provided.
              </p>
              <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
                <Link href="/track" style={btnRed}>TRACK A SHIPMENT</Link>
                <Link href="/" style={btnOutline}>Back to Homepage</Link>
              </div>
            </div>
          ) : (
            <>
              {/* ── Progress stepper ──────────────────────────── */}
              <div style={{ display: 'flex', alignItems: 'center', marginBottom: '32px' }}>
                {STEPS.map((label, i) => {
                  const idx = i + 1;
                  const done = step > idx;
                  const active = step === idx;
                  return (
                    <div key={label} style={{ display: 'flex', alignItems: 'center', flex: i < STEPS.length - 1 ? 1 : 'none' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <div style={{
                          width: '30px', height: '30px', borderRadius: '50%', flexShrink: 0,
                          backgroundColor: done ? '#c0392b' : active ? '#0a1f3c' : '#e2e6ea',
                          color: done || active ? '#fff' : '#9ca3af',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          fontSize: '12px', fontWeight: 700,
                        }}>
                          {done ? <i className="fa-solid fa-check" style={{ fontSize: '11px' }} /> : idx}
                        </div>
                        <span style={{ fontSize: '12px', fontWeight: active ? 700 : 500, color: active ? '#0a1f3c' : '#9ca3af', whiteSpace: 'nowrap' }}>
                          {label}
                        </span>
                      </div>
                      {i < STEPS.length - 1 && (
                        <div style={{ flex: 1, height: '2px', backgroundColor: done ? '#c0392b' : '#e2e6ea', margin: '0 12px' }} />
                      )}
                    </div>
                  );
                })}
              </div>

              {/* ── Form card ────────────────────────────────── */}
              <div style={{ backgroundColor: '#ffffff', borderRadius: '12px', border: '1px solid #e2e6ea', overflow: 'hidden' }}>
                <form onSubmit={handleSubmit} noValidate>
                  {submitError && <p role="alert" style={{ marginBottom: 18, padding: '11px 14px', borderRadius: 6, color: '#a93226', backgroundColor: '#fff1ef', fontSize: 13 }}>{submitError}</p>}

                  {/* STEP 1 — Service type */}
                  {step === 1 && (
                    <div style={{ padding: 'clamp(24px, 5vw, 40px)' }}>
                      <h2 style={sectionTitle}>What service do you need?</h2>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: '14px', marginBottom: '10px' }}>
                        {SERVICE_TYPES.map((s) => (
                          <button
                            key={s.id}
                            type="button"
                            onClick={() => update('serviceType', s.id)}
                            style={{
                              padding: '20px 12px',
                              borderRadius: '8px',
                              border: form.serviceType === s.id ? '2px solid #c0392b' : '2px solid #e2e6ea',
                              backgroundColor: form.serviceType === s.id ? '#fff5f4' : '#fafafa',
                              cursor: 'pointer',
                              textAlign: 'center',
                              transition: 'all 0.15s',
                            }}
                          >
                            <i className={s.icon} style={{ fontSize: '22px', color: form.serviceType === s.id ? '#c0392b' : '#9ca3af', marginBottom: '10px', display: 'block' }} />
                            <p style={{ fontSize: '13px', fontWeight: 700, color: form.serviceType === s.id ? '#c0392b' : '#374151', margin: '0 0 4px' }}>{s.label}</p>
                            <p style={{ fontSize: '11px', color: '#9ca3af', margin: 0 }}>{s.desc}</p>
                          </button>
                        ))}
                      </div>
                      {errors.serviceType && <p style={errStyle}>{errors.serviceType}</p>}
                    </div>
                  )}

                  {/* STEP 2 — Shipment details */}
                  {step === 2 && (
                    <div style={{ padding: 'clamp(24px, 5vw, 40px)' }}>
                      <h2 style={sectionTitle}>Shipment details</h2>

                      <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '0' }}>
                        {/* Origin */}
                        <div style={{ backgroundColor: '#f8fafc', borderRadius: '8px', padding: '18px', marginBottom: '16px', border: '1px solid #e2e6ea' }}>
                          <p style={subLabel}><i className="fa-solid fa-circle-dot" style={{ color: '#c0392b', marginRight: '7px' }} />Origin</p>
                          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                            <QField label="City" name="originCity" value={form.originCity} onChange={(v) => update('originCity', v)} error={errors.originCity} placeholder="Lagos" />
                            <QField label="State / Country" name="originState" value={form.originState} onChange={(v) => update('originState', v)} error={errors.originState} placeholder="Lagos State" />
                          </div>
                        </div>

                        {/* Destination */}
                        <div style={{ backgroundColor: '#f8fafc', borderRadius: '8px', padding: '18px', marginBottom: '16px', border: '1px solid #e2e6ea' }}>
                          <p style={subLabel}><i className="fa-solid fa-location-dot" style={{ color: '#c0392b', marginRight: '7px' }} />Destination</p>
                          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                            <QField label="City" name="destCity" value={form.destCity} onChange={(v) => update('destCity', v)} error={errors.destCity} placeholder="Abuja" />
                            <QField label="State / Country" name="destState" value={form.destState} onChange={(v) => update('destState', v)} error={errors.destState} placeholder="FCT" />
                          </div>
                        </div>

                        {/* Weight & date */}
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '16px' }}>
                          <div>
                            <label style={labelStyle}>Estimated Weight</label>
                            <select
                              value={form.weight}
                              onChange={(e) => update('weight', e.target.value)}
                              style={{ ...inputStyle, appearance: 'none', backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='8' viewBox='0 0 12 8'%3E%3Cpath d='M1 1l5 5 5-5' stroke='%236b7280' stroke-width='1.5' fill='none'/%3E%3C/svg%3E\")", backgroundRepeat: 'no-repeat', backgroundPosition: 'right 12px center', paddingRight: '32px' }}
                            >
                              <option value="">Select weight</option>
                              {WEIGHT_RANGES.map((w) => <option key={w} value={w}>{w}</option>)}
                            </select>
                            {errors.weight && <p style={errStyle}>{errors.weight}</p>}
                          </div>
                          <div>
                            <label style={labelStyle}>Preferred Pickup Date</label>
                            <input
                              type="date"
                              value={form.pickupDate}
                              onChange={(e) => update('pickupDate', e.target.value)}
                              min={new Date().toISOString().split('T')[0]}
                              style={inputStyle}
                            />
                            {errors.pickupDate && <p style={errStyle}>{errors.pickupDate}</p>}
                          </div>
                        </div>

                        {/* Description */}
                        <div>
                          <label style={labelStyle}>Item Description <span style={{ color: '#9ca3af', fontWeight: 400, textTransform: 'none', letterSpacing: 0 }}>(optional)</span></label>
                          <textarea
                            value={form.description}
                            onChange={(e) => update('description', e.target.value)}
                            rows={3}
                            placeholder="e.g. Electronics, clothing, documents…"
                            style={{ ...inputStyle, resize: 'vertical', fontFamily: 'inherit' }}
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* STEP 3 — Contact info */}
                  {step === 3 && (
                    <div style={{ padding: 'clamp(24px, 5vw, 40px)' }}>
                      <h2 style={sectionTitle}>Your contact details</h2>

                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                        <QField label="Full Name" name="name" value={form.name} onChange={(v) => update('name', v)} error={errors.name} placeholder="John Doe" />
                        <QField label="Company" name="company" value={form.company} onChange={(v) => update('company', v)} placeholder="Optional" />
                      </div>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                        <QField label="Email" name="email" type="email" value={form.email} onChange={(v) => update('email', v)} error={errors.email} placeholder="john@example.com" />
                        <QField label="Phone" name="phone" type="tel" value={form.phone} onChange={(v) => update('phone', v)} error={errors.phone} placeholder="+1 (305) 555-0100" />
                      </div>

                      <div style={{ marginBottom: '24px' }}>
                        <label style={labelStyle}>Additional Notes <span style={{ color: '#9ca3af', fontWeight: 400, textTransform: 'none', letterSpacing: 0 }}>(optional)</span></label>
                        <textarea
                          value={form.notes}
                          onChange={(e) => update('notes', e.target.value)}
                          rows={3}
                          placeholder="Special handling requirements, preferred contact times…"
                          style={{ ...inputStyle, resize: 'vertical', fontFamily: 'inherit' }}
                        />
                      </div>

                      {/* Quote summary */}
                      <div style={{ backgroundColor: '#0a1f3c', borderRadius: '8px', padding: '18px 20px', marginBottom: '8px' }}>
                        <p style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '2px', textTransform: 'uppercase', color: '#94a3b8', marginBottom: '14px' }}>Summary</p>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                          {[
                            ['Service', SERVICE_TYPES.find(s => s.id === form.serviceType)?.label],
                            ['Route', `${form.originCity || '—'} → ${form.destCity || '—'}`],
                            ['Weight', form.weight || '—'],
                            ['Pickup', form.pickupDate || '—'],
                          ].map(([k, v]) => (
                            <div key={k}>
                              <p style={{ fontSize: '11px', color: '#64748b', marginBottom: '3px' }}>{k}</p>
                              <p style={{ fontSize: '13px', fontWeight: 600, color: '#e2e8f0' }}>{v}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* ── Navigation buttons ──────────────────── */}
                  <div style={{
                    padding: '20px clamp(24px, 5vw, 40px)',
                    borderTop: '1px solid #f1f5f9',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    gap: '12px',
                  }}>
                    <div>
                      {step > 1 && (
                        <button type="button" onClick={back} style={btnBack}>
                          <i className="fa-solid fa-arrow-left" style={{ fontSize: '12px' }} /> Back
                        </button>
                      )}
                    </div>
                    <div>
                      {step < 3 ? (
                        <button type="button" onClick={next} style={btnPrimary}>
                          Continue <i className="fa-solid fa-arrow-right" style={{ fontSize: '12px' }} />
                        </button>
                      ) : (
                        <button type="submit" disabled={saving} style={{ ...btnPrimary, opacity: saving ? 0.65 : 1, cursor: saving ? 'not-allowed' : 'pointer' }}>
                          {saving ? 'Submitting…' : 'Submit Quote Request'} <i className="fa-solid fa-paper-plane" style={{ fontSize: '12px' }} />
                        </button>
                      )}
                    </div>
                  </div>
                </form>
              </div>

              {/* Trust badges */}
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '20px', justifyContent: 'center', marginTop: '36px' }}>
                {[
                  ['fa-solid fa-shield-halved', 'Secure & Confidential'],
                  ['fa-solid fa-clock', 'Response in 2 Hours'],
                  ['fa-solid fa-headset', '24/7 Support'],
                ].map(([icon, text]) => (
                  <div key={text} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: '#64748b' }}>
                    <i className={icon} style={{ color: '#c0392b' }} />
                    {text}
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </main>

      <Footer />
    </>
  );
}

/* ── Tiny field component ────────────────────────────────────────────────── */
function QField({ label, name, type = 'text', value, onChange, error, placeholder }) {
  return (
    <div>
      <label style={labelStyle}>{label}</label>
      <input
        id={name}
        name={name}
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        style={{ ...inputStyle, borderColor: error ? '#c0392b' : '#d1d5db' }}
        onFocus={(e) => (e.currentTarget.style.borderColor = '#0a1f3c')}
        onBlur={(e) => (e.currentTarget.style.borderColor = error ? '#c0392b' : '#d1d5db')}
      />
      {error && <p style={errStyle}>{error}</p>}
    </div>
  );
}

/* ── Shared style objects ────────────────────────────────────────────────── */
const sectionTitle = { fontSize: 'clamp(17px, 2.5vw, 21px)', fontWeight: 700, color: '#0a1f3c', marginBottom: '24px', letterSpacing: '-0.2px' };
const subLabel = { fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px', color: '#374151', marginBottom: '12px' };
const labelStyle = { display: 'block', fontSize: '11px', fontWeight: 700, color: '#374151', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.8px' };
const inputStyle = { display: 'block', width: '100%', padding: '10px 13px', fontSize: '14px', color: '#1a1a2e', backgroundColor: '#fff', border: '1px solid #d1d5db', borderRadius: '6px', outline: 'none', boxSizing: 'border-box' };
const errStyle = { fontSize: '11px', color: '#c0392b', marginTop: '4px' };
const btnPrimary = { display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '12px 22px', backgroundColor: '#c0392b', color: '#fff', fontWeight: 700, fontSize: '14px', border: 'none', borderRadius: '6px', cursor: 'pointer', letterSpacing: '0.3px' };
const btnBack = { display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '12px 18px', backgroundColor: 'transparent', color: '#374151', fontWeight: 600, fontSize: '14px', border: '1px solid #d1d5db', borderRadius: '6px', cursor: 'pointer' };
const btnRed = { display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '12px 22px', backgroundColor: '#c0392b', color: '#fff', fontWeight: 700, fontSize: '14px', borderRadius: '6px', textDecoration: 'none', letterSpacing: '0.3px' };
const btnOutline = { display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '12px 22px', backgroundColor: '#fff', color: '#0a1f3c', fontWeight: 600, fontSize: '14px', borderRadius: '6px', textDecoration: 'none', border: '1px solid #d1d5db' };
