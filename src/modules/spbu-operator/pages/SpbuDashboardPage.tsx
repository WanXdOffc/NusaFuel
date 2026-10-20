// =============================================================================
// src/modules/spbu-operator/pages/SpbuDashboardPage.tsx — NusaFuel Grid
// Petugas SPBU (User B) — Stage 2 Interactive Preview Dashboard
// Operational toggles, DO restock tester, live tank gauges & cashier verification
// =============================================================================

import React, { useState } from 'react';
import { useStore } from '../../../app/store';
import { TankLevelGauge } from '../../../shared/components/TankLevelGauge';
import {
  Fuel,
  Sliders,
  CheckCircle2,
  QrCode,
  Truck,
} from 'lucide-react';

export const SpbuDashboardPage: React.FC = () => {
  const {
    state,
    getStation,
    getTanksForStation,
    toggleSpbuPolicy,
    updateTankDoLiters,
    verifyTicketQr,
  } = useStore();

  const [selectedStationId, setSelectedStationId] = useState<string>(
    state.stations[0]?.id ?? ''
  );
  const [doLitersInput, setDoLitersInput] = useState<number>(8000);
  const [verificationFeedback, setVerificationFeedback] = useState<string | null>(null);

  const currentStation = getStation(selectedStationId) ?? state.stations[0];
  const stationTanks = currentStation ? getTanksForStation(currentStation.id) : [];

  // Find booked tickets for this station
  const stationTickets = state.tickets.filter(
    (t) => t.spbuId === currentStation?.id
  );

  // Quick test for DO refill
  const handleRefillPertalite = () => {
    const pertaliteTank = stationTanks.find((t) => t.fuelType === 'Pertalite');
    if (!pertaliteTank || !currentStation) return;
    updateTankDoLiters({
      spbuId: currentStation.id,
      tankId: pertaliteTank.id,
      addLiters: doLitersInput,
      startUnloadingTimer: true,
      operatorId: 'op-buleleng-01',
    });
  };

  // Quick test for ticket verification
  const handleVerifyTicket = (ticket: (typeof stationTickets)[0]) => {
    const result = verifyTicketQr({
      ticketId: ticket.id,
      operatorId: 'op-buleleng-01',
    });

    if (result.success) {
      setVerificationFeedback(
        `Sukses verifikasi tiket ${ticket.ticketCode} (${ticket.plateNumber}). Kuota ${ticket.quotaLiters}L berhasil disalurkan.`
      );
    } else {
      setVerificationFeedback(`Gagal: ${result.errorMessage ?? 'Gagal memverifikasi tiket'}`);
    }
  };

  return (
    <div className="w-full pb-16 animate-fade-in">
      {/* Header bar */}
      <section className="bg-[#121316] text-white py-8 border-b border-slate-800">
        <div className="max-w-[1360px] mx-auto px-4 sm:px-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-800 border border-slate-700 text-xs font-semibold text-[#FF9F1C] mb-2">
                <Fuel className="w-3.5 h-3.5" />
                <span>Konsol Kasir & Operator SPBU (User B)</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold font-sans">
                Manajemen Operasional Tangki & Kasir SPBU
              </h1>
              <p className="text-xs sm:text-sm text-slate-400 mt-1">
                Kontrol kebijakan antrean, input DO truk tangki Pertamina, dan validasi tiket QR warga.
              </p>
            </div>

            {/* Station Switcher */}
            <div className="bg-slate-900 p-2 rounded-xl border border-slate-800">
              <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                Pilih SPBU Aktif:
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
      </section>

      {/* Main container */}
      <div className="max-w-[1360px] mx-auto px-4 sm:px-6 mt-8">
        {/* Verification feedback alert */}
        {verificationFeedback && (
          <div className="mb-6 p-4 rounded-xl bg-blue-50 border border-blue-200 text-xs text-blue-900 flex items-center justify-between gap-3 animate-fade-in">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-blue-600 flex-shrink-0" />
              <span>{verificationFeedback}</span>
            </div>
            <button
              type="button"
              onClick={() => setVerificationFeedback(null)}
              className="text-xs font-bold text-blue-600 hover:underline"
            >
              Tutup
            </button>
          </div>
        )}

        {/* Top Grid: Policies & Fast DO Input */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Col 1: Operational Policy Switches (PRD §4.2 & §4.4) */}
          <div className="bg-white rounded-xl p-5 border border-[#E6E8EC] shadow-sm">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-7 h-7 rounded-lg bg-[#FF5A5F]/10 text-[#FF5A5F] flex items-center justify-center">
                <Sliders className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">Kebijakan SPBU Dinamis</h3>
                <p className="text-[11px] text-slate-500">Sakelar otomatis per SPBU</p>
              </div>
            </div>

            {currentStation && (
              <div className="space-y-4">
                {/* Switch 1: Odd-Even */}
                <div className="flex items-center justify-between p-3 rounded-lg bg-slate-50 border border-slate-200/80">
                  <div>
                    <p className="text-xs font-bold text-slate-800">Aturan Ganjil-Genap</p>
                    <p className="text-[10px] text-slate-500">
                      Wajibkan validasi plat sesuai tanggal
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() =>
                      toggleSpbuPolicy({
                        spbuId: currentStation.id,
                        policy: 'oddEvenActive',
                        value: !currentStation.oddEvenActive,
                        operatorId: 'op-buleleng-01',
                      })
                    }
                    className={`px-3 py-1 text-xs font-bold rounded-full transition-colors ${
                      currentStation.oddEvenActive
                        ? 'bg-emerald-600 text-white'
                        : 'bg-slate-200 text-slate-700'
                    }`}
                  >
                    {currentStation.oddEvenActive ? 'AKTIF' : 'NONAKTIF'}
                  </button>
                </div>

                {/* Switch 2: Dynamic Throttling */}
                <div className="flex items-center justify-between p-3 rounded-lg bg-slate-50 border border-slate-200/80">
                  <div>
                    <p className="text-xs font-bold text-slate-800">Dynamic Throttling (&lt;30%)</p>
                    <p className="text-[10px] text-slate-500">
                      Batasi kuota mobil jadi 10L saat stok menipis
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() =>
                      toggleSpbuPolicy({
                        spbuId: currentStation.id,
                        policy: 'dynamicThrottlingActive',
                        value: !currentStation.dynamicThrottlingActive,
                        operatorId: 'op-buleleng-01',
                      })
                    }
                    className={`px-3 py-1 text-xs font-bold rounded-full transition-colors ${
                      currentStation.dynamicThrottlingActive
                        ? 'bg-[#FF9F1C] text-white'
                        : 'bg-slate-200 text-slate-700'
                    }`}
                  >
                    {currentStation.dynamicThrottlingActive ? 'AKTIF' : 'NONAKTIF'}
                  </button>
                </div>

                {/* Switch 3: Emergency Reserve */}
                <div className="flex items-center justify-between p-3 rounded-lg bg-slate-50 border border-slate-200/80">
                  <div>
                    <p className="text-xs font-bold text-slate-800">Cadangan Darurat 10%</p>
                    <p className="text-[10px] text-slate-500">
                      Kunci 10% kapasitas untuk ambulans/damkar
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() =>
                      toggleSpbuPolicy({
                        spbuId: currentStation.id,
                        policy: 'emergencyReserveActive',
                        value: !currentStation.emergencyReserveActive,
                        operatorId: 'op-buleleng-01',
                      })
                    }
                    className={`px-3 py-1 text-xs font-bold rounded-full transition-colors ${
                      currentStation.emergencyReserveActive
                        ? 'bg-red-600 text-white'
                        : 'bg-slate-200 text-slate-700'
                    }`}
                  >
                    {currentStation.emergencyReserveActive ? 'AKTIF' : 'NONAKTIF'}
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Col 2: Fast DO Input (Tanker Refill) */}
          <div className="bg-white rounded-xl p-5 border border-[#E6E8EC] shadow-sm">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                <Truck className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">Input Delivery Order (DO)</h3>
                <p className="text-[11px] text-slate-500">Penerimaan pasokan truk tangki Pertamina</p>
              </div>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">
                  Volume DO Masuk (Liter)
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    value={doLitersInput}
                    onChange={(e) => setDoLitersInput(Number(e.target.value))}
                    step="1000"
                    min="1000"
                    max="16000"
                    className="w-full px-3 py-2 text-sm font-mono font-bold rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#FF5A5F]"
                  />
                  <span className="text-xs font-bold text-slate-500">Liter</span>
                </div>
              </div>

              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-xs text-slate-600">
                <p className="font-semibold text-slate-800 mb-1">Simulasi Bongkar Muat (Unloading):</p>
                <p className="text-[11px]">
                  Mengisi stok tangki Pertalite dan mengaktifkan status mode UNLOADING (45 menit). Nozel dinonaktifkan sementara demi keselamatan.
                </p>
              </div>

              <button
                type="button"
                onClick={handleRefillPertalite}
                className="w-full py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold flex items-center justify-center gap-2 transition-all shadow-sm"
              >
                <Truck className="w-4 h-4" />
                <span>Simulasikan Bongkar DO Pertalite ({doLitersInput.toLocaleString()}L)</span>
              </button>
            </div>
          </div>

          {/* Col 3: Cashier QR Verification Quick Test */}
          <div className="bg-white rounded-xl p-5 border border-[#E6E8EC] shadow-sm">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <QrCode className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">Validasi Tiket Antrean Warga</h3>
                <p className="text-[11px] text-slate-500">Verifikasi kriptografis SHA-256 kasir</p>
              </div>
            </div>

            <div className="space-y-2">
              <p className="text-xs text-slate-600 mb-2">
                Daftar tiket warga di {currentStation?.name}:
              </p>

              {stationTickets.length === 0 ? (
                <div className="p-4 text-center text-xs text-slate-400 bg-slate-50 rounded-lg">
                  Belum ada tiket antrean di SPBU ini.
                </div>
              ) : (
                <div className="max-h-56 overflow-y-auto space-y-2 pr-1">
                  {stationTickets.map((t) => (
                    <div
                      key={t.id}
                      className="p-2.5 bg-slate-50 rounded-lg border border-slate-200 flex items-center justify-between text-xs"
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-slate-900">
                            {t.plateNumber}
                          </span>
                          <span
                            className={`badge text-[9px] py-0.2 px-1.5 ${
                              t.status === 'COMPLETED'
                                ? 'badge-normal'
                                : t.status === 'BLOCKED_HOARDING'
                                ? 'badge-critical'
                                : 'badge-warning'
                            }`}
                          >
                            {t.status}
                          </span>
                        </div>
                        <p className="text-[10px] text-slate-500 mt-0.5 font-mono">
                          {t.ticketCode} • {t.fuelType} ({t.quotaLiters}L)
                        </p>
                      </div>

                      {t.status === 'BOOKED' && (
                        <button
                          type="button"
                          onClick={() => handleVerifyTicket(t)}
                          className="px-2.5 py-1 text-[11px] font-bold rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white transition-all shadow-2xs"
                        >
                          Verifikasi
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Bottom Section: Live Tank Gauges for Selected SPBU */}
        <div className="bg-white rounded-xl p-6 border border-[#E6E8EC] shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Fuel className="w-5 h-5 text-[#FF5A5F]" />
                Sensor Kapasitas Tangki — {currentStation?.name}
              </h3>
              <p className="text-xs text-slate-500">
                Alat ukur telemetri digital real-time dengan status operasional dan peringatan otomatis
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {stationTanks.map((tank) => (
              <TankLevelGauge
                key={tank.id}
                tank={tank}
                operationalMode={currentStation?.operationalMode}
                throttlingEnabled={currentStation?.dynamicThrottlingActive}
                emergencyReserveEnabled={currentStation?.emergencyReserveActive}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
export default SpbuDashboardPage;
