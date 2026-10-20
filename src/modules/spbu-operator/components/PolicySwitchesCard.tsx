// =============================================================================
// src/modules/spbu-operator/components/PolicySwitchesCard.tsx — NusaFuel Grid
// Automated Policy Control Panel for SPBU Operator
// Controls: Odd-Even Switch, Dynamic Throttling Slider (<30%), 10% Emergency Lock
// =============================================================================

import React, { useState } from 'react';
import { useStore } from '../../../app/store';
import type { SpbuStation } from '../../../core/data/baliSpbuSeed';
import {
  Calendar,
  Sliders,
  ShieldAlert,
  Zap,
} from 'lucide-react';

export interface PolicySwitchesCardProps {
  station: SpbuStation;
  operatorId: string;
}

export const PolicySwitchesCard: React.FC<PolicySwitchesCardProps> = ({
  station,
  operatorId,
}) => {
  const { toggleSpbuPolicy, getEffectiveDate } = useStore();
  const [throttlingThreshold, setThrottlingThreshold] = useState<number>(30);

  const effectiveDate = getEffectiveDate();
  const isOddDay = effectiveDate.getDate() % 2 !== 0;

  const handleToggle = (
    policy: 'oddEvenActive' | 'dynamicThrottlingActive' | 'emergencyReserveActive',
    currentVal: boolean
  ) => {
    toggleSpbuPolicy({
      spbuId: station.id,
      policy,
      value: !currentVal,
      operatorId,
    });
  };

  return (
    <div className="rounded-2xl bg-white border border-[#E6E8EC] p-6 sm:p-7 shadow-sm space-y-5 flex flex-col justify-between">
      {/* Panel Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-200">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-slate-900 text-white flex items-center justify-center shadow-xs">
            <Sliders className="w-4 h-4 text-[#FF5A5F]" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900 leading-tight">
              Kontrol Kebijakan Otomatis SPBU
            </h3>
            <p className="text-[11px] text-slate-500">
              Pengaturan saklar operasional nozel dan kuota SPBU {station.code}
            </p>
          </div>
        </div>

        <span className="text-[10px] font-mono font-bold bg-slate-100 text-slate-700 px-2.5 py-1 rounded-lg border border-slate-200">
          OTONOMI SPBU
        </span>
      </div>

      {/* 3 Policy Blocks in Bento Row 2 */}
      <div className="space-y-4">
        {/* Saklar 1: Penegakan Aturan Ganjil-Genap */}
        <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-emerald-600" />
              <span className="text-xs font-bold text-slate-900">
                1. Penegakan Plat Ganjil-Genap
              </span>
            </div>

            <button
              type="button"
              onClick={() => handleToggle('oddEvenActive', station.oddEvenActive)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${
                station.oddEvenActive ? 'bg-emerald-600' : 'bg-slate-300'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  station.oddEvenActive ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>

          <p className="text-[11px] text-slate-500 leading-relaxed">
            Mewajibkan validasi digit terakhir plat kendaraan terhadap kalender tanggal (Hari ini:{' '}
            <strong>{isOddDay ? 'Ganjil' : 'Genap'}</strong>).
          </p>

          <div className="flex items-center justify-between text-[11px] bg-white p-2 rounded-lg border border-slate-200/80">
            <span className="text-slate-500">Status Nozel:</span>
            <span
              className={`font-bold ${
                station.oddEvenActive ? 'text-emerald-700' : 'text-slate-400'
              }`}
            >
              {station.oddEvenActive ? '● ENFORCED (Aktif)' : '○ BYPASS (Semua Plat)'}
            </span>
          </div>
        </div>

        {/* Saklar 2: Dynamic Quota Throttling (<30%) */}
        <div className="p-4 rounded-xl bg-amber-50/60 border border-amber-200 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-[#FF9F1C]" />
              <span className="text-xs font-bold text-slate-900">
                2. Dynamic Quota Throttling
              </span>
            </div>

            <button
              type="button"
              onClick={() => handleToggle('dynamicThrottlingActive', station.dynamicThrottlingActive)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${
                station.dynamicThrottlingActive ? 'bg-[#FF9F1C]' : 'bg-slate-300'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  station.dynamicThrottlingActive ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>

          <p className="text-[11px] text-slate-600 leading-relaxed">
            Memotong kuota pengisian mobil dari 20L ke 10L saat stok tangki menipis demi
            pemerataan pasokan.
          </p>

          {/* Slider Ambang Batas Throttling */}
          <div className="space-y-1.5 pt-1">
            <div className="flex items-center justify-between text-[11px]">
              <span className="text-slate-600 font-semibold">Ambang Batas Throttling:</span>
              <span className="font-mono font-bold text-[#FF5A5F] bg-white px-2 py-0.5 rounded border border-amber-200">
                &le; {throttlingThreshold}% Kapasitas
              </span>
            </div>
            <input
              type="range"
              min="15"
              max="45"
              step="5"
              value={throttlingThreshold}
              onChange={(e) => setThrottlingThreshold(Number(e.target.value))}
              className="w-full accent-[#FF5A5F] cursor-pointer h-1.5 bg-amber-200 rounded-lg"
            />
          </div>

          {/* Quota Comparison Preview */}
          <div className="grid grid-cols-2 gap-2 text-[10px] pt-1">
            <div className="p-1.5 bg-white rounded border border-slate-200 text-center">
              <span className="text-slate-400 block font-semibold">KUOTA NORMAL</span>
              <strong className="text-slate-800">Mobil 20 Liter</strong>
            </div>
            <div className="p-1.5 bg-amber-100/70 rounded border border-amber-300 text-center">
              <span className="text-amber-800 block font-bold">THROTTLED</span>
              <strong className="text-amber-950 font-mono">Mobil 10 Liter</strong>
            </div>
          </div>
        </div>

        {/* Saklar 3: Kunci Cadangan Darurat 10% */}
        <div className="p-4 rounded-xl bg-red-50/60 border border-red-200 space-y-2.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-red-600" />
              <span className="text-xs font-bold text-slate-900">
                3. Kunci Cadangan Darurat 10%
              </span>
            </div>

            <button
              type="button"
              onClick={() => handleToggle('emergencyReserveActive', station.emergencyReserveActive)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${
                station.emergencyReserveActive ? 'bg-red-600' : 'bg-slate-300'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  station.emergencyReserveActive ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>

          <p className="text-[11px] text-slate-600 leading-relaxed">
            Mengunci sisa 10% dasar tangki BBM untuk layanan prioritas ambulans, damkar, dan BPBD
            bencana.
          </p>

          <div className="flex items-center justify-between text-[11px] bg-white p-2 rounded-lg border border-red-200/80">
            <span className="text-slate-500">Volume Terkunci:</span>
            <span
              className={`font-mono font-bold ${
                station.emergencyReserveActive ? 'text-red-600' : 'text-slate-400'
              }`}
            >
              {station.emergencyReserveActive ? '~1.000 L Terkunci' : 'Tidak Terkunci'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
export default PolicySwitchesCard;
