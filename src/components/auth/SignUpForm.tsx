import React, { useState, useEffect } from "react";
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Eye, EyeOff } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

const SignUpForm = ({ onSuccess }: { onSuccess?: () => void }) => {
  const [step, setStep] = useState<"form" | "otp">("form");

  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    fullName: "",
  });

  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [resendTimer, setResendTimer] = useState(60);

  // RESEND TIMER COUNTDOWN
  useEffect(() => {
    if (step === "otp" && resendTimer > 0) {
      const t = setTimeout(() => setResendTimer(resendTimer - 1), 1000);
      return () => clearTimeout(t);
    }
  }, [resendTimer, step]);

  const handleChange = (e: any) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // STEP 1 — SEND OTP USING SUPABASE BUILT-IN
  const handleSignup = async (e: any) => {
    e.preventDefault();

    if (formData.password.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }
    if (formData.password !== formData.confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    setLoading(true);

    // ❗ Step 1: Create user but require OTP
    const { error } = await supabase.auth.signUp({
      email: formData.email,
      password: formData.password,
      options: {
        data: { full_name: formData.fullName },
        emailRedirectTo: window.location.origin,
      },
    });

    if (error) {
      toast.error(error.message);
      setLoading(false);
      return;
    }

    toast.success("OTP sent to your email");
    setStep("otp");
    setResendTimer(60);
    setLoading(false);
  };

  // STEP 2 — VERIFY OTP USING SUPABASE
  const handleVerifyOTP = async () => {
    if (otp.length !== 6) {
      toast.error("Enter a valid 6-digit OTP");
      return;
    }

    setLoading(true);

    const { error } = await supabase.auth.verifyOtp({
      email: formData.email,
      token: otp,
      type: "email",
    });

    if (error) {
      toast.error("Invalid OTP");
      setLoading(false);
      return;
    }

    toast.success("Account created successfully!");
    onSuccess?.();
    setLoading(false);
  };

  // RESEND OTP AFTER 1 MINUTE
  const handleResend = async () => {
    if (resendTimer !== 0) return;

    const { error } = await supabase.auth.resend({
      type: "signup",
      email: formData.email,
    });

    if (error) {
      toast.error("Failed to resend OTP");
      return;
    }

    toast.success("OTP resent!");
    setResendTimer(60);
  };

  // ============ UI RENDER ===========

  // OTP SCREEN
  if (step === "otp") {
    return (
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-center">Verify OTP</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-center text-sm text-gray-500">
            Enter the 6-digit code sent to <b>{formData.email}</b>
          </p>

          <Input
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
            maxLength={6}
            placeholder="Enter OTP"
          />

          <Button className="w-full" onClick={handleVerifyOTP} disabled={loading}>
            {loading ? "Verifying..." : "Verify"}
          </Button>

          <div className="text-center text-sm text-gray-400">
            {resendTimer > 0 ? (
              <>Resend OTP in {resendTimer}s</>
            ) : (
              <button
                onClick={handleResend}
                className="text-blue-500 underline"
              >
                Resend OTP
              </button>
            )}
          </div>
        </CardContent>
      </Card>
    );
  }

  // SIGNUP FORM SCREEN
  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="text-center">Create An Account</CardTitle>
      </CardHeader>

      <CardContent className="space-y-4">
        <form onSubmit={handleSignup} className="space-y-4">

          <div>
            <Label>Full Name</Label>
            <Input
              name="fullName"
              value={formData.fullName}
              onChange={handleChange}
              required
            />
          </div>

          <div>
            <Label>Email</Label>
            <Input
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>

          <div>
            <Label>Password</Label>
            <div className="relative">
              <Input
                name="password"
                type={showPassword ? "text" : "password"}
                className="pr-10"
                minLength={6}
                onChange={handleChange}
                value={formData.password}
                required
              />
              <button
                type="button"
                className="absolute right-3 top-1/2 -translate-y-1/2"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <div>
            <Label>Confirm Password</Label>
            <div className="relative">
              <Input
                name="confirmPassword"
                type={showConfirmPassword ? "text" : "password"}
                className="pr-10"
                onChange={handleChange}
                value={formData.confirmPassword}
                required
              />
              <button
                type="button"
                className="absolute right-3 top-1/2 -translate-y-1/2"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              >
                {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <Button className="w-full" type="submit" disabled={loading}>
            {loading ? "Sending OTP..." : "Create Account"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default SignUpForm;
