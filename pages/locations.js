/**
 * pages/locations.js — Global Offices & Locations
 *
 * DATA ARCHITECTURE NOTE
 * ──────────────────────────────────────────────────────────────────────────
 * Office data is stored in the OFFICES array below.
 * In a future admin phase this array will be replaced by a Supabase query
 * so that office records can be managed from the admin dashboard without
 * touching this file.
 *
 * Each office object intentionally uses placeholder text for address, phone,
 * and email fields. Real contact information must be supplied by the company
 * before going public. These placeholders are clearly marked so they are
 * never confused with real data.
 *
 * Admin-editable fields per office:
 *   id, country, countryCode, region, city, officeType, timezone,
 *   address, phone, email, hours, description, lat, lng, active
 * ──────────────────────────────────────────────────────────────────────────
 */

import Head from 'next/head';
import Link from 'next/link';
import { useState, useMemo } from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';

/* ── OFFICE DATA ─────────────────────────────────────────────────────────────
 * TODO (Admin Phase): Replace this static array with a Supabase query:
 *   const { data: offices } = await supabase
 *     .from('offices')
 *     .select('*')
 *     .eq('active', true)
 *     .order('country');
 * ─────────────────────────────────────────────────────────────────────────── */
const OFFICES = [
  {
    id: 'us-miami',
    country: 'United States',
    countryCode: 'US',
    region: 'Americas',
    city: 'Miami',
    officeType: 'Regional Office',
    timezone: 'EST (UTC-5)',
    address: '[Official address to be confirmed]',
    phone: '[Official phone to be confirmed]',
    email: '[Official email to be confirmed]',
    hours: 'Mon–Fri  9am–6pm EST',
    description: 'North America and Caribbean logistics operations.',
    lat: 25.7617,
    lng: -80.1918,
    active: true,
  },
  {
    id: 'br-sao-paulo',
    country: 'Brazil',
    countryCode: 'BR',
    region: 'Americas',
    city: 'São Paulo',
    officeType: 'Regional Office',
    timezone: 'BRT (UTC-3)',
    address: '[Official address to be confirmed]',
    phone: '[Official phone to be confirmed]',
    email: '[Official email to be confirmed]',
    hours: 'Mon–Fri  9am–6pm BRT',
    description: 'Latin America logistics and customs operations.',
    lat: -23.5505,
    lng: -46.6333,
    active: true,
  },
  {
    id: 'jp-tokyo',
    country: 'Japan',
    countryCode: 'JP',
    region: 'Asia-Pacific',
    city: 'Tokyo',
    officeType: 'Regional Office',
    timezone: 'JST (UTC+9)',
    address: '[Official address to be confirmed]',
    phone: '[Official phone to be confirmed]',
    email: '[Official email to be confirmed]',
    hours: 'Mon–Fri  9am–6pm JST',
    description: 'Asia-Pacific distribution and freight operations.',
    lat: 35.6762,
    lng: 139.6503,
    active: true,
  },
  {
    id: 'in-mumbai',
    country: 'India',
    countryCode: 'IN',
    region: 'Asia-Pacific',
    city: 'Mumbai',
    officeType: 'Regional Office',
    timezone: 'IST (UTC+5:30)',
    address: '[Official address to be confirmed]',
    phone: '[Official phone to be confirmed]',
    email: '[Official email to be confirmed]',
    hours: 'Mon–Fri  9am–6pm IST',
    description: 'South Asia logistics and freight gateway.',
    lat: 19.0760,
    lng: 72.8777,
    active: true,
  },
  {
    id: 'kr-seoul',
    country: 'South Korea',
    countryCode: 'KR',
    region: 'Asia-Pacific',
    city: 'Seoul',
    officeType: 'Regional Office',
    timezone: 'KST (UTC+9)',
    address: '[Official address to be confirmed]',
    phone: '[Official phone to be confirmed]',
    email: '[Official email to be confirmed]',
    hours: 'Mon–Fri  9am–6pm KST',
    description: 'East Asia logistics, express, and air freight operations.',
    lat: 37.5665,
    lng: 126.9780,
    active: true,
  },
  {
    id: 'fr-paris',
    country: 'France',
    countryCode: 'FR',
    region: 'Europe',
    city: 'Paris',
    officeType: 'Regional Office',
    timezone: 'CET (UTC+1)',
    address: '[Official address to be confirmed]',
    phone: '[Official phone to be confirmed]',
    email: '[Official email to be confirmed]',
    hours: 'Mon–Fri  9am–6pm CET',
    description: 'European logistics hub and customs clearance gateway.',
    lat: 48.8566,
    lng: 2.3522,
    active: true,
  },
];

