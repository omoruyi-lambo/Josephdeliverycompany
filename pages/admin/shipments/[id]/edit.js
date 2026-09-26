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

const SHIPMENT_TYPES = ['Standard', 'Express', 'International', 'Domestic', 'Freight'];
const SERVICE_OPTIONS = ['Standard Delivery', 'Express Delivery', 'Priority', 'Economy', 'Premium'];
const PACKAGE_TYPES = ['Box', 'Envelope', 'Pallet', 'Crate', 'Bag', 'Custom'];

function buildInitialState(shipment) {
  const today = new Date().toISOString().slice(0, 10);
  return {
    customerName: shipment?.customer_name ?? '',
    customerEmail: shipment?.customer_email ?? '',
    customerPhone: shipment?.customer_phone ?? '',
    originCountry: shipment?.origin_country ?? '',
    originCity: shipment?.origin_city ?? '',
    originAddress: shipment?.origin_address ?? '',
    originLat: shipment?.origin_lat ?? '',
    originLng: shipment?.origin_lng ?? '',
    destinationCountry: shipment?.destination_country ?? '',
    destinationCity: shipment?.destination_city ?? '',
    destinationAddress: shipment?.destination_address ?? '',
    destinationLat: shipment?.destination_lat ?? '',
    destinationLng: shipment?.destination_lng ?? '',
    shipmentType: shipment?.shipment_type ?? '',
    service: shipment?.service ?? '',
    packageType: shipment?.package_type ?? '',
    shipmentDate: shipment?.shipment_date ? shipment.shipment_date.slice(0, 10) : today,
    estimatedDelivery: shipment?.estimated_delivery ? shipment.estimated_delivery.slice(0, 10) : '',
    currentCountry: shipment?.current_country ?? '',
    currentCity: shipment?.current_city ?? '',
    currentAddress: shipment?.current_address ?? '',
    currentLat: shipment?.current_lat ?? '',
    currentLng: shipment?.current_lng ?? '',
    statusCode: shipment?.status_code ?? 'BOOKED',
  };
}

