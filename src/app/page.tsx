'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { DashboardClient } from '@/components/dashboard/dashboard-client';
import { motion } from 'framer-motion';

export default function Home() {
  const router = useRouter();
  const [isAuthChecked, setIsAuthChecked] = useState(false);
  const [isOwner, setIsOwner] = useState(false);

  useEffect(() => {
    try {
      const ownerLoggedIn = localStorage.getItem('isOwnerLoggedIn') === 'true';
      if (ownerLoggedIn) {
        setIsOwner(true);
        router.replace('/owner');
      }
    } catch (e) {
      // localStorage not available, proceed to show public page
    } finally {
        setIsAuthChecked(true);
    }
  }, [router]);

  // Show a loading spinner while checking auth status or during redirection
  if (!isAuthChecked || isOwner) {
    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 flex items-center justify-center">
            <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full"
            />
        </div>
    );
  }

  // If not an owner, show the public dashboard
  return <DashboardClient isEditable={false} />;
}
