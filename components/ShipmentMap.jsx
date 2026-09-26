/**
 * ShipmentMap — SVG-based shipment route map.
 *
 * ARCHITECTURE
 * ────────────────────────────────────────────────────────────────────────────
 * • Pure SVG, zero external dependencies, no API key required.
 * • Real WGS-84 coordinates are projected onto the SVG viewport using a
 *   simple equirectangular projection.
 * • The bounding box is computed DYNAMICALLY from the shipment's own
 *   origin + destination coordinates, so the map works for any international
 *   route (USA → Brazil, Lagos → London, etc.) — not just Nigerian routes.
 * • A simplified Nigeria polygon is still drawn when the route is domestic
 *   to Nigeria. For international routes the map shows a clean route on a
 *   neutral background with city labels.
 * • To replace with a live map (e.g. Leaflet, Mapbox): swap this component.
 *   The parent passes the same `mapData` prop shape regardless.
 *
 * PROPS
 * ────────────────────────────────────────────────────────────────────────────
 * mapData: {
 *   originCity:        string   — label for origin pin
 *   destinationCity:   string   — label for destination pin
 *   currentCity:       string   — label for current position
 *   originCoords:      { lat, lng }
 *   destinationCoords: { lat, lng }
 *   currentPosition:   number 0–1  (0=origin, 1=destination)
 * }
 * statusCode: string  — used to colour the position marker
 * ────────────────────────────────────────────────────────────────────────────
 */

/* SVG viewport size */
const VW = 800;
const VH = 520;

/* Minimum padding inside the viewport so pins are never clipped */
const PAD = 56;

/**
 * Build a dynamic bounding box from the two endpoint coordinates.
 * Adds generous margin so both pins are comfortably inside the viewport.
 */
function buildBBox(originCoords, destinationCoords) {
  const lats = [originCoords.lat, destinationCoords.lat];
  const lngs = [originCoords.lng, destinationCoords.lng];

  const latSpan = Math.abs(lats[0] - lats[1]);
  const lngSpan = Math.abs(lngs[0] - lngs[1]);

  /* At minimum keep 8° of span so short-haul routes don't zoom in too hard */
  const latMargin = Math.max(latSpan * 0.35, 4);
  const lngMargin = Math.max(lngSpan * 0.35, 4);

  return {
    minLat: Math.min(...lats) - latMargin,
    maxLat: Math.max(...lats) + latMargin,
    minLng: Math.min(...lngs) - lngMargin,
    maxLng: Math.max(...lngs) + lngMargin,
  };
}

/**
 * Convert geographic coords to SVG pixel coords using the given bounding box.
 * Uses equirectangular projection.
 */
function toSVG(lat, lng, bbox) {
  const x = PAD + ((lng - bbox.minLng) / (bbox.maxLng - bbox.minLng)) * (VW - PAD * 2);
  /* lat is inverted: higher lat = higher on screen = lower SVG y */
  const y = PAD + ((bbox.maxLat - lat) / (bbox.maxLat - bbox.minLat)) * (VH - PAD * 2);
  return { x, y };
}

/**
 * Linearly interpolate between origin and destination coords by t (0–1).
 */
function interpolate(origin, dest, t) {
  return {
    lat: origin.lat + (dest.lat - origin.lat) * t,
    lng: origin.lng + (dest.lng - origin.lng) * t,
  };
}

/* ── Simplified Nigeria outline polygon ─────────────────────────────────────
 * Drawn only when both origin and destination are inside Nigeria's bbox.
 * Points are [lng, lat] pairs.
 * ─────────────────────────────────────────────────────────────────────────── */
const NIGERIA_BBOX = { minLat: 4.2, maxLat: 13.9, minLng: 2.7, maxLng: 14.7 };

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

function isWithinBBox(coords, bbox) {
  return (
    coords.lat >= bbox.minLat && coords.lat <= bbox.maxLat &&
    coords.lng >= bbox.minLng && coords.lng <= bbox.maxLng
  );
}

