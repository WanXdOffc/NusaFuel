// =============================================================================
// src/modules/depot-interconnect/components/WebhookDispatchTable.tsx — NusaFuel Grid
// Panel Orkestrasi Truk Tangki Depot Manggis & Sanggaran
// Cross-Station B2B Webhook Dispatch Orchestration across Bali Island
// Features: Depot Hub Selector, Manual Dispatch, Rush Hour Simulator, and Status Advancement
// =============================================================================

import React, { useState } from 'react';
import { useStore } from '../../../app/store';
import {
  Truck,
  CheckCircle2,
  Clock,
  Zap,
  Play,
  Building2,
  TrendingDown,
} from 'lucide-react';

export const WebhookDispatchTable: React.FC = () => {
  const { state, triggerDepotDispatch, simulateCrisisEvent } = useStore();
  const [selectedStationId, setSelectedStationId] = useState<string>(
    state.stations[0]?.id ?? 'spbu-gajah-mada'
  );
  const [selectedDepot, setSelectedDepot] = useState<'MANGGIS' | 'SANGGARAN'>('MANGGIS');
  const [tankerVolume, setTankerVolume] = useState<number>(8000);
  const [actionNotice, setActionNotice] = useState<string | null>(null);

  const handleAdvanceStatus = (dispatchId: string) => {
    triggerDepotDispatch(dispatchId);
  };

  const handleForceManualDispatch = () => {
    simulateCrisisEvent('FORCE_DISPATCH', selectedStationId);
    const targetSpbu = state.stations.find((s) => s.id === selectedStationId);
    setActionNotice(
      `Truk tangki ${tankerVolume.toLocaleString('id-ID')}L dari Depot ${
        selectedDepot === 'MANGGIS' ? 'Manggis (Karangasem)' : 'Sanggaran (Denpasar)'
      } berhasil diterbitkan menuju ${targetSpbu?.name ?? 'SPBU Tujuan'}.`
    );
    setTimeout(() => setActionNotice(null), 4000);
  };

  const handleSimulateRushHour = () => {
    simulateCrisisEvent('SURGE_QUEUE');
    setActionNotice(
      'Simulasi Rush Hour berhasil: Stok Pertalite turun -1.500L (&le;20%) dan memicu event Autonomous Webhook Dispatch!'
    );
    setTimeout(() => setActionNotice(null), 5000);
  };

  return (
    <div className="rounded-2xl bg-white border border-[#E6E8EC] p-6 sm:p-8 shadow-sm space-y-6 font-sans">
      {/* Table Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
            <Truck className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-900 leading-snug">
              Panel Orkestrasi Truk Tangki Depot Manggis & Sanggaran
            </h3>
            <p className="text-xs text-slate-500">
              Orkestrasi logistik BBM regional berbasis webhook restock otomatis (&le;20% tangki)
            </p>
          </div>
        </div>

        {/* 2 Regional Supply Hubs Indicator */}
        <div className="flex items-center gap-2">
          <div className="p-2 px-3 rounded-xl bg-slate-50 border border-slate-200 text-xs">
            <span className="text-[10px] text-slate-400 uppercase font-bold block">HUB UTARA/TIMUR</span>
            <strong className="text-slate-800">IT Manggis</strong>
          </div>
          <div className="p-2 px-3 rounded-xl bg-slate-50 border border-slate-200 text-xs">
            <span className="text-[10px] text-slate-400 uppercase font-bold block">HUB SELATAN/BARAT</span>
            <strong className="text-slate-800">FT Sanggaran</strong>
          </div>
        </div>
      </div>

      {/* Control Bar: Depot Origin, Destination SPBU, Volume, Action Buttons */}
      <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
            <Building2 className="w-3.5 h-3.5 text-blue-600" />
            <span>Kontrol Penerbitan Armada Truk Tangki</span>
          </span>
          <span className="text-[10px] font-mono text-slate-500">Regional Jatimbalinus</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Depot Origin */}
          <div>
            <label className="text-[10px] uppercase font-bold text-slate-500 block mb-1">
              Depot Asal:
            </label>
            <select
              value={selectedDepot}
              onChange={(e) => setSelectedDepot(e.target.value as 'MANGGIS' | 'SANGGARAN')}
              className="w-full text-xs font-semibold px-3 py-2 rounded-lg border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-[#FF5A5F]"
            >
              <option value="MANGGIS">IT Manggis (Karangasem)</option>
              <option value="SANGGARAN">FT Sanggaran (Denpasar/Benoa)</option>
            </select>
          </div>

          {/* Destination SPBU */}
          <div>
            <label className="text-[10px] uppercase font-bold text-slate-500 block mb-1">
              SPBU Tujuan:
            </label>
            <select
              value={selectedStationId}
              onChange={(e) => setSelectedStationId(e.target.value)}
              className="w-full text-xs font-semibold px-3 py-2 rounded-lg border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-[#FF5A5F]"
            >
              {state.stations.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.code} — {s.name} ({s.regency})
                </option>
              ))}
            </select>
          </div>

          {/* Volume */}
          <div>
            <label className="text-[10px] uppercase font-bold text-slate-500 block mb-1">
              Kapasitas Truk Tangki:
            </label>
            <select
              value={tankerVolume}
              onChange={(e) => setTankerVolume(Number(e.target.value))}
              className="w-full text-xs font-semibold px-3 py-2 rounded-lg border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-[#FF5A5F]"
            >
              <option value={8000}>8.000 Liter (1 Kompartemen)</option>
              <option value={16000}>16.000 Liter (2 Kompartemen)</option>
            </select>
          </div>

          {/* Dispatch Action Buttons */}
          <div className="flex items-end gap-2">
            <button
              type="button"
              onClick={handleForceManualDispatch}
              className="flex-1 py-2 px-3 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs uppercase tracking-wider transition-all shadow-xs flex items-center justify-center gap-1.5 active:scale-95 whitespace-nowrap"
            >
              <Truck className="w-3.5 h-3.5" />
              <span>Kirim Truk</span>
            </button>

            <button
              type="button"
              onClick={handleSimulateRushHour}
              className="py-2 px-3 rounded-lg bg-[#FF5A5F] hover:bg-[#e0484d] text-white font-bold text-xs uppercase tracking-wider transition-all shadow-xs flex items-center justify-center gap-1 active:scale-95 whitespace-nowrap"
              title="Simulasikan lonjakan antrean yang memicu level tangki <=20% dan mengirim auto-webhook"
            >
              <TrendingDown className="w-3.5 h-3.5" />
              <span>Simulasi Rush Hour</span>
            </button>
          </div>
        </div>
      </div>

      {actionNotice && (
        <div className="p-3 rounded-xl bg-blue-50 border border-blue-200 text-blue-900 text-xs font-bold flex items-center gap-2 animate-slide-in-up">
          <CheckCircle2 className="w-4 h-4 text-blue-600 flex-shrink-0" />
          <span>{actionNotice}</span>
        </div>
      )}

      {/* Dispatches Table */}
      <div className="overflow-x-auto border border-slate-200 rounded-xl">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase text-[10px] tracking-wider">
              <th className="py-3 px-4">Kode Order</th>
              <th className="py-3 px-4">SPBU Tujuan</th>
              <th className="py-3 px-4">BBM / Volume</th>
              <th className="py-3 px-4">Pemicu Order</th>
              <th className="py-3 px-4">Status Pengiriman</th>
              <th className="py-3 px-4">Estimasi Tiba</th>
              <th className="py-3 px-4 text-right">Aksi Dispatcher</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {state.dispatches.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-8 text-center text-slate-400">
                  Tidak ada pesanan dispatch aktif saat ini.
                </td>
              </tr>
            ) : (
              state.dispatches.map((order) => {
                const isDelivered = order.status === 'DELIVERED';
                const isTransit = order.status === 'IN_TRANSIT';

                return (
                  <tr key={order.id} className="hover:bg-slate-50 transition-colors">
                    {/* Order Code */}
                    <td className="py-3.5 px-4 font-mono font-bold text-slate-900">
                      {order.dispatchCode}
                    </td>

                    {/* SPBU Destination */}
                    <td className="py-3.5 px-4">
                      <div>
                        <span className="font-bold text-slate-900 block leading-tight">
                          {order.spbuName}
                        </span>
                        <span className="text-[10px] font-mono text-slate-400">
                          {order.spbuCode}
                        </span>
                      </div>
                    </td>

                    {/* Fuel & Volume */}
                    <td className="py-3.5 px-4">
                      <span className="font-semibold text-slate-900">{order.fuelType}</span>
                      <span className="text-blue-700 font-mono font-bold ml-1.5">
                        +{order.requestedLiters.toLocaleString('id-ID')} L
                      </span>
                    </td>

                    {/* Trigger Source */}
                    <td className="py-3.5 px-4">
                      <span
                        className={`inline-flex items-center gap-1 text-[10px] font-mono font-semibold px-2 py-0.5 rounded ${
                          order.triggerSource === 'AUTO_WEBHOOK_LOW_TANK'
                            ? 'bg-amber-50 text-amber-800 border border-amber-200'
                            : 'bg-slate-100 text-slate-700 border border-slate-200'
                        }`}
                      >
                        {order.triggerSource === 'AUTO_WEBHOOK_LOW_TANK' ? (
                          <>
                            <Zap className="w-3 h-3 text-amber-600 fill-amber-600" />
                            <span>AUTO WEBHOOK (&le;20%)</span>
                          </>
                        ) : (
                          <span>DISPATCH MANUAL</span>
                        )}
                      </span>
                    </td>

                    {/* Status Badge */}
                    <td className="py-3.5 px-4">
                      <span
                        className={`badge text-[9px] py-0.5 px-2.5 ${
                          order.status === 'DELIVERED'
                            ? 'badge-normal'
                            : order.status === 'IN_TRANSIT'
                            ? 'badge-throttled'
                            : 'badge-info'
                        }`}
                      >
                        {order.status === 'DELIVERED'
                          ? 'TIBA (DELIVERED)'
                          : order.status === 'IN_TRANSIT'
                          ? 'DALAM PERJALANAN'
                          : 'ANTREAN DISPATCH'}
                      </span>
                    </td>

                    {/* ETA */}
                    <td className="py-3.5 px-4 font-mono text-slate-600 text-[11px]">
                      {isDelivered ? (
                        <span className="text-emerald-700 font-bold">Selesai Bongkar</span>
                      ) : (
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3 text-slate-400" />
                          <span>±{order.etaMinutes} Menit</span>
                        </span>
                      )}
                    </td>

                    {/* Action Button */}
                    <td className="py-3.5 px-4 text-right">
                      {!isDelivered ? (
                        <button
                          type="button"
                          onClick={() => handleAdvanceStatus(order.id)}
                          className={`px-3 py-1.5 rounded-lg text-white font-bold text-[11px] transition-all shadow-2xs active:scale-95 inline-flex items-center gap-1.5 ${
                            isTransit
                              ? 'bg-emerald-600 hover:bg-emerald-700'
                              : 'bg-blue-600 hover:bg-blue-700'
                          }`}
                        >
                          {isTransit ? (
                            <>
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              <span>Konfirmasi Tiba (+8.000L)</span>
                            </>
                          ) : (
                            <>
                              <Play className="w-3.5 h-3.5 fill-white" />
                              <span>Kirim Truk (In-Transit)</span>
                            </>
                          )}
                        </button>
                      ) : (
                        <span className="text-[11px] font-bold text-emerald-700 inline-flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                          <span>BBM Diterima</span>
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
export default WebhookDispatchTable;
