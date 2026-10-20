// =============================================================================
// src/modules/landing/pages/PublicLandingPage.tsx — NusaFuel Grid
// Public Corporate Landing Page for Provinsi Bali Automated Fuel Infrastructure
// Compliant with design.md (Mahavir & Co Visual Structure + CekBBM/BaliFuel Interactive Map)
// =============================================================================

import React from 'react';
import { useAuth } from '../../../core/auth/authContext';
import { useStore } from '../../../app/store';
import { BaliInteractiveMap } from '../../../shared/components/BaliInteractiveMap';
import spbuNightCanopy from '../../../assets/spbu_night_canopy.jpg';
import spbuSmartSensor from '../../../assets/spbu_smart_sensor.jpg';
import pertaminaTankerTruck from '../../../assets/pertamina_tanker_truck.jpg';
import {
  MapPin,
  Calendar,
  ArrowRight,
  ShieldCheck,
  Zap,
  TrendingUp,
  Leaf,
  Building2,
  Layers,
  Sparkles,
  CheckCircle2,
  Cpu,
  Fuel,
  UserCheck,
} from 'lucide-react';

export const PublicLandingPage: React.FC = () => {
  const { navigate } = useAuth();
  const { getEffectiveDate, toggleSimulatedDateParity } = useStore();

  const effectiveDate = getEffectiveDate();
  const dayNumber = effectiveDate.getDate();
  const isOddDay = dayNumber % 2 !== 0;

  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="w-full pb-20 animate-fade-in font-sans">
      {/* ----------------------------------------------------------------------- */}
      {/* 1. Full-Bleed Twilight Petrol Canopy Hero per design.md §6.2            */}
      {/* ----------------------------------------------------------------------- */}
      <section className="relative bg-[#18152E] text-white overflow-hidden py-16 sm:py-24 border-b border-slate-800">
        {/* Directional gradient overlay */}
        <div
          className="absolute inset-0 pointer-events-none z-10"
          style={{
            background:
              'linear-gradient(90deg, rgba(16, 14, 34, 0.94) 0%, rgba(24, 21, 46, 0.82) 55%, rgba(18, 15, 38, 0.5) 100%)',
          }}
        />

        {/* Ambient glow lights */}
        <div className="absolute top-0 right-1/4 w-96 h-96 rounded-full bg-[#00A8E8]/10 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-20 left-10 w-96 h-96 rounded-full bg-[#FF5A5F]/15 blur-3xl pointer-events-none" />

        <div className="max-w-[1240px] mx-auto px-6 md:px-10 relative z-20">
          <div className="max-w-3xl">
            {/* Top Pill Status Badge */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-800/80 border border-slate-700 text-xs font-semibold text-[#00A8E8] mb-6 shadow-sm">
              <span className="w-2 h-2 rounded-full bg-[#00A8E8] animate-pulse" />
              <span>Sistem Distribusi Digital BBM Provinsi Bali — 9 Kabupaten & Kota</span>
            </div>

            {/* Architectural Heading */}
            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold font-sans tracking-tight leading-[1.1] text-white">
              Infrastruktur Otomasi Distribusi & Kuota BBM Terintegrasi Provinsi Bali
            </h1>

            {/* Subtitle */}
            <p className="text-sm sm:text-base text-slate-300 mt-5 leading-relaxed max-w-2xl font-normal">
              Solusi digital otonom skala regional untuk meniadakan antrean kendaraan bermotor,
              memastikan pemerataan kuota subsidi via paritas ganjil-genap cerdas, dan mencegah
              praktik penimbunan lintas-SPBU secara absolut dengan kriptografi SHA-256.
            </p>

            {/* Parity Status Today Chip */}
            <div className="mt-6 inline-flex flex-wrap items-center gap-3 bg-white/10 backdrop-blur-md p-2.5 px-4 rounded-xl border border-white/20 text-xs">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-[#FF9F1C]" />
                <span className="text-slate-300">Regulasi Paritas Hari Ini:</span>
                <span className="font-bold text-white">
                  {isOddDay ? 'HARI GANJIL (Plat 1, 3, 5, 7, 9)' : 'HARI GENAP (Plat 0, 2, 4, 6, 8)'}
                </span>
              </div>
              <button
                type="button"
                onClick={toggleSimulatedDateParity}
                className="text-[10px] font-bold px-2 py-0.5 rounded bg-white/20 hover:bg-[#FF5A5F] text-white transition-all shadow-2xs"
              >
                Ganti Paritas
              </button>
            </div>

            {/* Primary Action CTA Buttons */}
            <div className="flex flex-wrap items-center gap-4 mt-8">
              <button
                type="button"
                onClick={() => scrollToSection('bali-interactive-map-section')}
                className="py-3.5 px-6 rounded-xl text-white font-bold text-xs uppercase tracking-wider transition-all shadow-lg active:scale-95 flex items-center gap-2"
                style={{ backgroundColor: '#FF5A5F' }}
              >
                <MapPin className="w-4 h-4 text-white" />
                <span>Jelajahi Peta SPBU Bali</span>
              </button>

              <button
                type="button"
                onClick={() => navigate('/login')}
                className="py-3.5 px-6 rounded-xl bg-slate-800/90 hover:bg-slate-700 text-slate-200 border border-slate-700 font-bold text-xs uppercase tracking-wider transition-all active:scale-95 flex items-center gap-2"
              >
                <span>Masuk Portal Sistem</span>
                <ArrowRight className="w-4 h-4 text-[#FF9F1C]" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ----------------------------------------------------------------------- */}
      {/* 2. Section Statistik Dampak Lingkungan & Infrastruktur (Split 2 Kolom)  */}
      {/* ----------------------------------------------------------------------- */}
      <section className="py-16 sm:py-20 border-b border-slate-200 bg-white">
        <div className="max-w-[1240px] mx-auto px-6 md:px-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left Column (6 Cols): Typography & 2x2 KPI Grid */}
            <div className="lg:col-span-6 space-y-6">
              <div>
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#FF5A5F] mb-1.5">
                  <Leaf className="w-4 h-4" />
                  <span>Dampak Keberlanjutan & Efisiensi Energi</span>
                </div>
                <h2 className="text-2xl sm:text-3xl font-extrabold font-sans text-slate-900 tracking-tight leading-snug">
                  Transformasi Pengendalian Emisi & Transparansi Bahan Bakar Bali
                </h2>
                <p className="text-xs sm:text-sm text-slate-600 mt-3 leading-relaxed">
                  Sebelum implementasi NusaFuel Grid, ribuan kendaraan terjebak dalam antrean fisik
                  hingga 60–90 menit dengan mesin menyala *(idling)*. Dengan penjadwalan batching
                  waktu 30 menit dan sensor ATG otonom, ekosistem transportasi Bali bergerak menuju
                  nol antrean dan nol kebocoran subsidi.
                </p>
              </div>

              {/* 2x2 KPI Grid per design.md §5.1 */}
              <div className="grid grid-cols-2 gap-4 sm:gap-6 pt-2">
                {/* KPI 1 */}
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/90 shadow-2xs">
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      Jaringan SPBU
                    </span>
                    <Building2 className="w-4 h-4 text-[#FF5A5F]" />
                  </div>
                  <div className="text-2xl sm:text-3xl font-mono font-bold text-slate-900">
                    11 Stasiun
                  </div>
                  <p className="text-[11px] text-slate-500 mt-1">
                    Tersebar di 9 Kabupaten & Kota di Bali
                  </p>
                </div>

                {/* KPI 2 */}
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/90 shadow-2xs">
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      BBM Dihemat / Hari
                    </span>
                    <Fuel className="w-4 h-4 text-[#FF9F1C]" />
                  </div>
                  <div className="text-2xl sm:text-3xl font-mono font-bold text-slate-900">
                    1.450 L
                  </div>
                  <p className="text-[11px] text-slate-500 mt-1">
                    Reduksi pemborosan mesin idling antrean
                  </p>
                </div>

                {/* KPI 3 */}
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/90 shadow-2xs">
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      Emisi CO₂ Tercegah
                    </span>
                    <Leaf className="w-4 h-4 text-emerald-600" />
                  </div>
                  <div className="text-2xl sm:text-3xl font-mono font-bold text-emerald-700">
                    3.48 Ton
                  </div>
                  <p className="text-[11px] text-slate-500 mt-1">
                    Penurunan emisi karbon per minggu di Bali
                  </p>
                </div>

                {/* KPI 4 */}
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/90 shadow-2xs">
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      Akurasi Telemetri
                    </span>
                    <TrendingUp className="w-4 h-4 text-sky-600" />
                  </div>
                  <div className="text-2xl sm:text-3xl font-mono font-bold text-sky-950">
                    99.8 %
                  </div>
                  <p className="text-[11px] text-slate-500 mt-1">
                    Sensor ATG terhubung langsung ke Depot
                  </p>
                </div>
              </div>
            </div>

            {/* Right Column (6 Cols): Sharp-Cornered High-Contrast Night Canopy Photograph */}
            <div className="lg:col-span-6 relative">
              <div className="rounded-2xl overflow-hidden shadow-2xl border-4 border-white bg-slate-900">
                <img
                  src={spbuNightCanopy}
                  alt="Modern Pertamina Petrol Station with Illuminated Red Canopy at Twilight Night in Bali"
                  className="w-full h-[380px] sm:h-[440px] object-cover object-center transform hover:scale-102 transition-transform duration-500"
                />
              </div>

              {/* Float badge */}
              <div className="absolute -bottom-4 left-6 bg-[#18152E] text-white p-3.5 px-5 rounded-xl border border-slate-700 shadow-xl flex items-center gap-3 text-xs">
                <ShieldCheck className="w-5 h-5 text-emerald-400 flex-shrink-0" />
                <div>
                  <span className="font-bold block leading-tight">
                    Standardisasi K3 & Pengawasan Digital
                  </span>
                  <span className="text-[10px] text-slate-400">
                    BPH Migas • ESDM Provinsi Bali
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ----------------------------------------------------------------------- */}
      {/* 3. Section Live Interactive Map Seluruh Bali (Split-View Component)     */}
      {/* ----------------------------------------------------------------------- */}
      <section id="bali-interactive-map-section" className="py-16 sm:py-20 bg-[#F7F8FA]">
        <div className="max-w-[1240px] mx-auto px-6 md:px-10 space-y-6">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-2">
            <div>
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#FF5A5F] mb-1">
                <Sparkles className="w-4 h-4" />
                <span>Geospatial Intelligence — 9 Kabupaten / Kota</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold font-sans text-slate-900 tracking-tight">
                Peta Ketersediaan Kuota & Telemetri SPBU Seluruh Bali
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-2xl">
                Eksplorasi posisi stasiun, sisa stok Pertalite, Pertamax, dan Solar, status antrean
                aktif, serta ambil tiket slot 30 menit langsung dari peta interaktif.
              </p>
            </div>

            <div className="flex items-center gap-2 text-xs font-mono font-bold bg-white px-3 py-1.5 rounded-xl border border-slate-200 text-slate-700 shadow-2xs">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>LIVE DATA FEED</span>
            </div>
          </div>

          {/* Interactive Split-View Bali Map */}
          <BaliInteractiveMap />
        </div>
      </section>

      {/* ----------------------------------------------------------------------- */}
      {/* 4. Monochrome Charcoal Section (3 Pilar Ekosistem) per design.md §6.3   */}
      {/* ----------------------------------------------------------------------- */}
      <section className="bg-[#121316] text-white py-20 border-y border-slate-800 relative overflow-hidden">
        {/* Ambient subtle glow behind middle card */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] rounded-full bg-[#FF5A5F]/10 blur-3xl pointer-events-none" />

        <div className="max-w-[1240px] mx-auto px-6 md:px-10 relative z-10">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <span className="text-xs font-extrabold uppercase tracking-widest text-[#00A8E8]">
              Arsitektur Tri-Pilar
            </span>
            <h2 className="text-2xl sm:text-4xl font-extrabold font-sans text-white mt-2 tracking-tight">
              Tiga Pilar Ekosistem Digital NusaFuel Grid
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 mt-2 leading-relaxed">
              Mewujudkan interoperabilitas tanpa friksi antara pengguna jalan, terminal nozel SPBU,
              dan suplai armada tangki Depot Pertamina Manggis & Sanggaran.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-center">
            {/* Pilar 1 (Kiri): Portal Warga */}
            <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 text-center md:text-left space-y-4">
              <div className="w-12 h-12 rounded-xl bg-slate-800 text-[#FF5A5F] flex items-center justify-center mb-2 mx-auto md:mx-0">
                <Calendar className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold font-sans text-white">
                1. Portal Warga (Driver PWA)
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Penegakan aturan ganjil-genap otomatis berbasis tanggal sistem. Warga memilih jendela
                kedatangan 30 menit dan menerima tiket dengan QR Code terverifikasi SHA-256.
              </p>
              <div className="pt-2 text-[11px] font-semibold text-[#00A8E8] flex items-center gap-1.5 justify-center md:justify-start">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Nol Antrean Mengular di Jalan</span>
              </div>
            </div>

            {/* Pilar 2 (Tengah): Elevated Solid White Card per design.md §5.2 & §6.3 */}
            <div
              className="bg-white text-slate-900 p-8 sm:p-9 rounded-2xl shadow-2xl relative z-20 space-y-4"
              style={{
                boxShadow: '0 20px 45px rgba(0, 0, 0, 0.45)',
                transform: 'translateY(-4px)',
              }}
            >
              <div className="w-12 h-12 rounded-xl bg-amber-50 text-[#FF9F1C] flex items-center justify-center mb-2">
                <Zap className="w-6 h-6 fill-[#FF9F1C]" />
              </div>
              <div>
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#FF5A5F] bg-red-50 px-2 py-0.5 rounded">
                  CORE CONTROL HUB
                </span>
                <h3 className="text-2xl font-bold font-sans text-slate-900 mt-2">
                  2. Otomasi Kuota & Anti-Ngangsu SPBU
                </h3>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                <strong>Dynamic Quota Throttling:</strong> Kuota mobil otomatis dipangkas dari 20L ke 10L
                saat stok tangki &lt;30%. Sisa 10% dasar tangki terkunci khusus ambulans, damkar, dan BPBD.
                Dilengkapi scanner 1-tap kasir dan blokir sindikat penimbun.
              </p>
              <div className="pt-2 text-[11px] font-bold text-[#FF5A5F] flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Pemberantasan Spekulasi & Penimbunan</span>
              </div>
            </div>

            {/* Pilar 3 (Kanan): Depot Interoperability */}
            <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 text-center md:text-left space-y-4">
              <div className="w-12 h-12 rounded-xl bg-slate-800 text-blue-400 flex items-center justify-center mb-2 mx-auto md:mx-0">
                <Cpu className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold font-sans text-white">
                3. Interoperabilitas Webhook Depot
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Probe ATG bawah tanah yang menyentuh level &le;20% seketika memicu webhook HTTP POST
                ke ERP Depot Pertamina Manggis / Sanggaran untuk menerbitkan pesanan truk tangki 8.000L.
              </p>
              <div className="pt-2 text-[11px] font-semibold text-blue-400 flex items-center gap-1.5 justify-center md:justify-start">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Respon Pasokan Otomatis & Terukur</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ----------------------------------------------------------------------- */}
      {/* 5. 3x2 Checkerboard Solutions Matrix (Zero-Gap) per design.md §6.4      */}
      {/* ----------------------------------------------------------------------- */}
      <section className="py-20 bg-white">
        <div className="max-w-[1240px] mx-auto px-6 md:px-10 space-y-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#FF5A5F] mb-1">
                <Layers className="w-4 h-4" />
                <span>Solusi Teruji di Lapangan</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold font-sans text-slate-900 tracking-tight">
                Matriks Solusi Rekayasa Infrastruktur BBM
              </h2>
            </div>
            <button
              type="button"
              onClick={() => navigate('/login')}
              className="btn-coral py-2 px-4 text-xs font-bold uppercase tracking-wider self-start sm:self-auto"
            >
              <span>Uji Coba Sekarang &rarr;</span>
            </button>
          </div>

          {/* 3x2 Flush Grid with 0 Gap per design.md §6.4 */}
          <div className="grid grid-cols-1 md:grid-cols-3 border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
            {/* Cell 1: Photo (Smart Sensor ATG) */}
            <div className="h-[240px] bg-slate-900 overflow-hidden">
              <img
                src={spbuSmartSensor}
                alt="Automatic Tank Gauge digital electronic sensor probe"
                className="w-full h-full object-cover object-center hover:scale-105 transition-transform duration-500"
              />
            </div>

            {/* Cell 2: Editorial Text (Dynamic Quota Throttling) */}
            <div className="h-[240px] p-8 bg-white flex flex-col justify-center border-t md:border-t-0 md:border-l border-slate-200">
              <div className="text-[10px] font-mono font-bold text-[#FF5A5F] uppercase mb-1">
                MODUL 01 • SENSOR AUTONOMI
              </div>
              <h4 className="text-base font-bold text-slate-900 mb-2 leading-snug">
                Dynamic Quota Throttling (&lt;30%)
              </h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                Memotong kuota pengisian mobil secara adaptif dari 20L ke 10L saat stok tangki menipis,
                menjamin sisa bahan bakar dapat melayani hingga 2x lebih banyak warga.
              </p>
            </div>

            {/* Cell 3: Photo (Pertamina Tanker Truck Fleet) */}
            <div className="h-[240px] bg-slate-900 overflow-hidden border-t md:border-t-0 md:border-l border-slate-200">
              <img
                src={pertaminaTankerTruck}
                alt="Pertamina commercial logistics fuel tanker truck at depot terminal"
                className="w-full h-full object-cover object-center hover:scale-105 transition-transform duration-500"
              />
            </div>

            {/* Cell 4: Editorial Text (Virtual Time-Slot 30 Menit) */}
            <div className="h-[240px] p-8 bg-white flex flex-col justify-center border-t border-slate-200">
              <div className="text-[10px] font-mono font-bold text-[#FF9F1C] uppercase mb-1">
                MODUL 02 • BATCHING ANTAR-WAKTU
              </div>
              <h4 className="text-base font-bold text-slate-900 mb-2 leading-snug">
                Virtual Time-Slot 30 Menit Batching
              </h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                Membagi volume kedatangan kendaraan ke dalam kuota berdurasi 30 menit. Setiap slot
                mengunci kuota liter sehingga pengemudi tidak perlu cemas kehabisan saat tiba di stasiun.
              </p>
            </div>

            {/* Cell 5: Photo (SPBU Night Canopy) */}
            <div className="h-[240px] bg-slate-900 overflow-hidden border-t md:border-l border-slate-200">
              <img
                src={spbuNightCanopy}
                alt="Illuminated petrol canopy at night"
                className="w-full h-full object-cover object-center hover:scale-105 transition-transform duration-500"
              />
            </div>

            {/* Cell 6: Editorial Text (Cross-SPBU SHA-256 Plate Guard) */}
            <div className="h-[240px] p-8 bg-white flex flex-col justify-center border-t md:border-l border-slate-200">
              <div className="text-[10px] font-mono font-bold text-blue-600 uppercase mb-1">
                MODUL 03 • SECURITY AUDIT TRAIL
              </div>
              <h4 className="text-base font-bold text-slate-900 mb-2 leading-snug">
                Cross-SPBU SHA-256 Plate Guard
              </h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                Membatasi transaksi 1x dalam 24 jam per nomor polisi di seluruh stasiun Provinsi Bali.
                Setiap transaksi tercatat dalam audit log permanen untuk memblokir sindikat ngangsu.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ----------------------------------------------------------------------- */}
      {/* 6. Section Call-To-Action Terpadu                                       */}
      {/* ----------------------------------------------------------------------- */}
      <section className="max-w-[1240px] mx-auto px-6 md:px-10 pb-12">
        <div className="rounded-3xl p-8 sm:p-12 bg-gradient-to-br from-[#18152E] to-[#121316] text-white flex flex-col md:flex-row items-center justify-between gap-8 shadow-2xl">
          <div className="max-w-xl">
            <span className="text-xs font-extrabold uppercase tracking-widest text-[#00A8E8]">
              Siap Mengakses Ekosistem NusaFuel Grid?
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold font-sans mt-2">
              Pilih Portal Akses Sesuai Peran Anda
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 mt-2 leading-relaxed">
              Masyarakat umum dapat langsung memesan slot waktu pengisian. Petugas SPBU dan admin
              logistik dapat masuk melalui akun terdaftar untuk mengelola nozel dan armada.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
            <button
              type="button"
              onClick={() => navigate('/login')}
              className="w-full sm:w-auto py-3.5 px-6 rounded-xl bg-[#FF5A5F] hover:bg-[#e0484d] text-white font-bold text-xs uppercase tracking-wider transition-all shadow-md active:scale-95 flex items-center justify-center gap-2"
            >
              <UserCheck className="w-4 h-4" />
              <span>Masuk Portal Akun</span>
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};
export default PublicLandingPage;
