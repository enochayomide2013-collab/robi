/**
 * ACADO — Complete Gaming Universe Type Definitions
 */

export type NavigationTab = 
  | 'HOME'
  | 'DISCOVER'
  | 'PLAY'
  | 'CREATE'
  | 'AVATAR'
  | 'INVENTORY'
  | 'FRIENDS'
  | 'COMMUNITIES'
  | 'EVENTS'
  | 'MESSAGES'
  | 'NOTIFICATIONS'
  | 'SETTINGS'
  | 'HELP'
  | 'ADMIN'
  | 'CREATOR_DASHBOARD';

export interface UserProfile {
  id: string;
  username: string;
  displayName: string;
  email: string;
  bio: string;
  joinDate: string;
  coins: number;
  level: number;
  xp: number;
  avatar: AvatarConfiguration;
  friendsCount: number;
  followersCount: number;
  followingCount: number;
  favoriteGameIds: string[];
  badges: Badge[];
  achievements: Achievement[];
  inventory: ItemCosmetic[];
  creatorStatus: 'none' | 'creator' | 'verified_creator';
  isTwoFactorEnabled: boolean;
  privacy: {
    showInventory: boolean;
    showFriends: boolean;
    allowMessagesFrom: 'all' | 'friends' | 'none';
  };
}

export type HeadStyleType = 'block' | 'round' | 'cyber' | 'diamond' | 'flat' | string;
export type BodyShapeType = 'standard' | 'slim' | 'heavy' | 'tall' | 'chibi';

export interface AvatarConfiguration {
  skinColor: string;
  headStyle: HeadStyleType;
  bodyShape?: BodyShapeType;
  faceExpression: 'happy' | 'cool' | 'hero' | 'wink' | 'excited' | 'chill';
  hairStyle: 'short' | 'spiky' | 'long' | 'cap' | 'curly' | 'none';
  hairColor: string;
  torsoColor: string;
  legsColor: string;
  armsColor: string;
  clothingId?: string;
  hatId?: string;
  glassesId?: string;
  backAccessoryId?: string;
  shoesId?: string;
  equippedEmote?: string;
  equippedAnimation?: 'idle_bounce' | 'hero_pose' | 'wave' | 'spin';
}

export interface OutfitPreset {
  id: string;
  name: string;
  config: AvatarConfiguration;
}

export interface ItemCosmetic {
  id: string;
  name: string;
  category: 'clothing' | 'hat' | 'glasses' | 'back' | 'shoes' | 'emote' | 'animation' | 'game_pass';
  price: number;
  imageUrl: string;
  modelType3d?: string;
  color?: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  creatorName: string;
  description: string;
  purchased?: boolean;
}

export type GameCategory = 
  | 'Adventure' 
  | 'Racing' 
  | 'Sports' 
  | 'Football' 
  | 'Roleplay' 
  | 'Simulation' 
  | 'Strategy' 
  | 'Puzzle' 
  | 'Horror' 
  | 'Survival' 
  | 'Fighting' 
  | 'Shooting' 
  | 'Obby' 
  | 'Tycoon' 
  | 'Educational' 
  | 'Casual' 
  | 'Multiplayer' 
  | 'Social';

export interface AcadoGame {
  id: string;
  title: string;
  description: string;
  creatorId: string;
  creatorName: string;
  creatorAvatarUrl?: string;
  thumbnailUrl: string;
  category: GameCategory;
  playerCount: number;
  maxPlayers: number;
  rating: number; // 0 to 5
  likesCount: number;
  favoritesCount: number;
  visitsCount: number;
  featured?: boolean;
  trending?: boolean;
  newRelease?: boolean;
  tags: string[];
  worldData: WorldDefinition;
  versions: GameVersion[];
  currentVersion: string;
  activeServers: ServerInfo[];
  achievements: Achievement[];
}

export interface GameVersion {
  versionNumber: string;
  releaseDate: string;
  changelog: string;
  worldDataSnapshot: WorldDefinition;
}

