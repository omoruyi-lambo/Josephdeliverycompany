/**
 * ShipmentDetails — clean two-column detail table.
 * Shows service, origin, destination, shipment date, ETA, and package type.
 */

function DetailRow({ label, value }) {
  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: '160px 1fr',
      gap: '8px',
      padding: '14px 0',
      borderBottom: '1px solid #f3f4f6',
      alignItems: 'start',
    }}
      className="detail-row"
    >
      <p style={{
        fontSize: '12px',
        fontWeight: 600,
        color: '#6b7280',
        textTransform: 'uppercase',
        letterSpacing: '0.8px',
        paddingTop: '1px',
      }}>
        {label}
      </p>
      <p style={{
        fontSize: '14px',
        fontWeight: 500,
        color: '#0a1f3c',
        lineHeight: 1.4,
      }}>
        {value}
      </p>
    </div>
  );
}

export default function ShipmentDetails({ shipment }) {
  const rows = [
    { label: 'Service',            value: shipment.service },
    { label: 'Origin',             value: shipment.origin },
    { label: 'Destination',        value: shipment.destination },
    { label: 'Shipment Date',      value: shipment.shipmentDate },
    { label: 'Estimated Delivery', value: shipment.estimatedDelivery },
    { label: 'Package Type',       value: shipment.packageType },
  ];

  return (
    <div style={{
      backgroundColor: '#ffffff',
      border: '1px solid #e2e6ea',
      borderRadius: '3px',
      padding: '28px',
      marginBottom: '24px',
    }}>
      <h2 style={{
        fontSize: '16px',
        fontWeight: 700,
        color: '#0a1f3c',
        marginBottom: '20px',
        letterSpacing: '0.1px',
      }}>
        Shipment Details
      </h2>

      <div>
        {rows.map((row, i) => (
          <div
            key={row.label}
            style={{
              display: 'grid',
              gridTemplateColumns: '160px 1fr',
              gap: '8px',
              padding: '13px 0',
              borderBottom: i < rows.length - 1 ? '1px solid #f3f4f6' : 'none',
              alignItems: 'start',
            }}
            className="detail-row"
          >
            <p style={{
              fontSize: '11px',
              fontWeight: 700,
              color: '#6b7280',
              textTransform: 'uppercase',
              letterSpacing: '1px',
              paddingTop: '1px',
            }}>
              {row.label}
            </p>
            <p style={{
              fontSize: '14px',
              fontWeight: 500,
              color: '#0a1f3c',
              lineHeight: 1.4,
            }}>
              {row.value}
            </p>
          </div>
        ))}
      </div>

      <style jsx>{`
        @media (max-width: 480px) {
          .detail-row {
            grid-template-columns: 1fr !important;
            gap: 3px !important;
          }
        }
      `}</style>
    </div>
  );
}
