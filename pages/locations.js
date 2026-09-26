/**
 * pages/locations.js — International Logistics Network
 *
 * REAL DATA ARCHITECTURE
 * ──────────────────────────────────────────────────────────────────────────
 * This page fetches location data from Supabase using server-side rendering.
 * Only active locations (is_active = true) are displayed to the public.
 *
 * Admin-editable fields per location (maps to the `locations` Supabase table):
 *   id, country, country_code, region, city, office_name, office_type,
 *   address, phone, email, opening_hours, latitude, longitude,
 *   image_url, image_alt, description, is_active
 *
 * If office details are not yet confirmed, they are displayed neutrally.
 * ──────────────────────────────────────────────────────────────────────────
 */

import Head from 'next/head';
import Link from 'next/link';
import { useState, useMemo, useEffect } from 'react';
import { supabase } from '../lib/supabase/client';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { createSupabaseServerClient } from '../lib/supabase/server';

export async function getServerSideProps({ req, res }) {
  const supabase = createSupabaseServerClient(req, res);
  const { data: locations, error } = await supabase
    .from('locations')
    .select('*')
    .eq('is_active', true)
    .order('country');

  if (error) {
    console.error('Error fetching locations:', error);
    return { props: { locations: [] } };
  }

  return { props: { locations: locations || [] } };
}

const REGION_ICONS = {
  Americas:      'fa-solid fa-earth-americas',
  'Asia-Pacific': 'fa-solid fa-earth-asia',
  Europe:        'fa-solid fa-earth-europe',
};

