
"use client";

import React, { useState, useEffect, useTransition } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, User, Phone, Mail, Users, MessageSquare, Wrench } from 'lucide-react';
import type { FlatInfo, FlatData } from './dashboard-client';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';

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
};

export function FlatModal({ isOpen, onClose, flatInfo, flatData, onSave, isEditable = false }: FlatModalProps) {
    const [formData, setFormData] = useState<FlatData>(initialFormData);
    const [, startTransition] = useTransition();

    useEffect(() => {
        if (flatInfo) {
            setFormData({ ...initialFormData, ...(flatData || {}) });
        }
    }, [flatInfo, flatData]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave(formData);
    };

    if (!isOpen || !flatInfo) return null;

    return (
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
            className="bg-white rounded-3xl p-8 max-w-md w-full max-h-[90vh] overflow-y-auto shadow-2xl"
          >
            <div className="flex justify-between items-center mb-6">
              <div>
                <h2 className="text-2xl font-bold text-slate-800 font-headline">
                  {flatInfo.blockName}
                </h2>
                <p className="text-slate-600">
                  Floor {flatInfo.floor}, Flat {flatInfo.flat}
                </p>
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-slate-100 rounded-full transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="ownerName" className="flex items-center"><User className="w-4 h-4 mr-2" />Owner Name</Label>
                <Input
                  id="ownerName"
                  type="text"
                  value={formData.ownerName}
                  onChange={(e) => setFormData({...formData, ownerName: e.target.value})}
                  className="rounded-xl"
                  placeholder="Enter owner name"
                  disabled={!isEditable}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="contactNumber" className="flex items-center"><Phone className="w-4 h-4 mr-2" />Contact Number</Label>
                <Input
                  id="contactNumber"
                  type="tel"
                  value={formData.contactNumber}
                  onChange={(e) => setFormData({...formData, contactNumber: e.target.value})}
                  className="rounded-xl"
                  placeholder="Enter contact number"
                  disabled={!isEditable}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email" className="flex items-center"><Mail className="w-4 h-4 mr-2" />Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  className="rounded-xl"
                  placeholder="Enter email address"
                  disabled={!isEditable}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="familyMembers" className="flex items-center"><Users className="w-4 h-4 mr-2" />Family Members</Label>
                <Input
                  id="familyMembers"
                  type="text"
                  value={formData.familyMembers}
                  onChange={(e) => setFormData({...formData, familyMembers: e.target.value})}
                  className="rounded-xl"
                  placeholder="e.g., 2 Adults, 1 Child"
                  disabled={!isEditable}
                />
              </div>

              <div className="space-y-2">
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

              <div className="space-y-2">
                <Label htmlFor="maintenanceStatus" className="flex items-center"><Wrench className="w-4 h-4 mr-2" />Maintenance Status</Label>
                <Select
                  value={formData.maintenanceStatus}
                  onValueChange={(value: 'paid' | 'pending' | 'overdue') => setFormData({...formData, maintenanceStatus: value})}
                  disabled={!isEditable}
                >
                  <SelectTrigger id="maintenanceStatus" className="rounded-xl">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="paid">Paid</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="overdue">Overdue</SelectItem>
                  </SelectContent>
                </Select>
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
                  className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 px-6 rounded-xl font-medium shadow-lg hover:shadow-xl transition-all duration-300 mt-4"
                >
                  Save Details
                </motion.button>
              )}
               
              {flatData?.lastUpdated && (
                <div className="text-center text-xs text-slate-500 pt-4">
                  Last updated: {new Date(flatData.lastUpdated).toLocaleString()}
                </div>
              )}
            </form>
          </motion.div>
        </motion.div>
      </AnimatePresence>
    );
};
