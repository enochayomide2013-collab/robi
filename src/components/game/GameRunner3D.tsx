import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import confetti from 'canvas-confetti';
import { 
  X, Volume2, VolumeX, Trophy, Navigation, Sparkles, 
  Flame, RotateCcw, Zap, Compass 
} from 'lucide-react';
import { AcadoGame, UserProfile, WorldDefinition, HeadStyleType, BodyShapeType, World3DObject } from '../../types';
import { InGameChatWindow, ChatMessage } from './InGameChatWindow';
import { audioSynth } from '../../utils/audioSynth';

interface GameRunner3DProps {
  game: AcadoGame;
  user: UserProfile;
  onExitGame: () => void;
  onRewardCoins: (amount: number) => void;
}

interface PlatformData {
  id: string;
  mesh: THREE.Mesh;
  type: string;
  behavior?: string;
  stage?: number;
  initialPos: THREE.Vector3;
  size: THREE.Vector3;
  axis?: 'x' | 'y' | 'z';
  distance?: number;
  speed?: number;
  isGhost?: boolean;
}

export const GameRunner3D: React.FC<GameRunner3DProps> = ({
  game,
  user,
  onExitGame,
  onRewardCoins,
}) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const playerBubbleRef = useRef<HTMLDivElement>(null);
  const other1BubbleRef = useRef<HTMLDivElement>(null);
  const other2BubbleRef = useRef<HTMLDivElement>(null);
  const chatInputRef = useRef<HTMLInputElement>(null);

  const isObby = game.category === 'Obby' || game.tags?.some(t => t.toLowerCase().includes('obby'));

  const [isMuted, setIsMuted] = useState(audioSynth.isMuted);
  const [coinsCollected, setCoinsCollected] = useState(0);
  const [speedMeter, setSpeedMeter] = useState(0);
  const [hasWon, setHasWon] = useState(false);

  // Hardcore Obby & Parkour State
  const [currentStage, setCurrentStage] = useState(0);
  const [deathCount, setDeathCount] = useState(0);
  const [isDeadFlashing, setIsDeadFlashing] = useState(false);
  const [isSprinting, setIsSprinting] = useState(false);
  const [checkpointBanner, setCheckpointBanner] = useState<string | null>(null);
  const [timerSec, setTimerSec] = useState(0);

  // Active speech bubbles for overhead display
  const [activeSpeech, setActiveSpeech] = useState<{
    player?: { text: string; sender: string };
    other1?: { text: string; sender: string };
    other2?: { text: string; sender: string };
  }>({});

  // Chat Focus State (prevents player WASD/Space movement while typing)
  const isChatFocusedRef = useRef(false);

  // Respawns & Checkpoints
  const currentCheckpointPosRef = useRef<[number, number, number]>([
    game.worldData?.spawnPoint?.[0] || 0,
    (game.worldData?.spawnPoint?.[1] || 1) + 0.5,
    game.worldData?.spawnPoint?.[2] || 0,
  ]);
  const currentCheckpointStageRef = useRef<number>(0);
  const isRespawningRef = useRef(false);
  const respawnPlayerRef = useRef<((reason?: string) => void) | null>(null);

  // In-Game Chat Messages (Send & Receive)
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    {
      id: 'sys_welcome',
      sender: 'Server',
      senderType: 'system',
      text: isObby 
        ? 'Connected to INFERNO GAUNTLET Server #1 • Checkpoint System Active • [R] to Reset' 
        : 'Connected to ACADO World Server #1 • Low Latency 18ms',
      timestamp: '12:00',
    },
    {
      id: 'msg_greet_1',
      sender: 'ObbyDemon99',
      senderType: 'other',
      text: isObby 
        ? `Yo ${user.displayName}! Hold Shift to sprint-jump across the Stage 1 gaps!` 
        : `Yo ${user.displayName}! Ready to explore?`,
      timestamp: '12:01',
      color: 'text-amber-400',
    },
    {
      id: 'msg_greet_2',
      sender: 'PixelQueen',
      senderType: 'other',
      text: isObby 
        ? 'Watch out for the Stage 4 Meatgrinder! The rotating blade is brutal.' 
        : 'Nice avatar build! Let’s go!',
      timestamp: '12:01',
      color: 'text-fuchsia-400',
    },
  ]);

  // NPC Dialogue Modal State
  const [activeNpc, setActiveNpc] = useState<{ name: string; role: string; dialogue: string[] } | null>(null);
  const [npcReply, setNpcReply] = useState<string>('');
  const [npcInput, setNpcInput] = useState<string>('');
  const [isNpcLoading, setIsNpcLoading] = useState(false);

  // Stopwatch timer for speedrun
  useEffect(() => {
    if (hasWon) return;
    const interval = setInterval(() => {
      setTimerSec((prev) => prev + 0.1);
    }, 100);
    return () => clearInterval(interval);
  }, [hasWon]);

  // Helper to format time (e.g. 02:45.3)
  const formatStopwatch = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = (seconds % 60).toFixed(1);
    return `${mins.toString().padStart(2, '0')}:${secs.padStart(4, '0')}`;
  };

  // Helper to trigger speech bubbles
  const showSpeechBubble = (target: 'player' | 'other1' | 'other2', sender: string, text: string) => {
    setActiveSpeech((prev) => ({
      ...prev,
      [target]: { text, sender },
    }));

    setTimeout(() => {
      setActiveSpeech((prev) => {
        const next = { ...prev };
        if (next[target]?.text === text) {
          delete next[target];
        }
        return next;
      });
    }, 4500);
  };

  // Helper to append a received message from simulated player
  const receiveMessage = (sender: string, text: string, target: 'other1' | 'other2' = 'other1', color = 'text-amber-400') => {
    const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const newMsg: ChatMessage = {
      id: 'msg_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4),
      sender,
      senderType: 'other',
      text,
      timestamp: timeStr,
      color,
    };

    setChatMessages((prev) => [...prev, newMsg]);
    showSpeechBubble(target, sender, text);
  };

  // Handle Player Sending a Message
  const handleSendMessage = (text: string) => {
    const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const userMsg: ChatMessage = {
      id: 'msg_' + Date.now(),
      sender: user.displayName,
      senderType: 'player',
      text,
      timestamp: timeStr,
      color: 'text-cyan-400',
    };

    setChatMessages((prev) => [...prev, userMsg]);
    showSpeechBubble('player', user.displayName, text);

    // Contextual automated multiplayer chat replies
    const lower = text.toLowerCase();
    setTimeout(() => {
      if (lower.includes('hard') || lower.includes('died') || lower.includes('rage') || lower.includes('lava') || lower.includes('fail')) {
        receiveMessage('ObbyDemon99', `Don't give up! Took me 12 tries to pass the tightrope section.`, 'other1', 'text-amber-400');
      } else if (lower.includes('gg') || lower.includes('win') || lower.includes('finish') || lower.includes('apex')) {
        receiveMessage('PixelQueen', 'GG! That was an insane run! 🏆', 'other2', 'text-fuchsia-400');
      } else if (lower.includes('jump') || lower.includes('sprint') || lower.includes('shift')) {
        receiveMessage('ObbyDemon99', 'Sprint-jumping right at the platform edge gives you maximum air distance!', 'other1', 'text-amber-400');
      } else {
        const casualReplies = isObby ? [
          'Watch the timing on the ghost platforms!',
          'The trampoline jump at Stage 8 is wild!',
          `You got this ${user.displayName}! Keep pushing!`,
          'Reset with [R] if you ever miss a landing.',
        ] : [
          `Solid move, ${user.displayName}!`,
          'Catch me if you can!',
          'This world map is awesome!',
        ];
        const randomReply = casualReplies[Math.floor(Math.random() * casualReplies.length)];
        const responder = Math.random() > 0.5 ? 'ObbyDemon99' : 'PixelQueen';
        const target = responder === 'ObbyDemon99' ? 'other1' : 'other2';
        const color = responder === 'ObbyDemon99' ? 'text-amber-400' : 'text-fuchsia-400';
        receiveMessage(responder, randomReply, target, color);
      }
    }, 1200);
  };

  // Toggle Mute Handler
  const toggleMute = () => {
    const nextMute = !isMuted;
    setIsMuted(nextMute);
    audioSynth.isMuted = nextMute;
  };

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    let width = container.clientWidth || 800;
    let height = container.clientHeight || 500;

    // SCENE
    const scene = new THREE.Scene();
    
    // Skybox / Fog setup
    const worldDef: WorldDefinition = game.worldData || {
      skyColor: '#1a0505',
      timeOfDay: 'sunset',
      weather: 'fog',
      gravity: 9.8,
      spawnPoint: [0, 1.5, 0],
      objects: [],
      scripts: [],
      npcs: [],
      quests: [],
    };
    const skyHex = parseInt((worldDef.skyColor || '#1a0505').replace('#', '0x'), 16);
    scene.background = new THREE.Color(skyHex);
    scene.fog = new THREE.FogExp2(skyHex, isObby ? 0.008 : 0.015);

    // CAMERA
    const camera = new THREE.PerspectiveCamera(60, width / height, 0.1, 800);

    // RENDERER
    const renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    container.appendChild(renderer.domElement);

    // LIGHTS
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.75);
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0xffeedd, 1.3);
    dirLight.position.set(30, 70, 30);
    dirLight.castShadow = true;
    dirLight.shadow.mapSize.width = 1024;
    dirLight.shadow.mapSize.height = 1024;
    dirLight.shadow.camera.near = 10;
    dirLight.shadow.camera.far = 250;
    dirLight.shadow.camera.left = -50;
    dirLight.shadow.camera.right = 50;
    dirLight.shadow.camera.top = 50;
    dirLight.shadow.camera.bottom = -50;
    scene.add(dirLight);

    // Secondary atmospheric colored backlight
    const backLight = new THREE.DirectionalLight(isObby ? 0xff4500 : 0x4f46e5, 0.8);
    backLight.position.set(-30, 20, -50);
    scene.add(backLight);

    // TERRAIN / ENVIRONMENT
    if (!isObby) {
      // Safe base ground for non-obby games
      const groundGeo = new THREE.PlaneGeometry(400, 400);
      const groundMat = new THREE.MeshStandardMaterial({ 
        color: 0x1e293b, 
        roughness: 0.8,
        metalness: 0.2
      });
      const ground = new THREE.Mesh(groundGeo, groundMat);
      ground.rotation.x = -Math.PI / 2;
      ground.receiveShadow = true;
      scene.add(ground);

      const gridHelper = new THREE.GridHelper(400, 80, 0x00e5ff, 0x334155);
      gridHelper.position.y = 0.02;
      scene.add(gridHelper);
    } else {
      // Obby Void / Distant Molten Lava Sea with animated ambient glow
      const lavaGeo = new THREE.PlaneGeometry(400, 600);
      const lavaMat = new THREE.MeshStandardMaterial({
        color: 0xd91e0a,
        emissive: 0x991b1b,
        emissiveIntensity: 0.6,
        roughness: 0.3,
        metalness: 0.1,
      });
      const lavaPlane = new THREE.Mesh(lavaGeo, lavaMat);
      lavaPlane.rotation.x = -Math.PI / 2;
      lavaPlane.position.set(0, -4.5, -120);
      scene.add(lavaPlane);
    }

    // ==========================================
    // PLATFORMS, COLLIDERS, COINS, CHECKPOINTS
    // ==========================================
    const platforms: PlatformData[] = [];
    const collidableObjects: { mesh: THREE.Mesh; type: string; id: string }[] = [];
    const coinsGroup: THREE.Mesh[] = [];

    if (worldDef.objects && Array.isArray(worldDef.objects)) {
      worldDef.objects.forEach((obj: World3DObject) => {
        let geo: THREE.BufferGeometry;
        const sx = obj.scale?.[0] || 1;
        const sy = obj.scale?.[1] || 1;
        const sz = obj.scale?.[2] || 1;

        if (obj.type === 'sphere') {
          geo = new THREE.SphereGeometry(sx / 2, 20, 20);
        } else if (obj.type === 'cylinder') {
          geo = new THREE.CylinderGeometry(sx / 2, sx / 2, sy, 20);
        } else {
          geo = new THREE.BoxGeometry(sx, sy, sz);
        }

        const colorHex = parseInt((obj.color || '#00e5ff').replace('#', '0x'), 16);
        let mat: THREE.Material = new THREE.MeshStandardMaterial({ 
          color: colorHex,
          roughness: obj.material === 'neon' ? 0.1 : 0.4,
          metalness: obj.material === 'metal' ? 0.8 : 0.3,
          emissive: obj.material === 'neon' ? colorHex : 0x000000,
          emissiveIntensity: obj.material === 'neon' ? 0.4 : 0,
        });

        // Collectible Coins
        if (obj.type === 'coin') {
          geo = new THREE.CylinderGeometry(0.5, 0.5, 0.16, 16);
          const coinMat = new THREE.MeshStandardMaterial({ 
            color: 0xffb703, 
            metalness: 0.95, 
            roughness: 0.15,
            emissive: 0xffb703,
            emissiveIntensity: 0.4
          });
          const coinMesh = new THREE.Mesh(geo, coinMat);
          coinMesh.rotation.x = Math.PI / 2;
          coinMesh.position.set(obj.position[0], obj.position[1] || 1, obj.position[2]);
          scene.add(coinMesh);
          coinsGroup.push(coinMesh);
          return;
        }

        // Lava Hazards
        if (obj.type === 'lava_hazard') {
          mat = new THREE.MeshStandardMaterial({
            color: 0xff2200,
            emissive: 0xff3b30,
            emissiveIntensity: 0.8,
            roughness: 0.2,
          });
        }

        // Laser Hazards
        if (obj.type === 'laser') {
          mat = new THREE.MeshStandardMaterial({
            color: 0xff0044,
            emissive: 0xff0044,
            emissiveIntensity: 1.0,
            roughness: 0.0,
          });
        }

        // Bounce Pad Trampoline
        if (obj.type === 'bounce_pad') {
          mat = new THREE.MeshStandardMaterial({
            color: 0xfbbf24,
            emissive: 0xf59e0b,
            emissiveIntensity: 0.5,
            roughness: 0.2,
          });
        }

        // Finish Line Triumph Gate
        if (obj.type === 'finish_line') {
          mat = new THREE.MeshStandardMaterial({ 
            color: 0x10b981, 
            emissive: 0x10b981,
            emissiveIntensity: 0.7,
            wireframe: false,
          });
        }

        const mesh = new THREE.Mesh(geo, mat);
        mesh.position.set(obj.position[0], obj.position[1], obj.position[2]);
        if (obj.rotation) {
          mesh.rotation.set(obj.rotation[0] || 0, obj.rotation[1] || 0, obj.rotation[2] || 0);
        }
        mesh.castShadow = true;
        mesh.receiveShadow = true;
        scene.add(mesh);

        // Register platform data for physical landing
        const isHazard = obj.type === 'lava_hazard' || obj.type === 'laser' || obj.behavior === 'hazard' || obj.behavior === 'hazard_spinner' || obj.type === 'spinner';
        
        if (!isHazard) {
          platforms.push({
            id: obj.id,
            mesh,
            type: obj.type,
            behavior: obj.behavior,
            stage: obj.stage,
            initialPos: new THREE.Vector3(obj.position[0], obj.position[1], obj.position[2]),
            size: new THREE.Vector3(sx, sy, sz),
            axis: obj.axis || 'x',
            distance: obj.distance || 4,
            speed: obj.speed || 2,
            isGhost: false,
          });
        }

        if (obj.type === 'finish_line' || isHazard) {
          collidableObjects.push({ mesh, type: obj.type, id: obj.id });
        }
      });
    }

    // ==========================================
    // PLAYER AVATAR
    // ==========================================
    const playerGroup = new THREE.Group();
    const spawnPoint = worldDef.spawnPoint || [0, 1.5, 0];
    playerGroup.position.set(spawnPoint[0], spawnPoint[1], spawnPoint[2]);

    currentCheckpointPosRef.current = [spawnPoint[0], spawnPoint[1], spawnPoint[2]];

    const skinColorInt = parseInt(user.avatar.skinColor.replace('#', '0x'), 16) || 0xffc107;
    const torsoColorInt = parseInt(user.avatar.torsoColor.replace('#', '0x'), 16) || 0x1e88e5;
    const legsColorInt = parseInt(user.avatar.legsColor.replace('#', '0x'), 16) || 0x263238;

    const skinMat = new THREE.MeshStandardMaterial({ color: skinColorInt, roughness: 0.35 });
    const torsoMat = new THREE.MeshStandardMaterial({ color: torsoColorInt, roughness: 0.45 });
    const legsMat = new THREE.MeshStandardMaterial({ color: legsColorInt, roughness: 0.55 });

    // BODY SHAPE PROPORTIONS
    const bodyShape: BodyShapeType = user.avatar.bodyShape || 'standard';
    let torsoWidth = 0.85;
    let torsoHeight = 0.95;
    let torsoDepth = 0.45;
    let legHeight = 0.82;
    let headScale = 1.0;

    if (bodyShape === 'slim') {
      torsoWidth = 0.70;
      torsoHeight = 0.98;
      torsoDepth = 0.36;
    } else if (bodyShape === 'heavy') {
      torsoWidth = 1.15;
      torsoHeight = 0.95;
      torsoDepth = 0.60;
    } else if (bodyShape === 'tall') {
      torsoWidth = 0.78;
      torsoHeight = 1.15;
      torsoDepth = 0.40;
      legHeight = 1.05;
    } else if (bodyShape === 'chibi') {
      torsoWidth = 0.65;
      torsoHeight = 0.60;
      torsoDepth = 0.42;
      legHeight = 0.50;
      headScale = 1.35;
    }

    // Torso
    const torsoGeo = new THREE.BoxGeometry(torsoWidth, torsoHeight, torsoDepth);
    const bodyMesh = new THREE.Mesh(torsoGeo, torsoMat);
    bodyMesh.position.y = legHeight + torsoHeight / 2;
    bodyMesh.castShadow = true;
    playerGroup.add(bodyMesh);

    // Legs
    const legGeo = new THREE.BoxGeometry(torsoWidth * 0.42, legHeight, torsoDepth * 0.85);
    const leftLeg = new THREE.Mesh(legGeo, legsMat);
    leftLeg.position.set(-torsoWidth * 0.26, legHeight / 2, 0);
    playerGroup.add(leftLeg);

    const rightLeg = new THREE.Mesh(legGeo, legsMat);
    rightLeg.position.set(torsoWidth * 0.26, legHeight / 2, 0);
    playerGroup.add(rightLeg);

    // Head
    const headStyle: HeadStyleType = user.avatar.headStyle || 'block';
    const headGroup = new THREE.Group();
    const headY = legHeight + torsoHeight + (0.42 * headScale);
    headGroup.position.set(0, headY, 0);
    headGroup.scale.set(headScale, headScale, headScale);

    let headMesh: THREE.Mesh;
    if (headStyle === 'round') {
      headMesh = new THREE.Mesh(new THREE.SphereGeometry(0.40, 24, 24), skinMat);
    } else if (headStyle === 'cyber') {
      headMesh = new THREE.Mesh(new THREE.CylinderGeometry(0.38, 0.42, 0.72, 8), skinMat);
      const visor = new THREE.Mesh(
        new THREE.BoxGeometry(0.68, 0.16, 0.32),
        new THREE.MeshStandardMaterial({ color: 0x00e5ff, emissive: 0x00e5ff, emissiveIntensity: 0.9 })
      );
      visor.position.set(0, 0.05, 0.28);
      headGroup.add(visor);
    } else if (headStyle === 'diamond') {
      headMesh = new THREE.Mesh(new THREE.OctahedronGeometry(0.48, 0), skinMat);
    } else if (headStyle === 'flat') {
      headMesh = new THREE.Mesh(new THREE.BoxGeometry(0.88, 0.58, 0.72), skinMat);
    } else {
      headMesh = new THREE.Mesh(new THREE.BoxGeometry(0.72, 0.72, 0.68), skinMat);
    }

    headMesh.castShadow = true;
    headGroup.add(headMesh);
    playerGroup.add(headGroup);

    scene.add(playerGroup);

    // ==========================================
    // MULTIPLAYER SIMULATED RIVAL AVATARS
    // ==========================================
    const otherPlayer1 = new THREE.Group();
    otherPlayer1.position.set(2.5, 0.5, -4);
    const op1Body = new THREE.Mesh(new THREE.BoxGeometry(0.8, 1.1, 0.4), new THREE.MeshStandardMaterial({ color: 0xf59e0b }));
    op1Body.position.y = 0.55;
    otherPlayer1.add(op1Body);
    const op1Head = new THREE.Mesh(new THREE.BoxGeometry(0.7, 0.7, 0.7), new THREE.MeshStandardMaterial({ color: 0xffd54f }));
    op1Head.position.y = 1.45;
    otherPlayer1.add(op1Head);
    scene.add(otherPlayer1);

    const otherPlayer2 = new THREE.Group();
    otherPlayer2.position.set(-2.5, 3.8, -27);
    const op2Body = new THREE.Mesh(new THREE.BoxGeometry(0.75, 1.05, 0.4), new THREE.MeshStandardMaterial({ color: 0xa855f7 }));
    op2Body.position.y = 0.52;
    otherPlayer2.add(op2Body);
    const op2Head = new THREE.Mesh(new THREE.SphereGeometry(0.42, 20, 20), new THREE.MeshStandardMaterial({ color: 0xffb74d }));
    op2Head.position.y = 1.42;
    otherPlayer2.add(op2Head);
    scene.add(otherPlayer2);

    // ==========================================
    // CAMERA ROTATION & CONTROLS
    // ==========================================
    let cameraYaw = 0; // horizontal angle
    let cameraPitch = 0.35; // vertical angle
    const cameraDistance = 8.5;
    let isDraggingCamera = false;
    let prevMouseX = 0;
    let prevMouseY = 0;

    const onMouseDown = (e: MouseEvent) => {
      if (e.button === 0 || e.button === 2) {
        isDraggingCamera = true;
        prevMouseX = e.clientX;
        prevMouseY = e.clientY;
      }
    };

    const onMouseMove = (e: MouseEvent) => {
      if (!isDraggingCamera) return;
      const deltaX = e.clientX - prevMouseX;
      const deltaY = e.clientY - prevMouseY;
      prevMouseX = e.clientX;
      prevMouseY = e.clientY;

      cameraYaw -= deltaX * 0.006;
      cameraPitch = Math.max(0.08, Math.min(1.2, cameraPitch + deltaY * 0.005));
    };

    const onMouseUp = () => {
      isDraggingCamera = false;
    };

    const onContextMenu = (e: MouseEvent) => {
      e.preventDefault();
    };

    window.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
    window.addEventListener('contextmenu', onContextMenu);

    // KEYBOARD CONTROLS
    const keys: { [key: string]: boolean } = {};
    const baseSpeed = 0.22;
    let velocityY = 0;
    let isGrounded = true;
    let standingPlatformId: string | null = null;

    const handleRespawn = (reason?: string) => {
      if (isRespawningRef.current) return;
      isRespawningRef.current = true;
      audioSynth.playDeath();
      setDeathCount((prev) => prev + 1);
      setIsDeadFlashing(true);
      setTimeout(() => setIsDeadFlashing(false), 500);

      const respawn = currentCheckpointPosRef.current;
      playerGroup.position.set(respawn[0], respawn[1], respawn[2]);
      velocityY = 0;
      isGrounded = true;

      setTimeout(() => {
        isRespawningRef.current = false;
      }, 350);
    };
    respawnPlayerRef.current = handleRespawn;

    const onKeyDown = (e: KeyboardEvent) => {
      // Chat focus toggle
      if (!isChatFocusedRef.current && (e.code === 'KeyT' || e.code === 'Slash')) {
        e.preventDefault();
        chatInputRef.current?.focus();
        return;
      }

      if (isChatFocusedRef.current) return;

      // Reset Character Hotkey [R]
      if (e.code === 'KeyR') {
        e.preventDefault();
        handleRespawn('Reset by player');
        return;
      }

      // Camera keys [Q] and [E]
      if (e.code === 'KeyQ') cameraYaw += 0.08;
      if (e.code === 'KeyE') cameraYaw -= 0.08;

      keys[e.code] = true;
    };

    const onKeyUp = (e: KeyboardEvent) => {
      if (isChatFocusedRef.current) return;
      keys[e.code] = false;
    };

    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);

    // Ambient banter interval
    const ambientChatInterval = setInterval(() => {
      const obbyBanter = [
        { sender: 'ObbyDemon99', text: 'Stage 3 tightrope requires steady hand! Don’t rush.', target: 'other1' as const, color: 'text-amber-400' },
        { sender: 'PixelQueen', text: 'Tip: Jump right over the red laser beams on Stage 2!', target: 'other2' as const, color: 'text-fuchsia-400' },
        { sender: 'ObbyDemon99', text: 'Anyone made it past the Meatgrinder spinners yet?', target: 'other1' as const, color: 'text-amber-400' },
      ];
      const randomBanter = obbyBanter[Math.floor(Math.random() * obbyBanter.length)];
      receiveMessage(randomBanter.sender, randomBanter.text, randomBanter.target, randomBanter.color);
    }, 22000);

    // ==========================================
    // GAME LOOP & PHYSICS
    // ==========================================
    let animationFrameId: number;
    const clock = new THREE.Clock();
    const tempProjVec = new THREE.Vector3();

    const gameLoop = () => {
      animationFrameId = requestAnimationFrame(gameLoop);
      const elapsedTime = clock.getElapsedTime();

      // 1. UPDATE DYNAMIC PLATFORMS & TRAPS
      platforms.forEach((plat) => {
        // Oscillating side-to-side platforms
        if (plat.behavior === 'oscillating') {
          const oscDist = plat.distance || 4.5;
          const oscSpeed = plat.speed || 2;
          const delta = Math.sin(elapsedTime * oscSpeed) * oscDist;
          const prevX = plat.mesh.position.x;
          plat.mesh.position.x = plat.initialPos.x + delta;

          // Carry player if standing on it!
          if (standingPlatformId === plat.id && isGrounded) {
            playerGroup.position.x += (plat.mesh.position.x - prevX);
          }
        }

        // Fading ghost platforms
        if (plat.behavior === 'fading') {
          const t = (elapsedTime * 0.8) % 2.2;
          const isSolid = t < 1.25;
          plat.isGhost = !isSolid;
          const mat = plat.mesh.material as THREE.MeshStandardMaterial;
          if (mat) {
            mat.transparent = true;
            mat.opacity = isSolid ? 0.95 : 0.22;
            mat.emissiveIntensity = isSolid ? 0.4 : 0.05;
          }
        }
      });

      // Hazard Spinners (Meatgrinder blades)
      worldDef.objects?.forEach((obj) => {
        if (obj.behavior === 'hazard_spinner' || obj.type === 'spinner') {
          const spinnerMesh = scene.getObjectByName(obj.id) || collidableObjects.find(c => c.id === obj.id)?.mesh;
          if (spinnerMesh) {
            spinnerMesh.rotation.y += (obj.speed || 2.2) * 0.025;
            
            // Check player collision with sweeping blade
            const distCenter = new THREE.Vector2(
              playerGroup.position.x - spinnerMesh.position.x,
              playerGroup.position.z - spinnerMesh.position.z
            ).length();

            const halfLen = (obj.scale?.[0] || 7.5) / 2;
            if (distCenter <= halfLen && Math.abs(playerGroup.position.y - spinnerMesh.position.y) < 1.0) {
              const angleToPlayer = Math.atan2(
                playerGroup.position.z - spinnerMesh.position.z,
                playerGroup.position.x - spinnerMesh.position.x
              );
              const spinnerAngle = spinnerMesh.rotation.y % Math.PI;
              const angleDiff = Math.abs(Math.sin(angleToPlayer - spinnerAngle));
              if (angleDiff < 0.25) {
                handleRespawn('Hit by Sweeper Blade!');
              }
            }
          }
        }
      });

      // 2. PLAYER INPUT & CAMERA-RELATIVE MOVEMENT
      let moveX = 0;
      let moveZ = 0;

      if (!isChatFocusedRef.current) {
        if (keys['KeyW'] || keys['ArrowUp']) moveZ -= 1;
        if (keys['KeyS'] || keys['ArrowDown']) moveZ += 1;
        if (keys['KeyA'] || keys['ArrowLeft']) moveX -= 1;
        if (keys['KeyD'] || keys['ArrowRight']) moveX += 1;
      }

      // Camera-relative forward & right
      const forward = new THREE.Vector3(-Math.sin(cameraYaw), 0, -Math.cos(cameraYaw)).normalize();
      const right = new THREE.Vector3(Math.cos(cameraYaw), 0, -Math.sin(cameraYaw)).normalize();

      const moveDir = new THREE.Vector3();
      if (moveZ < 0) moveDir.add(forward);
      if (moveZ > 0) moveDir.sub(forward);
      if (moveX < 0) moveDir.sub(right);
      if (moveX > 0) moveDir.add(right);

      const isSprintActive = (keys['ShiftLeft'] || keys['ShiftRight']) && (moveX !== 0 || moveZ !== 0);
      setIsSprinting(isSprintActive);

      if (moveDir.lengthSq() > 0) {
        moveDir.normalize();
        const currentSpeed = isSprintActive ? baseSpeed * 1.48 : baseSpeed;
        const moveVector = moveDir.clone().multiplyScalar(currentSpeed);
        playerGroup.position.add(moveVector);
        playerGroup.rotation.y = Math.atan2(moveDir.x, moveDir.z);
        setSpeedMeter(Math.round(currentSpeed * 100));
      } else {
        setSpeedMeter(0);
      }

      // 3. JUMP & GRAVITY PHYSICS
      if (!isChatFocusedRef.current && keys['Space'] && isGrounded) {
        velocityY = 0.33; // Sharp, responsive jump
        isGrounded = false;
        audioSynth.playJump();
      }

      // 4. PLATFORM COLLISION (DETECT HIGHEST PLATFORM UNDER FOOT)
      let highestPlatY: number | null = null;
      let landedPlat: PlatformData | null = null;

      platforms.forEach((plat) => {
        if (plat.isGhost) return; // Ghost platforms lose solidity!

        const px = plat.mesh.position.x;
        const py = plat.mesh.position.y;
        const pz = plat.mesh.position.z;

        const halfX = plat.size.x / 2 + 0.32;
        const halfZ = plat.size.z / 2 + 0.32;
        const topY = py + plat.size.y / 2;

        if (
          playerGroup.position.x >= px - halfX &&
          playerGroup.position.x <= px + halfX &&
          playerGroup.position.z >= pz - halfZ &&
          playerGroup.position.z <= pz + halfZ
        ) {
          if (playerGroup.position.y >= topY - 0.45) {
            if (highestPlatY === null || topY > highestPlatY) {
              highestPlatY = topY;
              landedPlat = plat;
            }
          }
        }
      });

      // Ground plane fallback if not an obby
      if (!isObby && highestPlatY === null && playerGroup.position.y <= 1.0) {
        highestPlatY = 1.0;
      }

      if (highestPlatY !== null) {
        if (velocityY <= 0 && playerGroup.position.y <= highestPlatY + 0.38) {
          playerGroup.position.y = highestPlatY;
          velocityY = 0;
          isGrounded = true;
          standingPlatformId = landedPlat?.id || null;

          // Bounce Pad Impulse (Trampoline)
          if (landedPlat && (landedPlat.type === 'bounce_pad' || landedPlat.behavior === 'bouncy')) {
            velocityY = 0.60; // Super bounce launch!
            isGrounded = false;
            audioSynth.playBounce();
          }

          // Checkpoint Activation
          if (landedPlat && landedPlat.type === 'checkpoint') {
            const stageNum = landedPlat.stage ?? 0;
            if (stageNum > currentCheckpointStageRef.current) {
              currentCheckpointStageRef.current = stageNum;
              currentCheckpointPosRef.current = [
                landedPlat.mesh.position.x,
                highestPlatY + 0.6,
                landedPlat.mesh.position.z,
              ];
              setCurrentStage(stageNum);
              setCheckpointBanner(`STAGE ${stageNum} CHECKPOINT ACTIVATED!`);
              audioSynth.playCheckpoint();

              // Turn checkpoint material to glowing neon green
              const cpMat = landedPlat.mesh.material as THREE.MeshStandardMaterial;
              if (cpMat) {
                cpMat.color.setHex(0x10b981);
                cpMat.emissive.setHex(0x10b981);
                cpMat.emissiveIntensity = 0.8;
              }
              setTimeout(() => setCheckpointBanner(null), 3000);
            }
          }
        } else {
          isGrounded = false;
        }
      } else {
        isGrounded = false;
        standingPlatformId = null;
      }

      // Apply Gravity
      if (!isGrounded) {
        playerGroup.position.y += velocityY;
        velocityY -= 0.019; // Standard physics gravity
      }

      // 5. VOID FALL & HAZARD COLLISION CHECKS
      if (playerGroup.position.y < -3.0) {
        handleRespawn('Fell into Molten Abyss');
      }

      collidableObjects.forEach((obj) => {
        if (obj.type === 'lava_hazard' && playerGroup.position.distanceTo(obj.mesh.position) < 3.2) {
          handleRespawn('Burned in Lava Pool');
        }
        if (obj.type === 'laser') {
          const lPos = obj.mesh.position;
          if (
            Math.abs(playerGroup.position.x - lPos.x) < (obj.mesh.scale.x / 2 + 0.25) &&
            Math.abs(playerGroup.position.z - lPos.z) < 0.6 &&
            Math.abs(playerGroup.position.y - lPos.y) < 0.7
          ) {
            handleRespawn('Zapped by Red Laser');
          }
        }
      });

      // 6. ROTATE & COLLECT COINS
      coinsGroup.forEach((coin) => {
        coin.rotation.y += 0.035;
        if (playerGroup.position.distanceTo(coin.position) < 1.4 && coin.visible) {
          coin.visible = false;
          audioSynth.playCoin();
          setCoinsCollected((prev) => {
            const nextCount = prev + 1;
            if (nextCount === 3) {
              setTimeout(() => {
                receiveMessage('ObbyDemon99', `Nice coin pickup streak, ${user.displayName}!`, 'other1');
              }, 400);
            }
            return nextCount;
          });
          onRewardCoins(15);
        }
      });

      // 7. CHECK FINISH LINE / VICTORY SUMMIT
      collidableObjects.forEach((obj) => {
        if (obj.type === 'finish_line' && playerGroup.position.distanceTo(obj.mesh.position) < 3.8) {
          if (!hasWon) {
            setHasWon(true);
            audioSynth.playVictory();
            confetti({ particleCount: 140, spread: 80, origin: { y: 0.55 } });
            receiveMessage('PixelQueen', `HOLY MOLY ${user.displayName}! You cleared all 10 Hardcore Stages! True Gauntlet Legend! 🏆🔥`, 'other2');
            onRewardCoins(250);
          }
        }
      });

      // 8. THIRD-PERSON CAMERA SPHERICAL ORBIT
      const camX = playerGroup.position.x + cameraDistance * Math.sin(cameraYaw) * Math.cos(cameraPitch);
      const camY = playerGroup.position.y + 1.2 + cameraDistance * Math.sin(cameraPitch);
      const camZ = playerGroup.position.z + cameraDistance * Math.cos(cameraYaw) * Math.cos(cameraPitch);

      camera.position.set(camX, camY, camZ);
      camera.lookAt(playerGroup.position.x, playerGroup.position.y + 1.2, playerGroup.position.z);

      // Simulated rival player wanderings
      otherPlayer1.position.z = -4 + Math.sin(elapsedTime * 1.2) * 2;
      otherPlayer2.position.x = -2.5 + Math.cos(elapsedTime * 0.9) * 1.5;

      // 9. 3D SPEECH BUBBLES PROJECTION
      if (playerBubbleRef.current) {
        tempProjVec.set(playerGroup.position.x, playerGroup.position.y + 2.3, playerGroup.position.z);
        tempProjVec.project(camera);
        if (tempProjVec.z < 1) {
          const sx = (tempProjVec.x * 0.5 + 0.5) * width;
          const sy = (-tempProjVec.y * 0.5 + 0.5) * height;
          playerBubbleRef.current.style.transform = `translate3d(${sx}px, ${sy}px, 0) translate(-50%, -100%)`;
        }
      }

      if (other1BubbleRef.current) {
        tempProjVec.set(otherPlayer1.position.x, otherPlayer1.position.y + 2.3, otherPlayer1.position.z);
        tempProjVec.project(camera);
        if (tempProjVec.z < 1) {
          const sx = (tempProjVec.x * 0.5 + 0.5) * width;
          const sy = (-tempProjVec.y * 0.5 + 0.5) * height;
          other1BubbleRef.current.style.transform = `translate3d(${sx}px, ${sy}px, 0) translate(-50%, -100%)`;
        }
      }

      if (other2BubbleRef.current) {
        tempProjVec.set(otherPlayer2.position.x, otherPlayer2.position.y + 2.3, otherPlayer2.position.z);
        tempProjVec.project(camera);
        if (tempProjVec.z < 1) {
          const sx = (tempProjVec.x * 0.5 + 0.5) * width;
          const sy = (-tempProjVec.y * 0.5 + 0.5) * height;
          other2BubbleRef.current.style.transform = `translate3d(${sx}px, ${sy}px, 0) translate(-50%, -100%)`;
        }
      }

      renderer.render(scene, camera);
    };

    gameLoop();

    // Resize Handler
    const handleResize = () => {
      if (!container) return;
      width = container.clientWidth;
      height = container.clientHeight;
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      clearInterval(ambientChatInterval);
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);
      window.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
      window.removeEventListener('contextmenu', onContextMenu);
      window.removeEventListener('resize', handleResize);
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, [game, user]);

  const handleTalkToNpc = async () => {
    setIsNpcLoading(true);
    try {
      const res = await fetch('/api/ai/npc-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          npcName: game.worldData.npcs?.[0]?.name || 'Sensei Jin (Obby Master)',
          npcRole: game.worldData.npcs?.[0]?.role || 'Guide',
          userMessage: npcInput || 'How do I pass the Meatgrinder?',
          worldContext: game.title,
        }),
      });
      const data = await res.json();
      setNpcReply(data.responseText);
    } catch {
      setNpcReply('Time your jumps with patience, challenger! Hold Shift while jumping across gaps to clear long distances.');
    } finally {
      setIsNpcLoading(false);
    }
  };

  return (
    <div id="game-runner-viewport" className="fixed inset-0 z-50 bg-slate-950 flex flex-col justify-between select-none overflow-hidden">
      
      {/* RED DAMAGE / DEATH VIGNETTE FLASH */}
      <div 
        className={`pointer-events-none absolute inset-0 z-40 transition-opacity duration-150 ${
          isDeadFlashing ? 'opacity-100 bg-rose-600/35 backdrop-blur-[2px]' : 'opacity-0'
        }`}
      />

      {/* CHECKPOINT ACTIVATED TOAST BANNER */}
      {checkpointBanner && (
        <div className="absolute top-20 left-1/2 -translate-x-1/2 z-40 pointer-events-none animate-bounce">
          <div className="bg-emerald-600/90 border-2 border-emerald-400 text-white font-black text-xs sm:text-sm px-5 py-2.5 rounded-full shadow-2xl backdrop-blur-md flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-yellow-300" />
            <span>{checkpointBanner}</span>
          </div>
        </div>
      )}

      {/* TOP HUD OVERLAY */}
      <div className="absolute top-4 left-4 right-4 z-20 flex items-center justify-between pointer-events-none gap-2">
        
        {/* Left: Game Title & Hardcore Badge */}
        <div className="flex items-center gap-3 bg-slate-900/90 border border-slate-800 rounded-2xl p-2.5 px-4 backdrop-blur-md shadow-xl pointer-events-auto">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-rose-500 via-amber-500 to-yellow-400 flex items-center justify-center font-black text-slate-950 shadow-md">
            <Flame className="w-5 h-5 text-slate-950" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-extrabold text-sm text-white">{game.title}</h2>
              {isObby && (
                <span className="px-2 py-0.5 rounded-full text-[9px] font-black bg-rose-500/20 text-rose-400 border border-rose-500/40 uppercase tracking-wide">
                  HARDCORE
                </span>
              )}
            </div>
            <p className="text-[10px] text-emerald-400 font-bold flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              Connected • 3 Rivals on Server
            </p>
          </div>
        </div>

        {/* Center: Stage Progress & Stats */}
        <div className="hidden md:flex items-center gap-4 bg-slate-900/90 border border-slate-800 rounded-2xl p-2.5 px-5 backdrop-blur-md shadow-xl pointer-events-auto text-xs font-black text-white">
          {isObby && (
            <>
              <div className="flex items-center gap-1.5 text-cyan-400">
                <Compass className="w-4 h-4" />
                <span>STAGE {currentStage} / 10</span>
              </div>
              <div className="w-px h-4 bg-slate-800" />
              <div className="flex items-center gap-1.5 text-rose-400">
                <span>💀 Deaths: {deathCount}</span>
              </div>
              <div className="w-px h-4 bg-slate-800" />
            </>
          )}

          {/* Speedrun Stopwatch */}
          <div className="flex items-center gap-1.5 text-yellow-300 font-mono">
            <span>⏱️ {formatStopwatch(timerSec)}</span>
          </div>
          
          <div className="w-px h-4 bg-slate-800" />

          {/* Coins */}
          <div className="flex items-center gap-1.5 text-amber-400">
            <Trophy className="w-4 h-4" />
            <span>Coins: {coinsCollected}</span>
          </div>

          <div className="w-px h-4 bg-slate-800" />

          {/* Speedometer & Sprint */}
          <div className={`flex items-center gap-1.5 ${isSprinting ? 'text-amber-300 animate-pulse' : 'text-cyan-400'}`}>
            {isSprinting ? <Zap className="w-4 h-4 text-amber-400" /> : <Navigation className="w-4 h-4" />}
            <span>{isSprinting ? 'SPRINT' : 'WALK'} {speedMeter}</span>
          </div>
        </div>

        {/* Right Actions: Reset, Mute, Leave */}
        <div className="flex items-center gap-2 pointer-events-auto">
          {/* Reset to Checkpoint [R] */}
          {isObby && (
            <button
              onClick={() => {
                const respawn = currentCheckpointPosRef.current;
                audioSynth.playDeath();
                setDeathCount(prev => prev + 1);
                setIsDeadFlashing(true);
                setTimeout(() => setIsDeadFlashing(false), 400);
              }}
              className="px-3 py-2.5 rounded-2xl bg-slate-900/90 border border-slate-800 hover:border-amber-500/50 text-slate-300 hover:text-amber-400 font-bold text-xs backdrop-blur-md cursor-pointer flex items-center gap-1.5 transition-all"
              title="Reset character to last checkpoint (R)"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Reset [R]</span>
            </button>
          )}

          <button
            onClick={toggleMute}
            className="p-2.5 rounded-2xl bg-slate-900/90 border border-slate-800 text-slate-300 hover:text-white backdrop-blur-md cursor-pointer"
            title={isMuted ? 'Unmute Synth Audio' : 'Mute Audio'}
          >
            {isMuted ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4 text-emerald-400" />}
          </button>

          <button
            id="btn-leave-game-world"
            onClick={onExitGame}
            className="px-4 py-2.5 rounded-2xl bg-rose-600 hover:bg-rose-500 text-white font-extrabold text-xs shadow-lg shadow-rose-600/30 cursor-pointer flex items-center gap-1.5 transition-all"
          >
            <X className="w-4 h-4" />
            <span>Leave</span>
          </button>
        </div>

      </div>

      {/* 3D WebGL Canvas Mounting Point */}
      <div ref={mountRef} className="w-full h-full relative cursor-grab active:cursor-grabbing" />

      {/* CONTROLS HELPER HINT OVERLAY */}
      <div className="absolute top-20 right-4 z-20 pointer-events-none hidden lg:flex flex-col gap-1 text-[11px] font-semibold text-slate-400 bg-slate-900/80 border border-slate-800/80 backdrop-blur-md p-3 rounded-2xl shadow-xl">
        <p className="text-white font-black text-xs border-b border-slate-800 pb-1 flex items-center gap-1">
          <Sparkles className="w-3.5 h-3.5 text-cyan-400" /> Hardcore Parkour Controls
        </p>
        <div className="flex items-center justify-between gap-4 mt-1">
          <span>Move</span>
          <span className="text-cyan-300 font-mono">W / A / S / D</span>
        </div>
        <div className="flex items-center justify-between gap-4">
          <span>Jump</span>
          <span className="text-cyan-300 font-mono">Spacebar</span>
        </div>
        <div className="flex items-center justify-between gap-4">
          <span>Sprint Leap</span>
          <span className="text-amber-300 font-mono">Hold SHIFT</span>
        </div>
        <div className="flex items-center justify-between gap-4">
          <span>Orbit Camera</span>
          <span className="text-cyan-300 font-mono">Drag Mouse or Q / E</span>
        </div>
        <div className="flex items-center justify-between gap-4">
          <span>Reset Checkpoint</span>
          <span className="text-rose-400 font-mono">R</span>
        </div>
      </div>

      {/* ========================================== */}
      {/* 3D IN-WORLD SPEECH BUBBLES (Screen Projected) */}
      {/* ========================================== */}
      {/* Player Speech Bubble */}
      <div
        ref={playerBubbleRef}
        className={`absolute top-0 left-0 pointer-events-none z-30 transition-opacity duration-200 ${
          activeSpeech.player ? 'opacity-100' : 'opacity-0'
        }`}
      >
        {activeSpeech.player && (
          <div className="relative bg-slate-900/95 border-2 border-cyan-400 text-white text-xs font-bold px-3 py-1.5 rounded-2xl shadow-2xl backdrop-blur-md max-w-xs whitespace-normal text-center">
            <span className="text-[10px] text-cyan-400 font-extrabold block">{activeSpeech.player.sender}</span>
            <span>{activeSpeech.player.text}</span>
            <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-0 h-0 border-x-6 border-x-transparent border-t-8 border-t-cyan-400" />
          </div>
        )}
      </div>

      {/* Other Player 1 Speech Bubble */}
      <div
        ref={other1BubbleRef}
        className={`absolute top-0 left-0 pointer-events-none z-30 transition-opacity duration-200 ${
          activeSpeech.other1 ? 'opacity-100' : 'opacity-0'
        }`}
      >
        {activeSpeech.other1 && (
          <div className="relative bg-slate-900/95 border-2 border-amber-400 text-white text-xs font-bold px-3 py-1.5 rounded-2xl shadow-2xl backdrop-blur-md max-w-xs whitespace-normal text-center">
            <span className="text-[10px] text-amber-400 font-extrabold block">{activeSpeech.other1.sender}</span>
            <span>{activeSpeech.other1.text}</span>
            <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-0 h-0 border-x-6 border-x-transparent border-t-8 border-t-amber-400" />
          </div>
        )}
      </div>

      {/* Other Player 2 Speech Bubble */}
      <div
        ref={other2BubbleRef}
        className={`absolute top-0 left-0 pointer-events-none z-30 transition-opacity duration-200 ${
          activeSpeech.other2 ? 'opacity-100' : 'opacity-0'
        }`}
      >
        {activeSpeech.other2 && (
          <div className="relative bg-slate-900/95 border-2 border-fuchsia-400 text-white text-xs font-bold px-3 py-1.5 rounded-2xl shadow-2xl backdrop-blur-md max-w-xs whitespace-normal text-center">
            <span className="text-[10px] text-fuchsia-400 font-extrabold block">{activeSpeech.other2.sender}</span>
            <span>{activeSpeech.other2.text}</span>
            <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-0 h-0 border-x-6 border-x-transparent border-t-8 border-t-fuchsia-400" />
          </div>
        )}
      </div>

      {/* ========================================== */}
      {/* BOTTOM HUD: LIVE MULTIPLAYER CHAT & NPC BUTTON */}
      {/* ========================================== */}
      <div className="absolute bottom-4 left-4 right-4 z-20 flex flex-col sm:flex-row items-end justify-between gap-4 pointer-events-none">
        
        {/* IN-GAME CHAT WINDOW (Docked on Left) */}
        <InGameChatWindow
          messages={chatMessages}
          onSendMessage={handleSendMessage}
          onFocusChange={(focused) => {
            isChatFocusedRef.current = focused;
          }}
          playerDisplayName={user.displayName}
          onlineCount={3}
          inputRef={chatInputRef}
        />

        {/* AI NPC Guide Button */}
        <button
          id="btn-talk-to-npc"
          onClick={() => {
            setActiveNpc({
              name: game.worldData.npcs?.[0]?.name || 'Sensei Jin (Obby Master)',
              role: game.worldData.npcs?.[0]?.role || 'Parkour Master',
              dialogue: game.worldData.npcs?.[0]?.dialogue || ['Patience and sprint momentum are key!'],
            });
            handleTalkToNpc();
          }}
          className="pointer-events-auto flex items-center gap-2 px-4 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold text-xs shadow-lg cursor-pointer transition-all"
        >
          <Sparkles className="w-4 h-4 text-yellow-300" />
          Talk to Sensei Jin
        </button>

      </div>

      {/* VICTORY BANNER OVERLAY */}
      {hasWon && (
        <div className="absolute inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border-2 border-amber-500/80 rounded-3xl p-8 max-w-md w-full text-center space-y-5 shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="w-20 h-20 bg-gradient-to-tr from-amber-500 to-yellow-300 text-slate-950 rounded-3xl flex items-center justify-center mx-auto text-4xl font-black shadow-lg shadow-amber-500/30">
              🏆
            </div>
            <div>
              <span className="text-[10px] font-black uppercase tracking-widest text-amber-400 bg-amber-500/10 px-3 py-1 rounded-full border border-amber-500/30">
                HARDCORE GAUNTLET CONQUERED
              </span>
              <h2 className="text-2xl font-black text-white tracking-wide mt-2">CHAMPION VICTORY!</h2>
              <p className="text-xs text-slate-300 mt-1">You conquered all 10 grueling parkour stages and conquered the molten void!</p>
            </div>

            {/* Run Stats Grid */}
            <div className="grid grid-cols-3 gap-2 bg-slate-950/80 p-3 rounded-2xl border border-slate-800 text-xs">
              <div>
                <p className="text-slate-400 text-[10px]">Total Time</p>
                <p className="font-mono font-bold text-yellow-400 text-sm mt-0.5">{formatStopwatch(timerSec)}</p>
              </div>
              <div>
                <p className="text-slate-400 text-[10px]">Deaths</p>
                <p className="font-mono font-bold text-rose-400 text-sm mt-0.5">{deathCount}</p>
              </div>
              <div>
                <p className="text-slate-400 text-[10px]">Bonus Coins</p>
                <p className="font-mono font-bold text-emerald-400 text-sm mt-0.5">+250 🪙</p>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => {
                  setHasWon(false);
                  respawnPlayerRef.current?.('Restart Run');
                  setTimerSec(0);
                  setDeathCount(0);
                  currentCheckpointStageRef.current = 0;
                  setCurrentStage(0);
                }}
                className="flex-1 py-3 rounded-2xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs cursor-pointer transition-all border border-slate-700"
              >
                Speedrun Again
              </button>
              <button
                onClick={onExitGame}
                className="flex-1 py-3 rounded-2xl bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 font-black text-xs cursor-pointer shadow-lg transition-all"
              >
                Claim & Exit
              </button>
            </div>
          </div>
        </div>
      )}

      {/* AI NPC DIALOGUE MODAL */}
      {activeNpc && (
        <div className="absolute inset-0 z-40 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-cyan-500/40 rounded-3xl p-6 max-w-md w-full space-y-4 shadow-2xl relative">
            <button 
              onClick={() => setActiveNpc(null)} 
              className="absolute top-4 right-4 text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center font-bold text-xl">
                🥋
              </div>
              <div>
                <h3 className="font-extrabold text-white text-base">{activeNpc.name}</h3>
                <p className="text-xs text-cyan-400">{activeNpc.role}</p>
              </div>
            </div>
            <div className="p-4 bg-slate-950/80 rounded-2xl border border-slate-800 text-slate-200 text-xs leading-relaxed min-h-16">
              {isNpcLoading ? (
                <span className="text-slate-400 italic">Sensei is formulating guidance...</span>
              ) : (
                npcReply || activeNpc.dialogue[0]
              )}
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Ask Sensei Jin for obby advice..."
                value={npcInput}
                onChange={(e) => setNpcInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleTalkToNpc()}
                className="flex-1 bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500"
              />
              <button
                onClick={handleTalkToNpc}
                className="px-4 py-2 bg-cyan-500 rounded-xl text-slate-950 font-bold text-xs cursor-pointer hover:bg-cyan-400"
              >
                Ask
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
