import Head from 'next/head';
import Link from 'next/link';
import Header from '../components/Header';
import Footer from '../components/Footer';

const ROLES = [
  { title: 'Logistics Operations Coordinator', location: 'Lagos', type: 'Full-time', dept: 'Operations' },
  { title: 'Senior Software Engineer (Backend)', location: 'Remote / Lagos', type: 'Full-time', dept: 'Technology' },
  { title: 'Customer Experience Specialist', location: 'Abuja', type: 'Full-time', dept: 'Support' },
  { title: 'Fleet & Driver Manager', location: 'Port Harcourt', type: 'Full-time', dept: 'Operations' },
  { title: 'Business Development Manager', location: 'Lagos', type: 'Full-time', dept: 'Sales' },
  { title: 'Data Analyst', location: 'Remote', type: 'Contract', dept: 'Technology' },
];

const PERKS = [
  { icon: 'fa-solid fa-heart-pulse', title: 'Health Insurance', desc: 'Comprehensive HMO cover for you and your dependants.' },
  { icon: 'fa-solid fa-graduation-cap', title: 'Learning Budget', desc: '$1,500 annual training and development allowance.' },
  { icon: 'fa-solid fa-laptop', title: 'Equipment Provided', desc: 'MacBook or equivalent provided for all tech and office roles.' },
  { icon: 'fa-solid fa-plane', title: 'Remote Flexibility', desc: 'Hybrid and remote options available for eligible roles.' },
  { icon: 'fa-solid fa-chart-line', title: 'Equity & Bonuses', desc: 'Performance bonuses and company equity for senior staff.' },
  { icon: 'fa-solid fa-users', title: 'Great Team', desc: 'Work with talented, mission-driven people across Nigeria.' },
];

export default function CareersPage() {
  return (
    <>
      <Head>
        <title>Careers — Josephdeliverycompany</title>
        <meta name="description" content="Join the Josephdeliverycompany team. We're hiring across operations, technology, support, and sales." />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <Header />

      <section style={{ position: 'relative', backgroundColor: '#0a1f3c', overflow: 'hidden', padding: '80px 24px 72px' }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="https://images.unsplash.com/photo-1521737604893-d14cc237f11d?auto=format&fit=crop&w=1800&q=80"
          alt="Josephdeliverycompany team collaborating in a modern logistics office"
          style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', opacity: 0.3 }}
        />
        <div style={{ position: 'absolute', inset: 0, backgroundColor: 'rgba(10,31,60,0.82)' }} />
        <div style={{ position: 'relative', maxWidth: 760, margin: '0 auto' }}>
          <p style={eyebrow}>Careers</p>
          <h1 style={{ fontSize: 'clamp(30px,5vw,52px)', fontWeight: 800, color: '#fff', letterSpacing: '-0.04em', marginBottom: 18, lineHeight: 1.08 }}>
            Build the Future of<br />Nigerian Logistics
          </h1>
          <p style={{ fontSize: 'clamp(14px,1.8vw,17px)', color: '#94a3b8', lineHeight: 1.7, maxWidth: 520 }}>
            We're a fast-growing logistics company on a mission to make reliable delivery accessible to every Nigerian. If that mission excites you, we'd love to hear from you.
          </p>
        </div>
      </section>

      <main>
        {/* Perks */}
        <section style={{ backgroundColor: '#fff', padding: '72px 24px', borderBottom: '1px solid #e2e6ea' }}>
          <div style={{ maxWidth: 1060, margin: '0 auto' }}>
            <div style={{ marginBottom: 40 }}>
              <p style={eyebrowDark}>Why Join Us</p>
              <h2 style={h2}>What We Offer</h2>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(280px,1fr))', gap: 24 }}>
              {PERKS.map(p => (
                <div key={p.title} style={{ display: 'flex', gap: 16 }}>
                  <div style={{ width: 44, height: 44, borderRadius: 8, backgroundColor: '#fff5f4', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <i className={p.icon} style={{ fontSize: 18, color: '#c0392b' }} />
                  </div>
                  <div>
                    <p style={{ fontSize: 14, fontWeight: 700, color: '#0a1f3c', marginBottom: 5 }}>{p.title}</p>
                    <p style={{ fontSize: 13, color: '#64748b', lineHeight: 1.6 }}>{p.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Open roles */}
        <section style={{ backgroundColor: '#f4f5f7', padding: '72px 24px', borderBottom: '1px solid #e2e6ea' }}>
          <div style={{ maxWidth: 860, margin: '0 auto' }}>
            <div style={{ marginBottom: 36 }}>
              <p style={eyebrowDark}>Open Positions</p>
              <h2 style={h2}>Current Openings</h2>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {ROLES.map(r => (
                <div key={r.title} style={{ backgroundColor: '#fff', border: '1px solid #e2e6ea', borderRadius: 10, padding: '20px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
                  <div>
                    <p style={{ fontSize: 15, fontWeight: 700, color: '#0a1f3c', marginBottom: 6 }}>{r.title}</p>
                    <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                      <Tag icon="fa-solid fa-location-dot" text={r.location} />
                      <Tag icon="fa-regular fa-clock" text={r.type} />
                      <Tag icon="fa-solid fa-briefcase" text={r.dept} />
                    </div>
                  </div>
                  <Link href="/contact" style={{ display: 'inline-flex', alignItems: 'center', gap: 7, padding: '10px 18px', backgroundColor: '#0a1f3c', color: '#fff', fontWeight: 700, fontSize: 13, textDecoration: 'none', borderRadius: 6, whiteSpace: 'nowrap' }}>
                    Apply Now
                  </Link>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Open application */}
        <section style={{ backgroundColor: '#0a1f3c', padding: '64px 24px', borderTop: '4px solid #c0392b' }}>
          <div style={{ maxWidth: 620, margin: '0 auto', textAlign: 'center' }}>
            <h2 style={{ fontSize: 'clamp(22px,3.5vw,36px)', fontWeight: 800, color: '#fff', marginBottom: 14, letterSpacing: '-0.3px' }}>Don't see your role?</h2>
            <p style={{ fontSize: 15, color: '#94a3b8', marginBottom: 32, lineHeight: 1.6 }}>
              We're always interested in exceptional people. Send us your CV and tell us how you'd contribute.
            </p>
            <Link href="/contact" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '13px 28px', backgroundColor: '#c0392b', color: '#fff', fontWeight: 700, fontSize: 14, textDecoration: 'none', borderRadius: 6, letterSpacing: '0.4px' }}>
              SEND OPEN APPLICATION
            </Link>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}

function Tag({ icon, text }) {
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 12, color: '#64748b' }}>
      <i className={icon} style={{ fontSize: 10, color: '#c0392b' }} />{text}
    </span>
  );
}

const eyebrow = { fontSize: 11, fontWeight: 700, letterSpacing: '3px', textTransform: 'uppercase', color: '#c0392b', marginBottom: 12 };
const eyebrowDark = { fontSize: 11, fontWeight: 700, letterSpacing: '2.5px', textTransform: 'uppercase', color: '#c0392b', marginBottom: 10 };
const h2 = { fontSize: 'clamp(22px,3vw,32px)', fontWeight: 700, color: '#0a1f3c', letterSpacing: '-0.3px' };
