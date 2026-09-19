import React from 'react';
import {
  Cpu,
  Activity,
  Layers,
  Wrench,
  Database,
  BarChart3,
  FileText,
  ShieldAlert,
  Sparkles,
  MessageSquare,
} from 'lucide-react';
import { AgentRun } from '../types.js';

interface HeaderProps {
  activeTab: 'studio' | 'graph' | 'tools' | 'memory' | 'benchmarks' | 'audit' | 'prompt' | 'ask-ai';
  setActiveTab: (tab: 'studio' | 'graph' | 'tools' | 'memory' | 'benchmarks' | 'audit' | 'prompt' | 'ask-ai') => void;
  activeRun: AgentRun | null;
  runs: AgentRun[];
  onSelectRun: (runId: string) => void;
  pendingApprovalsCount: number;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  activeRun,
  runs,
  onSelectRun,
  pendingApprovalsCount,
}) => {
  return (
    <header id="agentos-header" className="bg-slate-900 border-b border-slate-800 text-white sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Brand */}
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-lg bg-indigo-600/20 border border-indigo-500/40 flex items-center justify-center text-indigo-400">
              <Cpu className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-extrabold tracking-tight text-lg font-mono text-white">AgentOS</span>
                <span className="text-[10px] uppercase font-bold tracking-widest px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-400 border border-indigo-500/30">
                  v2.4 Production Core
                </span>
              </div>
              <p className="text-xs text-slate-400 hidden sm:block">Autonomous Agentic AI Operating System</p>
            </div>
          </div>

          {/* Navigation Tabs */}
          <nav className="hidden md:flex items-center space-x-1 bg-slate-950/60 p-1 rounded-xl border border-slate-800">
            <button
              id="nav-tab-studio"
              onClick={() => setActiveTab('studio')}
              className={`flex items-center space-x-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                activeTab === 'studio'
                  ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-500/30'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              <Activity className="w-3.5 h-3.5" />
              <span>Agent Studio</span>
            </button>

            <button
              id="nav-tab-graph"
              onClick={() => setActiveTab('graph')}
              className={`flex items-center space-x-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                activeTab === 'graph'
                  ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-500/30'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Task Graph</span>
            </button>

            <button
              id="nav-tab-tools"
              onClick={() => setActiveTab('tools')}
              className={`flex items-center space-x-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                activeTab === 'tools'
                  ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-500/30'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              <Wrench className="w-3.5 h-3.5" />
              <span>Tools</span>
            </button>

            <button
              id="nav-tab-memory"
              onClick={() => setActiveTab('memory')}
              className={`flex items-center space-x-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                activeTab === 'memory'
                  ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-500/30'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              <Database className="w-3.5 h-3.5" />
              <span>Memory</span>
            </button>

            <button
              id="nav-tab-benchmarks"
              onClick={() => setActiveTab('benchmarks')}
              className={`flex items-center space-x-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                activeTab === 'benchmarks'
                  ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-500/30'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              <BarChart3 className="w-3.5 h-3.5" />
              <span>Benchmarks</span>
            </button>

            <button
              id="nav-tab-audit"
              onClick={() => setActiveTab('audit')}
              className={`flex items-center space-x-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                activeTab === 'audit'
                  ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-500/30'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Audit Logs</span>
            </button>

            <button
              id="nav-tab-prompt"
              onClick={() => setActiveTab('prompt')}
              className={`flex items-center space-x-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                activeTab === 'prompt'
                  ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-500/30'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
              <span>AI Prompt</span>
            </button>

            <button
              id="nav-tab-ask-ai"
              onClick={() => setActiveTab('ask-ai')}
              className={`flex items-center space-x-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                activeTab === 'ask-ai'
                  ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-500/30'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              <MessageSquare className="w-3.5 h-3.5 text-indigo-400" />
              <span>Ask AI</span>
            </button>
          </nav>

          {/* Right Status & Controls */}
          <div className="flex items-center space-x-3">
            {/* Pending Approvals Badge */}
            {pendingApprovalsCount > 0 && (
              <div
                id="header-approval-pill"
                onClick={() => setActiveTab('studio')}
                className="cursor-pointer flex items-center space-x-1.5 px-2.5 py-1 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-300 text-xs font-semibold animate-pulse"
              >
                <ShieldAlert className="w-3.5 h-3.5 text-amber-400" />
                <span>{pendingApprovalsCount} Approval Needed</span>
              </div>
            )}

            {/* Run Selector */}
            {runs.length > 0 && (
              <select
                id="header-run-selector"
                value={activeRun?.id || ''}
                onChange={(e) => onSelectRun(e.target.value)}
                className="bg-slate-950 border border-slate-700 text-xs text-slate-200 rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-indigo-500 max-w-[140px] sm:max-w-[200px] truncate"
              >
                {runs.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.id.slice(-6)} - {r.goal.slice(0, 20)}...
                  </option>
                ))}
              </select>
            )}

            <div className="hidden lg:flex items-center space-x-2 pl-2 border-l border-slate-800 text-xs text-slate-400">
              <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_8px_#34d399]"></span>
              <span className="font-mono">Engine Online</span>
            </div>
          </div>
        </div>

        {/* Mobile Sub-Navigation Bar */}
        <div className="md:hidden flex items-center space-x-1 overflow-x-auto py-2 border-t border-slate-800/80 no-scrollbar">
          {(['studio', 'graph', 'tools', 'memory', 'benchmarks', 'audit', 'prompt', 'ask-ai'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-3 py-1 rounded-md text-xs whitespace-nowrap font-medium transition-colors ${
                activeTab === tab
                  ? 'bg-indigo-600 text-white font-bold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {tab === 'ask-ai' ? 'ASK AI' : tab.toUpperCase()}
            </button>
          ))}
        </div>
      </div>
    </header>
  );
};
