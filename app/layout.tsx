import type { Metadata } from 'next';
import './globals.css';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { CartProvider } from '@/context/CartContext';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://happyeventplanner.vercel.app';
const SITE_NAME = 'Happy Event Planner Lahore';
const OG_IMAGE = `${SITE_URL}/og-default.jpg`;

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  icons: {
    icon: '/logo-icon.svg',
    apple: '/logo-icon.svg',
  },
  title: {
    default: 'Happy Event Planner Lahore | Balloons, Candles & Party Decoration',
    template: '%s | Happy Event Planner Lahore',
  },
  description:
    'Order balloons, candles, paper decorations in Lahore. Same-day delivery to DHA, Gulberg, Johar Town. WhatsApp orders welcome. JazzCash & EasyPaisa accepted.',
  keywords: [
    'balloon decoration lahore',
    'birthday balloons DHA lahore',
    'event decoration lahore',
    'party supplies lahore',
    'candles lahore',
    'paper decor lahore',
    'balloon arch lahore',
    'birthday party items online pakistan',
    'gulberg decoration shop',
    'johar town party supplies',
  ],
  authors: [{ name: 'Happy Event Planner', url: SITE_URL }],
  creator: 'Happy Event Planner',
  publisher: 'Happy Event Planner',
  // Day 19: Google Search Console verification
  // Set GOOGLE_SITE_VERIFICATION in .env.local after getting the code from GSC
  verification: {
    google: process.env.GOOGLE_SITE_VERIFICATION,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, 'max-image-preview': 'large' },
  },
  openGraph: {
    type: 'website',
    locale: 'en_PK',
    url: SITE_URL,
    siteName: SITE_NAME,
    title: 'Happy Event Planner Lahore | Balloons, Candles & Party Decoration',
    description:
      'Order balloons, candles, paper decorations in Lahore. Same-day delivery to DHA, Gulberg, Johar Town. WhatsApp orders welcome.',
    images: [
      {
        url: OG_IMAGE,
        width: 1200,
        height: 630,
        alt: 'Happy Event Planner Lahore — Balloons, Candles & Party Decoration',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Happy Event Planner Lahore | Balloons & Party Decoration',
    description:
      'Order balloons, candles, paper decorations in Lahore. Same-day delivery. WhatsApp orders welcome.',
    images: [OG_IMAGE],
  },
  alternates: {
    canonical: SITE_URL,
  },
};

// ─── LocalBusiness JSON-LD Schema ─────────────────────────────────────────────
const localBusinessSchema = {
  '@context': 'https://schema.org',
  '@type': 'LocalBusiness',
  name: 'Happy Event Planner',
  description:
    'Event decoration supplies in Lahore — balloons, candles, paper decor, party accessories',
  url: SITE_URL,
  telephone: process.env.NEXT_PUBLIC_WHATSAPP_NUMBER
    ? `+${process.env.NEXT_PUBLIC_WHATSAPP_NUMBER}`
    : '+923XXXXXXXXX',
  address: {
    '@type': 'PostalAddress',
    addressLocality: 'Lahore',
    addressRegion: 'Punjab',
    addressCountry: 'PK',
  },
  geo: {
    '@type': 'GeoCoordinates',
    latitude: 31.5204,
    longitude: 74.3587,
  },
  openingHoursSpecification: [
    {
      '@type': 'OpeningHoursSpecification',
      dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
      opens: '10:00',
      closes: '22:00',
    },
  ],
  priceRange: 'PKR 100–5000',
  currenciesAccepted: 'PKR',
  paymentAccepted: 'JazzCash, EasyPaisa, Cash on Delivery',
  areaServed: [
    { '@type': 'City', name: 'Lahore' },
    { '@type': 'Place', name: 'DHA Lahore' },
    { '@type': 'Place', name: 'Gulberg Lahore' },
    { '@type': 'Place', name: 'Johar Town Lahore' },
    { '@type': 'Place', name: 'Model Town Lahore' },
    { '@type': 'Place', name: 'Bahria Town Lahore' },
  ],
  sameAs: [
    'https://www.facebook.com/happyeventplanner',
    'https://www.instagram.com/happyeventplanner',
  ],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="h-full">
      <head>
        {/* LocalBusiness structured data */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(localBusinessSchema) }}
        />
      </head>
      <body className="min-h-full flex flex-col antialiased">
        <CartProvider>
          <Header />
          <main style={{ flex: 1 }}>{children}</main>
          <Footer />
        </CartProvider>
      </body>
    </html>
  );
}