export default function EditShipmentPage({ shipment, profile }) {
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

    const requiredStrings = [
      ['customerName', 'Customer name is required.'],
      ['originCountry', 'Origin country is required.'],
      ['originCity', 'Origin city is required.'],
      ['destinationCountry', 'Destination country is required.'],
      ['destinationCity', 'Destination city is required.'],
      ['shipmentType', 'Shipment type is required.'],
      ['service', 'Service is required.'],
    ];

    for (const [key, msg] of requiredStrings) {
      if (!form[key] || !String(form[key]).trim()) e[key] = msg;
    }

    const coordFields = [
      ['originLat', 'Origin latitude'],
      ['originLng', 'Origin longitude'],
      ['destinationLat', 'Destination latitude'],
      ['destinationLng', 'Destination longitude'],
      ['currentLat', 'Current latitude'],
      ['currentLng', 'Current longitude'],
    ];

    for (const [key, label] of coordFields) {
      const raw = form[key];
      if (raw === undefined || raw === null || raw === '') continue;
      const n = parseFloat(String(raw));
      if (!Number.isFinite(n)) {
        e[key] = `${label} must be a valid number.`;
      } else if (key.endsWith('Lat') && (n < -90 || n > 90)) {
        e[key] = `${label} must be between -90 and 90.`;
      } else if (key.endsWith('Lng') && (n < -180 || n > 180)) {
        e[key] = `${label} must be between -180 and 180.`;
      }
    }

    if (form.shipmentDate) {
      const d = new Date(form.shipmentDate);
      if (!Number.isFinite(d.getTime())) {
        e.shipmentDate = 'Shipment date must be a valid date.';
      }
    }
    if (form.estimatedDelivery) {
      const d = new Date(form.estimatedDelivery);
      if (!Number.isFinite(d.getTime())) {
        e.estimatedDelivery = 'Estimated delivery date must be a valid date.';
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

    try {
      const res = await fetch(`/api/admin/shipments/${id}`, {
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

      router.push(`/admin/shipments/${id}`);
    } catch (err) {
      console.error('[EditShipment] Submit error:', err);
      setSubmitError(err.message || 'Failed to update shipment.');
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
        <title>Edit Shipment — {shipment.tracking_number} | Josephdeliverycompany Admin</title>
        <meta
          name="description"
          content={`Edit shipment ${shipment.tracking_number} in the Josephdeliverycompany admin portal.`}
        />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <AdminLayout
        title={`Edit Shipment · ${shipment.tracking_number}`}
        profile={profile}
      >
        <form onSubmit={handleSubmit} noValidate>
          {submitError && (
            <AlertBox type="error" message={submitError} />
          )}

          <TrackingNumberCard trackingNumber={shipment.tracking_number} />

          <SectionCard
            icon="fa-clipboard-check"
            title="Shipment Status"
            subtitle="Current status of the shipment"
          >
            <Grid cols={1}>
              <Field
                label="Status"
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
            </Grid>
          </SectionCard>

          <SectionCard
            icon="fa-user"
            title="Customer Information"
            subtitle="Contact details for the shipment owner"
          >
            <Grid cols={3}>
              <Field
                label="Customer Name"
                required
                error={errors.customerName}
                input={
                  <TextInput
                    value={form.customerName}
                    onChange={(v) => updateField('customerName', v)}
                    placeholder="Full name"
                  />
                }
              />
              <Field
                label="Email"
                error={errors.customerEmail}
                input={
                  <TextInput
                    value={form.customerEmail}
                    onChange={(v) => updateField('customerEmail', v)}
                    placeholder="customer@example.com"
                    type="email"
                  />
                }
              />
              <Field
                label="Phone"
                error={errors.customerPhone}
                input={
                  <TextInput
                    value={form.customerPhone}
                    onChange={(v) => updateField('customerPhone', v)}
                    placeholder="+234 800 000 0000"
                  />
                }
              />
            </Grid>
          </SectionCard>

          <SectionCard
            icon="fa-location-dot"
            title="Origin"
            subtitle="Where the shipment starts"
          >
            <Grid cols={3}>
              <Field
                label="Country"
                required
                error={errors.originCountry}
                input={
                  <TextInput
                    value={form.originCountry}
                    onChange={(v) => updateField('originCountry', v)}
                    placeholder="e.g. Nigeria"
                  />
                }
              />
              <Field
                label="City"
                required
                error={errors.originCity}
                input={
                  <TextInput
                    value={form.originCity}
                    onChange={(v) => updateField('originCity', v)}
                    placeholder="e.g. Lagos"
                  />
                }
              />
              <Field
                label="Address"
                error={errors.originAddress}
                input={
                  <TextInput
                    value={form.originAddress}
                    onChange={(v) => updateField('originAddress', v)}
                    placeholder="Street address"
                  />
                }
              />
              <Field
                label="Latitude"
                error={errors.originLat}
                input={
                  <TextInput
                    value={form.originLat}
                    onChange={(v) => updateField('originLat', v)}
                    placeholder="6.5244"
                    type="number"
                    step="any"
                  />
                }
              />
              <Field
                label="Longitude"
                error={errors.originLng}
                input={
                  <TextInput
                    value={form.originLng}
                    onChange={(v) => updateField('originLng', v)}
                    placeholder="3.3792"
                    type="number"
                    step="any"
                  />
                }
              />
            </Grid>
          </SectionCard>

          <SectionCard
            icon="fa-flag-checkered"
            title="Destination"
            subtitle="Where the shipment ends"
          >
            <Grid cols={3}>
              <Field
                label="Country"
                required
                error={errors.destinationCountry}
                input={
                  <TextInput
                    value={form.destinationCountry}
                    onChange={(v) => updateField('destinationCountry', v)}
                    placeholder="e.g. United Kingdom"
                  />
                }
              />
              <Field
                label="City"
                required
                error={errors.destinationCity}
                input={
                  <TextInput
                    value={form.destinationCity}
                    onChange={(v) => updateField('destinationCity', v)}
                    placeholder="e.g. London"
                  />
                }
              />
              <Field
                label="Address"
                error={errors.destinationAddress}
                input={
                  <TextInput
                    value={form.destinationAddress}
                    onChange={(v) => updateField('destinationAddress', v)}
                    placeholder="Street address"
                  />
                }
              />
              <Field
                label="Latitude"
                error={errors.destinationLat}
                input={
                  <TextInput
                    value={form.destinationLat}
                    onChange={(v) => updateField('destinationLat', v)}
                    placeholder="51.5074"
                    type="number"
                    step="any"
                  />
                }
              />
              <Field
                label="Longitude"
                error={errors.destinationLng}
                input={
                  <TextInput
                    value={form.destinationLng}
                    onChange={(v) => updateField('destinationLng', v)}
                    placeholder="-0.1278"
                    type="number"
                    step="any"
                  />
                }
              />
            </Grid>
          </SectionCard>

          <SectionCard
            icon="fa-box"
            title="Shipment Information"
            subtitle="Type, service, package, and dates"
          >
            <Grid cols={3}>
              <Field
                label="Shipment Type"
                required
                error={errors.shipmentType}
                input={
                  <Select
                    value={form.shipmentType}
                    onChange={(v) => updateField('shipmentType', v)}
                    options={SHIPMENT_TYPES}
                    placeholder="Select type"
                  />
                }
              />
              <Field
                label="Service"
                required
                error={errors.service}
                input={
                  <Select
                    value={form.service}
                    onChange={(v) => updateField('service', v)}
                    options={SERVICE_OPTIONS}
                    placeholder="Select service"
                  />
                }
              />
              <Field
                label="Package Type"
                error={errors.packageType}
                input={
                  <Select
                    value={form.packageType}
                    onChange={(v) => updateField('packageType', v)}
                    options={PACKAGE_TYPES}
                    placeholder="Select package"
                  />
                }
              />
              <Field
                label="Shipment Date"
                error={errors.shipmentDate}
                input={
                  <TextInput
                    value={form.shipmentDate}
                    onChange={(v) => updateField('shipmentDate', v)}
                    type="date"
                  />
                }
              />
              <Field
                label="Estimated Delivery"
                error={errors.estimatedDelivery}
                input={
                  <TextInput
                    value={form.estimatedDelivery}
                    onChange={(v) => updateField('estimatedDelivery', v)}
                    type="date"
                  />
                }
              />
            </Grid>
          </SectionCard>

          <SectionCard
            icon="fa-truck"
            title="Current Location"
            subtitle="Where the shipment is right now"
          >
            <Grid cols={3}>
              <Field
                label="Country"
                error={errors.currentCountry}
                input={
                  <TextInput
                    value={form.currentCountry}
                    onChange={(v) => updateField('currentCountry', v)}
                    placeholder="Defaults to origin"
                  />
                }
              />
              <Field
                label="City"
                error={errors.currentCity}
                input={
                  <TextInput
                    value={form.currentCity}
                    onChange={(v) => updateField('currentCity', v)}
                    placeholder="Defaults to origin"
                  />
                }
              />
              <Field
                label="Address"
                error={errors.currentAddress}
                input={
                  <TextInput
                    value={form.currentAddress}
                    onChange={(v) => updateField('currentAddress', v)}
                    placeholder="Current address"
                  />
                }
              />
              <Field
                label="Latitude"
                error={errors.currentLat}
                input={
                  <TextInput
                    value={form.currentLat}
                    onChange={(v) => updateField('currentLat', v)}
                    placeholder="Defaults to origin"
                    type="number"
                    step="any"
                  />
                }
              />
              <Field
                label="Longitude"
                error={errors.currentLng}
                input={
                  <TextInput
                    value={form.currentLng}
                    onChange={(v) => updateField('currentLng', v)}
                    placeholder="Defaults to origin"
                    type="number"
                    step="any"
                  />
                }
              />
            </Grid>
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
              Cancel
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
                  submitting ? 'fa-sync-alt fa-spin' : 'fa-save'
                }`}
              />
              {submitting ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </AdminLayout>
    </>
  );
}

function TrackingNumberCard({ trackingNumber }) {
  return (
    <div
      style={{
        backgroundColor: COLORS.navy,
        borderRadius: 8,
        padding: '20px 24px',
        marginBottom: 20,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 16,
        flexWrap: 'wrap',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
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
            className="fa-solid fa-barcode"
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
            Tracking Number (Read-Only)
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
            {trackingNumber}
          </p>
        </div>
      </div>
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
      console.error('[EditShipment] Server shipment error:', sError.message);
    }

    shipment = shipmentRow || null;
  } catch (err) {
    console.error('[EditShipment] Server unexpected error:', err?.message ?? err);
    shipment = null;
  }

  return {
    props: {
      shipment,
      profile: authResult.profile,
    },
  };
}