/* ── Country background imagery (Unsplash, free to use) ─────────────────── */
const COUNTRY_IMAGES = {
  US: 'https://images.unsplash.com/photo-1485738422979-f5c462d49f74?auto=format&fit=crop&w=800&q=70',
  BR: 'https://images.unsplash.com/photo-1483729558449-99ef09a8c325?auto=format&fit=crop&w=800&q=70',
  JP: 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?auto=format&fit=crop&w=800&q=70',
  IN: 'https://images.unsplash.com/photo-1596176530529-78163a4f7af2?auto=format&fit=crop&w=800&q=70',
  KR: 'https://images.unsplash.com/photo-1538484044902-a04e8e9b4cde?auto=format&fit=crop&w=800&q=70',
  FR: 'https://images.unsplash.com/photo-1499856871958-5b9627545d1a?auto=format&fit=crop&w=800&q=70',
};

const REGION_LABELS = {
  Americas: 'Americas',
  'Asia-Pacific': 'Asia-Pacific',
  Europe: 'Europe',
};

/* ── SVG World Map coordinates ───────────────────────────────────────────────
 * Simple Mercator-style projection on a 1000×500 SVG viewport.
 * Dots represent office city positions — not real GIS precision.
 * ─────────────────────────────────────────────────────────────────────────── */
const MAP_W = 1000;
const MAP_H = 500;

function latLngToXY(lat, lng) {
  const x = ((lng + 180) / 360) * MAP_W;
  const latRad = (lat * Math.PI) / 180;
  const mercN = Math.log(Math.tan(Math.PI / 4 + latRad / 2));
  const y = (MAP_H / 2) - (MAP_H * mercN) / (2 * Math.PI);
  return { x: Math.round(x), y: Math.round(y) };
}

/* Approximate world landmass outline paths (simplified Natural Earth) */
/* eslint-disable max-len */
const CONTINENTS = {
  northAmerica: 'M180,120 L200,110 L230,105 L260,100 L285,98 L300,105 L310,115 L315,125 L310,140 L305,155 L295,165 L280,170 L270,175 L265,185 L260,195 L255,200 L248,210 L240,215 L235,225 L230,230 L225,235 L215,230 L210,220 L205,210 L200,200 L195,190 L190,175 L183,160 L180,145 Z',
  centralAmerica: 'M240,215 L255,210 L260,220 L255,230 L248,235 L240,230 Z',
  southAmerica: 'M255,240 L270,235 L285,240 L295,250 L300,265 L298,280 L295,295 L290,315 L283,330 L275,345 L265,355 L258,360 L250,355 L243,340 L240,325 L238,310 L238,295 L240,280 L242,265 L248,255 Z',
  europe: 'M460,90 L480,85 L500,82 L520,80 L535,82 L545,88 L548,96 L545,105 L535,115 L520,118 L510,115 L500,120 L490,118 L480,115 L470,110 L462,105 Z',
  africa: 'M480,160 L500,155 L520,155 L540,158 L555,168 L560,182 L558,198 L552,215 L548,232 L545,250 L542,268 L535,280 L525,288 L512,290 L500,285 L490,275 L482,260 L478,245 L475,228 L474,210 L474,195 L476,180 Z',
  asia: 'M560,80 L590,75 L620,72 L655,70 L690,72 L720,75 L745,80 L765,90 L775,100 L770,115 L755,125 L740,130 L720,132 L700,130 L680,128 L660,130 L645,138 L630,142 L615,140 L600,135 L585,130 L568,125 L558,115 L555,100 Z',
  seAsia: 'M680,150 L700,148 L720,152 L735,160 L730,172 L718,178 L705,175 L692,168 L684,160 Z',
  australia: 'M720,290 L748,285 L775,290 L792,305 L790,320 L780,332 L762,338 L745,335 L730,325 L720,312 L716,300 Z',
  greenland: 'M280,55 L295,50 L310,52 L318,60 L315,70 L305,75 L292,73 L282,65 Z',
};
/* eslint-enable max-len */

