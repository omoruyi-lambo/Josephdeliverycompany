import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useState } from 'react';
import { createSupabaseServerClient } from '../../../lib/supabase/server';
import { requireAdminAuth } from '../../../lib/adminAuth';
import AdminLayout from '../../../components/AdminLayout';

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

const QUOTE_STATUS_OPTIONS = ['NEW', 'REVIEWING', 'QUOTED', 'CLOSED'];

const QUOTE_STATUS_BADGE_STYLES = {
  NEW: { bg: '#e2e8f0', text: COLORS.navy },
  REVIEWING: { bg: '#fef3c7', text: '#92400e' },
  QUOTED: { bg: '#dcfce7', text: '#166534' },
  CLOSED: { bg: '#f3f4f6', text: '#6b7280' },
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

function QuoteStatusBadge({ status, large = false }) {
  const key = (status || 'NEW').toUpperCase();
  const style = QUOTE_STATUS_BADGE_STYLES[key] || QUOTE_STATUS_BADGE_STYLES.NEW;
  const label = key.charAt(0) + key.slice(1).toLowerCase();
  return (
    <span
      style={{
        display: 'inline-block',
        padding: large ? '7px 14px' : '5px 12px',
        backgroundColor: style.bg,
        color: style.text,
        borderRadius: 999,
        fontSize: large ? 13 : 12,
        fontWeight: 700,
        lineHeight: 1.2,
        letterSpacing: '0.3px',
      }}
    >
      {label}
    </span>
  );
}

export default function QuoteDetailPage({ quote, profile }) {
  const router = useRouter();

  if (!quote) {
    return (
      <AdminLayout title="Quote Request Not Found" profile={profile}>
        <NotFoundState />
      </AdminLayout>
    );
  }

  return (
    <QuoteDetailView quote={quote} profile={profile} router={router} />
  );
}

function QuoteDetailView({ quote, profile, router }) {
  const [status, setStatus] = useState(quote.status || 'NEW');
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState(null);
  const [saveSuccess, setSaveSuccess] = useState(false);

  async function handleSaveStatus() {
    setSaving(true);
    setSaveError(null);
    setSaveSuccess(false);
    try {
      const res = await fetch(`/api/admin/quotes/${quote.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(data.error || 'Failed to save status.');
      }
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 2500);
      setTimeout(() => router.replace(router.asPath), 600);
    } catch (err) {
      console.error('[QuoteDetail] Save error:', err);
      setSaveError(err?.message || 'Unable to save status.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <>
      <Head>
        <title>
          Quote Request {quote.id} — Josephdeliverycompany Admin
        </title>
        <meta
          name="description"
          content={`Quote request details for ${quote.id}.`}
        />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <AdminLayout title={`Quote Request · ${String(quote.id).slice(0, 8)}`} profile={profile}>
        <div style={{ marginBottom: 20 }}>
          <BreadcrumbBar quoteId={quote.id} />
        </div>

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 12,
            flexWrap: 'wrap',
            marginBottom: 24,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 14, flexWrap: 'wrap' }}>
            <QuoteStatusBadge status={quote.status} large />
            <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
              <p style={{ fontSize: 13, color: COLORS.muted, margin: 0 }}>
                <i className="fa-solid fa-calendar" style={{ marginRight: 6 }} />
                Submitted {formatDateTime(quote.created_at)}
              </p>
              {quote.updated_at && quote.updated_at !== quote.created_at && (
                <p style={{ fontSize: 13, color: COLORS.muted, margin: 0 }}>
                  <i className="fa-solid fa-clock-rotate-left" style={{ marginRight: 6 }} />
                  Updated {formatDateTime(quote.updated_at)}
                </p>
              )}
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
            <Link
              href="/admin/quotes"
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
              <i className="fa-solid fa-arrow-left" />
              Back to List
            </Link>
            <a
              href="/admin/quotes"
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
              <i className="fa-solid fa-list" />
              View on List
            </a>
          </div>
        </div>

        <div
          className="quote-detail-grid"
          style={{
            display: 'grid',
            gridTemplateColumns: '1.4fr 1fr',
            gap: 24,
            alignItems: 'start',
          }}
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            <InfoCard
              icon="fa-user"
              title="Customer Information"
              rows={[
                { label: 'Full Name', value: quote.full_name || '—' },
                { label: 'Email', value: quote.email || '—' },
                { label: 'Phone', value: quote.phone || '—' },
                {
                  label: 'Company',
                  value: quote.company_name && quote.company_name.trim() ? quote.company_name : '—',
                },
              ]}
            />

            <InfoCard
              icon="fa-truck"
              title="Shipment Information"
              rows={[
                { label: 'Shipment Type', value: quote.shipment_type || '—' },
                { label: 'Service', value: quote.service || '—' },
                { label: 'Package Type', value: quote.package_type || '—' },
              ]}
            />

            <div
              className="locations-grid"
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: 20,
              }}
            >
              <LocationCard
                icon="fa-circle-dot"
                color="#16a34a"
                title="Origin"
                city={quote.origin_city}
                country={quote.origin_country}
              />
              <LocationCard
                icon="fa-flag-checkered"
                color={COLORS.red}
                title="Destination"
                city={quote.destination_city}
                country={quote.destination_country}
              />
            </div>

            <InfoCard
              icon="fa-boxes-stacked"
              title="Package Information"
              rows={[
                {
                  label: 'Package Count',
                  value: quote.package_count ? `${quote.package_count}` : '—',
                },
                {
                  label: 'Weight',
                  value: quote.weight ? `${Number(quote.weight).toLocaleString()} kg` : '—',
                },
              ]}
            />

            {quote.message && quote.message.trim() ? (
              <MessageCard message={quote.message} />
            ) : null}
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
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
                  backgroundColor: `${COLORS.navy}0c`,
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
                    className="fa-solid fa-gear"
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
                  Request Status
                </h3>
              </div>
              <div style={{ padding: '18px' }}>
                {saveSuccess && (
                  <div
                    style={{
                      backgroundColor: '#dcfce7',
                      border: '1px solid #bbf7d0',
                      borderRadius: 6,
                      padding: '10px 12px',
                      marginBottom: 14,
                      display: 'flex',
                      alignItems: 'center',
                      gap: 8,
                      fontSize: 13,
                      color: '#166534',
                      fontWeight: 600,
                    }}
                  >
                    <i className="fa-solid fa-check-circle" />
                    Status saved successfully.
                  </div>
                )}
                {saveError && (
                  <div
                    style={{
                      backgroundColor: '#fee2e2',
                      border: '1px solid #fecaca',
                      borderRadius: 6,
                      padding: '10px 12px',
                      marginBottom: 14,
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: 8,
                      fontSize: 13,
                      color: '#991b1b',
                    }}
                  >
                    <i
                      className="fa-solid fa-exclamation-circle"
                      style={{ marginTop: 1 }}
                    />
                    <span>{saveError}</span>
                  </div>
                )}

                <label
                  style={{
                    display: 'block',
                    fontSize: 11,
                    fontWeight: 700,
                    color: '#374151',
                    marginBottom: 8,
                    textTransform: 'uppercase',
                    letterSpacing: '0.8px',
                  }}
                >
                  Status
                </label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '11px 36px 11px 13px',
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
                    backgroundPosition: 'right 12px center',
                    backgroundSize: '16px',
                    boxSizing: 'border-box',
                    marginBottom: 16,
                  }}
                >
                  {QUOTE_STATUS_OPTIONS.map((opt) => (
                    <option key={opt} value={opt}>
                      {opt.charAt(0) + opt.slice(1).toLowerCase()}
                    </option>
                  ))}
                </select>

                <button
                  onClick={handleSaveStatus}
                  disabled={saving || status === quote.status}
                  style={{
                    width: '100%',
                    display: 'inline-flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    gap: 8,
                    padding: '12px 18px',
                    backgroundColor:
                      saving || status === quote.status ? '#94a3b8' : COLORS.navy,
                    color: '#fff',
                    border: 'none',
                    borderRadius: 6,
                    fontSize: 14,
                    fontWeight: 700,
                    cursor: saving || status === quote.status ? 'not-allowed' : 'pointer',
                  }}
                >
                  {saving ? (
                    <>
                      <i className="fa-solid fa-circle-notch fa-spin" />
                      Saving…
                    </>
                  ) : (
                    <>
                      <i className="fa-solid fa-floppy-disk" />
                      Save Status
                    </>
                  )}
                </button>
              </div>
            </div>

            <InfoCard
              icon="fa-clock"
              title="Timeline"
              rows={[
                { label: 'Created', value: formatDateTime(quote.created_at) },
                {
                  label: 'Last Updated',
                  value: formatDateTime(quote.updated_at || quote.created_at),
                },
                {
                  label: 'Quote ID',
                  value: String(quote.id),
                  mono: true,
                },
              ]}
            />
          </div>
        </div>

        <style jsx>{`
          @media (max-width: 960px) {
            .quote-detail-grid {
              grid-template-columns: 1fr !important;
            }
          }
          @media (max-width: 640px) {
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

function BreadcrumbBar({ quoteId }) {
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
      <Link href="/admin" style={{ color: COLORS.muted, textDecoration: 'none' }}>
        Dashboard
      </Link>
      <i className="fa-solid fa-angle-right" style={{ fontSize: 10 }} />
      <Link href="/admin/quotes" style={{ color: COLORS.muted, textDecoration: 'none' }}>
        Quote Requests
      </Link>
      <i className="fa-solid fa-angle-right" style={{ fontSize: 10 }} />
      <span
        style={{
          fontFamily: 'monospace',
          color: COLORS.navy,
          fontWeight: 600,
        }}
      >
        {String(quoteId).slice(0, 8)}
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

function LocationCard({ icon, color, title, city, country }) {
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
        {(city || country) ? (
          <p
            style={{
              margin: 0,
              fontSize: 15,
              fontWeight: 700,
              color: COLORS.navy,
              lineHeight: 1.3,
            }}
          >
            {[city, country].filter(Boolean).join(', ')}
          </p>
        ) : (
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

function MessageCard({ message }) {
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
          backgroundColor: '#f3f4f6',
        }}
      >
        <div
          style={{
            width: 28,
            height: 28,
            borderRadius: 6,
            backgroundColor: '#374151',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <i
            className="fa-solid fa-message"
            style={{ color: '#fff', fontSize: 12 }}
          />
        </div>
        <h3
          style={{
            fontSize: 14,
            fontWeight: 700,
            color: '#374151',
            margin: 0,
          }}
        >
          Customer Message
        </h3>
      </div>
      <div style={{ padding: '18px' }}>
        <pre
          style={{
            margin: 0,
            fontSize: 14,
            lineHeight: 1.6,
            color: COLORS.text,
            fontFamily: 'inherit',
            whiteSpace: 'pre-wrap',
            wordBreak: 'break-word',
          }}
        >
          {message}
        </pre>
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
        Quote request not found
      </h3>
      <p style={{ fontSize: 14, color: COLORS.muted, marginBottom: 24 }}>
        The quote request you&apos;re looking for does not exist or has been removed.
      </p>
      <Link
        href="/admin/quotes"
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
        Back to Quote Requests
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
  let quote = null;

  try {
    const supabase = createSupabaseServerClient(req, res);

    const { data: quoteRow, error: qError } = await supabase
      .from('quote_requests')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (qError) {
      console.error('[QuoteDetail] Server fetch error:', qError.message);
    }

    quote = quoteRow || null;
  } catch (err) {
    console.error('[QuoteDetail] Server unexpected error:', err?.message ?? err);
    quote = null;
  }

  return {
    props: {
      quote,
      profile: authResult.profile,
    },
  };
}
