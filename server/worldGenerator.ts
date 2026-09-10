/**
 * ACADO AI World Generator & Procedural Synthesis Engine
 * Provides multi-tier Gemini AI generation with instant semantic fallback.
 */

export interface GeneratedWorldPayload {
  title: string;
  description: string;
  category: 'Adventure' | 'Racing' | 'Obby' | 'Sports' | 'RPG' | 'Simulation';
  tags: string[];
  worldData: {
    skyColor: string;
    timeOfDay: 'day' | 'sunset' | 'night' | 'cyberpunk';
    weather: 'clear' | 'rain' | 'snow' | 'fog';
    gravity: number;
    spawnPoint: [number, number, number];
    objects: Array<{
      id: string;
      name: string;
      type: 'block' | 'sphere' | 'cylinder' | 'building' | 'road' | 'tree' | 'car' | 'npc' | 'light' | 'coin' | 'checkpoint' | 'finish_line' | 'water' | 'ramp' | 'goal_post' | 'lava_hazard';
      position: [number, number, number];
      rotation: [number, number, number];
      scale: [number, number, number];
      color: string;
      material?: 'smooth' | 'brick' | 'neon' | 'metal' | 'wood' | 'glass';
      behavior?: 'static' | 'moving' | 'spinning' | 'vehicle' | 'npc_dialogue' | 'hazard' | 'collectible';
      interactable?: boolean;
    }>;
    npcs: Array<{
      id: string;
      name: string;
      role: 'shopkeeper' | 'quest_giver' | 'guide' | 'enemy' | 'citizen';
      position: [number, number, number];
      avatarConfig?: any;
      dialogue: string[];
      questRewardCoins?: number;
    }>;
    quests: Array<{
      id: string;
      title: string;
      description: string;
      rewardCoins: number;
      rewardXp: number;
    }>;
    scripts: Array<{
      id: string;
      name: string;
      code: string;
      enabled: boolean;
      lastEdited: string;
    }>;
  };
}

export function synthesizeProceduralWorld(rawPrompt: string, styleChoice?: string): GeneratedWorldPayload {
  const p = (rawPrompt || '').toLowerCase();

  // Determine Primary Theme
  const isRacing = p.includes('race') || p.includes('car') || p.includes('track') || p.includes('speed') || p.includes('drift') || p.includes('city');
  const isObby = p.includes('obby') || p.includes('parkour') || p.includes('jump') || p.includes('tower') || p.includes('lava') || p.includes('hazard') || p.includes('platform');
  const isSports = p.includes('football') || p.includes('soccer') || p.includes('stadium') || p.includes('ball') || p.includes('goal') || p.includes('arena') || p.includes('sport');
  const isSpace = p.includes('space') || p.includes('planet') || p.includes('galaxy') || p.includes('cosmic') || p.includes('asteroid') || p.includes('alien') || p.includes('scifi') || p.includes('sci-fi');
  const isFantasy = p.includes('fantasy') || p.includes('castle') || p.includes('kingdom') || p.includes('knight') || p.includes('dragon') || p.includes('magic') || p.includes('bridge') || p.includes('medieval');

  if (isRacing) {
    return buildRacingWorld(rawPrompt, styleChoice);
  } else if (isSports) {
    return buildSportsWorld(rawPrompt, styleChoice);
  } else if (isSpace) {
    return buildSpaceWorld(rawPrompt, styleChoice);
  } else if (isFantasy) {
    return buildFantasyWorld(rawPrompt, styleChoice);
  } else {
    // Default to a thrilling Obby or Obstacle Parkour Course
    return buildObbyWorld(rawPrompt, styleChoice);
  }
}

