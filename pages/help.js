import Head from 'next/head';
import Link from 'next/link';
import Header from '../components/Header';
import Footer from '../components/Footer';

const CATEGORIES = [
  {
    icon: 'fa-solid fa-magnifying-glass', title: 'Tracking',
    articles: ['How to track my shipment', 'Why isn\'t my tracking updating?', 'What do tracking statuses mean?', 'Tracking via SMS'],
    href: '/faq#tracking',
  },
  {
    icon: 'fa-solid fa-box', title: 'Shipping & Delivery',
    articles: ['How to book a shipment', 'Packaging requirements', 'Delivery time estimates', 'Changing delivery address'],
    href: '/faq#shipping',
  },
  {
    icon: 'fa-solid fa-rotate-left', title: 'Returns',
    articles: ['How to return a parcel', 'Return policy overview', 'Refund processing times', 'Damaged items'],
    href: '/faq#returns',
  },
  {
    icon: 'fa-solid fa-file-invoice', title: 'Billing',
    articles: ['How invoices work', 'Payment methods accepted', 'Disputing a charge', 'Requesting a receipt'],
    href: '/faq#billing',
  },
  {
    icon: 'fa-solid fa-box-open', title: 'Claims',
    articles: ['Filing a lost parcel claim', 'Filing a damaged goods claim', 'Claim timelines', 'What\'s covered by insurance'],
    href: '/faq#claims',
  },
  {
    icon: 'fa-solid fa-building', title: 'Business Accounts',
    articles: ['Setting up a business account', 'API documentation', 'Volume discount structure', 'Invoicing options'],
    href: '/business',
  },
];

export default function HelpPage() {
  return (
    <>
      <Head>
        <title>Help Centre — Josephdeliverycompany</title>
        <meta name="description" content="Find answers to your questions about tracking, shipping, returns, billing, and more in the Josephdeliverycompany help centre." />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <Header />

      {/* Hero */}
      <section style={{ position: 'relative', backgroundColor: '#0a1f3c', overflow: 'hidden', padding: '72px 24px 64px', textAlign: 'center' }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="https://images.unsplash.com/photo-1556761175-b413da4baf72?auto=format&fit=crop&w=1800&q=80"
          alt="Help and support centre team"
          style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', opacity: 0.3 }}
        />
        <div style={{ position: 'absolute', inset: 0, backgroundColor: 'rgba(10,31,60,0.82)' }} />
        <div style={{ position: 'relative' }}>
        <p style={eyebrow}>Help Centre</p>
        <h1 style={{ fontSize: 'clamp(28px,5vw,50px)', fontWeight: 800, color: '#fff', letterSpacing: '-0.04em', marginBottom: 16, lineHeight: 1.08 }}>
          How Can We Help?
        </h1>
        <p style={{ fontSize: 'clamp(14px,1.8vw,16px)', color: '#94a3b8', lineHeight: 1.7, maxWidth: 480, margin: '0 auto 36px' }}>
          Browse articles, common questions, and step-by-step guides below — or contact our team directly.
        </p>
        {/* Quick actions */}
        <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link href="/track" style={btnWhite}><i className="fa-solid fa-magnifying-glass" style={{ fontSize: 13 }} /> TRACK SHIPMENT</Link>
          <Link href="/contact" style={btnGhost}>CONTACT SUPPORT</Link>
        </div>
        </div>
      </section>

      <main style={{ backgroundColor: '#f4f5f7', padding: '64px 24px 80px' }}>
        <div style={{ maxWidth: 1060, margin: '0 auto' }}>
          <h2 style={{ fontSize: 'clamp(18px,2.5vw,24px)', fontWeight: 700, color: '#0a1f3c', marginBottom: 28, letterSpacing: '-0.2px' }}>Browse by Topic</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(300px,1fr))', gap: 20 }}>
            {CATEGORIES.map(cat => (
              <div key={cat.title} style={{ backgroundColor: '#fff', border: '1px solid #e2e6ea', borderRadius: 10, padding: '24px 24px 20px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 18 }}>
                  <div style={{ width: 40, height: 40, borderRadius: 8, backgroundColor: '#fff5f4', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <i className={cat.icon} style={{ fontSize: 16, color: '#c0392b' }} />
                  </div>
                  <h3 style={{ fontSize: 15, fontWeight: 700, color: '#0a1f3c' }}>{cat.title}</h3>
                </div>
                <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 16px', display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {cat.articles.map(a => (
                    <li key={a}>
                      <Link href={cat.href} style={{ fontSize: 13, color: '#374151', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 8 }}
                        onMouseOver={e => e.currentTarget.style.color = '#c0392b'}
                        onMouseOut={e => e.currentTarget.style.color = '#374151'}>
                        <i className="fa-solid fa-angle-right" style={{ fontSize: 10, color: '#c0392b', flexShrink: 0 }} />
                        {a}
                      </Link>
                    </li>
                  ))}
                </ul>
                <Link href={cat.href} style={{ fontSize: 13, fontWeight: 700, color: '#c0392b', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 6 }}>
                  See all articles <i className="fa-solid fa-arrow-right" style={{ fontSize: 10 }} />
                </Link>
              </div>
            ))}
          </div>

          {/* Still need help */}
          <div style={{ backgroundColor: '#0a1f3c', borderRadius: 12, padding: '36px 32px', marginTop: 40, display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: 20 }}>
            <div>
              <p style={{ fontSize: 18, fontWeight: 700, color: '#fff', marginBottom: 6 }}>Still need help?</p>
              <p style={{ fontSize: 14, color: '#94a3b8' }}>Send the support team a message through the secure contact form.</p>
            </div>
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
              <Link href="/contact" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '11px 20px', backgroundColor: 'rgba(255,255,255,0.1)', color: '#fff', fontWeight: 600, fontSize: 13, textDecoration: 'none', borderRadius: 6, border: '1px solid rgba(255,255,255,0.15)' }}>
                <i className="fa-solid fa-envelope" /> Email Us
              </Link>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}

const eyebrow = { fontSize: 11, fontWeight: 700, letterSpacing: '3px', textTransform: 'uppercase', color: '#c0392b', marginBottom: 12 };
const btnWhite = { display: 'inline-flex', alignItems: 'center', gap: 8, padding: '13px 24px', backgroundColor: '#fff', color: '#0a1f3c', fontWeight: 700, fontSize: 14, textDecoration: 'none', borderRadius: 6 };
const btnGhost = { display: 'inline-flex', alignItems: 'center', gap: 8, padding: '13px 24px', backgroundColor: 'rgba(255,255,255,0.08)', color: '#fff', fontWeight: 600, fontSize: 14, textDecoration: 'none', borderRadius: 6, border: '1px solid rgba(255,255,255,0.2)' };
