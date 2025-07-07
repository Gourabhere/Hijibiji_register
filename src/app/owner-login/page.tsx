
'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { loginOwnerAction, signupOwnerAction } from '@/app/actions';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertTriangle, UserPlus, LogIn } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { HijibijiFlatData, BlockName } from '@/data/flat-data';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import Link from 'next/link';


export default function OwnerLoginPage() {
  const [mode, setMode] = useState('login');
  
  // Login States
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // Signup States
  const [selectedBlock, setSelectedBlock] = useState('');
  const [selectedFloor, setSelectedFloor] = useState('');
  const [selectedFlat, setSelectedFlat] = useState('');
  const [signupPassword, setSignupPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSigningUp, setIsSigningUp] = useState(false);
  
  const router = useRouter();
  const { toast } = useToast();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const result = await loginOwnerAction(identifier, password);
      if (result.success) {
        localStorage.setItem('isOwnerLoggedIn', 'true');
        localStorage.setItem('ownerFlatId', identifier);
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

  const handleSignup = async (e: React.FormEvent) => {
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
    setIsSigningUp(true);

    try {
      const result = await signupOwnerAction(selectedBlock, selectedFloor, selectedFlat, signupPassword);
      if (result.success && result.flatId) {
        toast({
          title: 'Signup Successful!',
          description: "Redirecting to your dashboard...",
        });
        
        // Automatically log the user in after successful signup
        localStorage.setItem('isOwnerLoggedIn', 'true');
        localStorage.setItem('ownerFlatId', result.flatId);
        localStorage.removeItem('isAdmin');
        router.push('/');

      } else {
        setError(result.message);
      }
    } catch (err: any)
      {
      setError(err.message || 'An unexpected error occurred during signup.');
    } finally {
      setIsSigningUp(false);
    }
  };

  const blockOptions = Object.keys(HijibijiFlatData) as BlockName[];
  const floorOptions = selectedBlock ? Array.from({ length: HijibijiFlatData[selectedBlock as BlockName].floors }, (_, i) => String(i + 1)) : [];
  const flatOptions = selectedBlock ? HijibijiFlatData[selectedBlock as BlockName].flatsPerFloor : [];

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#667eea] to-[#764ba2] flex flex-col items-center justify-center p-4 selection:bg-purple-200">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-sm space-y-8"
      >
        <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl p-8 space-y-6">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-gray-800">Owner Portal</h2>
            <p className="text-gray-500 mt-2 text-sm">Sign in or create your account</p>
          </div>
          
          <Tabs defaultValue="login" value={mode} className="w-full" onValueChange={setMode}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="login"><LogIn className="mr-2 h-4 w-4"/>Sign In</TabsTrigger>
              <TabsTrigger value="signup"><UserPlus className="mr-2 h-4 w-4"/>Sign Up</TabsTrigger>
            </TabsList>
            
            {error && (
              <Alert variant="destructive" className="mt-4">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertTitle>{mode === 'login' ? 'Login Failed' : 'Signup Failed'}</AlertTitle>
                  <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <TabsContent value="login">
              <form onSubmit={handleLogin} className="space-y-4 pt-4">
                <div>
                  <Label htmlFor="flatId">Flat ID</Label>
                  <Input id="flatId" type="text" placeholder="e.g., Block 1-1A" value={identifier} onChange={(e) => setIdentifier(e.target.value)} required className="mt-1 h-12 bg-gray-50" />
                </div>
                <div>
                  <Label htmlFor="password">Password</Label>
                  <Input id="password" type="password" placeholder="Enter your password" value={password} onChange={(e) => setPassword(e.target.value)} required className="mt-1 h-12 bg-gray-50" />
                </div>
                <Button type="submit" disabled={isLoading} className="w-full h-12 bg-gradient-to-r from-[#667eea] to-[#764ba2] text-white font-bold text-base hover:opacity-90 transition-all duration-300 transform hover:scale-105">
                  {isLoading ? 'Signing In...' : 'Sign In'}
                </Button>
              </form>
            </TabsContent>

            <TabsContent value="signup">
              <form onSubmit={handleSignup} className="space-y-4 pt-4">
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
                    <Select onValueChange={setSelectedFloor} value={selectedFloor} disabled={!selectedBlock}>
                      <SelectTrigger className="mt-1"><SelectValue placeholder="Floor"/></SelectTrigger>
                      <SelectContent>{floorOptions.map(f => <SelectItem key={f} value={f}>{f}</SelectItem>)}</SelectContent>
                    </Select>
                  </div>
                  <div className="col-span-3 sm:col-span-1">
                    <Label>Flat</Label>
                    <Select onValueChange={setSelectedFlat} value={selectedFlat} disabled={!selectedBlock}>
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

                <Button type="submit" disabled={isSigningUp} className="w-full h-12 bg-gradient-to-r from-[#6a82fb] to-[#fc5c7d] text-white font-bold text-base hover:opacity-90 transition-all duration-300 transform hover:scale-105">
                  {isSigningUp ? 'Creating Account...' : 'Sign Up'}
                </Button>
              </form>
            </TabsContent>
          </Tabs>
          
          <div className="text-center">
              <button 
                onClick={() => toast({ title: "Password Reset", description: "Please contact the society office to reset your password."})} 
                className="text-sm text-[#667eea] hover:underline font-medium"
              >
                  Forgot your password?
              </button>
          </div>
        </div>

        <div className="text-center text-white p-4">
            <Link href="/login" className="text-sm text-white/80 hover:text-white hover:underline">
              Are you an Admin?
            </Link>
        </div>
      </motion.div>
    </div>
  );
}
