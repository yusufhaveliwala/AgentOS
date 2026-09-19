import React, { useState, useEffect } from 'react';
import {
  BarChart3,
  Play,
  RotateCw,
  CheckCircle,
  XCircle,
  Sparkles,
  Zap,
  TrendingUp,
  Cpu,
  Layers,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react';
import { BenchmarkResult, ImprovementProposal } from '../types.js';

export const BenchmarkView: React.FC = () => {
  const [suites, setSuites] = useState<any[]>([]);
  const [results, setResults] = useState<BenchmarkResult[]>([]);
  const [proposals, setProposals] = useState<ImprovementProposal[]>([]);
  const [runningId, setRunningId] = useState<string | null>(null);
  const [isRunningAll, setIsRunningAll] = useState(false);

  useEffect(() => {
    fetchBenchmarksAndProposals();
  }, []);

  const fetchBenchmarksAndProposals = async () => {
    try {
      const [bmRes, propRes] = await Promise.all([fetch('/api/benchmarks'), fetch('/api/improvements')]);
      const bmData = await bmRes.json();
      const propData = await propRes.json();
      setSuites(bmData.suites || []);
      setResults(bmData.results || []);
      setProposals(propData || []);
    } catch (err) {
      console.error('Failed to load benchmarks:', err);
    }
  };

  const handleRunBenchmark = async (benchmarkId: string) => {
    setRunningId(benchmarkId);
    try {
      const res = await fetch('/api/benchmarks/run', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ benchmarkId }),
      });
      await res.json();
      await fetchBenchmarksAndProposals();
    } catch (err) {
      console.error('Benchmark failed:', err);
    } finally {
      setRunningId(null);
    }
  };

  const handleRunAll = async () => {
    setIsRunningAll(true);
    try {
      const res = await fetch('/api/benchmarks/run-all', {
        method: 'POST',
      });
      await res.json();
      await fetchBenchmarksAndProposals();
    } catch (err) {
      console.error('Run all benchmarks failed:', err);
    } finally {
      setIsRunningAll(false);
    }
  };

  const handleUpdateProposalStatus = async (proposalId: string, status: ImprovementProposal['status']) => {
    try {
      await fetch(`/api/improvements/${proposalId}/status`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      await fetchBenchmarksAndProposals();
    } catch (err) {
      console.error('Failed to update proposal:', err);
    }
  };

  // Aggregated Metrics
  const totalCompleted = results.filter((r) => r.status === 'PASSED').length;
  const avgCompletionRate =
    results.length > 0
      ? Math.round(results.reduce((acc, r) => acc + r.completionRate, 0) / results.length)
      : 0;
  const avgVerificationRate =
    results.length > 0
      ? Math.round(results.reduce((acc, r) => acc + r.verificationRate, 0) / results.length)
      : 0;
  const avgToolEfficiency =
    results.length > 0
      ? Math.round(results.reduce((acc, r) => acc + r.toolEfficiency, 0) / results.length)
      : 0;

  return (
    <div id="benchmark-view" className="space-y-6">
      {/* Top Header & Actions */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <BarChart3 className="w-5 h-5 text-indigo-400" />
            <h2 className="text-base font-bold text-white tracking-wide">Autonomous 10-Benchmark Suite</h2>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Standardized evaluation matrix measuring completion, empirical verification, error recovery, and efficiency.
          </p>
        </div>

        <button
          id="btn-run-all-benchmarks"
          onClick={handleRunAll}
          disabled={isRunningAll || runningId !== null}
          className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs shadow-md shadow-indigo-600/30 flex items-center space-x-2 transition-all disabled:opacity-50 shrink-0 self-start md:self-auto"
        >
          <RotateCw className={`w-3.5 h-3.5 ${isRunningAll ? 'animate-spin' : ''}`} />
          <span>{isRunningAll ? 'Executing 10-Suite Matrix...' : 'Run All 10 Benchmarks'}</span>
        </button>
      </div>

      {/* High-Level Scorecards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-sm">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
            Passed Benchmarks
          </span>
          <div className="flex items-baseline space-x-2 mt-2">
            <span className="text-2xl font-extrabold font-mono text-emerald-400">{totalCompleted}</span>
            <span className="text-xs text-slate-500 font-mono">/ {suites.length || 10}</span>
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-sm">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
            Avg Completion Rate
          </span>
          <div className="flex items-baseline space-x-2 mt-2">
            <span className="text-2xl font-extrabold font-mono text-indigo-400">{avgCompletionRate}%</span>
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-sm">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
            Avg Verification Rate
          </span>
          <div className="flex items-baseline space-x-2 mt-2">
            <span className="text-2xl font-extrabold font-mono text-teal-400">{avgVerificationRate}%</span>
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-sm">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
            Tool Efficiency Score
          </span>
          <div className="flex items-baseline space-x-2 mt-2">
            <span className="text-2xl font-extrabold font-mono text-amber-400">{avgToolEfficiency}%</span>
          </div>
        </div>
      </div>

      {/* 10 Standard Benchmark Suites */}
      <div className="space-y-3">
        <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">
          Standardized Benchmark Matrix
        </div>

        <div className="space-y-2">
          {suites.map((suite) => {
            const latestResult = results.find((r) => r.id === suite.id);
            const isRunning = runningId === suite.id;

            return (
              <div
                key={suite.id}
                className="p-4 rounded-xl bg-slate-900 border border-slate-800 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <span className="text-xs font-mono font-bold text-indigo-400">{suite.id.toUpperCase()}</span>
                    <span className="font-semibold text-sm text-slate-100">{suite.name}</span>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-400 font-mono">
                      {suite.category}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400">{suite.description}</p>
                </div>

                <div className="flex items-center space-x-4 shrink-0 self-end md:self-center">
                  {latestResult ? (
                    <div className="flex items-center space-x-3 text-xs font-mono">
                      <div className="text-right">
                        <span className="text-[10px] text-slate-500 block">Comp / Verif</span>
                        <span className="text-slate-300">
                          {latestResult.completionRate}% / {latestResult.verificationRate}%
                        </span>
                      </div>
                      <div className="text-right">
                        <span className="text-[10px] text-slate-500 block">Duration</span>
                        <span className="text-slate-300">{latestResult.durationMs}ms</span>
                      </div>
                      <span
                        className={`px-2.5 py-1 rounded text-[11px] font-bold uppercase ${
                          latestResult.status === 'PASSED'
                            ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                            : 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                        }`}
                      >
                        {latestResult.status}
                      </span>
                    </div>
                  ) : (
                    <span className="text-xs text-slate-500 italic">Not executed yet</span>
                  )}

                  <button
                    onClick={() => handleRunBenchmark(suite.id)}
                    disabled={isRunning || isRunningAll}
                    className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-indigo-400 hover:text-white transition-colors disabled:opacity-50"
                  >
                    <Play className={`w-3.5 h-3.5 fill-current ${isRunning ? 'animate-pulse' : ''}`} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Self-Improvement Engine & Proposals */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center space-x-2">
            <Sparkles className="w-4 h-4 text-amber-400" />
            <h3 className="text-sm font-bold text-white tracking-wide">
              Self-Improvement Proposals ({proposals.length})
            </h3>
          </div>
          <span className="text-[11px] text-slate-400">Autonomous post-execution synthesis</span>
        </div>

        {proposals.length === 0 ? (
          <p className="text-xs text-slate-500 italic py-4 text-center">
            Zero degradation detected. Continuous self-reflection generates optimization proposals when bottlenecks or retries occur.
          </p>
        ) : (
          <div className="space-y-3">
            {proposals.map((prop) => (
              <div
                key={prop.id}
                className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2 text-xs"
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-200 text-sm">{prop.problem}</span>
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                      prop.status === 'DEPLOYED'
                        ? 'bg-emerald-500/20 text-emerald-300'
                        : prop.status === 'APPROVED'
                        ? 'bg-indigo-500/20 text-indigo-300'
                        : 'bg-amber-500/20 text-amber-300'
                    }`}
                  >
                    {prop.status}
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1 text-slate-400">
                  <div>
                    <strong className="text-slate-300 block mb-0.5">Root Cause:</strong>
                    <span>{prop.rootCause}</span>
                  </div>
                  <div>
                    <strong className="text-indigo-400 block mb-0.5">Proposed Optimization:</strong>
                    <span>{prop.proposedImprovement}</span>
                  </div>
                </div>

                <div className="bg-slate-900 p-2.5 rounded border border-slate-800 font-mono text-[11px] text-emerald-400">
                  <strong>Sandbox Validation: </strong>
                  {prop.sandboxValidation}
                </div>

                {prop.status === 'PROPOSED' && (
                  <div className="pt-2 flex justify-end space-x-2">
                    <button
                      onClick={() => handleUpdateProposalStatus(prop.id, 'APPROVED')}
                      className="px-3 py-1 rounded bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-[11px]"
                    >
                      Approve Optimization
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
