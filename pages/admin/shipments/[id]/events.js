import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useState } from 'react';
import { createSupabaseServerClient } from '../../../../lib/supabase/server';
import { requireAdminAuth } from '../../../../lib/adminAuth';
import AdminLayout from '../../../../components/AdminLayout';

const COLORS = {
  navy: '#0a1f3c',
  navyDark: '#061529',
  red: '#c0392b',
  redHover: '#a93226',
  gray: '#f4f5f7',
  border: '#e2e6ea',
  text: '#1a1a2e',
  muted: '#64748b',
};

const STATUS_OPTIONS = [
  { code: 'BOOKED', label: 'Booked' },
  { code: 'PICKED_UP', label: 'Picked Up' },
  { code: 'IN_TRANSIT', label: 'In Transit' },
  { code: 'ARRIVED', label: 'Arrived' },
  { code: 'ON_HOLD', label: 'On Hold' },
  { code: 'OUT_FOR_DELIVERY', label: 'Out for Delivery' },
  { code: 'DELIVERED', label: 'Delivered' },
];

const STATUS_CODE_TO_LABEL = {
  BOOKED: 'Booked',
  PICKED_UP: 'Picked Up',
  IN_TRANSIT: 'In Transit',
  ARRIVED: 'Arrived',
  ON_HOLD: 'On Hold',
  OUT_FOR_DELIVERY: 'Out for Delivery',
  DELIVERED: 'Delivered',
  COLLECTED: 'Collected',
  FAILED_DELIVERY: 'Failed Delivery',
  RETURNED: 'Returned',
};

function formatDatetimeLocalDefault() {
  const d = new Date();
  const tzOffsetMs = d.getTimezoneOffset() * 60000;
  const local = new Date(d.getTime() - tzOffsetMs);
  return local.toISOString().slice(0, 16);
}

function buildInitialState(shipment) {
  const currentCity = shipment?.current_city || shipment?.origin_city || '';
  const currentCountry = shipment?.current_country || shipment?.origin_country || '';
  const currentAddress = shipment?.current_address || '';
  const currentLat = shipment?.current_lat ?? shipment?.origin_lat ?? '';
  const currentLng = shipment?.current_lng ?? shipment?.origin_lng ?? '';
  const combinedLocation =
    currentCity && currentCountry ? `${currentCity}, ${currentCountry}` : '';

  return {
    statusCode: shipment?.status_code || 'IN_TRANSIT',
    description: '',
    location: combinedLocation,
    country: currentCountry,
    city: currentCity,
    address: currentAddress,
    lat: currentLat,
    lng: currentLng,
    eventDate: formatDatetimeLocalDefault(),
  };
}

