import React, { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Shield, Trash2, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import ModernAdminLayout from "../../components/admin/ModernAdminLayout";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

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

interface Order {
  id: string;
  order_number: string;
  total: number;
  status: string;
  created_at: string;
  items?: { name: string; price: number; quantity: number }[];
}

interface UserWithOrders extends Profile {
  orderCount: number;
  totalSpent: number;
}

const AdminProfiles = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedUser, setSelectedUser] = useState<UserWithOrders | null>(null);
  const [userOrders, setUserOrders] = useState<Order[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(false);
  const queryClient = useQueryClient();

  // Fetch profiles with order counts + total spent
  const {
    data: profiles = [],
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ["profiles"],
    queryFn: fetchProfilesWithOrders,
    retry: 2,
    staleTime: 1000 * 60,
  });

  async function fetchProfilesWithOrders(): Promise<UserWithOrders[]> {
    try {
      const { data: profilesData, error: profilesError } = await supabase
        .from("profiles")
        .select("id, email, first_name, last_name, created_at, display_name, phone, reward_points")
        .order("created_at", { ascending: false });

      if (profilesError) throw profilesError;
      if (!profilesData) return [];

      const profilesWithOrders = await Promise.all(
        profilesData.map(async (profile) => {
          const { data: orders } = await supabase
            .from("orders")
            .select("id, total")
            .eq("user_id", profile.id);

          const orderCount = orders?.length || 0;
          const totalSpent = orders?.reduce((sum, o) => sum + (o.total || 0), 0) || 0;

          return { ...profile, orderCount, totalSpent };
        })
      );

      return profilesWithOrders;
    } catch (error) {
      console.error("Error loading profiles:", error);
      toast.error("Failed to load profiles");
      return [];
    }
  }

  // Fetch orders for popup
  const fetchUserOrders = async (userId: string) => {
    try {
      setLoadingOrders(true);
      const { data, error } = await supabase
        .from("orders")
        .select("id, order_number, total, status, created_at, items")
        .eq("user_id", userId)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setUserOrders(data || []);
    } catch (error) {
      console.error("Error fetching user orders:", error);
      toast.error("Failed to load user orders");
    } finally {
      setLoadingOrders(false);
    }
  };

  const handleDeleteProfile = async (profileId: string, userName: string) => {
    if (!confirm(`Delete ${userName}? This cannot be undone.`)) return;

    try {
      const { error } = await supabase.from("profiles").delete().eq("id", profileId);
      if (error) throw error;
      queryClient.invalidateQueries({ queryKey: ["profiles"] });
      toast.success("Profile deleted successfully");
    } catch {
      toast.error("Failed to delete profile");
    }
  };

  const filteredProfiles = profiles.filter(
    (p) =>
      p.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      `${p.first_name} ${p.last_name}`.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalRevenue = profiles.reduce((sum, p) => sum + (p.totalSpent || 0), 0);

  return (
    <ModernAdminLayout title="Users">
      <div className="container mx-auto px-4 py-8 mt-10">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Customer Profiles</h1>
          <Button variant="outline" onClick={() => refetch()} className="flex items-center gap-2">
            <Shield size={16} />
            Refresh
          </Button>
        </div>

        <Input
          placeholder="Search by name or email..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-md mb-6"
        />

        {isLoading ? (
          <div className="flex justify-center py-8">Loading...</div>
        ) : error ? (
          <div className="text-center text-red-500 py-8">Error loading profiles.</div>
        ) : filteredProfiles.length === 0 ? (
          <div className="text-center text-gray-400 py-8">No profiles found.</div>
        ) : (
          <div className="space-y-4">
            {filteredProfiles.map((profile) => (
              <Card key={profile.id} className="p-4 bg-gray-900 border-gray-700">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-semibold text-lg text-white">
                      {profile.first_name || profile.display_name || "No Name"} {profile.last_name || ""}
                    </h3>
                    <p className="text-gray-400 text-sm">{profile.email}</p>
                    <p className="text-gray-400 text-xs mt-1">
                      Orders: <span className="font-semibold">{profile.orderCount}</span> | Total:{" "}
                      <span className="font-semibold text-yellow-400">
                        ₹{profile.totalSpent.toFixed(2)}
                      </span>
                    </p>
                  </div>

                  <div className="flex gap-2">
                    {/* View Orders */}
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button
                          size="sm"
                          variant="secondary"
                          onClick={() => {
                            setSelectedUser(profile);
                            fetchUserOrders(profile.id);
                          }}
                        >
                          <Eye size={16} /> View Orders
                        </Button>
                      </DialogTrigger>

                     <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto bg-gray-950 text-white">
  <DialogHeader>
    <DialogTitle className="text-yellow-300 font-semibold">
      {profile.display_name || profile.first_name || "User"}’s Orders
    </DialogTitle>
  </DialogHeader>

  {loadingOrders ? (
    <p className="text-gray-400 py-4 text-center">Loading orders...</p>
  ) : userOrders.length === 0 ? (
    <p className="text-gray-400 py-6 text-center">No orders found</p>
  ) : (
    <div className="space-y-5">
      {userOrders.map((order) => (
        <div key={order.id} className="border border-gray-800 rounded-lg bg-gray-900 p-4">
          {/* Order Header */}
          <div className="flex justify-between items-start mb-3">
            <div>
              <p className="font-semibold text-yellow-400 text-sm">
                {order.order_number || order.id}
              </p>
              <p className="text-xs text-gray-400">
                {new Date(order.created_at).toLocaleString()}
              </p>
            </div>
            <span className="text-xs bg-gray-700 px-2 py-1 rounded uppercase tracking-wide">
              {order.status}
            </span>
          </div>

          {/* Items */}
          {Array.isArray(order.items) && order.items.length > 0 ? (
            <div className="space-y-3 max-h-64 overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-transparent">
              {order.items.map((item, idx) => (
                <div
                  key={idx}
                  className="flex items-center gap-3 border border-gray-800 p-2 rounded-md bg-gray-800"
                >
                  {/* Product Image */}
                  {item.image && (
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-12 h-12 object-cover rounded"
                    />
                  )}

                  {/* Product Details */}
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-white truncate">
                      {item.name}
                    </p>
                    <p className="text-xs text-gray-400">
                      {item.sizes?.map((s: any) => `${s.size} × ${s.quantity}`).join(", ")}
                    </p>
                  </div>

                  {/* Price */}
                  <div className="text-sm font-semibold text-green-400">
                    ₹{item.price}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-gray-500">No items available</p>
          )}

          {/* Order Footer */}
          <div className="mt-3 flex justify-between items-center border-t border-gray-800 pt-3">
            <span className="text-sm text-gray-400">Total:</span>
            <span className="text-yellow-400 font-semibold text-base">
              ₹{order.total}
            </span>
          </div>
        </div>
      ))}
    </div>
  )}
</DialogContent>

                    </Dialog>

                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() =>
                        handleDeleteProfile(profile.id, `${profile.first_name} ${profile.last_name}`)
                      }
                    >
                      <Trash2 size={16} /> Delete
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}

        <div className="text-right text-gray-300 font-semibold mt-6">
          Total Revenue from All Customers:{" "}
          <span className="text-green-400">₹{totalRevenue.toFixed(2)}</span>
        </div>
      </div>
    </ModernAdminLayout>
  );
};

export default AdminProfiles;
