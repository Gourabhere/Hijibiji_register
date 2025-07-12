"use client";

import React, { useState } from 'react';
import { IndianRupee, AlertCircle, CheckCircle, X, Calendar, Edit3, Home, User } from 'lucide-react';
import type { FlatData, FlatInfo } from './dashboard-client';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from '@/components/ui/separator';

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


export const MaintenanceManager = ({ isOpen, onClose, flatInfo, flatData }: { isOpen: boolean; onClose: () => void; flatInfo: FlatInfo, flatData: FlatData }) => {
  const [selectedPayment, setSelectedPayment] = useState<any>(null);
  const [isPaymentUpdateOpen, setIsPaymentUpdateOpen] = useState(false);

  // This is a placeholder for transforming your flat data into the resident structure.
  // In a real app, this would involve more complex logic to track payments per month.
  const [residentData, setResidentData] = useState(() => ({
    id: flatInfo.flatId,
    name: flatData.ownerName,
    apartment: flatInfo.flatId,
    phone: flatData.contactNumber,
    // MOCK DATA: This needs to be replaced with real payment tracking logic
    pendingMonths: flatData.maintenanceStatus !== 'Paid' 
      ? [
          { month: "January 2025", amount: 250, dueDate: "2025-01-05", status: "pending" as const },
          { month: "December 2024", amount: 250, dueDate: "2024-12-05", status: "overdue" as const }
        ] 
      : [],
    paidMonths: flatData.maintenanceStatus === 'Paid' 
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

  return (
    <>
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl w-full h-[90vh]">
        <DialogHeader>
            <DialogTitle>Maintenance for {residentData.name} ({residentData.apartment})</DialogTitle>
            <DialogDescription>
              View and manage maintenance payments for this flat.
            </DialogDescription>
        </DialogHeader>
        <div className="max-h-[70vh] overflow-y-auto p-4 space-y-6">
          <div>
              <h3 className="text-lg font-semibold text-red-600 mb-4 flex items-center"><AlertCircle className="w-5 h-5 mr-2" /> Pending Payments ({residentData.pendingMonths.length})</h3>
              {residentData.pendingMonths.length > 0 ? (
                  <div className="space-y-3">
                      {residentData.pendingMonths.map((p, i) => (
                          <div key={i} className={`p-4 rounded-lg border-2 cursor-pointer transition-all hover:shadow-md ${p.status === 'overdue' ? 'border-red-200 bg-red-50' : 'border-yellow-200 bg-yellow-50'}`} onClick={() => openPaymentUpdateModal(p)}>
                              <div className="flex justify-between items-center">
                                  <div>
                                    <p className="font-medium">{p.month}</p>
                                    <p className="text-sm text-muted-foreground">Due: {p.dueDate}</p>
                                  </div>
                                  <div className="text-right">
                                    <p className="font-bold flex items-center"><IndianRupee className="inline h-4 w-4" />{p.amount}</p>
                                    <Badge variant={p.status === 'overdue' ? 'destructive' : 'secondary'} className="mt-1">{p.status}</Badge>
                                  </div>
                                  <Edit3 className="w-4 h-4 text-muted-foreground ml-2" />
                              </div>
                          </div>
                      ))}
                  </div>
              ) : <p className="text-muted-foreground">No pending payments.</p>}
          </div>
          <Separator />
          <div>
              <h3 className="text-lg font-semibold text-green-600 mb-4 flex items-center"><CheckCircle className="w-5 h-5 mr-2" />Payment History</h3>
              {residentData.paidMonths.length > 0 ? (
                  <div className="space-y-3">
                  {residentData.paidMonths.map((p, i) => (
                      <div key={i} className="p-4 rounded-lg border border-green-200 bg-green-50">
                          <div className="flex justify-between items-center">
                              <div>
                                  <p className="font-medium">{p.month}</p>
                                  <p className="text-sm text-muted-foreground">Paid on: {p.paidDate}</p>
                              </div>
                              <p className="font-bold flex items-center"><IndianRupee className="inline h-4 w-4" />{p.amount}</p>
                          </div>
                      </div>
                  ))}
                  </div>
              ) : <p className="text-muted-foreground">No payment history.</p>}
          </div>
        </div>
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
