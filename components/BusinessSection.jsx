import Link from 'next/link';

/*
 * BUSINESS SECTION — IMAGE SOURCE
 * ─────────────────────────────────────────────────────────────────────────────
 * Currently using an Unsplash CDN image (free, no branding).
 * To replace with a local image:
 *   1. Place the file at /public/images/business-shipping.jpg
 *   2. Change BUSINESS_IMAGE_SRC to '/images/business-shipping.jpg'
 *
 * Unsplash attribution (Unsplash License — free for commercial use):
 *   unsplash.com/photos/1553413077-190dd305871c
 * ─────────────────────────────────────────────────────────────────────────────
 */
const BUSINESS_IMAGE_SRC =
  'https://images.unsplash.com/photo-1553413077-190dd305871c?auto=format&fit=crop&w=900&q=80';

const BUSINESS_IMAGE_ALT =
  'Logistics warehouse team organising shipments for business customers';

export default function BusinessSection() {
  return (
    <section style={{ backgroundColor: '#ffffff', borderTop: '1px solid #e2e6ea' }}>
      <div
        className="business-grid"
        style={{
          maxWidth: '1280px',
          margin: '0 auto',
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          minHeight: '460px',
        }}
      >
        {/* ── Image panel ───────────────────────────────────────────────── */}
        <div
          className="business-image-panel"
          style={{
            position: 'relative',
            overflow: 'hidden',
            minHeight: '340px',
            backgroundColor: '#0a1f3c',
          }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={BUSINESS_IMAGE_SRC}
            alt={BUSINESS_IMAGE_ALT}
            style={{
              position: 'absolute',
              inset: 0,
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              objectPosition: 'center',
              display: 'block',
            }}
            loading="lazy"
          />
          {/* Subtle navy overlay — keeps the panel tonally consistent with the brand */}
          <div
            style={{
              position: 'absolute',
              inset: 0,
              backgroundColor: 'rgba(10, 31, 60, 0.30)',
              pointerEvents: 'none',
            }}
          />
          {/* Red accent bar on the right edge — visual bridge to the content panel */}
          <div
            style={{
              position: 'absolute',
              top: 0,
              bottom: 0,
              right: 0,
              width: '4px',
              backgroundColor: '#c0392b',
              zIndex: 1,
            }}
          />
        </div>

        {/* ── Content panel ─────────────────────────────────────────────── */}
        <div
          className="business-content"
          style={{
            padding: '72px 60px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            borderLeft: '1px solid #e2e6ea',
          }}
        >
          <p style={{
            fontSize: '11px',
            fontWeight: 700,
            letterSpacing: '2.5px',
            textTransform: 'uppercase',
            color: '#c0392b',
            marginBottom: '14px',
          }}>
            For Businesses
          </p>
          <h2 style={{
            fontSize: 'clamp(24px, 2.8vw, 36px)',
            fontWeight: 700,
            color: '#0a1f3c',
            marginBottom: '20px',
            lineHeight: 1.15,
            letterSpacing: '-0.3px',
          }}>
            Solutions Built<br />for Your Business
          </h2>
          <p style={{
            fontSize: '15px',
            color: '#4a5568',
            lineHeight: 1.72,
            marginBottom: '36px',
            maxWidth: '420px',
          }}>
            From small businesses to growing enterprises, simplify your shipping
            and manage deliveries with confidence.
          </p>
          <div>
            <Link
              href="/business"
              className="business-btn"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '9px',
                padding: '14px 28px',
                backgroundColor: '#0a1f3c',
                color: '#ffffff',
                fontWeight: 700,
                fontSize: '14px',
                letterSpacing: '0.5px',
                textDecoration: 'none',
                borderRadius: '6px',
                transition: 'background-color 0.15s',
              }}
            >
              BUSINESS SHIPPING
              <i className="fa-solid fa-arrow-right" style={{ fontSize: '12px' }} />
            </Link>
          </div>
        </div>
      </div>

      <style jsx>{`
        .business-btn:hover {
          background-color: #061529 !important;
        }
        @media (max-width: 900px) {
          .business-grid {
            grid-template-columns: 1fr !important;
          }
          .business-image-panel {
            min-height: 300px !important;
          }
          .business-content {
            padding: 48px 32px !important;
            border-left: none !important;
            border-top: 1px solid #e2e6ea !important;
          }
        }
        @media (max-width: 480px) {
          .business-image-panel {
            min-height: 240px !important;
          }
          .business-content {
            padding: 40px 24px !important;
          }
        }
      `}</style>
    </section>
  );
}
