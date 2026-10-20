// =============================================================================
// src/modules/depot-interconnect/pages/DepotSimulatorPage.tsx — NusaFuel Grid
// User C: Depot Pertamina Dispatcher & Regional Fuel Logistics Orchestration
// Refactored per design.md with Centered Container max-w-[1240px]
// =============================================================================

import React from 'react';
import { CrisisSimulatorPanel } from '../components/CrisisSimulatorPanel';
import { WebhookDispatchTable } from '../components/WebhookDispatchTable';
import { RestApiPlayground } from '../components/RestApiPlayground';
import { SecurityAuditTable } from '../components/SecurityAuditTable';
import {
  Cpu,
  Database,
  Truck,
  Flame,
  Activity,
  ShieldAlert,
} from 'lucide-react';

export const DepotSimulatorPage: React.FC = () => {
  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="w-full pb-20 animate-fade-in font-sans">
      {/* Header Bar */}
      <section className="bg-[#18152E] text-white py-10 border-b border-slate-800">
        <div className="max-w-[1240px] mx-auto px-6 md:px-10">
          <div className="flex flex-wrap items-center justify-between gap-6">
            <div className="max-w-3xl">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-950/80 border border-indigo-700/60 text-xs font-semibold text-[#00A8E8] mb-3">
                <Cpu className="w-3.5 h-3.5" />
                <span>Orkestrator Logistik Depot Pertamina & API Regional</span>
              </div>
              <h1 className="text-2xl sm:text-4xl font-extrabold font-sans tracking-tight">
                Orkestrasi Logistik Depot & Simulasi Ketahanan Pasokan Bali
              </h1>
              <p className="text-xs sm:text-sm text-slate-300 mt-2 leading-relaxed">
                Pusat komando logistik BBM Provinsi Bali: pantau pergerakan truk tangki Depot Manggis & Sanggaran, uji simulasi lonjakan beban antrean, inspeksi payload REST API terpadu, dan verifikasi jejak audit keamanan siber.
              </p>
            </div>

            {/* Neon DB Connection Pill */}
            <div className="bg-slate-900/95 p-4 rounded-2xl border border-slate-700 text-xs font-mono shadow-xl">
              <div className="flex items-center gap-2 text-emerald-400 font-bold mb-1.5">
                <Database className="w-4 h-4 text-emerald-400" />
                <span>NEON POSTGRESQL POOLER</span>
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              </div>
              <p
                className="text-[11px] text-slate-400 truncate max-w-xs font-mono"
                title="postgresql://neondb_owner:***@ep-rough-bonus-az15f3s0-pooler.c-3.ap-southeast-1.aws.neon.tech/neondb"
              >
                ep-rough-bonus-az15f3s0-pooler
              </p>
              <div className="mt-2 pt-2 border-t border-slate-800 flex items-center justify-between text-[10px] text-slate-400">
                <span>Region: ap-southeast-1</span>
                <span className="text-emerald-400 font-semibold">ONLINE 99.9%</span>
              </div>
            </div>
          </div>

          {/* Quick Jump Anchor Pills */}
          <div className="flex flex-wrap items-center gap-2 mt-8 pt-6 border-t border-slate-800/80 text-xs">
            <span className="text-slate-400 font-semibold text-[11px] mr-1">
              Navigasi Cepat Sesi:
            </span>
            <button
              type="button"
              onClick={() => scrollToSection('crisis-simulator-section')}
              className="px-3 py-1.5 rounded-lg bg-slate-800/80 hover:bg-[#FF5A5F] text-slate-200 hover:text-white transition-all flex items-center gap-1.5 font-medium active:scale-95 border border-slate-700"
            >
              <Flame className="w-3.5 h-3.5 text-[#FF5A5F]" />
              <span>Simulasi Respons Krisis</span>
            </button>
            <button
              type="button"
              onClick={() => scrollToSection('telemetry-section')}
              className="px-3 py-1.5 rounded-lg bg-slate-800/80 hover:bg-cyan-600 text-slate-200 hover:text-white transition-all flex items-center gap-1.5 font-medium active:scale-95 border border-slate-700"
            >
              <Activity className="w-3.5 h-3.5 text-cyan-400" />
              <span>Grafik Telemetri & REST API</span>
            </button>
            <button
              type="button"
              onClick={() => scrollToSection('dispatch-section')}
              className="px-3 py-1.5 rounded-lg bg-slate-800/80 hover:bg-blue-600 text-slate-200 hover:text-white transition-all flex items-center gap-1.5 font-medium active:scale-95 border border-slate-700"
            >
              <Truck className="w-3.5 h-3.5 text-blue-400" />
              <span>Antrean Truk Tangki Webhook</span>
            </button>
            <button
              type="button"
              onClick={() => scrollToSection('audit-section')}
              className="px-3 py-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-200 hover:text-white transition-all flex items-center gap-1.5 font-medium active:scale-95 border border-slate-700"
            >
              <ShieldAlert className="w-3.5 h-3.5 text-slate-400" />
              <span>Log Audit Keamanan Siber</span>
            </button>
          </div>
        </div>
      </section>

      {/* Main Container: max-w-[1240px] mx-auto px-6 md:px-10 py-12 space-y-12 */}
      <div className="max-w-[1240px] mx-auto px-6 md:px-10 py-12 space-y-12">
        {/* Section 1: Crisis Simulator Panel */}
        <div id="crisis-simulator-section">
          <CrisisSimulatorPanel />
        </div>

        {/* Section 2: Recharts Telemetry & Live REST API Inspector */}
        <div id="telemetry-section">
          <RestApiPlayground />
        </div>

        {/* Section 3: Webhook Dispatch Orchestration Table */}
        <div id="dispatch-section">
          <WebhookDispatchTable />
        </div>

        {/* Section 4: Security Audit Table (Cybersecurity Compliance) */}
        <div id="audit-section">
          <SecurityAuditTable />
        </div>
      </div>
    </div>
  );
};
export default DepotSimulatorPage;
