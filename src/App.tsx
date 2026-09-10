import React, { useState } from 'react';
import { 
  Flame, Sparkles, Gamepad2, Compass, Play, Trophy, Users, Heart, ArrowRight, ShieldCheck 
} from 'lucide-react';
import { NavigationTab, UserProfile, AcadoGame, ItemCosmetic, WorldDefinition } from './types';
import { INITIAL_USER, SEED_GAMES, COSMETIC_MARKETPLACE, COMMUNITIES_SEED, LIVE_EVENTS_SEED, INITIAL_MODERATION_REPORTS } from './data/mockData';

// Layout
import { Navbar } from './components/layout/Navbar';
import { Sidebar } from './components/layout/Sidebar';

// Views
import { GameCard } from './components/game/GameCard';
import { GameDetailsModal } from './components/game/GameDetailsModal';
import { GameRunner3D } from './components/game/GameRunner3D';
import { AvatarEditor } from './components/avatar/AvatarEditor';
import { AcadoStudio } from './components/studio/AcadoStudio';
import { AiWorldBuilderModal } from './components/studio/AiWorldBuilderModal';
import { FriendsView } from './components/social/FriendsView';
import { CommunitiesView } from './components/social/CommunitiesView';
import { EventsView } from './components/social/EventsView';
import { MessagesView } from './components/social/MessagesView';
import { MarketplaceView } from './components/marketplace/MarketplaceView';
import { CreatorDashboard } from './components/dashboard/CreatorDashboard';
import { AdminDashboard } from './components/admin/AdminDashboard';
import { AuthModal } from './components/auth/AuthModal';
import { SettingsView } from './components/settings/SettingsView';
import { HelpCenterView } from './components/help/HelpCenterView';

