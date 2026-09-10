import React from 'react';
import { HelpCircle, Shield, MessageSquare, Bug, FileText } from 'lucide-react';

export const HelpCenterView: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6 space-y-6">
      
      <div>
        <h1 className="text-2xl font-black text-white tracking-wide flex items-center gap-2">
          <HelpCircle className="w-6 h-6 text-cyan-400" />
          ACADO Support & Help Center
        </h1>
        <p className="text-xs text-slate-400">Find guides, submit bug reports, or appeal moderation actions</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-xl space-y-2">
          <Bug className="w-6 h-6 text-amber-400" />
          <h3 className="font-extrabold text-sm text-white">Report a Bug</h3>
          <p className="text-xs text-slate-400">Encountered an issue in a 3D experience or studio? Send a ticket directly to developers.</p>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-xl space-y-2">
          <Shield className="w-6 h-6 text-rose-400" />
          <h3 className="font-extrabold text-sm text-white">Moderation Appeals</h3>
          <p className="text-xs text-slate-400">Was your creation flagged by mistake? Submit a review request to our moderation team.</p>
        </div>
      </div>

    </div>
  );
};
