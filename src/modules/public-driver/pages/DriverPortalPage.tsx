// =============================================================================
// src/modules/public-driver/pages/DriverPortalPage.tsx — NusaFuel Grid
// User A: Citizen Driver Portal (Provinsi Bali — 9 Regencies)
// Features: Vehicle Profile & Parity Chip, Live BaliInteractiveMap,
// Smart Alternative SPBU Recommendation for Throttled/Unloading Stations,
// 30-Minute Batching TimeSlotModal, and Verifiable Digital QR Ticket.
// =============================================================================

import React, { useState, useMemo } from 'react';
import { useStore } from '../../../app/store';
import { useAuth } from '../../../core/auth/authContext';
import { BaliInteractiveMap } from '../../../shared/components/BaliInteractiveMap';
import { TimeSlotModal } from '../components/TimeSlotModal';
import { DigitalTicketQR } from '../components/DigitalTicketQR';
import type { SpbuStation, FuelTank, FuelType, QueueTicket } from '../../../core/data/baliSpbuSeed';
import type { VehicleType } from '../../../core/automation/oddEvenEngine';
import { checkOddEvenEligibility } from '../../../core/automation/oddEvenEngine';
import {
  Calendar,
  Sparkles,
  RefreshCw,
  Ticket,
  QrCode,
  ShieldCheck,
  AlertTriangle,
  Car,
  Bike,
  CheckCircle2,
  MapPin,
  Clock,
  Fuel,
} from 'lucide-react';

