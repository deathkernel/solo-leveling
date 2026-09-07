import { useEffect, useMemo, useState } from 'react';
import { createRoot } from 'react-dom/client';
import './styles.css';
import { loadPlayer, savePlayer } from './storage';
import { DEFAULT_PLAYER, Player } from './types';

const stats = [['STR', 'strength'], ['AGI', 'agility'], ['END', 'endurance'], ['VIT', 'vitality'], ['DIS', 'discipline']] as const;

function xpForNextLevel(level: number): number { return Math.floor(1000 * Math.pow(1.15, Math.max(level - 1, 0))); }
function levelFromXp(totalXp: number): number {
  let level = 1, remaining = Math.max(totalXp, 0);
  while (remaining >= xpForNextLevel(level)) { remaining -= xpForNextLevel(level); level += 1; }
  return level;
}

function App() {
  const [player, setPlayer] = useState<Player>(DEFAULT_PLAYER);
  const [ready, setReady] = useState(false);

  useEffect(() => { loadPlayer().then((saved) => { setPlayer(saved); setReady(true); }).catch(() => setReady(true)); }, []);

  const currentLevelXp = useMemo(() => {
    let xp = player.totalXp;
    for (let level = 1; level < player.level; level++) xp -= xpForNextLevel(level);
    return Math.max(xp, 0);
  }, [player.totalXp, player.level]);
  const nextXp = xpForNextLevel(player.level);
  const xpPercent = Math.min((currentLevelXp / nextXp) * 100, 100);

  async function awardTrainingXp() {
    const totalXp = player.totalXp + 100;
    const updated = { ...player, totalXp, level: levelFromXp(totalXp) };
    setPlayer(updated);
    await savePlayer(updated);
  }

  if (!ready) return <main className="boot-screen">INITIALIZING SYSTEM<span>_</span></main>;
  return (
    <main className="system-shell">
      <div className="scanline" />
      <header className="topbar"><span className="system-label">SYSTEM</span><span className="online"><i /> OFFLINE MODE</span></header>
      <section className="hero panel">
        <div><p className="eyebrow">PLAYER STATUS</p><h1>{player.name}</h1><div className="rank-row"><span className="rank">{player.rank}-RANK</span><span>LEVEL {String(player.level).padStart(2, '0')}</span></div></div>
        <div className="xp-box"><div className="xp-head"><span>XP</span><b>{currentLevelXp.toLocaleString()} / {nextXp.toLocaleString()}</b></div><div className="bar"><span style={{ width: `${xpPercent}%` }} /></div><small>{player.totalXp.toLocaleString()} TOTAL XP</small></div>
      </section>
      <section className="stats panel"><div className="section-title">ABILITY</div><div className="stat-grid">{stats.map(([name, key]) => <div className="stat" key={name}><span>{name}</span><strong>{player.stats[key]}</strong></div>)}</div></section>
      <section className="quest panel"><div className="section-title">DAILY QUEST</div><div className="quest-row"><div><b>STRENGTH PROTOCOL</b><small>Complete your assigned training</small></div><span className="pending">PENDING</span></div><button className="system-button" onClick={awardTrainingXp}>COMPLETE TRAINING +100 XP <span>›</span></button></section>
    </main>
  );
}

createRoot(document.getElementById('root')!).render(<App />);
