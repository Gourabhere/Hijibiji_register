
'use client';

import { DashboardClient } from '@/components/dashboard/dashboard-client';

export default function Home() {
  // The main page is the public-facing dashboard.
  // isEditable={false} makes it a read-only view.
  // The DashboardClient component itself will handle showing different options
  // (like a logout button) for logged-in users.
  return <DashboardClient isEditable={false} />;
}
