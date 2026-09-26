import Head from 'next/head';
import { useState } from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';

const SHIPMENT_TYPES = ['Domestic', 'International', 'Express', 'Freight'];
const SERVICES = [
  'Express Delivery',
  'Domestic Shipping',
  'International Shipping',
  'Freight & Cargo',
];
const PACKAGE_TYPES = [
  'Document',
  'Parcel',
  'Box',
  'Pallet',
  'Commercial Package',
  'Container',
  'Other',
];

const COLORS = {
  navy: '#0a1f3c',
  red: '#c0392b',
  redHover: '#a93226',
  gray: '#f4f5f7',
  border: '#e2e6ea',
  text: '#1a1a2e',
  muted: '#64748b',
  green: '#16a34a',
};

const labelStyle = {
  display: 'block',
  fontSize: '11px',
  fontWeight: 700,
  color: '#374151',
  marginBottom: '6px',
  textTransform: 'uppercase',
  letterSpacing: '0.8px',
};

function inputStyle({ hasError }) {
  return {
    display: 'block',
    width: '100%',
    padding: '10px 13px',
    fontSize: '14px',
    color: COLORS.text,
    backgroundColor: '#fff',
    border: `1px solid ${hasError ? COLORS.red : '#d1d5db'}`,
    borderRadius: '6px',
    outline: 'none',
    boxSizing: 'border-box',
  };
}

const selectBaseExtra = {
  appearance: 'none',
  backgroundImage:
    "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='8' viewBox='0 0 12 8'%3E%3Cpath d='M1 1l5 5 5-5' stroke='%236b7280' stroke-width='1.5' fill='none'/%3E%3C/svg%3E\")",
  backgroundRepeat: 'no-repeat',
  backgroundPosition: 'right 12px center',
  paddingRight: '32px',
};

const errStyle = { fontSize: '11px', color: COLORS.red, marginTop: '4px' };

function validateEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(String(email || '').trim());
}

