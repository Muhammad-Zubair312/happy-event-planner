import type { Metadata } from 'next';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://happyeventplanner.vercel.app';

export const metadata: Metadata = {
  title: 'Your Cart',
  description:
    'Review your order from Happy Event Planner Lahore. Balloons, candles & party decorations. Checkout with JazzCash, EasyPaisa or Cash on Delivery.',
  alternates: { canonical: `${SITE_URL}/cart` },
  robots: { index: false, follow: false },
  openGraph: {
    title: 'Your Cart | Happy Event Planner Lahore',
    description: 'Review your order — balloons, candles & party decorations. Checkout with JazzCash, EasyPaisa or Cash on Delivery.',
    url: `${SITE_URL}/cart`,
  },
};

export default function CartLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
