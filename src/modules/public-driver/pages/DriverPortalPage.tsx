// =============================================================================
// src/modules/public-driver/pages/DriverPortalPage.tsx — NusaFuel Grid
// User A: Citizen Driver Portal (Refactored per design.md with Centered Container)
// =============================================================================

import React, { useState, useRef } from 'react';
import { useStore } from '../../../app/store';
import { PlateCheckerCard } from '../components/PlateCheckerCard';
import { GreenImpactBanner } from '../components/GreenImpactBanner';
import { SpbuTankCard } from '../components/SpbuTankCard';
import { SpbuMapView } from '../components/SpbuMapView';
import { TimeSlotModal } from '../components/TimeSlotModal';
import { DigitalTicketQR } from '../components/DigitalTicketQR';
import type { SpbuStation, FuelTank, FuelType, VehicleType, QueueTicket } from '../../../core/data/baliSpbuSeed';
import {
  Calendar,
  Sparkles,
  RefreshCw,
  Search,
  LayoutGrid,
  Map as MapIcon,
  Ticket,
  QrCode,
  Filter,
} from 'lucide-react';

export const DriverPortalPage: React.FC = () => {
  const { state, toggleSimulatedDateParity, getEffectiveDate } = useStore();

  // Local state for the plate checker interaction
  const [plateNumber, setPlateNumber] = useState('DK 4821 FB');
  const [vehicleType, setVehicleType] = useState<VehicleType>('MOBIL');
  const [fuelType, setFuelType] = useState<FuelType>('Pertalite');
  const [targetBookingDate, setTargetBookingDate] = useState<Date>(getEffectiveDate());

  // SPBU listing & view states
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRegency, setSelectedRegency] = useState<string>('ALL');
  const [viewMode, setViewMode] = useState<'grid' | 'map'>('grid');

  // Modal states
  const [bookingStation, setBookingStation] = useState<SpbuStation | null>(null);
  const [bookingTank, setBookingTank] = useState<FuelTank | null>(null);
  const [activeTicket, setActiveTicket] = useState<QueueTicket | null>(null);

  const spbuDirectoryRef = useRef<HTMLDivElement>(null);

  const effectiveDate = getEffectiveDate();
  const isOddDay = effectiveDate.getDate() % 2 !== 0;

  // Filter stations by search query & regency
  const regencyList = Array.from(new Set(state.stations.map((s) => s.regency).filter(Boolean)));

  const filteredStations = state.stations.filter((station) => {
    const matchesRegency = selectedRegency === 'ALL' || station.regency === selectedRegency;
    const matchesQuery =
      station.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      station.address.toLowerCase().includes(searchQuery.toLowerCase()) ||
      station.district.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (station.regency && station.regency.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesRegency && matchesQuery;
  });

  const getTanksForStation = (stationId: string): FuelTank[] => {
    return state.tanks.filter((t) => t.spbuId === stationId);
  };

  const handleProceedToBooking = (date: Date) => {
    setTargetBookingDate(date);
    if (spbuDirectoryRef.current) {
      spbuDirectoryRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleOpenSlotModal = (station: SpbuStation, tank: FuelTank) => {
    setBookingStation(station);
    setBookingTank(tank);
  };

  // Find latest active ticket for user plate if exists
  const driverActiveTicket = state.tickets.find(
    (t) => t.plateNumber === plateNumber && t.status === 'BOOKED'
  );

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
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/15 text-xs font-semibold text-slate-200 mb-4 shadow-sm">
              <span className="w-2 h-2 rounded-full bg-[#FF5A5F] animate-pulse" />
              <span>Portal Layanan Warga Terpadu — Provinsi Bali</span>
            </div>

            <h1 className="text-3xl sm:text-5xl font-extrabold font-sans tracking-tight text-white leading-tight mb-4 drop-shadow-md">
              Antrean Digital BBM Cerdas & Transparansi Kuota SPBU
            </h1>

            <p className="text-base sm:text-lg text-slate-300 font-normal leading-relaxed max-w-2xl">
              Hindari antrean panjang mengular di SPBU. Periksa hak akses plat ganjil-genap Anda secara instan dan amankan slot waktu 30-menit dengan proteksi kuota kriptografis.
            </p>

            {/* Parity Status Callout */}
            <div className="mt-5 inline-flex flex-wrap items-center gap-3 bg-white/10 backdrop-blur-md p-2.5 px-4 rounded-xl border border-white/20 text-xs">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-[#FF9F1C]" />
                <span className="text-slate-300">Status Paritas:</span>
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
                <span>Ubah Paritas</span>
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
        <div className="max-w-[1240px] mx-auto px-6 md:px-10 mt-8">
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

      {/* 3. Main Centered Body Container: max-w-[1240px] mx-auto px-6 md:px-10 py-12 space-y-12 */}
      <div className="max-w-[1240px] mx-auto px-6 md:px-10 py-12 space-y-12">
        {/* Green Impact Banner & 2x2 KPI Metrics */}
        <GreenImpactBanner />

        {/* 4. SPBU Directory Section with Grid / Map Toggle & Regency Filter */}
        <div ref={spbuDirectoryRef} className="pt-4 scroll-mt-24 space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-200">
            <div>
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#FF5A5F] mb-1">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Pilih SPBU Tujuan</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold font-sans text-slate-900 tracking-tight">
                Ketersediaan Kuota SPBU di Seluruh Bali
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 mt-1">
                Jadwal antrean untuk: <strong className="text-slate-800">{targetBookingDate.toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</strong> • Bahan bakar: <strong className="text-[#FF5A5F]">{fuelType}</strong>
              </p>
            </div>

            {/* Filter & View Switcher Controls */}
            <div className="flex flex-wrap items-center gap-3">
              {/* Regency Filter */}
              <div className="flex items-center gap-1.5">
                <Filter className="w-3.5 h-3.5 text-slate-400" />
                <select
                  value={selectedRegency}
                  onChange={(e) => setSelectedRegency(e.target.value)}
                  className="py-1.5 px-2.5 rounded-lg border border-slate-200 text-xs font-semibold bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#FF5A5F]"
                >
                  <option value="ALL">Semua Kabupaten/Kota</option>
                  {regencyList.map((r) => (
                    <option key={r} value={r}>
                      {r}
                    </option>
                  ))}
                </select>
              </div>

              {/* Search bar */}
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Cari SPBU / Jalan..."
                  className="pl-8 pr-3 py-1.5 rounded-lg border border-slate-200 text-xs bg-white focus:outline-none focus:ring-2 focus:ring-[#FF5A5F] text-slate-800 placeholder:text-slate-400 w-40 sm:w-48"
                />
              </div>

              {/* Grid / Map View Switcher */}
              <div className="bg-slate-100 p-1 rounded-lg border border-slate-200 flex items-center shadow-inner">
                <button
                  type="button"
                  onClick={() => setViewMode('grid')}
                  className={`flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-bold transition-all ${
                    viewMode === 'grid'
                      ? 'bg-white text-slate-900 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <LayoutGrid className="w-3.5 h-3.5" />
                  <span>Grid</span>
                </button>

                <button
                  type="button"
                  onClick={() => setViewMode('map')}
                  className={`flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-bold transition-all ${
                    viewMode === 'map'
                      ? 'bg-white text-slate-900 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <MapIcon className="w-3.5 h-3.5 text-[#FF5A5F]" />
                  <span>Peta</span>
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
