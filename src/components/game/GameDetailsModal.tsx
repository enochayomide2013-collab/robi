import React, { useState } from 'react';
import { 
  X, Play, Heart, ThumbsUp, Star, Users, Server, ShieldCheck, 
  Trophy, RefreshCw, Layers, Sparkles, ExternalLink 
} from 'lucide-react';
import { AcadoGame } from '../../types';

interface GameDetailsModalProps {
  game: AcadoGame;
  onClose: () => void;
  onPlayGame: (game: AcadoGame, serverId?: string) => void;
  isFavorite: boolean;
  onToggleFavorite: (gameId: string) => void;
  allGames: AcadoGame[];
  onSelectRelatedGame: (game: AcadoGame) => void;
}

export const GameDetailsModal: React.FC<GameDetailsModalProps> = ({
  game,
  onClose,
  onPlayGame,
  isFavorite,
  onToggleFavorite,
  allGames,
  onSelectRelatedGame,
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'servers' | 'achievements' | 'versions'>('overview');
  const [likes, setLikes] = useState(game.likesCount);
  const [hasLiked, setHasLiked] = useState(false);

  const relatedGames = allGames.filter((g) => g.id !== game.id && g.category === game.category).slice(0, 3);

  const handleLike = () => {
    if (!hasLiked) {
      setLikes(likes + 1);
      setHasLiked(true);
    } else {
      setLikes(likes - 1);
      setHasLiked(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
      <div className="relative w-full max-w-4xl bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden my-8">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-20 p-2 rounded-full bg-slate-950/70 text-slate-300 hover:text-white hover:bg-slate-950 border border-slate-800 transition-all cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Hero Header Banner */}
        <div className="relative h-64 sm:h-80 w-full overflow-hidden bg-slate-950">
          <img
            src={game.thumbnailUrl}
            alt={game.title}
            className="w-full h-full object-cover filter brightness-90"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/40 to-transparent" />

          {/* Hero Content Overlay */}
          <div className="absolute bottom-6 left-6 right-6 flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4">
            <div className="space-y-1 max-w-xl">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-1 rounded-lg bg-cyan-500/20 text-cyan-300 font-extrabold text-xs border border-cyan-500/30">
                  {game.category}
                </span>
                <span className="px-2.5 py-1 rounded-lg bg-slate-800/80 text-slate-300 font-medium text-xs border border-slate-700">
                  {game.currentVersion}
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black text-white tracking-wide">{game.title}</h1>
              <p className="text-xs text-slate-300 flex items-center gap-1.5 font-medium">
                Created by <span className="text-cyan-400 font-bold hover:underline cursor-pointer">{game.creatorName}</span>
                <ShieldCheck className="w-4 h-4 text-cyan-400 fill-cyan-400/20" title="Verified Creator" />
              </p>
            </div>

            {/* HIGHLY VISIBLE PLAY BUTTON */}
            <div className="flex items-center gap-3 w-full sm:w-auto">
              <button
                onClick={() => onPlayGame(game)}
                className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-8 py-3.5 rounded-2xl bg-gradient-to-r from-emerald-400 via-cyan-400 to-indigo-500 hover:from-emerald-300 hover:to-indigo-400 text-slate-950 font-black text-base shadow-xl shadow-cyan-500/30 transform hover:scale-105 transition-all cursor-pointer"
              >
                <Play className="w-5 h-5 fill-slate-950" />
                PLAY EXPERIENCE
              </button>

              <button
                onClick={() => onToggleFavorite(game.id)}
                className={`p-3.5 rounded-2xl border transition-all cursor-pointer ${
                  isFavorite
                    ? 'bg-rose-500 border-rose-400 text-white shadow-lg'
                    : 'bg-slate-800/80 border-slate-700 text-slate-300 hover:text-white'
                }`}
              >
                <Heart className={`w-5 h-5 ${isFavorite ? 'fill-white' : ''}`} />
              </button>
            </div>
          </div>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 divide-x divide-y sm:divide-y-0 divide-slate-800 bg-slate-950/60 border-y border-slate-800 text-center py-3">
          <div>
            <p className="text-[10px] uppercase font-bold text-slate-400">Playing Now</p>
            <p className="text-sm font-black text-emerald-400 flex items-center justify-center gap-1 mt-0.5">
              <Users className="w-4 h-4" />
              {game.playerCount.toLocaleString()}
            </p>
          </div>
          <div>
            <p className="text-[10px] uppercase font-bold text-slate-400">Rating</p>
            <p className="text-sm font-black text-amber-400 flex items-center justify-center gap-1 mt-0.5">
              <Star className="w-4 h-4 fill-amber-400" />
              {game.rating.toFixed(1)} / 5.0
            </p>
          </div>
          <div>
            <p className="text-[10px] uppercase font-bold text-slate-400">Total Visits</p>
            <p className="text-sm font-black text-cyan-300 mt-0.5">{game.visitsCount.toLocaleString()}</p>
          </div>
          <div>
            <p className="text-[10px] uppercase font-bold text-slate-400">Likes</p>
            <button
              onClick={handleLike}
              className="text-sm font-black text-indigo-400 flex items-center justify-center gap-1.5 mt-0.5 hover:text-indigo-300 cursor-pointer mx-auto"
            >
              <ThumbsUp className={`w-4 h-4 ${hasLiked ? 'fill-indigo-400' : ''}`} />
              {likes.toLocaleString()}
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="p-6 space-y-6">
          <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
            <button
              onClick={() => setActiveTab('overview')}
              className={`px-4 py-2 rounded-xl text-xs font-extrabold cursor-pointer transition-all ${
                activeTab === 'overview'
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Overview
            </button>
            <button
              onClick={() => setActiveTab('servers')}
              className={`px-4 py-2 rounded-xl text-xs font-extrabold cursor-pointer transition-all ${
                activeTab === 'servers'
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Servers ({game.activeServers.length})
            </button>
            <button
              onClick={() => setActiveTab('achievements')}
              className={`px-4 py-2 rounded-xl text-xs font-extrabold cursor-pointer transition-all ${
                activeTab === 'achievements'
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Achievements ({game.achievements.length})
            </button>
            <button
              onClick={() => setActiveTab('versions')}
              className={`px-4 py-2 rounded-xl text-xs font-extrabold cursor-pointer transition-all ${
                activeTab === 'versions'
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Version History
            </button>
          </div>

          {/* TAB CONTENTS */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-xs font-extrabold text-slate-400 uppercase tracking-wider mb-2">About Experience</h3>
                <p className="text-sm text-slate-300 leading-relaxed bg-slate-950/40 p-4 rounded-2xl border border-slate-800/80">
                  {game.description}
                </p>
              </div>

              {/* Tags */}
              <div>
                <h3 className="text-xs font-extrabold text-slate-400 uppercase tracking-wider mb-2">Category Tags</h3>
                <div className="flex flex-wrap gap-2">
                  {game.tags.map((tag) => (
                    <span key={tag} className="px-3 py-1 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold">
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>

              {/* Related Games */}
              {relatedGames.length > 0 && (
                <div>
                  <h3 className="text-xs font-extrabold text-slate-400 uppercase tracking-wider mb-3">
                    More in {game.category}
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {relatedGames.map((relGame) => (
                      <div
                        key={relGame.id}
                        onClick={() => onSelectRelatedGame(relGame)}
                        className="p-3 bg-slate-800/60 hover:bg-slate-800 border border-slate-700/80 rounded-2xl cursor-pointer flex items-center gap-3 transition-all"
                      >
                        <img
                          src={relGame.thumbnailUrl}
                          alt={relGame.title}
                          className="w-12 h-12 rounded-xl object-cover bg-slate-900"
                        />
                        <div className="min-w-0">
                          <p className="font-bold text-xs text-white truncate">{relGame.title}</p>
                          <p className="text-[10px] text-emerald-400">{relGame.playerCount} playing</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'servers' && (
            <div className="space-y-3">
              <div className="p-3 bg-slate-800/60 rounded-2xl border border-slate-700 text-xs text-slate-300 flex items-center justify-between">
                <span>Select an authoritative server region for optimal latency</span>
                <span className="text-emerald-400 font-bold">Anti-Cheat Enabled</span>
              </div>
              {game.activeServers.map((server) => (
                <div
                  key={server.id}
                  className="p-4 bg-slate-800/80 border border-slate-700/80 rounded-2xl flex items-center justify-between gap-4"
                >
                  <div className="flex items-center gap-3">
                    <Server className="w-5 h-5 text-cyan-400" />
                    <div>
                      <p className="font-bold text-sm text-white">{server.name}</p>
                      <p className="text-xs text-slate-400">Region: {server.region} • Ping: {server.ping}ms</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-xs font-bold text-slate-300">
                      {server.currentPlayers} / {server.maxPlayers} Players
                    </span>
                    <button
                      onClick={() => onPlayGame(game, server.id)}
                      className="px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-black text-xs cursor-pointer"
                    >
                      Join Server
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'achievements' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {game.achievements.map((ach) => (
                <div
                  key={ach.id}
                  className={`p-4 rounded-2xl border flex items-center gap-3 ${
                    ach.unlocked ? 'bg-amber-500/10 border-amber-500/40 text-amber-300' : 'bg-slate-800/40 border-slate-800 text-slate-400'
                  }`}
                >
                  <Trophy className="w-6 h-6 flex-shrink-0" />
                  <div>
                    <p className="font-bold text-xs text-white">{ach.title}</p>
                    <p className="text-[11px] text-slate-400 mt-0.5">{ach.description}</p>
                    <span className="text-[10px] font-bold text-amber-400 mt-1 block">
                      Reward: +{ach.rewardCoins} A-Coins
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'versions' && (
            <div className="space-y-3">
              {game.versions.map((ver) => (
                <div key={ver.versionNumber} className="p-4 bg-slate-800/60 border border-slate-700/80 rounded-2xl space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-extrabold text-sm text-cyan-300">{ver.versionNumber}</span>
                    <span className="text-xs text-slate-400">{ver.releaseDate}</span>
                  </div>
                  <p className="text-xs text-slate-300">{ver.changelog}</p>
                </div>
              ))}
            </div>
          )}

        </div>

      </div>
    </div>
  );
};
