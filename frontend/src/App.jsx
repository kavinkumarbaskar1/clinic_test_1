import { useEffect, useState } from 'react';

import AppShell from './components/layout/AppShell.jsx';
import Banner from './components/ui/Banner.jsx';
import Button from './components/ui/Button.jsx';
import Card from './components/ui/Card.jsx';
import Dialog from './components/ui/Dialog.jsx';
import Field from './components/ui/Field.jsx';
import MaintenanceBanner from './components/ui/MaintenanceBanner.jsx';
import Tag from './components/ui/Tag.jsx';
import { getHealth } from './services/apiClient.js';
import { getMaintenanceState } from './services/maintenanceApi.js';
import './styles/theme.css';

const statusLabels = {
  idle: 'Checking API',
  ok: 'API online',
  error: 'API unavailable',
};

const statusTone = {
  idle: 'warning',
  ok: 'good',
  error: 'critical',
};

const slotOptions = [
  { id: 'morning', label: 'Morning slots', value: '8 open' },
  { id: 'midday', label: 'Midday slots', value: '5 open' },
  { id: 'afternoon', label: 'Afternoon slots', value: '11 open' },
  { id: 'urgent', label: 'Urgent holds', value: '2 reserved' },
];

const timelineItems = [
  'Patient requests an appointment window.',
  'Scheduling staff verifies coverage and clinic availability.',
  'Authorized administrators review audit and access events.',
];

export default function App() {
  const [activePersona, setActivePersona] = useState('staff');
  const [apiStatus, setApiStatus] = useState({
    state: 'idle',
    detail: 'Waiting for the backend health endpoint.',
  });
  const [maintenanceState, setMaintenanceState] = useState({
    active: false,
    message: '',
  });
  const [isDarkTheme, setIsDarkTheme] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  useEffect(() => {
    document.documentElement.dataset.theme = isDarkTheme ? 'dark' : 'light';
  }, [isDarkTheme]);

  useEffect(() => {
    let isCurrent = true;

    Promise.all([getHealth(), getMaintenanceState()])
      .then(([health, maintenance]) => {
        if (!isCurrent) {
          return;
        }

        setApiStatus({
          state: 'ok',
          detail: `${health.service} ${health.version} is ready.`,
        });
        setMaintenanceState({
          active: Boolean(maintenance.active),
          message: maintenance.message,
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
        setMaintenanceState({
          active: false,
          message: '',
        });
      });

    return () => {
      isCurrent = false;
    };
  }, []);

  return (
    <AppShell
      activePersona={activePersona}
      isDarkTheme={isDarkTheme}
      onPersonaChange={setActivePersona}
      onThemeToggle={() => setIsDarkTheme((currentTheme) => !currentTheme)}
    >
      <div className="dashboard-stack">
        {maintenanceState.active && (
          <MaintenanceBanner message={maintenanceState.message} />
        )}

        <Banner
          actions={
            <Button onClick={() => setIsDialogOpen(true)} variant="secondary">
              Review dialog
            </Button>
          }
          eyebrow="Shared prototype shell"
          title="Persona-aware booking operations are ready for feature workflows."
          tone={apiStatus.state === 'error' ? 'warning' : 'success'}
        >
          <p>
            The app shell reserves navigation for patients, scheduling staff, and authorized
            administrators while keeping protected workflow data out of the frontend baseline.
          </p>
        </Banner>

        <div className="dashboard-grid">
          <Card
            actions={<Tag tone={statusTone[apiStatus.state]}>{statusLabels[apiStatus.state]}</Tag>}
            eyebrow="Connection"
            title="API health"
            tone={statusTone[apiStatus.state] === 'good' ? 'good' : 'warning'}
          >
            <p>{apiStatus.detail}</p>
            <div className="data-table-wrap" id="schedule-board">
              <table className="data-table">
                <caption className="sr-only">Prototype schedule states</caption>
                <thead>
                  <tr>
                    <th scope="col">Area</th>
                    <th scope="col">Primary user</th>
                    <th scope="col">State</th>
                  </tr>
                </thead>
                <tbody>
                  <tr id="book-appointment">
                    <td>Booking</td>
                    <td>Patient</td>
                    <td>
                      <Tag tone="good">Ready</Tag>
                    </td>
                  </tr>
                  <tr id="verification">
                    <td>Verification</td>
                    <td>Scheduling staff</td>
                    <td>
                      <Tag tone="warning">Queued</Tag>
                    </td>
                  </tr>
                  <tr id="audit">
                    <td>Audit</td>
                    <td>Authorized admin</td>
                    <td>
                      <Tag tone="neutral">Protected</Tag>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </Card>

          <Card eyebrow="Reusable controls" title="Appointment slot controls">
            <div className="slot-controls" id="availability">
              {slotOptions.map((slot) => (
                <div className="slot-row" key={slot.id}>
                  <span>{slot.label}</span>
                  <Tag tone={slot.id === 'urgent' ? 'warning' : 'good'}>{slot.value}</Tag>
                </div>
              ))}
            </div>
            <Field
              error="Use a clinic-owned phone number format for staff testing."
              helpText="Shown here to verify shared validation states."
              label="Reminder phone"
              placeholder="(555) 010-0180"
              type="tel"
            />
          </Card>
        </div>

        <Card eyebrow="Timeline" title="Booking workflow overview">
          <ol className="timeline" id="reminders">
            {timelineItems.map((item) => (
              <li key={item}>
                <p>{item}</p>
              </li>
            ))}
          </ol>
          <div className="slot-row" id="my-visits">
            <span>Patient visit summary</span>
            <Tag>Reserved module</Tag>
          </div>
          <div className="slot-row" id="intake">
            <span>Intake status</span>
            <Tag tone="warning">Needs review</Tag>
          </div>
          <div className="slot-row" id="access">
            <span>Access controls</span>
            <Tag tone="neutral">Admin only</Tag>
          </div>
        </Card>
      </div>

      <Dialog
        confirmLabel="Mark reviewed"
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        onConfirm={() => setIsDialogOpen(false)}
        title="Shared dialog focus check"
      >
        <p>
          This dialog uses the native modal element, moves focus inside when opened, restores
          focus when closed, and responds to Escape through the shared close handler.
        </p>
      </Dialog>
    </AppShell>
  );
}
