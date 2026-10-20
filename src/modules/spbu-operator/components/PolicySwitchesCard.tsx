// =============================================================================
// src/modules/spbu-operator/components/PolicySwitchesCard.tsx — NusaFuel Grid
// Monochrome Charcoal Section with Elevated Vision Card per design.md §2.2 & §6.3
// Left: Odd-Even Switch | Center: Elevated Dynamic Throttling | Right: 10% Reserve
// =============================================================================

import React, { useState } from 'react';
import { useStore } from '../../../app/store';
import type { SpbuStation } from '../../../core/data/bulelengSpbuSeed';
import {
  Calendar,
  Sliders,
  ShieldAlert,
} from 'lucide-react';

export interface PolicySwitchesCardProps {
  station: SpbuStation;
  operatorId: string;
}

export const PolicySwitchesCard: React.FC<PolicySwitchesCardProps> = ({
  station,
  operatorId,
}) => {
  const { toggleSpbuPolicy } = useStore();

  // Local state for interactive throttling threshold slider simulation
  const [throttlingThreshold, setThrottlingThreshold] = useState<number>(30);

  const handleToggle = (
    policy: 'oddEvenActive' | 'dynamicThrottlingActive' | 'emergencyReserveActive',
    currentVal: boolean
  ) => {
    toggleSpbuPolicy({
      spbuId: station.id,
      policy,
      value: !currentVal,
      operatorId,
    });
  };

  return (
    <section className="my-10 rounded-2xl bg-[#121316] text-white p-6 sm:p-10 border border-slate-800 shadow-xl relative overflow-hidden">
      {/* Background architectural pattern */}
      <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-transparent to-black/60 pointer-events-none" />

      {/* Section Header */}
      <div className="relative z-10 max-w-3xl mb-8">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-800/80 border border-slate-700 text-xs font-semibold text-[#FF9F1C] mb-3">
          <Sliders className="w-3.5 h-3.5" />
          <span>Matriks Kebijakan Distribusi & Automasi SPBU</span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-bold font-sans tracking-tight text-white leading-snug">
          Kontrol Kebijakan Operasional SPBU {station.code}
        </h2>
        <p className="text-xs sm:text-sm text-slate-400 mt-1 leading-relaxed">
          Aktifkan regulasi kuota adaptif secara mandiri. Perubahan saklar akan seketika tersinkronisasi ke seluruh antrean warga di Portal Warga.
        </p>
      </div>

      {/* 3-Column Layout: Left Dark | Center Elevated White Card | Right Dark (design.md §2.2) */}
      <div className="relative z-10 grid grid-cols-1 lg:grid-cols-3 gap-8 items-center">
        {/* Kolom 1 (Kiri): Automated Odd-Even Enforcement (Dark surface) */}
        <div className="flex flex-col justify-between h-full p-6 rounded-xl bg-slate-900/60 border border-slate-800/80">
          <div>
            <div className="flex items-center justify-between gap-2 mb-4">
              <div className="w-9 h-9 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-400">
                <Calendar className="w-5 h-5" />
              </div>
              <span
                className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded uppercase tracking-wider ${
                  station.oddEvenActive
                    ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                    : 'bg-slate-800 text-slate-400 border border-slate-700'
                }`}
              >
                {station.oddEvenActive ? 'ENFORCED' : 'BYPASS'}
              </span>
            </div>

            <h3 className="text-base font-bold text-white mb-2 leading-snug">
              Aturan Ganjil-Genap Otomatis
            </h3>

            <p className="text-xs text-slate-400 leading-relaxed mb-4">
              Mewajibkan validasi digit terakhir nomor polisi terhadap kalender paritas tanggal. Kendaraan yang tidak sesuai dialihkan otomatis ke jadwal pra-pesan H+1.
            </p>

            <div className="p-3 rounded-lg bg-black/40 border border-slate-800 text-[11px] text-slate-300 space-y-1.5">
              <div className="flex items-center justify-between">
                <span>Filter Plat Hari Ini:</span>
                <span className="font-bold text-white">
                  {new Date().getDate() % 2 !== 0 ? 'Ganjil (1,3,5,7,9)' : 'Genap (0,2,4,6,8)'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span>Status Penegakan:</span>
                <span className={station.oddEvenActive ? 'text-emerald-400 font-bold' : 'text-slate-400'}>
                  {station.oddEvenActive ? 'Aktif di Pompa' : 'Dibebaskan'}
                </span>
              </div>
            </div>
          </div>

          <div className="pt-5 mt-4 border-t border-slate-800/80">
            <button
              type="button"
              onClick={() => handleToggle('oddEvenActive', station.oddEvenActive)}
              className={`w-full py-2.5 px-4 rounded-xl text-xs font-bold transition-all shadow-sm ${
                station.oddEvenActive
                  ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                  : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700'
              }`}
            >
              {station.oddEvenActive ? 'Matikan Penegakan Ganjil-Genap' : 'Aktifkan Penegakan Ganjil-Genap'}
            </button>
          </div>
        </div>

        {/* Kolom 2 (Tengah): Elevated Solid White Card (Vision style per design.md §5.2) */}
        <div
          className="rounded-2xl p-7 bg-white text-slate-900 border border-white shadow-2xl relative transition-all"
          style={{
            boxShadow: '0 20px 45px rgba(0, 0, 0, 0.45)',
            transform: 'translateY(-4px)',
          }}
        >
          {/* Badge Top */}
          <div className="flex items-center justify-between mb-4">
            <div className="w-10 h-10 rounded-xl bg-[#FF5A5F]/10 flex items-center justify-center text-[#FF5A5F]">
              <Sliders className="w-5 h-5" />
            </div>
            <span
              className={`text-[10px] font-mono font-bold px-2.5 py-1 rounded-full uppercase tracking-wider ${
                station.dynamicThrottlingActive
                  ? 'bg-amber-100 text-amber-900 border border-amber-300'
                  : 'bg-slate-100 text-slate-600 border border-slate-300'
              }`}
            >
              {station.dynamicThrottlingActive ? 'THROTTLING AKTIF' : 'THROTTLING OFF'}
            </span>
          </div>

          <h3 className="text-lg font-bold text-slate-900 mb-1 leading-snug">
            Dynamic Quota Throttling
          </h3>
          <p className="text-xs text-slate-600 leading-relaxed mb-4">
            Secara adaptif memangkas kuota pengisian mobil saat stok tangki menipis demi pemerataan bahan bakar warga.
          </p>

          {/* Interactive Throttling Threshold Slider Preview */}
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 mb-4 space-y-2.5">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-slate-700">Ambang Batas Throttling:</span>
              <span className="font-mono font-extrabold text-[#FF5A5F] text-sm">
                &le; {throttlingThreshold}% Kapasitas
              </span>
            </div>
            <input
              type="range"
              min="15"
              max="45"
              step="5"
              value={throttlingThreshold}
              onChange={(e) => setThrottlingThreshold(Number(e.target.value))}
              className="w-full accent-[#FF5A5F] cursor-pointer"
            />

            {/* Quota Comparison Pills */}
            <div className="pt-2 border-t border-slate-200 grid grid-cols-2 gap-2 text-xs">
              <div className="p-2 rounded bg-white border border-slate-200 text-center">
                <span className="text-[10px] text-slate-400 block font-bold">KUOTA NORMAL</span>
                <span className="font-mono font-bold text-slate-800">Mobil 20 Liter</span>
              </div>
              <div className="p-2 rounded bg-amber-50 border border-amber-200 text-center">
                <span className="text-[10px] text-amber-700 block font-bold">THROTTLED</span>
                <span className="font-mono font-bold text-amber-900">Mobil 10 Liter</span>
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={() => handleToggle('dynamicThrottlingActive', station.dynamicThrottlingActive)}
            className="w-full btn-coral py-3 px-4 text-xs font-bold uppercase tracking-wider shadow-md"
          >
            {station.dynamicThrottlingActive ? 'Nonaktifkan Throttling' : 'Aktifkan Dynamic Throttling'}
          </button>
        </div>

        {/* Kolom 3 (Kanan): 10% Emergency Reserve Lock (Dark surface) */}
        <div className="flex flex-col justify-between h-full p-6 rounded-xl bg-slate-900/60 border border-slate-800/80">
          <div>
            <div className="flex items-center justify-between gap-2 mb-4">
              <div className="w-9 h-9 rounded-lg bg-red-500/10 flex items-center justify-center text-red-400">
                <ShieldAlert className="w-5 h-5" />
              </div>
              <span
                className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded uppercase tracking-wider ${
                  station.emergencyReserveActive
                    ? 'bg-red-950 text-red-400 border border-red-800'
                    : 'bg-slate-800 text-slate-400 border border-slate-700'
                }`}
              >
                {station.emergencyReserveActive ? 'RESERVE LOCKED' : 'UNLOCKED'}
              </span>
            </div>

            <h3 className="text-base font-bold text-white mb-2 leading-snug">
              Cadangan Darurat 10% (Safety Reserve)
            </h3>

            <p className="text-xs text-slate-400 leading-relaxed mb-4">
              Mengunci 10% sisa volume tangki BBM subsidi secara otomatis. Stok ini dilarang disalurkan ke masyarakat umum dan khusus melayani ambulans, damkar, dan logistik bencana BPBD.
            </p>

            <div className="p-3 rounded-lg bg-black/40 border border-slate-800 text-[11px] text-slate-300 space-y-1.5">
              <div className="flex items-center justify-between">
                <span>Volume Terkunci:</span>
                <span className="font-mono font-bold text-red-400">1.000 - 1.600 Liter</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Peruntukan Khusus:</span>
                <span className="font-semibold text-slate-200">Ambulans / Damkar</span>
              </div>
            </div>
          </div>

          <div className="pt-5 mt-4 border-t border-slate-800/80">
            <button
              type="button"
              onClick={() => handleToggle('emergencyReserveActive', station.emergencyReserveActive)}
              className={`w-full py-2.5 px-4 rounded-xl text-xs font-bold transition-all shadow-sm ${
                station.emergencyReserveActive
                  ? 'bg-red-600 hover:bg-red-700 text-white'
                  : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700'
              }`}
            >
              {station.emergencyReserveActive ? 'Buka Kunci Cadangan Darurat' : 'Kunci Cadangan Darurat 10%'}
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};
export default PolicySwitchesCard;
