// =============================================================================
// src/modules/spbu-operator/pages/SpbuDashboardPage.tsx — NusaFuel Grid
// User B: Operator SPBU Terminal (12 SPBU across Bali Island)
// Organized in 3 Bento Grid Rows:
// - Row 1: 3 Tank Level Gauges (Pertalite, Pertamax, Solar) with clean progress bars
// - Row 2: Policy Control Panel (Odd-Even, Throttling <30%, Emergency Lock 10%)
//          side-by-side with Delivery Order & K3 Unloading Form
// - Row 3: Cashier QR & Plate Scanner (1-Tap Verification & Cross-SPBU Anti-Hoarding)
// =============================================================================

import React, { useState } from 'react';
import { useStore } from '../../../app/store';
import { useAuth } from '../../../core/auth/authContext';
import { PolicySwitchesCard } from '../components/PolicySwitchesCard';
import { DoTankerForm } from '../components/DoTankerForm';
import { CashierQrScanner } from '../components/CashierQrScanner';
import { TankLevelGauge } from '../../../shared/components/TankLevelGauge';
import {
  Fuel,
  MapPin,
  UserCheck,
  Building2,
  Calendar,
} from 'lucide-react';

export const SpbuDashboardPage: React.FC = () => {
  const { state, getStation, getTanksForStation, getEffectiveDate } = useStore();
  const { currentUser } = useAuth();

  // Selected station in Bali
  const [selectedStationId, setSelectedStationId] = useState<string>(
    currentUser?.spbuId ?? state.stations[0]?.id ?? ''
  );

  const effectiveDate = getEffectiveDate();
  const isOddDay = effectiveDate.getDate() % 2 !== 0;

  const operatorName = currentUser?.name ?? 'I Ketut Ariawan';
  const operatorId = currentUser?.id ?? 'OPR-BALI-81101';
  const shiftLabel = 'Shift Operasional WITA';

  const currentStation = getStation(selectedStationId) ?? state.stations[0];
  const stationTanks = currentStation ? getTanksForStation(currentStation.id) : [];

  return (
    <div className="w-full pb-20 animate-fade-in font-sans">
      {/* 1. Header Operasional & Station Switcher across 12 SPBU Bali */}
      <section className="bg-[#121316] text-white py-10 border-b border-slate-800">
        <div className="max-w-[1240px] mx-auto px-6 md:px-10">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div>
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-800 border border-slate-700 text-xs font-semibold text-[#FF9F1C] mb-3">
                <Fuel className="w-3.5 h-3.5" />
                <span>Terminal Operasional SPBU & Pengawasan Nozel</span>
              </div>
              <h1 className="text-2xl sm:text-4xl font-extrabold font-sans tracking-tight text-white leading-tight">
                Manajemen Distribusi & Pompa {currentStation.name}
              </h1>
              <p className="text-xs sm:text-sm text-slate-400 mt-2 flex items-center gap-2">
                <MapPin className="w-3.5 h-3.5 text-slate-500" />
                <span>
                  {currentStation.address}, {currentStation.regency}
                </span>
                <span>•</span>
                <span className="font-mono text-slate-300">Kode: {currentStation.code}</span>
              </p>
            </div>

            {/* Operator Session Card & Station Selector */}
            <div className="flex flex-wrap items-center gap-4">
              {/* Operator Badge */}
              <div className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800 flex items-center gap-3 text-xs shadow-md">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center font-bold">
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

              {/* Station Dropdown Selector (12 SPBU Bali) */}
              <div className="bg-slate-900 p-2.5 rounded-2xl border border-slate-800 shadow-md">
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1 flex items-center gap-1">
                  <Building2 className="w-3 h-3 text-[#FF5A5F]" />
                  <span>Pilih Stasiun Bertugas:</span>
                </label>
                <select
                  value={selectedStationId}
                  onChange={(e) => setSelectedStationId(e.target.value)}
                  className="bg-slate-800 text-white text-xs font-bold px-3 py-2 rounded-xl border border-slate-700 focus:outline-none focus:ring-2 focus:ring-[#FF5A5F] max-w-xs"
                >
                  {state.stations.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.code} — {s.name} ({s.regency})
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Bento Grid Container (3 Rows with Consistent Gap-6 and Max-w-[1240px]) */}
      <div className="max-w-[1240px] mx-auto px-6 md:px-10 py-10 space-y-6">
        {/* =================================================================== */}
        {/* ROW 1: 3 Fuel Tank Level Gauges (Pertalite, Pertamax, Biosolar)     */}
        {/* =================================================================== */}
        <div className="space-y-3">
          <div className="flex items-center justify-between pb-1 border-b border-slate-200">
            <div>
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#FF5A5F] block">
                BENTO ROW 01 • TELEMETRI SENSOR ATG
              </span>
              <h2 className="text-xl font-bold font-sans text-slate-900">
                Level Kapasitas Tangki BBM Bawah Tanah
              </h2>
            </div>

            <div className="flex items-center gap-3">
              <span className="text-xs font-semibold text-slate-600 bg-slate-100 px-3 py-1 rounded-full border border-slate-200">
                {currentStation.activeNozzles} Nozel Terkoneksi
              </span>
              <span className="text-xs font-semibold text-slate-600 bg-slate-100 px-3 py-1 rounded-full border border-slate-200 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-slate-500" />
                <span>Regulasi Hari Ini: {isOddDay ? 'Ganjil' : 'Genap'}</span>
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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

        {/* =================================================================== */}
        {/* ROW 2: Policy Controls (Left) Side-by-Side with Inbound DO Form    */}
        {/* =================================================================== */}
        <div className="space-y-3">
          <div className="pb-1 border-b border-slate-200">
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#FF9F1C] block">
              BENTO ROW 02 • OTONOMI & SUPPLY INBOUND
            </span>
            <h2 className="text-xl font-bold font-sans text-slate-900">
              Kebijakan Kuota Adaptif & Penerimaan Truk Tangki
            </h2>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
            {/* Left Column (6 Cols): Policy Switches Card */}
            <div className="lg:col-span-6 flex flex-col">
              <PolicySwitchesCard
                station={currentStation}
                operatorId={operatorName}
              />
            </div>

            {/* Right Column (6 Cols): Tanker Reception & Safety Timer */}
            <div className="lg:col-span-6 flex flex-col">
              <DoTankerForm
                station={currentStation}
                tanks={stationTanks}
                operatorId={operatorName}
              />
            </div>
          </div>
        </div>

        {/* =================================================================== */}
        {/* ROW 3: Cashier QR & Plate Scanner (1-Tap & Cross-SPBU Anti-Hoarding)*/}
        {/* =================================================================== */}
        <div className="space-y-3">
          <div className="pb-1 border-b border-slate-200">
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-blue-600 block">
              BENTO ROW 03 • POS CASHIER & AUDIT SECURITY
            </span>
            <h2 className="text-xl font-bold font-sans text-slate-900">
              Kasir Scanner QR & Penegakan Anti-Ngangsu Lintas-SPBU
            </h2>
          </div>

          <CashierQrScanner
            station={currentStation}
            operatorId={operatorName}
          />
        </div>
      </div>
    </div>
  );
};
export default SpbuDashboardPage;
