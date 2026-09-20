import Head from 'next/head';
import Link from 'next/link';
import Header from '../components/Header';
import Footer from '../components/Footer';

const SHIPPING_OPTIONS = [
  {
    icon: 'fa-solid fa-bolt',
    title: 'Express Delivery',
    badge: 'Fastest',
    badgeColor: '#c0392b',
    time: 'Next Day',
    price: 'From ₦4,500',
    desc: 'When time is critical. Door-to-door pickup and delivery by the next business day for parcels up to 30 kg.',
    features: ['Next-business-day delivery', 'Real-time tracking', 'SMS & email alerts', 'Signature confirmation'],
    href: '/services/express',
  },
  {
    icon: 'fa-solid fa-truck',
    title: 'Standard Shipping',
    badge: 'Most Popular',
    badgeColor: '#0a1f3c',
    time: '3–5 Days',
    price: 'From ₦1,800',
    desc: 'Dependable, cost-effective delivery for non-urgent parcels across Nigeria. Ideal for e-commerce and personal shipments.',
    features: ['3–5 business days', 'Online tracking', 'Proof of delivery', 'Up to 70 kg'],
    href: '/services/domestic',
  },
  {
    icon: 'fa-solid fa-earth-africa',
    title: 'International Shipping',
    badge: 'Global',
    badgeColor: '#1d6fa4',
    time: '5–14 Days',
    price: 'From ₦18,000',
    desc: 'Send parcels and documents to over 180 countries. Full customs documentation support included.',
    features: ['180+ countries', 'Customs clearance', 'Door-to-door', 'Insurance available'],
    href: '/services/international',
  },
  {
    icon: 'fa-solid fa-pallet',
    title: 'Freight & Cargo',
    badge: 'Heavy Load',
    badgeColor: '#6b4c11',
    time: 'Custom',
    price: 'Custom Quote',
    desc: 'Full truckload, part-load, and air freight solutions for large commercial shipments and industrial cargo.',
    features: ['Road & air freight', 'Pallet & container', 'Dedicated account manager', 'Warehousing available'],
    href: '/services/freight',
  },
];

const FEATURES = [
  { icon: 'fa-solid fa-shield-halved', title: 'Insured Shipments', desc: 'Every package is covered. Optional extended insurance for high-value cargo.' },
  { icon: 'fa-solid fa-location-dot', title: 'Live GPS Tracking', desc: 'Track your parcel in real time from pickup to delivery.' },
  { icon: 'fa-solid fa-headset', title: '24/7 Support', desc: 'Our logistics team is always on call — phone, email, or live chat.' },
  { icon: 'fa-solid fa-file-invoice', title: 'Instant Quotes', desc: 'Get accurate pricing in seconds. No hidden fees, ever.' },
  { icon: 'fa-solid fa-boxes-stacked', title: 'Bulk Shipping', desc: 'Volume discounts for businesses shipping regularly.' },
  { icon: 'fa-solid fa-clock-rotate-left', title: 'Scheduled Pickups', desc: 'Book recurring pickups that fit your business hours.' },
];