// ----------------------------------------------------
// RACING WORLD BUILDER
// ----------------------------------------------------
function buildRacingWorld(prompt: string, style?: string): GeneratedWorldPayload {
  const isNeon = style === 'cyberpunk' || prompt.toLowerCase().includes('cyber') || prompt.toLowerCase().includes('neon');
  const skyColor = isNeon ? '#060814' : '#1a2238';
  
  const objects: GeneratedWorldPayload['worldData']['objects'] = [
    // Starting Grid Floor & Main Track
    { id: 'track_start', name: 'Start Line Paddock', type: 'road', position: [0, 0.1, 0], rotation: [0, 0, 0], scale: [12, 0.2, 20], color: '#181a20', material: 'smooth', behavior: 'static' },
    { id: 'track_sec_1', name: 'Velocity Straightaway', type: 'road', position: [0, 0.1, -30], rotation: [0, 0, 0], scale: [10, 0.2, 40], color: '#212529', material: 'smooth', behavior: 'static' },
    
    // Jump Ramp
    { id: 'ramp_speed', name: 'Nitro Launch Ramp', type: 'ramp', position: [0, 1.2, -42], rotation: [-0.25, 0, 0], scale: [6, 2.5, 8], color: isNeon ? '#00e5ff' : '#ff9800', material: 'metal', behavior: 'static' },
    
    // Road Curve / Chicane
    { id: 'track_sec_2', name: 'Apex Corner Pad', type: 'road', position: [10, 0.1, -65], rotation: [0, 0.4, 0], scale: [16, 0.2, 24], color: '#181a20', material: 'smooth', behavior: 'static' },
    { id: 'track_sec_3', name: 'Final Straight', type: 'road', position: [0, 0.1, -95], rotation: [0, 0, 0], scale: [12, 0.2, 36], color: '#212529', material: 'smooth', behavior: 'static' },

    // City Skyscraper Buildings
    { id: 'bldg_left_1', name: 'Cyber Tower Alpha', type: 'building', position: [-14, 12, -20], rotation: [0, 0, 0], scale: [10, 24, 12], color: '#0f172a', material: 'neon', behavior: 'static' },
    { id: 'bldg_right_1', name: 'Hyper Spire Beta', type: 'building', position: [14, 15, -45], rotation: [0, 0.1, 0], scale: [10, 30, 12], color: '#1e1b4b', material: 'neon', behavior: 'static' },
    { id: 'bldg_left_2', name: 'Plaza Tower Gamma', type: 'building', position: [-16, 18, -75], rotation: [0, 0, 0], scale: [12, 36, 14], color: '#311042', material: 'neon', behavior: 'static' },

    // Lighting & Atmosphere
    { id: 'light_gantry', name: 'Start Gantry Light', type: 'light', position: [0, 6, -5], rotation: [0, 0, 0], scale: [12, 1, 1], color: '#00f5d4', material: 'neon', behavior: 'static' },

    // Collectible Gold Coins along apex
    { id: 'coin_r1', name: 'Apex Bonus Coin #1', type: 'coin', position: [0, 1.2, -15], rotation: [0, 0, 0], scale: [1, 1, 1], color: '#ffd700', behavior: 'collectible' },
    { id: 'coin_r2', name: 'Ramp Airtime Coin', type: 'coin', position: [0, 3.5, -48], rotation: [0, 0, 0], scale: [1, 1, 1], color: '#ffd700', behavior: 'collectible' },
    { id: 'coin_r3', name: 'Corner Drift Coin', type: 'coin', position: [8, 1.2, -65], rotation: [0, 0, 0], scale: [1, 1, 1], color: '#ffd700', behavior: 'collectible' },
    { id: 'coin_r4', name: 'Sprint Victory Coin', type: 'coin', position: [0, 1.2, -88], rotation: [0, 0, 0], scale: [1, 1, 1], color: '#ffd700', behavior: 'collectible' },

    // Checkpoint & Finish Gate
    { id: 'chk_mid', name: 'Midway Sector Gate', type: 'checkpoint', position: [0, 0.2, -55], rotation: [0, 0, 0], scale: [10, 0.3, 2], color: '#3b82f6', material: 'neon', behavior: 'static' },
    { id: 'finish_gate', name: 'Grand Prix Finish Arch', type: 'finish_line', position: [0, 2, -110], rotation: [0, 0, 0], scale: [14, 4, 2], color: '#10b981', material: 'neon', behavior: 'static' },
  ];

  return {
    title: isNeon ? 'Neon Drift: Cyber Circuit' : 'Grand Prix Velocity Sprint',
    description: `High-speed competitive 3D racing experience with nitro ramps, apex chicanes, and city skyscrapers generated from prompt: "${prompt}".`,
    category: 'Racing',
    tags: ['Racing', 'Speed', 'Cars', 'City', '3D'],
    worldData: {
      skyColor,
      timeOfDay: isNeon ? 'cyberpunk' : 'sunset',
      weather: 'clear',
      gravity: 9.8,
      spawnPoint: [0, 1, 5],
      objects,
      npcs: [
        {
          id: 'npc_racer_chief',
          name: 'Chief Mechanic Axel',
          role: 'guide',
          position: [-4, 0.5, 2],
          dialogue: [
            'Warm up your engine, racer! The track is primed for top speed.',
            'Hit the neon launch ramp in sector 2 to get maximum airtime!',
            'Clear the final green laser gate to set the track record!'
          ],
          questRewardCoins: 120,
        },
      ],
      quests: [
        {
          id: 'quest_lap_record',
          title: 'Speedway Pioneer',
          description: 'Navigate the circuit, grab all 4 gold coins, launch over the nitro ramp, and cross the finish gate.',
          rewardCoins: 150,
          rewardXp: 250,
        }
      ],
      scripts: [
        {
          id: 'script_race_timer',
          name: 'RaceLapTimer.lua',
          code: `-- ACADO Racing Timer & Nitro Boost\nfunction onRampTrigger(player)\n    player:ApplyImpulse(Vector3.new(0, 15, -25))\n    SoundEngine:Play("nitro_boost.mp3")\nend`,
          enabled: true,
          lastEdited: new Date().toISOString(),
        }
      ],
    },
  };
}

