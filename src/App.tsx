import React, { useState, useEffect, useRef } from 'react';
import { Header } from './components/Header.js';
import { AgentControlCenter } from './components/AgentControlCenter.js';
import { TaskGraphView } from './components/TaskGraphView.js';
import { ToolRegistryView } from './components/ToolRegistryView.js';
import { MemoryMatrixView } from './components/MemoryMatrixView.js';
import { BenchmarkView } from './components/BenchmarkView.js';
import { AuditLogsView } from './components/AuditLogsView.js';
import { PromptRunnerView } from './components/PromptRunnerView.js';
import { AskAiView } from './components/AskAiView.js';
import { ApprovalModal } from './components/ApprovalModal.js';
import { AgentRun, ApprovalRecord } from './types.js';

export default function App() {
  const [activeTab, setActiveTab] = useState<'studio' | 'graph' | 'tools' | 'memory' | 'benchmarks' | 'audit' | 'prompt' | 'ask-ai'>('studio');
  const [runs, setRuns] = useState<AgentRun[]>([]);
  const [activeRun, setActiveRun] = useState<AgentRun | null>(null);
  const [isStarting, setIsStarting] = useState(false);
  const [isProcessingApproval, setIsProcessingApproval] = useState(false);
  const sseRef = useRef<EventSource | null>(null);

  // Initial load: fetch all runs
  useEffect(() => {
    fetchRuns();
  }, []);

  const fetchRuns = async () => {
    try {
      const res = await fetch('/api/agent/runs');
      const data: AgentRun[] = await res.json();
      setRuns(data);
      if (data.length > 0 && !activeRun) {
        setActiveRun(data[0]);
      }
    } catch (err) {
      console.error('Failed to fetch runs:', err);
    }
  };

  // Connect to SSE stream whenever activeRun changes
  useEffect(() => {
    if (!activeRun?.id) return;

    if (sseRef.current) {
      sseRef.current.close();
    }

    const eventSource = new EventSource(`/api/agent/runs/${activeRun.id}/stream`);
    sseRef.current = eventSource;

    eventSource.onmessage = (event) => {
      try {
        const payload = JSON.parse(event.data);
        if (payload.type === 'SNAPSHOT' && payload.payload) {
          setActiveRun(payload.payload);
        } else if (payload.type === 'EVENT' && payload.run) {
          setActiveRun(payload.run);
          setRuns((prev) => prev.map((r) => (r.id === payload.run.id ? payload.run : r)));
        }
      } catch (err) {
        console.error('Error parsing SSE event:', err);
      }
    };

    eventSource.onerror = () => {
      // If SSE disconnects, fallback to gentle polling if running
      eventSource.close();
    };

    return () => {
      eventSource.close();
    };
  }, [activeRun?.id]);

  // Periodic poll backup in case run is active
  useEffect(() => {
    if (!activeRun || !['PLANNING', 'RUNNING', 'VERIFYING', 'WAITING_APPROVAL'].includes(activeRun.status)) {
      return;
    }

    const interval = setInterval(async () => {
      try {
        const res = await fetch(`/api/agent/runs/${activeRun.id}`);
        if (res.ok) {
          const updatedRun: AgentRun = await res.json();
          setActiveRun(updatedRun);
          setRuns((prev) => prev.map((r) => (r.id === updatedRun.id ? updatedRun : r)));
        }
      } catch (err) {
        console.error('Polling error:', err);
      }
    }, 1500);

    return () => clearInterval(interval);
  }, [activeRun?.id, activeRun?.status]);

  // Handlers
  const handleStartRun = async (goal: string, context?: string, budget?: any) => {
    setIsStarting(true);
    try {
      const res = await fetch('/api/agent/run', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ goal, context, budget }),
      });
      const newRun: AgentRun = await res.json();
      setRuns((prev) => [newRun, ...prev]);
      setActiveRun(newRun);
      setActiveTab('studio');
    } catch (err) {
      console.error('Failed to start run:', err);
    } finally {
      setIsStarting(false);
    }
  };

  const handlePauseRun = async (runId: string) => {
    try {
      await fetch(`/api/agent/runs/${runId}/pause`, { method: 'POST' });
    } catch (err) {
      console.error('Pause failed:', err);
    }
  };

  const handleResumeRun = async (runId: string) => {
    try {
      await fetch(`/api/agent/runs/${runId}/resume`, { method: 'POST' });
    } catch (err) {
      console.error('Resume failed:', err);
    }
  };

  const handleStopRun = async (runId: string) => {
    try {
      await fetch(`/api/agent/runs/${runId}/stop`, { method: 'POST' });
    } catch (err) {
      console.error('Stop failed:', err);
    }
  };

  const handleApproveAction = async (approvalId: string) => {
    setIsProcessingApproval(true);
    try {
      await fetch(`/api/agent/approvals/${approvalId}/approve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ decidedBy: 'Lead AI Architect' }),
      });
      // Refresh active run
      if (activeRun) {
        const res = await fetch(`/api/agent/runs/${activeRun.id}`);
        const data = await res.json();
        setActiveRun(data);
      }
    } catch (err) {
      console.error('Approve failed:', err);
    } finally {
      setIsProcessingApproval(false);
    }
  };

  const handleRejectAction = async (approvalId: string) => {
    setIsProcessingApproval(true);
    try {
      await fetch(`/api/agent/approvals/${approvalId}/reject`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ decidedBy: 'Lead AI Architect' }),
      });
      if (activeRun) {
        const res = await fetch(`/api/agent/runs/${activeRun.id}`);
        const data = await res.json();
        setActiveRun(data);
      }
    } catch (err) {
      console.error('Reject failed:', err);
    } finally {
      setIsProcessingApproval(false);
    }
  };

  // Find any pending approvals across all runs or within active run
  const pendingApprovals: ApprovalRecord[] = activeRun
    ? activeRun.approvals.filter((a) => a.status === 'PENDING')
    : [];

  const currentPendingApproval = pendingApprovals.length > 0 ? pendingApprovals[0] : null;

  return (
    <div id="agentos-root" className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans antialiased selection:bg-indigo-600 selection:text-white">
      {/* Human-in-the-Loop Approval Modal */}
      {currentPendingApproval && (
        <ApprovalModal
          approval={currentPendingApproval}
          onApprove={handleApproveAction}
          onReject={handleRejectAction}
          isProcessing={isProcessingApproval}
        />
      )}

      {/* Top Header */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        activeRun={activeRun}
        runs={runs}
        onSelectRun={(id) => {
          const run = runs.find((r) => r.id === id);
          if (run) setActiveRun(run);
        }}
        pendingApprovalsCount={pendingApprovals.length}
      />

      {/* Main Workspace View */}
      <main id="agentos-main-content" className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {activeTab === 'studio' && (
          <AgentControlCenter
            activeRun={activeRun}
            onStartRun={handleStartRun}
            onPauseRun={handlePauseRun}
            onResumeRun={handleResumeRun}
            onStopRun={handleStopRun}
            isStarting={isStarting}
          />
        )}

        {activeTab === 'graph' && <TaskGraphView activeRun={activeRun} />}

        {activeTab === 'tools' && <ToolRegistryView />}

        {activeTab === 'memory' && <MemoryMatrixView />}

        {activeTab === 'benchmarks' && <BenchmarkView />}

        {activeTab === 'audit' && <AuditLogsView activeRun={activeRun} />}

        {activeTab === 'prompt' && <PromptRunnerView />}

        {activeTab === 'ask-ai' && <AskAiView />}
      </main>

      {/* Footer System Status Bar */}
      <footer id="agentos-footer" className="bg-slate-900/80 border-t border-slate-800/80 py-3 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center space-x-3 font-mono text-[11px]">
            <span className="flex items-center space-x-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
              <span className="text-slate-400">Core: Running</span>
            </span>
            <span>•</span>
            <span>Mode: Autonomous Reactive DAG</span>
            <span>•</span>
            <span>Sandboxed Node VM Active</span>
          </div>

          <div className="text-[11px] text-slate-400 font-medium">
            AgentOS • Multi-Agent Autonomous Operating System
          </div>
        </div>
      </footer>
    </div>
  );
}
