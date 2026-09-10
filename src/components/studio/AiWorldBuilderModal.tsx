import React, { useState } from 'react';
import { X, Sparkles, Wand2, Compass, Layers, Check } from 'lucide-react';
import { WorldDefinition } from '../../types';

interface AiWorldBuilderModalProps {
  onClose: () => void;
  onApplyGeneratedWorld: (worldData: WorldDefinition) => void;
}

const SAMPLE_PROMPTS = [
  'Create a city racing game with roads, buildings, traffic lights, a garage and a race track.',
  'Build a cyber obby with 10 floating neon platforms and lava hazard traps.',
  'Design a football stadium with green grass field, goals, lights, and ball.',
  'Generate a fantasy kingdom with stone towers, ancient bridges, and mystery coins.',
];

export const AiWorldBuilderModal: React.FC<AiWorldBuilderModalProps> = ({
  onClose,
  onApplyGeneratedWorld,
}) => {
  const [prompt, setPrompt] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleGenerate = async (targetPrompt?: string) => {
    const finalPrompt = targetPrompt || prompt;
    if (!finalPrompt.trim()) return;

    setIsLoading(true);
    setErrorMsg(null);

    try {
      const res = await fetch('/api/ai/build-world', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: finalPrompt }),
      });

      const data = await res.json();
      if (data.success && data.worldData) {
        onApplyGeneratedWorld(data.worldData);
        onClose();
      } else {
        setErrorMsg(data.error || 'Failed to generate 3D world.');
      }
    } catch (err: any) {
      setErrorMsg('Something went wrong contacting AI World Builder.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="relative w-full max-w-xl bg-slate-900 border border-fuchsia-500/40 rounded-3xl p-6 shadow-2xl space-y-5">
        
        {/* Close */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full bg-slate-800 text-slate-400 hover:text-white"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3">
          <div className="p-3 bg-gradient-to-tr from-fuchsia-500 to-indigo-500 rounded-2xl text-white shadow-lg shadow-fuchsia-500/20">
            <Sparkles className="w-6 h-6 animate-pulse text-yellow-300" />
          </div>
          <div>
            <h2 className="text-xl font-black text-white tracking-wide">ACADO AI World Architect</h2>
            <p className="text-xs text-slate-400">Describe a 3D gaming universe and watch AI construct it</p>
          </div>
        </div>

        {/* Input Text Area */}
        <div className="space-y-2">
          <label className="text-xs font-extrabold text-slate-300 uppercase tracking-wider">
            Natural Language Prompt
          </label>
          <textarea
            rows={3}
            placeholder="e.g., 'Create a city racing game with roads, buildings, traffic lights, a garage and a race track...'"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-3.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-fuchsia-500/50"
          />
        </div>

        {/* Sample Prompts */}
        <div className="space-y-2">
          <span className="text-[11px] font-bold text-slate-400">Sample World Templates:</span>
          <div className="space-y-1.5">
            {SAMPLE_PROMPTS.map((p, i) => (
              <button
                key={i}
                onClick={() => {
                  setPrompt(p);
                  handleGenerate(p);
                }}
                className="w-full text-left p-2.5 rounded-xl bg-slate-800/60 hover:bg-slate-800 border border-slate-700/60 text-xs text-slate-300 hover:text-white transition-colors cursor-pointer truncate"
              >
                ✨ {p}
              </button>
            ))}
          </div>
        </div>

        {errorMsg && (
          <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl text-xs text-rose-300">
            {errorMsg}
          </div>
        )}

        {/* Generate Action Button */}
        <button
          onClick={() => handleGenerate()}
          disabled={isLoading || !prompt.trim()}
          className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-fuchsia-600 via-indigo-600 to-cyan-500 hover:from-fuchsia-500 hover:to-cyan-400 text-white font-black text-sm shadow-xl shadow-fuchsia-500/20 cursor-pointer transition-all disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {isLoading ? (
            <>
              <Wand2 className="w-5 h-5 animate-spin" />
              Building 3D Objects & Terrain...
            </>
          ) : (
            <>
              <Sparkles className="w-5 h-5 text-yellow-300" />
              GENERATE 3D WORLD
            </>
          )}
        </button>

      </div>
    </div>
  );
};
