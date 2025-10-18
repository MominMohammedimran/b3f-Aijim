import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Shield, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import ModernAdminLayout from '../../components/admin/ModernAdminLayout';

interface Profile {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  created_at: string;
  display_name?: string;
  phone?: string;
  reward_points?: number;
}

interface UserWithOrders extends Profile {
  orderCount: number;
  totalSpent: number;
}

const AdminProfiles = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const queryClient = useQueryClient();

  const {
    data: profiles = [],
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: ['profiles'],
    queryFn: fetchProfilesWithOrders,
    retry: 2,
    staleTime: 1000 * 60,
  });

  async function fetchProfilesWithOrders(): Promise<UserWithOrders[]> {
    try {
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('id, email, first_name, last_name, created_at, display_name, phone, reward_points')
        .order('created_at', { ascending: false });

      if (profilesError) throw profilesError;
      if (!profilesData?.length) return [];

      const profilesWithOrders = await Promise.all(
        profilesData.map(async (profile) => {
          const { data: orders, count } = await supabase
            .from('orders')
            .select('total', { count: 'exact' })
            .eq('user_id', profile.id);

          // Calculate total spent for this user
          const totalSpent = orders?.reduce((sum, o) => sum + (o.total || 0), 0) || 0;

          return {
            ...profile,
            orderCount: count || 0,
            totalSpent,
          };
        })
      );

      return profilesWithOrders;
    } catch (error) {
      console.error('Error loading profiles:', error);
      toast.error('Failed to load profiles');
      return [];
    }
  }

  const handleDeleteProfile = async (profileId: string, userName: string) => {
    if (!confirm(`Are you sure you want to delete ${userName}? This action cannot be undone.`)) return;

    try {
      const { error } = await supabase.from('profiles').delete().eq('id', profileId);
      if (error) throw error;

      queryClient.invalidateQueries({ queryKey: ['adminProfiles'] });
      refetch();
      toast.success('Profile deleted successfully');
    } catch (error) {
      console.error('Error deleting profile:', error);
      toast.error('Failed to delete profile');
    }
  };

  const filteredProfiles = profiles.filter(
    (profile) =>
      profile.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      `${profile.first_name} ${profile.last_name}`.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Calculate total revenue from all users
  const totalRevenue = filteredProfiles.reduce((sum, user) => sum + (user.totalSpent || 0), 0);

  return (
    <ModernAdminLayout title="Users">
      <div className="container mx-auto px-4 py-8 mt-10">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-white">Customer Profiles</h1>
          <Button variant="outline" className="flex items-center gap-2" onClick={() => refetch()}>
            <Shield size={16} />
            <span>Refresh Profiles</span>
          </Button>
        </div>

        <div className="mb-6">
          <Input
            placeholder="Search by name or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="max-w-md"
          />
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        ) : error ? (
          <div className="text-center py-8 text-destructive">
            Error loading profiles. Please try refreshing the page.
          </div>
        ) : filteredProfiles.length === 0 ? (
          <div className="bg-card rounded-lg shadow-sm p-8 text-center">
            <p className="text-muted-foreground">
              {searchTerm ? 'No profiles match your search.' : 'No profiles found.'}
            </p>
          </div>
        ) : (
          <>
            <div className="space-y-4">
              {filteredProfiles.map((profile) => (
                <Card key={profile.id} className="p-4 bg-gray-900 border border-gray-700 rounded-none shadow-md">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg text-white">
                        {profile.first_name || profile.display_name || 'No Name'} {profile.last_name || ''}
                      </h3>
                      <p className="text-gray-400 text-sm">{profile.email}</p>
                      <div className="flex flex-wrap gap-4 text-xs sm:text-sm text-gray-300 mt-2">
                        <span>📦 Orders: <strong>{profile.orderCount}</strong></span>
                        <span>💰 Total Spent: <strong>₹{profile.totalSpent.toLocaleString()}</strong></span>
                        <span>🗓 Joined: {new Date(profile.created_at).toLocaleDateString()}</span>
                        {profile.phone && <span>📞 {profile.phone}</span>}
                        {profile.reward_points && <span>⭐ Points: {profile.reward_points}</span>}
                      </div>
                    </div>

                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDeleteProfile(profile.id, `${profile.first_name} ${profile.last_name}`)}
                      className="flex items-center gap-2"
                    >
                      <Trash2 size={16} />
                      Delete
                    </Button>
                  </div>
                </Card>
              ))}
            </div>

            {/* 🧾 Total Revenue Summary */}
            <div className="mt-8 p-4 bg-gray-800 text-center rounded-none border border-gray-700 shadow-inner">
              <h2 className="text-lg font-semibold text-yellow-400">
                Total Revenue from All Customers: ₹{totalRevenue.toLocaleString()}
              </h2>
            </div>
          </>
        )}
      </div>
    </ModernAdminLayout>
  );
};

export default AdminProfiles;
