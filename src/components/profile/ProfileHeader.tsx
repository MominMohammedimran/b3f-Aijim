import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { User, LogOut, Crown, Star } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { cleanupAuthState } from '@/context/AuthContext';

interface ProfileHeaderProps {
  name?: string;
  email?: string;
  createdAt?: string;
  onSignOut?: () => Promise<void>;
  signingOut?: boolean;
}

const ProfileHeader: React.FC<ProfileHeaderProps> = ({
  name,
  email,
  createdAt,
  onSignOut,
  signingOut = false
}) => {
  const { currentUser, signOut, userProfile } = useAuth();
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
    <div className="relative bg-gradient-to-br from-card via-card to-secondary rounded-lg p-8 border-2 border-border hover:border-primary transition-all duration-300 hover:shadow-glow overflow-hidden">
      {/* Background pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-4 right-4">
          <Crown className="h-24 w-24 text-primary" />
        </div>
        <div className="absolute bottom-4 left-4">
          <Star className="h-16 w-16 text-primary" />
        </div>
      </div>

      <div className="relative z-10">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between space-y-6 lg:space-y-0">
          <div className="flex items-center space-x-6">
            {/* Profile Avatar */}
            <div className="relative">
              <div className="h-20 w-20 rounded-full bg-gradient-to-br from-primary via-primary to-accent flex items-center justify-center shadow-lg border-4 border-background">
                <User className="h-10 w-10 text-primary-foreground" />
              </div>
              <div className="absolute -bottom-1 -right-1 h-6 w-6 bg-primary rounded-full border-2 border-background flex items-center justify-center">
                <Crown className="h-3 w-3 text-primary-foreground" />
              </div>
            </div>

            {/* User Info */}
            <div className="min-w-0 space-y-2">
              <h1 className="text-3xl font-bold uppercase tracking-wider text-foreground leading-tight">
                {name || userProfile?.display_name || 'STREETWEAR KING'}
              </h1>
              <p className="text-sm text-muted-foreground font-medium lowercase tracking-wide">
                {email || 'no email provided'}
              </p>
              {createdAt && (
                <p className="text-xs text-muted-foreground font-bold uppercase tracking-wider">
                  MEMBER SINCE {formatDate(createdAt)}
                </p>
              )}
            </div>
          </div>

          {/* Sign Out Button */}
          <div className="flex flex-col space-y-3">
            <div className="text-right space-y-1">
              <div className="text-sm font-bold uppercase tracking-wider text-primary">VIP MEMBER</div>
              <div className="text-xs text-muted-foreground font-medium">LIFETIME ACCESS</div>
            </div>
            <Button
              variant="destructive"
              onClick={handleSignOut}
              className="bg-destructive hover:bg-destructive/90 text-destructive-foreground font-bold uppercase tracking-wider px-6 py-3 border-2 border-transparent hover:border-destructive"
              disabled={signingOut || localSigningOut}
            >
              <LogOut className="h-4 w-4 mr-2" />
              {signingOut || localSigningOut ? 'SIGNING OUT...' : 'LOG OUT'}
            </Button>
          </div>
        </div>

        {/* Stats Row */}
        <div className="mt-8 grid grid-cols-3 gap-6">
          <div className="text-center p-4 bg-secondary/50 rounded-lg border border-border">
            <div className="text-xl font-bold text-primary">12</div>
            <div className="text-xs font-bold uppercase tracking-wider text-muted-foreground">ORDERS</div>
          </div>
          <div className="text-center p-4 bg-secondary/50 rounded-lg border border-border">
            <div className="text-xl font-bold text-primary">2.5K</div>
            <div className="text-xs font-bold uppercase tracking-wider text-muted-foreground">POINTS</div>
          </div>
          <div className="text-center p-4 bg-secondary/50 rounded-lg border border-border">
            <div className="text-xl font-bold text-primary">VIP</div>
            <div className="text-xs font-bold uppercase tracking-wider text-muted-foreground">STATUS</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileHeader;