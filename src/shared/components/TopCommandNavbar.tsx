// =============================================================================
// src/shared/components/TopCommandNavbar.tsx — NusaFuel Grid
// Persistent Top Command Bar with 4-Segment Brand Strip & Judge Quick Role Switcher
// Compliant with design.md §5.2, §6.1 & prd.md multi-role architecture
// =============================================================================

import React from 'react';
import { useStore, type ActiveRole } from '../../app/store';
import {
  Calendar,
  RefreshCw,
  User,
  Fuel,
  Cpu,
  Sparkles,
} from 'lucide-react';

export const TopCommandNavbar: React.FC = () => {
  const {
    state,
    setActiveRole,
    toggleSimulatedDateParity,
    getEffectiveDate,
  } = useStore();

  const effectiveDate = getEffectiveDate();
  const dayNumber = effectiveDate.getDate();
  const isOdd = dayNumber % 2 !== 0;

  // Indonesian day and month names
  const HARI = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
  const BULAN = [
    'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
    'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember',
  ];
  const dateFormatted = `${HARI[effectiveDate.getDay()]}, ${dayNumber} ${
    BULAN[effectiveDate.getMonth()]
  } ${effectiveDate.getFullYear()}`;

  const roles: Array<{
    id: ActiveRole;
    label: string;
    sublabel: string;
    icon: React.ReactNode;
  }> = [
    {
      id: 'PUBLIC_DRIVER',
      label: 'Portal Warga',
      sublabel: 'User A',
      icon: <User className="w-3.5 h-3.5" />,
    },
    {
      id: 'SPBU_OPERATOR',
      label: 'Petugas SPBU',
      sublabel: 'User B',
      icon: <Fuel className="w-3.5 h-3.5" />,
    },
    {
      id: 'DEPOT_SIMULATOR',
      label: 'Depot & API',
      sublabel: 'User C',
      icon: <Cpu className="w-3.5 h-3.5" />,
    },
  ];

  return (
    <header className="sticky top-0 z-40 w-full bg-white border-b border-[#E6E8EC] shadow-sm select-none print:hidden">
      {/* 1. Mandatory 4-Color Brand Strip per design.md §5.2 */}
      <div className="top-brand-strip" />

      {/* 2. Main Navigation Bar */}
      <div className="max-w-[1360px] mx-auto px-4 sm:px-6 h-[74px] flex items-center justify-between gap-4">
        {/* Left Side: Brand Wordmark & Architectural Logo */}
        <div className="flex items-center gap-3.5 flex-shrink-0">
          {/* Architectural SVG Logo (Coral & Amber) */}
          <div className="relative w-9 h-9 flex-shrink-0 rounded-lg bg-gradient-to-br from-[#18152E] to-[#121316] p-1.5 flex items-center justify-center shadow-md border border-slate-800">
            <svg
              viewBox="0 0 32 32"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="w-full h-full"
            >
              {/* Canopy top bar */}
              <rect x="3" y="5" width="26" height="4" rx="1.5" fill="#FF5A5F" />
              {/* Structural vertical pillars */}
              <rect x="7" y="11" width="3" height="15" rx="1" fill="#FF9F1C" />
              <rect x="22" y="11" width="3" height="15" rx="1" fill="#FF9F1C" />
              {/* Central fuel dispenser nozzle node */}
              <path
                d="M16 11V22M13 14H19M16 22L13 26H19L16 22Z"
                stroke="#00A8E8"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              {/* Accent dot */}
              <circle cx="16" cy="7" r="1.5" fill="#FFFFFF" />
            </svg>
            <span className="absolute -bottom-1 -right-1 w-2.5 h-2.5 rounded-full bg-[#FF5A5F] ring-2 ring-white" />
          </div>

          {/* Typography Lockup */}
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <span className="font-brand font-bold text-xl sm:text-2xl tracking-[0.06em] text-[#18191C] uppercase leading-none">
                NUSAFUEL GRID
              </span>
              <span className="hidden sm:inline-flex items-center gap-1 text-[9px] font-bold uppercase tracking-widest px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200/80">
                BULELENG
              </span>
            </div>
            <span className="text-[9px] font-semibold tracking-[0.08em] text-[#646872] uppercase leading-tight mt-0.5">
              Automated Fuel Infrastructure
            </span>
          </div>
        </div>

        {/* Center: System Date & Odd-Even Parity Status with Fast Simulation Button */}
        <div className="hidden lg:flex items-center gap-3 bg-slate-50 border border-slate-200/90 rounded-full px-3.5 py-1.5 shadow-xs">
          <div className="flex items-center gap-2 text-xs">
            <Calendar className="w-3.5 h-3.5 text-slate-500" />
            <span className="font-medium text-slate-700">{dateFormatted}</span>
          </div>

          <span className="h-4 w-[1px] bg-slate-200" />

          {/* Parity Status Pill */}
          <div className="flex items-center gap-1.5">
            {isOdd ? (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                HARI GANJIL: Plat 1, 3, 5, 7, 9
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-blue-100 text-blue-800 border border-blue-300">
                <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse" />
                HARI GENAP: Plat 0, 2, 4, 6, 8
              </span>
            )}
          </div>

          {/* Quick Simulation Toggle Button */}
          <button
            type="button"
            onClick={toggleSimulatedDateParity}
            className="flex items-center gap-1 text-[11px] font-semibold px-2 py-1 rounded-full bg-white border border-slate-200 text-slate-700 hover:text-[#FF5A5F] hover:border-[#FF5A5F] transition-all shadow-2xs hover:shadow-xs active:scale-95"
            title="Klik untuk beralih antara Hari Ganjil & Genap secara instan (Mode Pengujian Juri)"
          >
            <RefreshCw className="w-3 h-3 text-[#FF5A5F]" />
            <span className="hidden xl:inline">Ubah Hari</span>
          </button>
        </div>

        {/* Right Side: Judge Quick Role Switcher */}
        <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
          {/* Label Indicator for Competition Judges */}
          <div className="hidden md:flex flex-col text-right pr-1">
            <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#FF5A5F] flex items-center justify-end gap-1">
              <Sparkles className="w-3 h-3" />
              Mode Juri
            </span>
            <span className="text-[9px] text-slate-400 font-medium">1-Klik Switcher</span>
          </div>

          {/* Pill Control Switcher */}
          <nav
            aria-label="Judge Quick Role Switcher"
            className="bg-slate-100/90 p-1 rounded-full border border-slate-200 flex items-center gap-1 shadow-inner"
          >
            {roles.map((r) => {
              const isActive = state.activeRole === r.id;
              return (
                <button
                  key={r.id}
                  type="button"
                  onClick={() => setActiveRole(r.id)}
                  aria-pressed={isActive}
                  className={`flex items-center gap-1.5 px-3 sm:px-3.5 py-1.5 rounded-full text-xs transition-all duration-200 ${
                    isActive
                      ? 'bg-[#FF5A5F] text-white font-bold shadow-md shadow-[#FF5A5F]/35 scale-102'
                      : 'text-slate-600 hover:text-slate-900 font-semibold hover:bg-slate-200/60'
                  }`}
                  title={`Beralih ke tampilan ${r.label}`}
                >
                  <span className={isActive ? 'text-white' : 'text-slate-500'}>
                    {r.icon}
                  </span>
                  <span className="tracking-tight whitespace-nowrap">{r.label}</span>
                  <span
                    className={`hidden sm:inline-block text-[9px] px-1.5 py-0.2 rounded-full font-mono uppercase ${
                      isActive
                        ? 'bg-black/20 text-white'
                        : 'bg-white text-slate-500 border border-slate-200'
                    }`}
                  >
                    {r.sublabel}
                  </span>
                </button>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Mobile Sub-strip: Parity & Quick Toggle for Small Screens (<1024px) */}
      <div className="lg:hidden flex items-center justify-between px-4 py-1.5 bg-slate-50 border-t border-slate-200 text-xs">
        <div className="flex items-center gap-1.5">
          <Calendar className="w-3 h-3 text-slate-400" />
          <span className="text-[11px] font-medium text-slate-600 truncate max-w-[170px]">
            {dateFormatted}
          </span>
          <span
            className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
              isOdd ? 'bg-emerald-100 text-emerald-800' : 'bg-blue-100 text-blue-800'
            }`}
          >
            {isOdd ? 'GANJIL' : 'GENAP'}
          </span>
        </div>

        <button
          type="button"
          onClick={toggleSimulatedDateParity}
          className="flex items-center gap-1 text-[11px] font-bold text-[#FF5A5F] hover:underline"
        >
          <RefreshCw className="w-3 h-3" />
          <span>Ganti Ganjil/Genap</span>
        </button>
      </div>
    </header>
  );
};
export default TopCommandNavbar;
