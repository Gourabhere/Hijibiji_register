'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Building, Lock, Mail } from 'lucide-react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const router = useRouter();
  const { toast } = useToast();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (email === 'admin@hijibiji.com' && password === 'password') {
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
  };

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
            <CardTitle className="text-3xl font-bold text-slate-800 font-headline">Admin Portal</CardTitle>
            <CardDescription>Hijibiji Society Management</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="email" className="flex items-center text-slate-700"><Mail className="w-4 h-4 mr-2" />Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="admin@hijibiji.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
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
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="rounded-xl h-12 bg-white/80"
                />
              </div>
              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Button type="submit" className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 h-12 rounded-xl font-medium shadow-lg hover:shadow-xl transition-all duration-300">
                  Login
                </Button>
              </motion.div>
            </form>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
