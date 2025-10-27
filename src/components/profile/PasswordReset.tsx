// PasswordReset.tsx (combined logic: magiclink OTP + reset password)
import React, { useState } from 'react';
import { Mail, Lock } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/context/AuthContext';

import { supabase} from '@/integrations/supabase/client';



export default function PasswordReset() {
  const {  userProfile } = useAuth();
  const [email, setEmail] = useState(userProfile.email);
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');

  const [step, setStep] = useState<'request' | 'verify' | 'done'>('request');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSendOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const { error } = await supabase.auth.signInWithOtp({ email });

    if (error) setError(error.message);
    else setStep('verify');

    setLoading(false);
  };

  const handleVerifyAndReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Verify OTP and create session
    const { data: verifyData, error: verifyError } = await supabase.auth.verifyOtp({
      email,
      token: otp,
      type: 'email',
    });

    if (verifyError) {
      setError(verifyError.message);
      setLoading(false);
      return;
    }

    // Update password
    const { error: updateError } = await supabase.auth.updateUser({
      password: newPassword,
    });

    if (updateError) setError(updateError.message);
    else setStep('done');

    setLoading(false);
  };

  return (
    <div className="w-full  text-white p-2 rounded-none shadow-md space-y-4">
      <h2 className="text-lg font-semibold ">Reset Your Password</h2>

      {step === 'request' && (
        <form onSubmit={handleSendOTP} className="space-y-4">
          <Label htmlFor="email">Email Address</Label>
          <div className="relative">
            <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <Input
              id="email"
              type="email"
              value={email}
            
              placeholder="you@example.com"
              className="pl-10 bg-gray-700 font-medium text-white border-gray-600"
              disabled
            />
          </div>
          <Button type="submit" disabled={loading} className="w-full text-white bg-blue-600 hover:bg-blue-700">
            {loading ? 'Sending OTP...' : 'Send OTP'}
          </Button>
        </form>
      )}

      {step === 'verify' && (
        <form onSubmit={handleVerifyAndReset} className="space-y-4">
          <Label htmlFor="otp">Enter OTP</Label>
          <Input
            id="otp"
            type="text"
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
            placeholder="Enter the OTP sent to your email"
            className="bg-gray-700 text-xs font-medium text-white border-gray-600"
            required
          />

          <Label htmlFor="newPassword">New Password</Label>
          <div className="relative">
            <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <Input
              id="newPassword"
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="New Password"
              className="pl-10 bg-gray-700 text-white border-gray-600"
              required
            />
          </div>

          <Button type="submit" disabled={loading} className="w-full text-white bg-green-600 hover:bg-green-700">
            {loading ? 'Resetting...' : 'Reset Password'}
          </Button>
        </form>
      )}

      {step === 'done' && (
        <div className="text-center space-y-2">
          <h3 className="text-white text-lg font-semibold">Password Reset Successful!</h3>
          <p>You can now log in with your new password.</p>
        </div>
      )}

      {error && (
        <p className="text-red-400 text-sm text-center mt-4">{error}</p>
      )}
    </div>
  );
}
