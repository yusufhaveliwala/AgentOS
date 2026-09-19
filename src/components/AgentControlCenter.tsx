import React, { useState } from 'react';
import {
  Play,
  Pause,
  RotateCcw,
  Square,
  Sparkles,
  Shield,
  Clock,
  Terminal,
  Layers,
  CheckCircle2,
  AlertTriangle,
  FileCheck,
  Search,
  Code2,
  BarChart2,
  Globe,
  FileText,
  Sliders,
  Flame,
} from 'lucide-react';
import { AgentRun, AgentRole } from '../types.js';

interface AgentControlCenterProps {
  activeRun: AgentRun | null;
  onStartRun: (goal: string, context?: string, budget?: any) => Promise<void>;
  onPauseRun: (runId: string) => Promise<void>;
  onResumeRun: (runId: string) => Promise<void>;
  onStopRun: (runId: string) => Promise<void>;
  isStarting: boolean;
}

const PRESET_GOALS = [
  {
    title: 'Multi-Agent Research & Intelligence Report',
    goal: 'Research IEEE autonomous multi-agent DAG architectures, cross-check sources, and compile executive intelligence report.',
    icon: Search,
    category: 'Research',
  },
  {
    title: 'Software Engineering: 3-Cycle Validation Loop',
    goal: 'Synthesize and test an authenticated input validator with edge-case unit tests and security audit.',
    icon: Code2,
    category: 'Coding',
  },
  {
    title: 'Data Science: Anomaly Detection & Stats',
    goal: 'Analyze server latency dataset, calculate mean, variance, and isolate Z-score outliers (|Z| > 2.0).',
    icon: BarChart2,
    category: 'Analytics',
  },
  {
    title: 'Security Gate & Production Deployment',
    goal: 'Audit and deploy verified production service package to live environment with human approval.',
    icon: Shield,
    category: 'Security',
  },
];

const AGENT_BADGES: Record<AgentRole, { name: string; bg: string; text: string; icon: any }> = {
  ORCHESTRATOR: { name: 'Central Orchestrator', bg: 'bg-indigo-500/10 border-indigo-500/30', text: 'text-indigo-400', icon: Layers },
  RESEARCH: { name: 'Research Intelligence', bg: 'bg-sky-500/10 border-sky-500/30', text: 'text-sky-400', icon: Search },
  CODING: { name: 'Software Engineer', bg: 'bg-emerald-500/10 border-emerald-500/30', text: 'text-emerald-400', icon: Code2 },
  DATA: { name: 'Data Analyst', bg: 'bg-violet-500/10 border-violet-500/30', text: 'text-violet-400', icon: BarChart2 },
  BROWSER: { name: 'Browser Agent', bg: 'bg-cyan-500/10 border-cyan-500/30', text: 'text-cyan-400', icon: Globe },
  WRITING: { name: 'Technical Writer', bg: 'bg-amber-500/10 border-amber-500/30', text: 'text-amber-400', icon: FileText },
  VERIFICATION: { name: 'Verification & QA', bg: 'bg-teal-500/10 border-teal-500/30', text: 'text-teal-400', icon: CheckCircle2 },
  SECURITY: { name: 'Security Guardrails', bg: 'bg-rose-500/10 border-rose-500/30', text: 'text-rose-400', icon: Shield },
};

