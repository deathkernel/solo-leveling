import { Player, Stats } from '../types';
import { StatKey, WorkoutDefinition } from './workouts';

const STAT_CAP = 999;
const BASE_GAIN = 0.06;

export type StatDelta = Partial<Record<StatKey, number>>;

export function calculateStatGain(workout: WorkoutDefinition, amount: number): StatDelta {
  const safeAmount = Math.max(0, amount);
  const primary = Math.sqrt(safeAmount) * BASE_GAIN * workout.difficulty;
  const delta: StatDelta = { [workout.primaryStat]: Number(primary.toFixed(2)) };
  for (const stat of workout.secondaryStats) delta[stat] = Number((primary * 0.35).toFixed(2));
  return delta;
}

export function applyStatDelta(stats: Stats, delta: StatDelta): Stats {
  const next = { ...stats };
  for (const [key, value] of Object.entries(delta) as [StatKey, number][]) {
    next[key] = Math.min(STAT_CAP, Number((next[key] + (value || 0)).toFixed(2)));
  }
  return next;
}

export function applyWorkoutToPlayer(player: Player, workout: WorkoutDefinition, amount: number): Player {
  return { ...player, stats: applyStatDelta(player.stats, calculateStatGain(workout, amount)) };
}
