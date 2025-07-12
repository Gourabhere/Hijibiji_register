
"use client";

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
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
  LogIn,
  Clock,
  Crown
} from 'lucide-react';
import { HijibijiFlatData, BlockName, getTotalFlatsInBlock } from '@/data/flat-data';
import { StatCard } from './stat-card';
import { BlockCard } from './block-card';
import { FloatingActionButton } from './floating-action-button';
import { FlatModal } from './flat-modal';
import { Input } from '@/components/ui/input';
import { Button, buttonVariants } from '@/components/ui/button';
import { getFlatsData, saveFlatDataAction } from '@/app/actions';
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle, SheetClose } from '@/components/ui/sheet';
import { Separator } from '@/components/ui/separator';
import { ThemeToggle } from '../theme-toggle';
import { useToast } from '@/hooks/use-toast';
import { CommitteeCard } from './committee-card';

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
  maintenanceStatus: string;
  registered: boolean;
  registrationStatus: string;
  lastUpdated?: string;
  moveInMonth: string;
  emergencyContactNumber: string;
  parkingAllocation: 'Covered' | 'Open' | 'No Parking' | '';
  bloodGroup: string;
  carNumber: string;
}

export const DashboardClient = ({ isEditable = false }: { isEditable?: boolean }) => {
  const [flatData, setFlatData] = useState<Record<string, FlatData>>({});
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedFlat, setSelectedFlat] = useState<FlatInfo | null>(null);
  const [isClient, setIsClient] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [dbError, setDbError] = useState<string | null>(null);
  const [isOwnerLoggedIn, setIsOwnerLoggedIn] = useState(false);
  const [time, setTime] = useState(new Date());

  const [currentPage, setCurrentPage] = useState(0);
  const [windowWidth, setWindowWidth] = useState(0);

  const blockNames = useMemo(() => Object.keys(HijibijiFlatData) as BlockName[], []);
  
  const router = useRouter();
  const pathname = usePathname();
  const { toast } = useToast();

  const fetchFlatData = useCallback(async () => {
    setIsLoading(true);
    setDbError(null);
    try {
      const data = await getFlatsData();
      setFlatData(data as Record<string, FlatData>);
    } catch (e: any) {
      console.error("Failed to load flat data.", e);
      setDbError(e.message || "An unknown error occurred while fetching data.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    const handleResize = () => setWindowWidth(window.innerWidth);
    
    if (typeof window !== 'undefined') {
        setIsClient(true);
        handleResize();
        window.addEventListener('resize', handleResize);
    }
    
    try {
        const ownerLoggedIn = localStorage.getItem('isOwnerLoggedIn') === 'true';
        setIsOwnerLoggedIn(ownerLoggedIn);
    } catch(e) {
        setIsOwnerLoggedIn(false);
    }

    fetchFlatData();

    return () => {
        clearInterval(timer);
        if (typeof window !== 'undefined') {
            window.removeEventListener('resize', handleResize);
        }
    };
  }, [pathname, router, fetchFlatData]);

  const filteredFlatData = useMemo(() => {
    if (!searchTerm) {
      return flatData;
    }
    const lowercasedFilter = searchTerm.toLowerCase();
    return Object.entries(flatData).reduce((acc, [flatId, data]) => {
      if (
        flatId.toLowerCase().includes(lowercasedFilter) ||
        data.ownerName.toLowerCase().includes(lowercasedFilter) ||
        data.email.toLowerCase().includes(lowercasedFilter)
      ) {
        acc[flatId] = data;
      }
      return acc;
    }, {} as Record<string, FlatData>);
  }, [searchTerm, flatData]);
  
  // --- Pagination Logic ---
  const blocksPerPage = useMemo(() => {
    if (!isClient) return 3; // Default for SSR to avoid layout shift
    if (windowWidth < 768) return 1;    // Mobile (sm)
    if (windowWidth < 1280) return 2;   // Tablet/Laptop (md, lg)
    return 3;                           // Large Desktop (xl)
  }, [isClient, windowWidth]);
  
  const totalPages = Math.ceil(blockNames.length / blocksPerPage);

  const goToNextPage = () => {
    setCurrentPage((prev) => Math.min(prev + 1, totalPages - 1));
  };

  const goToPrevPage = () => {
    setCurrentPage((prev) => Math.max(prev - 1, 0));
  };

  const startIndex = currentPage * blocksPerPage;
  const currentBlocks = useMemo(() => {
    const blocksToDisplay = searchTerm 
      ? blockNames // If searching, show all blocks but filter content inside
      : blockNames.slice(startIndex, startIndex + blocksPerPage);
    
    if (searchTerm) {
      const flatIdsWithResults = Object.keys(filteredFlatData);
      const blocksWithResults = new Set(flatIdsWithResults.map(id => `Block ${id.charAt(0)}`));
      return blockNames.filter(name => blocksWithResults.has(name));
    }
    return blocksToDisplay;
  }, [blockNames, startIndex, blocksPerPage, searchTerm, filteredFlatData]);

  // Reset to first page if screen size changes and current page becomes invalid
  useEffect(() => {
    if (!searchTerm) {
      setCurrentPage(0);
    }
  }, [blocksPerPage, searchTerm]);
  // --- End Pagination Logic ---


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
    const totalRegistered = Object.values(flatData).filter(fd => fd.registered).length;
    return { totalFlats, totalRegistered, totalUnregistered: totalFlats - totalRegistered };
  };

  const stats = getTotalStats();

  const handleFlatClick = (blockName: BlockName, floor: number, flat: string) => {
    const blockNumber = blockName.replace('Block ', '');
    const flatId = `${blockNumber}${flat}${floor}`;
    
    if (isEditable) {
        setSelectedFlat({ blockName, floor, flat, flatId });
        setIsModalOpen(true);
    } else if (isOwnerLoggedIn) {
        const ownerFlatId = localStorage.getItem('ownerFlatId');
        if (flatId === ownerFlatId) {
            router.push('/owner');
        }
    }
  };
  
  const handleSaveFlatData = async (flatId: string, data: FlatData) => {
    setIsSaving(true);
    try {
      await saveFlatDataAction(flatId, data);
      toast({
        title: "Success",
        description: `Flat ${flatId} data has been updated.`
      });
      setIsModalOpen(false);
      await fetchFlatData(); // Re-fetch data to update the UI
    } catch (e: any) {
      toast({
        title: "Error",
        description: `Failed to save data: ${e.message}`,
        variant: "destructive"
      });
    } finally {
      setIsSaving(false);
    }
  };

  if (!isClient) {
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

  const navButtonVariants = {
    initial: { opacity: 0, y: -10 },
    animate: { opacity: 1, y: 0 },
    hover: { scale: 1.05, y: -2, transition: { type: 'spring', stiffness: 300 } },
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 dark:from-slate-900 dark:via-slate-950 dark:to-black font-body">
      <motion.header 
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        className="bg-card/80 backdrop-blur-xl border-b border-border/20 sticky top-0 z-40 shadow-lg"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <div className="flex items-center space-x-4">
              <Link href="/">
                <Image
                  src="https://ik.imagekit.io/gourabhere/1000440858-removebg-preview.png?updatedAt=1752149396514"
                  alt="Society Hub Logo"
                  width={150}
                  height={50}
                  className="object-contain"
                  priority
                />
              </Link>
            </div>
            
            <div className="hidden md:flex items-center space-x-2 bg-muted/50 p-2 rounded-full border border-border/20 shadow-inner">
               <motion.div
                variants={navButtonVariants}
                initial="initial"
                animate="animate"
                whileHover="hover"
              >
                <Button asChild variant="ghost" size="sm" className="space-x-2">
                  <Link href="/dashboard">
                    <Home className="w-4 h-4" />
                    <span>Home</span>
                  </Link>
                </Button>
              </motion.div>
              
              {isEditable ? (
                <motion.div
                  variants={navButtonVariants}
                  initial="initial"
                  animate="animate"
                  whileHover="hover"
                >
                  <Button onClick={handleAdminLogout} variant="ghost" size="sm" className="space-x-2">
                    <LogOut className="w-4 h-4"/>
                    <span>Logout</span>
                  </Button>
                </motion.div>
              ) : (
                <>
                  {isOwnerLoggedIn ? (
                    <>
                      <motion.div variants={navButtonVariants} initial="initial" animate="animate" whileHover="hover">
                        <Button asChild variant="ghost" size="sm" className="space-x-2">
                          <Link href="/owner">
                            <User className="w-4 h-4" />
                            <span>My Dashboard</span>
                          </Link>
                        </Button>
                      </motion.div>
                      <motion.div variants={navButtonVariants} initial="initial" animate="animate" whileHover="hover">
                        <Button onClick={handleOwnerLogout} variant="ghost" size="sm" className="space-x-2">
                          <LogOut className="w-4 h-4" />
                          <span>Logout</span>
                        </Button>
                      </motion.div>
                    </>
                  ) : (
                     <motion.div variants={navButtonVariants} initial="initial" animate="animate" whileHover="hover">
                        <Button asChild variant="ghost" size="sm">
                          <Link href="/login">Login / Sign Up</Link>
                        </Button>
                      </motion.div>
                  )}
                </>
              )}
            </div>

            <div className="hidden md:flex items-center gap-4">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Clock className="w-4 h-4"/>
                    <span>{time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                </div>
                 <motion.button
                    whileHover={{ scale: 1.1, rotate: [0, 15, -10, 15, 0] }}
                    whileTap={{ scale: 0.95 }}
                    transition={{ duration: 0.5 }}
                    className="relative p-2 text-muted-foreground hover:text-foreground transition-colors"
                >
                    <Bell className="w-5 h-5" />
                    <span className="absolute top-1 right-1 w-3 h-3 bg-red-500 rounded-full border-2 border-card animate-pulse"></span>
                </motion.button>
                <ThemeToggle />
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
                   
                    {(isEditable || isOwnerLoggedIn) && (
                      <>
                        <Separator className="my-2" />
                        <Button variant="ghost" onClick={isEditable ? handleAdminLogout : handleOwnerLogout} className="justify-start gap-2">
                            <LogOut className="h-5 w-5" />
                            Logout
                        </Button>
                      </>
                    )}
                    <Separator className="my-2" />
                    <div className="p-2">
                        <ThemeToggle />
                    </div>
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
          <h2 className="text-4xl font-bold text-foreground mb-2 font-headline">
            {isEditable ? 'Admin Control Center' : 'Welcome to Your Society Dashboard'}
          </h2>
          <p className="text-muted-foreground text-lg">
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
            title="Registered"
            value={stats.totalRegistered}
            subtitle={`${(stats.totalFlats > 0 ? (stats.totalRegistered / stats.totalFlats) * 100 : 0).toFixed(1)}% registration rate`}
            color="from-emerald-500 to-emerald-600"
          />
          <StatCard
            icon={Home}
            title="Yet to Register"
            value={stats.totalUnregistered}
            subtitle="Flats pending registration"
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
          className="bg-card/80 backdrop-blur-sm rounded-2xl p-6 mb-8 shadow-lg border border-border/20"
        >
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
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
                className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full"
            />
          </div>
        ) : dbError ? (
          <motion.div 
              key="error"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="bg-red-100/80 dark:bg-red-900/20 border-l-4 border-red-500 text-red-800 dark:text-red-200 p-6 rounded-2xl shadow-lg max-w-2xl mx-auto text-left backdrop-blur-sm"
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
          <div>
              <motion.div
                  className="flex items-stretch justify-center gap-2 sm:gap-4"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3 }}
              >
                  <motion.button 
                      onClick={goToPrevPage} 
                      whileHover={{ scale: 1.1 }} 
                      whileTap={{ scale: 0.9 }}
                      className="p-2 sm:p-3 bg-card/80 rounded-full shadow-lg border border-border/20 backdrop-blur-sm self-center shrink-0 disabled:opacity-50 disabled:cursor-not-allowed"
                      disabled={currentPage === 0 || !!searchTerm}
                      aria-label="Previous page"
                  >
                      <ChevronLeft className="w-6 h-6 text-muted-foreground" />
                  </motion.button>

                  <div className="flex-grow max-w-7xl w-full">
                  <AnimatePresence mode="wait">
                      <motion.div
                          key={currentPage}
                          initial={{ opacity: 0, x: 20 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: -20 }}
                          transition={{ duration: 0.3 }}
                          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-8"
                      >
                      {currentBlocks.map((blockName) => {
                          const blockData = HijibijiFlatData[blockName];
                          return (
                              <BlockCard
                                  key={blockName}
                                  blockName={blockName}
                                  blockData={blockData}
                                  allFlatData={filteredFlatData}
                                  onFlatClick={handleFlatClick}
                              />
                          );
                      })}
                      </motion.div>
                  </AnimatePresence>
                  </div>

                  <motion.button 
                      onClick={goToNextPage} 
                      whileHover={{ scale: 1.1 }} 
                      whileTap={{ scale: 0.9 }}
                      className="p-2 sm:p-3 bg-card/80 rounded-full shadow-lg border border-border/20 backdrop-blur-sm self-center shrink-0 disabled:opacity-50 disabled:cursor-not-allowed"
                      disabled={currentPage >= totalPages - 1 || !!searchTerm}
                      aria-label="Next page"
                  >
                      <ChevronRight className="w-6 h-6 text-muted-foreground" />
                  </motion.button>
              </motion.div>
          </div>
        )}
      </main>

       {isEditable && selectedFlat && (
        <FlatModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          flatInfo={selectedFlat}
          initialData={flatData[selectedFlat.flatId]}
          onSave={handleSaveFlatData}
          isSaving={isSaving}
        />
      )}

      <div className="fixed bottom-6 right-6 flex flex-col gap-4 z-30">
        <CommitteeCard />
      </div>
    </div>
  );
};
