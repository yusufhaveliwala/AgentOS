import React, { useState } from 'react';
import {
  Layers,
  ArrowRight,
  CheckCircle2,
  Clock,
  AlertTriangle,
  ShieldAlert,
  Terminal,
  Cpu,
  Info,
} from 'lucide-react';
import { AgentRun, Task } from '../types.js';

interface TaskGraphViewProps {
  activeRun: AgentRun | null;
}

export const TaskGraphView: React.FC<TaskGraphViewProps> = ({ activeRun }) => {
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);

  if (!activeRun || activeRun.tasks.length === 0) {
    return (
      <div id="task-graph-empty" className="p-12 text-center bg-slate-900 border border-slate-800 rounded-2xl">
        <Layers className="w-10 h-10 text-slate-600 mx-auto mb-3" />
        <h3 className="text-base font-bold text-slate-300">No Active Task Graph</h3>
        <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
          Start an autonomous agent run to generate and inspect the dynamic execution DAG.
        </p>
      </div>
    );
  }

  const tasks = activeRun.tasks;
  const completedCount = tasks.filter((t) => t.status === 'COMPLETED').length;
  const runningCount = tasks.filter((t) => t.status === 'RUNNING').length;
  const approvalCount = tasks.filter((t) => t.status === 'WAITING_APPROVAL').length;
  const failedCount = tasks.filter((t) => t.status === 'FAILED').length;

  return (
    <div id="task-graph-view" className="space-y-6">
      {/* Top Bar Summary */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <Layers className="w-5 h-5 text-indigo-400" />
            <h2 className="text-base font-bold text-white tracking-wide">Dynamic Task Dependency DAG</h2>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Goal: <span className="text-slate-200 font-medium">{activeRun.goal}</span>
          </p>
        </div>

        <div className="flex items-center space-x-3 text-xs font-mono">
          <div className="px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-300">
            Total Nodes: <strong className="text-white">{tasks.length}</strong>
          </div>
          <div className="px-3 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
            Completed: <strong>{completedCount}</strong>
          </div>
          {runningCount > 0 && (
            <div className="px-3 py-1.5 rounded-xl bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 animate-pulse">
              Running: <strong>{runningCount}</strong>
            </div>
          )}
          {approvalCount > 0 && (
            <div className="px-3 py-1.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400">
              Needs Approval: <strong>{approvalCount}</strong>
            </div>
          )}
          {failedCount > 0 && (
            <div className="px-3 py-1.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400">
              Failed: <strong>{failedCount}</strong>
            </div>
          )}
        </div>
      </div>

      {/* Main Graph & Inspector Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Visual Graph Flow (2 Columns) */}
        <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Execution Sequence & Dependency Graph
            </span>
            <span className="text-[11px] text-slate-500 italic">Click a node to inspect payload</span>
          </div>

          <div className="space-y-4 py-2">
            {tasks.map((task, idx) => {
              const isSelected = selectedTask?.id === task.id;
              const hasNext = idx < tasks.length - 1;

              return (
                <div key={task.id} className="relative">
                  {/* Task Node Card */}
                  <div
                    onClick={() => setSelectedTask(task)}
                    className={`p-4 rounded-xl border cursor-pointer transition-all ${
                      isSelected
                        ? 'border-indigo-500 ring-2 ring-indigo-500/30 shadow-lg bg-slate-800/90'
                        : task.status === 'COMPLETED'
                        ? 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
                        : task.status === 'RUNNING'
                        ? 'bg-indigo-950/30 border-indigo-500/50 shadow-md shadow-indigo-900/20'
                        : task.status === 'WAITING_APPROVAL'
                        ? 'bg-amber-950/30 border-amber-500/50'
                        : 'bg-slate-950/40 border-slate-800/60 opacity-80'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        <span className="w-5 h-5 rounded-full bg-slate-800 text-[11px] font-bold text-slate-300 flex items-center justify-center font-mono">
                          {task.order}
                        </span>
                        <span className="font-semibold text-sm text-slate-100">{task.title}</span>
                      </div>

                      <div className="flex items-center space-x-2">
                        <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                          {task.assignedAgent}
                        </span>
                        <span
                          className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded ${
                            task.status === 'COMPLETED'
                              ? 'bg-emerald-500/20 text-emerald-300'
                              : task.status === 'RUNNING'
                              ? 'bg-indigo-500/20 text-indigo-300 animate-pulse'
                              : task.status === 'WAITING_APPROVAL'
                              ? 'bg-amber-500/20 text-amber-300'
                              : 'bg-slate-800 text-slate-400'
                          }`}
                        >
                          {task.status}
                        </span>
                      </div>
                    </div>

                    <p className="text-xs text-slate-400 line-clamp-2">{task.description}</p>

                    <div className="mt-3 pt-3 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
                      <div className="flex items-center space-x-1 font-mono">
                        <Terminal className="w-3 h-3 text-slate-500" />
                        <span>Tools: {task.requiredTools.join(', ') || 'None'}</span>
                      </div>
                      {task.dependencies.length > 0 && (
                        <div className="text-slate-500 font-mono">
                          Depends on: {task.dependencies.join(', ')}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Connecting Arrow */}
                  {hasNext && (
                    <div className="flex justify-center my-2 text-slate-600">
                      <div className="w-0.5 h-4 bg-slate-800"></div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Node Inspector Side Panel (1 Column) */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
          <div className="flex items-center space-x-2 border-b border-slate-800 pb-3">
            <Info className="w-4 h-4 text-indigo-400" />
            <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider">Node Inspector</h3>
          </div>

          {selectedTask ? (
            <div className="space-y-4 text-xs">
              <div>
                <span className="text-slate-500 block uppercase tracking-wider text-[10px] font-bold">Node ID</span>
                <span className="font-mono text-slate-200 font-semibold">{selectedTask.id}</span>
              </div>

              <div>
                <span className="text-slate-500 block uppercase tracking-wider text-[10px] font-bold">Title</span>
                <span className="text-slate-200 font-medium text-sm">{selectedTask.title}</span>
              </div>

              <div>
                <span className="text-slate-500 block uppercase tracking-wider text-[10px] font-bold">Assigned Sub-Agent</span>
                <span className="px-2 py-1 rounded bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 font-bold inline-block mt-1">
                  {selectedTask.assignedAgent}
                </span>
              </div>

              <div>
                <span className="text-slate-500 block uppercase tracking-wider text-[10px] font-bold">Status</span>
                <span className="font-mono text-slate-300">{selectedTask.status}</span>
              </div>

              <div>
                <span className="text-slate-500 block uppercase tracking-wider text-[10px] font-bold">Dependencies</span>
                <div className="font-mono text-slate-300 bg-slate-950 p-2 rounded border border-slate-800 mt-1">
                  {selectedTask.dependencies.length > 0
                    ? selectedTask.dependencies.join(', ')
                    : 'None (Root Task)'}
                </div>
              </div>

              <div>
                <span className="text-slate-500 block uppercase tracking-wider text-[10px] font-bold">Tool Chain</span>
                <div className="font-mono text-slate-300 bg-slate-950 p-2 rounded border border-slate-800 mt-1">
                  {selectedTask.requiredTools.join(', ') || 'Internal reasoning'}
                </div>
              </div>

              {selectedTask.output && (
                <div>
                  <span className="text-slate-500 block uppercase tracking-wider text-[10px] font-bold">Output Payload</span>
                  <pre className="mt-1 bg-slate-950 p-3 rounded-lg border border-slate-800 text-[11px] font-mono text-emerald-400 overflow-x-auto max-h-44">
                    {JSON.stringify(selectedTask.output, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          ) : (
            <div className="p-8 text-center text-slate-500 text-xs italic">
              Select any node in the execution graph to view its runtime parameters, sub-agent assignment, and tool payloads.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