export default function AddTrackingEventPage({ shipment, profile }) {
  const router = useRouter();
  const { id } = router.query;

  const [form, setForm] = useState(buildInitialState(shipment));
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);

  function updateField(key, value) {
    setForm((f) => ({ ...f, [key]: value }));
    if (errors[key]) {
      setErrors((e) => {
        const next = { ...e };
        delete next[key];
        return next;
      });
    }
    if (submitError) setSubmitError(null);
  }

  function validate() {
    const e = {};

    if (!form.statusCode || !String(form.statusCode).trim()) {
      e.statusCode = 'Status is required.';
    }

    if (!form.description || !String(form.description).trim()) {
      e.description = 'Description is required.';
    }

    const locationTrim = form.location ? String(form.location).trim() : '';
    const cityTrim = form.city ? String(form.city).trim() : '';
    const countryTrim = form.country ? String(form.country).trim() : '';

    if (!locationTrim && (!cityTrim || !countryTrim)) {
      e.location = 'Either location or both city and country are required.';
      if (!cityTrim) e.city = 'City is required when location is empty.';
      if (!countryTrim) e.country = 'Country is required when location is empty.';
    }

    const coordFields = [
      ['lat', 'Latitude'],
      ['lng', 'Longitude'],
    ];

    for (const [key, label] of coordFields) {
      const raw = form[key];
      if (raw === undefined || raw === null || raw === '') continue;
      const n = parseFloat(String(raw));
      if (!Number.isFinite(n)) {
        e[key] = `${label} must be a valid number.`;
      } else if (key === 'lat' && (n < -90 || n > 90)) {
        e[key] = `${label} must be between -90 and 90.`;
      } else if (key === 'lng' && (n < -180 || n > 180)) {
        e[key] = `${label} must be between -180 and 180.`;
      }
    }

    if (form.eventDate) {
      const d = new Date(form.eventDate);
      if (!Number.isFinite(d.getTime())) {
        e.eventDate = 'Event date must be a valid date.';
      }
    }

    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!validate()) return;

    setSubmitting(true);
    setSubmitError(null);

    const payload = {
      statusCode: form.statusCode,
      description: form.description,
      location: form.location,
      country: form.country,
      city: form.city,
      address: form.address,
      latitude: form.lat,
      longitude: form.lng,
      eventDate: form.eventDate,
    };

    try {
      const res = await fetch(`/api/admin/shipments/${id}/events`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'same-origin',
        body: JSON.stringify(payload),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        const msg =
          (data.errors && data.errors.length && data.errors.join(' ')) ||
          data.error ||
          `Request failed (${res.status}).`;
        throw new Error(msg);
      }

      router.push(`/admin/shipments/${id}`);
    } catch (err) {
      console.error('[AddTrackingEvent] Submit error:', err);
      setSubmitError(err.message || 'Failed to add tracking event.');
    } finally {
      setSubmitting(false);
    }
  }

  if (!shipment) {
    return (
      <AdminLayout title="Shipment Not Found" profile={profile}>
        <NotFoundState />
      </AdminLayout>
    );
  }

  return (
    <>
      <Head>
        <title>Add Tracking Event — {shipment.tracking_number} | Josephdeliverycompany Admin</title>
        <meta
          name="description"
          content={`Add a tracking event for shipment ${shipment.tracking_number}.`}
        />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <AdminLayout
        title={`Add Event · ${shipment.tracking_number}`}
        profile={profile}
      >
        <div style={{ marginBottom: 20 }}>
          <BreadcrumbBar
            trackingNumber={shipment.tracking_number}
            id={shipment.id}
          />
        </div>

        <ShipmentCard shipment={shipment} />

        <form onSubmit={handleSubmit} noValidate>
          {submitError && (
            <AlertBox type="error" message={submitError} />
          )}

          <SectionCard
            icon="fa-bolt"
            title="Tracking Event Details"
            subtitle="Record a new status update for this shipment"
          >
            <Grid cols={3}>
              <Field
                label="Status Code"
                required
                error={errors.statusCode}
                input={
                  <Select
                    value={form.statusCode}
                    onChange={(v) => updateField('statusCode', v)}
                    options={STATUS_OPTIONS.map((s) => s.label)}
                    valueMap={STATUS_OPTIONS.reduce((acc, s) => {
                      acc[s.label] = s.code;
                      return acc;
                    }, {})}
                    labelMap={STATUS_OPTIONS.reduce((acc, s) => {
                      acc[s.code] = s.label;
                      return acc;
                    }, {})}
                    placeholder="Select status"
                  />
                }
              />
              <Field
                label="Event Date"
                error={errors.eventDate}
                input={
                  <TextInput
                    value={form.eventDate}
                    onChange={(v) => updateField('eventDate', v)}
                    type="datetime-local"
                  />
                }
              />
            </Grid>

            <div style={{ marginTop: 16 }}>
              <Field
                label="Description"
                required
                error={errors.description}
                input={
                  <Textarea
                    value={form.description}
                    onChange={(v) => updateField('description', v)}
                    placeholder="e.g. Package arrived at the destination distribution center"
                    rows={3}
                  />
                }
              />
            </div>
          </SectionCard>

          <SectionCard
            icon="fa-location-dot"
            title="Event Location"
            subtitle="Where this event occurred (location can be used as a quick combined field, or fill in city + country individually)"
          >
            <Grid cols={3}>
              <Field
                label="Location (Combined)"
                error={errors.location}
                input={
                  <TextInput
                    value={form.location}
                    onChange={(v) => updateField('location', v)}
                    placeholder="e.g. Lagos, Nigeria"
                  />
                }
              />
              <Field
                label="Country"
                error={errors.country}
                input={
                  <TextInput
                    value={form.country}
                    onChange={(v) => updateField('country', v)}
                    placeholder="e.g. Nigeria"
                  />
                }
              />
              <Field
                label="City"
                error={errors.city}
                input={
                  <TextInput
                    value={form.city}
                    onChange={(v) => updateField('city', v)}
                    placeholder="e.g. Lagos"
                  />
                }
              />
            </Grid>
            <div style={{ marginTop: 16 }}>
              <Grid cols={3}>
                <Field
                  label="Address"
                  input={
                    <TextInput
                      value={form.address}
                      onChange={(v) => updateField('address', v)}
                      placeholder="Street address or facility name"
                    />
                  }
                />
                <Field
                  label="Latitude"
                  error={errors.lat}
                  input={
                    <TextInput
                      value={form.lat}
                      onChange={(v) => updateField('lat', v)}
                      placeholder="6.5244"
                      type="number"
                      step="any"
                    />
                  }
                />
                <Field
                  label="Longitude"
                  error={errors.lng}
                  input={
                    <TextInput
                      value={form.lng}
                      onChange={(v) => updateField('lng', v)}
                      placeholder="3.3792"
                      type="number"
                      step="any"
                    />
                  }
                />
              </Grid>
            </div>
          </SectionCard>

          <div
            style={{
              display: 'flex',
              justifyContent: 'flex-end',
              gap: 12,
              marginTop: 24,
            }}
          >
            <Link
              href={`/admin/shipments/${id}`}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
                padding: '11px 20px',
                backgroundColor: '#fff',
                border: `1px solid ${COLORS.border}`,
                borderRadius: 6,
                fontSize: 14,
                fontWeight: 600,
                color: COLORS.text,
                textDecoration: 'none',
                cursor: 'pointer',
              }}
            >
              <i className="fa-solid fa-arrow-left" />
              Back to Shipment
            </Link>
            <button
              type="submit"
              disabled={submitting}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
                padding: '11px 24px',
                backgroundColor: COLORS.red,
                color: '#fff',
                border: 'none',
                borderRadius: 6,
                fontSize: 14,
                fontWeight: 600,
                cursor: submitting ? 'not-allowed' : 'pointer',
                opacity: submitting ? 0.75 : 1,
              }}
            >
              <i
                className={`fa-solid ${
                  submitting ? 'fa-sync-alt fa-spin' : 'fa-plus'
                }`}
              />
              {submitting ? 'Adding Event...' : 'Add Tracking Event'}
            </button>
          </div>
        </form>
      </AdminLayout>
    </>
  );
}

