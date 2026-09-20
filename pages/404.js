import Head from 'next/head';
import Link from 'next/link';
import Header from '../components/Header';
import Footer from '../components/Footer';

const QUICK_LINKS = [
  { icon: 'fa-solid fa-magnifying-glass', label: 'Track a Shipment', href: '/track', desc: 'Check your delivery status in real time.' },
  { icon: 'fa-solid fa-tag', label: 'Get a Quote', href: '/quote', desc: 'Receive a competitive rate for your cargo.' },
  { icon: 'fa-solid fa-user-plus', label: 'Create Account', href: '/signup', desc: 'Manage all your shipments in one place.' },
  { icon: 'fa-solid fa-headset', label: 'Contact Support', href: '/support', desc: 'Our team is available 24/7.' },
];

export default function NotFoundPage() {
  return (
    <>
      <Head>
        <title>Page Not Found — Josephdeliverycompany</title>
        <meta name="description" content="The page you're looking for doesn't exist. Return to the Josephdeliverycompany homepage." />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <Header />

      <main>
        {/* Hero block */}
        <section style={{
          backgroundColor: '#0a1f3c',
          padding: '80px 24px 72px',
          textAlign: 'center',
          position: 'relative',
          overflow: 'hidden',
        }}>
          {/* Decorative grid lines */}
          <div aria-hidden="true" style={{
            position: 'absolute', inset: 0, opacity: 0.05,
            backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 39px, #ffffff 40px), repeating-linear-gradient(90deg, transparent, transparent 39px, #ffffff 40px)',
          }} />

          <div style={{ position: 'relative', maxWidth: '640px', margin: '0 auto' }}>
            {/* 404 big number */}
            <div style={{
              fontSize: 'clamp(96px, 18vw, 160px)',
              fontWeight: 900,
              lineHeight: 1,
              letterSpacing: '-0.05em',
              marginBottom: '4px',
              userSelect: 'none',
            }}>
              <span style={{ color: '#ffffff' }}>4</span>
              <span style={{ color: '#c0392b' }}>0</span>
              <span style={{ color: '#ffffff' }}>4</span>
            </div>

            <p style={{
              fontSize: '11px',
              fontWeight: 700,
              letterSpacing: '3px',
              textTransform: 'uppercase',
              color: '#c0392b',
              marginBottom: '18px',
            }}>
              Route Not Found
            </p>

            <h1 style={{
              fontSize: 'clamp(22px, 3.5vw, 32px)',
              fontWeight: 700,
              color: '#ffffff',
              marginBottom: '16px',
              letterSpacing: '-0.3px',
            }}>
              This delivery went off course.
            </h1>

            <p style={{
              fontSize: 'clamp(14px, 1.8vw, 16px)',
              color: '#94a3b8',
              lineHeight: 1.7,
              marginBottom: '36px',
              maxWidth: '440px',
              margin: '0 auto 36px',
            }}>
              The page you requested doesn't exist or may have been moved. Let us help you find where you need to go.
            </p>

            <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
              <Link
                href="/"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '13px 26px',
                  backgroundColor: '#c0392b',
                  color: '#ffffff',
                  fontWeight: 700,
                  fontSize: '14px',
                  letterSpacing: '0.4px',
                  textDecoration: 'none',
                  borderRadius: '6px',
                }}
              >
                <i className="fa-solid fa-house" style={{ fontSize: '13px' }} />
                BACK TO HOME
              </Link>
              <Link
                href="/track"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '13px 26px',
                  backgroundColor: 'rgba(255,255,255,0.08)',
                  color: '#ffffff',
                  fontWeight: 600,
                  fontSize: '14px',
                  textDecoration: 'none',
                  borderRadius: '6px',
                  border: '1px solid rgba(255,255,255,0.18)',
                }}
              >
                <i className="fa-solid fa-magnifying-glass" style={{ fontSize: '13px' }} />
                Track Shipment
              </Link>
            </div>
          </div>
        </section>

        {/* Quick links grid */}
        <section style={{ backgroundColor: '#f4f5f7', padding: '64px 24px' }}>
          <div style={{ maxWidth: '900px', margin: '0 auto' }}>
            <p style={{ textAlign: 'center', fontSize: '11px', fontWeight: 700, letterSpacing: '2.5px', textTransform: 'uppercase', color: '#c0392b', marginBottom: '10px' }}>
              While You're Here
            </p>
            <h2 style={{ textAlign: 'center', fontSize: 'clamp(20px, 3vw, 28px)', fontWeight: 700, color: '#0a1f3c', marginBottom: '40px', letterSpacing: '-0.2px' }}>
              Popular destinations
            </h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '18px' }}>
              {QUICK_LINKS.map(({ icon, label, href, desc }) => (
                <Link
                  key={href}
                  href={href}
                  style={{
                    display: 'block',
                    backgroundColor: '#ffffff',
                    borderRadius: '10px',
                    padding: '28px 22px',
                    border: '1px solid #e2e6ea',
                    textDecoration: 'none',
                    transition: 'transform 0.15s, box-shadow 0.15s',
                  }}
                  onMouseOver={(e) => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = '0 8px 24px rgba(10,31,60,0.1)'; }}
                  onMouseOut={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none'; }}
                >
                  <div style={{
                    width: '44px', height: '44px', borderRadius: '8px',
                    backgroundColor: '#fff5f4', display: 'flex', alignItems: 'center',
                    justifyContent: 'center', marginBottom: '16px',
                  }}>
                    <i className={icon} style={{ fontSize: '18px', color: '#c0392b' }} />
                  </div>
                  <p style={{ fontSize: '14px', fontWeight: 700, color: '#0a1f3c', marginBottom: '6px' }}>{label}</p>
                  <p style={{ fontSize: '13px', color: '#64748b', lineHeight: 1.5 }}>{desc}</p>
                </Link>
              ))}
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}
