
'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Building, Lock, Mail, User, LogIn, UserPlus, AlertTriangle } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

import { loginOwnerAction, signupOwnerAction } from '@/app/actions';
import { HijibijiFlatData, BlockName, getFlatsForFloor } from '@/data/flat-data';

function LoginPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();

  const [role, setRole] = useState(searchParams.get('role') || 'owner');

  // Admin states
  const [adminEmail, setAdminEmail] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  
  // Owner Login States
  const [ownerIdentifier, setOwnerIdentifier] = useState('');
  const [ownerPassword, setOwnerPassword] = useState('');

  // Owner Signup States
  const [selectedBlock, setSelectedBlock] = useState('');
  const [selectedFloor, setSelectedFloor] = useState('');
  const [selectedFlat, setSelectedFlat] = useState('');
  const [signupPassword, setSignupPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  // Common states
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    setError(''); // Clear errors when role changes
  }, [role]);

  const handleAdminLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    if (adminEmail === 'admin@hijibiji.com' && adminPassword === 'password') {
      try {
        localStorage.setItem('isAdmin', 'true');
        localStorage.removeItem('isOwnerLoggedIn');
        localStorage.removeItem('ownerFlatId');
        router.push('/admin');
      } catch (e) {
        toast({
            title: 'Login Failed',
            description: 'Could not access storage. Please enable cookies and try again.',
            variant: 'destructive',
        });
      }
    } else {
      toast({
        title: 'Login Failed',
        description: 'Invalid email or password.',
        variant: 'destructive',
      });
    }
    setIsLoading(false);
  };

  const handleOwnerLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const result = await loginOwnerAction(ownerIdentifier, ownerPassword);
      if (result.success && result.flatId) {
        localStorage.setItem('isOwnerLoggedIn', 'true');
        localStorage.setItem('ownerFlatId', result.flatId);
        localStorage.removeItem('isAdmin');
        router.push('/');
      } else {
        setError(result.message);
      }
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleOwnerSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (signupPassword !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    if (!selectedBlock || !selectedFloor || !selectedFlat) {
      setError("Please select your block, floor, and flat.");
      return;
    }

    setError('');
    setIsLoading(true);

    try {
      const result = await signupOwnerAction(selectedBlock, selectedFloor, selectedFlat, signupPassword);
      if (result.success && result.flatId) {
        toast({
          title: 'Signup Successful!',
          description: "Redirecting to your dashboard...",
        });
        
        localStorage.setItem('isOwnerLoggedIn', 'true');
        localStorage.setItem('ownerFlatId', result.flatId);
        localStorage.removeItem('isAdmin');
        router.push('/');

      } else {
        setError(result.message);
      }
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred during signup.');
    } finally {
      setIsLoading(false);
    }
  };

  const blockOptions = Object.keys(HijibijiFlatData) as BlockName[];
  const floorOptions = selectedBlock ? Array.from({ length: HijibijiFlatData[selectedBlock as BlockName].floors }, (_, i) => String(i + 1)) : [];
  const flatOptions = (selectedBlock && selectedFloor)
    ? getFlatsForFloor(HijibijiFlatData[selectedBlock as BlockName], Number(selectedFloor))
    : [];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Card className="w-full max-w-md shadow-2xl rounded-3xl bg-white/90 backdrop-blur-sm border-white/20">
          <CardHeader className="text-center">
            <div className="mx-auto w-16 h-16 bg-gradient-to-br from-blue-600 to-purple-600 rounded-full flex items-center justify-center mb-4">
              <Building className="w-8 h-8 text-white" />
            </div>
            <CardTitle className="text-3xl font-bold text-slate-800 font-headline">Society Hub</CardTitle>
            <CardDescription>Login to your portal</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs value={role} onValueChange={setRole} className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="owner"><User className="mr-2 h-4 w-4"/>Owner</TabsTrigger>
                <TabsTrigger value="admin"><Lock className="mr-2 h-4 w-4"/>Admin</TabsTrigger>
              </TabsList>
              
              {error && (
                <Alert variant="destructive" className="mt-4">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertTitle>Action Failed</AlertTitle>
                    <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <TabsContent value="admin">
                <form onSubmit={handleAdminLogin} className="space-y-6 pt-4">
                  <div className="space-y-2">
                    <Label htmlFor="email" className="flex items-center text-slate-700"><Mail className="w-4 h-4 mr-2" />Email</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="admin@hijibiji.com"
                      value={adminEmail}
                      onChange={(e) => setAdminEmail(e.target.value)}
                      required
                      className="rounded-xl h-12 bg-white/80"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="password" className="text-slate-700"><Lock className="w-4 h-4 mr-2 inline" />Password</Label>
                    <Input
                      id="password"
                      type="password"
                      placeholder="password"
                      value={adminPassword}
                      onChange={(e) => setAdminPassword(e.target.value)}
                      required
                      className="rounded-xl h-12 bg-white/80"
                    />
                  </div>
                  <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                    <Button type="submit" className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 h-12 rounded-xl font-medium shadow-lg hover:shadow-xl transition-all duration-300">
                      {isLoading ? 'Logging in...' : 'Login'}
                    </Button>
                  </motion.div>
                </form>
              </TabsContent>

              <TabsContent value="owner">
                 <Tabs defaultValue="login" className="w-full pt-4">
                    <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="login"><LogIn className="mr-2 h-4 w-4"/>Sign In</TabsTrigger>
                        <TabsTrigger value="signup"><UserPlus className="mr-2 h-4 w-4"/>Sign Up</TabsTrigger>
                    </TabsList>

                    <TabsContent value="login">
                      <form onSubmit={handleOwnerLogin} className="space-y-4 pt-4">
                        <div>
                          <Label htmlFor="flatId">Flat ID</Label>
                          <Input id="flatId" type="text" placeholder="e.g., 1A1" value={ownerIdentifier} onChange={(e) => setOwnerIdentifier(e.target.value)} required className="mt-1 h-12 bg-gray-50" />
                        </div>
                        <div>
                          <Label htmlFor="ownerPassword">Password</Label>
                          <Input id="ownerPassword" type="password" placeholder="Enter your password" value={ownerPassword} onChange={(e) => setOwnerPassword(e.target.value)} required className="mt-1 h-12 bg-gray-50" />
                        </div>
                        <Button type="submit" disabled={isLoading} className="w-full h-12 bg-gradient-to-r from-[#667eea] to-[#764ba2] text-white font-bold text-base hover:opacity-90 transition-all duration-300 transform hover:scale-105">
                          {isLoading ? 'Signing In...' : 'Sign In'}
                        </Button>
                      </form>
                    </TabsContent>

                    <TabsContent value="signup">
                      <form onSubmit={handleOwnerSignup} className="space-y-4 pt-4">
                        <div className="grid grid-cols-3 gap-2">
                            <div className="col-span-3 sm:col-span-1">
                                <Label>Block</Label>
                                <Select onValueChange={(v) => {setSelectedBlock(v); setSelectedFloor(''); setSelectedFlat('');}} value={selectedBlock}>
                                <SelectTrigger className="mt-1"><SelectValue placeholder="Block"/></SelectTrigger>
                                <SelectContent>{blockOptions.map(b => <SelectItem key={b} value={b}>{b}</SelectItem>)}</SelectContent>
                                </Select>
                            </div>
                            <div className="col-span-3 sm:col-span-1">
                                <Label>Floor</Label>
                                <Select onValueChange={(v) => {setSelectedFloor(v); setSelectedFlat('');}} value={selectedFloor} disabled={!selectedBlock}>
                                <SelectTrigger className="mt-1"><SelectValue placeholder="Floor"/></SelectTrigger>
                                <SelectContent>{floorOptions.map(f => <SelectItem key={f} value={f}>{f}</SelectItem>)}</SelectContent>
                                </Select>
                            </div>
                            <div className="col-span-3 sm:col-span-1">
                                <Label>Flat</Label>
                                <Select onValueChange={setSelectedFlat} value={selectedFlat} disabled={!selectedFloor}>
                                <SelectTrigger className="mt-1"><SelectValue placeholder="Flat"/></SelectTrigger>
                                <SelectContent>{flatOptions.map(f => <SelectItem key={f} value={f}>{f}</SelectItem>)}</SelectContent>
                                </Select>
                            </div>
                        </div>

                        <div>
                            <Label htmlFor="signupPassword">Create Password</Label>
                            <Input id="signupPassword" type="password" placeholder="Choose a strong password" value={signupPassword} onChange={(e) => setSignupPassword(e.target.value)} required className="mt-1 h-12 bg-gray-50" />
                        </div>
                        <div>
                            <Label htmlFor="confirmPassword">Confirm Password</Label>
                            <Input id="confirmPassword" type="password" placeholder="Re-enter your password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required className="mt-1 h-12 bg-gray-50" />
                        </div>

                        <Button type="submit" disabled={isLoading} className="w-full h-12 bg-gradient-to-r from-[#6a82fb] to-[#fc5c7d] text-white font-bold text-base hover:opacity-90 transition-all duration-300 transform hover:scale-105">
                          {isLoading ? 'Creating Account...' : 'Sign Up'}
                        </Button>
                      </form>
                    </TabsContent>
                 </Tabs>
                 <div className="text-center mt-4">
                    <button 
                        onClick={() => toast({ title: "Password Reset", description: "Please contact the society office to reset your password."})} 
                        className="text-sm text-[#667eea] hover:underline font-medium"
                    >
                        Forgot your password?
                    </button>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <LoginPageContent />
    </Suspense>
  )
}

    
