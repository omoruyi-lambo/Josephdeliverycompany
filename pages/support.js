import Head from 'next/head';
import Link from 'next/link';
import Header from '../components/Header';
import Footer from '../components/Footer';

const CHANNELS = [
  { icon: 'fa-solid fa-envelope', title: 'Contact Support', detail: 'Secure contact form', sub: 'Send a message to the support team', href: '/contact', cta: 'Open Form' },
  { icon: 'fa-solid fa-magnifying-glass', title: 'Track a Shipment', detail: 'Live shipment lookup', sub: 'Use your tracking number to view updates', href: '/track', cta: 'Track Shipment' },
];

const TOPICS = [
  { icon: 'fa-solid fa-magnifying-glass', label: 'Track a Shipment', href: '/track' },
  { icon: 'fa-solid fa-tag', label: 'Get a Quote', href: '/quote' },
  { icon: 'fa-solid fa-circle-question', label: 'FAQs', href: '/faq' },
  { icon: 'fa-solid fa-rotate-left', label: 'Returns & Refunds', href: '/faq#returns' },
  { icon: 'fa-solid fa-file-invoice', label: 'Billing & Invoices', href: '/faq#billing' },
  { icon: 'fa-solid fa-box-open', label: 'Damaged or Lost Parcel', href: '/faq#claims' },
];

export default function SupportPage() {
  return (
    <>
      <Head>
        <title>Support — Josephdeliverycompany</title>
        <meta name="description" content="Get help with your Josephdeliverycompany shipment through the secure support form and self-service resources." />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <Header />

      {/* Hero */}
      <section style={{ position: 'relative', backgroundColor: '#0a1f3c', overflow: 'hidden', padding: '72px 24px 64px' }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&w=1800&q=80"
          alt="Logistics customer support team ready to help"
          style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', opacity: 0.3 }}
        />
        <div style={{ position: 'absolute', inset: 0, backgroundColor: 'rgba(10,31,60,0.82)' }} />
        <div style={{ position: 'relative', maxWidth: 760, margin: '0 auto', textAlign: 'center' }}>
          <p style={eyebrow}>Help Centre</p>
          <h1 style={{ fontSize: 'clamp(30px,5vw,50px)', fontWeight: 800, color: '#fff', letterSpacing: '-0.04em', marginBottom: 16, lineHeight: 1.08 }}>
            We're Here to Help
          </h1>
          <p style={{ fontSize: 'clamp(14px,1.8vw,17px)', color: '#94a3b8', lineHeight: 1.7, maxWidth: 500, margin: '0 auto' }}>
            Find shipment help, browse common topics, or send a secure message to our support team.
          </p>
        </div>
      </section>

      <main>
        {/* Contact channels */}
        <section style={{ backgroundColor: '#f4f5f7', padding: '64px 24px' }}>
          <div style={{ maxWidth: 1000, margin: '0 auto' }}>
            <SH eyebrow="Get in Touch" title="Contact Options" />
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(220px,1fr))', gap: 20 }}>
              {CHANNELS.map(c => (
                <div key={c.title} style={{ backgroundColor: '#fff', border: '1px solid #e2e6ea', borderRadius: 10, padding: '28px 24px', display: 'flex', flexDirection: 'column', gap: 14 }}>
                  <div style={{ width: 48, height: 48, borderRadius: 10, backgroundColor: '#fff5f4', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <i className={c.icon} style={{ fontSize: 20, color: '#c0392b' }} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <p style={{ fontSize: 15, fontWeight: 700, color: '#0a1f3c', marginBottom: 4 }}>{c.title}</p>
                    <p style={{ fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 4 }}>{c.detail}</p>
                    <p style={{ fontSize: 12, color: '#94a3b8' }}>{c.sub}</p>
                  </div>
                  <a href={c.href} style={{ display: 'inline-flex', alignItems: 'center', gap: 7, fontSize: 13, fontWeight: 700, color: '#c0392b', textDecoration: 'none' }}>
                    {c.cta} <i className="fa-solid fa-arrow-right" style={{ fontSize: 10 }} />
                  </a>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Quick topics */}
        <section style={{ backgroundColor: '#fff', padding: '64px 24px', borderTop: '1px solid #e2e6ea' }}>
          <div style={{ maxWidth: 1000, margin: '0 auto' }}>
            <SH eyebrow="Self-Service" title="Common Topics" center />
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(180px,1fr))', gap: 14 }}>
              {TOPICS.map(t => (
                <Link key={t.label} href={t.href} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '16px 18px', backgroundColor: '#f8fafc', border: '1px solid #e2e6ea', borderRadius: 8, textDecoration: 'none', transition: 'border-color 0.15s, background 0.15s' }}
                  onMouseOver={e => { e.currentTarget.style.borderColor = '#c0392b'; e.currentTarget.style.backgroundColor = '#fff5f4'; }}
                  onMouseOut={e => { e.currentTarget.style.borderColor = '#e2e6ea'; e.currentTarget.style.backgroundColor = '#f8fafc'; }}>
                  <i className={t.icon} style={{ fontSize: 15, color: '#c0392b', flexShrink: 0 }} />
                  <span style={{ fontSize: 13, fontWeight: 600, color: '#0a1f3c' }}>{t.label}</span>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* Support contact CTA */}
        <section style={{ backgroundColor: '#0a1f3c', padding: '64px 24px', borderTop: '4px solid #c0392b' }}>
          <div style={{ maxWidth: 800, margin: '0 auto' }}>
            <div style={{ maxWidth: 650, margin: '0 auto', textAlign: 'center' }}><i className="fa-solid fa-envelope-open-text" style={{ fontSize: 25, color: '#c0392b', marginBottom: 14 }} /><h2 style={{ color: '#fff', fontSize: 24, marginBottom: 10 }}>Still need help?</h2><p style={{ color: '#94a3b8', fontSize: 14, lineHeight: 1.6, marginBottom: 22 }}>Send the support team the details of your question and we will review your message.</p><Link href="/contact" style={{ display: 'inline-flex', padding: '11px 20px', backgroundColor: '#c0392b', color: '#fff', fontWeight: 700, fontSize: 13, textDecoration: 'none', borderRadius: 6 }}>Contact support <i className="fa-solid fa-arrow-right" style={{ marginLeft: 8 }} /></Link></div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}

function SH({ eyebrow: e, title, center }) {
  return (
    <div style={{ textAlign: center ? 'center' : 'left', marginBottom: 36 }}>
      <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: '2.5px', textTransform: 'uppercase', color: '#c0392b', marginBottom: 10 }}>{e}</p>
      <h2 style={{ fontSize: 'clamp(20px,3vw,30px)', fontWeight: 700, color: '#0a1f3c', letterSpacing: '-0.3px' }}>{title}</h2>
    </div>
  );
}

const eyebrow = { fontSize: 11, fontWeight: 700, letterSpacing: '3px', textTransform: 'uppercase', color: '#c0392b', marginBottom: 12 };
