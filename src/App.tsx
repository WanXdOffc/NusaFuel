// =============================================================================
// src/App.tsx — NusaFuel Grid
// Root Application Shell (Stage 2: Shared UI & Role-Based Navigation)
// Renders TopCommandNavbar, AppRouter, AccessibilityWidget & Corporate Footer
// =============================================================================

import { useStore } from './app/store';
import { TopCommandNavbar } from './shared/components/TopCommandNavbar';
import { AccessibilityWidget } from './shared/components/AccessibilityWidget';
import { AppRouter } from './app/router';
import { Database, ShieldCheck, Fuel } from 'lucide-react';

export function App() {
  const { state, setActiveRole } = useStore();

  return (
    <div className="min-h-screen flex flex-col bg-[#F7F8FA] text-[#18191C] selection:bg-[#FF5A5F]/20 selection:text-[#FF5A5F]">
      {/* 1. Persistent Top Command Navbar (with Brand Strip & Judge Switcher) */}
      <TopCommandNavbar />

      {/* 2. Main Role-Based Active Workspace */}
      <main className="flex-1 flex flex-col">
        <AppRouter />
      </main>

      {/* 3. Accessibility Controls (Floating Widget) */}
      <AccessibilityWidget />

      {/* 4. Corporate Engineering Footer per design.md */}
      <footer className="bg-white border-t border-[#E6E8EC] py-8 text-xs text-slate-500 print:hidden">
        <div className="max-w-[1360px] mx-auto px-4 sm:px-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 pb-6 border-b border-slate-100">
            {/* Left Brand Info */}
            <div className="flex items-center gap-3">
              <div className="w-6 h-6 rounded bg-[#18152E] flex items-center justify-center text-white">
                <Fuel className="w-3.5 h-3.5 text-[#FF5A5F]" />
              </div>
              <div>
                <span className="font-brand font-bold text-sm tracking-wider text-slate-900 uppercase">
                  NUSAFUEL GRID
                </span>
                <span className="text-slate-400 mx-2">•</span>
                <span className="text-[11px] text-slate-500 font-medium">
                  Infrastruktur Distribusi & Antrean BBM Berbasis Digital
                </span>
              </div>
            </div>

            {/* Middle Role Quick Jump Links */}
            <div className="flex items-center gap-2 text-xs font-semibold">
              <span className="text-slate-400 text-[11px]">Navigasi Cepat:</span>
              <button
                type="button"
                onClick={() => setActiveRole('PUBLIC_DRIVER')}
                className={`px-2.5 py-1 rounded-md transition-colors ${
                  state.activeRole === 'PUBLIC_DRIVER'
                    ? 'bg-[#FF5A5F] text-white font-bold'
                    : 'text-slate-600 hover:text-slate-900 bg-slate-100'
                }`}
              >
                Portal Warga
              </button>
              <button
                type="button"
                onClick={() => setActiveRole('SPBU_OPERATOR')}
                className={`px-2.5 py-1 rounded-md transition-colors ${
                  state.activeRole === 'SPBU_OPERATOR'
                    ? 'bg-[#FF5A5F] text-white font-bold'
                    : 'text-slate-600 hover:text-slate-900 bg-slate-100'
                }`}
              >
                Petugas SPBU
              </button>
              <button
                type="button"
                onClick={() => setActiveRole('DEPOT_SIMULATOR')}
                className={`px-2.5 py-1 rounded-md transition-colors ${
                  state.activeRole === 'DEPOT_SIMULATOR'
                    ? 'bg-[#FF5A5F] text-white font-bold'
                    : 'text-slate-600 hover:text-slate-900 bg-slate-100'
                }`}
              >
                Depot & API
              </button>
            </div>
          </div>

          {/* Lower Technical Meta & Compliance Badges */}
          <div className="pt-4 flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] text-slate-400">
            <div className="flex flex-wrap items-center gap-3">
              <span>UINIC 8.0 Web Development Competition</span>
              <span>•</span>
              <span>Subtema: Lingkungan & AI / Digital Technology</span>
              <span>•</span>
              <span className="text-emerald-600 font-semibold flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5" />
                Security & Anti-Hoarding Active
              </span>
            </div>

            <div className="flex items-center gap-2 font-mono text-[10px]">
              <span className="flex items-center gap-1 text-slate-500">
                <Database className="w-3 h-3 text-emerald-500" />
                Neon DB: Ready
              </span>
              <span>•</span>
              <span className="text-slate-400">v1.2.0-stage2</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