// ----------------------------------------------------
// OBBY & PARKOUR WORLD BUILDER
// ----------------------------------------------------
function buildObbyWorld(prompt: string, style?: string): GeneratedWorldPayload {
  const isVolcano = prompt.toLowerCase().includes('lava') || prompt.toLowerCase().includes('fire') || prompt.toLowerCase().includes('volcano');
  const skyColor = isVolcano ? '#260808' : '#0a0d1f';

  const objects: GeneratedWorldPayload['worldData']['objects'] = [
    // Safe Starting Hub
    { id: 'p_start', name: 'Base Camp Platform', type: 'block', position: [0, 0.5, 0], rotation: [0, 0, 0], scale: [8, 1, 8], color: '#1e293b', material: 'smooth', behavior: 'static' },
    
    // Danger Hazard Floor Beneath Course
    { id: 'lava_ocean', name: 'Inferno Hazard Pit', type: 'lava_hazard', position: [0, -2, -45], rotation: [0, 0, 0], scale: [60, 1, 100], color: '#ef4444', material: 'neon', behavior: 'hazard' },

    // Stepping Jumping Pads (Rising staircase obby)
    { id: 'pad_1', name: 'Neon Stepping Pad #1', type: 'block', position: [0, 1.5, -7], rotation: [0, 0, 0], scale: [3, 0.6, 3], color: '#06b6d4', material: 'neon', behavior: 'static' },
    { id: 'pad_2', name: 'Neon Stepping Pad #2', type: 'block', position: [3.5, 2.5, -14], rotation: [0, 0, 0], scale: [2.5, 0.6, 2.5], color: '#3b82f6', material: 'neon', behavior: 'static' },
    { id: 'pad_3', name: 'Spinning Beam Step', type: 'cylinder', position: [-2.5, 3.8, -21], rotation: [0, 0.5, 0], scale: [4, 0.5, 4], color: '#8b5cf6', material: 'neon', behavior: 'spinning' },
    { id: 'pad_4', name: 'Narrow Beam Traverse', type: 'block', position: [0, 5.0, -28], rotation: [0, 0, 0], scale: [1.8, 0.6, 6], color: '#ec4899', material: 'smooth', behavior: 'static' },

    // Mid-Way Island with Checkpoint & Coin
    { id: 'island_mid', name: 'Sky Sanctuary Oasis', type: 'block', position: [0, 6.2, -38], rotation: [0, 0, 0], scale: [7, 0.8, 7], color: '#0f172a', material: 'smooth', behavior: 'static' },
    { id: 'chk_mid_obby', name: 'Mid-Course Respawn Beacon', type: 'checkpoint', position: [0, 6.8, -38], rotation: [0, 0, 0], scale: [4, 0.2, 4], color: '#10b981', material: 'neon', behavior: 'static' },

    // Harder Final Stage
    { id: 'pad_5', name: 'High Altitude Perch', type: 'block', position: [-4, 7.8, -48], rotation: [0, 0, 0], scale: [2.2, 0.6, 2.2], color: '#f59e0b', material: 'neon', behavior: 'static' },
    { id: 'pad_6', name: 'Zig-Zag Platform Alpha', type: 'block', position: [3, 9.2, -56], rotation: [0, 0, 0], scale: [2.2, 0.6, 2.2], color: '#ef4444', material: 'neon', behavior: 'static' },
    { id: 'pad_7', name: 'Precision Step Beta', type: 'block', position: [0, 10.5, -64], rotation: [0, 0, 0], scale: [2.0, 0.6, 2.0], color: '#a855f7', material: 'neon', behavior: 'static' },

    // Victory Climax Island
    { id: 'island_victory', name: 'Champion Summit', type: 'block', position: [0, 12.0, -75], rotation: [0, 0, 0], scale: [10, 1, 10], color: '#fbbf24', material: 'smooth', behavior: 'static' },
    { id: 'finish_gate_obby', name: 'Portal of Triumph', type: 'finish_line', position: [0, 13.5, -78], rotation: [0, 0, 0], scale: [8, 4, 1], color: '#10b981', material: 'neon', behavior: 'static' },

    // Gold Collectibles
    { id: 'coin_o1', name: 'Starter Coin', type: 'coin', position: [0, 2.2, -7], rotation: [0, 0, 0], scale: [1, 1, 1], color: '#ffd700', behavior: 'collectible' },
    { id: 'coin_o2', name: 'Sanctuary Coin', type: 'coin', position: [0, 7.5, -38], rotation: [0, 0, 0], scale: [1, 1, 1], color: '#ffd700', behavior: 'collectible' },
    { id: 'coin_o3', name: 'Summit Trophy Coin', type: 'coin', position: [0, 13.5, -73], rotation: [0, 0, 0], scale: [1.5, 1.5, 1.5], color: '#ffd700', behavior: 'collectible' },
  ];

  return {
    title: isVolcano ? 'Volcanic Crucible Obby' : 'Cyber Citadel: Parkour Ascent',
    description: `Challenging user-generated 3D obstacle course featuring progressive heights, neon jumping pads, and perilous hazard zones.`,
    category: 'Obby',
    tags: ['Obby', 'Parkour', 'Hardcore', 'Jumping', '3D'],
    worldData: {
      skyColor,
      timeOfDay: isVolcano ? 'sunset' : 'cyberpunk',
      weather: isVolcano ? 'fog' : 'clear',
      gravity: 9.8,
      spawnPoint: [0, 1.5, 0],
      objects,
      npcs: [
        {
          id: 'npc_master_jumper',
          name: 'Sensei Kaito',
          role: 'guide',
          position: [2.5, 1.0, 1],
          dialogue: [
            'Greetings challenger! The summit tests balance, patience, and timing.',
            'Avoid falling into the glowing hazard pit below at all costs!',
            'Claim all 3 golden relics along the ascent for maximum creator XP!'
          ],
          questRewardCoins: 150,
        }
      ],
      quests: [
        {
          id: 'quest_obby_conqueror',
          title: 'Master of the Leap',
          description: 'Reach the Champion Summit without touching the hazard pit and step through the Victory Portal.',
          rewardCoins: 180,
          rewardXp: 350,
        }
      ],
      scripts: [
        {
          id: 'script_hazard_respawn',
          name: 'HazardTrigger.lua',
          code: `-- Respawn player if touching hazard\nfunction onHazardTouch(player)\n    player:RespawnAtLastCheckpoint()\n    SoundEngine:Play("lava_sizzle.mp3")\nend`,
          enabled: true,
          lastEdited: new Date().toISOString(),
        }
      ],
    },
  };
}

