// =============================================================================
// src/core/automation/quotaCalculator.ts — NusaFuel Grid
// Dynamic Quota Calculator with Emergency Reserve & Throttling Logic
// =============================================================================

export type TankStatus = 'NORMAL' | 'THROTTLED' | 'EMERGENCY_ONLY';

/**
 * Input parameters for quota calculation.
 */
export interface QuotaCalcInput {
  currentLiters: number;
  maxCapacityLiters: number;
  bookedLiters: number;
  throttlingEnabled: boolean;
  emergencyReserveEnabled?: boolean; // defaults to true
}

/**
 * Result of quota calculation.
 */
export interface QuotaCalcResult {
  status: TankStatus;
  fillPercentage: number;
  emergencyReserveLiters: number;
  availableLiters: number;
  quotaMotorLiters: number;
  quotaMobilLiters: number;
  quotaDaruratLiters: number;
  estimatedMotorCapacity: number;
  estimatedMobilCapacity: number;
  isLowStockWarning: boolean; // true if fillPercentage <= 30
  isCriticalWarning: boolean; // true if fillPercentage <= 20 (webhook zone)
  isEmergencyOnly: boolean;   // true if fillPercentage <= 10
  humanReadableSummary: string;
}

/**
 * Quota constants per PRD §4.2 and §3.2.
 */
const QUOTA = {
  NORMAL: { MOTOR: 3, MOBIL: 20, DARURAT: 30 },
  THROTTLED: { MOTOR: 3, MOBIL: 10, DARURAT: 30 },
  EMERGENCY_ONLY: { MOTOR: 0, MOBIL: 0, DARURAT: 30 },
} as const;

const THRESHOLD = {
  EMERGENCY_ONLY: 10,  // <= 10% → emergency only
  THROTTLED: 30,       // > 10% && <= 30% → throttled (if enabled)
  WEBHOOK: 20,         // <= 20% → auto-webhook trigger zone
} as const;

/**
 * Calculates available fuel quota, throttling status, and vehicle capacity estimates.
 *
 * Implementation of PRD §4.2 rules:
 *  1. emergencyReserve = 10% of max capacity.
 *  2. availableLiters  = max(0, currentLiters - bookedLiters - emergencyReserve).
 *  3. fillPercentage   = (currentLiters / maxCapacityLiters) * 100.
 *  4. fillPercentage <= 10 → EMERGENCY_ONLY.
 *  5. fillPercentage > 10 && <= 30 && throttlingEnabled → THROTTLED.
 *  6. fillPercentage > 30 → NORMAL.
 *  7. Compute motorCapacity and mobilCapacity from availableLiters.
 */
