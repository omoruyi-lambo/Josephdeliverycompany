/**
 * ShipmentMap — SVG-based shipment route map for Nigeria.
 *
 * ARCHITECTURE
 * ────────────────────────────────────────────────────────────────────────────
 * • Pure SVG, zero external dependencies, no API key required.
 * • Real WGS-84 coordinates are projected onto the SVG viewport using a
 *   simple equirectangular projection bounded to Nigeria's bounding box.
 * • The Nigeria outline is a simplified-but-accurate polygon derived from
 *   publicly available geographic data (simplified for performance).
 * • To replace with a live map (e.g. Leaflet, Mapbox): swap this component
 *   with a map library component. The parent passes the same `mapData` prop.
 *
 * PROPS
 * ────────────────────────────────────────────────────────────────────────────
 * mapData: {
 *   originCity:       string   — label for origin pin
 *   destinationCity:  string   — label for destination pin
 *   currentCity:      string   — label for current position
 *   originCoords:     { lat, lng }
 *   destinationCoords:{ lat, lng }
 *   currentPosition:  number 0–1  (0=origin, 1=destination)
 * }
 * statusCode: string  — used to colour the truck marker
 * ────────────────────────────────────────────────────────────────────────────
 */

/* ── Nigeria bounding box (WGS 84) ──────────────────────────────────────── */
const BBOX = {
  minLat:  4.2,
  maxLat: 13.9,
  minLng:  2.7,
  maxLng: 14.7,
};

/* SVG viewport size */
const VW = 800;
const VH = 520;

/* Padding inside viewport (keeps pins away from edge) */
const PAD = 32;

/**
 * Convert geographic coords to SVG pixel coords.
 * Uses equirectangular projection normalised to the Nigeria bounding box.
 */
function toSVG(lat, lng) {
  const x = PAD + ((lng - BBOX.minLng) / (BBOX.maxLng - BBOX.minLng)) * (VW - PAD * 2);
  /* lat is inverted: higher lat = higher up on screen = lower y */
  const y = PAD + ((BBOX.maxLat - lat) / (BBOX.maxLat - BBOX.minLat)) * (VH - PAD * 2);
  return { x, y };
}

/**
 * Linearly interpolate between origin and destination by t (0–1).
 */
function interpolate(origin, dest, t) {
  return {
    lat: origin.lat + (dest.lat - origin.lat) * t,
    lng: origin.lng + (dest.lng - origin.lng) * t,
  };
}

/* ── Simplified Nigeria outline polygon ─────────────────────────────────────
 * Points are [lng, lat] pairs tracing the approximate country border.
 * Simplified from public domain Natural Earth data at 1:50m resolution.
 * ─────────────────────────────────────────────────────────────────────────── */
const NIGERIA_POLYGON = [
  [2.69,  6.26], [2.75,  6.59], [2.78,  7.25], [3.05,  7.55],
  [3.07,  8.35], [3.10,  9.06], [3.32,  9.45], [3.33, 10.28],
  [3.60, 10.43], [3.79, 10.76], [3.87, 11.12], [3.70, 11.35],
  [3.60, 11.70], [3.68, 11.96], [3.97, 12.22], [4.19, 12.40],
  [4.45, 13.00], [4.53, 13.47], [4.85, 13.78], [5.32, 13.88],
  [5.68, 13.85], [5.99, 13.50], [6.27, 13.64], [6.82, 13.50],
  [7.22, 13.00], [7.55, 13.28], [7.92, 12.98], [8.28, 13.08],
  [8.75, 12.91], [9.01, 12.84], [9.52, 12.85], [9.98, 12.48],
  [10.30,12.18], [10.62,11.97], [11.00,11.67], [11.48,11.20],
  [11.84,11.28], [12.18,11.40], [12.60,10.87], [12.84,10.37],
  [13.24, 9.97], [13.58, 9.64], [14.26, 9.98], [14.54, 9.76],
  [14.66, 9.38], [14.57, 8.72], [14.10, 8.57], [13.90, 8.16],
  [13.45, 7.42], [13.31, 6.91], [13.07, 6.46], [12.67, 6.00],
  [12.32, 5.80], [11.91, 5.43], [11.33, 5.25], [10.72, 5.21],
  [10.26, 5.07], [9.79,  4.83], [9.37,  4.47], [8.88,  4.29],
  [8.34,  4.25], [8.00,  4.46], [7.56,  4.47], [7.07,  4.47],
  [6.62,  4.70], [6.23,  5.17], [5.90,  5.62], [5.52,  5.99],
  [5.23,  6.06], [4.82,  5.87], [4.56,  5.89], [4.27,  6.11],
  [3.89,  6.36], [3.55,  6.46], [3.37,  6.34], [2.69,  6.26],
];

