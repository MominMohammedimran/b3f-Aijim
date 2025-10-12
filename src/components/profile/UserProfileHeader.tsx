import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { User, LogOut } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { cleanupAuthState } from '@/context/AuthContext';
import{usePWAInstall}from '@/hooks/usePWAInstall'

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
  signingOut = false
}) => {
  const { currentUser, signOut, userProfile } = useAuth();
  const {canInstall,installApp,isInstalled}=usePWAInstall();
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
    const month = String(date.getMonth() + 1).padStart(2, '0'); // months are 0-indexed
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  } catch {
    return 'N/A';
  }
};


  return (
    <div className="w-full mb-8 p-2 pl-4 border  font-sans bg-gray-900 shadow-lg hover:shadow-2xl transition-all duration-300">
      <div className="flex flex-col sm:flex-row md:flex-row items-start md:items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="h-10 w-10 rounded-full bg-gradient-to-br from-yellow-400 to-yellow-600 flex items-center justify-center shadow-md">
            <User className="h-8 w-8 text-black" />
          </div>

          <div className="min-w-0">
  <h1 className="text-2xl font-bold font-sans text-white leading-relaxed truncate break-words max-w-[250px] sm:max-w-[300px] md:max-w-[400px]">
    {name || userProfile?.display_name || 'User'}
  </h1>
  <p className="text-xs text-gray-400 font-medium lowercase leading-snug line-clamp-1">
    {email || 'No email provided'}
  </p>
  
</div>

        </div>

        <div className="mt-4 md:mt-0">
          <Button
            variant="destructive"
            onClick={handleSignOut}
            className="flex items-center text-sm md:text-base bg-red-600 hover:bg-red-700 transition-colors"
            disabled={signingOut || localSigningOut}
          >
            <LogOut className="h-4 w-4 mr-2" />
            {signingOut || localSigningOut ? 'Signing Out...' : 'Log Out'}
          </Button>
        </div>
        
      </div>
    </div>
  );
};

export default UserProfileHeader;
