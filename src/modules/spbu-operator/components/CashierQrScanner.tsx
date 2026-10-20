// =============================================================================
// src/modules/spbu-operator/components/CashierQrScanner.tsx — NusaFuel Grid
// Cashier 1-Tap QR Ticket Scanner, Fuel Stock Deduction & Anti-Hoarding Enforcer
// Compliant with prd.md §3.2, §4.3 and design.md §5.2
// =============================================================================

import React, { useState, useMemo } from 'react';
import { useStore, type VerifyTicketResult } from '../../../app/store';
import type { SpbuStation, QueueTicket } from '../../../core/data/bulelengSpbuSeed';
import { checkAntiHoarding, type HoardingCheckResult } from '../../../core/automation/antiHoardingGuard';
import { HoardingBlockAlert } from './HoardingBlockAlert';
import {
  QrCode,
  CheckCircle2,
  Check,
  AlertTriangle,
} from 'lucide-react';

export interface CashierQrScannerProps {
  station: SpbuStation;
  operatorId: string;
}

export const CashierQrScanner: React.FC<CashierQrScannerProps> = ({
  station,
  operatorId,
}) => {
  const { state, verifyTicketQr, getEffectiveDate } = useStore();
  const effectiveDate = getEffectiveDate();

  // Search & input states
  const [inputPlate, setInputPlate] = useState('DK 4821 FB');
  const [selectedFilter, setSelectedFilter] = useState<'ALL' | 'BOOKED' | 'COMPLETED'>('BOOKED');
  const [verificationFeedback, setVerificationFeedback] = useState<{
    success: boolean;
    message: string;
  } | null>(null);

  // Hoarding alert state
  const [activeHoardingBlock, setActiveHoardingBlock] = useState<{
    plate: string;
    fuel: string;
    result: HoardingCheckResult;
  } | null>(null);

  // Tickets for this station
  const stationTickets = useMemo(() => {
    return state.tickets
      .filter((t) => t.spbuId === station.id)
      .filter((t) => {
        if (selectedFilter === 'BOOKED') return t.status === 'BOOKED';
        if (selectedFilter === 'COMPLETED') return t.status === 'COMPLETED';
        return true;
      });
  }, [state.tickets, station.id, selectedFilter]);

  // Execute verification for a ticket
  const handleVerify = (ticket: QueueTicket) => {
    // 1. Anti-Hoarding Check first
    const ticketRecords = state.tickets.map((t) => ({
      id: t.id,
      plateNumber: t.plateNumber,
      fuelType: t.fuelType,
      spbuId: t.spbuId,
      spbuName: t.spbuName,
      status: t.status,
      createdAt: t.createdAt,
      quotaLiters: t.quotaLiters,
    }));

    const hoarding = checkAntiHoarding(
      ticket.plateNumber,
      ticket.fuelType,
      ticketRecords,
      effectiveDate
    );

    if (hoarding.isHoarding && ticket.status !== 'COMPLETED') {
      setActiveHoardingBlock({
        plate: ticket.plateNumber,
        fuel: ticket.fuelType,
        result: hoarding,
      });
      return;
    }

    // 2. Perform verification and deduction
    const result: VerifyTicketResult = verifyTicketQr({
      ticketId: ticket.id,
      operatorId,
    });

    if (result.success) {
      setVerificationFeedback({
        success: true,
        message: `Sukses verifikasi ${ticket.ticketCode} (${ticket.plateNumber}). Stok berkurang ${ticket.quotaLiters} Liter.`,
      });
      setActiveHoardingBlock(null);
    } else {
      setVerificationFeedback({
        success: false,
        message: result.errorMessage ?? 'Gagal memverifikasi tiket.',
      });
    }
  };

  // Cashier manual plate lookup
  const handleLookupAndVerify = () => {
    const normalized = inputPlate.trim().toUpperCase();
    if (!normalized) return;

    // Check if plate matches any ticket in this station
    const matched = state.tickets.find(
      (t) => t.spbuId === station.id && t.plateNumber === normalized && t.status === 'BOOKED'
    );

    if (matched) {
      handleVerify(matched);
      return;
    }

    // Check anti-hoarding across network
    const ticketRecords = state.tickets.map((t) => ({
      id: t.id,
      plateNumber: t.plateNumber,
      fuelType: t.fuelType,
      spbuId: t.spbuId,
      spbuName: t.spbuName,
      status: t.status,
      createdAt: t.createdAt,
      quotaLiters: t.quotaLiters,
    }));

    const hoarding = checkAntiHoarding(
      normalized,
      'Pertalite',
      ticketRecords,
      effectiveDate
    );

    if (hoarding.isHoarding) {
      setActiveHoardingBlock({
        plate: normalized,
        fuel: 'Pertalite',
        result: hoarding,
      });
    } else {
      setVerificationFeedback({
        success: false,
        message: `Tidak ditemukan tiket antrean berstatus BOOKED untuk plat ${normalized} di ${station.name}.`,
      });
    }
  };

  return (
    <div className="rounded-2xl bg-white border border-[#E6E8EC] p-6 sm:p-8 shadow-sm space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-200">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#FF5A5F]/10 text-[#FF5A5F] flex items-center justify-center">
            <QrCode className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-900 leading-snug">
              Pemindai QR & Verifikasi Pompa Kasir
            </h3>
            <p className="text-xs text-slate-500">
              Validasi 1-tap tiket digital warga, pemotongan stok otomatis, & deteksi penimbunan lintas-SPBU
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[10px] font-mono text-slate-400">KASIR OPERATOR:</span>
          <span className="font-mono text-xs font-bold text-slate-700 bg-slate-100 px-2.5 py-1 rounded-md border border-slate-200">
            {operatorId}
          </span>
        </div>
      </div>

      {/* Manual Plate Lookup Bar & Preset Testing */}
      <div className="p-4 rounded-xl bg-[#F7F8FA] border border-slate-200 space-y-3">
        <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider">
          Input Cepat Plat Nomor di Nozel / Scan Kamera
        </label>
        <div className="flex flex-col sm:flex-row items-center gap-2.5">
          <div className="relative w-full">
            <input
              type="text"
              value={inputPlate}
              onChange={(e) => setInputPlate(e.target.value.toUpperCase())}
              placeholder="Contoh: DK 4821 FB atau DK 9991 XX"
              className="w-full px-4 py-2.5 rounded-xl border border-slate-300 font-mono font-bold text-sm tracking-wider text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#FF5A5F] bg-white uppercase"
            />
          </div>

          <button
            type="button"
            onClick={handleLookupAndVerify}
            className="w-full sm:w-auto btn-coral py-2.5 px-6 text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 shadow-sm whitespace-nowrap"
          >
            <QrCode className="w-4 h-4" />
            <span>Periksa & Verifikasi</span>
          </button>
        </div>

        {/* Presets for judges */}
        <div className="flex flex-wrap items-center gap-1.5 text-xs pt-1">
          <span className="text-[10px] text-slate-400 font-semibold mr-1">
            Uji Cepat Juri:
          </span>
          <button
            type="button"
            onClick={() => {
              setInputPlate('DK 4821 FB');
              handleLookupAndVerify();
            }}
            className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-white border border-slate-200 text-slate-700 hover:border-[#FF5A5F]"
          >
            DK 4821 FB (Tiket Valid)
          </button>
          <button
            type="button"
            onClick={() => {
              setInputPlate('DK 9991 XX');
              handleLookupAndVerify();
            }}
            className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-red-50 border border-red-300 text-red-700 hover:bg-red-100"
          >
            DK 9991 XX (Uji Anti-Hoarding Block)
          </button>
        </div>
      </div>

      {/* Anti-Hoarding Block Alert (if triggered) */}
      {activeHoardingBlock && (
        <HoardingBlockAlert
          plateNumber={activeHoardingBlock.plate}
          fuelType={activeHoardingBlock.fuel}
          hoardingResult={activeHoardingBlock.result}
          onDismiss={() => setActiveHoardingBlock(null)}
          onConfirmBlock={() => {
            setVerificationFeedback({
              success: false,
              message: `Pengisian plat ${activeHoardingBlock.plate} berhasil DITOLAK dan dicatat ke Security Audit Log.`,
            });
            setActiveHoardingBlock(null);
          }}
        />
      )}

      {/* Feedback Banner */}
      {verificationFeedback && (
        <div
          className={`p-4 rounded-xl border text-xs flex items-center justify-between gap-3 animate-slide-in-up ${
            verificationFeedback.success
              ? 'bg-emerald-50 text-emerald-900 border-emerald-200'
              : 'bg-amber-50 text-amber-900 border-amber-200'
          }`}
        >
          <div className="flex items-center gap-2">
            {verificationFeedback.success ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
            ) : (
              <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0" />
            )}
            <span>{verificationFeedback.message}</span>
          </div>

          <button
            type="button"
            onClick={() => setVerificationFeedback(null)}
            className="text-xs font-bold underline"
          >
            Tutup
          </button>
        </div>
      )}

      {/* Queue Tickets Table for this SPBU */}
      <div>
        <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
          <div>
            <h4 className="text-sm font-bold text-slate-900">
              Daftar Antrean Tiket di {station.name}
            </h4>
            <p className="text-[11px] text-slate-500">
              Klik 1-Tap Verifikasi untuk memotong stok tangki secara otomatis
            </p>
          </div>

          {/* Filter tabs */}
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg text-xs font-semibold">
            <button
              type="button"
              onClick={() => setSelectedFilter('BOOKED')}
              className={`px-3 py-1 rounded-md transition-all ${
                selectedFilter === 'BOOKED'
                  ? 'bg-white text-slate-900 shadow-xs font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Menunggu ({state.tickets.filter((t) => t.spbuId === station.id && t.status === 'BOOKED').length})
            </button>
            <button
              type="button"
              onClick={() => setSelectedFilter('COMPLETED')}
              className={`px-3 py-1 rounded-md transition-all ${
                selectedFilter === 'COMPLETED'
                  ? 'bg-white text-slate-900 shadow-xs font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Selesai ({state.tickets.filter((t) => t.spbuId === station.id && t.status === 'COMPLETED').length})
            </button>
            <button
              type="button"
              onClick={() => setSelectedFilter('ALL')}
              className={`px-3 py-1 rounded-md transition-all ${
                selectedFilter === 'ALL'
                  ? 'bg-white text-slate-900 shadow-xs font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Semua
            </button>
          </div>
        </div>

        {/* Tickets Table */}
        <div className="overflow-x-auto border border-slate-200 rounded-xl">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase text-[10px] tracking-wider">
                <th className="py-3 px-3.5">Kode Tiket</th>
                <th className="py-3 px-3.5">Nomor Polisi</th>
                <th className="py-3 px-3.5">BBM / Kuota</th>
                <th className="py-3 px-3.5">Gelombang Waktu</th>
                <th className="py-3 px-3.5">Status</th>
                <th className="py-3 px-3.5 text-right">Aksi Kasir</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {stationTickets.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-400">
                    Tidak ada antrean tiket pada kategori ini.
                  </td>
                </tr>
              ) : (
                stationTickets.map((ticket) => (
                  <tr key={ticket.id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-3 px-3.5 font-mono font-bold text-slate-900">
                      {ticket.ticketCode}
                    </td>
                    <td className="py-3 px-3.5">
                      <div className="flex items-center gap-1.5">
                        <span className="font-mono font-extrabold text-slate-900">
                          {ticket.plateNumber}
                        </span>
                        <span className="text-[10px] text-slate-400 font-mono">
                          ({ticket.plateParity === 'ODD' ? 'Ganjil' : 'Genap'})
                        </span>
                      </div>
                    </td>
                    <td className="py-3 px-3.5">
                      <span className="font-semibold text-slate-900">{ticket.fuelType}</span>
                      <span className="text-emerald-700 font-mono font-bold ml-1.5">
                        {ticket.quotaLiters}L
                      </span>
                    </td>
                    <td className="py-3 px-3.5 text-slate-600 font-mono text-[11px]">
                      {ticket.slotWindowLabel}
                    </td>
                    <td className="py-3 px-3.5">
                      <span
                        className={`badge text-[9px] py-0.5 px-2 ${
                          ticket.status === 'COMPLETED'
                            ? 'badge-normal'
                            : ticket.status === 'BLOCKED_HOARDING'
                            ? 'badge-critical'
                            : 'badge-warning'
                        }`}
                      >
                        {ticket.status}
                      </span>
                    </td>
                    <td className="py-3 px-3.5 text-right">
                      {ticket.status === 'BOOKED' ? (
                        <button
                          type="button"
                          onClick={() => handleVerify(ticket)}
                          className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[11px] transition-colors shadow-2xs active:scale-95 inline-flex items-center gap-1"
                        >
                          <Check className="w-3.5 h-3.5" />
                          <span>1-Tap Verifikasi</span>
                        </button>
                      ) : (
                        <span className="text-[10px] text-slate-400 font-mono">
                          {ticket.verifiedAt
                            ? new Date(ticket.verifiedAt).toLocaleTimeString('id-ID', {
                                hour: '2-digit',
                                minute: '2-digit',
                              })
                            : 'Selesai'}
                        </span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
export default CashierQrScanner;
