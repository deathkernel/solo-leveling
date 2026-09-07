export type WorkoutCategory = 'strength' | 'cardio' | 'mobility' | 'conditioning' | 'recovery';
export type StatKey = 'strength' | 'agility' | 'endurance' | 'vitality' | 'discipline';

export type WorkoutDefinition = {
  id: string;
  name: string;
  category: WorkoutCategory;
  unit: 'reps' | 'minutes' | 'seconds' | 'meters' | 'kilometers' | 'sets';
  primaryStat: StatKey;
  secondaryStats: StatKey[];
  xpPerUnit: number;
  difficulty: 1 | 2 | 3 | 4 | 5;
};

export const WORKOUTS: WorkoutDefinition[] = [
  { id: 'push-ups', name: 'Push-ups', category: 'strength', unit: 'reps', primaryStat: 'strength', secondaryStats: ['endurance','discipline'], xpPerUnit: 1.5, difficulty: 2 },
  { id: 'squats', name: 'Bodyweight Squats', category: 'strength', unit: 'reps', primaryStat: 'strength', secondaryStats: ['endurance','vitality'], xpPerUnit: 1.4, difficulty: 2 },
  { id: 'lunges', name: 'Lunges', category: 'strength', unit: 'reps', primaryStat: 'strength', secondaryStats: ['agility','vitality'], xpPerUnit: 1.6, difficulty: 3 },
  { id: 'calf-raises', name: 'Calf Raises', category: 'strength', unit: 'reps', primaryStat: 'strength', secondaryStats: ['endurance'], xpPerUnit: 1.1, difficulty: 1 },
  { id: 'glute-bridge', name: 'Glute Bridges', category: 'strength', unit: 'reps', primaryStat: 'strength', secondaryStats: ['vitality'], xpPerUnit: 1.3, difficulty: 2 },
  { id: 'sit-ups', name: 'Sit-ups', category: 'strength', unit: 'reps', primaryStat: 'strength', secondaryStats: ['endurance','discipline'], xpPerUnit: 1.4, difficulty: 2 },
  { id: 'crunches', name: 'Crunches', category: 'strength', unit: 'reps', primaryStat: 'strength', secondaryStats: ['endurance'], xpPerUnit: 1.2, difficulty: 1 },
  { id: 'plank', name: 'Plank', category: 'conditioning', unit: 'seconds', primaryStat: 'endurance', secondaryStats: ['discipline','vitality'], xpPerUnit: 1.8, difficulty: 3 },
  { id: 'side-plank', name: 'Side Plank', category: 'conditioning', unit: 'seconds', primaryStat: 'endurance', secondaryStats: ['agility','discipline'], xpPerUnit: 1.8, difficulty: 3 },
  { id: 'burpees', name: 'Burpees', category: 'conditioning', unit: 'reps', primaryStat: 'endurance', secondaryStats: ['strength','agility'], xpPerUnit: 2.4, difficulty: 4 },
  { id: 'mountain-climbers', name: 'Mountain Climbers', category: 'conditioning', unit: 'reps', primaryStat: 'agility', secondaryStats: ['endurance','strength'], xpPerUnit: 1.9, difficulty: 3 },
  { id: 'jumping-jacks', name: 'Jumping Jacks', category: 'conditioning', unit: 'reps', primaryStat: 'agility', secondaryStats: ['endurance'], xpPerUnit: 1.2, difficulty: 1 },
  { id: 'high-knees', name: 'High Knees', category: 'conditioning', unit: 'seconds', primaryStat: 'agility', secondaryStats: ['endurance'], xpPerUnit: 1.6, difficulty: 2 },
  { id: 'running', name: 'Running', category: 'cardio', unit: 'kilometers', primaryStat: 'endurance', secondaryStats: ['vitality','discipline'], xpPerUnit: 70, difficulty: 3 },
  { id: 'walking', name: 'Walking', category: 'cardio', unit: 'kilometers', primaryStat: 'vitality', secondaryStats: ['endurance','discipline'], xpPerUnit: 35, difficulty: 1 },
  { id: 'cycling', name: 'Cycling', category: 'cardio', unit: 'kilometers', primaryStat: 'endurance', secondaryStats: ['vitality','agility'], xpPerUnit: 35, difficulty: 2 },
  { id: 'jump-rope', name: 'Jump Rope', category: 'cardio', unit: 'minutes', primaryStat: 'agility', secondaryStats: ['endurance','discipline'], xpPerUnit: 10, difficulty: 3 },
  { id: 'swimming', name: 'Swimming', category: 'cardio', unit: 'minutes', primaryStat: 'endurance', secondaryStats: ['vitality','agility'], xpPerUnit: 12, difficulty: 3 },
  { id: 'stretching', name: 'Stretching', category: 'mobility', unit: 'minutes', primaryStat: 'vitality', secondaryStats: ['agility','discipline'], xpPerUnit: 5, difficulty: 1 },
  { id: 'yoga', name: 'Yoga', category: 'mobility', unit: 'minutes', primaryStat: 'vitality', secondaryStats: ['agility','discipline'], xpPerUnit: 7, difficulty: 2 },
  { id: 'mobility-flow', name: 'Mobility Flow', category: 'mobility', unit: 'minutes', primaryStat: 'agility', secondaryStats: ['vitality','discipline'], xpPerUnit: 7, difficulty: 2 },
  { id: 'breathing', name: 'Breathing / Recovery', category: 'recovery', unit: 'minutes', primaryStat: 'vitality', secondaryStats: ['discipline'], xpPerUnit: 3, difficulty: 1 }
];

export function workoutById(id: string) { return WORKOUTS.find((workout) => workout.id === id); }