// ----------------------------------------------------
// SPORTS & STADIUM WORLD BUILDER
// ----------------------------------------------------
function buildSportsWorld(prompt: string, style?: string): GeneratedWorldPayload {
  const skyColor = '#0f172a';
  const objects: GeneratedWorldPayload['worldData']['objects'] = [
    // Huge Green Turf Field
    { id: 'field_pitch', name: 'Premier Emerald Pitch', type: 'block', position: [0, 0.1, -25], rotation: [0, 0, 0], scale: [36, 0.2, 54], color: '#15803d', material: 'smooth', behavior: 'static' },
    
    // Boundary Lines & Center Circle
    { id: 'center_circle', name: 'Center Circle Spot', type: 'cylinder', position: [0, 0.2, -25], rotation: [0, 0, 0], scale: [8, 0.05, 8], color: '#f8fafc', material: 'smooth', behavior: 'static' },

    // Goal Posts
    { id: 'goal_home', name: 'North Goal Post', type: 'goal_post', position: [0, 2, 0], rotation: [0, 0, 0], scale: [10, 4, 3], color: '#ffffff', material: 'metal', behavior: 'static' },
    { id: 'goal_away', name: 'South Goal Post', type: 'goal_post', position: [0, 2, -50], rotation: [0, Math.PI, 0], scale: [10, 4, 3], color: '#ffffff', material: 'metal', behavior: 'static' },

    // Soccer Ball in Center
    { id: 'soccer_ball', name: 'Match Regulation Ball', type: 'sphere', position: [0, 1.2, -25], rotation: [0, 0, 0], scale: [1.8, 1.8, 1.8], color: '#ffffff', material: 'smooth', behavior: 'moving' },

    // Stadium Floodlights
    { id: 'light_tower_1', name: 'Floodlight North-West', type: 'light', position: [-20, 12, -5], rotation: [0, 0, 0], scale: [2, 16, 2], color: '#38bdf8', material: 'neon', behavior: 'static' },
    { id: 'light_tower_2', name: 'Floodlight North-East', type: 'light', position: [20, 12, -5], rotation: [0, 0, 0], scale: [2, 16, 2], color: '#38bdf8', material: 'neon', behavior: 'static' },
    { id: 'light_tower_3', name: 'Floodlight South-West', type: 'light', position: [-20, 12, -45], rotation: [0, 0, 0], scale: [2, 16, 2], color: '#38bdf8', material: 'neon', behavior: 'static' },
    { id: 'light_tower_4', name: 'Floodlight South-East', type: 'light', position: [20, 12, -45], rotation: [0, 0, 0], scale: [2, 16, 2], color: '#38bdf8', material: 'neon', behavior: 'static' },

    // Spectator Bleachers
    { id: 'stand_west', name: 'West Grandstand', type: 'building', position: [-24, 5, -25], rotation: [0, 0, 0], scale: [6, 10, 50], color: '#1e293b', material: 'smooth', behavior: 'static' },
    { id: 'stand_east', name: 'East Grandstand', type: 'building', position: [24, 5, -25], rotation: [0, 0, 0], scale: [6, 10, 50], color: '#1e293b', material: 'smooth', behavior: 'static' },

    // Goal Finish Line Gate
    { id: 'goal_finish', name: 'Goal Line Sensor', type: 'finish_line', position: [0, 2.5, -51], rotation: [0, 0, 0], scale: [10, 4, 1], color: '#22c55e', material: 'neon', behavior: 'static' },

    // Coins
    { id: 'coin_s1', name: 'Hat-Trick Coin #1', type: 'coin', position: [-6, 1.2, -15], rotation: [0, 0, 0], scale: [1, 1, 1], color: '#ffd700', behavior: 'collectible' },
    { id: 'coin_s2', name: 'Hat-Trick Coin #2', type: 'coin', position: [6, 1.2, -35], rotation: [0, 0, 0], scale: [1, 1, 1], color: '#ffd700', behavior: 'collectible' },
  ];

  return {
    title: 'ACADO Superdome Stadium',
    description: `World-class 3D sports arena complete with turf pitch, twin regulation goal frames, stadium floodlight towers, and ball physics.`,
    category: 'Sports',
    tags: ['Sports', 'Football', 'Soccer', 'Arena', 'Multiplayer'],
    worldData: {
      skyColor,
      timeOfDay: 'night',
      weather: 'clear',
      gravity: 9.8,
      spawnPoint: [0, 1.0, 5],
      objects,
      npcs: [
        {
          id: 'npc_referee',
          name: 'Referee Pierluigi',
          role: 'guide',
          position: [5, 0.5, 2],
          dialogue: [
            'Play fair, play hard! Whistle is ready for kickoff.',
            'Dribble through the center circle and blast the ball into the South goal!',
          ],
          questRewardCoins: 100,
        }
      ],
      quests: [
        {
          id: 'quest_score_goal',
          title: 'Striker Glory',
          description: 'Sprint across the pitch and trigger the goal line sensor to score the match-winning point.',
          rewardCoins: 120,
          rewardXp: 200,
        }
      ],
      scripts: [],
    },
  };
}

