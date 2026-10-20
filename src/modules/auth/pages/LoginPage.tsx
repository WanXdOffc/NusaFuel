// =============================================================================
// src/modules/auth/pages/LoginPage.tsx — NusaFuel Grid
// Enterprise 3-Role Authentication Card per design.md (Zero AI Slop)
// Features Role Tabs, 1-Click Demo Login, and Verified Credentials
// =============================================================================

import React, { useState } from 'react';
import { useAuth, type AuthRole, DEMO_ACCOUNTS } from '../../../core/auth/authContext';
import {
  User,
  Fuel,
  Cpu,
  Lock,
  Mail,
  Zap,
  ArrowLeft,
  Eye,
  EyeOff,
  ShieldCheck,
} from 'lucide-react';

export const LoginPage: React.FC = () => {
  const { login, loginAsDemo, navigate } = useAuth();
  const [selectedRole, setSelectedRole] = useState<AuthRole>('DRIVER');
  const [email, setEmail] = useState(DEMO_ACCOUNTS.DRIVER.email);
  const [password, setPassword] = useState(DEMO_ACCOUNTS.DRIVER.passwordHint);
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleTabChange = (role: AuthRole) => {
    setSelectedRole(role);
    setEmail(DEMO_ACCOUNTS[role].email);
    setPassword(DEMO_ACCOUNTS[role].passwordHint);
    setErrorMsg(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      setErrorMsg('Silakan masukkan email atau nomor identitas.');
      return;
    }
    login(email, password, selectedRole);
  };

  const handleQuickDemo = (role: AuthRole) => {
    loginAsDemo(role);
  };

  const activeDemo = DEMO_ACCOUNTS[selectedRole];

  return (
    <div className="w-full min-h-[calc(100vh-160px)] flex items-center justify-center py-12 px-6 md:px-10 animate-fade-in">
      <div className="w-full max-w-xl">
        {/* Back Link */}
        <button
          type="button"
          onClick={() => navigate('/')}
          className="inline-flex items-center gap-2 text-xs font-semibold text-slate-500 hover:text-slate-900 mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Kembali ke Beranda Publik</span>
        </button>

        {/* Main Elevated White Card per design.md */}
        <div
          className="bg-white border border-[#E6E8EC] shadow-2xl p-6 sm:p-10 transition-all"
          style={{ borderRadius: '24px' }}
        >
          {/* Header */}
          <div className="text-center pb-6 border-b border-slate-100">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-[#18152E] shadow-md border border-slate-800 mb-3 text-white">
              <Fuel className="w-6 h-6 text-[#FF5A5F]" />
            </div>

            <h1 className="text-2xl font-bold font-sans tracking-tight text-slate-900">
              Portal Akses NusaFuel Grid
            </h1>
            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto leading-relaxed">
              Infrastruktur Terintegrasi Distribusi & Kuota BBM Bersubsidi Provinsi Bali
            </p>
          </div>

          {/* 3-Role Tab Selector */}
          <div className="my-6">
            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-2">
              Pilih Hak Akses Pengguna:
            </label>
            <div className="grid grid-cols-3 gap-2 p-1.5 rounded-xl bg-slate-100 border border-slate-200/80">
              <button
                type="button"
                onClick={() => handleTabChange('DRIVER')}
                className={`py-2 px-2 sm:px-3 rounded-lg text-xs font-bold transition-all flex flex-col sm:flex-row items-center justify-center gap-1.5 ${
                  selectedRole === 'DRIVER'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <User
                  className={`w-3.5 h-3.5 ${
                    selectedRole === 'DRIVER' ? 'text-[#FF5A5F]' : 'text-slate-400'
                  }`}
                />
                <span>Warga</span>
              </button>

              <button
                type="button"
                onClick={() => handleTabChange('OPERATOR')}
                className={`py-2 px-2 sm:px-3 rounded-lg text-xs font-bold transition-all flex flex-col sm:flex-row items-center justify-center gap-1.5 ${
                  selectedRole === 'OPERATOR'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Fuel
                  className={`w-3.5 h-3.5 ${
                    selectedRole === 'OPERATOR' ? 'text-[#FF9F1C]' : 'text-slate-400'
                  }`}
                />
                <span>Operator</span>
              </button>

              <button
                type="button"
                onClick={() => handleTabChange('ADMIN_API')}
                className={`py-2 px-2 sm:px-3 rounded-lg text-xs font-bold transition-all flex flex-col sm:flex-row items-center justify-center gap-1.5 ${
                  selectedRole === 'ADMIN_API'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Cpu
                  className={`w-3.5 h-3.5 ${
                    selectedRole === 'ADMIN_API' ? 'text-indigo-600' : 'text-slate-400'
                  }`}
                />
                <span>Depot / API</span>
              </button>
            </div>
          </div>

          {/* Active Role Description Strip */}
          <div className="mb-6 p-3 rounded-xl bg-slate-50 border border-slate-200/90 text-xs flex items-center justify-between gap-3">
            <div>
              <span className="font-bold text-slate-900 block leading-tight">
                {activeDemo.title}
              </span>
              <span className="text-[11px] text-slate-500">{activeDemo.subtitle}</span>
            </div>
            <span
              className={`text-[9px] font-mono font-bold px-2 py-0.5 rounded border uppercase ${
                selectedRole === 'DRIVER'
                  ? 'bg-red-50 text-[#FF5A5F] border-red-200'
                  : selectedRole === 'OPERATOR'
                  ? 'bg-amber-50 text-[#FF9F1C] border-amber-200'
                  : 'bg-indigo-50 text-indigo-700 border-indigo-200'
              }`}
            >
              {activeDemo.role}
            </span>
          </div>

          {/* Error Message */}
          {errorMsg && (
            <div className="mb-5 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-semibold flex items-center gap-2">
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Email / ID Akun Terdaftar
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="nama@nusafuel.id"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 text-xs font-medium text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-[#FF5A5F] focus:border-transparent transition-all"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Kata Sandi
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-slate-300 text-xs font-medium text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-[#FF5A5F] focus:border-transparent transition-all"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
                  aria-label="Toggle password visibility"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Standard Login Submit Button */}
            <button
              type="submit"
              className="w-full py-3 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs uppercase tracking-wider transition-all shadow-md active:scale-98 flex items-center justify-center gap-2 mt-2"
            >
              <span>Masuk ke Sistem</span>
            </button>
          </form>

          {/* Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-200" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-white px-3 text-[10px] font-bold text-slate-400 tracking-wider">
                Akses Cepat Evaluasi & Demonstrasi
              </span>
            </div>
          </div>

          {/* 1-Click Instant Autofill & Login Button */}
          <button
            type="button"
            onClick={() => handleQuickDemo(selectedRole)}
            className="w-full py-3.5 px-4 rounded-xl text-white font-bold text-xs uppercase tracking-wider transition-all shadow-md active:scale-98 flex items-center justify-center gap-2.5"
            style={{
              backgroundColor: '#FF5A5F',
            }}
          >
            <Zap className="w-4 h-4 fill-white" />
            <span>Isi Instan Akun Demo (1-Click Autofill & Login)</span>
          </button>

          <p className="text-[11px] text-center text-slate-400 mt-2 font-mono">
            Demo: <strong className="text-slate-600">{activeDemo.email}</strong> • Pass:{' '}
            <strong className="text-slate-600">{activeDemo.passwordHint}</strong>
          </p>

          {/* Footer Security Badge */}
          <div className="mt-8 pt-4 border-t border-slate-100 flex items-center justify-center gap-2 text-[11px] text-slate-400 font-medium">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Koneksi Aman Terverifikasi & Dilindungi SHA-256 Anti-Hoarding</span>
          </div>
        </div>
      </div>
    </div>
  );
};
export default LoginPage;
