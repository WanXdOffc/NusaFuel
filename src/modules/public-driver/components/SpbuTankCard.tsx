// =============================================================================
// src/modules/public-driver/components/SpbuTankCard.tsx — NusaFuel Grid
// SPBU Station Card with Live Tank Gauges, Unloading Timer, & Dispatch ETA
// Compliant with design.md and prd.md §4.2, §4.3
// =============================================================================

import React from 'react';
import { useStore } from '../../../app/store';
import { TankLevelGauge } from '../../../shared/components/TankLevelGauge';
import type { SpbuStation, FuelTank, FuelType } from '../../../core/data/bulelengSpbuSeed';
import {
  MapPin,
  ArrowRight,
  Truck,
  RotateCw,
  ShieldCheck,
  ShieldAlert,
} from 'lucide-react';

export interface SpbuTankCardProps {
  station: SpbuStation;
  tanks: FuelTank[];
  selectedFuelType: FuelType;
  onSelectBooking: (station: SpbuStation, targetTank: FuelTank) => void;
}

export const SpbuTankCard: React.FC<SpbuTankCardProps> = ({
  station,
  tanks,
  selectedFuelType,
  onSelectBooking,
}) => {
  const { state } = useStore();

  // Find relevant tank matching driver's selected fuel type
  const targetTank = tanks.find((t) => t.fuelType === selectedFuelType) ?? tanks[0];

  // Check for active dispatches heading to this station
  const activeDispatch = state.dispatches.find(
    (d) => d.spbuId === station.id && d.status !== 'DELIVERED'
  );

  const isUnloading = station.operationalMode === 'UNLOADING' || (targetTank?.unloadingMinutesLeft ?? 0) > 0;
  const isEmergencyOnly = station.operationalMode === 'EMERGENCY_ONLY';

  return (
    <div className="rounded-2xl bg-white border border-[#E6E8EC] p-6 shadow-sm hover:shadow-md transition-all flex flex-col justify-between">
      <div>
        {/* Card Header */}
        <div className="flex items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
              {station.code}
            </span>
            <span className="text-[11px] font-semibold text-slate-500">
              {station.activeNozzles} Nozel Aktif
            </span>
          </div>

          <span
            className={`badge ${
              station.operationalMode === 'NORMAL'
                ? 'badge-normal'
                : station.operationalMode === 'THROTTLED'
                ? 'badge-throttled'
                : station.operationalMode === 'UNLOADING'
                ? 'badge-unloading'
                : 'badge-emergency'
            }`}
          >
            {station.operationalMode === 'NORMAL'
              ? 'STOK NORMAL'
              : station.operationalMode === 'THROTTLED'
              ? 'THROTTLED <30%'
              : station.operationalMode === 'UNLOADING'
              ? 'BONGKAR TANGKI'
              : 'DARURAT SAJA'}
          </span>
        </div>

        {/* Station Name & Address */}
        <h3 className="text-lg font-bold font-sans text-slate-900 mb-1 leading-snug">
          {station.name}
        </h3>
        <p className="text-xs text-slate-500 flex items-center gap-1.5 mb-4">
          <MapPin className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
          <span>{station.address}, Kec. {station.district}</span>
        </p>

        {/* Unloading Banner Notification */}
        {isUnloading && (
          <div className="mb-4 p-3 rounded-xl bg-blue-50 border border-blue-200 text-xs text-blue-900 flex items-center gap-2.5 animate-slide-in-up">
            <RotateCw className="w-4 h-4 text-blue-600 flex-shrink-0 animate-spin-slow" />
            <div>
              <p className="font-bold">Bongkar Truk Tangki Berlangsung</p>
              <p className="text-[11px] text-blue-700">
                Sisa waktu ±{targetTank?.unloadingMinutesLeft ?? 45} menit. Nozel pengisian diistirahatkan sementara demi kepatuhan K3.
              </p>
            </div>
          </div>
        )}

        {/* Active Dispatch OTW Banner */}
        {activeDispatch && !isUnloading && (
          <div className="mb-4 p-3 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-900 flex items-center gap-2.5 animate-slide-in-up">
            <Truck className="w-4 h-4 text-amber-600 flex-shrink-0" />
            <div>
              <p className="font-bold flex items-center gap-1.5">
                <span>Truk Tangki Menuju SPBU</span>
                <span className="font-mono text-[10px] bg-white px-1.5 py-0.2 rounded border border-amber-300">
                  ETA: {activeDispatch.etaMinutes}m
                </span>
              </p>
              <p className="text-[11px] text-amber-700">
                Pesanan restock {activeDispatch.requestedLiters.toLocaleString()}L ({activeDispatch.fuelType}) terpicu otomatis dari Depot Manggis.
              </p>
            </div>
          </div>
        )}

        {/* Tank Level Gauges */}
        <div className="space-y-3 mb-5">
          <div className="text-[11px] font-bold uppercase tracking-wider text-slate-500 flex items-center justify-between">
            <span>Kapasitas Tangki BBM:</span>
            <span className="text-slate-400 font-normal">Fokus: {selectedFuelType}</span>
          </div>

          {tanks.map((tank) => {
            const isTarget = tank.fuelType === selectedFuelType;
            return (
              <div
                key={tank.id}
                className={`transition-all rounded-xl ${
                  isTarget ? 'ring-2 ring-[#FF5A5F]/40 p-1 bg-[#FF5A5F]/5' : ''
                }`}
              >
                <TankLevelGauge
                  tank={tank}
                  operationalMode={station.operationalMode}
                  throttlingEnabled={station.dynamicThrottlingActive}
                  emergencyReserveEnabled={station.emergencyReserveActive}
                  compact={!isTarget}
                  showCapacityEstimates={isTarget}
                />
              </div>
            );
          })}
        </div>
      </div>

      {/* Card Action Footer */}
      <div className="pt-4 border-t border-slate-100">
        <div className="flex items-center justify-between gap-3">
          <div className="text-[11px] text-slate-500">
            {isEmergencyOnly ? (
              <span className="text-red-600 font-semibold flex items-center gap-1">
                <ShieldAlert className="w-3.5 h-3.5" />
                Khusus Kendaraan Darurat
              </span>
            ) : (
              <span className="text-emerald-700 font-semibold flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                Slot 30 Menit Tersedia
              </span>
            )}
          </div>

          <button
            type="button"
            onClick={() => targetTank && onSelectBooking(station, targetTank)}
            className="btn-coral py-2.5 px-5 text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 shadow-sm group"
          >
            <span>Ambil Slot Waktu</span>
            <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
          </button>
        </div>
      </div>
    </div>
  );
};
export default SpbuTankCard;
