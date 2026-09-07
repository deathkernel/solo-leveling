export type WorkoutCategory = 'boxing' | 'strength' | 'cardio' | 'mobility' | 'conditioning' | 'recovery';
export type StatKey = 'strength' | 'agility' | 'endurance' | 'vitality' | 'discipline';
export type WorkoutUnit = 'reps' | 'minutes' | 'seconds' | 'meters' | 'kilometers' | 'sets';

export type WorkoutDefinition = {
  id: string; name: string; category: WorkoutCategory; unit: WorkoutUnit;
  primaryStat: StatKey; secondaryStats: StatKey[]; xpPerUnit: number; difficulty: 1 | 2 | 3 | 4 | 5;
};
export type DailyExercise = { workoutId: string; target: number };
export type BoxingDayPlan = { day: number; title: string; focus: string; exercises: DailyExercise[] };

export const WORKOUTS: WorkoutDefinition[] = [
  { id: 'shadowboxing', name: 'Shadow Boxing', category: 'boxing', unit: 'minutes', primaryStat: 'agility', secondaryStats: ['discipline','endurance'], xpPerUnit: 9, difficulty: 3 },
  { id: 'stance-footwork', name: 'Stance & Footwork', category: 'boxing', unit: 'minutes', primaryStat: 'agility', secondaryStats: ['discipline','endurance'], xpPerUnit: 8, difficulty: 3 },
  { id: 'jab-drill', name: 'Jab Drill', category: 'boxing', unit: 'reps', primaryStat: 'agility', secondaryStats: ['strength','discipline'], xpPerUnit: 0.8, difficulty: 2 },
  { id: 'cross-drill', name: 'Cross Drill', category: 'boxing', unit: 'reps', primaryStat: 'strength', secondaryStats: ['agility','discipline'], xpPerUnit: 0.8, difficulty: 2 },
  { id: 'combination-drill', name: 'Combination Drill', category: 'boxing', unit: 'minutes', primaryStat: 'agility', secondaryStats: ['strength','discipline'], xpPerUnit: 10, difficulty: 4 },
  { id: 'defense-drill', name: 'Slip / Roll / Block Drill', category: 'boxing', unit: 'minutes', primaryStat: 'agility', secondaryStats: ['discipline','vitality'], xpPerUnit: 9, difficulty: 3 },
  { id: 'heavy-bag', name: 'Heavy Bag', category: 'boxing', unit: 'minutes', primaryStat: 'strength', secondaryStats: ['endurance','discipline'], xpPerUnit: 12, difficulty: 4 },
  { id: 'speed-bag', name: 'Speed Bag', category: 'boxing', unit: 'minutes', primaryStat: 'agility', secondaryStats: ['endurance','discipline'], xpPerUnit: 9, difficulty: 3 },
  { id: 'double-end-bag', name: 'Double-End Bag', category: 'boxing', unit: 'minutes', primaryStat: 'agility', secondaryStats: ['endurance','discipline'], xpPerUnit: 10, difficulty: 4 },
  { id: 'mitt-work', name: 'Focus Mitts', category: 'boxing', unit: 'minutes', primaryStat: 'agility', secondaryStats: ['strength','discipline'], xpPerUnit: 11, difficulty: 4 },
  { id: 'rope', name: 'Jump Rope', category: 'cardio', unit: 'minutes', primaryStat: 'agility', secondaryStats: ['endurance','discipline'], xpPerUnit: 10, difficulty: 3 },
  { id: 'roadwork', name: 'Roadwork Run', category: 'cardio', unit: 'kilometers', primaryStat: 'endurance', secondaryStats: ['vitality','discipline'], xpPerUnit: 70, difficulty: 3 },
  { id: 'easy-roadwork', name: 'Easy Roadwork', category: 'cardio', unit: 'kilometers', primaryStat: 'endurance', secondaryStats: ['vitality','discipline'], xpPerUnit: 45, difficulty: 2 },
  { id: 'push-ups', name: 'Push-ups', category: 'strength', unit: 'reps', primaryStat: 'strength', secondaryStats: ['endurance','discipline'], xpPerUnit: 1.5, difficulty: 2 },
  { id: 'squats', name: 'Bodyweight Squats', category: 'strength', unit: 'reps', primaryStat: 'strength', secondaryStats: ['endurance','vitality'], xpPerUnit: 1.4, difficulty: 2 },
  { id: 'lunges', name: 'Lunges', category: 'strength', unit: 'reps', primaryStat: 'strength', secondaryStats: ['agility','vitality'], xpPerUnit: 1.6, difficulty: 3 },
  { id: 'pull-ups', name: 'Pull-ups', category: 'strength', unit: 'reps', primaryStat: 'strength', secondaryStats: ['endurance','discipline'], xpPerUnit: 3, difficulty: 4 },
  { id: 'dips', name: 'Dips', category: 'strength', unit: 'reps', primaryStat: 'strength', secondaryStats: ['endurance','discipline'], xpPerUnit: 2.2, difficulty: 3 },
  { id: 'calf-raises', name: 'Calf Raises', category: 'strength', unit: 'reps', primaryStat: 'strength', secondaryStats: ['endurance'], xpPerUnit: 1.1, difficulty: 1 },
  { id: 'sit-ups', name: 'Sit-ups', category: 'strength', unit: 'reps', primaryStat: 'strength', secondaryStats: ['endurance','discipline'], xpPerUnit: 1.4, difficulty: 2 },
  { id: 'plank', name: 'Plank', category: 'conditioning', unit: 'seconds', primaryStat: 'endurance', secondaryStats: ['discipline','vitality'], xpPerUnit: 1.8, difficulty: 3 },
  { id: 'burpees', name: 'Burpees', category: 'conditioning', unit: 'reps', primaryStat: 'endurance', secondaryStats: ['strength','agility'], xpPerUnit: 2.4, difficulty: 4 },
  { id: 'mountain-climbers', name: 'Mountain Climbers', category: 'conditioning', unit: 'reps', primaryStat: 'agility', secondaryStats: ['endurance','strength'], xpPerUnit: 1.9, difficulty: 3 },
  { id: 'medicine-ball', name: 'Medicine Ball Throws', category: 'strength', unit: 'reps', primaryStat: 'strength', secondaryStats: ['agility','endurance'], xpPerUnit: 2.2, difficulty: 4 },
  { id: 'sprints', name: 'Sprint Intervals', category: 'conditioning', unit: 'minutes', primaryStat: 'endurance', secondaryStats: ['agility','discipline'], xpPerUnit: 14, difficulty: 5 },
  { id: 'stretching', name: 'Stretching', category: 'mobility', unit: 'minutes', primaryStat: 'vitality', secondaryStats: ['agility','discipline'], xpPerUnit: 5, difficulty: 1 },
  { id: 'mobility-flow', name: 'Mobility Flow', category: 'mobility', unit: 'minutes', primaryStat: 'agility', secondaryStats: ['vitality','discipline'], xpPerUnit: 7, difficulty: 2 },
  { id: 'breathing', name: 'Breathing / Recovery', category: 'recovery', unit: 'minutes', primaryStat: 'vitality', secondaryStats: ['discipline'], xpPerUnit: 3, difficulty: 1 },
];

