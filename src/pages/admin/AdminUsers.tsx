
import React, { useState } from 'react';
import AdminLayout from '../../components/admin/AdminLayout';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { useQuery } from '@tanstack/react-query';
import { Loader2, RefreshCw } from 'lucide-react';
import UserAccountsTable from '@/components/admin/users/UserAccountsTable';
import { useNavigate } from 'react-router-dom';
import { UserProfile } from '@/lib/types';
import ModernAdminLayout from '../../components/admin/ModernAdminLayout';
import { supabase } from '@/integrations/supabase/client';

const AdminUsers = () => {
  const navigate = useNavigate();
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  
  const { 
    data: usersData = [], 
    isLoading, 
    error, 
    refetch 
  } = useQuery({
    queryKey: ['admin-all-users'],
    queryFn: fetchAllUsers,
    staleTime: 60000, // 1 minute
    refetchOnWindowFocus: false
  });

  async function fetchAllUsers(): Promise<UserProfile[]> {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select(`
          id,
          email,
          first_name,
          last_name,
          display_name,
          phone,
          avatar_url,
          reward_points,
          created_at,
          updated_at
        `)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching users:', error);
        throw error;
      }

      return (data || []).map((user: any): UserProfile => ({
        id: user.id,
        email: user.email || 'No email',
        first_name: user.first_name || '',
        last_name: user.last_name || '',
        display_name: user.display_name || user.email || 'Unknown User',
        avatar_url: user.avatar_url,
        created_at: user.created_at,
        updated_at: user.updated_at || user.created_at,
        phone_number: user.phone || '',
        reward_points: user.reward_points || 0,
      }));
    } catch (error) {
      console.error('Error in fetchAllUsers:', error);
      throw error;
    }
  }

  const handleRefresh = () => {
    refetch();
    toast.success('Refreshing user data');
  };

  const handleViewOrderHistory = (userId: string) => {
    setSelectedUserId(userId);
    navigate(`/admin/users/${userId}/orders`);
  };

  if (isLoading) {
    return (
      <ModernAdminLayout title="All Users">
        <div className="flex justify-center items-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          <span className="ml-2 text-gray-600">Loading user accounts...</span>
        </div>
      </ModernAdminLayout>
    );
  }

  if (error) {
    return (
      <ModernAdminLayout title="All Users">
        <div className="text-center py-8">
          <p className="text-red-500 mb-4">Error loading user accounts.</p>
          <Button onClick={() => refetch()}>Retry</Button>
        </div>
      </ModernAdminLayout>
    );
  }

  return (
    <ModernAdminLayout title="All Users">
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">All Registered Users ({usersData.length})</h1>
          <Button variant="outline" onClick={handleRefresh}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Refresh
          </Button>
        </div>
        
        <UserAccountsTable 
          users={usersData} 
          onViewOrderHistory={handleViewOrderHistory}
        />
      </div>
    </ModernAdminLayout>
  );
};

export default AdminUsers;
