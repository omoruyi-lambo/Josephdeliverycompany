import Head from 'next/head';
import Link from 'next/link';
import { useState } from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';

const SECTIONS = [
  {
    id: 'tracking', label: 'Tracking',
    faqs: [
      { q: 'How do I track my shipment?', a: 'Go to josephdeliverycompany.com/track and enter your tracking number (format: JDC-YYYY-XXXXX). You\'ll see the full journey with timestamps at every checkpoint.' },
      { q: 'Why hasn\'t my tracking updated?', a: 'Tracking updates at key scan points — pickup, hub arrival, out for delivery, and delivered. If 24 hours have passed without an update on a domestic shipment, contact our support team.' },
      { q: 'What do the tracking statuses mean?', a: 'Booked: order confirmed. Collected: parcel picked up. In Transit: moving through our network. Out for Delivery: courier is on the way. Delivered: parcel received. Failed Delivery: recipient unavailable — re-delivery or depot hold will follow.' },
      { q: 'Can I track via SMS?', a: 'Yes. Text your tracking number to +234 801 234 5678 and we\'ll reply with the current status within minutes.' },
    ],
  },
  {
    id: 'shipping', label: 'Shipping & Delivery',
    faqs: [
      { q: 'How do I book a shipment?', a: 'Use our online quote tool at josephdeliverycompany.com/quote, choose your service, enter pickup and delivery details, and confirm. A courier will collect within the confirmed window.' },
      { q: 'What packaging should I use?', a: 'Use a sturdy double-wall cardboard box with at least 5 cm of padding on all sides. Fragile items should be bubble-wrapped individually. Seal all seams with strong packing tape.' },
      { q: 'Can I change my delivery address after booking?', a: 'Address changes are accepted up to 2 hours after booking is confirmed. Log in to your account or call our support line. A ₦500 amendment fee may apply.' },
      { q: 'What if I miss my delivery?', a: 'Our courier will attempt delivery twice. After the second failed attempt, the parcel is held at your nearest depot for 5 business days before return-to-sender.' },
      { q: 'Do you deliver on weekends?', a: 'Saturday delivery is available in Lagos, Abuja, and Port Harcourt on express bookings. Sunday delivery is available in Lagos only. A weekend surcharge applies.' },
    ],
  },
  {
    id: 'returns', label: 'Returns',
    faqs: [
      { q: 'How do I return a parcel?', a: 'Generate a return label from your account dashboard or contact support. Drop the sealed parcel at any Josephdeliverycompany depot or book a return pickup. Returns are processed within 3–5 business days.' },
      { q: 'Who pays for returns?', a: 'For business accounts with returns enabled, the sender can choose to pre-pay or push the cost to the returner. Personal returns are charged at standard shipping rates.' },
      { q: 'How long do refunds take?', a: 'Once a return is received and confirmed, refunds are processed within 5–7 business days to the original payment method.' },
    ],
  },
  {
    id: 'billing', label: 'Billing',
    faqs: [
      { q: 'What payment methods do you accept?', a: 'We accept bank transfer, Paystack, Flutterwave, USSD, and card payments (Visa, Mastercard). Business accounts can request invoice-based net-30 terms.' },
      { q: 'How do invoices work?', a: 'Individual shipments are invoiced immediately on booking. Business accounts receive a consolidated invoice weekly or monthly, depending on their plan.' },
      { q: 'How do I dispute a charge?', a: 'Email billing@josephdeliverycompany.com with your invoice number and a description of the discrepancy. We investigate within 2 business days.' },
    ],
  },
  {
    id: 'claims', label: 'Claims',
    faqs: [
      { q: 'What do I do if my parcel is lost?', a: 'If tracking shows no movement for 5+ business days on a domestic shipment (or 14 days international), contact support to open a trace. Claims must be filed within 30 days of the expected delivery date.' },
      { q: 'What do I do if my parcel arrived damaged?', a: 'Photograph the damage before opening further. Contact support within 48 hours of delivery with images and your tracking number. Do not discard the packaging — it may be needed for the claim.' },
      { q: 'How much am I covered for?', a: 'Standard coverage is ₦50,000 for domestic shipments. Extended insurance (up to declared value) is available at checkout. International shipments include coverage per the Warsaw Convention unless extended cover is purchased.' },
    ],
  },
];

