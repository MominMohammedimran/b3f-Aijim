import React, { useState, useEffect } from 'react';
import DOMPurify from 'dompurify';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useSupabaseClient } from '@/hooks/useSupabaseClient';
import { toast } from 'sonner';
import { motion } from 'framer-motion';
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp"

interface OTPLoginFormProps {
  onSuccess: () => void;
}

const OTP_EXPIRATION_TIME = 600; // 10 minutes in seconds

const OTPLoginForm: React.FC<OTPLoginFormProps> = ({ onSuccess }) => {
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const supabase = useSupabaseClient();
  
  const [timer, setTimer] = useState(OTP_EXPIRATION_TIME);
  const [progress, setProgress] = useState(100);

  useEffect(() => {
    if (otpSent && timer > 0) {
      const intervalId = setInterval(() => {
        setTimer(prevTimer => prevTimer - 1);
      }, 1000);
      return () => clearInterval(intervalId);
    }
  }, [otpSent, timer]);

  useEffect(() => {
    setProgress((timer / OTP_EXPIRATION_TIME) * 100);
    if (timer === 0) {
      toast.info('OTP has expired. Please request a new one.');
    }
  }, [timer]);

  const handleSendOTP = async (e: React.FormEvent) => {
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
        toast.success('OTP has been sent to your email.');
        setOtpSent(true);
        setTimer(OTP_EXPIRATION_TIME);
        setProgress(100);
      }
    } catch (error: any) {
      toast.error('Failed to send OTP');
    } finally {
      setLoading(false);
    }
  };

  const handleResendOTP = async () => {
    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithOtp({ email });
      if (error) {
        toast.error(`Failed to resend OTP: ${error.message}`);
      } else {
        toast.success('A new OTP has been sent to your email.');
        setOtp('');
        setTimer(OTP_EXPIRATION_TIME);
        setProgress(100);
      }
    } catch (error) {
      toast.error('An unexpected error occurred while resending OTP.');
    } finally {
      setLoading(false);
    }
  };

  const verifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otp || otp.length < 6) {
      toast.error('Please enter the 6-digit OTP');
      return;
    }
    if (timer === 0) {
      toast.error('OTP has expired. Please request a new one.');
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase.auth.verifyOtp({
        email,
        token: otp,
        type: 'email',
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
      <form onSubmit={handleSendOTP} className="space-y-4">
        <h2 className="text-2xl font-bold text-center">Login with OTP</h2>
        
        <div>
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(DOMPurify.sanitize(e.target.value))}
            placeholder="Enter your email"
            required
            disabled={loading}
          />
        </div>

        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? 'Sending OTP...' : 'Send OTP'}
        </Button>
      </form>
    );
  }

  return (
    <form onSubmit={verifyOTP} className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold">Enter OTP</h2>
        <p className="text-sm text-gray-400">
          We've sent a 6-digit code to {email}
        </p>
      </div>
      
      <div className="flex justify-center">
        <InputOTP maxLength={6} value={otp} onChange={(value) => setOtp(DOMPurify.sanitize(value))}>
          <InputOTPGroup>
            <InputOTPSlot index={0} />
            <InputOTPSlot index={1} />
            <InputOTPSlot index={2} />
            <InputOTPSlot index={3} />
            <InputOTPSlot index={4} />
            <InputOTPSlot index={5} />
          </InputOTPGroup>
        </InputOTP>
      </div>

      {/* Progress Bar and Timer */}
      <div className="space-y-2">
        <div className="w-full h-1.5 bg-gray-700 rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-yellow-400"
            initial={{ width: '100%' }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 1, ease: "linear" }}
          />
        </div>
        <div className="flex justify-between items-center text-sm text-gray-400">
           <span>Time remaining: {Math.floor(timer / 60)}:{(timer % 60).toString().padStart(2, '0')}</span>
           {timer === 0 && (
             <Button 
                variant="link" 
                className="p-0 h-auto text-yellow-400" 
                onClick={handleResendOTP}
                disabled={loading}
              >
                Resend OTP
             </Button>
           )}
        </div>
      </div>

      <Button type="submit" className="w-full" disabled={loading || otp.length < 6 || timer === 0}>
        {loading ? 'Verifying...' : 'Verify OTP'}
      </Button>

      <Button 
        type="button" 
        variant="outline" 
        className="w-full" 
        onClick={() => setOtpSent(false)}
        disabled={loading}
      >
        Back to Email
      </Button>
    </form>
  );
};

export default OTPLoginForm;