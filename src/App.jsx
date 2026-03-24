import { useState } from 'react';
import Hub from './components/Hub';
import Map from './components/Map';
import Pride from './components/Pride';
import './styles/main.css';

const PAGES = [
  { id: 'h', label: 'Hub',   Component: Hub   },
  { id: 'm', label: 'Map',   Component: Map   },
  { id: 'p', label: 'Pride', Component: Pride },
];

export default function App() {
  const [activePage, setActivePage] = useState('h');

  const { Component } = PAGES.find((p) => p.id === activePage);

  function navigate(id) {
    setActivePage(id);
    window.scrollTo(0, 0);
  }

  return (
    <>
      <div className="wm" aria-hidden="true">THE YELLOW STAND</div>

      <nav role="navigation" aria-label="Main navigation">
        {PAGES.map(({ id, label }) => (
          <button
            key={id}
            className={`n-i${activePage === id ? ' active' : ''}`}
            onClick={() => navigate(id)}
            aria-current={activePage === id ? 'page' : undefined}
          >
            {label}
          </button>
        ))}
      </nav>

      <main>
        <Component key={activePage} />
      </main>
    </>
  );
}