export const BOXING_WEEK: BoxingDayPlan[] = [
  { day: 0, title: 'FOUNDATION', focus: 'Footwork + technique', exercises: [{ workoutId: 'rope', target: 10 }, { workoutId: 'stance-footwork', target: 15 }, { workoutId: 'shadowboxing', target: 15 }, { workoutId: 'jab-drill', target: 60 }, { workoutId: 'cross-drill', target: 60 }, { workoutId: 'stretching', target: 10 }] },
  { day: 1, title: 'POWER', focus: 'Punching strength + core', exercises: [{ workoutId: 'rope', target: 8 }, { workoutId: 'heavy-bag', target: 20 }, { workoutId: 'push-ups', target: 40 }, { workoutId: 'squats', target: 50 }, { workoutId: 'plank', target: 90 }, { workoutId: 'mobility-flow', target: 10 }] },
  { day: 2, title: 'SPEED', focus: 'Hands + movement + reactions', exercises: [{ workoutId: 'rope', target: 12 }, { workoutId: 'speed-bag', target: 15 }, { workoutId: 'double-end-bag', target: 12 }, { workoutId: 'combination-drill', target: 15 }, { workoutId: 'mountain-climbers', target: 40 }, { workoutId: 'stretching', target: 10 }] },
  { day: 3, title: 'ENGINE', focus: 'Aerobic conditioning', exercises: [{ workoutId: 'roadwork', target: 5 }, { workoutId: 'sprints', target: 10 }, { workoutId: 'burpees', target: 25 }, { workoutId: 'sit-ups', target: 40 }, { workoutId: 'breathing', target: 10 }] },
  { day: 4, title: 'DEFENSE', focus: 'Defense + counter movement', exercises: [{ workoutId: 'rope', target: 10 }, { workoutId: 'defense-drill', target: 20 }, { workoutId: 'shadowboxing', target: 15 }, { workoutId: 'mitt-work', target: 15 }, { workoutId: 'lunges', target: 30 }, { workoutId: 'mobility-flow', target: 10 }] },
  { day: 5, title: 'FIGHTER', focus: 'Full boxing session', exercises: [{ workoutId: 'rope', target: 10 }, { workoutId: 'shadowboxing', target: 15 }, { workoutId: 'heavy-bag', target: 20 }, { workoutId: 'combination-drill', target: 15 }, { workoutId: 'pull-ups', target: 12 }, { workoutId: 'dips', target: 20 }, { workoutId: 'plank', target: 90 }, { workoutId: 'stretching', target: 10 }] },
  { day: 6, title: 'RECOVERY', focus: 'Active recovery + mobility', exercises: [{ workoutId: 'easy-roadwork', target: 3 }, { workoutId: 'mobility-flow', target: 20 }, { workoutId: 'stretching', target: 20 }, { workoutId: 'breathing', target: 10 }] },
];

export function workoutById(id: string) { return WORKOUTS.find((workout) => workout.id === id); }
export function todayBoxingPlan(date = new Date()): BoxingDayPlan { return BOXING_WEEK[date.getDay()]; }
