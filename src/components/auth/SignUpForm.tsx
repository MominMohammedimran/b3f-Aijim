import React, { useState, useEffect } from "react";
import DOMPurify from "dompurify";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Eye, EyeOff } from "lucide-react";
import { useSupabaseClient } from "@/hooks/useSupabaseClient";
import GoogleSignInButton from "./GoogleSignInButton";

interface SignUpFormProps {
  onSuccess?: (email: string, password: string,fullName:string) => void;
}

const SignUpForm = ({ onSuccess }: SignUpFormProps) => {
  
const supabase=useSupabaseClient();
  const [step, setStep] = useState<"form" | "otp">("form");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [resendTimer, setResendTimer] = useState(60);

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Countdown for resend button
  useEffect(() => {
    if (step === "otp" && resendTimer > 0) {
      const t = setTimeout(() => setResendTimer((v) => v - 1), 1000);
      return () => clearTimeout(t);
    }
  }, [resendTimer, step]);

  // Signup → Send OTP
  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!fullName || !email || !password || !confirmPassword) return toast.error("Fill all fields");
    if (password !== confirmPassword) return toast.error("Passwords do not match");
    if (password.length < 6) return toast.error("Password must be at least 6 characters");

    setLoading(true);
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { data: { full_name: fullName }, emailRedirectTo: window.location.origin }
    });

    if (error) toast.error(error.message);
    else {
      toast.success("OTP sent");
      setStep("otp");
      setResendTimer(60);
    }

    setLoading(false);
  };

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    if (otp.length !== 6) return toast.error("Enter valid 6-digit OTP");

    setLoading(true);

    const { error } = await supabase.auth.verifyOtp({ email, token: otp, type: "email" });
    if (error) {
      toast.error(error.message);
      setLoading(false);
      return;
    }

    // Set password after OTP success
    const { error: updateError } = await supabase.auth.updateUser({ password });
    if (updateError) {
      toast.error(updateError.message);
      setLoading(false);
      return;
    }

    toast.success("Account created!");
    
    onSuccess?.(email, password,fullName);

    setLoading(false);
  };

  const handleResend = async () => {
    if (resendTimer !== 0) return;

    setLoading(true);
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: window.location.origin }
    });

    if (error) toast.error(error.message);
    else {
      toast.success("OTP resent!");
      setResendTimer(60);
    }

    setLoading(false);
  };

  // OTP Screen
  if (step === "otp") {
    return (
      <form onSubmit={handleVerifyOTP} className="space-y-6 w-full max-w-md bg-black p-2 text-white">
        <h2 className="text-center text-xl font-semibold">Verify OTP</h2>
        <p className="text-center text-sm text-gray-400">
          A 6-digit code was sent to <strong>{email}</strong>
        </p>

        <Input
          value={otp}
          onChange={(e) => setOtp(DOMPurify.sanitize(e.target.value))}
          maxLength={6}
          placeholder="Enter OTP"
          className="bg-gray-800 text-white"
        />

        <Button className="w-full" disabled={loading}>
          {loading ? "Verifying..." : "Verify OTP"}
        </Button>

        <div className="text-center text-sm">
          {resendTimer > 0 ? (
            <span className="text-gray-400">Resend OTP in {resendTimer}s</span>
          ) : (
            <button onClick={handleResend} className="text-blue-400 underline">Resend OTP</button>
          )}
        </div>
      </form>
    );
  }

  // Signup Form
  return (
    <form onSubmit={handleSignup} className="space-y-6 w-full max-w-md bg-black p-2 text-white">
      <h2 className="text-xl font-bold text-center">Create Account</h2>

      <div>
        <Label>Full Name</Label>
        <Input
         placeholder="Name" value={fullName} onChange={(e) => setFullName(DOMPurify.sanitize(e.target.value))} className="bg-gray-800" />
      </div>

      <div>
        <Label>Email</Label>
        <Input 
         placeholder="your-name@gmail.com" type="email" value={email} onChange={(e) => setEmail(DOMPurify.sanitize(e.target.value))} className="bg-gray-800" />
      </div>

      <div>
        <Label>Password</Label>
        <div className="relative">
          <Input
           placeholder="password"
            type={showPassword ? "text" : "password"}
            value={password}
            onChange={(e) => setPassword(DOMPurify.sanitize(e.target.value))}
            className="bg-gray-800 pr-10"
          />
          <span className="absolute right-2 top-2 cursor-pointer" onClick={() => setShowPassword(!showPassword)}>
            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </span>
        </div>
      </div>

      <div>
        <Label>Confirm Password</Label>
        <div className="relative">
          <Input
           placeholder="confirm password"
            type={showConfirmPassword ? "text" : "password"}
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(DOMPurify.sanitize(e.target.value))}
            className="bg-gray-800 pr-10"
          />
          <span className="absolute right-2 top-2 cursor-pointer" onClick={() => setShowConfirmPassword(!showConfirmPassword)}>
            {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </span>
        </div>
      </div>

      <Button type="submit" className="w-full" disabled={loading}>
        {loading ? "Sending OTP..." : "Create Account"}
      </Button>

      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t border-gray-700" />
        </div>
        <div className="relative flex justify-center text-xs uppercase text-gray-400">
          <span className="bg-black px-2">Or continue with</span>
        </div>
      </div>

      <GoogleSignInButton title="signup" />
    </form>
  );
};

export default SignUpForm;
