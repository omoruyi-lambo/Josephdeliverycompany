import Link from 'next/link';

/* ─── CONTACT DETAILS ──────────────────────────────────────────────────────
   Replace these values with the client's real contact details.
   All contact info is centralised here for easy future updates.
   ─────────────────────────────────────────────────────────────────────── */
const FOOTER_LINKS = [
  {
    heading: 'Company',
    links: [
      { label: 'About Us', href: '/about' },
      { label: 'Careers', href: '/careers' },
      { label: 'Contact', href: '/contact' },
    ],
  },
  {
    heading: 'Shipping',
    links: [
      { label: 'Services', href: '/services' },
      { label: 'Domestic Shipping', href: '/services/domestic' },
      { label: 'International Shipping', href: '/services/international' },
      { label: 'Freight', href: '/services/freight' },
    ],
  },
  {
    heading: 'Support',
    links: [
      { label: 'Track Shipment', href: '/track' },
      { label: 'Help Center', href: '/help' },
      { label: 'FAQs', href: '/faq' },
    ],
  },
  {
    heading: 'Business',
    links: [
      { label: 'Business Shipping', href: '/business' },
      { label: 'Request a Quote', href: '/quote' },
    ],
  },
];

const SOCIALS = [
  { icon: 'fa-brands fa-facebook-f', href: '#', label: 'Facebook' },
  { icon: 'fa-brands fa-x-twitter', href: '#', label: 'X / Twitter' },
  { icon: 'fa-brands fa-instagram', href: '#', label: 'Instagram' },
  { icon: 'fa-brands fa-linkedin-in', href: '#', label: 'LinkedIn' },
];

export default function Footer() {
  return (
    <footer style={{ backgroundColor: '#061529', color: '#94a3b8' }}>

      {/* ── Main footer body ─────────────────────────────────────────────── */}
      <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '64px 24px 48px' }}>

        {/* Top row — brand block + link columns */}
        <div
          className="footer-grid"
          style={{
            display: 'grid',
            gridTemplateColumns: '1.6fr repeat(4, 1fr)',
            gap: '40px 32px',
            alignItems: 'start',
          }}
        >
          {/* Brand + contact + socials */}
          <div
            className="footer-brand"
            style={{ display: 'flex', flexDirection: 'column', gap: '22px' }}
          >
            {/* Logo */}
            <Link
              href="/"
              style={{ textDecoration: 'none', display: 'inline-flex', alignItems: 'center' }}
            >
              <div style={{
                backgroundColor: '#ffffff',
                borderRadius: '6px',
                padding: '6px 10px',
                display: 'inline-flex',
                alignItems: 'center',
              }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/images/logo.png"
                  alt="Josephdeliverycompany — Shipping, Logistics, Global Reach"
                  style={{
                    height: '36px',
                    width: 'auto',
                    display: 'block',
                  }}
                />
              </div>
            </Link>

            {/* Contact details */}
            <address style={{ fontStyle: 'normal', display: 'flex', flexDirection: 'column', gap: '11px' }}>
              <a
                href="/contact"
                className="footer-contact-link"
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '10px',
                  color: '#94a3b8',
                  textDecoration: 'none',
                  fontSize: '13px',
                  lineHeight: 1.4,
                  wordBreak: 'break-all',
                }}
              >
                <i className="fa-solid fa-envelope" style={{ fontSize: '12px', marginTop: '1px', color: '#c0392b', flexShrink: 0 }} />
                Contact support
              </a>
            </address>

            {/* Social icons */}
            <div style={{ display: 'flex', gap: '8px' }}>
              {SOCIALS.map((s) => (
                <a
                  key={s.label}
                  href={s.href}
                  aria-label={s.label}
                  className="social-icon"
                  style={{
                    width: '34px',
                    height: '34px',
                    border: '1px solid rgba(255,255,255,0.12)',
                    borderRadius: '6px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#64748b',
                    textDecoration: 'none',
                    fontSize: '13px',
                    transition: 'color 0.15s, border-color 0.15s',
                    flexShrink: 0,
                  }}
                >
                  <i className={s.icon} />
                </a>
              ))}
            </div>
          </div>

          {/* Link columns */}
          {FOOTER_LINKS.map((col) => (
            <div key={col.heading} className="footer-col">
              <p style={{
                fontSize: '11px',
                fontWeight: 700,
                letterSpacing: '2px',
                textTransform: 'uppercase',
                color: '#ffffff',
                marginBottom: '18px',
              }}>
                {col.heading}
              </p>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '11px' }}>
                {col.links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="footer-link"
                      style={{
                        fontSize: '13px',
                        color: '#94a3b8',
                        textDecoration: 'none',
                        lineHeight: 1.4,
                        transition: 'color 0.15s',
                      }}
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* ── Bottom bar ───────────────────────────────────────────────────── */}
      <div style={{ borderTop: '1px solid rgba(255,255,255,0.07)' }}>
        <div style={{
          maxWidth: '1280px',
          margin: '0 auto',
          padding: '18px 24px',
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '12px',
        }}>
          <p style={{ fontSize: '12px', color: '#475569' }}>
            © 2026 Josephdeliverycompany. All rights reserved.
          </p>
          <div style={{ display: 'flex', gap: '20px' }}>
            <Link href="/privacy" className="footer-link" style={{ fontSize: '12px', color: '#475569', textDecoration: 'none' }}>
              Privacy Policy
            </Link>
            <Link href="/terms" className="footer-link" style={{ fontSize: '12px', color: '#475569', textDecoration: 'none' }}>
              Terms of Service
            </Link>
          </div>
        </div>
      </div>

      <style jsx>{`
        .footer-link:hover {
          color: #ffffff !important;
        }
        .footer-contact-link:hover {
          color: #ffffff !important;
        }
        .social-icon:hover {
          color: #ffffff !important;
          border-color: rgba(255, 255, 255, 0.4) !important;
        }

        /* Tablet: brand spans full width, links drop to 2 columns */
        @media (max-width: 1080px) {
          .footer-grid {
            grid-template-columns: 1fr 1fr 1fr 1fr !important;
          }
          .footer-brand {
            grid-column: 1 / -1 !important;
            flex-direction: row !important;
            flex-wrap: wrap !important;
            gap: 32px !important;
            padding-bottom: 32px;
            border-bottom: 1px solid rgba(255,255,255,0.07);
          }
        }

        /* Small tablet */
        @media (max-width: 700px) {
          .footer-grid {
            grid-template-columns: 1fr 1fr !important;
          }
          .footer-brand {
            flex-direction: column !important;
          }
        }

        /* Mobile */
        @media (max-width: 420px) {
          .footer-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </footer>
  );
}
