import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Admin Dashboard',
  description: 'Happy Event Planner admin panel — manage orders, products, and inventory.',
  robots: { index: false, follow: false, noarchive: true },
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
