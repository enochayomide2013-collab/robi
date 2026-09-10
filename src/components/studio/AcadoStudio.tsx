import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { 
  Hammer, Play, Sparkles, Layers, Plus, Trash2, Copy, Undo, Redo, 
  Save, Globe, FileCode, Sliders, Box, Move, RotateCw, Palette, Check, RefreshCw 
} from 'lucide-react';
import { WorldDefinition, World3DObject, StudioScript, AcadoGame } from '../../types';
import { ScriptEditor } from './ScriptEditor';
import { AiWorldBuilderModal } from './AiWorldBuilderModal';

interface AcadoStudioProps {
  onPublishGame: (gameData: Partial<AcadoGame>) => void;
}

const DEFAULT_WORLD: WorldDefinition = {
  skyColor: '#0a0a23',
  timeOfDay: 'day',
  weather: 'clear',
  gravity: 9.8,
  spawnPoint: [0, 1, 0],
  objects: [
    { id: 'obj_1', name: 'Start Platform', type: 'block', position: [0, 0, 0], rotation: [0, 0, 0], scale: [8, 0.4, 8], color: '#1E88E5', material: 'smooth' },
    { id: 'obj_2', name: 'Neon Checkpoint', type: 'checkpoint', position: [0, 1, 10], rotation: [0, 0, 0], scale: [4, 0.2, 4], color: '#00F5D4', material: 'neon' },
  ],
  scripts: [
    { id: 'sc_init', name: 'MainLogic.lua', code: '-- ACADO Game Script\nfunction onGameStart()\n  print("World loaded successfully!");\nend', enabled: true, lastEdited: '2026-09-10' },
  ],
  npcs: [],
  quests: [],
};

