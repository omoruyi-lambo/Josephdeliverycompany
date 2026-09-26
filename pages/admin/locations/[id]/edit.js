import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useState, useEffect } from 'react';
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

const COUNTRY_OPTIONS = [
  'United States',
  'Brazil',
  'Japan',
  'India',
  'South Korea',
  'France',
];

const OFFICE_TYPES = [
  'Regional Office',
  'Headquarters',
  'Distribution Center',
  'Cargo Terminal',
  'Warehouse',
  'Logistics Hub',
  'Freight Center',
];

function buildFormFromLocation(loc) {
  if (!loc) {
    return {
      country: '',
      countryCode: '',
      region: '',
      city: '',
      officeName: '',
      officeType: 'Regional Office',
      address: '',
      phone: '',
      email: '',
      openingHours: '',
      latitude: '',
      longitude: '',
      imageUrl: '',
      imageAlt: '',
      description: '',
      isActive: true,
    };
  }
  return {
    country: loc.country || '',
    countryCode: loc.country_code || '',
    region: loc.region || '',
    city: loc.city || '',
    officeName: loc.office_name || '',
    officeType: loc.office_type || 'Regional Office',
    address: loc.address || '',
    phone: loc.phone || '',
    email: loc.email || '',
    openingHours: loc.opening_hours || '',
    latitude: loc.latitude ?? '',
    longitude: loc.longitude ?? '',
    imageUrl: loc.image_url || '',
    imageAlt: loc.image_alt || '',
    description: loc.description || '',
    isActive: typeof loc.is_active === 'boolean' ? loc.is_active : true,
  };
}

