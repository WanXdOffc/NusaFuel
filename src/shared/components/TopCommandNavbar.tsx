// =============================================================================
// src/shared/components/TopCommandNavbar.tsx — NusaFuel Grid
// Persistent Top Command Bar with 4-Segment Brand Strip & Real 3-Role Authentication
// Replaces Judge Switcher with Official Government/Corporate Navigation & Embedded Accessibility Dropdown
// =============================================================================

import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../../core/auth/authContext';
import { useStore, type ActiveRole } from '../../app/store';
import {
  Calendar,
  RefreshCw,
  LogOut,
  Sliders,
  Type,
  Eye,
  Check,
  RotateCcw,
  User,
  ChevronDown,
  Layers,
} from 'lucide-react';

export const TopCommandNavbar: React.FC = () => {
  const { currentUser, logout, navigate, currentPath } = useAuth();
  const {
    state,
    setActiveRole,
    toggleSimulatedDateParity,
    getEffectiveDate,
    setFontScale,
    setHighContrast,
  } = useStore();

  const [isAccessDropdownOpen, setIsAccessDropdownOpen] = useState(false);
  const [isPortalDropdownOpen, setIsPortalDropdownOpen] = useState(false);
  const accessDropdownRef = useRef<HTMLDivElement>(null);
  const portalDropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        accessDropdownRef.current &&
        !accessDropdownRef.current.contains(event.target as Node)
      ) {
        setIsAccessDropdownOpen(false);
      }
      if (
        portalDropdownRef.current &&
        !portalDropdownRef.current.contains(event.target as Node)
      ) {
        setIsPortalDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

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

  const fontOptions: Array<{ scale: 100 | 115 | 125; label: string; desc: string }> = [
    { scale: 100, label: '100%', desc: 'Standar' },
    { scale: 115, label: '115%', desc: 'Sedang' },
    { scale: 125, label: '125%', desc: 'Besar' },
  ];

  const handleResetAccess = () => {
    setFontScale(100);
    setHighContrast(false);
  };

  const isCustomized = state.fontScale !== 100 || state.isHighContrast;

  // Sync active role with authenticated role
  useEffect(() => {
    if (currentUser) {
      if (currentUser.role === 'DRIVER') {
        setActiveRole('PUBLIC_DRIVER');
      } else if (currentUser.role === 'OPERATOR') {
        setActiveRole('SPBU_OPERATOR');
      } else if (currentUser.role === 'ADMIN_API') {
        setActiveRole('DEPOT_SIMULATOR');
      }
    }
  }, [currentUser, setActiveRole]);

  const handleSwitchPortal = (role: ActiveRole, targetPath: string) => {
    setActiveRole(role);
    navigate(targetPath);
    setIsPortalDropdownOpen(false);
  };

  const scrollToElement = (id: string) => {
    if (currentPath !== '/') {
      navigate('/');
      setTimeout(() => {
        const el = document.getElementById(id);
        if (el) el.scrollIntoView({ behavior: 'smooth' });
      }, 150);
    } else {
      const el = document.getElementById(id);
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <header className="sticky top-0 z-40 w-full bg-white border-b border-[#E6E8EC] shadow-xs select-none print:hidden">
      {/* 1. Mandatory 4-Color Brand Strip per design.md §5.2 */}
      <div className="top-brand-strip" />

      {/* 2. Main Navigation Bar with max-w-[1240px] container */}
      <div className="max-w-[1240px] mx-auto px-6 md:px-10 h-[74px] flex items-center justify-between gap-4">
        {/* Left Side: Brand Wordmark & Architectural Logo */}
        <div
          onClick={() => navigate('/')}
          className="flex items-center gap-3.5 flex-shrink-0 cursor-pointer"
        >
          {/* Architectural SVG Logo (Coral & Amber) */}
          <div className="relative w-9 h-9 flex-shrink-0 rounded-lg bg-gradient-to-br from-[#18152E] to-[#121316] p-1.5 flex items-center justify-center shadow-md border border-slate-800">
            <svg
              viewBox="0 0 32 32"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="w-full h-full"
            >
              <rect x="3" y="5" width="26" height="4" rx="1.5" fill="#FF5A5F" />
              <rect x="7" y="11" width="3" height="15" rx="1" fill="#FF9F1C" />
              <rect x="22" y="11" width="3" height="15" rx="1" fill="#FF9F1C" />
              <path
                d="M16 11V22M13 14H19M16 22L13 26H19L16 22Z"
                stroke="#00A8E8"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
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
                PROVINSI BALI
              </span>
            </div>
            <span className="text-[9px] font-semibold tracking-[0.08em] text-[#646872] uppercase leading-tight mt-0.5">
              Automated Fuel Infrastructure
            </span>
          </div>
        </div>

        {/* Center: System Date & Odd-Even Parity Status */}
        <div className="hidden lg:flex items-center gap-3 bg-slate-50 border border-slate-200/90 rounded-full px-3.5 py-1.5 shadow-2xs">
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

          {/* Toggle Date Parity Button */}
          <button
            type="button"
            onClick={toggleSimulatedDateParity}
            className="flex items-center gap-1 text-[11px] font-semibold px-2 py-1 rounded-full bg-white border border-slate-200 text-slate-700 hover:text-[#FF5A5F] hover:border-[#FF5A5F] transition-all shadow-2xs hover:shadow-xs active:scale-95"
            title="Beralih antara Paritas Ganjil & Genap"
          >
            <RefreshCw className="w-3 h-3 text-[#FF5A5F]" />
            <span className="hidden xl:inline text-[10px]">Ubah Paritas</span>
          </button>
        </div>

        {/* Right Side: Navigation Links / Auth State & Embedded Accessibility Dropdown */}
        <div className="flex items-center gap-3 flex-shrink-0">
          {/* Public Navigation Links (When NOT Logged In) */}
          {!currentUser ? (
            <div className="hidden md:flex items-center gap-5 text-xs font-semibold text-slate-600">
              <button
                type="button"
                onClick={() => navigate('/')}
                className={`hover:text-[#FF5A5F] transition-colors ${
                  currentPath === '/' ? 'text-[#FF5A5F] font-bold' : ''
                }`}
              >
                Beranda
              </button>
              <button
                type="button"
                onClick={() => scrollToElement('bali-map-section')}
                className="hover:text-[#FF5A5F] transition-colors"
              >
                Peta Live Bali
              </button>
              <button
                type="button"
                onClick={() => scrollToElement('automation-section')}
                className="hover:text-[#FF5A5F] transition-colors"
              >
                Cara Kerja Otomasi
              </button>
            </div>
          ) : null}

          {/* Embedded Accessibility Dropdown Button */}
          <div className="relative" ref={accessDropdownRef}>
            <button
              type="button"
              onClick={() => setIsAccessDropdownOpen(!isAccessDropdownOpen)}
              className={`p-2 rounded-xl border text-xs font-bold transition-all flex items-center gap-1.5 ${
                isCustomized
                  ? 'bg-red-50 text-[#FF5A5F] border-[#FF5A5F]/40 shadow-xs'
                  : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
              }`}
              title="Pengaturan Aksesibilitas (Ukuran Teks & Kontras)"
              aria-label="Pengaturan Aksesibilitas"
            >
              <Sliders className="w-4 h-4 text-[#FF5A5F]" />
              <span className="hidden sm:inline text-[11px]">Aksesibilitas</span>
              <span className="text-[10px] font-mono text-slate-400">
                {state.fontScale}%
              </span>
            </button>

            {/* Accessibility Popover Dropdown */}
            {isAccessDropdownOpen && (
              <div className="absolute right-0 top-full mt-2 w-72 rounded-2xl p-4 bg-white border border-slate-200 shadow-2xl z-50 animate-slide-in-up text-slate-900 font-sans">
                <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <Sliders className="w-4 h-4 text-[#FF5A5F]" />
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-900">
                      Aksesibilitas
                    </span>
                  </div>
                  {isCustomized && (
                    <button
                      type="button"
                      onClick={handleResetAccess}
                      className="text-[11px] font-semibold text-slate-400 hover:text-slate-700 flex items-center gap-1"
                      title="Reset pengaturan"
                    >
                      <RotateCcw className="w-3 h-3" />
                      <span>Reset</span>
                    </button>
                  )}
                </div>

                {/* Font Scaling Options */}
                <div className="mb-4">
                  <label className="text-[11px] font-bold text-slate-600 flex items-center gap-1.5 mb-2">
                    <Type className="w-3.5 h-3.5 text-slate-400" />
                    <span>Ukuran Teks Antarmuka</span>
                  </label>
                  <div className="grid grid-cols-3 gap-1.5">
                    {fontOptions.map((opt) => (
                      <button
                        key={opt.scale}
                        type="button"
                        onClick={() => setFontScale(opt.scale)}
                        className={`py-1.5 px-2 rounded-lg text-xs font-bold transition-all text-center ${
                          state.fontScale === opt.scale
                            ? 'bg-[#FF5A5F] text-white shadow-2xs'
                            : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                        }`}
                      >
                        <div className="text-xs">{opt.label}</div>
                        <div className="text-[9px] font-normal opacity-80">{opt.desc}</div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* High Contrast Mode Switch */}
                <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Eye className="w-3.5 h-3.5 text-slate-400" />
                    <div>
                      <span className="text-xs font-bold block leading-tight">Kontras Tinggi</span>
                      <span className="text-[10px] text-slate-400">Tingkatkan kontras</span>
                    </div>
                  </div>
                  <button
                    type="button"
                    role="switch"
                    aria-checked={state.isHighContrast}
                    onClick={() => setHighContrast(!state.isHighContrast)}
                    className={`w-10 h-5 flex items-center rounded-full p-0.5 transition-colors ${
                      state.isHighContrast ? 'bg-[#FF5A5F]' : 'bg-slate-300'
                    }`}
                  >
                    <div
                      className={`bg-white w-4 h-4 rounded-full shadow transform transition-transform ${
                        state.isHighContrast ? 'translate-x-5' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Right Action: Not Logged In vs Logged In */}
          {!currentUser ? (
            <button
              type="button"
              onClick={() => navigate('/login')}
              className="py-2.5 px-4 rounded-xl text-white font-bold text-xs uppercase tracking-wider transition-all shadow-sm active:scale-95 flex items-center gap-1.5 whitespace-nowrap"
              style={{ backgroundColor: '#FF5A5F' }}
            >
              <User className="w-3.5 h-3.5" />
              <span>Masuk / Portal Akun</span>
            </button>
          ) : (
            /* Logged-In User Profile & Portal Switcher */
            <div className="flex items-center gap-2 sm:gap-3">
              {/* User Profile Info Chip */}
              <div className="flex items-center gap-2 bg-slate-50 border border-slate-200/90 rounded-xl p-1.5 pr-3 shadow-2xs">
                <div
                  className={`w-7 h-7 rounded-lg text-white font-bold text-xs flex items-center justify-center ${
                    currentUser.role === 'DRIVER'
                      ? 'bg-[#FF5A5F]'
                      : currentUser.role === 'OPERATOR'
                      ? 'bg-[#FF9F1C]'
                      : 'bg-indigo-600'
                  }`}
                >
                  {currentUser.avatarInitials}
                </div>
                <div className="hidden sm:flex flex-col text-left">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-bold text-slate-900 leading-none">
                      {currentUser.name}
                    </span>
                    <span
                      className={`text-[8px] font-mono font-bold px-1.5 py-0.2 rounded uppercase ${
                        currentUser.role === 'DRIVER'
                          ? 'bg-red-50 text-[#FF5A5F] border border-red-200'
                          : currentUser.role === 'OPERATOR'
                          ? 'bg-amber-50 text-[#FF9F1C] border border-amber-200'
                          : 'bg-indigo-50 text-indigo-700 border border-indigo-200'
                      }`}
                    >
                      {currentUser.roleBadge}
                    </span>
                  </div>
                  <span className="text-[10px] text-slate-500 truncate max-w-[140px] mt-0.5">
                    {currentUser.spbuName || currentUser.institution || currentUser.plateNumber}
                  </span>
                </div>
              </div>

              {/* Portal Jump Selector Dropdown */}
              <div className="relative" ref={portalDropdownRef}>
                <button
                  type="button"
                  onClick={() => setIsPortalDropdownOpen(!isPortalDropdownOpen)}
                  className="p-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 text-xs font-semibold flex items-center gap-1"
                  title="Pindah Tampilan Portal"
                >
                  <Layers className="w-3.5 h-3.5 text-slate-500" />
                  <ChevronDown className="w-3 h-3 text-slate-400" />
                </button>

                {isPortalDropdownOpen && (
                  <div className="absolute right-0 top-full mt-2 w-48 rounded-xl p-2 bg-white border border-slate-200 shadow-xl z-50 text-xs font-semibold space-y-1 animate-slide-in-up">
                    <div className="px-2 py-1 text-[10px] uppercase font-bold text-slate-400 border-b border-slate-100">
                      Beralih Portal:
                    </div>
                    <button
                      type="button"
                      onClick={() => handleSwitchPortal('PUBLIC_DRIVER', '/driver')}
                      className={`w-full text-left px-2.5 py-1.5 rounded-lg flex items-center justify-between ${
                        state.activeRole === 'PUBLIC_DRIVER'
                          ? 'bg-red-50 text-[#FF5A5F] font-bold'
                          : 'text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      <span>Portal Warga</span>
                      {state.activeRole === 'PUBLIC_DRIVER' && <Check className="w-3 h-3" />}
                    </button>
                    <button
                      type="button"
                      onClick={() => handleSwitchPortal('SPBU_OPERATOR', '/operator')}
                      className={`w-full text-left px-2.5 py-1.5 rounded-lg flex items-center justify-between ${
                        state.activeRole === 'SPBU_OPERATOR'
                          ? 'bg-amber-50 text-[#FF9F1C] font-bold'
                          : 'text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      <span>Petugas SPBU</span>
                      {state.activeRole === 'SPBU_OPERATOR' && <Check className="w-3 h-3" />}
                    </button>
                    <button
                      type="button"
                      onClick={() => handleSwitchPortal('DEPOT_SIMULATOR', '/admin-api')}
                      className={`w-full text-left px-2.5 py-1.5 rounded-lg flex items-center justify-between ${
                        state.activeRole === 'DEPOT_SIMULATOR'
                          ? 'bg-indigo-50 text-indigo-700 font-bold'
                          : 'text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      <span>Depot & API</span>
                      {state.activeRole === 'DEPOT_SIMULATOR' && <Check className="w-3 h-3" />}
                    </button>
                  </div>
                )}
              </div>

              {/* Logout Button */}
              <button
                type="button"
                onClick={logout}
                className="p-2 sm:px-3 sm:py-2 rounded-xl border border-slate-200 bg-white hover:bg-red-50 text-slate-500 hover:text-red-600 transition-colors text-xs font-semibold flex items-center gap-1.5"
                title="Keluar dari akun"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Keluar</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Mobile Sub-strip: Parity on small screens */}
      <div className="lg:hidden flex items-center justify-between px-6 py-2 bg-slate-50 border-t border-slate-200 text-xs">
        <div className="flex items-center gap-1.5">
          <Calendar className="w-3 h-3 text-slate-400" />
          <span className="text-[11px] font-medium text-slate-600 truncate max-w-[160px]">
            {dateFormatted}
          </span>
          <span
            className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full ${
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
          <span>Ganti Paritas</span>
        </button>
      </div>
    </header>
  );
};
export default TopCommandNavbar;
