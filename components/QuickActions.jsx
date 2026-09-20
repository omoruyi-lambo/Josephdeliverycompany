import Link from 'next/link';

const ACTIONS = [
  {
    icon: 'fa-solid fa-box',
    title: 'Ship Now',
    description: 'Send packages locally or internationally.',
    href: '/shipping',
  },
  {
    icon: 'fa-solid fa-magnifying-glass-location',
    title: 'Track Shipment',
    description: 'Get the latest status of your shipment.',
    href: '/track',
  },
  {
    icon: 'fa-solid fa-file-invoice',
    title: 'Get a Quote',
    description: 'Estimate the cost of your delivery.',
    href: '/quote',
  },
  {
    icon: 'fa-solid fa-map-location-dot',
    title: 'Find a Location',
    description: 'Find a delivery location near you.',
    href: '/locations',
  },
];

export default function QuickActions() {
  return (
    <section style={{ backgroundColor: '#ffffff', borderBottom: '1px solid #e2e6ea' }}>
      <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '0 24px' }}>
        {/* Section heading */}
        <div style={{ padding: '52px 0 36px' }}>
          <h2 style={{
            fontSize: 'clamp(19px, 2.2vw, 24px)',
            fontWeight: 700,
            color: '#0a1f3c',
            letterSpacing: '-0.2px',
          }}>
            How can we help?
          </h2>
        </div>

        {/* Actions grid — separated by hairline borders, no gap */}
        <div
          className="actions-grid"
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(4, 1fr)',
            borderTop: '1px solid #e2e6ea',
            borderLeft: '1px solid #e2e6ea',
          }}
        >
          {ACTIONS.map((action) => (
            <Link
              key={action.title}
              href={action.href}
              style={{ textDecoration: 'none' }}
            >
              <div
                className="action-cell"
                style={{
                  padding: '32px 28px 36px',
                  borderRight: '1px solid #e2e6ea',
                  borderBottom: '1px solid #e2e6ea',
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '14px',
                  backgroundColor: '#ffffff',
                  transition: 'background-color 0.15s',
                  cursor: 'pointer',
                }}
              >
                {/* Icon */}
                <div style={{
                  width: '44px',
                  height: '44px',
                  backgroundColor: '#f4f5f7',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderRadius: '3px',
                  flexShrink: 0,
                }}>
                  <i className={action.icon} style={{ fontSize: '19px', color: '#0a1f3c' }} />
                </div>

                {/* Text */}
                <div>
                  <p style={{
                    fontSize: '15px',
                    fontWeight: 700,
                    color: '#0a1f3c',
                    marginBottom: '7px',
                  }}>
                    {action.title}
                  </p>
                  <p style={{
                    fontSize: '13px',
                    color: '#4a5568',
                    lineHeight: 1.55,
                  }}>
                    {action.description}
                  </p>
                </div>

                {/* Arrow indicator */}
                <div style={{ marginTop: 'auto' }}>
                  <i className="fa-solid fa-arrow-right" style={{ fontSize: '13px', color: '#c0392b' }} />
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* Bottom padding */}
        <div style={{ paddingBottom: '52px' }} />
      </div>

      <style jsx>{`
        .action-cell:hover {
          background-color: #f8f9fa !important;
        }
        @media (max-width: 900px) {
          .actions-grid {
            grid-template-columns: repeat(2, 1fr) !important;
          }
        }
        @media (max-width: 480px) {
          .actions-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </section>
  );
}