export default function LocationsPage({ locations = [] }) {
  // Transform database fields to match expected format
  const activeOffices = useMemo(() => locations.map(loc => ({
    id: loc.id,
    country: loc.country,
    countryCode: loc.country_code,
    region: loc.region,
    city: loc.city,
    officeName: loc.office_name,
    officeType: loc.office_type,
    address: loc.address,
    phone: loc.phone,
    email: loc.email,
    openingHours: loc.opening_hours,
    description: loc.description,
    latitude: loc.latitude,
    longitude: loc.longitude,
    imageUrl: loc.image_url,
    imageAlt: loc.image_alt,
    isActive: loc.is_active,
  })), [locations]);

  const countries = useMemo(() => [...new Set(activeOffices.map(o => o.country))], [activeOffices]);
  const regions   = useMemo(() => [...new Set(activeOffices.map(o => o.region))], [activeOffices]);

const HERO_IMAGE =
  'https://images.pexels.com/photos/1427107/pexels-photo-1427107.jpeg?auto=compress&cs=tinysrgb&w=1600&h=700&fit=crop';

/* ── SVG-based Location World Map ───────────────────────────────────────── */

const MAP_VW = 1000;
const MAP_VH = 520;
const MAP_PAD = 40;

function latLngToMapXY(lat, lng) {
  const x =
    MAP_PAD +
    ((lng + 180) / 360) * (MAP_VW - MAP_PAD * 2);
  const y =
    MAP_PAD +
    ((90 - lat) / 180) * (MAP_VH - MAP_PAD * 2);
  return { x, y };
}

const GRID_LAT_STEPS = [-60, -30, 0, 30, 60];
const GRID_LNG_STEPS = [-150, -90, -30, 30, 90, 150];

function LocationMap({ locations }) {
  const verifiedLocations = locations.filter(
    (l) =>
      l.latitude != null &&
      l.longitude != null &&
      Number.isFinite(Number(l.latitude)) &&
      Number.isFinite(Number(l.longitude)) &&
      Number(l.latitude) >= -90 &&
      Number(l.latitude) <= 90 &&
      Number(l.longitude) >= -180 &&
      Number(l.longitude) <= 180,
  );

  const points = verifiedLocations.map((l) => ({
    location: l,
    pt: latLngToMapXY(Number(l.latitude), Number(l.longitude)),
  }));

  return (
    <div
      style={{
        backgroundColor: '#ffffff',
        border: `1px solid ${COLORS.border}`,
        borderRadius: 10,
        overflow: 'hidden',
      }}
    >
      <div
        style={{
          backgroundColor: COLORS.navy,
          padding: '14px 20px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 10,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <i
            className="fa-solid fa-map-location-dot"
            style={{ fontSize: 16, color: COLORS.red }}
          />
          <span
            style={{
              fontSize: 14,
              fontWeight: 700,
              color: '#fff',
              letterSpacing: '0.3px',
            }}
          >
            Network Map
          </span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
          <span
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              fontSize: 12,
              color: '#94a3b8',
            }}
          >
            <span
              style={{
                width: 10,
                height: 10,
                borderRadius: '50%',
                backgroundColor: COLORS.red,
                display: 'inline-block',
              }}
            />
            Verified Location
          </span>
          <span style={{ fontSize: 12, color: '#64748b' }}>
            {verifiedLocations.length} plotted
          </span>
        </div>
      </div>

      <div style={{ position: 'relative', overflow: 'hidden' }}>
        <svg
          viewBox={`0 0 ${MAP_VW} ${MAP_VH}`}
          style={{
            width: '100%',
            height: 'auto',
            display: 'block',
            maxHeight: 520,
            backgroundColor: '#eef2f7',
          }}
          aria-label="JOSEPHDELIVERYCOMPANY international network map"
          role="img"
        >
          {GRID_LAT_STEPS.map((lat) => {
            const { y } = latLngToMapXY(lat, -180);
            return (
              <g key={`lat-${lat}`}>
                <line
                  x1={MAP_PAD}
                  y1={y}
                  x2={MAP_VW - MAP_PAD}
                  y2={y}
                  stroke="#dde3eb"
                  strokeWidth="0.6"
                  strokeDasharray="3 3"
                />
                <text
                  x={MAP_PAD + 4}
                  y={y - 4}
                  fontSize="8"
                  fill="#94a3b8"
                  fontFamily="Inter, Arial, sans-serif"
                >
                  {lat}°
                </text>
              </g>
            );
          })}

          {GRID_LNG_STEPS.map((lng) => {
            const { x } = latLngToMapXY(60, lng);
            return (
              <g key={`lng-${lng}`}>
                <line
                  x1={x}
                  y1={MAP_PAD}
                  x2={x}
                  y2={MAP_VH - MAP_PAD}
                  stroke="#dde3eb"
                  strokeWidth="0.6"
                  strokeDasharray="3 3"
                />
                <text
                  x={x}
                  y={MAP_VH - MAP_PAD + 12}
                  fontSize="8"
                  fill="#94a3b8"
                  textAnchor="middle"
                  fontFamily="Inter, Arial, sans-serif"
                >
                  {lng}°
                </text>
              </g>
            );
          })}

          {points.map(({ location: l, pt }, i) => {
            const hasCoords = true;
            const label = l.city ? l.city : l.country;
            const labelWidth = Math.max(label.length * 6 + 14, 56);
            const overflowRight = pt.x + labelWidth > MAP_VW - MAP_PAD;
            const labelX = overflowRight ? pt.x - labelWidth - 14 : pt.x + 14;

            return (
              <g key={l.id || i}>
                <circle
                  cx={pt.x}
                  cy={pt.y}
                  r={20}
                  fill={COLORS.red}
                  opacity="0.10"
                />
                <circle
                  cx={pt.x}
                  cy={pt.y}
                  r={11}
                  fill={COLORS.red}
                  opacity="0.20"
                />
                <circle
                  cx={pt.x}
                  cy={pt.y}
                  r={7}
                  fill="#ffffff"
                  stroke={COLORS.red}
                  strokeWidth="2.5"
                />
                <text
                  x={pt.x}
                  y={pt.y + 3}
                  textAnchor="middle"
                  fontSize="8"
                  fontWeight="700"
                  fill={COLORS.red}
                  fontFamily="Inter, Arial, sans-serif"
                >
                  {l.country_code ? l.country_code.charAt(0) : '✦'}
                </text>

                <rect
                  x={labelX}
                  y={pt.y - 14}
                  width={labelWidth}
                  height={24}
                  rx="4"
                  ry="4"
                  fill={COLORS.navy}
                  opacity="0.92"
                />
                <text
                  x={labelX + 7}
                  y={pt.y + 2}
                  fontSize="10.5"
                  fontWeight="700"
                  fill="#ffffff"
                  fontFamily="Inter, Arial, sans-serif"
                  style={{ pointerEvents: 'none', userSelect: 'none' }}
                >
                  {label}
                </text>
                <text
                  x={labelX + 7}
                  y={pt.y + 14}
                  fontSize="7.5"
                  fill="#cbd5e1"
                  fontFamily="Inter, Arial, sans-serif"
                  style={{ pointerEvents: 'none', userSelect: 'none' }}
                >
                  {l.country}
                </text>
              </g>
            );
          })}
        </svg>
      </div>

      <div
        style={{
          backgroundColor: COLORS.gray,
          borderTop: `1px solid ${COLORS.border}`,
          padding: '10px 20px',
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          fontSize: 12,
          color: '#4a5568',
          flexWrap: 'wrap',
        }}
      >
        <i
          className="fa-solid fa-circle-info"
          style={{ fontSize: 12, color: '#0369a1', flexShrink: 0 }}
        />
        <span>
          {verifiedLocations.length === 0
            ? 'No verified locations plotted yet — markers appear once coordinates are saved in the admin panel.'
            : `Showing ${verifiedLocations.length} verified logistics network location${verifiedLocations.length === 1 ? '' : 's'} with confirmed coordinates.`}
        </span>
      </div>
    </div>
  );
}

/* ── Location Fallback Component (when image fails) ──────────────────────── */

function ImageFallback({ country }) {
  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        backgroundColor: COLORS.navy,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 12,
        color: '#ffffff',
      }}
    >
      <i
        className="fa-solid fa-warehouse"
        style={{ fontSize: 44, color: 'rgba(255,255,255,0.25)' }}
      />
      <p
        style={{
          fontSize: 16,
          fontWeight: 700,
          letterSpacing: '1.5px',
          textTransform: 'uppercase',
          color: 'rgba(255,255,255,0.55)',
          margin: 0,
        }}
      >
        {country}
      </p>
    </div>
  );
}

