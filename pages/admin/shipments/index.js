import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useState, useEffect, useMemo } from 'react';
import { createSupabaseServerClient } from '../../../lib/supabase/server';
import { requireAdminAuth } from '../../../lib/adminAuth';
import AdminLayout from '../../../components/AdminLayout';
import { supabase } from '../../../lib/supabase/client';

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
  'Pending':         { bg: '#f3f4f6', text: '#374151' },
};

function normalizeStatus(row) {
  if (row.status_code && STATUS_CODE_TO_LABEL[row.status_code]) {
    return STATUS_CODE_TO_LABEL[row.status_code];
  }
  if (row.status) return row.status;
  return 'Pending';
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

function formatDateTime(dateString) {
  if (!dateString) return '—';
  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) return '—';
  return date.toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export default function ShipmentsListPage({ initialShipments, profile }) {
  const router = useRouter();
  const [shipments, setShipments] = useState(initialShipments);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  async function refreshShipments() {
    setLoading(true);
    setError(null);
    try {
      const { data, error: qError } = await supabase
        .from('shipments')
        .select(
          'id, tracking_number, customer_name, customer_email, origin, destination, current_location, origin_city, destination_city, status, status_code, estimated_delivery, updated_at, created_at',
        )
        .order('updated_at', { ascending: false });

      if (qError) throw qError;

      const rows = (data || []).map((r) => ({
        ...r,
        _displayStatus: normalizeStatus(r),
      }));

      setShipments(rows);
    } catch (err) {
      console.error('[ShipmentsList] Refresh error:', err);
      setError('Unable to load shipments. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  const filteredShipments = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return shipments.filter((s) => {
      if (statusFilter !== 'ALL' && s._displayStatus !== statusFilter) {
        return false;
      }
      if (!q) return true;
      return (
        (s.tracking_number && s.tracking_number.toLowerCase().includes(q)) ||
        (s.customer_name && s.customer_name.toLowerCase().includes(q)) ||
        (s.customer_email && s.customer_email.toLowerCase().includes(q))
      );
    });
  }, [shipments, searchQuery, statusFilter]);

  const stats = useMemo(() => {
    const s = {
      total: shipments.length,
      inTransit: 0,
      onHold: 0,
      outForDelivery: 0,
      delivered: 0,
    };
    shipments.forEach((row) => {
      const label = row._displayStatus;
      if (label === 'In Transit') s.inTransit += 1;
      else if (label === 'On Hold') s.onHold += 1;
      else if (label === 'Out for Delivery') s.outForDelivery += 1;
      else if (label === 'Delivered') s.delivered += 1;
    });
    return s;
  }, [shipments]);

  return (
    <>
      <Head>
        <title>Shipments — Josephdeliverycompany Admin</title>
        <meta
          name="description"
          content="Manage all Josephdeliverycompany shipments."
        />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <AdminLayout title="Shipments" profile={profile}>
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
                Error
              </p>
              <p style={{ color: '#991b1b', fontSize: 13, margin: 0 }}>
                {error}
              </p>
            </div>
            <button
              onClick={refreshShipments}
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
            gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
            gap: 16,
            marginBottom: 24,
          }}
        >
          <StatCard
            label="Total Shipments"
            value={stats.total}
            icon="fa-box"
            color={COLORS.navy}
          />
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
        </div>

        <div
          style={{
            backgroundColor: '#fff',
            border: `1px solid ${COLORS.border}`,
            borderRadius: 8,
            overflow: 'hidden',
            marginBottom: 20,
          }}
        >
          <div
            style={{
              padding: '16px 20px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 16,
              flexWrap: 'wrap',
              borderBottom: `1px solid ${COLORS.border}`,
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                flexWrap: 'wrap',
                flex: 1,
                minWidth: 0,
              }}
            >
              <div style={{ position: 'relative', flex: 1, minWidth: 220, maxWidth: 380 }}>
                <i
                  className="fa-solid fa-search"
                  style={{
                    position: 'absolute',
                    left: 12,
                    top: '50%',
                    transform: 'translateY(-50%)',
                    fontSize: 13,
                    color: COLORS.muted,
                  }}
                />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search tracking #, customer name, email..."
                  style={{
                    width: '100%',
                    padding: '10px 12px 10px 36px',
                    fontSize: 14,
                    border: `1px solid ${COLORS.border}`,
                    borderRadius: 6,
                    backgroundColor: '#fff',
                    color: COLORS.text,
                    outline: 'none',
                    boxSizing: 'border-box',
                  }}
                />
              </div>

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                style={{
                  padding: '10px 36px 10px 12px',
                  fontSize: 14,
                  border: `1px solid ${COLORS.border}`,
                  borderRadius: 6,
                  backgroundColor: '#fff',
                  color: COLORS.text,
                  outline: 'none',
                  cursor: 'pointer',
                  appearance: 'none',
                  backgroundImage:
                    "url(\"data:image/svg+xml;charset=utf-8,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 20 20' fill='%2364748b'%3E%3Cpath fill-rule='evenodd' d='M5.23 7.21a.75.75 0 011.06.02L10 11.06l3.71-3.83a.75.75 0 111.08 1.04l-4.24 4.38a.75.75 0 01-1.08 0L5.21 8.27a.75.75 0 01.02-1.06z' clip-rule='evenodd'/%3E%3C/svg%3E\")",
                  backgroundRepeat: 'no-repeat',
                  backgroundPosition: 'right 10px center',
                  backgroundSize: '16px',
                  minWidth: 180,
                }}
              >
                <option value="ALL">All Statuses</option>
                {Object.entries(STATUS_CODE_TO_LABEL).map(([code, label]) => (
                  <option key={code} value={label}>
                    {label}
                  </option>
                ))}
              </select>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <button
                onClick={refreshShipments}
                disabled={loading}
                style={{
                  padding: '9px 14px',
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
                <i
                  className={`fa-solid fa-sync-alt ${loading ? 'fa-spin' : ''}`}
                />
                {loading ? 'Refreshing...' : 'Refresh'}
              </button>
              <Link
                href="/admin/shipments/new"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 8,
                  padding: '10px 16px',
                  backgroundColor: COLORS.red,
                  color: '#fff',
                  fontWeight: 600,
                  fontSize: 14,
                  textDecoration: 'none',
                  borderRadius: 6,
                  border: 'none',
                  cursor: 'pointer',
                }}
              >
                <i className="fa-solid fa-plus" />
                New Shipment
              </Link>
            </div>
          </div>

          {filteredShipments.length === 0 ? (
            <EmptyState
              hasAny={shipments.length > 0}
              searchQuery={searchQuery}
              statusFilter={statusFilter}
              onClear={() => {
                setSearchQuery('');
                setStatusFilter('ALL');
              }}
            />
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table
                style={{
                  width: '100%',
                  borderCollapse: 'collapse',
                  minWidth: 960,
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
                    <Th>Est. Delivery</Th>
                    <Th>Updated</Th>
                  </tr>
                </thead>
                <tbody>
                  {filteredShipments.map((s) => (
                    <tr
                      key={s.id}
                      onClick={() =>
                        router.push(`/admin/shipments/${s.id}`)
                      }
                      style={{
                        borderBottom: `1px solid ${COLORS.border}`,
                        cursor: 'pointer',
                        transition: 'background-color 0.1s',
                      }}
                      onMouseOver={(e) =>
                        (e.currentTarget.style.backgroundColor = '#fafbfc')
                      }
                      onMouseOut={(e) =>
                        (e.currentTarget.style.backgroundColor = 'transparent')
                      }
                    >
                      <Td
                        style={{
                          fontWeight: 600,
                          color: COLORS.navy,
                          fontFamily: 'monospace',
                          fontSize: 13,
                        }}
                      >
                        {s.tracking_number}
                      </Td>
                      <Td>
                        <div>
                          <div
                            style={{
                              fontWeight: 500,
                              color: COLORS.text,
                              fontSize: 13,
                            }}
                          >
                            {s.customer_name || '—'}
                          </div>
                          {s.customer_email && (
                            <div
                              style={{
                                fontSize: 12,
                                color: COLORS.muted,
                                marginTop: 2,
                              }}
                            >
                              {s.customer_email}
                            </div>
                          )}
                        </div>
                      </Td>
                      <Td>{s.origin_city || s.origin || '—'}</Td>
                      <Td>
                        {s.destination_city || s.destination || '—'}
                      </Td>
                      <Td>{s.current_location || '—'}</Td>
                      <Td>
                        <StatusBadge status={s._displayStatus} />
                      </Td>
                      <Td style={{ fontSize: 12.5 }}>
                        {formatDate(s.estimated_delivery)}
                      </Td>
                      <Td style={{ fontSize: 12, color: COLORS.muted }}>
                        {formatDateTime(s.updated_at)}
                      </Td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </AdminLayout>
    </>
  );
}

/* ─── UI Helpers ─────────────────────────────────────────────────────── */

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
        padding: '18px',
        display: 'flex',
        alignItems: 'center',
        gap: 14,
      }}
    >
      <div
        style={{
          width: 42,
          height: 42,
          borderRadius: 6,
          backgroundColor: `${color}12`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
        }}
      >
        <i className={`fa-solid ${icon}`} style={{ fontSize: 17, color }} />
      </div>
      <div style={{ minWidth: 0 }}>
        <p
          style={{
            fontSize: 12,
            color: COLORS.muted,
            margin: 0,
            marginBottom: 4,
          }}
        >
          {label}
        </p>
        <p
          style={{
            fontSize: 24,
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

function EmptyState({ hasAny, searchQuery, statusFilter, onClear }) {
  const filtering = searchQuery || statusFilter !== 'ALL';

  return (
    <div
      style={{
        padding: '56px 24px',
        textAlign: 'center',
      }}
    >
      <i
        className="fa-solid fa-box-open"
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
        {filtering
          ? 'No matching shipments'
          : hasAny
            ? 'No shipments found'
            : 'No shipments yet'}
      </h3>
      <p style={{ fontSize: 14, color: COLORS.muted, marginBottom: 24 }}>
        {filtering
          ? 'Try adjusting your search or filter.'
          : hasAny
            ? 'No shipments match your criteria.'
            : 'Create your first shipment to get started.'}
      </p>
      <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
        {filtering && (
          <button
            onClick={onClear}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              padding: '10px 20px',
              backgroundColor: '#fff',
              border: `1px solid ${COLORS.border}`,
              borderRadius: 6,
              fontSize: 14,
              fontWeight: 600,
              color: COLORS.text,
              cursor: 'pointer',
            }}
          >
            <i className="fa-solid fa-filter-circle-xmark" />
            Clear Filters
          </button>
        )}
        <Link
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
        >
          <i className="fa-solid fa-plus" />
          Create Shipment
        </Link>
      </div>
    </div>
  );
}

/* ─── getServerSideProps ─────────────────────────────────────────────── */

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
    const { data, error: qError } = await supabase
      .from('shipments')
      .select(
        'id, tracking_number, customer_name, customer_email, origin, destination, current_location, origin_city, destination_city, status, status_code, estimated_delivery, updated_at, created_at',
      )
      .order('updated_at', { ascending: false });

    if (qError) {
      console.error('[ShipmentsList] Server query error:', qError);
      throw qError;
    }

    const rows = (data || []).map((r) => ({
      ...r,
      _displayStatus: normalizeStatus(r),
    }));

    return {
      props: {
        initialShipments: rows,
        profile: authResult.profile,
      },
    };
  } catch (err) {
    console.error('[ShipmentsList] Server data error:', err.message || err);
    return {
      props: {
        initialShipments: [],
        profile: authResult.profile,
      },
    };
  }
}
