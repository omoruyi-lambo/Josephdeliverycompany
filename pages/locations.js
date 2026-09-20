import Head from 'next/head';
import Link from 'next/link';
import Header from '../components/Header';
import Footer from '../components/Footer';

const LOCATIONS = [
  {
    city: 'Lagos',
    type: 'Head Office & Hub',
    address: '14 Marina Street, Lagos Island, Lagos',
    phone: '+234 801 234 5678',
    hours: 'Mon–Fri 7am–9pm · Sat 8am–6pm · Sun 10am–4pm',
    services: ['Express Drop-off', 'Standard Shipping', 'Freight Booking', 'Returns', 'Packaging'],
    featured: true,
  },
  {
    city: 'Abuja',
    type: 'Regional Hub',
    address: '7 Aminu Kano Crescent, Wuse 2, Abuja FCT',
    phone: '+234 802 345 6789',
    hours: 'Mon–Fri 8am–8pm · Sat 8am–5pm · Sun Closed',
    services: ['Express Drop-off', 'Standard Shipping', 'Returns', 'Packaging'],
    featured: true,
  },
  {
    city: 'Port Harcourt',
    type: 'Regional Hub',
    address: '22 Old Aba Road, Rumuola, Port Harcourt',
    phone: '+234 803 456 7890',
    hours: 'Mon–Fri 8am–7pm · Sat 9am–4pm · Sun Closed',
    services: ['Express Drop-off', 'Standard Shipping', 'Freight Booking', 'Returns'],
    featured: false,
  },
  {
    city: 'Kano',
    type: 'Service Centre',
    address: '5 Bello Road, Nasarawa, Kano',
    phone: '+234 804 567 8901',
    hours: 'Mon–Fri 8am–6pm · Sat 9am–3pm · Sun Closed',
    services: ['Standard Shipping', 'Returns', 'Packaging'],
    featured: false,
  },
  {
    city: 'Ibadan',
    type: 'Service Centre',
    address: '11 Ring Road, Ibadan, Oyo State',
    phone: '+234 805 678 9012',
    hours: 'Mon–Fri 8am–6pm · Sat 9am–3pm · Sun Closed',
    services: ['Express Drop-off', 'Standard Shipping', 'Returns'],
    featured: false,
  },
  {
    city: 'Enugu',
    type: 'Service Centre',
    address: '3 Ogui Road, Independence Layout, Enugu',
    phone: '+234 806 789 0123',
    hours: 'Mon–Fri 8am–6pm · Sat 9am–3pm · Sun Closed',
    services: ['Standard Shipping', 'Returns'],
    featured: false,
  },
];

const STATS = [
  { n: '6', label: 'Service Locations' },
  { n: '36', label: 'States Covered' },
  { n: '180+', label: 'Countries Reached' },
  { n: '24/7', label: 'Online Tracking' },
];

