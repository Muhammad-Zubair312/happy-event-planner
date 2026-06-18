import Skeleton from '@/components/ui/Skeleton';

export default function ProductDetailLoading() {
  return (
    <div className="container" style={{ padding: '2rem 1rem 3rem' }}>
      {/* Breadcrumb */}
      <Skeleton height="1rem" width="300px" className="mb-6" />

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
        gap: '2.5rem',
        marginTop: '1.5rem',
      }}>
        {/* Image skeleton */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          <Skeleton height="380px" />
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            {[1,2,3].map(i => <Skeleton key={i} width="70px" height="70px" />)}
          </div>
        </div>

        {/* Info skeleton */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <Skeleton height="1.5rem" width="30%" />
          <Skeleton height="2.5rem" width="80%" />
          <Skeleton height="2.5rem" width="60%" />
          <Skeleton height="1rem" width="100%" />
          <Skeleton height="1rem" width="90%" />
          <Skeleton height="1rem" width="75%" />
          <div style={{ marginTop: '0.5rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <Skeleton height="48px" />
            <Skeleton height="48px" />
          </div>
        </div>
      </div>
    </div>
  );
}
