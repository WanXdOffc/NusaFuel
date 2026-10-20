// =============================================================================
// src/modules/depot-interconnect/components/SecurityAuditTable.tsx — NusaFuel Grid
// Cybersecurity & Immutable Audit Trail Log Table per PRD §4.3 & §6.3
// Features real-time filtering, search, severity badges, and metadata inspection
// =============================================================================

import React, { useState, useMemo } from 'react';
import { useStore } from '../../../app/store';
import type { LogSeverity, ActorRole } from '../../../core/data/bulelengSpbuSeed';
import {
  ShieldAlert,
  Search,
  Filter,
  AlertTriangle,
  Info,
  Download,
  ChevronDown,
  ChevronUp,
  FileCode,
  CheckCircle2,
} from 'lucide-react';

export const SecurityAuditTable: React.FC = () => {
  const { state } = useStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [severityFilter, setSeverityFilter] = useState<'ALL' | LogSeverity>('ALL');
  const [actorFilter, setActorFilter] = useState<'ALL' | ActorRole>('ALL');
  const [expandedLogId, setExpandedLogId] = useState<string | null>(null);
  const [copiedNotification, setCopiedNotification] = useState<string | null>(null);

  // Filter logs dynamically
  const filteredLogs = useMemo(() => {
    return state.auditLogs.filter((log) => {
      // Severity check
      if (severityFilter !== 'ALL' && log.severity !== severityFilter) {
        return false;
      }
      // Actor check
      if (actorFilter !== 'ALL' && log.actorRole !== actorFilter) {
        return false;
      }
      // Search query check
      if (searchQuery.trim() !== '') {
        const query = searchQuery.toLowerCase();
        const matchesMsg = log.message.toLowerCase().includes(query);
        const matchesEvent = log.eventType.toLowerCase().includes(query);
        const matchesSpbu = log.spbuCode.toLowerCase().includes(query);
        const matchesRef = log.referenceId.toLowerCase().includes(query);
        const matchesActor = log.actorRole.toLowerCase().includes(query);
        return matchesMsg || matchesEvent || matchesSpbu || matchesRef || matchesActor;
      }
      return true;
    });
  }, [state.auditLogs, severityFilter, actorFilter, searchQuery]);

  // Counts by severity
  const counts = useMemo(() => {
    const total = state.auditLogs.length;
    const critical = state.auditLogs.filter((l) => l.severity === 'CRITICAL').length;
    const warning = state.auditLogs.filter((l) => l.severity === 'WARNING').length;
    const info = state.auditLogs.filter((l) => l.severity === 'INFO').length;
    return { total, critical, warning, info };
  }, [state.auditLogs]);

  const toggleExpand = (id: string) => {
    setExpandedLogId(expandedLogId === id ? null : id);
  };

  const handleExportJson = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(filteredLogs, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `nusafuel-audit-logs-${Date.now()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();

    setCopiedNotification('Berhasil mengekspor riwayat audit log (JSON).');
    setTimeout(() => setCopiedNotification(null), 3500);
  };

  return (
    <div className="rounded-2xl bg-white border border-[#E6E8EC] p-6 sm:p-8 shadow-sm space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-6 border-b border-slate-200">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-slate-900 text-white flex items-center justify-center">
            <ShieldAlert className="w-5 h-5 text-[#FF5A5F]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-bold text-slate-900 leading-snug">
                Buku Log Keamanan Siber & Audit Trail Kriptografis
              </h3>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-bold border border-slate-200">
                IMMUTABLE AUDIT TRAIL
              </span>
            </div>
            <p className="text-xs text-slate-500">
              Mencatat seluruh mutasi kuota, verifikasi QR kasir, pemblokiran oknum penimbun, dan trigger webhook
            </p>
          </div>
        </div>

        {/* Export Button */}
        <button
          type="button"
          onClick={handleExportJson}
          className="text-xs font-bold px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-300 flex items-center gap-2 transition-all active:scale-95 shadow-2xs"
        >
          <Download className="w-4 h-4 text-slate-600" />
          <span>Ekspor Log (JSON)</span>
        </button>
      </div>

      {/* Notification Toast */}
      {copiedNotification && (
        <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>{copiedNotification}</span>
        </div>
      )}

      {/* KPI Counters Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <button
          type="button"
          onClick={() => setSeverityFilter('ALL')}
          className={`p-3 rounded-xl border text-left transition-all ${
            severityFilter === 'ALL'
              ? 'bg-slate-900 text-white border-slate-900 shadow-sm'
              : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
          }`}
        >
          <span className="text-[10px] font-bold uppercase tracking-wider block opacity-80">
            Total Aktivitas
          </span>
          <span className="text-lg sm:text-xl font-mono font-bold">{counts.total}</span>
        </button>

        <button
          type="button"
          onClick={() => setSeverityFilter('CRITICAL')}
          className={`p-3 rounded-xl border text-left transition-all ${
            severityFilter === 'CRITICAL'
              ? 'bg-rose-600 text-white border-rose-600 shadow-sm'
              : 'bg-rose-50/60 text-rose-900 border-rose-200 hover:bg-rose-100/60'
          }`}
        >
          <span className="text-[10px] font-bold uppercase tracking-wider block opacity-90 flex items-center gap-1">
            <ShieldAlert className="w-3 h-3" />
            <span>Kritis (Critical)</span>
          </span>
          <span className="text-lg sm:text-xl font-mono font-bold">{counts.critical}</span>
        </button>

        <button
          type="button"
          onClick={() => setSeverityFilter('WARNING')}
          className={`p-3 rounded-xl border text-left transition-all ${
            severityFilter === 'WARNING'
              ? 'bg-amber-500 text-slate-950 border-amber-500 shadow-sm'
              : 'bg-amber-50/60 text-amber-900 border-amber-200 hover:bg-amber-100/60'
          }`}
        >
          <span className="text-[10px] font-bold uppercase tracking-wider block opacity-90 flex items-center gap-1">
            <AlertTriangle className="w-3 h-3" />
            <span>Peringatan (Warning)</span>
          </span>
          <span className="text-lg sm:text-xl font-mono font-bold">{counts.warning}</span>
        </button>

        <button
          type="button"
          onClick={() => setSeverityFilter('INFO')}
          className={`p-3 rounded-xl border text-left transition-all ${
            severityFilter === 'INFO'
              ? 'bg-sky-600 text-white border-sky-600 shadow-sm'
              : 'bg-sky-50/60 text-sky-900 border-sky-200 hover:bg-sky-100/60'
          }`}
        >
          <span className="text-[10px] font-bold uppercase tracking-wider block opacity-90 flex items-center gap-1">
            <Info className="w-3 h-3" />
            <span>Informasi (Info)</span>
          </span>
          <span className="text-lg sm:text-xl font-mono font-bold">{counts.info}</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-50 p-3 rounded-xl border border-slate-200">
        {/* Search */}
        <div className="relative flex-1 min-w-[220px]">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari plat nomor, event, kode SPBU, atau pesan..."
            className="w-full pl-9 pr-3 py-1.5 rounded-lg border border-slate-300 text-xs bg-white focus:outline-none focus:ring-2 focus:ring-[#FF5A5F]"
          />
        </div>

        {/* Actor Role Filter */}
        <div className="flex items-center gap-2">
          <Filter className="w-3.5 h-3.5 text-slate-400" />
          <select
            value={actorFilter}
            onChange={(e) => setActorFilter(e.target.value as 'ALL' | ActorRole)}
            className="text-xs font-semibold px-2.5 py-1.5 rounded-lg border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-[#FF5A5F]"
          >
            <option value="ALL">Semua Aktor</option>
            <option value="PUBLIC_DRIVER">Warga (Driver)</option>
            <option value="SPBU_OPERATOR">Operator SPBU</option>
            <option value="DEPOT_SYSTEM">Sistem Depot</option>
            <option value="SECURITY_GUARD">Security Guard</option>
          </select>
        </div>
      </div>

      {/* Table Container */}
      <div className="overflow-x-auto border border-slate-200 rounded-xl">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase text-[10px] tracking-wider">
              <th className="py-3 px-4">Waktu</th>
              <th className="py-3 px-4">Tingkat</th>
              <th className="py-3 px-4">Aktor</th>
              <th className="py-3 px-4">Tipe Event</th>
              <th className="py-3 px-4">SPBU</th>
              <th className="py-3 px-4">Pesan & Keterangan</th>
              <th className="py-3 px-4 text-right">Detail</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredLogs.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-8 text-center text-slate-400">
                  Tidak ada catatan audit log yang cocok dengan filter.
                </td>
              </tr>
            ) : (
              filteredLogs.map((log) => {
                const isExpanded = expandedLogId === log.id;
                const formattedTime = new Date(log.timestamp).toLocaleTimeString('id-ID', {
                  hour: '2-digit',
                  minute: '2-digit',
                  second: '2-digit',
                });

                return (
                  <React.Fragment key={log.id}>
                    <tr
                      className={`hover:bg-slate-50/80 transition-colors ${
                        isExpanded ? 'bg-slate-50' : ''
                      }`}
                    >
                      {/* Timestamp */}
                      <td className="py-3 px-4 font-mono text-[11px] text-slate-600 whitespace-nowrap">
                        {formattedTime}
                      </td>

                      {/* Severity */}
                      <td className="py-3 px-4">
                        <span
                          className={`badge text-[9px] py-0.5 px-2 font-mono font-bold ${
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

                      {/* Actor */}
                      <td className="py-3 px-4 font-semibold text-slate-800 text-[11px] whitespace-nowrap">
                        {log.actorRole === 'PUBLIC_DRIVER'
                          ? 'Warga (Driver)'
                          : log.actorRole === 'SPBU_OPERATOR'
                          ? 'Operator SPBU'
                          : log.actorRole === 'DEPOT_SYSTEM'
                          ? 'Sistem Depot'
                          : 'Security Guard'}
                      </td>

                      {/* Event Type */}
                      <td className="py-3 px-4">
                        <span className="font-mono text-[10px] font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                          {log.eventType}
                        </span>
                      </td>

                      {/* SPBU Code */}
                      <td className="py-3 px-4 font-mono text-slate-500 text-[11px]">
                        {log.spbuCode}
                      </td>

                      {/* Message */}
                      <td className="py-3 px-4 text-slate-700 max-w-sm truncate text-[11px]" title={log.message}>
                        {log.message}
                      </td>

                      {/* Detail Expand Trigger */}
                      <td className="py-3 px-4 text-right">
                        <button
                          type="button"
                          onClick={() => toggleExpand(log.id)}
                          className="text-[11px] text-slate-500 hover:text-slate-900 font-semibold inline-flex items-center gap-1 p-1 rounded hover:bg-slate-200/60"
                        >
                          <span>{isExpanded ? 'Tutup' : 'Inspeksi'}</span>
                          {isExpanded ? (
                            <ChevronUp className="w-3.5 h-3.5" />
                          ) : (
                            <ChevronDown className="w-3.5 h-3.5" />
                          )}
                        </button>
                      </td>
                    </tr>

                    {/* Expanded Detail Row */}
                    {isExpanded && (
                      <tr className="bg-slate-900 text-white">
                        <td colSpan={7} className="p-4">
                          <div className="space-y-3 font-mono text-[11px]">
                            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-2">
                              <div className="flex items-center gap-2">
                                <FileCode className="w-4 h-4 text-sky-400" />
                                <span className="font-bold text-slate-200">
                                  Audit Payload & Reference Hash: {log.referenceId}
                                </span>
                              </div>
                              <span className="text-[10px] text-slate-400">
                                Log ID: {log.id}
                              </span>
                            </div>

                            <p className="font-sans text-xs text-slate-300">
                              <strong className="text-white">Deskripsi Lengkap:</strong> {log.message}
                            </p>

                            {log.metadataJson ? (
                              <div className="bg-black/60 p-3 rounded-lg border border-slate-800 text-emerald-300 overflow-x-auto max-h-48">
                                <pre>{log.metadataJson}</pre>
                              </div>
                            ) : (
                              <p className="text-[10px] text-slate-500 italic">
                                Tidak ada metadata tambahan yang dicatat untuk event ini.
                              </p>
                            )}
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
export default SecurityAuditTable;