export function App() {
  const [currentTab, setCurrentTab] = useState<NavigationTab>('HOME');
  const [user, setUser] = useState<UserProfile>(INITIAL_USER);
  const [games, setGames] = useState<AcadoGame[]>(SEED_GAMES);
  const [favorites, setFavorites] = useState<string[]>(['game_1', 'game_3']);
  
  // Selected Game Details Modal
  const [selectedGameDetails, setSelectedGameDetails] = useState<AcadoGame | null>(null);

  // Active 3D Playing Experience State
  const [activePlayingGame, setActivePlayingGame] = useState<AcadoGame | null>(null);

  // Studio loaded world from AI Architect
  const [studioWorldData, setStudioWorldData] = useState<WorldDefinition | null>(null);
  const [studioGameMeta, setStudioGameMeta] = useState<{ title?: string; description?: string; category?: string; tags?: string[] } | null>(null);

  // Modals
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isAiBuilderOpen, setIsAiBuilderOpen] = useState(false);

  // Filter state for Discover
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  // Handler for favoriting games
  const handleToggleFavorite = (gameId: string) => {
    if (favorites.includes(gameId)) {
      setFavorites(favorites.filter((id) => id !== gameId));
    } else {
      setFavorites([...favorites, gameId]);
    }
  };

  // Handler for adding A-Coins reward
  const handleRewardCoins = (amount: number) => {
    setUser((prev) => ({ ...prev, coins: prev.coins + amount }));
  };

  // Handler for publishing new game from Studio
  const handlePublishGame = (newGameData: Partial<AcadoGame>) => {
    const created: AcadoGame = {
      id: `game_${Date.now()}`,
      title: newGameData.title || 'Untitled ACADO World',
      description: newGameData.description || 'Custom 3D user-created world',
      creatorId: user.id,
      creatorName: user.displayName,
      thumbnailUrl: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=800&q=80',
      category: newGameData.category || 'Adventure',
      playerCount: 1,
      maxPlayers: 16,
      likesCount: 5,
      favoritesCount: 2,
      visitsCount: 10,
      rating: 5.0,
      trending: true,
      currentVersion: 'v1.0',
      tags: newGameData.tags || ['3D', 'Community', 'Custom'],
      worldData: (newGameData.worldData as any) || SEED_GAMES[0].worldData,
      activeServers: [
        { id: 'srv_custom_1', name: 'Server #1 (US East)', region: 'US East', currentPlayers: 1, maxPlayers: 16, ping: 22 },
      ],
      achievements: [
        { id: 'ach_c1', title: 'Pioneer Explorer', description: 'Joined this user created world', rewardCoins: 50, unlocked: true, progress: 1, maxProgress: 1 },
      ],
      versions: [
        { versionNumber: 'v1.0', releaseDate: '2026-09-10', changelog: 'Initial publish to ACADO Universe', worldDataSnapshot: (newGameData.worldData as any) || SEED_GAMES[0].worldData },
      ],
    };

    setGames([created, ...games]);
    handleRewardCoins(100);
  };

  // Handler for purchasing cosmetics
  const handlePurchaseItem = (item: ItemCosmetic) => {
    setUser((prev) => ({
      ...prev,
      coins: prev.coins - item.price,
      inventory: [...(prev.inventory || []), item],
    }));
  };

  // Filtered games for Home / Discover
  const filteredGames = games.filter((g) => {
    if (selectedCategory !== 'All' && g.category !== selectedCategory) return false;
    return true;
  });

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans flex flex-col antialiased selection:bg-cyan-500 selection:text-slate-950">
      
      {/* 3D WebGL Runner Fullscreen Overlay */}
      {activePlayingGame && (
        <GameRunner3D
          game={activePlayingGame}
          user={user}
          onExitGame={() => setActivePlayingGame(null)}
          onRewardCoins={handleRewardCoins}
        />
      )}

      {/* Main Platform Header Navbar */}
      <Navbar
        user={user}
        currentTab={currentTab}
        onSelectTab={setCurrentTab}
        games={games}
        onSelectGame={(g) => setSelectedGameDetails(g)}
        onOpenAuth={() => setIsAuthOpen(true)}
        onOpenAiBuilder={() => setIsAiBuilderOpen(true)}
        unreadNotificationCount={2}
      />

      <div className="flex-1 flex w-full">
        
        {/* Navigation Sidebar */}
        <Sidebar
          currentTab={currentTab}
          onSelectTab={setCurrentTab}
          unreadMessagesCount={1}
          unreadNotificationsCount={2}
        />

        {/* Main Content Area */}
        <main className="flex-1 min-w-0 pb-16">
          
          {/* HOME TAB */}
          {(currentTab === 'HOME' || currentTab === 'DISCOVER' || currentTab === 'PLAY') && (
            <div className="max-w-7xl mx-auto p-4 sm:p-6 space-y-8">
              
              {/* Featured Experience Hero Banner */}
              <div className="relative rounded-3xl overflow-hidden bg-slate-900 border border-slate-800/80 shadow-2xl">
                <div className="relative h-72 sm:h-96 w-full">
                  <img
                    src={games[0].thumbnailUrl || "https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=1200&q=80"}
                    alt={games[0].title}
                    className="w-full h-full object-cover filter brightness-90"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/50 to-transparent" />

                  <div className="absolute bottom-6 left-6 right-6 flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4">
                    <div className="space-y-2 max-w-2xl">
                      <div className="flex items-center gap-2">
                        <span className="px-3 py-1 rounded-xl bg-rose-500 text-white font-black text-xs shadow-lg flex items-center gap-1">
                          <Flame className="w-3.5 h-3.5 fill-white" />
                          FEATURED HARDCORE OBBY
                        </span>
                        <span className="px-3 py-1 rounded-xl bg-slate-800/80 backdrop-blur-md text-cyan-300 font-bold text-xs border border-cyan-500/30">
                          {games[0].playerCount.toLocaleString()} Players Online
                        </span>
                      </div>

                      <h1 className="text-3xl sm:text-4xl font-black text-white tracking-wide">{games[0].title}</h1>
                      <p className="text-xs sm:text-sm text-slate-300 line-clamp-2 font-medium">
                        {games[0].description}
                      </p>
                    </div>

                    <button
                      onClick={() => setActivePlayingGame(games[0])}
                      className="px-8 py-3.5 rounded-2xl bg-gradient-to-r from-rose-500 via-amber-500 to-yellow-400 hover:from-rose-400 hover:to-yellow-300 text-slate-950 font-black text-base shadow-xl shadow-amber-500/30 transform hover:scale-105 transition-all cursor-pointer flex items-center gap-2"
                    >
                      <Play className="w-5 h-5 fill-slate-950" />
                      PLAY HARDCORE OBBY
                    </button>
                  </div>
                </div>
              </div>

              {/* AI World Builder Interactive Banner */}
              <div className="relative rounded-3xl p-5 bg-gradient-to-r from-fuchsia-950/40 via-indigo-950/40 to-slate-900 border border-fuchsia-500/30 shadow-xl flex flex-col md:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="p-3.5 rounded-2xl bg-gradient-to-tr from-fuchsia-600 via-indigo-600 to-cyan-500 text-white shadow-lg shadow-fuchsia-500/25 shrink-0">
                    <Sparkles className="w-7 h-7 animate-pulse text-yellow-300" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="text-base sm:text-lg font-black text-white">Create 3D Games with AI World Architect</h2>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-fuchsia-500/20 text-fuchsia-300 border border-fuchsia-500/40 uppercase">New</span>
                    </div>
                    <p className="text-xs text-slate-300 mt-0.5">Prompt any game concept — racing tracks, volcanic obbys, sports arenas, or space outposts — and AI will build the 3D world instantly!</p>
                  </div>
                </div>
                <button
                  onClick={() => setIsAiBuilderOpen(true)}
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-fuchsia-500 to-indigo-600 hover:from-fuchsia-400 hover:to-indigo-500 text-white font-black text-xs shadow-lg shadow-fuchsia-500/20 cursor-pointer whitespace-nowrap flex items-center gap-2 transition-transform hover:scale-105 shrink-0"
                >
                  <Sparkles className="w-4 h-4 text-yellow-300" />
                  Launch AI Builder
                </button>
              </div>

              {/* Categories Filter Bar */}
              <div className="flex items-center justify-between gap-4 overflow-x-auto pb-2 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  {['All', 'Racing', 'Obby', 'Football', 'Adventure', 'Tycoon'].map((cat) => (
                    <button
                      key={cat}
                      onClick={() => setSelectedCategory(cat)}
                      className={`px-4 py-2 rounded-2xl text-xs font-black uppercase cursor-pointer transition-all ${
                        selectedCategory === cat
                          ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/20'
                          : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>

                <div className="text-xs font-bold text-slate-400 hidden sm:block whitespace-nowrap">
                  Showing {filteredGames.length} 3D Experiences
                </div>
              </div>

              {/* Games Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredGames.map((game) => (
                  <GameCard
                    key={game.id}
                    game={game}
                    onSelectGame={(g) => setSelectedGameDetails(g)}
                    onPlayGame={(g) => setActivePlayingGame(g)}
                    isFavorite={favorites.includes(game.id)}
                    onToggleFavorite={(id) => handleToggleFavorite(id)}
                  />
                ))}
              </div>

            </div>
          )}

          {/* AVATAR TAB */}
          {currentTab === 'AVATAR' && (
            <AvatarEditor
              currentConfig={user.avatar}
              onSaveConfig={(newConfig) => setUser({ ...user, avatar: newConfig })}
              inventory={user.inventory}
            />
          )}

          {/* INVENTORY & MARKETPLACE TAB */}
          {currentTab === 'INVENTORY' && (
            <MarketplaceView
              user={user}
              items={COSMETIC_MARKETPLACE}
              onPurchaseItem={handlePurchaseItem}
            />
          )}

          {/* CREATE / ACADO STUDIO TAB */}
          {currentTab === 'CREATE' && (
            <AcadoStudio 
              onPublishGame={handlePublishGame}
              initialWorldData={studioWorldData}
              initialGameMeta={studioGameMeta}
              onPlayTestGame={(g) => setActivePlayingGame(g)}
            />
          )}

          {/* FRIENDS TAB */}
          {currentTab === 'FRIENDS' && (
            <FriendsView
              user={user}
              onPlayGame={(g) => setActivePlayingGame(g)}
              games={games}
            />
          )}

          {/* COMMUNITIES TAB */}
          {currentTab === 'COMMUNITIES' && (
            <CommunitiesView communities={COMMUNITIES_SEED} />
          )}

          {/* EVENTS TAB */}
          {currentTab === 'EVENTS' && (
            <EventsView events={LIVE_EVENTS_SEED} />
          )}

          {/* MESSAGES TAB */}
          {currentTab === 'MESSAGES' && <MessagesView />}

          {/* CREATOR DASHBOARD TAB */}
          {currentTab === 'CREATOR_DASHBOARD' && <CreatorDashboard games={games} />}

          {/* ADMIN DASHBOARD TAB */}
          {currentTab === 'ADMIN' && <AdminDashboard reports={INITIAL_MODERATION_REPORTS} />}

          {/* SETTINGS TAB */}
          {currentTab === 'SETTINGS' && <SettingsView />}

          {/* HELP TAB */}
          {currentTab === 'HELP' && <HelpCenterView />}

        </main>
      </div>

      {/* GAME DETAILS MODAL */}
      {selectedGameDetails && (
        <GameDetailsModal
          game={selectedGameDetails}
          onClose={() => setSelectedGameDetails(null)}
          onPlayGame={(g) => {
            setSelectedGameDetails(null);
            setActivePlayingGame(g);
          }}
          isFavorite={favorites.includes(selectedGameDetails.id)}
          onToggleFavorite={handleToggleFavorite}
          allGames={games}
          onSelectRelatedGame={(g) => setSelectedGameDetails(g)}
        />
      )}

      {/* AUTH MODAL */}
      {isAuthOpen && (
        <AuthModal
          onClose={() => setIsAuthOpen(false)}
          onLoginSuccess={(username) => setUser({ ...user, displayName: username, username })}
        />
      )}

      {/* AI WORLD BUILDER MODAL */}
      {isAiBuilderOpen && (
        <AiWorldBuilderModal
          onClose={() => setIsAiBuilderOpen(false)}
          onApplyGeneratedWorld={(genWorld, meta) => {
            setStudioWorldData(genWorld);
            setStudioGameMeta(meta || null);
            setCurrentTab('CREATE');
          }}
          onPlayWorld={(newGame) => {
            setGames((prev) => [newGame, ...prev]);
            setActivePlayingGame(newGame);
          }}
          onPublishWorld={(newGameData) => {
            handlePublishGame(newGameData);
            setCurrentTab('HOME');
          }}
        />
      )}

    </div>
  );
}

export default App;
