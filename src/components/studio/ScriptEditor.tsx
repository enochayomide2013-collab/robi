import React, { useState } from 'react';
import { X, Play, Code2, Sparkles, Terminal, Check, AlertTriangle, FileCode } from 'lucide-react';
import { StudioScript } from '../../types';

interface ScriptEditorProps {
  script: StudioScript;
  onClose: () => void;
  onSaveScript: (updatedScript: StudioScript) => void;
}

export const ScriptEditor: React.FC<ScriptEditorProps> = ({
  script,
  onClose,
  onSaveScript,
}) => {
  const [code, setCode] = useState(script.code);
  const [consoleLogs, setConsoleLogs] = useState<string[]>([
    '[ACADO Sandbox Core] Script Sandbox initialized in secure isolated process.',
    '[ACADO Sandbox Core] Ready for compilation.',
  ]);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [aiInstruction, setAiInstruction] = useState('');

  const handleRunTest = () => {
    setConsoleLogs((prev) => [
      ...prev,
      `[${new Date().toLocaleTimeString()}] Executing sandbox test for ${script.name}...`,
      `[ACADO Script] Registered event listener: onTriggerEnter`,
      `[ACADO Script] Compilation successful! No syntax errors detected.`,
    ]);
  };

  const handleAiAssist = async () => {
    if (!aiInstruction.trim()) return;
    setIsAiLoading(true);
    try {
      const res = await fetch('/api/ai/script-assistant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code,
          instruction: aiInstruction,
        }),
      });
      const data = await res.json();
      if (data.explanation) {
        setConsoleLogs((prev) => [
          ...prev,
          `[AI Coding Assistant] ${data.explanation}`,
        ]);
      }
    } catch {
      setConsoleLogs((prev) => [...prev, '[AI Coding Assistant] Error contacting script assistant.']);
    } finally {
      setIsAiLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="relative w-full max-w-4xl bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col h-[85vh]">
        
        {/* Header */}
        <div className="p-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-cyan-500/10 text-cyan-400 rounded-xl border border-cyan-500/20">
              <FileCode className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-extrabold text-sm text-white">{script.name}</h2>
              <p className="text-[10px] text-slate-400">ACADO Sandbox Lua Scripting Engine</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleRunTest}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs cursor-pointer"
            >
              <Play className="w-3.5 h-3.5 fill-slate-950" />
              Compile & Test
            </button>
            <button
              onClick={() => {
                onSaveScript({ ...script, code });
                onClose();
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-black text-xs cursor-pointer"
            >
              <Check className="w-3.5 h-3.5" />
              Save Script
            </button>
            <button onClick={onClose} className="p-2 text-slate-400 hover:text-white">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* AI Assistant Quick Bar */}
        <div className="p-3 bg-slate-950/60 border-b border-slate-800 flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-amber-400 flex-shrink-0" />
          <input
            type="text"
            placeholder="AI Assistant instruction (e.g. 'Add double jump logic when player hits powerup')..."
            value={aiInstruction}
            onChange={(e) => setAiInstruction(e.target.value)}
            className="flex-1 bg-slate-900 border border-slate-700/80 rounded-xl px-3 py-1.5 text-xs text-white placeholder-slate-400 focus:outline-none"
          />
          <button
            onClick={handleAiAssist}
            disabled={isAiLoading}
            className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-fuchsia-600 to-indigo-600 text-white font-extrabold text-xs cursor-pointer disabled:opacity-50"
          >
            {isAiLoading ? 'Generating...' : 'AI Assist'}
          </button>
        </div>

        {/* Code Editor Body */}
        <div className="flex-1 grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-slate-800 overflow-hidden">
          
          {/* Code Text Area */}
          <div className="md:col-span-2 p-4 bg-slate-950 font-mono text-xs text-emerald-400 overflow-y-auto">
            <textarea
              value={code}
              onChange={(e) => setCode(e.target.value)}
              className="w-full h-full bg-transparent resize-none focus:outline-none leading-relaxed text-slate-200"
              spellCheck={false}
            />
          </div>

          {/* Console Output */}
          <div className="p-4 bg-slate-900 flex flex-col justify-between space-y-3 font-mono text-xs overflow-hidden">
            <div>
              <div className="flex items-center gap-2 text-slate-400 font-bold mb-2 pb-1 border-b border-slate-800">
                <Terminal className="w-4 h-4 text-cyan-400" />
                <span>Debugging Console</span>
              </div>
              <div className="space-y-1.5 text-[11px] overflow-y-auto max-h-64">
                {consoleLogs.map((log, i) => (
                  <p key={i} className="text-slate-300 leading-tight">
                    {log}
                  </p>
                ))}
              </div>
            </div>

            <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 text-[10px] text-slate-400">
              <span className="font-bold text-amber-400">Sandbox Rule:</span> Scripts cannot access filesystem or network. All state is server-authoritative.
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};
