// =============================================================================
// src/core/automation/antiHoardingGuard.ts — NusaFuel Grid
// Cross-SPBU Anti-Hoarding Guard (PRD §4.3)
// =============================================================================

import { toDateString } from './oddEvenEngine';

/** Minimal ticket shape required by the anti-hoarding guard. */
export interface TicketRecord {
  id: string;
  plateNumber: string;
  fuelType: string;           // 'Pertalite' | 'Pertamax' | 'Solar'
  spbuId: string;
  spbuName: string;
  status: 'BOOKED' | 'COMPLETED' | 'BLOCKED_HOARDING';
  createdAt: string;          // ISO 8601 string, e.g. "2024-10-21T08:30:00.000Z"
  quotaLiters: number;
}

/** Subsidy fuel types — only these are subject to hoarding restrictions. */
const SUBSIDY_FUEL_TYPES = new Set(['Pertalite', 'Solar']);

/**
 * Result of the anti-hoarding check.
 */
export interface HoardingCheckResult {
  isHoarding: boolean;
  previousTicketId?: string;
  previousSpbuName?: string;
  previousSpbuId?: string;
  previousTime?: string;
  previousQuotaLiters?: number;
  blockMessage?: string;
}

/**
 * Parses an ISO 8601 string to a Date safely.
 */
function parseISO(isoStr: string): Date {
  const d = new Date(isoStr);
  return isNaN(d.getTime()) ? new Date(0) : d;
}

/**
 * Checks if two dates fall on the same calendar day (local time).
 */
function isSameDay(a: Date, b: Date): boolean {
  return toDateString(a) === toDateString(b);
}

/**
 * Checks if ticketDate is within the last N hours from now.
 */
function isWithinHours(ticketDate: Date, now: Date, hours: number): boolean {
  const diffMs = now.getTime() - ticketDate.getTime();
  return diffMs >= 0 && diffMs <= hours * 60 * 60 * 1000;
}

/**
 * Cross-SPBU Anti-Hoarding Guard.
 *
 * Rules (PRD §4.3):
 *  1. Search existingTickets for the same plateNumber + same subsidy fuelType.
 *  2. Target statuses: 'COMPLETED' or 'BOOKED'.
 *  3. Time window: same calendar day OR within 12 hours — whichever is broader.
 *  4. Match across ANY spbu (cross-station check).
 *  5. If found → isHoarding: true, include details for audit log & UI alert.
 *
 * @param plateNumber     Normalized plate string (e.g. "DK 9991 XX").
 * @param fuelType        Requested fuel type string.
 * @param existingTickets Full array of all tickets in the reactive store.
 * @param referenceTime   The "now" reference — defaults to new Date().
 */
export function checkAntiHoarding(
  plateNumber: string,
  fuelType: string,
  existingTickets: TicketRecord[],
  referenceTime: Date = new Date()
): HoardingCheckResult {
  // Non-subsidy fuels (Pertamax) are NOT subject to hoarding restrictions
  if (!SUBSIDY_FUEL_TYPES.has(fuelType)) {
    return { isHoarding: false };
  }

  const normalizedPlate = plateNumber.trim().toUpperCase();

  for (const ticket of existingTickets) {
    // Skip non-matching plates
    if (ticket.plateNumber.trim().toUpperCase() !== normalizedPlate) continue;

    // Skip non-matching fuel types
    if (ticket.fuelType !== fuelType) continue;

    // Skip already-blocked tickets
    if (ticket.status === 'BLOCKED_HOARDING') continue;

    // Only flag COMPLETED or BOOKED tickets
    if (ticket.status !== 'COMPLETED' && ticket.status !== 'BOOKED') continue;

    const ticketDate = parseISO(ticket.createdAt);

    // Check same-day OR within 12 hours
    const sameDay = isSameDay(ticketDate, referenceTime);
    const within12h = isWithinHours(ticketDate, referenceTime, 12);

    if (sameDay || within12h) {
      const timeLabel = ticketDate.toLocaleTimeString('id-ID', {
        hour: '2-digit',
        minute: '2-digit',
        timeZone: 'Asia/Makassar',
      });

      return {
        isHoarding: true,
        previousTicketId: ticket.id,
        previousSpbuName: ticket.spbuName,
        previousSpbuId: ticket.spbuId,
        previousTime: timeLabel,
        previousQuotaLiters: ticket.quotaLiters,
        blockMessage:
          `🚫 ANTI-HOARDING AKTIF: Plat ${normalizedPlate} sudah pernah mengisi ` +
          `${fuelType} (${ticket.quotaLiters}L) di ${ticket.spbuName} ` +
          `pukul ${timeLabel} hari ini. ` +
          `Pemblokiran otomatis — dicatat dalam Security Audit Log.`,
      };
    }
  }

  return { isHoarding: false };
}
