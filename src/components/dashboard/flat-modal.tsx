
"use client";

import React, { useState, useEffect, useTransition } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, User, Phone, Mail, Users, MessageSquare, Wrench, CalendarDays, ShieldAlert, Car, HeartPulse } from 'lucide-react';
import type { FlatInfo, FlatData } from './dashboard-client';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { YearMonthSelector } from './year-month-selector';

interface FlatModalProps {
    isOpen: boolean;
    onClose: () => void;
    flatInfo: FlatInfo | null;
    flatData?: FlatData;
    onSave: (data: FlatData) => void;
    isEditable?: boolean;
}

const initialFormData: FlatData = {
    ownerName: '',
    contactNumber: '',
    email: '',
    familyMembers: '',
    issues: '',
    maintenanceStatus: 'paid',
    registered: false,
    moveInMonth: '',
    emergencyContactNumber: '',
    parkingAllocation: '',
    bloodGroup: '',
};

const bloodGroups = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

export function FlatModal({ isOpen, onClose, flatInfo, flatData, onSave, isEditable = false }: FlatModalProps) {
    const [formData, setFormData] = useState<FlatData>(initialFormData);
    const [isPending, startTransition] = useTransition();
    const [isMonthSelectorOpen, setIsMonthSelectorOpen] = useState(false);

    useEffect(() => {
        if (flatInfo) {
            setFormData({ ...initialFormData, ...(flatData || {}) });
        }
    }, [flatInfo, flatData]);

    const handleSelectChange = (id: keyof FlatData, value: string) => {
        setFormData(prev => ({ ...prev, [id]: value }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        startTransition(() => {
            onSave(formData);
        });
    };

    if (!isOpen || !flatInfo) return null;

    return (
      <>
        <AnimatePresence>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-card rounded-3xl p-8 max-w-lg w-full max-h-[90vh] overflow-y-auto shadow-2xl"
            >
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-foreground font-headline">
                    {flatInfo.blockName} - Flat {flatInfo.flat}
                  </h2>
                  <p className="text-muted-foreground">
                    Floor {flatInfo.floor} &bull; Flat ID: {flatInfo.flatId}
                  </p>
                  {formData.ownerName && (
                    <div className="flex items-center text-muted-foreground text-sm mt-2">
                      <User className="w-4 h-4 mr-2" />
                      <span>{formData.ownerName}</span>
                    </div>
                  )}
                </div>
                <button
                  onClick={onClose}
                  className="p-2 hover:bg-accent rounded-full transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="ownerName" className="flex items-center"><User className="w-4 h-4 mr-2" />Owner Name</Label>
                      <Input id="ownerName" type="text" value={formData.ownerName} onChange={(e) => setFormData({...formData, ownerName: e.target.value})} className="rounded-xl" placeholder="Enter owner name" disabled={!isEditable} />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="contactNumber" className="flex items-center"><Phone className="w-4 h-4 mr-2" />Contact Number</Label>
                      <Input id="contactNumber" type="tel" value={formData.contactNumber} onChange={(e) => setFormData({...formData, contactNumber: e.target.value})} className="rounded-xl" placeholder="Enter contact number" disabled={!isEditable} />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email" className="flex items-center"><Mail className="w-4 h-4 mr-2" />Email Address</Label>
                      <Input id="email" type="email" value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} className="rounded-xl" placeholder="Enter email address" disabled={!isEditable} />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="emergencyContactNumber" className="flex items-center"><ShieldAlert className="w-4 h-4 mr-2 text-destructive"/>Emergency Contact</Label>
                        <Input id="emergencyContactNumber" type="tel" value={formData.emergencyContactNumber} onChange={(e) => setFormData({...formData, emergencyContactNumber: e.target.value})} className="rounded-xl" placeholder="Emergency number" disabled={!isEditable}/>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="familyMembers" className="flex items-center"><Users className="w-4 h-4 mr-2" />Family Members</Label>
                      <Input id="familyMembers" type="text" value={formData.familyMembers} onChange={(e) => setFormData({...formData, familyMembers: e.target.value})} className="rounded-xl" placeholder="e.g., 2 Adults, 1 Child" disabled={!isEditable} />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="bloodGroup" className="flex items-center"><HeartPulse className="w-4 h-4 mr-2" />Blood Group</Label>
                        <Select value={formData.bloodGroup} onValueChange={(v) => handleSelectChange('bloodGroup', v)} disabled={!isEditable}>
                            <SelectTrigger className="rounded-xl"><SelectValue placeholder="Select group..." /></SelectTrigger>
                            <SelectContent>
                                {bloodGroups.map(group => <SelectItem key={group} value={group}>{group}</SelectItem>)}
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="moveInMonth" className="flex items-center"><CalendarDays className="w-4 h-4 mr-2" />Move In Month</Label>
                      <Button
                          type="button"
                          variant={"outline"}
                          onClick={() => setIsMonthSelectorOpen(true)}
                          className={cn(
                              "w-full justify-start text-left font-normal rounded-xl",
                              !formData.moveInMonth && "text-muted-foreground"
                          )}
                          disabled={!isEditable}
                      >
                          <CalendarDays className="mr-2 h-4 w-4" />
                          {formData.moveInMonth ? formData.moveInMonth : <span>Pick a month</span>}
                      </Button>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="parkingAllocation" className="flex items-center"><Car className="w-4 h-4 mr-2" />Parking Allocation</Label>
                      <Select value={formData.parkingAllocation} onValueChange={(v: any) => handleSelectChange('parkingAllocation', v)} disabled={!isEditable}>
                          <SelectTrigger id="parkingAllocation" className="rounded-xl"><SelectValue placeholder="Select status" /></SelectTrigger>
                          <SelectContent>
                              <SelectItem value="Covered">Covered</SelectItem>
                              <SelectItem value="Open">Open</SelectItem>
                              <SelectItem value="No Parking">No Parking</SelectItem>
                          </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="maintenanceStatus" className="flex items-center"><Wrench className="w-4 h-4 mr-2" />Maintenance Status</Label>
                        <Select value={formData.maintenanceStatus} onValueChange={(value: 'paid' | 'pending' | 'overdue') => setFormData({...formData, maintenanceStatus: value})} disabled={!isEditable}>
                            <SelectTrigger id="maintenanceStatus" className="rounded-xl"><SelectValue placeholder="Select status" /></SelectTrigger>
                            <SelectContent>
                            <SelectItem value="paid">Paid</SelectItem>
                            <SelectItem value="pending">Pending</SelectItem>
                            <SelectItem value="overdue">Overdue</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                <div className="space-y-2 pt-2">
                  <Label htmlFor="issues" className="flex items-center"><MessageSquare className="w-4 h-4 mr-2" />Issues/Complaints</Label>
                  <Textarea
                    id="issues"
                    value={formData.issues}
                    onChange={(e) => setFormData({...formData, issues: e.target.value})}
                    className="rounded-xl"
                    rows={3}
                    placeholder="Any issues or complaints..."
                    disabled={!isEditable}
                  />
                </div>

                <div className="flex items-center space-x-2 pt-2">
                  <Checkbox 
                    id="registered" 
                    checked={formData.registered} 
                    onCheckedChange={(checked) => {
                      startTransition(() => {
                          setFormData({ ...formData, registered: !!checked });
                      });
                    }}
                    disabled={!isEditable}
                  />
                  <Label htmlFor="registered">Registered</Label>
                </div>

                {isEditable && (
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    type="submit"
                    disabled={isPending}
                    className="w-full bg-gradient-to-r from-primary to-accent text-primary-foreground py-3 px-6 rounded-xl font-medium shadow-lg hover:shadow-xl transition-all duration-300 mt-4 disabled:opacity-50"
                  >
                    {isPending ? 'Saving...' : 'Save Details'}
                  </motion.button>
                )}
                 
                {flatData?.lastUpdated && (
                  <div className="text-center text-xs text-muted-foreground pt-4">
                    Last updated: {new Date(flatData.lastUpdated).toLocaleString()}
                  </div>
                )}
              </form>
            </motion.div>
          </motion.div>
        </AnimatePresence>
        <YearMonthSelector 
            isOpen={isMonthSelectorOpen}
            onClose={() => setIsMonthSelectorOpen(false)}
            value={formData.moveInMonth}
            onSelect={(value) => {
                setFormData(prev => ({...prev, moveInMonth: value}));
                setIsMonthSelectorOpen(false);
            }}
        />
      </>
    );
};