export default function LocationsPage() {
  return (
    <>
      <Head>
        <title>Locations — Josephdeliverycompany</title>
        <meta name="description" content="Find a Josephdeliverycompany service location near you. Depots in Lagos, Abuja, Port Harcourt, Kano, Ibadan, and Enugu." />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <Header />

      {/* Hero */}
      <section style={{ backgroundColor: '#0a1f3c', padding: '72px 24px 64px' }}>
        <div style={{ maxWidth: 860, margin: '0 auto' }}>
          <p style={eyebrow}>Find Us</p>
          <h1 style={{ fontSize: 'clamp(30px,5vw,52px)', fontWeight: 800, color: '#fff', letterSpacing: '-0.04em', marginBottom: 18, lineHeight: 1.08 }}>
            We're Close to You
          </h1>
          <p style={{ fontSize: 'clamp(14px,1.8vw,17px)', color: '#94a3b8', lineHeight: 1.7, maxWidth: 520, marginBottom: 40 }}>
            Six service locations across Nigeria — plus nationwide door-to-door pickup and delivery for every service.
          </p>
          {/* Stats */}
          <div style={{ display: 'flex', gap: 32, flexWrap: 'wrap' }}>
            {STATS.map(s => (
              <div key={s.label}>
                <p style={{ fontSize: 'clamp(24px,4vw,40px)', fontWeight: 900, color: '#fff', letterSpacing: '-0.04em', lineHeight: 1 }}>{s.n}</p>
                <p style={{ fontSize: 12, color: '#94a3b8', marginTop: 4, textTransform: 'uppercase', letterSpacing: '1.5px', fontWeight: 600 }}>{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <main>
        {/* Location cards */}
        <section style={{ backgroundColor: '#f4f5f7', padding: '64px 24px 80px' }}>
          <div style={{ maxWidth: 1100, margin: '0 auto' }}>
            <div style={{ marginBottom: 40 }}>
              <p style={eyebrowDark}>All Locations</p>
              <h2 style={{ fontSize: 'clamp(22px,3vw,32px)', fontWeight: 700, color: '#0a1f3c', letterSpacing: '-0.3px' }}>Service Centres & Hubs</h2>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(300px,1fr))', gap: 20 }}>
              {LOCATIONS.map(loc => (
                <div key={loc.city} style={{ backgroundColor: '#fff', border: `1px solid ${loc.featured ? '#c0392b' : '#e2e6ea'}`, borderRadius: 10, overflow: 'hidden' }}>
                  {loc.featured && (
                    <div style={{ backgroundColor: '#c0392b', padding: '5px 16px' }}>
                      <p style={{ fontSize: 11, fontWeight: 700, color: '#fff', letterSpacing: '1.5px', textTransform: 'uppercase' }}>Major Hub</p>
                    </div>
                  )}
                  <div style={{ padding: '24px 24px 20px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14 }}>
                      <div>
                        <h3 style={{ fontSize: 18, fontWeight: 800, color: '#0a1f3c', marginBottom: 3 }}>{loc.city}</h3>
                        <p style={{ fontSize: 11, fontWeight: 600, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '1px' }}>{loc.type}</p>
                      </div>
                      <div style={{ width: 40, height: 40, borderRadius: 8, backgroundColor: '#f4f5f7', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        <i className="fa-solid fa-location-dot" style={{ fontSize: 16, color: '#c0392b' }} />
                      </div>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 18 }}>
                      <Row icon="fa-solid fa-map-pin" text={loc.address} />
                      <Row icon="fa-solid fa-phone" text={loc.phone} />
                      <Row icon="fa-regular fa-clock" text={loc.hours} />
                    </div>

                    <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: 14 }}>
                      <p style={{ fontSize: 11, fontWeight: 700, color: '#374151', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: 8 }}>Services Available</p>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                        {loc.services.map(s => (
                          <span key={s} style={{ fontSize: 11, padding: '3px 9px', backgroundColor: '#f4f5f7', borderRadius: 20, color: '#374151', fontWeight: 500 }}>{s}</span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Pickup CTA */}
        <section style={{ backgroundColor: '#0a1f3c', padding: '64px 24px', borderTop: '4px solid #c0392b' }}>
          <div style={{ maxWidth: 640, margin: '0 auto', textAlign: 'center' }}>
            <h2 style={{ fontSize: 'clamp(22px,3.5vw,36px)', fontWeight: 800, color: '#fff', marginBottom: 14, letterSpacing: '-0.3px' }}>
              No depot near you?
            </h2>
            <p style={{ fontSize: 15, color: '#94a3b8', marginBottom: 32, lineHeight: 1.7 }}>
              We collect from your address anywhere in Nigeria. Book a pickup and a courier will come to you.
            </p>
            <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
              <Link href="/quote" style={btnRed}>BOOK A PICKUP</Link>
              <Link href="/contact" style={btnGhost}>CONTACT US</Link>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}

function Row({ icon, text }) {
  return (
    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
      <i className={icon} style={{ fontSize: 12, color: '#c0392b', marginTop: 2, flexShrink: 0 }} />
      <p style={{ fontSize: 13, color: '#4a5568', lineHeight: 1.5 }}>{text}</p>
    </div>
  );
}

const eyebrow = { fontSize: 11, fontWeight: 700, letterSpacing: '3px', textTransform: 'uppercase', color: '#c0392b', marginBottom: 12 };
const eyebrowDark = { fontSize: 11, fontWeight: 700, letterSpacing: '2.5px', textTransform: 'uppercase', color: '#c0392b', marginBottom: 10 };
const btnRed = { display: 'inline-flex', alignItems: 'center', gap: 8, padding: '13px 26px', backgroundColor: '#c0392b', color: '#fff', fontWeight: 700, fontSize: 14, letterSpacing: '0.4px', textDecoration: 'none', borderRadius: 6 };
const btnGhost = { display: 'inline-flex', alignItems: 'center', gap: 8, padding: '13px 26px', backgroundColor: 'rgba(255,255,255,0.08)', color: '#fff', fontWeight: 600, fontSize: 14, textDecoration: 'none', borderRadius: 6, border: '1px solid rgba(255,255,255,0.2)' };
