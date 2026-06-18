import { ProductCardSkeleton } from '@/components/ui';

export default function ProductsLoading() {
  return (
    <div className="container" style={{ padding: '2rem 1rem 3.5rem' }}>
      <div style={{ marginBottom: '1.5rem' }}>
        <div className="skeleton" style={{ height: '2rem', width: '180px', marginBottom: '0.5rem' }} />
        <div className="skeleton" style={{ height: '1rem', width: '260px' }} />
      </div>

      <div className="skeleton" style={{ height: '2.5rem', width: '100%', maxWidth: '420px', marginBottom: '1.5rem' }} />

      <div style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap', marginBottom: '2rem' }}>
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="skeleton" style={{ height: '2rem', width: '90px', borderRadius: 'var(--radius-full)' }} />
        ))}
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
          gap: '1.25rem',
        }}
      >
        {Array.from({ length: 8 }).map((_, i) => (
          <ProductCardSkeleton key={i} />
        ))}
      </div>
    </div>
  );
}
