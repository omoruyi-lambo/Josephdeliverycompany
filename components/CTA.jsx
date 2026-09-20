import Link from 'next/link';

export default function CTA() {
  return (
    <section style={{
      backgroundColor: '#0a1f3c',
      padding: '80px 0',
      borderTop: '4px solid #c0392b',
    }}>
      <div style={{
        maxWidth: '1280px',
        margin: '0 auto',
        padding: '0 24px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        textAlign: 'center',
      }}>
        <h2 style={{
          fontSize: 'clamp(28px, 4vw, 44px)',
          fontWeight: 800,
          color: '#ffffff',
          marginBottom: '16px',
          letterSpacing: '-0.4px',
        }}>
          Ready to Ship?
        </h2>
        <p style={{
          fontSize: 'clamp(15px, 1.8vw, 18px)',
          color: '#94a3b8',
          marginBottom: '40px',
          maxWidth: '480px',
          lineHeight: 1.6,
        }}>
          Get a delivery solution built around your needs.
        </p>
        <div className="cta-buttons" style={{ display: 'flex', gap: '14px', flexWrap: 'wrap', justifyContent: 'center' }}>
          <Link
            href="/quote"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              padding: '15px 32px',
              backgroundColor: '#c0392b',
              color: '#ffffff',
              fontWeight: 700,
              fontSize: '14px',
              letterSpacing: '0.5px',
              textDecoration: 'none',
              borderRadius: '6px',
              transition: 'background-color 0.15s',
            }}
            className="cta-btn-red"
          >
            GET A QUOTE
          </Link>
          <Link
            href="/contact"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              padding: '15px 32px',
              backgroundColor: 'transparent',
              color: '#ffffff',
              fontWeight: 700,
              fontSize: '14px',
              letterSpacing: '0.5px',
              textDecoration: 'none',
              border: '2px solid rgba(255,255,255,0.35)',
              borderRadius: '6px',
              transition: 'border-color 0.15s, background-color 0.15s',
            }}
            className="cta-btn-outline"
          >
            CONTACT US
          </Link>
        </div>
      </div>

      <style jsx>{`
        .cta-btn-red:hover {
          background-color: #a93226 !important;
        }
        .cta-btn-outline:hover {
          border-color: rgba(255, 255, 255, 0.75) !important;
          background-color: rgba(255, 255, 255, 0.05) !important;
        }
        @media (max-width: 480px) {
          .cta-buttons {
            flex-direction: column !important;
            width: 100%;
          }
          .cta-btn-red,
          .cta-btn-outline {
            justify-content: center;
            width: 100%;
          }
        }
      `}</style>
    </section>
  );
}
