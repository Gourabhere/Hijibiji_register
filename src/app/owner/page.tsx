
'use client';

import React, { useEffect, useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { format, parse } from 'date-fns';
import { getOwnerFlatData, updateOwnerDataAction, type OwnerFlatData, type OwnerEditableData } from '@/app/actions';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button, buttonVariants } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { AlertTriangle, Home, User, CalendarDays, Clock, Bell, LogOut, ShieldAlert, Car, HeartPulse, Phone, Mail, Users, MessageSquare, Menu } from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';
import { cn } from '@/lib/utils';
import { ThemeToggle } from '@/components/theme-toggle';
import { YearMonthSelector } from '@/components/dashboard/year-month-selector';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle, SheetClose } from '@/components/ui/sheet';
import { Separator } from '@/components/ui/separator';

const bloodGroups = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

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
        moveInMonth: '',
        emergencyContactNumber: '',
        parkingAllocation: '',
        bloodGroup: '',
    });
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isMonthSelectorOpen, setIsMonthSelectorOpen] = useState(false);
    const [time, setTime] = useState(new Date());

    useEffect(() => {
        let isMounted = true;
        const flatId = localStorage.getItem('ownerFlatId');
        if (!flatId) {
            router.replace('/');
            return;
        }

        const timer = setInterval(() => setTime(new Date()), 1000);

        const fetchData = async () => {
            setIsLoading(true);
            setError(null);
            try {
                const data = await getOwnerFlatData(flatId);
                if (isMounted) {
                    if (data) {
                        setFlatData(data);
                        setFormData({
                            ownerName: data.ownerName,
                            contactNumber: data.contactNumber,
                            email: data.email,
                            familyMembers: data.familyMembers,
                            issues: data.issues,
                            registered: data.registered,
                            moveInMonth: data.moveInMonth,
                            emergencyContactNumber: data.emergencyContactNumber,
                            parkingAllocation: data.parkingAllocation,
                            bloodGroup: data.bloodGroup,
                        });
                    } else {
                        setError('Could not find details for your flat.');
                    }
                }
            } catch (e: any) {
                if (isMounted) {
                    setError(e.message || 'An error occurred while fetching your data.');
                }
            } finally {
                if (isMounted) {
                    setIsLoading(false);
                }
            }
        };

        fetchData();

        return () => {
            isMounted = false;
            clearInterval(timer);
        };
    }, [router]);
    
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { id, value } = e.target;
        setFormData(prev => ({ ...prev, [id]: value }));
    };

    const handleSelectChange = (id: keyof OwnerEditableData, value: string) => {
        setFormData(prev => ({ ...prev, [id]: value }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!flatData) return;

        startTransition(async () => {
            // Ensure `registered` status is also updated upon saving any detail.
            const dataToSave = { ...formData, registered: true };

            const result = await updateOwnerDataAction(flatData.flatId, dataToSave);
            if (result.success) {
                toast({
                    title: 'Success!',
                    description: result.message,
                });
                const updatedData = await getOwnerFlatData(flatData.flatId);
                if(updatedData) {
                    setFlatData(updatedData);
                    setFormData({
                        ownerName: updatedData.ownerName,
                        contactNumber: updatedData.contactNumber,
                        email: updatedData.email,
                        familyMembers: updatedData.familyMembers,
                        issues: updatedData.issues,
                        registered: updatedData.registered,
                        moveInMonth: updatedData.moveInMonth,
                        emergencyContactNumber: updatedData.emergencyContactNumber,
                        parkingAllocation: updatedData.parkingAllocation,
                        bloodGroup: updatedData.bloodGroup,
                    });
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
        router.push('/');
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
    
    const navButtonVariants = {
        initial: { opacity: 0, y: -10 },
        animate: { opacity: 1, y: 0 },
        hover: { scale: 1.05, y: -2, transition: { type: 'spring', stiffness: 300 } },
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full"
                />
            </div>
        );
    }
    
    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-gray-100 dark:from-slate-900 dark:to-gray-950 font-body">
            <motion.header
                initial={{ y: -100 }}
                animate={{ y: 0 }}
                className="bg-card/80 backdrop-blur-xl border-b border-border/20 sticky top-0 z-40 shadow-lg"
            >
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-20">
                        <div className="flex items-center space-x-4">
                            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-primary-foreground font-bold text-lg shadow-md">
                                {getAvatarInitials(flatData?.ownerName || '')}
                            </div>
                            <div>
                                <h1 className="text-xl font-bold text-foreground font-headline">My Dashboard</h1>
                                <p className="text-xs text-muted-foreground">{flatData?.ownerName} ({flatData?.flatId})</p>
                            </div>
                        </div>

                        <div className="hidden md:flex items-center space-x-2 bg-muted/50 p-2 rounded-full border border-border/20 shadow-inner">
                            <motion.div variants={navButtonVariants} initial="initial" animate="animate" whileHover="hover">
                                <Button asChild variant="ghost" size="sm" className="space-x-2">
                                    <Link href="/dashboard">
                                        <Home className="w-4 h-4" />
                                        <span>Home</span>
                                    </Link>
                                </Button>
                            </motion.div>
                            <motion.div variants={navButtonVariants} initial="initial" animate="animate" whileHover="hover">
                                <Button onClick={handleLogout} variant="ghost" size="sm" className="space-x-2">
                                    <LogOut className="w-4 h-4" />
                                    <span>Logout</span>
                                </Button>
                            </motion.div>
                        </div>

                        <div className="hidden md:flex items-center gap-4">
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <Clock className="w-4 h-4" />
                                <span>{time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                            </div>
                            <motion.button
                                whileHover={{ scale: 1.1, rotate: [0, 15, -10, 15, 0] }}
                                whileTap={{ scale: 0.95 }}
                                transition={{ duration: 0.5 }}
                                className="relative p-2 text-muted-foreground hover:text-foreground transition-colors"
                            >
                                <Bell className="w-5 h-5" />
                                <span className="absolute top-1 right-1 w-3 h-3 bg-red-500 rounded-full border-2 border-card animate-pulse"></span>
                            </motion.button>
                            <ThemeToggle />
                        </div>
                        
                        <div className="md:hidden">
                            <Sheet>
                                <SheetTrigger asChild>
                                  <Button variant="ghost" size="icon">
                                    <Menu className="h-6 w-6" />
                                    <span className="sr-only">Open Menu</span>
                                  </Button>
                                </SheetTrigger>
                                <SheetContent className="w-[280px] sm:w-[320px]">
                                    <SheetHeader>
                                        <SheetTitle>Menu</SheetTitle>
                                    </SheetHeader>
                                    <nav className="flex flex-col gap-2 mt-4">
                                        <SheetClose asChild>
                                          <Link href="/dashboard" className={buttonVariants({ variant: "ghost", className: "justify-start gap-2" })}>
                                            <Home className="h-5 w-5" />
                                            <span>Home</span>
                                          </Link>
                                        </SheetClose>
                                        <Separator className="my-2" />
                                        <Button variant="ghost" onClick={() => alert('Notifications feature coming soon!')} className="justify-start gap-2">
                                            <Bell className="h-5 w-5" />
                                            Notifications
                                        </Button>
                                        <Separator className="my-2" />
                                        <Button variant="ghost" onClick={handleLogout} className="justify-start gap-2">
                                            <LogOut className="h-5 w-5" />
                                            Logout
                                        </Button>
                                        <Separator className="my-2" />
                                        <div className="p-2">
                                            <ThemeToggle />
                                        </div>
                                    </nav>
                                </SheetContent>
                            </Sheet>
                        </div>
                    </div>
                </div>
            </motion.header>
            
            <main className="max-w-4xl mx-auto p-4 sm:p-8">
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
                                    <CardDescription>Update your personal and contact details here. Saving any change will mark your flat as registered.</CardDescription>
                                </CardHeader>
                                <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <Label htmlFor="ownerName" className="flex items-center gap-2"><User className="w-4 h-4" />Full Name</Label>
                                        <Input id="ownerName" value={formData.ownerName} onChange={handleInputChange} />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="contactNumber" className="flex items-center gap-2"><Phone className="w-4 h-4" />Contact Number</Label>
                                        <Input id="contactNumber" type="tel" value={formData.contactNumber} onChange={handleInputChange} />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="email" className="flex items-center gap-2"><Mail className="w-4 h-4" />Email Address</Label>
                                        <Input id="email" type="email" value={formData.email} onChange={handleInputChange} />
                                    </div>
                                     <div className="space-y-2">
                                        <Label htmlFor="emergencyContactNumber" className="flex items-center gap-2"><ShieldAlert className="w-4 h-4 text-destructive" />Emergency Contact</Label>
                                        <Input id="emergencyContactNumber" type="tel" value={formData.emergencyContactNumber} onChange={handleInputChange} />
                                    </div>
                                </CardContent>
                            </Card>

                            <Card className="shadow-lg rounded-2xl">
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-3 text-xl"><Home className="text-primary"/>Residence Information</CardTitle>
                                </CardHeader>
                                <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <Label htmlFor="familyMembers" className="flex items-center gap-2"><Users className="w-4 h-4" />Family Members</Label>
                                        <Input id="familyMembers" value={formData.familyMembers} onChange={handleInputChange} placeholder="e.g., 2 Adults, 1 Child" />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="bloodGroup" className="flex items-center gap-2"><HeartPulse className="w-4 h-4"/>Blood Group</Label>
                                        <Select value={formData.bloodGroup} onValueChange={(v) => handleSelectChange('bloodGroup', v)}>
                                            <SelectTrigger><SelectValue placeholder="Select Blood Group" /></SelectTrigger>
                                            <SelectContent>
                                                {bloodGroups.map(group => <SelectItem key={group} value={group}>{group}</SelectItem>)}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                     <div className="space-y-2">
                                        <Label htmlFor="moveInMonth" className="flex items-center gap-2"><CalendarDays className="w-4 h-4" />Move In Month</Label>
                                        <Button
                                            type="button"
                                            variant={"outline"}
                                            onClick={() => setIsMonthSelectorOpen(true)}
                                            className={cn(
                                                "w-full justify-start text-left font-normal",
                                                !formData.moveInMonth && "text-muted-foreground"
                                            )}
                                        >
                                            <CalendarDays className="mr-2 h-4 w-4" />
                                            {formData.moveInMonth ? formData.moveInMonth : <span>Pick a month</span>}
                                        </Button>
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="parkingAllocation" className="flex items-center gap-2"><Car className="w-4 h-4"/>Parking Allocation</Label>
                                        <Select value={formData.parkingAllocation} onValueChange={(v: any) => handleSelectChange('parkingAllocation', v)}>
                                            <SelectTrigger><SelectValue placeholder="Select Parking" /></SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="Covered">Covered</SelectItem>
                                                <SelectItem value="Open">Open</SelectItem>
                                                <SelectItem value="No Parking">No Parking</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Maintenance Status</Label>
                                        <div>{getMaintenanceBadge(flatData.maintenanceStatus)}</div>
                                    </div>
                                    <div className="flex items-center space-x-2 pt-2 md:col-span-2">
                                        <Checkbox 
                                            id="registered" 
                                            checked={formData.registered} 
                                            disabled
                                        />
                                        <Label htmlFor="registered" className="font-normal text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                                            My flat is registered
                                        </Label>
                                    </div>
                                    <div className="space-y-2 md:col-span-2">
                                        <Label htmlFor="issues" className="flex items-center gap-2"><MessageSquare className="w-4 h-4" />Issues / Complaints</Label>
                                        <Textarea id="issues" value={formData.issues} onChange={handleInputChange} placeholder="Report any issues..."/>
                                    </div>
                                </CardContent>
                            </Card>

                            <div className="flex justify-end">
                                <Button type="submit" disabled={isPending} className="bg-gradient-to-r from-primary to-accent text-primary-foreground">
                                    {isPending ? 'Saving...' : 'Save Changes'}
                                </Button>
                            </div>
                        </motion.div>
                    </form>
                )}
            </main>
            <YearMonthSelector 
              isOpen={isMonthSelectorOpen}
              onClose={() => setIsMonthSelectorOpen(false)}
              value={formData.moveInMonth}
              onSelect={(value) => {
                setFormData(prev => ({...prev, moveInMonth: value}));
                setIsMonthSelectorOpen(false);
              }}
            />
        </div>
    );
}
