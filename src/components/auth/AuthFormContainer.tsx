import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import SignUpForm from './SignUpForm';
import LoginForm from './LoginForm';
import { Button } from '@/components/ui/button';
import { newUserNotification } from "@/services/adminNotificationService";

const AuthFormContainer = ({ mode = 'signin' }) => {
  const [currentMode, setCurrentMode] = useState(mode);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const switchAuthTab = (target: 'signin' | 'signup') => {
    window.dispatchEvent(new CustomEvent("switch-tab", { detail: target }));
  };

  /** ✨ Signup Completed + OTP Verified Handler */
const handleSignupSuccess = async (email: string, password: string,fullName:string) => {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      toast.error("Account created but login failed.");
      return;
    }

    const referral = sessionStorage.getItem("referral_source") || "direct";

    // 👇 FIX: Safe insert/update without conflict
    await supabase.from("profiles").upsert(
      { 
        id: data.user.id, 
        display_name:fullName,
        email, 
        referral_source: referral 
      },
      { onConflict: "id" }
    );

    toast.success("Welcome to Aijim Family ❤️");
    try {
                    await newUserNotification(data.user.id, 'Welcome to Aijim Family ', fullName
                     );
                  } catch (notifErr) {
                    console.error("Failed to send in-app notification:", notifErr);
                  }
    navigate("/");
  } catch {
    toast.error("Unexpected error during login.");
  }
};

  /** ✨ Normal Login Handler */
 const handleSignIn = async ({ email, password }) => {
  setLoading(true);

  try {
    const { data: authData, error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      toast.error(
        error.message.toLowerCase().includes("invalid login credentials")
          ? "Invalid email or password."
          : error.message
      );
      throw error;
    }

    if (authData?.user) {
      const referral = sessionStorage.getItem("referral_source") || "direct";

      // Ensure profile always exists
      await supabase.from("profiles").upsert(
        { id: authData.user.id, email, referral_source: referral },
        { onConflict: "id" }
      );

      toast.success("Signed in successfully!");
      navigate("/");
    }
  } finally {
    setLoading(false);
  }
};


  return (
    <div className="flex justify-center bg-black">
      <div className="max-w-md w-full space-y-4 bg-black">

        {currentMode === 'signin' ? (
          <div className="p-2">
            <LoginForm onSubmit={handleSignIn} loading={loading} />
            <div className="mt-4 text-center text-gray-300">
              Don't have an account?{" "}
              <Button
                variant="link"
                className="font-semibold"
                onClick={() => { switchAuthTab("signup"); setCurrentMode("signup"); }}
              >
                Sign up
              </Button>
            </div>
          </div>
        ) : (
          <div className="p-2">
            {/* 👇 IMPORTANT: Pass the success callback */}
            <SignUpForm onSuccess={handleSignupSuccess} />

            <div className="mt-4 text-center font-medium text-gray-300">
              Already have an account ? 
              <Button
                variant="link"
                className="font-semibold"
                onClick={() => { switchAuthTab("signin"); setCurrentMode("signin"); }}
              >
                Sign in
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AuthFormContainer;
