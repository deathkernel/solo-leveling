import { Achievement, Goal, Player, Skill, StatKey, Title } from './types';
import { totalStats } from './progression';

export const ACHIEVEMENTS: Achievement[] = [
  {id:'first-step',name:'FIRST STEP',description:'Complete your first protocol.',rewardXp:100,rewardCoins:25},
  {id:'seven-days',name:'SEVEN DAY WILL',description:'Reach a 7 day streak.',rewardXp:250,rewardCoins:75},
  {id:'thirty-days',name:'IRON WILL',description:'Reach a 30 day streak.',rewardXp:750,rewardCoins:200},
  {id:'hundred-workouts',name:'HUNDRED FIGHTS',description:'Complete 100 training blocks.',rewardXp:1500,rewardCoins:500},
  {id:'level-ten',name:'AWAKENED',description:'Reach level 10.',rewardXp:500,rewardCoins:150},
  {id:'level-fifty',name:'MONARCH',description:'Reach level 50.',rewardXp:5000,rewardCoins:2000},
  {id:'power-100',name:'PARAMETER SURGE',description:'Reach 100 total parameters.',rewardXp:500,rewardCoins:150},
];

export const TITLES: Title[] = [
  {id:'survivor',name:'THE SURVIVOR',description:'You refused to quit.',requirement:'7 day streak'},
  {id:'fighter',name:'THE FIGHTER',description:'Training is no longer optional.',requirement:'30 completed blocks'},
  {id:'discipline',name:'THE DISCIPLINED',description:'Consistency became your weapon.',requirement:'30 day streak'},
  {id:'awakened',name:'THE AWAKENED',description:'The System recognizes your growth.',requirement:'Level 10'},
  {id:'monarch',name:'THE MONARCH',description:'The endgame title.',requirement:'Level 50 + S Rank'},
];

export const SKILLS: Skill[] = [
  {id:'focus',name:'FOCUS',description:'+2% XP from quests.',cost:100,stat:'discipline',bonus:2},
  {id:'footwork',name:'SHADOW STEP',description:'+1 agility parameter on training.',cost:150,stat:'agility',bonus:1},
  {id:'iron-body',name:'IRON BODY',description:'+1 endurance parameter on training.',cost:150,stat:'endurance',bonus:1},
  {id:'power',name:'POWER SURGE',description:'+1 strength parameter on training.',cost:200,stat:'strength',bonus:1},
  {id:'combat-instinct',name:'COMBAT INSTINCT',description:'+1 discipline parameter on training.',cost:250,stat:'discipline',bonus:1},
  {id:'apex',name:'APEX',description:'+5 vitality parameter.',cost:500,stat:'vitality',bonus:5},
];

export function achievementProgress(player: Player): Achievement[] {
  const completed = (player.completedWorkoutIds ?? []).length;
  return ACHIEVEMENTS.filter(a => {
    if ((player.achievementIds ?? []).includes(a.id)) return false;
    if (a.id==='first-step') return completed >= 1;
    if (a.id==='seven-days') return player.streak >= 7;
    if (a.id==='thirty-days') return player.streak >= 30;
    if (a.id==='hundred-workouts') return completed >= 100;
    if (a.id==='level-ten') return player.level >= 10;
    if (a.id==='level-fifty') return player.level >= 50;
    return totalStats(player.stats) >= 100;
  });
}

export function availableTitles(player: Player): Title[] {
  return TITLES.filter(t => {
    if (t.id==='survivor') return player.streak>=7;
    if (t.id==='fighter') return (player.completedWorkoutIds ?? []).length>=30;
    if (t.id==='discipline') return player.streak>=30;
    if (t.id==='awakened') return player.level>=10;
    return player.level>=50 && player.rank==='S';
  });
}

export function skillAvailable(player: Player, skill: Skill): boolean { return (player.skillIds ?? []).includes(skill.id); }
export function buySkill(player: Player, skill: Skill): Player {
  if (skillAvailable(player,skill) || (player.coins ?? 0) < skill.cost) return player;
  return {...player, coins:(player.coins ?? 0)-skill.cost, skillIds:[...(player.skillIds ?? []),skill.id], stats:{...player.stats,[skill.stat]:player.stats[skill.stat]+skill.bonus}};
}

export function weekKey(date=new Date()): string { const d=new Date(date); const day=(d.getDay()+6)%7; d.setDate(d.getDate()-day); return d.toISOString().slice(0,10); }
export function monthKey(date=new Date()): string { return new Date(date).toISOString().slice(0,7); }
export function normalizeBoss(player: Player, now=new Date()): Player {
  const wk=weekKey(now), mo=monthKey(now), old=player.boss;
  if (old?.weekKey===wk && old.monthKey===mo) return player;
  return {...player,boss:{weekKey:wk,monthKey:mo,weeklyProgress:old?.weekKey===wk?old.weeklyProgress:0,monthlyProgress:old?.monthKey===mo?old.monthlyProgress:0,weeklyTarget:10,monthlyTarget:40,weeklyCleared:old?.weekKey===wk?old.weeklyCleared:false,monthlyCleared:old?.monthKey===mo?old.monthlyCleared:false}};
}

export function adaptiveTarget(base:number, completionRate:number, streak:number): number {
  const rate=Math.max(0,Math.min(1,completionRate));
  const factor=rate<0.5?0.85:rate>0.9?1.1:1;
  const streakBonus=streak>=30?1.05:streak>=14?1.02:1;
  return Math.max(1,Math.round(base*factor*streakBonus));
}

export function createGoal(title:string, description:string, target:number, xp:number, stat:StatKey): Goal {
  return {id:`goal-${Date.now()}-${Math.random().toString(36).slice(2,7)}`,title,description,target,xp,stat,progress:0,completed:false,createdAt:new Date().toISOString()};
}

export function exportSave(player: Player): string { return JSON.stringify({version:1,exportedAt:new Date().toISOString(),player},null,2); }
export function importSave(raw:string): Player | null { try { const parsed=JSON.parse(raw); if(parsed?.version!==1 || parsed?.player?.id!=='main') return null; return parsed.player as Player; } catch { return null; } }
