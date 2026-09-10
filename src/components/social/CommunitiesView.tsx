import React, { useState } from 'react';
import { Globe2, Users, Shield, Plus, MessageSquare, ExternalLink } from 'lucide-react';
import { Community } from '../../types';

interface CommunitiesViewProps {
  communities: Community[];
}

export const CommunitiesView: React.FC<CommunitiesViewProps> = ({ communities }) => {
  const [userJoined, setUserJoined] = useState<string[]>(['comm_racing']);

  const toggleJoin = (commId: string) => {
    if (userJoined.includes(commId)) {
      setUserJoined(userJoined.filter((id) => id !== commId));
    } else {
      setUserJoined([...userJoined, commId]);
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white tracking-wide flex items-center gap-2">
            <Globe2 className="w-6 h-6 text-cyan-400" />
            ACADO Communities
          </h1>
          <p className="text-xs text-slate-400">Join creator groups, gaming guilds, and development teams</p>
        </div>

        <button className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-black text-xs cursor-pointer">
          <Plus className="w-4 h-4" />
          Create Community
        </button>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {communities.map((comm) => {
          const isJoined = userJoined.includes(comm.id);
          return (
            <div key={comm.id} className="bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-xl space-y-4">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-cyan-500 to-indigo-500 flex items-center justify-center font-black text-slate-950 text-2xl shadow-lg">
                    {comm.name.charAt(0)}
                  </div>
                  <div>
                    <h3 className="font-extrabold text-base text-white">{comm.name}</h3>
                    <p className="text-xs text-slate-400 flex items-center gap-1">
                      <Users className="w-3.5 h-3.5 text-cyan-400" />
                      {comm.memberCount.toLocaleString()} Members • Owner: {comm.ownerName}
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => toggleJoin(comm.id)}
                  className={`px-4 py-2 rounded-xl font-extrabold text-xs cursor-pointer transition-all ${
                    isJoined
                      ? 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                      : 'bg-cyan-500 text-slate-950 hover:bg-cyan-400'
                  }`}
                >
                  {isJoined ? 'Joined' : 'Join Group'}
                </button>
              </div>

              <p className="text-xs text-slate-300 leading-relaxed bg-slate-950/50 p-3 rounded-2xl border border-slate-800">
                {comm.description}
              </p>

              <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
                <span>Associated Games: {comm.associatedGameIds.length}</span>
                <span className="text-cyan-400 font-bold">Role: Member</span>
              </div>
            </div>
          );
        })}
      </div>

    </div>
  );
};
