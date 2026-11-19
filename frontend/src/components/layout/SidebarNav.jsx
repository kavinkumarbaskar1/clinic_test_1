/* eslint-disable react/prop-types */
export const personaNavigation = [
  {
    id: 'patient',
    label: 'Patient',
    description: 'Book and manage appointments',
    items: [
      { href: '#book-appointment', label: 'Book appointment' },
      { href: '#my-visits', label: 'My visits' },
      { href: '#intake', label: 'Intake status' },
    ],
  },
  {
    id: 'staff',
    label: 'Scheduling staff',
    description: 'Coordinate the clinic calendar',
    items: [
      { href: '#schedule-board', label: 'Schedule board' },
      { href: '#verification', label: 'Verification queue' },
      { href: '#reminders', label: 'Reminders' },
    ],
  },
  {
    id: 'admin',
    label: 'Authorized admin',
    description: 'Protected operations and oversight',
    items: [
      { href: '#availability', label: 'Availability rules' },
      { href: '#audit', label: 'Audit trail' },
      { href: '#access', label: 'Access controls' },
    ],
  },
];

export default function SidebarNav({
  activePersona,
  navItems = personaNavigation,
  onPersonaChange,
}) {
  const currentPersona = navItems.find((persona) => persona.id === activePersona) ?? navItems[0];

  return (
    <aside className="sidebar" aria-label="Clinic workspace navigation">
      <div className="persona-switcher" aria-label="Persona areas">
        {navItems.map((persona) => (
          <button
            aria-pressed={persona.id === currentPersona.id}
            className="persona-button"
            key={persona.id}
            onClick={() => onPersonaChange(persona.id)}
            type="button"
          >
            <span>{persona.label}</span>
            <small>{persona.description}</small>
          </button>
        ))}
      </div>

      <nav aria-label={`${currentPersona.label} navigation`} className="sidebar-nav">
        <p className="sidebar-heading">{currentPersona.label}</p>
        {currentPersona.items.map((item) => (
          <a href={item.href} key={item.href}>
            {item.label}
          </a>
        ))}
      </nav>
    </aside>
  );
}
