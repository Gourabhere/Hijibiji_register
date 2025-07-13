
'use client';

import React, { useState, useEffect, Suspense, useTransition } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Building, Lock, Mail, User, LogIn, UserPlus, AlertTriangle, Phone } from 'lucide-react';
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
import { useTheme } from 'next-themes';

import { loginOwnerAction, signupOwnerAction, getPreSignupFlatDataAction } from '@/app/actions';
import { HijibijiFlatData, BlockName, getFlatsForFloor } from '@/data/flat-data';
import { ThemeToggle } from '@/components/theme-toggle';
import { PhoneInput } from '@/components/ui/phone-input';


function HomePageContent() {
  const router = useRouter();
  const { toast } = useToast();
  const { setTheme } = useTheme();

  useEffect(() => {
    setTheme('light');
  }, [setTheme]);

  // Unified Login States
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');

  // Owner Signup States
  const [selectedBlock, setSelectedBlock] = useState('');
  const [selectedFloor, setSelectedFloor] = useState('');
  const [selectedFlat, setSelectedFlat] = useState('');
  const [signupPassword, setSignupPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [countryCode, setCountryCode] = useState('+91');
  const [contactNumber, setContactNumber] = useState('');
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  
  // Common states
  const [isLoading, setIsLoading] = useState(false);
  const [isCheckingFlat, startChecking] = useTransition();
  const [loginError, setLoginError] = useState('');
  const [signupError, setSignupError] = useState('');

  // Pre-load data logic
  useEffect(() => {
    if (selectedBlock && selectedFloor && selectedFlat) {
      const flatId = `${selectedBlock.replace('Block ', '')}${selectedFlat}${selectedFloor}`;
      startChecking(async () => {
        setSignupError('');
        const preSignupData = await getPreSignupFlatDataAction(flatId);
        if (preSignupData?.passwordExists) {
            setSignupError("An account for this flat already exists. Please log in.");
        }
      });
    }
  }, [selectedBlock, selectedFloor, selectedFlat]);
  
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
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
        setLoginError(result.message || "Invalid credentials. Please check your Email/Flat ID and password.");
      }
    } catch (err: any) {
      setLoginError(err.message || 'An unexpected error occurred.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleOwnerSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!agreedToTerms) {
      setSignupError("You must agree to the Terms of Service and Privacy Policy.");
      return;
    }
    if (signupPassword !== confirmPassword) {
      setSignupError("Passwords do not match.");
      return;
    }
    if (!selectedBlock || !selectedFloor || !selectedFlat) {
      setSignupError("Please select your block, floor, and flat.");
      return;
    }

    setSignupError('');
    setIsLoading(true);

    try {
      const formData = { countryCode, contactNumber };
      const result = await signupOwnerAction(selectedBlock, selectedFloor, selectedFlat, signupPassword, formData);
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
        setSignupError(result.message);
      }
    } catch (err: any) {
      setSignupError(err.message || 'An unexpected error occurred during signup.');
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
        <Card className="w-full max-w-md shadow-2xl rounded-3xl bg-card/90 backdrop-blur-sm border-border/20">
          <CardHeader className="text-center">
             <Image
              src="https://ik.imagekit.io/gourabhere/1000440858-removebg-preview.png?updatedAt=1752149396514"
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
                <TabsContent value="signin">
                  <div className="pt-2">
                    {loginError && (
                      <Alert variant="destructive" className="mb-4">
                          <AlertTriangle className="h-4 w-4" />
                          <AlertTitle>Login Failed</AlertTitle>
                          <AlertDescription>{loginError}</AlertDescription>
                      </Alert>
                    )}
                  </div>
                  <form onSubmit={handleLogin} className="space-y-4">
                    <div>
                      <Label htmlFor="identifier">Flat ID</Label>
                      <Input 
                        id="identifier" 
                        type="text" 
                        placeholder="e.g., 1A1" 
                        value={identifier} 
                        onChange={(e) => setIdentifier(e.target.value)} 
                        required 
                        className="mt-1 h-12 bg-muted/50" />
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
                        className="mt-1 h-12 bg-muted/50" />
                    </div>
                    <Button type="submit" disabled={isLoading} className="w-full h-12 bg-gradient-to-r from-primary to-accent text-primary-foreground font-bold text-base hover:opacity-90 transition-all duration-300 transform hover:scale-105">
                      {isLoading ? 'Signing In...' : 'Sign In'}
                    </Button>
                  </form>
                </TabsContent>

                <TabsContent value="signup">
                   <div className="pt-2">
                    {signupError && (
                      <Alert variant="destructive" className="mb-4">
                          <AlertTriangle className="h-4 w-4" />
                          <AlertTitle>Signup Failed</AlertTitle>
                          <AlertDescription>{signupError}</AlertDescription>
                      </Alert>
                    )}
                  </div>
                  <form onSubmit={handleOwnerSignup} className="space-y-4">
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

                    {isCheckingFlat && <p className="text-sm text-muted-foreground text-center">Checking flat status...</p>}
                    
                    <div>
                      <Label htmlFor="contactNumber" className="flex items-center gap-2 mb-1"><Phone className="w-4 h-4" />Contact Number</Label>
                      <PhoneInput
                        phone={contactNumber}
                        onPhoneChange={setContactNumber}
                        onCountryChange={(country) => setCountryCode(country.dialCode)}
                      />
                    </div>
                    
                    <div>
                        <Label htmlFor="signupPassword">Create Password</Label>
                        <Input id="signupPassword" type="password" placeholder="Choose a strong password" value={signupPassword} onChange={(e) => setSignupPassword(e.target.value)} required className="mt-1 h-12 bg-muted/50" />
                    </div>
                    <div>
                        <Label htmlFor="confirmPassword">Confirm Password</Label>
                        <Input id="confirmPassword" type="password" placeholder="Re-enter your password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required className="mt-1 h-12 bg-muted/50" />
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

                    <Button type="submit" disabled={isLoading || !agreedToTerms || isCheckingFlat} className="w-full h-12 bg-gradient-to-r from-primary to-accent text-primary-foreground font-bold text-base hover:opacity-90 transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed">
                      {isLoading ? 'Creating Account...' : 'Sign Up'}
                    </Button>
                  </form>
                </TabsContent>
             </Tabs>
             <div className="text-center mt-4">
                <button 
                    onClick={() => toast({ title: "Password Reset", description: "Please contact the society office to reset your password."})} 
                    className="text-sm text-primary hover:underline font-medium"
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

export default function HomePage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <HomePageContent />
    </Suspense>
  )
}
