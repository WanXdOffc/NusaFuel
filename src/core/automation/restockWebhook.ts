// =============================================================================
// src/core/automation/restockWebhook.ts — NusaFuel Grid
// Automated B2B Restock Webhook Engine (PRD §3.3)
// =============================================================================

import { shouldTriggerRestockWebhook } from './quotaCalculator';

export type DispatchStatus = 'PENDING_DISPATCH' | 'IN_TRANSIT' | 'DELIVERED';
export type DispatchTrigger = 'AUTO_WEBHOOK_LOW_TANK' | 'MANUAL_OPERATOR';

/**
 * Minimal snapshot of a fuel tank required by the webhook engine.
 */
export interface TankSnapshot {
  id: string;
  spbuId: string;
  spbuName: string;
  spbuCode: string;
  fuelType: string;
  currentLiters: number;
  maxCapacityLiters: number;
}

/**
 * A generated restock dispatch order.
 */
export interface DispatchOrder {
  id: string;
  dispatchCode: string;
  spbuId: string;
  spbuName: string;
  spbuCode: string;
  fuelTankId: string;
  fuelType: string;
  triggerSource: DispatchTrigger;
  triggerFillPercent: number;
  requestedLiters: number;
  status: DispatchStatus;
  etaMinutes: number;
  createdAt: string;
  dispatchedAt?: string;
  deliveredAt?: string;
}

/** Default tanker truck capacity per dispatch order (8,000 L per PRD §3.3). */
const DEFAULT_DISPATCH_LITERS = 8000;
/** ETA in minutes for a standard depot-to-SPBU tanker delivery. */
const DEFAULT_ETA_MINUTES = 20;

/** Counter for generating sequential dispatch codes. */
let _dispatchCounter = 1;

/**
 * Generates a unique dispatch code.
 * Format: DISP-{spbuCodeShort}-{sequence}
 * e.g. DISP-8114-0001
 */
function generateDispatchCode(spbuCode: string): string {
  const codeShort = spbuCode.replace(/\./g, '').slice(-4);
  const seq = String(_dispatchCounter++).padStart(4, '0');
  return `DISP-${codeShort}-${seq}`;
}

/**
 * Seeds the dispatch counter to a given value.
 * Used during store initialization with pre-existing seed dispatches.
 */
export function seedDispatchCounter(value: number): void {
  _dispatchCounter = value;
}

/**
 * Evaluates whether an auto-restock webhook should be triggered for a given tank.
 * If the tank's fill percentage is below 20% and there is NO existing
 * PENDING_DISPATCH or IN_TRANSIT order for the same tank, a new order is created.
 *
 * @param tank              Current tank snapshot.
 * @param existingDispatches All current dispatch orders in the store.
 * @returns A new DispatchOrder if triggered, or null if not needed.
 */
export function evaluateAutoRestockWebhook(
  tank: TankSnapshot,
  existingDispatches: DispatchOrder[]
): DispatchOrder | null {
  if (!shouldTriggerRestockWebhook(tank.currentLiters, tank.maxCapacityLiters)) {
    return null; // Tank is above 20% threshold — no action needed
  }

  // Check for an existing active dispatch for this tank
  const hasActivePending = existingDispatches.some(
    (d) =>
      d.fuelTankId === tank.id &&
      (d.status === 'PENDING_DISPATCH' || d.status === 'IN_TRANSIT')
  );

  if (hasActivePending) {
    return null; // Already dispatched — do not create duplicate
  }

  const fillPercent = (tank.currentLiters / tank.maxCapacityLiters) * 100;
  const now = new Date().toISOString();

  const newDispatch: DispatchOrder = {
    id: `dispatch-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    dispatchCode: generateDispatchCode(tank.spbuCode),
    spbuId: tank.spbuId,
    spbuName: tank.spbuName,
    spbuCode: tank.spbuCode,
    fuelTankId: tank.id,
    fuelType: tank.fuelType,
    triggerSource: 'AUTO_WEBHOOK_LOW_TANK',
    triggerFillPercent: Math.round(fillPercent * 10) / 10,
    requestedLiters: DEFAULT_DISPATCH_LITERS,
    status: 'PENDING_DISPATCH',
    etaMinutes: DEFAULT_ETA_MINUTES,
    createdAt: now,
  };

  return newDispatch;
}

/**
 * Creates a manual dispatch order triggered by a depot operator.
 */
export function createManualDispatch(
  tank: TankSnapshot,
  requestedLiters: number = DEFAULT_DISPATCH_LITERS,
  etaMinutes: number = DEFAULT_ETA_MINUTES
): DispatchOrder {
  const fillPercent = (tank.currentLiters / tank.maxCapacityLiters) * 100;
  const now = new Date().toISOString();

  return {
    id: `dispatch-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    dispatchCode: generateDispatchCode(tank.spbuCode),
    spbuId: tank.spbuId,
    spbuName: tank.spbuName,
    spbuCode: tank.spbuCode,
    fuelTankId: tank.id,
    fuelType: tank.fuelType,
    triggerSource: 'MANUAL_OPERATOR',
    triggerFillPercent: Math.round(fillPercent * 10) / 10,
    requestedLiters,
    status: 'PENDING_DISPATCH',
    etaMinutes,
    createdAt: now,
  };
}

/**
 * Advances a dispatch order's status to the next stage.
 * PENDING_DISPATCH → IN_TRANSIT → DELIVERED
 */
export function advanceDispatchStatus(dispatch: DispatchOrder): DispatchOrder {
  const now = new Date().toISOString();

  if (dispatch.status === 'PENDING_DISPATCH') {
    return { ...dispatch, status: 'IN_TRANSIT', dispatchedAt: now };
  }
  if (dispatch.status === 'IN_TRANSIT') {
    return { ...dispatch, status: 'DELIVERED', deliveredAt: now };
  }
  return dispatch; // Already DELIVERED — no change
}

/**
 * Builds the JSON payload for a restock webhook API call (REST API Playground).
 */
export function buildWebhookPayload(dispatch: DispatchOrder): object {
  return {
    event: 'RESTOCK_DISPATCH_CREATED',
    timestamp: dispatch.createdAt,
    data: {
      dispatch_code: dispatch.dispatchCode,
      spbu_code: dispatch.spbuCode,
      spbu_name: dispatch.spbuName,
      fuel_type: dispatch.fuelType,
      requested_liters: dispatch.requestedLiters,
      trigger_source: dispatch.triggerSource,
      trigger_fill_percent: dispatch.triggerFillPercent,
      status: dispatch.status,
      eta_minutes: dispatch.etaMinutes,
    },
    meta: {
      system: 'NusaFuel Grid v1.0',
      region: 'Buleleng, Bali, Indonesia',
      endpoint: 'https://depot.pertamina.buleleng.id/api/v1/dispatch',
    },
  };
}