export const AcadoStudio: React.FC<AcadoStudioProps> = ({ onPublishGame }) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const [worldData, setWorldData] = useState<WorldDefinition>(DEFAULT_WORLD);
  const [selectedObjId, setSelectedObjId] = useState<string | null>('obj_1');
  const [activeScript, setActiveScript] = useState<StudioScript | null>(null);
  const [showAiBuilder, setShowAiBuilder] = useState(false);
  const [showPublishModal, setShowPublishModal] = useState(false);

  // Game Metadata for publishing
  const [gameTitle, setGameTitle] = useState('My Custom 3D World');
  const [gameDescription, setGameDescription] = useState('An exciting original 3D experience built in ACADO Studio!');
  const [gameCategory, setGameCategory] = useState<'Adventure' | 'Racing' | 'Obby' | 'Football' | 'Tycoon'>('Adventure');
  const [isPublished, setIsPublished] = useState(false);

  const selectedObject = worldData.objects.find((o) => o.id === selectedObjId);

  // THREE.JS CANVAS PREVIEW
  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const width = container.clientWidth || 600;
    const height = container.clientHeight || 450;

    const scene = new THREE.Scene();
    const skyHex = parseInt(worldData.skyColor.replace('#', '0x'), 16) || 0x0a0a23;
    scene.background = new THREE.Color(skyHex);

    const camera = new THREE.PerspectiveCamera(50, width / height, 0.1, 200);
    camera.position.set(12, 12, 18);
    camera.lookAt(0, 2, 0);

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    container.appendChild(renderer.domElement);

    // Lights
    scene.add(new THREE.AmbientLight(0xffffff, 0.8));
    const dirLight = new THREE.DirectionalLight(0xffffff, 1.2);
    dirLight.position.set(10, 20, 10);
    scene.add(dirLight);

    // Grid Floor
    const grid = new THREE.GridHelper(100, 20, 0x00e5ff, 0x334155);
    scene.add(grid);

    // Render Objects
    worldData.objects.forEach((obj) => {
      const colorHex = parseInt((obj.color || '#00E5FF').replace('#', '0x'), 16);
      let mat = new THREE.MeshStandardMaterial({ color: colorHex });
      if (obj.material === 'neon') {
        mat = new THREE.MeshStandardMaterial({ color: colorHex, emissive: colorHex, emissiveIntensity: 0.8 });
      }

      let geo: THREE.BufferGeometry;
      if (obj.type === 'sphere') geo = new THREE.SphereGeometry(obj.scale[0] / 2, 16, 16);
      else if (obj.type === 'cylinder') geo = new THREE.CylinderGeometry(obj.scale[0] / 2, obj.scale[0] / 2, obj.scale[1], 16);
      else geo = new THREE.BoxGeometry(obj.scale[0], obj.scale[1], obj.scale[2]);

      const mesh = new THREE.Mesh(geo, mat);
      mesh.position.set(obj.position[0], obj.position[1], obj.position[2]);
      mesh.rotation.set(obj.rotation[0], obj.rotation[1], obj.rotation[2]);
      scene.add(mesh);

      // Highlight selected object
      if (obj.id === selectedObjId) {
        const bbox = new THREE.BoxHelper(mesh, 0xffff00);
        scene.add(bbox);
      }
    });

    let animationFrameId: number;
    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      renderer.render(scene, camera);
    };
    animate();

    return () => {
      cancelAnimationFrame(animationFrameId);
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, [worldData, selectedObjId]);

  // Object Manipulation Helpers
  const handleAddObject = (type: World3DObject['type'], color = '#00E5FF') => {
    const newObj: World3DObject = {
      id: `obj_${Date.now()}`,
      name: `New ${type}`,
      type,
      position: [0, 1, worldData.objects.length * 2],
      rotation: [0, 0, 0],
      scale: [2, 2, 2],
      color,
      material: 'smooth',
    };
    setWorldData({
      ...worldData,
      objects: [...worldData.objects, newObj],
    });
    setSelectedObjId(newObj.id);
  };

  const handleDeleteSelected = () => {
    if (!selectedObjId) return;
    setWorldData({
      ...worldData,
      objects: worldData.objects.filter((o) => o.id !== selectedObjId),
    });
    setSelectedObjId(null);
  };

  const handleUpdateSelectedProp = (key: keyof World3DObject, value: any) => {
    if (!selectedObjId) return;
    setWorldData({
      ...worldData,
      objects: worldData.objects.map((o) => (o.id === selectedObjId ? { ...o, [key]: value } : o)),
    });
  };

  const handlePublish = () => {
    onPublishGame({
      title: gameTitle,
      description: gameDescription,
      category: gameCategory,
      worldData,
    });
    setIsPublished(true);
    setTimeout(() => {
      setIsPublished(false);
      setShowPublishModal(false);
    }, 1500);
  };

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 space-y-6">
      
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-slate-900 border border-slate-800 rounded-3xl p-4 shadow-xl">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-gradient-to-tr from-cyan-500 to-indigo-500 text-slate-950 font-black rounded-2xl shadow-lg shadow-cyan-500/20">
            <Hammer className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-black text-white tracking-wide">ACADO STUDIO</h1>
            <p className="text-xs text-slate-400">3D World Creation & Sandbox Engine</p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setShowAiBuilder(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-gradient-to-r from-fuchsia-600 to-indigo-600 hover:from-fuchsia-500 hover:to-indigo-500 text-white font-extrabold text-xs shadow-lg shadow-fuchsia-500/20 cursor-pointer"
          >
            <Sparkles className="w-4 h-4 text-yellow-300" />
            AI World Builder
          </button>
          
          <button
            onClick={() => setActiveScript(worldData.scripts[0])}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-extrabold text-xs cursor-pointer"
          >
            <FileCode className="w-4 h-4 text-cyan-400" />
            Script Editor
          </button>

          <button
            onClick={() => setShowPublishModal(true)}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-black text-xs shadow-lg shadow-cyan-500/20 cursor-pointer"
          >
            <Globe className="w-4 h-4" />
            Publish World
          </button>
        </div>
      </div>

      {/* Main Studio Workspace Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Toolbar: Asset Library */}
        <div className="lg:col-span-3 bg-slate-900 border border-slate-800 rounded-3xl p-4 shadow-xl space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800">
            <span className="text-xs font-extrabold text-slate-400 uppercase tracking-wider">3D Asset Library</span>
            <Box className="w-4 h-4 text-cyan-400" />
          </div>

          <div className="space-y-2">
            <button
              onClick={() => handleAddObject('block', '#1E88E5')}
              className="w-full p-2.5 bg-slate-800/80 hover:bg-slate-800 border border-slate-700 rounded-2xl text-left text-xs font-bold text-white flex items-center justify-between cursor-pointer"
            >
              <span>+ Cube / Platform</span>
              <span className="text-[10px] text-cyan-400">Block</span>
            </button>
            <button
              onClick={() => handleAddObject('building', '#3A0CA3')}
              className="w-full p-2.5 bg-slate-800/80 hover:bg-slate-800 border border-slate-700 rounded-2xl text-left text-xs font-bold text-white flex items-center justify-between cursor-pointer"
            >
              <span>+ Building Tower</span>
              <span className="text-[10px] text-indigo-400">Building</span>
            </button>
            <button
              onClick={() => handleAddObject('road', '#1E1E2E')}
              className="w-full p-2.5 bg-slate-800/80 hover:bg-slate-800 border border-slate-700 rounded-2xl text-left text-xs font-bold text-white flex items-center justify-between cursor-pointer"
            >
              <span>+ Road Track</span>
              <span className="text-[10px] text-slate-400">Road</span>
            </button>
            <button
              onClick={() => handleAddObject('car', '#00E5FF')}
              className="w-full p-2.5 bg-slate-800/80 hover:bg-slate-800 border border-slate-700 rounded-2xl text-left text-xs font-bold text-white flex items-center justify-between cursor-pointer"
            >
              <span>+ Racing Car</span>
              <span className="text-[10px] text-cyan-300">Vehicle</span>
            </button>
            <button
              onClick={() => handleAddObject('coin', '#FFD700')}
              className="w-full p-2.5 bg-slate-800/80 hover:bg-slate-800 border border-slate-700 rounded-2xl text-left text-xs font-bold text-white flex items-center justify-between cursor-pointer"
            >
              <span>+ Gold Coin</span>
              <span className="text-[10px] text-amber-400">Collectible</span>
            </button>
            <button
              onClick={() => handleAddObject('lava_hazard', '#FF0000')}
              className="w-full p-2.5 bg-slate-800/80 hover:bg-slate-800 border border-slate-700 rounded-2xl text-left text-xs font-bold text-white flex items-center justify-between cursor-pointer"
            >
              <span>+ Lava Hazard</span>
              <span className="text-[10px] text-rose-400">Trap</span>
            </button>
          </div>

          <div className="pt-4 border-t border-slate-800">
            <span className="text-[11px] font-extrabold text-slate-400 uppercase tracking-wider block mb-2">Scene Objects ({worldData.objects.length})</span>
            <div className="space-y-1 max-h-48 overflow-y-auto pr-1">
              {worldData.objects.map((obj) => (
                <div
                  key={obj.id}
                  onClick={() => setSelectedObjId(obj.id)}
                  className={`p-2 rounded-xl text-xs font-bold cursor-pointer flex items-center justify-between ${
                    selectedObjId === obj.id ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40' : 'bg-slate-800/40 text-slate-400 hover:text-white'
                  }`}
                >
                  <span className="truncate">{obj.name}</span>
                  <span className="text-[10px] opacity-70">{obj.type}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Center 3D Viewport */}
        <div className="lg:col-span-6 space-y-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-3 shadow-xl relative">
            <div className="flex items-center justify-between px-2 mb-2 text-xs text-slate-400 font-bold">
              <span>3D Studio Viewport</span>
              <div className="flex items-center gap-2">
                <button onClick={handleDeleteSelected} disabled={!selectedObjId} className="p-1.5 text-rose-400 hover:bg-slate-800 rounded-lg cursor-pointer disabled:opacity-30">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div ref={mountRef} className="w-full h-96 rounded-2xl overflow-hidden bg-slate-950" />
          </div>
        </div>

        {/* Right Inspector Panel */}
        <div className="lg:col-span-3 bg-slate-900 border border-slate-800 rounded-3xl p-4 shadow-xl space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800">
            <span className="text-xs font-extrabold text-slate-400 uppercase tracking-wider">Object Inspector</span>
            <Sliders className="w-4 h-4 text-cyan-400" />
          </div>

          {selectedObject ? (
            <div className="space-y-4 text-xs">
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase">Object Name</label>
                <input
                  type="text"
                  value={selectedObject.name}
                  onChange={(e) => handleUpdateSelectedProp('name', e.target.value)}
                  className="w-full mt-1 bg-slate-800 border border-slate-700 rounded-xl px-3 py-1.5 text-white font-bold"
                />
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase">Color Hex</label>
                <input
                  type="color"
                  value={selectedObject.color}
                  onChange={(e) => handleUpdateSelectedProp('color', e.target.value)}
                  className="w-full h-8 mt-1 bg-slate-800 border border-slate-700 rounded-xl cursor-pointer"
                />
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase">Material Finish</label>
                <select
                  value={selectedObject.material || 'smooth'}
                  onChange={(e) => handleUpdateSelectedProp('material', e.target.value)}
                  className="w-full mt-1 bg-slate-800 border border-slate-700 rounded-xl px-3 py-1.5 text-white font-bold"
                >
                  <option value="smooth">Smooth Standard</option>
                  <option value="neon">Neon Emissive Glow</option>
                  <option value="brick">Brick Texture</option>
                  <option value="metal">Reflective Metal</option>
                </select>
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase">Y Position (Height)</label>
                <input
                  type="range"
                  min="0"
                  max="20"
                  step="0.5"
                  value={selectedObject.position[1]}
                  onChange={(e) =>
                    handleUpdateSelectedProp('position', [
                      selectedObject.position[0],
                      parseFloat(e.target.value),
                      selectedObject.position[2],
                    ])
                  }
                  className="w-full mt-1 accent-cyan-500"
                />
              </div>
            </div>
          ) : (
            <div className="text-center py-8 text-xs text-slate-500">
              Select an object from the viewport or scene list to edit properties.
            </div>
          )}
        </div>

      </div>

      {/* SCRIPT EDITOR MODAL */}
      {activeScript && (
        <ScriptEditor
          script={activeScript}
          onClose={() => setActiveScript(null)}
          onSaveScript={(updated) => {
            setWorldData({
              ...worldData,
              scripts: worldData.scripts.map((s) => (s.id === updated.id ? updated : s)),
            });
          }}
        />
      )}

      {/* AI WORLD BUILDER MODAL */}
      {showAiBuilder && (
        <AiWorldBuilderModal
          onClose={() => setShowAiBuilder(false)}
          onApplyGeneratedWorld={(genWorld) => {
            setWorldData(genWorld);
          }}
        />
      )}

      {/* PUBLISH GAME MODAL */}
      {showPublishModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 max-w-md w-full space-y-4 shadow-2xl">
            <h2 className="text-xl font-black text-white">Publish to ACADO Universe</h2>
            
            <div className="space-y-3">
              <div>
                <label className="text-xs font-bold text-slate-300">Experience Title</label>
                <input
                  type="text"
                  value={gameTitle}
                  onChange={(e) => setGameTitle(e.target.value)}
                  className="w-full mt-1 bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-300">Description</label>
                <textarea
                  rows={3}
                  value={gameDescription}
                  onChange={(e) => setGameDescription(e.target.value)}
                  className="w-full mt-1 bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-300">Category</label>
                <select
                  value={gameCategory}
                  onChange={(e) => setGameCategory(e.target.value as any)}
                  className="w-full mt-1 bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
                >
                  <option value="Adventure">Adventure</option>
                  <option value="Racing">Racing</option>
                  <option value="Obby">Obby</option>
                  <option value="Football">Football</option>
                  <option value="Tycoon">Tycoon</option>
                </select>
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                onClick={() => setShowPublishModal(false)}
                className="flex-1 py-2.5 bg-slate-800 text-slate-300 text-xs font-bold rounded-xl"
              >
                Cancel
              </button>
              <button
                onClick={handlePublish}
                className="flex-1 py-2.5 bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-xs font-black rounded-xl"
              >
                {isPublished ? 'Published! 🎉' : 'Publish Now'}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
