
'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Building, Lock, Mail, User, LogIn, UserPlus, AlertTriangle } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from '@/components/ui/checkbox';

import { loginOwnerAction, signupOwnerAction } from '@/app/actions';
import { HijibijiFlatData, BlockName, getFlatsForFloor } from '@/data/flat-data';

function LoginPageContent() {
  const router = useRouter();
  const { toast } = useToast();

  // Unified Login States
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');

  // Owner Signup States
  const [selectedBlock, setSelectedBlock] = useState('');
  const [selectedFloor, setSelectedFloor] = useState('');
  const [selectedFlat, setSelectedFlat] = useState('');
  const [signupPassword, setSignupPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  
  // Common states
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    // Admin check
    if (identifier.toLowerCase() === 'admin@hijibiji.com' && password === 'password') {
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
      } finally {
        setIsLoading(false);
      }
      return;
    }

    // Owner check
    try {
      const result = await loginOwnerAction(identifier, password);
      if (result.success && result.flatId) {
        localStorage.setItem('isOwnerLoggedIn', 'true');
        localStorage.setItem('ownerFlatId', result.flatId);
        localStorage.removeItem('isAdmin');
        router.push('/owner');
      } else {
        setError(result.message || "Invalid credentials. Please check your Email/Flat ID and password.");
      }
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred.');
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleOwnerSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!agreedToTerms) {
      setError("You must agree to the Terms of Service and Privacy Policy.");
      return;
    }
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
        router.push('/owner');

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
    <div className="min-h-screen flex items-center justify-center p-4 login-background">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Card className="w-full max-w-md shadow-2xl rounded-3xl bg-white/90 backdrop-blur-sm border-white/20">
          <CardHeader className="text-center">
            <Image
              src="https://ik.imagekit.io/gourabhere/20250710_125848.jpg?updatedAt=1752132747820"
              alt="Society Hub Logo"
              width={250}
              height={80}
              className="mx-auto"
              priority
            />
            <CardTitle className="font-headline text-xl mt-2">Society Hub</CardTitle>
            <CardDescription>Sign in or create your account</CardDescription>
          </CardHeader>
          <CardContent>
             <Tabs defaultValue="signin" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="signin"><LogIn className="mr-2 h-4 w-4"/>Sign In</TabsTrigger>
                    <TabsTrigger value="signup"><UserPlus className="mr-2 h-4 w-4"/>Sign Up</TabsTrigger>
                </TabsList>
                
                {error && (
                  <Alert variant="destructive" className="mt-4">
                      <AlertTriangle className="h-4 w-4" />
                      <AlertTitle>Action Failed</AlertTitle>
                      <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                <TabsContent value="signin">
                  <form onSubmit={handleLogin} className="space-y-4 pt-4">
                    <div>
                      <Label htmlFor="identifier">Flat ID</Label>
                      <Input 
                        id="identifier" 
                        type="text" 
                        placeholder="e.g., 1A1" 
                        value={identifier} 
                        onChange={(e) => setIdentifier(e.target.value)} 
                        required 
                        className="mt-1 h-12 bg-gray-50" />
                    </div>
                    <div>
                      <Label htmlFor="password">Password</Label>
                      <Input 
                        id="password" 
                        type="password" 
                        placeholder="Enter your password" 
                        value={password} 
                        onChange={(e) => setPassword(e.target.value)} 
                        required 
                        className="mt-1 h-12 bg-gray-50" />
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

                    <div className="flex items-start space-x-3 py-2">
                      <Checkbox
                        id="terms"
                        checked={agreedToTerms}
                        onCheckedChange={(checked) => setAgreedToTerms(checked === true)}
                      />
                      <div className="grid gap-1.5 leading-none">
                        <label
                          htmlFor="terms"
                          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                        >
                          I agree to the{' '}
                          <Link href="/terms" className="font-medium text-primary underline-offset-4 hover:underline">
                            Terms of Service
                          </Link>{' '}
                          and{' '}
                          <Link href="/privacy" className="font-medium text-primary underline-offset-4 hover:underline">
                            Privacy Policy
                          </Link>
                          . I consent to the collection and processing of my personal data.
                        </label>
                      </div>
                    </div>

                    <Button type="submit" disabled={isLoading || !agreedToTerms} className="w-full h-12 bg-gradient-to-r from-[#6a82fb] to-[#fc5c7d] text-white font-bold text-base hover:opacity-90 transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed">
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
