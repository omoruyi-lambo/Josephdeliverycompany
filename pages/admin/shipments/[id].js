import Head from 'next/head';
import Link from 'next/link';
import { createSupabaseServerClient } from '../../../lib/supabase/server';
import { requireAdminAuth } from '../../../lib/adminAuth';
import AdminLayout from '../../../components/AdminLayout';
import ShipmentMap from '../../../components/ShipmentMap';
import ShipmentSummary from '../../../components/ShipmentSummary';
import TrackingTimeline from '../../../components/TrackingTimeline';
import { getShipmentById } from '../../../lib/trackingData';

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

const STATUS_BADGE_STYLES = {
  'Booked':          { bg: '#f3f4f6', text: '#374151' },
  'Picked Up':       { bg: '#e0e7ff', text: '#3730a3' },
  'In Transit':      { bg: '#dbeafe', text: '#1e40af' },
  'Arrived':         { bg: '#d1fae5', text: '#065f46' },
  'Out for Delivery':{ bg: '#d1fae5', text: '#065f46' },
  'Delivered':       { bg: '#d1fae5', text: '#065f46' },
  'Collected':       { bg: '#e0f2fe', text: '#0369a1' },
  'Failed Delivery': { bg: '#fee2e2', text: '#991b1b' },
  'Returned':        { bg: '#f3f4f6', text: '#374151' },
  'On Hold':         { bg: '#fef3c7', text: '#92400e' },
};

function formatDate(dateString) {
  if (!dateString) return '—';
  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) return '—';
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

function StatusBadge({ status }) {
  const style = STATUS_BADGE_STYLES[status] || STATUS_BADGE_STYLES['Booked'];
  return (
    <span
      style={{
        display: 'inline-block',
        padding: '5px 12px',
        backgroundColor: style.bg,
        color: style.text,
        borderRadius: 999,
        fontSize: 12,
        fontWeight: 700,
        lineHeight: 1.2,
        letterSpacing: '0.3px',
      }}
    >
      {status}
    </span>
  );
}