export interface ServerInfo {
  id: string;
  name: string;
  region: string;
  currentPlayers: number;
  maxPlayers: number;
  ping: number;
  isPrivate?: boolean;
}

export interface World3DObject {
  id: string;
  name: string;
  type: 'block' | 'sphere' | 'cylinder' | 'building' | 'road' | 'tree' | 'car' | 'npc' | 'light' | 'coin' | 'checkpoint' | 'finish_line' | 'water' | 'ramp' | 'goal_post' | 'lava_hazard' | 'bounce_pad' | 'laser' | 'spinner';
  position: [number, number, number];
  rotation: [number, number, number];
  scale: [number, number, number];
  color: string;
  material?: 'smooth' | 'brick' | 'neon' | 'metal' | 'wood' | 'glass';
  interactable?: boolean;
  behavior?: 'static' | 'moving' | 'spinning' | 'vehicle' | 'npc_dialogue' | 'hazard' | 'collectible' | 'oscillating' | 'fading' | 'hazard_spinner' | 'bouncy';
  dialogueText?: string;
  speed?: number;
  stage?: number;
  axis?: 'x' | 'y' | 'z';
  distance?: number;
}

export interface WorldDefinition {
  skyColor: string;
  timeOfDay: 'day' | 'sunset' | 'night' | 'cyberpunk';
  weather: 'clear' | 'rain' | 'snow' | 'fog';
  gravity: number;
  spawnPoint: [number, number, number];
  objects: World3DObject[];
  scripts: StudioScript[];
  npcs: NpcDefinition[];
  quests: QuestDefinition[];
}

export interface StudioScript {
  id: string;
  name: string;
  targetObjectId?: string;
  code: string;
  enabled: boolean;
  lastEdited: string;
}

export interface NpcDefinition {
  id: string;
  name: string;
  role: 'shopkeeper' | 'quest_giver' | 'guide' | 'enemy' | 'citizen';
  position: [number, number, number];
  avatarConfig: AvatarConfiguration;
  dialogue: string[];
  questRewardCoins?: number;
}

export interface QuestDefinition {
  id: string;
  title: string;
  description: string;
  rewardCoins: number;
  rewardXp: number;
  requiredItemsCount?: number;
  isCompleted?: boolean;
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  earnedDate: string;
}

export interface Achievement {
  id: string;
  gameId?: string;
  gameTitle?: string;
  title: string;
  description: string;
  rewardCoins: number;
  unlocked: boolean;
  progress: number;
  maxProgress: number;
}

export interface Community {
  id: string;
  name: string;
  tagline: string;
  logoUrl: string;
  bannerUrl?: string;
  description: string;
  memberCount: number;
  ownerName: string;
  isJoined?: boolean;
  role?: 'Owner' | 'Admin' | 'Moderator' | 'Member';
  announcements: {
    id: string;
    author: string;
    date: string;
    content: string;
  }[];
  associatedGameIds: string[];
}

export interface LiveEvent {
  id: string;
  title: string;
  description: string;
  bannerUrl: string;
  startDate: string;
  endDate: string;
  status: 'upcoming' | 'live' | 'ended';
  featuredGameId: string;
  rewards: {
    itemName: string;
    coins: number;
    badgeName: string;
  };
  leaderboard: {
    rank: number;
    username: string;
    score: number;
  }[];
}

export interface ChatMessage {
  id: string;
  senderId: string;
  senderName: string;
  senderAvatarUrl?: string;
  text: string;
  timestamp: string;
  channel: 'game' | 'party' | 'dm' | 'community';
  isFiltered?: boolean;
}

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  timeAgo: string;
  read: boolean;
  type: 'friend_request' | 'game_invite' | 'event_start' | 'achievement_unlocked' | 'security_alert';
}

export interface ModerationReport {
  id: string;
  targetType: 'user' | 'chat' | 'game' | 'item';
  targetId: string;
  targetName: string;
  reportedBy: string;
  reason: string;
  timestamp: string;
  status: 'pending' | 'reviewed' | 'actioned' | 'dismissed';
}
