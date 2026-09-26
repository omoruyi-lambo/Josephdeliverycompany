import Head from 'next/head';
import Link from 'next/link';
import Header from '../components/Header';
import Footer from '../components/Footer';

const SECTIONS = [
  {
    title: '1. Information We Collect',
    body: `We collect information you provide directly when you create an account, book a shipment, or contact us. This includes your name, email address, phone number, postal address, and payment information.\n\nWe also collect information automatically when you use our services, including your IP address, browser type, pages visited, and tracking interactions.`,
  },
  {
    title: '2. How We Use Your Information',
    body: `We use your information to process and deliver your shipments, send tracking updates and delivery notifications, provide customer support, process payments and invoices, improve our services and website, and send you service communications.\n\nWe do not sell your personal data to third parties.`,
  },
  {
    title: '3. Sharing Your Information',
    body: `We share your information with courier partners and subcontractors to fulfil your delivery, payment processors to complete transactions, customs authorities where required for international shipments, and technology service providers who support our operations. All third parties are contractually required to protect your data.`,
  },
  {
    title: '4. Data Retention',
    body: `We retain your personal data for as long as your account is active and for a period of 7 years after your last transaction for legal and tax compliance purposes. You may request deletion of your account and associated data at any time, subject to our legal obligations.`,
  },
  {
    title: '5. Your Rights',
    body: `You have the right to access a copy of your personal data, correct inaccurate data, request deletion of your data, object to processing of your data, and withdraw consent where processing is based on consent.\n\nTo exercise these rights, use the secure contact form.`,
  },
  {
    title: '6. Security',
    body: `We use industry-standard encryption (TLS) for data in transit and at rest. Access to personal data is restricted to employees who require it to perform their job functions. We conduct regular security audits and maintain incident response procedures.`,
  },
  {
    title: '7. Cookies',
    body: `Our website uses essential cookies required for the site to function, analytical cookies to understand how visitors use the site, and preference cookies to remember your settings. You may disable non-essential cookies through your browser settings.`,
  },
  {
    title: '8. Changes to This Policy',
    body: `We may update this Privacy Policy from time to time. We will notify you of material changes by email or by posting a notice on our website at least 30 days before the change takes effect.`,
  },
  {
    title: '9. Contact',
    body: 'For privacy-related questions or requests, use the secure contact form.',
  },
];

export default function PrivacyPage() {
  return (
    <>
      <Head>
        <title>Privacy Policy — Josephdeliverycompany</title>
        <meta name="description" content="Josephdeliverycompany Privacy Policy — how we collect, use, and protect your personal data." />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <Header />

      <section style={{ backgroundColor: '#0a1f3c', padding: '64px 24px 56px' }}>
        <div style={{ maxWidth: 760, margin: '0 auto' }}>
          <p style={eyebrow}>Legal</p>
          <h1 style={{ fontSize: 'clamp(26px,4vw,42px)', fontWeight: 800, color: '#fff', letterSpacing: '-0.04em', marginBottom: 12, lineHeight: 1.1 }}>Privacy Policy</h1>
          <p style={{ fontSize: 13, color: '#94a3b8' }}>Last updated: 1 January 2026</p>
        </div>
      </section>

      <main style={{ backgroundColor: '#f4f5f7', padding: '56px 24px 80px' }}>
        <div style={{ maxWidth: 760, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 0 }}>
          <div style={{ backgroundColor: '#fff', border: '1px solid #e2e6ea', borderRadius: 12, padding: 'clamp(24px,5vw,44px)' }}>
            <p style={{ fontSize: 15, color: '#4a5568', lineHeight: 1.8, marginBottom: 32 }}>
              Josephdeliverycompany ("we", "us", "our") is committed to protecting your privacy. This policy explains what personal data we collect, how we use it, and your rights regarding it.
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
              <Link href="/terms" style={{ fontSize: 13, fontWeight: 600, color: '#c0392b', textDecoration: 'none' }}>Terms of Service →</Link>
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