export default function FAQPage() {
  const [activeSection, setActiveSection] = useState('tracking');
  const [openFaq, setOpenFaq] = useState(null);

  const section = SECTIONS.find(s => s.id === activeSection);

  return (
    <>
      <Head>
        <title>FAQs — Josephdeliverycompany</title>
        <meta name="description" content="Frequently asked questions about Josephdeliverycompany shipping, tracking, returns, billing, and claims." />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <Header />

      <section style={{ backgroundColor: '#0a1f3c', padding: '72px 24px 64px', textAlign: 'center' }}>
        <p style={eyebrow}>FAQ</p>
        <h1 style={{ fontSize: 'clamp(28px,5vw,50px)', fontWeight: 800, color: '#fff', letterSpacing: '-0.04em', marginBottom: 14, lineHeight: 1.08 }}>
          Frequently Asked Questions
        </h1>
        <p style={{ fontSize: 'clamp(14px,1.8vw,16px)', color: '#94a3b8', lineHeight: 1.7, maxWidth: 480, margin: '0 auto' }}>
          Can't find what you need? <Link href="/contact" style={{ color: '#fff', fontWeight: 600, textDecoration: 'none' }}>Contact our team</Link> — we respond within 2 hours.
        </p>
      </section>

      <main style={{ backgroundColor: '#f4f5f7', padding: '56px 24px 80px' }}>
        <div style={{ maxWidth: 900, margin: '0 auto', display: 'grid', gridTemplateColumns: '200px 1fr', gap: 32, alignItems: 'start' }}>

          {/* Sidebar nav */}
          <nav>
            <div style={{ backgroundColor: '#fff', border: '1px solid #e2e6ea', borderRadius: 10, overflow: 'hidden' }}>
              {SECTIONS.map(s => (
                <button key={s.id} onClick={() => { setActiveSection(s.id); setOpenFaq(null); }}
                  style={{ width: '100%', padding: '13px 18px', textAlign: 'left', background: activeSection === s.id ? '#fff5f4' : '#fff', border: 'none', borderBottom: '1px solid #f1f5f9', cursor: 'pointer', fontSize: 13, fontWeight: activeSection === s.id ? 700 : 500, color: activeSection === s.id ? '#c0392b' : '#374151', borderLeft: activeSection === s.id ? '3px solid #c0392b' : '3px solid transparent' }}>
                  {s.label}
                </button>
              ))}
            </div>
            <div style={{ marginTop: 16, backgroundColor: '#0a1f3c', borderRadius: 10, padding: '18px 16px' }}>
              <p style={{ fontSize: 12, fontWeight: 700, color: '#fff', marginBottom: 8 }}>Still need help?</p>
              <Link href="/contact" style={{ fontSize: 12, color: '#94a3b8', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 6 }}>
                <i className="fa-solid fa-headset" style={{ color: '#c0392b' }} /> Contact Support
              </Link>
            </div>
          </nav>

          {/* FAQ list */}
          <div>
            <h2 style={{ fontSize: 'clamp(18px,2.5vw,24px)', fontWeight: 700, color: '#0a1f3c', marginBottom: 20, letterSpacing: '-0.2px' }}>{section.label}</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              {section.faqs.map((faq, i) => (
                <div key={i} style={{ backgroundColor: '#fff', border: '1px solid #e2e6ea', borderRadius: 8, overflow: 'hidden' }}>
                  <button onClick={() => setOpenFaq(openFaq === i ? null : i)}
                    style={{ width: '100%', padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left', gap: 12 }}>
                    <span style={{ fontSize: 14, fontWeight: 600, color: '#0a1f3c' }}>{faq.q}</span>
                    <i className={`fa-solid fa-chevron-${openFaq === i ? 'up' : 'down'}`} style={{ fontSize: 11, color: '#9ca3af', flexShrink: 0 }} />
                  </button>
                  {openFaq === i && (
                    <div style={{ padding: '0 20px 18px', fontSize: 14, color: '#64748b', lineHeight: 1.75, borderTop: '1px solid #f1f5f9' }}>{faq.a}</div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>

      <style jsx global>{`@media(max-width:640px){.faq-grid{grid-template-columns:1fr !important}}`}</style>
      <Footer />
    </>
  );
}

const eyebrow = { fontSize: 11, fontWeight: 700, letterSpacing: '3px', textTransform: 'uppercase', color: '#c0392b', marginBottom: 12 };
