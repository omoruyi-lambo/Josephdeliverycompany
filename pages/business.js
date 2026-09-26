import Head from 'next/head';
import Link from 'next/link';
import Header from '../components/Header';
import Footer from '../components/Footer';

const PLANS = [
  {
    name: 'Starter',
    price: '$0 / month',
    desc: 'Pay as you ship. Ideal for small businesses just getting started.',
    features: ['Up to 50 shipments/month', 'Standard & express delivery', 'Online tracking', 'Email support', 'Monthly invoice'],
    cta: 'Start Free',
    href: '/signup',
    highlight: false,
  },
  {
    name: 'Business',
    price: '$149 / month',
    desc: 'Discounted rates and priority handling for growing businesses.',
    features: ['Up to 300 shipments/month', 'Up to 15% volume discount', 'Priority pickup slots', 'Dedicated account manager', 'API integration', 'Weekly reports'],
    cta: 'Get Started',
    href: '/quote',
    highlight: true,
  },
  {
    name: 'Enterprise',
    price: 'Custom',
    desc: 'Full-service logistics for high-volume shippers and enterprises.',
    features: ['Unlimited shipments', 'Custom rate negotiation', 'Freight & cargo included', 'Warehousing available', 'SLA guarantee', 'On-site support'],
    cta: 'Contact Sales',
    href: '/contact',
    highlight: false,
  },
];

const FEATURES = [
  { icon: 'fa-solid fa-chart-line', title: 'Volume Discounts', desc: 'The more you ship, the more you save — rates reduce automatically as your volume grows.' },
  { icon: 'fa-solid fa-user-tie', title: 'Dedicated Account Manager', desc: 'A named contact who knows your business, handles issues, and proactively communicates on your behalf.' },
  { icon: 'fa-solid fa-plug', title: 'API & Integrations', desc: 'REST API, Shopify plugin, and WooCommerce integration for seamless order fulfilment.' },
  { icon: 'fa-solid fa-file-invoice', title: 'Consolidated Billing', desc: 'One invoice, one payment, full itemised breakdown — monthly or weekly.' },
  { icon: 'fa-solid fa-warehouse', title: 'Warehousing & Fulfilment', desc: 'Store your stock with us and we pick, pack, and ship every order on your behalf.' },
  { icon: 'fa-solid fa-shield-halved', title: 'SLA Guarantees', desc: 'Business and Enterprise plans include written service-level agreements with defined compensation.' },
];

