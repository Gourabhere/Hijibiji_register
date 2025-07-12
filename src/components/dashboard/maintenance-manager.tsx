"use client";

import React, { useState } from 'react';
import { Settings, ChevronDown, Calendar, User, Home, CheckCircle, AlertCircle, X, Edit3, DollarSign, IndianRupee } from 'lucide-react';
import type { FlatData } from './dashboard-client';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogClose, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';

// Mock data structure, will be replaced by props
type PaymentRecord = {
  month: string;
  amount: number;
  dueDate?: string;
  paidDate?: string;
  status: 'paid' | 'pending' | 'overdue';
};

type ResidentData = {
  id: string; // flatId
  name: string;
  apartment: string; // flatId
  phone?: string;
  pendingMonths: PaymentRecord[];
  paidMonths: PaymentRecord[];
};

const statusOptions = [
  { value: 'Pending', label: 'Pending', color: 'text-yellow-700 bg-yellow-50' },
  { value: 'Overdue', label: 'Overdue', color: 'text-red-700 bg-red-50' },
  { value: 'Paid', label: 'Paid', color: 'text-green-700 bg-green-50' },
  { value: 'All', label: 'All Records', color: 'text-gray-700 bg-gray-50' }
];

const PaymentUpdateModal = ({ payment, residentId, onClose, onUpdate, isOpen }: { payment: any, residentId: string, isOpen: boolean, onClose: () => void, onUpdate: (residentId: string, paymentData: any) => void }) => {
  const [formData, setFormData] = useState({
    paymentMethod: 'cash',
    transactionId: '',
    notes: '',
    paidAmount: payment?.amount || 0
  });

  const handleSubmit = () => {
    onUpdate(residentId, {
      ...payment,
      ...formData,
      paidDate: new Date().toISOString().split('T')[0]
    });
    onClose();
  };

  if (!payment) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-md">
            <DialogHeader>
                <DialogTitle>Update Payment</DialogTitle>
                <DialogDescription>
                    Update payment for {payment.month} for an amount of <IndianRupee className="inline-block w-4 h-4" />{payment.amount}.
                </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
                <div>
                  <Label htmlFor="paymentMethod">Payment Method</Label>
                  <Select value={formData.paymentMethod} onValueChange={(value) => setFormData({...formData, paymentMethod: value})}>
                    <SelectTrigger id="paymentMethod">
                        <SelectValue placeholder="Select method" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="cash">Cash</SelectItem>
                        <SelectItem value="check">Check</SelectItem>
                        <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                        <SelectItem value="upi">UPI</SelectItem>
                        <SelectItem value="online">Online Payment</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="paidAmount">Paid Amount (₹)</Label>
                  <Input id="paidAmount" type="number" value={formData.paidAmount} onChange={(e) => setFormData({...formData, paidAmount: parseFloat(e.target.value)})} />
                </div>
                <div>
                  <Label htmlFor="transactionId">Transaction ID (Optional)</Label>
                  <Input id="transactionId" value={formData.transactionId} onChange={(e) => setFormData({...formData, transactionId: e.target.value})} />
                </div>
                <div>
                  <Label htmlFor="notes">Notes (Optional)</Label>
                  <Textarea id="notes" value={formData.notes} onChange={(e) => setFormData({...formData, notes: e.target.value})} />
                </div>
            </div>
            <DialogFooter>
                <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
                <Button type="button" onClick={handleSubmit}>Mark as Paid</Button>
            </DialogFooter>
        </DialogContent>
    </Dialog>
  );
};