/**
 * Convert the polygon coordinates to an SVG points string.
 */
function polygonPoints() {
  return NIGERIA_POLYGON
    .map(([lng, lat]) => {
      const { x, y } = toSVG(lat, lng);
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(' ');
}

/* ── Major Nigerian cities for the reference grid ───────────────────────── */
const REFERENCE_CITIES = [
  { name: 'Lagos',         lat: 6.5244, lng: 3.3792  },
  { name: 'Abuja',         lat: 9.0765, lng: 7.3986  },
  { name: 'Kano',          lat: 12.000, lng: 8.5167  },
  { name: 'Ibadan',        lat: 7.3775, lng: 3.9470  },
  { name: 'Port Harcourt', lat: 4.8156, lng: 7.0498  },
  { name: 'Benin City',    lat: 6.3350, lng: 5.6037  },
  { name: 'Kaduna',        lat: 10.526, lng: 7.4398  },
  { name: 'Enugu',         lat: 6.4584, lng: 7.5464  },
  { name: 'Maiduguri',     lat: 11.846, lng: 13.160  },
  { name: 'Warri',         lat: 5.5167, lng: 5.7500  },
];

/* Status colours for the truck marker */
const TRUCK_COLOUR = {
  IN_TRANSIT:       '#c0392b',
  OUT_FOR_DELIVERY: '#ca8a04',
  DELIVERED:        '#16a34a',
  DEFAULT:          '#0a1f3c',
};

export default function ShipmentMap({ mapData, statusCode }) {
  if (!mapData) return null;

  const {
    originCity, destinationCity, currentCity,
    originCoords, destinationCoords, currentPosition,
  } = mapData;

  /* Project all key points */
  const originPt  = toSVG(originCoords.lat,      originCoords.lng);
  const destPt    = toSVG(destinationCoords.lat,  destinationCoords.lng);

  const currentCoords = interpolate(originCoords, destinationCoords, currentPosition);
  const currentPt = toSVG(currentCoords.lat, currentCoords.lng);

  const truckColour = TRUCK_COLOUR[statusCode] || TRUCK_COLOUR.DEFAULT;
  const polyPoints  = polygonPoints();

  /* Build a smooth cubic bezier path for the route.
     Control point is perpendicular to the midpoint for a gentle curve. */
  const midX = (originPt.x + destPt.x) / 2;
  const midY = (originPt.y + destPt.y) / 2;
  const dx   = destPt.x - originPt.x;
  const dy   = destPt.y - originPt.y;
  /* Curve the line slightly away from the straight path */
  const cpX  = midX - dy * 0.18;
  const cpY  = midY + dx * 0.18;

  const routePath = `M ${originPt.x} ${originPt.y} Q ${cpX} ${cpY} ${destPt.x} ${destPt.y}`;

  /* Progress dashes: we draw the "completed" part of the route in solid navy,
     and the remaining portion in a lighter dashed line. */
  const totalLen = Math.hypot(destPt.x - originPt.x, destPt.y - originPt.y) * 1.05;
  const completedLen  = totalLen * currentPosition;
  const remainingLen  = totalLen * (1 - currentPosition);

  return (
    <div style={{
      backgroundColor: '#ffffff',
      border: '1px solid #e2e6ea',
      borderRadius: '3px',
      overflow: 'hidden',
      marginBottom: '24px',
    }}>
      {/* ── Map header bar ─────────────────────────────────────────── */}
      <div style={{
        backgroundColor: '#0a1f3c',
        padding: '14px 20px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '10px',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <i className="fa-solid fa-map-location-dot"
            style={{ fontSize: '16px', color: '#c0392b' }} />
          <span style={{ fontSize: '14px', fontWeight: 700, color: '#ffffff', letterSpacing: '0.3px' }}>
            Shipment Route
          </span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          {/* Legend */}
          <span style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: '#94a3b8' }}>
            <span style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#22c55e', display: 'inline-block' }} />
            Origin
          </span>
          <span style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: '#94a3b8' }}>
            <span style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#c0392b', display: 'inline-block' }} />
            Destination
          </span>
          <span style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: '#94a3b8' }}>
            <i className="fa-solid fa-truck" style={{ fontSize: '12px', color: truckColour }} />
            Current
          </span>
        </div>
      </div>

      {/* ── Route summary strip ────────────────────────────────────── */}
      <div style={{
        backgroundColor: '#f4f5f7',
        borderBottom: '1px solid #e2e6ea',
        padding: '12px 20px',
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        fontSize: '13px',
        flexWrap: 'wrap',
      }}>
        <span style={{ fontWeight: 700, color: '#0a1f3c' }}>{originCity}</span>
        <span style={{ color: '#94a3b8', display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span style={{ flex: 1, height: '1px', width: '40px', backgroundColor: '#d1d5db', display: 'inline-block' }} />
          <i className="fa-solid fa-truck" style={{ fontSize: '12px', color: truckColour }} />
          <span style={{ flex: 1, height: '1px', width: '40px', backgroundColor: '#d1d5db', display: 'inline-block' }} />
        </span>
        <span style={{ fontWeight: 700, color: '#0a1f3c' }}>{destinationCity}</span>
        <span style={{ marginLeft: 'auto', color: '#64748b' }}>
          Current: <strong style={{ color: '#0a1f3c' }}>{currentCity}</strong>
        </span>
      </div>

      {/* ── SVG Map ────────────────────────────────────────────────── */}
      <div style={{ position: 'relative', overflow: 'hidden' }}>
        <svg
          viewBox={`0 0 ${VW} ${VH}`}
          style={{ width: '100%', height: 'auto', display: 'block', maxHeight: '480px' }}
          aria-label={`Shipment route map from ${originCity} to ${destinationCity}`}
          role="img"
        >
          {/* ── Map background ───────────────────────────────────── */}
          <rect width={VW} height={VH} fill="#eef2f7" />

          {/* ── Simple grid lines for geographic context ─────────── */}
          {[5, 7, 9, 11, 13].map(lat => {
            const { y } = toSVG(lat, BBOX.minLng);
            return (
              <line key={`lat-${lat}`}
                x1={PAD} y1={y} x2={VW - PAD} y2={y}
                stroke="#dde3eb" strokeWidth="0.5" />
            );
          })}
          {[4, 6, 8, 10, 12, 14].map(lng => {
            const { x } = toSVG(BBOX.minLat, lng);
            return (
              <line key={`lng-${lng}`}
                x1={x} y1={PAD} x2={x} y2={VH - PAD}
                stroke="#dde3eb" strokeWidth="0.5" />
            );
          })}

          {/* ── Nigeria country polygon ───────────────────────────── */}
          <polygon
            points={polyPoints}
            fill="#dce8f5"
            stroke="#b0c4d8"
            strokeWidth="1.5"
            strokeLinejoin="round"
          />

          {/* ── Reference city dots (unrelated to shipment) ──────── */}
          {REFERENCE_CITIES.map(city => {
            const p = toSVG(city.lat, city.lng);
            const isKey = city.name === originCity || city.name === destinationCity;
            if (isKey) return null; /* drawn separately below */
            return (
              <g key={city.name}>
                <circle cx={p.x} cy={p.y} r={3} fill="#8faec8" />
                <text
                  x={p.x + 5} y={p.y + 4}
                  fontSize="9"
                  fill="#5a7a96"
                  fontFamily="Inter, Arial, sans-serif"
                  style={{ pointerEvents: 'none', userSelect: 'none' }}
                >
                  {city.name}
                </text>
              </g>
            );
          })}

          {/* ── Dashed remaining route ───────────────────────────── */}
          <path
            d={routePath}
            fill="none"
            stroke="#b0c4d8"
            strokeWidth="2.5"
            strokeDasharray="6 5"
            strokeLinecap="round"
          />

          {/* ── Solid completed route ────────────────────────────── */}
          <path
            d={routePath}
            fill="none"
            stroke="#0a1f3c"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeDasharray={`${completedLen} ${remainingLen + 9999}`}
          />

          {/* ── Origin marker ────────────────────────────────────── */}
          <g>
            <circle cx={originPt.x} cy={originPt.y} r={12} fill="#22c55e" opacity="0.15" />
            <circle cx={originPt.x} cy={originPt.y} r={7}  fill="#22c55e" />
            <circle cx={originPt.x} cy={originPt.y} r={3}  fill="#ffffff" />
            {/* Label bubble */}
            <rect
              x={originPt.x + 12} y={originPt.y - 13}
              width={originCity.length * 6.8 + 14} height={22}
              rx="3" ry="3"
              fill="#0a1f3c" opacity="0.9"
            />
            <text
              x={originPt.x + 19} y={originPt.y + 2}
              fontSize="10.5" fontWeight="700"
              fill="#ffffff"
              fontFamily="Inter, Arial, sans-serif"
              style={{ pointerEvents: 'none', userSelect: 'none' }}
            >
              {originCity}
            </text>
            <text
              x={originPt.x + 19} y={originPt.y + 14}
              fontSize="8.5"
              fill="#94a3b8"
              fontFamily="Inter, Arial, sans-serif"
              style={{ pointerEvents: 'none', userSelect: 'none' }}
            >
              ORIGIN
            </text>
          </g>

          {/* ── Destination marker ───────────────────────────────── */}
          <g>
            <circle cx={destPt.x} cy={destPt.y} r={12} fill="#c0392b" opacity="0.15" />
            <circle cx={destPt.x} cy={destPt.y} r={7}  fill="#c0392b" />
            <circle cx={destPt.x} cy={destPt.y} r={3}  fill="#ffffff" />
            {/* Label — placed to the left if close to right edge */}
            {(() => {
              const labelWidth = destinationCity.length * 6.8 + 14;
              const labelX = destPt.x > VW - labelWidth - 40
                ? destPt.x - labelWidth - 14
                : destPt.x + 12;
              return (
                <>
                  <rect
                    x={labelX} y={destPt.y - 13}
                    width={labelWidth} height={22}
                    rx="3" ry="3"
                    fill="#c0392b" opacity="0.9"
                  />
                  <text
                    x={labelX + 7} y={destPt.y + 2}
                    fontSize="10.5" fontWeight="700"
                    fill="#ffffff"
                    fontFamily="Inter, Arial, sans-serif"
                    style={{ pointerEvents: 'none', userSelect: 'none' }}
                  >
                    {destinationCity}
                  </text>
                  <text
                    x={labelX + 7} y={destPt.y + 14}
                    fontSize="8.5"
                    fill="rgba(255,255,255,0.7)"
                    fontFamily="Inter, Arial, sans-serif"
                    style={{ pointerEvents: 'none', userSelect: 'none' }}
                  >
                    DESTINATION
                  </text>
                </>
              );
            })()}
          </g>

          {/* ── Current position truck marker ────────────────────── */}
          <g>
            {/* Pulse ring */}
            <circle cx={currentPt.x} cy={currentPt.y} r={18} fill={truckColour} opacity="0.12" />
            <circle cx={currentPt.x} cy={currentPt.y} r={12} fill={truckColour} opacity="0.20" />
            {/* White backing circle */}
            <circle cx={currentPt.x} cy={currentPt.y} r={13}
              fill="#ffffff" stroke={truckColour} strokeWidth="2.5" />
            {/* Truck icon as text (Font Awesome unicode) */}
            <text
              x={currentPt.x} y={currentPt.y + 5}
              textAnchor="middle"
              fontSize="13"
              fill={truckColour}
              fontFamily="'Font Awesome 6 Free'"
              fontWeight="900"
              style={{ pointerEvents: 'none', userSelect: 'none' }}
            >
              {'\uf0d1'}
            </text>
          </g>

          {/* ── Progress percentage label ─────────────────────────── */}
          <g>
            <rect
              x={currentPt.x - 22} y={currentPt.y + 17}
              width={44} height={16}
              rx="2" ry="2"
              fill={truckColour}
            />
            <text
              x={currentPt.x} y={currentPt.y + 29}
              textAnchor="middle"
              fontSize="9.5" fontWeight="700"
              fill="#ffffff"
              fontFamily="Inter, Arial, sans-serif"
              style={{ pointerEvents: 'none', userSelect: 'none' }}
            >
              {Math.round(currentPosition * 100)}% done
            </text>
          </g>
        </svg>
      </div>

      {/* ── Map footer — location pill ─────────────────────────────── */}
      <div style={{
        backgroundColor: '#f4f5f7',
        borderTop: '1px solid #e2e6ea',
        padding: '10px 20px',
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        fontSize: '12px',
        color: '#4a5568',
      }}>
        <i className="fa-solid fa-location-dot" style={{ color: truckColour, fontSize: '12px' }} />
        <span>
          <strong style={{ color: '#0a1f3c' }}>Current location:</strong>{' '}
          {currentCity}
        </span>
        <span style={{ marginLeft: 'auto', color: '#94a3b8', fontSize: '11px' }}>
          Admin-recorded location
        </span>
      </div>
    </div>
  );
}
