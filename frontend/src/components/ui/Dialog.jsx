/* eslint-disable react/prop-types */
import { useEffect, useRef } from 'react';

import Button from './Button.jsx';

const focusableSelector = [
  'a[href]',
  'button:not([disabled])',
  'input:not([disabled])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
].join(',');

export default function Dialog({
  children,
  confirmLabel = 'Confirm',
  isOpen,
  onClose,
  onConfirm,
  title,
}) {
  const dialogRef = useRef(null);
  const previousFocusRef = useRef(null);

  useEffect(() => {
    const dialog = dialogRef.current;

    if (!dialog) {
      return undefined;
    }

    if (isOpen) {
      previousFocusRef.current = document.activeElement;

      if (!dialog.open) {
        dialog.showModal();
      }

      const focusTarget = dialog.querySelector(focusableSelector);

      if (focusTarget) {
        focusTarget.focus();
      }
    } else if (dialog.open) {
      dialog.close();
    }

    return undefined;
  }, [isOpen]);

  useEffect(() => {
    const dialog = dialogRef.current;

    if (!dialog) {
      return undefined;
    }

    const handleCancel = (event) => {
      event.preventDefault();
      onClose();
    };

    const handleClose = () => {
      const previousFocus = previousFocusRef.current;

      if (previousFocus && typeof previousFocus.focus === 'function') {
        previousFocus.focus();
      }
    };

    dialog.addEventListener('cancel', handleCancel);
    dialog.addEventListener('close', handleClose);

    return () => {
      dialog.removeEventListener('cancel', handleCancel);
      dialog.removeEventListener('close', handleClose);
    };
  }, [onClose]);

  return (
    <dialog className="ui-dialog" ref={dialogRef} aria-labelledby="dialog-title">
      <div className="ui-dialog-panel">
        <header className="ui-dialog-header">
          <h2 id="dialog-title">{title}</h2>
          <Button aria-label="Close dialog" onClick={onClose} size="sm" variant="ghost">
            Close
          </Button>
        </header>
        <div className="ui-dialog-body">{children}</div>
        <footer className="ui-dialog-actions">
          <Button onClick={onClose} variant="secondary">
            Cancel
          </Button>
          {onConfirm && <Button onClick={onConfirm}>{confirmLabel}</Button>}
        </footer>
      </div>
    </dialog>
  );
}
