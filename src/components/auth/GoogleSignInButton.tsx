import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { Loader2 } from 'lucide-react';

interface GoogleSignInButtonProps {
  onSuccess?: () => void;
  className?: string;
  title?: "login" | "signup"; // 👈 NEW
}

const GoogleSignInButton: React.FC<GoogleSignInButtonProps> = ({
  onSuccess,
  className = '',
  title = "login", // default
}) => {
  const [loading, setLoading] = useState(false);

  const handleGoogleSignIn = async () => {
    setLoading(true);

    setTimeout(async () => {
      try {
        const { error } = await supabase.auth.signInWithOAuth({
          provider: 'google',
          options: {
            redirectTo: `${window.location.origin}`,
          },
        });

        if (error) throw error;

        toast.success(
          title === "signup" ? "Creating your account..." : "Redirecting to Google..."
        );

        if (onSuccess) onSuccess();
      } catch (error: any) {
        toast.error(error.message || 'Google sign-in failed');
        setLoading(false);
      }
    }, 300);
  };

  // UI Text based on title prop
  const buttonText = title === "signup" ? "Sign up with Google" : "Continue with Google";
  const loadingText = title === "signup" ? "Creating account..." : "Signing in...";

  return (
    <Button
      type="button"
      variant="outline"
      className={`w-full flex items-center justify-center bg-gray-800 text-white ${className} hover:bg-white hover:text-gray-800`}
      onClick={handleGoogleSignIn}
      disabled={loading}
    >
      {loading ? (
        <>
          <Loader2 className="w-4 h-4 mr-2 animate-spin" />

          <img
            src="/aijim-uploads/google/google_logo.webp"
            alt="Google"
            className="w-5 h-5 mr-2"
          />

          {loadingText}
        </>
      ) : (
        <>
          <img
            src="/aijim-uploads/google/google_logo.webp"
            alt="Google"
            className="w-5 h-5 mr-2"
          />
          {buttonText}
        </>
      )}
    </Button>
  );
};

export default GoogleSignInButton;
