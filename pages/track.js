import Head from 'next/head';
import Link from 'next/link';

import Header from '../components/Header';
import Footer from '../components/Footer';
import TrackingSearch from '../components/TrackingSearch';
import ShipmentMap from '../components/ShipmentMap';
import ShipmentSummary from '../components/ShipmentSummary';
import TrackingTimeline from '../components/TrackingTimeline';
import ShipmentDetails from '../components/ShipmentDetails';

import { isValidTrackingNumber, normaliseTrackingNumber } from '../lib/tracking';
import { getShipmentByTrackingNumber } from '../lib/trackingData';

/**
 * getServerSideProps — resolves all tracking data server-side so the full
 * page (including the map) renders on the very first HTTP response.
 *
 * getShipmentByTrackingNumber is now async (queries Supabase).
 * Errors are caught here and result in shipment: null (not-found state).
 * Database error details are never sent to the client.
 */
export async function getServerSideProps({ query }) {
  const rawTracking    = query.tracking ?? '';
  const trackingNumber = normaliseTrackingNumber(rawTracking);
  const hasInput       = trackingNumber.length > 0;
  const formatValid    = hasInput && isValidTrackingNumber(trackingNumber);

  let shipment = null;
  if (formatValid) {
    try {
      shipment = await getShipmentByTrackingNumber(trackingNumber);
    } catch (err) {
      /* Safety net — should not reach here because trackingData.js handles
         its own errors, but we guard anyway to protect the page render. */
      console.error('[track.js] getShipmentByTrackingNumber threw:', err?.message ?? err);
      shipment = null;
    }
  }

  return {
    props: {
      rawTracking,
      trackingNumber,
      hasInput,
      formatValid,
      shipment: shipment ?? null,
    },
  };
}

export default function TrackPage({
  rawTracking, trackingNumber, hasInput, formatValid, shipment,
}) {
  const pageTitle = shipment
    ? `${trackingNumber} — Track Shipment | Josephdeliverycompany`
    : 'Track Shipment — Josephdeliverycompany';

  return (
    <>
      <Head>
        <title>{pageTitle}</title>
        <meta
          name="description"
          content="Track your Josephdeliverycompany shipment and see its current location on the map."
        />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
        <meta name="robots" content="noindex, follow" />
      </Head>

      <Header />

      <main style={{ backgroundColor: '#f4f5f7', minHeight: '70vh' }}>

        {/* ── Dark navy search hero ──────────────────────────────── */}
        <TrackingSearch initialValue={rawTracking} />

        {/* ── Results area ──────────────────────────────────────── */}
        <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '32px 24px 64px' }}>

          {/* ── State 1: No input ─────────────────────────────────── */}
          {!hasInput && <EmptyState />}

          {/* ── State 2: Invalid format ───────────────────────────── */}
          {hasInput && !formatValid && (
            <ErrorState
              title="Invalid tracking number"
              message={`"${rawTracking}" is not a recognised format. Josephdeliverycompany tracking numbers look like JDC-2026-00127.`}
            />
          )}

          {/* ── State 3: Valid format, no record ──────────────────── */}
          {formatValid && !shipment && (
            <ErrorState
              title="Tracking information not found"
              message="We couldn't find a shipment matching this tracking number. Please check the number and try again."
            />
          )}

          {/* ── State 4: Shipment found ────────────────────────────── */}
          {shipment && (
            <>
              {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
                  SHIPMENT MAP — primary visual element, shown first
                  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
              <ShipmentMap
                mapData={shipment.map}
                statusCode={shipment.statusCode}
              />

              {/* Status summary bar */}
              <ShipmentSummary shipment={shipment} />

              {/* Timeline + details — two columns on desktop */}
              <div
                className="results-grid"
                style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 340px',
                  gap: '24px',
                  alignItems: 'start',
                  maxWidth: '860px',
                }}
              >
                <TrackingTimeline steps={shipment.timeline} />
                <ShipmentDetails shipment={shipment} />
              </div>
            </>
          )}
        </div>
      </main>

      <Footer />

      <style jsx>{`
        @media (max-width: 960px) {
          .results-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </>
  );
}

/* ─── Page-level helper components ──────────────────────────────────────── */

function EmptyState() {
  return (
    <div style={{
      maxWidth: '520px',
      margin: '0 auto',
      padding: '64px 24px',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      textAlign: 'center',
      gap: '16px',
    }}>
      <div style={{
        width: '64px',
        height: '64px',
        borderRadius: '50%',
        backgroundColor: '#e2e8f0',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}>
        <i className="fa-solid fa-magnifying-glass"
          style={{ fontSize: '24px', color: '#94a3b8' }} />
      </div>
      <h2 style={{ fontSize: '18px', fontWeight: 700, color: '#0a1f3c' }}>
        Enter a tracking number above
      </h2>
      <p style={{ fontSize: '14px', color: '#6b7280', lineHeight: 1.65 }}>
        Use the search bar to track your Josephdeliverycompany shipment.
      </p>
      <p style={{ fontSize: '13px', color: '#94a3b8' }}>
        Try:{' '}
        <Link href="/track?tracking=JDC-2026-00127"
          style={{ color: '#0a1f3c', fontWeight: 600, fontFamily: 'monospace' }}>
          JDC-2026-00127
        </Link>
        {' · '}
        <Link href="/track?tracking=JDC-2026-00128"
          style={{ color: '#0a1f3c', fontWeight: 600, fontFamily: 'monospace' }}>
          JDC-2026-00128
        </Link>
        {' · '}
        <Link href="/track?tracking=JDC-2026-00129"
          style={{ color: '#0a1f3c', fontWeight: 600, fontFamily: 'monospace' }}>
          JDC-2026-00129
        </Link>
      </p>
    </div>
  );
}

function ErrorState({ title, message }) {
  return (
    <div style={{
      maxWidth: '620px',
      backgroundColor: '#ffffff',
      border: '1px solid #e2e6ea',
      borderRadius: '3px',
      overflow: 'hidden',
    }}>
      <div style={{ height: '4px', backgroundColor: '#c0392b' }} />
      <div style={{ padding: '28px 32px' }}>
        <div style={{
          display: 'flex',
          alignItems: 'flex-start',
          gap: '14px',
          marginBottom: '20px',
        }}>
          <div style={{
            width: '40px',
            height: '40px',
            borderRadius: '50%',
            backgroundColor: '#fee2e2',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}>
            <i className="fa-solid fa-circle-exclamation"
              style={{ fontSize: '17px', color: '#c0392b' }} />
          </div>
          <div>
            <h2 style={{
              fontSize: '16px', fontWeight: 700, color: '#0a1f3c', marginBottom: '7px',
            }}>
              {title}
            </h2>
            <p style={{ fontSize: '14px', color: '#4a5568', lineHeight: 1.65 }}>
              {message}
            </p>
          </div>
        </div>
        <Link
          href="/"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '7px',
            fontSize: '13px',
            fontWeight: 600,
            color: '#0a1f3c',
            textDecoration: 'none',
            padding: '10px 20px',
            border: '1px solid #d1d5db',
            borderRadius: '6px',
            backgroundColor: '#ffffff',
          }}
        >
          <i className="fa-solid fa-arrow-left" style={{ fontSize: '11px' }} />
          Back to homepage
        </Link>
      </div>
    </div>
  );
}
