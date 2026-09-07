import { Player } from '../types';
import { applyWorkoutToPlayer, calculateStatGain } from './statEngine';
import { WorkoutDefinition } from './workouts';

export type WorkoutResult = {
  player: Player;
  xpGained: number;
  statGain: ReturnType<typeof calculateStatGain>;
};

export function completeWorkout(player: Player, workout: WorkoutDefinition, amount: number): WorkoutResult {
  const safeAmount = Math.max(0, amount);
  const xpGained = Math.round(workout.xpPerUnit * safeAmount);
  const nextPlayer = applyWorkoutToPlayer({ ...player, totalXp: player.totalXp + xpGained }, workout, safeAmount);
  return { player: nextPlayer, xpGained, statGain: calculateStatGain(workout, safeAmount) };
}
