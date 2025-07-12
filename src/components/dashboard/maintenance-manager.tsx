
"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { IndianRupee, AlertCircle, CheckCircle, X, Calendar, Edit3, Home, User } from 'lucide-react';
import type { FlatData, FlatInfo } from './dashboard-client';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';

type PaymentRecord = {
  month: string;
  amount: number;
  dueDate?: string;
  paidDate?: string;
  status: 'paid' | 'pending' | 'overdue';
};

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
        <DialogContent className="sm:max-w-md bg-card/90 backdrop-blur-xl border-border/20 rounded-2xl">
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


export const MaintenanceManager = ({ isOpen, onClose, flatInfo, flatData }: { isOpen: boolean; onClose: () => void; flatInfo: FlatInfo, flatData: FlatData }) => {
  const [selectedPayment, setSelectedPayment] = useState<any>(null);
  const [isPaymentUpdateOpen, setIsPaymentUpdateOpen] = useState(false);

  // This is a placeholder for transforming your flat data into the resident structure.
  // In a real app, this would involve more complex logic to track payments per month from your data source.
  const [residentData, setResidentData] = useState(() => ({
    id: flatInfo.flatId,
    name: flatData.ownerName,
    apartment: flatInfo.flatId,
    phone: flatData.contactNumber,
    // MOCK DATA: This needs to be replaced with real payment tracking logic
    pendingMonths: flatData.maintenanceStatus.toLowerCase() !== 'paid' 
      ? [
          { month: "January 2025", amount: 250, dueDate: "2025-01-05", status: "pending" as const },
          { month: "December 2024", amount: 250, dueDate: "2024-12-05", status: "overdue" as const }
        ] 
      : [],
    paidMonths: flatData.maintenanceStatus.toLowerCase() === 'paid' 
      ? [
          { month: "November 2024", amount: 250, paidDate: "2024-11-05", status: "paid" as const }
        ] 
      : [],
  }));

  const handleUpdatePayment = (residentId: string, paymentData: any) => {
    // This is where you would update your backend/Google Sheet
    console.log("Updating payment for", residentId, paymentData);
    // For now, just update local state for demo
    setResidentData(prev => {
        if (prev.id === residentId) {
            return {
                ...prev,
                pendingMonths: prev.pendingMonths.filter(p => p.month !== paymentData.month),
                paidMonths: [...prev.paidMonths, {...paymentData, status: 'paid'}],
            }
        }
        return prev;
    });
    setIsPaymentUpdateOpen(false);
    setSelectedPayment(null);
  }
  
  const openPaymentUpdateModal = (payment: any) => {
      setSelectedPayment(payment);
      setIsPaymentUpdateOpen(true);
  }
  
  const listVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <>
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl w-full h-auto max-h-[90vh] flex flex-col bg-card/90 backdrop-blur-xl border-border/20 rounded-2xl shadow-2xl p-0">
        <DialogHeader className="p-6 pb-4 border-b">
            <DialogTitle className="text-2xl font-bold font-headline">Maintenance for {residentData.apartment}</DialogTitle>
            <DialogDescription className="flex items-center gap-4">
              <span className="flex items-center gap-1.5"><User className="w-4 h-4" /> {residentData.name}</span>
              <span className="flex items-center gap-1.5"><Home className="w-4 h-4" /> {flatInfo.blockName}</span>
            </DialogDescription>
        </DialogHeader>
        <div className="flex-grow overflow-y-auto p-6 space-y-8">
          <div>
              <h3 className="text-lg font-semibold text-red-600 mb-4 flex items-center"><AlertCircle className="w-5 h-5 mr-2" /> Pending Payments ({residentData.pendingMonths.length})</h3>
              {residentData.pendingMonths.length > 0 ? (
                  <motion.div 
                    className="space-y-3"
                    variants={listVariants}
                    initial="hidden"
                    animate="visible"
                   >
                      {residentData.pendingMonths.map((p, i) => (
                          <motion.div 
                            key={i} 
                            variants={itemVariants}
                            className={`p-4 rounded-xl border-2 cursor-pointer transition-all hover:shadow-lg ${p.status === 'overdue' ? 'border-red-500/50 bg-red-900/10' : 'border-yellow-500/50 bg-yellow-900/10'}`} 
                            onClick={() => openPaymentUpdateModal(p)}
                           >
                              <div className="flex justify-between items-center">
                                  <div>
                                    <p className="font-medium text-lg">{p.month}</p>
                                    <p className="text-sm text-muted-foreground">Due: {p.dueDate}</p>
                                  </div>
                                  <div className="text-right flex items-center gap-4">
                                    <div className="text-right">
                                        <p className="font-bold text-lg flex items-center"><IndianRupee className="inline h-5 w-5" />{p.amount}</p>
                                        <Badge variant={p.status === 'overdue' ? 'destructive' : 'secondary'} className="mt-1 capitalize">{p.status}</Badge>
                                    </div>
                                    <Edit3 className="w-5 h-5 text-muted-foreground transition-transform group-hover:scale-110" />
                                  </div>
                              </div>
                          </motion.div>
                      ))}
                  </motion.div>
              ) : <p className="text-muted-foreground italic text-center py-4">No pending payments. Well done!</p>}
          </div>
          <Separator />
          <div>
              <h3 className="text-lg font-semibold text-green-600 mb-4 flex items-center"><CheckCircle className="w-5 h-5 mr-2" />Payment History</h3>
              {residentData.paidMonths.length > 0 ? (
                  <motion.div 
                    className="space-y-3"
                    variants={listVariants}
                    initial="hidden"
                    animate="visible"
                  >
                  {residentData.paidMonths.map((p, i) => (
                      <motion.div key={i} variants={itemVariants} className="p-4 rounded-xl border border-green-500/30 bg-green-900/10">
                          <div className="flex justify-between items-center">
                              <div>
                                  <p className="font-medium text-lg">{p.month}</p>
                                  <p className="text-sm text-muted-foreground">Paid on: {p.paidDate}</p>
                              </div>
                              <p className="font-bold text-lg flex items-center text-green-400"><IndianRupee className="inline h-5 w-5" />{p.amount}</p>
                          </div>
                      </motion.div>
                  ))}
                  </motion.div>
              ) : <p className="text-muted-foreground italic text-center py-4">No payment history found.</p>}
          </div>
        </div>
        <DialogFooter className="p-6 border-t bg-card/50">
            <Button variant="outline" onClick={onClose}>Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>

    <PaymentUpdateModal
        isOpen={isPaymentUpdateOpen}
        payment={selectedPayment}
        residentId={residentData.id}
        onClose={() => { setIsPaymentUpdateOpen(false); setSelectedPayment(null); }}
        onUpdate={handleUpdatePayment}
    />
    </>
  );
};