/* ── Location Card ─────────────────────────────────────────────────────── */

function LocationCard({ location }) {
  const [imageFailed, setImageFailed] = useState(false);
  const [showAddress, setShowAddress] = useState(false);
  const [showPhone, setShowPhone] = useState(false);
  const [showEmail, setShowEmail] = useState(false);
  const [showHours, setShowHours] = useState(false);

  useEffect(() => {
    const l = location;
    setShowAddress(!!l.address && String(l.address).trim() !== '');
    setShowPhone(!!l.phone && String(l.phone).trim() !== '');
    setShowEmail(!!l.email && String(l.email).trim() !== '');
    setShowHours(!!l.opening_hours && String(l.opening_hours).trim() !== '');
  }, [location]);

  const hasVerifiedContactInfo = showAddress || showPhone || showEmail || showHours;

  const displayOfficeName =
    location.office_name && String(location.office_name).trim() !== ''
      ? location.office_name
      : 'International Logistics Network';

  const description =
    location.description && String(location.description).trim() !== ''
      ? location.description
      : hasVerifiedContactInfo
        ? ''
        : 'Official office information will be displayed here when provided.';

  return (
    <article
      style={{
        backgroundColor: '#fff',
        border: `1px solid ${COLORS.border}`,
        borderRadius: 10,
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        transition: 'transform 0.2s ease, box-shadow 0.2s ease',
      }}
      className="location-card"
      onMouseOver={(e) => {
        e.currentTarget.style.transform = 'translateY(-2px)';
        e.currentTarget.style.boxShadow = '0 8px 24px rgba(10,31,60,0.08)';
      }}
      onMouseOut={(e) => {
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.boxShadow = 'none';
      }}
    >
      {/* Photo area */}
      <div
        style={{
          position: 'relative',
          height: 220,
          overflow: 'hidden',
          backgroundColor: COLORS.navy,
          flexShrink: 0,
        }}
      >
        {location.image_url && !imageFailed ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={location.image_url}
            alt={
              location.image_alt ||
              `${location.country} logistics facility photography`
            }
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              display: 'block',
            }}
            loading="lazy"
            onError={() => setImageFailed(true)}
          />
        ) : (
          <ImageFallback country={location.country} />
        )}

        <div
          style={{
            position: 'absolute',
            inset: 0,
            background:
              'linear-gradient(180deg,rgba(10,31,60,0.0) 35%,rgba(10,31,60,0.85) 100%)',
          }}
        />

        {/* Country badge */}
        <div
          style={{
            position: 'absolute',
            top: 14,
            left: 14,
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6,
            padding: '4px 11px',
            backgroundColor: 'rgba(192,57,43,0.92)',
            borderRadius: 999,
          }}
        >
          <i
            className="fa-solid fa-location-dot"
            style={{ fontSize: 10, color: '#fff' }}
          />
          <span
            style={{
              fontSize: 10.5,
              fontWeight: 700,
              color: '#fff',
              letterSpacing: '0.8px',
              textTransform: 'uppercase',
            }}
          >
            {location.country}
          </span>
        </div>

        {/* Type tag bottom right */}
        {location.office_type && String(location.office_type).trim() !== '' && (
          <span
            style={{
              position: 'absolute',
              top: 14,
              right: 14,
              fontSize: 10,
              fontWeight: 700,
              letterSpacing: '0.8px',
              textTransform: 'uppercase',
              color: 'rgba(255,255,255,0.9)',
              backgroundColor: 'rgba(10,31,60,0.62)',
              backdropFilter: 'blur(3px)',
              padding: '4px 10px',
              borderRadius: 4,
            }}
          >
            {location.office_type}
          </span>
        )}

        {/* Bottom overlay text */}
        <div
          style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            padding: '16px 18px 18px',
          }}
        >
          <p
            style={{
              fontSize: 10,
              color: 'rgba(255,255,255,0.55)',
              fontWeight: 700,
              letterSpacing: '2px',
              textTransform: 'uppercase',
              marginBottom: 5,
            }}
          >
            Network Location
          </p>
          <h3
            style={{
              fontSize: 22,
              fontWeight: 800,
              color: '#fff',
              letterSpacing: '-0.3px',
              margin: 0,
              marginBottom: 3,
            }}
          >
            {location.city || location.country}
          </h3>
          {location.city && (
            <p
              style={{
                fontSize: 12,
                color: 'rgba(255,255,255,0.65)',
                margin: 0,
                fontWeight: 500,
              }}
            >
              {location.country}
            </p>
          )}
        </div>
      </div>

      {/* Body */}
      <div style={{ padding: '20px', flex: 1, display: 'flex', flexDirection: 'column', gap: 12 }}>
        <div>
          <p
            style={{
              fontSize: 14,
              fontWeight: 700,
              color: COLORS.navy,
              marginBottom: 6,
              marginTop: 0,
            }}
          >
            {displayOfficeName}
          </p>
          {description && (
            <p
              style={{
                fontSize: 13,
                color: '#4a5568',
                lineHeight: 1.65,
                margin: 0,
              }}
            >
              {description}
            </p>
          )}
        </div>

        {hasVerifiedContactInfo && (
          <div
            style={{
              borderTop: `1px solid ${COLORS.gray}`,
              paddingTop: 14,
              display: 'flex',
              flexDirection: 'column',
              gap: 8,
            }}
          >
            {showHours && (
              <DetailRow icon="fa-regular fa-clock" value={location.opening_hours} />
            )}
            {showAddress && (
              <DetailRow icon="fa-solid fa-map-pin" value={location.address} />
            )}
            {showPhone && (
              <DetailRow
                icon="fa-solid fa-phone"
                value={location.phone}
                href={`tel:${location.phone}`}
              />
            )}
            {showEmail && (
              <DetailRow
                icon="fa-solid fa-envelope"
                value={location.email}
                href={`mailto:${location.email}`}
              />
            )}
          </div>
        )}
      </div>

      {/* Footer */}
      <div
        style={{
          padding: '13px 20px',
          borderTop: `1px solid ${COLORS.gray}`,
          backgroundColor: '#fafbfc',
        }}
      >
        <Link
          href="/contact"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            width: '100%',
            padding: '10px 14px',
            fontSize: 12.5,
            fontWeight: 700,
            color: COLORS.navy,
            textDecoration: 'none',
            border: `1px solid ${COLORS.border}`,
            borderRadius: 6,
            backgroundColor: '#fff',
            transition: 'border-color 0.15s, background-color 0.15s, color 0.15s',
            letterSpacing: '0.3px',
          }}
          onMouseOver={(e) => {
            e.currentTarget.style.borderColor = COLORS.red;
            e.currentTarget.style.backgroundColor = '#fff5f4';
            e.currentTarget.style.color = COLORS.red;
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.borderColor = COLORS.border;
            e.currentTarget.style.backgroundColor = '#fff';
            e.currentTarget.style.color = COLORS.navy;
          }}
        >
          <span>VIEW LOCATION</span>
          <i className="fa-solid fa-arrow-right" style={{ fontSize: 10 }} />
        </Link>
      </div>
    </article>
  );
}

