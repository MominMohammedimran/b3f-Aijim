import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { User, LogOut, Calendar, Download } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { cleanupAuthState } from '@/context/AuthContext';
import { usePWAInstall } from '@/hooks/usePWAInstall';

interface UserProfileHeaderProps {
  name?: string;
  email?: string;
  createdAt?: string;
  onSignOut?: () => Promise<void>;
  signingOut?: boolean;
}

const UserProfileHeader: React.FC<UserProfileHeaderProps> = ({
  name,
  email,
  createdAt,
  onSignOut,
  signingOut = false,
}) => {
  const { currentUser, signOut, userProfile } = useAuth();
  const { canInstall, installApp, isInstalled } = usePWAInstall();
  const navigate = useNavigate();
  const { clearCart } = useCart();
  const [localSigningOut, setLocalSigningOut] = useState(false);

  const handleSignOut = async () => {
    if (signingOut || localSigningOut) return;
    setLocalSigningOut(true);

    if (onSignOut) {
      await onSignOut();
      return;
    }

    try {
      cleanupAuthState();
      if (currentUser) {
        try {
          await supabase.from('carts').delete().eq('user_id', currentUser.id);
        } catch (error) {
          console.error('Error clearing cart:', error);
        }
      }

      clearCart();
      const { error } = await supabase.auth.signOut({ scope: 'global' });
      if (error) throw error;

      if (signOut) await signOut();

      toast.success('Signed out successfully');
      window.location.href = '/';
    } catch (error) {
      console.error('Sign out error:', error);
      toast.error('Failed to sign out');
      cleanupAuthState();
      window.location.href = '/signin';
    } finally {
      setLocalSigningOut(false);
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    try {
      const date = new Date(dateString);
      const day = String(date.getDate()).padStart(2, '0');
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const year = date.getFullYear();
      return `${day}/${month}/${year}`;
    } catch {
      return 'N/A';
    }
  };

  return (
    <div className="w-full mb-8 p-5 border border-gray-800 rounded-xl bg-gradient-to-br from-gray-950 to-gray-900 shadow-md hover:shadow-lg transition-all duration-300">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        {/* --- Left: Profile Info --- */}
        <div className="flex items-center gap-4">
          <div className="h-14 w-14 rounded-full bg-gradient-to-br from-yellow-400 to-yellow-600 flex items-center justify-center shadow-md">
            <User className="h-7 w-7 text-black" />
          </div>

          <div className="flex flex-col">
            <h1 className="text-xl sm:text-2xl font-semibold text-white leading-tight">
              {name || userProfile?.display_name || 'User'}
            </h1>
            <p className="text-sm text-gray-300 font-medium lowercase truncate max-w-[250px] sm:max-w-[320px]">
              {email || 'No email provided'}
            </p>

            {createdAt && (
              <div className="flex items-center font-semibold gap-2 mt-1 text-xs text-gray-500">
                <Calendar className="h-3.5 w-3.5 text-yellow-400" />
                <span>Joined {formatDate(createdAt)}</span>
              </div>
            )}
          </div>
        </div>

        {/* --- Right: Actions --- */}
        <div className="flex items-center gap-2 sm:gap-3 mt-2 sm:mt-0">
          {canInstall && !isInstalled && (
            <Button
              onClick={installApp}
              className="flex items-center gap-2 bg-yellow-500 hover:bg-yellow-600 text-black text-sm font-semibold rounded-md px-4 py-2 transition"
            >
              <Download className="h-4 w-4" />
              Install App
            </Button>
          )}

          <Button
            variant="destructive"
            onClick={handleSignOut}
            className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white font-semibold text-sm rounded-md px-4 py-2 transition"
            disabled={signingOut || localSigningOut}
          >
            <LogOut className="h-4 w-4" />
            {signingOut || localSigningOut ? 'Signing Out...' : 'Log Out'}
          </Button>
        </div>
      </div>

      {/* --- Divider Line --- */}
      <div className="mt-4 border-t border-gray-800"></div>

    
    </div>
  );
};

export default UserProfileHeader;
