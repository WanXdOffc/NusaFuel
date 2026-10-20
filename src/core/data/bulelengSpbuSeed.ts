// =============================================================================
// src/core/data/bulelengSpbuSeed.ts — NusaFuel Grid
// Realistic Seed Data — 4 SPBU Nyata di Kabupaten Buleleng, Bali
// Per PRD.md §6 — Each SPBU pre-loaded with a distinct operational state
// =============================================================================

import type { DispatchOrder } from '../automation/restockWebhook';

// ---------------------------------------------------------------------------
// TYPE DEFINITIONS (mirrors DATABASE_SCHEMA.sql)
// ---------------------------------------------------------------------------

export type FuelType = 'Pertalite' | 'Pertamax' | 'Solar';
export type OperationalMode = 'NORMAL' | 'THROTTLED' | 'UNLOADING' | 'EMERGENCY_ONLY';
export type PlateParity = 'ODD' | 'EVEN';
export type VehicleType = 'MOTOR' | 'MOBIL' | 'DARURAT';
export type TicketStatus = 'BOOKED' | 'COMPLETED' | 'BLOCKED_HOARDING';
export type ActorRole = 'PUBLIC_DRIVER' | 'SPBU_OPERATOR' | 'DEPOT_SYSTEM' | 'SECURITY_GUARD';
export type LogSeverity = 'INFO' | 'WARNING' | 'CRITICAL';

export interface SpbuStation {
  id: string;
  code: string;
  name: string;
  address: string;
  district: string;
  lat: number;
  lng: number;
  activeNozzles: number;
  oddEvenActive: boolean;
  dynamicThrottlingActive: boolean;
  emergencyReserveActive: boolean;
  operationalMode: OperationalMode;
  createdAt: string;
  updatedAt: string;
}

export interface FuelTank {
  id: string;
  spbuId: string;
  fuelType: FuelType;
  currentLiters: number;
  maxCapacityLiters: number;
  bookedLiters: number;
  burnRateLpm: number;
  unloadingMinutesLeft: number;
  lastDoLiters: number;
  createdAt: string;
  updatedAt: string;
}

export interface TimeSlot {
  id: string;
  spbuId: string;
  fuelTankId: string;
  slotDate: string;          // YYYY-MM-DD
  windowLabel: string;       // '07:00 - 07:30 WITA'
  windowStartHour: number;
  windowStartMinute: number;
  capacityLiters: number;
  bookedLiters: number;
  isLocked: boolean;
  createdAt: string;
}

export interface QueueTicket {
  id: string;
  ticketCode: string;
  spbuId: string;
  slotId: string;
  plateNumber: string;
  plateParity: PlateParity;
  vehicleType: VehicleType;
  fuelType: FuelType;
  quotaLiters: number;
  qrHash: string;
  status: TicketStatus;
  verifiedByOperator?: string;
  verifiedAt?: string;
  blockReason?: string;
  createdAt: string;
  // Derived / denormalized for display
  spbuName: string;
  slotWindowLabel: string;
}

export interface SecurityAuditLog {
  id: string;
  timestamp: string;
  actorRole: ActorRole;
  eventType: string;
  spbuCode: string;
  referenceId: string;
  severity: LogSeverity;
  message: string;
  metadataJson?: string;
}

// ---------------------------------------------------------------------------
// HELPERS
// ---------------------------------------------------------------------------

function ts(daysAgo = 0, hoursAgo = 0, minutesAgo = 0): string {
  const d = new Date();
  d.setDate(d.getDate() - daysAgo);
  d.setHours(d.getHours() - hoursAgo);
  d.setMinutes(d.getMinutes() - minutesAgo);
  return d.toISOString();
}

