// =============================================================================
// src/modules/depot-interconnect/pages/DepotSimulatorPage.tsx — NusaFuel Grid
// Depot & Simulator API (User C) — Stage 2 Interactive Preview Page
// Crisis simulator, live restock dispatch table, webhook payload, & audit logs
// =============================================================================

import React from 'react';
import { useStore } from '../../../app/store';
import { TankLevelGauge } from '../../../shared/components/TankLevelGauge';
import {
  Cpu,
  Flame,
  Truck,
  ShieldAlert,
  Database,
  CheckCircle2,
  Code2,
} from 'lucide-react';

export const DepotSimulatorPage: React.FC = () => {
  const {
    state,
    simulateCrisisEvent,
    triggerDepotDispatch,
    toggleSimulatedDateParity,
  } = useStore();

  const gajahMada = state.stations.find((s) => s.code === '54.811.01');
  const gajahMadaPertalite = state.tanks.find(
    (t) => t.spbuId === gajahMada?.id && t.fuelType === 'Pertalite'
  );

  return (
    <div className="w-full pb-16 animate-fade-in">
      {/* Header Bar */}
      <section className="bg-[#18152E] text-white py-8 border-b border-slate-800">
        <div className="max-w-[1360px] mx-auto px-4 sm:px-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-950 border border-indigo-700/60 text-xs font-semibold text-[#00A8E8] mb-2">
                <Cpu className="w-3.5 h-3.5" />
                <span>Depot Pertamina Integrated Logistics & Judge Simulator (User C)</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold font-sans">
                Interkoneksi Depot Logistik & Panel Pengujian Juri
              </h1>
              <p className="text-xs sm:text-sm text-slate-400 mt-1">
                Simulasikan krisis kelangkaan bahan bakar dalam 1-klik, uji webhook otomatis, dan inspeksi audit trail kriptografis.
              </p>
            </div>

            {/* Neon DB Connection Pill */}
            <div className="bg-slate-900/90 p-3 rounded-xl border border-slate-700 text-xs font-mono">
              <div className="flex items-center gap-2 text-emerald-400 font-bold mb-1">
                <Database className="w-4 h-4 text-emerald-400" />
                <span>NEON POSTGRESQL POOLER</span>
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              </div>
              <p className="text-[10px] text-slate-400 truncate max-w-xs" title="ep-rough-bonus-az15f3s0-pooler.c-3.ap-southeast-1.aws.neon.tech">
                ep-rough-bonus-az15f3s0-pooler.c-3.ap-southeast-1.aws.neon.tech
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Main Container */}
      <div className="max-w-[1360px] mx-auto px-4 sm:px-6 mt-8">
        {/* 1. Crisis Simulator Panel for Judges (PRD §4.3 & §6) */}
        <div className="bg-white rounded-xl p-6 border border-[#E6E8EC] shadow-sm mb-8">
          <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
            <div>
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Flame className="w-5 h-5 text-[#FF5A5F]" />
                Panel Tombol Cepat Pengujian Juri (1-Click Crisis Simulation)
              </h2>
              <p className="text-xs text-slate-500">
                Uji langsung respons reaktif sistem antrean dan auto-webhook tanpa menunggu tangki habis secara alami
              </p>
            </div>
            <span className="text-[10px] font-mono bg-red-50 text-red-700 px-2 py-0.5 rounded border border-red-200 font-bold">
              JUDGE UX TESTING SUITE
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Action 1: Drain to Critical */}
            <div className="p-4 rounded-xl border border-red-200 bg-red-50/50 flex flex-col justify-between">
              <div>
                <span className="text-xs font-bold text-red-900 block mb-1">
                  1. Kuras Tangki ke 5% (Kritis)
                </span>
                <p className="text-[11px] text-slate-600 mb-3">
                  Kuras stok Pertalite SPBU Gajah Mada ke level darurat (&le;10%). Mengaktifkan status EMERGENCY_ONLY dan memblokir antrean non-darurat.
                </p>
              </div>
              <button
                type="button"
                onClick={() =>
                  gajahMada && simulateCrisisEvent('TANK_CRITICAL', gajahMada.id)
                }
                className="w-full py-2 px-3 rounded-lg bg-red-600 hover:bg-red-700 text-white text-xs font-bold shadow-xs active:scale-95 transition-all"
              >
                Kuras ke 5% (Stok Kritis)
              </button>
            </div>

            {/* Action 2: Force Restock Webhook */}
            <div className="p-4 rounded-xl border border-blue-200 bg-blue-50/50 flex flex-col justify-between">
              <div>
                <span className="text-xs font-bold text-blue-900 block mb-1">
                  2. Picu Webhook Dispatch Truk
                </span>
                <p className="text-[11px] text-slate-600 mb-3">
                  Buat pesanan restock truk tangki 8.000L dari Depot Manggis dan terbitkan payload webhook live.
                </p>
              </div>
              <button
                type="button"
                onClick={() =>
                  gajahMada && simulateCrisisEvent('FORCE_DISPATCH', gajahMada.id)
                }
                className="w-full py-2 px-3 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-xs active:scale-95 transition-all"
              >
                Picu Webhook Dispatch
              </button>
            </div>

            {/* Action 3: Toggle Parity */}
            <div className="p-4 rounded-xl border border-emerald-200 bg-emerald-50/50 flex flex-col justify-between">
              <div>
                <span className="text-xs font-bold text-emerald-900 block mb-1">
                  3. Beralih Hari Ganjil/Genap
                </span>
                <p className="text-[11px] text-slate-600 mb-3">
                  Ubah tanggal efektif sistem secara instan untuk menguji penolakan plat ganjil di hari genap atau sebaliknya.
                </p>
              </div>
              <button
                type="button"
                onClick={toggleSimulatedDateParity}
                className="w-full py-2 px-3 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs active:scale-95 transition-all"
              >
                Ganti Hari Ganjil/Genap
              </button>
            </div>

            {/* Action 4: Real-Time Gauge Preview */}
            <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 flex flex-col justify-between">
              <div>
                <span className="text-xs font-bold text-slate-800 block mb-1">
                  Status Pertalite Gajah Mada:
                </span>
                {gajahMadaPertalite && (
                  <div className="mt-2">
                    <TankLevelGauge
                      tank={gajahMadaPertalite}
                      compact={true}
                      operationalMode={gajahMada?.operationalMode}
                    />
                  </div>
                )}
              </div>
              <p className="text-[10px] text-slate-400 mt-2">
                Gauge bereaksi seketika terhadap klik tombol simulasi di atas.
              </p>
            </div>
          </div>
        </div>

        {/* 2. Dispatches Table & Live Webhook JSON */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Left 2 Cols: Dispatches Table */}
          <div className="lg:col-span-2 bg-white rounded-xl p-5 border border-[#E6E8EC] shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <Truck className="w-4 h-4 text-blue-600" />
                  Antrean Dispatch Truk Tangki Depot Manggis
                </h3>
                <p className="text-[11px] text-slate-500">
                  Daftar pengiriman BBM terotomatisasi berbasis webhook
                </p>
              </div>
              <span className="text-xs font-mono font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                {state.dispatches.length} Pesanan
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-500 font-semibold uppercase text-[10px] tracking-wider">
                    <th className="pb-2.5">Kode Order</th>
                    <th className="pb-2.5">SPBU Tujuan</th>
                    <th className="pb-2.5">BBM / Volume</th>
                    <th className="pb-2.5">Status</th>
                    <th className="pb-2.5">ETA</th>
                    <th className="pb-2.5 text-right">Aksi Juri</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {state.dispatches.map((d) => (
                    <tr key={d.id} className="hover:bg-slate-50 transition-colors">
                      <td className="py-2.5 font-mono font-bold text-slate-900">
                        {d.dispatchCode}
                      </td>
                      <td className="py-2.5 text-slate-700">{d.spbuName}</td>
                      <td className="py-2.5">
                        <span className="font-semibold text-slate-900">{d.fuelType}</span>
                        <span className="text-slate-400 font-mono ml-1">
                          ({d.requestedLiters.toLocaleString()}L)
                        </span>
                      </td>
                      <td className="py-2.5">
                        <span
                          className={`badge text-[9px] py-0.5 px-2 ${
                            d.status === 'DELIVERED'
                              ? 'badge-normal'
                              : d.status === 'IN_TRANSIT'
                              ? 'badge-throttled'
                              : 'badge-info'
                          }`}
                        >
                          {d.status}
                        </span>
                      </td>
                      <td className="py-2.5 font-mono text-slate-600">
                        {d.status === 'DELIVERED' ? 'Selesai' : `${d.etaMinutes}m`}
                      </td>
                      <td className="py-2.5 text-right">
                        {d.status !== 'DELIVERED' ? (
                          <button
                            type="button"
                            onClick={() => triggerDepotDispatch(d.id)}
                            className="text-[10px] font-bold text-blue-600 hover:text-blue-800 bg-blue-50 px-2.5 py-1 rounded-md border border-blue-200 transition-colors"
                          >
                            Majukan Status &rarr;
                          </button>
                        ) : (
                          <span className="text-[10px] text-emerald-600 font-bold flex items-center justify-end gap-1">
                            <CheckCircle2 className="w-3 h-3" />
                            Diterima
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Right 1 Col: Live Webhook JSON Inspector */}
          <div className="bg-slate-900 rounded-xl p-5 border border-slate-800 text-white flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Code2 className="w-4 h-4 text-[#FF5A5F]" />
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200">
                    Live Webhook Payload
                  </h3>
                </div>
                <span className="text-[9px] font-mono text-emerald-400 bg-emerald-950 px-2 py-0.5 rounded border border-emerald-800">
                  HTTP 200 POST
                </span>
              </div>

              <p className="text-[11px] text-slate-400 mb-2">
                Payload JSON otomatis diterbitkan saat level tangki menyentuh &le;20%:
              </p>

              <pre className="p-3 bg-black/60 rounded-lg text-[10px] font-mono text-emerald-300 overflow-x-auto max-h-52 border border-slate-800">
                {JSON.stringify(
                  state.lastWebhookPayload ?? {
                    event: 'AUTO_RESTOCK_REQUEST',
                    timestamp: new Date().toISOString(),
                    spbuCode: '54.811.03',
                    fuelType: 'Pertalite',
                    triggerFillPercent: 18.0,
                    requestedVolumeLiters: 8000,
                    depotSource: 'Depot Pertamina Manggis, Karangasem',
                  },
                  null,
                  2
                )}
              </pre>
            </div>

            <div className="mt-3 pt-3 border-t border-slate-800 text-[10px] text-slate-400 flex items-center justify-between">
              <span>PRD §4.3 Autonomous Webhook</span>
              <span className="text-slate-300">Target: /api/v1/depot/dispatch</span>
            </div>
          </div>
        </div>

        {/* 3. Security Audit Log Stream */}
        <div className="bg-white rounded-xl p-5 border border-[#E6E8EC] shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 text-slate-700" />
                Immutable Security & Audit Trail (Cybersecurity Compliance)
              </h3>
              <p className="text-[11px] text-slate-500">
                Semua mutasi kuota, scan kasir, dan simulasi juri dicatat permanen dalam audit log
              </p>
            </div>
            <span className="text-xs font-mono font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
              {state.auditLogs.length} Entri Log
            </span>
          </div>

          <div className="overflow-x-auto max-h-72 overflow-y-auto">
            <table className="w-full text-left text-xs">
              <thead className="sticky top-0 bg-white">
                <tr className="border-b border-slate-200 text-slate-500 font-semibold uppercase text-[10px] tracking-wider">
                  <th className="pb-2.5">Waktu</th>
                  <th className="pb-2.5">Actor</th>
                  <th className="pb-2.5">Event Type</th>
                  <th className="pb-2.5">Severity</th>
                  <th className="pb-2.5">Pesan Log</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {state.auditLogs.slice(0, 15).map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50">
                    <td className="py-2 font-mono text-[11px] text-slate-500 whitespace-nowrap">
                      {new Date(log.timestamp).toLocaleTimeString('id-ID')}
                    </td>
                    <td className="py-2">
                      <span className="font-semibold text-slate-800 text-[11px]">
                        {log.actorRole}
                      </span>
                    </td>
                    <td className="py-2 font-mono text-[10px] text-slate-700">
                      {log.eventType}
                    </td>
                    <td className="py-2">
                      <span
                        className={`badge text-[9px] py-0.2 px-1.5 ${
                          log.severity === 'CRITICAL'
                            ? 'badge-critical'
                            : log.severity === 'WARNING'
                            ? 'badge-warning'
                            : 'badge-info'
                        }`}
                      >
                        {log.severity}
                      </span>
                    </td>
                    <td className="py-2 text-slate-600 text-[11px] max-w-md truncate" title={log.message}>
                      {log.message}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
export default DepotSimulatorPage;
