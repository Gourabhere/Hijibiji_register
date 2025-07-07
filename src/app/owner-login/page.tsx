
'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { loginOwnerAction } from '@/app/actions';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertTriangle } from 'lucide-react';

export default function OwnerLoginPage() {
  const [role, setRole] = useState('owner');
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();
  const { toast } = useToast();

  const handleAdminLogin = () => {
    router.push('/login');
  };

  const handleOwnerLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (role !== 'owner') return;

    setError('');
    setIsLoading(true);

    try {
      const result = await loginOwnerAction(identifier, password);
      if (result.success) {
        localStorage.setItem('isOwnerLoggedIn', 'true');
        localStorage.setItem('ownerFlatId', identifier);
        router.push('/owner');
      } else {
        setError(result.message);
      }
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#667eea] to-[#764ba2] flex flex-col items-center justify-center p-4 selection:bg-purple-200">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-sm space-y-8"
      >
        <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl p-8 pt-10 space-y-6">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-gray-800">Welcome Back</h2>
            <p className="text-gray-500 mt-2 text-sm">Please sign in to your account</p>
          </div>
          
          {error && (
              <Alert variant="destructive">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertTitle>Login Failed</AlertTitle>
                  <AlertDescription>{error}</AlertDescription>
              </Alert>
          )}

          <div className="flex gap-2 rounded-lg bg-gray-100 p-1">
              <button
                  type="button"
                  onClick={() => setRole('owner')}
                  className={`w-full p-2.5 rounded-lg text-sm font-semibold transition-all flex items-center justify-center gap-2 ${role === 'owner' ? 'bg-[#667eea] text-white shadow' : 'text-gray-600 hover:bg-gray-200'}`}
              >
                  <span>🏠</span> Owner
              </button>
              <button
                  type="button"
                  onClick={handleAdminLogin}
                  className={`w-full p-2.5 rounded-lg text-sm font-semibold transition-all flex items-center justify-center gap-2 ${role === 'admin' ? 'bg-[#667eea] text-white shadow' : 'text-gray-600 hover:bg-gray-200'}`}
              >
                  <span>👨‍💼</span> Admin
              </button>
          </div>

          <form onSubmit={handleOwnerLogin} className="space-y-4">
              <div>
                  <Label htmlFor="flatId" className="text-gray-700 text-sm font-medium">Flat ID / Username</Label>
                  <Input
                      id="flatId"
                      type="text"
                      placeholder="Enter your flat ID (e.g., Block 1-1A)"
                      value={identifier}
                      onChange={(e) => setIdentifier(e.target.value)}
                      required
                      className="mt-1 h-12 bg-gray-50"
                  />
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
                      className="mt-1 h-12 bg-gray-50"
                  />
              </div>
              <Button
                  type="submit"
                  disabled={isLoading}
                  className="w-full h-12 bg-gradient-to-r from-[#667eea] to-[#764ba2] text-white font-bold text-base hover:opacity-90 transition-all duration-300 transform hover:scale-105"
              >
                  {isLoading ? 'Signing In...' : 'Sign In'}
              </Button>
          </form>
          
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
            <div className="text-6xl mb-4">🏢</div>
            <h1 className="text-3xl font-bold mb-2">Apartment Portal</h1>
            <p className="opacity-90 max-w-xs mx-auto text-sm">
                Access your apartment information, view maintenance status, and stay connected with your building community.
            </p>
        </div>
      </motion.div>
    </div>
  );
}
