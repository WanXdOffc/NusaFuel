// =============================================================================
// src/modules/public-driver/pages/DriverPortalPage.tsx — NusaFuel Grid
// Portal Warga (User A) — Complete Stage 3 Implementation
// Twilight Hero, Plate Checker, Green Impact 2x2, Map/Grid Toggle & Digital QR
// Compliant with design.md (Zero AI Slop) and prd.md §3.1, §4.1, §4.4
// =============================================================================

import React, { useState, useRef } from 'react';
import { useStore } from '../../../app/store';
import { PlateCheckerCard } from '../components/PlateCheckerCard';
import { GreenImpactBanner } from '../components/GreenImpactBanner';
import { SpbuTankCard } from '../components/SpbuTankCard';
import { SpbuMapView } from '../components/SpbuMapView';
import { TimeSlotModal } from '../components/TimeSlotModal';
import { DigitalTicketQR } from '../components/DigitalTicketQR';
import type { VehicleType } from '../../../core/automation/oddEvenEngine';
import type { FuelType, SpbuStation, FuelTank, QueueTicket } from '../../../core/data/bulelengSpbuSeed';
import {
  LayoutGrid,
  Map as MapIcon,
  Ticket,
  QrCode,
  Calendar,
  Sparkles,
  RefreshCw,
  Search,
} from 'lucide-react';

