import Head from 'next/head';
import { useState } from 'react';
import { createSupabaseServerClient } from '../../lib/supabase/server';
import { requireAdminAuth } from '../../lib/adminAuth';
import AdminLayout from '../../components/AdminLayout';
import { supabase } from '../../lib/supabase/client';

const COLORS = {
  navy: '#0a1f3c',
  navyDark: '#061529',
  red: '#c0392b',
  redHover: '#a93226',
  gray: '#f4f5f7',
  border: '#e2e6ea',
  text: '#1a1a2e',
  muted: '#64748b',
  green: '#22c55e',
  yellow: '#f59e0b',
  blue: '#3b82f6',
};

const STATUS_CODE_TO_LABEL = {
  BOOKED: 'Booked',
  COLLECTED: 'Collected',
  IN_TRANSIT: 'In Transit',
  OUT_FOR_DELIVERY: 'Out for Delivery',
  DELIVERED: 'Delivered',
  FAILED_DELIVERY: 'Failed Delivery',
  RETURNED: 'Returned',
  ON_HOLD: 'On Hold',
};

const STATUS_BADGE_STYLES = {
  'Booked':          { bg: '#f3f4f6', text: '#374151' },
  'Collected':       { bg: '#e0e7ff', text: '#3730a3' },
  'In Transit':      { bg: '#dbeafe', text: '#1e40af' },
  'Out for Delivery':{ bg: '#d1fae5', text: '#065f46' },
  'Delivered':       { bg: '#d1fae5', text: '#065f46' },
  'Failed Delivery': { bg: '#fee2e2', text: '#991b1b' },
  'Returned':        { bg: '#f3f4f6', text: '#374151' },
  'On Hold':         { bg: '#fef3c7', text: '#92400e' },
  'Pending':         { bg: '#f3f4f6', text: '#374151' },
  'Cancelled':       { bg: '#fee2e2', text: '#991b1b' },
};

function normalizeStatus(row) {
  if (row.status_code && STATUS_CODE_TO_LABEL[row.status_code]) {
    return STATUS_CODE_TO_LABEL[row.status_code];
  }
  if (row.status) return row.status;
  return 'Pending';
}

function calculateStats(shipments) {
  const stats = {
    total: 0,
    inTransit: 0,
    onHold: 0,
    outForDelivery: 0,
    delivered: 0,
  };
  shipments.forEach((s) => {
    stats.total += 1;
    const label = normalizeStatus(s);
    if (label === 'In Transit') stats.inTransit += 1;
    else if (label === 'On Hold') stats.onHold += 1;
    else if (label === 'Out for Delivery') stats.outForDelivery += 1;
    else if (label === 'Delivered') stats.delivered += 1;
  });
  return stats;
}

function calculateQuoteStats(quoteRequests) {
  const stats = {
    total: 0,
    new: 0,
  };
  quoteRequests.forEach((q) => {
    stats.total += 1;
    if (q.status === 'NEW') stats.new += 1;
  });
  return stats;
}

function calculateMessageStats(contactMessages) {
  const stats = {
    total: 0,
    new: 0,
  };
  contactMessages.forEach((m) => {
    stats.total += 1;
    if (m.status === 'NEW') stats.new += 1;
  });
  return stats;
}

function calculateLocationStats(locations) {
  const stats = {
    total: 0,
    active: 0,
  };
  locations.forEach((l) => {
    stats.total += 1;
    if (l.is_active) stats.active += 1;
  });
  return stats;
}

