const STEPS = [
  {
    number: '01',
    icon: 'fa-solid fa-clipboard-list',
    title: 'Book Your Shipment',
    description: 'Choose your service and provide the shipment details.',
  },
  {
    number: '02',
    icon: 'fa-solid fa-magnifying-glass-location',
    title: 'Track Your Package',
    description: 'Use your tracking number to follow its progress.',
  },
  {
    number: '03',
    icon: 'fa-solid fa-circle-check',
    title: 'Receive Your Delivery',
    description: 'Your shipment arrives safely at its destination.',
  },
];

const CIRCLE_SIZE = 88; // px

export default function HowItWorks() {
  return (
    <section style={{
      backgroundColor: '#f4f5f7',
      padding: '80px 0',
      borderTop: '1px solid #e2e6ea',
      borderBottom: '1px solid #e2e6ea',
    }}>
      <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '0 24px' }}>

        {/* Section header */}
        <div style={{ textAlign: 'center', marginBottom: '56px' }}>
          <p style={{
            fontSize: '11px',
            fontWeight: 700,
            letterSpacing: '2.5px',
            textTransform: 'uppercase',
            color: '#c0392b',
            marginBottom: '10px',
          }}>
            How It Works
          </p>
          <h2 style={{
            fontSize: 'clamp(22px, 2.8vw, 34px)',
            fontWeight: 700,
            color: '#0a1f3c',
            letterSpacing: '-0.3px',
          }}>
            Shipping Made Simple
          </h2>
        </div>

        {/* Steps row */}
        <div
          className="steps-wrapper"
          style={{ position: 'relative' }}
        >
          {/* Desktop connecting line — sits at vertical centre of the circles.
              Spans from centre of first circle to centre of last circle. */}
          <div
            className="connector"
            style={{
              position: 'absolute',
              top: `${CIRCLE_SIZE / 2}px`,
              left: `calc(16.667% + ${CIRCLE_SIZE / 2}px)`,
              right: `calc(16.667% + ${CIRCLE_SIZE / 2}px)`,
              height: '1px',
              backgroundColor: '#d1d5db',
              zIndex: 0,
            }}
          />

          <div
            className="steps-grid"
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              position: 'relative',
              zIndex: 1,
            }}
          >
            {STEPS.map((step, index) => (
              <div
                key={step.number}
                className="step-item"
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  textAlign: 'center',
                  padding: `0 40px`,
                }}
              >
                {/* Circle */}
                <div style={{
                  width: `${CIRCLE_SIZE}px`,
                  height: `${CIRCLE_SIZE}px`,
                  borderRadius: '50%',
                  backgroundColor: '#ffffff',
                  border: '2px solid #d1d5db',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '28px',
                  flexShrink: 0,
                  position: 'relative',
                  zIndex: 2,
                }}>
                  <span style={{
                    fontSize: '10px',
                    fontWeight: 700,
                    color: '#c0392b',
                    letterSpacing: '1.5px',
                    lineHeight: 1,
                    marginBottom: '5px',
                    fontFamily: 'inherit',
                  }}>
                    {step.number}
                  </span>
                  <i
                    className={step.icon}
                    style={{ fontSize: '22px', color: '#0a1f3c' }}
                  />
                </div>

                <h3 style={{
                  fontSize: '16px',
                  fontWeight: 700,
                  color: '#0a1f3c',
                  marginBottom: '10px',
                  letterSpacing: '0.1px',
                }}>
                  {step.title}
                </h3>
                <p style={{
                  fontSize: '14px',
                  color: '#4a5568',
                  lineHeight: 1.65,
                  maxWidth: '220px',
                }}>
                  {step.description}
                </p>

                {/* Vertical connector shown on mobile between steps */}
                {index < STEPS.length - 1 && (
                  <div
                    className="mobile-connector"
                    style={{
                      display: 'none',
                      width: '1px',
                      height: '36px',
                      backgroundColor: '#d1d5db',
                      margin: '28px 0 0',
                    }}
                  />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      <style jsx>{`
        @media (max-width: 768px) {
          .steps-grid {
            grid-template-columns: 1fr !important;
          }
          .connector {
            display: none !important;
          }
          .step-item {
            padding: 0 16px 40px !important;
          }
          .mobile-connector {
            display: block !important;
          }
        }
      `}</style>
    </section>
  );
}
