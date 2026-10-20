// =============================================================================
// src/modules/landing/pages/PublicLandingPage.tsx — NusaFuel Grid
// Public Landing Page for Provinsi Bali Automated Fuel Infrastructure
// Zero AI Slop per design.md §6.2 — Full-Bleed Twilight Canopy Hero & Centered Grid
// =============================================================================

import React, { useState, useMemo } from 'react';
import { useAuth } from '../../../core/auth/authContext';
import { useStore } from '../../../app/store';
import { SpbuMapView } from '../../public-driver/components/SpbuMapView';
import { PlateCheckerCard } from '../../public-driver/components/PlateCheckerCard';
import { GreenImpactBanner } from '../../public-driver/components/GreenImpactBanner';
import {
  ArrowRight,
  ShieldCheck,
  Zap,
  MapPin,
  CheckCircle2,
  Calendar,
} from 'lucide-react';

import type { VehicleType, FuelType } from '../../../core/data/baliSpbuSeed';

export const PublicLandingPage: React.FC = () => {
  const { navigate } = useAuth();
  const { state } = useStore();
  const [selectedRegency, setSelectedRegency] = useState<string>('ALL');
  const [plateNumber, setPlateNumber] = useState('DK 4821 FB');
  const [vehicleType, setVehicleType] = useState<VehicleType>('MOBIL');
  const [fuelType, setFuelType] = useState<FuelType>('Pertalite');

  // Filter stations by regency
  const regencies = useMemo(() => {
    const list = Array.from(new Set(state.stations.map((s) => s.regency).filter(Boolean)));
    return ['ALL', ...list];
  }, [state.stations]);

  const filteredStations = useMemo(() => {
    if (selectedRegency === 'ALL') return state.stations;
    return state.stations.filter((s) => s.regency === selectedRegency);
  }, [state.stations, selectedRegency]);

  const scrollToMap = () => {
    const el = document.getElementById('bali-map-section');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="w-full pb-20 animate-fade-in font-sans">
      {/* 1. Hero Section: Full-Bleed Twilight Petrol Canopy per design.md §6.2 */}
      <section className="relative bg-[#18152E] text-white overflow-hidden py-16 sm:py-24 border-b border-slate-800">
        {/* Subtle radial gradients */}
        <div className="absolute top-0 right-1/4 w-96 h-96 rounded-full bg-[#00A8E8]/10 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-20 left-10 w-96 h-96 rounded-full bg-[#FF5A5F]/15 blur-3xl pointer-events-none" />

        <div className="max-w-[1240px] mx-auto px-6 md:px-10 relative z-10">
          <div className="max-w-3xl">
            {/* Pill Badge */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-800/80 border border-slate-700 text-xs font-semibold text-[#00A8E8] mb-6 shadow-sm">
              <span className="w-2 h-2 rounded-full bg-[#00A8E8] animate-pulse" />
              <span>Sistem Distribusi Digital BBM Provinsi Bali</span>
            </div>

            {/* Architectural Heading */}
            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold font-sans tracking-tight leading-[1.1] text-white">
              Infrastruktur Cerdas Distribusi & Antrean BBM Terintegrasi
            </h1>

            {/* Subtitle */}
            <p className="text-sm sm:text-base text-slate-300 mt-5 leading-relaxed max-w-2xl">
              Mengeliminasi antrean panjang di 9 Kabupaten/Kota Provinsi Bali melalui kuota dinamis,
              penegakan paritas ganjil-genap otonom, dan pencegahan penimbunan BBM bersubsidi berbasis
              kriptografi SHA-256.
            </p>

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center gap-3.5 mt-8">
              <button
                type="button"
                onClick={() => navigate('/login')}
                className="py-3.5 px-6 rounded-xl bg-[#FF5A5F] hover:bg-[#e0484d] text-white font-bold text-xs uppercase tracking-wider transition-all shadow-lg active:scale-95 flex items-center gap-2"
              >
                <span>Masuk ke Portal Layanan & Operasional</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                type="button"
                onClick={scrollToMap}
                className="py-3.5 px-6 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 text-slate-200 border border-slate-700 font-bold text-xs uppercase tracking-wider transition-all active:scale-95 flex items-center gap-2"
              >
                <MapPin className="w-4 h-4 text-[#FF9F1C]" />
                <span>Peta Live 9 Kabupaten Bali</span>
              </button>
            </div>

            {/* Quick Stat Pill Bar */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-12 pt-8 border-t border-slate-800/80">
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">
                  Cakupan Wilayah
                </span>
                <span className="text-lg sm:text-xl font-mono font-bold text-white">9 Kab/Kota</span>
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">
                  Jaringan SPBU Pilot
                </span>
                <span className="text-lg sm:text-xl font-mono font-bold text-white">11 Stasiun</span>
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">
                  Pusat Suplai Depot
                </span>
                <span className="text-lg sm:text-xl font-mono font-bold text-white">Manggis & Sanggaran</span>
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">
                  Waktu Tunggu Rata-rata
                </span>
                <span className="text-lg sm:text-xl font-mono font-bold text-emerald-400">&lt; 8 Menit</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Main Centered Body Container: max-w-[1240px] mx-auto px-6 md:px-10 */}
      <div className="max-w-[1240px] mx-auto px-6 md:px-10 py-12 space-y-16">
        {/* Section: Live Plate Parity Checker for Visitors */}
        <section className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-slate-900">
                Pemeriksaan Hak Akses Pengisian BBM Hari Ini
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                Masukkan nomor polisi kendaraan Anda untuk memeriksa paritas ganjil-genap dan ketersediaan kuota
              </p>
            </div>
            <span className="text-xs font-mono font-bold bg-slate-100 text-slate-700 px-3 py-1 rounded-full border border-slate-200">
              REGULASI HARI INI
            </span>
          </div>

          <PlateCheckerCard
            plateNumber={plateNumber}
            setPlateNumber={setPlateNumber}
            vehicleType={vehicleType}
            setVehicleType={setVehicleType}
            fuelType={fuelType}
            setFuelType={setFuelType}
            onProceedToBooking={() => navigate('/login')}
          />
        </section>

        {/* Section: Geospatial Live Bali SPBU Map */}
        <section id="bali-map-section" className="space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-200">
            <div>
              <div className="flex items-center gap-2 text-xs font-bold text-[#FF5A5F] uppercase tracking-wider mb-1">
                <MapPin className="w-4 h-4" />
                <span>Peta Interaktif Waktu-Nyata</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-bold text-slate-900">
                Jaringan SPBU Terkoneksi di Seluruh Provinsi Bali
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                Pantau status operasional tangki di 9 Kabupaten/Kota: Buleleng, Denpasar, Badung, Gianyar, Tabanan, Jembrana, Karangasem, Klungkung, dan Bangli
              </p>
            </div>

            {/* Regency Filter Dropdown */}
            <div className="flex items-center gap-2 text-xs">
              <span className="font-semibold text-slate-500">Filter Wilayah:</span>
              <select
                value={selectedRegency}
                onChange={(e) => setSelectedRegency(e.target.value)}
                className="py-1.5 px-3 rounded-lg border border-slate-300 bg-white font-semibold text-slate-800 text-xs focus:outline-none focus:ring-2 focus:ring-[#FF5A5F]"
              >
                <option value="ALL">Seluruh Bali ({state.stations.length} SPBU)</option>
                {regencies
                  .filter((r) => r !== 'ALL')
                  .map((r) => (
                    <option key={r} value={r}>
                      {r}
                    </option>
                  ))}
              </select>
            </div>
          </div>

          {/* Map Viewer */}
          <div className="bg-white rounded-2xl border border-[#E6E8EC] p-3 sm:p-5 shadow-sm">
            <SpbuMapView
              selectedFuelType={fuelType}
              onSelectBooking={() => navigate('/login')}
            />
          </div>

          {/* Station Status Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredStations.slice(0, 6).map((spbu) => (
              <div
                key={spbu.id}
                className="p-4 rounded-xl bg-white border border-slate-200 shadow-2xs hover:shadow-sm transition-all"
              >
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div>
                    <span className="text-[10px] font-mono font-bold text-slate-400">
                      {spbu.code} • {spbu.regency}
                    </span>
                    <h3 className="text-xs font-bold text-slate-900 leading-snug line-clamp-1">
                      {spbu.name}
                    </h3>
                  </div>
                  <span
                    className={`badge text-[9px] py-0.5 px-2 font-bold ${
                      spbu.operationalMode === 'NORMAL'
                        ? 'badge-normal'
                        : spbu.operationalMode === 'THROTTLED'
                        ? 'badge-throttled'
                        : spbu.operationalMode === 'UNLOADING'
                        ? 'badge-unloading'
                        : 'badge-critical'
                    }`}
                  >
                    {spbu.operationalMode}
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 line-clamp-1">{spbu.address}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Section: 3 Pillars of NusaFuel Automation */}
        <section id="automation-section" className="space-y-6">
          <div className="text-center max-w-2xl mx-auto pb-4">
            <span className="text-xs font-extrabold uppercase tracking-widest text-[#FF5A5F]">
              Arsitektur Otomasi Cerdas
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 mt-1">
              Bagaimana NusaFuel Grid Mengubah Tata Kelola Energi Bali
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-2">
              Mengintegrasikan regulasi lalu lintas ganjil-genap dengan sensor probe tangki real-time dan orkestrasi depot otonom
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Card 1 */}
            <div className="bg-white rounded-2xl p-6 border border-[#E6E8EC] shadow-sm flex flex-col justify-between hover:shadow-md transition-all">
              <div>
                <div className="w-10 h-10 rounded-xl bg-red-50 text-[#FF5A5F] flex items-center justify-center mb-4">
                  <Calendar className="w-5 h-5" />
                </div>
                <h3 className="text-base font-bold text-slate-900 mb-2">
                  1. Batching Slot 30 Menit & Ganjil-Genap
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Warga mengamankan kuota sebelum berangkat ke SPBU. Paritas tanggal sistem membagi
                  beban volume kendaraan secara merata dan mencegah penumpukan fisik di jalan raya.
                </p>
              </div>
              <div className="mt-4 pt-4 border-t border-slate-100 flex items-center gap-1.5 text-[11px] font-semibold text-[#FF5A5F]">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Antrean terpangkas 85%</span>
              </div>
            </div>

            {/* Card 2 */}
            <div className="bg-white rounded-2xl p-6 border border-[#E6E8EC] shadow-sm flex flex-col justify-between hover:shadow-md transition-all">
              <div>
                <div className="w-10 h-10 rounded-xl bg-amber-50 text-[#FF9F1C] flex items-center justify-center mb-4">
                  <Zap className="w-5 h-5 fill-[#FF9F1C]" />
                </div>
                <h3 className="text-base font-bold text-slate-900 mb-2">
                  2. Dynamic Throttling & 10% Emergency Lock
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Ketika stok tangki menyentuh &lt;30%, kuota mobil otomatis dipangkas dari 20L ke 10L
                  agar BBM terbagi rata. Sisa 10% dasar tangki terkunci khusus ambulans, damkar, dan BPBD.
                </p>
              </div>
              <div className="mt-4 pt-4 border-t border-slate-100 flex items-center gap-1.5 text-[11px] font-semibold text-[#FF9F1C]">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Pemerataan kuota publik</span>
              </div>
            </div>

            {/* Card 3 */}
            <div className="bg-white rounded-2xl p-6 border border-[#E6E8EC] shadow-sm flex flex-col justify-between hover:shadow-md transition-all">
              <div>
                <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center mb-4">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <h3 className="text-base font-bold text-slate-900 mb-2">
                  3. Anti-Ngangsu SHA-256 & Webhook Depot
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Tiket terikat hash kriptografis SHA-256. Setiap plat kendaraan dibatasi 1x pengisian
                  per 24 jam lintas-SPBU. Saat tangki &le;20%, webhook otomatis memesan truk ke Depot Manggis.
                </p>
              </div>
              <div className="mt-4 pt-4 border-t border-slate-100 flex items-center gap-1.5 text-[11px] font-semibold text-blue-600">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Nol penimbunan lintas stasiun</span>
              </div>
            </div>
          </div>
        </section>

        {/* Section: Green Impact Metrics */}
        <section className="space-y-4">
          <div className="flex items-center justify-between pb-2">
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-slate-900">
                Dampak Lingkungan & Efisiensi Energi di Bali
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Kalkulasi emisi karbon yang berhasil dihindarkan dengan meniadakan antrean kendaraan bermesin menyala
              </p>
            </div>
          </div>
          <GreenImpactBanner />
        </section>

        {/* Section: Call-To-Action Banner */}
        <section className="rounded-3xl p-8 sm:p-12 bg-gradient-to-br from-[#18152E] to-[#121316] text-white flex flex-col md:flex-row items-center justify-between gap-8 shadow-xl">
          <div className="max-w-xl">
            <span className="text-xs font-extrabold uppercase tracking-widest text-[#00A8E8]">
              Portal Layanan Terpadu
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold font-sans mt-2">
              Mulai Gunakan NusaFuel Grid Sekarang
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 mt-2 leading-relaxed">
              Pilih peran Anda untuk masuk ke sistem: Pengendara (Warga Bali), Petugas Operator SPBU,
              atau Administrator Logistik Depot Pertamina.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
            <button
              type="button"
              onClick={() => navigate('/login')}
              className="w-full sm:w-auto py-3.5 px-6 rounded-xl bg-[#FF5A5F] hover:bg-[#e0484d] text-white font-bold text-xs uppercase tracking-wider transition-all shadow-md active:scale-95 flex items-center justify-center gap-2"
            >
              <span>Masuk / Pilih Akun</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </section>
      </div>
    </div>
  );
};
export default PublicLandingPage;
