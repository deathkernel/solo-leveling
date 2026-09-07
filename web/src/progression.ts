import { Rank, Stats } from './types';

export const RANK_ORDER: Rank[] = ['E', 'D', 'C', 'B', 'A', 'S'];

// Rank and level remain separate. S-rank is designed as a long-term milestone:
// at one meaningful workout per day, the progression curve targets roughly five years.
export const RANK_REQUIREMENTS: Record<Exclude<Rank, 'E'>, { level: number; totalStats: number }> = {
  D: { level: 10, totalStats: 60 },
  C: { level: 20, totalStats: 90 },
  B: { level: 30, totalStats: 125 },
  A: { level: 40, totalStats: 170 },
  S: { level: 50, totalStats: 220 },
};

const XP_PER_DAY_TARGET = 1000;
const S_RANK_DAYS = 365 * 5;
export const S_RANK_TARGET_XP = XP_PER_DAY_TARGET * S_RANK_DAYS;

// Total XP required from one level to the next. The quadratic curve starts
// gently and becomes progressively harder so the final climb is substantial.
export function xpForNextLevel(level: number): number {
  const safeLevel = Math.max(1, Math.floor(level));
  return 120 + 45 * safeLevel * safeLevel;
}

export function levelFromXp(totalXp: number): number {
  let level = 1;
  let remaining = Math.max(0, Math.floor(totalXp));
  while (level < 50 && remaining >= xpForNextLevel(level)) {
    remaining -= xpForNextLevel(level);
    level += 1;
  }
  return level;
}

export function xpIntoLevel(totalXp: number, level: number): number {
  let spent = 0;
  for (let current = 1; current < Math.max(1, level); current += 1) spent += xpForNextLevel(current);
  return Math.max(0, Math.floor(totalXp) - spent);
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
