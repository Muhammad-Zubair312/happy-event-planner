interface CardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
}
interface CardSectionProps {
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

export function Card({ children, className = '', hover = true }: CardProps) {
  return (
    <div className={`card ${hover ? '' : 'hover:shadow-none hover:transform-none'} ${className}`}>
      {children}
    </div>
  );
}

export function CardBody({ children, className = '', style }: CardSectionProps) {
  return <div className={`card-body ${className}`} style={style}>{children}</div>;
}

export function CardHeader({ children, className = '', style }: CardSectionProps) {
  return <div className={`card-header ${className}`} style={style}>{children}</div>;
}

export function CardFooter({ children, className = '', style }: CardSectionProps) {
  return <div className={`card-footer ${className}`} style={style}>{children}</div>;
}