function BreadcrumbBar({ trackingNumber, id }) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        fontSize: 13,
        color: COLORS.muted,
        flexWrap: 'wrap',
      }}
    >
      <Link
        href="/admin"
        style={{ color: COLORS.muted, textDecoration: 'none' }}
      >
        Dashboard
      </Link>
      <i className="fa-solid fa-angle-right" style={{ fontSize: 10 }} />
      <Link
        href="/admin/shipments"
        style={{ color: COLORS.muted, textDecoration: 'none' }}
      >
        Shipments
      </Link>
      <i className="fa-solid fa-angle-right" style={{ fontSize: 10 }} />
      <Link
        href={`/admin/shipments/${id}`}
        style={{ color: COLORS.muted, textDecoration: 'none' }}
      >
        <span
          style={{
            fontFamily: 'monospace',
            fontWeight: 500,
          }}
        >
          {trackingNumber}
        </span>
      </Link>
      <i className="fa-solid fa-angle-right" style={{ fontSize: 10 }} />
      <span style={{ color: COLORS.navy, fontWeight: 600 }}>Add Event</span>
    </div>
  );
}

function ShipmentCard({ shipment }) {
  const originParts = [shipment.origin_city, shipment.origin_country].filter(Boolean);
  const destParts = [shipment.destination_city, shipment.destination_country].filter(Boolean);
  const currentParts = [
    shipment.current_city || shipment.origin_city,
    shipment.current_country || shipment.origin_country,
  ].filter(Boolean);
  const statusLabel =
    STATUS_CODE_TO_LABEL[shipment.status_code] || shipment.status || 'Unknown';

  return (
    <div
      style={{
        backgroundColor: '#fff',
        border: `1px solid ${COLORS.border}`,
        borderRadius: 10,
        marginBottom: 20,
        overflow: 'hidden',
      }}
    >
      <div
        style={{
          backgroundColor: COLORS.navy,
          padding: '20px 24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 16,
          flexWrap: 'wrap',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, flexWrap: 'wrap' }}>
          <div
            style={{
              width: 44,
              height: 44,
              borderRadius: 8,
              backgroundColor: 'rgba(192, 57, 43, 0.2)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <i
              className="fa-solid fa-box"
              style={{ color: COLORS.red, fontSize: 20 }}
            />
          </div>
          <div>
            <p
              style={{
                fontSize: 11,
                letterSpacing: '1.5px',
                textTransform: 'uppercase',
                fontWeight: 600,
                color: '#94a3b8',
                margin: 0,
                marginBottom: 4,
              }}
            >
              Shipment
            </p>
            <p
              style={{
                fontFamily: 'monospace',
                fontSize: 22,
                fontWeight: 700,
                color: '#fff',
                letterSpacing: '1.5px',
                margin: 0,
              }}
            >
              {shipment.tracking_number}
            </p>
          </div>
        </div>
        <span
          style={{
            display: 'inline-block',
            padding: '6px 14px',
            backgroundColor: 'rgba(192, 57, 43, 0.2)',
            color: '#fff',
            borderRadius: 999,
            fontSize: 12.5,
            fontWeight: 700,
            letterSpacing: '0.3px',
          }}
        >
          {statusLabel}
        </span>
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: 0,
        }}
        className="shipment-card-grid"
      >
        <ShipmentInfoRow
          icon="fa-user"
          label="Customer"
          value={shipment.customer_name || '—'}
        />
        <ShipmentInfoRow
          icon="fa-location-dot"
          label="Origin"
          value={originParts.join(', ') || '—'}
        />
        <ShipmentInfoRow
          icon="fa-flag-checkered"
          label="Destination"
          value={destParts.join(', ') || '—'}
        />
        <ShipmentInfoRow
          icon="fa-truck"
          label="Current"
          value={currentParts.join(', ') || '—'}
        />
      </div>

      <style jsx>{`
        @media (max-width: 900px) {
          .shipment-card-grid {
            grid-template-columns: repeat(2, 1fr) !important;
          }
        }
        @media (max-width: 500px) {
          .shipment-card-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
}

function ShipmentInfoRow({ icon, label, value }) {
  return (
    <div
      style={{
        padding: '18px 22px',
        borderRight: `1px solid ${COLORS.border}`,
        borderBottom: `1px solid ${COLORS.border}`,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
        <i
          className={`fa-solid ${icon}`}
          style={{ color: COLORS.red, fontSize: 12 }}
        />
        <p
          style={{
            margin: 0,
            fontSize: 11,
            fontWeight: 700,
            letterSpacing: '0.5px',
            textTransform: 'uppercase',
            color: COLORS.muted,
          }}
        >
          {label}
        </p>
      </div>
      <p
        style={{
          margin: 0,
          fontSize: 14,
          fontWeight: 600,
          color: COLORS.navy,
          lineHeight: 1.35,
          wordBreak: 'break-word',
        }}
      >
        {value}
      </p>
    </div>
  );
}

function AlertBox({ type, message }) {
  const isError = type === 'error';
  return (
    <div
      style={{
        backgroundColor: isError ? '#fee2e2' : '#dcfce7',
        border: `1px solid ${isError ? '#fecaca' : '#bbf7d0'}`,
        borderRadius: 8,
        padding: '14px 16px',
        marginBottom: 20,
        display: 'flex',
        alignItems: 'flex-start',
        gap: 12,
      }}
    >
      <i
        className={`fa-solid ${
          isError ? 'fa-exclamation-circle' : 'fa-check-circle'
        }`}
        style={{
          color: isError ? COLORS.red : '#16a34a',
          fontSize: 18,
          marginTop: 2,
        }}
      />
      <p
        style={{
          margin: 0,
          fontSize: 14,
          color: isError ? '#991b1b' : '#166534',
          lineHeight: 1.5,
          fontWeight: 500,
        }}
      >
        {message}
      </p>
    </div>
  );
}

function SectionCard({ icon, title, subtitle, children }) {
  return (
    <section
      style={{
        backgroundColor: '#fff',
        border: `1px solid ${COLORS.border}`,
        borderRadius: 8,
        marginBottom: 20,
        overflow: 'hidden',
      }}
    >
      <div
        style={{
          padding: '16px 20px',
          borderBottom: `1px solid ${COLORS.border}`,
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          backgroundColor: COLORS.gray,
        }}
      >
        <div
          style={{
            width: 32,
            height: 32,
            borderRadius: 6,
            backgroundColor: COLORS.navy,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}
        >
          <i
            className={`fa-solid ${icon}`}
            style={{ color: '#fff', fontSize: 13 }}
          />
        </div>
        <div>
          <h3
            style={{
              fontSize: 15,
              fontWeight: 700,
              color: COLORS.navy,
              margin: 0,
              marginBottom: 2,
            }}
          >
            {title}
          </h3>
          {subtitle && (
            <p
              style={{
                fontSize: 12.5,
                color: COLORS.muted,
                margin: 0,
              }}
            >
              {subtitle}
            </p>
          )}
        </div>
      </div>
      <div style={{ padding: '20px' }}>{children}</div>
    </section>
  );
}

function Grid({ cols, children }) {
  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: `repeat(${cols}, 1fr)`,
        gap: 16,
      }}
    >
      {children}
    </div>
  );
}

function Field({ label, required, error, input }) {
  return (
    <div>
      <label
        style={{
          display: 'block',
          fontSize: 12.5,
          fontWeight: 600,
          color: COLORS.text,
          marginBottom: 6,
        }}
      >
        {label}
        {required && (
          <span style={{ color: COLORS.red, marginLeft: 4 }}>*</span>
        )}
      </label>
      {input}
      {error && (
        <p
          style={{
            fontSize: 11.5,
            color: COLORS.red,
            margin: 0,
            marginTop: 4,
            fontWeight: 500,
          }}
        >
          {error}
        </p>
      )}
    </div>
  );
}

function TextInput({ value, onChange, placeholder, type = 'text', step }) {
  const sharedStyle = {
    width: '100%',
    padding: '10px 12px',
    fontSize: 14,
    border: `1px solid ${COLORS.border}`,
    borderRadius: 6,
    backgroundColor: '#fff',
    color: COLORS.text,
    outline: 'none',
    transition: 'border-color 0.15s, box-shadow 0.15s',
    boxSizing: 'border-box',
  };

  const props = {
    value,
    onChange: (e) => onChange(e.target.value),
    placeholder,
    type,
    style: sharedStyle,
    onFocus: (e) => {
      e.currentTarget.style.borderColor = COLORS.red;
      e.currentTarget.style.boxShadow = `0 0 0 3px rgba(192, 57, 43, 0.12)`;
    },
    onBlur: (e) => {
      e.currentTarget.style.borderColor = COLORS.border;
      e.currentTarget.style.boxShadow = 'none';
    },
  };

  if (type === 'number' && step) props.step = step;

  return <input {...props} />;
}

function Textarea({ value, onChange, placeholder, rows = 3 }) {
  const sharedStyle = {
    width: '100%',
    padding: '10px 12px',
    fontSize: 14,
    border: `1px solid ${COLORS.border}`,
    borderRadius: 6,
    backgroundColor: '#fff',
    color: COLORS.text,
    outline: 'none',
    transition: 'border-color 0.15s, box-shadow 0.15s',
    boxSizing: 'border-box',
    resize: 'vertical',
    fontFamily: 'inherit',
    lineHeight: 1.5,
  };

  return (
    <textarea
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      rows={rows}
      style={sharedStyle}
      onFocus={(e) => {
        e.currentTarget.style.borderColor = COLORS.red;
        e.currentTarget.style.boxShadow = `0 0 0 3px rgba(192, 57, 43, 0.12)`;
      }}
      onBlur={(e) => {
        e.currentTarget.style.borderColor = COLORS.border;
        e.currentTarget.style.boxShadow = 'none';
      }}
    />
  );
}

function Select({
  value,
  onChange,
  options,
  placeholder,
  valueMap,
  labelMap,
}) {
  const currentLabel = labelMap ? labelMap[value] || value : value;

  return (
    <select
      value={currentLabel}
      onChange={(e) => {
        const label = e.target.value;
        if (!label) return onChange('');
        const code = valueMap ? valueMap[label] : label;
        onChange(code);
      }}
      style={{
        width: '100%',
        padding: '10px 12px',
        fontSize: 14,
        border: `1px solid ${COLORS.border}`,
        borderRadius: 6,
        backgroundColor: '#fff',
        color: COLORS.text,
        outline: 'none',
        transition: 'border-color 0.15s, box-shadow 0.15s',
        boxSizing: 'border-box',
        cursor: 'pointer',
        appearance: 'none',
        backgroundImage:
          "url(\"data:image/svg+xml;charset=utf-8,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 20 20' fill='%2364748b'%3E%3Cpath fill-rule='evenodd' d='M5.23 7.21a.75.75 0 011.06.02L10 11.06l3.71-3.83a.75.75 0 111.08 1.04l-4.24 4.38a.75.75 0 01-1.08 0L5.21 8.27a.75.75 0 01.02-1.06z' clip-rule='evenodd'/%3E%3C/svg%3E\")",
        backgroundRepeat: 'no-repeat',
        backgroundPosition: 'right 10px center',
        backgroundSize: '16px',
        paddingRight: 36,
      }}
      onFocus={(e) => {
        e.currentTarget.style.borderColor = COLORS.red;
        e.currentTarget.style.boxShadow = `0 0 0 3px rgba(192, 57, 43, 0.12)`;
      }}
      onBlur={(e) => {
        e.currentTarget.style.borderColor = COLORS.border;
        e.currentTarget.style.boxShadow = 'none';
      }}
    >
      {placeholder && (
        <option value="">{placeholder}</option>
      )}
      {options.map((opt) => (
        <option key={opt} value={opt}>
          {opt}
        </option>
      ))}
    </select>
  );
}

function NotFoundState() {
  return (
    <div
      style={{
        backgroundColor: '#fff',
        border: `1px solid ${COLORS.border}`,
        borderRadius: 8,
        padding: '56px 24px',
        textAlign: 'center',
      }}
    >
      <i
        className="fa-solid fa-magnifying-glass"
        style={{ fontSize: 44, color: '#cbd5e1', marginBottom: 16 }}
      />
      <h3
        style={{
          fontSize: 18,
          fontWeight: 700,
          color: COLORS.navy,
          marginBottom: 8,
        }}
      >
        Shipment not found
      </h3>
      <p style={{ fontSize: 14, color: COLORS.muted, marginBottom: 24 }}>
        The shipment you&apos;re looking for does not exist or has been removed.
      </p>
      <Link
        href="/admin/shipments"
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 8,
          padding: '10px 20px',
          backgroundColor: COLORS.red,
          color: '#fff',
          fontWeight: 600,
          fontSize: 14,
          textDecoration: 'none',
          borderRadius: 6,
        }}
      >
        <i className="fa-solid fa-arrow-left" />
        Back to Shipments
      </Link>
    </div>
  );
}

export async function getServerSideProps({ req, res, params }) {
  const authResult = await requireAdminAuth(req, res);

  if (!authResult.isAdmin) {
    return {
      redirect: {
        destination: authResult.redirectTo || '/signin',
        permanent: false,
      },
    };
  }

  const { id } = params;
  let shipment = null;

  try {
    const supabase = createSupabaseServerClient(req, res);

    const { data: shipmentRow, error: sError } = await supabase
      .from('shipments')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (sError) {
      console.error('[AddTrackingEvent] Server shipment error:', sError.message);
    }

    shipment = shipmentRow || null;
  } catch (err) {
    console.error('[AddTrackingEvent] Server unexpected error:', err?.message ?? err);
    shipment = null;
  }

  return {
    props: {
      shipment,
      profile: authResult.profile,
    },
  };
}
