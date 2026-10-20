// =============================================================================
// src/shared/components/TankLevelGauge.tsx — NusaFuel Grid
// Visual Fuel Tank Level Indicator & Real-Time Capacity Gauge
// Compliant with design.md and prd.md §4.2 quota engine
// =============================================================================

import React from 'react';
import {
  calculateQuota,
  type QuotaCalcResult,
} from '../../core/automation/quotaCalculator';
import type { FuelTank, FuelType, OperationalMode } from '../../core/data/bulelengSpbuSeed';
import { Fuel, AlertTriangle, ArrowDownCircle, ShieldAlert, Bike, Car } from 'lucide-react';

export interface TankLevelGaugeProps {
  /** Optional full tank object */
  tank?: FuelTank;
  /** Or pass individual properties */
  currentLiters?: number;
  maxCapacityLiters?: number;
  bookedLiters?: number;
  fuelType?: FuelType;
  operationalMode?: OperationalMode;
  unloadingMinutesLeft?: number;
  throttlingEnabled?: boolean;
  emergencyReserveEnabled?: boolean;
  burnRateLpm?: number;
  /** Presentation options */
  compact?: boolean;
  showCapacityEstimates?: boolean;
  showBadges?: boolean;
  showThresholdMarkers?: boolean;
  className?: string;
}

