import { Player } from '../types';
import { applyWorkoutToPlayer } from './statEngine';
import { WorkoutDefinition } from './workouts';

export type WorkoutResult = {
  player: Player;
  xpGained: number;
  statGain: ReturnType<typeof import('./statEngine').calculateStatGain>;
};

export function completeWorkout(player: Player, workout: WorkoutDefinition, amount: number): WorkoutResult {
  const safeAmount = Math.max(0, amount);
  const xpGained = Math.round(workout.xpPerUnit * safeAmount);
  const nextPlayer = applyWorkoutToPlayer({ ...player, totalXp: player.totalXp + xpGained }, workout, safeAmount);
  return {
    player: nextPlayer,
    xpGained,
    statGain: requireStatGain(workout, safeAmount)
  };
}

function requireStatGain(workout: WorkoutDefinition, amount: number) {
  const { calculateStatGain } = require('./statEngine') as typeof import('./statEngine');
  return calculateStatGain(workout, amount);
}
