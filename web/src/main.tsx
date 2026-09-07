import { useEffect, useMemo, useState } from 'react';
import { createRoot } from 'react-dom/client';
import './styles.css';
import { addActivity, loadPlayer, loadQuests, loadRecentActivity, savePlayer, saveQuests } from './storage';
import { Activity, DEFAULT_PLAYER, Player, Quest } from './types';
import { canAdvanceRank, levelFromXp, nextRank, rankRequirement, totalStats, xpForNextLevel, xpIntoLevel } from './progression';
import { applyQuestProgress, generateDailyQuests } from './questEngine';

const statLabels = [['STR', 'strength'], ['AGI', 'agility'], ['END', 'endurance'], ['VIT', 'vitality'], ['DIS', 'discipline']] as const;
const todayKey = () => new Date().toISOString().slice(0, 10);

function App() {
  const [player, setPlayer] = useState<Player>(DEFAULT_PLAYER);
  const [quests, setQuests] = useState<Quest[]>([]);
  const [activity, setActivity] = useState<Activity[]>([]);
  const [ready, setReady] = useState(false);
  const [notice, setNotice] = useState('SYSTEM ONLINE');

  async function boot() {
    const saved = await loadPlayer();
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
    const updatedQuest = applyQuestProgress(quest, quest.target);
    const totalXp = player.totalXp + quest.xp;
    const updated: Player = {
      ...player, totalXp, level: levelFromXp(totalXp), streak: player.lastActiveDate === todayKey() ? player.streak : player.streak + 1,
      lastActiveDate: todayKey(), updatedAt: new Date().toISOString(), stats: { ...player.stats, [quest.stat]: player.stats[quest.stat] + 1 },
    };
    const nextQuests = quests.map((item) => item.id === id ? updatedQuest : item);
    setQuests(nextQuests); await saveQuests(nextQuests); await commitPlayer(updated, `QUEST CLEARED +${quest.xp} XP`, quest.xp, 'quest');
    if (canAdvanceRank(updated.rank, updated.level, updated.stats)) {
      const promoted = { ...updated, rank: nextRank(updated.rank)!, updatedAt: new Date().toISOString() };
      await commitPlayer(promoted, `RANK UP // ${updated.rank} → ${promoted.rank}`, 0, 'rank-up');
    }
  }

  async function quickTraining() {
    const totalXp = player.totalXp + 100;
    const updated: Player = { ...player, totalXp, level: levelFromXp(totalXp), lastActiveDate: todayKey(), streak: player.lastActiveDate === todayKey() ? player.streak : player.streak + 1, updatedAt: new Date().toISOString() };
    await commitPlayer(updated, 'TRAINING LOGGED +100 XP', 100);
  }

  if (!ready) return <main className="boot-screen"><div>SYSTEM INITIALIZING</div><span>LOADING PLAYER DATA...</span></main>;

  return <main className="system-shell">
    <div className="scanline" />
    <header className="topbar"><span className="system-label">SYSTEM // PERSONAL PROTOCOL</span><span className="online"><i /> {notice}</span></header>

    <section className="hero panel">
      <div><p className="eyebrow">PLAYER STATUS</p><h1>{player.name}</h1><div className="rank-row"><span className="rank">{player.rank}-RANK</span><span>LEVEL {String(player.level).padStart(2, '0')}</span><span>STREAK {player.streak}</span></div></div>
      <div className="xp-box"><div className="xp-head"><span>EXPERIENCE</span><b>{currentXp.toLocaleString()} / {nextXp.toLocaleString()}</b></div><div className="bar"><span style={{ width: `${xpPercent}%` }} /></div><small>{player.totalXp.toLocaleString()} TOTAL XP</small></div>
    </section>

    <section className="grid-two">
      <section className="panel stats"><div className="section-title">ABILITY // CURRENT PARAMETERS</div><div className="stat-grid">{statLabels.map(([label, key]) => <div className="stat" key={key}><span>{label}</span><strong>{player.stats[key]}</strong></div>)}</div><div className="power-line"><span>COMBAT POWER</span><b>{totalStats(player.stats)}</b></div></section>
      <section className="panel rank-panel"><div className="section-title">CURRENT RANK</div><div className="current-rank-display"><span className="rank-symbol">{player.rank}</span><div><b>{player.rank}-RANK</b><small>STATUS: ACTIVE</small></div></div></section>
    </section>

    <section className="panel quest"><div className="section-title">DAILY QUEST // AUTO-GENERATED</div>{quests.map((quest) => <div className="quest-row" key={quest.id}><div><b>{quest.title}</b><small>{quest.description} · {quest.progress}/{quest.target}</small></div><button className={quest.completed ? 'complete' : 'quest-button'} disabled={quest.completed} onClick={() => completeQuest(quest.id)}>{quest.completed ? 'CLEARED' : `+${quest.xp} XP`}</button></div>)}<button className="system-button" onClick={quickTraining}>LOG TRAINING SESSION <span>+100 XP ›</span></button></section>

    <section className="panel activity"><div className="section-title">SYSTEM LOG // RECENT EVENTS</div>{activity.length ? activity.map((event) => <div className="log" key={event.id}><span>{new Date(event.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span><b>{event.label}</b><em>{event.kind.toUpperCase()}</em></div>) : <div className="empty">NO RECENT SYSTEM EVENTS</div>}</section>
  </main>;
}

createRoot(document.getElementById('root')!).render(<App />);
