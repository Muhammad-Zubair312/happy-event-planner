'use client';
import { useState } from 'react';
import Image from 'next/image';
import { getFullSizeUrl, getThumbnailUrl, getBlurByCategory, getProductEmoji, BLUR_DEFAULT } from '@/lib/images';

interface ImageGalleryProps {
  images: string[];
  productName: string;
  categorySlug?: string | null;
}

export default function ImageGallery({ images, productName, categorySlug }: ImageGalleryProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isZoomed, setIsZoomed] = useState(false);

  const hasImages = images && images.length > 0;
  const activeImage = hasImages ? getFullSizeUrl(images[activeIndex]) : null;
  const blurUrl = getBlurByCategory(categorySlug);
  const emoji = getProductEmoji(productName, categorySlug);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>

      {/* ── Main image ── */}
      <div
        onClick={() => hasImages && setIsZoomed(!isZoomed)}
        style={{
          position: 'relative',
          width: '100%',
          aspectRatio: '1 / 1',
          borderRadius: 'var(--radius-xl)',
          overflow: 'hidden',
          background: 'var(--color-surface-soft)',
          border: '1px solid var(--color-border)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: hasImages ? 'zoom-in' : 'default',
        }}
      >
        {hasImages && activeImage ? (
          <Image
            src={activeImage}
            alt={`${productName} — image ${activeIndex + 1}`}
            fill
            priority={activeIndex === 0}          // LCP optimisation — first image is priority
            sizes="(max-width: 768px) 100vw, 50vw"
            style={{
              objectFit: 'cover',
              transform: isZoomed ? 'scale(1.15)' : 'scale(1)',
              transition: 'transform 0.4s ease',
            }}
            placeholder="blur"
            blurDataURL={blurUrl}
          />
        ) : (
          // Emoji placeholder when no image
          <div style={{
            textAlign: 'center',
            padding: '2rem',
            background: 'linear-gradient(135deg, var(--color-brand-purple-light) 0%, var(--color-surface-soft) 100%)',
            width: '100%', height: '100%',
            display: 'flex', flexDirection: 'column',
            alignItems: 'center', justifyContent: 'center',
          }}>
            <div style={{ fontSize: '6rem', marginBottom: '0.75rem' }}>{emoji}</div>
            <p style={{ color: 'var(--color-text-muted)', fontSize: 'var(--text-sm)', margin: 0 }}>
              Product image coming soon
            </p>
          </div>
        )}

        {/* Image counter badge */}
        {hasImages && images.length > 1 && (
          <span style={{
            position: 'absolute', bottom: '0.75rem', right: '0.75rem',
            background: 'rgba(0,0,0,0.55)', color: '#fff',
            fontSize: 'var(--text-xs)', fontWeight: 600,
            padding: '0.2rem 0.6rem', borderRadius: 'var(--radius-full)',
          }}>
            {activeIndex + 1} / {images.length}
          </span>
        )}

        {/* Zoom hint */}
        {hasImages && !isZoomed && (
          <span style={{
            position: 'absolute', bottom: '0.75rem', left: '0.75rem',
            background: 'rgba(0,0,0,0.45)', color: '#fff',
            fontSize: '0.65rem', fontWeight: 600,
            padding: '0.15rem 0.5rem', borderRadius: 'var(--radius-full)',
            opacity: 0.8,
          }}>
            🔍 Tap to zoom
          </span>
        )}
      </div>

      {/* ── Thumbnails ── */}
      {hasImages && images.length > 1 && (
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          {images.map((src, i) => {
            const thumbSrc = getThumbnailUrl(src, 100);
            return (
              <button
                key={i}
                onClick={() => { setActiveIndex(i); setIsZoomed(false); }}
                aria-label={`View image ${i + 1}`}
                style={{
                  width: '72px', height: '72px',
                  borderRadius: 'var(--radius-lg)',
                  overflow: 'hidden',
                  border: i === activeIndex
                    ? '2.5px solid var(--color-brand-purple)'
                    : '2px solid var(--color-border)',
                  cursor: 'pointer',
                  padding: 0,
                  background: 'var(--color-surface-muted)',
                  flexShrink: 0,
                  transition: 'border-color 0.15s, transform 0.15s',
                  transform: i === activeIndex ? 'scale(1.05)' : 'scale(1)',
                  position: 'relative',
                }}
              >
                <Image
                  src={thumbSrc}
                  alt={`${productName} thumbnail ${i + 1}`}
                  fill
                  sizes="72px"
                  style={{ objectFit: 'cover' }}
                  placeholder="blur"
                  blurDataURL={blurUrl}
                />
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
