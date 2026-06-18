import React from 'react';

type Variant = 'primary' | 'secondary' | 'outline' | 'whatsapp' | 'ghost';
type Size    = 'sm' | 'md' | 'lg';

interface ButtonProps extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'onClick'> {
  variant?: Variant;
  size?: Size;
  loading?: boolean;
  as?: 'button' | 'a';
  href?: string;
  target?: string;
  onClick?: React.MouseEventHandler<HTMLButtonElement | HTMLAnchorElement>;
}

export default function Button({
  variant = 'primary',
  size = 'md',
  loading = false,
  children,
  className = '',
  disabled,
  as: Tag = 'button',
  href,
  target,
  onClick,
  ...props
}: ButtonProps) {
  const cls = [
    'btn',
    `btn-${variant}`,
    size === 'lg' ? 'btn-lg' : size === 'sm' ? 'btn-sm' : '',
    className,
  ].filter(Boolean).join(' ');

  if (Tag === 'a' && href) {
    return React.createElement(
      'a',
      {
        href,
        target,
        rel: target === '_blank' ? 'noopener noreferrer' : undefined,
        className: cls,
        onClick: onClick as React.MouseEventHandler<HTMLAnchorElement>,
        ...props,
      },
      loading && React.createElement(Spinner),
      children
    );
  }

  return (
    <button
      className={cls}
      disabled={disabled || loading}
      onClick={onClick as React.MouseEventHandler<HTMLButtonElement>}
      {...props}
    >
      {loading && <Spinner />}
      {children}
    </button>
  );
}

function Spinner() {
  return (
    <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
    </svg>
  );
}