function DetailRow({ icon, value, href }) {
  const content = href ? (
    <a
      href={href}
      style={{
        fontSize: 12.5,
        color: '#4a5568',
        lineHeight: 1.5,
        textDecoration: 'none',
        wordBreak: 'break-word',
        fontWeight: 500,
      }}
      onMouseOver={(e) => {
        e.currentTarget.style.color = COLORS.red;
      }}
      onMouseOut={(e) => {
        e.currentTarget.style.color = '#4a5568';
      }}
    >
      {value}
    </a>
  ) : (
    <p
      style={{
        fontSize: 12.5,
        color: '#4a5568',
        lineHeight: 1.5,
        margin: 0,
        wordBreak: 'break-word',
        fontWeight: 500,
      }}
    >
      {value}
    </p>
  );

  return (
    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 9 }}>
      <div
        style={{
          width: 22,
          height: 22,
          borderRadius: 5,
          backgroundColor: '#fff5f4',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
          marginTop: 1,
        }}
      >
        <i
          className={icon}
          style={{ fontSize: 10.5, color: COLORS.red }}
        />
      </div>
      {content}
    </div>
  );
}

/* ── Public Locations Page ─────────────────────────────────────────────── */

export default function LocationsPage() {
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    async function fetchLocations() {
      try {
        const { data, error: fetchError } = await supabase
          .from('locations')
          .select('*')
          .eq('is_active', true)
          .order('country', { ascending: true })
          .order('city', { ascending: true });

        if (cancelled) return;
        if (fetchError) throw fetchError;

        setLocations(data || []);
      } catch (err) {
        console.error('[Locations] Fetch error:', err);
        if (!cancelled) setError('Unable to load locations.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    fetchLocations();
    return () => {
      cancelled = true;
    };
  }, []);

  const countries = useMemo(
    () => [...new Set(locations.map((o) => o.country).filter(Boolean))],
    [locations],
  );

  const [search, setSearch] = useState('');
  const [filterCountry, setFilterCountry] = useState('');

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return locations.filter((o) => {
      if (filterCountry && o.country !== filterCountry) return false;
      if (!q) return true;
      return (
        (o.country && o.country.toLowerCase().includes(q)) ||
        (o.city && o.city.toLowerCase().includes(q)) ||
        (o.office_name && o.office_name.toLowerCase().includes(q)) ||
        (o.description && o.description.toLowerCase().includes(q))
      );
    });
  }, [locations, search, filterCountry]);

  const hasFilters = !!search || !!filterCountry;

  function clearFilters() {
    setSearch('');
    setFilterCountry('');
  }

  return (
    <>
      <Head>
        <title>Global Offices & Locations — Josephdeliverycompany</title>
        <meta name="description" content="Connect with Josephdeliverycompany through its international logistics network and verified location directory." />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <Header />

      {/* ── HERO ───────────────────────────────────────────────────────── */}
      <section style={{ position: 'relative', backgroundColor: '#0a1f3c', overflow: 'hidden', minHeight: 420 }}>
        {/* Hero background — cargo/logistics photo */}
        <div style={{
          position: 'absolute', inset: 0,
          backgroundColor: '#0a1f3c',
          opacity: 1,
        }} />

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
      ) : (
        <>
          {/* ── HERO ───────────────────────────────────────────────── */}
          <section
            style={{
              position: 'relative',
              backgroundColor: COLORS.navy,
              overflow: 'hidden',
              minHeight: 420,
            }}
          >
            <div
              style={{
                position: 'absolute',
                inset: 0,
                backgroundImage: `url(${HERO_IMAGE})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center 55%',
                opacity: 0.2,
              }}
            />
            <div
              style={{
                position: 'absolute',
                inset: 0,
                background:
                  'linear-gradient(90deg,rgba(6,21,41,0.96) 0%,rgba(10,31,60,0.60) 65%,rgba(10,31,60,0.18) 100%)',
              }}
            />

      {/* ── WORLD MAP — photographic strip ─────────────────────────────── */}
      {activeOffices.length > 0 && (
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

            {/* Photo strip */}
            <div style={{ display: 'grid', gridTemplateColumns: `repeat(${Math.min(activeOffices.length, 6)},1fr)`, gap: 4, borderRadius: 8, overflow: 'hidden' }}
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
      )}

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
          </section>

          <main>
            {/* ── MAP ──────────────────────────────────────────────── */}
            <section
              style={{
                backgroundColor: COLORS.gray,
                borderBottom: `1px solid ${COLORS.border}`,
                padding: '48px 24px 40px',
              }}
            >
              <div style={{ maxWidth: 1140, margin: '0 auto' }}>
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'flex-end',
                    marginBottom: 22,
                    flexWrap: 'wrap',
                    gap: 12,
                  }}
                >
                  <div>
                    <p style={eyebrow}>Network Overview</p>
                    <h2
                      style={{
                        fontSize: 'clamp(18px,2.5vw,26px)',
                        fontWeight: 700,
                        color: COLORS.navy,
                        letterSpacing: '-0.2px',
                        margin: 0,
                      }}
                    >
                      Our Global Footprint
                    </h2>
                  </div>
                </div>

                <LocationMap locations={locations} />
              </div>
            </section>

            {/* ── SEARCH & FILTER ─────────────────────────────────── */}
            <section
              style={{
                backgroundColor: '#fff',
                borderBottom: `1px solid ${COLORS.border}`,
                padding: '28px 24px',
              }}
            >
              <div
                style={{
                  maxWidth: 1140,
                  margin: '0 auto',
                  display: 'flex',
                  gap: 10,
                  flexWrap: 'wrap',
                  alignItems: 'center',
                }}
              >
                <div
                  style={{
                    position: 'relative',
                    flex: '1 1 260px',
                    minWidth: 200,
                  }}
                >
                  <i
                    className="fa-solid fa-magnifying-glass"
                    style={{
                      position: 'absolute',
                      left: 14,
                      top: '50%',
                      transform: 'translateY(-50%)',
                      color: COLORS.muted,
                      fontSize: 13,
                      pointerEvents: 'none',
                    }}
                  />
                  <input
                    type="text"
                    placeholder="Search locations by country or city…"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '12px 14px 12px 40px',
                      fontSize: 14,
                      color: COLORS.navy,
                      border: `1px solid ${COLORS.border}`,
                      borderRadius: 6,
                      outline: 'none',
                      backgroundColor: '#fff',
                      boxSizing: 'border-box',
                      fontFamily: 'inherit',
                      transition: 'border-color 0.15s, box-shadow 0.15s',
                    }}
                    onFocus={(e) => {
                      e.currentTarget.style.borderColor = COLORS.red;
                      e.currentTarget.style.boxShadow =
                        '0 0 0 3px rgba(192,57,43,0.10)';
                    }}
                    onBlur={(e) => {
                      e.currentTarget.style.borderColor = COLORS.border;
                      e.currentTarget.style.boxShadow = 'none';
                    }}
                  />
                </div>

                <select
                  value={filterCountry}
                  onChange={(e) => setFilterCountry(e.target.value)}
                  style={selectStyle}
                >
                  <option value="">All Countries</option>
                  {PRIMARY_COUNTRIES.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                  {countries
                    .filter((c) => !PRIMARY_COUNTRIES.includes(c))
                    .map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                </select>

                {hasFilters && (
                  <button
                    onClick={clearFilters}
                    style={{
                      padding: '11px 16px',
                      fontSize: 13,
                      fontWeight: 600,
                      color: COLORS.red,
                      border: '1px solid #fbd0cc',
                      borderRadius: 6,
                      backgroundColor: '#fff5f4',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 6,
                      fontFamily: 'inherit',
                    }}
                  >
                    <i className="fa-solid fa-xmark" style={{ fontSize: 11 }} /> Clear
                  </button>
                )}

                <span
                  style={{
                    fontSize: 13,
                    color: COLORS.muted,
                    marginLeft: 'auto',
                    whiteSpace: 'nowrap',
                    fontWeight: 600,
                  }}
                >
                  {filtered.length} {filtered.length === 1 ? 'location' : 'locations'}
                </span>
              </div>
            </section>

            {/* ── DIRECTORY ──────────────────────────────────────── */}
            <section
              style={{
                backgroundColor: COLORS.gray,
                padding: '48px 24px 72px',
              }}
            >
              <div style={{ maxWidth: 1140, margin: '0 auto' }}>
                {error && filtered.length === 0 ? (
                  <EmptyState kind="error" message={error} onClear={clearFilters} />
                ) : filtered.length === 0 ? (
                  <EmptyState
                    kind={hasFilters ? 'filtered' : locations.length === 0 ? 'empty' : 'filtered'}
                    onClear={clearFilters}
                    hasAny={locations.length > 0}
                  />
                ) : (
                  <div
                    style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(auto-fill,minmax(320px,1fr))',
                      gap: 24,
                    }}
                    className="locations-grid"
                  >
                    {filtered.map((loc) => (
                      <LocationCard key={loc.id} location={loc} />
                    ))}
                  </div>
                )}
              </div>
            </section>

            {/* ── CTA ────────────────────────────────────────────── */}
            <section
              style={{
                backgroundColor: COLORS.navy,
                padding: '64px 24px',
                borderTop: '4px solid #c0392b',
              }}
            >
              <div
                style={{
                  maxWidth: 640,
                  margin: '0 auto',
                  textAlign: 'center',
                }}
              >
                <h2
                  style={{
                    fontSize: 'clamp(22px,3.5vw,36px)',
                    fontWeight: 800,
                    color: '#fff',
                    marginBottom: 14,
                    letterSpacing: '-0.3px',
                  }}
                >
                  Ready to ship internationally?
                </h2>
                <p
                  style={{
                    fontSize: 15,
                    color: '#94a3b8',
                    marginBottom: 32,
                    lineHeight: 1.7,
                  }}
                >
                  Get a competitive quote and our network team will be in touch.
                </p>
                <div
                  style={{
                    display: 'flex',
                    gap: 12,
                    justifyContent: 'center',
                    flexWrap: 'wrap',
                  }}
                >
                  <Link href="/quote" style={btnRed}>
                    GET A QUOTE
                  </Link>
                  <Link href="/contact" style={btnGhost}>
                    CONTACT THE NETWORK TEAM
                  </Link>
                </div>
              ))
            )}
          </div>
        </section>

        {/* ── PENDING INFO NOTICE ───────────────────────────────────────── */}
        {activeOffices.some(o => pending(o.address) || pending(o.phone) || pending(o.email)) && (
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
        )}

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
        @media (max-width: 420px) {
          .locations-grid {
            grid-template-columns: 1fr !important;
          }
        }
        .location-card {
          box-sizing: border-box;
        }
      `}</style>
    </>
  );
}

