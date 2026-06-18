import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
}

export default function Input({ label, error, hint, className = '', id, ...props }: InputProps) {
  const inputId = id || label?.toLowerCase().replace(/\s+/g, '-');
  return (
    <div className="flex flex-col gap-1">
      {label && (
        <label htmlFor={inputId} className="label">{label}</label>
      )}
      <input
        id={inputId}
        className={`input ${error ? 'input-error' : ''} ${className}`}
        {...props}
      />
      {error && <p style={{ color: 'var(--color-error)', fontSize: 'var(--text-xs)' }}>{error}</p>}
      {hint && !error && <p style={{ color: 'var(--color-text-muted)', fontSize: 'var(--text-xs)' }}>{hint}</p>}
    </div>
  );
}
