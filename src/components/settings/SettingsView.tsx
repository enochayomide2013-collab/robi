import React, { useState } from 'react';
import { Settings, Eye, Volume2, Shield, Monitor, Sparkles } from 'lucide-react';

export const SettingsView: React.FC = () => {
  const [graphicsQuality, setGraphicsQuality] = useState<'low' | 'medium' | 'high' | 'ultra'>('high');
  const [volume, setVolume] = useState(80);
  const [textSize, setTextSize] = useState<'normal' | 'large'>('normal');
  const [highContrast, setHighContrast] = useState(false);

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6 space-y-6">
      
      {/* Header */}
      <div>
        <h1 className="text-2xl font-black text-white tracking-wide flex items-center gap-2">
          <Settings className="w-6 h-6 text-cyan-400" />
          Settings & Accessibility
        </h1>
        <p className="text-xs text-slate-400">Configure graphics rendering, sound volume, controls, and accessibility options</p>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-6">
        
        {/* Graphics Settings */}
        <div className="space-y-3">
          <h3 className="text-sm font-extrabold text-white flex items-center gap-2">
            <Monitor className="w-4 h-4 text-cyan-400" />
            3D WebGL Graphics Preset
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {(['low', 'medium', 'high', 'ultra'] as const).map((preset) => (
              <button
                key={preset}
                onClick={() => setGraphicsQuality(preset)}
                className={`py-2.5 rounded-2xl text-xs font-black uppercase cursor-pointer transition-all ${
                  graphicsQuality === preset ? 'bg-cyan-500 text-slate-950' : 'bg-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                {preset}
              </button>
            ))}
          </div>
        </div>

        {/* Audio Volume */}
        <div className="space-y-3">
          <h3 className="text-sm font-extrabold text-white flex items-center gap-2">
            <Volume2 className="w-4 h-4 text-amber-400" />
            Master Audio Volume ({volume}%)
          </h3>
          <input
            type="range"
            min="0"
            max="100"
            value={volume}
            onChange={(e) => setVolume(Number(e.target.value))}
            className="w-full accent-cyan-500"
          />
        </div>

        {/* Accessibility Features */}
        <div className="space-y-3 pt-4 border-t border-slate-800">
          <h3 className="text-sm font-extrabold text-white flex items-center gap-2">
            <Eye className="w-4 h-4 text-indigo-400" />
            Accessibility & UI Options
          </h3>
          
          <div className="flex items-center justify-between p-3 bg-slate-950 rounded-2xl border border-slate-800">
            <span className="text-xs font-bold text-slate-300">High Contrast Mode</span>
            <input
              type="checkbox"
              checked={highContrast}
              onChange={(e) => setHighContrast(e.target.checked)}
              className="accent-cyan-500 rounded"
            />
          </div>
        </div>

      </div>

    </div>
  );
};
