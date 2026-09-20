import Link from 'next/link';

export default function Hero() {
  return (
    <section style={{ position: 'relative', backgroundColor: '#0a1f3c', overflow: 'hidden', minHeight: '560px' }}>
      {/* Background hero image — path: /public/hero.png */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          backgroundImage: 'url(/hero.png)',
          backgroundSize: 'cover',
          backgroundPosition: 'center right',
          backgroundRepeat: 'no-repeat',
        }}
        role="img"
        aria-label="Josephdeliverycompany logistics — delivery truck, warehouse, cargo and aircraft"
      />

      {/* Left-weighted dark overlay for text legibility.
          Uses stacked flat rgba layers instead of a CSS gradient. */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          backgroundColor: 'rgba(10, 31, 60, 0.78)',
        }}
      />
      {/* Secondary overlay confined to the left half — deepens contrast under the headline */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          bottom: 0,
          left: 0,
          width: '55%',
          backgroundColor: 'rgba(10, 31, 60, 0.18)',
        }}
      />

      {/* Content */}
      <div
        style={{
          position: 'relative',
          maxWidth: '1280px',
          margin: '0 auto',
          padding: '96px 24px',
          display: 'flex',
          alignItems: 'center',
        }}
      >
        <div style={{ maxWidth: '560px' }}>
          {/* Eyebrow label */}
          <p style={{
            fontSize: '11px',
            fontWeight: 700,
            letterSpacing: '3px',
            textTransform: 'uppercase',
            color: '#c0392b',
            marginBottom: '18px',
          }}>
            Josephdeliverycompany
          </p>

          {/* Headline */}
          <h1 style={{
            fontSize: 'clamp(36px, 5.5vw, 58px)',
            fontWeight: 800,
            lineHeight: 1.06,
            color: '#ffffff',
            marginBottom: '22px',
            letterSpacing: '-0.5px',
          }}>
            Delivering<br />What Matters.
          </h1>

          {/* Supporting copy */}
          <p style={{
            fontSize: 'clamp(15px, 1.8vw, 17px)',
            lineHeight: 1.7,
            color: '#cbd5e1',
            marginBottom: '40px',
            maxWidth: '460px',
          }}>
            Reliable shipping and delivery solutions for individuals and businesses,
            wherever you need to go.
          </p>

          {/* CTAs */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px' }}>
            <Link href="/track" className="hero-btn-white">
              <i className="fa-solid fa-magnifying-glass" style={{ fontSize: '13px' }} />
              TRACK SHIPMENT
            </Link>
            <Link href="/quote" className="hero-btn-red">
              GET A QUOTE
            </Link>
          </div>
        </div>
      </div>

      <style jsx>{`
        .hero-btn-white {
          display: inline-flex;
          align-items: center;
          gap: 9px;
          padding: 14px 26px;
          background-color: #ffffff;
          color: #0a1f3c;
          font-weight: 700;
          font-size: 14px;
          letter-spacing: 0.5px;
          text-decoration: none;
          border-radius: 6px;
          transition: background-color 0.15s;
        }
        .hero-btn-white:hover {
          background-color: #e8edf2;
        }
        .hero-btn-red {
          display: inline-flex;
          align-items: center;
          gap: 9px;
          padding: 14px 26px;
          background-color: #c0392b;
          color: #ffffff;
          font-weight: 700;
          font-size: 14px;
          letter-spacing: 0.5px;
          text-decoration: none;
          border-radius: 6px;
          transition: background-color 0.15s;
        }
        .hero-btn-red:hover {
          background-color: #a93226;
        }
        @media (max-width: 768px) {
          section {
            min-height: 500px !important;
          }
        }
        @media (max-width: 480px) {
          section {
            min-height: 460px !important;
          }
          .hero-btn-white,
          .hero-btn-red {
            width: 100%;
            justify-content: center;
          }
        }
      `}</style>
    </section>
  );
}