export default function LocationsPage() {
  const countries = useMemo(() => [...new Set(OFFICES.map(o => o.country))], []);
  const cities = useMemo(() => [...new Set(OFFICES.map(o => o.city))], []);
  const regions = useMemo(() => [...new Set(OFFICES.map(o => o.region))], []);

  const [searchQuery, setSearchQuery] = useState('');
  const [filterCountry, setFilterCountry] = useState('');
  const [filterRegion, setFilterRegion] = useState('');
  const [hoveredOffice, setHoveredOffice] = useState(null);

  const filtered = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    return OFFICES.filter(o => {
      if (!o.active) return false;
      if (filterCountry && o.country !== filterCountry) return false;
      if (filterRegion && o.region !== filterRegion) return false;
      if (q && !(
        o.country.toLowerCase().includes(q) ||
        o.city.toLowerCase().includes(q) ||
        o.region.toLowerCase().includes(q) ||
        o.officeType.toLowerCase().includes(q)
      )) return false;
      return true;
    });
  }, [searchQuery, filterCountry, filterRegion]);

  /* Group filtered offices by region */
  const byRegion = useMemo(() => {
    const groups = {};
    filtered.forEach(o => {
      if (!groups[o.region]) groups[o.region] = [];
      groups[o.region].push(o);
    });
    return groups;
  }, [filtered]);

  const hasFilters = searchQuery || filterCountry || filterRegion;

  return (
    <>
      <Head>
        <title>Global Offices & Locations — Josephdeliverycompany</title>
        <meta name="description" content="Connect with Josephdeliverycompany through our international network of offices across the United States, Brazil, Japan, India, South Korea, and France." />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <Header />

      {/* ── HERO ─────────────────────────────────────────────────────────── */}
      <section style={{ position: 'relative', backgroundColor: '#0a1f3c', overflow: 'hidden', minHeight: 420 }}>
        {/* Background image */}
        <div style={{
          position: 'absolute', inset: 0,
          /* eslint-disable-next-line @next/next/no-img-element */
          backgroundImage: 'url(https://images.unsplash.com/photo-1579621970795-87facc2f976d?auto=format&fit=crop&w=1600&q=70)',
          backgroundSize: 'cover',
          backgroundPosition: 'center 40%',
          opacity: 0.18,
        }} />
        {/* Left gradient overlay */}
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(90deg, rgba(10,31,60,0.95) 0%, rgba(10,31,60,0.6) 60%, rgba(10,31,60,0.2) 100%)' }} />

        <div style={{ position: 'relative', maxWidth: 1100, margin: '0 auto', padding: '88px 24px 80px' }}>
          <p style={eyebrow}>International Network</p>
          <h1 style={{
            fontSize: 'clamp(32px,5vw,54px)',
            fontWeight: 800,
            color: '#ffffff',
            letterSpacing: '-0.04em',
            marginBottom: 20,
            lineHeight: 1.06,
            maxWidth: 680,
          }}>
            Global Offices &amp; Locations
          </h1>
          <p style={{
            fontSize: 'clamp(15px,1.8vw,18px)',
            color: '#94a3b8',
            lineHeight: 1.7,
            maxWidth: 520,
            marginBottom: 48,
          }}>
            Connect with Josephdeliverycompany through our international network of offices and logistics locations.
          </p>

          {/* Region pills */}
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            {Object.values(REGION_LABELS).map(r => (
              <span key={r} style={{
                padding: '6px 16px',
                border: '1px solid rgba(255,255,255,0.18)',
                borderRadius: 4,
                fontSize: 12,
                fontWeight: 600,
                color: '#cbd5e1',
                letterSpacing: '0.5px',
                backgroundColor: 'rgba(255,255,255,0.06)',
              }}>
                {r}
              </span>
            ))}
          </div>

          {/* Office count strip */}
          <div style={{ display: 'flex', gap: 40, marginTop: 48, flexWrap: 'wrap' }}>
            {[
              { n: OFFICES.length.toString(), label: 'International Offices' },
              { n: regions.length.toString(), label: 'Regions Covered' },
              { n: countries.length.toString(), label: 'Countries' },
            ].map(s => (
              <div key={s.label}>
                <p style={{ fontSize: 'clamp(28px,4vw,42px)', fontWeight: 900, color: '#fff', letterSpacing: '-0.04em', lineHeight: 1 }}>{s.n}</p>
                <p style={{ fontSize: 11, color: '#64748b', marginTop: 5, textTransform: 'uppercase', letterSpacing: '1.5px', fontWeight: 700 }}>{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <main>
        {/* ── WORLD MAP ─────────────────────────────────────────────────── */}
        <section style={{ backgroundColor: '#0a1f3c', borderTop: '1px solid rgba(255,255,255,0.06)', padding: '0 0 4px' }}>
          <div style={{ maxWidth: 1100, margin: '0 auto', padding: '48px 24px 40px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
              <div>
                <p style={{ ...eyebrow, marginBottom: 6 }}>Network Overview</p>
                <h2 style={{ fontSize: 'clamp(18px,2.5vw,26px)', fontWeight: 700, color: '#fff', letterSpacing: '-0.2px' }}>Our Global Footprint</h2>
              </div>
              <p style={{ fontSize: 12, color: '#475569', fontStyle: 'italic' }}>
                Office locations are illustrative — exact addresses confirmed upon enquiry.
              </p>
            </div>

            {/* SVG World Map */}
            <div style={{ backgroundColor: '#061529', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 8, overflow: 'hidden' }}>
              <svg
                viewBox={`0 0 ${MAP_W} ${MAP_H}`}
                style={{ width: '100%', height: 'auto', display: 'block' }}
                aria-label="World map showing Josephdeliverycompany office locations"
                role="img"
              >
                {/* Ocean background */}
                <rect width={MAP_W} height={MAP_H} fill="#061529" />

                {/* Grid lines */}
                {[-60, -30, 0, 30, 60].map(lat => {
                  const { y } = latLngToXY(lat, 0);
                  return (
                    <line key={`lat${lat}`} x1={0} y1={y} x2={MAP_W} y2={y}
                      stroke="rgba(255,255,255,0.04)" strokeWidth="1" />
                  );
                })}
                {[-120, -60, 0, 60, 120].map(lng => {
                  const { x } = latLngToXY(0, lng);
                  return (
                    <line key={`lng${lng}`} x1={x} y1={0} x2={x} y2={MAP_H}
                      stroke="rgba(255,255,255,0.04)" strokeWidth="1" />
                  );
                })}

                {/* Continent shapes */}
                {Object.entries(CONTINENTS).map(([name, d]) => (
                  <path key={name} d={d} fill="#0f2a4a" stroke="rgba(255,255,255,0.08)" strokeWidth="0.8" />
                ))}

                {/* Route lines between offices */}
                {OFFICES.map((o, i) =>
                  OFFICES.slice(i + 1).map(o2 => {
                    const p1 = latLngToXY(o.lat, o.lng);
                    const p2 = latLngToXY(o2.lat, o2.lng);
                    /* Arc control point — raised midpoint */
                    const cx = (p1.x + p2.x) / 2;
                    const cy = Math.min(p1.y, p2.y) - 40;
                    return (
                      <path
                        key={`${o.id}-${o2.id}`}
                        d={`M ${p1.x} ${p1.y} Q ${cx} ${cy} ${p2.x} ${p2.y}`}
                        fill="none"
                        stroke="rgba(192,57,43,0.15)"
                        strokeWidth="1"
                        strokeDasharray="3 4"
                      />
                    );
                  })
                )}

                {/* Office dots */}
                {OFFICES.map(o => {
                  const { x, y } = latLngToXY(o.lat, o.lng);
                  const isHovered = hoveredOffice === o.id;
                  return (
                    <g key={o.id}
                      style={{ cursor: 'pointer' }}
                      onMouseEnter={() => setHoveredOffice(o.id)}
                      onMouseLeave={() => setHoveredOffice(null)}>
                      {/* Pulse ring */}
                      <circle cx={x} cy={y} r={isHovered ? 18 : 12}
                        fill="rgba(192,57,43,0.12)"
                        style={{ transition: 'r 0.2s' }} />
                      {/* Outer dot */}
                      <circle cx={x} cy={y} r={isHovered ? 7 : 5}
                        fill={isHovered ? '#c0392b' : '#e05a4b'}
                        stroke="#ffffff"
                        strokeWidth="1.5"
                        style={{ transition: 'r 0.2s, fill 0.2s' }} />
                      {/* Inner dot */}
                      <circle cx={x} cy={y} r={2} fill="#ffffff" />

                      {/* Tooltip label */}
                      {isHovered && (
                        <g>
                          <rect
                            x={x + 10} y={y - 20}
                            width={o.city.length * 7 + o.country.length * 5 + 24}
                            height={32} rx="4"
                            fill="#0a1f3c" stroke="rgba(255,255,255,0.15)" strokeWidth="1"
                          />
                          <text x={x + 18} y={y - 4}
                            fontSize="11" fontWeight="700" fill="#ffffff"
                            fontFamily="Inter, Arial, sans-serif"
                            style={{ pointerEvents: 'none', userSelect: 'none' }}>
                            {o.city}
                          </text>
                          <text x={x + 18} y={y + 8}
                            fontSize="9" fill="#94a3b8"
                            fontFamily="Inter, Arial, sans-serif"
                            style={{ pointerEvents: 'none', userSelect: 'none' }}>
                            {o.country}
                          </text>
                        </g>
                      )}
                    </g>
                  );
                })}
              </svg>
            </div>

            {/* Region legend */}
            <div style={{ display: 'flex', gap: 24, marginTop: 16, flexWrap: 'wrap' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, color: '#64748b' }}>
                <div style={{ width: 10, height: 10, borderRadius: '50%', backgroundColor: '#c0392b', border: '2px solid #fff' }} />
                Office Location
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, color: '#64748b' }}>
                <svg width="28" height="8"><line x1="0" y1="4" x2="28" y2="4" stroke="rgba(192,57,43,0.4)" strokeWidth="1.5" strokeDasharray="3 3" /></svg>
                Route Connection
              </div>
            </div>
          </div>
        </section>

        {/* ── SEARCH & FILTER ───────────────────────────────────────────── */}
        <section style={{ backgroundColor: '#f4f5f7', borderBottom: '1px solid #e2e6ea', padding: '28px 24px' }}>
          <div style={{ maxWidth: 1100, margin: '0 auto' }}>
            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center' }}>
              {/* Search input */}
              <div style={{ position: 'relative', flex: '1 1 240px', minWidth: 200 }}>
                <i className="fa-solid fa-magnifying-glass" style={{
                  position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)',
                  color: '#9ca3af', fontSize: 13, pointerEvents: 'none',
                }} />
                <input
                  type="text"
                  placeholder="Search by country, city, or region…"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  style={{
                    width: '100%', padding: '10px 14px 10px 38px',
                    fontSize: 14, color: '#0a1f3c',
                    border: '1px solid #d1d5db', borderRadius: 6,
                    outline: 'none', backgroundColor: '#fff',
                    boxSizing: 'border-box',
                  }}
                />
              </div>

              {/* Country filter */}
              <select
                value={filterCountry}
                onChange={e => setFilterCountry(e.target.value)}
                style={{
                  padding: '10px 32px 10px 14px', fontSize: 14, color: '#0a1f3c',
                  border: '1px solid #d1d5db', borderRadius: 6,
                  outline: 'none', backgroundColor: '#fff', cursor: 'pointer',
                  appearance: 'none',
                  backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='8' viewBox='0 0 12 8'%3E%3Cpath d='M1 1l5 5 5-5' stroke='%236b7280' stroke-width='1.5' fill='none'/%3E%3C/svg%3E\")",
                  backgroundRepeat: 'no-repeat', backgroundPosition: 'right 10px center',
                  flex: '0 0 auto',
                }}
              >
                <option value="">All Countries</option>
                {countries.map(c => <option key={c} value={c}>{c}</option>)}
              </select>

              {/* Region filter */}
              <select
                value={filterRegion}
                onChange={e => setFilterRegion(e.target.value)}
                style={{
                  padding: '10px 32px 10px 14px', fontSize: 14, color: '#0a1f3c',
                  border: '1px solid #d1d5db', borderRadius: 6,
                  outline: 'none', backgroundColor: '#fff', cursor: 'pointer',
                  appearance: 'none',
                  backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='8' viewBox='0 0 12 8'%3E%3Cpath d='M1 1l5 5 5-5' stroke='%236b7280' stroke-width='1.5' fill='none'/%3E%3C/svg%3E\")",
                  backgroundRepeat: 'no-repeat', backgroundPosition: 'right 10px center',
                  flex: '0 0 auto',
                }}
              >
                <option value="">All Regions</option>
                {regions.map(r => <option key={r} value={r}>{r}</option>)}
              </select>

              {/* Clear */}
              {hasFilters && (
                <button
                  onClick={() => { setSearchQuery(''); setFilterCountry(''); setFilterRegion(''); }}
                  style={{
                    padding: '10px 16px', fontSize: 13, fontWeight: 600,
                    color: '#c0392b', border: '1px solid #fbd0cc', borderRadius: 6,
                    backgroundColor: '#fff5f4', cursor: 'pointer',
                    display: 'flex', alignItems: 'center', gap: 6,
                  }}
                >
                  <i className="fa-solid fa-xmark" style={{ fontSize: 11 }} /> Clear filters
                </button>
              )}

              {/* Result count */}
              <span style={{ fontSize: 13, color: '#9ca3af', marginLeft: 'auto', whiteSpace: 'nowrap' }}>
                {filtered.length} {filtered.length === 1 ? 'office' : 'offices'} found
              </span>
            </div>
          </div>
        </section>

        {/* ── OFFICE DIRECTORY ─────────────────────────────────────────── */}
        <section style={{ backgroundColor: '#f4f5f7', padding: '48px 24px 72px' }}>
          <div style={{ maxWidth: 1100, margin: '0 auto' }}>

            {filtered.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '64px 24px', color: '#94a3b8' }}>
                <i className="fa-solid fa-magnifying-glass" style={{ fontSize: 32, marginBottom: 16, display: 'block' }} />
                <p style={{ fontSize: 16, fontWeight: 600, color: '#374151', marginBottom: 6 }}>No offices found</p>
                <p style={{ fontSize: 14 }}>Try adjusting your search or filter criteria.</p>
              </div>
            ) : (
              Object.entries(byRegion).map(([region, offices]) => (
                <div key={region} style={{ marginBottom: 56 }}>
                  {/* Region header */}
                  <div style={{
                    display: 'flex', alignItems: 'center', gap: 14,
                    marginBottom: 28, paddingBottom: 16,
                    borderBottom: '2px solid #e2e6ea',
                  }}>
                    <div style={{
                      width: 36, height: 36, borderRadius: 8,
                      backgroundColor: '#fff5f4',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                      <i className={regionIcon(region)} style={{ fontSize: 15, color: '#c0392b' }} />
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
                  <div className="office-grid" style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
                    gap: 20,
                  }}>
                    {offices.map(office => (
                      <OfficeCard key={office.id} office={office} />
                    ))}
                  </div>
                </div>
              ))
            )}
          </div>
        </section>

        {/* ── DATA PLACEHOLDER NOTICE ───────────────────────────────────── */}
        <section style={{ backgroundColor: '#fff', borderTop: '1px solid #e2e6ea', borderBottom: '1px solid #e2e6ea', padding: '20px 24px' }}>
          <div style={{ maxWidth: 1100, margin: '0 auto', display: 'flex', alignItems: 'center', gap: 12 }}>
            <i className="fa-solid fa-circle-info" style={{ fontSize: 14, color: '#0369a1', flexShrink: 0 }} />
            <p style={{ fontSize: 13, color: '#475569', lineHeight: 1.5 }}>
              <strong style={{ color: '#0a1f3c' }}>Address information is pending.</strong>{' '}
              Offices shown represent regional coverage areas. Official address, phone, and email details will be updated once confirmed by the company. For immediate enquiries, please{' '}
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
              Get a competitive quote for your international shipment and our team will be in touch.
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
        @media (max-width: 640px) {
          .office-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </>
  );
}

