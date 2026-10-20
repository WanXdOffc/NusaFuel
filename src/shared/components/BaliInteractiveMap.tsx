// =============================================================================
// src/shared/components/BaliInteractiveMap.tsx — NusaFuel Grid
// Comprehensive Split-View Interactive Map of Bali Island (9 Regencies / Cities)
// Split View: 4-Col Station List & Filters (Left) + 8-Col React-Leaflet Map (Right)
// Smooth FlyTo Pan/Zoom & Dual Interaction (Click List <-> Click Marker)
// =============================================================================

import React, { useState, useMemo, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import { useStore } from '../../app/store';
import { useAuth } from '../../core/auth/authContext';
import type { SpbuStation, FuelTank, FuelType } from '../../core/data/baliSpbuSeed';
import { TankLevelGauge } from './TankLevelGauge';
import {
  MapPin,
  Search,
  Filter,
  Navigation,
  ArrowRight,
  Calendar,
  Car,
  Bike,
  Info,
} from 'lucide-react';

// Custom Marker Generator with Ping Rings & Badges
function createCustomMarker(code: string, mode: string, isSelected: boolean) {
  const bgClass =
    mode === 'NORMAL'
      ? 'bg-emerald-600 text-white border-white'
      : mode === 'THROTTLED'
      ? 'bg-amber-500 text-white border-white'
      : mode === 'UNLOADING'
      ? 'bg-blue-600 text-white border-white'
      : 'bg-red-600 text-white border-white';

  const pulseRing = isSelected
    ? `<span class="absolute -inset-2 rounded-full bg-[#FF5A5F] opacity-75 animate-ping"></span>`
    : mode === 'THROTTLED' || mode === 'EMERGENCY_ONLY'
    ? `<span class="absolute -inset-1 rounded-full ${mode === 'THROTTLED' ? 'bg-amber-400' : 'bg-red-500'} opacity-50 animate-ping"></span>`
    : '';

  const scaleClass = isSelected ? 'scale-125 ring-4 ring-[#FF5A5F]' : 'hover:scale-110';

  return L.divIcon({
    className: 'custom-spbu-marker',
    html: `
      <div class="relative flex items-center justify-center cursor-pointer transition-transform duration-200 ${scaleClass}">
        ${pulseRing}
        <div class="relative w-8 h-8 rounded-full ${bgClass} border-2 shadow-lg flex items-center justify-center font-bold text-[11px] tracking-tight">
          ⛽
        </div>
        <div class="absolute -bottom-5 px-1.5 py-0.5 rounded bg-slate-900/90 text-white text-[9px] font-mono font-bold whitespace-nowrap shadow-md">
          ${code.slice(-2)}
        </div>
      </div>
    `,
    iconSize: [32, 32],
    iconAnchor: [16, 16],
    popupAnchor: [0, -22],
  });
}

// Map Controller for Smooth FlyTo
const MapFlyToController: React.FC<{ targetCoords: [number, number] | null }> = ({
  targetCoords,
}) => {
  const map = useMap();
  useEffect(() => {
    if (targetCoords) {
      map.flyTo(targetCoords, 14, { duration: 1.2 });
    }
  }, [targetCoords, map]);
  return null;
};

export interface BaliInteractiveMapProps {
  onSelectBooking?: (station: SpbuStation, targetTank: FuelTank) => void;
}

export const BaliInteractiveMap: React.FC<BaliInteractiveMapProps> = ({
  onSelectBooking,
}) => {
  const { state, getTanksForStation, getEffectiveDate } = useStore();
  const { currentUser, navigate } = useAuth();

  // Filters
  const [selectedRegency, setSelectedRegency] = useState<string>('ALL');
  const [selectedFuelType, setSelectedFuelType] = useState<FuelType | 'ALL'>('Pertalite');
  const [onlyAvailableStock, setOnlyAvailableStock] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Selected station interaction
  const [activeStationId, setActiveStationId] = useState<string>(
    state.stations[0]?.id ?? ''
  );
  const [flyToCoords, setFlyToCoords] = useState<[number, number] | null>(null);

  const baliCenter: [number, number] = [-8.4095, 115.1889];
  const listContainerRef = useRef<HTMLDivElement>(null);

  // Parity status today
  const effectiveDate = getEffectiveDate();
  const isOddDay = effectiveDate.getDate() % 2 !== 0;

  // Filtered station list
  const filteredStations = useMemo(() => {
    return state.stations.filter((st) => {
      // Regency filter
      if (selectedRegency !== 'ALL' && st.regency !== selectedRegency) {
        return false;
      }

      // Stock availability toggle
      if (onlyAvailableStock && (st.operationalMode === 'EMERGENCY_ONLY' || st.operationalMode === 'UNLOADING')) {
        return false;
      }

      // Search keyword
      if (searchQuery.trim() !== '') {
        const query = searchQuery.toLowerCase();
        const matchesName = st.name.toLowerCase().includes(query);
        const matchesAddr = st.address.toLowerCase().includes(query);
        const matchesCode = st.code.toLowerCase().includes(query);
        const matchesRegency = st.regency?.toLowerCase().includes(query);
        if (!matchesName && !matchesAddr && !matchesCode && !matchesRegency) {
          return false;
        }
      }

      return true;
    });
  }, [state.stations, selectedRegency, onlyAvailableStock, searchQuery]);

  const activeStation = useMemo(() => {
    return (
      filteredStations.find((s) => s.id === activeStationId) ??
      filteredStations[0] ??
      state.stations[0]
    );
  }, [filteredStations, activeStationId, state.stations]);

  const activeTanks = useMemo(() => {
    return activeStation ? getTanksForStation(activeStation.id) : [];
  }, [activeStation, getTanksForStation]);

  const activeTargetTank = useMemo(() => {
    if (selectedFuelType === 'ALL') {
      return activeTanks.find((t) => t.fuelType === 'Pertalite') ?? activeTanks[0];
    }
    return activeTanks.find((t) => t.fuelType === selectedFuelType) ?? activeTanks[0];
  }, [activeTanks, selectedFuelType]);

  // Click handler from list or marker
  const handleSelectStation = (st: SpbuStation) => {
    setActiveStationId(st.id);
    setFlyToCoords([st.lat, st.lng]);
  };

  const handleBookingClick = (st: SpbuStation, tank: FuelTank) => {
    if (onSelectBooking) {
      onSelectBooking(st, tank);
    } else if (currentUser) {
      navigate('/driver');
    } else {
      navigate('/login');
    }
  };

  return (
    <div className="rounded-2xl border border-[#E6E8EC] overflow-hidden bg-white shadow-sm font-sans">
      {/* 1. Top Unified Filter & Control Bar */}
      <div className="p-4 sm:p-5 bg-slate-50 border-b border-slate-200/90 flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Left: Title & Regency Dropdown */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-slate-900 text-white flex items-center justify-center">
              <Navigation className="w-4 h-4 text-[#FF5A5F]" />
            </div>
            <div>
              <span className="text-xs font-bold text-slate-900 uppercase tracking-wider block">
                Peta Monitoring SPBU Terkoneksi
              </span>
              <span className="text-[10px] text-slate-500">
                Pulau Bali • {filteredStations.length} dari {state.stations.length} Stasiun Aktif
              </span>
            </div>
          </div>

          {/* Regency Dropdown */}
          <div className="flex items-center gap-1.5 ml-0 sm:ml-2">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={selectedRegency}
              onChange={(e) => setSelectedRegency(e.target.value)}
              className="py-1.5 px-3 rounded-lg border border-slate-300 bg-white font-semibold text-slate-800 text-xs focus:outline-none focus:ring-2 focus:ring-[#FF5A5F]"
            >
              <option value="ALL">Semua Wilayah Bali (9 Kab/Kota)</option>
              <option value="Kota Denpasar">Kota Denpasar</option>
              <option value="Badung">Kab. Badung</option>
              <option value="Gianyar">Kab. Gianyar</option>
              <option value="Tabanan">Kab. Tabanan</option>
              <option value="Buleleng">Kab. Buleleng</option>
              <option value="Jembrana">Kab. Jembrana</option>
              <option value="Karangasem">Kab. Karangasem</option>
              <option value="Klungkung">Kab. Klungkung</option>
              <option value="Bangli">Kab. Bangli</option>
            </select>
          </div>
        </div>

        {/* Right: Fuel Pills & Available Toggle */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Fuel Filter Pills */}
          <div className="flex items-center bg-white p-1 rounded-xl border border-slate-200 text-xs font-semibold shadow-2xs">
            {(['Pertalite', 'Pertamax', 'Solar', 'ALL'] as const).map((fuel) => (
              <button
                key={fuel}
                type="button"
                onClick={() => setSelectedFuelType(fuel)}
                className={`px-2.5 py-1 rounded-lg transition-all ${
                  selectedFuelType === fuel
                    ? 'bg-slate-900 text-white shadow-2xs font-bold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {fuel === 'ALL' ? 'Semua BBM' : fuel}
              </button>
            ))}
          </div>

          {/* Stock Available Toggle */}
          <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-slate-700 bg-white px-3 py-1.5 rounded-xl border border-slate-200 select-none shadow-2xs hover:border-slate-300">
            <input
              type="checkbox"
              checked={onlyAvailableStock}
              onChange={(e) => setOnlyAvailableStock(e.target.checked)}
              className="w-3.5 h-3.5 accent-[#FF5A5F] rounded"
            />
            <span className="text-[11px]">Hanya Stok Tersedia</span>
          </label>
        </div>
      </div>

      {/* 2. Split View Area: Left 4-Cols List + Right 8-Cols Map */}
      <div className="grid grid-cols-1 lg:grid-cols-12 min-h-[580px]">
        {/* Left Side (4 Cols): Station Directory List */}
        <div className="lg:col-span-4 border-r border-slate-200 bg-slate-50/50 flex flex-col justify-between">
          {/* Search Box */}
          <div className="p-3 border-b border-slate-200 bg-white">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cari SPBU, nama jalan, atau daerah..."
                className="w-full pl-8 pr-3 py-1.5 rounded-lg border border-slate-200 text-xs bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#FF5A5F] text-slate-800"
              />
            </div>
          </div>

          {/* Station List Scrollable Container */}
          <div
            ref={listContainerRef}
            className="flex-1 overflow-y-auto max-h-[540px] divide-y divide-slate-100 p-2 space-y-1.5"
          >
            {filteredStations.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-400 space-y-2">
                <Info className="w-6 h-6 text-slate-300 mx-auto" />
                <p>Tidak ada SPBU yang memenuhi kriteria filter.</p>
              </div>
            ) : (
              filteredStations.map((st) => {
                const isSelected = activeStation?.id === st.id;
                const tanks = getTanksForStation(st.id);
                const targetTank =
                  selectedFuelType === 'ALL'
                    ? tanks.find((t) => t.fuelType === 'Pertalite') ?? tanks[0]
                    : tanks.find((t) => t.fuelType === selectedFuelType) ?? tanks[0];

                const fillPct = targetTank
                  ? Math.round((targetTank.currentLiters / targetTank.maxCapacityLiters) * 100)
                  : 0;

                return (
                  <div
                    key={st.id}
                    onClick={() => handleSelectStation(st)}
                    className={`p-3 rounded-xl border transition-all cursor-pointer text-xs ${
                      isSelected
                        ? 'bg-white border-[#FF5A5F] shadow-sm ring-1 ring-[#FF5A5F]/20'
                        : 'bg-white border-slate-200/80 hover:border-slate-300 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2 mb-1.5">
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="font-mono text-[10px] font-bold text-slate-400">
                            {st.code}
                          </span>
                          <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-slate-100 text-slate-600">
                            {st.regency}
                          </span>
                        </div>
                        <h4 className="font-bold text-slate-900 leading-snug line-clamp-1 mt-0.5">
                          {st.name}
                        </h4>
                      </div>
                      <span
                        className={`badge text-[9px] py-0.5 px-2 font-bold whitespace-nowrap ${
                          st.operationalMode === 'NORMAL'
                            ? 'badge-normal'
                            : st.operationalMode === 'THROTTLED'
                            ? 'badge-throttled'
                            : st.operationalMode === 'UNLOADING'
                            ? 'badge-unloading'
                            : 'badge-emergency'
                        }`}
                      >
                        {st.operationalMode}
                      </span>
                    </div>

                    <p className="text-[11px] text-slate-500 line-clamp-1 mb-2">
                      {st.address}
                    </p>

                    {/* Tank Level Progress Bar */}
                    {targetTank && (
                      <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px]">
                        <span className="font-medium text-slate-600">
                          {targetTank.fuelType}:{' '}
                          <strong className="font-mono text-slate-900">
                            {targetTank.currentLiters.toLocaleString('id-ID')} L
                          </strong>
                        </span>
                        <span
                          className={`font-mono font-bold ${
                            fillPct > 30
                              ? 'text-emerald-700'
                              : fillPct > 10
                              ? 'text-amber-700'
                              : 'text-red-700'
                          }`}
                        >
                          {fillPct}%
                        </span>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>

          {/* List Footer Legend */}
          <div className="p-3 bg-white border-t border-slate-200 text-[10px] text-slate-500 flex items-center justify-between">
            <span>Klik stasiun untuk zoom peta</span>
            <div className="flex items-center gap-2 font-semibold">
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                Normal
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-amber-500" />
                Throttled
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-red-500" />
                Kritis
              </span>
            </div>
          </div>
        </div>

        {/* Right Side (8 Cols): Leaflet Interactive Map */}
        <div className="lg:col-span-8 relative min-h-[480px] lg:min-h-full">
          <MapContainer
            center={baliCenter}
            zoom={10}
            scrollWheelZoom={false}
            className="h-full w-full z-10"
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />

            <MapFlyToController targetCoords={flyToCoords} />

            {filteredStations.map((st) => {
              const isSelected = activeStation?.id === st.id;
              const markerIcon = createCustomMarker(st.code, st.operationalMode, isSelected);
              const tanks = getTanksForStation(st.id);
              const targetTank =
                selectedFuelType === 'ALL'
                  ? tanks.find((t) => t.fuelType === 'Pertalite') ?? tanks[0]
                  : tanks.find((t) => t.fuelType === selectedFuelType) ?? tanks[0];

              return (
                <Marker
                  key={st.id}
                  position={[st.lat, st.lng]}
                  icon={markerIcon}
                  eventHandlers={{
                    click: () => handleSelectStation(st),
                  }}
                >
                  <Popup className="spbu-leaflet-popup" maxWidth={320}>
                    <div className="p-2.5 font-sans space-y-3">
                      <div>
                        <div className="flex items-center justify-between text-xs mb-1">
                          <span className="font-mono text-[10px] font-bold text-slate-500">
                            {st.code} • {st.regency}
                          </span>
                          <span
                            className={`badge text-[9px] py-0.2 px-1.5 font-bold ${
                              st.operationalMode === 'NORMAL'
                                ? 'badge-normal'
                                : st.operationalMode === 'THROTTLED'
                                ? 'badge-throttled'
                                : st.operationalMode === 'UNLOADING'
                                ? 'badge-unloading'
                                : 'badge-emergency'
                            }`}
                          >
                            {st.operationalMode}
                          </span>
                        </div>
                        <h4 className="font-bold text-sm text-slate-900 leading-tight">
                          {st.name}
                        </h4>
                        <p className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5">
                          <MapPin className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                          <span className="line-clamp-1">{st.address}</span>
                        </p>
                      </div>

                      {/* Tank Gauges in Popup */}
                      <div className="space-y-1.5">
                        {tanks.map((t) => (
                          <TankLevelGauge
                            key={t.id}
                            tank={t}
                            compact={true}
                            operationalMode={st.operationalMode}
                          />
                        ))}
                      </div>

                      {/* CTA in popup */}
                      <div className="pt-2 border-t border-slate-100">
                        <button
                          type="button"
                          onClick={() => targetTank && handleBookingClick(st, targetTank)}
                          className="w-full btn-coral py-2 px-3 text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 shadow-xs"
                        >
                          <span>Ambil Slot Antrean</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </Popup>
                </Marker>
              );
            })}
          </MapContainer>

          {/* Active Station Detail Floating Drawer Card */}
          {activeStation && activeTargetTank && (
            <div className="absolute bottom-4 right-4 z-20 max-w-sm w-[calc(100%-32px)] bg-white/95 backdrop-blur-md rounded-2xl p-4 sm:p-5 border border-slate-200/90 shadow-xl transition-all animate-slide-in-up">
              <div className="flex items-start justify-between gap-3 mb-3">
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] font-mono font-bold text-slate-500">
                      {activeStation.code}
                    </span>
                    <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-slate-100 text-slate-700">
                      {activeStation.regency}
                    </span>
                  </div>
                  <h3 className="text-sm font-bold text-slate-900 leading-snug line-clamp-1 mt-0.5">
                    {activeStation.name}
                  </h3>
                </div>
                <span
                  className={`badge text-[9px] py-0.5 px-2 font-bold ${
                    activeStation.operationalMode === 'NORMAL'
                      ? 'badge-normal'
                      : activeStation.operationalMode === 'THROTTLED'
                      ? 'badge-throttled'
                      : activeStation.operationalMode === 'UNLOADING'
                      ? 'badge-unloading'
                      : 'badge-emergency'
                  }`}
                >
                  {activeStation.operationalMode}
                </span>
              </div>

              {/* Liters and Vehicle Estimates */}
              <div className="grid grid-cols-2 gap-2 mb-3 bg-slate-50 p-2.5 rounded-xl border border-slate-200/80 text-xs">
                <div>
                  <span className="text-[10px] text-slate-500 block">Stok {activeTargetTank.fuelType}</span>
                  <span className="font-mono font-bold text-slate-900 text-sm">
                    {activeTargetTank.currentLiters.toLocaleString('id-ID')} L
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 block">Estimasi Layanan</span>
                  <div className="flex items-center gap-2 text-[11px] font-semibold text-slate-700 mt-0.5">
                    <span className="flex items-center gap-1" title="Estimasi Motor (4L)">
                      <Bike className="w-3 h-3 text-slate-500" />
                      ~{Math.floor(activeTargetTank.currentLiters / 4)}
                    </span>
                    <span className="flex items-center gap-1" title="Estimasi Mobil (20L)">
                      <Car className="w-3 h-3 text-slate-500" />
                      ~{Math.floor(activeTargetTank.currentLiters / 20)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Odd-Even Parity Rule Today */}
              <div className="mb-3 flex items-center justify-between text-[11px] bg-slate-100/80 px-2.5 py-1.5 rounded-lg">
                <span className="text-slate-600 flex items-center gap-1">
                  <Calendar className="w-3 h-3 text-slate-400" />
                  <span>Regulasi Hari Ini:</span>
                </span>
                <span className="font-bold text-slate-900">
                  {isOddDay ? 'Plat Ganjil' : 'Plat Genap'}
                </span>
              </div>

              {/* Action Button */}
              <button
                type="button"
                onClick={() => handleBookingClick(activeStation, activeTargetTank)}
                className="w-full btn-coral py-2.5 px-4 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 shadow-sm"
              >
                <span>Ambil Slot Antrean</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
export default BaliInteractiveMap;
