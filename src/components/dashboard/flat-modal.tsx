
"use client";

import React, { useState, useEffect, useTransition } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { CalendarDays, Car, HeartPulse, Home, Mail, MessageSquare, Phone, ShieldAlert, User, Users } from 'lucide-react';
import { YearMonthSelector } from './year-month-selector';
import type { FlatInfo, FlatData } from './dashboard-client';

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
  const [isMonthSelectorOpen, setIsMonthSelectorOpen] = useState(false);

  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
    } else {
      // Reset form if no initial data
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

  const handleCheckboxChange = (checked: boolean) => {
    setFormData(prev => ({ ...prev, registered: checked }));
  };

  const handleSelectChange = (id: keyof FlatData, value: string) => {
    setFormData(prev => ({ ...prev, [id]: value as any }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    startTransition(async () => {
      await onSave(flatInfo.flatId, formData);
    });
  };

  const getMaintenanceBadge = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'paid': return <Badge variant="default" className="bg-green-500 hover:bg-green-600">Paid</Badge>;
      case 'pending': return <Badge variant="secondary" className="bg-yellow-400 text-black hover:bg-yellow-500">Pending</Badge>;
      case 'overdue': return <Badge variant="destructive">Overdue</Badge>;
      default: return <Badge variant="outline">{status || 'N/A'}</Badge>;
    }
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-[600px] bg-card/90 backdrop-blur-sm">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 font-headline text-2xl">
              <Home className="text-primary" /> Flat Details - {flatInfo.blockName}, Flat {flatInfo.flat}{flatInfo.floor}
            </DialogTitle>
            <DialogDescription>
              View and edit resident information for this flat. Click save when you're done.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="grid gap-6 py-4 max-h-[60vh] overflow-y-auto pr-4">
              {/* Personal Details */}
              <div className="space-y-4 p-4 border rounded-lg">
                 <h4 className="font-semibold text-lg flex items-center gap-2"><User />Personal Details</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="ownerName">Owner Name</Label>
                    <Input id="ownerName" value={formData.ownerName} onChange={handleInputChange} />
                  </div>
                  <div>
                    <Label htmlFor="contactNumber">Contact Number</Label>
                    <Input id="contactNumber" value={formData.contactNumber} onChange={handleInputChange} />
                  </div>
                  <div>
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" type="email" value={formData.email} onChange={handleInputChange} />
                  </div>
                  <div>
                    <Label htmlFor="emergencyContactNumber" className="flex items-center gap-1"><ShieldAlert className="w-4 h-4 text-destructive"/>Emergency Contact</Label>
                    <Input id="emergencyContactNumber" value={formData.emergencyContactNumber} onChange={handleInputChange} />
                  </div>
                </div>
              </div>

              {/* Residence Details */}
               <div className="space-y-4 p-4 border rounded-lg">
                <h4 className="font-semibold text-lg flex items-center gap-2"><Users />Residence Details</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <Label htmlFor="familyMembers">Family Members</Label>
                        <Input id="familyMembers" value={formData.familyMembers} onChange={handleInputChange} placeholder="e.g. 2 Adults, 1 Child" />
                    </div>
                    <div>
                        <Label htmlFor="bloodGroup">Blood Group</Label>
                         <Select value={formData.bloodGroup} onValueChange={(v) => handleSelectChange('bloodGroup', v)}>
                            <SelectTrigger><SelectValue placeholder="Select Blood Group" /></SelectTrigger>
                            <SelectContent>
                                {bloodGroups.map(group => <SelectItem key={group} value={group}>{group}</SelectItem>)}
                            </SelectContent>
                        </Select>
                    </div>
                     <div>
                        <Label htmlFor="moveInMonth">Move In Month</Label>
                         <Button
                            type="button"
                            variant={"outline"}
                            onClick={() => setIsMonthSelectorOpen(true)}
                            className="w-full justify-start text-left font-normal"
                        >
                            <CalendarDays className="mr-2 h-4 w-4" />
                            {formData.moveInMonth ? formData.moveInMonth : <span>Pick a month</span>}
                        </Button>
                    </div>
                    <div>
                        <Label htmlFor="parkingAllocation">Parking Allocation</Label>
                         <Select value={formData.parkingAllocation} onValueChange={(v: any) => handleSelectChange('parkingAllocation', v)}>
                            <SelectTrigger><SelectValue placeholder="Select Parking" /></SelectTrigger>
                            <SelectContent>
                               {parkingOptions.map(p => <SelectItem key={p} value={p}>{p}</SelectItem>)}
                            </SelectContent>
                        </Select>
                    </div>
                     <div>
                        <Label htmlFor="maintenanceStatus">Maintenance Status</Label>
                         <Select value={formData.maintenanceStatus} onValueChange={(v: any) => handleSelectChange('maintenanceStatus', v)}>
                            <SelectTrigger>{getMaintenanceBadge(formData.maintenanceStatus)}</SelectTrigger>
                            <SelectContent>
                               {maintenanceStatusOptions.map(s => <SelectItem key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</SelectItem>)}
                            </SelectContent>
                        </Select>
                    </div>
                     <div className="flex items-center space-x-2 pt-6">
                        <Checkbox id="registered" checked={formData.registered} onCheckedChange={handleCheckboxChange} />
                        <Label htmlFor="registered">Flat Registered</Label>
                    </div>
                </div>
                 <div className="space-y-2">
                    <Label htmlFor="issues">Issues / Complaints</Label>
                    <Textarea id="issues" value={formData.issues} onChange={handleInputChange} />
                </div>
              </div>

            </div>
            <DialogFooter className="pt-4">
              <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
              <Button type="submit" disabled={isPending}>
                {isPending ? 'Saving...' : 'Save Changes'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
      <YearMonthSelector
          isOpen={isMonthSelectorOpen}
          onClose={() => setIsMonthSelectorOpen(false)}
          value={formData.moveInMonth}
          onSelect={(value) => {
            handleSelectChange('moveInMonth', value);
            setIsMonthSelectorOpen(false);
          }}
        />
    </>
  );
}
