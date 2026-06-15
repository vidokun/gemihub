import type { Metadata } from 'next';
import DashboardShell from '@/components/DashboardShell';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'GemiHub',
  description: 'AI API Gateway & Load Balancer',
};

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <DashboardShell>{children}</DashboardShell>;
}
