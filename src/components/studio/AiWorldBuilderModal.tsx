import React, { useState } from 'react';
import { 
  X, Sparkles, Wand2, Compass, Layers, Check, Play, Globe, Hammer, 
  RotateCcw, ShieldAlert, Coins, MessageSquare, Trophy, ChevronRight, Zap
} from 'lucide-react';
import { WorldDefinition, AcadoGame } from '../../types';

export interface AiWorldBuilderModalProps {
  onClose: () => void;
  onApplyGeneratedWorld: (
    worldData: WorldDefinition, 
    meta?: { title?: string; description?: string; category?: string; tags?: string[] }
  ) => void;
  onPlayWorld?: (gameData: AcadoGame) => void;
  onPublishWorld?: (gameData: Partial<AcadoGame>) => void;
}

interface GenerationResult {
  worldData: WorldDefinition;
  title: string;
  description: string;
  category: 'Adventure' | 'Racing' | 'Obby' | 'Sports' | 'RPG' | 'Simulation';
  tags: string[];
  source: string;
}

const PRESET_TEMPLATES = [
  {
    icon: '🏎️',
    label: 'Cyber Speedway',
    category: 'Racing',
    style: 'cyberpunk',
    prompt: 'Create a neon cyber speedway with road straightaways, nitro launch ramp, skyscrapers, and gold coins.',
  },
  {
    icon: '🌋',
    label: 'Volcanic Lava Obby',
    category: 'Obby',
    style: 'volcano',
    prompt: 'Build a thrilling volcanic obby with rising platforms, lava hazard pit beneath, and a summit victory portal.',
  },
  {
    icon: '⚽',
    label: 'Mega Stadium',
    category: 'Sports',
    style: 'night',
    prompt: 'Design a championship football stadium with turf pitch, goal frames, soccer ball, and floodlights.',
  },
  {
    icon: '🚀',
    label: 'Orbital Space Base',
    category: 'Adventure',
    style: 'space',
    prompt: 'Generate an asteroid space station with low gravity, anti-gravity floating pads, and warp jump gates.',
  },
  {
    icon: '🏰',
    label: 'Fantasy Kingdom',
    category: 'RPG',
    style: 'sunset',
    prompt: 'Build a medieval fortress castle with stone drawbridge over water moat, towers, and sovereign coins.',
  },
];

const STYLE_OPTIONS = [
  { id: 'cyberpunk', label: 'Cyber Neon', color: 'from-fuchsia-500 to-cyan-500', bgHex: '#060814' },
  { id: 'sunset', label: 'Sunset Gold', color: 'from-amber-500 to-rose-500', bgHex: '#1e1b4b' },
  { id: 'space', label: 'Deep Space', color: 'from-indigo-600 to-purple-900', bgHex: '#030014' },
  { id: 'volcano', label: 'Volcanic Ash', color: 'from-rose-600 to-orange-600', bgHex: '#260808' },
  { id: 'day', label: 'Sunny Daylight', color: 'from-sky-400 to-emerald-400', bgHex: '#0a192f' },
];

