import { useState } from 'react';
import Link from 'next/link';

const NAV_LINKS = [
  { label: 'Shipping', href: '/shipping', hasDropdown: true },
  { label: 'Tracking', href: '/track', hasDropdown: false },
  { label: 'Services', href: '/services', hasDropdown: true },
  { label: 'Locations', href: '/locations', hasDropdown: false },
  { label: 'Support', href: '/support', hasDropdown: false },
  { label: 'Sign Up', href: '/signup', hasDropdown: false },
];

export default function Header() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header style={{
      position: 'sticky',
      top: 0,
      zIndex: 1000,
      backgroundColor: '#ffffff',
    }}>

      {/* ── Top utility bar (desktop only) ──────────────────────────────── */}
      <div
        className="utility-bar"
        style={{
          backgroundColor: '#0a1f3c',
          color: '#94a3b8',
          fontSize: '12px',
          padding: '5px 0',
        }}
      >
        <div style={{
          maxWidth: '1280px',
          margin: '0 auto',
          padding: '0 24px',
          display: 'flex',
          justifyContent: 'flex-end',
          alignItems: 'center',
          gap: '28px',
        }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <i className="fa-solid fa-phone" style={{ fontSize: '10px', color: '#c0392b' }} />
            +234 801 234 5678
          </span>
          <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <i className="fa-solid fa-envelope" style={{ fontSize: '10px', color: '#c0392b' }} />
            info@josephdeliverycompany.com
          </span>
        </div>
      </div>

      {/* ── Main nav bar ─────────────────────────────────────────────────── */}
      <div style={{ borderBottom: '1px solid #e2e6ea' }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '0 24px' }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            height: '66px',
          }}>

            {/* Logo image */}
            <Link
              href="/"
              style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', flexShrink: 0 }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/images/logo.png"
                alt="Josephdeliverycompany — Shipping, Logistics, Global Reach"
                style={{
                  height: '44px',
                  width: 'auto',
                  display: 'block',
                }}
              />
            </Link>

            {/* Desktop nav links */}
            <nav
              className="desktop-nav"
              style={{ display: 'flex', alignItems: 'center', gap: '2px' }}
            >
              {NAV_LINKS.map((link) => (
                <Link
                  key={link.label}
                  href={link.href}
                  className="nav-link"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '5px',
                    padding: '8px 15px',
                    fontSize: '14px',
                    fontWeight: 500,
                    color: '#374151',
                    textDecoration: 'none',
                    borderRadius: '6px',
                    whiteSpace: 'nowrap',
                    transition: 'color 0.15s, background-color 0.15s',
                  }}
                >
                  {link.label}
                  {link.hasDropdown && (
                    <i
                      className="fa-solid fa-chevron-down"
                      style={{ fontSize: '9px', color: '#9ca3af' }}
                    />
                  )}
                </Link>
              ))}
            </nav>

            {/* Desktop right actions */}
            <div
              className="desktop-nav"
              style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
            >
              <Link
                href="/signin"
                className="signin-btn"
                style={{
                  padding: '8px 16px',
                  fontSize: '14px',
                  fontWeight: 500,
                  color: '#0a1f3c',
                  textDecoration: 'none',
                  border: '1px solid #d1d5db',
                  borderRadius: '6px',
                  whiteSpace: 'nowrap',
                  transition: 'background-color 0.15s',
                }}
              >
                Sign In
              </Link>
              <Link
                href="/quote"
                className="quote-btn"
                style={{
                  padding: '8px 18px',
                  fontSize: '14px',
                  fontWeight: 700,
                  color: '#ffffff',
                  textDecoration: 'none',
                  backgroundColor: '#c0392b',
                  borderRadius: '6px',
                  letterSpacing: '0.3px',
                  whiteSpace: 'nowrap',
                  transition: 'background-color 0.15s',
                }}
              >
                GET A QUOTE
              </Link>
            </div>

            {/* Mobile hamburger */}
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="hamburger-btn"
              aria-label={mobileOpen ? 'Close navigation' : 'Open navigation'}
              style={{
                display: 'none',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                padding: '6px',
                color: '#0a1f3c',
                lineHeight: 1,
              }}
            >
              <i
                className={mobileOpen ? 'fa-solid fa-xmark' : 'fa-solid fa-bars'}
                style={{ fontSize: '22px' }}
              />
            </button>
          </div>
        </div>
      </div>

      {/* ── Mobile menu ──────────────────────────────────────────────────── */}
      {mobileOpen && (
        <div style={{
          backgroundColor: '#ffffff',
          borderBottom: '1px solid #e2e6ea',
        }}>
          <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '8px 24px 20px' }}>
            {NAV_LINKS.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                style={{
                  display: 'block',
                  padding: '13px 0',
                  fontSize: '15px',
                  fontWeight: 500,
                  color: '#374151',
                  textDecoration: 'none',
                  borderBottom: '1px solid #f3f4f6',
                }}
              >
                {link.label}
              </Link>
            ))}

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '18px' }}>
              <Link
                href="/signin"
                onClick={() => setMobileOpen(false)}
                style={{
                  display: 'block',
                  padding: '13px 16px',
                  fontSize: '15px',
                  fontWeight: 500,
                  color: '#0a1f3c',
                  textDecoration: 'none',
                  border: '1px solid #d1d5db',
                  borderRadius: '6px',
                  textAlign: 'center',
                }}
              >
                Sign In
              </Link>
              <Link
                href="/quote"
                onClick={() => setMobileOpen(false)}
                style={{
                  display: 'block',
                  padding: '13px 16px',
                  fontSize: '15px',
                  fontWeight: 700,
                  color: '#ffffff',
                  textDecoration: 'none',
                  backgroundColor: '#c0392b',
                  borderRadius: '6px',
                  textAlign: 'center',
                  letterSpacing: '0.3px',
                }}
              >
                GET A QUOTE
              </Link>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        /* Desktop — utility bar visible, hamburger hidden */
        .utility-bar {
          display: block;
        }
        .hamburger-btn {
          display: none !important;
        }

        /* Hover states */
        .nav-link:hover {
          color: #0a1f3c !important;
          background-color: #f4f5f7 !important;
        }
        .signin-btn:hover {
          background-color: #f4f5f7 !important;
        }
        .quote-btn:hover {
          background-color: #a93226 !important;
        }

        /* Tablet / mobile — hide utility bar and desktop nav, show hamburger */
        @media (max-width: 768px) {
          .utility-bar {
            display: none !important;
          }
          .desktop-nav {
            display: none !important;
          }
          .hamburger-btn {
            display: flex !important;
          }
        }
      `}</style>
    </header>
  );
}
