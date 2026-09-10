import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import confetti from 'canvas-confetti';
import { 
  X, Volume2, VolumeX, Trophy, Navigation, Sparkles 
} from 'lucide-react';
import { AcadoGame, UserProfile, WorldDefinition, HeadStyleType, BodyShapeType } from '../../types';
import { InGameChatWindow, ChatMessage } from './InGameChatWindow';

interface GameRunner3DProps {
  game: AcadoGame;
  user: UserProfile;
  onExitGame: () => void;
  onRewardCoins: (amount: number) => void;
}

interface ActiveSpeechBubble {
  id: string;
  sender: string;
  text: string;
  target: 'player' | 'other1' | 'other2';
  expiresAt: number;
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

  const [isMuted, setIsMuted] = useState(false);
  const [coinsCollected, setCoinsCollected] = useState(0);
  const [speedMeter, setSpeedMeter] = useState(0);
  const [hasWon, setHasWon] = useState(false);

  // Active speech bubbles for overhead display
  const [activeSpeech, setActiveSpeech] = useState<{
    player?: { text: string; sender: string };
    other1?: { text: string; sender: string };
    other2?: { text: string; sender: string };
  }>({});

  // Chat Focus State (prevents player WASD/Space movement while typing)
  const isChatFocusedRef = useRef(false);

