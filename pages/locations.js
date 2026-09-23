/**
 * pages/locations.js — Global Offices & Locations
 *
 * DATA ARCHITECTURE NOTE
 * ──────────────────────────────────────────────────────────────────────────
 * The OFFICES array below is the temporary static data source.
 * In the admin phase this will be replaced by a Supabase query:
 *
 *   export async function getServerSideProps() {
 *     const supabase = createClient(url, anon);
 *     const { data } = await supabase
 *       .from('locations')
 *       .select('*')
 *       .eq('is_active', true)
 *       .order('country');
 *     return { props: { offices: data ?? [] } };
 *   }
 *
 * Admin-editable fields per office (maps to the `locations` Supabase table):
 *   id, country, country_code, region, city, office_name, office_type,
 *   address, phone, email, opening_hours, latitude, longitude,
 *   image_url, description, is_active
 *
 * Address / phone / email placeholders start with '[' so the UI can
 * distinguish unconfirmed data and render it differently.
 * ──────────────────────────────────────────────────────────────────────────
 */

import Head from 'next/head';
import Link from 'next/link';
import { useState, useMemo } from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';

/* ── OFFICE DATA ─────────────────────────────────────────────────────────── */
const OFFICES = [
  {
    id: 'us-miami',
    country: 'United States',
    countryCode: 'US',
    region: 'Americas',
    city: 'Miami',
    officeName: 'Miami Regional Office',
    officeType: 'Regional Office',
    timezone: 'EST (UTC-5)',
    address: '[Official address to be confirmed]',
    phone: '[Official phone to be confirmed]',
    email: '[Official email to be confirmed]',
    openingHours: 'Mon–Fri  9 am – 6 pm EST',
    description: 'North America and Caribbean logistics operations.',
    latitude: 25.7617,
    longitude: -80.1918,
    /* Pexels free-use logistics/cargo image — stable CDN URL */
    imageUrl: 'https://images.pexels.com/photos/1427107/pexels-photo-1427107.jpeg?auto=compress&cs=tinysrgb&w=900&h=500&fit=crop',
    imageAlt: 'Cargo shipping containers at a US port terminal',
    isActive: true,
  },
  {
    id: 'br-sao-paulo',
    country: 'Brazil',
    countryCode: 'BR',
    region: 'Americas',
    city: 'São Paulo',
    officeName: 'São Paulo Regional Office',
    officeType: 'Regional Office',
    timezone: 'BRT (UTC-3)',
    address: '[Official address to be confirmed]',
    phone: '[Official phone to be confirmed]',
    email: '[Official email to be confirmed]',
    openingHours: 'Mon–Fri  9 am – 6 pm BRT',
    description: 'Latin America logistics and customs operations.',
    latitude: -23.5505,
    longitude: -46.6333,
    imageUrl: 'https://images.pexels.com/photos/906494/pexels-photo-906494.jpeg?auto=compress&cs=tinysrgb&w=900&h=500&fit=crop',
    imageAlt: 'Modern logistics distribution warehouse facility',
    isActive: true,
  },
  {
    id: 'jp-tokyo',
    country: 'Japan',
    countryCode: 'JP',
    region: 'Asia-Pacific',
    city: 'Tokyo',
    officeName: 'Tokyo Regional Office',
    officeType: 'Regional Office',
    timezone: 'JST (UTC+9)',
    address: '[Official address to be confirmed]',
    phone: '[Official phone to be confirmed]',
    email: '[Official email to be confirmed]',
    openingHours: 'Mon–Fri  9 am – 6 pm JST',
    description: 'Asia-Pacific distribution and freight operations.',
    latitude: 35.6762,
    longitude: 139.6503,
    imageUrl: 'https://images.pexels.com/photos/2226458/pexels-photo-2226458.jpeg?auto=compress&cs=tinysrgb&w=900&h=500&fit=crop',
    imageAlt: 'Modern cargo freight terminal and logistics facility',
    isActive: true,
  },
  {
    id: 'in-mumbai',
    country: 'India',
    countryCode: 'IN',
    region: 'Asia-Pacific',
    city: 'Mumbai',
    officeName: 'Mumbai Regional Office',
    officeType: 'Regional Office',
    timezone: 'IST (UTC+5:30)',
    address: '[Official address to be confirmed]',
    phone: '[Official phone to be confirmed]',
    email: '[Official email to be confirmed]',
    openingHours: 'Mon–Fri  9 am – 6 pm IST',
    description: 'South Asia logistics and freight gateway.',
    latitude: 19.0760,
    longitude: 72.8777,
    imageUrl: 'https://images.pexels.com/photos/4246120/pexels-photo-4246120.jpeg?auto=compress&cs=tinysrgb&w=900&h=500&fit=crop',
    imageAlt: 'Large modern logistics warehouse interior',
    isActive: true,
  },
  {
    id: 'kr-seoul',
    country: 'South Korea',
    countryCode: 'KR',
    region: 'Asia-Pacific',
    city: 'Seoul',
    officeName: 'Seoul Regional Office',
    officeType: 'Regional Office',
    timezone: 'KST (UTC+9)',
    address: '[Official address to be confirmed]',
    phone: '[Official phone to be confirmed]',
    email: '[Official email to be confirmed]',
    openingHours: 'Mon–Fri  9 am – 6 pm KST',
    description: 'East Asia logistics, express, and air freight operations.',
    latitude: 37.5665,
    longitude: 126.9780,
    imageUrl: 'https://images.pexels.com/photos/4481259/pexels-photo-4481259.jpeg?auto=compress&cs=tinysrgb&w=900&h=500&fit=crop',
    imageAlt: 'Shipping containers at an international cargo port',
    isActive: true,
  },
  {
    id: 'fr-paris',
    country: 'France',
    countryCode: 'FR',
    region: 'Europe',
    city: 'Paris',
    officeName: 'Paris Regional Office',
    officeType: 'Regional Office',
    timezone: 'CET (UTC+1)',
    address: '[Official address to be confirmed]',
    phone: '[Official phone to be confirmed]',
    email: '[Official email to be confirmed]',
    openingHours: 'Mon–Fri  9 am – 6 pm CET',
    description: 'European logistics hub and customs clearance gateway.',
    latitude: 48.8566,
    longitude: 2.3522,
    imageUrl: 'https://images.pexels.com/photos/3786214/pexels-photo-3786214.jpeg?auto=compress&cs=tinysrgb&w=900&h=500&fit=crop',
    imageAlt: 'Modern European logistics and distribution facility',
    isActive: true,
  },
];