// ----------------------------------------------------
// SPACE & SCI-FI WORLD BUILDER
// ----------------------------------------------------
function buildSpaceWorld(prompt: string, style?: string): GeneratedWorldPayload {
  const skyColor = '#030014';
  const objects: GeneratedWorldPayload['worldData']['objects'] = [
    // Central Lunar Landing Base
    { id: 'space_station_hub', name: 'Cosmo Station Hub', type: 'cylinder', position: [0, 0.5, 0], rotation: [0, 0, 0], scale: [14, 1, 14], color: '#334155', material: 'metal', behavior: 'static' },
    
    // Floating Anti-Gravity Sci-Fi Platforms
    { id: 'grav_pad_1', name: 'Ion Propulsion Step #1', type: 'block', position: [0, 2.5, -12], rotation: [0, 0, 0], scale: [4, 0.6, 4], color: '#a855f7', material: 'neon', behavior: 'static' },
    { id: 'grav_pad_2', name: 'Ion Propulsion Step #2', type: 'block', position: [-6, 5.0, -22], rotation: [0, 0, 0], scale: [4, 0.6, 4], color: '#06b6d4', material: 'neon', behavior: 'static' },
    { id: 'grav_pad_3', name: 'Ion Propulsion Step #3', type: 'block', position: [6, 7.5, -34], rotation: [0, 0, 0], scale: [4, 0.6, 4], color: '#3b82f6', material: 'neon', behavior: 'static' },
    
    // Glowing Nebula Energy Spheres
    { id: 'plasma_orb_1', name: 'Dark Matter Core Alpha', type: 'sphere', position: [-12, 10, -18], rotation: [0, 0, 0], scale: [5, 5, 5], color: '#7c3aed', material: 'neon', behavior: 'spinning' },
    { id: 'plasma_orb_2', name: 'Solar Flare Core Beta', type: 'sphere', position: [14, 12, -30], rotation: [0, 0, 0], scale: [6, 6, 6], color: '#06b6d4', material: 'neon', behavior: 'spinning' },

    // Deep Space Satellite Terminal
    { id: 'space_terminal', name: 'Wormhole Teleport Outpost', type: 'block', position: [0, 10.0, -50], rotation: [0, 0, 0], scale: [12, 1.2, 12], color: '#0284c7', material: 'metal', behavior: 'static' },
    { id: 'space_finish', name: 'Hyper-Gate Jump Point', type: 'finish_line', position: [0, 12.0, -54], rotation: [0, 0, 0], scale: [8, 4, 1], color: '#00f5d4', material: 'neon', behavior: 'static' },

    // Coins
    { id: 'coin_sp1', name: 'Cosmic Shard #1', type: 'coin', position: [0, 3.5, -12], rotation: [0, 0, 0], scale: [1, 1, 1], color: '#ffd700', behavior: 'collectible' },
    { id: 'coin_sp2', name: 'Cosmic Shard #2', type: 'coin', position: [-6, 6.0, -22], rotation: [0, 0, 0], scale: [1, 1, 1], color: '#ffd700', behavior: 'collectible' },
    { id: 'coin_sp3', name: 'Cosmic Shard #3', type: 'coin', position: [6, 8.5, -34], rotation: [0, 0, 0], scale: [1, 1, 1], color: '#ffd700', behavior: 'collectible' },
  ];

  return {
    title: 'Astra-9: Orbital Deep Space Outpost',
    description: `Zero-gravity space station floating among cosmic plasma orbs, ion propulsion steps, and interstellar jump gates.`,
    category: 'Adventure',
    tags: ['Space', 'Sci-Fi', 'Cosmic', 'LowGravity', '3D'],
    worldData: {
      skyColor,
      timeOfDay: 'cyberpunk',
      weather: 'clear',
      gravity: 3.7, // Lower gravity for authentic space physics
      spawnPoint: [0, 1.5, 0],
      objects,
      npcs: [
        {
          id: 'npc_android_aria',
          name: 'Android ARIA-7',
          role: 'guide',
          position: [3, 1.0, 2],
          dialogue: [
            'System status: Nominal. Notice the reduced gravitational pull on this asteroid.',
            'Leap across the ion platforms to reach the Hyper-Gate portal.',
            'Collect dark matter energy cores to stabilize the station warp reactor!'
          ],
          questRewardCoins: 140,
        }
      ],
      quests: [
        {
          id: 'quest_hyper_jump',
          title: 'Warp Horizon Explorer',
          description: 'Navigate low gravity space platforms and activate the Hyper-Gate Jump Point.',
          rewardCoins: 160,
          rewardXp: 300,
        }
      ],
      scripts: [],
    },
  };
}

