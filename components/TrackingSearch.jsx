import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { validateTrackingInput } from '../lib/tracking';

/**
 * TrackingSearch — the search bar at the top of /track.
 *
 * initialValue comes from router.query.tracking (passed from the page).
 * Because router.query is empty until isReady, we sync the input value
 * via useEffect so the field fills in correctly after hydration.
 */
export default function TrackingSearch({ initialValue = '' }) {
  const [value, setValue] = useState(initialValue);
  const [error, setError] = useState('');
  const router = useRouter();

  /* Sync input when router becomes ready and fills in the query param */
  useEffect(() => {
    if (initialValue) {
      setValue(initialValue);
    }
  }, [initialValue]);

  function handleSubmit(e) {
    e.preventDefault();
    const result = validateTrackingInput(value);
    if (!result.valid) {
      setError(result.error);
      return;
    }
    setError('');
    router.push(`/track?tracking=${encodeURIComponent(result.trackingNumber)}`);
  }

  function handleChange(e) {
    setValue(e.target.value);
    if (error) setError('');
  }

  return (
    <div style={{ backgroundColor: '#0a1f3c', padding: '48px 0 52px' }}>
      <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '0 24px' }}>

        <p style={{
          fontSize: '11px',
          fontWeight: 700,
          letterSpacing: '2.5px',
          textTransform: 'uppercase',
          color: '#c0392b',
          marginBottom: '10px',
        }}>
          Shipment Tracking
        </p>

        <h1 style={{
          fontSize: 'clamp(24px, 3vw, 36px)',
          fontWeight: 800,
          color: '#ffffff',
          marginBottom: '8px',
          letterSpacing: '-0.4px',
          lineHeight: 1.1,
        }}>
          Track Your Shipment
        </h1>

        <p style={{
          fontSize: '15px',
          color: '#94a3b8',
          marginBottom: '28px',
          lineHeight: 1.5,
        }}>
          Get the latest update on your shipment.
        </p>

        <form onSubmit={handleSubmit} noValidate>
          <div className="search-row" style={{ display: 'flex', maxWidth: '600px' }}>

            {/* Input */}
            <div style={{ flex: 1, position: 'relative', minWidth: 0 }}>
              <i
                className="fa-solid fa-magnifying-glass"
                style={{
                  position: 'absolute',
                  left: '16px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: '#9ca3af',
                  fontSize: '14px',
                  pointerEvents: 'none',
                  zIndex: 1,
                }}
              />
              <input
                type="text"
                value={value}
                onChange={handleChange}
                placeholder="Enter tracking number"
                aria-label="Shipment tracking number"
                autoComplete="off"
                spellCheck={false}
                className="search-input"
                style={{
                  width: '100%',
                  padding: '14px 16px 14px 44px',
                  fontSize: '15px',
                  color: '#1a1a2e',
                  backgroundColor: '#ffffff',
                  border: `2px solid ${error ? '#c0392b' : 'transparent'}`,
                  borderRight: 'none',
                  outline: 'none',
                  borderRadius: '6px 0 0 6px',
                  fontFamily: 'inherit',
                }}
              />
            </div>

            {/* Submit */}
            <button
              type="submit"
              className="search-btn"
              style={{
                padding: '14px 28px',
                backgroundColor: '#c0392b',
                color: '#ffffff',
                fontWeight: 700,
                fontSize: '14px',
                letterSpacing: '0.8px',
                border: '2px solid #c0392b',
                borderLeft: 'none',
                borderRadius: '0 6px 6px 0',
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                fontFamily: 'inherit',
                flexShrink: 0,
                transition: 'background-color 0.15s',
              }}
            >
              TRACK
            </button>
          </div>

          {error && (
            <p style={{
              display: 'flex',
              alignItems: 'center',
              gap: '7px',
              marginTop: '10px',
              fontSize: '13px',
              color: '#fca5a5',
              fontWeight: 500,
            }}>
              <i className="fa-solid fa-circle-exclamation" style={{ flexShrink: 0 }} />
              {error}
            </p>
          )}

          {!error && (
            <p style={{ marginTop: '10px', fontSize: '12px', color: '#64748b' }}>
              Example:{' '}
              <span style={{ fontFamily: 'monospace', color: '#94a3b8' }}>
                JDC-2026-00127
              </span>
            </p>
          )}
        </form>
      </div>

      <style jsx>{`
        .search-btn:hover {
          background-color: #a93226 !important;
          border-color: #a93226 !important;
        }
        .search-input:focus {
          border-color: #c0392b !important;
          box-shadow: 0 0 0 3px rgba(192, 57, 43, 0.15) !important;
        }
        @media (max-width: 520px) {
          .search-row {
            flex-direction: column !important;
          }
          .search-input {
            border-right: 2px solid transparent !important;
            border-bottom: none !important;
            border-radius: 6px 6px 0 0 !important;
          }
          .search-btn {
            border-left: 2px solid #c0392b !important;
            border-radius: 0 0 6px 6px !important;
            width: 100%;
            text-align: center;
          }
        }
      `}</style>
    </div>
  );
}
