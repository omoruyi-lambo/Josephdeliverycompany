import Head from 'next/head';
import Link from 'next/link';
import Header from '../components/Header';
import Footer from '../components/Footer';

const VALUES = [
  { icon: 'fa-solid fa-handshake', title: 'Reliability', desc: 'We do what we say. Every booking is a commitment we take seriously.' },
  { icon: 'fa-solid fa-shield-halved', title: 'Transparency', desc: 'Real-time tracking, honest pricing, no hidden fees — ever.' },
  { icon: 'fa-solid fa-bolt', title: 'Speed', desc: 'We move fast. Our infrastructure is built for next-day and same-day performance.' },
  { icon: 'fa-solid fa-heart', title: 'Care', desc: "Your goods are treated with the same care we'd give our own belongings." },
];

const TEAM = [
  { name: 'Joseph Adeyemi', role: 'Founder & CEO', img: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80' },
  { name: 'Amara Okafor', role: 'Head of Operations', img: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=300&q=80' },
  { name: 'Emeka Nwosu', role: 'Head of Technology', img: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=300&q=80' },
  { name: 'Fatima Al-Hassan', role: 'Customer Experience Lead', img: 'https://images.unsplash.com/photo-1598550874175-4d0ef436c909?auto=format&fit=crop&w=300&q=80' },
];

const MILESTONES = [
  { year: '2018', event: 'Founded in Lagos with 3 couriers and a single van.' },
  { year: '2019', event: 'Expanded to Abuja and Port Harcourt. First 10,000 deliveries.' },
  { year: '2021', event: 'Launched online tracking platform. Surpassed 500,000 annual deliveries.' },
  { year: '2023', event: 'International shipping to 50 countries. Fleet of 120 vehicles.' },
  { year: '2025', event: '180+ countries. 6 depots. Over 2 million deliveries completed.' },
];

export default function AboutPage() {
  return (
    <>
      <Head>
        <title>About Us — Josephdeliverycompany</title>
        <meta name="description" content="Learn about Josephdeliverycompany — our story, mission, values, and the team behind Nigeria's trusted logistics provider." />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <Header />

      {/* Hero */}
      <section style={{ position: 'relative', backgroundColor: '#0a1f3c', overflow: 'hidden', padding: '88px 24px 80px' }}>
        <div style={{ position: 'absolute', inset: 0, opacity: 0.08, backgroundImage: 'repeating-linear-gradient(0deg,transparent,transparent 39px,#fff 40px),repeating-linear-gradient(90deg,transparent,transparent 39px,#fff 40px)' }} />
        <div style={{ position: 'relative', maxWidth: 760, margin: '0 auto' }}>
          <p style={eyebrow}>Our Story</p>
          <h1 style={{ fontSize: 'clamp(30px,5vw,52px)', fontWeight: 800, color: '#fff', letterSpacing: '-0.04em', marginBottom: 20, lineHeight: 1.08 }}>
            Moving Nigeria.<br />Connecting the World.
          </h1>
          <p style={{ fontSize: 'clamp(14px,1.8vw,17px)', color: '#94a3b8', lineHeight: 1.8, maxWidth: 560 }}>
            Josephdeliverycompany was founded in Lagos in 2018 with a simple conviction: every Nigerian business and individual deserves a delivery service they can genuinely trust. Today we move millions of parcels a year — and the standard never changes.
          </p>
        </div>
      </section>

      <main>
        {/* Stats */}
        <section style={{ backgroundColor: '#c0392b', padding: '48px 24px' }}>
          <div style={{ maxWidth: 900, margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(160px,1fr))', gap: 32, textAlign: 'center' }}>
            {[['2M+','Deliveries Completed'],['180+','Countries Served'],['6','Service Depots'],['98%','On-Time Rate']].map(([n, l]) => (
              <div key={l}>
                <p style={{ fontSize: 'clamp(32px,5vw,48px)', fontWeight: 900, color: '#fff', letterSpacing: '-0.04em', lineHeight: 1 }}>{n}</p>
                <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.75)', marginTop: 6, fontWeight: 500 }}>{l}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Mission */}
        <section style={{ backgroundColor: '#fff', padding: '72px 24px', borderBottom: '1px solid #e2e6ea' }}>
          <div style={{ maxWidth: 860, margin: '0 auto', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 48, alignItems: 'center' }}>
            <div>
              <p style={eyebrowDark}>Mission</p>
              <h2 style={h2}>Logistics That Works for Everyone</h2>
              <p style={body}>We exist to make professional-grade shipping accessible to every individual and business in Nigeria — not just large corporations. From the Lagos street trader to the Abuja enterprise, the same quality of service, tracking, and care applies.</p>
              <p style={{ ...body, marginTop: 16 }}>We invest heavily in our technology, our people, and our network so that your parcel's journey is as smooth as the experience of booking it.</p>
            </div>
            <div style={{ backgroundColor: '#0a1f3c', borderRadius: 12, padding: '32px 28px', display: 'flex', flexDirection: 'column', gap: 20 }}>
              {['Reliable delivery you can track in real time.', 'Pricing that is honest and transparent.', 'Support available around the clock.', 'Coverage from Lagos to London and beyond.'].map(t => (
                <div key={t} style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                  <i className="fa-solid fa-check" style={{ color: '#c0392b', fontSize: 13, marginTop: 2, flexShrink: 0 }} />
                  <p style={{ fontSize: 14, color: '#e2e8f0', lineHeight: 1.6 }}>{t}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Values */}
        <section style={{ backgroundColor: '#f4f5f7', padding: '72px 24px', borderBottom: '1px solid #e2e6ea' }}>
          <div style={{ maxWidth: 960, margin: '0 auto' }}>
            <div style={{ textAlign: 'center', marginBottom: 48 }}>
              <p style={eyebrowDark}>Core Values</p>
              <h2 style={h2}>What Drives Us</h2>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(220px,1fr))', gap: 20 }}>
              {VALUES.map(v => (
                <div key={v.title} style={{ backgroundColor: '#fff', border: '1px solid #e2e6ea', borderRadius: 10, padding: '28px 24px' }}>
                  <div style={{ width: 48, height: 48, borderRadius: 10, backgroundColor: '#fff5f4', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
                    <i className={v.icon} style={{ fontSize: 20, color: '#c0392b' }} />
                  </div>
                  <p style={{ fontSize: 15, fontWeight: 700, color: '#0a1f3c', marginBottom: 8 }}>{v.title}</p>
                  <p style={{ fontSize: 13, color: '#64748b', lineHeight: 1.6 }}>{v.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Timeline */}
        <section style={{ backgroundColor: '#fff', padding: '72px 24px', borderBottom: '1px solid #e2e6ea' }}>
          <div style={{ maxWidth: 720, margin: '0 auto' }}>
            <div style={{ textAlign: 'center', marginBottom: 48 }}>
              <p style={eyebrowDark}>Our Journey</p>
              <h2 style={h2}>A Track Record of Growth</h2>
            </div>
            <div style={{ position: 'relative', paddingLeft: 32 }}>
              <div style={{ position: 'absolute', left: 7, top: 8, bottom: 8, width: 2, backgroundColor: '#e2e6ea' }} />
              {MILESTONES.map((m, i) => (
                <div key={m.year} style={{ position: 'relative', marginBottom: i < MILESTONES.length - 1 ? 32 : 0 }}>
                  <div style={{ position: 'absolute', left: -26, top: 4, width: 14, height: 14, borderRadius: '50%', backgroundColor: '#c0392b', border: '3px solid #fff', boxShadow: '0 0 0 2px #c0392b' }} />
                  <p style={{ fontSize: 12, fontWeight: 700, color: '#c0392b', letterSpacing: '1.5px', marginBottom: 4 }}>{m.year}</p>
                  <p style={{ fontSize: 14, color: '#374151', lineHeight: 1.6 }}>{m.event}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Team */}
        <section style={{ backgroundColor: '#f4f5f7', padding: '72px 24px', borderBottom: '1px solid #e2e6ea' }}>
          <div style={{ maxWidth: 960, margin: '0 auto' }}>
            <div style={{ textAlign: 'center', marginBottom: 48 }}>
              <p style={eyebrowDark}>Leadership</p>
              <h2 style={h2}>The People Behind the Parcels</h2>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(200px,1fr))', gap: 24 }}>
              {TEAM.map(t => (
                <div key={t.name} style={{ textAlign: 'center' }}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={t.img} alt={t.name} style={{ width: 100, height: 100, borderRadius: '50%', objectFit: 'cover', margin: '0 auto 14px', display: 'block', border: '3px solid #fff', boxShadow: '0 2px 12px rgba(0,0,0,0.1)' }} loading="lazy" />
                  <p style={{ fontSize: 15, fontWeight: 700, color: '#0a1f3c', marginBottom: 4 }}>{t.name}</p>
                  <p style={{ fontSize: 12, color: '#94a3b8', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.8px' }}>{t.role}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section style={{ backgroundColor: '#0a1f3c', padding: '64px 24px', borderTop: '4px solid #c0392b' }}>
          <div style={{ maxWidth: 620, margin: '0 auto', textAlign: 'center' }}>
            <h2 style={{ fontSize: 'clamp(24px,4vw,38px)', fontWeight: 800, color: '#fff', marginBottom: 14, letterSpacing: '-0.3px' }}>Join millions of satisfied customers</h2>
            <p style={{ fontSize: 15, color: '#94a3b8', marginBottom: 32, lineHeight: 1.6 }}>Send your first parcel today — or get in touch to talk about a business partnership.</p>
            <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
              <Link href="/quote" style={btnRed}>GET A QUOTE</Link>
              <Link href="/contact" style={btnGhost}>CONTACT US</Link>
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
const h2 = { fontSize: 'clamp(22px,3vw,32px)', fontWeight: 700, color: '#0a1f3c', letterSpacing: '-0.3px', marginBottom: 0 };
const body = { fontSize: 15, color: '#4a5568', lineHeight: 1.75 };
const btnRed = { display: 'inline-flex', alignItems: 'center', gap: 8, padding: '13px 26px', backgroundColor: '#c0392b', color: '#fff', fontWeight: 700, fontSize: 14, letterSpacing: '0.4px', textDecoration: 'none', borderRadius: 6 };
const btnGhost = { display: 'inline-flex', alignItems: 'center', gap: 8, padding: '13px 26px', backgroundColor: 'rgba(255,255,255,0.08)', color: '#fff', fontWeight: 600, fontSize: 14, textDecoration: 'none', borderRadius: 6, border: '1px solid rgba(255,255,255,0.2)' };