export default function ShippingPage() {
  return (
    <>
      <Head>
        <title>Shipping Services — Josephdeliverycompany</title>
        <meta name="description" content="Express, standard, international, and freight shipping options from Josephdeliverycompany. Fast, insured, and tracked delivery across Nigeria and worldwide." />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <Header />

      {/* Hero */}
      <section style={{ backgroundColor: '#0a1f3c', padding: '72px 24px 64px' }}>
        <div style={{ maxWidth: '860px', margin: '0 auto' }}>
          <p style={eyebrow}>Shipping</p>
          <h1 style={{ fontSize: 'clamp(30px,5vw,52px)', fontWeight: 800, color: '#fff', letterSpacing: '-0.04em', marginBottom: '18px', lineHeight: 1.08 }}>
            The Right Service<br />for Every Shipment
          </h1>
          <p style={{ fontSize: 'clamp(14px,1.8vw,17px)', color: '#94a3b8', lineHeight: 1.7, maxWidth: '540px', marginBottom: '36px' }}>
            From a single envelope to a full pallet, we have a delivery option built for your timeline and budget.
          </p>
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
            <Link href="/quote" style={btnRed}>GET A QUOTE</Link>
            <Link href="/track" style={btnGhost}>TRACK SHIPMENT</Link>
          </div>
        </div>
      </section>

      <main>
        {/* Shipping options */}
        <section style={{ backgroundColor: '#f4f5f7', padding: '72px 24px' }}>
          <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
            <SectionHeader eyebrow="Our Options" title="Choose Your Delivery Speed" />
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(240px,1fr))', gap: '20px' }}>
              {SHIPPING_OPTIONS.map(opt => (
                <div key={opt.title} style={{ background: '#fff', border: '1px solid #e2e6ea', borderRadius: '10px', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
                  <div style={{ padding: '28px 24px 0' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                      <div style={{ width: 48, height: 48, borderRadius: 8, backgroundColor: '#f4f5f7', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <i className={opt.icon} style={{ fontSize: 20, color: '#0a1f3c' }} />
                      </div>
                      <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: '1px', padding: '3px 9px', borderRadius: 20, color: '#fff', backgroundColor: opt.badgeColor }}>{opt.badge}</span>
                    </div>
                    <h3 style={{ fontSize: 17, fontWeight: 700, color: '#0a1f3c', marginBottom: 6 }}>{opt.title}</h3>
                    <div style={{ display: 'flex', gap: 16, marginBottom: 12 }}>
                      <span style={{ fontSize: 12, color: '#c0392b', fontWeight: 700 }}><i className="fa-regular fa-clock" style={{ marginRight: 5 }} />{opt.time}</span>
                      <span style={{ fontSize: 12, color: '#64748b', fontWeight: 600 }}>{opt.price}</span>
                    </div>
                    <p style={{ fontSize: 13, color: '#64748b', lineHeight: 1.6, marginBottom: 18 }}>{opt.desc}</p>
                    <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 22px', display: 'flex', flexDirection: 'column', gap: 8 }}>
                      {opt.features.map(f => (
                        <li key={f} style={{ fontSize: 13, color: '#374151', display: 'flex', alignItems: 'center', gap: 8 }}>
                          <i className="fa-solid fa-check" style={{ fontSize: 10, color: '#c0392b', flexShrink: 0 }} />{f}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div style={{ marginTop: 'auto', borderTop: '1px solid #f1f5f9', padding: '16px 24px' }}>
                    <Link href={opt.href} style={{ fontSize: 13, fontWeight: 700, color: '#0a1f3c', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 6 }}>
                      Learn more <i className="fa-solid fa-arrow-right" style={{ fontSize: 11 }} />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Features */}
        <section style={{ backgroundColor: '#fff', padding: '72px 24px', borderTop: '1px solid #e2e6ea' }}>
          <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
            <SectionHeader eyebrow="Why Choose Us" title="Built for Reliability" center />
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(280px,1fr))', gap: '24px' }}>
              {FEATURES.map(f => (
                <div key={f.title} style={{ display: 'flex', gap: 16 }}>
                  <div style={{ width: 44, height: 44, borderRadius: 8, backgroundColor: '#fff5f4', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <i className={f.icon} style={{ fontSize: 18, color: '#c0392b' }} />
                  </div>
                  <div>
                    <p style={{ fontSize: 14, fontWeight: 700, color: '#0a1f3c', marginBottom: 5 }}>{f.title}</p>
                    <p style={{ fontSize: 13, color: '#64748b', lineHeight: 1.6 }}>{f.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <BottomCTA />
      </main>
      <Footer />
    </>
  );
}

/* ── Shared helpers ─────────────────────────────────────────────────────── */
function SectionHeader({ eyebrow, title, center }) {
  return (
    <div style={{ textAlign: center ? 'center' : 'left', marginBottom: 40 }}>
      <p style={eyebrowStyle}>{eyebrow}</p>
      <h2 style={{ fontSize: 'clamp(22px,3vw,32px)', fontWeight: 700, color: '#0a1f3c', letterSpacing: '-0.3px' }}>{title}</h2>
    </div>
  );
}
function BottomCTA() {
  return (
    <section style={{ backgroundColor: '#0a1f3c', padding: '64px 24px', borderTop: '4px solid #c0392b' }}>
      <div style={{ maxWidth: 720, margin: '0 auto', textAlign: 'center' }}>
        <h2 style={{ fontSize: 'clamp(24px,4vw,40px)', fontWeight: 800, color: '#fff', marginBottom: 14, letterSpacing: '-0.3px' }}>Ready to send?</h2>
        <p style={{ fontSize: 15, color: '#94a3b8', marginBottom: 36, lineHeight: 1.6 }}>Get a free quote in under 60 seconds — no account required.</p>
        <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link href="/quote" style={btnRed}>GET A FREE QUOTE</Link>
          <Link href="/signup" style={btnGhost}>CREATE ACCOUNT</Link>
        </div>
      </div>
    </section>
  );
}

const eyebrow = { fontSize: 11, fontWeight: 700, letterSpacing: '3px', textTransform: 'uppercase', color: '#c0392b', marginBottom: 12 };
const eyebrowStyle = { fontSize: 11, fontWeight: 700, letterSpacing: '2.5px', textTransform: 'uppercase', color: '#c0392b', marginBottom: 10 };
const btnRed = { display: 'inline-flex', alignItems: 'center', gap: 8, padding: '13px 26px', backgroundColor: '#c0392b', color: '#fff', fontWeight: 700, fontSize: 14, letterSpacing: '0.4px', textDecoration: 'none', borderRadius: 6 };
const btnGhost = { display: 'inline-flex', alignItems: 'center', gap: 8, padding: '13px 26px', backgroundColor: 'rgba(255,255,255,0.08)', color: '#fff', fontWeight: 600, fontSize: 14, textDecoration: 'none', borderRadius: 6, border: '1px solid rgba(255,255,255,0.2)' };