/** Returns today's date string YYYY-MM-DD */
function today(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

/** Returns tomorrow's date string YYYY-MM-DD */
function tomorrow(): string {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

// ---------------------------------------------------------------------------
// 1. SPBU STATIONS — 4 real Buleleng locations
// ---------------------------------------------------------------------------

export const SEED_SPBU_STATIONS: SpbuStation[] = [
  {
    id: 'spbu-gajah-mada',
    code: '54.811.14',
    name: 'SPBU Pertamina Gajah Mada',
    address: 'Jl. Gajah Mada, Banjar Jawa, Kec. Buleleng',
    district: 'Buleleng',
    lat: -8.1189,
    lng: 115.0911,
    activeNozzles: 4,
    oddEvenActive: true,
    dynamicThrottlingActive: true,
    emergencyReserveActive: true,
    // PRD §6.1: THROTTLED state — Pertalite below 30%
    operationalMode: 'THROTTLED',
    createdAt: ts(30),
    updatedAt: ts(0, 2),
  },
  {
    id: 'spbu-a-yani',
    code: '54.811.15',
    name: 'SPBU Pertamina A. Yani',
    address: 'Jl. Jenderal Ahmad Yani No. 94, Kaliuntu, Kec. Buleleng',
    district: 'Buleleng',
    lat: -8.1147,
    lng: 115.0825,
    activeNozzles: 6,
    oddEvenActive: true,
    dynamicThrottlingActive: false,
    emergencyReserveActive: true,
    // PRD §6.2: NORMAL state — stok aman
    operationalMode: 'NORMAL',
    createdAt: ts(30),
    updatedAt: ts(0, 1),
  },
  {
    id: 'spbu-sukasada',
    code: '54.811.02',
    name: 'SPBU Pertamina Sukasada',
    address: 'Jl. Jelantik Gingsir, Sukasada, Kec. Sukasada',
    district: 'Sukasada',
    lat: -8.1342,
    lng: 115.1035,
    activeNozzles: 3,
    oddEvenActive: true,
    dynamicThrottlingActive: true,
    emergencyReserveActive: true,
    // PRD §6.3: THROTTLED + Auto-Webhook Triggered (Pertalite <20%)
    operationalMode: 'THROTTLED',
    createdAt: ts(30),
    updatedAt: ts(0, 0, 30),
  },
  {
    id: 'spbu-banyuasri',
    code: '54.811.08',
    name: 'SPBU Pertamina Banyuasri',
    address: 'Jl. Ahmad Yani Barat, Banyuasri, Kec. Buleleng',
    district: 'Buleleng',
    lat: -8.1135,
    lng: 115.0718,
    activeNozzles: 4,
    oddEvenActive: true,
    dynamicThrottlingActive: false,
    emergencyReserveActive: true,
    // PRD §6.4: UNLOADING — truk tangki sedang bongkar muat (countdown 15 menit)
    operationalMode: 'UNLOADING',
    createdAt: ts(30),
    updatedAt: ts(0, 0, 15),
  },
];

// ---------------------------------------------------------------------------
// 2. FUEL TANKS — per PRD §6 tank volumes
// ---------------------------------------------------------------------------

export const SEED_FUEL_TANKS: FuelTank[] = [
  // --- SPBU Gajah Mada (THROTTLED: Pertalite 2100/8000) ---
  {
    id: 'tank-gajah-mada-pertalite',
    spbuId: 'spbu-gajah-mada',
    fuelType: 'Pertalite',
    currentLiters: 2100,
    maxCapacityLiters: 8000,
    bookedLiters: 240,
    burnRateLpm: 1.4,
    unloadingMinutesLeft: 0,
    lastDoLiters: 8000,
    createdAt: ts(30),
    updatedAt: ts(0, 2),
  },
  {
    id: 'tank-gajah-mada-pertamax',
    spbuId: 'spbu-gajah-mada',
    fuelType: 'Pertamax',
    currentLiters: 5600,
    maxCapacityLiters: 8000,
    bookedLiters: 80,
    burnRateLpm: 0.6,
    unloadingMinutesLeft: 0,
    lastDoLiters: 8000,
    createdAt: ts(30),
    updatedAt: ts(0, 2),
  },
  {
    id: 'tank-gajah-mada-solar',
    spbuId: 'spbu-gajah-mada',
    fuelType: 'Solar',
    currentLiters: 3900,
    maxCapacityLiters: 8000,
    bookedLiters: 60,
    burnRateLpm: 0.8,
    unloadingMinutesLeft: 0,
    lastDoLiters: 8000,
    createdAt: ts(30),
    updatedAt: ts(0, 2),
  },

  // --- SPBU A. Yani (NORMAL: Pertalite 6850/10000) ---
  {
    id: 'tank-a-yani-pertalite',
    spbuId: 'spbu-a-yani',
    fuelType: 'Pertalite',
    currentLiters: 6850,
    maxCapacityLiters: 10000,
    bookedLiters: 310,
    burnRateLpm: 1.8,
    unloadingMinutesLeft: 0,
    lastDoLiters: 10000,
    createdAt: ts(30),
    updatedAt: ts(0, 1),
  },
  {
    id: 'tank-a-yani-pertamax',
    spbuId: 'spbu-a-yani',
    fuelType: 'Pertamax',
    currentLiters: 7200,
    maxCapacityLiters: 10000,
    bookedLiters: 120,
    burnRateLpm: 0.9,
    unloadingMinutesLeft: 0,
    lastDoLiters: 10000,
    createdAt: ts(30),
    updatedAt: ts(0, 1),
  },
  {
    id: 'tank-a-yani-solar',
    spbuId: 'spbu-a-yani',
    fuelType: 'Solar',
    currentLiters: 4500,
    maxCapacityLiters: 8000,
    bookedLiters: 90,
    burnRateLpm: 1.0,
    unloadingMinutesLeft: 0,
    lastDoLiters: 8000,
    createdAt: ts(30),
    updatedAt: ts(0, 1),
  },

  // --- SPBU Sukasada (THROTTLED + AUTO-WEBHOOK: Pertalite 1350/8000 = 16.9%) ---
  {
    id: 'tank-sukasada-pertalite',
    spbuId: 'spbu-sukasada',
    fuelType: 'Pertalite',
    currentLiters: 1350,
    maxCapacityLiters: 8000,
    bookedLiters: 180,
    burnRateLpm: 1.1,
    unloadingMinutesLeft: 0,
    lastDoLiters: 8000,
    createdAt: ts(30),
    updatedAt: ts(0, 0, 30),
  },
  {
    id: 'tank-sukasada-pertamax',
    spbuId: 'spbu-sukasada',
    fuelType: 'Pertamax',
    currentLiters: 4100,
    maxCapacityLiters: 8000,
    bookedLiters: 40,
    burnRateLpm: 0.5,
    unloadingMinutesLeft: 0,
    lastDoLiters: 8000,
    createdAt: ts(30),
    updatedAt: ts(0, 0, 30),
  },

  // --- SPBU Banyuasri (UNLOADING: Pertalite 7800/8000, timer 15 menit) ---
  {
    id: 'tank-banyuasri-pertalite',
    spbuId: 'spbu-banyuasri',
    fuelType: 'Pertalite',
    currentLiters: 7800,
    maxCapacityLiters: 8000,
    bookedLiters: 0,
    burnRateLpm: 0,
    unloadingMinutesLeft: 15, // Countdown timer active
    lastDoLiters: 8000,
    createdAt: ts(30),
    updatedAt: ts(0, 0, 15),
  },
  {
    id: 'tank-banyuasri-pertamax',
    spbuId: 'spbu-banyuasri',
    fuelType: 'Pertamax',
    currentLiters: 6000,
    maxCapacityLiters: 8000,
    bookedLiters: 60,
    burnRateLpm: 0.7,
    unloadingMinutesLeft: 0,
    lastDoLiters: 8000,
    createdAt: ts(30),
    updatedAt: ts(0, 0, 15),
  },
  {
    id: 'tank-banyuasri-solar',
    spbuId: 'spbu-banyuasri',
    fuelType: 'Solar',
    currentLiters: 5100,
    maxCapacityLiters: 8000,
    bookedLiters: 120,
    burnRateLpm: 0.9,
    unloadingMinutesLeft: 0,
    lastDoLiters: 8000,
    createdAt: ts(30),
    updatedAt: ts(0, 0, 15),
  },
];

// ---------------------------------------------------------------------------
// 3. TIME SLOTS — 30-minute windows for today and tomorrow
//    Each active Pertalite tank gets slots from 07:00 to 17:00 WITA
// ---------------------------------------------------------------------------

function buildSlots(
  spbuId: string,
  tankId: string,
  date: string,
  capacityPerSlot: number,
  existingBookings: Array<{ hour: number; minute: number; bookedLiters: number }>
): TimeSlot[] {
  const slots: TimeSlot[] = [];
  const windows = [
    { h: 7, m: 0 }, { h: 7, m: 30 },
    { h: 8, m: 0 }, { h: 8, m: 30 },
    { h: 9, m: 0 }, { h: 9, m: 30 },
    { h: 10, m: 0 }, { h: 10, m: 30 },
    { h: 11, m: 0 }, { h: 11, m: 30 },
    { h: 13, m: 0 }, { h: 13, m: 30 },
    { h: 14, m: 0 }, { h: 14, m: 30 },
    { h: 15, m: 0 }, { h: 15, m: 30 },
    { h: 16, m: 0 }, { h: 16, m: 30 },
  ];

  for (const { h, m } of windows) {
    const hStr = String(h).padStart(2, '0');
    const mStr = String(m).padStart(2, '0');
    const endH = m === 30 ? h + 1 : h;
    const endM = m === 30 ? 0 : 30;
    const eHStr = String(endH).padStart(2, '0');
    const eMStr = String(endM).padStart(2, '0');

    const existing = existingBookings.find((b) => b.hour === h && b.minute === m);
    const bookedLiters = existing ? existing.bookedLiters : 0;

    slots.push({
      id: `slot-${spbuId}-${tankId}-${date}-${hStr}${mStr}`,
      spbuId,
      fuelTankId: tankId,
      slotDate: date,
      windowLabel: `${hStr}:${mStr} - ${eHStr}:${eMStr} WITA`,
      windowStartHour: h,
      windowStartMinute: m,
      capacityLiters: capacityPerSlot,
      bookedLiters,
      isLocked: bookedLiters >= capacityPerSlot,
      createdAt: ts(0, 12),
    });
  }
  return slots;
}

export const SEED_TIME_SLOTS: TimeSlot[] = [
  // Gajah Mada — Pertalite — today (THROTTLED: smaller capacity)
  ...buildSlots('spbu-gajah-mada', 'tank-gajah-mada-pertalite', today(), 90, [
    { hour: 7, minute: 0, bookedLiters: 90 },   // LOCKED
    { hour: 7, minute: 30, bookedLiters: 75 },
    { hour: 8, minute: 0, bookedLiters: 60 },
    { hour: 13, minute: 0, bookedLiters: 30 },
  ]),
  // Gajah Mada — Pertalite — tomorrow (pre-bookings from mismatched plates)
  ...buildSlots('spbu-gajah-mada', 'tank-gajah-mada-pertalite', tomorrow(), 90, [
    { hour: 7, minute: 0, bookedLiters: 20 },
    { hour: 9, minute: 0, bookedLiters: 15 },
  ]),

  // A. Yani — Pertalite — today (NORMAL)
  ...buildSlots('spbu-a-yani', 'tank-a-yani-pertalite', today(), 200, [
    { hour: 7, minute: 0, bookedLiters: 140 },
    { hour: 7, minute: 30, bookedLiters: 120 },
    { hour: 8, minute: 0, bookedLiters: 80 },
    { hour: 13, minute: 0, bookedLiters: 60 },
    { hour: 14, minute: 0, bookedLiters: 40 },
  ]),
  // A. Yani — Pertalite — tomorrow
  ...buildSlots('spbu-a-yani', 'tank-a-yani-pertalite', tomorrow(), 200, [
    { hour: 7, minute: 0, bookedLiters: 30 },
  ]),

  // Sukasada — Pertalite — today (CRITICAL: very limited capacity)
  ...buildSlots('spbu-sukasada', 'tank-sukasada-pertalite', today(), 60, [
    { hour: 7, minute: 0, bookedLiters: 60 },   // LOCKED
    { hour: 7, minute: 30, bookedLiters: 60 },  // LOCKED
    { hour: 8, minute: 0, bookedLiters: 60 },   // LOCKED
    { hour: 8, minute: 30, bookedLiters: 45 },
  ]),

  // Banyuasri — Pertalite — today (UNLOADING — no bookings while unloading)
  ...buildSlots('spbu-banyuasri', 'tank-banyuasri-pertalite', today(), 160, []),
  // Banyuasri — Pertalite — tomorrow
  ...buildSlots('spbu-banyuasri', 'tank-banyuasri-pertalite', tomorrow(), 160, [
    { hour: 7, minute: 0, bookedLiters: 10 },
  ]),
];

// ---------------------------------------------------------------------------
// 4. QUEUE TICKETS — Pre-seeded examples showing different states
// ---------------------------------------------------------------------------

export const SEED_QUEUE_TICKETS: QueueTicket[] = [
  // COMPLETED ticket — Gajah Mada, motor, Pertalite
  {
    id: 'ticket-001',
    ticketCode: 'NFG-81114-001',
    spbuId: 'spbu-gajah-mada',
    slotId: `slot-spbu-gajah-mada-tank-gajah-mada-pertalite-${today()}-0700`,
    plateNumber: 'DK 4821 FB',
    plateParity: 'ODD',
    vehicleType: 'MOTOR',
    fuelType: 'Pertalite',
    quotaLiters: 3,
    qrHash: 'A1B2C3D4E5F6A7B8C9D0E1F2A3B4C5D6',
    status: 'COMPLETED',
    verifiedByOperator: 'operator-gajah-mada',
    verifiedAt: ts(0, 3),
    createdAt: ts(0, 4),
    spbuName: 'SPBU Pertamina Gajah Mada',
    slotWindowLabel: '07:00 - 07:30 WITA',
  },
  // COMPLETED ticket — Gajah Mada, mobil, Pertalite (throttled: 10L)
  {
    id: 'ticket-002',
    ticketCode: 'NFG-81114-002',
    spbuId: 'spbu-gajah-mada',
    slotId: `slot-spbu-gajah-mada-tank-gajah-mada-pertalite-${today()}-0700`,
    plateNumber: 'DK 1234 AB',
    plateParity: 'EVEN',
    vehicleType: 'MOBIL',
    fuelType: 'Pertalite',
    quotaLiters: 10,
    qrHash: 'B2C3D4E5F6A7B8C9D0E1F2A3B4C5D6E7',
    status: 'COMPLETED',
    verifiedByOperator: 'operator-gajah-mada',
    verifiedAt: ts(0, 3, 5),
    createdAt: ts(0, 4, 10),
    spbuName: 'SPBU Pertamina Gajah Mada',
    slotWindowLabel: '07:00 - 07:30 WITA',
  },
  // BOOKED ticket — A. Yani, motor, Pertalite (active booking)
  {
    id: 'ticket-003',
    ticketCode: 'NFG-81115-001',
    spbuId: 'spbu-a-yani',
    slotId: `slot-spbu-a-yani-tank-a-yani-pertalite-${today()}-1300`,
    plateNumber: 'DK 7755 KL',
    plateParity: 'ODD',
    vehicleType: 'MOTOR',
    fuelType: 'Pertalite',
    quotaLiters: 3,
    qrHash: 'C3D4E5F6A7B8C9D0E1F2A3B4C5D6E7F8',
    status: 'BOOKED',
    createdAt: ts(0, 1),
    spbuName: 'SPBU Pertamina A. Yani',
    slotWindowLabel: '13:00 - 13:30 WITA',
  },
  // BOOKED ticket — A. Yani, mobil, Pertalite (active booking, normal quota: 20L)
  {
    id: 'ticket-004',
    ticketCode: 'NFG-81115-002',
    spbuId: 'spbu-a-yani',
    slotId: `slot-spbu-a-yani-tank-a-yani-pertalite-${today()}-1400`,
    plateNumber: 'B 5678 CD',
    plateParity: 'EVEN',
    vehicleType: 'MOBIL',
    fuelType: 'Pertalite',
    quotaLiters: 20,
    qrHash: 'D4E5F6A7B8C9D0E1F2A3B4C5D6E7F8A9',
    status: 'BOOKED',
    createdAt: ts(0, 0, 45),
    spbuName: 'SPBU Pertamina A. Yani',
    slotWindowLabel: '14:00 - 14:30 WITA',
  },
  // BLOCKED_HOARDING ticket — Sukasada (demo: plate DK 9991 XX tried cross-SPBU)
  {
    id: 'ticket-005',
    ticketCode: 'NFG-81102-001',
    spbuId: 'spbu-sukasada',
    slotId: `slot-spbu-sukasada-tank-sukasada-pertalite-${today()}-0800`,
    plateNumber: 'DK 9991 XX',
    plateParity: 'ODD',
    vehicleType: 'MOTOR',
    fuelType: 'Pertalite',
    quotaLiters: 3,
    qrHash: 'E5F6A7B8C9D0E1F2A3B4C5D6E7F8A9B0',
    status: 'BLOCKED_HOARDING',
    blockReason:
      'Plat DK 9991 XX sudah mengisi Pertalite (3L) di SPBU Pertamina Gajah Mada pukul 07:15 WITA. Pemblokiran anti-ngangsu otomatis aktif.',
    createdAt: ts(0, 1, 30),
    spbuName: 'SPBU Pertamina Sukasada',
    slotWindowLabel: '08:00 - 08:30 WITA',
  },
  // COMPLETED ticket at Gajah Mada for the same plate (DK 9991 XX) — the earlier fill
  {
    id: 'ticket-006',
    ticketCode: 'NFG-81114-003',
    spbuId: 'spbu-gajah-mada',
    slotId: `slot-spbu-gajah-mada-tank-gajah-mada-pertalite-${today()}-0730`,
    plateNumber: 'DK 9991 XX',
    plateParity: 'ODD',
    vehicleType: 'MOTOR',
    fuelType: 'Pertalite',
    quotaLiters: 3,
    qrHash: 'F6A7B8C9D0E1F2A3B4C5D6E7F8A9B0C1',
    status: 'COMPLETED',
    verifiedByOperator: 'operator-gajah-mada',
    verifiedAt: ts(0, 2),
    createdAt: ts(0, 2, 30),
    spbuName: 'SPBU Pertamina Gajah Mada',
    slotWindowLabel: '07:30 - 08:00 WITA',
  },
  // BOOKED H+1 ticket — Gajah Mada (plate with wrong parity booked for tomorrow)
  {
    id: 'ticket-007',
    ticketCode: 'NFG-81114-004',
    spbuId: 'spbu-gajah-mada',
    slotId: `slot-spbu-gajah-mada-tank-gajah-mada-pertalite-${tomorrow()}-0900`,
    plateNumber: 'DK 2288 MN',
    plateParity: 'EVEN',
    vehicleType: 'MOTOR',
    fuelType: 'Pertalite',
    quotaLiters: 3,
    qrHash: 'A7B8C9D0E1F2A3B4C5D6E7F8A9B0C1D2',
    status: 'BOOKED',
    createdAt: ts(0, 0, 20),
    spbuName: 'SPBU Pertamina Gajah Mada',
    slotWindowLabel: '09:00 - 09:30 WITA',
  },
  // BOOKED DARURAT ticket — Banyuasri (emergency vehicle, bypasses odd-even)
  {
    id: 'ticket-008',
    ticketCode: 'NFG-81108-001',
    spbuId: 'spbu-banyuasri',
    slotId: `slot-spbu-banyuasri-tank-banyuasri-pertalite-${today()}-1300`,
    plateNumber: 'DK 0001 RSE',
    plateParity: 'ODD',
    vehicleType: 'DARURAT',
    fuelType: 'Pertalite',
    quotaLiters: 30,
    qrHash: 'B8C9D0E1F2A3B4C5D6E7F8A9B0C1D2E3',
    status: 'BOOKED',
    createdAt: ts(0, 0, 5),
    spbuName: 'SPBU Pertamina Banyuasri',
    slotWindowLabel: '13:00 - 13:30 WITA',
  },
];

// ---------------------------------------------------------------------------
// 5. RESTOCK DISPATCHES — Pre-seeded for Sukasada (auto-webhook) and Banyuasri
// ---------------------------------------------------------------------------

export const SEED_RESTOCK_DISPATCHES: DispatchOrder[] = [
  // Sukasada: Auto-webhook triggered (Pertalite at 16.9%) — IN_TRANSIT
  {
    id: 'dispatch-sukasada-001',
    dispatchCode: 'DISP-8002-0001',
    spbuId: 'spbu-sukasada',
    spbuName: 'SPBU Pertamina Sukasada',
    spbuCode: '54.811.02',
    fuelTankId: 'tank-sukasada-pertalite',
    fuelType: 'Pertalite',
    triggerSource: 'AUTO_WEBHOOK_LOW_TANK',
    triggerFillPercent: 16.9,
    requestedLiters: 8000,
    status: 'IN_TRANSIT',
    etaMinutes: 18,
    createdAt: ts(0, 0, 25),
    dispatchedAt: ts(0, 0, 22),
  },
  // Banyuasri: Manual operator dispatch (triggered before unloading started)
  {
    id: 'dispatch-banyuasri-001',
    dispatchCode: 'DISP-8108-0001',
    spbuId: 'spbu-banyuasri',
    spbuName: 'SPBU Pertamina Banyuasri',
    spbuCode: '54.811.08',
    fuelTankId: 'tank-banyuasri-pertalite',
    fuelType: 'Pertalite',
    triggerSource: 'MANUAL_OPERATOR',
    triggerFillPercent: 38.5,
    requestedLiters: 8000,
    status: 'DELIVERED',
    etaMinutes: 20,
    createdAt: ts(0, 1, 30),
    dispatchedAt: ts(0, 1, 25),
    deliveredAt: ts(0, 0, 15),
  },
  // Gajah Mada: Auto-webhook triggered earlier (now DELIVERED)
  {
    id: 'dispatch-gajah-mada-001',
    dispatchCode: 'DISP-8114-0001',
    spbuId: 'spbu-gajah-mada',
    spbuName: 'SPBU Pertamina Gajah Mada',
    spbuCode: '54.811.14',
    fuelTankId: 'tank-gajah-mada-pertalite',
    fuelType: 'Pertalite',
    triggerSource: 'AUTO_WEBHOOK_LOW_TANK',
    triggerFillPercent: 18.2,
    requestedLiters: 8000,
    status: 'DELIVERED',
    etaMinutes: 20,
    createdAt: ts(1, 4),
    dispatchedAt: ts(1, 3, 45),
    deliveredAt: ts(1, 3, 20),
  },
];

// ---------------------------------------------------------------------------
// 6. SECURITY AUDIT LOGS — Pre-seeded audit trail
// ---------------------------------------------------------------------------

export const SEED_SECURITY_AUDIT_LOGS: SecurityAuditLog[] = [
  {
    id: 'log-001',
    timestamp: ts(0, 4, 10),
    actorRole: 'PUBLIC_DRIVER',
    eventType: 'SLOT_BOOKED',
    spbuCode: '54.811.14',
    referenceId: 'NFG-81114-001',
    severity: 'INFO',
    message: 'Tiket NFG-81114-001 diterbitkan untuk DK 4821 FB (Motor, 3L Pertalite) — Slot 07:00 WITA.',
  },
  {
    id: 'log-002',
    timestamp: ts(0, 4),
    actorRole: 'SPBU_OPERATOR',
    eventType: 'QR_VERIFIED',
    spbuCode: '54.811.14',
    referenceId: 'NFG-81114-001',
    severity: 'INFO',
    message: 'Tiket NFG-81114-001 (DK 4821 FB) diverifikasi kasir. Stok Pertalite berkurang 3L → 2.103L.',
  },
  {
    id: 'log-003',
    timestamp: ts(0, 3, 5),
    actorRole: 'SPBU_OPERATOR',
    eventType: 'QR_VERIFIED',
    spbuCode: '54.811.14',
    referenceId: 'NFG-81114-002',
    severity: 'INFO',
    message: 'Tiket NFG-81114-002 (DK 1234 AB, Mobil) diverifikasi. Stok Pertalite berkurang 10L (Throttled).',
  },
  {
    id: 'log-004',
    timestamp: ts(0, 2, 30),
    actorRole: 'SECURITY_GUARD',
    eventType: 'HOARDING_BLOCKED',
    spbuCode: '54.811.02',
    referenceId: 'NFG-81102-001',
    severity: 'CRITICAL',
    message: '🚫 HOARDING TERDETEKSI: Plat DK 9991 XX mencoba mengisi Pertalite ke-2 di SPBU Sukasada. Riwayat: Gajah Mada 07:15 WITA (3L). Transaksi ditolak otomatis.',
    metadataJson: JSON.stringify({
      plateNumber: 'DK 9991 XX',
      previousSpbu: 'SPBU Pertamina Gajah Mada',
      previousTime: ts(0, 2),
      previousLiters: 3,
    }),
  },
  {
    id: 'log-005',
    timestamp: ts(0, 0, 25),
    actorRole: 'DEPOT_SYSTEM',
    eventType: 'WEBHOOK_TRIGGERED',
    spbuCode: '54.811.02',
    referenceId: 'DISP-8002-0001',
    severity: 'WARNING',
    message: '⚡ AUTO-WEBHOOK: Tangki Pertalite SPBU Sukasada menyentuh 16.9% (<20%). Dispatch DISP-8002-0001 dikirim otomatis ke Depot. ETA: 18 menit.',
    metadataJson: JSON.stringify({
      triggerFillPercent: 16.9,
      requestedLiters: 8000,
      dispatchCode: 'DISP-8002-0001',
    }),
  },
  {
    id: 'log-006',
    timestamp: ts(0, 1, 30),
    actorRole: 'SPBU_OPERATOR',
    eventType: 'DO_UPDATED',
    spbuCode: '54.811.08',
    referenceId: 'DISP-8108-0001',
    severity: 'INFO',
    message: 'Operator Banyuasri memulai bongkar muat DO Pertalite +8.000L. Timer countdown 15 menit aktif. Pompa ditutup sementara.',
  },
  {
    id: 'log-007',
    timestamp: ts(0, 2),
    actorRole: 'SPBU_OPERATOR',
    eventType: 'POLICY_CHANGED',
    spbuCode: '54.811.14',
    referenceId: 'spbu-gajah-mada',
    severity: 'WARNING',
    message: 'Operator Gajah Mada mengaktifkan Dynamic Throttling (stok Pertalite 26.25%). Kuota Mobil dipangkas: 20L → 10L.',
  },
  {
    id: 'log-008',
    timestamp: ts(0, 0, 20),
    actorRole: 'PUBLIC_DRIVER',
    eventType: 'SLOT_BOOKED',
    spbuCode: '54.811.14',
    referenceId: 'NFG-81114-004',
    severity: 'INFO',
    message: 'Tiket NFG-81114-004 H+1 diterbitkan untuk DK 2288 MN (Motor, Pertalite). Plat Genap dialihkan ke slot besok 09:00 WITA.',
  },
];

// ---------------------------------------------------------------------------
// EXPORT: Combined seed bundle for store.tsx initialization
// ---------------------------------------------------------------------------

export interface SeedBundle {
  stations: SpbuStation[];
  tanks: FuelTank[];
  slots: TimeSlot[];
  tickets: QueueTicket[];
  dispatches: DispatchOrder[];
  auditLogs: SecurityAuditLog[];
}

export const BULELENG_SEED: SeedBundle = {
  stations: SEED_SPBU_STATIONS,
  tanks: SEED_FUEL_TANKS,
  slots: SEED_TIME_SLOTS,
  tickets: SEED_QUEUE_TICKETS,
  dispatches: SEED_RESTOCK_DISPATCHES,
  auditLogs: SEED_SECURITY_AUDIT_LOGS,
};
