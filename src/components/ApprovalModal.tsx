import React from 'react';
import { ShieldAlert, CheckCircle, XCircle, AlertTriangle, Terminal } from 'lucide-react';
import { ApprovalRecord } from '../types.js';

interface ApprovalModalProps {
  approval: ApprovalRecord;
  onApprove: (approvalId: string) => Promise<void>;
  onReject: (approvalId: string) => Promise<void>;
  isProcessing: boolean;
}

export const ApprovalModal: React.FC<ApprovalModalProps> = ({
  approval,
  onApprove,
  onReject,
  isProcessing,
}) => {
  return (
    <div
      id="approval-modal-backdrop"
      className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200"
    >
      <div
        id="approval-modal-card"
        className="bg-slate-900 border border-amber-500/50 rounded-2xl max-w-lg w-full shadow-2xl overflow-hidden shadow-amber-950/40"
      >
        {/* Banner Header */}
        <div className="bg-amber-500/10 border-b border-amber-500/30 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
              <ShieldAlert className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white tracking-wide">Human-in-the-Loop Authorization</h3>
              <p className="text-xs text-amber-400/90 font-mono">High-Risk Operation Gate</p>
            </div>
          </div>
          <span className="px-2.5 py-1 rounded bg-amber-500/20 text-amber-300 border border-amber-500/40 text-[11px] font-bold uppercase tracking-wider">
            {approval.riskLevel} RISK
          </span>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-4 text-sm">
          <div>
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Tool Invocation</span>
            <div className="flex items-center space-x-2 mt-1">
              <Terminal className="w-4 h-4 text-indigo-400" />
              <span className="font-mono text-white font-semibold text-base">{approval.toolName}</span>
            </div>
          </div>

          <div>
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Action Details</span>
            <p className="text-slate-300 mt-1 leading-relaxed bg-slate-950/60 p-3 rounded-lg border border-slate-800">
              {approval.actionDetails}
            </p>
          </div>

          <div>
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Parameters & Payload</span>
            <pre className="mt-1 bg-slate-950 p-3 rounded-lg border border-slate-800 text-xs font-mono text-slate-300 overflow-x-auto max-h-32">
              {JSON.stringify(approval.parameters, null, 2)}
            </pre>
          </div>

          <div className="bg-amber-950/20 border border-amber-800/40 p-3 rounded-lg flex items-start space-x-2.5">
            <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <p className="text-xs text-amber-300/90 leading-relaxed">
              <strong className="text-amber-200">Security Requirement: </strong>
              {approval.reason}
            </p>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="bg-slate-950 px-6 py-4 border-t border-slate-800 flex items-center justify-end space-x-3">
          <button
            id="approval-btn-reject"
            onClick={() => onReject(approval.id)}
            disabled={isProcessing}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-rose-400 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 transition-all flex items-center space-x-1.5 disabled:opacity-50"
          >
            <XCircle className="w-4 h-4" />
            <span>Reject Action</span>
          </button>

          <button
            id="approval-btn-approve"
            onClick={() => onApprove(approval.id)}
            disabled={isProcessing}
            className="px-5 py-2 rounded-xl text-xs font-semibold text-white bg-amber-600 hover:bg-amber-500 shadow-md shadow-amber-600/30 transition-all flex items-center space-x-1.5 disabled:opacity-50"
          >
            <CheckCircle className="w-4 h-4" />
            <span>{isProcessing ? 'Authorizing...' : 'Authorize & Resume'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
