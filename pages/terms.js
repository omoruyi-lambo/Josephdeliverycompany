import Head from 'next/head';
import Link from 'next/link';
import Header from '../components/Header';
import Footer from '../components/Footer';

const SECTIONS = [
  {
    title: '1. Acceptance of Terms',
    body: `By booking a shipment, creating an account, or using any Josephdeliverycompany service, you agree to be bound by these Terms of Service. If you do not agree, you must not use our services.`,
  },
  {
    title: '2. Services',
    body: `Josephdeliverycompany provides parcel collection, transportation, and delivery services within Nigeria and internationally, as described on our website. We reserve the right to refuse any shipment at our discretion.`,
  },
  {
    title: '3. Prohibited Items',
    body: `You must not ship firearms or ammunition, illegal drugs or controlled substances, live animals (except as pre-arranged), perishable goods (without prior arrangement), currency or negotiable instruments, hazardous materials not declared and packaged in accordance with IATA/ADR regulations, or counterfeit or stolen goods.\n\nYou accept full legal liability for the contents of your shipment.`,
  },
  {
    title: '4. Pricing and Payment',
    body: `Prices are calculated at the time of booking based on weight, dimensions, service type, and destination. All prices are in United States Dollars (USD, $) unless otherwise stated. Payment is due at the time of booking unless you hold a credit account.\n\nWe reserve the right to apply surcharges for remote areas, oversize items, fuel, or security screening.`,
  },
  {
    title: '5. Liability',
    body: `Our liability for lost or damaged shipments is limited to $500 per shipment unless extended insurance is purchased at checkout. We are not liable for indirect or consequential losses, including loss of business or income.\n\nWe are not liable for delays caused by circumstances beyond our reasonable control, including weather, industrial action, or customs delays.`,
  },
  {
    title: '6. Claims',
    body: `Claims for loss must be submitted within 30 days of the scheduled delivery date. Claims for damage must be submitted within 48 hours of delivery. Claims must be submitted in writing to support@josephdeliverycompany.com with supporting documentation.`,
  },
  {
    title: '7. Tracking and Data',
    body: `Tracking data is provided for informational purposes. Josephdeliverycompany does not guarantee the accuracy of estimated delivery times. By using our tracking service you agree to our Privacy Policy.`,
  },
  {
    title: '8. Account Termination',
    body: `We may suspend or terminate your account if you breach these terms, use our services fraudulently, or fail to make payment. You may close your account at any time by contacting support.`,
  },
  {
    title: '9. Governing Law',
    body: `These terms are governed by the laws of the Federal Republic of Nigeria. Any disputes shall be resolved in the courts of Lagos State, Nigeria.`,
  },
  {
    title: '10. Changes to Terms',
    body: `We may update these terms from time to time. We will notify you of material changes by email at least 14 days before they take effect. Continued use of our services after that date constitutes acceptance of the updated terms.`,
  },
];

export default function TermsPage() {
  return (
    <>
      <Head>
        <title>Terms of Service — Josephdeliverycompany</title>
        <meta name="description" content="Josephdeliverycompany Terms of Service — the rules governing your use of our shipping and logistics services." />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <Header />

      <section style={{ position: 'relative', backgroundColor: '#0a1f3c', overflow: 'hidden', padding: '64px 24px 56px' }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&w=1800&q=80"
          alt="Legal terms and contract documentation"
          style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', opacity: 0.28 }}
        />
        <div style={{ position: 'absolute', inset: 0, backgroundColor: 'rgba(10,31,60,0.84)' }} />
        <div style={{ position: 'relative', maxWidth: 760, margin: '0 auto' }}>
          <p style={eyebrow}>Legal</p>
          <h1 style={{ fontSize: 'clamp(26px,4vw,42px)', fontWeight: 800, color: '#fff', letterSpacing: '-0.04em', marginBottom: 12, lineHeight: 1.1 }}>Terms of Service</h1>
          <p style={{ fontSize: 13, color: '#94a3b8' }}>Last updated: 1 January 2026</p>
        </div>
      </section>

      <main style={{ backgroundColor: '#f4f5f7', padding: '56px 24px 80px' }}>
        <div style={{ maxWidth: 760, margin: '0 auto' }}>
          <div style={{ backgroundColor: '#fff', border: '1px solid #e2e6ea', borderRadius: 12, padding: 'clamp(24px,5vw,44px)' }}>
            <p style={{ fontSize: 15, color: '#4a5568', lineHeight: 1.8, marginBottom: 32 }}>
              These Terms of Service ("Terms") govern your use of Josephdeliverycompany's website, mobile applications, and logistics services. Please read them carefully before using our services.
            </p>
            {SECTIONS.map(s => (
              <div key={s.title} style={{ marginBottom: 32, paddingBottom: 32, borderBottom: '1px solid #f1f5f9' }}>
                <h2 style={{ fontSize: 16, fontWeight: 700, color: '#0a1f3c', marginBottom: 12 }}>{s.title}</h2>
                {s.body.split('\n\n').map((para, i) => (
                  <p key={i} style={{ fontSize: 14, color: '#4a5568', lineHeight: 1.8, marginBottom: i < s.body.split('\n\n').length - 1 ? 14 : 0, whiteSpace: 'pre-line' }}>{para}</p>
                ))}
              </div>
            ))}
            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginTop: 8 }}>
              <Link href="/privacy" style={{ fontSize: 13, fontWeight: 600, color: '#c0392b', textDecoration: 'none' }}>Privacy Policy →</Link>
              <Link href="/contact" style={{ fontSize: 13, fontWeight: 600, color: '#0a1f3c', textDecoration: 'none' }}>Contact Us →</Link>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}

const eyebrow = { fontSize: 11, fontWeight: 700, letterSpacing: '3px', textTransform: 'uppercase', color: '#c0392b', marginBottom: 12 };
