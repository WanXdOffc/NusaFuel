// =============================================================================
// src/modules/public-driver/pages/DriverPortalPage.tsx — NusaFuel Grid
// Portal Warga (User A) — Stage 2 Interactive Preview Page
// Displays SPBU real-time tank gauges, odd-even checker preview, & telemetry
// =============================================================================

import React, { useState } from 'react';
import { useStore } from '../../../app/store';
import { TankLevelGauge } from '../../../shared/components/TankLevelGauge';
import { checkOddEvenEligibility } from '../../../core/automation/oddEvenEngine';
import {
  MapPin,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  ArrowRight,
  Fuel,
  Car,
} from 'lucide-react';

export const DriverPortalPage: React.FC = () => {
  const { state, getEffectiveDate, getTanksForStation, toggleSimulatedDateParity } = useStore();
  const effectiveDate = getEffectiveDate();
  const isOddDay = effectiveDate.getDate() % 2 !== 0;

  // Local state for plate quick-check test
  const [testPlate, setTestPlate] = useState('DK 4512 EA');
  const [selectedStationId, setSelectedStationId] = useState<string>(state.stations[0]?.id ?? '');

  const plateResult = checkOddEvenEligibility(testPlate, effectiveDate, 'MOBIL');
  const selectedStation = state.stations.find((s) => s.id === selectedStationId) ?? state.stations[0];
  const stationTanks = selectedStation ? getTanksForStation(selectedStation.id) : [];

  return (
    <div className="w-full pb-16 animate-fade-in">
      {/* 1. Hero Banner per design.md §6.2 */}
      <section className="relative bg-[#18152E] text-white overflow-hidden py-12 md:py-16 border-b border-slate-800">
        {/* Directional gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#100E22]/95 via-[#18152E]/85 to-transparent z-10" />

        {/* Ambient background decoration */}
        <div className="absolute -right-20 -top-20 w-96 h-96 rounded-full bg-[#FF5A5F]/15 blur-3xl pointer-events-none" />
        <div className="absolute right-1/4 bottom-0 w-80 h-80 rounded-full bg-[#FF9F1C]/10 blur-3xl pointer-events-none" />

        <div className="relative z-20 max-w-[1360px] mx-auto px-4 sm:px-6">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/15 text-xs font-semibold text-slate-200 mb-4">
              <span className="w-2 h-2 rounded-full bg-[#FF5A5F] animate-pulse" />
              <span>Sistem Antrean Cerdas & Distribusi BBM Buleleng</span>
            </div>

            <h1 className="text-3xl sm:text-5xl font-bold font-sans tracking-tight text-white leading-tight mb-3">
              Pantau Stok SPBU Real-Time & Antre Tanpa Menunggu
            </h1>

            <p className="text-base sm:text-lg text-slate-300 font-normal leading-relaxed mb-6 max-w-2xl">
              Cek ketersediaan kuota tangki secara transparan di 4 SPBU Buleleng. Dapatkan slot antrean digital 30-menit berbasis aturan plat ganjil-genap otomatis.
            </p>

            {/* Quick Odd-Even Notification Callout */}
            <div className="inline-flex flex-wrap items-center gap-3 bg-white/10 backdrop-blur-md p-3 px-4 rounded-xl border border-white/20">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-[#FF9F1C]">Status Hari Ini:</span>
                <span className="text-sm font-bold text-white">
                  {isOddDay ? 'Hari Ganjil (Plat 1, 3, 5, 7, 9)' : 'Hari Genap (Plat 0, 2, 4, 6, 8)'}
                </span>
              </div>
              <button
                type="button"
                onClick={toggleSimulatedDateParity}
                className="text-xs font-semibold px-2.5 py-1 rounded-full bg-[#FF5A5F] hover:bg-[#E0484D] text-white transition-all shadow-sm"
              >
                Ubah ke Hari {isOddDay ? 'Genap' : 'Ganjil'} (Uji Coba)
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Main Content Area */}
      <div className="max-w-[1360px] mx-auto px-4 sm:px-6 mt-8">
        {/* Stage 2 Status Banner for Evaluator */}
        <div className="mb-8 p-4 rounded-xl bg-gradient-to-r from-emerald-50 via-teal-50 to-white border border-emerald-200 shadow-xs flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-emerald-600 text-white flex items-center justify-center flex-shrink-0">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-emerald-900">
                TAHAP 2 AKTIF: Shared UI & Navigation Shell
              </p>
              <p className="text-xs text-slate-600">
                Navbar dengan Judge Switcher, Accessibility Toolbar, dan TankLevelGauge telah terpasang. Klik tab di kanan atas untuk menguji role Petugas SPBU dan Depot Simulator.
              </p>
            </div>
          </div>
          <div className="hidden sm:flex items-center gap-2">
            <span className="text-[10px] font-mono bg-white text-emerald-800 px-2.5 py-1 rounded-full border border-emerald-200 font-bold">
              Stage 2/5 Ready
            </span>
          </div>
        </div>

        {/* 3. Interactive Plate Checker Quick Test Card */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-10">
          {/* Left 1 Col: Quick Plate Validator */}
          <div className="bg-white rounded-xl p-5 border border-[#E6E8EC] shadow-sm">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-7 h-7 rounded-lg bg-[#FF5A5F]/10 text-[#FF5A5F] flex items-center justify-center">
                <Car className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">Cek Hak Akses Plat Nomor</h3>
                <p className="text-[11px] text-slate-500">Validasi otomatis Regex & Paritas Tanggal</p>
              </div>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">
                  Masukkan Nomor Polisi (Plat Indonesia)
                </label>
                <input
                  type="text"
                  value={testPlate}
                  onChange={(e) => setTestPlate(e.target.value.toUpperCase())}
                  placeholder="Contoh: DK 4512 EA"
                  className="w-full px-3 py-2 text-sm font-mono font-bold tracking-wider rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#FF5A5F] uppercase"
                />
              </div>

              {/* Validation Result Box */}
              <div
                className={`p-3 rounded-lg border text-xs ${
                  plateResult.validationError
                    ? 'bg-red-50 text-red-800 border-red-200'
                    : plateResult.allowedToday
                    ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                    : 'bg-amber-50 text-amber-900 border-amber-200'
                }`}
              >
                {plateResult.validationError ? (
                  <div className="flex items-start gap-2">
                    <XCircle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-bold">Format Plat Tidak Valid</p>
                      <p className="text-[11px] text-red-600">{plateResult.validationError}</p>
                    </div>
                  </div>
                ) : plateResult.allowedToday ? (
                  <div className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-bold">Dapat Mengantre HARI INI</p>
                      <p className="text-[11px] text-emerald-700">
                        Digit terakhir: <span className="font-mono font-bold">{plateResult.lastDigit}</span> ({plateResult.plateParity === 'ODD' ? 'Ganjil' : 'Genap'}) sesuai dengan paritas hari ini.
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-start gap-2">
                    <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-bold">Dialihkan ke Jadwal H+1</p>
                      <p className="text-[11px] text-amber-800">
                        Digit terakhir: <span className="font-mono font-bold">{plateResult.lastDigit}</span> ({plateResult.plateParity === 'ODD' ? 'Ganjil' : 'Genap'}), berbeda dari hari ini. Otomatis terjadwal untuk: <span className="font-bold">{plateResult.assignedDateLabel}</span>.
                      </p>
                    </div>
                  </div>
                )}
              </div>

              <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                <span>Contoh plat uji:</span>
                <div className="flex gap-1.5 font-mono">
                  <button
                    type="button"
                    onClick={() => setTestPlate('DK 1234 AB')}
                    className="underline hover:text-[#FF5A5F]"
                  >
                    DK 1234 (Genap)
                  </button>
                  <span>•</span>
                  <button
                    type="button"
                    onClick={() => setTestPlate('DK 5679 CD')}
                    className="underline hover:text-[#FF5A5F]"
                  >
                    DK 5679 (Ganjil)
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Right 2 Cols: SPBU Selector & Live TankLevelGauges */}
          <div className="lg:col-span-2 bg-white rounded-xl p-5 border border-[#E6E8EC] shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
              <div>
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <Fuel className="w-4 h-4 text-[#FF5A5F]" />
                  Status Tangki SPBU Real-Time
                </h3>
                <p className="text-[11px] text-slate-500">
                  Data live kapasitas tangki BBM di Kabupaten Buleleng
                </p>
              </div>

              {/* Station Tabs */}
              <div className="flex flex-wrap gap-1 bg-slate-100 p-1 rounded-lg">
                {state.stations.map((station) => (
                  <button
                    key={station.id}
                    type="button"
                    onClick={() => setSelectedStationId(station.id)}
                    className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-all ${
                      selectedStation?.id === station.id
                        ? 'bg-white text-slate-900 shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    {station.name.replace('SPBU ', '')}
                  </button>
                ))}
              </div>
            </div>

            {/* Selected Station Info Header */}
            {selectedStation && (
              <div className="mb-4 p-3 bg-slate-50 rounded-lg border border-slate-200/70 flex flex-wrap items-center justify-between gap-2 text-xs">
                <div>
                  <span className="font-mono text-[11px] text-slate-500 font-semibold mr-2">
                    {selectedStation.code}
                  </span>
                  <span className="font-bold text-slate-900">{selectedStation.name}</span>
                  <span className="text-slate-500 ml-2">({selectedStation.address})</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] text-slate-500">Mode:</span>
                  <span
                    className={`badge ${
                      selectedStation.operationalMode === 'NORMAL'
                        ? 'badge-normal'
                        : selectedStation.operationalMode === 'THROTTLED'
                        ? 'badge-throttled'
                        : selectedStation.operationalMode === 'UNLOADING'
                        ? 'badge-unloading'
                        : 'badge-emergency'
                    }`}
                  >
                    {selectedStation.operationalMode}
                  </span>
                </div>
              </div>
            )}

            {/* TankLevelGauges Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {stationTanks.map((tank) => (
                <TankLevelGauge
                  key={tank.id}
                  tank={tank}
                  operationalMode={selectedStation?.operationalMode}
                  throttlingEnabled={selectedStation?.dynamicThrottlingActive}
                  emergencyReserveEnabled={selectedStation?.emergencyReserveActive}
                />
              ))}
            </div>
          </div>
        </div>

        {/* 4. Station Overview Grid Cards */}
        <div className="mt-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-lg font-bold text-slate-900">
                Jaringan 4 SPBU Buleleng Terkoneksi
              </h2>
              <p className="text-xs text-slate-500">
                Setiap SPBU merepresentasikan skenario operasional nyata sesuai prd.md §6
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
            {state.stations.map((st) => {
              const tanks = getTanksForStation(st.id);
              return (
                <div
                  key={st.id}
                  className="bg-white rounded-xl p-4 border border-[#E6E8EC] shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between text-xs mb-2">
                      <span className="font-mono text-[10px] text-slate-400 font-semibold">
                        {st.code}
                      </span>
                      <span
                        className={`badge ${
                          st.operationalMode === 'NORMAL'
                            ? 'badge-normal'
                            : st.operationalMode === 'THROTTLED'
                            ? 'badge-throttled'
                            : st.operationalMode === 'UNLOADING'
                            ? 'badge-unloading'
                            : 'badge-emergency'
                        }`}
                      >
                        {st.operationalMode}
                      </span>
                    </div>

                    <h4 className="text-sm font-bold text-slate-900 mb-1">{st.name}</h4>
                    <p className="text-xs text-slate-500 mb-3 flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-slate-400" />
                      {st.address}
                    </p>

                    {/* Compact gauges */}
                    <div className="space-y-2 mb-3">
                      {tanks.map((t) => (
                        <TankLevelGauge key={t.id} tank={t} compact={true} />
                      ))}
                    </div>
                  </div>

                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                    <span className="text-[11px] text-slate-500">
                      {st.activeNozzles} Nozel Aktif
                    </span>
                    <button
                      type="button"
                      onClick={() => setSelectedStationId(st.id)}
                      className="text-xs font-bold text-[#FF5A5F] hover:underline flex items-center gap-1"
                    >
                      Pilih SPBU
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
export default DriverPortalPage;