export default function QuotePage() {
  const [form, setForm] = useState({
    fullName: '',
    email: '',
    phone: '',
    companyName: '',
    shipmentType: '',
    service: '',
    packageType: '',
    packageCount: '',
    weight: '',
    originCountry: '',
    originCity: '',
    destinationCountry: '',
    destinationCity: '',
    message: '',
  });
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [submitResult, setSubmitResult] = useState(null);

  function update(field, value) {
    setForm((p) => ({ ...p, [field]: value }));
    setErrors((p) => ({ ...p, [field]: undefined }));
  }

  function validate() {
    const e = {};

    if (!String(form.fullName || '').trim()) e.fullName = 'Full name is required.';
    if (!String(form.email || '').trim()) e.email = 'Email is required.';
    else if (!validateEmail(form.email)) e.email = 'Please enter a valid email address.';
    if (!String(form.phone || '').trim()) e.phone = 'Phone number is required.';

    if (!form.shipmentType) e.shipmentType = 'Please select a shipment type.';
    if (!form.service) e.service = 'Please select a service.';
    if (!form.packageType) e.packageType = 'Please select a package type.';

    const pcRaw = String(form.packageCount || '').trim();
    if (!pcRaw) {
      e.packageCount = 'Package count is required.';
    } else {
      const pc = Number.parseInt(pcRaw, 10);
      if (!Number.isFinite(pc) || pc <= 0 || !Number.isInteger(Number(pcRaw))) {
        e.packageCount = 'Must be a positive whole number.';
      }
    }

    const wRaw = String(form.weight || '').trim();
    if (!wRaw) {
      e.weight = 'Weight is required.';
    } else {
      const w = Number.parseFloat(wRaw);
      if (!Number.isFinite(w) || w <= 0) {
        e.weight = 'Must be a positive number (kg).';
      }
    }

    if (!String(form.originCountry || '').trim()) e.originCountry = 'Origin country is required.';
    if (!String(form.originCity || '').trim()) e.originCity = 'Origin city is required.';
    if (!String(form.destinationCountry || '').trim())
      e.destinationCountry = 'Destination country is required.';
    if (!String(form.destinationCity || '').trim())
      e.destinationCity = 'Destination city is required.';

    return e;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const validationErrors = validate();
    setErrors(validationErrors);
    if (Object.keys(validationErrors).length > 0) return;

    setSubmitting(true);
    setSubmitResult(null);

    try {
      const payload = {
        fullName: form.fullName.trim(),
        email: form.email.trim(),
        phone: form.phone.trim(),
        companyName: form.companyName ? form.companyName.trim() : '',
        shipmentType: form.shipmentType,
        service: form.service,
        packageType: form.packageType,
        packageCount: Number.parseInt(String(form.packageCount).trim(), 10),
        weight: Number.parseFloat(String(form.weight).trim()),
        originCountry: form.originCountry.trim(),
        originCity: form.originCity.trim(),
        destinationCountry: form.destinationCountry.trim(),
        destinationCity: form.destinationCity.trim(),
        message: form.message ? form.message.trim() : '',
      };

      const res = await fetch('/api/quote-requests', {
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
          message:
            data?.error ||
            'Unable to submit your quote request right now. Please try again.',
          errors: data?.errors || [],
        });
      }
    } catch (err) {
      setSubmitResult({
        ok: false,
        message: 'Unable to submit your quote request right now. Please try again.',
        errors: [],
      });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <>
      <Head>
        <title>Request a Quote — Josephdeliverycompany</title>
        <meta
          name="description"
          content="Request a custom shipping quote from Josephdeliverycompany. Domestic, international, express and freight services."
        />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <Header />

      <section
        style={{
          position: 'relative',
          backgroundColor: COLORS.navy,
          overflow: 'hidden',
          padding: '56px 24px 52px',
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="https://images.unsplash.com/photo-1558618666-fcd25c85cd64?auto=format&fit=crop&w=1800&q=80"
          alt="Logistics cargo and delivery truck preparing shipment"
          style={{
            position: 'absolute',
            inset: 0,
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            opacity: 0.3,
          }}
        />
        <div
          style={{
            position: 'absolute',
            inset: 0,
            backgroundColor: 'rgba(10,31,60,0.8)',
          }}
        />
        <div
          style={{
            position: 'relative',
            maxWidth: '760px',
            margin: '0 auto',
            textAlign: 'center',
          }}
        >
          <p
            style={{
              fontSize: '11px',
              fontWeight: 700,
              letterSpacing: '3px',
              textTransform: 'uppercase',
              color: COLORS.red,
              marginBottom: '12px',
            }}
          >
            Pricing
          </p>
          <h1
            style={{
              fontSize: 'clamp(28px, 4vw, 44px)',
              fontWeight: 800,
              color: '#ffffff',
              marginBottom: '14px',
              letterSpacing: '-0.4px',
            }}
          >
            Request a Shipping Quote
          </h1>
          <p
            style={{
              fontSize: 'clamp(14px, 1.8vw, 16px)',
              color: '#94a3b8',
              lineHeight: 1.7,
              maxWidth: '520px',
              margin: '0 auto',
            }}
          >
            Fill in the details below and our team will prepare a tailored,
            competitive rate for your shipment — no obligation.
          </p>
        </div>
      </section>

      <main style={{ backgroundColor: COLORS.gray, padding: '48px 24px 80px' }}>
        <div style={{ maxWidth: '880px', margin: '0 auto' }}>
          {submitResult?.ok ? (
            <div
              style={{
                backgroundColor: '#ffffff',
                borderRadius: '8px',
                padding: '56px 40px',
                textAlign: 'center',
                border: `1px solid ${COLORS.border}`,
              }}
            >
              <div
                style={{
                  width: '72px',
                  height: '72px',
                  borderRadius: '50%',
                  backgroundColor: '#dcfce7',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 24px',
                }}
              >
                <i
                  className="fa-solid fa-check"
                  style={{ color: COLORS.green, fontSize: '32px' }}
                />
              </div>
              <h2
                style={{
                  fontSize: '24px',
                  fontWeight: 800,
                  color: COLORS.navy,
                  marginBottom: '12px',
                }}
              >
                Quote Request Submitted
              </h2>
              <p
                style={{
                  fontSize: '15px',
                  color: COLORS.muted,
                  lineHeight: 1.7,
                  maxWidth: '480px',
                  margin: '0 auto 32px',
                }}
              >
                Your quote request has been submitted successfully. Our team will
                review your request and contact you.
              </p>
              <div
                style={{
                  display: 'flex',
                  gap: '12px',
                  justifyContent: 'center',
                  flexWrap: 'wrap',
                }}
              >
                <a
                  href="/track"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '12px 22px',
                    backgroundColor: COLORS.red,
                    color: '#fff',
                    fontWeight: 700,
                    fontSize: '14px',
                    borderRadius: '6px',
                    textDecoration: 'none',
                    letterSpacing: '0.3px',
                  }}
                >
                  TRACK A SHIPMENT
                </a>
                <a
                  href="/"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '12px 22px',
                    backgroundColor: '#fff',
                    color: COLORS.navy,
                    fontWeight: 600,
                    fontSize: '14px',
                    borderRadius: '6px',
                    textDecoration: 'none',
                    border: '1px solid #d1d5db',
                  }}
                >
                  Back to Homepage
                </a>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} noValidate>
              {submitResult?.ok === false && (
                <div
                  style={{
                    backgroundColor: '#fee2e2',
                    border: '1px solid #fecaca',
                    borderRadius: 8,
                    padding: '16px',
                    marginBottom: 24,
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: 12,
                  }}
                >
                  <i
                    className="fa-solid fa-exclamation-circle"
                    style={{ color: COLORS.red, fontSize: 20, marginTop: 2 }}
                  />
                  <div style={{ flex: 1 }}>
                    <p
                      style={{
                        color: COLORS.red,
                        fontWeight: 600,
                        margin: 0,
                        marginBottom: 6,
                      }}
                    >
                      {submitResult.message}
                    </p>
                    {submitResult.errors && submitResult.errors.length > 0 && (
                      <ul
                        style={{
                          margin: 0,
                          paddingLeft: 18,
                          color: '#991b1b',
                          fontSize: 13,
                        }}
                      >
                        {submitResult.errors.map((err, i) => (
                          <li key={i}>{err}</li>
                        ))}
                      </ul>
                    )}
                  </div>
                </div>
              )}

              {/* CONTACT INFORMATION */}
              <SectionCard title="Contact Information" icon="fa-user" color={COLORS.navy}>
                <div className="quote-grid">
                  <Field
                    label="Full Name"
                    required
                    value={form.fullName}
                    onChange={(v) => update('fullName', v)}
                    error={errors.fullName}
                    placeholder="John Doe"
                  />
                  <Field
                    label="Email"
                    type="email"
                    required
                    value={form.email}
                    onChange={(v) => update('email', v)}
                    error={errors.email}
                    placeholder="john@example.com"
                  />
                  <Field
                    label="Phone"
                    type="tel"
                    required
                    value={form.phone}
                    onChange={(v) => update('phone', v)}
                    error={errors.phone}
                    placeholder="+1 (305) 555-0100"
                  />
                  <Field
                    label="Company Name"
                    value={form.companyName}
                    onChange={(v) => update('companyName', v)}
                    placeholder="Optional"
                  />
                </div>
              </SectionCard>

              {/* SHIPMENT INFORMATION */}
              <SectionCard title="Shipment Information" icon="fa-box" color={COLORS.red}>
                <div className="quote-grid">
                  <SelectField
                    label="Shipment Type"
                    required
                    value={form.shipmentType}
                    onChange={(v) => update('shipmentType', v)}
                    error={errors.shipmentType}
                    options={SHIPMENT_TYPES}
                    placeholder="Select shipment type"
                  />
                  <SelectField
                    label="Service"
                    required
                    value={form.service}
                    onChange={(v) => update('service', v)}
                    error={errors.service}
                    options={SERVICES}
                    placeholder="Select service"
                  />
                  <SelectField
                    label="Package Type"
                    required
                    value={form.packageType}
                    onChange={(v) => update('packageType', v)}
                    error={errors.packageType}
                    options={PACKAGE_TYPES}
                    placeholder="Select package type"
                  />
                  <Field
                    label="Package Count"
                    type="number"
                    min="1"
                    step="1"
                    required
                    value={form.packageCount}
                    onChange={(v) => update('packageCount', v)}
                    error={errors.packageCount}
                    placeholder="e.g. 2"
                  />
                  <Field
                    label="Weight (kg)"
                    type="number"
                    min="0"
                    step="0.01"
                    required
                    value={form.weight}
                    onChange={(v) => update('weight', v)}
                    error={errors.weight}
                    placeholder="e.g. 5.5"
                  />
                </div>

                <div
                  style={{
                    height: 1,
                    backgroundColor: COLORS.border,
                    margin: '24px 0',
                  }}
                />

                <div className="quote-grid">
                  <Field
                    label="Origin Country"
                    required
                    value={form.originCountry}
                    onChange={(v) => update('originCountry', v)}
                    error={errors.originCountry}
                    placeholder="e.g. Nigeria"
                  />
                  <Field
                    label="Origin City"
                    required
                    value={form.originCity}
                    onChange={(v) => update('originCity', v)}
                    error={errors.originCity}
                    placeholder="e.g. Lagos"
                  />
                  <Field
                    label="Destination Country"
                    required
                    value={form.destinationCountry}
                    onChange={(v) => update('destinationCountry', v)}
                    error={errors.destinationCountry}
                    placeholder="e.g. United States"
                  />
                  <Field
                    label="Destination City"
                    required
                    value={form.destinationCity}
                    onChange={(v) => update('destinationCity', v)}
                    error={errors.destinationCity}
                    placeholder="e.g. Miami"
                  />
                </div>
              </SectionCard>

              {/* ADDITIONAL INFORMATION */}
              <SectionCard title="Additional Information" icon="fa-message" color="#374151">
                <div>
                  <label style={labelStyle}>Message</label>
                  <textarea
                    value={form.message}
                    onChange={(e) => update('message', e.target.value)}
                    rows={5}
                    placeholder="Any additional details, special handling requirements, or questions…"
                    style={{
                      ...inputStyle({ hasError: false }),
                      resize: 'vertical',
                      fontFamily: 'inherit',
                      minHeight: '110px',
                    }}
                  />
                </div>
              </SectionCard>

              <div style={{ textAlign: 'center', marginTop: '32px' }}>
                <button
                  type="submit"
                  disabled={submitting}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '10px',
                    padding: '14px 32px',
                    backgroundColor: submitting ? '#d4a09b' : COLORS.red,
                    color: '#fff',
                    fontWeight: 700,
                    fontSize: '15px',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: submitting ? 'not-allowed' : 'pointer',
                    letterSpacing: '0.5px',
                    textTransform: 'uppercase',
                  }}
                  onMouseOver={(e) => {
                    if (!submitting) e.currentTarget.style.backgroundColor = COLORS.redHover;
                  }}
                  onMouseOut={(e) => {
                    if (!submitting) e.currentTarget.style.backgroundColor = COLORS.red;
                  }}
                >
                  {submitting ? (
                    <>
                      <i className="fa-solid fa-circle-notch fa-spin" />
                      Submitting…
                    </>
                  ) : (
                    <>
                      <i className="fa-solid fa-paper-plane" />
                      Request a Quote
                    </>
                  )}
                </button>
              </div>

              <div
                style={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  gap: '20px',
                  justifyContent: 'center',
                  marginTop: '36px',
                }}
              >
                {[
                  ['fa-solid fa-shield-halved', 'Secure & Confidential'],
                  ['fa-solid fa-clock', 'Prompt Response'],
                  ['fa-solid fa-headset', '24/7 Support'],
                ].map(([icon, text]) => (
                  <div
                    key={text}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      fontSize: '13px',
                      color: COLORS.muted,
                    }}
                  >
                    <i className={icon} style={{ color: COLORS.red }} />
                    {text}
                  </div>
                ))}
              </div>
            </form>
          )}
        </div>
      </main>

      <style jsx>{`
        .quote-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 16px 20px;
        }
        @media (max-width: 640px) {
          .quote-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>

      <Footer />
    </>
  );
}

/* ── Reusable sub-components for this page ─────────────────────────── */

function SectionCard({ title, icon, color, children }) {
  return (
    <div
      style={{
        backgroundColor: '#fff',
        border: `1px solid ${COLORS.border}`,
        borderRadius: '8px',
        overflow: 'hidden',
        marginBottom: '20px',
      }}
    >
      <div
        style={{
          padding: '14px 20px',
          borderBottom: `1px solid ${COLORS.border}`,
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          backgroundColor: `${color}0c`,
        }}
      >
        <div
          style={{
            width: 28,
            height: 28,
            borderRadius: 6,
            backgroundColor: color,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}
        >
          <i
            className={`fa-solid ${icon}`}
            style={{ color: '#fff', fontSize: 12 }}
          />
        </div>
        <h2
          style={{
            fontSize: '15px',
            fontWeight: 800,
            color,
            margin: 0,
            letterSpacing: '0.3px',
            textTransform: 'uppercase',
          }}
        >
          {title}
        </h2>
      </div>
      <div style={{ padding: '24px 20px' }}>{children}</div>
    </div>
  );
}

function Field({
  label,
  type = 'text',
  value,
  onChange,
  error,
  placeholder,
  required,
  min,
  step,
}) {
  return (
    <div>
      <label style={labelStyle}>
        {label}
        {required && <span style={{ color: COLORS.red, marginLeft: 3 }}>*</span>}
      </label>
      <input
        type={type}
        value={value}
        min={min}
        step={step}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        style={inputStyle({ hasError: !!error })}
        onFocus={(e) => (e.currentTarget.style.borderColor = COLORS.navy)}
        onBlur={(e) =>
          (e.currentTarget.style.borderColor = error ? COLORS.red : '#d1d5db')
        }
      />
      {error && <p style={errStyle}>{error}</p>}
    </div>
  );
}

function SelectField({
  label,
  value,
  onChange,
  error,
  options,
  placeholder,
  required,
}) {
  return (
    <div>
      <label style={labelStyle}>
        {label}
        {required && <span style={{ color: COLORS.red, marginLeft: 3 }}>*</span>}
      </label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        style={{
          ...inputStyle({ hasError: !!error }),
          ...selectBaseExtra,
        }}
        onFocus={(e) => (e.currentTarget.style.borderColor = COLORS.navy)}
        onBlur={(e) =>
          (e.currentTarget.style.borderColor = error ? COLORS.red : '#d1d5db')
        }
      >
        <option value="">{placeholder}</option>
        {options.map((opt) => (
          <option key={opt} value={opt}>
            {opt}
          </option>
        ))}
      </select>
      {error && <p style={errStyle}>{error}</p>}
    </div>
  );
}
