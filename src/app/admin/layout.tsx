'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [isAuth, setIsAuth] = useState(false);

  useEffect(() => {
    try {
        const isAdmin = localStorage.getItem('isAdmin') === 'true';
        if (!isAdmin) {
          router.replace('/');
        } else {
          setIsAuth(true);
        }
    } catch (e) {
        router.replace('/');
    }
  }, [router]);

  if (!isAuth) {
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

  return <>{children}</>;
}