export const DriverPortalPage: React.FC = () => {
  const { state, toggleSimulatedDateParity, getEffectiveDate, getTanksForStation } = useStore();
  const { currentUser } = useAuth();

  // Driver vehicle & plate state
  const [plateNumber, setPlateNumber] = useState(currentUser?.plateNumber ?? 'DK 4821 FB');
  const [vehicleType, setVehicleType] = useState<VehicleType>(currentUser?.vehicleType ?? 'MOBIL');
  const [fuelType, setFuelType] = useState<FuelType>('Pertalite');

  // Interactive booking & modal states
  const [bookingStation, setBookingStation] = useState<SpbuStation | null>(null);
  const [bookingTank, setBookingTank] = useState<FuelTank | null>(null);
  const [activeTicket, setActiveTicket] = useState<QueueTicket | null>(null);

  // Smart Alternative Recommendation state
  const [recommendedStation, setRecommendedStation] = useState<SpbuStation | null>(null);
  const [throttledStationNotice, setThrottledStationNotice] = useState<{
    station: SpbuStation;
    tank: FuelTank;
  } | null>(null);

  const effectiveDate = getEffectiveDate();
  const dayNumber = effectiveDate.getDate();
  const isOddDay = dayNumber % 2 !== 0;

  // Run Odd-Even parity engine on driver's plate
  const parityAccess = useMemo(() => {
    return checkOddEvenEligibility(plateNumber, effectiveDate, vehicleType);
  }, [plateNumber, effectiveDate, vehicleType]);

  // Find latest active booked ticket for this driver
  const driverActiveTicket = state.tickets.find(
    (t) => t.plateNumber.toUpperCase() === plateNumber.toUpperCase() && t.status === 'BOOKED'
  );

  // Handler when a station is clicked in BaliInteractiveMap
  const handleStationMapSelection = (st: SpbuStation, tank: FuelTank) => {
    // If the station is THROTTLED, UNLOADING, or EMERGENCY_ONLY, trigger Smart Alternative Recommendation
    if (st.operationalMode === 'THROTTLED' || st.operationalMode === 'UNLOADING' || st.operationalMode === 'EMERGENCY_ONLY') {
      // Find an alternative SPBU in the same regency with NORMAL status
      const sameRegencyNormal = state.stations.find(
        (other) =>
          other.id !== st.id &&
          other.regency === st.regency &&
          other.operationalMode === 'NORMAL'
      );

      // Fallback: any other NORMAL station in Bali
      const anyNormal = sameRegencyNormal || state.stations.find(
        (other) => other.id !== st.id && other.operationalMode === 'NORMAL'
      );

      setThrottledStationNotice({ station: st, tank });
      setRecommendedStation(anyNormal ?? null);
    } else {
      // Station is NORMAL, proceed to booking modal directly
      setThrottledStationNotice(null);
      setRecommendedStation(null);
      setBookingStation(st);
      setBookingTank(tank);
    }
  };

  const handleAcceptAlternative = () => {
    if (!recommendedStation) return;
    const tanks = getTanksForStation(recommendedStation.id);
    const targetTank = tanks.find((t) => t.fuelType === fuelType) ?? tanks[0];
    setThrottledStationNotice(null);
    setRecommendedStation(null);
    setBookingStation(recommendedStation);
    setBookingTank(targetTank);
  };

  const handleProceedWithThrottled = () => {
    if (!throttledStationNotice) return;
    setBookingStation(throttledStationNotice.station);
    setBookingTank(throttledStationNotice.tank);
    setThrottledStationNotice(null);
    setRecommendedStation(null);
  };

  return (
    <div className="w-full pb-20 animate-fade-in font-sans">
      {/* 1. Full-Bleed Twilight Petrol Canopy Hero Section */}
      <section className="relative bg-[#18152E] text-white overflow-hidden py-12 md:py-16 border-b border-slate-800">
        <div
          className="absolute inset-0 pointer-events-none z-10"
          style={{
            background:
              'linear-gradient(90deg, rgba(16, 14, 34, 0.95) 0%, rgba(24, 21, 46, 0.85) 55%, rgba(18, 15, 38, 0.6) 100%)',
          }}
        />

        <div className="absolute -right-24 -top-24 w-[480px] h-[480px] rounded-full bg-[#FF5A5F]/15 blur-3xl pointer-events-none" />
        <div className="absolute right-1/3 bottom-0 w-80 h-80 rounded-full bg-[#FF9F1C]/10 blur-3xl pointer-events-none" />

        <div className="relative z-20 max-w-[1240px] mx-auto px-6 md:px-10">
          <div className="max-w-3xl mb-8">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/15 text-xs font-semibold text-[#00A8E8] mb-4 shadow-sm">
              <span className="w-2 h-2 rounded-full bg-[#FF5A5F] animate-pulse" />
              <span>Portal Layanan Warga Terpadu — Provinsi Bali (9 Kab/Kota)</span>
            </div>

            <h1 className="text-3xl sm:text-5xl font-extrabold font-sans tracking-tight text-white leading-tight mb-4 drop-shadow-md">
              Antrean Digital BBM Cerdas & Transparansi Kuota SPBU
            </h1>

            <p className="text-sm sm:text-base text-slate-300 font-normal leading-relaxed max-w-2xl">
              Pilih SPBU mana pun di seluruh pulau Bali langsung dari peta interaktif. Dapatkan
              kuota 30 menit terjamin dan hindari pemborosan waktu dalam antrean.
            </p>
          </div>

          {/* Vehicle Profile & Parity Access Status Card */}
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-5 sm:p-7 border border-white/20 shadow-xl">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
              {/* Left: Driver Vehicle Config */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-300">
                  <ShieldCheck className="w-4 h-4 text-[#00A8E8]" />
                  <span>Profil Kendaraan & Hak Akses Hari Ini</span>
                </div>

                <div className="flex flex-wrap items-center gap-4">
                  {/* Plate Input */}
                  <div>
                    <label className="text-[10px] uppercase font-bold text-slate-300 block mb-1">
                      Nomor Polisi (Plat):
                    </label>
                    <input
                      type="text"
                      value={plateNumber}
                      onChange={(e) => setPlateNumber(e.target.value.toUpperCase())}
                      className="px-3.5 py-2 rounded-xl bg-slate-900/90 text-white font-mono font-bold text-sm tracking-wider border border-white/20 focus:outline-none focus:ring-2 focus:ring-[#FF5A5F] w-40"
                    />
                  </div>

                  {/* Vehicle Type Switcher */}
                  <div>
                    <label className="text-[10px] uppercase font-bold text-slate-300 block mb-1">
                      Jenis Kendaraan:
                    </label>
                    <div className="flex items-center gap-1.5 bg-slate-900/80 p-1 rounded-xl border border-white/10">
                      <button
                        type="button"
                        onClick={() => setVehicleType('MOBIL')}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all ${
                          vehicleType === 'MOBIL'
                            ? 'bg-[#FF5A5F] text-white shadow-xs'
                            : 'text-slate-300 hover:text-white'
                        }`}
                      >
                        <Car className="w-3.5 h-3.5" />
                        <span>Mobil (20L)</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setVehicleType('MOTOR')}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all ${
                          vehicleType === 'MOTOR'
                            ? 'bg-[#FF5A5F] text-white shadow-xs'
                            : 'text-slate-300 hover:text-white'
                        }`}
                      >
                        <Bike className="w-3.5 h-3.5" />
                        <span>Motor (4L)</span>
                      </button>
                    </div>
                  </div>

                  {/* Fuel Choice */}
                  <div>
                    <label className="text-[10px] uppercase font-bold text-slate-300 block mb-1">
                      Pilihan BBM:
                    </label>
                    <div className="flex items-center gap-1 bg-slate-900/80 p-1 rounded-xl border border-white/10">
                      {(['Pertalite', 'Pertamax', 'Solar'] as FuelType[]).map((fuel) => (
                        <button
                          key={fuel}
                          type="button"
                          onClick={() => setFuelType(fuel)}
                          className={`px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                            fuelType === fuel
                              ? 'bg-white text-slate-900 shadow-xs'
                              : 'text-slate-300 hover:text-white'
                          }`}
                        >
                          {fuel}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Right: Parity Status Callout */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 bg-slate-900/90 p-4 rounded-xl border border-white/10">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-[#FF9F1C]" />
                    <span className="text-xs font-semibold text-slate-300">
                      Kalender: {isOddDay ? 'HARI GANJIL' : 'HARI GENAP'}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    {parityAccess.allowedToday ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-xs font-bold">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Hak Akses Terbuka Hari Ini</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-amber-500/20 text-amber-300 border border-amber-500/40 text-xs font-bold">
                        <Clock className="w-3.5 h-3.5" />
                        <span>Jadwal Anda: Besok (H+1)</span>
                      </span>
                    )}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={toggleSimulatedDateParity}
                  className="px-3 py-2 rounded-xl bg-white/10 hover:bg-[#FF5A5F] text-white text-xs font-bold transition-all flex items-center gap-1.5 active:scale-95 border border-white/20 whitespace-nowrap"
                  title="Ganti paritas tanggal untuk pengujian"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Ubah Tanggal</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Active Ticket Notification Banner (if user already booked) */}
      {driverActiveTicket && (
        <div className="max-w-[1240px] mx-auto px-6 md:px-10 mt-8">
          <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-emerald-50 via-teal-50 to-white border-2 border-emerald-300 shadow-md flex flex-wrap items-center justify-between gap-4 animate-slide-in-up">
            <div className="flex items-center gap-3.5">
              <div className="w-11 h-11 rounded-xl bg-emerald-600 text-white flex items-center justify-center flex-shrink-0 shadow-sm">
                <Ticket className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-emerald-900">
                    Tiket Antrean Terkonfirmasi:
                  </span>
                  <span className="font-mono text-sm font-extrabold text-slate-900 bg-white px-2 py-0.5 rounded border border-emerald-200">
                    {driverActiveTicket.ticketCode}
                  </span>
                </div>
                <p className="text-xs text-slate-600 mt-1">
                  {driverActiveTicket.spbuName} • {driverActiveTicket.fuelType} (Maks {driverActiveTicket.quotaLiters}L) • Gelombang {driverActiveTicket.slotWindowLabel}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setActiveTicket(driverActiveTicket)}
              className="btn-coral py-2.5 px-5 text-xs font-bold uppercase tracking-wider flex items-center gap-2 shadow-sm"
            >
              <QrCode className="w-4 h-4" />
              <span>Buka QR Pass Tiket</span>
            </button>
          </div>
        </div>
      )}

      {/* 3. Main Centered Body: Bali Interactive Map & Smart Recommendations */}
      <div className="max-w-[1240px] mx-auto px-6 md:px-10 py-10 space-y-8">
        {/* Smart Alternative Recommendation Modal/Alert Card (If Throttled/Unloading clicked) */}
        {throttledStationNotice && recommendedStation && (
          <div className="p-6 rounded-2xl bg-amber-50 border-2 border-amber-300 shadow-lg text-slate-900 animate-slide-in-up space-y-4">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-500 text-white flex items-center justify-center flex-shrink-0 shadow-sm">
                  <AlertTriangle className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-amber-800 bg-amber-100 px-2 py-0.5 rounded">
                      Rekomendasi Cerdas Sistem
                    </span>
                    <span className="text-xs font-semibold text-slate-500">
                      Pemerataan Beban SPBU
                    </span>
                  </div>
                  <h3 className="text-base font-bold text-slate-900 mt-1">
                    {throttledStationNotice.station.name} Sedang Menerapkan Pembatasan (
                    {throttledStationNotice.station.operationalMode})
                  </h3>
                  <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                    Stok tangki di stasiun ini tersisa &lt;30% sehingga kuota mobil dipotong menjadi 10L
                    atau sedang dalam proses bongkar tangki. Untuk pengisian optimal kuota penuh (20L),
                    kami merekomendasikan SPBU alternatif di bawah ini:
                  </p>
                </div>
              </div>
            </div>

            {/* Recommended Station Card */}
            <div className="p-4 rounded-xl bg-white border border-emerald-300 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="badge badge-normal text-[9px] py-0.5 px-2 font-bold">
                    STOK NORMAL & PENUH
                  </span>
                  <span className="text-xs font-mono font-bold text-slate-400">
                    {recommendedStation.code}
                  </span>
                </div>
                <h4 className="font-bold text-sm text-slate-900">
                  {recommendedStation.name}
                </h4>
                <p className="text-xs text-slate-500 flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-slate-400" />
                  <span>{recommendedStation.address}, {recommendedStation.regency}</span>
                </p>
              </div>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={handleAcceptAlternative}
                  className="btn-coral py-2.5 px-4 text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 shadow-xs whitespace-nowrap"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Pilih SPBU Rekomendasi Ini</span>
                </button>

                <button
                  type="button"
                  onClick={handleProceedWithThrottled}
                  className="px-3 py-2 rounded-xl text-xs font-bold text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 transition-colors whitespace-nowrap"
                >
                  Tetap Lanjut di SPBU Pilihan
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Section Title */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-2 border-b border-slate-200">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#FF5A5F] mb-1">
              <Sparkles className="w-4 h-4" />
              <span>Peta Interaktif Kuota SPBU se-Bali (9 Kabupaten / Kota)</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold font-sans text-slate-900 tracking-tight">
              Pilih SPBU Tujuan & Ambil Slot Waktu
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-2xl">
              Klik stasiun mana pun di peta atau di daftar sebelah kiri. Sistem akan mengarahkan
              Anda ke jadwal kedatangan 30 menit dengan alokasi liter yang terjamin.
            </p>
          </div>

          <div className="flex items-center gap-2 text-xs font-mono font-bold bg-white px-3 py-1.5 rounded-xl border border-slate-200 text-slate-700 shadow-2xs">
            <Fuel className="w-4 h-4 text-[#FF5A5F]" />
            <span>Target BBM: {fuelType}</span>
          </div>
        </div>

        {/* Live BaliInteractiveMap Component with Booking Callback */}
        <BaliInteractiveMap onSelectBooking={handleStationMapSelection} />
      </div>

      {/* 4. TimeSlotModal (30-Minute Booking Batching) */}
      {bookingStation && bookingTank && (
        <TimeSlotModal
          isOpen={true}
          onClose={() => {
            setBookingStation(null);
            setBookingTank(null);
          }}
          station={bookingStation}
          tank={bookingTank}
          plateNumber={plateNumber}
          vehicleType={vehicleType}
          fuelType={fuelType}
          targetDate={effectiveDate}
          onBookingSuccess={(ticket) => {
            setActiveTicket(ticket);
            setBookingStation(null);
            setBookingTank(null);
          }}
        />
      )}

      {/* 5. DigitalTicketQR (Verifiable QR Receipt Modal) */}
      {activeTicket && (
        <DigitalTicketQR
          ticket={activeTicket}
          onClose={() => setActiveTicket(null)}
        />
      )}
    </div>
  );
};
export default DriverPortalPage;