/* ── Office Card ─────────────────────────────────────────────────────────── */
function OfficeCard({ office }) {
  const pending = v => typeof v === 'string' && v.startsWith('[');
  const [imageFailed, setImageFailed] = useState(!office.imageUrl);

const eyebrow = {
  fontSize: 11,
  fontWeight: 700,
  letterSpacing: '3px',
  textTransform: 'uppercase',
  color: COLORS.red,
  marginBottom: 12,
  marginTop: 0,
};

const selectStyle = {
  padding: '12px 36px 12px 14px',
  fontSize: 14,
  color: COLORS.navy,
  border: `1px solid ${COLORS.border}`,
  borderRadius: 6,
  outline: 'none',
  backgroundColor: '#fff',
  cursor: 'pointer',
  appearance: 'none',
  backgroundImage:
    "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='8' viewBox='0 0 12 8'%3E%3Cpath d='M1 1l5 5 5-5' stroke='%2364748b' stroke-width='1.5' fill='none'/%3E%3C/svg%3E\")",
  backgroundRepeat: 'no-repeat',
  backgroundPosition: 'right 12px center',
  fontFamily: 'inherit',
  minWidth: 170,
  transition: 'border-color 0.15s',
};

const btnRed = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: 8,
  padding: '13px 26px',
  backgroundColor: COLORS.red,
  color: '#fff',
  fontWeight: 700,
  fontSize: 14,
  letterSpacing: '0.4px',
  textDecoration: 'none',
  borderRadius: 6,
  fontFamily: 'inherit',
};

