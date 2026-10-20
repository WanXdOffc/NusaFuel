// =============================================================================
// src/modules/public-driver/components/SpbuMapView.tsx — NusaFuel Grid
// Geospatial Interactive Map for 4 SPBU Stations in Buleleng Regency
// Built using React-Leaflet with custom vector pins and live popup gauges
// =============================================================================

import React from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import { useStore } from '../../../app/store';
import type { SpbuStation, FuelTank, FuelType } from '../../../core/data/bulelengSpbuSeed';
import { TankLevelGauge } from '../../../shared/components/TankLevelGauge';
import { MapPin, Navigation, ArrowRight } from 'lucide-react';

export interface SpbuMapViewProps {
  selectedFuelType: FuelType;
  onSelectBooking: (station: SpbuStation, targetTank: FuelTank) => void;
}

// Function to generate customized HTML DivIcon for each SPBU
function createSpbuIcon(code: string, mode: string) {
  const bgClass =
    mode === 'NORMAL'
      ? 'bg-emerald-600 text-white border-white'
      : mode === 'THROTTLED'
      ? 'bg-amber-500 text-white border-white'
      : mode === 'UNLOADING'
      ? 'bg-blue-600 text-white border-white'
      : 'bg-red-600 text-white border-white';

  const pulseRing =
    mode === 'THROTTLED' || mode === 'EMERGENCY_ONLY'
      ? `<span class="absolute -inset-1 rounded-full ${mode === 'THROTTLED' ? 'bg-amber-400' : 'bg-red-500'} opacity-50 animate-ping"></span>`
      : '';

  return L.divIcon({
    className: 'custom-spbu-marker',
    html: `
      <div class="relative flex items-center justify-center cursor-pointer">
        ${pulseRing}
        <div class="relative w-8 h-8 rounded-full ${bgClass} border-2 shadow-lg flex items-center justify-center font-bold text-[10px] tracking-tight">
          ⛽
        </div>
        <div class="absolute -bottom-5 px-1.5 py-0.5 rounded bg-slate-900/90 text-white text-[9px] font-mono font-bold whitespace-nowrap shadow-md">
          ${code.slice(-2)}
        </div>
      </div>
    `,
    iconSize: [32, 32],
    iconAnchor: [16, 16],
    popupAnchor: [0, -20],
  });
}

export const SpbuMapView: React.FC<SpbuMapViewProps> = ({
  selectedFuelType,
  onSelectBooking,
}) => {
  const { state, getTanksForStation } = useStore();

  // Buleleng Singaraja center coordinate
  const bulelengCenter: [number, number] = [-8.122, 115.086];

  return (
    <div className="rounded-2xl border border-[#E6E8EC] overflow-hidden bg-white shadow-sm">
      {/* Map Control Header */}
      <div className="p-4 bg-slate-50 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2">
          <Navigation className="w-4 h-4 text-[#FF5A5F]" />
          <span className="font-bold text-slate-800">
            Peta Geospasial SPBU Terkoneksi — Kabupaten Buleleng
          </span>
          <span className="text-[10px] font-mono bg-white px-2 py-0.5 rounded border text-slate-500">
            Singaraja & Sekitarnya
          </span>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-3 text-[11px]">
          <span className="flex items-center gap-1 text-slate-600">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-600 inline-block" />
            Normal
          </span>
          <span className="flex items-center gap-1 text-slate-600">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500 inline-block" />
            Throttled (&lt;30%)
          </span>
          <span className="flex items-center gap-1 text-slate-600">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-600 inline-block" />
            Bongkar DO
          </span>
          <span className="flex items-center gap-1 text-slate-600">
            <span className="w-2.5 h-2.5 rounded-full bg-red-600 inline-block" />
            Darurat (&le;10%)
          </span>
        </div>
      </div>

      {/* Leaflet Map Canvas */}
      <div className="h-[460px] w-full relative z-10">
        <MapContainer
          center={bulelengCenter}
          zoom={13}
          scrollWheelZoom={false}
          className="h-full w-full"
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          {state.stations.map((st) => {
            const tanks = getTanksForStation(st.id);
            const targetTank = tanks.find((t) => t.fuelType === selectedFuelType) ?? tanks[0];
            const markerIcon = createSpbuIcon(st.code, st.operationalMode);

            return (
              <Marker
                key={st.id}
                position={[st.lat, st.lng]}
                icon={markerIcon}
              >
                <Popup className="spbu-leaflet-popup" maxWidth={320}>
                  <div className="p-2 font-sans space-y-2.5">
                    <div>
                      <div className="flex items-center justify-between text-xs mb-1">
                        <span className="font-mono text-[10px] font-bold text-slate-500">
                          {st.code}
                        </span>
                        <span
                          className={`badge text-[9px] py-0.2 px-1.5 ${
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
                        <MapPin className="w-3 h-3 text-slate-400" />
                        {st.address}
                      </p>
                    </div>

                    {/* Gauges in popup */}
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

                    {/* Popup Action Button */}
                    <div className="pt-2 border-t border-slate-100">
                      <button
                        type="button"
                        onClick={() => targetTank && onSelectBooking(st, targetTank)}
                        className="w-full btn-coral py-2 px-3 text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 shadow-xs"
                      >
                        <span>Pilih SPBU Ini</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </Popup>
              </Marker>
            );
          })}
        </MapContainer>
      </div>
    </div>
  );
};
export default SpbuMapView;
