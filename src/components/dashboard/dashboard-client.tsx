"use client";

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Building, 
  Users, 
  Home, 
  Settings, 
  Bell, 
  FileText,
  Search,
  Filter
} from 'lucide-react';
import { HijibijiFlatData, BlockName } from '@/data/flat-data';
import { StatCard } from './stat-card';
import { BlockCard } from './block-card';
import { FlatModal } from './flat-modal';
import { FloatingActionButton } from './floating-action-button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

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
  lastUpdated?: string;
}

export const DashboardClient = () => {
  const [selectedFlat, setSelectedFlat] = useState<FlatInfo | null>(null);
  const [flatData, setFlatData] = useState<Record<string, FlatData>>({});
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedBlock, setSelectedBlock] = useState('all');
  const [isClient, setIsClient] = useState(false);
  const [currentTime, setCurrentTime] = useState<Date | null>(null);

  useEffect(() => {
    setIsClient(true);
    setCurrentTime(new Date());
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const getTotalStats = () => {
    const totalFlats = Object.values(HijibijiFlatData).reduce((sum, block) => 
      sum + (block.floors * block.flatsPerFloor.length), 0);
    const totalOccupied = Object.values(HijibijiFlatData).reduce((sum, block) => 
      sum + block.occupiedFlats.length, 0);
    return { totalFlats, totalOccupied, totalVacant: totalFlats - totalOccupied };
  };

  const stats = getTotalStats();

  const isOccupied = (blockName: BlockName, floor: number, flat: string) => {
    return HijibijiFlatData[blockName].occupiedFlats.some(
      occupied => occupied.floor === floor && occupied.flat === flat
    );
  };

  const openFlatModal = (blockName: BlockName, floor: number, flat: string) => {
    const flatId = `${blockName}-${floor}${flat}`;
    setSelectedFlat({ blockName, floor, flat, flatId });
  };

  const saveFlatData = (data: FlatData) => {
    if(!selectedFlat) return;
    const flatId = selectedFlat.flatId;
    setFlatData(prev => ({
      ...prev,
      [flatId]: { ...data, lastUpdated: new Date().toISOString() }
    }));
    setSelectedFlat(null);
  };

  if (!isClient) {
    return null;
  }

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
                <h1 className="text-xl font-bold text-slate-800 font-headline">Hijibiji Society</h1>
                <p className="text-xs text-slate-600">Management Dashboard</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="text-right">
                 {currentTime && (
                  <>
                    <p className="text-sm font-medium text-slate-800">
                      {currentTime.toLocaleTimeString()}
                    </p>
                    <p className="text-xs text-slate-600">
                      {currentTime.toLocaleDateString()}
                    </p>
                  </>
                 )}
              </div>
              
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="relative p-2 text-slate-600 hover:text-slate-800 transition-colors"
              >
                <Bell className="w-5 h-5" />
                <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"></span>
              </motion.button>
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
            Welcome to Your Society Dashboard
          </h2>
          <p className="text-slate-600 text-lg">
            Manage your flats, residents, and society operations seamlessly
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
            subtitle={`${((stats.totalOccupied / stats.totalFlats) * 100).toFixed(1)}% occupancy`}
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
            <div className="relative">
              <Select value={selectedBlock} onValueChange={setSelectedBlock}>
                <SelectTrigger className="w-full sm:w-[180px] h-12 rounded-xl">
                  <div className="flex items-center gap-2">
                    <Filter className="w-5 h-5 text-slate-400" />
                    <SelectValue placeholder="Select Block" />
                  </div>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Blocks</SelectItem>
                  {Object.keys(HijibijiFlatData).map(block => (
                    <SelectItem key={block} value={block}>{block}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="grid grid-cols-1 lg:grid-cols-2 gap-8"
        >
          {Object.entries(HijibijiFlatData)
            .filter(([blockName]) => selectedBlock === 'all' || selectedBlock === blockName)
            .map(([blockName, data], index) => (
              <motion.div
                key={blockName}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 * index }}
              >
                <BlockCard 
                  blockName={blockName as BlockName} 
                  blockData={data} 
                  isOccupied={isOccupied}
                  onFlatClick={openFlatModal}
                />
              </motion.div>
            ))}
        </motion.div>
      </main>

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

      <FlatModal 
        isOpen={!!selectedFlat}
        onClose={() => setSelectedFlat(null)}
        flatInfo={selectedFlat}
        flatData={selectedFlat ? flatData[selectedFlat.flatId] : undefined}
        onSave={saveFlatData}
      />
    </div>
  );
};
