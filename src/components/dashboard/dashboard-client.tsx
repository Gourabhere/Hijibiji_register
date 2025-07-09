
"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { 
  Building, 
  Users, 
  Home, 
  Settings, 
  Bell, 
  FileText,
  Search,
  ChevronLeft,
  ChevronRight,
  LogOut,
  AlertTriangle,
  User,
  Menu,
  LogIn
} from 'lucide-react';
import { HijibijiFlatData, BlockName, getTotalFlatsInBlock } from '@/data/flat-data';
import { StatCard } from './stat-card';
import { BlockCard } from './block-card';
import { FlatModal } from './flat-modal';
import { FloatingActionButton } from './floating-action-button';
import { Input } from '@/components/ui/input';
import { Button, buttonVariants } from '@/components/ui/button';
import { getFlatsData, saveFlatDataAction } from '@/app/actions';
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle, SheetClose } from '@/components/ui/sheet';
import { Separator } from '@/components/ui/separator';


export type FlatInfo = {
  blockName: BlockName;
  floor: number;
  flat: string;
  flatId: string;
}

export type FlatData = {
  ownerName: string;
  contactNumber: string;
  email: string;
  familyMembers: string;
  issues: string;
  maintenanceStatus: 'paid' | 'pending' | 'overdue';
  registered: boolean;
  lastUpdated?: string;
}

