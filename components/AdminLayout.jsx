import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { supabase } from '../lib/supabase/client';

const COLORS = {
  navy: '#0a1f3c',
  navyDark: '#061529',
  red: '#c0392b',
  redHover: '#a93226',
  gray: '#f4f5f7',
  border: '#e2e6ea',
  text: '#1a1a2e',
  muted: '#64748b',
};

const NAV_ITEMS = [
  { href: '/admin', label: 'Dashboard', icon: 'fa-chart-line', exact: true },
  { href: '/admin/shipments', label: 'Shipments', icon: 'fa-box' },
  { href: '/admin/shipments/new', label: 'Create Shipment', icon: 'fa-plus' },
  {
    href: '/admin/shipments/events',
    label: 'Tracking Events',
    icon: 'fa-route',
  },
  { href: '/admin/quotes', label: 'Quote Requests', icon: 'fa-file-invoice' },
  { href: '/admin/messages', label: 'Messages', icon: 'fa-envelope' },
  { href: '/admin/locations', label: 'Locations', icon: 'fa-map-marker-alt' },
  { href: '/admin/settings', label: 'Settings', icon: 'fa-cog' },
];

const NAVIGATION_BREAKPOINT = 1024;

function isActive(router, item) {
  if (item.exact) return router.pathname === item.href;
  return (
    router.pathname === item.href ||
    router.pathname.startsWith(item.href + '/')
  );
}