// ----------------------------------------------------
// FANTASY & MEDIEVAL KINGDOM BUILDER
// ----------------------------------------------------
function buildFantasyWorld(prompt: string, style?: string): GeneratedWorldPayload {
  const skyColor = '#1e1b4b';
  const objects: GeneratedWorldPayload['worldData']['objects'] = [
    // Ancient Cobblestone Island
    { id: 'courtyard', name: 'Citadel Courtyard', type: 'block', position: [0, 0.5, 0], rotation: [0, 0, 0], scale: [16, 1, 16], color: '#475569', material: 'brick', behavior: 'static' },
    
    // River Moat
    { id: 'moat_water', name: 'Enchanted Moat River', type: 'water', position: [0, 0.1, -16], rotation: [0, 0, 0], scale: [40, 0.3, 12], color: '#0284c7', material: 'glass', behavior: 'static' },
    
    // Stone Bridge Crossing
    { id: 'castle_bridge', name: 'Grand Royal Drawbridge', type: 'block', position: [0, 0.8, -16], rotation: [0, 0, 0], scale: [6, 0.6, 14], color: '#64748b', material: 'brick', behavior: 'static' },

    // Fortress Towers
    { id: 'tower_left', name: 'Bastion of the Sun', type: 'cylinder', position: [-10, 8, -26], rotation: [0, 0, 0], scale: [6, 16, 6], color: '#334155', material: 'brick', behavior: 'static' },
    { id: 'tower_right', name: 'Bastion of the Moon', type: 'cylinder', position: [10, 8, -26], rotation: [0, 0, 0], scale: [6, 16, 6], color: '#334155', material: 'brick', behavior: 'static' },

    // Keep Entrance
    { id: 'castle_keep', name: 'Throne Room Sanctuary', type: 'building', position: [0, 10, -40], rotation: [0, 0, 0], scale: [18, 20, 14], color: '#1e293b', material: 'brick', behavior: 'static' },
    { id: 'castle_finish', name: 'Royal Throne Portal', type: 'finish_line', position: [0, 2.5, -34], rotation: [0, 0, 0], scale: [8, 4, 1], color: '#eab308', material: 'neon', behavior: 'static' },

    // Pine Trees
    { id: 'tree_1', name: 'Enchanted Forest Pine #1', type: 'tree', position: [-14, 3, -6], rotation: [0, 0, 0], scale: [3, 6, 3], color: '#15803d', material: 'wood', behavior: 'static' },
    { id: 'tree_2', name: 'Enchanted Forest Pine #2', type: 'tree', position: [14, 3, -8], rotation: [0, 0, 0], scale: [3, 6, 3], color: '#15803d', material: 'wood', behavior: 'static' },

    // Coins
    { id: 'coin_f1', name: 'Royal Sovereign Coin #1', type: 'coin', position: [0, 1.8, -16], rotation: [0, 0, 0], scale: [1, 1, 1], color: '#ffd700', behavior: 'collectible' },
    { id: 'coin_f2', name: 'Royal Sovereign Coin #2', type: 'coin', position: [-6, 1.8, -28], rotation: [0, 0, 0], scale: [1, 1, 1], color: '#ffd700', behavior: 'collectible' },
    { id: 'coin_f3', name: 'Royal Sovereign Coin #3', type: 'coin', position: [6, 1.8, -28], rotation: [0, 0, 0], scale: [1, 1, 1], color: '#ffd700', behavior: 'collectible' },
  ];

  return {
    title: 'Kingdom of Eldoria: Castle Bastion',
    description: `Medieval fantasy fortress world with an ancient stone drawbridge over moat waters, stone guard keeps, and royal sovereign coins.`,
    category: 'RPG',
    tags: ['Fantasy', 'Castle', 'Medieval', 'Adventure', 'RPG'],
    worldData: {
      skyColor,
      timeOfDay: 'sunset',
      weather: 'clear',
      gravity: 9.8,
      spawnPoint: [0, 1.5, 4],
      objects,
      npcs: [
        {
          id: 'npc_sir_galahad',
          name: 'Sir Galahad the Brave',
          role: 'quest_giver',
          position: [3, 1.0, 2],
          dialogue: [
            'Halt, traveler! Only the worthy may pass beyond the drawbridge moat.',
            'Cross the enchanted waters and approach the Royal Throne Portal!',
            'Return with the 3 golden sovereign relics to be knighted of Eldoria.'
          ],
          questRewardCoins: 150,
        }
      ],
      quests: [
        {
          id: 'quest_knighthood',
          title: 'Path to Eldoria Knighthood',
          description: 'Cross the drawbridge, collect all 3 sovereign coins, and present yourself at the throne portal.',
          rewardCoins: 200,
          rewardXp: 400,
        }
      ],
      scripts: [],
    },
  };
}
