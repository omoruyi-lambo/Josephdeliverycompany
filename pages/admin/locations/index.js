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
};

const COUNTRY_OPTIONS = [
  'United States',
  'Brazil',
  'Japan',
  'India',
  'South Korea',
  'France',
];

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

export default function AdminLocationsPage({ initialLocations, profile }) {
  const router = useRouter();
  const [locations, setLocations] = useState(initialLocations);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [countryFilter, setCountryFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [togglingId, setTogglingId] = useState(null);

  async function refreshLocations() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/admin/locations', {
        method: 'GET',
        credentials: 'same-origin',
      });
      const data = await res.json();
      if (!res.ok || !data.ok) {
        throw new Error(data.error || 'Failed to load locations.');
      }
      setLocations(data.locations || []);
    } catch (err) {
      console.error('[LocationsList] Refresh error:', err);
      setError('Unable to load locations. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  async function toggleStatus(loc) {
    const newIsActive = !loc.is_active;
    setTogglingId(loc.id);
    setError(null);
    try {
      const res = await fetch(`/api/admin/locations/${loc.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'same-origin',
        body: JSON.stringify({ isActive: newIsActive }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.ok) {
        throw new Error(data.error || 'Failed to update location status.');
      }
      setLocations((prev) =>
        prev.map((l) =>
          l.id === loc.id ? { ...l, is_active: newIsActive, updated_at: new Date().toISOString() } : l,
        ),
      );
    } catch (err) {
      console.error('[LocationsList] Toggle error:', err);
      setError(err.message || 'Failed to update location status.');
    } finally {
      setTogglingId(null);
    }
  }

  const filteredLocations = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return locations.filter((l) => {
      if (countryFilter !== 'ALL' && l.country !== countryFilter) return false;
      if (statusFilter === 'ACTIVE' && !l.is_active) return false;
      if (statusFilter === 'INACTIVE' && l.is_active) return false;
      if (!q) return true;
      return (
        (l.country && l.country.toLowerCase().includes(q)) ||
        (l.city && l.city.toLowerCase().includes(q)) ||
        (l.office_name && l.office_name.toLowerCase().includes(q)) ||
        (l.address && l.address.toLowerCase().includes(q))
      );
    });
  }, [locations, searchQuery, countryFilter, statusFilter]);

  const stats = useMemo(() => {
    const s = {
      total: locations.length,
      active: 0,
      inactive: 0,
    };
    locations.forEach((l) => {
      if (l.is_active) s.active += 1;
      else s.inactive += 1;
    });
    return s;
  }, [locations]);

  return (
    <>
      <Head>
        <title>Locations — Josephdeliverycompany Admin</title>
        <meta
          name="description"
          content="Manage all Josephdeliverycompany locations."
        />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <AdminLayout title="Locations" profile={profile}>
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
              style={{ color: COLORS.red, fontSize: 20 }}
            />
            <div style={{ flex: 1 }}>
              <p
                style={{
                  color: COLORS.red,
                  fontWeight: 600,
                  margin: 0,
                  marginBottom: 4,
                }}
              >
                Error
              </p>
              <p style={{ color: '#991b1b', fontSize: 13, margin: 0 }}>{error}</p>
            </div>
            <button
              onClick={refreshLocations}
              style={{
                padding: '8px 16px',
                backgroundColor: COLORS.red,
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
            label="Total Locations"
            value={stats.total}
            icon="fa-map-location-dot"
            color={COLORS.navy}
          />
          <StatCard
            label="Active Locations"
            value={stats.active}
            icon="fa-location-dot"
            color={COLORS.green}
          />
          <StatCard
            label="Inactive"
            value={stats.inactive}
            icon="fa-location-slash"
            color={COLORS.muted}
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
                  placeholder="Search country, city, office, address..."
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
                value={countryFilter}
                onChange={(e) => setCountryFilter(e.target.value)}
                style={selectStyle}
              >
                <option value="ALL">All Countries</option>
                {COUNTRY_OPTIONS.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                style={selectStyle}
              >
                <option value="ALL">All Statuses</option>
                <option value="ACTIVE">Active</option>
                <option value="INACTIVE">Inactive</option>
              </select>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <button
                onClick={refreshLocations}
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
                href="/admin/locations/new"
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
                Add Location
              </Link>
            </div>
          </div>

          {filteredLocations.length === 0 ? (
            <EmptyState
              hasAny={locations.length > 0}
              searchQuery={searchQuery}
              countryFilter={countryFilter}
              statusFilter={statusFilter}
              onClear={() => {
                setSearchQuery('');
                setCountryFilter('ALL');
                setStatusFilter('ALL');
              }}
            />
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table
                style={{
                  width: '100%',
                  borderCollapse: 'collapse',
                  minWidth: 900,
                }}
              >
                <thead>
                  <tr
                    style={{
                      backgroundColor: COLORS.gray,
                      borderBottom: `1px solid ${COLORS.border}`,
                    }}
                  >
                    <Th>Country</Th>
                    <Th>City</Th>
                    <Th>Office</Th>
                    <Th>Image</Th>
                    <Th>Status</Th>
                    <Th>Updated</Th>
                    <Th style={{ textAlign: 'right' }}>Actions</Th>
                  </tr>
                </thead>
                <tbody>
                  {filteredLocations.map((l) => (
                    <tr
                      key={l.id}
                      onClick={() => router.push(`/admin/locations/${l.id}/edit`)}
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
                          fontSize: 13,
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <span
                            style={{
                              fontSize: 10,
                              fontWeight: 700,
                              letterSpacing: '1px',
                              color: COLORS.muted,
                              padding: '2px 6px',
                              borderRadius: 4,
                              backgroundColor: COLORS.gray,
                            }}
                          >
                            {l.country_code}
                          </span>
                          {l.country}
                        </div>
                      </Td>
                      <Td>{l.city || '—'}</Td>
                      <Td>
                        <div>
                          <div style={{ fontWeight: 500, fontSize: 13, color: COLORS.text }}>
                            {l.office_name || l.office_type || 'International Network'}
                          </div>
                          {l.office_type && l.office_name && (
                            <div style={{ fontSize: 11.5, color: COLORS.muted, marginTop: 2 }}>
                              {l.office_type}
                            </div>
                          )}
                        </div>
                      </Td>
                      <Td>
                        {l.image_url ? (
                          <div
                            style={{
                              width: 44,
                              height: 32,
                              borderRadius: 4,
                              overflow: 'hidden',
                              backgroundColor: COLORS.gray,
                              flexShrink: 0,
                            }}
                          >
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={l.image_url}
                              alt={l.country}
                              style={{
                                width: '100%',
                                height: '100%',
                                objectFit: 'cover',
                                display: 'block',
                              }}
                              onError={(e) => {
                                e.currentTarget.style.display = 'none';
                              }}
                            />
                          </div>
                        ) : (
                          <span style={{ fontSize: 12, color: COLORS.muted }}>No image</span>
                        )}
                      </Td>
                      <Td>
                        <StatusBadge active={l.is_active} />
                      </Td>
                      <Td style={{ fontSize: 12, color: COLORS.muted }}>
                        {formatDate(l.updated_at)}
                      </Td>
                      <Td style={{ textAlign: 'right' }}>
                        <div
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: 6,
                          }}
                          onClick={(e) => e.stopPropagation()}
                        >
                          <button
                            onClick={() => router.push(`/admin/locations/${l.id}/edit`)}
                            style={{
                              padding: '6px 10px',
                              fontSize: 12,
                              fontWeight: 600,
                              color: COLORS.navy,
                              backgroundColor: '#fff',
                              border: `1px solid ${COLORS.border}`,
                              borderRadius: 5,
                              cursor: 'pointer',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: 5,
                            }}
                          >
                            <i className="fa-solid fa-pen" style={{ fontSize: 11 }} />
                            Edit
                          </button>
                          <button
                            onClick={() => toggleStatus(l)}
                            disabled={togglingId === l.id}
                            style={{
                              padding: '6px 10px',
                              fontSize: 12,
                              fontWeight: 600,
                              color: l.is_active ? '#92400e' : '#166534',
                              backgroundColor: l.is_active ? '#fffbeb' : '#f0fdf4',
                              border: `1px solid ${l.is_active ? '#fde68a' : '#bbf7d0'}`,
                              borderRadius: 5,
                              cursor: togglingId === l.id ? 'not-allowed' : 'pointer',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: 5,
                              opacity: togglingId === l.id ? 0.6 : 1,
                            }}
                          >
                            <i
                              className={`fa-solid ${l.is_active ? 'fa-pause' : 'fa-play'}`}
                              style={{ fontSize: 11 }}
                            />
                            {l.is_active ? 'Deactivate' : 'Activate'}
                          </button>
                        </div>
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

const selectStyle = {
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
  minWidth: 160,
};

function Th({ children, style }) {
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
        ...(style || {}),
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

function StatusBadge({ active }) {
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 5,
        padding: '4px 10px',
        backgroundColor: active ? '#dcfce7' : '#f3f4f6',
        color: active ? '#166534' : '#374151',
        borderRadius: 999,
        fontSize: 12,
        fontWeight: 600,
        lineHeight: 1.2,
      }}
    >
      <span
        style={{
          width: 6,
          height: 6,
          borderRadius: '50%',
          backgroundColor: active ? COLORS.green : COLORS.muted,
          display: 'inline-block',
        }}
      />
      {active ? 'Active' : 'Inactive'}
    </span>
  );
}

function EmptyState({ hasAny, searchQuery, countryFilter, statusFilter, onClear }) {
  const filtering = searchQuery || countryFilter !== 'ALL' || statusFilter !== 'ALL';

  return (
    <div
      style={{
        padding: '56px 24px',
        textAlign: 'center',
      }}
    >
      <i
        className="fa-solid fa-map-location-dot"
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
          ? 'No matching locations'
          : hasAny
            ? 'No locations found'
            : 'No locations yet'}
      </h3>
      <p style={{ fontSize: 14, color: COLORS.muted, marginBottom: 24 }}>
        {filtering
          ? 'Try adjusting your search or filters.'
          : hasAny
            ? 'No locations match your criteria.'
            : 'Add your first location to build the network directory.'}
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
          href="/admin/locations/new"
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
          Add Location
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

  const sb = createSupabaseServerClient(req, res);

  try {
    const { data, error: qError } = await sb
      .from('locations')
      .select('*')
      .order('country', { ascending: true })
      .order('city', { ascending: true });

    if (qError) {
      console.error('[LocationsList] Server query error:', qError);
      throw qError;
    }

    return {
      props: {
        initialLocations: data || [],
        profile: authResult.profile,
      },
    };
  } catch (err) {
    console.error('[LocationsList] Server data error:', err.message || err);
    return {
      props: {
        initialLocations: [],
        profile: authResult.profile,
      },
    };
  }
}