export default function AdminLayout({ children, title, profile }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isDesktop, setIsDesktop] = useState(false);
  const router = useRouter();

  useEffect(() => {
    function handleResize() {
      setIsDesktop(window.innerWidth >= NAVIGATION_BREAKPOINT);
    }
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    if (isDesktop) setSidebarOpen(false);
  }, [isDesktop]);

  useEffect(() => {
    if (typeof document === 'undefined') return;
    document.body.style.overflow = sidebarOpen && !isDesktop ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [sidebarOpen, isDesktop]);

  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut({ scope: 'global' });
    } catch (err) {
      console.error('[AdminLayout] Sign out error:', err);
    } finally {
      router.replace('/signin');
    }
  };

  const displayName =
    profile?.full_name ||
    profile?.email ||
    (profile?.first_name && profile?.last_name
      ? `${profile.first_name} ${profile.last_name}`
      : null) ||
    'Admin';

  const sidebarVisible = isDesktop || sidebarOpen;

  return (
    <div
      style={{
        display: 'flex',
        minHeight: '100vh',
        backgroundColor: COLORS.gray,
      }}
    >
      {/* Overlay (mobile only) */}
      {sidebarOpen && !isDesktop && (
        <div
          aria-hidden="true"
          onClick={() => setSidebarOpen(false)}
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(6, 21, 41, 0.55)',
            zIndex: 40,
          }}
        />
      )}

      {/* Sidebar */}
      <aside
        aria-label="Admin navigation"
        style={{
          position: 'fixed',
          left: 0,
          top: 0,
          bottom: 0,
          width: 260,
          backgroundColor: COLORS.navy,
          color: '#fff',
          display: 'flex',
          flexDirection: 'column',
          zIndex: 50,
          transform: sidebarVisible ? 'translateX(0)' : 'translateX(-100%)',
          transition:
            !isDesktop && sidebarOpen
              ? 'transform 0.25s ease'
              : 'transform 0.2s ease',
          boxShadow: isDesktop
            ? 'none'
            : sidebarOpen
              ? '4px 0 24px rgba(0,0,0,0.25)'
              : 'none',
        }}
      >
        {/* Logo / brand */}
        <div
          style={{
            padding: '18px 20px 16px',
            borderBottom: '1px solid rgba(255,255,255,0.08)',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 12,
            }}
          >
            <Link
              href="/"
              aria-label="Josephdeliverycompany — Home"
              style={{
                textDecoration: 'none',
                display: 'flex',
                alignItems: 'center',
                minWidth: 0,
                flex: 1,
              }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/images/logo.png"
                alt="Josephdeliverycompany"
                style={{
                  height: '44px',
                  width: 'auto',
                  maxWidth: '100%',
                  display: 'block',
                }}
              />
            </Link>
            {!isDesktop && (
              <button
                type="button"
                aria-label="Close sidebar"
                onClick={() => setSidebarOpen(false)}
                style={{
                  backgroundColor: 'transparent',
                  color: '#94a3b8',
                  border: 'none',
                  cursor: 'pointer',
                  padding: 6,
                  fontSize: 16,
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                <i className="fa-solid fa-times" />
              </button>
            )}
          </div>
          <p
            style={{
              fontSize: 11,
              color: '#94a3b8',
              marginTop: 10,
              margin: '10px 2px 0',
              letterSpacing: '0.4px',
            }}
          >
            Admin Portal
          </p>
        </div>

        {/* Nav */}
        <nav
          style={{
            flex: 1,
            padding: '14px 10px',
            overflowY: 'auto',
          }}
        >
          <ul style={{ listStyle: 'none', margin: 0, padding: 0 }}>
            {NAV_ITEMS.map((item) => {
              const active = isActive(router, item);
              return (
                <li key={item.href} style={{ marginBottom: 2 }}>
                  <Link
                    href={item.href}
                    onClick={() => {
                      if (!isDesktop) setSidebarOpen(false);
                    }}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 12,
                      padding: '10px 12px',
                      color: active ? '#fff' : '#cbd5e1',
                      backgroundColor: active ? COLORS.red : 'transparent',
                      borderRadius: 6,
                      textDecoration: 'none',
                      fontSize: 13.5,
                      fontWeight: active ? 600 : 500,
                      lineHeight: 1.2,
                    }}
                    onMouseOver={(e) => {
                      if (!active) {
                        e.currentTarget.style.backgroundColor =
                          'rgba(255,255,255,0.05)';
                        e.currentTarget.style.color = '#fff';
                      }
                    }}
                    onMouseOut={(e) => {
                      if (!active) {
                        e.currentTarget.style.backgroundColor = 'transparent';
                        e.currentTarget.style.color = '#cbd5e1';
                      }
                    }}
                  >
                    <i
                      className={`fa-solid ${item.icon}`}
                      style={{ width: 18, textAlign: 'center', fontSize: 14 }}
                    />
                    <span style={{ whiteSpace: 'nowrap' }}>{item.label}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* User / sign out */}
        <div
          style={{
            padding: '14px 14px 16px',
            borderTop: '1px solid rgba(255,255,255,0.08)',
          }}
        >
          <div style={{ marginBottom: 12 }}>
            <p
              style={{
                fontSize: 13,
                fontWeight: 600,
                color: '#fff',
                margin: 0,
                marginBottom: 2,
                lineHeight: 1.25,
                wordBreak: 'break-word',
              }}
            >
              {displayName}
            </p>
            <p
              style={{
                fontSize: 11.5,
                color: '#94a3b8',
                margin: 0,
                letterSpacing: '0.2px',
              }}
            >
              Administrator
            </p>
          </div>
          <button
            type="button"
            onClick={handleSignOut}
            style={{
              width: '100%',
              padding: '9px 12px',
              backgroundColor: 'rgba(255,255,255,0.06)',
              color: '#e2e8f0',
              border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: 6,
              fontSize: 13,
              fontWeight: 500,
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
            }}
            onMouseOver={(e) =>
              (e.currentTarget.style.backgroundColor =
                'rgba(192, 57, 43, 0.25)')
            }
            onMouseOut={(e) =>
              (e.currentTarget.style.backgroundColor =
                'rgba(255,255,255,0.06)')
            }
          >
            <i className="fa-solid fa-sign-out-alt" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main content */}
      <div
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          minWidth: 0,
          marginLeft: isDesktop ? 260 : 0,
          transition: 'margin-left 0.2s ease',
        }}
      >
        {/* Header */}
        <header
          style={{
            backgroundColor: '#fff',
            borderBottom: `1px solid ${COLORS.border}`,
            padding: '14px 20px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 16,
            position: 'sticky',
            top: 0,
            zIndex: 30,
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 12,
              minWidth: 0,
            }}
          >
            {!isDesktop && (
              <button
                type="button"
                aria-label="Open menu"
                onClick={() => setSidebarOpen(true)}
                style={{
                  padding: '8px 10px',
                  backgroundColor: 'transparent',
                  border: `1px solid ${COLORS.border}`,
                  borderRadius: 6,
                  cursor: 'pointer',
                  color: COLORS.text,
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                <i className="fa-solid fa-bars" style={{ fontSize: 16 }} />
              </button>
            )}
            <h1
              style={{
                fontSize: isDesktop ? 20 : 17,
                fontWeight: 700,
                color: COLORS.navy,
                margin: 0,
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
              }}
            >
              {title || 'Dashboard'}
            </h1>
          </div>

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: isDesktop ? 16 : 8,
              flexShrink: 0,
            }}
          >
            <button
              type="button"
              aria-label="Notifications"
              style={{
                padding: '8px 10px',
                backgroundColor: 'transparent',
                border: `1px solid ${COLORS.border}`,
                borderRadius: 6,
                cursor: 'pointer',
                color: COLORS.muted,
                display: 'none',
              }}
            >
              <i className="fa-solid fa-bell" style={{ fontSize: 14 }} />
            </button>
            <Link
              href="/"
              style={{
                fontSize: 13,
                color: COLORS.muted,
                textDecoration: 'none',
                fontWeight: 500,
                padding: '6px 10px',
                borderRadius: 6,
              }}
              onMouseOver={(e) => (e.currentTarget.style.color = COLORS.red)}
              onMouseOut={(e) => (e.currentTarget.style.color = COLORS.muted)}
            >
              <span
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 6,
                }}
              >
                <i className="fa-solid fa-arrow-left" />
                View Site
              </span>
            </Link>
          </div>
        </header>

        {/* Page */}
        <main
          style={{
            flex: 1,
            padding: '20px',
            overflowX: 'hidden',
            overflowY: 'auto',
            maxWidth: '100%',
          }}
        >
          {children}
        </main>
      </div>
    </div>
  );
}
