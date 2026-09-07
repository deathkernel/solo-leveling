export type Rank = 'E' | 'D' | 'C' | 'B' | 'A' | 'S';

export type Stats = {
  strength: number;
  agility: number;
  endurance: number;
  vitality: number;
  discipline: number;
};

export type Player = {
  name: string;
  rank: Rank;
  level: number;
  totalXp: number;
  stats: Stats;
  streak: number;
};

export const DEFAULT_PLAYER: Player = {
  name: 'PLAYER',
  rank: 'E',
  level: 1,
  totalXp: 0,
  stats: { strength: 10, agility: 10, endurance: 10, vitality: 10, discipline: 10 },
  streak: 0
};
