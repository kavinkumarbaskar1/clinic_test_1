/* eslint-disable react/prop-types */
import Button from '../ui/Button.jsx';
import SidebarNav, { personaNavigation } from './SidebarNav.jsx';

export default function AppShell({
  activePersona,
  children,
  isDarkTheme,
  onPersonaChange,
  onThemeToggle,
}) {
  const themeLabel = isDarkTheme ? 'Switch to light theme' : 'Switch to dark theme';

  return (
    <div className="app-shell">
      <a className="skip-link" href="#main-content">
        Skip to main content
      </a>

      <header className="topbar">
        <div className="brand-area" aria-label="Clinic booking workspace">
          <span className="brand-mark" aria-hidden="true">
            CB
          </span>
          <div>
            <p className="ui-eyebrow">Clinic booking</p>
            <h1>Scheduling workspace</h1>
          </div>
        </div>
        <div className="topbar-actions" aria-label="Workspace controls">
          <span className="topbar-persona">
            {personaNavigation.find((persona) => persona.id === activePersona)?.label}
          </span>
          <Button
            aria-label={themeLabel}
            aria-pressed={isDarkTheme}
            onClick={onThemeToggle}
            variant="secondary"
          >
            {isDarkTheme ? 'Dark' : 'Light'}
          </Button>
        </div>
      </header>

      <div className="workspace">
        <SidebarNav activePersona={activePersona} onPersonaChange={onPersonaChange} />
        <main className="content" id="main-content" tabIndex="-1">
          {children}
        </main>
      </div>
    </div>
  );
}
