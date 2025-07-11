
'use client';

import dynamic from 'next/dynamic';

// Dynamically import DashboardClient with SSR disabled
export const DynamicDashboard = dynamic(
  () => import('@/components/dashboard/dashboard-client').then(mod => mod.DashboardClient),
  { 
    ssr: false,
    loading: () => (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 flex items-center justify-center">
        <div
          className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"
        />
      </div>
    ),
  }
);