export const TankLevelGauge: React.FC<TankLevelGaugeProps> = ({
  tank,
  currentLiters: propCurrent,
  maxCapacityLiters: propMax,
  bookedLiters: propBooked,
  fuelType: propFuelType,
  operationalMode: propMode,
  unloadingMinutesLeft: propUnloading,
  throttlingEnabled = true,
  emergencyReserveEnabled = true,
  compact = false,
  showCapacityEstimates = true,
  showBadges = true,
  showThresholdMarkers = true,
  className = '',
}) => {
  // Resolve values from tank object or individual props
  const currentLiters = tank?.currentLiters ?? propCurrent ?? 0;
  const maxCapacityLiters = tank?.maxCapacityLiters ?? propMax ?? 10000;
  const bookedLiters = tank?.bookedLiters ?? propBooked ?? 0;
  const fuelType: FuelType = tank?.fuelType ?? propFuelType ?? 'Pertalite';
  const operationalMode: OperationalMode =
    propMode ?? (tank?.unloadingMinutesLeft && tank.unloadingMinutesLeft > 0 ? 'UNLOADING' : 'NORMAL');
  const unloadingMinutesLeft = tank?.unloadingMinutesLeft ?? propUnloading ?? 0;

  // Run quota calculator engine
  const quota: QuotaCalcResult = calculateQuota({
    currentLiters,
    maxCapacityLiters,
    bookedLiters,
    throttlingEnabled,
    emergencyReserveEnabled,
  });

  const fillPercent = Math.min(100, Math.max(0, (currentLiters / maxCapacityLiters) * 100));
  const isUnloading = operationalMode === 'UNLOADING' || unloadingMinutesLeft > 0;

  // Determine badge & color styling based on operational reality
  let badgeClass = 'badge-normal';
  let badgeLabel = 'NORMAL';
  let gaugeFillClass = 'tank-gauge-fill--normal';
  let statusIcon = <Fuel className="w-3 h-3 text-emerald-600" />;

  if (isUnloading) {
    badgeClass = 'badge-unloading';
    badgeLabel = `BONGKAR DO (${unloadingMinutesLeft}m)`;
    gaugeFillClass = 'bg-gradient-to-r from-blue-500 to-indigo-600';
    statusIcon = <ArrowDownCircle className="w-3 h-3 text-blue-600 animate-spin-slow" />;
  } else if (quota.status === 'EMERGENCY_ONLY' || operationalMode === 'EMERGENCY_ONLY') {
    badgeClass = 'badge-emergency';
    badgeLabel = 'DARURAT SAJA (<=10%)';
    gaugeFillClass = 'tank-gauge-fill--critical';
    statusIcon = <ShieldAlert className="w-3 h-3 text-red-600" />;
  } else if (quota.status === 'THROTTLED' || operationalMode === 'THROTTLED') {
    badgeClass = 'badge-throttled';
    badgeLabel = 'THROTTLED (<30%)';
    gaugeFillClass = 'tank-gauge-fill--throttled';
    statusIcon = <AlertTriangle className="w-3 h-3 text-amber-600" />;
  }

  // Fuel type badge styling
  const fuelTypePillStyle: Record<FuelType, { bg: string; text: string; dot: string }> = {
    Pertalite: { bg: 'bg-emerald-50 text-emerald-800 border-emerald-200', dot: 'bg-emerald-500', text: 'Pertalite (RON 90)' },
    Pertamax:  { bg: 'bg-blue-50 text-blue-800 border-blue-200',       dot: 'bg-blue-600',    text: 'Pertamax (RON 92)' },
    Solar:     { bg: 'bg-slate-100 text-slate-800 border-slate-300',    dot: 'bg-amber-600',   text: 'Biosolar (Subsidi)' },
  };

  const fuelStyle = fuelTypePillStyle[fuelType] || fuelTypePillStyle.Pertalite;

  if (compact) {
    return (
      <div className={`space-y-1.5 ${className}`}>
        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center gap-1.5">
            <span className={`inline-block w-2 h-2 rounded-full ${fuelStyle.dot}`} />
            <span className="font-semibold text-slate-800">{fuelType}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="font-mono text-[11px] font-bold text-slate-900">
              {currentLiters.toLocaleString('id-ID')} L
            </span>
            <span className="text-[11px] font-semibold text-slate-500">
              ({fillPercent.toFixed(1)}%)
            </span>
            {showBadges && <span className={`badge ${badgeClass} text-[9px] py-0.5 px-2`}>{badgeLabel}</span>}
          </div>
        </div>
        <div className="tank-gauge h-2 bg-slate-100 border border-slate-200/60 shadow-inner">
          <div
            className={`tank-gauge-fill ${gaugeFillClass}`}
            style={{ width: `${fillPercent}%` }}
          />
        </div>
      </div>
    );
  }

  return (
    <div
      className={`rounded-lg p-4 bg-white border border-[#E6E8EC] shadow-sm transition-all hover:shadow-md ${className}`}
    >
      {/* Header Row */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span
            className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full border ${fuelStyle.bg}`}
          >
            <span className={`w-2 h-2 rounded-full ${fuelStyle.dot}`} />
            {fuelStyle.text}
          </span>
          {showBadges && (
            <span className={`badge ${badgeClass} flex items-center gap-1`}>
              {statusIcon}
              <span>{badgeLabel}</span>
            </span>
          )}
        </div>

        {/* Fill Percentage in Bold Callout */}
        <div className="text-right">
          <div className="flex items-baseline gap-1 justify-end">
            <span className="text-xl font-extrabold text-slate-900 tracking-tight font-mono">
              {fillPercent.toFixed(1)}%
            </span>
          </div>
          <p className="text-[10px] text-slate-500 font-medium uppercase tracking-wider">
            Kapasitas Tangki
          </p>
        </div>
      </div>

      {/* Liters Bar & Monospace Metrics */}
      <div className="space-y-2 mb-3">
        <div className="relative">
          {/* Progress Bar Container */}
          <div className="tank-gauge h-3 bg-slate-100 border border-slate-200 shadow-inner relative overflow-hidden">
            <div
              className={`tank-gauge-fill ${gaugeFillClass}`}
              style={{ width: `${fillPercent}%` }}
            />
          </div>

          {/* Threshold markers: 10% and 20% */}
          {showThresholdMarkers && (
            <>
              {/* 10% Reserve Marker */}
              <div
                className="absolute top-0 bottom-0 w-[2px] bg-red-500/80 pointer-events-none"
                style={{ left: '10%' }}
                title="Cadangan Darurat (10%)"
              />
              {/* 20% Auto-Restock Marker */}
              <div
                className="absolute top-0 bottom-0 w-[2px] bg-amber-500/80 pointer-events-none"
                style={{ left: '20%' }}
                title="Batas Webhook Restock Depot (20%)"
              />
            </>
          )}
        </div>

        {/* Marker legend & liter numbers */}
        <div className="flex items-center justify-between text-xs font-mono">
          <div className="flex items-center gap-1">
            <span className="font-bold text-slate-900">
              {currentLiters.toLocaleString('id-ID')}
            </span>
            <span className="text-slate-400">/</span>
            <span className="text-slate-500">
              {maxCapacityLiters.toLocaleString('id-ID')} Liter
            </span>
          </div>

          <div className="text-[11px] text-slate-500">
            {bookedLiters > 0 && (
              <span className="text-amber-700 font-semibold bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200">
                Terkunci Antrean: {bookedLiters.toLocaleString('id-ID')}L
              </span>
            )}
            {bookedLiters === 0 && (
              <span className="text-emerald-700 font-medium">
                Tersedia Penuh: {quota.availableLiters.toLocaleString('id-ID')}L
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Vehicle Capacity Estimates (per PRD §4.2) */}
      {showCapacityEstimates && (
        <div className="pt-2.5 mt-2 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2 text-xs">
          {quota.status === 'EMERGENCY_ONLY' ? (
            <div className="w-full flex items-center gap-1.5 text-red-700 font-medium bg-red-50 px-2.5 py-1.5 rounded-md border border-red-200">
              <ShieldAlert className="w-4 h-4 flex-shrink-0" />
              <span>
                Stok Kritis! Hanya melayani ambulans, pemadam kebakaran, dan dinas kebencanaan (Maks 30L).
              </span>
            </div>
          ) : (
            <>
              <div className="flex items-center gap-4 text-slate-700">
                <div
                  className="flex items-center gap-1.5 bg-slate-50 px-2 py-1 rounded border border-slate-200/70"
                  title={`Daya tampung motor (${quota.quotaMotorLiters}L/kendaraan)`}
                >
                  <Bike className="w-3.5 h-3.5 text-slate-600" />
                  <span className="text-[11px] text-slate-500">Cukup untuk:</span>
                  <span className="font-bold text-slate-900 font-mono">
                    ±{quota.estimatedMotorCapacity.toLocaleString('id-ID')} Motor
                  </span>
                </div>

                <div
                  className="flex items-center gap-1.5 bg-slate-50 px-2 py-1 rounded border border-slate-200/70"
                  title={`Daya tampung mobil (${quota.quotaMobilLiters}L/kendaraan)`}
                >
                  <Car className="w-3.5 h-3.5 text-slate-600" />
                  <span className="text-[11px] text-slate-500">atau</span>
                  <span className="font-bold text-slate-900 font-mono">
                    ±{quota.estimatedMobilCapacity.toLocaleString('id-ID')} Mobil
                  </span>
                </div>
              </div>

              {quota.status === 'THROTTLED' && (
                <span className="text-[10px] font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                  Throttling Kuota Aktif (Mobil maks 10L)
                </span>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
};
export default TankLevelGauge;
