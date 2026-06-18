interface SkeletonProps {
  width?: string;
  height?: string;
  className?: string;
  rounded?: boolean;
}

export default function Skeleton({ width = '100%', height = '1rem', className = '', rounded = false }: SkeletonProps) {
  return (
    <div
      className={`skeleton ${rounded ? 'rounded-full' : ''} ${className}`}
      style={{ width, height }}
      aria-hidden="true"
    />
  );
}

export function ProductCardSkeleton() {
  return (
    <div className="card">
      <Skeleton height="200px" className="rounded-none" />
      <div className="card-body flex flex-col gap-3">
        <Skeleton height="1rem" width="60%" />
        <Skeleton height="0.75rem" width="90%" />
        <Skeleton height="0.75rem" width="75%" />
        <div className="flex justify-between items-center mt-2">
          <Skeleton height="1.5rem" width="30%" />
          <Skeleton height="2.25rem" width="40%" />
        </div>
      </div>
    </div>
  );
}
