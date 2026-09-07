import { useEffect, useMemo, useState } from 'react';
import { createRoot } from 'react-dom/client';
import './styles.css';
import { addActivity, loadPlayer, loadQuests, loadRecentActivity, savePlayer, saveQuests } from './storage';
import { Activity, DEFAULT_PLAYER, Player, Quest } from './types';
import { canAdvanceRank, levelFromXp, nextRank, totalStats, xpForNextLevel, xpIntoLevel } from './progression';
import { applyQuestProgress, generateDailyQuests } from './questEngine';
import { completeWorkout } from './domain/workoutService';
import { WORKOUTS, WorkoutDefinition } from './domain/workouts';

const DAILY_XP_CAP = 1000;
const todayKey = () => new Date().toISOString().slice(0, 10);

function dailyWorkout(dateKey: string): WorkoutDefinition {
  const index = [...dateKey].reduce((sum, char) => sum + char.charCodeAt(0), 0) % WORKOUTS.length;
  return WORKOUTS[index];
}

const statNames: Record<string, string> = { strength: 'STR', agility: 'AGI', endurance: 'END', vitality: 'VIT', discipline: 'DIS' };

function dailyXp(player: Player, today: string): number {
  return player.dailyXpDate === today ? (player.dailyXpEarned ?? 0) : 0;
}

function normalizeDailyState(player: Player, today: string): Player {
  if (player.dailyXpDate === today) return player;
  return { ...player, dailyXpDate: today, dailyXpEarned: 0, hp: player.maxHp ?? 100, maxHp: player.maxHp ?? 100 };
}

