
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
    <div className="min-h-screen bg-gradient-to-br from-[#667eea] to-[#764ba2] flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="container flex bg-white rounded-2xl shadow-2xl overflow-hidden max-w-4xl w-full min-h-[600px]"
      >
        <div className="flex-1 p-10 flex flex-col justify-center bg-gradient-to-br from-slate-50 to-gray-100">
          <div className="max-w-sm mx-auto w-full">
            <h2 className="text-3xl font-bold text-gray-800 mb-2">Welcome Back</h2>
            <p className="text-gray-500 mb-8">Please sign in to your account.</p>

            {error && (
              <Alert variant="destructive" className="mb-4">
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>Login Failed</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <form onSubmit={role === 'owner' ? handleOwnerLogin : (e) => e.preventDefault()}>
              <div className="flex gap-2 mb-6 rounded-lg bg-gray-200 p-1">
                <button
                  type="button"
                  onClick={() => setRole('owner')}
                  className={`w-full p-2 rounded-md text-sm font-semibold transition-colors ${role === 'owner' ? 'bg-white text-[#667eea] shadow' : 'text-gray-600'}`}
                >
                  🏠 Owner
                </button>
                <button
                  type="button"
                  onClick={handleAdminLogin}
                  className={`w-full p-2 rounded-md text-sm font-semibold transition-colors ${role === 'admin' ? 'bg-white text-[#667eea] shadow' : 'text-gray-600'}`}
                >
                  👨‍💼 Admin
                </button>
              </div>

              {role === 'owner' && (
                <>
                  <div className="space-y-2 mb-4">
                    <Label htmlFor="flatId">Flat ID</Label>
                    <Input
                      id="flatId"
                      type="text"
                      placeholder="e.g., Block 1-1A"
                      value={identifier}
                      onChange={(e) => setIdentifier(e.target.value)}
                      required
                      className="h-12"
                    />
                  </div>
                  <div className="space-y-2 mb-6">
                    <Label htmlFor="password">Password</Label>
                    <Input
                      id="password"
                      type="password"
                      placeholder="Enter your password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      className="h-12"
                    />
                  </div>
                </>
              )}

              <Button
                type="submit"
                disabled={isLoading}
                className="w-full h-12 bg-gradient-to-r from-[#667eea] to-[#764ba2] text-white font-bold text-base hover:opacity-90 transition-opacity"
              >
                {isLoading ? 'Signing In...' : 'Sign In'}
              </Button>
            </form>
          </div>
        </div>
        <div className="flex-1 bg-gradient-to-br from-[#667eea] to-[#764ba2] text-white p-10 hidden md:flex flex-col justify-center items-center text-center">
            <div className="text-6xl mb-4">🏢</div>
            <h1 className="text-4xl font-bold mb-4">Hijibiji Society Portal</h1>
            <p className="text-lg opacity-90">
                Access your apartment information, view maintenance status, and stay connected with your building community.
            </p>
        </div>
      </motion.div>
    </div>
  );
}
