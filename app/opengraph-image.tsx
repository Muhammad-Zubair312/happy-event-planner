// app/opengraph-image.tsx
// Next.js App Router dynamic OG image — auto-served at /opengraph-image
// Replaces the static `og-default.jpg` referenced in Day 18 metadata
// Generated at request time using @vercel/og (bundled with Next.js 13+)
//
// Output: 1200×630 PNG — optimal for:
//   - WhatsApp link previews
//   - Facebook / Instagram shares
//   - Twitter cards (summary_large_image)
//   - Google Search rich results

import { ImageResponse } from 'next/og';

export const runtime = 'edge';

export const alt = 'Happy Event Planner Lahore — Balloons, Candles & Party Decoration';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default function OgImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '1200px',
          height: '630px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(135deg, #4c1d95 0%, #6d28d9 40%, #0d9488 100%)',
          fontFamily: 'system-ui, sans-serif',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Background decorative circles */}
        <div
          style={{
            position: 'absolute',
            top: '-80px',
            right: '-80px',
            width: '400px',
            height: '400px',
            borderRadius: '50%',
            background: 'rgba(255,255,255,0.06)',
            display: 'flex',
          }}
        />
        <div
          style={{
            position: 'absolute',
            bottom: '-60px',
            left: '-60px',
            width: '300px',
            height: '300px',
            borderRadius: '50%',
            background: 'rgba(255,255,255,0.05)',
            display: 'flex',
          }}
        />

        {/* Balloon emoji row */}
        <div
          style={{
            display: 'flex',
            gap: '16px',
            fontSize: '64px',
            marginBottom: '32px',
          }}
        >
          <span>🎈</span>
          <span>🎉</span>
          <span>🕯️</span>
          <span>🎀</span>
          <span>🎁</span>
        </div>

        {/* Store name */}
        <div
          style={{
            fontSize: '68px',
            fontWeight: 800,
            color: '#ffffff',
            textAlign: 'center',
            lineHeight: 1.1,
            letterSpacing: '-1px',
            marginBottom: '16px',
            display: 'flex',
          }}
        >
          Happy Event Planner
        </div>

        {/* Tagline */}
        <div
          style={{
            fontSize: '30px',
            color: 'rgba(255,255,255,0.85)',
            textAlign: 'center',
            marginBottom: '40px',
            fontWeight: 400,
            display: 'flex',
          }}
        >
          Lahore's Party & Event Decoration Store
        </div>

        {/* Feature pills */}
        <div
          style={{
            display: 'flex',
            gap: '16px',
            marginBottom: '32px',
          }}
        >
          {['🚀 Same-Day Delivery', '💚 WhatsApp Orders', '📦 COD Available'].map((text) => (
            <div
              key={text}
              style={{
                background: 'rgba(255,255,255,0.15)',
                border: '1px solid rgba(255,255,255,0.25)',
                borderRadius: '100px',
                padding: '10px 24px',
                fontSize: '22px',
                color: '#ffffff',
                fontWeight: 600,
                display: 'flex',
              }}
            >
              {text}
            </div>
          ))}
        </div>

        {/* Delivery areas */}
        <div
          style={{
            fontSize: '20px',
            color: 'rgba(255,255,255,0.65)',
            textAlign: 'center',
            display: 'flex',
          }}
        >
          DHA · Gulberg · Johar Town · Model Town · Bahria Town
        </div>

        {/* Bottom domain bar */}
        <div
          style={{
            position: 'absolute',
            bottom: '0',
            left: '0',
            right: '0',
            height: '56px',
            background: 'rgba(0,0,0,0.25)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <div
            style={{
              fontSize: '22px',
              color: 'rgba(255,255,255,0.75)',
              letterSpacing: '1px',
              display: 'flex',
            }}
          >
            happyeventplanner.vercel.app
          </div>
        </div>
      </div>
    ),
    { ...size }
  );
}