const btnGhost = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: 8,
  padding: '13px 26px',
  backgroundColor: 'rgba(255,255,255,0.08)',
  color: '#fff',
  fontWeight: 600,
  fontSize: 14,
  textDecoration: 'none',
  borderRadius: 6,
  border: '1px solid rgba(255,255,255,0.2)',
  fontFamily: 'inherit',
};

function Stat({ label, value, accent }) {
  return (
    <div id={`location-${office.id}`} style={{ backgroundColor: '#fff', border: '1px solid #e2e6ea', borderRadius: 10, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
      {/* Photo */}
      <div style={{ position: 'relative', height: 200, overflow: 'hidden', backgroundColor: '#0a1f3c', flexShrink: 0 }}>
        {!imageFailed ? <>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={office.imageUrl} alt={office.imageAlt || `${office.country} logistics facility`} onError={() => setImageFailed(true)} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block', opacity: 0.75 }} loading="lazy" />
          <div style={{ position: 'absolute', inset: 0, backgroundColor: 'rgba(10,31,60,0.32)' }} />
        </> : <div style={{ height: '100%', display: 'grid', placeItems: 'center', padding: 24, color: '#cbd5e1', textAlign: 'center' }}><div><i className="fa-solid fa-image" style={{ fontSize: 28, marginBottom: 10 }} /><p style={{ fontSize: 12 }}>Location photograph unavailable</p></div></div>}

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
        <p style={{ fontSize: 13, color: '#4a5568', lineHeight: 1.6 }}>{office.description || 'International Logistics Network'}</p>

        <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: 12, display: 'flex', flexDirection: 'column', gap: 7 }}>
          {office.openingHours && <Row icon="fa-regular fa-clock"   value={office.openingHours} />}
          {office.address && <Row icon="fa-solid fa-map-pin"   value={office.address}     pending={pending(office.address)} />}
          {office.phone && <Row icon="fa-solid fa-phone"     value={office.phone}       pending={pending(office.phone)} />}
          {office.email && <Row icon="fa-solid fa-envelope"  value={office.email}       pending={pending(office.email)} />}
        </div>
      </div>

      {/* Footer */}
      <div style={{ padding: '11px 20px', borderTop: '1px solid #f1f5f9', backgroundColor: '#fafafa' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, alignItems: 'center' }}>
          <Link href={`#location-${office.id}`} style={{ fontSize: 13, fontWeight: 700, color: '#0a1f3c', display: 'flex', alignItems: 'center', gap: 6, textDecoration: 'none' }}>
            VIEW LOCATION <i className="fa-solid fa-arrow-right" style={{ fontSize: 10 }} />
          </Link>
          {Number.isFinite(Number(office.latitude)) && Number.isFinite(Number(office.longitude)) && <a href={`https://www.openstreetmap.org/?mlat=${office.latitude}&mlon=${office.longitude}#map=12/${office.latitude}/${office.longitude}`} target="_blank" rel="noreferrer" style={{ fontSize: 11, color: '#c0392b', fontWeight: 700, textDecoration: 'none' }}>OPEN MAP</a>}
        </div>
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
      <p
        style={{
          fontSize: 11,
          color: 'rgba(255,255,255,0.55)',
          textTransform: 'uppercase',
          letterSpacing: '1.5px',
          fontWeight: 700,
          margin: 0,
        }}
      >
        {label}
      </p>
    </div>
  );
}

