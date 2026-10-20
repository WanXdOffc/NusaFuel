// =============================================================================
// src/core/automation/oddEvenEngine.ts — NusaFuel Grid
// Odd-Even Plate Parity Engine with H+1 Pre-booking Support
// =============================================================================

import { validateAndParsePlate } from '../security/inputSanitizer';

export type VehicleType = 'MOTOR' | 'MOBIL' | 'DARURAT';
export type PlateParity = 'ODD' | 'EVEN';

/**
 * Result returned by the Odd-Even eligibility check.
 */
export interface OddEvenResult {
  /** Whether the vehicle may queue today at the requested date. */
  allowedToday: boolean;
  /** The assigned slot date (either targetDate or targetDate + 1 day). */
  assignedDate: Date;
  /** Human-readable label for assignedDate, e.g. "Hari Ini (Selasa, 21 Okt 2024)" */
  assignedDateLabel: string;
  /** The extracted last digit from the plate sequence number. */
  lastDigit: number;
  /** Parity of the plate number. */
  plateParity: PlateParity;
  /** Parity of the target date. */
  dateParity: PlateParity;
  /** Whether the plate is an emergency vehicle (always allowed). */
  isEmergency: boolean;
  /** Redirect reason if not allowed today. */
  redirectReason?: string;
  /** Validation error if plate format is invalid. */
  validationError?: string;
}

/**
 * Indonesian day names for human-readable labels.
 */
const HARI = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
const BULAN = [
  'Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun',
  'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des',
];

/**
 * Formats a Date into a human-readable Indonesian label.
 * e.g. "Senin, 21 Okt 2024"
 */
function formatDateLabel(date: Date): string {
  const hari = HARI[date.getDay()];
  const bulan = BULAN[date.getMonth()];
  return `${hari}, ${date.getDate()} ${bulan} ${date.getFullYear()}`;
}

/**
 * Returns the next calendar date (targetDate + 1 day) at midnight.
 */
function nextDay(date: Date): Date {
  const next = new Date(date);
  next.setDate(next.getDate() + 1);
  next.setHours(0, 0, 0, 0);
  return next;
}

/**
 * Core Odd-Even eligibility engine.
 *
 * Rules (from PRD.md §4.1):
 *  1. Validate plate format. If invalid, return error.
 *  2. If vehicleType === 'DARURAT', always allowedToday = true.
 *  3. Extract last digit of plate sequence → determine plateParity.
 *  4. Determine dateParity from targetDate.getDate().
 *  5. If plateParity === dateParity → allowedToday = true, assignedDate = targetDate.
 *  6. If mismatch → allowedToday = false, assignedDate = targetDate + 1 day.
 *
 * @param plateNumber   Raw plate string input (user-supplied, unvalidated).
 * @param targetDate    The date to check eligibility against (usually today).
 * @param vehicleType   'MOTOR' | 'MOBIL' | 'DARURAT'.
 */
export function checkOddEvenEligibility(
  plateNumber: string,
  targetDate: Date,
  vehicleType: VehicleType
): OddEvenResult {
  // --- Step 1: Validate plate ---
  const parsed = validateAndParsePlate(plateNumber);

  if (!parsed.isValid) {
    return {
      allowedToday: false,
      assignedDate: targetDate,
      assignedDateLabel: formatDateLabel(targetDate),
      lastDigit: 0,
      plateParity: 'ODD',
      dateParity: 'ODD',
      isEmergency: false,
      validationError: parsed.errorMessage,
    };
  }

  const lastDigit = parsed.lastDigit;
  const plateParity: PlateParity = lastDigit % 2 !== 0 ? 'ODD' : 'EVEN';

  // --- Step 2: Emergency vehicle bypass ---
  if (vehicleType === 'DARURAT') {
    return {
      allowedToday: true,
      assignedDate: targetDate,
      assignedDateLabel: `Hari Ini (${formatDateLabel(targetDate)})`,
      lastDigit,
      plateParity,
      dateParity: targetDate.getDate() % 2 !== 0 ? 'ODD' : 'EVEN',
      isEmergency: true,
    };
  }

  // --- Step 3: Date parity ---
  const dateDay = targetDate.getDate();
  const dateParity: PlateParity = dateDay % 2 !== 0 ? 'ODD' : 'EVEN';

  // --- Step 4: Compare parities ---
  const allowedToday = plateParity === dateParity;

  if (allowedToday) {
    return {
      allowedToday: true,
      assignedDate: targetDate,
      assignedDateLabel: `Hari Ini (${formatDateLabel(targetDate)})`,
      lastDigit,
      plateParity,
      dateParity,
      isEmergency: false,
    };
  } else {
    const tomorrow = nextDay(targetDate);
    const parityLabel = plateParity === 'ODD' ? 'Ganjil' : 'Genap';
    const todayLabel = dateParity === 'ODD' ? 'Ganjil' : 'Genap';

    return {
      allowedToday: false,
      assignedDate: tomorrow,
      assignedDateLabel: `Besok H+1 (${formatDateLabel(tomorrow)})`,
      lastDigit,
      plateParity,
      dateParity,
      isEmergency: false,
      redirectReason:
        `Plat ${parsed.normalizedPlate} berakhiran digit ${lastDigit} (${parityLabel}), ` +
        `namun hari ini tanggal ${dateDay} adalah hari ${todayLabel}. ` +
        `Slot dialihkan otomatis ke H+1.`,
    };
  }
}

/**
 * Returns a simple YYYY-MM-DD string from a Date object.
 */
export function toDateString(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

/**
 * Parses a YYYY-MM-DD string into a Date at midnight local time.
 */
export function fromDateString(dateStr: string): Date {
  const [y, m, d] = dateStr.split('-').map(Number);
  return new Date(y, m - 1, d, 0, 0, 0, 0);
}
