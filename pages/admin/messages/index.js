import Head from 'next/head';
import Link from 'next/link';
import { useState, useEffect } from 'react';
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

const MESSAGE_STATUS_OPTIONS = ['ALL', 'NEW', 'READ', 'IN_PROGRESS', 'RESOLVED'];

const MESSAGE_STATUS_BADGE_STYLES = {
  NEW: { bg: '#e2e8f0', text: COLORS.navy },
  READ: { bg: '#dbeafe', text: '#1e40af' },
  IN_PROGRESS: { bg: '#fef3c7', text: '#92400e' },
  RESOLVED: { bg: '#dcfce7', text: '#166534' },
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

export default function MessagesListPage({ initialMessages, profile }) {
  const [messages, setMessages] = useState(initialMessages);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [debouncedSearch, setDebouncedSearch] = useState('');

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(searchQuery), 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  useEffect(() => {
    void refreshFromSupabase();
  }, [debouncedSearch, statusFilter]);

  async function refreshFromSupabase() {
    setLoading(true);
    setError(null);
    try {
      let query = supabase
        .from('contact_messages')
        .select('*')
        .order('created_at', { ascending: false });

      const q = debouncedSearch.trim();
      if (q) {
        const il = `%${q}%`;
        query = query.or(
          `full_name.ilike.${il},email.ilike.${il},subject.ilike.${il},tracking_number.ilike.${il}`,
        );
      }

      if (statusFilter !== 'ALL') {
        query = query.eq('status', statusFilter);
      }

      const { data, error: qError } = await query;
      if (qError) throw qError;
      setMessages(data || []);
    } catch (err) {
      console.error('[MessagesList] Refresh error:', err);
      setError('Unable to load messages. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  async function refreshAll() {
    setLoading(true);
    setError(null);
    try {
      const { data, error: qError } = await supabase
        .from('contact_messages')
        .select('*')
        .order('created_at', { ascending: false });
      if (qError) throw qError;
      setMessages(data || []);
    } catch (err) {
      console.error('[MessagesList] Refresh error:', err);
      setError('Unable to load messages. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  const stats = (() => {
    const total = messages.length;
    const newCount = messages.filter((m) => m.status === 'NEW').length;
    return { total, new: newCount };
  })();

  return (
    <>
      <Head>
        <title>Messages — Josephdeliverycompany Admin</title>
        <meta
          name="description"
          content="Manage contact messages for Josephdeliverycompany."
        />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <AdminLayout title="Messages" profile={profile}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            fontSize: 13,
            color: COLORS.muted,
            flexWrap: 'wrap',
            marginBottom: 20,
          }}
        >
          <Link href="/admin" style={{ color: COLORS.muted, textDecoration: 'none' }}>
            Dashboard
          </Link>
          <i className="fa-solid fa-angle-right" style={{ fontSize: 10 }} />
          <span style={{ color: COLORS.navy, fontWeight: 600 }}>Messages</span>
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
          <h1
            style={{
              fontSize: 24,
              fontWeight: 800,
              color: COLORS.navy,
              margin: 0,
              letterSpacing: '-0.3px',
            }}
          >
            Messages
          </h1>
        </div>

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
              onClick={refreshAll}
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
            label="All Messages"
            value={stats.total}
            icon="fa-envelope"
            color={COLORS.navy}
          />
          <StatCard
            label="New"
            value={stats.new}
            icon="fa-envelope-open-text"
            color={COLORS.blue}
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
              <div style={{ position: 'relative', flex: 1, minWidth: 220, maxWidth: 420 }}>
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
                  placeholder="Search name, email, subject, tracking number..."
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
                  minWidth: 160,
                }}
              >
                {MESSAGE_STATUS_OPTIONS.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt === 'ALL' ? 'All Statuses' : opt.charAt(0) + opt.slice(1).toLowerCase().replace('_', ' ')}
                  </option>
                ))}
              </select>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <button
                onClick={refreshAll}
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
                <i className={`fa-solid fa-sync-alt ${loading ? 'fa-spin' : ''}`} />
                {loading ? 'Refreshing...' : 'Refresh'}
              </button>
            </div>
          </div>

          {messages.length === 0 ? (
            <EmptyState
              hasSearch={!!debouncedSearch || statusFilter !== 'ALL'}
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
                  minWidth: 1000,
                }}
              >
                <thead>
                  <tr
                    style={{
                      backgroundColor: COLORS.gray,
                      borderBottom: `1px solid ${COLORS.border}`,
                    }}
                  >
                    <Th>Customer</Th>
                    <Th>Subject</Th>
                    <Th>Email</Th>
                    <Th>Tracking Number</Th>
                    <Th>Status</Th>
                    <Th>Date</Th>
                    <Th>Actions</Th>
                  </tr>
                </thead>
                <tbody>
                  {messages.map((m) => (
                    <tr
                      key={m.id}
                      style={{
                        borderBottom: `1px solid ${COLORS.border}`,
                        transition: 'background-color 0.1s',
                      }}
                      onMouseOver={(e) =>
                        (e.currentTarget.style.backgroundColor = '#fafbfc')
                      }
                      onMouseOut={(e) =>
                        (e.currentTarget.style.backgroundColor = 'transparent')
                      }
                    >
                      <Td>
                        <div
                          style={{
                            fontWeight: 600,
                            color: COLORS.text,
                            fontSize: 13,
                          }}
                        >
                          {m.full_name || '—'}
                        </div>
                      </Td>
                      <Td>
                        <div style={{ fontSize: 13, color: COLORS.text }}>
                          {m.subject || '—'}
                        </div>
                      </Td>
                      <Td>
                        <div style={{ fontSize: 13, color: COLORS.muted }}>
                          {m.email || '—'}
                        </div>
                      </Td>
                      <Td>
                        <div style={{ fontSize: 13, whiteSpace: 'nowrap' }}>
                          {m.tracking_number ? (
                            <span style={{ fontFamily: 'monospace', color: COLORS.navy }}>
                              {m.tracking_number}
                            </span>
                          ) : (
                            '—'
                          )}
                        </div>
                      </Td>
                      <Td>
                        <MessageStatusBadge status={m.status || 'NEW'} />
                      </Td>
                      <Td style={{ fontSize: 12, color: COLORS.muted, whiteSpace: 'nowrap' }}>
                        {formatDateTime(m.created_at)}
                      </Td>
                      <Td>
                        <Link
                          href={`/admin/messages/${m.id}`}
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: 6,
                            padding: '6px 12px',
                            backgroundColor: COLORS.navy,
                            color: '#fff',
                            borderRadius: 6,
                            fontSize: 12,
                            fontWeight: 600,
                            textDecoration: 'none',
                            whiteSpace: 'nowrap',
                          }}
                        >
                          <i className="fa-solid fa-eye" />
                          View
                        </Link>
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

function MessageStatusBadge({ status }) {
  const key = (status || 'NEW').toUpperCase();
  const style = MESSAGE_STATUS_BADGE_STYLES[key] || MESSAGE_STATUS_BADGE_STYLES.NEW;
  const label = key.charAt(0) + key.slice(1).toLowerCase().replace('_', ' ');
  return (
    <span
      style={{
        display: 'inline-block',
        padding: '4px 10px',
        backgroundColor: style.bg,
        color: style.text,
        borderRadius: 999,
        fontSize: 12,
        fontWeight: 700,
        lineHeight: 1.2,
        letterSpacing: '0.3px',
      }}
    >
      {label}
    </span>
  );
}

function EmptyState({ hasSearch, onClear }) {
  return (
    <div
      style={{
        padding: '56px 24px',
        textAlign: 'center',
      }}
    >
      <i
        className="fa-solid fa-envelope"
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
        {hasSearch ? 'No matching messages' : 'No messages yet'}
      </h3>
      <p style={{ fontSize: 14, color: COLORS.muted, marginBottom: 24 }}>
        {hasSearch
          ? 'Try adjusting your search or filter.'
          : 'Contact messages submitted by customers will appear here.'}
      </p>
      {hasSearch && (
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
    const { data, error: mError } = await supabase
      .from('contact_messages')
      .select('*')
      .order('created_at', { ascending: false });

    if (mError) {
      console.error('[MessagesList] Server query error:', mError);
      throw mError;
    }

    return {
      props: {
        initialMessages: data || [],
        profile: authResult.profile,
      },
    };
  } catch (err) {
    console.error('[MessagesList] Server data error:', err.message || err);
    return {
      props: {
        initialMessages: [],
        profile: authResult.profile,
      },
    };
  }
}