import { useEffect, useMemo, useState } from 'react';
import { createRoot } from 'react-dom/client';
import './styles.css';
import { addActivity, loadPlayer, loadQuests, loadRecentActivity, savePlayer, saveQuests } from './storage';
import { Activity, DEFAULT_PLAYER, Player, Quest } from './types';
import { canAdvanceRank, levelFromXp, nextRank, xpForNextLevel, xpIntoLevel } from './progression';
import { applyQuestProgress, generateDailyQuests } from './questEngine';

const statLabels = [['STR', 'strength'], ['AGI', 'agility'], ['END', 'endurance'], ['VIT', 'vitality'], ['DIS', 'discipline']] as const;
const todayKey = () => new Date().toISOString().slice(0, 10);

function App() {
  const [player, setPlayer] = useState<Player>(DEFAULT_PLAYER);
  const [quests, setQuests] = useState<Quest[]>([]);
  const [activity, setActivity] = useState<Activity[]>([]);
  const [ready, setReady] = useState(false);
  const [notice, setNotice] = useState('SYSTEM ONLINE');
  const [view, setView] = useState<'none' | 'stats' | 'quest' | 'log'>('none');

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
  const currentQuest = quests.find((quest) => !quest.completed) ?? quests[0];

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
    const updated: Player = { ...player, totalXp, level: levelFromXp(totalXp), streak: player.lastActiveDate === todayKey() ? player.streak : player.streak + 1, lastActiveDate: todayKey(), updatedAt: new Date().toISOString(), stats: { ...player.stats, [quest.stat]: player.stats[quest.stat] + 1 } };
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

  if (!ready) return <main className="boot-screen"><div>[ SYSTEM ]</div><span>INITIALIZING PLAYER DATA...</span></main>;

  return <main className="system-shell">
    <div className="scanline" />
    <header className="system-header"><span className="system-mark">[ SYSTEM ]</span><span className="system-state"><i /> {notice}</span></header>

    <section className="hud">
      <div className="hud-corner corner-tl" /><div className="hud-corner corner-tr" /><div className="hud-corner corner-bl" /><div className="hud-corner corner-br" />
      <div className="player-block"><span className="label">PLAYER</span><h1>{player.name}</h1></div>
      <div className="level-block"><span className="label">LEVEL</span><strong>{String(player.level).padStart(2, '0')}</strong></div>
      <div className="rank-block"><span className="label">RANK</span><strong>{player.rank}</strong></div>
      <div className="xp-block"><div className="xp-meta"><span>XP</span><span>{currentXp.toLocaleString()} / {nextXp.toLocaleString()}</span></div><div className="xp-bar"><span style={{ width: `${xpPercent}%` }} /></div></div>
      <div className="hp-block"><div><span className="label">HP</span><b>100 / 100</b></div><div className="hp-bar"><span /></div></div>
      <div className="streak-block"><span className="label">STREAK</span><strong>{player.streak}</strong></div>
    </section>

    <section className="quest-hud">
      <div className="quest-heading"><span className="label">DAILY QUEST</span><span>ACTIVE</span></div>
      {currentQuest ? <><h2>{currentQuest.title}</h2><p>{currentQuest.description}</p><div className="quest-progress"><span style={{ width: `${Math.min(100, (currentQuest.progress / currentQuest.target) * 100)}%` }} /></div><div className="quest-foot"><span>{currentQuest.progress} / {currentQuest.target}</span><span>+{currentQuest.xp} XP</span></div></> : <p>NO ACTIVE QUEST</p>}
      <button className="primary-button" onClick={() => setView('quest')}>VIEW QUEST <span>›</span></button>
    </section>

    <div className="hud-actions"><button onClick={() => setView('stats')}>STATUS</button><button onClick={quickTraining}>TRAIN</button><button onClick={() => setView('log')}>SYSTEM LOG</button></div>
    <footer className="system-footer">SYSTEM // PERSONAL PROTOCOL</footer>

    {view !== 'none' && <div className="overlay" onClick={() => setView('none')}><section className="modal" onClick={(event) => event.stopPropagation()}><button className="close" onClick={() => setView('none')}>×</button>
      {view === 'stats' && <><span className="label">PLAYER STATUS</span><h2>ABILITY PARAMETERS</h2><div className="modal-stats">{statLabels.map(([label, key]) => <div key={key}><span>{label}</span><strong>{player.stats[key]}</strong></div>)}</div></>}
      {view === 'quest' && <><span className="label">DAILY QUEST</span><h2>QUEST LIST</h2><div className="quest-list">{quests.map((quest) => <div className="quest-item" key={quest.id}><div><b>{quest.title}</b><small>{quest.description}</small></div><button disabled={quest.completed} onClick={() => completeQuest(quest.id)}>{quest.completed ? 'CLEARED' : `+${quest.xp} XP`}</button></div>)}</div></>}
      {view === 'log' && <><span className="label">SYSTEM LOG</span><h2>RECENT EVENTS</h2><div className="log-list">{activity.length ? activity.map((event) => <div key={event.id}><time>{new Date(event.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</time><span>{event.label}</span></div>) : <p>NO RECENT EVENTS</p>}</div></>}
    </section></div>}
  </main>;
}

createRoot(document.getElementById('root')!).render(<App />);
