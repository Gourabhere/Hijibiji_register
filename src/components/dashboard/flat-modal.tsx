
"use client";

import React, { useState, useEffect, useTransition } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  User,
  Phone,
  Mail,
  Users,
  CheckCircle,
  Building,
  Home,
  Settings,
  ShieldAlert,
  Car,
  HeartPulse,
  CalendarDays,
  MessageSquare
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import type { FlatInfo, FlatData } from './dashboard-client';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { YearMonthSelector } from './year-month-selector';
import { cn } from '@/lib/utils';
import { Checkbox } from '@/components/ui/checkbox';


interface FlatModalProps {
  isOpen: boolean;
  onClose: () => void;
  flatInfo: FlatInfo | null;
  initialData?: FlatData;
  onSave: (flatId: string, data: FlatData) => Promise<void>;
}

const bloodGroups = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
const maintenanceStatusOptions: FlatData['maintenanceStatus'][] = ['paid', 'pending', 'overdue'];
const parkingOptions: FlatData['parkingAllocation'][] = ['Covered', 'Open', 'No Parking'];

export function FlatModal({ isOpen, onClose, flatInfo, initialData, onSave }: FlatModalProps) {
  const [isPending, startTransition] = useTransition();
  const [activeTab, setActiveTab] = useState('personal');
  const [isMonthSelectorOpen, setIsMonthSelectorOpen] = useState(false);
  const [formData, setFormData] = useState<FlatData>({
    ownerName: '',
    contactNumber: '',
    email: '',
    familyMembers: '',
    issues: '',
    maintenanceStatus: 'pending',
    registered: false,
    moveInMonth: '',
    emergencyContactNumber: '',
    parkingAllocation: '',
    bloodGroup: '',
  });

  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
    } else {
      setFormData({
        ownerName: '', contactNumber: '', email: '', familyMembers: '', issues: '',
        maintenanceStatus: 'pending', registered: false, moveInMonth: '',
        emergencyContactNumber: '', parkingAllocation: '', bloodGroup: ''
      });
    }
  }, [initialData]);

  if (!flatInfo) return null;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { id, value } = e.target;
    setFormData(prev => ({ ...prev, [id]: value }));
  };

  const handleSelectChange = (id: keyof FlatData, value: string) => {
    setFormData(prev => ({ ...prev, [id]: value as any }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    startTransition(async () => {
      await onSave(flatInfo.flatId, formData);
      onClose();
    });
  };

  const containerVariants = {
    hidden: { opacity: 0, scale: 0.95, y: 20 },
    visible: {
      opacity: 1,
      scale: 1,
      y: 0,
      transition: {
        type: "spring",
        stiffness: 400,
        damping: 30,
        staggerChildren: 0.05
      }
    },
    exit: { opacity: 0, scale: 0.95, y: 20, transition: { duration: 0.2 } }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { type: 'spring', stiffness: 100 } }
  };

  const tabVariants = {
    inactive: { scale: 0.95, opacity: 0.7 },
    active: { scale: 1, opacity: 1 }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          key="flat-modal"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
          onClick={onClose}
        >
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="relative w-full max-w-4xl max-h-[90vh] flex flex-col bg-card/90 dark:bg-slate-900/90 backdrop-blur-xl rounded-3xl shadow-2xl border border-border/20"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <motion.div
              variants={itemVariants}
              className="relative px-8 py-6 text-white"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-primary via-purple-600 to-indigo-600 rounded-t-3xl opacity-90"></div>
              <div className="absolute inset-0 bg-black/10"></div>
              <div className="relative flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm shadow-lg">
                    <Building className="w-8 h-8" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold font-headline">{flatInfo.blockName} - Flat {flatInfo.flat}{flatInfo.floor}</h2>
                    <p className="text-primary-foreground/80 text-sm">Floor {flatInfo.floor} • Flat ID: {flatInfo.flatId}</p>
                  </div>
                </div>
                <motion.button
                  whileHover={{ scale: 1.1, rotate: 90 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={onClose}
                  className="p-2 hover:bg-white/20 rounded-full transition-colors"
                  aria-label="Close modal"
                >
                  <X className="w-6 h-6" />
                </motion.button>
              </div>
            </motion.div>

            {/* Tab Navigation */}
            <motion.div
              variants={itemVariants}
              className="flex border-b border-border bg-card/80 backdrop-blur-sm px-8"
            >
              {[
                { id: 'personal', label: 'Personal Details', icon: User },
                { id: 'residence', label: 'Residence Info', icon: Home },
                { id: 'maintenance', label: 'Maintenance', icon: Settings }
              ].map((tab) => (
                <motion.button
                  key={tab.id}
                  variants={tabVariants}
                  animate={activeTab === tab.id ? 'active' : 'inactive'}
                  whileHover={{ scale: 1.05 }}
                  onClick={() => setActiveTab(tab.id)}
                  className={`relative flex items-center space-x-2 px-6 py-4 font-medium transition-all text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:z-10 ${
                    activeTab === tab.id
                      ? 'text-primary'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  <tab.icon className="w-4 h-4" />
                  <span>{tab.label}</span>
                   {activeTab === tab.id && (
                     <motion.div
                        className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary"
                        layoutId="underline"
                      />
                   )}
                </motion.button>
              ))}
            </motion.div>

            {/* Content */}
            <div className="p-8 flex-grow overflow-y-auto">
              <AnimatePresence mode="wait">
                  <motion.div
                    key={activeTab}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                  >
                  {activeTab === 'personal' && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div><Label htmlFor="ownerName" className="flex items-center gap-2 mb-2"><User className="w-4 h-4" />Owner Name</Label><Input id="ownerName" value={formData.ownerName} onChange={handleInputChange} /></div>
                          <div><Label htmlFor="contactNumber" className="flex items-center gap-2 mb-2"><Phone className="w-4 h-4" />Contact Number</Label><Input id="contactNumber" type="tel" value={formData.contactNumber} onChange={handleInputChange} /></div>
                          <div><Label htmlFor="email" className="flex items-center gap-2 mb-2"><Mail className="w-4 h-4" />Email Address</Label><Input id="email" type="email" value={formData.email} onChange={handleInputChange} /></div>
                          <div><Label htmlFor="emergencyContactNumber" className="flex items-center gap-2 text-destructive mb-2"><ShieldAlert className="w-4 h-4" />Emergency Contact</Label><Input id="emergencyContactNumber" type="tel" value={formData.emergencyContactNumber} onChange={handleInputChange} /></div>
                      </div>
                  )}

                  {activeTab === 'residence' && (
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div><Label htmlFor="familyMembers" className="flex items-center gap-2 mb-2"><Users className="w-4 h-4"/>Family Members</Label><Input id="familyMembers" value={formData.familyMembers} onChange={handleInputChange} placeholder="e.g. 2 Adults, 1 Child" /></div>
                          <div>
                            <Label htmlFor="bloodGroup" className="flex items-center gap-2 mb-2"><HeartPulse className="w-4 h-4"/>Blood Group</Label>
                            <Select value={formData.bloodGroup} onValueChange={(v) => handleSelectChange('bloodGroup', v)}>
                                <SelectTrigger><SelectValue placeholder="Select Blood Group" /></SelectTrigger>
                                <SelectContent>{bloodGroups.map(group => <SelectItem key={group} value={group}>{group}</SelectItem>)}</SelectContent>
                            </Select>
                          </div>
                          <div>
                            <Label htmlFor="moveInMonth" className="flex items-center gap-2 mb-2"><CalendarDays className="w-4 h-4" />Move In Month</Label>
                             <Button type="button" variant={"outline"} onClick={() => setIsMonthSelectorOpen(true)} className={cn("w-full justify-start text-left font-normal", !formData.moveInMonth && "text-muted-foreground")}>
                                <CalendarDays className="mr-2 h-4 w-4" />
                                {formData.moveInMonth ? formData.moveInMonth : <span>Pick a month</span>}
                            </Button>
                          </div>
                          <div>
                              <Label htmlFor="parkingAllocation" className="flex items-center gap-2 mb-2"><Car className="w-4 h-4"/>Parking Allocation</Label>
                              <Select value={formData.parkingAllocation} onValueChange={(v: any) => handleSelectChange('parkingAllocation', v)}>
                                  <SelectTrigger><SelectValue placeholder="Select Parking" /></SelectTrigger>
                                  <SelectContent>{parkingOptions.map((p, i) => <SelectItem key={i} value={p}>{p}</SelectItem>)}</SelectContent>
                              </Select>
                          </div>
                     </div>
                  )}

                  {activeTab === 'maintenance' && (
                      <div className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
                            <div>
                                <Label htmlFor="maintenanceStatus" className="flex items-center gap-2 mb-2"><Settings className="w-4 h-4"/>Maintenance Status</Label>
                                <Select value={formData.maintenanceStatus} onValueChange={(v: any) => handleSelectChange('maintenanceStatus', v)}>
                                    <SelectTrigger><Badge variant={
                                        formData.maintenanceStatus === 'paid' ? 'default' :
                                        formData.maintenanceStatus === 'overdue' ? 'destructive' :
                                        'secondary'
                                    }>{formData.maintenanceStatus.charAt(0).toUpperCase() + formData.maintenanceStatus.slice(1)}</Badge></SelectTrigger>
                                    <SelectContent>{maintenanceStatusOptions.map(s => <SelectItem key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</SelectItem>)}</SelectContent>
                                </Select>
                            </div>
                            <div className="flex items-center space-x-3 pt-6">
                                <Checkbox id="registered" checked={formData.registered} onCheckedChange={(c) => handleSelectChange('registered', c as any)} />
                                <Label htmlFor="registered" className="font-medium flex items-center gap-2">
                                  <CheckCircle className={cn("w-4 h-4", formData.registered ? "text-green-500" : "text-muted-foreground")}/>
                                  Flat Registered
                                </Label>
                            </div>
                        </div>
                        <div>
                            <Label htmlFor="issues" className="flex items-center gap-2 mb-2"><MessageSquare className="w-4 h-4"/>Issues / Complaints</Label>
                            <Textarea id="issues" value={formData.issues} onChange={handleInputChange} placeholder="Report any issues..." rows={4}/>
                        </div>
                      </div>
                  )}
                  </motion.div>
              </AnimatePresence>
            </div>

            {/* Footer */}
            <motion.div
              variants={itemVariants}
              className="flex justify-between items-center px-8 py-5 border-t border-border bg-card/80 backdrop-blur-sm rounded-b-3xl"
            >
              <div className="text-sm text-muted-foreground">
                Last updated: {formData.lastUpdated ? new Date(formData.lastUpdated).toLocaleString() : 'Never'}
              </div>
              <div className="flex space-x-4">
                <Button
                  variant="outline"
                  onClick={onClose}
                  className="px-6 py-3 rounded-xl font-medium"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleSubmit}
                  disabled={isPending}
                  className="px-6 py-3 bg-gradient-to-r from-primary to-purple-600 text-primary-foreground rounded-xl hover:opacity-90 transition-all font-medium shadow-lg"
                >
                  {isPending ? 'Saving...' : 'Save Changes'}
                </Button>
              </div>
            </motion.div>
          </motion.div>
        </motion.div>
      )}
      <div key="year-month-selector">
        <YearMonthSelector
            isOpen={isMonthSelectorOpen}
            onClose={() => setIsMonthSelectorOpen(false)}
            value={formData.moveInMonth}
            onSelect={(value) => {
              handleSelectChange('moveInMonth', value);
              setIsMonthSelectorOpen(false);
            }}
          />
      </div>
    </AnimatePresence>
  );
}
