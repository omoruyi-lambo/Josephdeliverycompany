/**
 * TrackingTimeline — vertical progress timeline.
 * Each step has one of three statuses: 'completed' | 'current' | 'upcoming'
 */

const STEP_ICONS = {
  1: 'fa-solid fa-clipboard-check',
  2: 'fa-solid fa-box-open',
  3: 'fa-solid fa-building',
  4: 'fa-solid fa-truck',
  5: 'fa-solid fa-house',
  6: 'fa-solid fa-circle-check',
};

/** Visual config per status */
const STATUS_STYLE = {
  completed: {
    circleBg:     '#0a1f3c',
    circleBorder: '#0a1f3c',
    iconColor:    '#ffffff',
    labelColor:   '#0a1f3c',
    detailColor:  '#4a5568',
    lineBg:       '#0a1f3c',
    numberColor:  '#94a3b8',
  },
  current: {
    circleBg:     '#c0392b',
    circleBorder: '#c0392b',
    iconColor:    '#ffffff',
    labelColor:   '#c0392b',
    detailColor:  '#374151',
    lineBg:       '#e2e6ea',
    numberColor:  '#c0392b',
  },
  upcoming: {
    circleBg:     '#ffffff',
    circleBorder: '#d1d5db',
    iconColor:    '#d1d5db',
    labelColor:   '#9ca3af',
    detailColor:  '#9ca3af',
    lineBg:       '#e2e6ea',
    numberColor:  '#d1d5db',
  },
};

export default function TrackingTimeline({ steps }) {
  return (
    <div style={{
      backgroundColor: '#ffffff',
      border: '1px solid #e2e6ea',
      borderRadius: '3px',
      padding: '32px 28px',
      marginBottom: '24px',
    }}>
      <h2 style={{
        fontSize: '16px',
        fontWeight: 700,
        color: '#0a1f3c',
        marginBottom: '32px',
        letterSpacing: '0.1px',
      }}>
        Shipment Progress
      </h2>

      <div style={{ position: 'relative' }}>
        {steps.map((step, index) => {
          const s = STATUS_STYLE[step.status] || STATUS_STYLE.upcoming;
          const isLast = index === steps.length - 1;
          const icon = STEP_ICONS[step.id] || 'fa-solid fa-circle';

          return (
            <div
              key={step.id}
              style={{
                display: 'flex',
                gap: '20px',
                position: 'relative',
              }}
            >
              {/* Left column: circle + vertical connector line */}
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                flexShrink: 0,
                width: '40px',
              }}>
                {/* Circle */}
                <div style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '50%',
                  backgroundColor: s.circleBg,
                  border: `2px solid ${s.circleBorder}`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                  position: 'relative',
                  zIndex: 1,
                }}>
                  <i className={icon} style={{ fontSize: '15px', color: s.iconColor }} />
                </div>

                {/* Connector line — hidden for last step */}
                {!isLast && (
                  <div style={{
                    width: '2px',
                    flex: 1,
                    minHeight: '32px',
                    backgroundColor: s.lineBg,
                    margin: '4px 0',
                  }} />
                )}
              </div>

              {/* Right column: text content */}
              <div style={{
                paddingBottom: isLast ? '0' : '28px',
                flex: 1,
                paddingTop: '8px',
              }}>
                {/* Step number + label row */}
                <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', marginBottom: '4px' }}>
                  <span style={{
                    fontSize: '10px',
                    fontWeight: 700,
                    letterSpacing: '1px',
                    color: s.numberColor,
                    fontFamily: 'monospace',
                  }}>
                    {String(step.id).padStart(2, '0')}
                  </span>
                  <p style={{
                    fontSize: '15px',
                    fontWeight: 700,
                    color: s.labelColor,
                    lineHeight: 1.2,
                  }}>
                    {step.label}
                    {step.status === 'current' && (
                      <span style={{
                        marginLeft: '10px',
                        fontSize: '10px',
                        fontWeight: 700,
                        letterSpacing: '1px',
                        textTransform: 'uppercase',
                        color: '#ffffff',
                        backgroundColor: '#c0392b',
                        padding: '2px 8px',
                        borderRadius: '2px',
                        verticalAlign: 'middle',
                      }}>
                        Current
                      </span>
                    )}
                  </p>
                </div>

                {/* Detail text */}
                <p style={{
                  fontSize: '13px',
                  color: s.detailColor,
                  lineHeight: 1.5,
                  marginBottom: step.date ? '4px' : '0',
                }}>
                  {step.detail}
                </p>

                {/* Timestamp */}
                {step.date && (
                  <p style={{
                    fontSize: '12px',
                    color: '#94a3b8',
                    fontFamily: 'monospace',
                    letterSpacing: '0.3px',
                  }}>
                    {step.date}
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
