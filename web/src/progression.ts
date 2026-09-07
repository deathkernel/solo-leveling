import { Rank, Stats } from './types';

export const RANK_ORDER: Rank[] = ['E', 'D', 'C', 'B', 'A', 'S'];
export const RANK_REQUIREMENTS: Record<Exclude<Rank, 'E'>, { level: number; totalStats: number }> = {
  D: { level: 10, totalStats: 60 },
  C: { level: 20, totalStats: 90 },
  B: { level: 30, totalStats: 125 },
  A: { level: 40, totalStats: 170 },
  S: { level: 50, totalStats: 220 },
};

export function xpForNextLevel(level: number): number {
  return Math.floor(1000 * Math.pow(1.15, Math.max(level - 1, 0)));
}

export function levelFromXp(totalXp: number): number {
  let level = 1;
  let remaining = Math.max(0, totalXp);
  while (remaining >= xpForNextLevel(level)) {
    remaining -= xpForNextLevel(level);
    level += 1;
  }
  return level;
}

export function xpIntoLevel(totalXp: number, level: number): number {
  let spent = 0;
  for (let current = 1; current < level; current += 1) spent += xpForNextLevel(current);
  return Math.max(0, totalXp - spent);
}

export function totalStats(stats: Stats): number {
  return Object.values(stats).reduce((sum, value) => sum + value, 0);
}

export function rankRequirement(rank: Rank) {
  if (rank === 'E') return null;
  return RANK_REQUIREMENTS[rank];
}

export function canAdvanceRank(current: Rank, level: number, stats: Stats): boolean {
  const index = RANK_ORDER.indexOf(current);
  if (index < 0 || index >= RANK_ORDER.length - 1) return false;
  const next = RANK_ORDER[index + 1];
  const requirement = RANK_REQUIREMENTS[next as Exclude<Rank, 'E'>];
  return level >= requirement.level && totalStats(stats) >= requirement.totalStats;
}

export function nextRank(current: Rank): Rank | null {
  const index = RANK_ORDER.indexOf(current);
  return index >= 0 && index < RANK_ORDER.length - 1 ? RANK_ORDER[index + 1] : null;
}
