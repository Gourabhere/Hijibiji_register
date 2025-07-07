
'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { getOwnerFlatData, type OwnerFlatData } from '@/app/actions';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertTriangle } from 'lucide-react';

const InfoItem = ({ label, value }: { label: string; value: React.ReactNode }) => (
    <div className="flex justify-between items-center py-3 border-b border-gray-100 last:border-b-0">
        <p className="text-sm text-gray-600">{label}</p>
        <p className="text-sm font-semibold text-gray-800 text-right">{value}</p>
    </div>
);

export default function OwnerDashboardPage() {
    const router = useRouter();
    const [flatData, setFlatData] = useState<OwnerFlatData | null>(null);
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
        switch (status.toLowerCase()) {
            case 'paid':
                return <Badge variant="default" className="bg-green-500 hover:bg-green-600">Paid</Badge>;
            case 'pending':
                return <Badge variant="secondary" className="bg-yellow-400 text-black hover:bg-yellow-500">Pending</Badge>;
            case 'overdue':
                return <Badge variant="destructive">Overdue</Badge>;
            default:
                return <Badge variant="outline">{status}</Badge>;
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
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex flex-col sm:flex-row justify-between items-center mb-8 pb-4 border-b border-gray-200"
                >
                    <h1 className="text-3xl font-bold text-gray-800 mb-2 sm:mb-0">Owner Dashboard</h1>
                    {flatData && (
                        <div className="flex items-center gap-4">
                            <div className="flex items-center gap-3 text-right">
                                <div>
                                    <p className="font-semibold text-gray-800">{flatData.ownerName}</p>
                                    <p className="text-xs text-gray-500">{flatData.flatId}</p>
                                </div>
                                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#667eea] to-[#764ba2] flex items-center justify-center text-white font-bold text-lg">
                                    {getAvatarInitials(flatData.ownerName)}
                                </div>
                            </div>
                            <Button variant="outline" size="sm" onClick={handleLogout}>Logout</Button>
                        </div>
                    )}
                </motion.div>

                {error && (
                     <Alert variant="destructive" className="mb-8">
                        <AlertTriangle className="h-4 w-4" />
                        <AlertTitle>Error</AlertTitle>
                        <AlertDescription>{error}</AlertDescription>
                    </Alert>
                )}

                {/* Dashboard Content */}
                {flatData && (
                    <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="grid grid-cols-1 lg:grid-cols-3 gap-8"
                    >
                        {/* Left Column */}
                        <div className="lg:col-span-2 space-y-8">
                             <Card className="shadow-lg rounded-2xl">
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-3 text-xl">
                                        <span className="text-2xl">👤</span>
                                        Personal Information
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <InfoItem label="Name" value={flatData.ownerName} />
                                    <InfoItem label="Flat ID" value={flatData.flatId} />
                                    <InfoItem label="Block" value={flatData.block} />
                                    <InfoItem label="Floor" value={flatData.floor} />
                                    <InfoItem label="Contact" value={flatData.contactNumber} />
                                    <InfoItem label="Email" value={flatData.email} />
                                </CardContent>
                            </Card>
                             <Card className="shadow-lg rounded-2xl">
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-3 text-xl">
                                         <span className="text-2xl">⚠️</span>
                                        Issues & Complaints
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                     <InfoItem label="Reported Issues" value={flatData.issues || 'None'} />
                                </CardContent>
                            </Card>
                        </div>

                        {/* Right Column */}
                        <div className="space-y-8">
                             <Card className="shadow-lg rounded-2xl">
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-3 text-xl">
                                         <span className="text-2xl">🔧</span>
                                        Maintenance Status
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <InfoItem label="Current Status" value={getMaintenanceBadge(flatData.maintenanceStatus)} />
                                    <InfoItem label="Last Updated" value={flatData.lastUpdated ? new Date(flatData.lastUpdated).toLocaleDateString() : 'N/A'} />
                                     <InfoItem label="Registered Resident" value={flatData.registered ? "Yes" : "No"} />
                                </CardContent>
                            </Card>
                             <Card className="shadow-lg rounded-2xl">
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-3 text-xl">
                                         <span className="text-2xl">👨‍👩‍👧‍👦</span>
                                        Family Information
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <InfoItem label="Family Members" value={flatData.familyMembers} />
                                </CardContent>
                            </Card>
                        </div>
                    </motion.div>
                )}
            </div>
        </div>
    );
}

