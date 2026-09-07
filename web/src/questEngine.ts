import { Quest, QuestType, Stats } from './types';

const DAY = 86_400_000;

const templates: Array<Omit<Quest, 'id' | 'dateKey' | 'completed'>> = [
  { title: 'SYSTEM AWAKENING', description: 'Complete one meaningful training session.', type: 'Daily', xp: 100, stat: 'discipline', target: 1, progress: 0 },
  { title: 'STRENGTH PROTOCOL', description: 'Perform a controlled strength exercise.', type: 'Daily', xp: 120, stat: 'strength', target: 20, progress: 0 },
  { title: 'AGILITY PROTOCOL', description: 'Complete a short mobility or cardio block.', type: 'Daily', xp: 110, stat: 'agility', target: 10, progress: 0 },
  { title: 'ENDURANCE PROTOCOL', description: 'Accumulate active minutes today.', type: 'Daily', xp: 130, stat: 'endurance', target: 20, progress: 0 },
];

function dateKey(date = new Date()): string {
  return date.toISOString().slice(0, 10);
}

function seededIndex(key: string, length: number): number {
  let hash = 0;
  for (const char of key) hash = (hash * 31 + char.charCodeAt(0)) >>> 0;
  return hash % length;
}

export function generateDailyQuests(date = new Date()): Quest[] {
  const key = dateKey(date);
  const first = templates[seededIndex(key, templates.length)];
  const second = templates[seededIndex(`${key}:2`, templates.length)];
  const chosen = first.title === second.title ? [first, templates[(seededIndex(`${key}:3`, templates.length) + 1) % templates.length]] : [first, second];
  return chosen.map((template, index) => ({ ...template, id: `daily-${key}-${index}`, dateKey: key, completed: false }));
}

export function applyQuestProgress(quest: Quest, amount: number): Quest {
  const progress = Math.min(quest.target, Math.max(0, quest.progress + amount));
  return { ...quest, progress, completed: progress >= quest.target };
}

export function questBonusStats(quest: Quest): Partial<Stats> {
  if (!quest.completed) return {};
  return { [quest.stat]: 1 };
}

export const QUEST_TYPES: QuestType[] = ['Daily', 'Weekly', 'Challenge', 'Rank-Up'];