export function calculateQuota(input: QuotaCalcInput): QuotaCalcResult {
  const {
    currentLiters,
    maxCapacityLiters,
    bookedLiters,
    throttlingEnabled,
    emergencyReserveEnabled = true,
  } = input;

  // Guard against invalid inputs
  const safeCurrent = Math.max(0, currentLiters);
  const safeMax = Math.max(1, maxCapacityLiters);
  const safeBooked = Math.max(0, Math.min(bookedLiters, safeCurrent));

  // Rule 1: Emergency reserve
  const emergencyReserveLiters = emergencyReserveEnabled
    ? Math.round(safeMax * 0.10)
    : 0;

  // Rule 2: Available liters
  const availableLiters = Math.max(0, safeCurrent - safeBooked - emergencyReserveLiters);

  // Rule 3: Fill percentage
  const fillPercentage = (safeCurrent / safeMax) * 100;

  // Rules 4-6: Status determination
  let status: TankStatus;
  if (fillPercentage <= THRESHOLD.EMERGENCY_ONLY) {
    status = 'EMERGENCY_ONLY';
  } else if (fillPercentage <= THRESHOLD.THROTTLED && throttlingEnabled) {
    status = 'THROTTLED';
  } else {
    status = 'NORMAL';
  }

  const quotaKey = status;
  const quotaMotorLiters = QUOTA[quotaKey].MOTOR;
  const quotaMobilLiters = QUOTA[quotaKey].MOBIL;
  const quotaDaruratLiters = QUOTA[quotaKey].DARURAT;

  // Rule 7: Capacity estimates (avoid division by zero)
  const estimatedMotorCapacity = quotaMotorLiters > 0
    ? Math.floor(availableLiters / quotaMotorLiters)
    : 0;
  const estimatedMobilCapacity = quotaMobilLiters > 0
    ? Math.floor(availableLiters / quotaMobilLiters)
    : 0;

  // Derived flags
  const isLowStockWarning = fillPercentage <= THRESHOLD.THROTTLED;
  const isCriticalWarning = fillPercentage <= THRESHOLD.WEBHOOK;
  const isEmergencyOnly = fillPercentage <= THRESHOLD.EMERGENCY_ONLY;

  // Human-readable summary
  const humanReadableSummary = buildHumanSummary(
    status,
    safeCurrent,
    availableLiters,
    estimatedMotorCapacity,
    estimatedMobilCapacity,
    quotaMotorLiters,
    quotaMobilLiters
  );

  return {
    status,
    fillPercentage: Math.round(fillPercentage * 10) / 10,
    emergencyReserveLiters,
    availableLiters,
    quotaMotorLiters,
    quotaMobilLiters,
    quotaDaruratLiters,
    estimatedMotorCapacity,
    estimatedMobilCapacity,
    isLowStockWarning,
    isCriticalWarning,
    isEmergencyOnly,
    humanReadableSummary,
  };
}

function buildHumanSummary(
  status: TankStatus,
  currentLiters: number,
  availableLiters: number,
  motorCap: number,
  mobilCap: number,
  motorQuota: number,
  mobilQuota: number
): string {
  const litersStr = currentLiters.toLocaleString('id-ID');
  const availStr = availableLiters.toLocaleString('id-ID');

  switch (status) {
    case 'EMERGENCY_ONLY':
      return (
        `⚠️ STOK KRITIS — Sisa: ${litersStr} L. ` +
        `Hanya kendaraan DARURAT (Ambulans/Pemadam/Logistik) yang dilayani.`
      );
    case 'THROTTLED':
      return (
        `🔶 KUOTA DIBATASI — Sisa tersedia: ${availStr} L. ` +
        `Cukup ±${motorCap} Motor (${motorQuota}L) atau ±${mobilCap} Mobil (${mobilQuota}L).`
      );
    case 'NORMAL':
    default:
      return (
        `✅ STOK NORMAL — Sisa tersedia: ${availStr} L. ` +
        `Cukup ±${motorCap} Motor (${motorQuota}L) atau ±${mobilCap} Mobil (${mobilQuota}L).`
      );
  }
}

/**
 * Determines if a tank has crossed the automatic restock webhook threshold.
 * Threshold: fill percentage drops below 20%.
 */
export function shouldTriggerRestockWebhook(
  currentLiters: number,
  maxCapacityLiters: number
): boolean {
  if (maxCapacityLiters <= 0) return false;
  return (currentLiters / maxCapacityLiters) * 100 < THRESHOLD.WEBHOOK;
}

/**
 * Calculates Green Impact metrics per PRD §4.4.
 * Each verified ticket eliminates ~110 minutes of engine-idling in physical queue.
 */
export interface GreenImpactMetrics {
  totalFuelSavedLiters: number;
  totalCo2ReducedKg: number;
  totalQueueHoursSaved: number;
}

export function calculateGreenImpact(
  verifiedMotorTickets: number,
  verifiedCarTickets: number
): GreenImpactMetrics {
  const totalFuelSavedLiters =
    verifiedMotorTickets * 0.35 + verifiedCarTickets * 1.4;
  const totalCo2ReducedKg = Number((totalFuelSavedLiters * 2.31).toFixed(2));
  const totalQueueHoursSaved = Number(
    ((verifiedMotorTickets + verifiedCarTickets) * 1.83).toFixed(1)
  );

  return {
    totalFuelSavedLiters: Number(totalFuelSavedLiters.toFixed(2)),
    totalCo2ReducedKg,
    totalQueueHoursSaved,
  };
}