const REGION_ICONS = {
  Americas:      'fa-solid fa-earth-americas',
  'Asia-Pacific': 'fa-solid fa-earth-asia',
  Europe:        'fa-solid fa-earth-europe',
};

export default function LocationsPage() {
  const activeOffices = useMemo(() => OFFICES.filter(o => o.isActive), []);
  const countries = useMemo(() => [...new Set(activeOffices.map(o => o.country))], [activeOffices]);
  const regions   = useMemo(() => [...new Set(activeOffices.map(o => o.region))], [activeOffices]);

  const [search, setSearch]             = useState('');
  const [filterCountry, setFilterCountry] = useState('');
  const [filterRegion, setFilterRegion]   = useState('');

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    return activeOffices.filter(o => {
      if (filterCountry && o.country !== filterCountry) return false;
      if (filterRegion  && o.region  !== filterRegion)  return false;
      if (q && !(
        o.country.toLowerCase().includes(q) ||
        o.city.toLowerCase().includes(q) ||
        o.region.toLowerCase().includes(q) ||
        o.officeType.toLowerCase().includes(q)
      )) return false;
      return true;
    });
  }, [activeOffices, search, filterCountry, filterRegion]);

  const byRegion = useMemo(() => {
    const g = {};
    filtered.forEach(o => { (g[o.region] ??= []).push(o); });
    return g;
  }, [filtered]);

  const hasFilters = search || filterCountry || filterRegion;

  function clearFilters() {
    setSearch(''); setFilterCountry(''); setFilterRegion('');
  }

  return (
    <>
      <Head>
        <title>Global Offices & Locations — Josephdeliverycompany</title>
        <meta name="description" content="Connect with Josephdeliverycompany through our international network of offices across the United States, Brazil, Japan, India, South Korea, and France." />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <Header />

      {/* ── HERO ───────────────────────────────────────────────────────── */}
      <section style={{ position: 'relative', backgroundColor: '#0a1f3c', overflow: 'hidden', minHeight: 420 }}>
        {/* Hero background — cargo/logistics photo */}
        <div style={{
          position: 'absolute', inset: 0,
          backgroundImage: 'url(https://images.pexels.com/photos/1427107/pexels-photo-1427107.jpeg?auto=compress&cs=tinysrgb&w=1600&h=700&fit=crop)',
          backgroundSize: 'cover',
          backgroundPosition: 'center 55%',
          opacity: 0.2,
        }} />
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(90deg,rgba(6,21,41,0.96) 0%,rgba(10,31,60,0.55) 65%,rgba(10,31,60,0.15) 100%)' }} />

        <div style={{ position: 'relative', maxWidth: 1100, margin: '0 auto', padding: '88px 24px 80px' }}>
          <p style={eyebrow}>International Network</p>
          <h1 style={{ fontSize: 'clamp(32px,5vw,54px)', fontWeight: 800, color: '#fff', letterSpacing: '-0.04em', marginBottom: 20, lineHeight: 1.06, maxWidth: 680 }}>
            Global Offices &amp; Locations
          </h1>
          <p style={{ fontSize: 'clamp(15px,1.8vw,18px)', color: '#94a3b8', lineHeight: 1.7, maxWidth: 520, marginBottom: 48 }}>
            Connect with JOSEPHDELIVERYCOMPANY through our international network of offices and logistics locations.
          </p>

          {/* Region pills */}
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 44 }}>
            {regions.map(r => (
              <span key={r} style={{ padding: '5px 14px', border: '1px solid rgba(255,255,255,0.15)', borderRadius: 4, fontSize: 12, fontWeight: 600, color: '#cbd5e1', backgroundColor: 'rgba(255,255,255,0.06)', letterSpacing: '0.5px' }}>
                {r}
              </span>
            ))}
          </div>

          {/* Stat strip */}
          <div style={{ display: 'flex', gap: 40, flexWrap: 'wrap' }}>
            {[
              { n: activeOffices.length, label: 'International Offices' },
              { n: regions.length, label: 'Regions' },
              { n: countries.length, label: 'Countries' },
            ].map(s => (
              <div key={s.label}>
                <p style={{ fontSize: 'clamp(28px,4vw,42px)', fontWeight: 900, color: '#fff', letterSpacing: '-0.04em', lineHeight: 1 }}>{s.n}</p>
                <p style={{ fontSize: 11, color: '#64748b', marginTop: 5, textTransform: 'uppercase', letterSpacing: '1.5px', fontWeight: 700 }}>{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── WORLD MAP — photographic strip ─────────────────────────────── */}
      <section style={{ backgroundColor: '#061529', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', padding: '48px 24px 40px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 28, flexWrap: 'wrap', gap: 12 }}>
            <div>
              <p style={eyebrow}>Network Overview</p>
              <h2 style={{ fontSize: 'clamp(18px,2.5vw,26px)', fontWeight: 700, color: '#fff', letterSpacing: '-0.2px' }}>
                Our Global Footprint
              </h2>
            </div>
            <p style={{ fontSize: 11, color: '#475569', fontStyle: 'italic' }}>
              Office locations are representational — exact addresses confirmed upon enquiry.
            </p>
          </div>

          {/* Six-city photo strip */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6,1fr)', gap: 4, borderRadius: 8, overflow: 'hidden' }}
            className="globe-strip">
            {activeOffices.map(o => (
              <div key={o.id} style={{ position: 'relative', aspectRatio: '2/3', overflow: 'hidden', cursor: 'default' }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={o.imageUrl}
                  alt={o.imageAlt}
                  style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block', filter: 'brightness(0.5) saturate(0.8)' }}
                  loading="lazy"
                />
                <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg,transparent 40%,rgba(6,21,41,0.92) 100%)' }} />
                <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '10px 10px 12px' }}>
                  <p style={{ fontSize: 9, fontWeight: 700, color: '#c0392b', letterSpacing: '1.5px', textTransform: 'uppercase', marginBottom: 2 }}>{o.countryCode}</p>
                  <p style={{ fontSize: 11, fontWeight: 700, color: '#fff' }}>{o.city}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <main>
        {/* ── SEARCH & FILTER ──────────────────────────────────────────── */}
        <section style={{ backgroundColor: '#f4f5f7', borderBottom: '1px solid #e2e6ea', padding: '24px' }}>
          <div style={{ maxWidth: 1100, margin: '0 auto', display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
            <div style={{ position: 'relative', flex: '1 1 220px', minWidth: 180 }}>
              <i className="fa-solid fa-magnifying-glass" style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#9ca3af', fontSize: 13, pointerEvents: 'none' }} />
              <input
                type="text"
                placeholder="Search by country, city or region…"
                value={search}
                onChange={e => setSearch(e.target.value)}
                style={{ width: '100%', padding: '10px 12px 10px 34px', fontSize: 14, color: '#0a1f3c', border: '1px solid #d1d5db', borderRadius: 6, outline: 'none', backgroundColor: '#fff', boxSizing: 'border-box' }}
              />
            </div>

            <select value={filterCountry} onChange={e => setFilterCountry(e.target.value)} style={selectStyle}>
              <option value="">All Countries</option>
              {countries.map(c => <option key={c} value={c}>{c}</option>)}
            </select>

            <select value={filterRegion} onChange={e => setFilterRegion(e.target.value)} style={selectStyle}>
              <option value="">All Regions</option>
              {regions.map(r => <option key={r} value={r}>{r}</option>)}
            </select>

            {hasFilters && (
              <button onClick={clearFilters} style={{ padding: '10px 14px', fontSize: 13, fontWeight: 600, color: '#c0392b', border: '1px solid #fbd0cc', borderRadius: 6, backgroundColor: '#fff5f4', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}>
                <i className="fa-solid fa-xmark" style={{ fontSize: 11 }} /> Clear
              </button>
            )}

            <span style={{ fontSize: 13, color: '#9ca3af', marginLeft: 'auto', whiteSpace: 'nowrap' }}>
              {filtered.length} {filtered.length === 1 ? 'office' : 'offices'}
            </span>
          </div>
        </section>

        {/* ── OFFICE DIRECTORY ─────────────────────────────────────────── */}
        <section style={{ backgroundColor: '#f4f5f7', padding: '48px 24px 72px' }}>
          <div style={{ maxWidth: 1100, margin: '0 auto' }}>
            {filtered.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '64px 24px', color: '#94a3b8' }}>
                <i className="fa-solid fa-magnifying-glass" style={{ fontSize: 32, marginBottom: 16, display: 'block' }} />
                <p style={{ fontSize: 16, fontWeight: 600, color: '#374151', marginBottom: 6 }}>No offices match your search</p>
                <p style={{ fontSize: 14 }}>Try adjusting your filters.</p>
              </div>
            ) : (
              Object.entries(byRegion).map(([region, offices]) => (
                <div key={region} style={{ marginBottom: 60 }}>
                  {/* Region heading */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 28, paddingBottom: 16, borderBottom: '2px solid #e2e6ea' }}>
                    <div style={{ width: 36, height: 36, borderRadius: 8, backgroundColor: '#fff5f4', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <i className={REGION_ICONS[region] || 'fa-solid fa-earth-africa'} style={{ fontSize: 15, color: '#c0392b' }} />
                    </div>
                    <div>
                      <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: '2px', textTransform: 'uppercase', color: '#c0392b', marginBottom: 2 }}>Region</p>
                      <h2 style={{ fontSize: 'clamp(18px,2.5vw,24px)', fontWeight: 700, color: '#0a1f3c', letterSpacing: '-0.2px' }}>{region}</h2>
                    </div>
                    <span style={{ marginLeft: 'auto', fontSize: 12, color: '#94a3b8', fontWeight: 600 }}>
                      {offices.length} {offices.length === 1 ? 'office' : 'offices'}
                    </span>
                  </div>

                  {/* Office cards */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(320px,1fr))', gap: 24 }} className="office-grid">
                    {offices.map(office => (
                      <OfficeCard key={office.id} office={office} />
                    ))}
                  </div>
                </div>
              ))
            )}
          </div>
        </section>

        {/* ── PENDING INFO NOTICE ───────────────────────────────────────── */}
        <section style={{ backgroundColor: '#fff', borderTop: '1px solid #e2e6ea', borderBottom: '1px solid #e2e6ea', padding: '18px 24px' }}>
          <div style={{ maxWidth: 1100, margin: '0 auto', display: 'flex', alignItems: 'center', gap: 12 }}>
            <i className="fa-solid fa-circle-info" style={{ fontSize: 14, color: '#0369a1', flexShrink: 0 }} />
            <p style={{ fontSize: 13, color: '#475569', lineHeight: 1.5 }}>
              <strong style={{ color: '#0a1f3c' }}>Office contact details are pending confirmation.</strong>{' '}
              For immediate enquiries please{' '}
              <Link href="/contact" style={{ color: '#c0392b', fontWeight: 600 }}>contact us directly</Link>.
            </p>
          </div>
        </section>

        {/* ── CTA ──────────────────────────────────────────────────────── */}
        <section style={{ backgroundColor: '#0a1f3c', padding: '64px 24px', borderTop: '4px solid #c0392b' }}>
          <div style={{ maxWidth: 640, margin: '0 auto', textAlign: 'center' }}>
            <h2 style={{ fontSize: 'clamp(22px,3.5vw,36px)', fontWeight: 800, color: '#fff', marginBottom: 14, letterSpacing: '-0.3px' }}>
              Ready to ship internationally?
            </h2>
            <p style={{ fontSize: 15, color: '#94a3b8', marginBottom: 32, lineHeight: 1.7 }}>
              Get a competitive quote and our team will be in touch.
            </p>
            <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
              <Link href="/quote" style={btnRed}>GET A QUOTE</Link>
              <Link href="/contact" style={btnGhost}>CONTACT A REGIONAL OFFICE</Link>
            </div>
          </div>
        </section>
      </main>

      <Footer />

      <style jsx global>{`
        @media (max-width: 700px) {
          .globe-strip { grid-template-columns: repeat(3,1fr) !important; }
        }
        @media (max-width: 420px) {
          .globe-strip { grid-template-columns: repeat(2,1fr) !important; }
          .office-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </>
  );
}

/* ── Office Card ─────────────────────────────────────────────────────────── */
function OfficeCard({ office }) {
  const pending = v => typeof v === 'string' && v.startsWith('[');

  return (
    <div style={{ backgroundColor: '#fff', border: '1px solid #e2e6ea', borderRadius: 10, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
      {/* Photo */}
      <div style={{ position: 'relative', height: 200, overflow: 'hidden', backgroundColor: '#0a1f3c', flexShrink: 0 }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={office.imageUrl}
          alt={office.imageAlt}
          style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block', opacity: 0.75 }}
          loading="lazy"
        />
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg,rgba(10,31,60,0.1) 0%,rgba(10,31,60,0.75) 100%)' }} />

        {/* City + country overlay */}
        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '16px 18px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
            <div>
              <p style={{ fontSize: 10, color: 'rgba(255,255,255,0.6)', fontWeight: 700, letterSpacing: '1.5px', textTransform: 'uppercase', marginBottom: 3 }}>{office.country}</p>
              <h3 style={{ fontSize: 22, fontWeight: 800, color: '#fff', letterSpacing: '-0.3px' }}>{office.city}</h3>
            </div>
            <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: '1px', textTransform: 'uppercase', color: '#fff', backgroundColor: 'rgba(192,57,43,0.9)', padding: '4px 10px', borderRadius: 4 }}>
              {office.officeType}
            </span>
          </div>
        </div>
      </div>

      {/* Body */}
      <div style={{ padding: '18px 20px', flex: 1, display: 'flex', flexDirection: 'column', gap: 10 }}>
        <p style={{ fontSize: 13, color: '#4a5568', lineHeight: 1.6 }}>{office.description}</p>

        <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: 12, display: 'flex', flexDirection: 'column', gap: 7 }}>
          <Row icon="fa-regular fa-clock"   value={`${office.openingHours} · ${office.timezone}`} />
          <Row icon="fa-solid fa-map-pin"   value={office.address}     pending={pending(office.address)} />
          <Row icon="fa-solid fa-phone"     value={office.phone}       pending={pending(office.phone)} />
          <Row icon="fa-solid fa-envelope"  value={office.email}       pending={pending(office.email)} />
        </div>
      </div>

      {/* Footer */}
      <div style={{ padding: '11px 20px', borderTop: '1px solid #f1f5f9', backgroundColor: '#fafafa' }}>
        <Link href="/contact" style={{ fontSize: 13, fontWeight: 700, color: '#0a1f3c', display: 'flex', alignItems: 'center', gap: 6, textDecoration: 'none' }}>
          Enquire about this office <i className="fa-solid fa-arrow-right" style={{ fontSize: 10 }} />
        </Link>
      </div>
    </div>
  );
}

function Row({ icon, value, pending }) {
  return (
    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8 }}>
      <i className={icon} style={{ fontSize: 11, color: pending ? '#d1d5db' : '#c0392b', marginTop: 2, flexShrink: 0 }} />
      <p style={{ fontSize: 12, color: pending ? '#b0b8c5' : '#4a5568', lineHeight: 1.5, fontStyle: pending ? 'italic' : 'normal' }}>
        {value}
      </p>
    </div>
  );
}

/* ── Shared styles ───────────────────────────────────────────────────────── */
const eyebrow   = { fontSize: 11, fontWeight: 700, letterSpacing: '3px', textTransform: 'uppercase', color: '#c0392b', marginBottom: 12 };
const selectStyle = { padding: '10px 30px 10px 12px', fontSize: 14, color: '#0a1f3c', border: '1px solid #d1d5db', borderRadius: 6, outline: 'none', backgroundColor: '#fff', cursor: 'pointer', appearance: 'none', backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='8' viewBox='0 0 12 8'%3E%3Cpath d='M1 1l5 5 5-5' stroke='%236b7280' stroke-width='1.5' fill='none'/%3E%3C/svg%3E\")", backgroundRepeat: 'no-repeat', backgroundPosition: 'right 8px center' };
const btnRed    = { display: 'inline-flex', alignItems: 'center', gap: 8, padding: '13px 26px', backgroundColor: '#c0392b', color: '#fff', fontWeight: 700, fontSize: 14, letterSpacing: '0.4px', textDecoration: 'none', borderRadius: 6 };
const btnGhost  = { display: 'inline-flex', alignItems: 'center', gap: 8, padding: '13px 26px', backgroundColor: 'rgba(255,255,255,0.08)', color: '#fff', fontWeight: 600, fontSize: 14, textDecoration: 'none', borderRadius: 6, border: '1px solid rgba(255,255,255,0.2)' };