export default function ShipmentDetailPage({ shipment, profile }) {
  if (!shipment) {
    return (
      <AdminLayout title="Shipment Not Found" profile={profile}>
        <NotFoundState />
      </AdminLayout>
    );
  }

  const statusLabel =
    STATUS_CODE_TO_LABEL[shipment.statusCode] || shipment.status || 'Unknown';

  return (
    <>
      <Head>
        <title>
          {shipment.trackingNumber} — Shipment | Josephdeliverycompany Admin
        </title>
        <meta
          name="description"
          content={`Shipment details for ${shipment.trackingNumber}.`}
        />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <AdminLayout
        title={`Shipment · ${shipment.trackingNumber}`}
        profile={profile}
      >
        <div style={{ marginBottom: 20 }}>
          <BreadcrumbBar trackingNumber={shipment.trackingNumber} />
        </div>

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 12,
            flexWrap: 'wrap',
            marginBottom: 20,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 14, flexWrap: 'wrap' }}>
            <StatusBadge status={statusLabel} />
            <p style={{ fontSize: 13, color: COLORS.muted, margin: 0 }}>
              Updated {formatDate(shipment.updatedAt)}
            </p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
            <a
              href={`/track?tracking=${encodeURIComponent(shipment.trackingNumber)}`}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
                padding: '10px 16px',
                backgroundColor: '#fff',
                border: `1px solid ${COLORS.border}`,
                borderRadius: 6,
                fontSize: 13.5,
                fontWeight: 600,
                color: COLORS.text,
                textDecoration: 'none',
                cursor: 'pointer',
              }}
            >
              <i className="fa-solid fa-arrow-up-right-from-square" />
              View Public Tracking
            </a>
            <Link
              href={`/admin/shipments/${shipment.id}/events`}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
                padding: '10px 16px',
                backgroundColor: '#fff',
                border: `1px solid ${COLORS.border}`,
                borderRadius: 6,
                fontSize: 13.5,
                fontWeight: 600,
                color: COLORS.text,
                cursor: 'pointer',
                textDecoration: 'none',
              }}
            >
              <i className="fa-solid fa-calendar-plus" />
              Add Tracking Event
            </Link>
            <Link
              href={`/admin/shipments/${shipment.id}/edit`}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
                padding: '10px 16px',
                backgroundColor: COLORS.navy,
                border: 'none',
                borderRadius: 6,
                fontSize: 13.5,
                fontWeight: 600,
                color: '#fff',
                cursor: 'pointer',
                textDecoration: 'none',
              }}
            >
              <i className="fa-solid fa-pen" />
              Edit Shipment
            </Link>
          </div>
        </div>

        <ShipmentMap
          mapData={shipment.map}
          statusCode={shipment.statusCode}
        />

        <ShipmentSummary shipment={shipment} />

        <div
          className="detail-grid"
          style={{
            display: 'grid',
            gridTemplateColumns: '1.4fr 1fr',
            gap: 24,
            alignItems: 'start',
          }}
        >
          <TrackingTimeline steps={shipment.timeline} />
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            <InfoCard
              icon="fa-box"
              title="Shipment Overview"
              rows={[
                { label: 'Tracking #', value: shipment.trackingNumber, mono: true },
                { label: 'Shipment Type', value: shipment.shipmentType || '—' },
                { label: 'Service', value: shipment.service || '—' },
                { label: 'Package Type', value: shipment.packageType || '—' },
                { label: 'Shipment Date', value: formatDate(shipment.shipmentDate) },
                { label: 'Est. Delivery', value: formatDate(shipment.estimatedDelivery) },
              ]}
            />
            <InfoCard
              icon="fa-user"
              title="Customer"
              rows={[
                { label: 'Name', value: shipment.customer?.name || '—' },
                {
                  label: 'Email',
                  value: shipment.customer?.email || '—',
                  copy: !!shipment.customer?.email,
                },
                {
                  label: 'Phone',
                  value: shipment.customer?.phone || '—',
                  copy: !!shipment.customer?.phone,
                },
              ]}
            />
          </div>
        </div>

        <div
          className="locations-grid"
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: 20,
            marginTop: 4,
          }}
        >
          <LocationCard
            icon="fa-location-dot"
            color="#16a34a"
            title="Origin"
            city={shipment.originCity}
            country={shipment.originCountry}
            address={shipment.originAddress}
            lat={shipment.map?.originCoords?.lat}
            lng={shipment.map?.originCoords?.lng}
          />
          <LocationCard
            icon="fa-truck"
            color="#0a1f3c"
            title="Current Location"
            city={shipment.currentCity}
            country={shipment.currentCountry}
            address={shipment.currentAddress}
            lat={shipment.map?.currentCoords?.lat}
            lng={shipment.map?.currentCoords?.lng}
          />
          <LocationCard
            icon="fa-flag-checkered"
            color="#c0392b"
            title="Destination"
            city={shipment.destinationCity}
            country={shipment.destinationCountry}
            address={shipment.destinationAddress}
            lat={shipment.map?.destinationCoords?.lat}
            lng={shipment.map?.destinationCoords?.lng}
          />
        </div>

        <style jsx>{`
          @media (max-width: 960px) {
            .detail-grid {
              grid-template-columns: 1fr !important;
            }
          }
          @media (max-width: 768px) {
            .locations-grid {
              grid-template-columns: 1fr !important;
            }
          }
        `}</style>
      </AdminLayout>
    </>
  );
}

/* ─── Page-level components ─────────────────────────────────────────── */

function BreadcrumbBar({ trackingNumber }) {
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
      <span
        style={{
          fontFamily: 'monospace',
          color: COLORS.navy,
          fontWeight: 600,
        }}
      >
        {trackingNumber}
      </span>
    </div>
  );
}

