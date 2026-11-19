import { useEffect, useState } from 'react';

import { getHealth } from './services/apiClient.js';

const navigationItems = [
  'Booking',
  'Verification',
  'Availability',
  'Staff schedule',
  'Reminders',
  'Audit',
];

const statusLabels = {
  idle: 'Checking API',
  ok: 'API online',
  error: 'API unavailable',
};

export default function App() {
  const [apiStatus, setApiStatus] = useState({
    state: 'idle',
    detail: 'Waiting for the backend health endpoint.',
  });

  useEffect(() => {
    let isCurrent = true;

    getHealth()
      .then((health) => {
        if (!isCurrent) {
          return;
        }

        setApiStatus({
          state: 'ok',
          detail: `${health.service} ${health.version} is ready.`,
        });
      })
      .catch(() => {
        if (!isCurrent) {
          return;
        }

        setApiStatus({
          state: 'error',
          detail: 'Start the FastAPI server to connect the baseline app.',
        });
      });

    return () => {
      isCurrent = false;
    };
  }, []);

  return (
    <div className="app-shell">
      <a className="skip-link" href="#main-content">
        Skip to main content
      </a>

      <header className="topbar">
        <div>
          <p className="eyebrow">Clinic booking</p>
          <h1>Scheduling baseline</h1>
        </div>
        <div className="topbar-actions" aria-label="Workspace controls">
          <span className="persona-pill">Staff view</span>
          <button className="theme-toggle" type="button" aria-label="Theme toggle">
            Light
          </button>
        </div>
      </header>

      <div className="workspace">
        <aside className="sidebar" aria-label="Feature modules">
          <nav>
            {navigationItems.map((item) => (
              <a href={`#${item.toLowerCase().replaceAll(' ', '-')}`} key={item}>
                {item}
              </a>
            ))}
          </nav>
        </aside>

        <main id="main-content" className="content">
          <section className="banner" aria-labelledby="baseline-heading">
            <div>
              <p className="eyebrow">Versioned API namespace</p>
              <h2 id="baseline-heading">React and FastAPI are wired together.</h2>
              <p>
                This scaffold reserves the approved domains while keeping scheduling
                data untouched until later feature tasks add protected workflows.
              </p>
            </div>
            <div className={`status-card status-${apiStatus.state}`}>
              <span>{statusLabels[apiStatus.state]}</span>
              <strong>{apiStatus.detail}</strong>
            </div>
          </section>

          <section className="module-grid" aria-label="Module readiness">
            {navigationItems.map((item) => (
              <article className="module-card" id={item.toLowerCase().replaceAll(' ', '-')} key={item}>
                <span className="tag">Reserved module</span>
                <h3>{item}</h3>
                <p>Domain package created for the modular monolith baseline.</p>
              </article>
            ))}
          </section>
        </main>
      </div>
    </div>
  );
}
