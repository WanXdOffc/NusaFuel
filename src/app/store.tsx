// =============================================================================
// src/app/store.tsx — NusaFuel Grid
// Global Reactive Context / In-Memory Relational Store
// Pre-seeded with realistic Buleleng SPBU data — zero external API keys needed.
// =============================================================================

import React, {
  createContext,
  useContext,
  useReducer,
  useCallback,
  useMemo,
  useEffect,
} from 'react';

import {
  BULELENG_SEED,
  type SpbuStation,
  type FuelTank,
  type TimeSlot,
  type QueueTicket,
  type SecurityAuditLog,
  type TicketStatus,
  type ActorRole,
  type LogSeverity,
} from '../core/data/bulelengSpbuSeed';

import type { DispatchOrder } from '../core/automation/restockWebhook';
import {
  evaluateAutoRestockWebhook,
  advanceDispatchStatus,
  buildWebhookPayload,
  seedDispatchCounter,
} from '../core/automation/restockWebhook';

import {
  checkAntiHoarding,
  type TicketRecord,
} from '../core/automation/antiHoardingGuard';

import {
  calculateQuota,
  shouldTriggerRestockWebhook,
} from '../core/automation/quotaCalculator';

import {
  validateAndParsePlate,
  generateTicketHash,
  verifyTicketHash,
} from '../core/security/inputSanitizer';

import { checkOddEvenEligibility } from '../core/automation/oddEvenEngine';

// Seed the dispatch counter past the pre-seeded codes
seedDispatchCounter(10);

// ---------------------------------------------------------------------------
// TYPES — Active Role for Judge Quick Switcher
// ---------------------------------------------------------------------------

export type ActiveRole = 'PUBLIC_DRIVER' | 'SPBU_OPERATOR' | 'DEPOT_SIMULATOR';

export interface ActiveSpbuOperator {
  spbuId: string;
  operatorName: string;
}

// ---------------------------------------------------------------------------
// STORE STATE
// ---------------------------------------------------------------------------

export interface StoreState {
  // Relational data tables
  stations: SpbuStation[];
  tanks: FuelTank[];
  slots: TimeSlot[];
  tickets: QueueTicket[];
  dispatches: DispatchOrder[];
  auditLogs: SecurityAuditLog[];

  // UI / session state
  activeRole: ActiveRole;
  activeOperator: ActiveSpbuOperator | null;
  simulatedDateIsOdd: boolean | null; // null = use real system date
  lastWebhookPayload: object | null;
  isHighContrast: boolean;
  fontScale: 100 | 115 | 125;
  selectedSpbuId: string | null;      // for User A map selection
}

// ---------------------------------------------------------------------------
// ACTION TYPES
// ---------------------------------------------------------------------------

type Action =
  | { type: 'SET_ACTIVE_ROLE'; role: ActiveRole }
  | { type: 'SET_ACTIVE_OPERATOR'; operator: ActiveSpbuOperator | null }
  | { type: 'TOGGLE_SIMULATED_DATE_PARITY' }
  | { type: 'SET_SELECTED_SPBU'; spbuId: string | null }
  | { type: 'SET_HIGH_CONTRAST'; value: boolean }
  | { type: 'SET_FONT_SCALE'; scale: 100 | 115 | 125 }
  | { type: 'ADD_AUDIT_LOG'; log: SecurityAuditLog }
  | { type: 'ADD_TICKET'; ticket: QueueTicket }
  | { type: 'UPDATE_TICKET_STATUS'; ticketId: string; status: TicketStatus; extra?: Partial<QueueTicket> }
  | { type: 'UPDATE_TANK'; tankId: string; patch: Partial<FuelTank> }
  | { type: 'UPDATE_STATION'; stationId: string; patch: Partial<SpbuStation> }
  | { type: 'UPDATE_SLOT'; slotId: string; patch: Partial<TimeSlot> }
  | { type: 'ADD_DISPATCH'; dispatch: DispatchOrder }
  | { type: 'UPDATE_DISPATCH'; dispatchId: string; patch: Partial<DispatchOrder> }
  | { type: 'SET_WEBHOOK_PAYLOAD'; payload: object }
  | { type: 'RESET_TO_SEED' };

// ---------------------------------------------------------------------------
// INITIAL STATE
// ---------------------------------------------------------------------------

const initialState: StoreState = {
  stations: BULELENG_SEED.stations,
  tanks: BULELENG_SEED.tanks,
  slots: BULELENG_SEED.slots,
  tickets: BULELENG_SEED.tickets,
  dispatches: BULELENG_SEED.dispatches,
  auditLogs: BULELENG_SEED.auditLogs,
  activeRole: 'PUBLIC_DRIVER',
  activeOperator: null,
  simulatedDateIsOdd: null,
  lastWebhookPayload: null,
  isHighContrast: false,
  fontScale: 100,
  selectedSpbuId: 'spbu-gajah-mada',
};

// ---------------------------------------------------------------------------
// REDUCER
// ---------------------------------------------------------------------------

