'use client';

import { DynamicDashboard } from '@/components/dashboard/dynamic-dashboard';

export default function DashboardPage() {
  // The main page is the public-facing dashboard.
  // isEditable={false} makes it a read-only view.
  // The DashboardClient component itself will handle showing different options
  // (like a logout button) for logged-in users.
  return <DynamicDashboard isEditable={false} />;
}
