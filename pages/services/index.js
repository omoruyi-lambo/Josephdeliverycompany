import Head from 'next/head';
import Link from 'next/link';
import Header from '../../components/Header';
import Footer from '../../components/Footer';

const SERVICES = [
  { icon: 'fa-solid fa-bolt', title: 'Express Delivery', time: 'Next Day', price: 'From ₦4,500', desc: 'Next-business-day door-to-door delivery for time-critical parcels up to 30 kg anywhere in Nigeria.', href: '/services/express', img: 'https://images.unsplash.com/photo-1568702846914-96b305d2aaeb?auto=format&fit=crop&w=800&q=80' },
  { icon: 'fa-solid fa-truck', title: 'Domestic Shipping', time: '3–5 Days', price: 'From ₦1,800', desc: 'Reliable, affordable delivery across all 36 states and the FCT. Perfect for e-commerce and personal shipments.', href: '/services/domestic', img: 'https://images.unsplash.com/photo-1601584115197-04ecc0da31d7?auto=format&fit=crop&w=800&q=80' },
  { icon: 'fa-solid fa-earth-africa', title: 'International Shipping', time: '5–14 Days', price: 'From ₦18,000', desc: 'Cross-border delivery to 180+ countries. Full customs documentation and clearance support included.', href: '/services/international', img: 'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?auto=format&fit=crop&w=800&q=80' },
  { icon: 'fa-solid fa-pallet', title: 'Freight & Cargo', time: 'Custom', price: 'Custom Quote', desc: 'Road and air freight for heavy, oversized, or high-volume commercial cargo. Pallet and container solutions.', href: '/services/freight', img: 'https://images.unsplash.com/photo-1578575437130-527eed3abbec?auto=format&fit=crop&w=800&q=80' },
  { icon: 'fa-solid fa-building', title: 'Business Shipping', time: 'Flexible', price: 'Volume Rates', desc: 'Dedicated account management, bulk pricing, and API integration for businesses shipping at scale.', href: '/business', img: 'https://images.unsplash.com/photo-1553413077-190dd305871c?auto=format&fit=crop&w=800&q=80' },
  { icon: 'fa-solid fa-warehouse', title: 'Warehousing', time: 'Ongoing', price: 'Contact Us', desc: 'Short and long-term storage with inventory management. Fulfillment services available for e-commerce sellers.', href: '/contact', img: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=800&q=80' },
];

export default function ServicesPage() {
  return (
    <>
      <Head>
        <title>Services — Josephdeliverycompany</title>
        <meta name="description" content="Explore all Josephdeliverycompany delivery and logistics services: express, domestic, international, freight, business shipping, and warehousing." />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <Header />

      <section style={{ backgroundColor: '#0a1f3c', padding: '72px 24px 64px' }}>
        <div style={{ maxWidth: 760, margin: '0 auto', textAlign: 'center' }}>
          <p style={eyebrow}>What We Offer</p>
          <h1 style={{ fontSize: 'clamp(30px,5vw,50px)', fontWeight: 800, color: '#fff', letterSpacing: '-0.04em', marginBottom: 16, lineHeight: 1.08 }}>
            End-to-End Logistics Services
          </h1>
          <p style={{ fontSize: 'clamp(14px,1.8vw,17px)', color: '#94a3b8', lineHeight: 1.7 }}>
            From a single parcel to a full commercial supply chain — we have the infrastructure and expertise to move it.
          </p>
        </div>
      </section>

      <main style={{ backgroundColor: '#f4f5f7', padding: '64px 24px 80px' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(300px,1fr))', gap: 24 }}>
            {SERVICES.map(s => (
              <Link key={s.title} href={s.href} style={{ textDecoration: 'none', display: 'flex', flexDirection: 'column', backgroundColor: '#fff', borderRadius: 10, border: '1px solid #e2e6ea', overflow: 'hidden', transition: 'box-shadow 0.15s, transform 0.15s' }}
                onMouseOver={e => { e.currentTarget.style.boxShadow = '0 8px 28px rgba(10,31,60,0.1)'; e.currentTarget.style.transform = 'translateY(-3px)'; }}
                onMouseOut={e => { e.currentTarget.style.boxShadow = 'none'; e.currentTarget.style.transform = 'translateY(0)'; }}>
                <div style={{ height: 180, position: 'relative', backgroundColor: '#0a1f3c', overflow: 'hidden' }}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={s.img} alt={s.title} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} loading="lazy" />
                  <div style={{ position: 'absolute', inset: 0, backgroundColor: 'rgba(10,31,60,0.35)' }} />
                  <div style={{ position: 'absolute', top: 16, left: 16, width: 40, height: 40, borderRadius: 8, backgroundColor: 'rgba(255,255,255,0.12)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <i className={s.icon} style={{ fontSize: 17, color: '#fff' }} />
                  </div>
                </div>
                <div style={{ padding: '22px 24px 24px', flex: 1, display: 'flex', flexDirection: 'column' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                    <h3 style={{ fontSize: 16, fontWeight: 700, color: '#0a1f3c' }}>{s.title}</h3>
                    <span style={{ fontSize: 12, color: '#c0392b', fontWeight: 700 }}>{s.time}</span>
                  </div>
                  <p style={{ fontSize: 13, color: '#64748b', lineHeight: 1.6, flex: 1, marginBottom: 14 }}>{s.desc}</p>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #f1f5f9', paddingTop: 14 }}>
                    <span style={{ fontSize: 13, fontWeight: 600, color: '#374151' }}>{s.price}</span>
                    <span style={{ fontSize: 13, fontWeight: 700, color: '#0a1f3c', display: 'flex', alignItems: 'center', gap: 5 }}>
                      Details <i className="fa-solid fa-arrow-right" style={{ fontSize: 11 }} />
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </main>

      {/* Bottom CTA */}
      <section style={{ backgroundColor: '#0a1f3c', padding: '64px 24px', borderTop: '4px solid #c0392b' }}>
        <div style={{ maxWidth: 640, margin: '0 auto', textAlign: 'center' }}>
          <h2 style={{ fontSize: 'clamp(24px,4vw,38px)', fontWeight: 800, color: '#fff', marginBottom: 14, letterSpacing: '-0.3px' }}>Not sure which service fits?</h2>
          <p style={{ fontSize: 15, color: '#94a3b8', marginBottom: 32, lineHeight: 1.6 }}>Tell us what you need to ship and we'll recommend the best option and give you a price.</p>
          <Link href="/quote" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '13px 28px', backgroundColor: '#c0392b', color: '#fff', fontWeight: 700, fontSize: 14, textDecoration: 'none', borderRadius: 6, letterSpacing: '0.4px' }}>
            GET A FREE QUOTE
          </Link>
        </div>
      </section>

      <Footer />
    </>
  );
}

const eyebrow = { fontSize: 11, fontWeight: 700, letterSpacing: '3px', textTransform: 'uppercase', color: '#c0392b', marginBottom: 12 };
