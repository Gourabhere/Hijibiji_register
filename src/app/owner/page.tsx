
'use client';

import React, { useEffect, useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { getOwnerFlatData, updateOwnerDataAction, type OwnerFlatData, type OwnerEditableData } from '@/app/actions';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { AlertTriangle, Home, User } from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';

export default function OwnerDashboardPage() {
    const router = useRouter();
    const { toast } = useToast();
    const [isPending, startTransition] = useTransition();

    const [flatData, setFlatData] = useState<OwnerFlatData | null>(null);
    const [formData, setFormData] = useState<OwnerEditableData>({
        ownerName: '',
        contactNumber: '',
        email: '',
        familyMembers: '',
        issues: '',
        registered: false,
    });
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const flatId = localStorage.getItem('ownerFlatId');
        if (!flatId) {
            router.replace('/owner-login');
            return;
        }

        const fetchData = async () => {
            setIsLoading(true);
            setError(null);
            try {
                const data = await getOwnerFlatData(flatId);
                if (data) {
                    setFlatData(data);
                    setFormData({
                        ownerName: data.ownerName,
                        contactNumber: data.contactNumber,
                        email: data.email,
                        familyMembers: data.familyMembers,
                        issues: data.issues,
                        registered: data.registered,
                    });
                } else {
                    setError('Could not find details for your flat.');
                }
            } catch (e: any) {
                setError(e.message || 'An error occurred while fetching your data.');
            } finally {
                setIsLoading(false);
            }
        };

        fetchData();
    }, [router]);
    
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { id, value } = e.target;
        setFormData(prev => ({ ...prev, [id]: value }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!flatData) return;

        startTransition(async () => {
            const result = await updateOwnerDataAction(flatData.flatId, formData);
            if (result.success) {
                toast({
                    title: 'Success!',
                    description: result.message,
                });
                const updatedData = await getOwnerFlatData(flatData.flatId);
                if(updatedData) {
                    setFlatData(updatedData);
                }

            } else {
                toast({
                    title: 'Update Failed',
                    description: result.message,
                    variant: 'destructive',
                });
            }
        });
    };

    const handleLogout = () => {
        localStorage.removeItem('isOwnerLoggedIn');
        localStorage.removeItem('ownerFlatId');
        router.push('/owner-login');
    };

    const getAvatarInitials = (name: string) => {
        if (!name) return 'O';
        return name.split(' ').map(n => n[0]).join('').toUpperCase();
    };
    
    const getMaintenanceBadge = (status: string) => {
        switch (status?.toLowerCase()) {
            case 'paid':
                return <Badge variant="default" className="bg-green-500 hover:bg-green-600">Paid</Badge>;
            case 'pending':
                return <Badge variant="secondary" className="bg-yellow-400 text-black hover:bg-yellow-500">Pending</Badge>;
            case 'overdue':
                return <Badge variant="destructive">Overdue</Badge>;
            default:
                return <Badge variant="outline">{status || 'N/A'}</Badge>;
        }
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full"
                />
            </div>
        );
    }
    
    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-gray-100 p-4 sm:p-8">
            <div className="max-w-4xl mx-auto">
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex flex-col sm:flex-row justify-between items-center mb-8"
                >
                     <h1 className="text-3xl font-bold text-gray-800 mb-2 sm:mb-0">My Dashboard</h1>
                     <div className="flex items-center gap-4">
                        <Button asChild variant="outline" size="sm">
                           <Link href="/">
                              <Home className="w-4 h-4 mr-2"/>
                              Home
                           </Link>
                        </Button>
                        <div className="text-right">
                           <p className="font-semibold text-gray-800">{flatData?.ownerName}</p>
                           <p className="text-xs text-gray-500">{flatData?.flatId}</p>
                        </div>
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#667eea] to-[#764ba2] flex items-center justify-center text-white font-bold text-lg">
                           {getAvatarInitials(flatData?.ownerName || '')}
                        </div>
                        <Button variant="outline" size="sm" onClick={handleLogout}>Logout</Button>
                     </div>
                </motion.div>

                {error && (
                     <Alert variant="destructive" className="mb-8">
                        <AlertTriangle className="h-4 w-4" />
                        <AlertTitle>Error</AlertTitle>
                        <AlertDescription>{error}</AlertDescription>
                    </Alert>
                )}

                {flatData && (
                    <form onSubmit={handleSubmit}>
                        <motion.div 
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 }}
                            className="space-y-8"
                        >
                            <Card className="shadow-lg rounded-2xl">
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-3 text-xl"><User className="text-primary"/>My Profile</CardTitle>
                                    <CardDescription>Update your personal and contact details here.</CardDescription>
                                </CardHeader>
                                <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <Label htmlFor="ownerName">Full Name</Label>
                                        <Input id="ownerName" value={formData.ownerName} onChange={handleInputChange} />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="contactNumber">Contact Number</Label>
                                        <Input id="contactNumber" type="tel" value={formData.contactNumber} onChange={handleInputChange} />
                                    </div>
                                    <div className="space-y-2 md:col-span-2">
                                        <Label htmlFor="email">Email Address</Label>
                                        <Input id="email" type="email" value={formData.email} onChange={handleInputChange} />
                                    </div>
                                </CardContent>
                            </Card>

                            <Card className="shadow-lg rounded-2xl">
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-3 text-xl"><Home className="text-primary"/>Residence Information</CardTitle>
                                </CardHeader>
                                <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <Label htmlFor="familyMembers">Family Members</Label>
                                        <Input id="familyMembers" value={formData.familyMembers} onChange={handleInputChange} placeholder="e.g., 2 Adults, 1 Child" />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Maintenance Status</Label>
                                        <div>{getMaintenanceBadge(flatData.maintenanceStatus)}</div>
                                    </div>
                                    <div className="flex items-center space-x-2 pt-2 md:col-span-2">
                                        <Checkbox 
                                            id="registered" 
                                            checked={formData.registered} 
                                            onCheckedChange={(checked) => setFormData(prev => ({ ...prev, registered: !!checked }))}
                                        />
                                        <Label htmlFor="registered" className="font-normal text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                                            My flat is registered and my details are correct.
                                        </Label>
                                    </div>
                                    <div className="space-y-2 md:col-span-2">
                                        <Label htmlFor="issues">Issues / Complaints</Label>
                                        <Textarea id="issues" value={formData.issues} onChange={handleInputChange} placeholder="Report any issues..."/>
                                    </div>
                                </CardContent>
                            </Card>

                            <div className="flex justify-end">
                                <Button type="submit" disabled={isPending} className="bg-gradient-to-r from-[#667eea] to-[#764ba2] text-white">
                                    {isPending ? 'Saving...' : 'Save Changes'}
                                </Button>
                            </div>
                        </motion.div>
                    </form>
                )}
            </div>
        </div>
    );
}
