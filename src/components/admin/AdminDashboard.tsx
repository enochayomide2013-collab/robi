import React, { useState } from 'react';
import { Shield, AlertTriangle, CheckCircle2, UserX, Cpu, Server, Lock, Eye } from 'lucide-react';
import { ModerationReport } from '../../types';

interface AdminDashboardProps {
  reports: ModerationReport[];
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ reports: initialReports }) => {
  const [reports, setReports] = useState<ModerationReport[]>(initialReports);

  const handleResolve = (id: string, action: 'approved' | 'removed' | 'banned') => {
    setReports(
      reports.map((r) =>
        r.id === id ? { ...r, status: action === 'approved' ? 'approved' : 'rejected' } : r
      )
    );
  };

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white tracking-wide flex items-center gap-2">
            <Shield className="w-6 h-6 text-rose-400" />
            ACADO Admin & Moderation Queue
          </h1>
          <p className="text-xs text-slate-400">Automated AI Guardrails, Real-time reports, and Server Security</p>
        </div>

        <div className="flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl px-3.5 py-2 text-emerald-400 font-bold text-xs">
          <Server className="w-4 h-4 animate-pulse" />
          <span>Server Health: 100% Operational</span>
        </div>
      </div>

      {/* Security Health Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-xl">
          <div className="flex items-center justify-between text-slate-400 text-xs font-bold">
            <span>AI Safety Filter Score</span>
            <Cpu className="w-4 h-4 text-cyan-400" />
          </div>
          <p className="text-2xl font-black text-emerald-400 mt-2">99.98%</p>
          <span className="text-[10px] text-slate-400 mt-1 block">Zero plain text credentials stored</span>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-xl">
          <div className="flex items-center justify-between text-slate-400 text-xs font-bold">
            <span>Open Flagged Reports</span>
            <AlertTriangle className="w-4 h-4 text-amber-400" />
          </div>
          <p className="text-2xl font-black text-amber-300 mt-2">{reports.filter((r) => r.status === 'pending').length}</p>
          <span className="text-[10px] text-slate-400 mt-1 block">Pending Human Review</span>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-xl">
          <div className="flex items-center justify-between text-slate-400 text-xs font-bold">
            <span>Sandboxed Script Checks</span>
            <Lock className="w-4 h-4 text-indigo-400" />
          </div>
          <p className="text-2xl font-black text-white mt-2">14,200/sec</p>
          <span className="text-[10px] text-emerald-400 mt-1 block">All lua scripts isolated</span>
        </div>
      </div>

      {/* Moderation Queue */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
        <h2 className="text-sm font-extrabold text-white uppercase tracking-wider">Flagged Content Moderation Queue</h2>

        <div className="space-y-3">
          {reports.map((rep) => (
            <div key={rep.id} className="bg-slate-950 border border-slate-800 rounded-2xl p-4 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-lg bg-rose-500/20 text-rose-300 text-[10px] font-black uppercase border border-rose-500/30">
                    {rep.contentType}
                  </span>
                  <span className="text-xs font-bold text-white">Target ID: {rep.targetId}</span>
                </div>
                <span className="text-[10px] text-slate-400 font-mono">Reported by: {rep.reporterId}</span>
              </div>

              <p className="text-xs text-slate-300">Reason: <span className="font-bold text-amber-300">{rep.reason}</span></p>

              {rep.status === 'pending' ? (
                <div className="flex items-center gap-2 pt-2">
                  <button
                    onClick={() => handleResolve(rep.id, 'approved')}
                    className="px-3 py-1.5 rounded-xl bg-emerald-500/20 hover:bg-emerald-500 text-emerald-300 hover:text-slate-950 font-extrabold text-xs border border-emerald-500/30 cursor-pointer"
                  >
                    Approve Content
                  </button>
                  <button
                    onClick={() => handleResolve(rep.id, 'removed')}
                    className="px-3 py-1.5 rounded-xl bg-rose-500/20 hover:bg-rose-500 text-rose-300 hover:text-white font-extrabold text-xs border border-rose-500/30 cursor-pointer"
                  >
                    Remove Content
                  </button>
                  <button
                    onClick={() => handleResolve(rep.id, 'banned')}
                    className="px-3 py-1.5 rounded-xl bg-rose-600 text-white font-extrabold text-xs cursor-pointer flex items-center gap-1"
                  >
                    <UserX className="w-3.5 h-3.5" />
                    Ban Creator
                  </button>
                </div>
              ) : (
                <div className="text-xs font-bold text-emerald-400 pt-1 flex items-center gap-1">
                  <CheckCircle2 className="w-4 h-4" />
                  Resolved: {rep.status}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};
