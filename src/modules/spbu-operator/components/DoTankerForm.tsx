// =============================================================================
// src/modules/spbu-operator/components/DoTankerForm.tsx — NusaFuel Grid
// Delivery Order (DO) Tanker Inbound Form & K3 Unloading Safety Mode
// Compliant with prd.md §3.2, §4.3 and design.md §5.2
// =============================================================================

import React, { useState } from 'react';
import { useStore } from '../../../app/store';
import type { SpbuStation, FuelTank } from '../../../core/data/bulelengSpbuSeed';
import {
  Truck,
  RotateCw,
  CheckCircle2,
} from 'lucide-react';

export interface DoTankerFormProps {
  station: SpbuStation;
  tanks: FuelTank[];
  operatorId: string;
}

export const DoTankerForm: React.FC<DoTankerFormProps> = ({
  station,
  tanks,
  operatorId,
}) => {
  const { updateTankDoLiters } = useStore();

  const [selectedTankId, setSelectedTankId] = useState<string>(
    tanks.find((t) => t.fuelType === 'Pertalite')?.id ?? tanks[0]?.id ?? ''
  );
  const [doLiters, setDoLiters] = useState<number>(8000);
  const [activeNozzles, setActiveNozzles] = useState<number>(station.activeNozzles);
  const [startUnloadingTimer, setStartUnloadingTimer] = useState<boolean>(true);
  const [feedback, setFeedback] = useState<string | null>(null);

  const selectedTank = tanks.find((t) => t.id === selectedTankId) ?? tanks[0];
  const isCurrentlyUnloading =
    station.operationalMode === 'UNLOADING' || (selectedTank?.unloadingMinutesLeft ?? 0) > 0;

  const handleSubmitDo = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTank) return;

    updateTankDoLiters({
      spbuId: station.id,
      tankId: selectedTank.id,
      addLiters: doLiters,
      activeNozzles,
      startUnloadingTimer,
      operatorId,
    });

    setFeedback(
      `Sukses mencatat DO +${doLiters.toLocaleString('id-ID')} Liter ${selectedTank.fuelType}. ` +
        (startUnloadingTimer
          ? 'Mode Bongkar Muat (Unloading) K3 diaktifkan selama 30 menit. Nozel pengisian diistirahatkan sementara.'
          : 'Stok tangki langsung tersedia untuk penyaluran.')
    );
  };

  const handleFinishUnloadingNow = () => {
    if (!selectedTank) return;
    // Update tank with 0 added liters and startUnloadingTimer: false to end unloading
    updateTankDoLiters({
      spbuId: station.id,
      tankId: selectedTank.id,
      addLiters: 0,
      activeNozzles: station.activeNozzles,
      startUnloadingTimer: false,
      operatorId,
    });
    setFeedback('Proses bongkar muat K3 selesai. Nozel pompa kembali aktif normal.');
  };

  return (
    <div className="rounded-2xl bg-white border border-[#E6E8EC] p-6 sm:p-8 shadow-sm">
      {/* Form Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-4 mb-6 border-b border-slate-200">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
            <Truck className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-900 leading-snug">
              Penerimaan Pasokan Truk Tangki (Delivery Order)
            </h3>
            <p className="text-xs text-slate-500">
              Sinkronisasi data faktur pengiriman BBM Pertamina dan aktivasi timer keselamatan K3
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[10px] font-mono text-slate-400">STATUS OPERASIONAL:</span>
          <span
            className={`badge ${
              isCurrentlyUnloading
                ? 'badge-unloading'
                : station.operationalMode === 'NORMAL'
                ? 'badge-normal'
                : 'badge-throttled'
            }`}
          >
            {isCurrentlyUnloading ? 'SEDANG BONGKAR MUAT' : station.operationalMode}
          </span>
        </div>
      </div>

      {/* Success / Info Feedback Banner */}
      {feedback && (
        <div className="mb-6 p-4 rounded-xl bg-blue-50 border border-blue-200 text-xs text-blue-900 flex items-start justify-between gap-3 animate-slide-in-up">
          <div className="flex items-start gap-2">
            <CheckCircle2 className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
            <p>{feedback}</p>
          </div>
          <button
            type="button"
            onClick={() => setFeedback(null)}
            className="text-xs font-bold text-blue-600 hover:underline flex-shrink-0"
          >
            Tutup
          </button>
        </div>
      )}

      {/* Active Unloading Emergency Banner */}
      {isCurrentlyUnloading && (
        <div className="mb-6 p-4 rounded-xl bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-300 text-xs text-blue-900 flex flex-wrap items-center justify-between gap-4 animate-slide-in-up">
          <div className="flex items-center gap-3">
            <RotateCw className="w-5 h-5 text-blue-600 animate-spin-slow flex-shrink-0" />
            <div>
              <p className="font-extrabold text-blue-900">
                Mode Bongkar Muat Tangki Aktif — Sisa ±{selectedTank?.unloadingMinutesLeft ?? 30} Menit
              </p>
              <p className="text-[11px] text-blue-700">
                SOP Keselamatan K3: Nozel dinonaktifkan di Portal Warga untuk mencegah turbulensi tangki bawah tanah.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleFinishUnloadingNow}
            className="py-2 px-4 rounded-full bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs uppercase tracking-wider transition-all shadow-sm"
          >
            Selesaikan Bongkar Muat Sekarang (Uji Juri)
          </button>
        </div>
      )}

      {/* DO Inbound Form */}
      <form onSubmit={handleSubmitDo} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Field 1: Tank Selection */}
          <div>
            <label className="block text-xs font-bold text-slate-800 mb-2 uppercase tracking-wider">
              Pilih Tangki Tujuan
            </label>
            <div className="space-y-2">
              {tanks.map((t) => {
                const isSelected = selectedTankId === t.id;
                const fillPct = Math.round((t.currentLiters / t.maxCapacityLiters) * 100);
                return (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => setSelectedTankId(t.id)}
                    className={`w-full p-3 rounded-xl border text-left transition-all flex items-center justify-between ${
                      isSelected
                        ? 'bg-blue-50/70 border-blue-500 ring-2 ring-blue-500/20'
                        : 'bg-slate-50 border-slate-200 hover:bg-slate-100 text-slate-700'
                    }`}
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-slate-900">{t.fuelType}</span>
                        <span className="text-[10px] font-mono text-slate-500">
                          ({fillPct}%)
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 font-mono mt-0.5">
                        {t.currentLiters.toLocaleString('id-ID')} / {t.maxCapacityLiters.toLocaleString('id-ID')} L
                      </p>
                    </div>

                    <div className="w-12 h-2 rounded-full bg-slate-200 overflow-hidden">
                      <div
                        className="h-full bg-blue-600 rounded-full"
                        style={{ width: `${fillPct}%` }}
                      />
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Field 2: DO Volume Liters */}
          <div>
            <label className="block text-xs font-bold text-slate-800 mb-2 uppercase tracking-wider">
              Volume DO Truk Tangki (Liter)
            </label>
            <div className="relative">
              <input
                type="number"
                value={doLiters}
                onChange={(e) => setDoLiters(Math.max(0, Number(e.target.value)))}
                step="500"
                min="500"
                max="24000"
                required
                className="w-full px-4 py-3 text-lg font-mono font-bold rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50 text-slate-900"
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">
                LITER
              </span>
            </div>

            {/* Quick volume presets */}
            <div className="mt-2.5 grid grid-cols-3 gap-1.5">
              {[
                { label: '+4.000 L', value: 4000, desc: '1/2 Truk' },
                { label: '+8.000 L', value: 8000, desc: '1 Kompartemen' },
                { label: '+16.000 L', value: 16000, desc: 'Truk Gandeng' },
              ].map((p) => (
                <button
                  key={p.value}
                  type="button"
                  onClick={() => setDoLiters(p.value)}
                  className={`py-1.5 px-2 rounded-lg border text-center transition-all ${
                    doLiters === p.value
                      ? 'bg-blue-600 text-white border-blue-600 font-bold shadow-xs'
                      : 'bg-white text-slate-600 border-slate-200 hover:border-blue-400 text-xs'
                  }`}
                >
                  <span className="text-[11px] font-mono block leading-tight">{p.label}</span>
                  <span className="text-[9px] opacity-75">{p.desc}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Field 3: Nozzles & Safety Timer Controls */}
          <div className="flex flex-col justify-between">
            <div>
              <label className="block text-xs font-bold text-slate-800 mb-2 uppercase tracking-wider">
                Pengaturan Pompa & Nozel Aktif
              </label>

              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-slate-700">Jumlah Nozel Operasional:</span>
                  <span className="font-mono font-extrabold text-blue-700 text-sm">
                    {activeNozzles} Nozel
                  </span>
                </div>
                <input
                  type="range"
                  min="2"
                  max="8"
                  value={activeNozzles}
                  onChange={(e) => setActiveNozzles(Number(e.target.value))}
                  className="w-full accent-blue-600 cursor-pointer"
                />

                <div className="pt-2 border-t border-slate-200">
                  <label className="flex items-start gap-2.5 cursor-pointer text-xs">
                    <input
                      type="checkbox"
                      checked={startUnloadingTimer}
                      onChange={(e) => setStartUnloadingTimer(e.target.checked)}
                      className="mt-0.5 w-4 h-4 rounded text-blue-600 focus:ring-blue-500 border-slate-300"
                    />
                    <span className="text-slate-700 font-medium leading-tight">
                      Aktifkan Timer Bongkar K3 (30 Menit Mode Unloading)
                    </span>
                  </label>
                </div>
              </div>
            </div>

            <div className="mt-4">
              <button
                type="submit"
                className="w-full py-3 px-5 rounded-full bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-md transition-all active:scale-98"
              >
                <Truck className="w-4 h-4" />
                <span>Simpan DO & Perbarui Stok SPBU</span>
              </button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};
export default DoTankerForm;
