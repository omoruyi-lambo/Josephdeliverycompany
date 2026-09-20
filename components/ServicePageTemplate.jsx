/**
 * ServicePageTemplate — shared layout for all service detail pages.
 * Props:
 *   title, eyebrowLabel, heroTag, heroDesc, imgSrc, imgAlt,
 *   price, deliveryTime,
 *   features: [{ icon, title, desc }]
 *   steps:    [{ n, title, desc }]
 *   faqs:     [{ q, a }]
 */
import Link from 'next/link';
import { useState } from 'react';
import Header from './Header';
import Footer from './Footer';
import Head from 'next/head';

export default function ServicePageTemplate({
  title, eyebrowLabel, heroTag, heroDesc, imgSrc, imgAlt,
  price, deliveryTime, features = [], steps = [], faqs = [], metaDesc,
}) {
  const [openFaq, setOpenFaq] = useState(null);

  return (
    <>
      <Head>
        <title>{title} — Josephdeliverycompany</title>
        <meta name="description" content={metaDesc || heroDesc} />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <Header />

      {/* Hero */}
      <section style={{ position: 'relative', backgroundColor: '#0a1f3c', overflow: 'hidden', minHeight: 420 }}>
        <div style={{ position: 'absolute', inset: 0 }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={imgSrc} alt={imgAlt} style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center', display: 'block', opacity: 0.35 }} />
        </div>
        <div style={{ position: 'relative', maxWidth: 1100, margin: '0 auto', padding: '88px 24px 80px' }}>
          <Link href="/services" style={{ display: 'inline-flex', alignItems: 'center', gap: 7, fontSize: 12, color: '#94a3b8', textDecoration: 'none', marginBottom: 22 }}>
            <i className="fa-solid fa-arrow-left" style={{ fontSize: 10 }} /> All Services
          </Link>
          <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: '3px', textTransform: 'uppercase', color: '#c0392b', marginBottom: 12 }}>{eyebrowLabel}</p>
          <h1 style={{ fontSize: 'clamp(30px,5vw,52px)', fontWeight: 800, color: '#fff', letterSpacing: '-0.04em', marginBottom: 18, lineHeight: 1.08, maxWidth: 640 }}>{title}</h1>
          <p style={{ fontSize: 'clamp(14px,1.8vw,17px)', color: '#cbd5e1', lineHeight: 1.7, maxWidth: 520, marginBottom: 36 }}>{heroDesc}</p>

          {/* Meta pills */}
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginBottom: 32 }}>
            <Pill icon="fa-regular fa-clock" text={deliveryTime} />
            <Pill icon="fa-solid fa-tag" text={price} />
          </div>

          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            <Link href="/quote" style={btnRed}>GET A QUOTE</Link>
            <Link href="/track" style={btnGhost}>TRACK SHIPMENT</Link>
          </div>
        </div>
      </section>

      <main>
        {/* Features */}
        {features.length > 0 && (
          <section style={{ backgroundColor: '#fff', padding: '72px 24px', borderBottom: '1px solid #e2e6ea' }}>
            <div style={{ maxWidth: 1100, margin: '0 auto' }}>
              <SH eyebrow="Included" title="What's Covered" />
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(260px,1fr))', gap: 24 }}>
                {features.map(f => (
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
        )}

        {/* Steps */}
        {steps.length > 0 && (
          <section style={{ backgroundColor: '#f4f5f7', padding: '72px 24px', borderBottom: '1px solid #e2e6ea' }}>
            <div style={{ maxWidth: 900, margin: '0 auto' }}>
              <SH eyebrow="Process" title="How It Works" center />
              <div style={{ display: 'grid', gridTemplateColumns: `repeat(${steps.length},1fr)`, gap: 24, position: 'relative' }}>
                {steps.map((s, i) => (
                  <div key={s.n} style={{ textAlign: 'center', padding: '0 16px' }}>
                    <div style={{ width: 56, height: 56, borderRadius: '50%', border: '2px solid #e2e6ea', backgroundColor: '#fff', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
                      <span style={{ fontSize: 10, fontWeight: 700, color: '#c0392b', letterSpacing: '1px' }}>0{i + 1}</span>
                    </div>
                    <p style={{ fontSize: 14, fontWeight: 700, color: '#0a1f3c', marginBottom: 8 }}>{s.title}</p>
                    <p style={{ fontSize: 13, color: '#64748b', lineHeight: 1.6 }}>{s.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* FAQs */}
        {faqs.length > 0 && (
          <section style={{ backgroundColor: '#fff', padding: '72px 24px', borderBottom: '1px solid #e2e6ea' }}>
            <div style={{ maxWidth: 720, margin: '0 auto' }}>
              <SH eyebrow="FAQs" title={`Common Questions`} center />
              <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                {faqs.map((faq, i) => (
                  <div key={i} style={{ border: '1px solid #e2e6ea', borderRadius: 8, overflow: 'hidden', backgroundColor: '#fff' }}>
                    <button
                      onClick={() => setOpenFaq(openFaq === i ? null : i)}
                      style={{ width: '100%', padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left', gap: 12 }}
                    >
                      <span style={{ fontSize: 14, fontWeight: 600, color: '#0a1f3c' }}>{faq.q}</span>
                      <i className={`fa-solid fa-chevron-${openFaq === i ? 'up' : 'down'}`} style={{ fontSize: 11, color: '#9ca3af', flexShrink: 0 }} />
                    </button>
                    {openFaq === i && (
                      <div style={{ padding: '0 20px 18px', fontSize: 14, color: '#64748b', lineHeight: 1.7 }}>{faq.a}</div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* CTA */}
        <section style={{ backgroundColor: '#0a1f3c', padding: '64px 24px', borderTop: '4px solid #c0392b' }}>
          <div style={{ maxWidth: 640, margin: '0 auto', textAlign: 'center' }}>
            <h2 style={{ fontSize: 'clamp(24px,4vw,38px)', fontWeight: 800, color: '#fff', marginBottom: 14, letterSpacing: '-0.3px' }}>Ready to ship?</h2>
            <p style={{ fontSize: 15, color: '#94a3b8', marginBottom: 32, lineHeight: 1.6 }}>Get a no-obligation quote in under 60 seconds.</p>
            <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
              <Link href="/quote" style={btnRed}>GET A FREE QUOTE</Link>
              <Link href="/signup" style={btnGhost}>CREATE ACCOUNT</Link>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}

function Pill({ icon, text }) {
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 7, padding: '6px 14px', backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 20, fontSize: 13, color: '#e2e8f0', fontWeight: 600, backdropFilter: 'blur(4px)' }}>
      <i className={icon} style={{ fontSize: 11, color: '#c0392b' }} />{text}
    </span>
  );
}
function SH({ eyebrow, title, center }) {
  return (
    <div style={{ textAlign: center ? 'center' : 'left', marginBottom: 40 }}>
      <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: '2.5px', textTransform: 'uppercase', color: '#c0392b', marginBottom: 10 }}>{eyebrow}</p>
      <h2 style={{ fontSize: 'clamp(22px,3vw,32px)', fontWeight: 700, color: '#0a1f3c', letterSpacing: '-0.3px' }}>{title}</h2>
    </div>
  );
}

const btnRed = { display: 'inline-flex', alignItems: 'center', gap: 8, padding: '13px 26px', backgroundColor: '#c0392b', color: '#fff', fontWeight: 700, fontSize: 14, letterSpacing: '0.4px', textDecoration: 'none', borderRadius: 6 };
const btnGhost = { display: 'inline-flex', alignItems: 'center', gap: 8, padding: '13px 26px', backgroundColor: 'rgba(255,255,255,0.08)', color: '#fff', fontWeight: 600, fontSize: 14, textDecoration: 'none', borderRadius: 6, border: '1px solid rgba(255,255,255,0.2)' };
