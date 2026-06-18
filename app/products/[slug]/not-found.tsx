import Link from 'next/link';

export default function ProductNotFound() {
  return (
    <div className="container" style={{ padding: '5rem 1rem', textAlign: 'center' }}>
      <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>🎈</div>
      <h1 style={{ marginBottom: '0.5rem' }}>Product Not Found</h1>
      <p style={{ color: 'var(--color-text-secondary)', marginBottom: '2rem', fontSize: 'var(--text-lg)' }}>
        This product doesn&apos;t exist or may have been removed.
        <br />Message us on WhatsApp for custom requests!
      </p>
      <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
        <Link href="/products" className="btn btn-primary">Browse All Products</Link>
        <a
          href={`https://wa.me/${process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '923XXXXXXXXX'}?text=${encodeURIComponent("Hi! I'm looking for a specific product. Can you help?")}`}
          target="_blank" rel="noopener noreferrer"
          className="btn btn-whatsapp"
        >
          📱 Ask on WhatsApp
        </a>
      </div>
    </div>
  );
}
