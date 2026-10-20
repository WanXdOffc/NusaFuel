// =============================================================================
// src/modules/spbu-operator/components/HoardingBlockAlert.tsx — NusaFuel Grid
// High-Impact Anti-Hoarding Security Violation Alert Card
// Compliant with prd.md §3.2, §4.3 and Cybersecurity Audit Logging
// =============================================================================

import React from 'react';
import type { HoardingCheckResult } from '../../../core/automation/antiHoardingGuard';
import {
  AlertOctagon,
  FileText,
  X,
} from 'lucide-react';

export interface HoardingBlockAlertProps {
  plateNumber: string;
  fuelType: string;
  hoardingResult: HoardingCheckResult;
  onDismiss: () => void;
  onConfirmBlock?: () => void;
}

export const HoardingBlockAlert: React.FC<HoardingBlockAlertProps> = ({
  plateNumber,
  fuelType,
  hoardingResult,
  onDismiss,
  onConfirmBlock,
}) => {
  return (
    <div className="rounded-2xl border-2 border-red-500 bg-red-50/95 p-6 shadow-xl text-red-950 animate-slide-in-up">
      {/* Top Warning Ribbon */}
      <div className="flex items-center justify-between pb-3 mb-4 border-b border-red-200">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-red-600 text-white flex items-center justify-center flex-shrink-0 shadow-sm">
            <AlertOctagon className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <h4 className="text-sm sm:text-base font-extrabold uppercase tracking-tight text-red-900 leading-none">
              Pelanggaran Batas Kuota Subsidi (Anti-Hoarding Alert)
            </h4>
            <p className="text-[11px] text-red-700 font-semibold mt-0.5">
              Sistem Otomasi Mendeteksi Pembelian Berulang Lintas-SPBU
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={onDismiss}
          className="p-1.5 text-red-500 hover:text-red-800 rounded-lg hover:bg-red-100 transition-colors"
          aria-label="Tutup peringatan"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Violation Breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div className="p-3.5 rounded-xl bg-white/90 border border-red-200 space-y-2 text-xs">
          <div className="flex items-center justify-between">
            <span className="text-slate-500 font-semibold">Nomor Polisi:</span>
            <span className="font-mono font-extrabold text-sm text-red-900">
              {plateNumber}
            </span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-slate-500 font-semibold">BBM yang Diajukan:</span>
            <span className="font-bold text-slate-900">{fuelType} (Subsidi)</span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-slate-500 font-semibold">Status Transaksi:</span>
            <span className="font-mono font-bold text-red-700 bg-red-100 px-2 py-0.5 rounded text-[10px]">
              BLOCKED_HOARDING
            </span>
          </div>
        </div>

        <div className="p-3.5 rounded-xl bg-white/90 border border-red-200 space-y-2 text-xs">
          <div className="flex items-center justify-between">
            <span className="text-slate-500 font-semibold">SPBU Transaksi Terakhir:</span>
            <span className="font-bold text-slate-900 text-right truncate max-w-[170px]">
              {hoardingResult.previousSpbuName ?? 'SPBU Buleleng Lain'}
            </span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-slate-500 font-semibold">Volume Pengisian Sebelumnya:</span>
            <span className="font-mono font-bold text-slate-900">
              {hoardingResult.previousQuotaLiters ?? 20} Liter
            </span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-slate-500 font-semibold">Ketentuan Cooldown:</span>
            <span className="font-semibold text-red-700">12 Jam / 1x Per Hari</span>
          </div>
        </div>
      </div>

      {/* Regulatory & Security Audit Reference */}
      <div className="p-3 rounded-xl bg-red-100/70 border border-red-300 text-[11px] text-red-900 flex items-start gap-2.5 mb-4">
        <FileText className="w-4 h-4 text-red-700 flex-shrink-0 mt-0.5" />
        <p className="leading-relaxed">
          <strong>Regulasi BPH Migas & PRD §3.2:</strong> Pengisian BBM bersubsidi dibatasi maksimal 1 kali dalam 24 jam untuk setiap kendaraan bermotor. Percobaan pengisian ganda ini secara otomatis diblokir dan tercatat dalam <strong>Security Audit Log</strong> SPBU.
        </p>
      </div>

      {/* Actions */}
      <div className="flex flex-wrap items-center justify-end gap-3">
        <button
          type="button"
          onClick={onDismiss}
          className="px-4 py-2 rounded-full text-xs font-semibold text-red-800 hover:bg-red-100 transition-colors"
        >
          Tutup Peringatan
        </button>

        {onConfirmBlock && (
          <button
            type="button"
            onClick={onConfirmBlock}
            className="px-5 py-2 rounded-full bg-red-700 hover:bg-red-800 text-white font-bold text-xs uppercase tracking-wider transition-colors shadow-sm"
          >
            Tolak Pengisian & Konfirmasi Blokir
          </button>
        )}
      </div>
    </div>
  );
};
export default HoardingBlockAlert;
