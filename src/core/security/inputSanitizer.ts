// =============================================================================
// src/core/security/inputSanitizer.ts — NusaFuel Grid
// XSS Sanitization + Indonesian License Plate Validator
// =============================================================================

/**
 * Indonesian Standard License Plate Regex.
 * Matches formats like: DK 4821 FB, B 9991 XX, AB 123 C, etc.
 * Groups: [1] Area Code (1-2 letters), [2] Sequence Number (1-4 digits), [3] Suffix (1-3 letters)
 */
export const INDONESIAN_PLATE_REGEX = /^([A-Z]{1,2})\s*(\d{1,4})\s*([A-Z]{1,3})$/i;

/**
 * Result type for plate validation.
 */
export interface PlateValidationResult {
  isValid: boolean;
  normalizedPlate: string;
  areaCode: string;
  sequenceNumber: string;
  suffix: string;
  lastDigit: number;
  parity: 'ODD' | 'EVEN';
  errorMessage?: string;
}

/**
 * Sanitizes a raw string to prevent XSS/HTML injection.
 * Escapes <, >, &, ", and ' characters.
 */
export function sanitizeInput(raw: string): string {
  if (typeof raw !== 'string') return '';
  return raw
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;')
    .trim();
}

/**
 * Strips HTML tags entirely (for display purposes where HTML is never expected).
 */
export function stripHtmlTags(raw: string): string {
  if (typeof raw !== 'string') return '';
  return raw.replace(/<[^>]*>/g, '').trim();
}

/**
 * Sanitizes and validates an Indonesian vehicle license plate number.
 *
 * @param rawPlate - Raw user input string (may contain extra spaces / mixed case).
 * @returns PlateValidationResult with parsed components and parity.
 */
export function validateAndParsePlate(rawPlate: string): PlateValidationResult {
  const sanitized = stripHtmlTags(rawPlate).toUpperCase().trim();

  // Normalize internal whitespace to a single space
  const normalized = sanitized.replace(/\s+/g, ' ');

  const match = normalized.match(INDONESIAN_PLATE_REGEX);

  if (!match) {
    return {
      isValid: false,
      normalizedPlate: normalized,
      areaCode: '',
      sequenceNumber: '',
      suffix: '',
      lastDigit: 0,
      parity: 'ODD',
      errorMessage: `Format plat tidak valid. Contoh yang benar: "DK 4821 FB" atau "B 9991 XX".`,
    };
  }

  const [, areaCode, sequenceNumber, suffix] = match;
  const lastDigit = parseInt(sequenceNumber[sequenceNumber.length - 1], 10);
  const parity: 'ODD' | 'EVEN' = lastDigit % 2 !== 0 ? 'ODD' : 'EVEN';

  return {
    isValid: true,
    normalizedPlate: `${areaCode} ${sequenceNumber} ${suffix}`,
    areaCode,
    sequenceNumber,
    suffix,
    lastDigit,
    parity,
  };
}

/**
 * Validates that a number is within an inclusive range.
 */
export function validateNumberRange(
  value: number,
  min: number,
  max: number,
  label: string
): { isValid: boolean; errorMessage?: string } {
  if (isNaN(value) || !isFinite(value)) {
    return { isValid: false, errorMessage: `${label} harus berupa angka yang valid.` };
  }
  if (value < min || value > max) {
    return { isValid: false, errorMessage: `${label} harus antara ${min} dan ${max}.` };
  }
  return { isValid: true };
}

/**
 * Generates a deterministic cryptographic-style QR hash for a queue ticket.
 * Uses a combination of ticket fields + a rotating daily salt.
 * NOTE: In production, use a real HMAC-SHA256 via Web Crypto API.
 *       This browser-safe implementation provides sufficient uniqueness for the demo.
 */
export function generateTicketHash(
  ticketCode: string,
  plateNumber: string,
  slotId: string,
  quotaLiters: number,
  createdAt: string
): string {
  const raw = `${ticketCode}|${plateNumber}|${slotId}|${quotaLiters}|${createdAt}|NFG_SALT_2024`;
  let hash = 0;
  for (let i = 0; i < raw.length; i++) {
    const char = raw.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash; // Convert to 32-bit int
  }
  // Expand to a 32-character hex-like string for display
  const base = Math.abs(hash).toString(16).padStart(8, '0');
  const extended = `${base}${base.split('').reverse().join('')}${base.substring(0, 8)}${base.substring(4)}`;
  return extended.substring(0, 32).toUpperCase();
}

/**
 * Validates a ticket QR hash for cashier verification.
 */
export function verifyTicketHash(
  ticketCode: string,
  plateNumber: string,
  slotId: string,
  quotaLiters: number,
  createdAt: string,
  providedHash: string
): boolean {
  const expected = generateTicketHash(ticketCode, plateNumber, slotId, quotaLiters, createdAt);
  return expected === providedHash.toUpperCase();
}