const QuickViewModal = ({ resident, onClose, onUpdatePayment, isOpen }: { resident: ResidentData | null, isOpen: boolean, onClose: () => void, onUpdatePayment: (payment: any) => void }) => {
    if (!resident) return null;

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-2xl">
                <DialogHeader>
                    <DialogTitle>Maintenance for {resident.name} ({resident.apartment})</DialogTitle>
                </DialogHeader>
                <div className="max-h-[70vh] overflow-y-auto p-4 space-y-6">
                    <div>
                        <h3 className="text-lg font-semibold text-red-600 mb-4 flex items-center"><AlertCircle className="w-5 h-5 mr-2" /> Pending Payments ({resident.pendingMonths.length})</h3>
                        {resident.pendingMonths.length > 0 ? (
                            <div className="space-y-3">
                                {resident.pendingMonths.map((p, i) => (
                                    <div key={i} className={`p-4 rounded-lg border-2 cursor-pointer transition-all hover:shadow-md ${p.status === 'overdue' ? 'border-red-200 bg-red-50' : 'border-yellow-200 bg-yellow-50'}`} onClick={() => onUpdatePayment(p)}>
                                        <div className="flex justify-between items-center">
                                            <p className="font-medium">{p.month}</p>
                                            <p><IndianRupee className="inline h-4 w-4" />{p.amount}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : <p>No pending payments.</p>}
                    </div>
                    <div>
                        <h3 className="text-lg font-semibold text-green-600 mb-4 flex items-center"><CheckCircle className="w-5 h-5 mr-2" />Payment History</h3>
                        {resident.paidMonths.length > 0 ? (
                            <div className="space-y-3">
                            {resident.paidMonths.map((p, i) => (
                                <div key={i} className="p-4 rounded-lg border border-green-200 bg-green-50">
                                    <div className="flex justify-between items-center">
                                        <p className="font-medium">{p.month}</p>
                                        <p><IndianRupee className="inline h-4 w-4" />{p.amount}</p>
                                    </div>
                                    <p className="text-sm text-gray-500">Paid on: {p.paidDate}</p>
                                </div>
                            ))}
                            </div>
                        ) : <p>No payment history.</p>}
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}

const AdminSettingsModal = ({ maintenanceRate, setMaintenanceRate, isOpen, onClose }: { maintenanceRate: number, setMaintenanceRate: (rate: number) => void, isOpen: boolean, onClose: () => void }) => {
    const [tempRate, setTempRate] = useState(maintenanceRate);
    
    const handleSave = () => {
        setMaintenanceRate(tempRate);
        onClose();
    }
    
    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Admin Settings</DialogTitle>
                </DialogHeader>
                <div className="py-4 space-y-4">
                    <Label htmlFor="rate">Default Maintenance Rate (per month)</Label>
                    <div className="relative">
                        <IndianRupee className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
                        <Input id="rate" type="number" value={tempRate} onChange={(e) => setTempRate(Number(e.target.value))} className="pl-10" />
                    </div>
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={onClose}>Cancel</Button>
                    <Button onClick={handleSave}>Save Settings</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}

export const MaintenanceManager = ({ isOpen, onClose, allFlatData }: { isOpen: boolean; onClose: () => void; allFlatData: Record<string, FlatData> }) => {
  const [maintenanceRate, setMaintenanceRate] = useState(250);
  const [selectedResident, setSelectedResident] = useState<ResidentData | null>(null);
  const [selectedPayment, setSelectedPayment] = useState<any>(null);

  // This is a placeholder for transforming your flat data into the resident structure.
  // In a real app, this would involve more complex logic to track payments per month.
  const residents: ResidentData[] = Object.entries(allFlatData)
    .filter(([_, data]) => data.registered)
    .map(([flatId, data]) => ({
      id: flatId,
      name: data.ownerName,
      apartment: flatId,
      phone: data.contactNumber,
      // MOCK DATA: This needs to be replaced with real payment tracking logic
      pendingMonths: data.maintenanceStatus !== 'Paid' ? [{ month: "January 2025", amount: maintenanceRate, dueDate: "2025-01-05", status: "pending" as const }] : [],
      paidMonths: data.maintenanceStatus === 'Paid' ? [{ month: "December 2024", amount: maintenanceRate, paidDate: "2024-12-05", status: "paid" as const }] : [],
    }));

  const [residentsData, setResidentsData] = useState<ResidentData[]>(residents);
  const [isQuickViewOpen, setIsQuickViewOpen] = useState(false);
  const [isPaymentUpdateOpen, setIsPaymentUpdateOpen] = useState(false);
  const [isAdminSettingsOpen, setIsAdminSettingsOpen] = useState(false);

  const handleUpdatePayment = (residentId: string, paymentData: any) => {
    // This is where you would update your backend/Google Sheet
    console.log("Updating payment for", residentId, paymentData);
    // For now, just update local state for demo
    setResidentsData(prev => prev.map(res => {
        if (res.id === residentId) {
            return {
                ...res,
                pendingMonths: res.pendingMonths.filter(p => p.month !== paymentData.month),
                paidMonths: [...res.paidMonths, {...paymentData, status: 'paid'}],
            }
        }
        return res;
    }));
    setIsPaymentUpdateOpen(false);
    setSelectedPayment(null);
  }
  
  const openPaymentUpdateModal = (payment: any) => {
      setSelectedPayment(payment);
      setIsPaymentUpdateOpen(true);
  }

  return (
    <>
    <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-6xl w-full h-[90vh]">
            <DialogHeader>
                <div className="flex justify-between items-center">
                    <DialogTitle>Maintenance Charges Management</DialogTitle>
                    <Button variant="outline" size="sm" onClick={() => setIsAdminSettingsOpen(true)}>
                        <Settings className="w-4 h-4 mr-2" /> Admin Settings
                    </Button>
                </div>
            </DialogHeader>
            <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 overflow-y-auto">
                {residentsData.map(resident => (
                    <Card key={resident.id} className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => { setSelectedResident(resident); setIsQuickViewOpen(true); }}>
                        <CardHeader>
                            <CardTitle>{resident.name}</CardTitle>
                            <CardDescription><Home className="inline w-4 h-4 mr-1" />{resident.apartment}</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-2 text-sm">
                                <div className="flex justify-between">
                                    <span>Pending Months:</span>
                                    <span className="font-bold text-red-600">{resident.pendingMonths.length}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span>Total Due:</span>
                                    <span className="font-bold text-red-600"><IndianRupee className="inline w-4 h-4" />{resident.pendingMonths.reduce((acc, p) => acc + p.amount, 0)}</span>
                                </div>
                            </div>
                            {resident.pendingMonths.length > 0 && <Separator className="my-2" />}
                            <div className="flex flex-wrap gap-1 mt-2">
                                {resident.pendingMonths.map((p, i) => (
                                    <span key={i} className={`text-xs px-2 py-0.5 rounded-full ${p.status === 'overdue' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'}`}>{p.month.split(' ')[0]}</span>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </DialogContent>
    </Dialog>

    <QuickViewModal 
        isOpen={isQuickViewOpen}
        resident={selectedResident}
        onClose={() => {setIsQuickViewOpen(false); setSelectedResident(null);}}
        onUpdatePayment={(payment) => openPaymentUpdateModal({...payment, residentId: selectedResident?.id })}
    />

    <PaymentUpdateModal
        isOpen={isPaymentUpdateOpen}
        payment={selectedPayment}
        residentId={selectedResident?.id || ''}
        onClose={() => { setIsPaymentUpdateOpen(false); setSelectedPayment(null); }}
        onUpdate={handleUpdatePayment}
    />
    
    <AdminSettingsModal
        isOpen={isAdminSettingsOpen}
        maintenanceRate={maintenanceRate}
        setMaintenanceRate={setMaintenanceRate}
        onClose={() => setIsAdminSettingsOpen(false)}
    />
    </>
  );
};
