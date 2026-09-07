import { useEffect, useMemo, useState } from 'react';
import { createRoot } from 'react-dom/client';
import './styles.css';
import { addActivity, loadPlayer, loadQuests, loadRecentActivity, savePlayer, saveQuests } from './storage';
import { Activity, DEFAULT_PLAYER, Player, Quest } from './types';
import { canAdvanceRank, levelFromXp, nextRank, totalStats, xpForNextLevel, xpIntoLevel } from './progression';
import { applyQuestProgress, generateDailyQuests } from './questEngine';
import { applyStatDelta, calculateStatGain } from './domain/statEngine';
import { todayBoxingPlan, workoutById, BoxingDayPlan } from './domain/workouts';

const DAILY_XP_CAP = 1000;
const todayKey = () => new Date().toISOString().slice(0, 10);
const statNames: Record<string, string> = { strength: 'STR', agility: 'AGI', endurance: 'END', vitality: 'VIT', discipline: 'DIS' };

function dailyXp(player: Player, today: string): number { return player.dailyXpDate === today ? (player.dailyXpEarned ?? 0) : 0; }
function normalizeDailyState(player: Player, today: string): Player {
  if (player.dailyXpDate === today) return player;
  return { ...player, dailyXpDate: today, dailyXpEarned: 0, hp: player.maxHp ?? 100, maxHp: player.maxHp ?? 100 };
}
function dayLabel(plan: BoxingDayPlan): string { return ['SUN','MON','TUE','WED','THU','FRI','SAT'][plan.day]; }

function App() {
  const [player, setPlayer] = useState<Player>(DEFAULT_PLAYER);
  const [quests, setQuests] = useState<Quest[]>([]);
  const [activity, setActivity] = useState<Activity[]>([]);
  const [ready, setReady] = useState(false);
  const [notice, setNotice] = useState('SYSTEM ONLINE');
  const [showStats, setShowStats] = useState(false);

  const today = todayKey();
  const plan = useMemo(() => todayBoxingPlan(new Date()), []);
  const workoutDone = player.lastWorkoutDate === today;
  const earnedToday = dailyXp(player, today);
  const hp = player.hp ?? 100;
  const maxHp = player.maxHp ?? 100;

  async function boot() {
    let saved = await loadPlayer();
    const normalized = normalizeDailyState(saved, today);
    if (normalized !== saved) { saved = normalized; await savePlayer(saved); }
    let daily = await loadQuests(today);
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
    const totalXp = player.totalXp + reward;
    const updated: Player = { ...player, totalXp, level: levelFromXp(totalXp), dailyXpDate: today, dailyXpEarned: earnedToday + reward, streak: player.lastActiveDate === today ? player.streak : player.streak + 1, lastActiveDate: today, updatedAt: new Date().toISOString(), stats: { ...player.stats, [quest.stat]: player.stats[quest.stat] + 1 } };
    const nextQuests = quests.map((item) => item.id === id ? applyQuestProgress(quest, quest.target) : item);
    setQuests(nextQuests); await saveQuests(nextQuests); await commitPlayer(updated, `QUEST CLEARED +${reward} XP`, reward, 'quest');
    if (canAdvanceRank(updated.rank, updated.level, updated.stats)) {
      const promoted = { ...updated, rank: nextRank(updated.rank)!, updatedAt: new Date().toISOString() };
      await commitPlayer(promoted, `RANK UP // ${updated.rank} → ${promoted.rank}`, 0, 'rank-up');
    }
  }

  async function completeDailyBoxing() {
    if (workoutDone) { setNotice('TODAY\'S TRAINING ALREADY CLEARED'); return; }
    if (hp <= 0) { setNotice('HP DEPLETED // RECOVERY REQUIRED'); return; }
    const remainingXp = Math.max(0, DAILY_XP_CAP - earnedToday);
    if (remainingXp <= 0) { setNotice('DAILY XP LIMIT REACHED'); return; }

    let stats = player.stats;
    let rawXp = 0;
    for (const exercise of plan.exercises) {
      const workout = workoutById(exercise.workoutId);
      if (!workout) continue;
      rawXp += Math.round(workout.xpPerUnit * exercise.target);
      stats = applyStatDelta(stats, calculateStatGain(workout, exercise.target));
    }
    const awardedXp = Math.min(rawXp, remainingXp);
    const hpCost = Math.min(70, Math.max(15, Math.round(plan.exercises.length * 5 + plan.day * 1)));
    const totalXp = player.totalXp + awardedXp;
    const updated: Player = { ...player, stats, totalXp, level: levelFromXp(totalXp), lastWorkoutDate: today, lastActiveDate: today, streak: player.lastActiveDate === today ? player.streak : player.streak + 1, hp: Math.max(0, hp - hpCost), maxHp, dailyXpDate: today, dailyXpEarned: earnedToday + awardedXp, updatedAt: new Date().toISOString() };
    await commitPlayer(updated, `DAILY TRAINING COMPLETE +${awardedXp} XP`, awardedXp);
    window.setTimeout(() => setNotice(`${plan.title} COMPLETE // PARAMETERS INCREASED`), 500);
  }

  if (!ready) return <main className="boot-screen"><div>SYSTEM INITIALIZING</div><span>LOADING PLAYER DATA...</span></main>;

  return <main className="system-shell">
    <div className="scanline" />
    <header className="topbar"><span className="system-label">[ SYSTEM ]</span><span className="online"><i /> {notice}</span></header>

    <section className="hud">
      <p className="eyebrow">PLAYER</p><h1>{player.name}</h1>
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
      <div className="window-title">[ {dayLabel(plan)} // TODAY'S BOXING PROTOCOL ]</div>
      <div className="workout-name">{plan.title}</div>
      <div className="workout-meta">{plan.focus.toUpperCase()} · {plan.exercises.length} BLOCKS</div>
      <div className="exercise-list">{plan.exercises.map((exercise) => { const item = workoutById(exercise.workoutId); return item ? <div className="exercise-row" key={exercise.workoutId}><span>{item.name}</span><b>{exercise.target} {item.unit}</b></div> : null; })}</div>
      {!workoutDone ? <button className="complete-session" disabled={earnedToday >= DAILY_XP_CAP || hp <= 0} onClick={completeDailyBoxing}>COMPLETE DAILY TRAINING</button> : <div className="workout-cleared">✓ DAILY TRAINING CLEARED // RETURN TOMORROW</div>}
    </section>

    <div className="hud-actions"><button onClick={() => setShowStats((value) => !value)}>{showStats ? 'HIDE PARAMETERS' : 'VIEW PARAMETERS'}</button></div>
    {showStats && <section className="system-window parameters"><div className="window-title">[ PARAMETERS ]</div><div className="parameter-grid">{Object.entries(player.stats).map(([key, value]) => <div key={key}><span>{statNames[key]}</span><b>{value}</b></div>)}</div><div className="power-line"><span>TOTAL PARAMETERS</span><b>{totalStats(player.stats)}</b></div></section>}
    <section className="system-window log-window"><div className="window-title">[ SYSTEM LOG ]</div>{activity.slice(0, 4).map((event) => <div className="log" key={event.id}><span>{new Date(event.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span><b>{event.label}</b></div>)}</section>
  </main>;
}

createRoot(document.getElementById('root')!).render(<App />);