/* ── Office Card ─────────────────────────────────────────────────────────── */
function OfficeCard({ office }) {
  const img = COUNTRY_IMAGES[office.countryCode];
  const isPlaceholder = office.address.startsWith('[');

  return (
    <div style={{
      backgroundColor: '#ffffff',
      border: '1px solid #e2e6ea',
      borderRadius: 10,
      overflow: 'hidden',
      display: 'flex',
      flexDirection: 'column',
    }}>
      {/* Country image header */}
      <div style={{ position: 'relative', height: 140, overflow: 'hidden', backgroundColor: '#0a1f3c' }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={img}
          alt={`${office.city}, ${office.country}`}
          style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.55, display: 'block' }}
          loading="lazy"
        />
        {/* Overlay */}
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, transparent 30%, rgba(10,31,60,0.85) 100%)' }} />
        {/* Country + flag */}
        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '12px 16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
            <div>
              <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.6)', fontWeight: 700, letterSpacing: '1.5px', textTransform: 'uppercase', marginBottom: 2 }}>{office.country}</p>
              <h3 style={{ fontSize: 20, fontWeight: 800, color: '#ffffff', letterSpacing: '-0.2px' }}>{office.city}</h3>
            </div>
            <span style={{
              fontSize: 10, fontWeight: 700, letterSpacing: '1px',
              textTransform: 'uppercase', color: '#ffffff',
              backgroundColor: 'rgba(192,57,43,0.85)',
              padding: '4px 10px', borderRadius: 4,
            }}>
              {office.officeType}
            </span>
          </div>
        </div>
      </div>

      {/* Card body */}
      <div style={{ padding: '18px 20px', flex: 1, display: 'flex', flexDirection: 'column', gap: 10 }}>
        {/* Description */}
        <p style={{ fontSize: 13, color: '#4a5568', lineHeight: 1.6 }}>{office.description}</p>

        <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: 12, display: 'flex', flexDirection: 'column', gap: 8 }}>
          {/* Timezone */}
          <DetailRow icon="fa-regular fa-clock" value={`${office.hours} · ${office.timezone}`} />

          {/* Address */}
          <DetailRow
            icon="fa-solid fa-map-pin"
            value={office.address}
            placeholder={isPlaceholder}
          />

          {/* Phone */}
          <DetailRow
            icon="fa-solid fa-phone"
            value={office.phone}
            placeholder={office.phone.startsWith('[')}
          />

          {/* Email */}
          <DetailRow
            icon="fa-solid fa-envelope"
            value={office.email}
            placeholder={office.email.startsWith('[')}
          />
        </div>
      </div>

      {/* Card footer */}
      <div style={{ padding: '12px 20px', borderTop: '1px solid #f1f5f9', backgroundColor: '#fafafa' }}>
        <Link href="/contact" style={{
          fontSize: 13, fontWeight: 700, color: '#0a1f3c',
          display: 'flex', alignItems: 'center', gap: 6,
          textDecoration: 'none',
        }}>
          Enquire about this office
          <i className="fa-solid fa-arrow-right" style={{ fontSize: 10 }} />
        </Link>
      </div>
    </div>
  );
}