export const DriverPortalPage: React.FC = () => {
  const { state, getEffectiveDate, getTanksForStation, toggleSimulatedDateParity } = useStore();
  const effectiveDate = getEffectiveDate();
  const isOddDay = effectiveDate.getDate() % 2 !== 0;

  // Driver form states
  const [plateNumber, setPlateNumber] = useState('DK 4821 FB');
  const [vehicleType, setVehicleType] = useState<VehicleType>('MOBIL');
  const [fuelType, setFuelType] = useState<FuelType>('Pertalite');
  const [targetBookingDate, setTargetBookingDate] = useState<Date>(effectiveDate);

  // View toggle: 'grid' vs 'map'
  const [viewMode, setViewMode] = useState<'grid' | 'map'>('grid');

  // Search filter for SPBUs
  const [searchQuery, setSearchQuery] = useState('');

  // Modal states
  const [bookingStation, setBookingStation] = useState<SpbuStation | null>(null);
  const [bookingTank, setBookingTank] = useState<FuelTank | null>(null);
  const [activeTicket, setActiveTicket] = useState<QueueTicket | null>(null);

  // Ref for scrolling to SPBU directory
  const spbuDirectoryRef = useRef<HTMLDivElement>(null);

  const handleProceedToBooking = (date: Date) => {
    setTargetBookingDate(date);
    spbuDirectoryRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleOpenSlotModal = (station: SpbuStation, tank: FuelTank) => {
    setBookingStation(station);
    setBookingTank(tank);
  };

  // Find latest active ticket for this plate
  const driverActiveTicket = state.tickets.find(
    (t) => t.plateNumber === plateNumber && t.status === 'BOOKED'
  );

  // Filtered stations based on search
  const filteredStations = state.stations.filter(
    (s) =>
      s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.code.includes(searchQuery) ||
      s.address.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="w-full pb-20 animate-fade-in font-sans">
      {/* 1. Full-Bleed Twilight Petrol Canopy Hero per design.md §6.2 */}
      <section className="relative bg-[#18152E] text-white overflow-hidden py-12 md:py-16 border-b border-slate-800">
        {/* Directional gradient overlay per design.md §6.2 */}
        <div
          className="absolute inset-0 pointer-events-none z-10"
          style={{
            background:
              'linear-gradient(90deg, rgba(16, 14, 34, 0.95) 0%, rgba(24, 21, 46, 0.85) 55%, rgba(18, 15, 38, 0.6) 100%)',
          }}
        />

        {/* Architectural atmospheric glow lights */}
        <div className="absolute -right-24 -top-24 w-[480px] h-[480px] rounded-full bg-[#FF5A5F]/15 blur-3xl pointer-events-none" />
        <div className="absolute right-1/3 bottom-0 w-80 h-80 rounded-full bg-[#FF9F1C]/10 blur-3xl pointer-events-none" />

        <div className="relative z-20 max-w-[1360px] mx-auto px-4 sm:px-6">
          {/* Top Banner Tag */}
          <div className="max-w-3xl mb-8">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/15 text-xs font-semibold text-slate-200 mb-4 shadow-sm">
              <span className="w-2 h-2 rounded-full bg-[#FF5A5F] animate-pulse" />
              <span>Portal Layanan Warga Kabupaten Buleleng — Subtema Lingkungan & AI</span>
            </div>

            <h1 className="text-3xl sm:text-5xl font-extrabold font-sans tracking-tight text-white leading-tight mb-4 drop-shadow-md">
              Antrean Digital BBM Cerdas & Transparansi Kuota SPBU
            </h1>

            <p className="text-base sm:text-lg text-slate-300 font-normal leading-relaxed max-w-2xl">
              Hindari antrean panjang mengular di SPBU Singaraja. Periksa hak akses plat ganjil-genap Anda secara instan dan amankan slot waktu 30-menit dengan proteksi kuota kriptografis.
            </p>

            {/* Quick date simulation callout for judges */}
            <div className="mt-5 inline-flex flex-wrap items-center gap-3 bg-white/10 backdrop-blur-md p-2.5 px-4 rounded-xl border border-white/20 text-xs">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-[#FF9F1C]" />
                <span className="text-slate-300">Status Hari Ini:</span>
                <span className="font-bold text-white">
                  {isOddDay ? 'HARI GANJIL (Plat 1, 3, 5, 7, 9)' : 'HARI GENAP (Plat 0, 2, 4, 6, 8)'}
                </span>
              </div>
              <button
                type="button"
                onClick={toggleSimulatedDateParity}
                className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#FF5A5F] hover:bg-[#E0484D] text-white font-bold transition-all shadow-xs"
                title="Beralih tanggal sistem untuk menguji validasi ganjil/genap"
              >
                <RefreshCw className="w-3 h-3" />
                <span>Ubah Hari (Uji Juri)</span>
              </button>
            </div>
          </div>

          {/* Interactive PlateCheckerCard Component */}
          <div className="mt-6">
            <PlateCheckerCard
              plateNumber={plateNumber}
              setPlateNumber={setPlateNumber}
              vehicleType={vehicleType}
              setVehicleType={setVehicleType}
              fuelType={fuelType}
              setFuelType={setFuelType}
              onProceedToBooking={handleProceedToBooking}
            />
          </div>
        </div>
      </section>

      {/* 2. Active Ticket Notification Banner (if user already booked) */}
      {driverActiveTicket && (
        <div className="max-w-[1360px] mx-auto px-4 sm:px-6 mt-6">
          <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-50 via-teal-50 to-white border-2 border-emerald-300 shadow-md flex flex-wrap items-center justify-between gap-4 animate-slide-in-up">
            <div className="flex items-center gap-3.5">
              <div className="w-11 h-11 rounded-xl bg-emerald-600 text-white flex items-center justify-center flex-shrink-0 shadow-sm">
                <Ticket className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-emerald-900">
                    Tiket Antrean Aktif Anda:
                  </span>
                  <span className="font-mono text-sm font-extrabold text-slate-900">
                    {driverActiveTicket.ticketCode}
                  </span>
                </div>
                <p className="text-xs text-slate-600 mt-0.5">
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
              <span>Buka Kode QR Tiket</span>
            </button>
          </div>
        </div>
      )}

      {/* 3. Main Container Area */}
      <div className="max-w-[1360px] mx-auto px-4 sm:px-6">
        {/* Green Impact Banner & 2x2 KPI Metrics */}
        <GreenImpactBanner />

        {/* 4. SPBU Directory Section with Grid / Map Toggle */}
        <div ref={spbuDirectoryRef} className="pt-4 scroll-mt-24">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
            <div>
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#FF5A5F] mb-1">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Pilih SPBU Tujuan</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold font-sans text-slate-900 tracking-tight">
                Ketersediaan Kuota 4 SPBU di Kabupaten Buleleng
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 mt-1">
                Jadwal antrean untuk: <strong className="text-slate-800">{targetBookingDate.toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</strong> • Bahan bakar: <strong className="text-[#FF5A5F]">{fuelType}</strong>
              </p>
            </div>

            {/* View Switcher Controls & Quick Filter */}
            <div className="flex flex-wrap items-center gap-3">
              {/* Search bar */}
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Cari SPBU / Jalan..."
                  className="pl-8 pr-3 py-1.5 rounded-full border border-slate-200 text-xs bg-white focus:outline-none focus:ring-2 focus:ring-[#FF5A5F] text-slate-800 placeholder:text-slate-400 w-48 sm:w-56"
                />
              </div>

              {/* Grid / Map View Switcher Pill */}
              <div className="bg-slate-100 p-1 rounded-full border border-slate-200 flex items-center shadow-inner">
                <button
                  type="button"
                  onClick={() => setViewMode('grid')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-all ${
                    viewMode === 'grid'
                      ? 'bg-white text-slate-900 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <LayoutGrid className="w-3.5 h-3.5" />
                  <span>Grid Kartu</span>
                </button>

                <button
                  type="button"
                  onClick={() => setViewMode('map')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-all ${
                    viewMode === 'map'
                      ? 'bg-white text-slate-900 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <MapIcon className="w-3.5 h-3.5 text-[#FF5A5F]" />
                  <span>Peta Geospasial</span>
                </button>
              </div>
            </div>
          </div>

          {/* Conditional View Rendering: Grid vs Leaflet Map */}
          {viewMode === 'grid' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {filteredStations.map((station) => {
                const tanks = getTanksForStation(station.id);
                return (
                  <SpbuTankCard
                    key={station.id}
                    station={station}
                    tanks={tanks}
                    selectedFuelType={fuelType}
                    onSelectBooking={handleOpenSlotModal}
                  />
                );
              })}
            </div>
          ) : (
            <SpbuMapView
              selectedFuelType={fuelType}
              onSelectBooking={handleOpenSlotModal}
            />
          )}
        </div>
      </div>

      {/* 5. TimeSlotModal (30-Minute Booking Batching) */}
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
          targetDate={targetBookingDate}
          onBookingSuccess={(ticket) => {
            setActiveTicket(ticket);
            setBookingStation(null);
            setBookingTank(null);
          }}
        />
      )}

      {/* 6. DigitalTicketQR (Verifiable QR Receipt Modal) */}
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
