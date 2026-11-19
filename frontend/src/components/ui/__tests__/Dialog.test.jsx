import '@testing-library/jest-dom/vitest';

/* eslint-disable react/prop-types */
import React, { useCallback, useState } from 'react';
import { cleanup, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

globalThis.React = React;

const { default: Dialog } = await import('../Dialog.jsx');

function DialogHarness({ onClose }) {
  const [isOpen, setIsOpen] = useState(false);
  const closeDialog = useCallback(() => {
    setIsOpen(false);
    onClose();
  }, [onClose]);

  return (
    <>
      <button onClick={() => setIsOpen(true)} type="button">
        Open review
      </button>
      <Dialog isOpen={isOpen} onClose={closeDialog} title="Shared dialog focus check">
        <p>Review the shared dialog behavior.</p>
      </Dialog>
    </>
  );
}

beforeEach(() => {
  HTMLDialogElement.prototype.showModal = function showModal() {
    this.setAttribute('open', '');
  };
  HTMLDialogElement.prototype.close = function close() {
    this.removeAttribute('open');
    this.dispatchEvent(new Event('close'));
  };
});

afterEach(() => {
  cleanup();
});

describe('Dialog', () => {
  it('moves focus inside when opened and restores focus when closed', async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();

    render(<DialogHarness onClose={onClose} />);

    const opener = screen.getByRole('button', { name: 'Open review' });
    await user.click(opener);

    const closeButton = screen.getByRole('button', {
      name: 'Close dialog',
    });

    await waitFor(() => expect(closeButton).toHaveFocus());
    await user.click(closeButton);

    expect(onClose).toHaveBeenCalledTimes(1);
    await waitFor(() => expect(opener).toHaveFocus());
  });

  it('calls close handler when Escape triggers the native cancel event', () => {
    const onClose = vi.fn();

    render(
      <Dialog isOpen onClose={onClose} title="Shared dialog focus check">
        <p>Review the shared dialog behavior.</p>
      </Dialog>,
    );

    screen.getByRole('dialog').dispatchEvent(
      new Event('cancel', {
        bubbles: true,
        cancelable: true,
      }),
    );

    expect(onClose).toHaveBeenCalledTimes(1);
  });
});