/* Status colours for the position marker */
const MARKER_COLOUR = {
  IN_TRANSIT:        '#c0392b',
  OUT_FOR_DELIVERY:  '#ca8a04',
  DELIVERED:         '#16a34a',
  ON_HOLD:           '#c0392b',
  COLLECTED:         '#0369a1',
  BOOKED:            '#64748b',
  FAILED_DELIVERY:   '#dc2626',
  RETURNED:          '#9f1239',
  DEFAULT:           '#0a1f3c',
};

function isValidCoordinatePair(coords) {
  return Boolean(
    coords &&
    Number.isFinite(Number(coords.lat)) &&
    Number.isFinite(Number(coords.lng)) &&
    Number(coords.lat) >= -90 && Number(coords.lat) <= 90 &&
    Number(coords.lng) >= -180 && Number(coords.lng) <= 180
  );
}

export default function ShipmentMap({ mapData, statusCode }) {
  if (!mapData) return null;

  const {
    originCity, destinationCity, currentCity,
    originCoords, destinationCoords, currentCoords: explicitCurrentCoords, currentPosition,
  } = mapData;

  if (!isValidCoordinatePair(originCoords) || !isValidCoordinatePair(destinationCoords)) {
    return (
      <div style={{ backgroundColor: '#ffffff', border: '1px solid #e2e6ea', borderRadius: '3px', marginBottom: '24px', padding: '48px 24px', textAlign: 'center', color: '#4a5568' }}>
        <i className="fa-solid fa-location-dot" style={{ color: '#c0392b', fontSize: '24px', marginBottom: '14px' }} />
        <p style={{ margin: 0, fontSize: '14px', lineHeight: 1.6 }}>Location coordinates are currently unavailable.</p>
      </div>
    );
  }

  const hasExplicitCurrent = (
    explicitCurrentCoords &&
    explicitCurrentCoords.lat != null && Number.isFinite(explicitCurrentCoords.lat) &&
    explicitCurrentCoords.lng != null && isValidCoordinatePair(explicitCurrentCoords)
  );

  const effectiveCurrentCoords = hasExplicitCurrent
    ? explicitCurrentCoords
    : interpolate(originCoords, destinationCoords, Number.isFinite(Number(currentPosition))
      ? Math.max(0, Math.min(1, Number(currentPosition)))
      : 0);

  /* ── Build dynamic bounding box from this shipment's actual coordinates ── */
  const bbox = buildBBox(originCoords, destinationCoords);

  /* ── Project all key points into SVG space ────────────────────────────── */
  const originPt  = toSVG(originCoords.lat,     originCoords.lng,     bbox);
  const destPt    = toSVG(destinationCoords.lat, destinationCoords.lng, bbox);
  const currentPt = toSVG(effectiveCurrentCoords.lat, effectiveCurrentCoords.lng, bbox);

  const markerColour = MARKER_COLOUR[statusCode] || MARKER_COLOUR.DEFAULT;

  /* ── Route path (quadratic bezier for gentle curve) ─────────────────── */
  const midX = (originPt.x + destPt.x) / 2;
  const midY = (originPt.y + destPt.y) / 2;
  const dx   = destPt.x - originPt.x;
  const dy   = destPt.y - originPt.y;
  const cpX  = midX - dy * 0.18;
  const cpY  = midY + dx * 0.18;

  const routePath = `M ${originPt.x} ${originPt.y} Q ${cpX} ${cpY} ${destPt.x} ${destPt.y}`;

  /* Approximate arc length for dash-array progress indicator */
  const totalLen     = Math.hypot(destPt.x - originPt.x, destPt.y - originPt.y) * 1.1;
  const progress = Number.isFinite(Number(currentPosition))
    ? Math.max(0, Math.min(1, Number(currentPosition)))
    : 0;
  const completedLen = totalLen * progress;
  const remainingLen = totalLen * (1 - progress);

  /* ── Decide whether to draw the Nigeria polygon ──────────────────────── */
  const drawNigeria = (
    isWithinBBox(originCoords, NIGERIA_BBOX) &&
    isWithinBBox(destinationCoords, NIGERIA_BBOX)
  );

  const nigeriaPoints = drawNigeria
    ? NIGERIA_POLYGON.map(([lng, lat]) => {
        const { x, y } = toSVG(lat, lng, bbox);
        return `${x.toFixed(1)},${y.toFixed(1)}`;
      }).join(' ')
    : null;

  /* ── Grid line intervals — auto-select based on bbox span ───────────── */
  const latSpan = bbox.maxLat - bbox.minLat;
  const lngSpan = bbox.maxLng - bbox.minLng;
  const latStep = latSpan > 40 ? 10 : latSpan > 20 ? 5 : latSpan > 8 ? 2 : 1;
  const lngStep = lngSpan > 40 ? 10 : lngSpan > 20 ? 5 : lngSpan > 8 ? 2 : 1;

  const latLines = [];
  for (let lat = Math.ceil(bbox.minLat / latStep) * latStep; lat <= bbox.maxLat; lat += latStep) {
    latLines.push(lat);
  }
  const lngLines = [];
  for (let lng = Math.ceil(bbox.minLng / lngStep) * lngStep; lng <= bbox.maxLng; lng += lngStep) {
    lngLines.push(lng);
  }

  return (
    <div style={{
      backgroundColor: '#ffffff',
      border: '1px solid #e2e6ea',
      borderRadius: '3px',
      overflow: 'hidden',
      marginBottom: '24px',
    }}>

      {/* ── Map header bar ────────────────────────────────────────── */}
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
          <span style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: '#94a3b8' }}>
            <span style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#22c55e', display: 'inline-block' }} />
            Origin
          </span>
          <span style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: '#94a3b8' }}>
            <span style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#c0392b', display: 'inline-block' }} />
            Destination
          </span>
          <span style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: '#94a3b8' }}>
            <i className="fa-solid fa-circle-dot" style={{ fontSize: '12px', color: markerColour }} />
            Current
          </span>
        </div>
      </div>

      {/* ── Route summary strip ───────────────────────────────────── */}
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
          <span style={{ height: '1px', width: '32px', backgroundColor: '#d1d5db', display: 'inline-block' }} />
          <i className="fa-solid fa-plane" style={{ fontSize: '11px', color: markerColour }} />
          <span style={{ height: '1px', width: '32px', backgroundColor: '#d1d5db', display: 'inline-block' }} />
        </span>
        <span style={{ fontWeight: 700, color: '#0a1f3c' }}>{destinationCity}</span>
        <span style={{ marginLeft: 'auto', color: '#64748b' }}>
          Current: <strong style={{ color: '#0a1f3c' }}>{currentCity}</strong>
        </span>
      </div>

      {/* ── SVG Map ───────────────────────────────────────────────── */}
      <div style={{ position: 'relative', overflow: 'hidden' }}>
        <svg
          viewBox={`0 0 ${VW} ${VH}`}
          style={{ width: '100%', height: 'auto', display: 'block', maxHeight: '480px' }}
          aria-label={`Shipment route from ${originCity} to ${destinationCity}`}
          role="img"
        >
          {/* Background */}
          <rect width={VW} height={VH} fill="#eef2f7" />

          {/* Grid lines */}
          {latLines.map(lat => {
            const { y } = toSVG(lat, bbox.minLng, bbox);
            return (
              <line key={`lat-${lat}`}
                x1={PAD} y1={y} x2={VW - PAD} y2={y}
                stroke="#dde3eb" strokeWidth="0.5" />
            );
          })}
          {lngLines.map(lng => {
            const { x } = toSVG(bbox.minLat, lng, bbox);
            return (
              <line key={`lng-${lng}`}
                x1={x} y1={PAD} x2={x} y2={VH - PAD}
                stroke="#dde3eb" strokeWidth="0.5" />
            );
          })}

          {/* Nigeria polygon — only for domestic Nigerian routes */}
          {drawNigeria && nigeriaPoints && (
            <polygon
              points={nigeriaPoints}
              fill="#dce8f5"
              stroke="#b0c4d8"
              strokeWidth="1.5"
              strokeLinejoin="round"
            />
          )}

          {/* Dashed remaining route */}
          <path
            d={routePath}
            fill="none"
            stroke="#b0c4d8"
            strokeWidth="2.5"
            strokeDasharray="6 5"
            strokeLinecap="round"
          />

          {/* Solid completed route */}
          <path
            d={routePath}
            fill="none"
            stroke="#0a1f3c"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeDasharray={`${completedLen} ${remainingLen + 9999}`}
          />

          {/* ── Origin marker ─────────────────────────────────────── */}
          <g>
            <circle cx={originPt.x} cy={originPt.y} r={13} fill="#22c55e" opacity="0.15" />
            <circle cx={originPt.x} cy={originPt.y} r={7}  fill="#22c55e" />
            <circle cx={originPt.x} cy={originPt.y} r={3}  fill="#ffffff" />
            <rect
              x={originPt.x + 13} y={originPt.y - 14}
              width={originCity.length * 6.5 + 14} height={24}
              rx="3" ry="3"
              fill="#0a1f3c" opacity="0.92"
            />
            <text
              x={originPt.x + 20} y={originPt.y + 2}
              fontSize="10.5" fontWeight="700"
              fill="#ffffff"
              fontFamily="Inter, Arial, sans-serif"
              style={{ pointerEvents: 'none', userSelect: 'none' }}
            >
              {originCity}
            </text>
            <text
              x={originPt.x + 20} y={originPt.y + 14}
              fontSize="8"
              fill="#94a3b8"
              fontFamily="Inter, Arial, sans-serif"
              style={{ pointerEvents: 'none', userSelect: 'none' }}
            >
              ORIGIN
            </text>
          </g>

          {/* ── Destination marker ────────────────────────────────── */}
          <g>
            <circle cx={destPt.x} cy={destPt.y} r={13} fill="#c0392b" opacity="0.15" />
            <circle cx={destPt.x} cy={destPt.y} r={7}  fill="#c0392b" />
            <circle cx={destPt.x} cy={destPt.y} r={3}  fill="#ffffff" />
            {(() => {
              const labelWidth = destinationCity.length * 6.5 + 14;
              /* Place label to the left if close to the right edge */
              const labelX = destPt.x > VW - labelWidth - 60
                ? destPt.x - labelWidth - 14
                : destPt.x + 13;
              return (
                <>
                  <rect
                    x={labelX} y={destPt.y - 14}
                    width={labelWidth} height={24}
                    rx="3" ry="3"
                    fill="#c0392b" opacity="0.92"
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
                    fontSize="8"
                    fill="rgba(255,255,255,0.75)"
                    fontFamily="Inter, Arial, sans-serif"
                    style={{ pointerEvents: 'none', userSelect: 'none' }}
                  >
                    DESTINATION
                  </text>
                </>
              );
            })()}
          </g>

          {/* ── Current position marker ───────────────────────────── */}
          <g>
            <circle cx={currentPt.x} cy={currentPt.y} r={20} fill={markerColour} opacity="0.10" />
            <circle cx={currentPt.x} cy={currentPt.y} r={13} fill={markerColour} opacity="0.18" />
            <circle cx={currentPt.x} cy={currentPt.y} r={13}
              fill="#ffffff" stroke={markerColour} strokeWidth="2.5" />
            {/* Location pin icon (Font Awesome \uf3c5 = fa-location-dot) */}
            <text
              x={currentPt.x} y={currentPt.y + 5}
              textAnchor="middle"
              fontSize="13"
              fill={markerColour}
              fontFamily="'Font Awesome 6 Free'"
              fontWeight="900"
              style={{ pointerEvents: 'none', userSelect: 'none' }}
            >
              {'\uf3c5'}
            </text>
          </g>

          {/* Progress % badge */}
          <g>
            <rect
              x={currentPt.x - 24} y={currentPt.y + 18}
              width={48} height={16}
              rx="3" ry="3"
              fill={markerColour}
            />
            <text
              x={currentPt.x} y={currentPt.y + 30}
              textAnchor="middle"
              fontSize="9" fontWeight="700"
              fill="#ffffff"
              fontFamily="Inter, Arial, sans-serif"
              style={{ pointerEvents: 'none', userSelect: 'none' }}
            >
              {Math.round(currentPosition * 100)}% done
            </text>
          </g>
        </svg>
      </div>

      {/* ── Map footer ────────────────────────────────────────────── */}
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
        <i className="fa-solid fa-location-dot" style={{ color: markerColour, fontSize: '12px' }} />
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
