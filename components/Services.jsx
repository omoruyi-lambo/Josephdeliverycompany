import Link from 'next/link';

/*
 * SERVICE IMAGE SOURCES
 * ─────────────────────────────────────────────────────────────────────────────
 * Currently using Unsplash CDN images (free, no branding).
 * To replace with local images later:
 *   1. Place the file in /public/images/services/
 *   2. Update the imageSrc value to e.g. '/images/services/express.jpg'
 *
 * Unsplash source attribution (Unsplash License — free for commercial use):
 *   express       – unsplash.com/photos/1568702846914-96b305d2aaeb
 *   domestic      – unsplash.com/photos/1601584115197-04ecc0da31d7
 *   international – unsplash.com/photos/1436491865332-7a61a109cc05
 *   freight       – unsplash.com/photos/1578575437130-527eed3abbec
 * ─────────────────────────────────────────────────────────────────────────────
 */
const SERVICES = [
  {
    icon: 'fa-solid fa-bolt',
    title: 'Express Delivery',
    description: 'Fast delivery for time-sensitive shipments.',
    href: '/services/express',
    imageSrc:
      'https://images.unsplash.com/photo-1568702846914-96b305d2aaeb?auto=format&fit=crop&w=800&q=80',
    imageAlt: 'Courier handling a parcel for express delivery',
  },
  {
    icon: 'fa-solid fa-truck',
    title: 'Domestic Shipping',
    description: 'Reliable delivery across Nigeria.',
    href: '/services/domestic',
    imageSrc:
      'https://images.unsplash.com/photo-1601584115197-04ecc0da31d7?auto=format&fit=crop&w=800&q=80',
    imageAlt: 'Delivery van on the road for domestic shipping',
  },
  {
    icon: 'fa-solid fa-earth-africa',
    title: 'International Shipping',
    description: 'Shipping solutions for destinations around the world.',
    href: '/services/international',
    imageSrc:
      'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?auto=format&fit=crop&w=800&q=80',
    imageAlt: 'Commercial aircraft on tarmac for international air freight',
  },
  {
    icon: 'fa-solid fa-pallet',
    title: 'Freight & Cargo',
    description: 'Solutions for larger and heavier shipments.',
    href: '/services/freight',
    imageSrc:
      'https://images.unsplash.com/photo-1578575437130-527eed3abbec?auto=format&fit=crop&w=800&q=80',
    imageAlt: 'Shipping containers at a freight port',
  },
];

export default function Services() {
  return (
    <section style={{ backgroundColor: '#ffffff', padding: '80px 0', borderBottom: '1px solid #e2e6ea' }}>
      <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '0 24px' }}>

        {/* Section header */}
        <div style={{ marginBottom: '48px' }}>
          <p style={{
            fontSize: '11px',
            fontWeight: 700,
            letterSpacing: '2.5px',
            textTransform: 'uppercase',
            color: '#c0392b',
            marginBottom: '10px',
          }}>
            Our Services
          </p>
          <h2 style={{
            fontSize: 'clamp(22px, 2.8vw, 34px)',
            fontWeight: 700,
            color: '#0a1f3c',
            marginBottom: '14px',
            letterSpacing: '-0.3px',
            lineHeight: 1.15,
          }}>
            Shipping Solutions for Every Need
          </h2>
          <p style={{
            fontSize: '15px',
            color: '#4a5568',
            lineHeight: 1.65,
            maxWidth: '560px',
          }}>
            From individual packages to business logistics, Josephdeliverycompany provides
            flexible delivery solutions.
          </p>
        </div>

        {/* Cards grid */}
        <div
          className="services-grid"
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(4, 1fr)',
            gap: '20px',
          }}
        >
          {SERVICES.map((service) => (
            <div
              key={service.title}
              className="service-card"
              style={{
                border: '1px solid #e2e6ea',
                borderRadius: '3px',
                overflow: 'hidden',
                display: 'flex',
                flexDirection: 'column',
                backgroundColor: '#ffffff',
                transition: 'box-shadow 0.15s',
              }}
            >
              {/* ── Image panel ─────────────────────────────────────────── */}
              <div
                className="service-img-wrap"
                style={{
                  height: '180px',
                  position: 'relative',
                  overflow: 'hidden',
                  backgroundColor: '#0a1f3c',
                  flexShrink: 0,
                }}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={service.imageSrc}
                  alt={service.imageAlt}
                  style={{
                    position: 'absolute',
                    inset: 0,
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                    objectPosition: 'center',
                    display: 'block',
                  }}
                  loading="lazy"
                />
                {/* Subtle navy tint so card body blends cleanly */}
                <div
                  style={{
                    position: 'absolute',
                    inset: 0,
                    backgroundColor: 'rgba(10, 31, 60, 0.18)',
                    pointerEvents: 'none',
                  }}
                />
              </div>

              {/* ── Card body ───────────────────────────────────────────── */}
              <div style={{
                padding: '22px 24px 24px',
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                gap: '8px',
              }}>
                {/* Icon badge */}
                <div style={{
                  width: '36px',
                  height: '36px',
                  backgroundColor: '#f4f5f7',
                  borderRadius: '3px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '2px',
                }}>
                  <i className={service.icon} style={{ fontSize: '16px', color: '#0a1f3c' }} />
                </div>

                <h3 style={{
                  fontSize: '15px',
                  fontWeight: 700,
                  color: '#0a1f3c',
                  letterSpacing: '0.1px',
                  lineHeight: 1.3,
                }}>
                  {service.title}
                </h3>

                <p style={{
                  fontSize: '13px',
                  color: '#4a5568',
                  lineHeight: 1.6,
                  flex: 1,
                }}>
                  {service.description}
                </p>

                <div style={{
                  paddingTop: '12px',
                  marginTop: 'auto',
                  borderTop: '1px solid #f0f0f0',
                }}>
                  <Link
                    href={service.href}
                    className="service-link"
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px',
                      fontSize: '13px',
                      fontWeight: 600,
                      color: '#0a1f3c',
                      textDecoration: 'none',
                      transition: 'color 0.15s',
                    }}
                  >
                    Learn more
                    <i className="fa-solid fa-arrow-right" style={{ fontSize: '11px' }} />
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <style jsx>{`
        .service-card:hover {
          box-shadow: 0 2px 14px rgba(10, 31, 60, 0.10);
        }
        .service-link:hover {
          color: #c0392b !important;
        }
        @media (max-width: 1024px) {
          .services-grid {
            grid-template-columns: repeat(2, 1fr) !important;
          }
        }
        @media (max-width: 600px) {
          .services-grid {
            grid-template-columns: 1fr !important;
          }
          .service-img-wrap {
            height: 200px !important;
          }
        }
      `}</style>
    </section>
  );
}
