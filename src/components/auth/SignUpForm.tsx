
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { Eye, EyeOff } from 'lucide-react';
import GoogleSignInButton from './GoogleSignInButton';
import OTPValidation from './OTPValidation';

interface SignUpFormProps {
  onSuccess?: () => void;
}

const SignUpForm: React.FC<SignUpFormProps> = ({ onSuccess }) => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    fullName: ''
  });
  const [loading, setLoading] = useState(false);
  const [showOTP, setShowOTP] = useState(false);
  const [generatedOTP, setGeneratedOTP] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    if (formData.password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }

    setLoading(true);

    try {
      // Generate OTP
      const otp = Math.floor(100000 + Math.random() * 900000).toString();
      setGeneratedOTP(otp);
      
      // Send OTP via email
      const { error } = await supabase.functions.invoke('send-otp-email', {
        body: {
          email: formData.email,
          otp: otp,
          name: formData.fullName
        }
      });

      if (error) {
     //  console.error('OTP send error:', error);
        toast.error('Failed to send OTP. Please try again.');
        return;
      }

      // Show success message and switch to OTP form
      toast.success('OTP sent to your email!');
      setShowOTP(true);
    } catch (error: any) {
    //  console.error('OTP generation error:', error);
      toast.error('Failed to send OTP');
    } finally {
      setLoading(false);
    }
  };

  const handleOTPVerify = async (otp: string) => {
    if (otp !== generatedOTP) {
      toast.error('Invalid OTP. Please try again.');
      throw new Error('Invalid OTP');
    }

    try {
      // Create account after OTP verification
      const { data, error } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            full_name: formData.fullName
          },
          emailRedirectTo: `${window.location.origin}/`
        }
      });

      if (error) throw error;

      if (data.user) {
        toast.success('Account created successfully!');
        if (onSuccess) onSuccess();
      }
    } catch (error: any) {
   //   console.error('Account creation error:', error);
      toast.error(error.message || 'Failed to create account');
      throw error;
    }
  };

  const handleResendOTP = async () => {
    try {
      const otp = Math.floor(100000 + Math.random() * 900000).toString();
      setGeneratedOTP(otp);
      
      // Send new OTP via email
      const { error } = await supabase.functions.invoke('send-otp-email', {
        body: {
          email: formData.email,
          otp: otp,
          name: formData.fullName
        }
      });

      if (error) {
       // console.error('OTP resend error:', error);
        toast.error('Failed to resend OTP. Please try again.');
        return;
      }

      toast.success('New OTP sent to your email!');
    } catch (error: any) {
    //  console.error('OTP resend error:', error);
      toast.error('Failed to resend OTP');
    }
  };

  const handleBackToForm = () => {
    setShowOTP(false);
    setGeneratedOTP('');
  };

  const handleGoogleSuccess = () => {
    toast.success('Account created successfully with Google!');
    if (onSuccess) onSuccess();
  };

  if (showOTP) {
    return (
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-center">Verify Your Email</CardTitle>
        </CardHeader>
        <CardContent>
          <OTPValidation
            email={formData.email}
            onVerify={handleOTPVerify}
            onResend={handleResendOTP}
            onBack={handleBackToForm}
          />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="text-center">Create An Account</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
      
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="fullName">Full Name</Label>
            <Input
              id="fullName"
              name="fullName"
              type="text"
              required
              value={formData.fullName}
              onChange={handleChange}
              placeholder="Enter your full name"
            />
          </div>

          <div>
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              name="email"
              type="email"
              required
              value={formData.email}
              onChange={handleChange}
              placeholder="Enter your email"
            />
          </div>

          <div>
            <Label htmlFor="password">Password</Label>
            <div className="relative">
              <Input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                required
                value={formData.password}
                onChange={handleChange}
                placeholder="Enter your password"
                minLength={6}
                className="pr-10"
              />
              <button
                type="button"
                className="absolute inset-y-0 right-0 pr-3 flex items-center"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4 text-gray-400" />
                ) : (
                  <Eye className="h-4 w-4 text-gray-400" />
                )}
              </button>
            </div>
          </div>

          <div>
            <Label htmlFor="confirmPassword">Confirm Password</Label>
            <div className="relative">
              <Input
                id="confirmPassword"
                name="confirmPassword"
                type={showConfirmPassword ? "text" : "password"}
                required
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="Confirm your password"
                minLength={6}
                className="pr-10"
              />
              <button
                type="button"
                className="absolute inset-y-0 right-0 pr-3 flex items-center"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              >
                {showConfirmPassword ? (
                  <EyeOff className="h-4 w-4 text-gray-400" />
                ) : (
                  <Eye className="h-4 w-4 text-gray-400" />
                )}
              </button>
            </div>
          </div>

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? 'Sending OTP...' : 'Create Account'}
          </Button>
        </form>

       
        
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-background px-2 text-muted-foreground">Or continue with Google</span>
          </div>
        </div>
          

             <GoogleSignInButton onSuccess={handleGoogleSuccess} />

      </CardContent>
    </Card>
  );
};

export default SignUpForm;