function EmptyState({ kind, message, onClear, hasAny }) {
  return (
    <div
      style={{
        textAlign: 'center',
        padding: '64px 24px',
        color: COLORS.muted,
        backgroundColor: '#fff',
        border: `1px solid ${COLORS.border}`,
        borderRadius: 10,
      }}
    >
      {kind === 'error' ? (
        <i
          className="fa-solid fa-triangle-exclamation"
          style={{ fontSize: 40, marginBottom: 16, display: 'block', color: COLORS.red }}
        />
      ) : (
        <i
          className="fa-solid fa-location-crosshairs"
          style={{ fontSize: 40, marginBottom: 16, display: 'block', color: '#cbd5e1' }}
        />
      )}
      <p
        style={{
          fontSize: 16,
          fontWeight: 700,
          color: COLORS.navy,
          marginBottom: 6,
          marginTop: 0,
        }}
      >
        {kind === 'error'
          ? 'Unable to load locations'
          : kind === 'empty'
            ? 'Locations coming soon'
            : 'No locations match your search'}
      </p>
      <p style={{ fontSize: 14, margin: 0, marginBottom: 24 }}>
        {kind === 'error'
          ? message || 'Please try again later.'
          : kind === 'empty'
            ? 'Verified network locations will appear here once published.'
            : hasAny
              ? 'Try adjusting your search or filters.'
              : 'No active locations are available yet.'}
      </p>
      {kind === 'filtered' && (
        <button
          onClick={onClear}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 8,
            padding: '11px 20px',
            backgroundColor: COLORS.red,
            color: '#fff',
            fontWeight: 600,
            fontSize: 14,
            border: 'none',
            borderRadius: 6,
            cursor: 'pointer',
            fontFamily: 'inherit',
          }}
        >
          <i className="fa-solid fa-filter-circle-xmark" />
          Clear Filters
        </button>
      )}
    </div>
  );
}
