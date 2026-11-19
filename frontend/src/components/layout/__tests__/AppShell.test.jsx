import '@testing-library/jest-dom/vitest';

import React from 'react';
import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';

globalThis.React = React;

const { default: AppShell } = await import('../AppShell.jsx');

afterEach(() => {
  cleanup();
});

function renderAppShell(props = {}) {
  const defaultProps = {
    activePersona: 'staff',
    isDarkTheme: false,
    onPersonaChange: vi.fn(),
    onThemeToggle: vi.fn(),
  };
  const shellProps = { ...defaultProps, ...props };

  return {
    ...render(
      <AppShell {...shellProps}>
        <h2>Dashboard content</h2>
      </AppShell>,
    ),
    props: shellProps,
  };
}

describe('AppShell', () => {
  it('renders skip link, staff navigation, and current persona', () => {
    renderAppShell();

    expect(screen.getByRole('link', { name: 'Skip to main content' }))
      .toHaveAttribute('href', '#main-content');
    expect(screen.getByRole('main')).toHaveAttribute('id', 'main-content');
    expect(
      screen.getByRole('navigation', { name: 'Scheduling staff navigation' }),
    ).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Schedule board' }))
      .toHaveAttribute('href', '#schedule-board');
    expect(
      screen.getByRole('button', {
        name: /scheduling staff coordinate the clinic calendar/i,
      }),
    ).toHaveAttribute('aria-pressed', 'true');
  });

  it('switches persona areas from the sidebar', async () => {
    const user = userEvent.setup();
    const onPersonaChange = vi.fn();

    renderAppShell({ onPersonaChange });

    await user.click(screen.getByRole('button', { name: /patient/i }));

    expect(onPersonaChange).toHaveBeenCalledWith('patient');
  });

  it('uses accessible theme toggle labels for light and dark states', async () => {
    const user = userEvent.setup();
    const onThemeToggle = vi.fn();
    const { rerender, props } = renderAppShell({ onThemeToggle });

    const lightButton = screen.getByRole('button', {
      name: 'Switch to dark theme',
    });
    expect(lightButton).toHaveAttribute('aria-pressed', 'false');

    await user.click(lightButton);

    expect(onThemeToggle).toHaveBeenCalledTimes(1);

    rerender(
      <AppShell {...props} isDarkTheme>
        <h2>Dashboard content</h2>
      </AppShell>,
    );

    expect(
      screen.getByRole('button', { name: 'Switch to light theme' }),
    ).toHaveAttribute('aria-pressed', 'true');
  });
});