export default function EditLocationPage({ initialLocation, notFound, profile }) {
  const router = useRouter();
  const { id } = router.query;
  const [form, setForm] = useState(buildFormFromLocation(initialLocation));
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);
  const [result, setResult] = useState(null);
  const [imagePreviewError, setImagePreviewError] = useState(false);
  const [loading, setLoading] = useState(!initialLocation && !notFound);

  useEffect(() => {
    if (!id || initialLocation || notFound) return;

    let cancelled = false;
    async function fetchLocation() {
      try {
        const res = await fetch(`/api/admin/locations/${id}`, {
          method: 'GET',
          credentials: 'same-origin',
        });
        const data = await res.json().catch(() => ({}));
        if (cancelled) return;
        if (res.ok && data.ok && data.location) {
          setForm(buildFormFromLocation(data.location));
        } else if (res.status === 404) {
          // not found handled elsewhere
        }
      } catch (err) {
        console.error('[EditLocation] Fetch error:', err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    fetchLocation();
    return () => {
      cancelled = true;
    };
  }, [id, initialLocation, notFound]);

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
    if (key === 'imageUrl') setImagePreviewError(false);
  }

  function validate() {
    const e = {};

    if (!form.country || !String(form.country).trim()) {
      e.country = 'Country is required.';
    }

    if (!form.imageUrl || !String(form.imageUrl).trim()) {
      e.imageUrl = 'Image URL is required.';
    }

    if (form.latitude !== undefined && form.latitude !== null && form.latitude !== '') {
      const n = parseFloat(String(form.latitude));
      if (!Number.isFinite(n)) {
        e.latitude = 'Latitude must be a valid number.';
      } else if (n < -90 || n > 90) {
        e.latitude = 'Latitude must be between -90 and 90.';
      }
    }

    if (form.longitude !== undefined && form.longitude !== null && form.longitude !== '') {
      const n = parseFloat(String(form.longitude));
      if (!Number.isFinite(n)) {
        e.longitude = 'Longitude must be a valid number.';
      } else if (n < -180 || n > 180) {
        e.longitude = 'Longitude must be between -180 and 180.';
      }
    }

    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!validate()) return;
    if (!id) return;

    setSubmitting(true);
    setSubmitError(null);

    try {
      const res = await fetch(`/api/admin/locations/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'same-origin',
        body: JSON.stringify(form),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        const msg =
          (data.errors && data.errors.length && data.errors.join(' ')) ||
          data.error ||
          `Request failed (${res.status}).`;
        throw new Error(msg);
      }

      setResult({
        id: data.location?.id || id,
        country: form.country,
        city: form.city,
      });
    } catch (err) {
      console.error('[EditLocation] Submit error:', err);
      setSubmitError(err.message || 'Failed to update location.');
    } finally {
      setSubmitting(false);
    }
  }

  if (notFound) {
    return (
      <>
        <Head>
          <title>Location Not Found — Josephdeliverycompany Admin</title>
          <meta name="viewport" content="width=device-width, initial-scale=1" />
          <link rel="icon" href="/favicon.ico" />
        </Head>
        <AdminLayout title="Edit Location" profile={profile}>
          <div
            style={{
              padding: '64px 24px',
              textAlign: 'center',
              backgroundColor: '#fff',
              border: `1px solid ${COLORS.border}`,
              borderRadius: 10,
            }}
          >
            <i
              className="fa-solid fa-location-slash"
              style={{ fontSize: 44, color: '#cbd5e1', marginBottom: 16, display: 'block' }}
            />
            <h2 style={{ fontSize: 20, fontWeight: 700, color: COLORS.navy, marginBottom: 8 }}>
              Location not found
            </h2>
            <p style={{ fontSize: 14, color: COLORS.muted, marginBottom: 24 }}>
              The location you are trying to edit does not exist or has been removed.
            </p>
            <Link
              href="/admin/locations"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
                padding: '11px 20px',
                backgroundColor: COLORS.red,
                color: '#fff',
                fontWeight: 600,
                fontSize: 14,
                textDecoration: 'none',
                borderRadius: 6,
              }}
            >
              <i className="fa-solid fa-arrow-left" />
              Back to Locations
            </Link>
          </div>
        </AdminLayout>
      </>
    );
  }

  return (
    <>
      <Head>
        <title>Edit Location — Josephdeliverycompany Admin</title>
        <meta
          name="description"
          content="Edit a Josephdeliverycompany location."
        />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <AdminLayout title="Edit Location" profile={profile}>
        {loading ? (
          <div style={{ padding: '80px 24px', textAlign: 'center', color: COLORS.muted }}>
            <i className="fa-solid fa-circle-notch fa-spin" style={{ fontSize: 32, marginBottom: 16, display: 'block', color: COLORS.red }} />
            <p style={{ fontSize: 14 }}>Loading location...</p>
          </div>
        ) : result ? (
          <SuccessState result={result} />
        ) : (
          <form onSubmit={handleSubmit} noValidate>
            {submitError && <AlertBox type="error" message={submitError} />}

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr 340px',
                gap: 20,
                alignItems: 'start',
              }}
              className="location-form-grid"
            >
              <div>
                <SectionCard
                  icon="fa-globe"
                  title="Location Information"
                  subtitle="Country, city, and office details"
                >
                  <Grid cols={2}>
                    <Field
                      label="Country"
                      required
                      error={errors.country}
                      input={
                        <Select
                          value={form.country}
                          onChange={(v) => updateField('country', v)}
                          options={COUNTRY_OPTIONS}
                          placeholder="Select country"
                          allowCustom
                        />
                      }
                    />
                    <Field
                      label="Country Code"
                      hint="Auto-filled if left blank"
                      input={
                        <TextInput
                          value={form.countryCode}
                          onChange={(v) => updateField('countryCode', v)}
                          placeholder="e.g. USA, BRA"
                          maxLength={5}
                        />
                      }
                    />
                    <Field
                      label="Region"
                      hint="Auto-filled based on country"
                      input={
                        <TextInput
                          value={form.region}
                          onChange={(v) => updateField('region', v)}
                          placeholder="Americas, Asia-Pacific, Europe..."
                        />
                      }
                    />
                    <Field
                      label="City"
                      input={
                        <TextInput
                          value={form.city}
                          onChange={(v) => updateField('city', v)}
                          placeholder="e.g. New York, São Paulo"
                        />
                      }
                    />
                    <Field
                      label="Office Name"
                      input={
                        <TextInput
                          value={form.officeName}
                          onChange={(v) => updateField('officeName', v)}
                          placeholder="Official office name when available"
                        />
                      }
                    />
                    <Field
                      label="Office Type"
                      input={
                        <Select
                          value={form.officeType}
                          onChange={(v) => updateField('officeType', v)}
                          options={OFFICE_TYPES}
                          placeholder="Select type"
                          allowCustom
                        />
                      }
                    />
                  </Grid>
                </SectionCard>

                <SectionCard
                  icon="fa-location-dot"
                  title="Contact Details"
                  subtitle="Address, phone, email, and hours"
                >
                  <Grid cols={2}>
                    <Field
                      label="Address"
                      hint="Only verified addresses should be entered"
                      input={
                        <TextInput
                          value={form.address}
                          onChange={(v) => updateField('address', v)}
                          placeholder="Street address when confirmed"
                        />
                      }
                    />
                    <Field
                      label="Opening Hours"
                      input={
                        <TextInput
                          value={form.openingHours}
                          onChange={(v) => updateField('openingHours', v)}
                          placeholder="e.g. Mon–Fri: 8:00–18:00"
                        />
                      }
                    />
                    <Field
                      label="Phone"
                      hint="Only verified phone numbers should be entered"
                      input={
                        <TextInput
                          value={form.phone}
                          onChange={(v) => updateField('phone', v)}
                          placeholder="Verified contact phone"
                          type="tel"
                        />
                      }
                    />
                    <Field
                      label="Email"
                      hint="Only verified emails should be entered"
                      input={
                        <TextInput
                          value={form.email}
                          onChange={(v) => updateField('email', v)}
                          placeholder="Verified contact email"
                          type="email"
                        />
                      }
                    />
                  </Grid>
                </SectionCard>

                <SectionCard
                  icon="fa-map-pin"
                  title="Geographic Coordinates"
                  subtitle="Latitude and longitude for map placement"
                >
                  <Grid cols={2}>
                    <Field
                      label="Latitude"
                      error={errors.latitude}
                      hint="-90 to 90 (leave blank if unknown)"
                      input={
                        <TextInput
                          value={form.latitude}
                          onChange={(v) => updateField('latitude', v)}
                          placeholder="e.g. 40.7128"
                          type="number"
                          step="any"
                        />
                      }
                    />
                    <Field
                      label="Longitude"
                      error={errors.longitude}
                      hint="-180 to 180 (leave blank if unknown)"
                      input={
                        <TextInput
                          value={form.longitude}
                          onChange={(v) => updateField('longitude', v)}
                          placeholder="e.g. -74.0060"
                          type="number"
                          step="any"
                        />
                      }
                    />
                  </Grid>
                </SectionCard>

                <SectionCard
                  icon="fa-align-left"
                  title="Description"
                  subtitle="Public description for the location card"
                >
                  <Field
                    label="Description"
                    input={
                      <TextArea
                        value={form.description}
                        onChange={(v) => updateField('description', v)}
                        placeholder="Short description shown on the public locations page…"
                        rows={4}
                      />
                    }
                  />
                </SectionCard>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                <SectionCard
                  icon="fa-image"
                  title="Location Image"
                  subtitle="Professional logistics photography"
                >
                  <Field
                    label="Image URL"
                    required
                    error={errors.imageUrl}
                    input={
                      <TextInput
                        value={form.imageUrl}
                        onChange={(v) => updateField('imageUrl', v)}
                        placeholder="https://…/photo.jpg"
                      />
                    }
                  />
                  {form.imageUrl && !imagePreviewError ? (
                    <div style={{ marginTop: 14 }}>
                      <div
                        style={{
                          position: 'relative',
                          width: '100%',
                          aspectRatio: '16/10',
                          borderRadius: 8,
                          overflow: 'hidden',
                          backgroundColor: COLORS.navy,
                          border: `1px solid ${COLORS.border}`,
                        }}
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={form.imageUrl}
                          alt="Preview"
                          style={{
                            width: '100%',
                            height: '100%',
                            objectFit: 'cover',
                            display: 'block',
                          }}
                          onError={() => setImagePreviewError(true)}
                        />
                      </div>
                      <p style={{ fontSize: 11, color: COLORS.muted, marginTop: 8, lineHeight: 1.5 }}>
                        Use a real photographic image of a logistics facility, cargo terminal, or warehouse.
                      </p>
                    </div>
                  ) : imagePreviewError ? (
                    <div
                      style={{
                        marginTop: 14,
                        border: `1px dashed ${COLORS.border}`,
                        borderRadius: 8,
                        padding: '28px 16px',
                        textAlign: 'center',
                        backgroundColor: COLORS.gray,
                      }}
                    >
                      <i
                        className="fa-solid fa-triangle-exclamation"
                        style={{ fontSize: 22, color: COLORS.red, marginBottom: 8, display: 'block' }}
                      />
                      <p style={{ fontSize: 12, color: COLORS.muted, margin: 0 }}>
                        Unable to preview image. Verify the URL.
                      </p>
                    </div>
                  ) : null}
                  <div style={{ marginTop: 14 }}>
                    <Field
                      label="Image Alt Text"
                      input={
                        <TextInput
                          value={form.imageAlt}
                          onChange={(v) => updateField('imageAlt', v)}
                          placeholder="Brief description of the image"
                        />
                      }
                    />
                  </div>
                </SectionCard>

                <SectionCard
                  icon="fa-toggle-on"
                  title="Status"
                  subtitle="Control visibility on the public site"
                >
                  <label
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 12,
                      cursor: 'pointer',
                      padding: '8px 4px',
                    }}
                  >
                    <div
                      style={{
                        position: 'relative',
                        width: 44,
                        height: 24,
                        borderRadius: 999,
                        backgroundColor: form.isActive ? COLORS.red : COLORS.muted,
                        transition: 'background-color 0.15s',
                        flexShrink: 0,
                      }}
                    >
                      <div
                        style={{
                          position: 'absolute',
                          top: 3,
                          left: form.isActive ? 23 : 3,
                          width: 18,
                          height: 18,
                          borderRadius: '50%',
                          backgroundColor: '#fff',
                          boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
                          transition: 'left 0.15s',
                        }}
                      />
                      <input
                        type="checkbox"
                        checked={form.isActive}
                        onChange={(e) => updateField('isActive', e.target.checked)}
                        style={{
                          position: 'absolute',
                          inset: 0,
                          opacity: 0,
                          cursor: 'pointer',
                          margin: 0,
                        }}
                      />
                    </div>
                    <div>
                      <p style={{ fontSize: 14, fontWeight: 600, color: COLORS.text, margin: 0 }}>
                        {form.isActive ? 'Active' : 'Inactive'}
                      </p>
                      <p style={{ fontSize: 11.5, color: COLORS.muted, margin: 0, marginTop: 2 }}>
                        {form.isActive
                          ? 'Visible on the public /locations page'
                          : 'Hidden from public view'}
                      </p>
                    </div>
                  </label>
                </SectionCard>
              </div>
            </div>

            <div
              style={{
                display: 'flex',
                justifyContent: 'flex-end',
                gap: 12,
                marginTop: 24,
              }}
            >
              <Link
                href="/admin/locations"
                style={cancelBtn}
              >
                <i className="fa-solid fa-arrow-left" />
                Cancel
              </Link>
              <button
                type="submit"
                disabled={submitting}
                style={submitBtn(submitting)}
              >
                <i
                  className={`fa-solid ${
                    submitting ? 'fa-sync-alt fa-spin' : 'fa-save'
                  }`}
                />
                {submitting ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </form>
        )}
      </AdminLayout>

      <style jsx global>{`
        @media (max-width: 900px) {
          .location-form-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </>
  );
}

/* ─── Shared UI Helpers ─────────────────────────────────────────────── */

const cancelBtn = {
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
};

const submitBtn = (submitting) => ({
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
});

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
      className="location-inner-grid"
    >
      {children}
      <style jsx global>{`
        @media (max-width: 640px) {
          .location-inner-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
}

function Field({ label, required, error, hint, input }) {
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
      {hint && (
        <p style={{ fontSize: 11, color: COLORS.muted, margin: 0, marginTop: 4 }}>
          {hint}
        </p>
      )}
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

function TextInput({ value, onChange, placeholder, type = 'text', step, maxLength }) {
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
    fontFamily: 'inherit',
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
  if (maxLength) props.maxLength = maxLength;

  return <input {...props} />;
}

function TextArea({ value, onChange, placeholder, rows = 4 }) {
  return (
    <textarea
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      rows={rows}
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
        fontFamily: 'inherit',
        resize: 'vertical',
        minHeight: 100,
      }}
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

function Select({ value, onChange, options, placeholder, allowCustom = false }) {
  const [customOpen, setCustomOpen] = useState(
    allowCustom && value && !options.includes(value),
  );
  const [customValue, setCustomValue] = useState(
    value && !options.includes(value) ? value : '',
  );

  const currentValue = customOpen ? customValue : value;

  return (
    <div>
      {!customOpen ? (
        <select
          value={options.includes(value) ? value : ''}
          onChange={(e) => {
            const label = e.target.value;
            if (label === '__custom__' && allowCustom) {
              setCustomOpen(true);
              onChange(value);
              return;
            }
            onChange(label);
          }}
          style={{
            width: '100%',
            padding: '10px 36px 10px 12px',
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
          {placeholder && <option value="">{placeholder}</option>}
          {options.map((opt) => (
            <option key={opt} value={opt}>
              {opt}
            </option>
          ))}
          {allowCustom && (
            <option value="__custom__">✏️ Enter custom value...</option>
          )}
        </select>
      ) : (
        <div style={{ display: 'flex', gap: 6 }}>
          <input
            type="text"
            value={customValue}
            onChange={(e) => {
              setCustomValue(e.target.value);
              onChange(e.target.value);
            }}
            placeholder="Enter custom value..."
            style={{
              flex: 1,
              padding: '10px 12px',
              fontSize: 14,
              border: `1px solid ${COLORS.border}`,
              borderRadius: 6,
              backgroundColor: '#fff',
              color: COLORS.text,
              outline: 'none',
              transition: 'border-color 0.15s, box-shadow 0.15s',
              boxSizing: 'border-box',
            }}
            onFocus={(e) => {
              e.currentTarget.style.borderColor = COLORS.red;
              e.currentTarget.style.boxShadow = `0 0 0 3px rgba(192, 57, 43, 0.12)`;
            }}
            onBlur={(e) => {
              e.currentTarget.style.borderColor = COLORS.border;
              e.currentTarget.style.boxShadow = 'none';
            }}
          />
          <button
            type="button"
            onClick={() => {
              setCustomOpen(false);
              setCustomValue('');
              if (options[0]) onChange(options[0]);
            }}
            style={{
              padding: '0 10px',
              fontSize: 12,
              color: COLORS.muted,
              backgroundColor: COLORS.gray,
              border: `1px solid ${COLORS.border}`,
              borderRadius: 6,
              cursor: 'pointer',
              flexShrink: 0,
            }}
          >
            <i className="fa-solid fa-xmark" />
          </button>
        </div>
      )}
    </div>
  );
}

/* ─── Success State (post-edit) ────────────────────────────────────── */

function SuccessState({ result }) {
  return (
    <div
      style={{
        backgroundColor: '#fff',
        border: `1px solid ${COLORS.border}`,
        borderRadius: 10,
        overflow: 'hidden',
      }}
    >
      <div
        style={{
          backgroundColor: COLORS.navy,
          padding: '40px 32px',
          textAlign: 'center',
        }}
      >
        <div
          style={{
            width: 64,
            height: 64,
            borderRadius: '50%',
            backgroundColor: 'rgba(34, 197, 94, 0.15)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 16px',
          }}
        >
          <i
            className="fa-solid fa-check"
            style={{ fontSize: 28, color: '#22c55e' }}
          />
        </div>
        <h2
          style={{
            fontSize: 20,
            fontWeight: 700,
            color: '#fff',
            margin: 0,
            marginBottom: 6,
          }}
        >
          Location Updated Successfully
        </h2>
        <p
          style={{
            fontSize: 14,
            color: '#94a3b8',
            margin: 0,
          }}
        >
          {result.country}
          {result.city ? ` — ${result.city}` : ''}
        </p>
      </div>

      <div style={{ padding: '40px 32px', textAlign: 'center' }}>
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: 12,
            justifyContent: 'center',
          }}
        >
          <Link
            href="/locations"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              padding: '12px 22px',
              backgroundColor: COLORS.red,
              color: '#fff',
              borderRadius: 6,
              fontSize: 14,
              fontWeight: 600,
              textDecoration: 'none',
              cursor: 'pointer',
              border: 'none',
            }}
          >
            <i className="fa-solid fa-eye" />
            VIEW PUBLIC LOCATIONS
          </Link>
          <Link
            href="/admin/locations"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              padding: '12px 22px',
              backgroundColor: COLORS.navy,
              color: '#fff',
              borderRadius: 6,
              fontSize: 14,
              fontWeight: 600,
              textDecoration: 'none',
              cursor: 'pointer',
              border: 'none',
            }}
          >
            <i className="fa-solid fa-list" />
            Manage All Locations
          </Link>
        </div>
      </div>
    </div>
  );
}

/* ─── getServerSideProps ─────────────────────────────────────────────── */

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

  const id = params?.id;
  if (!id) {
    return {
      props: {
        initialLocation: null,
        notFound: true,
        profile: authResult.profile,
      },
    };
  }

  const sb = createSupabaseServerClient(req, res);

  try {
    const { data, error } = await sb
      .from('locations')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (error) {
      console.error('[EditLocation] Server query error:', error.message);
      return {
        props: {
          initialLocation: null,
          notFound: false,
          profile: authResult.profile,
        },
      };
    }

    if (!data) {
      return {
        props: {
          initialLocation: null,
          notFound: true,
          profile: authResult.profile,
        },
      };
    }

    return {
      props: {
        initialLocation: data,
        notFound: false,
        profile: authResult.profile,
      },
    };
  } catch (err) {
    console.error('[EditLocation] Server data error:', err?.message ?? err);
    return {
      props: {
        initialLocation: null,
        notFound: false,
        profile: authResult.profile,
      },
    };
  }
}
