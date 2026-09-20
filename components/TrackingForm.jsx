import { useState } from 'react';
import { useRouter } from 'next/router';
import { validateTrackingInput } from '../lib/tracking';

export default function TrackingForm() {
  const [trackingNumber, setTrackingNumber] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();

  function handleSubmit(e) {
    e.preventDefault();
    const result = validateTrackingInput(trackingNumber);
    if (!result.valid) {
      setError(result.error);
      return;
    }
    setError('');
    router.push(`/track?tracking=${encodeURIComponent(result.trackingNumber)}`);
  }

  function handleChange(e) {
    setTrackingNumber(e.target.value);
    if (error) setError('');
  }

  return (
    <section style={{
      backgroundColor: '#f4f5f7',
      borderBottom: '1px solid #e2e6ea',
      padding: '60px 0',
    }}>
      <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '0 24px' }}>
        <div style={{ maxWidth: '760px' }}>

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

          <h2 style={{
            fontSize: 'clamp(22px, 2.8vw, 30px)',
            fontWeight: 700,
            color: '#0a1f3c',
            marginBottom: '10px',
            letterSpacing: '-0.3px',
          }}>
            Track Your Shipment
          </h2>

          <p style={{
            fontSize: '15px',
            color: '#4a5568',
            marginBottom: '28px',
            lineHeight: 1.6,
          }}>
            Enter your tracking number to get the latest update on your shipment.
          </p>

          <form onSubmit={handleSubmit} noValidate>
            {/* Input + Button row */}
            <div className="tracking-row" style={{ display: 'flex', maxWidth: '620px' }}>

              {/* Input wrapper */}
              <div style={{ flex: 1, position: 'relative', minWidth: 0 }}>
                <i
                  className="fa-solid fa-magnifying-glass"
                  style={{
                    position: 'absolute',
                    left: '16px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    color: '#9ca3af',
                    fontSize: '15px',
                    pointerEvents: 'none',
                    zIndex: 1,
                  }}
                />
                <input
                  type="text"
                  value={trackingNumber}
                  onChange={handleChange}
                  placeholder="Enter tracking number"
                  aria-label="Shipment tracking number"
                  autoComplete="off"
                  spellCheck={false}
                  className="tracking-input"
                  style={{
                    width: '100%',
                    padding: '15px 16px 15px 46px',
                    fontSize: '15px',
                    color: '#1a1a2e',
                    backgroundColor: '#ffffff',
                    border: `2px solid ${error ? '#c0392b' : '#d1d5db'}`,
                    borderRight: 'none',
                    outline: 'none',
                    borderRadius: '6px 0 0 6px',
                    fontFamily: 'inherit',
                    lineHeight: 1.5,
                  }}
                />
              </div>

              {/* Submit button */}
              <button
                type="submit"
                className="track-btn"
                style={{
                  padding: '15px 32px',
                  backgroundColor: '#0a1f3c',
                  color: '#ffffff',
                  fontWeight: 700,
                  fontSize: '14px',
                  letterSpacing: '1px',
                  border: '2px solid #0a1f3c',
                  borderLeft: 'none',
                  borderRadius: '0 6px 6px 0',
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                  flexShrink: 0,
                  fontFamily: 'inherit',
                  transition: 'background-color 0.15s',
                }}
              >
                TRACK
              </button>
            </div>

            {/* Validation error */}
            {error && (
              <p style={{
                display: 'flex',
                alignItems: 'center',
                gap: '7px',
                marginTop: '12px',
                fontSize: '13px',
                color: '#c0392b',
                fontWeight: 500,
              }}>
                <i className="fa-solid fa-circle-exclamation" style={{ flexShrink: 0 }} />
                {error}
              </p>
            )}

            {/* Example hint */}
            <p style={{ marginTop: '12px', fontSize: '12px', color: '#94a3b8' }}>
              Example:{' '}
              <span style={{ fontFamily: 'monospace', color: '#64748b' }}>
                JDC-2026-00127
              </span>
            </p>
          </form>
        </div>
      </div>

      <style jsx>{`
        .track-btn:hover {
          background-color: #061529 !important;
          border-color: #061529 !important;
        }
        .tracking-input:focus {
          border-color: #0a1f3c !important;
          box-shadow: 0 0 0 3px rgba(10, 31, 60, 0.08) !important;
        }

        /* Mobile: stack input above button */
        @media (max-width: 520px) {
          .tracking-row {
            flex-direction: column !important;
          }
          .tracking-input {
            border-right: 2px solid #d1d5db !important;
            border-bottom: none !important;
            border-radius: 6px 6px 0 0 !important;
          }
          .track-btn {
            border-left: 2px solid #0a1f3c !important;
            border-radius: 0 0 6px 6px !important;
            width: 100%;
            text-align: center;
          }
        }
      `}</style>
    </section>
  );
}
