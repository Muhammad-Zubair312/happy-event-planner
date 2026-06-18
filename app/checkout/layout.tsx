import type { Metadata } from 'next';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://happyeventplanner.vercel.app';

export const metadata: Metadata = {
  title: 'Checkout',
  description:
    'Complete your order from Happy Event Planner Lahore. Pay with JazzCash, EasyPaisa, or Cash on Delivery. Delivery across Lahore — DHA, Gulberg, Johar Town & more.',
  alternates: { canonical: `${SITE_URL}/checkout` },
  robots: { index: false, follow: false },
  openGraph: {
    title: 'Checkout | Happy Event Planner Lahore',
    description: 'Complete your order — pay with JazzCash, EasyPaisa, or Cash on Delivery. Fast delivery across Lahore.',
    url: `${SITE_URL}/checkout`,
  },
};

export default function CheckoutLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
