// =============================================================================
// src/modules/depot-interconnect/components/RestApiPlayground.tsx — NusaFuel Grid
// Recharts Regional Telemetry (Actual vs Booked vs Emergency) & Live REST API Inspector
// Colors: Stok Aktual (#059669), Kuota Terpesan (#FF9F1C), Cadangan Darurat (#FF5A5F)
// Explicit height={320} & Dual Chart Mode (BarChart & AreaChart) across Bali Regencies
// =============================================================================

import React, { useState, useMemo } from 'react';
import { useStore } from '../../../app/store';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
} from 'recharts';
import {
  Activity,
  Code2,
  Copy,
  Check,
  Server,
  Key,
  RefreshCw,
  BarChart3,
  TrendingUp,
} from 'lucide-react';

type FuelFilter = 'ALL' | 'Pertalite' | 'Pertamax' | 'Solar';
type ApiEndpointKey = 'GET_BALI_STATIONS' | 'POST_QUEUE_VERIFY' | 'POST_DEPOT_WEBHOOK';

export const RestApiPlayground: React.FC = () => {
  const { state } = useStore();
  const [selectedFuel, setSelectedFuel] = useState<FuelFilter>('Pertalite');
  const [chartType, setChartType] = useState<'BAR' | 'AREA'>('BAR');
  const [viewScope, setViewScope] = useState<'REGENCY' | 'STATION'>('REGENCY');
  const [activeEndpoint, setActiveEndpoint] = useState<ApiEndpointKey>('GET_BALI_STATIONS');
  const [copiedPayload, setCopiedPayload] = useState<boolean>(false);
  const [liveApiKey, setLiveApiKey] = useState<string>(
    'nfg_live_bali_7f8c12a9e3d456b0981a'
  );
  const [keyGeneratedNotice, setKeyGeneratedNotice] = useState<boolean>(false);

  // Generate a new simulated API Key
  const handleGenerateApiKey = () => {
    const chars = '0123456789abcdef';
    let rand = '';
    for (let i = 0; i < 20; i++) {
      rand += chars[Math.floor(Math.random() * chars.length)];
    }
    const newKey = `nfg_live_bali_${rand}`;
    setLiveApiKey(newKey);
    setKeyGeneratedNotice(true);
    setTimeout(() => setKeyGeneratedNotice(false), 3000);
  };

  // 9 Regencies in Bali
  const BALI_REGENCIES = [
    'Kota Denpasar',
    'Badung',
    'Gianyar',
    'Tabanan',
    'Buleleng',
    'Jembrana',
    'Karangasem',
    'Klungkung',
    'Bangli',
  ];

  // Compute telemetry data grouped by Regency or by Individual Station
  const chartData = useMemo(() => {
    if (viewScope === 'REGENCY') {
      return BALI_REGENCIES.map((regencyName) => {
        const regencyStations = state.stations.filter((s) => s.regency === regencyName);
        const stationIds = new Set(regencyStations.map((s) => s.id));
        const regencyTanks = state.tanks.filter((t) => stationIds.has(t.spbuId));

        const filteredTanks =
          selectedFuel === 'ALL'
            ? regencyTanks
            : regencyTanks.filter((t) => t.fuelType === selectedFuel);

        const actualLiters = filteredTanks.reduce((sum, t) => sum + t.currentLiters, 0);
        const bookedLiters = filteredTanks.reduce((sum, t) => sum + t.bookedLiters, 0);
        const emergencyLiters = filteredTanks.reduce(
          (sum, t) => sum + Math.round(t.maxCapacityLiters * 0.1),
          0
        );
        const capacityLiters = filteredTanks.reduce((sum, t) => sum + t.maxCapacityLiters, 0);

        // Clean label: "Denpasar", "Badung", "Gianyar", etc.
        const shortLabel = regencyName.replace('Kab. ', '').replace('Kota ', '');

        return {
          name: shortLabel,
          fullName: regencyName,
          stationCount: regencyStations.length,
          'Stok Aktual': actualLiters,
          'Kuota Terpesan': bookedLiters,
          'Cadangan Darurat': emergencyLiters,
          Kapasitas: capacityLiters,
        };
      });
    }

    // By Station
    return state.stations.map((spbu) => {
      const stationTanks = state.tanks.filter((t) => t.spbuId === spbu.id);
      const filteredTanks =
        selectedFuel === 'ALL'
          ? stationTanks
          : stationTanks.filter((t) => t.fuelType === selectedFuel);

      const actualLiters = filteredTanks.reduce((sum, t) => sum + t.currentLiters, 0);
      const bookedLiters = filteredTanks.reduce((sum, t) => sum + t.bookedLiters, 0);
      const emergencyLiters = filteredTanks.reduce(
        (sum, t) => sum + Math.round(t.maxCapacityLiters * 0.1),
        0
      );

      const shortName = spbu.code.slice(-5) + ' ' + (spbu.regency || '').slice(0, 4);

      return {
        name: shortName,
        fullName: `${spbu.name} (${spbu.regency})`,
        'Stok Aktual': actualLiters,
        'Kuota Terpesan': bookedLiters,
        'Cadangan Darurat': emergencyLiters,
      };
    });
  }, [state.stations, state.tanks, selectedFuel, viewScope]);

  // Aggregate stats across Bali
  const totalStats = useMemo(() => {
    const totalActual = chartData.reduce((sum, d) => sum + d['Stok Aktual'], 0);
    const totalBooked = chartData.reduce((sum, d) => sum + d['Kuota Terpesan'], 0);
    const totalEmergency = chartData.reduce((sum, d) => sum + d['Cadangan Darurat'], 0);
    return { totalActual, totalBooked, totalEmergency };
  }, [chartData]);

  // Dynamic payload generation for the 3 official endpoints
  const endpointDetails = useMemo(() => {
    const sampleStation = state.stations[0];
    const sampleTanks = state.tanks.filter((t) => t.spbuId === sampleStation?.id);
    const sampleTicket = state.tickets[0];

    switch (activeEndpoint) {
      case 'GET_BALI_STATIONS':
        return {
          title: '1. GET /api/v1/bali/stations',
          method: 'GET',
          url: 'https://api.nusafuel.id/api/v1/bali/stations',
          description:
            'Mengambil direktori seluruh stasiun SPBU di 9 kabupaten/kota Bali lengkap dengan status probe ATG real-time, nozel aktif, dan mode operasional.',
          headers: {
            Accept: 'application/json',
            'X-API-Key': liveApiKey,
            'X-Region-Scope': 'PROVINSI_BALI_9_KAB',
          },
          request: null,
          response: {
            status: 200,
            statusText: 'OK',
            latencyMs: 12,
            body: {
              success: true,
              region: 'Provinsi Bali',
              totalStations: state.stations.length,
              timestamp: new Date().toISOString(),
              data: state.stations.slice(0, 3).map((st) => ({
                id: st.id,
                code: st.code,
                name: st.name,
                regency: st.regency,
                coordinates: { lat: st.lat, lng: st.lng },
                operationalMode: st.operationalMode,
                activeNozzles: st.activeNozzles,
                tanks: sampleTanks.map((t) => ({
                  fuel: t.fuelType,
                  currentLiters: t.currentLiters,
                  maxCapacityLiters: t.maxCapacityLiters,
                  fillPercent: Math.round((t.currentLiters / t.maxCapacityLiters) * 100),
                })),
              })),
            },
          },
        };

      case 'POST_QUEUE_VERIFY':
        return {
          title: '2. POST /api/v1/queue/verify',
          method: 'POST',
          url: 'https://api.nusafuel.id/api/v1/queue/verify',
          description:
            'Kasir POS SPBU memvalidasi QR hash tiket antrean warga dengan kriptografi SHA-256 dan memotong stok tangki secara atomik.',
          headers: {
            'Content-Type': 'application/json',
            'X-API-Key': liveApiKey,
            'X-Operator-Id': 'OPR-BALI-81101',
          },
          request: {
            ticketCode: sampleTicket?.ticketCode ?? 'NFG-20261020-7A39',
            qrHash:
              sampleTicket?.qrHash ??
              'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
            spbuCode: sampleStation?.code ?? '54.811.14',
            scannedPlate: sampleTicket?.plateNumber ?? 'DK 4821 FB',
            requestedFuel: sampleTicket?.fuelType ?? 'Pertalite',
            dispensedLiters: sampleTicket?.quotaLiters ?? 20,
          },
          response: {
            status: 200,
            statusText: 'OK',
            latencyMs: 19,
            body: {
              success: true,
              verificationStatus: 'VERIFIED_AND_DISPENSED',
              plateVerified: sampleTicket?.plateNumber ?? 'DK 4821 FB',
              antiHoardingCheck: 'PASSED_CLEAN',
              remainingTankLiters: 8900,
              auditLogId: 'AUD-VERIFY-2026-9921',
              verifiedAt: new Date().toISOString(),
            },
          },
        };

      case 'POST_DEPOT_WEBHOOK':
        return {
          title: '3. POST /api/v1/depot/webhook',
          method: 'POST',
          url: 'https://depot.pertamina.id/api/v1/depot/webhook',
          description:
            'Autonomous restock webhook: ATG mendeteksi level tangki &le;20%, seketika menerbitkan delivery order truk tangki 8.000L dari Depot Manggis/Sanggaran.',
          headers: {
            'Content-Type': 'application/json',
            'X-NusaFuel-Signature':
              'sha256=9b71d224bd62f3785d96d46ad3ea3d73319bfbc2890caadae2dff72519673ca72',
            'X-Source-Station': sampleStation?.code ?? '54.811.14',
          },
          request: state.lastWebhookPayload ?? {
            event: 'AUTONOMOUS_RESTOCK_DISPATCH',
            timestamp: new Date().toISOString(),
            spbuCode: sampleStation?.code ?? '54.811.14',
            spbuName: sampleStation?.name ?? 'SPBU 54.811.14 Gajah Mada Singaraja',
            regency: sampleStation?.regency ?? 'Buleleng',
            triggerLevelPercent: 18.4,
            requestedFuel: 'Pertalite',
            recommendedVolumeLiters: 8000,
            assignedDepot: 'Integrated Terminal Manggis (Karangasem)',
          },
          response: {
            status: 201,
            statusText: 'Created',
            latencyMs: 24,
            body: {
              success: true,
              dispatchOrderCode: 'DO-DEPOT-MNG-2026-081',
              originDepot: 'IT Manggis Karangasem',
              destinationSpbu: sampleStation?.name ?? 'SPBU 54.811.14 Gajah Mada',
              assignedTankerPlate: 'DK 8821 BB',
              tankerCapacityLiters: 8000,
              etaMinutes: 45,
              driver: 'I Made Suardana',
              dispatchedAt: new Date().toISOString(),
            },
          },
        };
    }
  }, [activeEndpoint, liveApiKey, state]);

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedPayload(true);
    setTimeout(() => setCopiedPayload(false), 2000);
  };

  return (
    <div className="space-y-8 font-sans">
      {/* ===================================================================== */}
      {/* 1. Fuel Telemetry Recharts Chart Card (Across 9 Regencies of Bali)     */}
      {/* ===================================================================== */}
      <div className="rounded-2xl bg-white border border-[#E6E8EC] p-6 sm:p-8 shadow-sm">
        {/* Header and Controls */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-6 border-b border-slate-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <Activity className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900 leading-snug">
                Grafik Telemetri Stok Bahan Bakar — Lintas 9 Kabupaten/Kota Bali
              </h3>
              <p className="text-xs text-slate-500">
                Perbandingan kuota nyata: Stok Aktual (Hijau), Kuota Terpesan (Amber), dan Cadangan Darurat (Merah Coral)
              </p>
            </div>
          </div>

          {/* Controls: Chart Type, Scope, Fuel Pills */}
          <div className="flex flex-wrap items-center gap-3">
            {/* View Scope (Regency vs Station) */}
            <div className="flex items-center bg-slate-100 p-1 rounded-xl text-xs font-semibold">
              <button
                type="button"
                onClick={() => setViewScope('REGENCY')}
                className={`px-2.5 py-1 rounded-lg transition-all ${
                  viewScope === 'REGENCY'
                    ? 'bg-white text-slate-900 shadow-2xs font-bold'
                    : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                9 Kab/Kota
              </button>
              <button
                type="button"
                onClick={() => setViewScope('STATION')}
                className={`px-2.5 py-1 rounded-lg transition-all ${
                  viewScope === 'STATION'
                    ? 'bg-white text-slate-900 shadow-2xs font-bold'
                    : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                12 SPBU
              </button>
            </div>

            {/* Chart Type (Bar vs Area) */}
            <div className="flex items-center bg-slate-100 p-1 rounded-xl text-xs font-semibold">
              <button
                type="button"
                onClick={() => setChartType('BAR')}
                className={`p-1.5 rounded-lg transition-all ${
                  chartType === 'BAR'
                    ? 'bg-white text-slate-900 shadow-2xs'
                    : 'text-slate-500 hover:text-slate-900'
                }`}
                title="Tampilkan Diagram Batang"
              >
                <BarChart3 className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => setChartType('AREA')}
                className={`p-1.5 rounded-lg transition-all ${
                  chartType === 'AREA'
                    ? 'bg-white text-slate-900 shadow-2xs'
                    : 'text-slate-500 hover:text-slate-900'
                }`}
                title="Tampilkan Diagram Area Kontur"
              >
                <TrendingUp className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Fuel Pills */}
            <div className="flex items-center bg-slate-100 p-1 rounded-xl text-xs font-semibold">
              {(['Pertalite', 'Pertamax', 'Solar', 'ALL'] as FuelFilter[]).map((fuel) => (
                <button
                  key={fuel}
                  type="button"
                  onClick={() => setSelectedFuel(fuel)}
                  className={`px-2.5 py-1 rounded-lg transition-all ${
                    selectedFuel === fuel
                      ? 'bg-slate-900 text-white shadow-2xs font-bold'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {fuel === 'ALL' ? 'Semua BBM' : fuel}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* 3 Summary KPI Strips */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 my-6">
          <div className="p-4 rounded-xl bg-emerald-50/70 border border-emerald-200 flex items-center justify-between">
            <div>
              <span className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider block">
                Total Stok Aktual (Liter)
              </span>
              <span className="text-xl sm:text-2xl font-mono font-bold text-emerald-950">
                {totalStats.totalActual.toLocaleString('id-ID')} L
              </span>
            </div>
            <div className="w-3.5 h-3.5 rounded-full bg-[#059669]" />
          </div>

          <div className="p-4 rounded-xl bg-amber-50/70 border border-amber-200 flex items-center justify-between">
            <div>
              <span className="text-[10px] font-bold text-amber-800 uppercase tracking-wider block">
                Total Kuota Terpesan (Booked)
              </span>
              <span className="text-xl sm:text-2xl font-mono font-bold text-amber-950">
                {totalStats.totalBooked.toLocaleString('id-ID')} L
              </span>
            </div>
            <div className="w-3.5 h-3.5 rounded-full bg-[#FF9F1C]" />
          </div>

          <div className="p-4 rounded-xl bg-red-50/70 border border-red-200 flex items-center justify-between">
            <div>
              <span className="text-[10px] font-bold text-red-800 uppercase tracking-wider block">
                Cadangan Darurat Terkunci (10%)
              </span>
              <span className="text-xl sm:text-2xl font-mono font-bold text-red-950">
                {totalStats.totalEmergency.toLocaleString('id-ID')} L
              </span>
            </div>
            <div className="w-3.5 h-3.5 rounded-full bg-[#FF5A5F]" />
          </div>
        </div>

        {/* Recharts Chart Container with explicit height={320} & minHeight */}
        <div className="w-full mt-4" style={{ minHeight: '340px' }}>
          <ResponsiveContainer width="100%" height={320}>
            {chartType === 'BAR' ? (
              <BarChart
                data={chartData}
                margin={{ top: 20, right: 25, left: 10, bottom: 25 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                <XAxis
                  dataKey="name"
                  tick={{ fill: '#475569', fontSize: 11, fontWeight: 700 }}
                  tickLine={false}
                  interval={0}
                />
                <YAxis
                  tick={{ fill: '#64748B', fontSize: 10 }}
                  tickFormatter={(val) => `${(val / 1000).toFixed(0)}k L`}
                  tickLine={false}
                />
                <Tooltip
                  content={({ active, payload, label }) => {
                    if (active && payload && payload.length) {
                      return (
                        <div className="bg-slate-900 text-white p-3.5 rounded-xl shadow-xl text-xs space-y-1.5 border border-slate-700 font-sans">
                          <p className="font-bold text-sm text-slate-100 border-b border-slate-800 pb-1">
                            {label}
                          </p>
                          {payload.map((entry, index) => (
                            <div
                              key={`tooltip-${index}`}
                              className="flex items-center justify-between gap-4 text-[11px]"
                            >
                              <span
                                className="font-medium"
                                style={{ color: entry.color }}
                              >
                                {entry.name}:
                              </span>
                              <span className="font-mono font-bold">
                                {Number(entry.value).toLocaleString('id-ID')} L
                              </span>
                            </div>
                          ))}
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Legend
                  wrapperStyle={{ fontSize: '11px', paddingTop: '12px' }}
                  iconType="circle"
                />
                <Bar
                  dataKey="Stok Aktual"
                  fill="#059669"
                  radius={[6, 6, 0, 0]}
                  maxBarSize={38}
                />
                <Bar
                  dataKey="Kuota Terpesan"
                  fill="#FF9F1C"
                  radius={[6, 6, 0, 0]}
                  maxBarSize={38}
                />
                <Bar
                  dataKey="Cadangan Darurat"
                  fill="#FF5A5F"
                  radius={[6, 6, 0, 0]}
                  maxBarSize={38}
                />
              </BarChart>
            ) : (
              <AreaChart
                data={chartData}
                margin={{ top: 20, right: 25, left: 10, bottom: 25 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                <XAxis
                  dataKey="name"
                  tick={{ fill: '#475569', fontSize: 11, fontWeight: 700 }}
                  tickLine={false}
                  interval={0}
                />
                <YAxis
                  tick={{ fill: '#64748B', fontSize: 10 }}
                  tickFormatter={(val) => `${(val / 1000).toFixed(0)}k L`}
                  tickLine={false}
                />
                <Tooltip
                  content={({ active, payload, label }) => {
                    if (active && payload && payload.length) {
                      return (
                        <div className="bg-slate-900 text-white p-3.5 rounded-xl shadow-xl text-xs space-y-1.5 border border-slate-700 font-sans">
                          <p className="font-bold text-sm text-slate-100 border-b border-slate-800 pb-1">
                            {label}
                          </p>
                          {payload.map((entry, index) => (
                            <div
                              key={`tooltip-${index}`}
                              className="flex items-center justify-between gap-4 text-[11px]"
                            >
                              <span
                                className="font-medium"
                                style={{ color: entry.color }}
                              >
                                {entry.name}:
                              </span>
                              <span className="font-mono font-bold">
                                {Number(entry.value).toLocaleString('id-ID')} L
                              </span>
                            </div>
                          ))}
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Legend
                  wrapperStyle={{ fontSize: '11px', paddingTop: '12px' }}
                  iconType="circle"
                />
                <Area
                  type="monotone"
                  dataKey="Stok Aktual"
                  stroke="#059669"
                  fill="#059669"
                  fillOpacity={0.25}
                />
                <Area
                  type="monotone"
                  dataKey="Kuota Terpesan"
                  stroke="#FF9F1C"
                  fill="#FF9F1C"
                  fillOpacity={0.3}
                />
                <Area
                  type="monotone"
                  dataKey="Cadangan Darurat"
                  stroke="#FF5A5F"
                  fill="#FF5A5F"
                  fillOpacity={0.2}
                />
              </AreaChart>
            )}
          </ResponsiveContainer>
        </div>
      </div>

      {/* ===================================================================== */}
      {/* 2. Live REST API & Webhook Playground with API Key Generator          */}
      {/* ===================================================================== */}
      <div className="rounded-2xl bg-slate-950 border border-slate-800 p-6 sm:p-8 text-white shadow-xl space-y-6">
        {/* Playground Header */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-6 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-950 text-indigo-400 border border-indigo-800 flex items-center justify-center">
              <Code2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white leading-snug">
                REST API & Webhook Playground
              </h3>
              <p className="text-xs text-slate-400">
                Dokumentasi & Live Inspector Payload: Stations Telemetry, POS Verify, dan Depot Webhook
              </p>
            </div>
          </div>

          {/* API Key Simulation Generator */}
          <div className="flex items-center gap-3 bg-slate-900 p-2.5 rounded-xl border border-slate-800">
            <div className="flex items-center gap-2 text-xs font-mono">
              <Key className="w-3.5 h-3.5 text-amber-400" />
              <span className="text-slate-400">Key:</span>
              <span className="text-amber-300 font-bold max-w-[140px] truncate" title={liveApiKey}>
                {liveApiKey}
              </span>
            </div>

            <button
              type="button"
              onClick={handleGenerateApiKey}
              className="px-2.5 py-1 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-all flex items-center gap-1 shadow-xs"
              title="Generate API Key Baru"
            >
              <RefreshCw className="w-3 h-3" />
              <span>Generate Baru</span>
            </button>
          </div>
        </div>

        {keyGeneratedNotice && (
          <div className="p-3 rounded-xl bg-emerald-950/80 border border-emerald-700 text-emerald-300 text-xs font-bold flex items-center gap-2 animate-slide-in-up">
            <Check className="w-4 h-4 text-emerald-400" />
            <span>API Key Baru Berhasil Digenerate dan diaplikasikan ke header request!</span>
          </div>
        )}

        {/* 3 Endpoint Selector Tabs */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <button
            type="button"
            onClick={() => setActiveEndpoint('GET_BALI_STATIONS')}
            className={`p-3.5 rounded-xl border text-left transition-all ${
              activeEndpoint === 'GET_BALI_STATIONS'
                ? 'bg-slate-900 border-indigo-500 ring-2 ring-indigo-500/20'
                : 'bg-slate-900/60 border-slate-800 hover:bg-slate-900'
            }`}
          >
            <div className="flex items-center justify-between text-xs mb-1">
              <span className="font-mono text-[10px] font-bold text-emerald-400 bg-emerald-950 px-2 py-0.5 rounded">
                GET
              </span>
              <span className="text-[10px] text-slate-500 font-mono">200 OK</span>
            </div>
            <h4 className="font-bold text-xs text-white">/api/v1/bali/stations</h4>
            <p className="text-[11px] text-slate-400 mt-1 line-clamp-1">
              Query SPBU 9 kabupaten Bali
            </p>
          </button>

          <button
            type="button"
            onClick={() => setActiveEndpoint('POST_QUEUE_VERIFY')}
            className={`p-3.5 rounded-xl border text-left transition-all ${
              activeEndpoint === 'POST_QUEUE_VERIFY'
                ? 'bg-slate-900 border-indigo-500 ring-2 ring-indigo-500/20'
                : 'bg-slate-900/60 border-slate-800 hover:bg-slate-900'
            }`}
          >
            <div className="flex items-center justify-between text-xs mb-1">
              <span className="font-mono text-[10px] font-bold text-blue-400 bg-blue-950 px-2 py-0.5 rounded">
                POST
              </span>
              <span className="text-[10px] text-slate-500 font-mono">200 OK</span>
            </div>
            <h4 className="font-bold text-xs text-white">/api/v1/queue/verify</h4>
            <p className="text-[11px] text-slate-400 mt-1 line-clamp-1">
              Verifikasi kasir QR SHA-256
            </p>
          </button>

          <button
            type="button"
            onClick={() => setActiveEndpoint('POST_DEPOT_WEBHOOK')}
            className={`p-3.5 rounded-xl border text-left transition-all ${
              activeEndpoint === 'POST_DEPOT_WEBHOOK'
                ? 'bg-slate-900 border-indigo-500 ring-2 ring-indigo-500/20'
                : 'bg-slate-900/60 border-slate-800 hover:bg-slate-900'
            }`}
          >
            <div className="flex items-center justify-between text-xs mb-1">
              <span className="font-mono text-[10px] font-bold text-amber-400 bg-amber-950 px-2 py-0.5 rounded">
                POST
              </span>
              <span className="text-[10px] text-slate-500 font-mono">201 Created</span>
            </div>
            <h4 className="font-bold text-xs text-white">/api/v1/depot/webhook</h4>
            <p className="text-[11px] text-slate-400 mt-1 line-clamp-1">
              Auto-restock webhook &le;20%
            </p>
          </button>
        </div>

        {/* Selected Endpoint URL & Description */}
        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <span
                className={`text-xs font-mono font-bold px-2.5 py-0.5 rounded ${
                  endpointDetails.method === 'GET'
                    ? 'bg-emerald-500/20 text-emerald-400'
                    : 'bg-blue-500/20 text-blue-400'
                }`}
              >
                {endpointDetails.method}
              </span>
              <code className="text-xs sm:text-sm font-mono text-white font-semibold">
                {endpointDetails.url}
              </code>
            </div>

            <button
              type="button"
              onClick={() =>
                handleCopy(
                  JSON.stringify(
                    {
                      request: endpointDetails.request,
                      response: endpointDetails.response,
                    },
                    null,
                    2
                  )
                )
              }
              className="text-xs text-slate-400 hover:text-white flex items-center gap-1.5 bg-slate-800 px-3 py-1.5 rounded-lg border border-slate-700"
            >
              {copiedPayload ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-emerald-400 font-bold">Disalin</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Salin JSON</span>
                </>
              )}
            </button>
          </div>
          <p className="text-xs text-slate-400 leading-relaxed">
            {endpointDetails.description}
          </p>
        </div>

        {/* Request & Response Split Screen */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Left: Request Payload & Headers */}
          <div className="rounded-xl bg-slate-900/90 border border-slate-800 p-4 space-y-3">
            <div className="flex items-center justify-between text-xs font-bold text-slate-400 pb-2 border-b border-slate-800">
              <span>HTTP REQUEST HEADERS & BODY</span>
              <span className="font-mono text-[10px] text-slate-500">CLIENT</span>
            </div>

            <div className="space-y-1 font-mono text-[11px] text-slate-300">
              {Object.entries(endpointDetails.headers).map(([k, v]) => (
                <div key={k} className="flex gap-2">
                  <span className="text-indigo-400">{k}:</span>
                  <span className="text-slate-300 truncate">{v}</span>
                </div>
              ))}
            </div>

            {endpointDetails.request && (
              <div className="pt-2 border-t border-slate-800/80">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                  JSON Body:
                </span>
                <pre className="p-3 rounded-lg bg-black/60 text-emerald-400 text-[11px] font-mono overflow-x-auto max-h-52">
                  {JSON.stringify(endpointDetails.request, null, 2)}
                </pre>
              </div>
            )}
          </div>

          {/* Right: Response Payload */}
          <div className="rounded-xl bg-slate-900/90 border border-slate-800 p-4 space-y-3">
            <div className="flex items-center justify-between text-xs font-bold text-slate-400 pb-2 border-b border-slate-800">
              <span className="flex items-center gap-1.5">
                <Server className="w-3.5 h-3.5 text-emerald-400" />
                <span>HTTP RESPONSE ({endpointDetails.response.statusText})</span>
              </span>
              <span className="font-mono text-[10px] text-emerald-400 bg-emerald-950 px-2 py-0.5 rounded">
                {endpointDetails.response.latencyMs}ms
              </span>
            </div>

            <pre className="p-3 rounded-lg bg-black/60 text-sky-300 text-[11px] font-mono overflow-x-auto max-h-72">
              {JSON.stringify(endpointDetails.response.body, null, 2)}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
};
export default RestApiPlayground;
