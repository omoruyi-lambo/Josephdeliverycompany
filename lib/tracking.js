/**
 * JOSEPHDELIVERYCOMPANY - Tracking Utility
 *
 * This module contains tracking-number validation and normalization only.
 */

/**
 * Accepted tracking number formats:
 *   - JDC-YYYY-NNNNN
 *   - JDC-NNNNNN      (e.g. JDC-123456)
 */
const TRACKING_PATTERNS = [
  /^JDC-\d{4}-\d{5}$/i,
  /^JDC-\d{6}$/i,
];

/**
 * Returns true when the tracking number matches a recognised format.
 * @param {string} trackingNumber
 * @returns {boolean}
 */
export function isValidTrackingNumber(trackingNumber) {
  if (!trackingNumber || typeof trackingNumber !== 'string') return false;
  const trimmed = trackingNumber.trim().toUpperCase();
  return TRACKING_PATTERNS.some((pattern) => pattern.test(trimmed));
}

/**
 * Normalises a tracking number to its canonical uppercase form.
 * @param {string} trackingNumber
 * @returns {string}
 */
export function normaliseTrackingNumber(trackingNumber) {
  return (trackingNumber || '').trim().toUpperCase();
}

/**
 * Validates the user's tracking input and returns a result object.
 *
 * @param {string} input  Raw value from the input field
 * @returns {{ valid: boolean, error: string|null, trackingNumber: string|null }}
 */
export function validateTrackingInput(input) {
  const raw = (input || '').trim();

  if (!raw) {
    return { valid: false, error: 'Please enter a tracking number.', trackingNumber: null };
  }

  const normalised = normaliseTrackingNumber(raw);

  if (!isValidTrackingNumber(normalised)) {
    return {
      valid: false,
      error: 'Please enter a valid tracking number in the format JDC-YYYY-NNNNN.',
      trackingNumber: null,
    };
  }

  return { valid: true, error: null, trackingNumber: normalised };
}