  // In-Game Chat Messages (Send & Receive)
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    {
      id: 'sys_welcome',
      sender: 'Server',
      senderType: 'system',
      text: 'Connected to ACADO World Server #1 (US East) • Low Latency 22ms',
      timestamp: '12:00',
    },
    {
      id: 'msg_greet_1',
      sender: 'SpeedDemon99',
      senderType: 'other',
      text: `Yo ${user.displayName}! Ready to race to the finish gate?`,
      timestamp: '12:01',
      color: 'text-amber-400',
    },
    {
      id: 'msg_greet_2',
      sender: 'PixelQueen',
      senderType: 'other',
      text: 'Nice avatar custom build! Watch out for the obstacles ahead.',
      timestamp: '12:01',
      color: 'text-fuchsia-400',
    },
  ]);

  // NPC Dialogue Modal State
  const [activeNpc, setActiveNpc] = useState<{ name: string; role: string; dialogue: string[] } | null>(null);
  const [npcReply, setNpcReply] = useState<string>('');
  const [npcInput, setNpcInput] = useState<string>('');
  const [isNpcLoading, setIsNpcLoading] = useState(false);

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

    // Contextual automatic multiplayer replies
    const lower = text.toLowerCase();
    setTimeout(() => {
      if (lower.includes('hi') || lower.includes('hello') || lower.includes('hey') || lower.includes('yo')) {
        receiveMessage('SpeedDemon99', `Hey ${user.displayName}! Hit the ramps and let's see your airtime!`, 'other1', 'text-amber-400');
      } else if (lower.includes('gg') || lower.includes('win') || lower.includes('finish')) {
        receiveMessage('PixelQueen', 'GG! That was a super clean run! 🏆', 'other2', 'text-fuchsia-400');
      } else if (lower.includes('race') || lower.includes('speed') || lower.includes('fast')) {
        receiveMessage('SpeedDemon99', 'I’m gunning for the new server speed record!', 'other1', 'text-amber-400');
      } else if (lower.includes('jump') || lower.includes('trap') || lower.includes('pad')) {
        receiveMessage('PixelQueen', 'Double jump right before the gap for extra distance!', 'other2', 'text-fuchsia-400');
      } else {
        const casualReplies = [
          `Solid move, ${user.displayName}!`,
          'Catch me if you can!',
          'This world map is awesome!',
          'Watch out for the neon boosters!',
        ];
        const randomReply = casualReplies[Math.floor(Math.random() * casualReplies.length)];
        const responder = Math.random() > 0.5 ? 'SpeedDemon99' : 'PixelQueen';
        const target = responder === 'SpeedDemon99' ? 'other1' : 'other2';
        const color = responder === 'SpeedDemon99' ? 'text-amber-400' : 'text-fuchsia-400';
        receiveMessage(responder, randomReply, target, color);
      }
    }, 1200);
  };

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    let width = container.clientWidth || 800;
    let height = container.clientHeight || 500;

    // SCENE
    const scene = new THREE.Scene();
    
    // Skybox / Fog setup
    const worldDef: WorldDefinition = game.worldData || {};
    const skyHex = parseInt((worldDef.skyColor || '#0a0a23').replace('#', '0x'), 16);
    scene.background = new THREE.Color(skyHex);
    scene.fog = new THREE.FogExp2(skyHex, 0.015);

    // CAMERA
    const camera = new THREE.PerspectiveCamera(60, width / height, 0.1, 500);

    // RENDERER
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    container.appendChild(renderer.domElement);

    // LIGHTS
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.7);
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0xffffff, 1.2);
    dirLight.position.set(20, 40, 20);
    dirLight.castShadow = true;
    dirLight.shadow.mapSize.width = 1024;
    dirLight.shadow.mapSize.height = 1024;
    scene.add(dirLight);

    // ENVIRONMENT & TERRAIN
    const groundGeo = new THREE.PlaneGeometry(300, 300);
    const groundMat = new THREE.MeshStandardMaterial({ 
      color: 0x1e293b, 
      roughness: 0.8,
      metalness: 0.2
    });
    const ground = new THREE.Mesh(groundGeo, groundMat);
    ground.rotation.x = -Math.PI / 2;
    ground.receiveShadow = true;
    scene.add(ground);

    // Grid Floor Overlay
    const gridHelper = new THREE.GridHelper(300, 60, 0x00e5ff, 0x334155);
    gridHelper.position.y = 0.02;
    scene.add(gridHelper);

    // BUILD WORLD OBJECTS & CHECKPOINTS
    const collidableObjects: { mesh: THREE.Mesh; type: string; id: string }[] = [];
    const coinsGroup: THREE.Mesh[] = [];

    if (worldDef.objects && Array.isArray(worldDef.objects)) {
      worldDef.objects.forEach((obj) => {
        let geo: THREE.BufferGeometry = new THREE.BoxGeometry(
          obj.scale?.[0] || 1, 
          obj.scale?.[1] || 1, 
          obj.scale?.[2] || 1
        );

        const colorHex = parseInt((obj.color || '#00e5ff').replace('#', '0x'), 16);
        let mat: THREE.Material = new THREE.MeshStandardMaterial({ 
          color: colorHex,
          roughness: 0.4,
          metalness: 0.3
        });

        if (obj.type === 'coin') {
          geo = new THREE.CylinderGeometry(0.5, 0.5, 0.15, 16);
          const coinMat = new THREE.MeshStandardMaterial({ 
            color: 0xffb703, 
            metalness: 0.9, 
            roughness: 0.2,
            emissive: 0xffb703,
            emissiveIntensity: 0.2
          });
          const coinMesh = new THREE.Mesh(geo, coinMat);
          coinMesh.rotation.x = Math.PI / 2;
          coinMesh.position.set(obj.position[0], obj.position[1] || 1, obj.position[2]);
          scene.add(coinMesh);
          coinsGroup.push(coinMesh);
          return;
        }

        if (obj.type === 'finish_line') {
          mat = new THREE.MeshBasicMaterial({ color: 0x10b981, wireframe: true });
        }

        const mesh = new THREE.Mesh(geo, mat);
        mesh.position.set(obj.position[0], obj.position[1], obj.position[2]);
        mesh.castShadow = true;
        mesh.receiveShadow = true;
        scene.add(mesh);

        if (obj.type === 'finish_line') {
          collidableObjects.push({ mesh, type: 'finish_line', id: obj.id });
        } else {
          collidableObjects.push({ mesh, type: obj.type, id: obj.id });
        }
      });
    }

    // ==========================================
    // PLAYER AVATAR (Built with User's Custom Head, Body Shape & Skin Tone)
    // ==========================================
    const playerGroup = new THREE.Group();
    const spawnPoint = worldDef.spawnPoint || [0, 1, 0];
    playerGroup.position.set(spawnPoint[0], spawnPoint[1], spawnPoint[2]);

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

    // Player Torso
    const torsoGeo = new THREE.BoxGeometry(torsoWidth, torsoHeight, torsoDepth);
    const bodyMesh = new THREE.Mesh(torsoGeo, torsoMat);
    bodyMesh.position.y = legHeight + torsoHeight / 2;
    bodyMesh.castShadow = true;
    playerGroup.add(bodyMesh);

    // Player Legs
    const legGeo = new THREE.BoxGeometry(torsoWidth * 0.42, legHeight, torsoDepth * 0.85);
    const leftLeg = new THREE.Mesh(legGeo, legsMat);
    leftLeg.position.set(-torsoWidth * 0.26, legHeight / 2, 0);
    playerGroup.add(leftLeg);

    const rightLeg = new THREE.Mesh(legGeo, legsMat);
    rightLeg.position.set(torsoWidth * 0.26, legHeight / 2, 0);
    playerGroup.add(rightLeg);

    // Player Head (Custom Shape)
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
    // OTHER MULTIPLAYER PLAYER AVATARS (Simulated Server Room)
    // ==========================================
    // Other Player 1: SpeedDemon99
    const otherPlayer1 = new THREE.Group();
    otherPlayer1.position.set(4, 1, -5);
    const op1Body = new THREE.Mesh(new THREE.BoxGeometry(0.8, 1.1, 0.4), new THREE.MeshStandardMaterial({ color: 0xf59e0b }));
    op1Body.position.y = 0.55;
    otherPlayer1.add(op1Body);
    const op1Head = new THREE.Mesh(new THREE.BoxGeometry(0.7, 0.7, 0.7), new THREE.MeshStandardMaterial({ color: 0xffd54f }));
    op1Head.position.y = 1.45;
    otherPlayer1.add(op1Head);
    scene.add(otherPlayer1);

    // Other Player 2: PixelQueen
    const otherPlayer2 = new THREE.Group();
    otherPlayer2.position.set(-5, 1, -12);
    const op2Body = new THREE.Mesh(new THREE.BoxGeometry(0.75, 1.05, 0.4), new THREE.MeshStandardMaterial({ color: 0xa855f7 }));
    op2Body.position.y = 0.52;
    otherPlayer2.add(op2Body);
    const op2Head = new THREE.Mesh(new THREE.SphereGeometry(0.42, 20, 20), new THREE.MeshStandardMaterial({ color: 0xffb74d }));
    op2Head.position.y = 1.42;
    otherPlayer2.add(op2Head);
    scene.add(otherPlayer2);

    // ==========================================
    // CONTROLS & PHYSICS STATE
    // ==========================================
    const keys: { [key: string]: boolean } = {};
    const speed = 0.26;
    let velocityY = 0;
    let isGrounded = true;

    const onKeyDown = (e: KeyboardEvent) => {
      // Hotkey: Pressing 'T' or '/' focuses chat when not already typing
      if (!isChatFocusedRef.current && (e.code === 'KeyT' || e.code === 'Slash')) {
        e.preventDefault();
        chatInputRef.current?.focus();
        return;
      }

      // If typing in chat, ignore game movement keys!
      if (isChatFocusedRef.current) return;

      keys[e.code] = true;
    };

    const onKeyUp = (e: KeyboardEvent) => {
      if (isChatFocusedRef.current) return;
      keys[e.code] = false;
    };

    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);

    // Ambient Multiplayer Chat Interval (Every ~24 seconds)
    const ambientChatInterval = setInterval(() => {
      const banterList = [
        { sender: 'SpeedDemon99', text: 'Check out the high ramp on the left side!', target: 'other1' as const, color: 'text-amber-400' },
        { sender: 'PixelQueen', text: 'The physics on this track feel super smooth ✨', target: 'other2' as const, color: 'text-fuchsia-400' },
        { sender: 'SpeedDemon99', text: 'Anyone found the hidden secret coin yet?', target: 'other1' as const, color: 'text-amber-400' },
      ];
      const randomBanter = banterList[Math.floor(Math.random() * banterList.length)];
      receiveMessage(randomBanter.sender, randomBanter.text, randomBanter.target, randomBanter.color);
    }, 24000);

    // ==========================================
    // ANIMATION & GAME LOOP
    // ==========================================
    let animationFrameId: number;
    const clock = new THREE.Clock();
    const tempProjVec = new THREE.Vector3();

    const gameLoop = () => {
      animationFrameId = requestAnimationFrame(gameLoop);
      const elapsedTime = clock.getElapsedTime();

      // Keyboard movement (only if not typing in chat)
      let moveX = 0;
      let moveZ = 0;

      if (!isChatFocusedRef.current) {
        if (keys['KeyW'] || keys['ArrowUp']) moveZ -= 1;
        if (keys['KeyS'] || keys['ArrowDown']) moveZ += 1;
        if (keys['KeyA'] || keys['ArrowLeft']) moveX -= 1;
        if (keys['KeyD'] || keys['ArrowRight']) moveX += 1;
      }

      if (moveX !== 0 || moveZ !== 0) {
        const moveVector = new THREE.Vector3(moveX, 0, moveZ).normalize().multiplyScalar(speed);
        playerGroup.position.add(moveVector);
        playerGroup.rotation.y = Math.atan2(moveX, moveZ);
        setSpeedMeter(Math.round(moveVector.length() * 100));
      } else {
        setSpeedMeter(0);
      }

      // Jump Physics
      if (!isChatFocusedRef.current && keys['Space'] && isGrounded) {
        velocityY = 0.32;
        isGrounded = false;
      }

      if (!isGrounded) {
        playerGroup.position.y += velocityY;
        velocityY -= 0.018; // Gravity
        if (playerGroup.position.y <= 1) {
          playerGroup.position.y = 1;
          isGrounded = true;
          velocityY = 0;
        }
      }

      // Third-Person Camera Follow
      camera.position.set(
        playerGroup.position.x,
        playerGroup.position.y + 4,
        playerGroup.position.z + 8
      );
      camera.lookAt(playerGroup.position.x, playerGroup.position.y + 1, playerGroup.position.z);

      // Rotate Collectible Coins
      coinsGroup.forEach((coin) => {
        coin.rotation.y += 0.03;
        if (playerGroup.position.distanceTo(coin.position) < 1.5 && coin.visible) {
          coin.visible = false;
          setCoinsCollected((prev) => {
            const nextCount = prev + 1;
            if (nextCount === 3) {
              setTimeout(() => {
                receiveMessage('SpeedDemon99', `Nice coin pickup streak, ${user.displayName}!`, 'other1');
              }, 400);
            }
            return nextCount;
          });
          onRewardCoins(10);
        }
      });

      // Check Finish Gate Collision
      collidableObjects.forEach((obj) => {
        if (obj.type === 'finish_line' && playerGroup.position.distanceTo(obj.mesh.position) < 3.2) {
          if (!hasWon) {
            setHasWon(true);
            confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
            receiveMessage('PixelQueen', `GG ${user.displayName}! Stage cleared with top marks! 🏁`, 'other2');
          }
        }
        // Lava Hazard Reset
        if (obj.type === 'lava_hazard' && playerGroup.position.distanceTo(obj.mesh.position) < 2.5) {
          playerGroup.position.set(spawnPoint[0], spawnPoint[1], spawnPoint[2]);
        }
      });

      // Simulated Multiplayer Avatar Patrol Movements
      otherPlayer1.position.z = -5 + Math.sin(elapsedTime * 1.5) * 5;
      otherPlayer2.position.x = -5 + Math.cos(elapsedTime * 1.2) * 3;

      // ==========================================
      // Project 3D Speech Bubble Overheads to 2D Screen Coordinates
      // ==========================================
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
          npcName: game.worldData.npcs?.[0]?.name || 'Pit Chief Jax',
          npcRole: game.worldData.npcs?.[0]?.role || 'Guide',
          userMessage: npcInput || 'Hello!',
          worldContext: game.title,
        }),
      });
      const data = await res.json();
      setNpcReply(data.responseText);
    } catch {
      setNpcReply('Welcome explorer! Good luck in the race!');
    } finally {
      setIsNpcLoading(false);
    }
  };

  return (
    <div id="game-runner-viewport" className="fixed inset-0 z-50 bg-slate-950 flex flex-col justify-between select-none">
      
      {/* TOP HUD OVERLAY */}
      <div className="absolute top-4 left-4 right-4 z-20 flex items-center justify-between pointer-events-none">
        
        {/* Game Title & Status */}
        <div className="flex items-center gap-3 bg-slate-900/90 border border-slate-800 rounded-2xl p-2.5 px-4 backdrop-blur-md shadow-xl pointer-events-auto">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-cyan-500 to-indigo-500 flex items-center justify-center font-black text-slate-950">
            A
          </div>
          <div>
            <h2 className="font-extrabold text-sm text-white">{game.title}</h2>
            <p className="text-[10px] text-emerald-400 font-bold flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              Connected • 3 Players in Room
            </p>
          </div>
        </div>

        {/* HUD Center Stats */}
        <div className="flex items-center gap-3 bg-slate-900/90 border border-slate-800 rounded-2xl p-2.5 px-5 backdrop-blur-md shadow-xl pointer-events-auto text-xs font-black text-white">
          <div className="flex items-center gap-1.5 text-amber-400">
            <Trophy className="w-4 h-4" />
            <span>Coins: {coinsCollected}</span>
          </div>
          <div className="w-px h-4 bg-slate-800" />
          <div className="flex items-center gap-1.5 text-cyan-400">
            <Navigation className="w-4 h-4" />
            <span>Speed: {speedMeter} MPH</span>
          </div>
        </div>

        {/* Top Right Actions */}
        <div className="flex items-center gap-2 pointer-events-auto">
          <button
            onClick={() => setIsMuted(!isMuted)}
            className="p-2.5 rounded-2xl bg-slate-900/90 border border-slate-800 text-slate-300 hover:text-white backdrop-blur-md cursor-pointer"
            title={isMuted ? 'Unmute' : 'Mute'}
          >
            {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
          </button>
          <button
            id="btn-leave-game-world"
            onClick={onExitGame}
            className="px-4 py-2.5 rounded-2xl bg-rose-600 hover:bg-rose-500 text-white font-extrabold text-xs shadow-lg shadow-rose-600/30 cursor-pointer flex items-center gap-1.5 transition-all"
          >
            <X className="w-4 h-4" />
            Leave World
          </button>
        </div>

      </div>

      {/* 3D WebGL Canvas Mounting Point */}
      <div ref={mountRef} className="w-full h-full relative" />

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
            {/* Pointer arrow pointing down at player head */}
            <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-0 h-0 border-x-6 border-x-transparent border-t-8 border-t-cyan-400" />
          </div>
        )}
      </div>

      {/* Other Player 1 (SpeedDemon99) Speech Bubble */}
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

      {/* Other Player 2 (PixelQueen) Speech Bubble */}
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
              name: game.worldData.npcs?.[0]?.name || 'Pit Chief Jax',
              role: game.worldData.npcs?.[0]?.role || 'Guide',
              dialogue: game.worldData.npcs?.[0]?.dialogue || ['Welcome to the race track!'],
            });
            handleTalkToNpc();
          }}
          className="pointer-events-auto flex items-center gap-2 px-4 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold text-xs shadow-lg cursor-pointer transition-all"
        >
          <Sparkles className="w-4 h-4 text-yellow-300" />
          Talk to World NPC
        </button>

      </div>

      {/* VICTORY BANNER OVERLAY */}
      {hasWon && (
        <div className="absolute inset-0 z-30 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-amber-500/50 rounded-3xl p-8 max-w-md w-full text-center space-y-4 shadow-2xl">
            <div className="w-16 h-16 bg-amber-500/20 text-amber-400 rounded-full flex items-center justify-center mx-auto text-3xl font-black">
              🏆
            </div>
            <h2 className="text-2xl font-black text-white tracking-wide">STAGE COMPLETED!</h2>
            <p className="text-xs text-slate-300">You reached the victory finish line gate! +100 A-Coins rewarded.</p>
            <button
              onClick={() => setHasWon(false)}
              className="w-full py-3 rounded-2xl bg-gradient-to-r from-amber-400 to-amber-500 text-slate-950 font-black text-sm cursor-pointer shadow-lg"
            >
              Continue Exploring
            </button>
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
                🤖
              </div>
              <div>
                <h3 className="font-extrabold text-white text-base">{activeNpc.name}</h3>
                <p className="text-xs text-cyan-400">{activeNpc.role}</p>
              </div>
            </div>
            <div className="p-4 bg-slate-950/80 rounded-2xl border border-slate-800 text-slate-200 text-xs leading-relaxed min-h-16">
              {isNpcLoading ? (
                <span className="text-slate-400 italic">Thinking...</span>
              ) : (
                npcReply || activeNpc.dialogue[0]
              )}
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Ask this NPC something..."
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
