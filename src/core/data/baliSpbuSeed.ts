// =============================================================================
// src/core/data/baliSpbuSeed.ts — NusaFuel Grid
// Comprehensive Regional Seed Data — 9 Kabupaten & Kota di Seluruh Provinsi Bali
// Accurate Leaflet GPS Coordinates & Real-World SPBU Codes
// =============================================================================

import type { DispatchOrder } from '../automation/restockWebhook';

// ---------------------------------------------------------------------------
// TYPE DEFINITIONS
// ---------------------------------------------------------------------------

export type FuelType = 'Pertalite' | 'Pertamax' | 'Solar';
export type OperationalMode = 'NORMAL' | 'THROTTLED' | 'UNLOADING' | 'EMERGENCY_ONLY' | 'CRITICAL';
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
  regency: string; // 9 Kabupaten/Kota di Bali
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
// DATE HELPERS
// ---------------------------------------------------------------------------

function ts(daysAgo = 0, hoursAgo = 0, minutesAgo = 0): string {
  const d = new Date();
  d.setDate(d.getDate() - daysAgo);
  d.setHours(d.getHours() - hoursAgo);
  d.setMinutes(d.getMinutes() - minutesAgo);
  return d.toISOString();
}

function today(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function tomorrow(): string {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

// ---------------------------------------------------------------------------
// 1. SPBU STATIONS — 9 KABUPATEN / KOTA DI SELURUH PROVINSI BALI (11 SPBU)
// ---------------------------------------------------------------------------

export const SEED_BALI_SPBU_STATIONS: SpbuStation[] = [
  // 1) BULELENG — SPBU 54.811.14 Gajah Mada (THROTTLED: Stok < 30%)
  {
    id: 'spbu-buleleng-gajah-mada',
    code: '54.811.14',
    name: 'SPBU 54.811.14 Gajah Mada Singaraja',
    address: 'Jl. Gajah Mada No. 14, Banjar Jawa, Buleleng',
    district: 'Buleleng',
    regency: 'Buleleng',
    lat: -8.1189,
    lng: 115.0911,
    activeNozzles: 6,
    oddEvenActive: true,
    dynamicThrottlingActive: true,
    emergencyReserveActive: true,
    operationalMode: 'THROTTLED',
    createdAt: ts(30),
    updatedAt: ts(0, 0, 5),
  },
  // 1) BULELENG — SPBU 54.811.15 Ahmad Yani (NORMAL)
  {
    id: 'spbu-buleleng-ahmad-yani',
    code: '54.811.15',
    name: 'SPBU 54.811.15 Ahmad Yani Singaraja',
    address: 'Jl. Ahmad Yani No. 88, Kaliuntu, Buleleng',
    district: 'Buleleng',
    regency: 'Buleleng',
    lat: -8.1165,
    lng: 115.0768,
    activeNozzles: 8,
    oddEvenActive: true,
    dynamicThrottlingActive: true,
    emergencyReserveActive: true,
    operationalMode: 'NORMAL',
    createdAt: ts(30),
    updatedAt: ts(0, 0, 12),
  },

  // 2) DENPASAR — SPBU 54.801.12 Hayam Wuruk (NORMAL)
  {
    id: 'spbu-denpasar-hayam-wuruk',
    code: '54.801.12',
    name: 'SPBU 54.801.12 Hayam Wuruk Denpasar',
    address: 'Jl. Hayam Wuruk No. 178, Panjer, Denpasar Selatan',
    district: 'Denpasar Selatan',
    regency: 'Kota Denpasar',
    lat: -8.6658,
    lng: 115.2348,
    activeNozzles: 8,
    oddEvenActive: true,
    dynamicThrottlingActive: true,
    emergencyReserveActive: true,
    operationalMode: 'NORMAL',
    createdAt: ts(60),
    updatedAt: ts(0, 0, 8),
  },
  // 2) DENPASAR — SPBU 54.802.09 Teuku Umar (THROTTLED)
  {
    id: 'spbu-denpasar-teuku-umar',
    code: '54.802.09',
    name: 'SPBU 54.802.09 Teuku Umar Denpasar',
    address: 'Jl. Teuku Umar No. 120, Dauh Puri Kauh, Denpasar Barat',
    district: 'Denpasar Barat',
    regency: 'Kota Denpasar',
    lat: -8.6756,
    lng: 115.2045,
    activeNozzles: 6,
    oddEvenActive: true,
    dynamicThrottlingActive: true,
    emergencyReserveActive: true,
    operationalMode: 'THROTTLED',
    createdAt: ts(45),
    updatedAt: ts(0, 0, 3),
  },

  // 3) BADUNG — SPBU 54.803.01 Sunset Road Kuta (NORMAL)
  {
    id: 'spbu-badung-sunset-road',
    code: '54.803.01',
    name: 'SPBU 54.803.01 Sunset Road Kuta',
    address: 'Jl. Sunset Road No. 99, Seminyak, Kuta, Badung',
    district: 'Kuta',
    regency: 'Badung',
    lat: -8.7061,
    lng: 115.1788,
    activeNozzles: 10,
    oddEvenActive: true,
    dynamicThrottlingActive: true,
    emergencyReserveActive: true,
    operationalMode: 'NORMAL',
    createdAt: ts(90),
    updatedAt: ts(0, 0, 15),
  },
  // 3) BADUNG — SPBU 54.803.14 Mengwi (CRITICAL / EMERGENCY_ONLY)
  {
    id: 'spbu-badung-mengwi',
    code: '54.803.14',
    name: 'SPBU 54.803.14 Mengwi Badung',
    address: 'Jl. Raya Denpasar-Singaraja Km 16, Mengwi, Badung',
    district: 'Mengwi',
    regency: 'Badung',
    lat: -8.5432,
    lng: 115.1705,
    activeNozzles: 6,
    oddEvenActive: true,
    dynamicThrottlingActive: true,
    emergencyReserveActive: true,
    operationalMode: 'EMERGENCY_ONLY',
    createdAt: ts(40),
    updatedAt: ts(0, 0, 2),
  },

  // 4) GIANYAR — SPBU 54.805.04 Bypass Dharma Giri (NORMAL)
  {
    id: 'spbu-gianyar-dharma-giri',
    code: '54.805.04',
    name: 'SPBU 54.805.04 Bypass Dharma Giri Gianyar',
    address: 'Jl. Bypass Dharma Giri, Buruan, Blahbatuh, Gianyar',
    district: 'Blahbatuh',
    regency: 'Gianyar',
    lat: -8.5471,
    lng: 115.3340,
    activeNozzles: 6,
    oddEvenActive: true,
    dynamicThrottlingActive: true,
    emergencyReserveActive: true,
    operationalMode: 'NORMAL',
    createdAt: ts(35),
    updatedAt: ts(0, 0, 20),
  },

  // 5) TABANAN — SPBU 54.821.03 Bypass Ir. Soekarno (NORMAL)
  {
    id: 'spbu-tabanan-soekarno',
    code: '54.821.03',
    name: 'SPBU 54.821.03 Bypass Ir. Soekarno Tabanan',
    address: 'Jl. Bypass Ir. Soekarno No. 45, Kediri, Tabanan',
    district: 'Kediri',
    regency: 'Tabanan',
    lat: -8.5392,
    lng: 115.1235,
    activeNozzles: 8,
    oddEvenActive: true,
    dynamicThrottlingActive: true,
    emergencyReserveActive: true,
    operationalMode: 'NORMAL',
    createdAt: ts(50),
    updatedAt: ts(0, 0, 10),
  },

  // 6) JEMBRANA — SPBU 54.822.01 Jalan Sudirman Negara (THROTTLED)
  {
    id: 'spbu-jembrana-sudirman',
    code: '54.822.01',
    name: 'SPBU 54.822.01 Jalan Sudirman Negara',
    address: 'Jl. Jenderal Sudirman No. 22, Pendem, Negara, Jembrana',
    district: 'Negara',
    regency: 'Jembrana',
    lat: -8.3582,
    lng: 114.6247,
    activeNozzles: 6,
    oddEvenActive: true,
    dynamicThrottlingActive: true,
    emergencyReserveActive: true,
    operationalMode: 'THROTTLED',
    createdAt: ts(60),
    updatedAt: ts(0, 0, 18),
  },

  // 7) KARANGASEM — SPBU 54.808.02 Subagan Amlapura (UNLOADING: Dekat Depot Manggis)
  {
    id: 'spbu-karangasem-subagan',
    code: '54.808.02',
    name: 'SPBU 54.808.02 Subagan Amlapura',
    address: 'Jl. Ahmad Yani, Subagan, Karangasem (Koridor Depot Manggis)',
    district: 'Karangasem',
    regency: 'Karangasem',
    lat: -8.4552,
    lng: 115.6021,
    activeNozzles: 8,
    oddEvenActive: true,
    dynamicThrottlingActive: true,
    emergencyReserveActive: true,
    operationalMode: 'UNLOADING',
    createdAt: ts(75),
    updatedAt: ts(0, 0, 1),
  },

  // 8) KLUNGKUNG — SPBU 54.807.01 Bypass Ida Bagus Mantra (NORMAL)
  {
    id: 'spbu-klungkung-mantra',
    code: '54.807.01',
    name: 'SPBU 54.807.01 Bypass Ida Bagus Mantra',
    address: 'Jl. Prof. Dr. Ida Bagus Mantra, Gunaksa, Dawan, Klungkung',
    district: 'Dawan',
    regency: 'Klungkung',
    lat: -8.5528,
    lng: 115.4051,
    activeNozzles: 6,
    oddEvenActive: true,
    dynamicThrottlingActive: true,
    emergencyReserveActive: true,
    operationalMode: 'NORMAL',
    createdAt: ts(40),
    updatedAt: ts(0, 0, 14),
  },

  // 9) BANGLI — SPBU 54.806.01 Jalan Brigjen Ngurah Rai (NORMAL)
  {
    id: 'spbu-bangli-ngurah-rai',
    code: '54.806.01',
    name: 'SPBU 54.806.01 Jalan Brigjen Ngurah Rai Bangli',
    address: 'Jl. Brigjen Ngurah Rai No. 71, Kawan, Bangli',
    district: 'Bangli',
    regency: 'Bangli',
    lat: -8.4541,
    lng: 115.3556,
    activeNozzles: 6,
    oddEvenActive: true,
    dynamicThrottlingActive: true,
    emergencyReserveActive: true,
    operationalMode: 'NORMAL',
    createdAt: ts(55),
    updatedAt: ts(0, 0, 22),
  },
];

// ---------------------------------------------------------------------------
// 2. FUEL TANKS — 3 Tanks per SPBU (Pertalite, Pertamax, Solar)
// ---------------------------------------------------------------------------

export const SEED_BALI_FUEL_TANKS: FuelTank[] = [
  // 1. SPBU Buleleng Gajah Mada (Pertalite < 30% -> Throttled)
  {
    id: 'tank-gm-pertalite',
    spbuId: 'spbu-buleleng-gajah-mada',
    fuelType: 'Pertalite',
    currentLiters: 4850,
    maxCapacityLiters: 20000,
    bookedLiters: 650,
    burnRateLpm: 32.5,
    unloadingMinutesLeft: 0,
    lastDoLiters: 8000,
    createdAt: ts(30),
    updatedAt: ts(0, 0, 5),
  },
  {
    id: 'tank-gm-pertamax',
    spbuId: 'spbu-buleleng-gajah-mada',
    fuelType: 'Pertamax',
    currentLiters: 12400,
    maxCapacityLiters: 20000,
    bookedLiters: 320,
    burnRateLpm: 18.0,
    unloadingMinutesLeft: 0,
    lastDoLiters: 8000,
    createdAt: ts(30),
    updatedAt: ts(0, 0, 5),
  },
  {
    id: 'tank-gm-solar',
    spbuId: 'spbu-buleleng-gajah-mada',
    fuelType: 'Solar',
    currentLiters: 14200,
    maxCapacityLiters: 20000,
    bookedLiters: 400,
    burnRateLpm: 12.0,
    unloadingMinutesLeft: 0,
    lastDoLiters: 8000,
    createdAt: ts(30),
    updatedAt: ts(0, 0, 5),
  },

  // 2. SPBU Buleleng Ahmad Yani (NORMAL)
  {
    id: 'tank-ay-pertalite',
    spbuId: 'spbu-buleleng-ahmad-yani',
    fuelType: 'Pertalite',
    currentLiters: 15600,
    maxCapacityLiters: 20000,
    bookedLiters: 200,
    burnRateLpm: 28.0,
    unloadingMinutesLeft: 0,
    lastDoLiters: 8000,
    createdAt: ts(30),
    updatedAt: ts(0, 0, 12),
  },
  {
    id: 'tank-ay-pertamax',
    spbuId: 'spbu-buleleng-ahmad-yani',
    fuelType: 'Pertamax',
    currentLiters: 16800,
    maxCapacityLiters: 20000,
    bookedLiters: 150,
    burnRateLpm: 16.5,
    unloadingMinutesLeft: 0,
    lastDoLiters: 8000,
    createdAt: ts(30),
    updatedAt: ts(0, 0, 12),
  },
  {
    id: 'tank-ay-solar',
    spbuId: 'spbu-buleleng-ahmad-yani',
    fuelType: 'Solar',
    currentLiters: 17200,
    maxCapacityLiters: 20000,
    bookedLiters: 180,
    burnRateLpm: 14.0,
    unloadingMinutesLeft: 0,
    lastDoLiters: 8000,
    createdAt: ts(30),
    updatedAt: ts(0, 0, 12),
  },

  // 3. SPBU Denpasar Hayam Wuruk (NORMAL)
  {
    id: 'tank-hw-pertalite',
    spbuId: 'spbu-denpasar-hayam-wuruk',
    fuelType: 'Pertalite',
    currentLiters: 17800,
    maxCapacityLiters: 24000,
    bookedLiters: 420,
    burnRateLpm: 45.0,
    unloadingMinutesLeft: 0,
    lastDoLiters: 16000,
    createdAt: ts(60),
    updatedAt: ts(0, 0, 8),
  },
  {
    id: 'tank-hw-pertamax',
    spbuId: 'spbu-denpasar-hayam-wuruk',
    fuelType: 'Pertamax',
    currentLiters: 19400,
    maxCapacityLiters: 24000,
    bookedLiters: 310,
    burnRateLpm: 35.0,
    unloadingMinutesLeft: 0,
    lastDoLiters: 16000,
    createdAt: ts(60),
    updatedAt: ts(0, 0, 8),
  },
  {
    id: 'tank-hw-solar',
    spbuId: 'spbu-denpasar-hayam-wuruk',
    fuelType: 'Solar',
    currentLiters: 18500,
    maxCapacityLiters: 24000,
    bookedLiters: 260,
    burnRateLpm: 22.0,
    unloadingMinutesLeft: 0,
    lastDoLiters: 16000,
    createdAt: ts(60),
    updatedAt: ts(0, 0, 8),
  },

  // 4. SPBU Denpasar Teuku Umar (THROTTLED: Pertalite < 30%)
  {
    id: 'tank-tu-pertalite',
    spbuId: 'spbu-denpasar-teuku-umar',
    fuelType: 'Pertalite',
    currentLiters: 5200,
    maxCapacityLiters: 20000,
    bookedLiters: 580,
    burnRateLpm: 42.0,
    unloadingMinutesLeft: 0,
    lastDoLiters: 8000,
    createdAt: ts(45),
    updatedAt: ts(0, 0, 3),
  },
  {
    id: 'tank-tu-pertamax',
    spbuId: 'spbu-denpasar-teuku-umar',
    fuelType: 'Pertamax',
    currentLiters: 11500,
    maxCapacityLiters: 20000,
    bookedLiters: 290,
    burnRateLpm: 25.0,
    unloadingMinutesLeft: 0,
    lastDoLiters: 8000,
    createdAt: ts(45),
    updatedAt: ts(0, 0, 3),
  },
  {
    id: 'tank-tu-solar',
    spbuId: 'spbu-denpasar-teuku-umar',
    fuelType: 'Solar',
    currentLiters: 13900,
    maxCapacityLiters: 20000,
    bookedLiters: 310,
    burnRateLpm: 19.0,
    unloadingMinutesLeft: 0,
    lastDoLiters: 8000,
    createdAt: ts(45),
    updatedAt: ts(0, 0, 3),
  },

  // 5. SPBU Badung Sunset Road (NORMAL)
  {
    id: 'tank-sr-pertalite',
    spbuId: 'spbu-badung-sunset-road',
    fuelType: 'Pertalite',
    currentLiters: 21500,
    maxCapacityLiters: 30000,
    bookedLiters: 780,
    burnRateLpm: 55.0,
    unloadingMinutesLeft: 0,
    lastDoLiters: 16000,
    createdAt: ts(90),
    updatedAt: ts(0, 0, 15),
  },
  {
    id: 'tank-sr-pertamax',
    spbuId: 'spbu-badung-sunset-road',
    fuelType: 'Pertamax',
    currentLiters: 24800,
    maxCapacityLiters: 30000,
    bookedLiters: 620,
    burnRateLpm: 48.0,
    unloadingMinutesLeft: 0,
    lastDoLiters: 16000,
    createdAt: ts(90),
    updatedAt: ts(0, 0, 15),
  },
  {
    id: 'tank-sr-solar',
    spbuId: 'spbu-badung-sunset-road',
    fuelType: 'Solar',
    currentLiters: 22100,
    maxCapacityLiters: 30000,
    bookedLiters: 410,
    burnRateLpm: 26.0,
    unloadingMinutesLeft: 0,
    lastDoLiters: 16000,
    createdAt: ts(90),
    updatedAt: ts(0, 0, 15),
  },

  // 6. SPBU Badung Mengwi (CRITICAL / EMERGENCY_ONLY: Pertalite < 10%)
  {
    id: 'tank-mg-pertalite',
    spbuId: 'spbu-badung-mengwi',
    fuelType: 'Pertalite',
    currentLiters: 1650,
    maxCapacityLiters: 20000,
    bookedLiters: 280,
    burnRateLpm: 38.0,
    unloadingMinutesLeft: 0,
    lastDoLiters: 8000,
    createdAt: ts(40),
    updatedAt: ts(0, 0, 2),
  },
  {
    id: 'tank-mg-pertamax',
    spbuId: 'spbu-badung-mengwi',
    fuelType: 'Pertamax',
    currentLiters: 8900,
    maxCapacityLiters: 20000,
    bookedLiters: 190,
    burnRateLpm: 20.0,
    unloadingMinutesLeft: 0,
    lastDoLiters: 8000,
    createdAt: ts(40),
    updatedAt: ts(0, 0, 2),
  },
  {
    id: 'tank-mg-solar',
    spbuId: 'spbu-badung-mengwi',
    fuelType: 'Solar',
    currentLiters: 11200,
    maxCapacityLiters: 20000,
    bookedLiters: 240,
    burnRateLpm: 18.0,
    unloadingMinutesLeft: 0,
    lastDoLiters: 8000,
    createdAt: ts(40),
    updatedAt: ts(0, 0, 2),
  },

  // 7. SPBU Gianyar Dharma Giri (NORMAL)
  {
    id: 'tank-dg-pertalite',
    spbuId: 'spbu-gianyar-dharma-giri',
    fuelType: 'Pertalite',
    currentLiters: 14800,
    maxCapacityLiters: 20000,
    bookedLiters: 310,
    burnRateLpm: 29.0,
    unloadingMinutesLeft: 0,
    lastDoLiters: 8000,
    createdAt: ts(35),
    updatedAt: ts(0, 0, 20),
  },
  {
    id: 'tank-dg-pertamax',
    spbuId: 'spbu-gianyar-dharma-giri',
    fuelType: 'Pertamax',
    currentLiters: 16200,
    maxCapacityLiters: 20000,
    bookedLiters: 220,
    burnRateLpm: 21.0,
    unloadingMinutesLeft: 0,
    lastDoLiters: 8000,
    createdAt: ts(35),
    updatedAt: ts(0, 0, 20),
  },
  {
    id: 'tank-dg-solar',
    spbuId: 'spbu-gianyar-dharma-giri',
    fuelType: 'Solar',
    currentLiters: 15400,
    maxCapacityLiters: 20000,
    bookedLiters: 190,
    burnRateLpm: 16.0,
    unloadingMinutesLeft: 0,
    lastDoLiters: 8000,
    createdAt: ts(35),
    updatedAt: ts(0, 0, 20),
  },

  // 8. SPBU Tabanan Soekarno (NORMAL)
  {
    id: 'tank-tb-pertalite',
    spbuId: 'spbu-tabanan-soekarno',
    fuelType: 'Pertalite',
    currentLiters: 16500,
    maxCapacityLiters: 24000,
    bookedLiters: 390,
    burnRateLpm: 34.0,
    unloadingMinutesLeft: 0,
    lastDoLiters: 16000,
    createdAt: ts(50),
    updatedAt: ts(0, 0, 10),
  },
  {
    id: 'tank-tb-pertamax',
    spbuId: 'spbu-tabanan-soekarno',
    fuelType: 'Pertamax',
    currentLiters: 18900,
    maxCapacityLiters: 24000,
    bookedLiters: 240,
    burnRateLpm: 22.0,
    unloadingMinutesLeft: 0,
    lastDoLiters: 16000,
    createdAt: ts(50),
    updatedAt: ts(0, 0, 10),
  },
  {
    id: 'tank-tb-solar',
    spbuId: 'spbu-tabanan-soekarno',
    fuelType: 'Solar',
    currentLiters: 19800,
    maxCapacityLiters: 24000,
    bookedLiters: 480,
    burnRateLpm: 28.0,
    unloadingMinutesLeft: 0,
    lastDoLiters: 16000,
    createdAt: ts(50),
    updatedAt: ts(0, 0, 10),
  },

  // 9. SPBU Jembrana Sudirman (THROTTLED: Solar & Pertalite rendah)
  {
    id: 'tank-jb-pertalite',
    spbuId: 'spbu-jembrana-sudirman',
    fuelType: 'Pertalite',
    currentLiters: 5800,
    maxCapacityLiters: 20000,
    bookedLiters: 340,
    burnRateLpm: 26.0,
    unloadingMinutesLeft: 0,
    lastDoLiters: 8000,
    createdAt: ts(60),
    updatedAt: ts(0, 0, 18),
  },
  {
    id: 'tank-jb-pertamax',
    spbuId: 'spbu-jembrana-sudirman',
    fuelType: 'Pertamax',
    currentLiters: 12100,
    maxCapacityLiters: 20000,
    bookedLiters: 190,
    burnRateLpm: 15.0,
    unloadingMinutesLeft: 0,
    lastDoLiters: 8000,
    createdAt: ts(60),
    updatedAt: ts(0, 0, 18),
  },
  {
    id: 'tank-jb-solar',
    spbuId: 'spbu-jembrana-sudirman',
    fuelType: 'Solar',
    currentLiters: 4600,
    maxCapacityLiters: 20000,
    bookedLiters: 510,
    burnRateLpm: 32.0,
    unloadingMinutesLeft: 0,
    lastDoLiters: 8000,
    createdAt: ts(60),
    updatedAt: ts(0, 0, 18),
  },

  // 10. SPBU Karangasem Subagan (UNLOADING: Truk tangki Depot Manggis bongkar muat)
  {
    id: 'tank-ka-pertalite',
    spbuId: 'spbu-karangasem-subagan',
    fuelType: 'Pertalite',
    currentLiters: 3200,
    maxCapacityLiters: 20000,
    bookedLiters: 120,
    burnRateLpm: 0, // Nozel tertutup protokol K3
    unloadingMinutesLeft: 25,
    lastDoLiters: 16000,
    createdAt: ts(75),
    updatedAt: ts(0, 0, 1),
  },
  {
    id: 'tank-ka-pertamax',
    spbuId: 'spbu-karangasem-subagan',
    fuelType: 'Pertamax',
    currentLiters: 14500,
    maxCapacityLiters: 20000,
    bookedLiters: 180,
    burnRateLpm: 16.0,
    unloadingMinutesLeft: 0,
    lastDoLiters: 8000,
    createdAt: ts(75),
    updatedAt: ts(0, 0, 1),
  },
  {
    id: 'tank-ka-solar',
    spbuId: 'spbu-karangasem-subagan',
    fuelType: 'Solar',
    currentLiters: 15200,
    maxCapacityLiters: 20000,
    bookedLiters: 210,
    burnRateLpm: 18.0,
    unloadingMinutesLeft: 0,
    lastDoLiters: 8000,
    createdAt: ts(75),
    updatedAt: ts(0, 0, 1),
  },

  // 11. SPBU Klungkung Mantra (NORMAL)
  {
    id: 'tank-kl-pertalite',
    spbuId: 'spbu-klungkung-mantra',
    fuelType: 'Pertalite',
    currentLiters: 16200,
    maxCapacityLiters: 20000,
    bookedLiters: 270,
    burnRateLpm: 27.0,
    unloadingMinutesLeft: 0,
    lastDoLiters: 8000,
    createdAt: ts(40),
    updatedAt: ts(0, 0, 14),
  },
  {
    id: 'tank-kl-pertamax',
    spbuId: 'spbu-klungkung-mantra',
    fuelType: 'Pertamax',
    currentLiters: 17400,
    maxCapacityLiters: 20000,
    bookedLiters: 190,
    burnRateLpm: 18.0,
    unloadingMinutesLeft: 0,
    lastDoLiters: 8000,
    createdAt: ts(40),
    updatedAt: ts(0, 0, 14),
  },
  {
    id: 'tank-kl-solar',
    spbuId: 'spbu-klungkung-mantra',
    fuelType: 'Solar',
    currentLiters: 16800,
    maxCapacityLiters: 20000,
    bookedLiters: 230,
    burnRateLpm: 19.0,
    unloadingMinutesLeft: 0,
    lastDoLiters: 8000,
    createdAt: ts(40),
    updatedAt: ts(0, 0, 14),
  },

  // 12. SPBU Bangli Ngurah Rai (NORMAL)
  {
    id: 'tank-bg-pertalite',
    spbuId: 'spbu-bangli-ngurah-rai',
    fuelType: 'Pertalite',
    currentLiters: 14900,
    maxCapacityLiters: 20000,
    bookedLiters: 210,
    burnRateLpm: 21.0,
    unloadingMinutesLeft: 0,
    lastDoLiters: 8000,
    createdAt: ts(55),
    updatedAt: ts(0, 0, 22),
  },
  {
    id: 'tank-bg-pertamax',
    spbuId: 'spbu-bangli-ngurah-rai',
    fuelType: 'Pertamax',
    currentLiters: 16100,
    maxCapacityLiters: 20000,
    bookedLiters: 160,
    burnRateLpm: 14.0,
    unloadingMinutesLeft: 0,
    lastDoLiters: 8000,
    createdAt: ts(55),
    updatedAt: ts(0, 0, 22),
  },
  {
    id: 'tank-bg-solar',
    spbuId: 'spbu-bangli-ngurah-rai',
    fuelType: 'Solar',
    currentLiters: 15800,
    maxCapacityLiters: 20000,
    bookedLiters: 180,
    burnRateLpm: 15.0,
    unloadingMinutesLeft: 0,
    lastDoLiters: 8000,
    createdAt: ts(55),
    updatedAt: ts(0, 0, 22),
  },
];

// ---------------------------------------------------------------------------
// 3. TIME SLOTS — 30-Minute Batches (Today & Tomorrow)
// ---------------------------------------------------------------------------

function generateSlotsForStation(spbuId: string, tankId: string): TimeSlot[] {
  const dates = [today(), tomorrow()];
  const windows = [
    { label: '07:00 - 07:30 WITA', hour: 7, minute: 0 },
    { label: '07:30 - 08:00 WITA', hour: 7, minute: 30 },
    { label: '08:00 - 08:30 WITA', hour: 8, minute: 0 },
    { label: '08:30 - 09:00 WITA', hour: 8, minute: 30 },
    { label: '09:00 - 09:30 WITA', hour: 9, minute: 0 },
    { label: '09:30 - 10:00 WITA', hour: 9, minute: 30 },
    { label: '10:00 - 10:30 WITA', hour: 10, minute: 0 },
    { label: '10:30 - 11:00 WITA', hour: 10, minute: 30 },
  ];

  const slots: TimeSlot[] = [];
  dates.forEach((d) => {
    windows.forEach((w) => {
      slots.push({
        id: `slot-${spbuId}-${d}-${w.hour}-${w.minute}`,
        spbuId,
        fuelTankId: tankId,
        slotDate: d,
        windowLabel: w.label,
        windowStartHour: w.hour,
        windowStartMinute: w.minute,
        capacityLiters: 800,
        bookedLiters: Math.floor(Math.random() * 200),
        isLocked: false,
        createdAt: ts(1),
      });
    });
  });

  return slots;
}

export const SEED_BALI_TIME_SLOTS: TimeSlot[] = SEED_BALI_SPBU_STATIONS.flatMap((spbu) => {
  const pertaliteTank = SEED_BALI_FUEL_TANKS.find(
    (t) => t.spbuId === spbu.id && t.fuelType === 'Pertalite'
  );
  return pertaliteTank ? generateSlotsForStation(spbu.id, pertaliteTank.id) : [];
});

// ---------------------------------------------------------------------------
// 4. INITIAL QUEUE TICKETS (Representative Bali Plates)
// ---------------------------------------------------------------------------

export const SEED_BALI_QUEUE_TICKETS: QueueTicket[] = [
  {
    id: 'tkt-bali-001',
    ticketCode: 'NFG-BALI-001-A1',
    spbuId: 'spbu-buleleng-gajah-mada',
    slotId: `slot-spbu-buleleng-gajah-mada-${today()}-7-0`,
    plateNumber: 'DK 4821 FB',
    plateParity: 'ODD',
    vehicleType: 'MOBIL',
    fuelType: 'Pertalite',
    quotaLiters: 10,
    qrHash: 'a1b2c3d4e5f60718293a4b5c6d7e8f90a1b2c3d4e5f60718293a4b5c6d7e8f90',
    status: 'BOOKED',
    createdAt: ts(0, 1, 15),
    spbuName: 'SPBU 54.811.14 Gajah Mada Singaraja',
    slotWindowLabel: '07:00 - 07:30 WITA',
  },
  {
    id: 'tkt-bali-002',
    ticketCode: 'NFG-BALI-002-B2',
    spbuId: 'spbu-denpasar-hayam-wuruk',
    slotId: `slot-spbu-denpasar-hayam-wuruk-${today()}-8-0`,
    plateNumber: 'DK 1822 XY',
    plateParity: 'EVEN',
    vehicleType: 'MOBIL',
    fuelType: 'Pertalite',
    quotaLiters: 20,
    qrHash: 'b2c3d4e5f60718293a4b5c6d7e8f90a1b2c3d4e5f60718293a4b5c6d7e8f90a1',
    status: 'BOOKED',
    createdAt: ts(0, 0, 45),
    spbuName: 'SPBU 54.801.12 Hayam Wuruk Denpasar',
    slotWindowLabel: '08:00 - 08:30 WITA',
  },
  {
    id: 'tkt-bali-003',
    ticketCode: 'NFG-BALI-003-C3',
    spbuId: 'spbu-badung-sunset-road',
    slotId: `slot-spbu-badung-sunset-road-${today()}-8-30`,
    plateNumber: 'DK 5513 QA',
    plateParity: 'ODD',
    vehicleType: 'MOTOR',
    fuelType: 'Pertamax',
    quotaLiters: 4,
    qrHash: 'c3d4e5f60718293a4b5c6d7e8f90a1b2c3d4e5f60718293a4b5c6d7e8f90a1b2',
    status: 'COMPLETED',
    verifiedByOperator: 'OPR-BADUNG-01',
    verifiedAt: ts(0, 0, 20),
    createdAt: ts(0, 1, 0),
    spbuName: 'SPBU 54.803.01 Sunset Road Kuta',
    slotWindowLabel: '08:30 - 09:00 WITA',
  },
];

// ---------------------------------------------------------------------------
// 5. DISPATCH ORDERS — Depot Pertamina Manggis & Sanggaran
// ---------------------------------------------------------------------------

export const SEED_BALI_DISPATCH_ORDERS: DispatchOrder[] = [
  {
    id: 'ord-manggis-001',
    dispatchCode: 'DO-MGS-20261020-001',
    spbuId: 'spbu-karangasem-subagan',
    spbuCode: '54.808.02',
    spbuName: 'SPBU 54.808.02 Subagan Amlapura',
    fuelTankId: 'tank-ka-pertalite',
    fuelType: 'Pertalite',
    triggerFillPercent: 16.0,
    requestedLiters: 16000,
    triggerSource: 'AUTO_WEBHOOK_LOW_TANK',
    status: 'IN_TRANSIT',
    assignedTankerPlate: 'DK 9812 AA',
    driverName: 'I Gede Suartana',
    etaMinutes: 15,
    routeSegment: 'Depot Manggis -> Karangasem Kota (Subagan)',
    createdAt: ts(0, 1, 30),
    updatedAt: ts(0, 0, 10),
  },
  {
    id: 'ord-manggis-002',
    dispatchCode: 'DO-MGS-20261020-002',
    spbuId: 'spbu-buleleng-gajah-mada',
    spbuCode: '54.811.14',
    spbuName: 'SPBU 54.811.14 Gajah Mada Singaraja',
    fuelTankId: 'tank-gm-pertalite',
    fuelType: 'Pertalite',
    triggerFillPercent: 18.2,
    requestedLiters: 8000,
    triggerSource: 'AUTO_WEBHOOK_LOW_TANK',
    status: 'PENDING_DISPATCH',
    assignedTankerPlate: 'DK 8821 BB',
    driverName: 'I Made Suardana',
    etaMinutes: 75,
    routeSegment: 'Depot Manggis -> Kintamani -> Singaraja',
    createdAt: ts(0, 0, 45),
    updatedAt: ts(0, 0, 45),
  },
  {
    id: 'ord-sanggaran-003',
    dispatchCode: 'DO-SGR-20261020-003',
    spbuId: 'spbu-badung-mengwi',
    spbuCode: '54.803.14',
    spbuName: 'SPBU 54.803.14 Mengwi Badung',
    fuelTankId: 'tank-mg-pertalite',
    fuelType: 'Pertalite',
    triggerFillPercent: 8.25,
    requestedLiters: 8000,
    triggerSource: 'AUTO_WEBHOOK_LOW_TANK',
    status: 'IN_TRANSIT',
    assignedTankerPlate: 'DK 8104 EF',
    driverName: 'Ketut Wirawan',
    etaMinutes: 30,
    routeSegment: 'Terminal BBM Sanggaran -> Bypass Ngurah Rai -> Mengwi',
    createdAt: ts(0, 1, 10),
    updatedAt: ts(0, 0, 15),
  },
];

// ---------------------------------------------------------------------------
// 6. SECURITY AUDIT LOGS — Immutable Regional Trail
// ---------------------------------------------------------------------------

export const SEED_BALI_SECURITY_AUDIT_LOGS: SecurityAuditLog[] = [
  {
    id: 'log-bali-001',
    timestamp: ts(0, 0, 2),
    actorRole: 'DEPOT_SYSTEM',
    eventType: 'AUTO_WEBHOOK_RESTOCK',
    spbuCode: '54.803.14',
    referenceId: 'REF-MENGWI-CRIT',
    severity: 'CRITICAL',
    message: 'ATG SPBU Mengwi menyentuh 8.2% (<10%). Autonomous restock webhook DO-SGR-20261020-003 diterbitkan ke Terminal Sanggaran.',
    metadataJson: JSON.stringify({ remainingLiters: 1650, emergencyReserveLocked: true }),
  },
  {
    id: 'log-bali-002',
    timestamp: ts(0, 0, 20),
    actorRole: 'SPBU_OPERATOR',
    eventType: 'TICKET_VERIFIED_AND_REDEEMED',
    spbuCode: '54.803.01',
    referenceId: 'tkt-bali-003',
    severity: 'INFO',
    message: 'Operator memverifikasi QR tiket NFG-BALI-003-C3 (DK 5513 QA). Stok Pertamax dikurangi 4 Liter.',
  },
  {
    id: 'log-bali-003',
    timestamp: ts(0, 0, 48),
    actorRole: 'SECURITY_GUARD',
    eventType: 'HOARDING_ATTEMPT_BLOCKED',
    spbuCode: '54.811.14',
    referenceId: 'BLOCKED-DK9991XX',
    severity: 'CRITICAL',
    message: 'Anti-Hoarding Guard memblokir plat DK 9991 XX. Kendaraan telah mengisi di SPBU Ahmad Yani 42 menit sebelumnya.',
    metadataJson: JSON.stringify({ plateNumber: 'DK 9991 XX', intervalMinutes: 42, policyRule: 'MAX_1_DAILY_SUBSIDY' }),
  },
  {
    id: 'log-bali-004',
    timestamp: ts(0, 1, 15),
    actorRole: 'PUBLIC_DRIVER',
    eventType: 'SLOT_RESERVED_AND_LOCKED',
    spbuCode: '54.811.14',
    referenceId: 'tkt-bali-001',
    severity: 'INFO',
    message: 'Warga mendaftarkan antrean DK 4821 FB untuk slot 07:00-07:30 WITA di SPBU Gajah Mada Singaraja.',
  },
];