function App() {
  const [player, setPlayer] = useState<Player>(DEFAULT_PLAYER);
  const [quests, setQuests] = useState<Quest[]>([]);
  const [activity, setActivity] = useState<Activity[]>([]);
  const [ready, setReady] = useState(false);
  const [notice, setNotice] = useState('SYSTEM ONLINE');
  const [showStats, setShowStats] = useState(false);
  const [amount, setAmount] = useState('');

  const today = todayKey();
  const workout = useMemo(() => dailyWorkout(today), [today]);
  const workoutDone = player.lastWorkoutDate === today;
  const earnedToday = dailyXp(player, today);
  const hp = player.hp ?? 100;
  const maxHp = player.maxHp ?? 100;

  async function boot() {
    let saved = await loadPlayer();
    const normalized = normalizeDailyState(saved, today);
    if (normalized !== saved) { saved = normalized; await savePlayer(saved); }
    const key = todayKey();
    let daily = await loadQuests(key);
    if (!daily.length) { daily = generateDailyQuests(); await saveQuests(daily); }
    setPlayer(saved); setQuests(daily); setActivity(await loadRecentActivity()); setReady(true);
  }

  useEffect(() => { boot().catch(() => setReady(true)); }, []);

  const currentXp = useMemo(() => xpIntoLevel(player.totalXp, player.level), [player.totalXp, player.level]);
  const nextXp = xpForNextLevel(player.level);
  const xpPercent = Math.min(100, (currentXp / nextXp) * 100);

  async function commitPlayer(updated: Player, message: string, xp = 0, kind: Activity['kind'] = 'training') {
    setPlayer(updated); await savePlayer(updated);
    const event: Activity = { id: `${Date.now()}-${Math.random()}`, timestamp: new Date().toISOString(), kind, label: message, xp };
    await addActivity(event); setActivity((items) => [event, ...items].slice(0, 8)); setNotice(message);
    window.setTimeout(() => setNotice('SYSTEM ONLINE'), 2200);
  }

  async function completeQuest(id: string) {
    const quest = quests.find((item) => item.id === id); if (!quest || quest.completed) return;
    const remainingXp = Math.max(0, DAILY_XP_CAP - earnedToday);
    if (remainingXp <= 0) { setNotice('DAILY XP LIMIT REACHED'); return; }
    const reward = Math.min(quest.xp, remainingXp);
    const updatedQuest = applyQuestProgress(quest, quest.target);
    const totalXp = player.totalXp + reward;
    const updated: Player = {
      ...player, totalXp, level: levelFromXp(totalXp), dailyXpDate: today, dailyXpEarned: earnedToday + reward,
      streak: player.lastActiveDate === today ? player.streak : player.streak + 1,
      lastActiveDate: today, updatedAt: new Date().toISOString(), stats: { ...player.stats, [quest.stat]: player.stats[quest.stat] + 1 },
    };
    const nextQuests = quests.map((item) => item.id === id ? updatedQuest : item);
    setQuests(nextQuests); await saveQuests(nextQuests); await commitPlayer(updated, `QUEST CLEARED +${reward} XP`, reward, 'quest');
    if (canAdvanceRank(updated.rank, updated.level, updated.stats)) {
      const promoted = { ...updated, rank: nextRank(updated.rank)!, updatedAt: new Date().toISOString() };
      await commitPlayer(promoted, `RANK UP // ${updated.rank} → ${promoted.rank}`, 0, 'rank-up');
    }
  }

  async function logWorkout() {
    if (workoutDone) { setNotice('WORKOUT ALREADY CLEARED TODAY'); return; }
    const value = Number(amount);
    if (!Number.isFinite(value) || value <= 0) { setNotice('ENTER A VALID WORKOUT AMOUNT'); return; }
    const remainingXp = Math.max(0, DAILY_XP_CAP - earnedToday);
    if (remainingXp <= 0) { setNotice('DAILY XP LIMIT REACHED'); return; }
    const result = completeWorkout(player, workout, value);
    const awardedXp = Math.min(result.xpGained, remainingXp);
    const hpCost = Math.min(Math.max(8, workout.difficulty * 10), Math.max(0, hp));
    const updated: Player = {
      ...result.player,
      totalXp: player.totalXp + awardedXp,
      level: levelFromXp(player.totalXp + awardedXp),
      lastWorkoutDate: today,
      lastActiveDate: today,
      streak: player.lastActiveDate === today ? player.streak : player.streak + 1,
      hp: Math.max(0, hp - hpCost), maxHp,
      dailyXpDate: today, dailyXpEarned: earnedToday + awardedXp,
      updatedAt: new Date().toISOString(),
    };
    await commitPlayer(updated, `WORKOUT COMPLETE +${awardedXp} XP`, awardedXp);
    setAmount('');
    const gains = Object.entries(result.statGain).map(([key, value]) => `${statNames[key]} +${value}`).join('  ');
    window.setTimeout(() => setNotice(gains || 'TRAINING COMPLETE'), 400);
  }

  if (!ready) return <main className="boot-screen"><div>SYSTEM INITIALIZING</div><span>LOADING PLAYER DATA...</span></main>;

  return <main className="system-shell">
    <div className="scanline" />
    <header className="topbar"><span className="system-label">[ SYSTEM ]</span><span className="online"><i /> {notice}</span></header>

    <section className="hud">
      <p className="eyebrow">PLAYER</p>
      <h1>{player.name}</h1>
      <div className="level-line"><span>LEVEL {String(player.level).padStart(2, '0')}</span><b>{player.rank}-RANK</b></div>

      <div className="xp-box"><div className="xp-head"><span>XP</span><b>{currentXp.toLocaleString()} / {nextXp.toLocaleString()}</b></div><div className="bar"><span style={{ width: `${xpPercent}%` }} /></div></div>
      <div className="hp-line"><span>HP</span><b>{hp} / {maxHp}</b></div>
      <div className="streak-line"><span>STREAK</span><b>{player.streak} DAYS</b></div>
    </section>

    <section className="system-window">
      <div className="window-title">[ DAILY QUEST ]</div>
      {quests.slice(0, 1).map((quest) => <div className="quest-row" key={quest.id}><div><b>{quest.title}</b><small>{quest.description}</small></div><button className={quest.completed ? 'complete' : 'quest-button'} disabled={quest.completed || earnedToday >= DAILY_XP_CAP} onClick={() => completeQuest(quest.id)}>{quest.completed ? 'CLEARED' : `+${Math.min(quest.xp, DAILY_XP_CAP - earnedToday)} XP`}</button></div>)}
    </section>

    <section className="system-window workout-window">
      <div className="window-title">[ TODAY'S WORKOUT ]</div>
      <div className="workout-name">{workout.name}</div>
      <div className="workout-meta">{workout.category.toUpperCase()} · {workout.primaryStat.toUpperCase()} · DIFFICULTY {workout.difficulty}/5</div>
      {!workoutDone ? <div className="workout-action"><input type="number" min="1" step="1" value={amount} onChange={(event) => setAmount(event.target.value)} placeholder={`AMOUNT (${workout.unit.toUpperCase()})`} /><button disabled={earnedToday >= DAILY_XP_CAP} onClick={logWorkout}>COMPLETE</button></div> : <div className="workout-cleared">✓ WORKOUT CLEARED FOR TODAY</div>}
    </section>

    <div className="hud-actions"><button onClick={() => setShowStats((value) => !value)}>{showStats ? 'HIDE PARAMETERS' : 'VIEW PARAMETERS'}</button></div>

    {showStats && <section className="system-window parameters">
      <div className="window-title">[ PARAMETERS ]</div>
      <div className="parameter-grid">{Object.entries(player.stats).map(([key, value]) => <div key={key}><span>{statNames[key]}</span><b>{value}</b></div>)}</div>
      <div className="power-line"><span>TOTAL PARAMETERS</span><b>{totalStats(player.stats)}</b></div>
    </section>}

    <section className="system-window log-window">
      <div className="window-title">[ SYSTEM LOG ]</div>
      {activity.slice(0, 4).map((event) => <div className="log" key={event.id}><span>{new Date(event.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span><b>{event.label}</b></div>)}
    </section>
  </main>;
}

createRoot(document.getElementById('root')!).render(<App />);
