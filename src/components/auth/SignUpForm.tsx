import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Eye, EyeOff } from "lucide-react";
import { useSupabaseClient } from "@/hooks/useSupabaseClient";
import GoogleSignInButton from './GoogleSignInButton';
const SignUpForm = ({ onSuccess }: { onSuccess?: () => void }) => {
  const supabase = useSupabaseClient();

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

  // TIMER FOR RESEND
  useEffect(() => {
    if (step === "otp" && resendTimer > 0) {
      const t = setTimeout(() => setResendTimer(resendTimer - 1), 1000);
      return () => clearTimeout(t);
    }
  }, [resendTimer, step]);

  // SIGNUP HANDLE
  const handleSignup = async (e: any) => {
    e.preventDefault();

    if (!fullName || !email) {
      toast.error("Please fill all fields");
      return;
    }

    if (password.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }

    if (password !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    setLoading(true);

    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { full_name: fullName },
          emailRedirectTo: `${window.location.origin}/`,
        },
      });

      if (error) {
        toast.error(error.message);
      } else {
        toast.success("OTP sent to your email");
        setStep("otp");
        setResendTimer(60);
      }
    } catch {
      toast.error("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async (e: any) => {
    e.preventDefault();

    if (otp.length !== 6) {
      toast.error("Enter a valid 6-digit OTP");
      return;
    }

    setLoading(true);

    try {
      const { error } = await supabase.auth.verifyOtp({
        email,
        token: otp,
        type: "email",
      });

      if (error) {
        toast.error("Invalid OTP");
      } else {
        toast.success("Account created successfully");
        onSuccess?.();
      }
    } catch {
      toast.error("Failed to verify OTP");
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (resendTimer !== 0) return;

    const { error } = await supabase.auth.resend({
      type: "signup",
      email,
    });

    if (error) {
      toast.error("Failed to resend OTP");
      return;
    }

    toast.success("OTP resent!");
    setResendTimer(60);
  };

  // =====================
  // OTP SCREEN
  // =====================
  if (step === "otp") {
    return (
      <form
        onSubmit={handleVerifyOTP}
        className="space-y-6 w-full max-w-md bg-gray-900 text-white p-6 rounded-xl"
      >
        <h2 className="text-center text-xl">Verify OTP</h2>

        <p className="text-center text-sm text-gray-200">
          A 6-digit code has been sent to {email}
        </p>

        <Input
          className="bg-gray-800 text-white border-gray-700"
          value={otp}
          onChange={(e) => setOtp(e.target.value)}
          maxLength={6}
          placeholder="Enter OTP"
        />

        <Button className="w-full" disabled={loading}>
          {loading ? "Verifying..." : "Verify OTP"}
        </Button>

        <div className="text-center text-sm text-gray-400">
          {resendTimer > 0 ? (
            <>Resend OTP in {resendTimer}s</>
          ) : (
            <button onClick={handleResend} className="text-blue-400 underline">
              Resend OTP
            </button>
          )}
        </div>
      </form>
    );
  }

  // =====================
  // SIGNUP FORM
  // =====================
  return (
    <form
      onSubmit={handleSignup}
      className="space-y-6 w-full max-w-md bg-black text-white p-6 rounded-none"
    >
      <h2 className="text-xl font-bold text-center">Create Your Account</h2>

      {/* Full Name */}
      <div>
        <Label className="text-white">Full Name</Label>
        <Input
          className="bg-gray-800 text-white border-gray-700"
          value={fullName}
          placeholder="your full name example-john dee"
          onChange={(e) => setFullName(e.target.value)}
          required
        />
      </div>

      {/* Email */}
      <div>
        <Label className="text-white">Email</Label>
        <Input
          type="email"
          placeholder="yourname@gmail.com"
          className="bg-gray-800 text-white border-gray-700"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
      </div>

      {/* Password */}
      <div>
        <Label className="text-white">Password</Label>
        <div className="relative">
          <Input
            className="bg-gray-800 text-white border-gray-700 pr-10"
            type={showPassword ? "text" : "password"}
            value={password}
            placeholder="password"
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <button
            type="button"
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-300"
            onClick={() => setShowPassword(!showPassword)}
          >
            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </div>
      </div>

      {/* Confirm Password */}
      <div>
        <Label className="text-white">Confirm Password</Label>
        <div className="relative">
          <Input
            className="bg-gray-800 text-white border-gray-700 pr-10"
            type={showConfirmPassword ? "text" : "password"}
            value={confirmPassword}
            placeholder="password"
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
          />
          <button
            type="button"
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-300"
            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
          >
            {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </div>
      </div>

      <Button type="submit" className="w-full" disabled={loading}>
        {loading ? "Sending OTP..." : "Create Account"}
      </Button>
   <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="px-2 text-gray-300">Or continue with</span>
        </div>
      </div>

      <GoogleSignInButton title="signup"/>
    </form>
    
  );
};

export default SignUpForm;