export default function AdminDashboard({ initialStats, initialQuoteStats, initialMessageStats, initialLocationStats, initialShipments, profile }) {
  const [stats, setStats] = useState(initialStats);
  const [quoteStats, setQuoteStats] = useState(initialQuoteStats);
  const [messageStats, setMessageStats] = useState(initialMessageStats);
  const [locationStats, setLocationStats] = useState(initialLocationStats);
  const [shipments, setShipments] = useState(initialShipments);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  async function refreshData() {
    setLoading(true);
    setError(null);
    try {
      const [statsRes, quoteStatsRes, messageStatsRes, locationRes, shipmentsRes] = await Promise.all([
        supabase.from('shipments').select('status, status_code'),
        supabase.from('quote_requests').select('status'),
        supabase.from('contact_messages').select('status'),
        supabase.from('locations').select('is_active'),
        supabase
          .from('shipments')
          .select(
            'id, tracking_number, customer_name, origin, destination, current_location, status, status_code, updated_at',
          )
          .order('updated_at', { ascending: false })
          .limit(10),
      ]);
      if (statsRes.error) throw statsRes.error;
      if (quoteStatsRes.error) throw quoteStatsRes.error;
      if (messageStatsRes.error) throw messageStatsRes.error;
      if (locationRes.error) throw locationRes.error;
      if (shipmentsRes.error) throw shipmentsRes.error;

      const rows = (shipmentsRes.data || []).map((r) => ({
        ...r,
        _displayStatus: normalizeStatus(r),
      }));

      setStats(calculateStats(statsRes.data || []));
      setQuoteStats(calculateQuoteStats(quoteStatsRes.data || []));
      setMessageStats(calculateMessageStats(messageStatsRes.data || []));
      setLocationStats(calculateLocationStats(locationRes.data || []));
      setShipments(rows);
    } catch (err) {
      console.error('[Dashboard] Client refresh error:', err);
      setError('Unable to load dashboard data. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <Head>
        <title>Admin Dashboard — Josephdeliverycompany</title>
        <meta
          name="description"
          content="Admin dashboard for Josephdeliverycompany logistics operations."
        />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <AdminLayout title="Dashboard" profile={profile}>
        {error && (
          <div
            style={{
              backgroundColor: '#fee2e2',
              border: '1px solid #fecaca',
              borderRadius: 8,
              padding: '16px',
              marginBottom: 24,
              display: 'flex',
              alignItems: 'center',
              gap: 12,
            }}
          >
            <i
              className="fa-solid fa-exclamation-circle"
              style={{ color: '#c0392b', fontSize: 20 }}
            />
            <div style={{ flex: 1 }}>
              <p
                style={{
                  color: '#c0392b',
                  fontWeight: 600,
                  margin: 0,
                  marginBottom: 4,
                }}
              >
                Error loading data
              </p>
              <p style={{ color: '#991b1b', fontSize: 13, margin: 0 }}>{error}</p>
            </div>
            <button
              onClick={refreshData}
              style={{
                padding: '8px 16px',
                backgroundColor: '#c0392b',
                color: '#fff',
                border: 'none',
                borderRadius: 6,
                fontSize: 13,
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              Retry
            </button>
          </div>
        )}

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: 16,
            marginBottom: 32,
          }}
        >
          <StatCard label="Total Shipments" value={stats.total} icon="fa-box" color={COLORS.navy} />
          <StatCard
            label="In Transit"
            value={stats.inTransit}
            icon="fa-truck"
            color={COLORS.blue}
          />
          <StatCard
            label="On Hold"
            value={stats.onHold}
            icon="fa-pause-circle"
            color={COLORS.yellow}
          />
          <StatCard
            label="Out for Delivery"
            value={stats.outForDelivery}
            icon="fa-shipping-fast"
            color={COLORS.green}
          />
          <StatCard
            label="Delivered"
            value={stats.delivered}
            icon="fa-check-circle"
            color={COLORS.green}
          />
          <ClickableStatCard
            label="New Quote Requests"
            value={quoteStats.new}
            icon="fa-file-invoice"
            color={COLORS.red}
            href="/admin/quotes"
          />
          <ClickableStatCard
            label="New Messages"
            value={messageStats.new}
            icon="fa-envelope"
            color={COLORS.blue}
            href="/admin/messages"
          />
          <ClickableStatCard
            label="Active Locations"
            value={locationStats.active}
            icon="fa-map-location-dot"
            color={COLORS.navy}
            href="/admin/locations"
          />
        </div>

        <section style={{ marginBottom: 32 }}>
          <h2
            style={{
              fontSize: 18,
              fontWeight: 700,
              color: COLORS.navy,
              marginBottom: 16,
            }}
          >
            Quick Actions
          </h2>
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            <QuickActionButton href="/admin/shipments/new" icon="fa-plus" label="Create Shipment" />
            <QuickActionButton href="/admin/shipments" icon="fa-box" label="View Shipments" />
            <QuickActionButton href="/admin/locations" icon="fa-map-location-dot" label="Manage Locations" />
            <QuickActionButton href="/admin/quotes" icon="fa-file-invoice" label="Quote Requests" />
            <QuickActionButton href="/admin/messages" icon="fa-envelope" label="Messages" />
          </div>
        </section>

        <section>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: 16,
              gap: 12,
              flexWrap: 'wrap',
            }}
          >
            <h2
              style={{
                fontSize: 18,
                fontWeight: 700,
                color: COLORS.navy,
                margin: 0,
              }}
            >
              Recent Shipments
            </h2>
            <button
              onClick={refreshData}
              disabled={loading}
              style={{
                padding: '8px 16px',
                backgroundColor: '#fff',
                border: `1px solid ${COLORS.border}`,
                borderRadius: 6,
                fontSize: 13,
                fontWeight: 500,
                color: COLORS.text,
                cursor: loading ? 'not-allowed' : 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
              }}
            >
              <i className={`fa-solid fa-sync-alt ${loading ? 'fa-spin' : ''}`} />
              {loading ? 'Refreshing...' : 'Refresh'}
            </button>
          </div>

          {shipments.length === 0 ? (
            <EmptyState />
          ) : (
            <div
              style={{
                backgroundColor: '#fff',
                border: `1px solid ${COLORS.border}`,
                borderRadius: 8,
                overflow: 'hidden',
              }}
            >
              <div style={{ overflowX: 'auto' }}>
                <table
                  style={{
                    width: '100%',
                    borderCollapse: 'collapse',
                    minWidth: 820,
                  }}
                >
                  <thead>
                    <tr
                      style={{
                        backgroundColor: COLORS.gray,
                        borderBottom: `1px solid ${COLORS.border}`,
                      }}
                    >
                      <Th>Tracking Number</Th>
                      <Th>Customer</Th>
                      <Th>Origin</Th>
                      <Th>Destination</Th>
                      <Th>Current Location</Th>
                      <Th>Status</Th>
                      <Th>Updated</Th>
                    </tr>
                  </thead>
                  <tbody>
                    {shipments.map((s) => (
                      <tr
                        key={s.id}
                        style={{
                          borderBottom: `1px solid ${COLORS.border}`,
                        }}
                      >
                        <Td
                          style={{
                            fontSize: 13,
                            fontWeight: 600,
                            color: COLORS.navy,
                          }}
                        >
                          {s.tracking_number}
                        </Td>
                        <Td>{s.customer_name || '—'}</Td>
                        <Td>{s.origin || '—'}</Td>
                        <Td>{s.destination || '—'}</Td>
                        <Td>{s.current_location || '—'}</Td>
                        <Td>
                          <StatusBadge status={s._displayStatus || normalizeStatus(s)} />
                        </Td>
                        <Td style={{ fontSize: 12, color: COLORS.muted }}>
                          {formatDate(s.updated_at)}
                        </Td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </section>
      </AdminLayout>
    </>
  );
}

function Th({ children }) {
  return (
    <th
      style={{
        padding: '12px 16px',
        textAlign: 'left',
        fontSize: 12,
        fontWeight: 700,
        color: COLORS.muted,
        textTransform: 'uppercase',
        letterSpacing: '0.5px',
        whiteSpace: 'nowrap',
      }}
    >
      {children}
    </th>
  );
}

function Td({ children, style }) {
  return (
    <td
      style={{
        padding: '12px 16px',
        fontSize: 13,
        color: COLORS.text,
        verticalAlign: 'middle',
        whiteSpace: 'nowrap',
        ...(style || {}),
      }}
    >
      {children}
    </td>
  );
}

function StatCard({ label, value, icon, color }) {
  return (
    <div
      style={{
        backgroundColor: '#fff',
        border: `1px solid ${COLORS.border}`,
        borderRadius: 6,
        padding: '20px',
        display: 'flex',
        alignItems: 'center',
        gap: 16,
      }}
    >
      <div
        style={{
          width: 44,
          height: 44,
          borderRadius: 6,
          backgroundColor: `${color}12`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
        }}
      >
        <i className={`fa-solid ${icon}`} style={{ fontSize: 18, color }} />
      </div>
      <div style={{ minWidth: 0 }}>
        <p style={{ fontSize: 12, color: COLORS.muted, margin: 0, marginBottom: 4 }}>
          {label}
        </p>
        <p
          style={{
            fontSize: 26,
            fontWeight: 700,
            color: COLORS.navy,
            margin: 0,
            fontVariantNumeric: 'tabular-nums',
          }}
        >
          {value}
        </p>
      </div>
    </div>
  );
}

function ClickableStatCard({ label, value, icon, color, href }) {
  return (
    <a
      href={href}
      style={{
        backgroundColor: '#fff',
        border: `1px solid ${COLORS.border}`,
        borderRadius: 6,
        padding: '20px',
        display: 'flex',
        alignItems: 'center',
        gap: 16,
        textDecoration: 'none',
        transition: 'border-color 0.15s, background-color 0.15s',
      }}
      onMouseOver={(e) => {
        e.currentTarget.style.borderColor = COLORS.red;
        e.currentTarget.style.backgroundColor = '#fff5f4';
      }}
      onMouseOut={(e) => {
        e.currentTarget.style.borderColor = COLORS.border;
        e.currentTarget.style.backgroundColor = '#fff';
      }}
    >
      <div
        style={{
          width: 44,
          height: 44,
          borderRadius: 6,
          backgroundColor: `${color}12`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
        }}
      >
        <i className={`fa-solid ${icon}`} style={{ fontSize: 18, color }} />
      </div>
      <div style={{ minWidth: 0 }}>
        <p style={{ fontSize: 12, color: COLORS.muted, margin: 0, marginBottom: 4 }}>
          {label}
        </p>
        <p
          style={{
            fontSize: 26,
            fontWeight: 700,
            color: COLORS.navy,
            margin: 0,
            fontVariantNumeric: 'tabular-nums',
          }}
        >
          {value}
        </p>
      </div>
    </a>
  );
}

function QuickActionButton({ href, icon, label }) {
  return (
    <a
      href={href}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 8,
        padding: '10px 16px',
        backgroundColor: '#fff',
        border: `1px solid ${COLORS.border}`,
        borderRadius: 6,
        fontSize: 14,
        fontWeight: 600,
        color: COLORS.text,
        textDecoration: 'none',
        transition: 'border-color 0.15s, background-color 0.15s',
      }}
      onMouseOver={(e) => {
        e.currentTarget.style.borderColor = COLORS.red;
        e.currentTarget.style.backgroundColor = '#fff5f4';
      }}
      onMouseOut={(e) => {
        e.currentTarget.style.borderColor = COLORS.border;
        e.currentTarget.style.backgroundColor = '#fff';
      }}
    >
      <i className={`fa-solid ${icon}`} style={{ color: COLORS.red }} />
      {label}
    </a>
  );
}

function StatusBadge({ status }) {
  const style = STATUS_BADGE_STYLES[status] || STATUS_BADGE_STYLES['Pending'];
  return (
    <span
      style={{
        display: 'inline-block',
        padding: '4px 10px',
        backgroundColor: style.bg,
        color: style.text,
        borderRadius: 999,
        fontSize: 12,
        fontWeight: 600,
        lineHeight: 1.2,
      }}
    >
      {status}
    </span>
  );
}

function EmptyState() {
  return (
    <div
      style={{
        backgroundColor: '#fff',
        border: `1px solid ${COLORS.border}`,
        borderRadius: 8,
        padding: '48px 24px',
        textAlign: 'center',
      }}
    >
      <i
        className="fa-solid fa-box-open"
        style={{ fontSize: 44, color: '#cbd5e1', marginBottom: 16 }}
      />
      <h3 style={{ fontSize: 18, fontWeight: 700, color: COLORS.navy, marginBottom: 8 }}>
        No shipments yet
      </h3>
      <p style={{ fontSize: 14, color: COLORS.muted, marginBottom: 24 }}>
        No shipments have been created yet.
      </p>
      <a
        href="/admin/shipments/new"
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
        onMouseOver={(e) => (e.currentTarget.style.backgroundColor = COLORS.redHover)}
        onMouseOut={(e) => (e.currentTarget.style.backgroundColor = COLORS.red)}
      >
        <i className="fa-solid fa-plus" />
        Create Shipment
      </a>
    </div>
  );
}

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

export async function getServerSideProps({ req, res }) {
  const authResult = await requireAdminAuth(req, res);

  if (!authResult.isAdmin) {
    return {
      redirect: {
        destination: authResult.redirectTo || '/signin',
        permanent: false,
      },
    };
  }

  const supabase = createSupabaseServerClient(req, res);

  try {
    const [statsRes, quoteStatsRes, messageStatsRes, shipmentsRes, locationsRes] = await Promise.all([
      supabase.from('shipments').select('status, status_code'),
      supabase.from('quote_requests').select('status'),
      supabase.from('contact_messages').select('status'),
      supabase
        .from('shipments')
        .select(
          'id, tracking_number, customer_name, origin, destination, current_location, status, status_code, updated_at',
        )
        .order('updated_at', { ascending: false })
        .limit(10),
      supabase.from('locations').select('is_active'),
    ]);

    if (statsRes.error) {
      console.error('[Admin Dashboard] Stats query error:', statsRes.error);
      throw statsRes.error;
    }
    if (quoteStatsRes.error) {
      console.error('[Admin Dashboard] Quote stats query error:', quoteStatsRes.error);
      throw quoteStatsRes.error;
    }
    if (messageStatsRes.error) {
      console.error('[Admin Dashboard] Message stats query error:', messageStatsRes.error);
      throw messageStatsRes.error;
    }
    if (shipmentsRes.error) {
      console.error('[Admin Dashboard] Shipments query error:', shipmentsRes.error);
      throw shipmentsRes.error;
    }
    if (locationsRes.error) {
      console.error('[Admin Dashboard] Locations query error:', locationsRes.error);
      throw locationsRes.error;
    }

    const stats = calculateStats(statsRes.data || []);
    const quoteStats = calculateQuoteStats(quoteStatsRes.data || []);
    const messageStats = calculateMessageStats(messageStatsRes.data || []);
    const locationStats = calculateLocationStats(locationsRes.data || []);
    const rows = (shipmentsRes.data || []).map((r) => ({
      ...r,
      _displayStatus: normalizeStatus(r),
    }));

    return {
      props: {
        initialStats: stats,
        initialQuoteStats: quoteStats,
        initialMessageStats: messageStats,
        initialLocationStats: locationStats,
        initialShipments: rows,
        profile: authResult.profile,
      },
    };
  } catch (err) {
    console.error('[Admin Dashboard] Server data error:', err.message || err);
    return {
      props: {
        initialStats: {
          total: 0,
          inTransit: 0,
          onHold: 0,
          outForDelivery: 0,
          delivered: 0,
        },
        initialQuoteStats: {
          total: 0,
          new: 0,
        },
        initialMessageStats: {
          total: 0,
          new: 0,
        },
        initialLocationStats: {
          total: 0,
          active: 0,
        },
        initialShipments: [],
        profile: authResult.profile,
      },
    };
  }
}
