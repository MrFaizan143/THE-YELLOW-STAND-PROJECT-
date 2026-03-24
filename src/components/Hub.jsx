import { useState, useEffect } from 'react';
import { DATA } from '../data/team';

function formatCountdown(gap) {
  if (gap <= 0) return 'LIVE NOW';
  const days  = Math.floor(gap / 86_400_000);
  const hours = Math.floor((gap % 86_400_000) / 3_600_000);
  const mins  = Math.floor((gap % 3_600_000) / 60_000);
  const secs  = Math.floor((gap % 60_000) / 1_000);
  return `${days}d ${hours}h ${mins}m ${secs}s`;
}

export default function Hub() {
  const [display, setDisplay] = useState(() =>
    formatCountdown(new Date(DATA.nextMatch.date).getTime() - Date.now())
  );

  useEffect(() => {
    const id = setInterval(() => {
      const gap = new Date(DATA.nextMatch.date).getTime() - Date.now();
      setDisplay(formatCountdown(gap));
      if (gap <= 0) clearInterval(id);
    }, 1000);
    return () => clearInterval(id);
  }, []);

  return (
    <section className="page" aria-label="Hub">
      <span className="tag">System 2026</span>
      <h1>T Y S.</h1>
      <div className="countdown-card">
        <p className="countdown-display">{display}</p>
        <p className="tag" style={{ marginTop: '10px' }}>{DATA.nextMatch.label}</p>
      </div>
    </section>
  );
}
