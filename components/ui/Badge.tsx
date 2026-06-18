type BadgeVariant = 'purple' | 'teal' | 'pink' | 'success' | 'warning' | 'error';

interface BadgeProps {
  variant?: BadgeVariant;
  children: React.ReactNode;
  className?: string;
}

export default function Badge({ variant = 'purple', children, className = '' }: BadgeProps) {
  return (
    <span className={`badge badge-${variant} ${className}`}>
      {children}
    </span>
  );
}
