// =============================================================================
// src/modules/depot-interconnect/components/RestApiPlayground.tsx — NusaFuel Grid
// Recharts Telemetry (Actual vs Booked vs Emergency) & Live REST API Inspector
// Demonstrates "Engineering Interconnected Web Solutions" per PRD §4.3 & §6.3
// =============================================================================

import React, { useState, useMemo } from 'react';
import { useStore } from '../../../app/store';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
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
  Database,
  Server,
} from 'lucide-react';

type FuelFilter = 'ALL' | 'Pertalite' | 'Pertamax' | 'Solar';
type ApiEndpointKey = 'WEBHOOK_DISPATCH' | 'BOOK_SLOT' | 'CASHIER_VERIFY' | 'SPBU_TELEMETRY';

export const RestApiPlayground: React.FC = () => {
  const { state } = useStore();
  const [selectedFuel, setSelectedFuel] = useState<FuelFilter>('Pertalite');
  const [activeEndpoint, setActiveEndpoint] = useState<ApiEndpointKey>('WEBHOOK_DISPATCH');
  const [copiedPayload, setCopiedPayload] = useState<boolean>(false);

  // Compute telemetry data for 4 SPBUs
  const chartData = useMemo(() => {
    return state.stations.map((spbu) => {
      const stationTanks = state.tanks.filter((t) => t.spbuId === spbu.id);
      const filteredTanks =
        selectedFuel === 'ALL'
          ? stationTanks
          : stationTanks.filter((t) => t.fuelType === selectedFuel);

      const actualLiters = filteredTanks.reduce((sum, t) => sum + t.currentLiters, 0);
      const bookedLiters = filteredTanks.reduce((sum, t) => sum + t.bookedLiters, 0);
      const emergencyLiters = filteredTanks.reduce(
        (sum, t) => sum + Math.round(t.maxCapacityLiters * 0.10),
        0
      );
      const capacityLiters = filteredTanks.reduce((sum, t) => sum + t.maxCapacityLiters, 0);

      // Shorten label for chart axis
      const shortName = spbu.name.replace('SPBU 54.811.', '').replace(' Singaraja', '');

      return {
        spbuCode: spbu.code,
        name: shortName,
        fullName: spbu.name,
        'Stok Aktual': actualLiters,
        'Kuota Terpesan': bookedLiters,
        'Cadangan Darurat': emergencyLiters,
        Kapasitas: capacityLiters,
      };
    });
  }, [state.stations, state.tanks, selectedFuel]);

  // Aggregate totals
  const totalStats = useMemo(() => {
    const totalActual = chartData.reduce((sum, d) => sum + d['Stok Aktual'], 0);
    const totalBooked = chartData.reduce((sum, d) => sum + d['Kuota Terpesan'], 0);
    const totalEmergency = chartData.reduce((sum, d) => sum + d['Cadangan Darurat'], 0);
    return { totalActual, totalBooked, totalEmergency };
  }, [chartData]);

  // Dynamic payload generation for the live inspector
  const endpointDetails = useMemo(() => {
    const latestTicket = state.tickets[0];
    const latestDispatch = state.dispatches[0];
    const latestStation = state.stations[0];
    const latestTanks = state.tanks.filter((t) => t.spbuId === latestStation?.id);

    switch (activeEndpoint) {
      case 'WEBHOOK_DISPATCH':
        return {
          method: 'POST',
          url: 'https://depot.pertamina.id/api/v1/orchestrator/dispatch',
          description:
            'Autonomous restock webhook diterbitkan otomatis saat ATG SPBU mendeteksi level tangki &le; 20%.',
          headers: {
            'Content-Type': 'application/json',
            'X-NusaFuel-Signature':
              'sha256=d3f2a8901c0b395d312bc85b1a7721e4832598687a1d5635848bb2',
            'X-Source-Station': latestStation?.code ?? '54.811.01',
          },
          request: state.lastWebhookPayload ?? {
            event: 'AUTO_RESTOCK_REQUEST',
            timestamp: new Date().toISOString(),
            spbuCode: latestStation?.code ?? '54.811.01',
            spbuName: latestStation?.name ?? 'SPBU 54.811.01 Gajah Mada Singaraja',
            fuelType: 'Pertalite',
            triggerFillPercent: 18.2,
            emergencyReserveLocked: true,
            requestedVolumeLiters: 8000,
            recommendedDepot: 'Depot Pertamina Manggis, Karangasem',
          },
          response: {
            status: 201,
            statusText: 'Created',
            latencyMs: 18,
            body: {
              success: true,
              dispatchId: latestDispatch?.id ?? 'ord-auto-restock-99',
              dispatchCode: latestDispatch?.dispatchCode ?? 'DO-DEPOT-20261020-001',
              assignedTankerPlate: 'DK 8821 BB',
              driverName: 'I Made Suardana',
              etaMinutes: latestDispatch?.etaMinutes ?? 45,
              routeSegment: 'Manggis -> Kintamani -> Singaraja (Gajah Mada)',
              telemetryState: 'DISPATCH_IN_PROGRESS',
            },
          },
        };

      case 'BOOK_SLOT':
        return {
          method: 'POST',
          url: 'https://nusafuel.bulelengkab.go.id/api/v1/queue/book-slot',
          description:
            'Portal Warga mengamankan kuota BBM dengan validasi aturan Ganjil-Genap dan verifikasi Anti-Ngangsu.',
          headers: {
            'Content-Type': 'application/json',
            'X-Forwarded-Client': 'Driver-PWA-v2.1',
          },
          request: latestTicket
            ? {
                spbuId: latestTicket.spbuId,
                plateNumber: latestTicket.plateNumber,
                vehicleType: latestTicket.vehicleType,
                fuelType: latestTicket.fuelType,
                requestedLiters: latestTicket.quotaLiters,
                timeSlot: latestTicket.slotWindowLabel,
                dateParity:
                  state.simulatedDateIsOdd === null
                    ? new Date().getDate() % 2 !== 0
                      ? 'ODD'
                      : 'EVEN'
                    : state.simulatedDateIsOdd
                    ? 'ODD'
                    : 'EVEN',
              }
            : {
                spbuId: 'spbu-gajah-mada',
                plateNumber: 'DK 4821 FB',
                vehicleType: 'MOBIL',
                fuelType: 'Pertalite',
                requestedLiters: 10,
                timeSlot: '08:00 - 08:30 WITA',
                dateParity:
                  state.simulatedDateIsOdd === null
                    ? new Date().getDate() % 2 !== 0
                      ? 'ODD'
                      : 'EVEN'
                    : state.simulatedDateIsOdd
                    ? 'ODD'
                    : 'EVEN',
              },
          response: {
            status: 200,
            statusText: 'OK',
            latencyMs: 24,
            body: {
              success: true,
              ticketCode: latestTicket?.ticketCode ?? 'NFG-20261020-7A39',
              qrHash:
                latestTicket?.qrHash ??
                'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
              allocatedLiters: latestTicket?.quotaLiters ?? 10,
              dynamicThrottlingActive: true,
              expiresAt: new Date(Date.now() + 1800000).toISOString(),
              antiHoardingCheck: 'PASSED (0 Prior Purchases Today)',
            },
          },
        };

      case 'CASHIER_VERIFY':
        return {
          method: 'POST',
          url: 'https://spbu-pos.nusafuel.id/api/v1/cashier/verify-ticket',
          description:
            'Kasir SPBU memindai QR Code tiket, memverifikasi keabsahan SHA-256, dan memotong stok liter aktual.',
          headers: {
            'Content-Type': 'application/json',
            'X-Operator-Id': 'OPR-SINGARAJA-01',
          },
          request: {
            scannedQrHash:
              latestTicket?.qrHash ??
              'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
            stationCode: latestStation?.code ?? '54.811.01',
            nozzleId: 'NOZZLE-PERTALITE-02',
            actualDispensedLiters: latestTicket?.quotaLiters ?? 10,
            cashierTimestamp: new Date().toISOString(),
          },
          response: {
            status: 200,
            statusText: 'OK',
            latencyMs: 14,
            body: {
              success: true,
              redemptionStatus: 'COMPLETED',
              plateVerified: latestTicket?.plateNumber ?? 'DK 4821 FB',
              tankStockDeducted: true,
              remainingTankLiters: 3450,
              auditEventId: 'AUD-VERIFY-8821',
            },
          },
        };

      case 'SPBU_TELEMETRY':
        return {
          method: 'GET',
          url: `https://iot.nusafuel.id/api/v1/stations/${latestStation?.code ?? '54.811.01'}/probe`,
          description:
            'Sinkronisasi real-time probe ATG (Automatic Tank Gauge) ke platform regional dan dasbor depot.',
          headers: {
            Accept: 'application/json',
            'X-API-Key': 'pk_live_bu1e1eng_nusa_fue1_gr1d_2026',
          },
          request: null,
          response: {
            status: 200,
            statusText: 'OK',
            latencyMs: 11,
            body: {
              stationCode: latestStation?.code ?? '54.811.01',
              operationalMode: latestStation?.operationalMode ?? 'NORMAL',
              probeTimestamp: new Date().toISOString(),
              tanks: latestTanks.map((t) => ({
                fuel: t.fuelType,
                currentLiters: t.currentLiters,
                maxCapacityLiters: t.maxCapacityLiters,
                fillPercentage: Math.round((t.currentLiters / t.maxCapacityLiters) * 100),
                bookedLiters: t.bookedLiters,
                emergencyReserveLocked: Math.round(t.maxCapacityLiters * 0.10),
                burnRateLpm: t.burnRateLpm,
              })),
            },
          },
        };
    }
  }, [activeEndpoint, state]);

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedPayload(true);
    setTimeout(() => setCopiedPayload(false), 2000);
  };

  return (
    <div className="space-y-8">
      {/* 1. Fuel Telemetry Chart Card */}
      <div className="rounded-2xl bg-white border border-[#E6E8EC] p-6 sm:p-8 shadow-sm">
        {/* Section Header */}
        <div className="flex flex-wrap items-center justify-between gap-4 pb-6 border-b border-slate-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-50 text-cyan-600 flex items-center justify-center">
              <Activity className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900 leading-snug">
                Grafik Telemetri Stok Bahan Bakar — 4 SPBU Buleleng
              </h3>
              <p className="text-xs text-slate-500">
                Visualisasi perbandingan Stok Aktual, Kuota Terpesan (Booked), dan Cadangan Darurat (10%)
              </p>
            </div>
          </div>

          {/* Fuel Filter Pills */}
          <div className="flex items-center bg-slate-100 p-1 rounded-xl text-xs font-semibold">
            {(['Pertalite', 'Pertamax', 'Solar', 'ALL'] as FuelFilter[]).map((fuel) => (
              <button
                key={fuel}
                type="button"
                onClick={() => setSelectedFuel(fuel)}
                className={`px-3 py-1.5 rounded-lg transition-all ${
                  selectedFuel === fuel
                    ? 'bg-white text-slate-900 shadow-xs font-bold'
                    : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                {fuel === 'ALL' ? 'Semua BBM' : fuel}
              </button>
            ))}
          </div>
        </div>

        {/* Aggregate KPI Strip */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 my-6">
          <div className="p-4 rounded-xl bg-sky-50/70 border border-sky-100 flex items-center justify-between">
            <div>
              <span className="text-[11px] font-bold text-sky-800 uppercase tracking-wider block">
                Total Stok Aktual
              </span>
              <span className="text-xl sm:text-2xl font-mono font-bold text-sky-950">
                {totalStats.totalActual.toLocaleString('id-ID')} L
              </span>
            </div>
            <div className="w-3 h-3 rounded-full bg-[#00A8E8]" />
          </div>

          <div className="p-4 rounded-xl bg-amber-50/70 border border-amber-100 flex items-center justify-between">
            <div>
              <span className="text-[11px] font-bold text-amber-800 uppercase tracking-wider block">
                Total Kuota Terpesan
              </span>
              <span className="text-xl sm:text-2xl font-mono font-bold text-amber-950">
                {totalStats.totalBooked.toLocaleString('id-ID')} L
              </span>
            </div>
            <div className="w-3 h-3 rounded-full bg-[#FF9F1C]" />
          </div>

          <div className="p-4 rounded-xl bg-rose-50/70 border border-rose-100 flex items-center justify-between">
            <div>
              <span className="text-[11px] font-bold text-rose-800 uppercase tracking-wider block">
                Cadangan Darurat Terkunci
              </span>
              <span className="text-xl sm:text-2xl font-mono font-bold text-rose-950">
                {totalStats.totalEmergency.toLocaleString('id-ID')} L
              </span>
            </div>
            <div className="w-3 h-3 rounded-full bg-[#FF5A5F]" />
          </div>
        </div>

        {/* Recharts Bar Chart Container */}
        <div className="h-80 w-full mt-4">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={chartData}
              margin={{ top: 20, right: 30, left: 10, bottom: 10 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
              <XAxis
                dataKey="name"
                tick={{ fill: '#64748B', fontSize: 11, fontWeight: 600 }}
                tickLine={false}
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
                      <div className="bg-slate-900 text-white p-3.5 rounded-xl shadow-xl text-xs space-y-1.5 border border-slate-700">
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
                wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }}
                iconType="circle"
              />
              <Bar
                dataKey="Stok Aktual"
                fill="#00A8E8"
                radius={[6, 6, 0, 0]}
                maxBarSize={45}
              />
              <Bar
                dataKey="Kuota Terpesan"
                fill="#FF9F1C"
                radius={[6, 6, 0, 0]}
                maxBarSize={45}
              />
              <Bar
                dataKey="Cadangan Darurat"
                fill="#FF5A5F"
                radius={[6, 6, 0, 0]}
                maxBarSize={45}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* 2. Live REST API & Webhook Payload Inspector */}
      <div className="rounded-2xl bg-slate-950 border border-slate-800 p-6 sm:p-8 text-white shadow-xl">
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-4 pb-6 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-950 text-indigo-400 border border-indigo-800 flex items-center justify-center">
              <Code2 className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-bold text-white leading-snug">
                  Live REST API & Autonomous Webhook Payload Inspector
                </h3>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-800">
                  INTERCONNECTED ENGINE
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Inspeksi pertukaran data waktu-nyata antara Portal Warga, Terminal POS Kasir, dan ERP Depot Pertamina
              </p>
            </div>
          </div>

          {/* Copy Button */}
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
            className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 flex items-center gap-1.5 transition-all active:scale-95"
          >
            {copiedPayload ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-emerald-400">Tersalin!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>Salin Payload JSON</span>
              </>
            )}
          </button>
        </div>

        {/* Endpoint Selector Tabs */}
        <div className="flex flex-wrap gap-2 my-5">
          {[
            {
              key: 'WEBHOOK_DISPATCH',
              label: '1. Webhook Restock Tangki',
              method: 'POST',
            },
            {
              key: 'BOOK_SLOT',
              label: '2. Booking Tiket & Lock Kuota',
              method: 'POST',
            },
            {
              key: 'CASHIER_VERIFY',
              label: '3. Verifikasi QR & Redeem Kasir',
              method: 'POST',
            },
            {
              key: 'SPBU_TELEMETRY',
              label: '4. IoT Tank Probe Telemetry',
              method: 'GET',
            },
          ].map((item) => (
            <button
              key={item.key}
              type="button"
              onClick={() => setActiveEndpoint(item.key as ApiEndpointKey)}
              className={`text-xs font-semibold px-3.5 py-2 rounded-xl transition-all flex items-center gap-2 border ${
                activeEndpoint === item.key
                  ? 'bg-slate-800 text-white border-slate-600 shadow-sm'
                  : 'bg-slate-900/60 text-slate-400 border-slate-800 hover:bg-slate-800/60 hover:text-slate-200'
              }`}
            >
              <span
                className={`text-[9px] font-mono font-bold px-1.5 py-0.5 rounded ${
                  item.method === 'POST'
                    ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                    : 'bg-blue-950 text-blue-400 border border-blue-800'
                }`}
              >
                {item.method}
              </span>
              <span>{item.label}</span>
            </button>
          ))}
        </div>

        {/* Endpoint URL & Description */}
        <div className="bg-slate-900/90 rounded-xl p-4 border border-slate-800 mb-6 flex flex-wrap items-center justify-between gap-3 text-xs font-mono">
          <div className="flex items-center gap-2">
            <span
              className={`font-bold px-2 py-0.5 rounded text-[10px] ${
                endpointDetails.method === 'POST'
                  ? 'bg-emerald-500 text-slate-950'
                  : 'bg-blue-500 text-slate-950'
              }`}
            >
              {endpointDetails.method}
            </span>
            <span className="text-slate-200 truncate">{endpointDetails.url}</span>
          </div>
          <span className="text-slate-400 font-sans text-[11px]">
            {endpointDetails.description}
          </span>
        </div>

        {/* Request & Response Split Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left: HTTP Headers & Request Body */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <Server className="w-3.5 h-3.5 text-blue-400" />
                <span>Request Headers & Payload</span>
              </span>
              <span className="text-[10px] font-mono text-slate-500">JSON</span>
            </div>

            {/* Headers Box */}
            <div className="bg-black/40 rounded-xl p-3 border border-slate-800 text-[10px] font-mono space-y-1 text-slate-400">
              {Object.entries(endpointDetails.headers).map(([k, v]) => (
                <div key={k} className="flex gap-2">
                  <span className="text-slate-500">{k}:</span>
                  <span className="text-slate-300 truncate">{v}</span>
                </div>
              ))}
            </div>

            {/* Request JSON */}
            <div className="bg-black/60 rounded-xl p-4 border border-slate-800 font-mono text-[11px] overflow-x-auto max-h-72">
              <pre className="text-sky-300">
                {endpointDetails.request
                  ? JSON.stringify(endpointDetails.request, null, 2)
                  : '// No request body required for GET request'}
              </pre>
            </div>
          </div>

          {/* Right: HTTP Response Status & Body */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <Database className="w-3.5 h-3.5 text-emerald-400" />
                <span>Server Response</span>
              </span>
              <div className="flex items-center gap-2 font-mono text-[10px]">
                <span className="text-emerald-400 bg-emerald-950 px-2 py-0.5 rounded border border-emerald-800 font-bold">
                  HTTP {endpointDetails.response.status} {endpointDetails.response.statusText}
                </span>
                <span className="text-slate-500">
                  {endpointDetails.response.latencyMs}ms
                </span>
              </div>
            </div>

            {/* Response JSON */}
            <div className="bg-black/60 rounded-xl p-4 border border-slate-800 font-mono text-[11px] overflow-x-auto max-h-[352px]">
              <pre className="text-emerald-300">
                {JSON.stringify(endpointDetails.response.body, null, 2)}
              </pre>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
export default RestApiPlayground;
