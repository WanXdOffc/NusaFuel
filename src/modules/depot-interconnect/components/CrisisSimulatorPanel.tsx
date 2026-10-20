// =============================================================================
// src/modules/depot-interconnect/components/CrisisSimulatorPanel.tsx — NusaFuel Grid
// Coral-Red Highlight Banner per design.md §2.5, §5.2 & §6.5
// 1-Click Evaluation Suite for UINIC 8.0 Competition Judges
// =============================================================================

import React, { useState } from 'react';
import { useStore } from '../../../app/store';
import {
  Zap,
  ShieldAlert,
  CheckCircle2,
  RotateCcw,
  Sparkles,
  Truck,
  TrendingDown,
} from 'lucide-react';

export const CrisisSimulatorPanel: React.FC = () => {
  const { simulateCrisisEvent } = useStore();
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const handleTrigger = (
    eventName:
      | 'SURGE_QUEUE'
      | 'SIMULATE_HOARDING'
      | 'FINISH_UNLOADING_BANYUASRI'
      | 'RESET_TO_SEED',
    label: string
  ) => {
    simulateCrisisEvent(eventName);
    setToastMessage(`Simulasi Berhasil: ${label}`);
    setTimeout(() => setToastMessage(null), 5000);
  };

  return (
    <div
      className="rounded-3xl p-6 sm:p-10 text-white relative overflow-hidden shadow-2xl transition-all"
      style={{
        background: '#FF5A5F',
        borderRadius: '20px',
      }}
    >
      {/* Decorative ambient shapes */}
      <div className="absolute -right-16 -top-16 w-64 h-64 rounded-full bg-white/10 blur-2xl pointer-events-none" />
      <div className="absolute right-1/4 -bottom-16 w-80 h-80 rounded-full bg-[#FF9F1C]/25 blur-3xl pointer-events-none" />

      {/* Header */}
      <div className="relative z-10 max-w-3xl mb-8">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/20 backdrop-blur-md text-xs font-bold uppercase tracking-wider text-white mb-3">
          <Sparkles className="w-3.5 h-3.5 text-white" />
          <span>Panel Simulasi Ketahanan & Respons Krisis Regional</span>
        </div>

        <h2 className="text-2xl sm:text-4xl font-extrabold font-sans tracking-tight text-white leading-tight">
          Simulasi Cepat Tanggap Darurat & Otomasi Pasokan (1-Klik)
        </h2>

        <p className="text-xs sm:text-sm text-white/90 mt-2 leading-relaxed">
          Simulasikan skenario kedaruratan sistem (Dynamic Throttling, Auto-Restock Webhook, Anti-Hoarding, & K3 Unloading) secara instan untuk memastikan ketahanan pasokan energi di Provinsi Bali.
        </p>
      </div>

      {/* Toast Notification */}
      {toastMessage && (
        <div className="relative z-10 mb-6 p-3.5 rounded-xl bg-white text-slate-900 text-xs font-bold shadow-lg flex items-center justify-between gap-3 animate-slide-in-up">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
            <span>{toastMessage}</span>
          </div>
          <button
            type="button"
            onClick={() => setToastMessage(null)}
            className="text-[11px] text-slate-400 hover:text-slate-800"
          >
            Tutup
          </button>
        </div>
      )}

      {/* 4 Simulation Action Cards */}
      <div className="relative z-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        {/* Tombol 1: Rush Hour Gajah Mada */}
        <div className="rounded-2xl bg-white/10 backdrop-blur-md p-5 border border-white/20 flex flex-col justify-between hover:bg-white/15 transition-all">
          <div>
            <div className="flex items-center justify-between text-xs mb-3">
              <span className="font-mono text-[10px] font-bold bg-white/20 px-2 py-0.5 rounded uppercase">
                SCENARIO 1
              </span>
              <TrendingDown className="w-4 h-4 text-amber-300" />
            </div>

            <h4 className="text-sm font-bold text-white mb-1.5 leading-snug">
              Rush Hour di SPBU Gajah Mada (-1.500L)
            </h4>

            <p className="text-[11px] text-white/80 leading-relaxed mb-4">
              Menurunkan stok Pertalite hingga di bawah 20%. Seketika memicu status THROTTLED dan menerbitkan pesanan Auto-Restock Webhook ke Depot Manggis.
            </p>
          </div>

          <button
            type="button"
            onClick={() =>
              handleTrigger(
                'SURGE_QUEUE',
                'Rush Hour dipicu di SPBU Gajah Mada! Tangki menyentuh ambang <20% dan webhook restock aktif.'
              )
            }
            className="w-full py-2.5 px-3.5 rounded-xl bg-white text-[#FF5A5F] hover:bg-slate-100 font-bold text-xs uppercase tracking-wider transition-all shadow-md active:scale-95 flex items-center justify-center gap-1.5"
          >
            <Zap className="w-3.5 h-3.5 fill-[#FF5A5F]" />
            <span>Simulasikan Rush Hour</span>
          </button>
        </div>

        {/* Tombol 2: Percobaan Penimbunan Lintas-SPBU */}
        <div className="rounded-2xl bg-white/10 backdrop-blur-md p-5 border border-white/20 flex flex-col justify-between hover:bg-white/15 transition-all">
          <div>
            <div className="flex items-center justify-between text-xs mb-3">
              <span className="font-mono text-[10px] font-bold bg-white/20 px-2 py-0.5 rounded uppercase">
                SCENARIO 2
              </span>
              <ShieldAlert className="w-4 h-4 text-red-200" />
            </div>

            <h4 className="text-sm font-bold text-white mb-1.5 leading-snug">
              Percobaan Penimbunan / Ngangsu
            </h4>

            <p className="text-[11px] text-white/80 leading-relaxed mb-4">
              Mencoba meregistrasikan plat DK 9991 XX yang baru saja mengisi di SPBU A. Yani ke SPBU Gajah Mada. Mendemonstrasikan pemblokiran anti-hoarding.
            </p>
          </div>

          <button
            type="button"
            onClick={() =>
              handleTrigger(
                'SIMULATE_HOARDING',
                'Percobaan penimbunan DK 9991 XX berhasil DITOLAK otomatis oleh Anti-Hoarding Guard dan dicatat ke audit log.'
              )
            }
            className="w-full py-2.5 px-3.5 rounded-xl bg-white text-[#FF5A5F] hover:bg-slate-100 font-bold text-xs uppercase tracking-wider transition-all shadow-md active:scale-95 flex items-center justify-center gap-1.5"
          >
            <ShieldAlert className="w-3.5 h-3.5" />
            <span>Simulasikan Hoarding</span>
          </button>
        </div>

        {/* Tombol 3: Truk Tiba & Selesai Bongkar Banyuasri */}
        <div className="rounded-2xl bg-white/10 backdrop-blur-md p-5 border border-white/20 flex flex-col justify-between hover:bg-white/15 transition-all">
          <div>
            <div className="flex items-center justify-between text-xs mb-3">
              <span className="font-mono text-[10px] font-bold bg-white/20 px-2 py-0.5 rounded uppercase">
                SCENARIO 3
              </span>
              <Truck className="w-4 h-4 text-blue-200" />
            </div>

            <h4 className="text-sm font-bold text-white mb-1.5 leading-snug">
              Truk Tiba & Selesai Bongkar di Banyuasri
            </h4>

            <p className="text-[11px] text-white/80 leading-relaxed mb-4">
              Menyelesaikan proses unloading di SPBU Banyuasri (+8.000L). Mengubah status SPBU dari UNLOADING menjadi NORMAL dan mengaktifkan nozel kembali.
            </p>
          </div>

          <button
            type="button"
            onClick={() =>
              handleTrigger(
                'FINISH_UNLOADING_BANYUASRI',
                'Truk tangki selesai bongkar muat di Banyuasri. Status kembali NORMAL dan stok bertambah +8.000L.'
              )
            }
            className="w-full py-2.5 px-3.5 rounded-xl bg-white text-[#FF5A5F] hover:bg-slate-100 font-bold text-xs uppercase tracking-wider transition-all shadow-md active:scale-95 flex items-center justify-center gap-1.5"
          >
            <Truck className="w-3.5 h-3.5" />
            <span>Selesaikan Bongkar</span>
          </button>
        </div>

        {/* Tombol 4: Reset ke Kondisi Seed */}
        <div className="rounded-2xl bg-white/10 backdrop-blur-md p-5 border border-white/20 flex flex-col justify-between hover:bg-white/15 transition-all">
          <div>
            <div className="flex items-center justify-between text-xs mb-3">
              <span className="font-mono text-[10px] font-bold bg-white/20 px-2 py-0.5 rounded uppercase">
                SCENARIO 4
              </span>
              <RotateCcw className="w-4 h-4 text-emerald-200" />
            </div>

            <h4 className="text-sm font-bold text-white mb-1.5 leading-snug">
              Reset Seluruh Data ke Kondisi Awal
            </h4>

            <p className="text-[11px] text-white/80 leading-relaxed mb-4">
              Mengembalikan seluruh data 4 SPBU, level tangki, slot waktu, antrean tiket, dan pesanan restock ke kondisi awal (seed) untuk pengujian ulang.
            </p>
          </div>

          <button
            type="button"
            onClick={() =>
              handleTrigger(
                'RESET_TO_SEED',
                'Seluruh database relasional berhasil di-reset ke kondisi awal (Seed Buleleng SPBU).'
              )
            }
            className="w-full py-2.5 px-3.5 rounded-xl bg-white text-[#FF5A5F] hover:bg-slate-100 font-bold text-xs uppercase tracking-wider transition-all shadow-md active:scale-95 flex items-center justify-center gap-1.5"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Data (Seed)</span>
          </button>
        </div>
      </div>
    </div>
  );
};
export default CrisisSimulatorPanel;