function reducer(state: StoreState, action: Action): StoreState {
  switch (action.type) {
    case 'SET_ACTIVE_ROLE':
      return { ...state, activeRole: action.role };

    case 'SET_ACTIVE_OPERATOR':
      return { ...state, activeOperator: action.operator };

    case 'TOGGLE_SIMULATED_DATE_PARITY': {
      if (state.simulatedDateIsOdd === null) {
        // First toggle: derive from real date and invert
        const realDayIsOdd = new Date().getDate() % 2 !== 0;
        return { ...state, simulatedDateIsOdd: !realDayIsOdd };
      }
      return { ...state, simulatedDateIsOdd: !state.simulatedDateIsOdd };
    }

    case 'SET_SELECTED_SPBU':
      return { ...state, selectedSpbuId: action.spbuId };

    case 'SET_HIGH_CONTRAST':
      return { ...state, isHighContrast: action.value };

    case 'SET_FONT_SCALE':
      return { ...state, fontScale: action.scale };

    case 'ADD_AUDIT_LOG':
      return {
        ...state,
        auditLogs: [action.log, ...state.auditLogs],
      };

    case 'ADD_TICKET':
      return { ...state, tickets: [...state.tickets, action.ticket] };

    case 'UPDATE_TICKET_STATUS':
      return {
        ...state,
        tickets: state.tickets.map((t) =>
          t.id === action.ticketId
            ? { ...t, status: action.status, ...(action.extra ?? {}) }
            : t
        ),
      };

    case 'UPDATE_TANK':
      return {
        ...state,
        tanks: state.tanks.map((tk) =>
          tk.id === action.tankId ? { ...tk, ...action.patch, updatedAt: new Date().toISOString() } : tk
        ),
      };

    case 'UPDATE_STATION':
      return {
        ...state,
        stations: state.stations.map((s) =>
          s.id === action.stationId ? { ...s, ...action.patch, updatedAt: new Date().toISOString() } : s
        ),
      };

    case 'UPDATE_SLOT':
      return {
        ...state,
        slots: state.slots.map((sl) =>
          sl.id === action.slotId ? { ...sl, ...action.patch } : sl
        ),
      };

    case 'ADD_DISPATCH':
      return { ...state, dispatches: [...state.dispatches, action.dispatch] };

    case 'UPDATE_DISPATCH':
      return {
        ...state,
        dispatches: state.dispatches.map((d) =>
          d.id === action.dispatchId ? { ...d, ...action.patch } : d
        ),
      };

    case 'SET_WEBHOOK_PAYLOAD':
      return { ...state, lastWebhookPayload: action.payload };

    case 'RESET_TO_SEED':
      return {
        ...initialState,
        stations: JSON.parse(JSON.stringify(BULELENG_SEED.stations)),
        tanks: JSON.parse(JSON.stringify(BULELENG_SEED.tanks)),
        slots: JSON.parse(JSON.stringify(BULELENG_SEED.slots)),
        tickets: JSON.parse(JSON.stringify(BULELENG_SEED.tickets)),
        dispatches: JSON.parse(JSON.stringify(BULELENG_SEED.dispatches)),
        auditLogs: JSON.parse(JSON.stringify(BULELENG_SEED.auditLogs)),
      };

    default:
      return state;
  }
}

// ---------------------------------------------------------------------------
// CONTEXT
// ---------------------------------------------------------------------------

interface StoreContextValue {
  state: StoreState;
  // --- Derived selectors ---
  getStation: (id: string) => SpbuStation | undefined;
  getTanksForStation: (spbuId: string) => FuelTank[];
  getSlotsForTank: (tankId: string, date: string) => TimeSlot[];
  getTicketsForSlot: (slotId: string) => QueueTicket[];
  getEffectiveDate: () => Date;
  getQuotaForTank: (tankId: string) => ReturnType<typeof calculateQuota>;

  // --- Actions ---
  setActiveRole: (role: ActiveRole) => void;
  setActiveOperator: (operator: ActiveSpbuOperator | null) => void;
  setSelectedSpbu: (spbuId: string | null) => void;
  setHighContrast: (value: boolean) => void;
  setFontScale: (scale: 100 | 115 | 125) => void;

  /** Book a time slot — User A main action. */
  bookTimeSlot: (params: BookSlotParams) => BookSlotResult;

  /** Operator scans a QR ticket at the cashier — User B main action. */
  verifyTicketQr: (params: VerifyTicketParams) => VerifyTicketResult;

  /** Operator inputs a Delivery Order, updating tank liters — User B. */
  updateTankDoLiters: (params: UpdateDoParams) => void;

  /** Operator toggles a station policy (odd-even, throttling, reserve) — User B. */
  toggleSpbuPolicy: (params: TogglePolicyParams) => void;

  /** Depot dispatcher advances a dispatch order status — User C. */
  triggerDepotDispatch: (dispatchId: string) => void;

  /** Judge simulator: fire a named crisis event — User C. */
  simulateCrisisEvent: (eventName: CrisisEventName, targetSpbuId?: string) => void;

  /** Judge simulator: toggle simulated date parity. */
  toggleSimulatedDateParity: () => void;
}

// ---------------------------------------------------------------------------
// PARAM / RESULT TYPES
// ---------------------------------------------------------------------------

export interface BookSlotParams {
  plateNumber: string;
  vehicleType: 'MOTOR' | 'MOBIL' | 'DARURAT';
  fuelType: 'Pertalite' | 'Pertamax' | 'Solar';
  spbuId: string;
  slotId: string;
}

export interface BookSlotResult {
  success: boolean;
  ticket?: QueueTicket;
  errorCode?: 'INVALID_PLATE' | 'WRONG_PARITY' | 'SLOT_FULL' | 'HOARDING' | 'TANK_CRITICAL';
  errorMessage?: string;
  hoardingDetails?: ReturnType<typeof checkAntiHoarding>;
  oddEvenDetails?: ReturnType<typeof checkOddEvenEligibility>;
}

export interface VerifyTicketParams {
  ticketId: string;
  operatorId: string;
}

export interface VerifyTicketResult {
  success: boolean;
  blocked: boolean;
  errorMessage?: string;
  hoardingDetails?: ReturnType<typeof checkAntiHoarding>;
}

export interface UpdateDoParams {
  spbuId: string;
  tankId: string;
  addLiters: number;
  activeNozzles?: number;
  startUnloadingTimer?: boolean;
  operatorId: string;
}

