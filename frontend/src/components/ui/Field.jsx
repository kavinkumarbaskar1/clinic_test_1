/* eslint-disable react/prop-types */
import { useId } from 'react';

export default function Field({
  error = '',
  helpText = '',
  id,
  label,
  required = false,
  type = 'text',
  ...props
}) {
  const generatedId = useId();
  const inputId = id ?? generatedId;
  const helpId = `${inputId}-help`;
  const errorId = `${inputId}-error`;
  const describedBy = [helpText ? helpId : '', error ? errorId : ''].filter(Boolean).join(' ');

  return (
    <div className={`ui-field ${error ? 'ui-field-invalid' : ''}`}>
      <label htmlFor={inputId}>
        {label}
        {required && <span aria-hidden="true">*</span>}
      </label>
      <input
        aria-describedby={describedBy || undefined}
        aria-invalid={error ? 'true' : undefined}
        id={inputId}
        required={required}
        type={type}
        {...props}
      />
      {helpText && (
        <p className="ui-field-help" id={helpId}>
          {helpText}
        </p>
      )}
      {error && (
        <p className="ui-field-error" id={errorId}>
          {error}
        </p>
      )}
    </div>
  );
}
