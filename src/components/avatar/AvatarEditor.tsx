import React, { useState } from 'react';
import { 
  Sparkles, Palette, Shirt, Glasses, Crown, Save, RotateCcw, 
  Check, User, Box, Sliders, Layers, ChevronRight
} from 'lucide-react';
import { AvatarConfiguration, OutfitPreset, ItemCosmetic, HeadStyleType, BodyShapeType } from '../../types';
import { Avatar3DViewer } from './Avatar3DViewer';

interface AvatarEditorProps {
  currentConfig: AvatarConfiguration;
  onSaveConfig: (newConfig: AvatarConfiguration) => void;
  inventory?: ItemCosmetic[];
}

// Comprehensive Skin Tones
const NATURAL_SKIN_TONES = [
  { name: 'Classic Gold', color: '#FFC107' },
  { name: 'Pale Ivory', color: '#FFE0B2' },
  { name: 'Fair Peach', color: '#FFD54F' },
  { name: 'Warm Honey', color: '#FFB74D' },
  { name: 'Sun Tan', color: '#FFA726' },
  { name: 'Bronze', color: '#A1887F' },
  { name: 'Mocha', color: '#8D6E63' },
  { name: 'Deep Espresso', color: '#4E342E' },
  { name: 'Midnight Charcoal', color: '#212121' },
];

const CYBER_SKIN_TONES = [
  { name: 'ACADO Cyan', color: '#00E5FF' },
  { name: 'Neon Purple', color: '#A855F7' },
  { name: 'Cyber Indigo', color: '#6366F1' },
  { name: 'Plasma Pink', color: '#EC4899' },
  { name: 'Emerald Alien', color: '#10B981' },
  { name: 'Solar Flame', color: '#F97316' },
  { name: 'Frost White', color: '#F1F5F9' },
];

const TORSO_COLORS = [
  '#1E88E5', '#E63946', '#2A9D8F', '#F4A261', '#E76F51',
  '#263238', '#9C27B0', '#FF007F', '#00F5D4', '#FFFFFF',
];

const LEGS_COLORS = [
  '#263238', '#1D3557', '#37474F', '#212121', '#455A64',
  '#8D6E63', '#3A0CA3', '#101010',
];

// Available Head Styles
const HEAD_OPTIONS: { id: HeadStyleType; name: string; icon: string; description: string }[] = [
  {
    id: 'block',
    name: 'Classic Block Head',
    icon: '🧊',
    description: 'Iconic cubic block head with clean geometric bevels',
  },
  {
    id: 'round',
    name: 'Spherical / Round',
    icon: '⚪',
    description: 'Smooth rounded organic dome with friendly soft contours',
  },
  {
    id: 'cyber',
    name: 'Cyber Helmet',
    icon: '🤖',
    description: 'Angled cybernetic helmet with neon visor strip and antenna',
  },
  {
    id: 'diamond',
    name: 'Diamond Faceted',
    icon: '💎',
    description: 'Angular faceted diamond prism head for futuristic avatars',
  },
  {
    id: 'flat',
    name: 'Flat Top Broad',
    icon: '🛡️',
    description: 'Wide chiseled jawline and flat-top heroic profile',
  },
];

// Available Body Shapes
const BODY_SHAPE_OPTIONS: { id: BodyShapeType; name: string; tag: string; description: string; ratio: string }[] = [
  {
    id: 'standard',
    name: 'Standard Classic',
    tag: 'Balanced 1.0x',
    description: 'Traditional ACADO block proportions. Balanced torso and limbs.',
    ratio: '1.0x',
  },
  {
    id: 'slim',
    name: 'Slim / Athletic',
    tag: 'Agile & Sleek',
    description: 'Tapered athletic torso with slender limbs for agile parkour.',
    ratio: '0.85x Width',
  },
  {
    id: 'heavy',
    name: 'Heavy / Brawny',
    tag: 'Sturdy Tank',
    description: 'Wide muscular chest and heavy arms for a powerhouse look.',
    ratio: '1.35x Width',
  },
  {
    id: 'tall',
    name: 'Tall / Stature',
    tag: 'Elongated',
    description: 'Extended torso and lengthened legs for towering heights.',
    ratio: '1.25x Height',
  },
  {
    id: 'chibi',
    name: 'Chibi / Compact',
    tag: 'Cute Miniature',
    description: 'Petite body with large expressive head and compact limbs.',
    ratio: '0.65x Torso',
  },
];

