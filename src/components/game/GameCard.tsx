import React from 'react';
import { Play, Heart, Star, Users, Flame } from 'lucide-react';
import { AcadoGame } from '../../types';

interface GameCardProps {
  game: AcadoGame;
  onSelectGame: (game: AcadoGame) => void;
  onPlayGame: (game: AcadoGame) => void;
  isFavorite?: boolean;
  onToggleFavorite?: (gameId: string, e: React.MouseEvent) => void;
}

export const GameCard: React.FC<GameCardProps> = ({
  game,
  onSelectGame,
  onPlayGame,
  isFavorite = false,
  onToggleFavorite,
}) => {
  return (
    <div
      onClick={() => onSelectGame(game)}
      className="group relative bg-slate-900 border border-slate-800/80 hover:border-cyan-500/60 rounded-2xl overflow-hidden shadow-lg hover:shadow-cyan-500/10 transition-all duration-300 flex flex-col justify-between cursor-pointer transform hover:-translate-y-1"
    >
      {/* Thumbnail Container */}
      <div className="relative aspect-video w-full overflow-hidden bg-slate-950">
        <img
          src={game.thumbnailUrl}
          alt={game.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />

        {/* Top Badges */}
        <div className="absolute top-2 left-2 flex items-center gap-1.5 z-10">
          <span className="px-2 py-0.5 rounded-lg bg-slate-950/80 backdrop-blur-md text-[10px] font-extrabold text-cyan-300 border border-cyan-500/30">
            {game.category}
          </span>
          {game.trending && (
            <span className="px-2 py-0.5 rounded-lg bg-amber-500/90 text-slate-950 text-[10px] font-black flex items-center gap-1 shadow-md">
              <Flame className="w-3 h-3 text-slate-950 fill-slate-950" />
              HOT
            </span>
          )}
        </div>

        {/* Favorite Heart Button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onToggleFavorite?.(game.id, e);
          }}
          className={`absolute top-2 right-2 p-2 rounded-xl backdrop-blur-md transition-all z-10 cursor-pointer ${
            isFavorite
              ? 'bg-rose-500/80 text-white shadow-md'
              : 'bg-slate-950/60 text-slate-300 hover:text-white hover:bg-slate-950/80'
          }`}
          title={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
        >
          <Heart className={`w-3.5 h-3.5 ${isFavorite ? 'fill-white' : ''}`} />
        </button>

        {/* Quick Play Button Overlay on Hover */}
        <div className="absolute inset-0 bg-slate-950/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onPlayGame(game);
            }}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-500 text-slate-950 font-black text-xs shadow-xl shadow-cyan-500/30 transform hover:scale-105 transition-all cursor-pointer"
          >
            <Play className="w-4 h-4 fill-slate-950" />
            PLAY WORLD
          </button>
        </div>
      </div>

      {/* Card Info Content */}
      <div className="p-3.5 space-y-2 flex-1 flex flex-col justify-between">
        <div>
          <h3 className="font-extrabold text-sm text-white group-hover:text-cyan-300 transition-colors line-clamp-1">
            {game.title}
          </h3>
          <p className="text-[11px] text-slate-400 font-medium truncate mt-0.5">
            By <span className="text-slate-300 hover:underline">{game.creatorName}</span>
          </p>
        </div>

        {/* Stats Row */}
        <div className="flex items-center justify-between text-[11px] pt-2 border-t border-slate-800/80 text-slate-400">
          <div className="flex items-center gap-1 font-semibold text-emerald-400">
            <Users className="w-3.5 h-3.5" />
            <span>{game.playerCount.toLocaleString()} online</span>
          </div>

          <div className="flex items-center gap-1 font-bold text-amber-400">
            <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
            <span>{game.rating.toFixed(1)}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
