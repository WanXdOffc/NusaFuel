// =============================================================================
// src/core/data/bulelengSpbuSeed.ts — NusaFuel Grid
// Forwarding & Compatibility Layer — Re-exports comprehensive Bali Regional Seed
// =============================================================================

export * from './baliSpbuSeed';

import {
  SEED_BALI_SPBU_STATIONS,
  SEED_BALI_FUEL_TANKS,
  SEED_BALI_TIME_SLOTS,
  SEED_BALI_QUEUE_TICKETS,
  SEED_BALI_DISPATCH_ORDERS,
  SEED_BALI_SECURITY_AUDIT_LOGS,
} from './baliSpbuSeed';

// Aliases for backwards compatibility with earlier stages
export const SEED_SPBU_STATIONS = SEED_BALI_SPBU_STATIONS;
export const SEED_FUEL_TANKS = SEED_BALI_FUEL_TANKS;
export const SEED_TIME_SLOTS = SEED_BALI_TIME_SLOTS;
export const SEED_QUEUE_TICKETS = SEED_BALI_QUEUE_TICKETS;
export const SEED_DISPATCH_ORDERS = SEED_BALI_DISPATCH_ORDERS;
export const SEED_SECURITY_AUDIT_LOGS = SEED_BALI_SECURITY_AUDIT_LOGS;

export const BALI_SEED = {
  stations: SEED_BALI_SPBU_STATIONS,
  tanks: SEED_BALI_FUEL_TANKS,
  slots: SEED_BALI_TIME_SLOTS,
  tickets: SEED_BALI_QUEUE_TICKETS,
  dispatches: SEED_BALI_DISPATCH_ORDERS,
  auditLogs: SEED_BALI_SECURITY_AUDIT_LOGS,
};

export const BULELENG_SEED = BALI_SEED;

