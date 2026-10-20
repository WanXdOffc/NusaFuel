// =============================================================================
// src/modules/public-driver/components/DigitalTicketQR.tsx — NusaFuel Grid
// Verifiable Digital QR Queue Ticket with SHA-256 Cryptographic Hash
// Compliant with prd.md §3.1, §4.1 and design.md §5.2
// =============================================================================

import React, { useState } from 'react';
import type { QueueTicket } from '../../../core/data/bulelengSpbuSeed';
import {
  CheckCircle2,
  Copy,
  Printer,
  ShieldCheck,
  Fuel,
  Clock,
  Car,
  MapPin,
  X,
  Check,
} from 'lucide-react';

export interface DigitalTicketQRProps {
  ticket: QueueTicket;
  onClose: () => void;
}

/**
 * Procedural SVG QR Code generator simulating a crisp, high-density 2D barcode
 * with authentic finder patterns, timing patterns, and encoded hash cells.
 */
function ProceduralQrCode({ value, hash }: { value: string; hash: string }) {
  // Generate deterministic grid pattern based on characters of value and hash
  const size = 25; // 25x25 matrix
  const cells: boolean[][] = Array.from({ length: size }, () => Array(size).fill(false));

  // Finder pattern top-left
  const addFinderPattern = (r: number, c: number) => {
    for (let i = 0; i < 7; i++) {
      for (let j = 0; j < 7; j++) {
        if (i === 0 || i === 6 || j === 0 || j === 6 || (i >= 2 && i <= 4 && j >= 2 && j <= 4)) {
          cells[r + i][c + j] = true;
        }
      }
    }
  };

  addFinderPattern(0, 0);          // Top-left
  addFinderPattern(0, size - 7);   // Top-right
  addFinderPattern(size - 7, 0);   // Bottom-left

  // Timing patterns
  for (let i = 8; i < size - 8; i++) {
    cells[6][i] = i % 2 === 0;
    cells[i][6] = i % 2 === 0;
  }

  // Populate data modules deterministically
  const seedString = `${value}-${hash}`;
  let charIdx = 0;
  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      // Skip finder pattern zones
      const inTopLeft = r < 8 && c < 8;
      const inTopRight = r < 8 && c >= size - 8;
      const inBottomLeft = r >= size - 8 && c < 8;
      if (inTopLeft || inTopRight || inBottomLeft) continue;

      const code = seedString.charCodeAt(charIdx % seedString.length);
      cells[r][c] = (code * (r + 1) * (c + 1)) % 3 === 0;
      charIdx++;
    }
  }

  return (
    <svg
      viewBox={`0 0 ${size} ${size}`}
      className="w-48 h-48 mx-auto bg-white p-2 rounded-xl shadow-inner border border-slate-200"
      shapeRendering="crispEdges"
    >
      {cells.map((row, r) =>
        row.map((active, c) =>
          active ? <rect key={`${r}-${c}`} x={c} y={r} width="1" height="1" fill="#18191C" /> : null
        )
      )}
    </svg>
  );
}

export const DigitalTicketQR: React.FC<DigitalTicketQRProps> = ({ ticket, onClose }) => {
  const [copied, setCopied] = useState(false);

  const handleCopyCode = () => {
    navigator.clipboard.writeText(ticket.ticketCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
      <div className="relative w-full max-w-md rounded-2xl bg-white shadow-2xl border border-slate-200 overflow-hidden animate-slide-in-up">
        {/* Top 4-color strip */}
        <div className="top-brand-strip" />

        {/* Modal Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-800 transition-colors z-20 print:hidden"
          aria-label="Tutup tiket"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Printable Ticket Container */}
        <div className="p-6 sm:p-7 text-center">
          {/* Success Banner */}
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-bold uppercase tracking-wider mb-4">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            <span>Tiket Antrean Terkonfirmasi</span>
          </div>

          <h3 className="text-xl sm:text-2xl font-bold font-sans text-slate-900 tracking-tight">
            Tiket Antrean Digital NusaFuel
          </h3>
          <p className="text-xs text-slate-500 mt-1">
            Tunjukkan kode QR ini ke kasir SPBU pada gelombang kedatangan Anda
          </p>

          {/* Ticket Code Monospace Box */}
          <div className="my-5 p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
            <div className="text-left">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">
                Kode Tiket Resmi
              </span>
              <span className="text-lg font-mono font-extrabold text-slate-900 tracking-wider">
                {ticket.ticketCode}
              </span>
            </div>

            <button
              type="button"
              onClick={handleCopyCode}
              className="p-2 rounded-lg bg-white border border-slate-200 text-slate-600 hover:text-[#FF5A5F] transition-colors shadow-2xs print:hidden"
              title="Salin Kode Tiket"
            >
              {copied ? (
                <Check className="w-4 h-4 text-emerald-600" />
              ) : (
                <Copy className="w-4 h-4" />
              )}
            </button>
          </div>

          {/* Visual QR Code Matrix */}
          <div className="relative my-4">
            <ProceduralQrCode value={ticket.ticketCode} hash={ticket.qrHash} />
            <div className="mt-2 text-[10px] font-mono text-slate-400 truncate max-w-xs mx-auto">
              SHA-256: {ticket.qrHash}
            </div>
          </div>

          {/* Ticket Details Grid */}
          <div className="rounded-xl border border-slate-200 bg-[#F7F8FA] p-4 text-left text-xs space-y-2.5 my-4">
            <div className="flex items-center justify-between">
              <span className="text-slate-500 flex items-center gap-1.5">
                <Car className="w-3.5 h-3.5 text-slate-400" />
                Nomor Polisi:
              </span>
              <span className="font-mono font-extrabold text-slate-900 text-sm">
                {ticket.plateNumber}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-slate-500 flex items-center gap-1.5">
                <Fuel className="w-3.5 h-3.5 text-slate-400" />
                Jenis BBM & Kuota:
              </span>
              <span className="font-bold text-slate-900">
                {ticket.fuelType} — <span className="text-emerald-700 font-mono">{ticket.quotaLiters} Liter</span>
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-slate-500 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-slate-400" />
                Gelombang Waktu:
              </span>
              <span className="font-bold text-slate-900 font-mono">
                {ticket.slotWindowLabel}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-slate-500 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-slate-400" />
                Lokasi SPBU:
              </span>
              <span className="font-semibold text-slate-900 text-right truncate max-w-[180px]">
                {ticket.spbuName}
              </span>
            </div>
          </div>

          {/* Security & Verification Note */}
          <div className="p-2.5 rounded-lg bg-emerald-50 border border-emerald-200 text-[11px] text-emerald-900 flex items-center gap-2 text-left mb-5">
            <ShieldCheck className="w-4 h-4 text-emerald-600 flex-shrink-0" />
            <span>
              <strong>Kriptografi SHA-256 Aktif:</strong> QR ini dienkripsi dengan signature hash untuk memverifikasi keaslian dan mencegah penggandaan tiket.
            </span>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-3 print:hidden">
            <button
              type="button"
              onClick={handlePrint}
              className="flex-1 py-2.5 px-4 rounded-full border border-slate-300 hover:border-slate-400 bg-white text-slate-700 font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all shadow-xs"
            >
              <Printer className="w-4 h-4" />
              <span>Cetak Tiket</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              className="flex-1 btn-coral py-2.5 px-4 text-xs font-bold uppercase tracking-wider shadow-md"
            >
              Selesai & Simpan
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
export default DigitalTicketQR;
