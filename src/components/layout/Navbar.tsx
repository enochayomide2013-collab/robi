import React, { useState } from 'react';
import { 
  Search, Bell, Sparkles, Coins, User, Menu, X, Shield, 
  Gamepad2, Plus, Heart, Compass, LogIn, LogOut, Check, SlidersHorizontal
} from 'lucide-react';
import { NavigationTab, UserProfile, AcadoGame } from '../../types';

interface NavbarProps {
  user: UserProfile;
  currentTab: NavigationTab;
  onSelectTab: (tab: NavigationTab) => void;
  games: AcadoGame[];
  onSelectGame: (game: AcadoGame) => void;
  onOpenAuth: () => void;
  onOpenAiBuilder: () => void;
  unreadNotificationCount: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  user,
  currentTab,
  onSelectTab,
  games,
  onSelectGame,
  onOpenAuth,
  onOpenAiBuilder,
  unreadNotificationCount,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);

  const filteredGames = games.filter(
    (g) =>
      g.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      g.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      g.creatorName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <header className="sticky top-0 z-40 w-full bg-slate-900/95 backdrop-blur-md border-b border-slate-800 text-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        
        {/* Brand Logo & Name */}
        <div className="flex items-center gap-3 cursor-pointer select-none" onClick={() => onSelectTab('HOME')}>
          <div className="relative w-10 h-10 bg-gradient-to-tr from-cyan-500 via-indigo-500 to-fuchsia-500 rounded-xl flex items-center justify-center font-black text-xl text-white shadow-md shadow-cyan-500/20 transform hover:scale-105 transition-transform duration-200">
            A
            <span className="absolute -bottom-1 -right-1 w-3.5 h-3.5 bg-emerald-400 border-2 border-slate-900 rounded-full" title="Servers Online" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold text-xl tracking-wider bg-gradient-to-r from-cyan-400 via-indigo-300 to-fuchsia-400 bg-clip-text text-transparent">
                ACADO
              </span>
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                3D UNIVERSE
              </span>
            </div>
            <p className="text-[10px] text-slate-400 font-medium tracking-wide">PLAY. CREATE. EXPLORE.</p>
          </div>
        </div>

        {/* Universal Search Bar */}
        <div className="relative flex-1 max-w-md hidden md:block">
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search 3D games, creators, items, communities..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setIsSearchOpen(true);
              }}
              onFocus={() => setIsSearchOpen(true)}
              onBlur={() => setTimeout(() => setIsSearchOpen(false), 200)}
              className="w-full bg-slate-800/80 border border-slate-700/80 rounded-xl pl-10 pr-4 py-2 text-sm text-slate-200 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500 transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white text-xs"
              >
                Clear
              </button>
            )}
          </div>

          {/* Autocomplete Dropdown */}
          {isSearchOpen && searchQuery.trim() !== '' && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-slate-800 border border-slate-700 rounded-xl shadow-2xl overflow-hidden z-50 divide-y divide-slate-700/50">
              <div className="p-2 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Matching Games ({filteredGames.length})
              </div>
              {filteredGames.length > 0 ? (
                filteredGames.slice(0, 5).map((game) => (
                  <div
                    key={game.id}
                    onClick={() => {
                      onSelectGame(game);
                      setSearchQuery('');
                      setIsSearchOpen(false);
                    }}
                    className="p-3 hover:bg-slate-700/60 cursor-pointer flex items-center gap-3 transition-colors"
                  >
                    <img
                      src={game.thumbnailUrl}
                      alt={game.title}
                      className="w-10 h-10 rounded-lg object-cover bg-slate-900 border border-slate-700"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-sm text-white truncate">{game.title}</p>
                      <p className="text-xs text-slate-400 truncate">By {game.creatorName} • {game.category}</p>
                    </div>
                    <span className="text-xs px-2 py-1 rounded bg-cyan-500/20 text-cyan-300 font-medium">
                      {game.playerCount} playing
                    </span>
                  </div>
                ))
              ) : (
                <div className="p-4 text-center text-sm text-slate-400">No matching experiences found</div>
              )}
            </div>
          )}
        </div>

        {/* Right Actions & User Profile */}
        <div className="flex items-center gap-2 sm:gap-3">
          
          {/* AI Builder Quick Action Button */}
          <button
            onClick={onOpenAiBuilder}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-fuchsia-600 to-indigo-600 hover:from-fuchsia-500 hover:to-indigo-500 text-white font-semibold text-xs shadow-md shadow-fuchsia-500/20 transform hover:-translate-y-0.5 transition-all cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5 text-yellow-300 animate-pulse" />
            <span className="hidden sm:inline">AI Builder</span>
          </button>

          {/* Quick Create Studio Button */}
          <button
            onClick={() => onSelectTab('CREATE')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-semibold text-xs border transition-all cursor-pointer ${
              currentTab === 'CREATE'
                ? 'bg-cyan-500 text-slate-950 border-cyan-400 shadow-md shadow-cyan-500/20'
                : 'bg-slate-800 text-slate-200 border-slate-700 hover:border-slate-600 hover:bg-slate-750'
            }`}
          >
            <Plus className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Create</span>
          </button>

          {/* ACADO Currency Balance (A-Coins) */}
          <div
            onClick={() => onSelectTab('INVENTORY')}
            className="flex items-center gap-1.5 bg-amber-500/10 border border-amber-500/30 rounded-xl px-2.5 py-1.5 cursor-pointer hover:bg-amber-500/20 transition-colors"
            title="A-Coins Balance"
          >
            <Coins className="w-4 h-4 text-amber-400" />
            <span className="font-extrabold text-xs text-amber-300">{user.coins.toLocaleString()}</span>
          </div>

          {/* Notifications Button */}
          <button
            onClick={() => onSelectTab('NOTIFICATIONS')}
            className="relative p-2 rounded-xl bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700 transition-colors cursor-pointer"
            title="Notifications"
          >
            <Bell className="w-4 h-4" />
            {unreadNotificationCount > 0 && (
              <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-rose-500 rounded-full ring-2 ring-slate-900" />
            )}
          </button>

          {/* User Profile Avatar Dropdown */}
          <div className="relative">
            <button
              onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
              className="flex items-center gap-2 p-1 rounded-xl bg-slate-800 border border-slate-700/80 hover:border-slate-600 transition-all cursor-pointer"
            >
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs text-slate-900 shadow-inner"
                style={{ backgroundColor: user.avatar.skinColor }}
              >
                🤖
              </div>
              <span className="text-xs font-bold text-slate-200 hidden lg:inline max-w-[100px] truncate">
                {user.displayName}
              </span>
            </button>

            {isProfileMenuOpen && (
              <div className="absolute right-0 mt-2 w-56 bg-slate-800 border border-slate-700 rounded-2xl shadow-2xl p-2 z-50 text-slate-200 text-sm">
                <div className="p-3 bg-slate-900/60 rounded-xl mb-2 border border-slate-700/50">
                  <p className="font-bold text-white text-sm truncate">{user.displayName}</p>
                  <p className="text-xs text-slate-400 truncate">@{user.username}</p>
                  <div className="mt-2 flex items-center justify-between text-xs text-amber-300">
                    <span>Level {user.level}</span>
                    <span>{user.xp} XP</span>
                  </div>
                </div>

                <button
                  onClick={() => {
                    onSelectTab('AVATAR');
                    setIsProfileMenuOpen(false);
                  }}
                  className="w-full text-left px-3 py-2 rounded-xl hover:bg-slate-700 flex items-center gap-2 text-xs font-medium"
                >
                  <User className="w-4 h-4 text-cyan-400" />
                  Customize Avatar
                </button>

                <button
                  onClick={() => {
                    onSelectTab('CREATOR_DASHBOARD');
                    setIsProfileMenuOpen(false);
                  }}
                  className="w-full text-left px-3 py-2 rounded-xl hover:bg-slate-700 flex items-center gap-2 text-xs font-medium"
                >
                  <SlidersHorizontal className="w-4 h-4 text-indigo-400" />
                  Creator Dashboard
                </button>

                <button
                  onClick={() => {
                    onSelectTab('ADMIN');
                    setIsProfileMenuOpen(false);
                  }}
                  className="w-full text-left px-3 py-2 rounded-xl hover:bg-slate-700 flex items-center gap-2 text-xs font-medium"
                >
                  <Shield className="w-4 h-4 text-rose-400" />
                  Admin & Safety
                </button>

                <div className="my-1 border-t border-slate-700" />

                <button
                  onClick={() => {
                    onOpenAuth();
                    setIsProfileMenuOpen(false);
                  }}
                  className="w-full text-left px-3 py-2 rounded-xl hover:bg-slate-700 flex items-center gap-2 text-xs font-medium text-slate-300"
                >
                  <LogIn className="w-4 h-4 text-emerald-400" />
                  Account / Sign In
                </button>
              </div>
            )}
          </div>

        </div>
      </div>
    </header>
  );
};
