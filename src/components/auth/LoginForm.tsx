
import React, { useState } from 'react';
import DOMPurify from 'dompurify';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Eye, EyeOff } from 'lucide-react';
import GoogleSignInButton from './GoogleSignInButton';
import OTPLoginForm from './OTPLoginForm';

interface LoginFormProps {
  onSubmit: (data: { email: string; password: string }) => Promise<void>;
  loading: boolean;
  onOTPSuccess?: () => void;
}

const LoginForm: React.FC<LoginFormProps> = ({ onSubmit, loading, onOTPSuccess }) => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showOTPLogin, setShowOTPLogin] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit(formData);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    const sanitizedValue = DOMPurify.sanitize(value);
    setFormData({
      ...formData,
      [name]: sanitizedValue
    });
  };

  if (showOTPLogin) {
    return <OTPLoginForm onSuccess={onOTPSuccess || (() => {})} />;
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 bg-black rounded-none">
      <h2 className="text-xl font-bold text-center">Welcome Back 👋</h2>

      <div>
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          name="email"
          type="email"
          value={formData.email}
          onChange={handleChange}
          placeholder="yourname@gmail.com"
          required
        />
      </div>

      <div>
        <Label htmlFor="password">Password</Label>
        <div className="relative">
          <Input
            id="password"
            name="password"
            type={showPassword ? "text" : "password"}
            value={formData.password}
            onChange={handleChange}
            placeholder="password"
            required
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

      <Button type="submit" className="w-full" disabled={loading}>
        {loading ? 'Signing in...' : 'Sign In'}
      </Button>

      <Button 
        type="button" 
        variant="outline" 
        className="w-full" 
        onClick={() => setShowOTPLogin(true)}
      >
        Login with OTP
      </Button>

      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="px-2 text-gray-300">Or continue with</span>
        </div>
      </div>

      <GoogleSignInButton title='login'/>
    </form>
  );
};

export default LoginForm;