export const DashboardClient = ({ isEditable = false }: { isEditable?: boolean }) => {
  const [selectedFlat, setSelectedFlat] = useState<FlatInfo | null>(null);
  const [flatData, setFlatData] = useState<Record<string, FlatData>>({});
  const [searchTerm, setSearchTerm] = useState('');
  const [isClient, setIsClient] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [dbError, setDbError] = useState<string | null>(null);
  const [currentTime, setCurrentTime] = useState<Date | null>(null);
  const [isOwnerLoggedIn, setIsOwnerLoggedIn] = useState(false);

  const [currentBlockIndex, setCurrentBlockIndex] = useState(0);
  const blockNames = Object.keys(HijibijiFlatData) as BlockName[];
  
  const router = useRouter();
  const pathname = usePathname();

  const fetchFlatData = useCallback(async () => {
    setIsLoading(true);
    setDbError(null);
    try {
      const data = await getFlatsData();
      setFlatData(data);
    } catch (e: any) {
      console.error("Failed to load flat data.", e);
      setDbError(e.message || "An unknown error occurred while fetching data.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    setIsClient(true);
    setCurrentTime(new Date());
    
    try {
        const ownerLoggedIn = localStorage.getItem('isOwnerLoggedIn') === 'true';
        const isAdminLoggedIn = localStorage.getItem('isAdmin') === 'true';
        setIsOwnerLoggedIn(ownerLoggedIn);

    } catch(e) {
        setIsOwnerLoggedIn(false);
    }

    const timer = setInterval(() => setCurrentTime(new Date()), 60000);
    
    fetchFlatData();

    return () => clearInterval(timer);
  }, [pathname, router, fetchFlatData]);

  const handleAdminLogout = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('isAdmin');
      router.push('/');
    }
  };

  const handleOwnerLogout = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('isOwnerLoggedIn');
      localStorage.removeItem('ownerFlatId');
      setIsOwnerLoggedIn(false);
      router.push('/');
    }
  };

  const getTotalStats = () => {
    const totalFlats = Object.values(HijibijiFlatData).reduce((sum, blockData) => {
        return sum + getTotalFlatsInBlock(blockData);
    }, 0);
    const totalOccupied = Object.values(flatData).filter(fd => fd.registered).length;
    return { totalFlats, totalOccupied, totalVacant: totalFlats - totalOccupied };
  };

  const stats = getTotalStats();

  const openFlatModal = (blockName: BlockName, floor: number, flat: string) => {
    const blockNumber = blockName.replace('Block ', '');
    const flatId = `${blockNumber}${flat}${floor}`;
    
    if (isOwnerLoggedIn) {
        const ownerFlatId = localStorage.getItem('ownerFlatId');
        if (flatId === ownerFlatId) {
            router.push('/owner');
            return;
        }
    }

    setSelectedFlat({ blockName, floor, flat, flatId });
  };

  const saveFlatData = async (data: FlatData) => {
    if(!selectedFlat) return;
    const flatId = selectedFlat.flatId;
    const dataToSave = { ...data, lastUpdated: new Date().toISOString() };
    
    setSelectedFlat(null);

    try {
        await saveFlatDataAction(flatId, dataToSave);
        // Re-fetch on success to ensure data is in sync with the source of truth
        await fetchFlatData();
    } catch (e: any) {
        console.error("Failed to save flat data. Reverting UI.", e);
        setDbError(e.message || "Failed to save data. Please check your connection and permissions.");
        // Re-fetch even on failure to get the true state back
        await fetchFlatData();
    }
  };

  const goToNextBlock = () => {
    setCurrentBlockIndex((prevIndex) => (prevIndex + 1) % blockNames.length);
  };

  const goToPrevBlock = () => {
    setCurrentBlockIndex((prevIndex) => (prevIndex - 1 + blockNames.length) % blockNames.length);
  };

  if (!isClient) {
    return null;
  }
  
  const currentBlockName = blockNames[currentBlockIndex];
  const currentBlockData = HijibijiFlatData[currentBlockName];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 font-body">
      <motion.header 
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        className="bg-white/80 backdrop-blur-lg border-b border-white/20 sticky top-0 z-40"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-full flex items-center justify-center">
                <Building className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-slate-800 font-headline">
                  {isEditable ? 'Hijibiji Society - Admin' : 'Hijibiji Society'}
                </h1>
                <p className="text-xs text-slate-600">
                  {isEditable ? 'Full Control Panel' : 'Management Dashboard'}
                </p>
              </div>
            </div>
            
            <div className="hidden md:flex items-center space-x-2">
              <Button asChild variant="ghost" size="sm" className="space-x-2">
                <Link href="/dashboard">
                  <Home className="w-4 h-4" />
                  <span>Home</span>
                </Link>
              </Button>
              <div className="text-right hidden sm:block">
                 {currentTime && (
                  <>
                    <p className="text-sm font-medium text-slate-800">
                      {currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                    <p className="text-xs text-slate-600">
                      {currentTime.toLocaleDateString()}
                    </p>
                  </>
                 )}
              </div>
              
              {isEditable ? (
                <Button onClick={handleAdminLogout} variant="ghost" size="sm" className="space-x-2">
                  <LogOut className="w-4 h-4"/>
                  <span>Logout</span>
                </Button>
              ) : (
                <>
                  {isOwnerLoggedIn ? (
                    <>
                      <Button asChild variant="ghost" size="sm" className="space-x-2">
                        <Link href="/owner">
                          <User className="w-4 h-4" />
                          <span>My Dashboard</span>
                        </Link>
                      </Button>
                      <Button onClick={handleOwnerLogout} variant="ghost" size="sm" className="space-x-2">
                        <LogOut className="w-4 h-4" />
                        <span>Logout</span>
                      </Button>
                    </>
                  ) : (
                    <Button asChild variant="ghost" size="sm">
                      <Link href="/login">Login / Sign Up</Link>
                    </Button>
                  )}
                </>
              )}


              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="relative p-2 text-slate-600 hover:text-slate-800 transition-colors"
              >
                <Bell className="w-5 h-5" />
                <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"></span>
              </motion.button>
            </div>

            <div className="md:hidden">
              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <Menu className="h-6 w-6" />
                    <span className="sr-only">Open Menu</span>
                  </Button>
                </SheetTrigger>
                <SheetContent className="w-[280px] sm:w-[320px]">
                  <SheetHeader>
                    <SheetTitle>Menu</SheetTitle>
                  </SheetHeader>
                  <nav className="flex flex-col gap-2 mt-4">
                    <SheetClose asChild>
                      <Link href="/dashboard" className={buttonVariants({ variant: "ghost", className: "justify-start gap-2" })}>
                        <Home className="h-5 w-5" />
                        <span>Home</span>
                      </Link>
                    </SheetClose>

                    {isOwnerLoggedIn && (
                      <SheetClose asChild>
                          <Link href="/owner" className={buttonVariants({ variant: "ghost", className: "justify-start gap-2" })}>
                              <User className="h-5 w-5" />
                              My Flat
                          </Link>
                      </SheetClose>
                    )}

                    {!isEditable && !isOwnerLoggedIn && (
                      <SheetClose asChild>
                        <Link href="/login" className={buttonVariants({ variant: "ghost", className: "justify-start gap-2" })}>
                          <LogIn className="h-5 w-5" />
                          Login / Sign Up
                        </Link>
                      </SheetClose>
                    )}

                    <Separator className="my-2" />
                    
                    <Button variant="ghost" onClick={() => alert('Notifications feature coming soon!')} className="justify-start gap-2">
                        <Bell className="h-5 w-5" />
                        Notifications
                    </Button>
                    <Button variant="ghost" onClick={() => alert('Reports feature coming soon!')} className="justify-start gap-2">
                        <FileText className="h-5 w-5" />
                        Reports
                    </Button>
                    <Button variant="ghost" onClick={() => alert('Settings feature coming soon!')} className="justify-start gap-2">
                        <Settings className="h-5 w-5" />
                        Settings
                    </Button>

                    {(isEditable || isOwnerLoggedIn) && (
                      <>
                        <Separator className="my-2" />
                        <Button variant="ghost" onClick={isEditable ? handleAdminLogout : handleOwnerLogout} className="justify-start gap-2">
                            <LogOut className="h-5 w-5" />
                            Logout
                        </Button>
                      </>
                    )}
                  </nav>
                </SheetContent>
              </Sheet>
            </div>
          </div>
        </div>
      </motion.header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h2 className="text-4xl font-bold text-slate-800 mb-2 font-headline">
            {isEditable ? 'Admin Control Center' : 'Welcome to Your Society Dashboard'}
          </h2>
          <p className="text-slate-600 text-lg">
            {isEditable ? 'View and manage all flats and resident information.' : 'Manage your flats, residents, and society operations seamlessly'}
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
        >
          <StatCard
            icon={Home}
            title="Total Flats"
            value={stats.totalFlats}
            subtitle="Across 6 blocks"
            color="from-blue-500 to-blue-600"
          />
          <StatCard
            icon={Users}
            title="Occupied"
            value={stats.totalOccupied}
            subtitle={`${(stats.totalFlats > 0 ? (stats.totalOccupied / stats.totalFlats) * 100 : 0).toFixed(1)}% occupancy`}
            color="from-emerald-500 to-emerald-600"
          />
          <StatCard
            icon={Home}
            title="Vacant"
            value={stats.totalVacant}
            subtitle="Available for rent"
            color="from-amber-500 to-amber-600"
          />
          <StatCard
            icon={Building}
            title="Blocks"
            value="6"
            subtitle="Total buildings"
            color="from-purple-500 to-purple-600"
          />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 mb-8 shadow-lg border border-white/20"
        >
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <Input
                type="text"
                placeholder="Search by owner name, flat number..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 h-12 rounded-xl"
              />
            </div>
          </div>
        </motion.div>
        
        {isLoading ? (
          <div className="flex justify-center items-center h-[400px]">
            <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full"
            />
          </div>
        ) : dbError ? (
          <motion.div 
              key="error"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="bg-red-100/80 border-l-4 border-red-500 text-red-800 p-6 rounded-2xl shadow-lg max-w-2xl mx-auto text-left backdrop-blur-sm"
          >
              <div className="flex">
                  <div className="py-1">
                      <AlertTriangle className="w-6 h-6 text-red-500 mr-4" />
                  </div>
                  <div>
                      <p className="font-bold text-lg font-headline">Database Connection Error</p>
                      <p className="text-sm mt-1">{dbError}</p>
                  </div>
              </div>
          </motion.div>
        ) : (
          <>
            {/* Mobile Carousel View */}
            <motion.div
              className="flex items-center justify-center gap-4 md:hidden"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              <motion.button 
                  onClick={goToPrevBlock} 
                  whileHover={{ scale: 1.1 }} 
                  whileTap={{ scale: 0.9 }}
                  className="p-3 bg-white/80 rounded-full shadow-lg border border-white/20 backdrop-blur-sm"
              >
                  <ChevronLeft className="w-6 h-6 text-slate-600" />
              </motion.button>
              <div className="flex-grow max-w-2xl w-full">
                <AnimatePresence mode="wait">
                  <motion.div
                      key={currentBlockIndex}
                      initial={{ opacity: 0, x: 50 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -50 }}
                      transition={{ duration: 0.3 }}
                      className="w-full"
                  >
                      <BlockCard 
                          blockName={currentBlockName} 
                          blockData={currentBlockData} 
                          allFlatData={flatData}
                          onFlatClick={openFlatModal}
                      />
                  </motion.div>
                </AnimatePresence>
              </div>
              <motion.button 
                  onClick={goToNextBlock} 
                  whileHover={{ scale: 1.1 }} 
                  whileTap={{ scale: 0.9 }}
                  className="p-3 bg-white/80 rounded-full shadow-lg border border-white/20 backdrop-blur-sm"
              >
                  <ChevronRight className="w-6 h-6 text-slate-600" />
              </motion.button>
            </motion.div>

            {/* Desktop Grid View */}
            <motion.div
              className="hidden md:grid md:grid-cols-2 lg:grid-cols-3 gap-8"
              initial="hidden"
              animate="visible"
              variants={{
                visible: {
                  opacity: 1,
                  y: 0,
                  transition: {
                    delay: 0.3,
                    when: "beforeChildren",
                    staggerChildren: 0.1,
                  }
                },
                hidden: { opacity: 0, y: 20 },
              }}
            >
              {blockNames.map((blockName) => {
                  const blockData = HijibijiFlatData[blockName];
                  return (
                      <BlockCard
                          key={blockName}
                          blockName={blockName}
                          blockData={blockData}
                          allFlatData={flatData}
                          onFlatClick={openFlatModal}
                      />
                  );
              })}
            </motion.div>
          </>
        )}
      </main>

      
      <FlatModal 
        key={selectedFlat?.flatId}
        isOpen={!!selectedFlat}
        onClose={() => setSelectedFlat(null)}
        flatInfo={selectedFlat}
        flatData={selectedFlat ? flatData[selectedFlat.flatId] : undefined}
        onSave={saveFlatData}
        isEditable={isEditable}
      />
        

      {isEditable && (
        <div className="fixed bottom-6 right-6 flex flex-col gap-4 z-30">
          <FloatingActionButton
            icon={Bell}
            onClick={() => alert('Notifications feature coming soon!')}
            className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700"
            tooltip="Notifications"
          />
          <FloatingActionButton
            icon={FileText}
            onClick={() => alert('Reports feature coming soon!')}
            className="bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700"
            tooltip="Generate Reports"
          />
          <FloatingActionButton
            icon={Settings}
            onClick={() => alert('Settings feature coming soon!')}
            className="bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700"
            tooltip="Settings"
          />
        </div>
      )}
    </div>
  );
};