export interface TogglePolicyParams {
  spbuId: string;
  policy: 'oddEvenActive' | 'dynamicThrottlingActive' | 'emergencyReserveActive';
  value: boolean;
  operatorId: string;
}

export type CrisisEventName =
  | 'SURGE_QUEUE'                 // Rush hour: reduce 900L from Gajah Mada Pertalite (<20% trigger)
  | 'SIMULATE_HOARDING'           // Attempt hoarding across SPBUs and show block
  | 'TANK_CRITICAL'               // Drain a tank to 5% (emergency only)
  | 'FORCE_DISPATCH'              // Force-create a new dispatch for any tank
  | 'FINISH_UNLOADING_BANYUASRI'  // Mark Banyuasri unloading as complete (+8.000L)
  | 'RESET_TO_SEED';              // Reset all tables to seed state

// ---------------------------------------------------------------------------
// HELPER — Create audit log entry
// ---------------------------------------------------------------------------

function makeLog(
  actorRole: ActorRole,
  eventType: string,
  spbuCode: string,
  referenceId: string,
  severity: LogSeverity,
  message: string,
  metadataJson?: string
): SecurityAuditLog {
  return {
    id: `log-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    timestamp: new Date().toISOString(),
    actorRole,
    eventType,
    spbuCode,
    referenceId,
    severity,
    message,
    metadataJson,
  };
}

// ---------------------------------------------------------------------------
// TICKET CODE GENERATOR
// ---------------------------------------------------------------------------

let _ticketCounter = 20;
function generateTicketCode(spbuCode: string): string {
  const codeShort = spbuCode.replace(/\./g, '').slice(-5);
  const seq = String(_ticketCounter++).padStart(3, '0');
  return `NFG-${codeShort}-${seq}`;
}

// ---------------------------------------------------------------------------
// CONTEXT CREATION
// ---------------------------------------------------------------------------

const StoreContext = createContext<StoreContextValue | null>(null);

// ---------------------------------------------------------------------------
// PROVIDER
// ---------------------------------------------------------------------------

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initialState);

  // --- Derived selectors (memoized per render) ---

  const getStation = useCallback(
    (id: string) => state.stations.find((s) => s.id === id),
    [state.stations]
  );

  const getTanksForStation = useCallback(
    (spbuId: string) => state.tanks.filter((t) => t.spbuId === spbuId),
    [state.tanks]
  );

  const getSlotsForTank = useCallback(
    (tankId: string, date: string) =>
      state.slots.filter((s) => s.fuelTankId === tankId && s.slotDate === date),
    [state.slots]
  );

  const getTicketsForSlot = useCallback(
    (slotId: string) => state.tickets.filter((t) => t.slotId === slotId),
    [state.tickets]
  );

  /**
   * Returns the effective "today" date — real or simulated (for Judge toggle).
   */
  const getEffectiveDate = useCallback((): Date => {
    if (state.simulatedDateIsOdd === null) return new Date();
    const base = new Date();
    // Force day to an odd or even value
    const isCurrentlyOdd = base.getDate() % 2 !== 0;
    if (state.simulatedDateIsOdd !== isCurrentlyOdd) {
      base.setDate(base.getDate() + 1);
    }
    return base;
  }, [state.simulatedDateIsOdd]);

  const getQuotaForTank = useCallback(
    (tankId: string) => {
      const tank = state.tanks.find((t) => t.id === tankId);
      if (!tank) {
        return calculateQuota({
          currentLiters: 0,
          maxCapacityLiters: 8000,
          bookedLiters: 0,
          throttlingEnabled: false,
        });
      }
      const station = state.stations.find((s) => s.id === tank.spbuId);
      return calculateQuota({
        currentLiters: tank.currentLiters,
        maxCapacityLiters: tank.maxCapacityLiters,
        bookedLiters: tank.bookedLiters,
        throttlingEnabled: station?.dynamicThrottlingActive ?? true,
        emergencyReserveEnabled: station?.emergencyReserveActive ?? true,
      });
    },
    [state.tanks, state.stations]
  );

  // ---------------------------------------------------------------------------
  // ACTION: Set active role (Judge Quick Switcher)
  // ---------------------------------------------------------------------------

  const setActiveRole = useCallback((role: ActiveRole) => {
    dispatch({ type: 'SET_ACTIVE_ROLE', role });
  }, []);

  const setActiveOperator = useCallback((operator: ActiveSpbuOperator | null) => {
    dispatch({ type: 'SET_ACTIVE_OPERATOR', operator });
  }, []);

  const setSelectedSpbu = useCallback((spbuId: string | null) => {
    dispatch({ type: 'SET_SELECTED_SPBU', spbuId });
  }, []);

  const setHighContrast = useCallback((value: boolean) => {
    dispatch({ type: 'SET_HIGH_CONTRAST', value });
  }, []);

  const setFontScale = useCallback((scale: 100 | 115 | 125) => {
    dispatch({ type: 'SET_FONT_SCALE', scale });
  }, []);

  // ---------------------------------------------------------------------------
  // ACTION: bookTimeSlot — User A books a 30-min fuel queue slot
  // ---------------------------------------------------------------------------

  const bookTimeSlot = useCallback(
    (params: BookSlotParams): BookSlotResult => {
      const { plateNumber, vehicleType, fuelType, spbuId, slotId } = params;

      // 1. Validate plate
      const parsed = validateAndParsePlate(plateNumber);
      if (!parsed.isValid) {
        return {
          success: false,
          errorCode: 'INVALID_PLATE',
          errorMessage: parsed.errorMessage,
        };
      }

      // 2. Odd-Even check
      const effectiveDate = getEffectiveDate();
      const oeResult = checkOddEvenEligibility(plateNumber, effectiveDate, vehicleType);
      if (!oeResult.allowedToday) {
        return {
          success: false,
          errorCode: 'WRONG_PARITY',
          errorMessage: oeResult.redirectReason,
          oddEvenDetails: oeResult,
        };
      }

      // 3. Get slot and tank
      const slot = state.slots.find((s) => s.id === slotId);
      if (!slot) {
        return { success: false, errorCode: 'SLOT_FULL', errorMessage: 'Slot tidak ditemukan.' };
      }
      if (slot.isLocked) {
        return { success: false, errorCode: 'SLOT_FULL', errorMessage: 'Slot sudah penuh / terkunci.' };
      }

      const tank = state.tanks.find((t) => t.id === slot.fuelTankId);
      const station = state.stations.find((s) => s.id === spbuId);

      if (!tank || !station) {
        return { success: false, errorCode: 'SLOT_FULL', errorMessage: 'Data SPBU tidak ditemukan.' };
      }

      // 4. Calculate quota
      const quota = calculateQuota({
        currentLiters: tank.currentLiters,
        maxCapacityLiters: tank.maxCapacityLiters,
        bookedLiters: tank.bookedLiters,
        throttlingEnabled: station.dynamicThrottlingActive,
        emergencyReserveEnabled: station.emergencyReserveActive,
      });

      if (quota.isEmergencyOnly && vehicleType !== 'DARURAT') {
        return {
          success: false,
          errorCode: 'TANK_CRITICAL',
          errorMessage: `Stok KRITIS (<10%). Hanya kendaraan DARURAT yang dilayani.`,
        };
      }

      const quotaLiters = vehicleType === 'DARURAT'
        ? quota.quotaDaruratLiters
        : vehicleType === 'MOTOR'
          ? quota.quotaMotorLiters
          : quota.quotaMobilLiters;

      if (quotaLiters === 0) {
        return {
          success: false,
          errorCode: 'TANK_CRITICAL',
          errorMessage: `Kuota 0L — stok tidak mencukupi untuk kendaraan ini.`,
        };
      }

      // 5. Anti-hoarding check
      const ticketRecords: TicketRecord[] = state.tickets.map((t) => ({
        id: t.id,
        plateNumber: t.plateNumber,
        fuelType: t.fuelType,
        spbuId: t.spbuId,
        spbuName: t.spbuName,
        status: t.status,
        createdAt: t.createdAt,
        quotaLiters: t.quotaLiters,
      }));
      const hoardingCheck = checkAntiHoarding(parsed.normalizedPlate, fuelType, ticketRecords);
      if (hoardingCheck.isHoarding) {
        const log = makeLog(
          'SECURITY_GUARD',
          'HOARDING_BLOCKED',
          station.code,
          parsed.normalizedPlate,
          'CRITICAL',
          hoardingCheck.blockMessage ?? 'Hoarding attempt detected during slot booking.'
        );
        dispatch({ type: 'ADD_AUDIT_LOG', log });
        return {
          success: false,
          errorCode: 'HOARDING',
          errorMessage: hoardingCheck.blockMessage,
          hoardingDetails: hoardingCheck,
        };
      }

      // 6. Create ticket
      const now = new Date().toISOString();
      const ticketCode = generateTicketCode(station.code);
      const qrHash = generateTicketHash(ticketCode, parsed.normalizedPlate, slotId, quotaLiters, now);

      const newTicket: QueueTicket = {
        id: `ticket-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        ticketCode,
        spbuId,
        slotId,
        plateNumber: parsed.normalizedPlate,
        plateParity: parsed.parity,
        vehicleType,
        fuelType,
        quotaLiters,
        qrHash,
        status: 'BOOKED',
        createdAt: now,
        spbuName: station.name,
        slotWindowLabel: slot.windowLabel,
      };

      dispatch({ type: 'ADD_TICKET', ticket: newTicket });

      // 7. Update slot booked liters and lock if full
      const newSlotBooked = slot.bookedLiters + quotaLiters;
      dispatch({
        type: 'UPDATE_SLOT',
        slotId: slot.id,
        patch: {
          bookedLiters: newSlotBooked,
          isLocked: newSlotBooked >= slot.capacityLiters,
        },
      });

      // 8. Update tank booked liters
      dispatch({
        type: 'UPDATE_TANK',
        tankId: tank.id,
        patch: { bookedLiters: tank.bookedLiters + quotaLiters },
      });

      // 9. Audit log
      const log = makeLog(
        'PUBLIC_DRIVER',
        'SLOT_BOOKED',
        station.code,
        ticketCode,
        'INFO',
        `Tiket ${ticketCode} diterbitkan untuk ${parsed.normalizedPlate} (${vehicleType}, ${quotaLiters}L ${fuelType}) — Slot ${slot.windowLabel}.`
      );
      dispatch({ type: 'ADD_AUDIT_LOG', log });

      return { success: true, ticket: newTicket };
    },
    [state.slots, state.tanks, state.stations, state.tickets, getEffectiveDate]
  );

  // ---------------------------------------------------------------------------
  // ACTION: verifyTicketQr — User B scans ticket at cashier
  // ---------------------------------------------------------------------------

  const verifyTicketQr = useCallback(
    (params: VerifyTicketParams): VerifyTicketResult => {
      const { ticketId, operatorId } = params;
      const ticket = state.tickets.find((t) => t.id === ticketId);

      if (!ticket) {
        return { success: false, blocked: false, errorMessage: 'Tiket tidak ditemukan.' };
      }
      if (ticket.status !== 'BOOKED') {
        return {
          success: false,
          blocked: ticket.status === 'BLOCKED_HOARDING',
          errorMessage:
            ticket.status === 'COMPLETED'
              ? 'Tiket sudah digunakan (COMPLETED).'
              : 'Tiket diblokir karena anti-hoarding.',
        };
      }

      // Verify QR hash
      const hashValid = verifyTicketHash(
        ticket.ticketCode,
        ticket.plateNumber,
        ticket.slotId,
        ticket.quotaLiters,
        ticket.createdAt,
        ticket.qrHash
      );
      if (!hashValid) {
        return { success: false, blocked: false, errorMessage: 'Hash QR tidak valid — tiket mungkin dipalsukan.' };
      }

      // Cross-SPBU anti-hoarding check at point of verification
      const allOtherTickets: TicketRecord[] = state.tickets
        .filter((t) => t.id !== ticketId)
        .map((t) => ({
          id: t.id,
          plateNumber: t.plateNumber,
          fuelType: t.fuelType,
          spbuId: t.spbuId,
          spbuName: t.spbuName,
          status: t.status,
          createdAt: t.createdAt,
          quotaLiters: t.quotaLiters,
        }));

      const hoardingCheck = checkAntiHoarding(
        ticket.plateNumber,
        ticket.fuelType,
        allOtherTickets.filter((t) => t.status === 'COMPLETED')
      );

      const station = state.stations.find((s) => s.id === ticket.spbuId);
      const stationCode = station?.code ?? 'UNKNOWN';

      if (hoardingCheck.isHoarding) {
        // Mark ticket as blocked
        dispatch({
          type: 'UPDATE_TICKET_STATUS',
          ticketId,
          status: 'BLOCKED_HOARDING',
          extra: { blockReason: hoardingCheck.blockMessage },
        });

        const log = makeLog(
          'SECURITY_GUARD',
          'HOARDING_BLOCKED',
          stationCode,
          ticket.ticketCode,
          'CRITICAL',
          hoardingCheck.blockMessage ?? 'Hoarding detected at cashier verification.',
          JSON.stringify({ plateNumber: ticket.plateNumber, previousSpbu: hoardingCheck.previousSpbuName })
        );
        dispatch({ type: 'ADD_AUDIT_LOG', log });

        return { success: false, blocked: true, hoardingDetails: hoardingCheck };
      }

      // All clear — mark COMPLETED and deduct tank liters
      const now = new Date().toISOString();
      dispatch({
        type: 'UPDATE_TICKET_STATUS',
        ticketId,
        status: 'COMPLETED',
        extra: { verifiedByOperator: operatorId, verifiedAt: now },
      });

      // Deduct from tank
      const tank = state.tanks.find(
        (t) => t.spbuId === ticket.spbuId && t.fuelType === ticket.fuelType
      );
      if (tank) {
        const newLiters = Math.max(0, tank.currentLiters - ticket.quotaLiters);
        const newBooked = Math.max(0, tank.bookedLiters - ticket.quotaLiters);
        dispatch({
          type: 'UPDATE_TANK',
          tankId: tank.id,
          patch: { currentLiters: newLiters, bookedLiters: newBooked },
        });

        // Check if auto-restock webhook should fire after deduction
        if (shouldTriggerRestockWebhook(newLiters, tank.maxCapacityLiters)) {
          const newDispatch = evaluateAutoRestockWebhook(
            {
              id: tank.id,
              spbuId: tank.spbuId,
              spbuName: station?.name ?? '',
              spbuCode: stationCode,
              fuelType: tank.fuelType,
              currentLiters: newLiters,
              maxCapacityLiters: tank.maxCapacityLiters,
            },
            state.dispatches
          );
          if (newDispatch) {
            dispatch({ type: 'ADD_DISPATCH', dispatch: newDispatch });
            const webhookPayload = buildWebhookPayload(newDispatch);
            dispatch({ type: 'SET_WEBHOOK_PAYLOAD', payload: webhookPayload });

            const webhookLog = makeLog(
              'DEPOT_SYSTEM',
              'WEBHOOK_TRIGGERED',
              stationCode,
              newDispatch.dispatchCode,
              'WARNING',
              `⚡ AUTO-WEBHOOK: Tangki ${tank.fuelType} ${stationCode} menyentuh ${newDispatch.triggerFillPercent}% (<20%). Dispatch ${newDispatch.dispatchCode} dikirim otomatis.`,
              JSON.stringify(webhookPayload)
            );
            dispatch({ type: 'ADD_AUDIT_LOG', log: webhookLog });
          }
        }
      }

      const log = makeLog(
        'SPBU_OPERATOR',
        'QR_VERIFIED',
        stationCode,
        ticket.ticketCode,
        'INFO',
        `Tiket ${ticket.ticketCode} (${ticket.plateNumber}, ${ticket.vehicleType}, ${ticket.quotaLiters}L) diverifikasi oleh ${operatorId}.`
      );
      dispatch({ type: 'ADD_AUDIT_LOG', log });

      return { success: true, blocked: false };
    },
    [state.tickets, state.tanks, state.stations, state.dispatches]
  );

  // ---------------------------------------------------------------------------
  // ACTION: updateTankDoLiters — User B inputs Delivery Order
  // ---------------------------------------------------------------------------

  const updateTankDoLiters = useCallback(
    (params: UpdateDoParams) => {
      const { spbuId, tankId, addLiters, activeNozzles, startUnloadingTimer, operatorId } = params;
      const tank = state.tanks.find((t) => t.id === tankId);
      const station = state.stations.find((s) => s.id === spbuId);
      if (!tank || !station) return;

      const newLiters = Math.min(tank.maxCapacityLiters, tank.currentLiters + addLiters);

      dispatch({
        type: 'UPDATE_TANK',
        tankId,
        patch: {
          currentLiters: newLiters,
          lastDoLiters: addLiters,
          unloadingMinutesLeft: startUnloadingTimer ? 30 : tank.unloadingMinutesLeft,
          burnRateLpm: startUnloadingTimer ? 0 : tank.burnRateLpm,
        },
      });

      if (activeNozzles !== undefined) {
        dispatch({
          type: 'UPDATE_STATION',
          stationId: spbuId,
          patch: { activeNozzles },
        });
      }

      if (startUnloadingTimer) {
        dispatch({
          type: 'UPDATE_STATION',
          stationId: spbuId,
          patch: { operationalMode: 'UNLOADING' },
        });
      } else {
        // After DO, recalculate mode
        const fillPct = (newLiters / tank.maxCapacityLiters) * 100;
        const newMode =
          fillPct <= 10
            ? 'EMERGENCY_ONLY'
            : fillPct <= 30 && station.dynamicThrottlingActive
              ? 'THROTTLED'
              : 'NORMAL';
        dispatch({ type: 'UPDATE_STATION', stationId: spbuId, patch: { operationalMode: newMode } });
      }

      const log = makeLog(
        'SPBU_OPERATOR',
        'DO_UPDATED',
        station.code,
        tankId,
        'INFO',
        `Operator ${operatorId} menginput DO +${addLiters.toLocaleString('id-ID')}L ${tank.fuelType} ke SPBU ${station.name}. ` +
          `Stok: ${tank.currentLiters.toLocaleString('id-ID')}L → ${newLiters.toLocaleString('id-ID')}L.` +
          (startUnloadingTimer ? ' Timer Bongkar Muat 30 menit dimulai.' : '')
      );
      dispatch({ type: 'ADD_AUDIT_LOG', log });
    },
    [state.tanks, state.stations]
  );

  // ---------------------------------------------------------------------------
  // ACTION: toggleSpbuPolicy — User B toggles policy switches
  // ---------------------------------------------------------------------------

  const toggleSpbuPolicy = useCallback(
    (params: TogglePolicyParams) => {
      const { spbuId, policy, value, operatorId } = params;
      const station = state.stations.find((s) => s.id === spbuId);
      if (!station) return;

      dispatch({ type: 'UPDATE_STATION', stationId: spbuId, patch: { [policy]: value } });

      // If toggling throttling, recalculate station mode
      if (policy === 'dynamicThrottlingActive') {
        const pertaliteTank = state.tanks.find(
          (t) => t.spbuId === spbuId && t.fuelType === 'Pertalite'
        );
        if (pertaliteTank) {
          const fillPct = (pertaliteTank.currentLiters / pertaliteTank.maxCapacityLiters) * 100;
          const newMode =
            fillPct <= 10
              ? 'EMERGENCY_ONLY'
              : fillPct <= 30 && value
                ? 'THROTTLED'
                : 'NORMAL';
          dispatch({ type: 'UPDATE_STATION', stationId: spbuId, patch: { operationalMode: newMode } });
        }
      }

      const policyLabels: Record<string, string> = {
        oddEvenActive: 'Ganjil-Genap',
        dynamicThrottlingActive: 'Dynamic Throttling',
        emergencyReserveActive: 'Emergency Reserve Lock 10%',
      };

      const log = makeLog(
        'SPBU_OPERATOR',
        'POLICY_CHANGED',
        station.code,
        spbuId,
        'WARNING',
        `Operator ${operatorId} mengubah kebijakan "${policyLabels[policy]}" di ${station.name} → ${value ? 'AKTIF' : 'NONAKTIF'}.`
      );
      dispatch({ type: 'ADD_AUDIT_LOG', log });
    },
    [state.stations, state.tanks]
  );

  // ---------------------------------------------------------------------------
  // ACTION: triggerDepotDispatch — User C advances dispatch status
  // ---------------------------------------------------------------------------

  const triggerDepotDispatch = useCallback(
    (dispatchId: string) => {
      const d = state.dispatches.find((x) => x.id === dispatchId);
      if (!d) return;

      const updated = advanceDispatchStatus(d);
      dispatch({ type: 'UPDATE_DISPATCH', dispatchId, patch: updated });

      const webhookPayload = buildWebhookPayload(updated);
      dispatch({ type: 'SET_WEBHOOK_PAYLOAD', payload: webhookPayload });

      const station = state.stations.find((s) => s.id === d.spbuId);

      // If delivered, actually add liters to the tank
      if (updated.status === 'DELIVERED') {
        const tank = state.tanks.find((t) => t.id === d.fuelTankId);
        if (tank) {
          const newLiters = Math.min(tank.maxCapacityLiters, tank.currentLiters + d.requestedLiters);
          dispatch({ type: 'UPDATE_TANK', tankId: tank.id, patch: { currentLiters: newLiters, unloadingMinutesLeft: 30 } });
          dispatch({ type: 'UPDATE_STATION', stationId: d.spbuId, patch: { operationalMode: 'UNLOADING' } });
        }
      }

      const log = makeLog(
        'DEPOT_SYSTEM',
        'DISPATCH_STATUS_UPDATED',
        station?.code ?? 'UNKNOWN',
        d.dispatchCode,
        'INFO',
        `Dispatch ${d.dispatchCode} status diubah: ${d.status} → ${updated.status}. ` +
          `Muatan: ${d.requestedLiters.toLocaleString('id-ID')}L ${d.fuelType} untuk ${d.spbuName}.`
      );
      dispatch({ type: 'ADD_AUDIT_LOG', log });
    },
    [state.dispatches, state.stations, state.tanks]
  );

  // ---------------------------------------------------------------------------
  // ACTION: simulateCrisisEvent — User C judge simulator
  // ---------------------------------------------------------------------------

  const simulateCrisisEvent = useCallback(
    (eventName: CrisisEventName, targetSpbuId?: string) => {
      const spbuId = targetSpbuId ?? 'spbu-gajah-mada';
      const station = state.stations.find((s) => s.id === spbuId);

      switch (eventName) {
        case 'SURGE_QUEUE': {
          // Reduce 1500L from Gajah Mada Pertalite
          const tank = state.tanks.find(
            (t) => t.spbuId === 'spbu-gajah-mada' && t.fuelType === 'Pertalite'
          );
          if (tank) {
            const newLiters = Math.max(0, tank.currentLiters - 1500);
            dispatch({ type: 'UPDATE_TANK', tankId: tank.id, patch: { currentLiters: newLiters } });

            const fillPct = (newLiters / tank.maxCapacityLiters) * 100;
            const newMode =
              fillPct <= 10 ? 'EMERGENCY_ONLY' : fillPct <= 30 ? 'THROTTLED' : 'NORMAL';
            dispatch({ type: 'UPDATE_STATION', stationId: 'spbu-gajah-mada', patch: { operationalMode: newMode } });

            // Check if webhook triggered
            if (shouldTriggerRestockWebhook(newLiters, tank.maxCapacityLiters)) {
              const newDispatch = evaluateAutoRestockWebhook(
                {
                  id: tank.id,
                  spbuId: 'spbu-gajah-mada',
                  spbuName: 'SPBU Pertamina Gajah Mada',
                  spbuCode: '54.811.14',
                  fuelType: 'Pertalite',
                  currentLiters: newLiters,
                  maxCapacityLiters: tank.maxCapacityLiters,
                },
                state.dispatches
              );
              if (newDispatch) {
                dispatch({ type: 'ADD_DISPATCH', dispatch: newDispatch });
                dispatch({ type: 'SET_WEBHOOK_PAYLOAD', payload: buildWebhookPayload(newDispatch) });
                const webhookLog = makeLog('DEPOT_SYSTEM', 'WEBHOOK_TRIGGERED', '54.811.14', newDispatch.dispatchCode, 'WARNING',
                  `⚡ [SIMULASI] AUTO-WEBHOOK aktif: Pertalite Gajah Mada menyentuh ${newDispatch.triggerFillPercent}%.`);
                dispatch({ type: 'ADD_AUDIT_LOG', log: webhookLog });
              }
            }

            const log = makeLog('DEPOT_SYSTEM', 'CRISIS_SIMULATED', '54.811.14', 'SURGE_QUEUE', 'WARNING',
              `[SIMULASI JURI] Lonjakan antrean: Pertalite Gajah Mada dikurangi 1.500L → ${newLiters.toLocaleString('id-ID')}L (${fillPct.toFixed(1)}%). Mode: ${newMode}.`);
            dispatch({ type: 'ADD_AUDIT_LOG', log });
          }
          break;
        }

        case 'SIMULATE_HOARDING': {
          // Simulate hoarding attempt by DK 9991 XX at A. Yani
          const fakePlate = 'DK 9991 XX';
          const targetStation = state.stations.find((s) => s.id === 'spbu-a-yani');
          const log = makeLog('SECURITY_GUARD', 'HOARDING_BLOCKED', targetStation?.code ?? '54.811.15',
            fakePlate, 'CRITICAL',
            `🚫 [SIMULASI JURI] Plat ${fakePlate} mencoba isi Pertalite ke-2 di ${targetStation?.name}. ` +
              `Riwayat: SPBU Gajah Mada 07:15 WITA. DITOLAK otomatis.`);
          dispatch({ type: 'ADD_AUDIT_LOG', log });
          break;
        }

        case 'TANK_CRITICAL': {
          const tank = state.tanks.find(
            (t) => t.spbuId === spbuId && t.fuelType === 'Pertalite'
          );
          if (tank) {
            const criticalLiters = Math.round(tank.maxCapacityLiters * 0.05);
            dispatch({ type: 'UPDATE_TANK', tankId: tank.id, patch: { currentLiters: criticalLiters } });
            dispatch({ type: 'UPDATE_STATION', stationId: spbuId, patch: { operationalMode: 'EMERGENCY_ONLY' } });

            const log = makeLog('DEPOT_SYSTEM', 'CRISIS_SIMULATED', station?.code ?? '', 'TANK_CRITICAL', 'CRITICAL',
              `[SIMULASI JURI] Tangki Pertalite ${station?.name} dikuras ke 5% (${criticalLiters}L). Mode: EMERGENCY_ONLY.`);
            dispatch({ type: 'ADD_AUDIT_LOG', log });
          }
          break;
        }

        case 'FORCE_DISPATCH': {
          const tank = state.tanks.find(
            (t) => t.spbuId === spbuId && t.fuelType === 'Pertalite'
          );
          if (tank && station) {
            const newDispatch = evaluateAutoRestockWebhook(
              {
                id: tank.id,
                spbuId,
                spbuName: station.name,
                spbuCode: station.code,
                fuelType: 'Pertalite',
                currentLiters: 0, // Force trigger by passing 0
                maxCapacityLiters: tank.maxCapacityLiters,
              },
              state.dispatches
            ) ?? {
              id: `dispatch-${Date.now()}-sim`,
              dispatchCode: `DISP-SIM-${String(Date.now()).slice(-4)}`,
              spbuId,
              spbuName: station.name,
              spbuCode: station.code,
              fuelTankId: tank.id,
              fuelType: 'Pertalite',
              triggerSource: 'MANUAL_OPERATOR' as const,
              triggerFillPercent: (tank.currentLiters / tank.maxCapacityLiters) * 100,
              requestedLiters: 8000,
              status: 'PENDING_DISPATCH' as const,
              etaMinutes: 20,
              createdAt: new Date().toISOString(),
            };
            dispatch({ type: 'ADD_DISPATCH', dispatch: newDispatch });
            dispatch({ type: 'SET_WEBHOOK_PAYLOAD', payload: buildWebhookPayload(newDispatch) });

            const log = makeLog('DEPOT_SYSTEM', 'CRISIS_SIMULATED', station.code, newDispatch.dispatchCode, 'WARNING',
              `[SIMULASI JURI] Dispatch paksa ${newDispatch.dispatchCode} dibuat untuk ${station.name}. ETA: 20 menit.`);
            dispatch({ type: 'ADD_AUDIT_LOG', log });
          }
          break;
        }

        case 'FINISH_UNLOADING_BANYUASRI': {
          const banyuasri = state.stations.find((s) => s.id === 'spbu-banyuasri');
          const tank = state.tanks.find((t) => t.spbuId === 'spbu-banyuasri' && t.fuelType === 'Pertalite');
          if (banyuasri && tank) {
            const newLiters = Math.min(tank.maxCapacityLiters, tank.currentLiters + 8000);
            dispatch({
              type: 'UPDATE_TANK',
              tankId: tank.id,
              patch: { currentLiters: newLiters, unloadingMinutesLeft: 0, lastDoLiters: 8000 },
            });
            dispatch({
              type: 'UPDATE_STATION',
              stationId: 'spbu-banyuasri',
              patch: { operationalMode: 'NORMAL' },
            });

            const log = makeLog(
              'DEPOT_SYSTEM',
              'CRISIS_SIMULATED',
              banyuasri.code,
              'UNLOADING_FINISHED',
              'INFO',
              `[SIMULASI JURI] Truk tangki Pertamina selesai bongkar muat di SPBU Banyuasri (+8.000L). Mode operasional: NORMAL, seluruh nozel kembali aktif.`
            );
            dispatch({ type: 'ADD_AUDIT_LOG', log });
          }
          break;
        }

        case 'RESET_TO_SEED': {
          dispatch({ type: 'RESET_TO_SEED' });
          const log = makeLog(
            'DEPOT_SYSTEM',
            'SYSTEM_RESET',
            'ALL',
            'INIT_SEED',
            'INFO',
            `[SIMULASI JURI] Seluruh database relasional (SPBU, Tangki, Tiket, Dispatches) dikembalikan ke kondisi Seed awal.`
          );
          dispatch({ type: 'ADD_AUDIT_LOG', log });
          break;
        }
      }
    },
    [state.stations, state.tanks, state.dispatches]
  );

  // ---------------------------------------------------------------------------
  // ACTION: toggleSimulatedDateParity
  // ---------------------------------------------------------------------------

  const toggleSimulatedDateParity = useCallback(() => {
    dispatch({ type: 'TOGGLE_SIMULATED_DATE_PARITY' });

    const newIsOdd = state.simulatedDateIsOdd === null
      ? new Date().getDate() % 2 === 0  // will be inverted in reducer
      : !state.simulatedDateIsOdd;

    const log = makeLog(
      'DEPOT_SYSTEM',
      'PARITY_TOGGLED',
      'ALL',
      'SYSTEM',
      'INFO',
      `[SIMULASI JURI] Tanggal sistem diubah ke ${newIsOdd ? 'GANJIL' : 'GENAP'}. Aturan antrean diperbarui secara instan.`
    );
    dispatch({ type: 'ADD_AUDIT_LOG', log });
  }, [state.simulatedDateIsOdd]);

  // ---------------------------------------------------------------------------
  // APPLY ACCESSIBILITY SETTINGS TO <html> element
  // ---------------------------------------------------------------------------

  useEffect(() => {
    document.documentElement.style.fontSize =
      state.fontScale === 100 ? '16px' : state.fontScale === 115 ? '18.4px' : '20px';
    if (state.isHighContrast) {
      document.documentElement.classList.add('high-contrast');
    } else {
      document.documentElement.classList.remove('high-contrast');
    }
  }, [state.fontScale, state.isHighContrast]);

  // ---------------------------------------------------------------------------
  // CONTEXT VALUE
  // ---------------------------------------------------------------------------

  const value = useMemo<StoreContextValue>(
    () => ({
      state,
      getStation,
      getTanksForStation,
      getSlotsForTank,
      getTicketsForSlot,
      getEffectiveDate,
      getQuotaForTank,
      setActiveRole,
      setActiveOperator,
      setSelectedSpbu,
      setHighContrast,
      setFontScale,
      bookTimeSlot,
      verifyTicketQr,
      updateTankDoLiters,
      toggleSpbuPolicy,
      triggerDepotDispatch,
      simulateCrisisEvent,
      toggleSimulatedDateParity,
    }),
    [
      state,
      getStation,
      getTanksForStation,
      getSlotsForTank,
      getTicketsForSlot,
      getEffectiveDate,
      getQuotaForTank,
      setActiveRole,
      setActiveOperator,
      setSelectedSpbu,
      setHighContrast,
      setFontScale,
      bookTimeSlot,
      verifyTicketQr,
      updateTankDoLiters,
      toggleSpbuPolicy,
      triggerDepotDispatch,
      simulateCrisisEvent,
      toggleSimulatedDateParity,
    ]
  );

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

// ---------------------------------------------------------------------------
// HOOK
// ---------------------------------------------------------------------------

export function useStore(): StoreContextValue {
  const ctx = useContext(StoreContext);
  if (!ctx) {
    throw new Error('useStore() must be called within a <StoreProvider>.');
  }
  return ctx;
}