export default function BusinessPage() {
  return (
    <>
      <Head>
        <title>Business Shipping — Josephdeliverycompany</title>
        <meta name="description" content="Josephdeliverycompany business shipping plans with volume discounts, dedicated account management, API integration, and SLA guarantees." />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <Header />

      {/* Hero */}
      <section style={{ position: 'relative', backgroundColor: '#0a1f3c', overflow: 'hidden', padding: '80px 24px 72px' }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="https://images.unsplash.com/photo-1513828583688-c52646db42da?auto=format&fit=crop&w=1800&q=80"
          alt="Business logistics and warehouse operations"
          style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', opacity: 0.3 }}
        />
        <div style={{ position: 'absolute', inset: 0, backgroundColor: 'rgba(10,31,60,0.82)' }} />
        <div style={{ position: 'relative', maxWidth: 860, margin: '0 auto' }}>
          <p style={eyebrow}>For Businesses</p>
          <h1 style={{ fontSize: 'clamp(30px,5vw,52px)', fontWeight: 800, color: '#fff', letterSpacing: '-0.04em', marginBottom: 18, lineHeight: 1.08 }}>
            Logistics Built for<br />Business Scale
          </h1>
          <p style={{ fontSize: 'clamp(14px,1.8vw,17px)', color: '#94a3b8', lineHeight: 1.7, maxWidth: 540, marginBottom: 36 }}>
            From a local shop processing 20 orders a week to an enterprise moving thousands of pallets, we have a plan that grows with you.
          </p>
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            <Link href="/quote" style={btnRed}>GET A BUSINESS QUOTE</Link>
            <Link href="/contact" style={btnGhost}>TALK TO SALES</Link>
          </div>
        </div>
      </section>

      <main>
        {/* Features */}
        <section style={{ backgroundColor: '#fff', padding: '72px 24px', borderBottom: '1px solid #e2e6ea' }}>
          <div style={{ maxWidth: 1060, margin: '0 auto' }}>
            <div style={{ textAlign: 'center', marginBottom: 48 }}>
              <p style={eyebrowDark}>Why Josephdeliverycompany for Business</p>
              <h2 style={{ fontSize: 'clamp(22px,3vw,32px)', fontWeight: 700, color: '#0a1f3c', letterSpacing: '-0.3px' }}>Everything Your Business Needs</h2>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(280px,1fr))', gap: 24 }}>
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

        {/* Pricing */}
        <section style={{ backgroundColor: '#f4f5f7', padding: '72px 24px', borderBottom: '1px solid #e2e6ea' }}>
          <div style={{ maxWidth: 1000, margin: '0 auto' }}>
            <div style={{ textAlign: 'center', marginBottom: 48 }}>
              <p style={eyebrowDark}>Pricing Plans</p>
              <h2 style={{ fontSize: 'clamp(22px,3vw,32px)', fontWeight: 700, color: '#0a1f3c', letterSpacing: '-0.3px' }}>Simple, Transparent Pricing</h2>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(280px,1fr))', gap: 20 }}>
              {PLANS.map(plan => (
                <div key={plan.name} style={{ backgroundColor: '#fff', border: `2px solid ${plan.highlight ? '#c0392b' : '#e2e6ea'}`, borderRadius: 12, overflow: 'hidden', display: 'flex', flexDirection: 'column', position: 'relative' }}>
                  {plan.highlight && (
                    <div style={{ backgroundColor: '#c0392b', padding: '5px 16px', textAlign: 'center' }}>
                      <p style={{ fontSize: 11, fontWeight: 700, color: '#fff', letterSpacing: '1.5px', textTransform: 'uppercase' }}>Most Popular</p>
                    </div>
                  )}
                  <div style={{ padding: '28px 28px 24px', flex: 1 }}>
                    <p style={{ fontSize: 13, fontWeight: 700, color: '#c0392b', textTransform: 'uppercase', letterSpacing: '1.5px', marginBottom: 8 }}>{plan.name}</p>
                    <p style={{ fontSize: 'clamp(22px,3vw,30px)', fontWeight: 900, color: '#0a1f3c', letterSpacing: '-0.04em', marginBottom: 10 }}>{plan.price}</p>
                    <p style={{ fontSize: 13, color: '#64748b', lineHeight: 1.6, marginBottom: 22 }}>{plan.desc}</p>
                    <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 24px', display: 'flex', flexDirection: 'column', gap: 10 }}>
                      {plan.features.map(f => (
                        <li key={f} style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 13, color: '#374151' }}>
                          <i className="fa-solid fa-check" style={{ fontSize: 10, color: '#c0392b', flexShrink: 0 }} />{f}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div style={{ padding: '0 28px 28px' }}>
                    <Link href={plan.href} style={{ display: 'block', textAlign: 'center', padding: '13px', backgroundColor: plan.highlight ? '#c0392b' : '#0a1f3c', color: '#fff', fontWeight: 700, fontSize: 14, textDecoration: 'none', borderRadius: 6, letterSpacing: '0.3px' }}>
                      {plan.cta}
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Trusted by */}
        <section style={{ backgroundColor: '#fff', padding: '56px 24px', borderBottom: '1px solid #e2e6ea' }}>
          <div style={{ maxWidth: 860, margin: '0 auto', textAlign: 'center' }}>
            <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: '2.5px', textTransform: 'uppercase', color: '#94a3b8', marginBottom: 28 }}>Trusted by Businesses Across Nigeria</p>
            <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 16 }}>
              {['E-Commerce', 'Healthcare', 'Manufacturing', 'Retail', 'Legal & Finance', 'Agriculture'].map(sector => (
                <span key={sector} style={{ padding: '10px 18px', backgroundColor: '#f4f5f7', borderRadius: 20, fontSize: 13, fontWeight: 600, color: '#374151' }}>{sector}</span>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section style={{ backgroundColor: '#0a1f3c', padding: '64px 24px', borderTop: '4px solid #c0392b' }}>
          <div style={{ maxWidth: 620, margin: '0 auto', textAlign: 'center' }}>
            <h2 style={{ fontSize: 'clamp(24px,4vw,38px)', fontWeight: 800, color: '#fff', marginBottom: 14, letterSpacing: '-0.3px' }}>Ready to scale your shipping?</h2>
            <p style={{ fontSize: 15, color: '#94a3b8', marginBottom: 32, lineHeight: 1.6 }}>Our sales team will build a custom plan around your volume and route requirements.</p>
            <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
              <Link href="/quote" style={btnRed}>GET A BUSINESS QUOTE</Link>
              <Link href="/contact" style={btnGhost}>SPEAK TO SALES</Link>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}

const eyebrow = { fontSize: 11, fontWeight: 700, letterSpacing: '3px', textTransform: 'uppercase', color: '#c0392b', marginBottom: 12 };
const eyebrowDark = { fontSize: 11, fontWeight: 700, letterSpacing: '2.5px', textTransform: 'uppercase', color: '#c0392b', marginBottom: 10 };
const btnRed = { display: 'inline-flex', alignItems: 'center', gap: 8, padding: '13px 26px', backgroundColor: '#c0392b', color: '#fff', fontWeight: 700, fontSize: 14, letterSpacing: '0.4px', textDecoration: 'none', borderRadius: 6 };
const btnGhost = { display: 'inline-flex', alignItems: 'center', gap: 8, padding: '13px 26px', backgroundColor: 'rgba(255,255,255,0.08)', color: '#fff', fontWeight: 600, fontSize: 14, textDecoration: 'none', borderRadius: 6, border: '1px solid rgba(255,255,255,0.2)' };
