import React, { useState, useEffect } from 'react';
import {
  FileText,
  Search,
  Filter,
  Terminal,
  AlertTriangle,
  Flame,
  ShieldAlert,
  Clock,
  ArrowDownCircle,
} from 'lucide-react';
import { AgentRun } from '../types.js';

interface AuditLogsViewProps {
  activeRun: AgentRun | null;
}

export const AuditLogsView: React.FC<AuditLogsViewProps> = ({ activeRun }) => {
  const [logs, setLogs] = useState<any[]>([]);
  const [filterType, setFilterType] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [autoScroll, setAutoScroll] = useState(true);

  useEffect(() => {
    if (!activeRun) return;

    const fetchLogs = async () => {
      try {
        const res = await fetch(`/api/agent/runs/${activeRun.id}/logs`);
        const data = await res.json();
        setLogs(data);
      } catch (err) {
        console.error('Failed to fetch logs:', err);
      }
    };

    fetchLogs();
    const interval = setInterval(fetchLogs, 1500);
    return () => clearInterval(interval);
  }, [activeRun?.id]);

  const filteredLogs = logs.filter((log) => {
    const matchesType = filterType === 'ALL' || log.type === filterType;
    const matchesSearch =
      !searchQuery.trim() ||
      log.details?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.tool?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.agent?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesType && matchesSearch;
  });

  return (
    <div id="audit-logs-view" className="space-y-6">
      {/* Top Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <FileText className="w-5 h-5 text-indigo-400" />
            <h2 className="text-base font-bold text-white tracking-wide">Structured Audit & Event Feed</h2>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Immutable operational logs, tool invocation payloads, error diagnostics, and self-reflection records.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-500" />
            <input
              type="text"
              placeholder="Filter logs..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500 w-40 sm:w-56"
            />
          </div>

          <label className="flex items-center space-x-1.5 text-xs text-slate-400 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={autoScroll}
              onChange={(e) => setAutoScroll(e.target.checked)}
              className="rounded bg-slate-950 border-slate-700 text-indigo-600 focus:ring-0"
            />
            <span>Auto-refresh</span>
          </label>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center space-x-1 overflow-x-auto pb-1 text-xs">
        {['ALL', 'TOOL_CALL', 'OBSERVATION', 'ERROR', 'REFLECTION'].map((type) => (
          <button
            key={type}
            onClick={() => setFilterType(type)}
            className={`px-3 py-1.5 rounded-xl font-mono font-semibold transition-all ${
              filterType === type
                ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-600/30'
                : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-200'
            }`}
          >
            {type}
          </button>
        ))}
      </div>

      {/* Logs Console Stream */}
      <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 font-mono text-xs overflow-y-auto max-h-[600px] shadow-inner space-y-2">
        {filteredLogs.length === 0 ? (
          <div className="p-8 text-center text-slate-600 italic">
            No audit records matching criteria. Logs stream live during autonomous agent runs.
          </div>
        ) : (
          filteredLogs.map((log, idx) => (
            <div
              key={idx}
              className={`p-3 rounded-lg border flex items-start space-x-3 leading-relaxed transition-colors ${
                log.type === 'ERROR'
                  ? 'bg-rose-950/20 border-rose-500/30 text-rose-300'
                  : log.type === 'TOOL_CALL'
                  ? 'bg-slate-900/80 border-slate-800/80 text-slate-200'
                  : log.type === 'REFLECTION'
                  ? 'bg-indigo-950/20 border-indigo-500/30 text-indigo-300'
                  : 'bg-slate-900/40 border-slate-800/40 text-slate-300'
              }`}
            >
              <div className="shrink-0 mt-0.5">
                {log.type === 'ERROR' && <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />}
                {log.type === 'TOOL_CALL' && <Terminal className="w-3.5 h-3.5 text-indigo-400" />}
                {log.type === 'REFLECTION' && <Flame className="w-3.5 h-3.5 text-amber-400" />}
                {log.type === 'OBSERVATION' && <Clock className="w-3.5 h-3.5 text-slate-500" />}
              </div>

              <div className="space-y-1 overflow-x-auto w-full">
                <div className="flex items-center space-x-2 text-[10px] text-slate-500">
                  <span>{new Date(log.timestamp).toLocaleTimeString()}</span>
                  <span className="px-1.5 py-0.2 rounded bg-slate-800 text-slate-400 font-bold uppercase">
                    {log.type}
                  </span>
                  {log.agent && <span className="text-indigo-400 font-semibold">{log.agent}</span>}
                  {log.tool && <span className="text-emerald-400 font-semibold">[{log.tool}]</span>}
                </div>

                <div className="text-[11px] text-slate-300 whitespace-pre-wrap">{log.details}</div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
