/**
 * ShipmentSummary — top-level status card displayed below the search bar.
 * Shows tracking number, status badge, current location, ETA, and service type.
 */

/** Maps statusCode to a colour pair { bg, text } */
const STATUS_COLOURS = {
  IN_TRANSIT:        { bg: '#dbeafe', text: '#1e40af', dot: '#2563eb' },
  OUT_FOR_DELIVERY:  { bg: '#fef9c3', text: '#854d0e', dot: '#ca8a04' },
  DELIVERED:         { bg: '#dcfce7', text: '#166534', dot: '#16a34a' },
  BOOKED:            { bg: '#f3f4f6', text: '#374151', dot: '#6b7280' },
  COLLECTED:         { bg: '#e0f2fe', text: '#0369a1', dot: '#0284c7' },
  ON_HOLD:           { bg: '#fee2e2', text: '#991b1b', dot: '#c0392b' },
  FAILED_DELIVERY:   { bg: '#fee2e2', text: '#991b1b', dot: '#dc2626' },
  RETURNED:          { bg: '#fce7f3', text: '#9d174d', dot: '#db2777' },
  DEFAULT:           { bg: '#f4f5f7', text: '#374151', dot: '#6b7280' },
};

function statusColour(code) {
  return STATUS_COLOURS[code] || STATUS_COLOURS.DEFAULT;
}

/** One summary field tile */
function SummaryField({ label, value, mono }) {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      gap: '4px',
      padding: '20px 24px',
      borderRight: '1px solid #e2e6ea',
      borderBottom: '1px solid #e2e6ea',
    }}
      className="summary-field"
    >
      <p style={{
        fontSize: '10px',
        fontWeight: 700,
        letterSpacing: '1.5px',
        textTransform: 'uppercase',
        color: '#94a3b8',
      }}>
        {label}
      </p>
      <p style={{
        fontSize: '15px',
        fontWeight: 600,
        color: '#0a1f3c',
        fontFamily: mono ? 'monospace' : 'inherit',
        letterSpacing: mono ? '0.5px' : '0',
        lineHeight: 1.3,
      }}>
        {value}
      </p>
    </div>
  );
}

export default function ShipmentSummary({ shipment }) {
  const colours = statusColour(shipment.statusCode);

  return (
    <div style={{
      backgroundColor: '#ffffff',
      border: '1px solid #e2e6ea',
      borderRadius: '3px',
      overflow: 'hidden',
      marginBottom: '24px',
    }}>
      {/* Status header bar */}
      <div style={{
        backgroundColor: '#0a1f3c',
        padding: '16px 24px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '12px',
      }}>
        <div>
          <p style={{ fontSize: '11px', color: '#64748b', letterSpacing: '1px', textTransform: 'uppercase', marginBottom: '4px' }}>
            Tracking Number
          </p>
          <p style={{ fontSize: '18px', fontWeight: 700, color: '#ffffff', fontFamily: 'monospace', letterSpacing: '1px' }}>
            {shipment.trackingNumber}
          </p>
        </div>

        {/* Status badge */}
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '8px',
          padding: '8px 16px',
          backgroundColor: colours.bg,
          borderRadius: '2px',
        }}>
          <span style={{
            width: '8px',
            height: '8px',
            borderRadius: '50%',
            backgroundColor: colours.dot,
            flexShrink: 0,
          }} />
          <span style={{
            fontSize: '13px',
            fontWeight: 700,
            color: colours.text,
            letterSpacing: '0.5px',
            textTransform: 'uppercase',
          }}>
            {shipment.status}
          </span>
        </div>
      </div>

      {/* Fields grid */}
      <div
        className="summary-grid"
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
        }}
      >
        <SummaryField label="Current Location" value={shipment.currentLocation} />
        <SummaryField label="Estimated Delivery" value={shipment.estimatedDelivery} />
        <SummaryField label="Service" value={shipment.shipmentType} />
        <SummaryField label="Package Type" value={shipment.packageType} />
      </div>

      <style jsx>{`
        /* Remove the right border from the last column on each row */
        .summary-field:nth-child(4n) {
          border-right: none !important;
        }
        /* Remove bottom border from last row */
        .summary-field:nth-last-child(-n+4) {
          border-bottom: none !important;
        }
        @media (max-width: 900px) {
          .summary-grid {
            grid-template-columns: repeat(2, 1fr) !important;
          }
          .summary-field:nth-child(4n) {
            border-right: 1px solid #e2e6ea !important;
          }
          .summary-field:nth-child(2n) {
            border-right: none !important;
          }
          .summary-field:nth-last-child(-n+4) {
            border-bottom: 1px solid #e2e6ea !important;
          }
          .summary-field:nth-last-child(-n+2) {
            border-bottom: none !important;
          }
        }
        @media (max-width: 480px) {
          .summary-grid {
            grid-template-columns: 1fr !important;
          }
          .summary-field {
            border-right: none !important;
          }
          .summary-field:last-child {
            border-bottom: none !important;
          }
          .summary-field:nth-last-child(-n+2) {
            border-bottom: 1px solid #e2e6ea !important;
          }
        }
      `}</style>
    </div>
  );
}
