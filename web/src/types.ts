export type Rank = 'E' | 'D' | 'C' | 'B' | 'A' | 'S';
export type QuestType = 'Daily' | 'Weekly' | 'Challenge' | 'Rank-Up' | 'Custom';
export type StatKey = 'strength' | 'agility' | 'endurance' | 'vitality' | 'discipline';
export type Stats = Record<StatKey, number>;

export type Quest = {
  id: string; dateKey: string; title: string; description: string; type: QuestType;
  xp: number; stat: StatKey; target: number; progress: number; completed: boolean;
};

export type Activity = {
  id: string; timestamp: string; kind: 'quest' | 'training' | 'rank-up' | 'achievement' | 'boss' | 'system'; label: string; xp: number;
};

export type Achievement = { id: string; name: string; description: string; rewardXp: number; rewardCoins: number };
export type Title = { id: string; name: string; description: string; requirement: string };
export type Skill = { id: string; name: string; description: string; cost: number; stat: StatKey; bonus: number };
export type BossState = { weekKey: string; monthKey: string; weeklyProgress: number; monthlyProgress: number; weeklyTarget: number; monthlyTarget: number; weeklyCleared: boolean; monthlyCleared: boolean };
export type Goal = { id: string; title: string; description: string; xp: number; stat: StatKey; target: number; progress: number; completed: boolean; createdAt: string };

export type Player = {
  id: 'main'; name: string; rank: Rank; level: number; totalXp: number; stats: Stats;
  streak: number; lastActiveDate: string | null; lastWorkoutDate?: string | null;
  completedWorkoutDate?: string | null; completedWorkoutIds?: string[]; hp?: number; maxHp?: number;
  dailyXpDate?: string | null; dailyXpEarned?: number; createdAt: string; updatedAt: string;
  achievementIds?: string[]; unlockedTitleIds?: string[]; equippedTitleId?: string | null;
  skillIds?: string[]; coins?: number; boss?: BossState; goals?: Goal[]; notificationEnabled?: boolean;
};

const now = new Date().toISOString();
export const DEFAULT_PLAYER: Player = {
  id:'main', name:'PLAYER', rank:'E', level:1, totalXp:0,
  stats:{strength:10, agility:10, endurance:10, vitality:10, discipline:10}, streak:0,
  lastActiveDate:null, lastWorkoutDate:null, completedWorkoutDate:null, completedWorkoutIds:[],
  hp:100, maxHp:100, dailyXpDate:null, dailyXpEarned:0, createdAt:now, updatedAt:now,
  achievementIds:[], unlockedTitleIds:[], equippedTitleId:null, skillIds:[], coins:0, goals:[], notificationEnabled:true,
};