export const AiWorldBuilderModal: React.FC<AiWorldBuilderModalProps> = ({
  onClose,
  onApplyGeneratedWorld,
  onPlayWorld,
  onPublishWorld,
}) => {
  const [prompt, setPrompt] = useState('');
  const [selectedStyle, setSelectedStyle] = useState('cyberpunk');
  const [selectedCategory, setSelectedCategory] = useState<string>('Adventure');
  const [isLoading, setIsLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState(0);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  
  // Generated Result State
  const [result, setResult] = useState<GenerationResult | null>(null);

  const stepLabels = [
    'Analyzing prompt & gameplay mechanics...',
    'Synthesizing 3D terrain & geometric structures...',
    'Placing interactive hazards, ramps & gold coins...',
    'Spawning NPCs with custom roleplay dialogue...',
    'Calibrating lighting, gravity & finish portal...',
  ];

  const handleGenerate = async (customPrompt?: string, customStyle?: string) => {
    const finalPrompt = customPrompt || prompt;
    if (!finalPrompt.trim()) return;

    setIsLoading(true);
    setLoadingStep(0);
    setErrorMsg(null);
    setResult(null);

    // Realistic step progression animation
    const stepInterval = setInterval(() => {
      setLoadingStep((prev) => (prev < stepLabels.length - 1 ? prev + 1 : prev));
    }, 700);

    try {
      const res = await fetch('/api/ai/build-world', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: finalPrompt,
          style: customStyle || selectedStyle,
          category: selectedCategory,
        }),
      });

      const data = await res.json();
      clearInterval(stepInterval);

      if (data.success && data.worldData) {
        setResult({
          worldData: data.worldData,
          title: data.suggestedTitle || 'AI Generated Experience',
          description: data.suggestedDescription || `Custom 3D experience generated from prompt: "${finalPrompt}"`,
          category: data.suggestedCategory || 'Adventure',
          tags: data.suggestedTags || ['3D', 'AI Generated', 'Community'],
          source: data.source || 'gemini',
        });
      } else {
        setErrorMsg(data.error || 'Failed to generate 3D world. Please try again.');
      }
    } catch (err: any) {
      clearInterval(stepInterval);
      setErrorMsg('Network error connecting to AI Architect. Please retry.');
    } finally {
      setIsLoading(false);
    }
  };

  // Quick Action Handlers
  const handlePlayNow = () => {
    if (!result) return;
    const newGame: AcadoGame = {
      id: `ai_game_${Date.now()}`,
      title: result.title,
      description: result.description,
      creatorId: 'ai_architect',
      creatorName: 'AI World Architect',
      thumbnailUrl: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=800&q=80',
      category: result.category as any,
      playerCount: 1,
      maxPlayers: 16,
      likesCount: 12,
      favoritesCount: 8,
      visitsCount: 1,
      rating: 5.0,
      trending: true,
      currentVersion: 'v1.0',
      tags: result.tags,
      worldData: result.worldData,
      activeServers: [
        { id: 'srv_ai_1', name: 'Alpha Instance #1', region: 'US East', currentPlayers: 1, maxPlayers: 16, ping: 18 },
      ],
      achievements: [
        { id: 'ach_ai_1', title: 'World Pioneer', description: 'Explored an AI Architect generated realm', rewardCoins: 100, unlocked: true, progress: 1, maxProgress: 1 },
      ],
      versions: [],
    };

    if (onPlayWorld) {
      onPlayWorld(newGame);
    } else {
      onApplyGeneratedWorld(result.worldData, {
        title: result.title,
        description: result.description,
        category: result.category,
        tags: result.tags,
      });
    }
    onClose();
  };

  const handleEditInStudio = () => {
    if (!result) return;
    onApplyGeneratedWorld(result.worldData, {
      title: result.title,
      description: result.description,
      category: result.category,
      tags: result.tags,
    });
    onClose();
  };

  const handlePublish = () => {
    if (!result) return;
    if (onPublishWorld) {
      onPublishWorld({
        title: result.title,
        description: result.description,
        category: result.category as any,
        tags: result.tags,
        worldData: result.worldData,
      });
    } else {
      onApplyGeneratedWorld(result.worldData, {
        title: result.title,
        description: result.description,
        category: result.category,
        tags: result.tags,
      });
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-slate-900 border border-fuchsia-500/40 rounded-3xl p-6 shadow-2xl space-y-5 my-8">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header with AI Pill */}
        <div className="flex items-center gap-3">
          <div className="p-3 bg-gradient-to-tr from-fuchsia-500 via-indigo-500 to-cyan-500 rounded-2xl text-white shadow-lg shadow-fuchsia-500/20">
            <Sparkles className="w-6 h-6 animate-pulse text-yellow-300" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-black text-white tracking-wide">ACADO AI World Architect</h2>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-fuchsia-500/20 text-fuchsia-300 border border-fuchsia-500/40 uppercase">
                Interactive Builder
              </span>
            </div>
            <p className="text-xs text-slate-400">Describe any 3D game universe. AI creates geometry, physics, hazards, NPCs & quests.</p>
          </div>
        </div>

        {/* View Mode: If we already have a generated result, show the Result Dashboard */}
        {result ? (
          <div className="space-y-5">
            {/* World Generated Success Banner */}
            <div className="p-4 bg-gradient-to-r from-emerald-500/15 via-cyan-500/10 to-indigo-500/15 border border-emerald-500/30 rounded-2xl space-y-3">
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                      WORLD CREATED
                    </span>
                    <span className="text-xs font-bold text-slate-400">
                      Category: <strong className="text-white">{result.category}</strong>
                    </span>
                  </div>
                  <h3 className="text-lg font-black text-white mt-1">{result.title}</h3>
                  <p className="text-xs text-slate-300 mt-0.5 leading-relaxed">{result.description}</p>
                </div>
              </div>

              {/* Stat Badges Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-slate-700/50 text-xs">
                <div className="bg-slate-900/60 p-2 rounded-xl flex items-center gap-2 border border-slate-800">
                  <Layers className="w-4 h-4 text-cyan-400" />
                  <div>
                    <span className="text-[10px] text-slate-400 block font-medium">3D Objects</span>
                    <span className="font-extrabold text-white">{result.worldData.objects.length} Elements</span>
                  </div>
                </div>

                <div className="bg-slate-900/60 p-2 rounded-xl flex items-center gap-2 border border-slate-800">
                  <Coins className="w-4 h-4 text-amber-400" />
                  <div>
                    <span className="text-[10px] text-slate-400 block font-medium">Collectibles</span>
                    <span className="font-extrabold text-amber-300">
                      {result.worldData.objects.filter(o => o.type === 'coin').length} Gold Coins
                    </span>
                  </div>
                </div>

                <div className="bg-slate-900/60 p-2 rounded-xl flex items-center gap-2 border border-slate-800">
                  <MessageSquare className="w-4 h-4 text-fuchsia-400" />
                  <div>
                    <span className="text-[10px] text-slate-400 block font-medium">NPC Guides</span>
                    <span className="font-extrabold text-fuchsia-300">
                      {result.worldData.npcs.length > 0 ? result.worldData.npcs[0].name : 'Active'}
                    </span>
                  </div>
                </div>

                <div className="bg-slate-900/60 p-2 rounded-xl flex items-center gap-2 border border-slate-800">
                  <Trophy className="w-4 h-4 text-emerald-400" />
                  <div>
                    <span className="text-[10px] text-slate-400 block font-medium">World Quests</span>
                    <span className="font-extrabold text-emerald-300">
                      {result.worldData.quests.length > 0 ? `${result.worldData.quests[0].rewardCoins} Coins` : 'Active'}
                    </span>
                  </div>
                </div>
              </div>

              {/* NPC Dialogue Preview */}
              {result.worldData.npcs.length > 0 && result.worldData.npcs[0].dialogue.length > 0 && (
                <div className="bg-slate-900/80 p-2.5 rounded-xl border border-slate-800 text-xs flex items-start gap-2">
                  <span className="text-sm">🤖</span>
                  <div>
                    <span className="font-extrabold text-white">{result.worldData.npcs[0].name}: </span>
                    <span className="text-slate-300 italic">"{result.worldData.npcs[0].dialogue[0]}"</span>
                  </div>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="space-y-2">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">What would you like to do?</span>
              
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                
                {/* 1. Play Now in 3D */}
                <button
                  onClick={handlePlayNow}
                  className="p-3 rounded-2xl bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 text-slate-950 font-black text-xs shadow-lg shadow-emerald-500/20 flex flex-col items-center justify-center gap-1 cursor-pointer transition-transform hover:-translate-y-0.5"
                >
                  <Play className="w-5 h-5 fill-current" />
                  <span>PLAY IN 3D NOW</span>
                  <span className="text-[9px] font-normal text-slate-900">Jump right into the world</span>
                </button>

                {/* 2. Edit in Studio */}
                <button
                  onClick={handleEditInStudio}
                  className="p-3 rounded-2xl bg-gradient-to-r from-fuchsia-600 to-indigo-600 hover:from-fuchsia-500 hover:to-indigo-500 text-white font-black text-xs shadow-lg shadow-fuchsia-500/20 flex flex-col items-center justify-center gap-1 cursor-pointer transition-transform hover:-translate-y-0.5"
                >
                  <Hammer className="w-5 h-5" />
                  <span>OPEN IN STUDIO</span>
                  <span className="text-[9px] font-normal text-fuchsia-200">Inspect & add more blocks</span>
                </button>

                {/* 3. Publish to Universe */}
                <button
                  onClick={handlePublish}
                  className="p-3 rounded-2xl bg-slate-800 hover:bg-slate-750 border border-slate-700 text-white font-black text-xs flex flex-col items-center justify-center gap-1 cursor-pointer transition-colors"
                >
                  <Globe className="w-5 h-5 text-cyan-400" />
                  <span>PUBLISH UNIVERSE</span>
                  <span className="text-[9px] font-normal text-slate-400">Share with ACADO players</span>
                </button>

              </div>
            </div>

            {/* Regenerate or Tweak Option */}
            <div className="pt-2 flex justify-between items-center text-xs">
              <button
                onClick={() => setResult(null)}
                className="flex items-center gap-1 text-slate-400 hover:text-white cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Generate Another World</span>
              </button>

              <span className="text-slate-500 text-[11px]">
                Engine: {result.source === 'gemini' ? 'Gemini 3D Architect' : 'ACADO World Synthesizer'}
              </span>
            </div>

          </div>
        ) : (
          /* Creation View */
          <div className="space-y-4">
            
            {/* Input Text Area */}
            <div className="space-y-1.5">
              <label className="text-xs font-extrabold text-slate-300 uppercase tracking-wider flex items-center justify-between">
                <span>Natural Language Prompt</span>
                <span className="text-[10px] font-normal text-slate-400">Be as specific as you want</span>
              </label>
              <textarea
                rows={3}
                placeholder="e.g., 'Create a high-speed neon cyber speedway with launch ramps, city skyscrapers, race mechanic NPC, and gold coins...'"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                disabled={isLoading}
                className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-3.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-fuchsia-500/50"
              />
            </div>

            {/* Atmosphere & Sky Style Selector */}
            <div className="space-y-1.5">
              <span className="text-[11px] font-extrabold text-slate-300 uppercase tracking-wider">
                Atmosphere & Sky Style
              </span>
              <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
                {STYLE_OPTIONS.map((st) => (
                  <button
                    key={st.id}
                    type="button"
                    onClick={() => setSelectedStyle(st.id)}
                    disabled={isLoading}
                    className={`p-2 rounded-xl border text-xs font-bold transition-all text-center cursor-pointer ${
                      selectedStyle === st.id
                        ? 'bg-slate-800 border-fuchsia-500 text-white shadow-md shadow-fuchsia-500/20'
                        : 'bg-slate-950/70 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-200'
                    }`}
                  >
                    <div className="w-3 h-3 rounded-full mx-auto mb-1" style={{ backgroundColor: st.bgHex }} />
                    <span className="truncate block text-[11px]">{st.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Template Inspiration Chips */}
            <div className="space-y-1.5">
              <span className="text-[11px] font-bold text-slate-400">Quick Inspiration Templates:</span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {PRESET_TEMPLATES.map((tmpl, i) => (
                  <button
                    key={i}
                    disabled={isLoading}
                    onClick={() => {
                      setPrompt(tmpl.prompt);
                      setSelectedStyle(tmpl.style);
                      setSelectedCategory(tmpl.category);
                      handleGenerate(tmpl.prompt, tmpl.style);
                    }}
                    className="p-2.5 rounded-xl bg-slate-800/60 hover:bg-slate-800 border border-slate-700/60 text-left text-xs text-slate-300 hover:text-white transition-colors cursor-pointer flex items-center justify-between"
                  >
                    <span className="flex items-center gap-2 truncate">
                      <span>{tmpl.icon}</span>
                      <span className="font-bold">{tmpl.label}</span>
                    </span>
                    <span className="text-[10px] text-fuchsia-400 font-semibold uppercase">Build →</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Error Message */}
            {errorMsg && (
              <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl text-xs text-rose-300 flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 text-rose-400 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* Loading Progression State */}
            {isLoading && (
              <div className="p-4 bg-slate-950/80 border border-fuchsia-500/30 rounded-2xl space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-black text-fuchsia-300 flex items-center gap-1.5">
                    <Wand2 className="w-4 h-4 animate-spin text-fuchsia-400" />
                    Synthesizing 3D World Elements...
                  </span>
                  <span className="text-slate-400 font-bold">{Math.min(100, (loadingStep + 1) * 20)}%</span>
                </div>

                {/* Progress bar */}
                <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                  <div 
                    className="bg-gradient-to-r from-fuchsia-500 via-indigo-500 to-cyan-400 h-full transition-all duration-500"
                    style={{ width: `${Math.min(100, (loadingStep + 1) * 20)}%` }}
                  />
                </div>

                <div className="text-[11px] text-slate-400 italic">
                  Step {loadingStep + 1} of {stepLabels.length}: {stepLabels[loadingStep]}
                </div>
              </div>
            )}

            {/* Primary Generate Button */}
            {!isLoading && (
              <button
                onClick={() => handleGenerate()}
                disabled={!prompt.trim()}
                className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-fuchsia-600 via-indigo-600 to-cyan-500 hover:from-fuchsia-500 hover:to-cyan-400 text-white font-black text-sm shadow-xl shadow-fuchsia-500/25 cursor-pointer transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                <Sparkles className="w-5 h-5 text-yellow-300 animate-pulse" />
                <span>GENERATE & CREATE 3D WORLD</span>
              </button>
            )}

          </div>
        )}

      </div>
    </div>
  );
};
