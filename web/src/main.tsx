import React from 'react';
import { createRoot } from 'react-dom/client';
import './styles.css';

const stats = [
  ['STR', 10], ['AGI', 10], ['END', 10], ['VIT', 10], ['DIS', 10]
];

function App() {
  return (
    <main className="system-shell">
      <div className="scanline" />
      <header className="topbar">
        <span className="system-label">SYSTEM</span>
        <span className="online"><i /> OFFLINE MODE</span>
      </header>

      <section className="hero panel">
        <div>
          <p className="eyebrow">PLAYER STATUS</p>
          <h1>PLAYER</h1>
          <div className="rank-row"><span className="rank">E-RANK</span><span>LEVEL 01</span></div>
        </div>
        <div className="xp-box">
          <div className="xp-head"><span>XP</span><b>0 / 1,000</b></div>
          <div className="bar"><span style={{ width: '0%' }} /></div>
        </div>
      </section>

      <section className="stats panel">
        <div className="section-title">ABILITY</div>
        <div className="stat-grid">
          {stats.map(([name, value]) => <div className="stat" key={name}><span>{name}</span><strong>{value}</strong></div>)}
        </div>
      </section>

      <section className="quest panel">
        <div className="section-title">DAILY QUEST</div>
        <div className="quest-row"><div><b>STRENGTH PROTOCOL</b><small>Complete your assigned training</small></div><span className="pending">PENDING</span></div>
        <button className="system-button">OPEN QUEST LOG <span>›</span></button>
      </section>
    </main>
  );
}

createRoot(document.getElementById('root')!).render(<React.StrictMode><App /></React.StrictMode>);
