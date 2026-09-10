import { AcadoGame } from '../types';

export const HARDCORE_OBBY_GAME: AcadoGame = {
  id: 'game_obby_hardcore',
  title: 'INFERNO GAUNTLET: 10 Hardcore Stages',
  description: 'The ultimate rage-inducing 3D parkour challenge! 10 punishing stages: razor-thin tightropes, lethal sweeping spinners, disappearing ghost platforms, electric laser grids, and high-altitude trampoline leaps over a boiling lava ocean.',
  creatorId: 'c_parkour_elite',
  creatorName: 'ObbyGrandmaster',
  thumbnailUrl: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=600&auto=format&fit=crop&q=80',
  category: 'Obby',
  playerCount: 3840,
  maxPlayers: 20,
  rating: 4.96,
  likesCount: 68400,
  favoritesCount: 34100,
  visitsCount: 520000,
  featured: true,
  trending: true,
  newRelease: true,
  tags: ['Obby', 'Hardcore', 'Parkour', 'Rage Game', 'Speedrun', '3D', 'Challenging'],
  currentVersion: 'v2.0.0',
  versions: [
    {
      versionNumber: 'v2.0.0',
      releaseDate: '2026-09-10',
      changelog: 'Revamped physics, added checkpoint chimes, laser grid hazards, bounce pads, and moving platforms.',
      worldDataSnapshot: {} as any,
    },
  ],
  activeServers: [
    { id: 'srv_obby_1', name: 'US-East Hardcore Gauntlet #1', region: 'US East', currentPlayers: 18, maxPlayers: 20, ping: 16 },
    { id: 'srv_obby_2', name: 'EU-West Hardcore Gauntlet #2', region: 'EU West', currentPlayers: 15, maxPlayers: 20, ping: 28 },
    { id: 'srv_obby_3', name: 'Asia Speedrunners Hub', region: 'Asia Pacific', currentPlayers: 12, maxPlayers: 20, ping: 54 },
  ],
  achievements: [
    { id: 'ob_ach_1', gameTitle: 'INFERNO GAUNTLET', title: 'First Blood', description: 'Survive and conquer Stage 1 & 2', rewardCoins: 100, unlocked: false, progress: 0, maxProgress: 1 },
    { id: 'ob_ach_2', gameTitle: 'INFERNO GAUNTLET', title: 'Acrobatic Master', description: 'Clear the Meatgrinder spinners without dying', rewardCoins: 250, unlocked: false, progress: 0, maxProgress: 1 },
    { id: 'ob_ach_3', gameTitle: 'INFERNO GAUNTLET', title: 'Gauntlet Champion', description: 'Reach the Champion Apex and touch the Victory Portal', rewardCoins: 500, unlocked: false, progress: 0, maxProgress: 1 },
  ],
  worldData: {
    skyColor: '#1a0505',
    timeOfDay: 'sunset',
    weather: 'fog',
    gravity: 9.8,
    spawnPoint: [0, 1.5, 0],
    objects: [
      // ==========================================
      // LETHAL LAVA OCEAN (Bottom Hazard Floor)
      // ==========================================
      {
        id: 'lava_ocean_floor',
        name: 'Infernal Lava Sea',
        type: 'lava_hazard',
        position: [0, -3.5, -95],
        rotation: [0, 0, 0],
        scale: [120, 2, 260],
        color: '#ff2200',
        material: 'neon',
        behavior: 'hazard',
      },

      // ==========================================
      // STAGE 0: BASE CAMP (Starting Area)
      // ==========================================
      {
        id: 'base_camp_spawn',
        name: 'Base Camp Platform',
        type: 'checkpoint',
        position: [0, 0.5, 0],
        rotation: [0, 0, 0],
        scale: [8, 1, 8],
        color: '#0ea5e9',
        material: 'smooth',
        behavior: 'static',
        stage: 0,
      },
      {
        id: 'spawn_arch_left',
        name: 'Spawn Pillar Left',
        type: 'block',
        position: [-3.8, 3, 0],
        rotation: [0, 0, 0],
        scale: [0.8, 5, 0.8],
        color: '#334155',
        material: 'smooth',
      },
      {
        id: 'spawn_arch_right',
        name: 'Spawn Pillar Right',
        type: 'block',
        position: [3.8, 3, 0],
        rotation: [0, 0, 0],
        scale: [0.8, 5, 0.8],
        color: '#334155',
        material: 'smooth',
      },
      {
        id: 'spawn_arch_top',
        name: 'Spawn Archway Beam',
        type: 'block',
        position: [0, 5.8, 0],
        rotation: [0, 0, 0],
        scale: [8.4, 0.8, 0.8],
        color: '#ef4444',
        material: 'neon',
      },

      // ==========================================
      // STAGE 1: THE RAZOR STEPPING STONES (Precision Parkour)
      // Small 1.3x1.3 pads spaced apart with elevation steps
      // ==========================================
      {
        id: 'stg1_pad_1',
        name: 'Stepping Stone #1',
        type: 'block',
        position: [0, 1.2, -6.5],
        rotation: [0, 0, 0],
        scale: [1.6, 0.6, 1.6],
        color: '#06b6d4',
        material: 'neon',
      },
      {
        id: 'stg1_coin_1',
        name: 'Bravery Coin 1',
        type: 'coin',
        position: [0, 2.2, -6.5],
        rotation: [0, 0, 0],
        scale: [1, 1, 1],
        color: '#ffd700',
        behavior: 'collectible',
      },
      {
        id: 'stg1_pad_2',
        name: 'Stepping Stone #2',
        type: 'block',
        position: [2.5, 1.8, -12],
        rotation: [0, 0, 0],
        scale: [1.3, 0.6, 1.3],
        color: '#3b82f6',
        material: 'neon',
      },
      {
        id: 'stg1_pad_3',
        name: 'Stepping Stone #3',
        type: 'block',
        position: [-2.2, 2.5, -17.5],
        rotation: [0, 0, 0],
        scale: [1.2, 0.6, 1.2],
        color: '#8b5cf6',
        material: 'neon',
      },
      {
        id: 'stg1_pad_4',
        name: 'Stepping Stone #4 (Micro)',
        type: 'cylinder',
        position: [1.5, 3.2, -23],
        rotation: [0, 0, 0],
        scale: [1.3, 0.6, 1.3],
        color: '#ec4899',
        material: 'neon',
      },

      // CHECKPOINT 1
      {
        id: 'chk_stage_1',
        name: 'Checkpoint 1 (Rest Oasis)',
        type: 'checkpoint',
        position: [0, 3.8, -28.5],
        rotation: [0, 0, 0],
        scale: [4.5, 0.8, 4.5],
        color: '#3b82f6',
        material: 'neon',
        stage: 1,
      },

      // ==========================================
      // STAGE 2: THE RED LASER GRID
      // Platforms with lethal glowing red laser beams you must leap over!
      // ==========================================
      {
        id: 'stg2_plat_1',
        name: 'Laser Runway 1',
        type: 'block',
        position: [0, 4.2, -35],
        rotation: [0, 0, 0],
        scale: [2.8, 0.6, 5],
        color: '#1e293b',
        material: 'smooth',
      },
      {
        id: 'stg2_laser_1',
        name: 'Lethal Laser Beam 1',
        type: 'laser',
        position: [0, 4.8, -35],
        rotation: [0, 0, 0],
        scale: [3.4, 0.2, 0.2],
        color: '#ff0033',
        material: 'neon',
        behavior: 'hazard',
      },
      {
        id: 'stg2_plat_2',
        name: 'Laser Runway 2',
        type: 'block',
        position: [0, 4.8, -43],
        rotation: [0, 0, 0],
        scale: [2.8, 0.6, 5],
        color: '#1e293b',
        material: 'smooth',
      },
      {
        id: 'stg2_laser_2',
        name: 'Lethal Laser Beam 2',
        type: 'laser',
        position: [0, 5.4, -43],
        rotation: [0, 0, 0],
        scale: [3.4, 0.2, 0.2],
        color: '#ff0033',
        material: 'neon',
        behavior: 'hazard',
      },
      {
        id: 'stg2_coin_2',
        name: 'Laser Hop Reward Coin',
        type: 'coin',
        position: [0, 6.2, -43],
        rotation: [0, 0, 0],
        scale: [1, 1, 1],
        color: '#ffd700',
        behavior: 'collectible',
      },

      // CHECKPOINT 2
      {
        id: 'chk_stage_2',
        name: 'Checkpoint 2 (Pillar of Focus)',
        type: 'checkpoint',
        position: [0, 5.5, -50],
        rotation: [0, 0, 0],
        scale: [4.5, 0.8, 4.5],
        color: '#3b82f6',
        material: 'neon',
        stage: 2,
      },

      // ==========================================
      // STAGE 3: THE TIGHTROPE OF TERROR (Razor Beam Traverse)
      // Ultra-narrow 0.35m beam across a 16m chasm!
      // ==========================================
      {
        id: 'stg3_tightrope',
        name: 'Razor Thin Tightrope',
        type: 'block',
        position: [0, 5.8, -60],
        rotation: [0, 0, 0],
        scale: [0.38, 0.5, 15],
        color: '#f59e0b',
        material: 'neon',
      },

      // CHECKPOINT 3
      {
        id: 'chk_stage_3',
        name: 'Checkpoint 3 (Spinner Antechamber)',
        type: 'checkpoint',
        position: [0, 6.2, -70],
        rotation: [0, 0, 0],
        scale: [5, 0.8, 5],
        color: '#3b82f6',
        material: 'neon',
        stage: 3,
      },

      // ==========================================
      // STAGE 4: THE MEATGRINDER SPINNERS (Rotating Sweepers)
      // Large circular platform with a lethal horizontal sweeping blade!
      // ==========================================
      {
        id: 'stg4_spinner_arena',
        name: 'Meatgrinder Platform',
        type: 'cylinder',
        position: [0, 6.8, -80],
        rotation: [0, 0, 0],
        scale: [7.5, 0.8, 7.5],
        color: '#0f172a',
        material: 'smooth',
      },
      {
        id: 'stg4_hazard_spinner',
        name: 'Lethal Sweeper Blade',
        type: 'spinner',
        position: [0, 7.6, -80],
        rotation: [0, 0, 0],
        scale: [7.8, 0.35, 0.35],
        color: '#ff0055',
        material: 'neon',
        behavior: 'hazard_spinner',
        speed: 2.2,
      },

      // CHECKPOINT 4
      {
        id: 'chk_stage_4',
        name: 'Checkpoint 4 (Ghost Walk Gate)',
        type: 'checkpoint',
        position: [0, 7.5, -90],
        rotation: [0, 0, 0],
        scale: [4.5, 0.8, 4.5],
        color: '#3b82f6',
        material: 'neon',
        stage: 4,
      },

      // ==========================================
      // STAGE 5: THE DISAPPEARING GHOST PLATFORMS
      // Platforms that cycle between solid and transparent void!
      // ==========================================
      {
        id: 'stg5_ghost_1',
        name: 'Ghost Platform 1',
        type: 'block',
        position: [-2.2, 8.2, -96.5],
        rotation: [0, 0, 0],
        scale: [2.2, 0.5, 2.2],
        color: '#06b6d4',
        material: 'glass',
        behavior: 'fading',
      },
      {
        id: 'stg5_ghost_2',
        name: 'Ghost Platform 2',
        type: 'block',
        position: [2.2, 9.0, -103],
        rotation: [0, 0, 0],
        scale: [2.0, 0.5, 2.0],
        color: '#a855f7',
        material: 'glass',
        behavior: 'fading',
      },
      {
        id: 'stg5_ghost_3',
        name: 'Ghost Platform 3',
        type: 'block',
        position: [0, 9.8, -109.5],
        rotation: [0, 0, 0],
        scale: [2.0, 0.5, 2.0],
        color: '#ec4899',
        material: 'glass',
        behavior: 'fading',
      },

      // CHECKPOINT 5
      {
        id: 'chk_stage_5',
        name: 'Checkpoint 5 (Wall Hop Base)',
        type: 'checkpoint',
        position: [0, 10.4, -116],
        rotation: [0, 0, 0],
        scale: [4.5, 0.8, 4.5],
        color: '#3b82f6',
        material: 'neon',
        stage: 5,
      },

      // ==========================================
      // STAGE 6: THE ASCENDING WALL-HOP PEGS
      // Tiny 1x1 pegs climbing upwards along a massive vertical monolith
      // ==========================================
      {
        id: 'stg6_monolith_wall',
        name: 'Monolith Backdrop Wall',
        type: 'block',
        position: [0, 15, -127],
        rotation: [0, 0, 0],
        scale: [12, 14, 1.2],
        color: '#1e1e2e',
        material: 'metal',
      },
      {
        id: 'stg6_peg_1',
        name: 'Wall Peg Alpha',
        type: 'block',
        position: [-2.5, 11.4, -123],
        rotation: [0, 0, 0],
        scale: [1.2, 0.4, 1.2],
        color: '#f59e0b',
        material: 'neon',
      },
      {
        id: 'stg6_peg_2',
        name: 'Wall Peg Beta',
        type: 'block',
        position: [2.5, 12.6, -123],
        rotation: [0, 0, 0],
        scale: [1.1, 0.4, 1.1],
        color: '#10b981',
        material: 'neon',
      },
      {
        id: 'stg6_peg_3',
        name: 'Wall Peg Gamma',
        type: 'block',
        position: [-1.8, 13.9, -123],
        rotation: [0, 0, 0],
        scale: [1.0, 0.4, 1.0],
        color: '#6366f1',
        material: 'neon',
      },
      {
        id: 'stg6_coin_3',
        name: 'High Peg Bonus Coin',
        type: 'coin',
        position: [-1.8, 15.0, -123],
        rotation: [0, 0, 0],
        scale: [1, 1, 1],
        color: '#ffd700',
        behavior: 'collectible',
      },

      // CHECKPOINT 6
      {
        id: 'chk_stage_6',
        name: 'Checkpoint 6 (Oscillator Ridge)',
        type: 'checkpoint',
        position: [0, 14.8, -132],
        rotation: [0, 0, 0],
        scale: [4.5, 0.8, 4.5],
        color: '#3b82f6',
        material: 'neon',
        stage: 6,
      },

      // ==========================================
      // STAGE 7: MOVING OSCILLATING CHASM CROSSERS
      // Sliding platforms moving side-to-side across the abyss!
      // ==========================================
      {
        id: 'stg7_mover_1',
        name: 'Sliding Chasm Crosser #1',
        type: 'block',
        position: [0, 15.4, -140],
        rotation: [0, 0, 0],
        scale: [2.6, 0.6, 2.6],
        color: '#06b6d4',
        material: 'neon',
        behavior: 'oscillating',
        axis: 'x',
        distance: 4.5,
        speed: 1.8,
      },
      {
        id: 'stg7_mover_2',
        name: 'Sliding Chasm Crosser #2',
        type: 'block',
        position: [0, 16.2, -149],
        rotation: [0, 0, 0],
        scale: [2.4, 0.6, 2.4],
        color: '#f43f5e',
        material: 'neon',
        behavior: 'oscillating',
        axis: 'x',
        distance: 5.0,
        speed: 2.2,
      },

      // CHECKPOINT 7
      {
        id: 'chk_stage_7',
        name: 'Checkpoint 7 (Trampoline Launchpad)',
        type: 'checkpoint',
        position: [0, 16.8, -158],
        rotation: [0, 0, 0],
        scale: [5, 0.8, 5],
        color: '#3b82f6',
        material: 'neon',
        stage: 7,
      },

      // ==========================================
      // STAGE 8: SUPER TRAMPOLINE MEGA-LEAP
      // High-powered bounce pad launching player into the sky!
      // ==========================================
      {
        id: 'stg8_trampoline',
        name: 'High-Impulse Trampoline',
        type: 'bounce_pad',
        position: [0, 17.2, -164],
        rotation: [0, 0, 0],
        scale: [3.2, 0.5, 3.2],
        color: '#fbbf24',
        material: 'neon',
        behavior: 'bouncy',
      },
      {
        id: 'stg8_high_landing',
        name: 'Sky Perch Landing Island',
        type: 'block',
        position: [0, 24.5, -177],
        rotation: [0, 0, 0],
        scale: [5.5, 1, 5.5],
        color: '#1e293b',
        material: 'smooth',
      },

      // CHECKPOINT 8
      {
        id: 'chk_stage_8',
        name: 'Checkpoint 8 (Spiral Spire Base)',
        type: 'checkpoint',
        position: [0, 25.2, -177],
        rotation: [0, 0, 0],
        scale: [4, 0.4, 4],
        color: '#3b82f6',
        material: 'neon',
        stage: 8,
      },

      // ==========================================
      // STAGE 9: THE SPIRAL ASCENT OF FIRE
      // Micro-cylinders spiraling around a volcanic spire
      // ==========================================
      {
        id: 'stg9_central_spire',
        name: 'Volcanic Core Spire',
        type: 'cylinder',
        position: [0, 31, -192],
        rotation: [0, 0, 0],
        scale: [3.5, 14, 3.5],
        color: '#7f1d1d',
        material: 'metal',
      },
      {
        id: 'stg9_step_1',
        name: 'Spiral Step 1',
        type: 'cylinder',
        position: [3.2, 26.2, -192],
        rotation: [0, 0, 0],
        scale: [1.3, 0.4, 1.3],
        color: '#f97316',
        material: 'neon',
      },
      {
        id: 'stg9_step_2',
        name: 'Spiral Step 2',
        type: 'cylinder',
        position: [2.2, 27.4, -195],
        rotation: [0, 0, 0],
        scale: [1.2, 0.4, 1.2],
        color: '#fbbf24',
        material: 'neon',
      },
      {
        id: 'stg9_step_3',
        name: 'Spiral Step 3',
        type: 'cylinder',
        position: [-0.5, 28.6, -196],
        rotation: [0, 0, 0],
        scale: [1.2, 0.4, 1.2],
        color: '#a855f7',
        material: 'neon',
      },
      {
        id: 'stg9_step_4',
        name: 'Spiral Step 4',
        type: 'cylinder',
        position: [-3.0, 29.8, -192],
        rotation: [0, 0, 0],
        scale: [1.2, 0.4, 1.2],
        color: '#ec4899',
        material: 'neon',
      },
      {
        id: 'stg9_step_5',
        name: 'Spiral Step 5',
        type: 'cylinder',
        position: [-1.2, 31.0, -188],
        rotation: [0, 0, 0],
        scale: [1.2, 0.4, 1.2],
        color: '#06b6d4',
        material: 'neon',
      },
      {
        id: 'stg9_step_6',
        name: 'Spiral Step 6 (Final Leap)',
        type: 'cylinder',
        position: [1.8, 32.2, -188],
        rotation: [0, 0, 0],
        scale: [1.3, 0.4, 1.3],
        color: '#10b981',
        material: 'neon',
      },

      // ==========================================
      // STAGE 10: THE CHAMPION'S APEX SUMMIT & VICTORY PORTAL
      // Massive golden floating sanctuary, victory gate, trophy
      // ==========================================
      {
        id: 'stg10_victory_apex',
        name: 'Champion Apex Sanctuary',
        type: 'block',
        position: [0, 33.5, -206],
        rotation: [0, 0, 0],
        scale: [12, 1.2, 12],
        color: '#fbbf24',
        material: 'smooth',
      },
      {
        id: 'stg10_pillar_left',
        name: 'Apex Pillar Left',
        type: 'cylinder',
        position: [-4.5, 37.5, -208],
        rotation: [0, 0, 0],
        scale: [1, 7, 1],
        color: '#ffffff',
        material: 'smooth',
      },
      {
        id: 'stg10_pillar_right',
        name: 'Apex Pillar Right',
        type: 'cylinder',
        position: [4.5, 37.5, -208],
        rotation: [0, 0, 0],
        scale: [1, 7, 1],
        color: '#ffffff',
        material: 'smooth',
      },
      {
        id: 'stg10_finish_portal',
        name: 'Victory Triumph Portal',
        type: 'finish_line',
        position: [0, 36.5, -208],
        rotation: [0, 0, 0],
        scale: [7, 6, 1.5],
        color: '#10b981',
        material: 'neon',
      },
      {
        id: 'stg10_grand_coin_1',
        name: 'Champion Gold Coin Left',
        type: 'coin',
        position: [-2.5, 35.0, -204],
        rotation: [0, 0, 0],
        scale: [1.5, 1.5, 1.5],
        color: '#ffd700',
        behavior: 'collectible',
      },
      {
        id: 'stg10_grand_coin_2',
        name: 'Champion Gold Coin Right',
        type: 'coin',
        position: [2.5, 35.0, -204],
        rotation: [0, 0, 0],
        scale: [1.5, 1.5, 1.5],
        color: '#ffd700',
        behavior: 'collectible',
      },
    ],
    scripts: [
      {
        id: 'sc_hazard_respawn',
        name: 'InfernoRespawnEngine.lua',
        code: '-- ACADO Hardcore Obby Core\nfunction onHazardTouch(player)\n  player:PlaySound("lava_sizzle")\n  player:AddDeathCount(1)\n  player:RespawnAtLastCheckpoint()\nend',
        enabled: true,
        lastEdited: '2026-09-10',
      },
    ],
    npcs: [
      {
        id: 'npc_sensei_jin',
        name: 'Sensei Jin (Obby Master)',
        role: 'guide',
        position: [2.8, 1.0, 1.5],
        avatarConfig: {
          skinColor: '#FFC107',
          headStyle: 'cyber',
          faceExpression: 'hero',
          hairStyle: 'spiky',
          hairColor: '#111',
          torsoColor: '#7C3AED',
          legsColor: '#1E1E2E',
          armsColor: '#7C3AED',
        },
        dialogue: [
          'Welcome to the Inferno Gauntlet, challenger! Only 3% of players conquer all 10 stages.',
          'Pro tip: Hold SHIFT while running to gain sprint momentum for long distance gaps!',
          'On Stage 4 (Meatgrinder), time your jump right as the sweeper blade swings past your feet.',
          'Hit every glowing blue Checkpoint pad to save your respawn position!',
        ],
        questRewardCoins: 250,
      },
    ],
    quests: [
      {
        id: 'q_gauntlet_champion',
        title: 'Conquer the Inferno Gauntlet',
        description: 'Complete all 10 hardcore stages and step through the Victory Portal at the summit.',
        rewardCoins: 500,
        rewardXp: 1000,
      },
    ],
  },
};