export const AgentControlCenter: React.FC<AgentControlCenterProps> = ({
  activeRun,
  onStartRun,
  onPauseRun,
  onResumeRun,
  onStopRun,
  isStarting,
}) => {
  const [goalInput, setGoalInput] = useState('');
  const [showBudgets, setShowBudgets] = useState(false);
  const [maxIterations, setMaxIterations] = useState(10);
  const [maxTime, setMaxTime] = useState(120);
  const [maxTools, setMaxTools] = useState(25);
  const [activeTab, setActiveTab] = useState<'tasks' | 'tools' | 'verification' | 'errors' | 'artifacts'>('tasks');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!goalInput.trim() || isStarting) return;
    onStartRun(goalInput.trim(), undefined, {
      maxIterations,
      maxTimeSeconds: maxTime,
      maxToolCalls: maxTools,
    });
  };

  const handleSelectPreset = (goal: string) => {
    setGoalInput(goal);
  };

  const activeAgentInfo = activeRun?.activeAgent
    ? AGENT_BADGES[activeRun.activeAgent] || AGENT_BADGES.ORCHESTRATOR
    : AGENT_BADGES.ORCHESTRATOR;

  const completedTasksCount = activeRun?.tasks.filter((t) => t.status === 'COMPLETED').length || 0;
  const totalTasksCount = activeRun?.tasks.length || 0;
  const progressPercent = totalTasksCount > 0 ? Math.round((completedTasksCount / totalTasksCount) * 100) : 0;

  return (
    <div id="agent-control-center" className="space-y-6">
      {/* Top Goal Input & Launcher */}
      <section className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-600/5 rounded-full blur-3xl pointer-events-none"></div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Sparkles className="w-5 h-5 text-indigo-400" />
              <label htmlFor="goal-input-field" className="text-sm font-bold text-white tracking-wide">
                Agent Objective & High-Level Goal
              </label>
            </div>

            <button
              type="button"
              onClick={() => setShowBudgets(!showBudgets)}
              className="text-xs text-slate-400 hover:text-indigo-400 flex items-center space-x-1 transition-colors"
            >
              <Sliders className="w-3.5 h-3.5" />
              <span>{showBudgets ? 'Hide Budget Limits' : 'Configure Budgets'}</span>
            </button>
          </div>

          <div className="relative">
            <textarea
              id="goal-input-field"
              rows={2}
              value={goalInput}
              onChange={(e) => setGoalInput(e.target.value)}
              placeholder="e.g. Research competitor pricing tiers, synthesize an authenticated validator, and verify all assertions across 3 validation cycles..."
              className="w-full bg-slate-950/80 border border-slate-800 rounded-xl px-4 py-3 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all font-sans leading-relaxed"
            />
            <button
              id="goal-launch-btn"
              type="submit"
              disabled={!goalInput.trim() || isStarting}
              className="absolute right-3 bottom-3 px-4 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs shadow-md shadow-indigo-600/30 flex items-center space-x-2 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>{isStarting ? 'Initiating...' : 'Launch Agent'}</span>
            </button>
          </div>

          {/* Budget Limits Dropdown */}
          {showBudgets && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-slate-950/60 p-4 rounded-xl border border-slate-800 text-xs">
              <div>
                <label className="text-slate-400 font-medium block mb-1">Max Iterations (Loops)</label>
                <input
                  type="number"
                  min={1}
                  max={50}
                  value={maxIterations}
                  onChange={(e) => setMaxIterations(Number(e.target.value))}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-slate-200"
                />
              </div>
              <div>
                <label className="text-slate-400 font-medium block mb-1">Timeout Budget (Seconds)</label>
                <input
                  type="number"
                  min={10}
                  max={600}
                  value={maxTime}
                  onChange={(e) => setMaxTime(Number(e.target.value))}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-slate-200"
                />
              </div>
              <div>
                <label className="text-slate-400 font-medium block mb-1">Max Tool Invocations</label>
                <input
                  type="number"
                  min={5}
                  max={100}
                  value={maxTools}
                  onChange={(e) => setMaxTools(Number(e.target.value))}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-slate-200"
                />
              </div>
            </div>
          )}

          {/* Prompt Presets */}
          <div className="pt-1">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-2">
              Autonomous Workflows Presets:
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
              {PRESET_GOALS.map((preset, idx) => {
                const Icon = preset.icon;
                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleSelectPreset(preset.goal)}
                    className="text-left p-2.5 rounded-xl bg-slate-950/40 hover:bg-slate-800/60 border border-slate-800/80 hover:border-slate-700 transition-all flex items-start space-x-2.5 group"
                  >
                    <div className="w-6 h-6 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 shrink-0 mt-0.5 group-hover:scale-105 transition-transform">
                      <Icon className="w-3.5 h-3.5" />
                    </div>
                    <div>
                      <div className="text-xs font-semibold text-slate-200 group-hover:text-white line-clamp-1">
                        {preset.title}
                      </div>
                      <span className="text-[10px] text-slate-400 block">{preset.category}</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </form>
      </section>

      {/* Active Run Monitor */}
      {activeRun ? (
        <section id="active-run-monitor" className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
          {/* Header Bar */}
          <div className="p-6 border-b border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1 max-w-2xl">
              <div className="flex items-center space-x-2.5">
                <span
                  className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider border ${
                    activeRun.status === 'VERIFIED'
                      ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                      : activeRun.status === 'RUNNING'
                      ? 'bg-indigo-500/20 text-indigo-300 border-indigo-500/40 animate-pulse'
                      : activeRun.status === 'WAITING_APPROVAL'
                      ? 'bg-amber-500/20 text-amber-300 border-amber-500/40 animate-bounce'
                      : activeRun.status === 'PAUSED'
                      ? 'bg-slate-700 text-slate-300 border-slate-600'
                      : 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                  }`}
                >
                  {activeRun.status}
                </span>
                <span className="text-xs font-mono text-slate-400">ID: {activeRun.id}</span>
              </div>
              <h2 className="text-base font-bold text-white leading-snug">{activeRun.goal}</h2>
            </div>

            {/* Run Controls & Active Agent Badge */}
            <div className="flex items-center space-x-3 shrink-0">
              {/* Active Agent Badge */}
              <div
                className={`flex items-center space-x-2 px-3 py-1.5 rounded-xl border ${activeAgentInfo.bg} ${activeAgentInfo.text}`}
              >
                <activeAgentInfo.icon className="w-4 h-4" />
                <span className="text-xs font-semibold">{activeAgentInfo.name}</span>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center space-x-1.5 bg-slate-950 p-1 rounded-xl border border-slate-800">
                {activeRun.status === 'RUNNING' && (
                  <button
                    id="btn-pause-run"
                    onClick={() => onPauseRun(activeRun.id)}
                    title="Pause Execution"
                    className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
                  >
                    <Pause className="w-4 h-4" />
                  </button>
                )}

                {activeRun.status === 'PAUSED' && (
                  <button
                    id="btn-resume-run"
                    onClick={() => onResumeRun(activeRun.id)}
                    title="Resume Execution"
                    className="p-1.5 rounded-lg text-emerald-400 hover:text-emerald-300 hover:bg-slate-800 transition-colors"
                  >
                    <Play className="w-4 h-4 fill-current" />
                  </button>
                )}

                {['PLANNING', 'RUNNING', 'PAUSED', 'WAITING_APPROVAL'].includes(activeRun.status) && (
                  <button
                    id="btn-stop-run"
                    onClick={() => onStopRun(activeRun.id)}
                    title="Stop Execution"
                    className="p-1.5 rounded-lg text-rose-400 hover:text-rose-300 hover:bg-slate-800 transition-colors"
                  >
                    <Square className="w-4 h-4 fill-current" />
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Progress & Live Reflection Feed */}
          <div className="px-6 py-4 bg-slate-950/40 border-b border-slate-800/80">
            <div className="flex items-center justify-between text-xs mb-2">
              <span className="text-slate-400 font-medium">
                Execution Progress: <strong className="text-slate-200">{completedTasksCount}</strong> of{' '}
                <strong className="text-slate-200">{totalTasksCount}</strong> Tasks Complete
              </span>
              <span className="font-mono text-indigo-400 font-bold">{progressPercent}%</span>
            </div>
            <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-indigo-500 to-emerald-400 transition-all duration-500 rounded-full"
                style={{ width: `${progressPercent}%` }}
              ></div>
            </div>

            {/* Self-Reflection Output Feed */}
            {activeRun.reflections.length > 0 && (
              <div className="mt-4 p-3 rounded-xl bg-indigo-950/20 border border-indigo-900/30 flex items-start space-x-2.5">
                <Flame className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
                <div className="space-y-1 text-xs">
                  <span className="font-bold text-indigo-300 uppercase tracking-wider text-[10px]">
                    Autonomous Self-Reflection Summary:
                  </span>
                  <div className="text-slate-200 font-mono">
                    {activeRun.reflections[activeRun.reflections.length - 1].conciseSummary}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Secondary Tabs Navigation */}
          <div className="border-b border-slate-800 px-6 flex items-center space-x-4 bg-slate-950/20 text-xs font-medium overflow-x-auto">
            <button
              onClick={() => setActiveTab('tasks')}
              className={`py-3 border-b-2 flex items-center space-x-1.5 transition-colors whitespace-nowrap ${
                activeTab === 'tasks'
                  ? 'border-indigo-500 text-indigo-400 font-bold'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Tasks & DAG ({activeRun.tasks.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('tools')}
              className={`py-3 border-b-2 flex items-center space-x-1.5 transition-colors whitespace-nowrap ${
                activeTab === 'tools'
                  ? 'border-indigo-500 text-indigo-400 font-bold'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              <Terminal className="w-3.5 h-3.5" />
              <span>Tool Invocations ({activeRun.toolCalls.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('verification')}
              className={`py-3 border-b-2 flex items-center space-x-1.5 transition-colors whitespace-nowrap ${
                activeTab === 'verification'
                  ? 'border-indigo-500 text-indigo-400 font-bold'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              <FileCheck className="w-3.5 h-3.5" />
              <span>Verification Board ({activeRun.verifications.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('errors')}
              className={`py-3 border-b-2 flex items-center space-x-1.5 transition-colors whitespace-nowrap ${
                activeTab === 'errors'
                  ? 'border-indigo-500 text-indigo-400 font-bold'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>Error Intelligence ({activeRun.errors.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('artifacts')}
              className={`py-3 border-b-2 flex items-center space-x-1.5 transition-colors whitespace-nowrap ${
                activeTab === 'artifacts'
                  ? 'border-indigo-500 text-indigo-400 font-bold'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Artifacts & Result</span>
            </button>
          </div>

          {/* Sub-tab Content Area */}
          <div className="p-6">
            {/* TASKS VIEW */}
            {activeTab === 'tasks' && (
              <div className="space-y-3">
                {activeRun.tasks.map((task) => {
                  const agentInfo = AGENT_BADGES[task.assignedAgent] || AGENT_BADGES.ORCHESTRATOR;
                  return (
                    <div
                      key={task.id}
                      className={`p-4 rounded-xl border transition-all flex flex-col md:flex-row md:items-center justify-between gap-3 ${
                        task.status === 'COMPLETED'
                          ? 'bg-slate-950/40 border-slate-800/80 text-slate-300'
                          : task.status === 'RUNNING'
                          ? 'bg-indigo-950/20 border-indigo-500/40 text-white'
                          : task.status === 'WAITING_APPROVAL'
                          ? 'bg-amber-950/20 border-amber-500/40 text-amber-200'
                          : task.status === 'FAILED'
                          ? 'bg-rose-950/20 border-rose-500/40 text-rose-200'
                          : 'bg-slate-950/20 border-slate-800/40 text-slate-400'
                      }`}
                    >
                      <div className="flex items-start space-x-3">
                        <div
                          className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold mt-0.5 ${
                            task.status === 'COMPLETED'
                              ? 'bg-emerald-500/20 text-emerald-400'
                              : task.status === 'RUNNING'
                              ? 'bg-indigo-500/30 text-indigo-300 animate-pulse'
                              : 'bg-slate-800 text-slate-400'
                          }`}
                        >
                          {task.order}
                        </div>
                        <div>
                          <div className="font-semibold text-sm flex items-center space-x-2">
                            <span>{task.title}</span>
                            {task.retryCount > 0 && (
                              <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 font-mono">
                                {task.retryCount} Retries
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-slate-400 mt-0.5">{task.description}</p>
                        </div>
                      </div>

                      <div className="flex items-center space-x-2.5 shrink-0 self-end md:self-center">
                        <span className={`text-[11px] px-2 py-0.5 rounded-lg border ${agentInfo.bg} ${agentInfo.text}`}>
                          {agentInfo.name}
                        </span>
                        <span
                          className={`text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded ${
                            task.status === 'COMPLETED'
                              ? 'bg-emerald-500/10 text-emerald-400'
                              : task.status === 'RUNNING'
                              ? 'bg-indigo-500/10 text-indigo-400'
                              : task.status === 'WAITING_APPROVAL'
                              ? 'bg-amber-500/10 text-amber-400'
                              : 'bg-slate-800 text-slate-400'
                          }`}
                        >
                          {task.status}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* TOOL INVOCATIONS VIEW */}
            {activeTab === 'tools' && (
              <div className="space-y-3">
                {activeRun.toolCalls.length === 0 ? (
                  <p className="text-xs text-slate-400 italic">No tool calls dispatched yet.</p>
                ) : (
                  activeRun.toolCalls.map((call) => (
                    <div
                      key={call.id}
                      className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2 text-xs font-mono"
                    >
                      <div className="flex items-center justify-between text-slate-400">
                        <div className="flex items-center space-x-2">
                          <Terminal className="w-3.5 h-3.5 text-indigo-400" />
                          <span className="font-bold text-slate-200">{call.toolName}</span>
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-300">
                            {call.agentRole}
                          </span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className="text-[10px] text-slate-500">{call.durationMs}ms</span>
                          <span
                            className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                              call.riskLevel === 'HIGH'
                                ? 'bg-amber-500/20 text-amber-300'
                                : call.riskLevel === 'MEDIUM'
                                ? 'bg-indigo-500/20 text-indigo-300'
                                : 'bg-emerald-500/20 text-emerald-300'
                            }`}
                          >
                            {call.riskLevel}
                          </span>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-2">
                        <div>
                          <span className="text-[10px] text-slate-500 uppercase tracking-wider block mb-1">Input</span>
                          <pre className="p-2 bg-slate-900 rounded border border-slate-800/80 text-[11px] overflow-x-auto text-slate-300 max-h-28">
                            {JSON.stringify(call.input, null, 2)}
                          </pre>
                        </div>
                        <div>
                          <span className="text-[10px] text-slate-500 uppercase tracking-wider block mb-1">Output</span>
                          <pre className="p-2 bg-slate-900 rounded border border-slate-800/80 text-[11px] overflow-x-auto text-emerald-400 max-h-28">
                            {JSON.stringify(call.output, null, 2)}
                          </pre>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

            {/* VERIFICATION BOARD */}
            {activeTab === 'verification' && (
              <div className="space-y-3">
                <div className="text-xs text-slate-400 mb-2">
                  Predefined Success Criteria checklist verified empirically before completion:
                </div>
                {activeRun.verifications.map((crit, idx) => (
                  <div
                    key={crit.id}
                    className={`p-4 rounded-xl border flex items-start justify-between gap-4 ${
                      crit.passed
                        ? 'bg-emerald-950/10 border-emerald-500/30 text-emerald-200'
                        : 'bg-slate-950 border-slate-800 text-slate-300'
                    }`}
                  >
                    <div className="flex items-start space-x-3">
                      <div
                        className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${
                          crit.passed ? 'bg-emerald-500 text-slate-950' : 'bg-slate-800 text-slate-400'
                        }`}
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                      </div>
                      <div className="space-y-1">
                        <div className="font-semibold text-sm">{crit.criterion}</div>
                        <div className="text-xs text-slate-400">
                          <strong className="text-slate-300">Expected: </strong>
                          {crit.expectedResult}
                        </div>
                        {crit.evidence && (
                          <div className="text-xs text-emerald-400 font-mono bg-emerald-950/30 px-2 py-1 rounded border border-emerald-800/40">
                            <strong>Evidence: </strong>
                            {crit.evidence}
                          </div>
                        )}
                      </div>
                    </div>

                    <span
                      className={`px-2 py-0.5 rounded text-[10px] uppercase font-bold tracking-wider shrink-0 ${
                        crit.passed ? 'bg-emerald-500/20 text-emerald-300' : 'bg-slate-800 text-slate-400'
                      }`}
                    >
                      {crit.passed ? 'VERIFIED' : 'PENDING'}
                    </span>
                  </div>
                ))}
              </div>
            )}

            {/* ERROR INTELLIGENCE */}
            {activeTab === 'errors' && (
              <div className="space-y-3">
                {activeRun.errors.length === 0 ? (
                  <div className="p-6 text-center text-slate-400 text-xs bg-slate-950 rounded-xl border border-slate-800">
                    Zero fatal exceptions encountered. Autonomous error intelligence active.
                  </div>
                ) : (
                  activeRun.errors.map((err) => (
                    <div
                      key={err.id}
                      className="p-4 rounded-xl bg-rose-950/20 border border-rose-500/30 text-xs space-y-2"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-rose-300 text-sm">{err.classification} Error</span>
                        <span className="font-mono text-slate-400 text-[10px]">{err.timestamp}</span>
                      </div>
                      <p className="text-rose-200 font-mono">{err.message}</p>
                      <div className="bg-slate-950 p-2.5 rounded border border-slate-800 text-slate-300">
                        <strong className="text-indigo-400">Autonomous Recovery Strategy: </strong>
                        {err.recoveryStrategy}
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

            {/* ARTIFACTS & RESULT */}
            {activeTab === 'artifacts' && (
              <div className="space-y-4">
                {activeRun.finalResult ? (
                  <div className="space-y-4">
                    <div className="p-4 rounded-xl bg-slate-950 border border-slate-800">
                      <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                        Executive Summary
                      </h4>
                      <p className="text-sm text-slate-200 leading-relaxed font-sans">{activeRun.finalResult.summary}</p>
                    </div>

                    <div className="space-y-3">
                      <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                        Generated Deliverables & Artifacts
                      </h4>
                      {activeRun.finalResult.artifacts.map((art, idx) => (
                        <div key={idx} className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="font-mono text-indigo-400 font-bold text-xs">{art.name}</span>
                            <span className="text-[10px] uppercase font-bold text-slate-400">{art.type}</span>
                          </div>
                          <pre className="p-3 bg-slate-900 rounded-lg border border-slate-800 text-xs font-mono text-slate-300 overflow-x-auto max-h-48 leading-relaxed">
                            {art.content}
                          </pre>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <p className="text-xs text-slate-400 italic">Workflow active. Deliverables generated upon completion.</p>
                )}
              </div>
            )}
          </div>
        </section>
      ) : (
        <div className="p-12 text-center bg-slate-900/50 border border-slate-800/60 rounded-2xl">
          <Terminal className="w-10 h-10 text-slate-600 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-300">Ready to Orchestrate</h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto mt-1">
            Input a high-level goal above or select one of the autonomous preset workflows to start an intelligent agent run.
          </p>
        </div>
      )}
    </div>
  );
};