/* ── Detail row inside an office card ───────────────────────────────────── */
function DetailRow({ icon, value, placeholder }) {
  return (
    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8 }}>
      <i className={icon} style={{ fontSize: 11, color: placeholder ? '#d1d5db' : '#c0392b', marginTop: 2, flexShrink: 0 }} />
      <p style={{ fontSize: 12, color: placeholder ? '#b0b8c5' : '#4a5568', lineHeight: 1.5, fontStyle: placeholder ? 'italic' : 'normal' }}>
        {value}
      </p>
    </div>
  );
}

/* ── Helpers ─────────────────────────────────────────────────────────────── */
function regionIcon(region) {
  switch (region) {
    case 'Americas':     return 'fa-solid fa-earth-americas';
    case 'Asia-Pacific': return 'fa-solid fa-earth-asia';
    case 'Europe':       return 'fa-solid fa-earth-europe';
    default:             return 'fa-solid fa-earth-africa';
  }
}

/* ── Shared styles ───────────────────────────────────────────────────────── */
const eyebrow = { fontSize: 11, fontWeight: 700, letterSpacing: '3px', textTransform: 'uppercase', color: '#c0392b', marginBottom: 12 };
const btnRed = { display: 'inline-flex', alignItems: 'center', gap: 8, padding: '13px 26px', backgroundColor: '#c0392b', color: '#fff', fontWeight: 700, fontSize: 14, letterSpacing: '0.4px', textDecoration: 'none', borderRadius: 6 };
const btnGhost = { display: 'inline-flex', alignItems: 'center', gap: 8, padding: '13px 26px', backgroundColor: 'rgba(255,255,255,0.08)', color: '#fff', fontWeight: 600, fontSize: 14, textDecoration: 'none', borderRadius: 6, border: '1px solid rgba(255,255,255,0.2)' };
