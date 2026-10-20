// =============================================================================
// src/App.tsx — NusaFuel Grid
// Root Application Shell (Refactor Tahap 1: Centered Layout, Real Auth, No Floating Slop)
// =============================================================================

import { AuthProvider } from './core/auth/authContext';
import { TopCommandNavbar } from './shared/components/TopCommandNavbar';
import { AppRouter } from './app/router';
import { Database, ShieldCheck, Fuel } from 'lucide-react';

export function App() {
  return (
    <AuthProvider>
      <div className="min-h-screen flex flex-col bg-[#F7F8FA] text-[#18191C] selection:bg-[#FF5A5F]/20 selection:text-[#FF5A5F]">
        {/* 1. Persistent Top Command Navbar (with Brand Strip & Real Auth) */}
        <TopCommandNavbar />

        {/* 2. Main Role-Based Active Workspace */}
        <main className="flex-1 flex flex-col w-full">
          <AppRouter />
        </main>

        {/* 3. Corporate Engineering Footer per design.md (Refined & Official) */}
        <footer className="bg-white border-t border-[#E6E8EC] py-10 text-xs text-slate-500 print:hidden">
          <div className="max-w-[1240px] mx-auto px-6 md:px-10">
            <div className="flex flex-col md:flex-row items-center justify-between gap-6 pb-6 border-b border-slate-100">
              {/* Left Brand Info */}
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-[#18152E] flex items-center justify-center text-white shadow-xs">
                  <Fuel className="w-4 h-4 text-[#FF5A5F]" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-brand font-bold text-base tracking-wider text-slate-900 uppercase">
                      NUSAFUEL GRID
                    </span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200">
                      PROVINSI BALI
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 font-medium mt-0.5">
                    Platform Distribusi & Antrean BBM Berbasis Digital — Dinas Tenaga Kerja dan ESDM Provinsi Bali
                  </p>
                </div>
              </div>

              {/* Right Operational Status */}
              <div className="flex items-center gap-4 text-xs font-semibold text-slate-600">
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span>Jaringan 9 Kab/Kota Aktif</span>
                </div>
                <span>•</span>
                <div className="flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <span>SHA-256 Anti-Hoarding</span>
                </div>
              </div>
            </div>

            {/* Lower Technical Meta & Compliance Badges */}
            <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] text-slate-400">
              <div className="flex flex-wrap items-center gap-2">
                <span>© 2026 Pemerintah Provinsi Bali & PT Pertamina Patra Niaga</span>
                <span>•</span>
                <span>Regional Jatimbalinus</span>
                <span>•</span>
                <span>Hak Cipta Dilindungi Undang-Undang</span>
              </div>

              <div className="flex items-center gap-2 font-mono text-[10px]">
                <span className="flex items-center gap-1 text-slate-500">
                  <Database className="w-3 h-3 text-emerald-500" />
                  Neon PostgreSQL Serverless
                </span>
                <span>•</span>
                <span className="text-slate-400">v2.1.0-production</span>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </AuthProvider>
  );
}

export default App;
