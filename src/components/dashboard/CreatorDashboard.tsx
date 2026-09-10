import React from 'react';
import { SlidersHorizontal, TrendingUp, Users, DollarSign, Clock, RotateCcw, Eye, Star } from 'lucide-react';
import { AcadoGame } from '../../types';

interface CreatorDashboardProps {
  games: AcadoGame[];
}

export const CreatorDashboard: React.FC<CreatorDashboardProps> = ({ games }) => {
  const userGames = games.filter((g) => g.creatorName === 'AlexBuilder' || g.creatorName === 'ACADO Official Studio');

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 space-y-6">
      
      {/* Header */}
      <div>
        <h1 className="text-2xl font-black text-white tracking-wide flex items-center gap-2">
          <SlidersHorizontal className="w-6 h-6 text-indigo-400" />
          Creator Studio Analytics
        </h1>
        <p className="text-xs text-slate-400">Track player visits, concurrent sessions, monetization revenue, and version control</p>
      </div>

      {/* High Level Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-xl">
          <div className="flex items-center justify-between text-slate-400 text-xs font-bold">
            <span>Total Visits</span>
            <Eye className="w-4 h-4 text-cyan-400" />
          </div>
          <p className="text-2xl font-black text-white mt-2">1,245,800</p>
          <span className="text-[10px] text-emerald-400 font-bold mt-1 block">↑ 14% this week</span>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-xl">
          <div className="flex items-center justify-between text-slate-400 text-xs font-bold">
            <span>Active Concurrents</span>
            <Users className="w-4 h-4 text-emerald-400" />
          </div>
          <p className="text-2xl font-black text-emerald-400 mt-2">1,830</p>
          <span className="text-[10px] text-slate-400 font-bold mt-1 block">Across 6 game servers</span>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-xl">
          <div className="flex items-center justify-between text-slate-400 text-xs font-bold">
            <span>A-Coins Earned</span>
            <DollarSign className="w-4 h-4 text-amber-400" />
          </div>
          <p className="text-2xl font-black text-amber-300 mt-2">485,200</p>
          <span className="text-[10px] text-amber-400 font-bold mt-1 block">70% Creator Revenue Share</span>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-xl">
          <div className="flex items-center justify-between text-slate-400 text-xs font-bold">
            <span>Avg Session Time</span>
            <Clock className="w-4 h-4 text-fuchsia-400" />
          </div>
          <p className="text-2xl font-black text-white mt-2">18.4 min</p>
          <span className="text-[10px] text-slate-400 font-bold mt-1 block">High Engagement Index</span>
        </div>
      </div>

      {/* Games List */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
        <h2 className="text-sm font-extrabold text-white uppercase tracking-wider">Your Experiences ({userGames.length})</h2>

        <div className="space-y-3">
          {userGames.map((game) => (
            <div key={game.id} className="bg-slate-950 border border-slate-800/80 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <img src={game.thumbnailUrl} alt={game.title} className="w-14 h-14 rounded-xl object-cover bg-slate-900" />
                <div>
                  <h3 className="font-extrabold text-sm text-white">{game.title}</h3>
                  <p className="text-xs text-slate-400">Current Version: {game.currentVersion} • Category: {game.category}</p>
                </div>
              </div>

              <div className="flex items-center gap-3 w-full sm:w-auto justify-between">
                <div className="text-right text-xs">
                  <p className="font-bold text-emerald-400">{game.playerCount} playing</p>
                  <p className="text-slate-400">{game.visitsCount.toLocaleString()} visits</p>
                </div>

                <button className="flex items-center gap-1 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-bold text-xs cursor-pointer">
                  <RotateCcw className="w-3.5 h-3.5 text-cyan-400" />
                  Rollback Version
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};
