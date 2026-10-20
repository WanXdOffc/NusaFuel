// =============================================================================
// src/modules/public-driver/components/PlateCheckerCard.tsx — NusaFuel Grid
// Interactive Plate Checker & Parity Engine with H+1 Pre-Booking & Anti-Hoarding
// Compliant with design.md §6.2 (Twilight Petrol Canopy) and prd.md §4.1, §4.3
// =============================================================================

import React, { useMemo } from 'react';
import { useStore } from '../../../app/store';
import {
  checkOddEvenEligibility,
  type VehicleType,
} from '../../../core/automation/oddEvenEngine';
import { checkAntiHoarding } from '../../../core/automation/antiHoardingGuard';
import type { FuelType } from '../../../core/data/bulelengSpbuSeed';
import {
  Car,
  Bike,
  ShieldAlert,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Calendar,
  Sparkles,
  Clock,
  OctagonAlert,
} from 'lucide-react';

export interface PlateCheckerCardProps {
  plateNumber: string;
  setPlateNumber: (plate: string) => void;
  vehicleType: VehicleType;
  setVehicleType: (type: VehicleType) => void;
  fuelType: FuelType;
  setFuelType: (fuel: FuelType) => void;
  onProceedToBooking: (targetDate: Date) => void;
}

export const PlateCheckerCard: React.FC<PlateCheckerCardProps> = ({
  plateNumber,
  setPlateNumber,
  vehicleType,
  setVehicleType,
  fuelType,
  setFuelType,
  onProceedToBooking,
}) => {
  const { state, getEffectiveDate } = useStore();
  const effectiveDate = getEffectiveDate();

  // Run Odd-Even engine
  const oddEvenResult = useMemo(() => {
    return checkOddEvenEligibility(plateNumber, effectiveDate, vehicleType);
  }, [plateNumber, effectiveDate, vehicleType]);

  // Run Anti-Hoarding guard (cross-SPBU check)
  const hoardingResult = useMemo(() => {
    if (!oddEvenResult.allowedToday && vehicleType !== 'DARURAT') {
      return { isHoarding: false };
    }
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

    return checkAntiHoarding(
      plateNumber,
      fuelType,
      ticketRecords,
      effectiveDate
    );
  }, [plateNumber, fuelType, state.tickets, effectiveDate, oddEvenResult.allowedToday, vehicleType]);

  // Quick preset test plates for judges
  const testPresets = [
    { plate: 'DK 4821 FB', type: 'MOBIL' as const, label: 'DK 4821 (Ganjil - Mobil)' },
    { plate: 'DK 3310 EA', type: 'MOBIL' as const, label: 'DK 3310 (Genap - Mobil)' },
    { plate: 'DK 8829 BB', type: 'MOTOR' as const, label: 'DK 8829 (Ganjil - Motor)' },
    { plate: 'DK 9991 XX', type: 'MOBIL' as const, label: 'DK 9991 (Uji Anti-Hoarding)' },
    { plate: 'DK 112 BP',  type: 'DARURAT' as const, label: 'DK 112 (Ambulans RSUD)' },
  ];

  return (
    <div className="relative rounded-2xl bg-white/95 backdrop-blur-md p-6 sm:p-8 border border-white/20 shadow-2xl text-slate-900 transition-all">
      {/* Card Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6 pb-4 border-b border-slate-200">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#FF5A5F]/10 flex items-center justify-center text-[#FF5A5F]">
            <Car className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base sm:text-lg font-bold text-slate-900 leading-snug">
              Cek Hak Akses & Antrean Digital BBM
            </h2>
            <p className="text-xs text-slate-500">
              Validasi otomatis regulasi plat ganjil-genap dan proteksi kuota subsidi
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-100 text-slate-700 text-xs font-semibold">
          <Calendar className="w-3.5 h-3.5 text-slate-500" />
          <span>{effectiveDate.getDate() % 2 !== 0 ? 'Hari Ganjil' : 'Hari Genap'}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        {/* Left Form: Plate Input, Vehicle, and Fuel Type (7 cols) */}
        <div className="md:col-span-7 space-y-5">
          {/* 1. Plate Number Input */}
          <div>
            <label className="block text-xs font-bold text-slate-800 mb-1.5 uppercase tracking-wider">
              Nomor Polisi Kendaraan (Plat Nomor)
            </label>
            <div className="relative">
              <input
                type="text"
                value={plateNumber}
                onChange={(e) => setPlateNumber(e.target.value.toUpperCase())}
                placeholder="Contoh: DK 4821 FB"
                maxLength={12}
                className="w-full px-4 py-3 rounded-xl border border-slate-300 text-lg sm:text-xl font-mono font-bold tracking-widest text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#FF5A5F] focus:border-transparent bg-slate-50 transition-all"
              />
              <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-slate-200 text-slate-700 font-bold">
                INDONESIA
              </span>
            </div>

            {/* Quick Test Preset Buttons for Evaluators */}
            <div className="mt-2.5 flex flex-wrap items-center gap-1.5">
              <span className="text-[10px] text-slate-400 font-semibold mr-1">
                Preset Uji Cepat:
              </span>
              {testPresets.map((preset) => (
                <button
                  key={preset.plate}
                  type="button"
                  onClick={() => {
                    setPlateNumber(preset.plate);
                    setVehicleType(preset.type);
                  }}
                  className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded border transition-colors ${
                    plateNumber === preset.plate
                      ? 'bg-[#FF5A5F] text-white border-[#FF5A5F]'
                      : 'bg-white text-slate-600 border-slate-200 hover:border-[#FF5A5F] hover:text-[#FF5A5F]'
                  }`}
                >
                  {preset.plate}
                </button>
              ))}
            </div>
          </div>

          {/* 2. Vehicle Type Selection */}
          <div>
            <label className="block text-xs font-bold text-slate-800 mb-1.5 uppercase tracking-wider">
              Kategori Kendaraan
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setVehicleType('MOTOR')}
                className={`flex flex-col items-center justify-center p-2.5 rounded-xl border transition-all ${
                  vehicleType === 'MOTOR'
                    ? 'bg-[#FF5A5F] text-white border-[#FF5A5F] shadow-md shadow-[#FF5A5F]/20'
                    : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                }`}
              >
                <Bike className="w-5 h-5 mb-1" />
                <span className="text-xs font-bold">Sepeda Motor</span>
                <span className={`text-[10px] ${vehicleType === 'MOTOR' ? 'text-white/80' : 'text-slate-400'}`}>
                  Maks 3 Liter
                </span>
              </button>

              <button
                type="button"
                onClick={() => setVehicleType('MOBIL')}
                className={`flex flex-col items-center justify-center p-2.5 rounded-xl border transition-all ${
                  vehicleType === 'MOBIL'
                    ? 'bg-[#FF5A5F] text-white border-[#FF5A5F] shadow-md shadow-[#FF5A5F]/20'
                    : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                }`}
              >
                <Car className="w-5 h-5 mb-1" />
                <span className="text-xs font-bold">Mobil Pribadi</span>
                <span className={`text-[10px] ${vehicleType === 'MOBIL' ? 'text-white/80' : 'text-slate-400'}`}>
                  Maks 10-20 Liter
                </span>
              </button>

              <button
                type="button"
                onClick={() => setVehicleType('DARURAT')}
                className={`flex flex-col items-center justify-center p-2.5 rounded-xl border transition-all ${
                  vehicleType === 'DARURAT'
                    ? 'bg-red-600 text-white border-red-600 shadow-md shadow-red-600/20'
                    : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                }`}
              >
                <ShieldAlert className="w-5 h-5 mb-1" />
                <span className="text-xs font-bold">Darurat / Dinas</span>
                <span className={`text-[10px] ${vehicleType === 'DARURAT' ? 'text-white/80' : 'text-slate-400'}`}>
                  Bypass Paritas
                </span>
              </button>
            </div>
          </div>

          {/* 3. Fuel Type Selection */}
          <div>
            <label className="block text-xs font-bold text-slate-800 mb-1.5 uppercase tracking-wider">
              Pilihan Bahan Bakar Minyak
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setFuelType('Pertalite')}
                className={`py-2 px-3 rounded-xl border text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                  fuelType === 'Pertalite'
                    ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                    : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                }`}
              >
                <span className={`w-2 h-2 rounded-full ${fuelType === 'Pertalite' ? 'bg-white' : 'bg-emerald-500'}`} />
                <span>Pertalite</span>
              </button>

              <button
                type="button"
                onClick={() => setFuelType('Pertamax')}
                className={`py-2 px-3 rounded-xl border text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                  fuelType === 'Pertamax'
                    ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                    : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                }`}
              >
                <span className={`w-2 h-2 rounded-full ${fuelType === 'Pertamax' ? 'bg-white' : 'bg-blue-500'}`} />
                <span>Pertamax</span>
              </button>

              <button
                type="button"
                onClick={() => setFuelType('Solar')}
                className={`py-2 px-3 rounded-xl border text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                  fuelType === 'Solar'
                    ? 'bg-amber-600 text-white border-amber-600 shadow-sm'
                    : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                }`}
              >
                <span className={`w-2 h-2 rounded-full ${fuelType === 'Solar' ? 'bg-white' : 'bg-amber-500'}`} />
                <span>Biosolar</span>
              </button>
            </div>
          </div>
        </div>

        {/* Right Panel: Validation Engine & Dynamic Booking Callout (5 cols) */}
        <div className="md:col-span-5 flex flex-col justify-between rounded-xl bg-slate-50 p-5 border border-slate-200">
          <div>
            <div className="flex items-center justify-between pb-2.5 mb-3 border-b border-slate-200">
              <span className="text-xs font-extrabold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-[#FF5A5F]" />
                Hasil Validasi Real-Time
              </span>
              <span className="text-[10px] font-mono text-slate-400">STATUS SISTEM</span>
            </div>

            {/* Validation State 1: Invalid Plate */}
            {oddEvenResult.validationError && (
              <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-xs text-red-900 mb-3 animate-slide-in-up">
                <div className="flex items-start gap-2">
                  <OctagonAlert className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-bold">Format Plat Belum Lengkap</p>
                    <p className="text-[11px] text-red-700 mt-0.5">
                      {oddEvenResult.validationError}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Validation State 2: Anti-Hoarding Block */}
            {hoardingResult.isHoarding && (
              <div className="p-3.5 rounded-xl bg-red-50 border-2 border-red-300 text-xs text-red-900 mb-3 animate-slide-in-up shadow-xs">
                <div className="flex items-start gap-2.5">
                  <ShieldAlert className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-extrabold text-red-800 uppercase tracking-tight">
                      Peringatan Anti-Hoarding (BPH Migas)
                    </p>
                    <p className="text-[11px] text-red-700 mt-1 leading-relaxed">
                      Kendaraan ini tercatat sudah mengisi <span className="font-bold">{fuelType}</span> sebanyak{' '}
                      <span className="font-mono font-bold">{hoardingResult.previousQuotaLiters}L</span> di{' '}
                      <span className="font-bold">{hoardingResult.previousSpbuName}</span>.
                    </p>
                    <p className="text-[10px] text-red-600 mt-1 font-medium">
                      Aturan proteksi: Kuota subsidi dibatasi 1x per hari (cooldown 12 jam).
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Validation State 3: Emergency Vehicle Priority */}
            {vehicleType === 'DARURAT' && (
              <div className="p-3.5 rounded-xl bg-blue-50 border border-blue-200 text-xs text-blue-900 mb-3 animate-slide-in-up">
                <div className="flex items-start gap-2">
                  <ShieldAlert className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-bold">Prioritas Khusus Kendaraan Darurat</p>
                    <p className="text-[11px] text-blue-700 mt-0.5">
                      Bebas dari aturan ganjil-genap. Dilayani kuota tangki darurat hingga 30 Liter.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Validation State 4: Valid Today */}
            {!oddEvenResult.validationError &&
              oddEvenResult.allowedToday &&
              !hoardingResult.isHoarding &&
              vehicleType !== 'DARURAT' && (
                <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-900 mb-3 animate-slide-in-up">
                  <div className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-bold">Memenuhi Syarat Antrean Hari Ini</p>
                      <p className="text-[11px] text-emerald-700 mt-0.5">
                        Digit terakhir <span className="font-mono font-bold">{oddEvenResult.lastDigit}</span>{' '}
                        ({oddEvenResult.plateParity === 'ODD' ? 'Ganjil' : 'Genap'}) cocok dengan kalender ganjil-genap aktif.
                      </p>
                    </div>
                  </div>
                </div>
              )}

            {/* Validation State 5: Parity Mismatch -> Auto H+1 Pre-Booking Banner */}
            {!oddEvenResult.validationError &&
              !oddEvenResult.allowedToday &&
              !hoardingResult.isHoarding &&
              vehicleType !== 'DARURAT' && (
                <div className="p-3.5 rounded-xl bg-amber-50 border-2 border-amber-300 text-xs text-amber-950 mb-3 animate-slide-in-up">
                  <div className="flex items-start gap-2.5">
                    <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-extrabold text-amber-900">
                        Jadwal Plat Anda Besok (H+1)
                      </p>
                      <p className="text-[11px] text-amber-800 mt-1 leading-relaxed">
                        Hari ini khusus plat{' '}
                        <span className="font-bold">
                          {oddEvenResult.dateParity === 'ODD' ? 'Ganjil' : 'Genap'}
                        </span>. Digit terakhir Anda adalah{' '}
                        <span className="font-mono font-bold">{oddEvenResult.lastDigit}</span>.
                      </p>
                      <div className="mt-2 p-2 rounded-lg bg-white/80 border border-amber-200 flex items-center gap-1.5 text-[11px] font-semibold text-amber-900">
                        <Clock className="w-3.5 h-3.5 text-amber-700 flex-shrink-0" />
                        <span>Amankan Slot Prioritas Besok Pagi: {oddEvenResult.assignedDateLabel}</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
          </div>

          {/* Action Trigger Button */}
          <div className="mt-4 pt-3 border-t border-slate-200">
            {hoardingResult.isHoarding ? (
              <button
                type="button"
                disabled
                className="w-full py-3 px-4 rounded-full bg-slate-300 text-slate-500 font-bold text-xs uppercase tracking-wider cursor-not-allowed"
              >
                Pemesanan Diblokir (Anti-Hoarding)
              </button>
            ) : oddEvenResult.allowedToday ? (
              <button
                type="button"
                onClick={() => onProceedToBooking(effectiveDate)}
                className="w-full btn-coral py-3 px-6 text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 group"
              >
                <span>Pilih SPBU & Amankan Slot Waktu Hari Ini</span>
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </button>
            ) : (
              <button
                type="button"
                onClick={() => onProceedToBooking(oddEvenResult.assignedDate)}
                className="w-full py-3 px-6 rounded-full bg-[#FF9F1C] hover:bg-[#e88e14] text-white font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-md transition-all group"
              >
                <span>Pra-Pesan Slot Besok Pagi (H+1)</span>
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
export default PlateCheckerCard;
