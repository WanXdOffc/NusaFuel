// =============================================================================
// src/modules/spbu-operator/pages/SpbuDashboardPage.tsx — NusaFuel Grid
// Petugas SPBU (User B) — Complete Stage 4 Implementation
// Operator Session, Policy Switches, Tanker DO Inbound & Cashier 1-Tap QR Scanner
// Compliant with design.md (Charcoal Section) and prd.md §3.2, §4.2, §4.3
// =============================================================================

import React, { useState } from 'react';
import { useStore } from '../../../app/store';
import { PolicySwitchesCard } from '../components/PolicySwitchesCard';
import { DoTankerForm } from '../components/DoTankerForm';
import { CashierQrScanner } from '../components/CashierQrScanner';
import { TankLevelGauge } from '../../../shared/components/TankLevelGauge';
import {
  Fuel,
  MapPin,
  UserCheck,
} from 'lucide-react';

export const SpbuDashboardPage: React.FC = () => {
  const { state, getStation, getTanksForStation } = useStore();

  const [selectedStationId, setSelectedStationId] = useState<string>(
    state.stations[0]?.id ?? ''
  );

  // Operator credentials
  const operatorName = 'I Made Artha Kusuma';
  const operatorId = 'OP-BLG-81101';
  const shiftLabel = 'Shift Pagi (07:00 - 15:00 WITA)';

  const currentStation = getStation(selectedStationId) ?? state.stations[0];
  const stationTanks = currentStation ? getTanksForStation(currentStation.id) : [];

  return (
    <div className="w-full pb-20 animate-fade-in font-sans">
      {/* 1. Header Operasional & SPBU Station Switcher */}
      <section className="bg-[#121316] text-white py-8 border-b border-slate-800">
        <div className="max-w-[1360px] mx-auto px-4 sm:px-6">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-800 border border-slate-700 text-xs font-semibold text-[#FF9F1C] mb-3">
                <Fuel className="w-3.5 h-3.5" />
                <span>Konsol Pengawas Nozel & Kasir SPBU (User B)</span>
              </div>
              <h1 className="text-2xl sm:text-4xl font-extrabold font-sans tracking-tight text-white leading-tight">
                Manajemen Distribusi & Pompa {currentStation.name}
              </h1>
              <p className="text-xs sm:text-sm text-slate-400 mt-1 flex items-center gap-2">
                <MapPin className="w-3.5 h-3.5 text-slate-500" />
                <span>{currentStation.address}, Kec. {currentStation.district}</span>
                <span>•</span>
                <span className="font-mono text-slate-300">Kode: {currentStation.code}</span>
              </p>
            </div>

            {/* Operator Session Card & Station Selector */}
            <div className="flex flex-wrap items-center gap-4">
              {/* Operator Badge */}
              <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 flex items-center gap-3 text-xs">
                <div className="w-9 h-9 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center font-bold">
                  <UserCheck className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="font-bold text-white">{operatorName}</span>
                    <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950 px-1.5 py-0.2 rounded border border-emerald-800">
                      AKTIF
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-400 mt-0.5">
                    ID: {operatorId} • {shiftLabel}
                  </p>
                </div>
              </div>

              {/* Station Dropdown Selector */}
              <div className="bg-slate-900 p-2 rounded-xl border border-slate-800">
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                  Pilih Stasiun Kelola:
                </label>
                <select
                  value={selectedStationId}
                  onChange={(e) => setSelectedStationId(e.target.value)}
                  className="bg-slate-800 text-white text-xs font-bold px-3 py-2 rounded-lg border border-slate-700 focus:outline-none focus:ring-2 focus:ring-[#FF5A5F]"
                >
                  {state.stations.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.code} — {s.name} ({s.operationalMode})
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Main Content Container */}
      <div className="max-w-[1360px] mx-auto px-4 sm:px-6 mt-8 space-y-10">
        {/* Policy Switches in Charcoal Section */}
        {currentStation && (
          <PolicySwitchesCard
            station={currentStation}
            operatorId={operatorName}
          />
        )}

        {/* Live Fuel Tank Telemetry Overview */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-xl font-bold font-sans text-slate-900">
                Telemetri Sensor Tangki BBM {currentStation.name}
              </h3>
              <p className="text-xs text-slate-500">
                Data kapasitas aktual, sisa liter terkalibrasi, dan peringatan batas kritis
              </p>
            </div>
            <span className="text-xs font-mono font-bold text-slate-500 bg-slate-100 px-2.5 py-1 rounded-md border border-slate-200">
              {currentStation.activeNozzles} Nozel Aktif
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {stationTanks.map((tank) => (
              <TankLevelGauge
                key={tank.id}
                tank={tank}
                operationalMode={currentStation.operationalMode}
                throttlingEnabled={currentStation.dynamicThrottlingActive}
                emergencyReserveEnabled={currentStation.emergencyReserveActive}
                showBadges={true}
                showCapacityEstimates={true}
              />
            ))}
          </div>
        </div>

        {/* Delivery Order (DO) Inbound Form & Safety Timer */}
        {currentStation && (
          <DoTankerForm
            station={currentStation}
            tanks={stationTanks}
            operatorId={operatorName}
          />
        )}

        {/* Cashier 1-Tap QR Scanner & Anti-Hoarding Enforcer */}
        {currentStation && (
          <CashierQrScanner
            station={currentStation}
            operatorId={operatorName}
          />
        )}
      </div>
    </div>
  );
};
export default SpbuDashboardPage;
