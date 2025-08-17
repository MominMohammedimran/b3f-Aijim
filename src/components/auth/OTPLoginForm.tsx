import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useSupabaseClient } from '@/hooks/useSupabaseClient';
import { toast } from 'sonner';

interface OTPLoginFormProps {
  onSuccess: () => void;
}

const OTPLoginForm: React.FC<OTPLoginFormProps> = ({ onSuccess }) => {
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const supabase = useSupabaseClient();

  const sendOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      toast.error('Please enter your email');
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: `${window.location.origin}/`,
        }
      });

      if (error) {
        toast.error(error.message);
      } else {
        setOtpSent(true);
        toast.success('OTP sent to your email!');
      }
    } catch (error: any) {
      toast.error('Failed to send OTP');
    } finally {
      setLoading(false);
    }
  };

  const verifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otp) {
      toast.error('Please enter the OTP');
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.auth.verifyOtp({
        email,
        token: otp,
        type: 'email'
      });

      if (error) {
        toast.error(error.message);
      } else {
        toast.success('Successfully logged in!');
        onSuccess();
      }
    } catch (error: any) {
      toast.error('Failed to verify OTP');
    } finally {
      setLoading(false);
    }
  };

  if (!otpSent) {
    return (
      <form onSubmit={sendOTP} className="space-y-4">
        <h2 className="text-2xl font-bold text-center">Login with OTP</h2>
        
        <div>
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter your email"
            required
          />
        </div>

        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? 'Sending OTP...' : 'Send OTP'}
        </Button>
      </form>
    );
  }

  return (
    <form onSubmit={verifyOTP} className="space-y-4">
      <h2 className="text-2xl font-bold text-center">Enter OTP</h2>
      <p className="text-sm text-gray-600 text-center">
        We've sent a 6-digit code to {email}
      </p>
      
      <div>
        <Label htmlFor="otp">OTP Code</Label>
        <Input
          id="otp"
          type="text"
          value={otp}
          onChange={(e) => setOtp(e.target.value)}
          placeholder="Enter 6-digit OTP"
          maxLength={6}
          required
        />
      </div>

      <Button type="submit" className="w-full" disabled={loading}>
        {loading ? 'Verifying...' : 'Verify OTP'}
      </Button>

      <Button 
        type="button" 
        variant="outline" 
        className="w-full" 
        onClick={() => setOtpSent(false)}
      >
        Back to Email
      </Button>
    </form>
  );
};

export default OTPLoginForm;