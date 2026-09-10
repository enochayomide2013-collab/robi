import React, { useState } from 'react';
import { Users, UserPlus, Gamepad2, ShieldCheck, Search, MessageSquare, Flame } from 'lucide-react';
import { UserProfile, AcadoGame } from '../../types';

interface FriendsViewProps {
  user: UserProfile;
  onPlayGame: (game: AcadoGame) => void;
  games: AcadoGame[];
}

export const FriendsView: React.FC<FriendsViewProps> = ({ user, onPlayGame, games }) => {
  const [activeTab, setActiveTab] = useState<'all' | 'online' | 'requests'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [friendList, setFriendList] = useState([
    { id: 'f_1', username: 'SpeedDemon99', displayName: 'SpeedDemon99', level: 18, isOnline: true, currentGame: 'ACADO City Racing 3D', avatarColor: '#E63946' },
    { id: 'f_2', username: 'VoxelQueen', displayName: 'VoxelQueen', level: 25, isOnline: true, currentGame: 'Super Obby: Cyber Neon 3D', avatarColor: '#9C27B0' },
    { id: 'f_3', username: 'BlockMasterX', displayName: 'BlockMasterX', level: 12, isOnline: false, currentGame: undefined, avatarColor: '#FFD54F' },
  ]);

  const filtered = friendList.filter((f) => {
    if (activeTab === 'online' && !f.isOnline) return false;
    return f.displayName.toLowerCase().includes(searchQuery.toLowerCase());
  });

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white tracking-wide flex items-center gap-2">
            <Users className="w-6 h-6 text-cyan-400" />
            Friends & Social
          </h1>
          <p className="text-xs text-slate-400">Connect with creators and join party game servers together</p>
        </div>

        <button className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-black text-xs cursor-pointer">
          <UserPlus className="w-4 h-4" />
          Add Friend
        </button>
      </div>

      {/* Tabs and Search */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-slate-900 border border-slate-800 rounded-2xl p-3">
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <button
            onClick={() => setActiveTab('all')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold cursor-pointer ${
              activeTab === 'all' ? 'bg-cyan-500 text-slate-950' : 'text-slate-400 hover:text-white'
            }`}
          >
            All Friends ({friendList.length})
          </button>
          <button
            onClick={() => setActiveTab('online')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold cursor-pointer ${
              activeTab === 'online' ? 'bg-cyan-500 text-slate-950' : 'text-slate-400 hover:text-white'
            }`}
          >
            Online Now (2)
          </button>
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
          <input
            type="text"
            placeholder="Search friends..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-800 border border-slate-700 rounded-xl pl-9 pr-3 py-1.5 text-xs text-white placeholder-slate-400 focus:outline-none"
          />
        </div>
      </div>

      {/* Friends Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((friend) => (
          <div key={friend.id} className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex items-center justify-between gap-3 shadow-lg">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center font-bold text-slate-950 text-base"
                  style={{ backgroundColor: friend.avatarColor }}
                >
                  🤖
                </div>
                {friend.isOnline && (
                  <span className="absolute -bottom-1 -right-1 w-3.5 h-3.5 bg-emerald-400 border-2 border-slate-900 rounded-full" />
                )}
              </div>

              <div>
                <h3 className="font-extrabold text-sm text-white">{friend.displayName}</h3>
                <p className="text-[10px] text-slate-400 font-medium">Level {friend.level}</p>
                {friend.isOnline ? (
                  <p className="text-[10px] text-emerald-400 font-bold mt-0.5">Playing: {friend.currentGame}</p>
                ) : (
                  <p className="text-[10px] text-slate-500 mt-0.5">Offline</p>
                )}
              </div>
            </div>

            {friend.isOnline && friend.currentGame && (
              <button
                onClick={() => {
                  const targetGame = games.find((g) => g.title === friend.currentGame) || games[0];
                  onPlayGame(targetGame);
                }}
                className="px-3 py-1.5 rounded-xl bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500 hover:text-slate-950 font-extrabold text-xs border border-emerald-500/30 transition-all cursor-pointer flex items-center gap-1"
              >
                <Gamepad2 className="w-3.5 h-3.5" />
                Join
              </button>
            )}
          </div>
        ))}
      </div>

    </div>
  );
};
