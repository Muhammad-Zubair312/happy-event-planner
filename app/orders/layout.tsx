import type { Metadata } from 'next';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://happyeventplanner.vercel.app';

export const metadata: Metadata = {
  title: 'My Orders',
  description:
    'Track your Happy Event Planner orders. View order status, delivery updates, and order history for your event decoration purchases in Lahore.',
  alternates: { canonical: `${SITE_URL}/orders` },
  robots: { index: false, follow: false },
  openGraph: {
    title: 'My Orders | Happy Event Planner Lahore',
    description: 'Track your event decoration orders. View order status and delivery updates.',
    url: `${SITE_URL}/orders`,
  },
};

export default function OrdersLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