export const AvatarEditor: React.FC<AvatarEditorProps> = ({
  currentConfig,
  onSaveConfig,
  inventory = [],
}) => {
  const [config, setConfig] = useState<AvatarConfiguration>(currentConfig);
  const [activeTab, setActiveTab] = useState<'essentials' | 'clothing' | 'hats' | 'accessories' | 'presets'>('essentials');
  const [skinCategory, setSkinCategory] = useState<'natural' | 'cyber'>('natural');
  const [savedPresets, setSavedPresets] = useState<OutfitPreset[]>([
    { id: 'p_cyber', name: 'Cyber Neon Legend', config: currentConfig },
    { 
      id: 'p_hero', 
      name: 'Classic Hero Outfit', 
      config: { 
        ...currentConfig, 
        headStyle: 'block',
        bodyShape: 'standard',
        skinColor: '#FFD54F', 
        torsoColor: '#E63946', 
        legsColor: '#1D3557' 
      } 
    },
    {
      id: 'p_chibi',
      name: 'Cyber Chibi Explorer',
      config: {
        ...currentConfig,
        headStyle: 'cyber',
        bodyShape: 'chibi',
        skinColor: '#00E5FF',
        torsoColor: '#263238',
        legsColor: '#212121',
      }
    }
  ]);
  const [isSaved, setIsSaved] = useState(false);

  const handleSave = () => {
    onSaveConfig(config);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2000);
  };

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 space-y-6">
      
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white tracking-wide flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-cyan-400" />
            3D Avatar Customization Studio
          </h1>
          <p className="text-xs text-slate-400">
            Customize your head shape, body proportions, skin complexion, and gear in full 3D
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            id="avatar-reset-btn"
            onClick={() => setConfig(currentConfig)}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-800 text-slate-300 hover:text-white border border-slate-700 text-xs font-bold cursor-pointer transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Reset
          </button>
          <button
            id="avatar-save-btn"
            onClick={handleSave}
            className="flex items-center gap-1.5 px-5 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-500 hover:from-cyan-400 hover:to-indigo-400 text-slate-950 font-black text-xs shadow-lg shadow-cyan-500/20 cursor-pointer transition-all"
          >
            {isSaved ? <Check className="w-4 h-4 text-slate-950" /> : <Save className="w-4 h-4" />}
            {isSaved ? 'Saved to Profile!' : 'Save Avatar'}
          </button>
        </div>
      </div>

      {/* Main Customizer Layout Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: 3D Interactive Stage with Rotation & Zoom */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-4 shadow-xl space-y-4">
            <div className="flex items-center justify-between px-1">
              <span className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                <Box className="w-4 h-4 text-cyan-400" />
                3D Interactive Viewport
              </span>
              <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-cyan-500/10 text-cyan-300 font-bold border border-cyan-500/20">
                Orbit & Zoom Active
              </span>
            </div>

            {/* 3D WebGL Canvas Preview Component */}
            <Avatar3DViewer 
              config={config} 
              className="w-full h-80 sm:h-96" 
              animate={true} 
              showControls={true} 
            />

            {/* Current Specs Summary Bar */}
            <div className="grid grid-cols-3 gap-2 p-2.5 bg-slate-950/80 rounded-2xl border border-slate-800 text-[11px]">
              <div>
                <span className="text-slate-500 block">Head Shape</span>
                <span className="font-bold text-cyan-400 capitalize">{config.headStyle || 'Block'}</span>
              </div>
              <div>
                <span className="text-slate-500 block">Body Shape</span>
                <span className="font-bold text-indigo-400 capitalize">{config.bodyShape || 'Standard'}</span>
              </div>
              <div>
                <span className="text-slate-500 block">Skin Tone</span>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span 
                    className="w-3 h-3 rounded-full border border-slate-600 inline-block" 
                    style={{ backgroundColor: config.skinColor }} 
                  />
                  <span className="font-mono text-[10px] text-slate-300">{config.skinColor}</span>
                </div>
              </div>
            </div>

            {/* Quick Animation Stances */}
            <div className="space-y-1.5">
              <span className="text-[11px] font-bold text-slate-400 block px-1">Animation Stance:</span>
              <div className="grid grid-cols-3 gap-2">
                {(['idle_bounce', 'hero_pose', 'spin'] as const).map((anim) => (
                  <button
                    key={anim}
                    onClick={() => setConfig({ ...config, equippedAnimation: anim })}
                    className={`py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                      config.equippedAnimation === anim
                        ? 'bg-cyan-500/20 border-cyan-400 text-cyan-300 shadow-sm'
                        : 'bg-slate-800/80 border-slate-700/80 text-slate-400 hover:text-white'
                    }`}
                  >
                    {anim === 'idle_bounce' && 'Idle Bounce'}
                    {anim === 'hero_pose' && 'Hero Stance'}
                    {anim === 'spin' && 'Victory Spin'}
                  </button>
                ))}
              </div>
            </div>

          </div>
        </div>

        {/* Right Column: Customization Controls & Tabs */}
        <div className="lg:col-span-7 bg-slate-900/90 border border-slate-800 rounded-3xl p-5 shadow-xl flex flex-col justify-between space-y-6">
          
          <div>
            {/* Category Navigation Tabs */}
            <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-slate-800 scrollbar-none">
              <button
                id="tab-btn-essentials"
                onClick={() => setActiveTab('essentials')}
                className={`flex items-center gap-1.5 px-4 py-2.5 rounded-2xl font-black text-xs whitespace-nowrap cursor-pointer transition-all ${
                  activeTab === 'essentials'
                    ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/25 scale-102'
                    : 'bg-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                <Sliders className="w-3.5 h-3.5" />
                Head, Body & Skin
              </button>
              <button
                id="tab-btn-clothing"
                onClick={() => setActiveTab('clothing')}
                className={`flex items-center gap-1.5 px-3.5 py-2.5 rounded-2xl font-black text-xs whitespace-nowrap cursor-pointer transition-all ${
                  activeTab === 'clothing'
                    ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/25'
                    : 'bg-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                <Shirt className="w-3.5 h-3.5" />
                Clothing & Colors
              </button>
              <button
                id="tab-btn-hats"
                onClick={() => setActiveTab('hats')}
                className={`flex items-center gap-1.5 px-3.5 py-2.5 rounded-2xl font-black text-xs whitespace-nowrap cursor-pointer transition-all ${
                  activeTab === 'hats'
                    ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/25'
                    : 'bg-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                <Crown className="w-3.5 h-3.5" />
                Hats & Visors
              </button>
              <button
                id="tab-btn-accessories"
                onClick={() => setActiveTab('accessories')}
                className={`flex items-center gap-1.5 px-3.5 py-2.5 rounded-2xl font-black text-xs whitespace-nowrap cursor-pointer transition-all ${
                  activeTab === 'accessories'
                    ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/25'
                    : 'bg-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                <Glasses className="w-3.5 h-3.5" />
                Back & Gear
              </button>
              <button
                id="tab-btn-presets"
                onClick={() => setActiveTab('presets')}
                className={`flex items-center gap-1.5 px-3.5 py-2.5 rounded-2xl font-black text-xs whitespace-nowrap cursor-pointer transition-all ${
                  activeTab === 'presets'
                    ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/25'
                    : 'bg-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                <Save className="w-3.5 h-3.5" />
                Outfits
              </button>
            </div>

            {/* TAB CONTENTS */}
            <div className="mt-5 space-y-6">
              
              {/* PRIMARY ESSENTIALS TAB: HEAD, BODY SHAPE, SKIN TONE */}
              {activeTab === 'essentials' && (
                <div className="space-y-6">
                  
                  {/* 1. HEAD STYLE SELECTION */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-black text-white uppercase tracking-wider flex items-center gap-1.5">
                        <Box className="w-4 h-4 text-cyan-400" />
                        1. Head Style & Geometry
                      </label>
                      <span className="text-[11px] text-cyan-400 font-bold">
                        Selected: {HEAD_OPTIONS.find((h) => h.id === (config.headStyle || 'block'))?.name}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
                      {HEAD_OPTIONS.map((head) => {
                        const isSelected = (config.headStyle || 'block') === head.id;
                        return (
                          <div
                            key={head.id}
                            id={`head-option-${head.id}`}
                            onClick={() => setConfig({ ...config, headStyle: head.id })}
                            className={`p-3 rounded-2xl border cursor-pointer transition-all flex flex-col justify-between ${
                              isSelected
                                ? 'bg-cyan-500/15 border-cyan-400 shadow-md shadow-cyan-500/10'
                                : 'bg-slate-950/70 border-slate-800 hover:border-slate-700 hover:bg-slate-800/40'
                            }`}
                          >
                            <div className="flex items-start justify-between">
                              <span className="text-2xl p-1 bg-slate-900 rounded-xl border border-slate-800">
                                {head.icon}
                              </span>
                              {isSelected && (
                                <span className="p-1 rounded-full bg-cyan-400 text-slate-950">
                                  <Check className="w-3 h-3 stroke-[3]" />
                                </span>
                              )}
                            </div>
                            <div className="mt-2.5">
                              <h4 className="text-xs font-extrabold text-white">{head.name}</h4>
                              <p className="text-[10px] text-slate-400 line-clamp-2 mt-0.5">{head.description}</p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* 2. BODY SHAPE SELECTION */}
                  <div className="space-y-3 pt-4 border-t border-slate-800">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-black text-white uppercase tracking-wider flex items-center gap-1.5">
                        <User className="w-4 h-4 text-indigo-400" />
                        2. Body Shape & Proportions
                      </label>
                      <span className="text-[11px] text-indigo-400 font-bold">
                        Selected: {BODY_SHAPE_OPTIONS.find((b) => b.id === (config.bodyShape || 'standard'))?.name}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
                      {BODY_SHAPE_OPTIONS.map((shape) => {
                        const isSelected = (config.bodyShape || 'standard') === shape.id;
                        return (
                          <div
                            key={shape.id}
                            id={`body-shape-${shape.id}`}
                            onClick={() => setConfig({ ...config, bodyShape: shape.id })}
                            className={`p-3 rounded-2xl border cursor-pointer transition-all flex flex-col justify-between ${
                              isSelected
                                ? 'bg-indigo-500/15 border-indigo-400 shadow-md shadow-indigo-500/10'
                                : 'bg-slate-950/70 border-slate-800 hover:border-slate-700 hover:bg-slate-800/40'
                            }`}
                          >
                            <div className="flex items-center justify-between">
                              <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-300">
                                {shape.ratio}
                              </span>
                              {isSelected && (
                                <span className="p-1 rounded-full bg-indigo-400 text-slate-950">
                                  <Check className="w-3 h-3 stroke-[3]" />
                                </span>
                              )}
                            </div>
                            <div className="mt-2.5">
                              <div className="flex items-center justify-between">
                                <h4 className="text-xs font-extrabold text-white">{shape.name}</h4>
                              </div>
                              <p className="text-[10px] text-slate-400 mt-0.5">{shape.description}</p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* 3. SKIN TONE SELECTION */}
                  <div className="space-y-3 pt-4 border-t border-slate-800">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <label className="text-xs font-black text-white uppercase tracking-wider flex items-center gap-1.5">
                        <Palette className="w-4 h-4 text-amber-400" />
                        3. Skin Tone Complexion
                      </label>

                      {/* Natural vs Cyber Category Pill */}
                      <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800">
                        <button
                          onClick={() => setSkinCategory('natural')}
                          className={`px-3 py-1 rounded-lg text-[10px] font-bold transition-colors cursor-pointer ${
                            skinCategory === 'natural'
                              ? 'bg-amber-400 text-slate-950 font-black'
                              : 'text-slate-400 hover:text-white'
                          }`}
                        >
                          Natural Tones
                        </button>
                        <button
                          onClick={() => setSkinCategory('cyber')}
                          className={`px-3 py-1 rounded-lg text-[10px] font-bold transition-colors cursor-pointer ${
                            skinCategory === 'cyber'
                              ? 'bg-cyan-500 text-slate-950 font-black'
                              : 'text-slate-400 hover:text-white'
                          }`}
                        >
                          Cyber Tones
                        </button>
                      </div>
                    </div>

                    {/* Skin Tone Swatches */}
                    <div className="grid grid-cols-3 sm:grid-cols-5 gap-2.5">
                      {(skinCategory === 'natural' ? NATURAL_SKIN_TONES : CYBER_SKIN_TONES).map((item) => {
                        const isSelected = config.skinColor.toLowerCase() === item.color.toLowerCase();
                        return (
                          <button
                            key={item.color}
                            id={`skin-color-${item.color.replace('#', '')}`}
                            onClick={() => setConfig({ ...config, skinColor: item.color })}
                            className={`p-2 rounded-2xl border transition-all cursor-pointer flex flex-col items-center gap-1.5 ${
                              isSelected
                                ? 'border-cyan-400 bg-cyan-500/15 ring-2 ring-cyan-400/40'
                                : 'border-slate-800 bg-slate-950/80 hover:border-slate-700'
                            }`}
                          >
                            <span
                              className="w-8 h-8 rounded-full border border-black/20 shadow-inner flex items-center justify-center"
                              style={{ backgroundColor: item.color }}
                            >
                              {isSelected && <Check className="w-4 h-4 text-slate-950 drop-shadow" />}
                            </span>
                            <span className="text-[10px] font-bold text-slate-300 text-center leading-tight">
                              {item.name}
                            </span>
                          </button>
                        );
                      })}
                    </div>

                    {/* Custom Hex Color Picker */}
                    <div className="flex items-center gap-3 p-3 bg-slate-950 rounded-2xl border border-slate-800 mt-2">
                      <div className="flex items-center gap-2">
                        <input
                          id="avatar-custom-color-picker"
                          type="color"
                          value={config.skinColor}
                          onChange={(e) => setConfig({ ...config, skinColor: e.target.value })}
                          className="w-8 h-8 rounded-lg cursor-pointer bg-transparent border-0"
                          title="Pick custom hex skin tone"
                        />
                        <span className="text-xs font-bold text-slate-300">Custom Skin Tone Hex:</span>
                      </div>
                      <input
                        type="text"
                        value={config.skinColor}
                        onChange={(e) => setConfig({ ...config, skinColor: e.target.value })}
                        placeholder="#FFC107"
                        className="bg-slate-900 border border-slate-700 rounded-xl px-3 py-1 text-xs font-mono text-cyan-400 w-28 uppercase focus:outline-none focus:border-cyan-400"
                      />
                    </div>
                  </div>

                </div>
              )}

              {/* CLOTHING & COLORS TAB */}
              {activeTab === 'clothing' && (
                <div className="space-y-5">
                  {/* Torso Color */}
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-300 block">Torso / Shirt Color</label>
                    <div className="flex flex-wrap gap-2">
                      {TORSO_COLORS.map((color) => (
                        <button
                          key={color}
                          onClick={() => setConfig({ ...config, torsoColor: color, armsColor: color })}
                          className={`w-9 h-9 rounded-full border-2 transition-transform cursor-pointer hover:scale-110 flex items-center justify-center ${
                            config.torsoColor === color ? 'border-cyan-400 scale-110 ring-2 ring-cyan-500/50' : 'border-slate-700'
                          }`}
                          style={{ backgroundColor: color }}
                        >
                          {config.torsoColor === color && <Check className="w-4 h-4 text-slate-950 drop-shadow" />}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Legs Color */}
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-300 block">Pants / Legs Color</label>
                    <div className="flex flex-wrap gap-2">
                      {LEGS_COLORS.map((color) => (
                        <button
                          key={color}
                          onClick={() => setConfig({ ...config, legsColor: color })}
                          className={`w-9 h-9 rounded-full border-2 transition-transform cursor-pointer hover:scale-110 flex items-center justify-center ${
                            config.legsColor === color ? 'border-cyan-400 scale-110 ring-2 ring-cyan-500/50' : 'border-slate-700'
                          }`}
                          style={{ backgroundColor: color }}
                        >
                          {config.legsColor === color && <Check className="w-4 h-4 text-slate-950 drop-shadow" />}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Equippable Clothing from Inventory */}
                  <div className="space-y-2 pt-3 border-t border-slate-800">
                    <label className="text-xs font-bold text-slate-300 block">Equipped Outfits</label>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                      <div
                        onClick={() => setConfig({ ...config, clothingId: undefined })}
                        className={`p-3 rounded-2xl border cursor-pointer flex flex-col items-center justify-center text-center transition-all ${
                          !config.clothingId ? 'border-cyan-400 bg-cyan-500/15' : 'border-slate-800 bg-slate-950/70 hover:border-slate-700'
                        }`}
                      >
                        <span className="text-2xl mb-1">🚫</span>
                        <span className="text-xs font-bold text-slate-200">Default Plain Shirt</span>
                      </div>
                      {inventory
                        .filter((item) => item.category === 'clothing')
                        .map((item) => (
                          <div
                            key={item.id}
                            onClick={() => setConfig({ ...config, clothingId: item.id })}
                            className={`p-3 rounded-2xl border cursor-pointer flex flex-col items-center justify-center text-center transition-all ${
                              config.clothingId === item.id ? 'border-cyan-400 bg-cyan-500/15' : 'border-slate-800 bg-slate-950/70 hover:border-slate-700'
                            }`}
                          >
                            <span className="text-2xl mb-1">{item.imageUrl}</span>
                            <span className="text-xs font-bold text-slate-200">{item.name}</span>
                            <span className="text-[10px] text-cyan-400 font-semibold mt-1">Equipped</span>
                          </div>
                        ))}
                    </div>
                  </div>
                </div>
              )}

              {/* HATS TAB */}
              {activeTab === 'hats' && (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  <div
                    onClick={() => setConfig({ ...config, hatId: undefined })}
                    className={`p-3 rounded-2xl border cursor-pointer flex flex-col items-center justify-center text-center transition-all ${
                      !config.hatId ? 'border-cyan-400 bg-cyan-500/15' : 'border-slate-800 bg-slate-950/70 hover:border-slate-700'
                    }`}
                  >
                    <span className="text-2xl mb-1">🚫</span>
                    <span className="text-xs font-bold text-slate-200">No Hat</span>
                  </div>
                  {inventory
                    .filter((item) => item.category === 'hat')
                    .map((item) => (
                      <div
                        key={item.id}
                        onClick={() => setConfig({ ...config, hatId: item.id })}
                        className={`p-3 rounded-2xl border cursor-pointer flex flex-col items-center justify-center text-center transition-all ${
                          config.hatId === item.id ? 'border-cyan-400 bg-cyan-500/15' : 'border-slate-800 bg-slate-950/70 hover:border-slate-700'
                        }`}
                      >
                        <span className="text-2xl mb-1">{item.imageUrl}</span>
                        <span className="text-xs font-bold text-slate-200">{item.name}</span>
                        <span className="text-[10px] text-amber-400 font-medium mt-0.5">{item.rarity}</span>
                      </div>
                    ))}
                </div>
              )}

              {/* ACCESSORIES TAB */}
              {activeTab === 'accessories' && (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  <div
                    onClick={() => setConfig({ ...config, backAccessoryId: undefined })}
                    className={`p-3 rounded-2xl border cursor-pointer flex flex-col items-center justify-center text-center transition-all ${
                      !config.backAccessoryId ? 'border-cyan-400 bg-cyan-500/15' : 'border-slate-800 bg-slate-950/70 hover:border-slate-700'
                    }`}
                  >
                    <span className="text-2xl mb-1">🚫</span>
                    <span className="text-xs font-bold text-slate-200">No Back Gear</span>
                  </div>
                  {inventory
                    .filter((item) => item.category === 'back' || item.category === 'glasses')
                    .map((item) => (
                      <div
                        key={item.id}
                        onClick={() => setConfig({ ...config, backAccessoryId: item.id })}
                        className={`p-3 rounded-2xl border cursor-pointer flex flex-col items-center justify-center text-center transition-all ${
                          config.backAccessoryId === item.id ? 'border-cyan-400 bg-cyan-500/15' : 'border-slate-800 bg-slate-950/70 hover:border-slate-700'
                        }`}
                      >
                        <span className="text-2xl mb-1">{item.imageUrl}</span>
                        <span className="text-xs font-bold text-slate-200">{item.name}</span>
                        <span className="text-[10px] text-fuchsia-400 font-semibold mt-0.5">{item.rarity}</span>
                      </div>
                    ))}
                </div>
              )}

              {/* PRESETS TAB */}
              {activeTab === 'presets' && (
                <div className="space-y-3">
                  <p className="text-xs text-slate-300 p-3 bg-slate-950 rounded-2xl border border-slate-800">
                    Switch between saved outfit configurations or create your signature look.
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {savedPresets.map((preset) => (
                      <div
                        key={preset.id}
                        onClick={() => setConfig(preset.config)}
                        className="p-3 bg-slate-950/90 border border-slate-800 rounded-2xl hover:border-cyan-400 cursor-pointer flex items-center justify-between transition-all"
                      >
                        <div className="flex items-center gap-3">
                          <div
                            className="w-10 h-10 rounded-xl flex items-center justify-center font-bold text-slate-900 border border-slate-700"
                            style={{ backgroundColor: preset.config.skinColor }}
                          >
                            👕
                          </div>
                          <div>
                            <p className="font-extrabold text-xs text-white">{preset.name}</p>
                            <p className="text-[10px] text-slate-400">
                              {preset.config.headStyle || 'Block'} • {preset.config.bodyShape || 'Standard'}
                            </p>
                          </div>
                        </div>
                        <Check className="w-4 h-4 text-cyan-400" />
                      </div>
                    ))}
                  </div>
                </div>
              )}

            </div>
          </div>

          <div className="pt-4 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
            <span>Avatar Engine: ACADO WebGL 3D</span>
            <span className="text-cyan-400 font-bold">Interactive Orbit & Zoom Enabled</span>
          </div>

        </div>

      </div>

    </div>
  );
};