function InfoCard({ icon, title, rows }) {
  return (
    <div
      style={{
        backgroundColor: '#fff',
        border: `1px solid ${COLORS.border}`,
        borderRadius: 8,
        overflow: 'hidden',
      }}
    >
      <div
        style={{
          padding: '14px 18px',
          borderBottom: `1px solid ${COLORS.border}`,
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          backgroundColor: COLORS.gray,
        }}
      >
        <div
          style={{
            width: 28,
            height: 28,
            borderRadius: 6,
            backgroundColor: COLORS.navy,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <i
            className={`fa-solid ${icon}`}
            style={{ color: '#fff', fontSize: 12 }}
          />
        </div>
        <h3
          style={{
            fontSize: 14,
            fontWeight: 700,
            color: COLORS.navy,
            margin: 0,
          }}
        >
          {title}
        </h3>
      </div>
      <div>
        {rows.map((row, idx) => (
          <div
            key={idx}
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'flex-start',
              gap: 16,
              padding: '12px 18px',
              borderBottom:
                idx === rows.length - 1 ? 'none' : `1px solid ${COLORS.border}`,
            }}
          >
            <p
              style={{
                margin: 0,
                fontSize: 12,
                fontWeight: 600,
                color: COLORS.muted,
                textTransform: 'uppercase',
                letterSpacing: '0.4px',
                flexShrink: 0,
                paddingTop: 2,
              }}
            >
              {row.label}
            </p>
            <p
              style={{
                margin: 0,
                fontSize: 13.5,
                color: COLORS.text,
                fontWeight: 500,
                textAlign: 'right',
                wordBreak: 'break-word',
                fontFamily: row.mono ? 'monospace' : 'inherit',
                letterSpacing: row.mono ? '0.3px' : '0',
              }}
            >
              {row.value}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

function LocationCard({ icon, color, title, city, country, address, lat, lng }) {
  return (
    <div
      style={{
        backgroundColor: '#fff',
        border: `1px solid ${COLORS.border}`,
        borderRadius: 8,
        overflow: 'hidden',
      }}
    >
      <div
        style={{
          padding: '14px 18px',
          borderBottom: `1px solid ${COLORS.border}`,
          display: 'flex',
          alignItems: 'center',
          gap: 10,
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
          }}
        >
          <i
            className={`fa-solid ${icon}`}
            style={{ color: '#fff', fontSize: 12 }}
          />
        </div>
        <h3
          style={{
            fontSize: 14,
            fontWeight: 700,
            color,
            margin: 0,
          }}
        >
          {title}
        </h3>
      </div>
      <div style={{ padding: '16px 18px' }}>
        {(city || country) && (
          <p
            style={{
              margin: 0,
              marginBottom: address || lat != null ? 10 : 0,
              fontSize: 15,
              fontWeight: 700,
              color: COLORS.navy,
              lineHeight: 1.3,
            }}
          >
            {[city, country].filter(Boolean).join(', ')}
          </p>
        )}
        {address && (
          <p
            style={{
              margin: 0,
              marginBottom: lat != null ? 10 : 0,
              fontSize: 13,
              color: COLORS.text,
              lineHeight: 1.5,
            }}
          >
            {address}
          </p>
        )}
        {lat != null && lng != null && (
          <p
            style={{
              margin: 0,
              fontSize: 11.5,
              color: COLORS.muted,
              fontFamily: 'monospace',
            }}
          >
            {Number(lat).toFixed(4)}, {Number(lng).toFixed(4)}
          </p>
        )}
        {!city && !country && !address && lat == null && (
          <p
            style={{
              margin: 0,
              fontSize: 13,
              color: COLORS.muted,
              fontStyle: 'italic',
            }}
          >
            No details available
          </p>
        )}
      </div>
    </div>
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
      console.error('[ShipmentDetail] Server shipment error:', sError.message);
    }

    if (!shipmentRow) {
      return {
        props: {
          shipment: null,
          profile: authResult.profile,
        },
      };
    }

    const { data: eventRows, error: eError } = await supabase
      .from('tracking_events')
      .select('id, status, description, location, event_date')
      .eq('shipment_id', shipmentRow.id)
      .order('event_date', { ascending: true, nullsFirst: false });

    if (eError) {
      console.error('[ShipmentDetail] Server events error:', eError.message);
    }

    shipment = transformShipment(shipmentRow, eventRows || []);
  } catch (err) {
    console.error('[ShipmentDetail] Server unexpected error:', err?.message ?? err);
    shipment = null;
  }

  if (!shipment) {
    try {
      shipment = await getShipmentById(id);
    } catch (fallbackErr) {
      console.error('[ShipmentDetail] Fallback getShipmentById error:', fallbackErr);
      shipment = null;
    }
  }

  return {
    props: {
      shipment,
      profile: authResult.profile,
    },
  };
}

/* ─── Inline transform (duplicates trackingData logic for SSR) ───────── */

function formatEventDate(isoString) {
  if (!isoString) return null;
  try {
    const d = new Date(isoString);
    const month = d.toLocaleString('en-US', { month: 'short', timeZone: 'UTC' });
    const day = d.toLocaleString('en-US', { day: '2-digit', timeZone: 'UTC' });
    const year = d.toLocaleString('en-US', { year: 'numeric', timeZone: 'UTC' });
    const time = d.toLocaleString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
      timeZone: 'UTC',
    });
    return `${month} ${day}, ${year} — ${time}`;
  } catch {
    return isoString;
  }
}

function deriveTimelineStatus(events) {
  let lastCompletedIndex = -1;
  for (let i = 0; i < events.length; i++) {
    if (events[i].event_date !== null && events[i].event_date !== undefined) {
      lastCompletedIndex = i;
    }
  }
  return events.map((event, index) => {
    if (event.event_date === null || event.event_date === undefined) {
      return 'upcoming';
    }
    if (index === lastCompletedIndex) {
      return 'current';
    }
    return 'completed';
  });
}

function transformShipment(row, events) {
  const statuses = deriveTimelineStatus(events);

  const timeline = events.map((event, index) => ({
    id: event.id,
    label: event.status,
    detail: event.description,
    location: event.location || null,
    status: statuses[index],
    date: formatEventDate(event.event_date),
  }));

  const originCountry = row.origin_country || '';
  const originCity = row.origin_city || '';
  const destinationCountry = row.destination_country || '';
  const destinationCity = row.destination_city || '';

  return {
    id: row.id,
    trackingNumber: row.tracking_number,
    status: row.status,
    statusCode: row.status_code,
    currentLocation: row.current_location,
    estimatedDelivery: row.estimated_delivery,
    shipmentType: row.shipment_type,
    service: row.service,
    origin:
      row.origin ||
      (originCity && originCountry ? `${originCity}, ${originCountry}` : ''),
    destination:
      row.destination ||
      (destinationCity && destinationCountry
        ? `${destinationCity}, ${destinationCountry}`
        : ''),
    shipmentDate: row.shipment_date,
    packageType: row.package_type,
    updatedAt: row.updated_at,
    createdAt: row.created_at,

    customer: {
      name: row.customer_name || null,
      email: row.customer_email || null,
      phone: row.customer_phone || null,
    },

    originCountry,
    originCity,
    originAddress: row.origin_address || '',

    destinationCountry,
    destinationCity,
    destinationAddress: row.destination_address || '',

    currentCountry: row.current_country || '',
    currentCity: row.current_city || '',
    currentAddress: row.current_address || '',

    map: {
      originCity,
      destinationCity,
      currentCity: row.current_city || '',
      originCoords: {
        lat: row.origin_lat != null ? parseFloat(row.origin_lat) : null,
        lng: row.origin_lng != null ? parseFloat(row.origin_lng) : null,
      },
      destinationCoords: {
        lat:
          row.destination_lat != null ? parseFloat(row.destination_lat) : null,
        lng:
          row.destination_lng != null ? parseFloat(row.destination_lng) : null,
      },
      currentCoords: {
        lat: row.current_lat != null ? parseFloat(row.current_lat) : null,
        lng: row.current_lng != null ? parseFloat(row.current_lng) : null,
      },
      currentPosition:
        row.current_position != null ? parseFloat(row.current_position) : 0.0,
    },

    timeline,
  };
}
