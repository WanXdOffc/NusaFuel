// =============================================================================
// src/modules/public-driver/components/TimeSlotModal.tsx — NusaFuel Grid
// 30-Minute Batching Slot Booking Modal with Virtual Queue Quota Locking
// Compliant with prd.md §3.1, §4.2 and design.md §5.2
// =============================================================================

import React, { useState, useMemo } from 'react';
import { useStore, type BookSlotResult } from '../../../app/store';
import type { SpbuStation, FuelTank, FuelType, QueueTicket, TimeSlot } from '../../../core/data/bulelengSpbuSeed';
import type { VehicleType } from '../../../core/automation/oddEvenEngine';
import { toDateString } from '../../../core/automation/oddEvenEngine';
import {
  X,
  Clock,
  ShieldAlert,
  Lock,
  ArrowRight,
  Sparkles,
} from 'lucide-react';

export interface TimeSlotModalProps {
  isOpen: boolean;
  onClose: () => void;
  station: SpbuStation;
  tank: FuelTank;
  plateNumber: string;
  vehicleType: VehicleType;
  fuelType: FuelType;
  targetDate: Date;
  onBookingSuccess: (ticket: QueueTicket) => void;
}

export const TimeSlotModal: React.FC<TimeSlotModalProps> = ({
  isOpen,
  onClose,
  station,
  tank,
  plateNumber,
  vehicleType,
  fuelType,
  targetDate,
  onBookingSuccess,
}) => {
  const { state, bookTimeSlot, getQuotaForTank } = useStore();
  const dateStr = toDateString(targetDate);

  const [selectedSlotId, setSelectedSlotId] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Filter slots for this tank and target date
  const availableSlots = useMemo(() => {
    const slots = state.slots.filter(
      (s) => s.fuelTankId === tank.id && s.slotDate === dateStr
    );

    if (slots.length > 0) return slots;

    // Fallback: if no pre-seeded slots exist for this date, provide default 30-minute windows
    const generated: TimeSlot[] = [];
    const windows = [
      { startH: 7, startM: 0, label: '07:00 - 07:30 WITA' },
      { startH: 7, startM: 30, label: '07:30 - 08:00 WITA' },
      { startH: 8, startM: 0, label: '08:00 - 08:30 WITA' },
      { startH: 8, startM: 30, label: '08:30 - 09:00 WITA' },
      { startH: 9, startM: 0, label: '09:00 - 09:30 WITA' },
      { startH: 9, startM: 30, label: '09:30 - 10:00 WITA' },
      { startH: 10, startM: 0, label: '10:00 - 10:30 WITA' },
      { startH: 10, startM: 30, label: '10:30 - 11:00 WITA' },
      { startH: 13, startM: 0, label: '13:00 - 13:30 WITA' },
      { startH: 13, startM: 30, label: '13:30 - 14:00 WITA' },
      { startH: 14, startM: 0, label: '14:00 - 14:30 WITA' },
      { startH: 14, startM: 30, label: '14:30 - 15:00 WITA' },
    ];

    for (const w of windows) {
      generated.push({
        id: `slot-${tank.id}-${dateStr}-${w.startH}-${w.startM}`,
        spbuId: station.id,
        fuelTankId: tank.id,
        slotDate: dateStr,
        windowLabel: w.label,
        windowStartHour: w.startH,
        windowStartMinute: w.startM,
        capacityLiters: 450,
        bookedLiters: 0,
        isLocked: false,
        createdAt: new Date().toISOString(),
      });
    }
    return generated;
  }, [state.slots, tank.id, dateStr, station.id]);

  // Quota calculation for user
  const quota = getQuotaForTank(tank.id);
  const allocatedLiters =
    vehicleType === 'DARURAT'
      ? quota?.quotaDaruratLiters ?? 30
      : vehicleType === 'MOTOR'
      ? quota?.quotaMotorLiters ?? 3
      : quota?.quotaMobilLiters ?? 20;

  if (!isOpen) return null;

  // Handle booking confirmation
  const handleConfirmBooking = () => {
    if (!selectedSlotId) {
      setErrorMessage('Silakan pilih salah satu gelombang slot waktu.');
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);

    const result: BookSlotResult = bookTimeSlot({
      plateNumber,
      vehicleType,
      fuelType,
      spbuId: station.id,
      slotId: selectedSlotId,
    });

    setIsSubmitting(false);

    if (result.success && result.ticket) {
      onBookingSuccess(result.ticket);
      onClose();
    } else {
      setErrorMessage(
        result.errorMessage ?? 'Gagal melakukan booking. Silakan coba kembali.'
      );
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
      <div className="relative w-full max-w-2xl rounded-2xl bg-white shadow-2xl border border-slate-200 overflow-hidden animate-slide-in-up">
        {/* Modal Top Strip */}
        <div className="top-brand-strip" />

        {/* Modal Header */}
        <div className="p-5 sm:p-6 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2 text-xs text-slate-500 mb-1">
              <span className="font-mono font-bold bg-slate-200 text-slate-700 px-2 py-0.5 rounded">
                {station.code}
              </span>
              <span>{station.name}</span>
            </div>
            <h3 className="text-lg sm:text-xl font-bold font-sans text-slate-900">
              Pilih Slot Waktu Antrean 30 Menit
            </h3>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition-colors"
            aria-label="Tutup modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 sm:p-6 space-y-5">
          {/* Booking Summary Pill Box */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-3.5 rounded-xl bg-[#F7F8FA] border border-slate-200 text-xs">
            <div>
              <span className="text-[10px] text-slate-400 uppercase font-bold block">
                Nomor Polisi
              </span>
              <span className="font-mono font-extrabold text-sm text-slate-900">
                {plateNumber || 'DK .... ..'}
              </span>
            </div>

            <div>
              <span className="text-[10px] text-slate-400 uppercase font-bold block">
                BBM Dipilih
              </span>
              <span className="font-bold text-slate-900">{fuelType}</span>
            </div>

            <div>
              <span className="text-[10px] text-slate-400 uppercase font-bold block">
                Alokasi Kuota
              </span>
              <span className="font-mono font-bold text-emerald-700">
                Maks {allocatedLiters} Liter
              </span>
            </div>

            <div>
              <span className="text-[10px] text-slate-400 uppercase font-bold block">
                Tanggal Layanan
              </span>
              <span className="font-semibold text-slate-800">
                {targetDate.toLocaleDateString('id-ID', {
                  weekday: 'short',
                  day: 'numeric',
                  month: 'short',
                })}
              </span>
            </div>
          </div>

          {/* Error Alert */}
          {errorMessage && (
            <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-xs text-red-900 flex items-start gap-2.5 animate-slide-in-up">
              <ShieldAlert className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-bold">Booking Ditolak</p>
                <p className="text-[11px] text-red-700 mt-0.5">{errorMessage}</p>
              </div>
            </div>
          )}

          {/* Time Slot Grid (30-Minute Batches) */}
          <div>
            <div className="flex items-center justify-between mb-2.5">
              <label className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-[#FF5A5F]" />
                Pilih Gelombang Waktu Kedatangan
              </label>
              <span className="text-[10px] text-slate-400">
                Kapasitas per slot: 450 Liter
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 max-h-64 overflow-y-auto p-1">
              {availableSlots.map((slot) => {
                const remainingLiters = Math.max(0, slot.capacityLiters - slot.bookedLiters);
                const isFull = remainingLiters < allocatedLiters || slot.isLocked;
                const isSelected = selectedSlotId === slot.id;

                return (
                  <button
                    key={slot.id}
                    type="button"
                    disabled={isFull}
                    onClick={() => setSelectedSlotId(slot.id)}
                    className={`p-3 rounded-xl border text-left transition-all ${
                      isFull
                        ? 'bg-slate-100 border-slate-200 text-slate-400 cursor-not-allowed opacity-60'
                        : isSelected
                        ? 'bg-[#FF5A5F] text-white border-[#FF5A5F] shadow-md shadow-[#FF5A5F]/20'
                        : 'bg-white hover:bg-slate-50 border-slate-200 text-slate-800'
                    }`}
                  >
                    <div className="flex items-center justify-between text-xs font-bold mb-1">
                      <span>{slot.windowLabel}</span>
                      {isFull && <Lock className="w-3 h-3 text-slate-400" />}
                    </div>

                    <div className="flex items-center justify-between text-[10px]">
                      <span className={isSelected ? 'text-white/80' : 'text-slate-500'}>
                        {isFull ? 'Slot Penuh' : 'Sisa Kuota:'}
                      </span>
                      <span
                        className={`font-mono font-bold ${
                          isSelected
                            ? 'text-white'
                            : isFull
                            ? 'text-slate-400'
                            : 'text-emerald-700'
                        }`}
                      >
                        {isFull ? '0 L' : `${remainingLiters} L`}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Virtual Quota Protection Notice */}
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-[11px] text-slate-600 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-[#FF5A5F] flex-shrink-0" />
            <span>
              <strong>Virtual Queue Quota Locking:</strong> Begitu tiket diterbitkan, kuota {allocatedLiters}L Anda terkunci di server sehingga stok BBM tidak akan direbut kendaraan lain.
            </span>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 sm:p-5 bg-slate-50 border-t border-slate-200 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 rounded-full text-xs font-semibold text-slate-600 hover:bg-slate-200 transition-colors"
          >
            Batal
          </button>

          <button
            type="button"
            disabled={!selectedSlotId || isSubmitting}
            onClick={handleConfirmBooking}
            className="btn-coral py-2.5 px-6 text-xs font-bold uppercase tracking-wider flex items-center gap-2 shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? (
              <span>Memproses Tiket...</span>
            ) : (
              <>
                <span>Konfirmasi Amankan Tiket</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
export default TimeSlotModal;
