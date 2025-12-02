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
   referral_source?:string;
}

interface Order {
  id: string;
  order_number: string;
  total: number;
  status: string;
  payment_status: string;
  created_at: string;
  items?: {
    name: string;
    price: number;
    quantity: number;
    image?: string;
    sizes?: { size: string; quantity: number }[];
  }[];
}

interface UserWithOrders extends Profile {
  orderCount: number;
  totalSpent: number;
}

const AdminProfiles = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [userOrders, setUserOrders] = useState<Order[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(false);
  const queryClient = useQueryClient();

  const {
    data: profiles = [],
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ["profiles"],
    queryFn: fetchProfilesWithOrders,
  });

  // Fetch profiles + their order stats
  async function fetchProfilesWithOrders(): Promise<UserWithOrders[]> {
    try {
      const { data: profilesData, error } = await supabase
        .from("profiles")
        .select(
          "id, email, first_name, last_name, created_at, display_name, phone, reward_points, referral_source"
        )
        .order("created_at", { ascending: false });

      if (error) throw error;
      if (!profilesData) return [];

      const enriched = await Promise.all(
        profilesData.map(async (profile) => {
          const { data: orders } = await supabase
            .from("orders")
            .select("id, total")
            .eq("user_id", profile.id);

          return {
            ...profile,
            orderCount: orders?.length || 0,
            totalSpent: orders?.reduce((s, o) => s + (o.total || 0), 0) || 0,
          };
        })
      );

      return enriched;
    } catch (err) {
      console.error(err);
      toast.error("Failed to load profiles");
      return [];
    }
  }

  // Fetch selected user's full order history
  const fetchUserOrders = async (userId: string) => {
    try {
      setLoadingOrders(true);

      const { data, error } = await supabase
        .from("orders")
        .select(
          "id, order_number, total, status, created_at, items, payment_status"
        )
        .eq("user_id", userId)
        .order("created_at", { ascending: false });

      if (error) throw error;

      setUserOrders(data || []);
    } catch {
      toast.error("Failed to load user orders.");
    } finally {
      setLoadingOrders(false);
    }
  };

  // Delete a profile
  const handleDeleteProfile = async (id: string, name: string) => {
    if (!confirm(`Delete ${name}? This cannot be undone.`)) return;

    try {
      const { error } = await supabase.from("profiles").delete().eq("id", id);
      if (error) throw error;

      queryClient.invalidateQueries({ queryKey: ["profiles"] });

      toast.success("Profile deleted");
    } catch {
      toast.error("Failed to delete profile");
    }
  };

  // Search logic
  const filteredProfiles = profiles.filter((p) => {
    const fullName = `${p.first_name} ${p.last_name}`.toLowerCase();
    return (
      fullName.includes(searchTerm.toLowerCase()) ||
      p.email?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  const usersWithOrders = filteredProfiles.filter((p) => p.orderCount > 0);
  const usersWithoutOrders = filteredProfiles.filter((p) => p.orderCount === 0);

  const totalRevenue = profiles.reduce(
    (acc, p) => acc + (p.totalSpent || 0),
    0
  );

  // Render user each row card
  const renderUserCard = (profile: UserWithOrders) => (
    <Card
      key={profile.id}
      className="p-4 bg-gray-900 border-gray-700 rounded-xl shadow-sm"
    >
      <div className="flex justify-between items-start">
        <div>
          <h3 className="font-semibold text-lg text-white">
            {profile.display_name || profile.first_name || "Unknown"}{" "}
            {profile.last_name || ""}
          </h3>
          <p className="text-gray-400 text-sm">account created - {profile. referral_source}</p>

          <p className="text-gray-400 text-xs mt-1">
            Orders: <span className="font-semibold">{profile.orderCount}</span>{" "}
            | Total:{" "}
            <span className="font-semibold text-yellow-400">
              ₹{profile.totalSpent.toFixed(2)}
            </span>
          </p>
           <p className="text-gray-400 text-sm">{profile.email}</p>
        </div>

        <div className="flex gap-2">
          {/* View Orders */}
          <Dialog>
            <DialogTrigger asChild>
              <Button
                size="sm"
                variant="secondary"
                onClick={() => fetchUserOrders(profile.id)}
              >
                <Eye size={16} /> View Orders
              </Button>
            </DialogTrigger>

            <DialogContent className="max-w-2xl bg-gray-950 text-white max-h-[85vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="text-yellow-300">
                  {profile.display_name || profile.first_name}’s Orders
                </DialogTitle>
              </DialogHeader>

              {loadingOrders ? (
                <p className="text-center py-6 text-gray-400">
                  Loading orders…
                </p>
              ) : userOrders.length === 0 ? (
                <p className="text-center py-6 text-gray-400">
                  No orders found.
                </p>
              ) : (
                <div className="space-y-4">
                  {userOrders.map((order) => (
                    <div
                      key={order.id}
                      className="border border-gray-800 rounded-lg p-4 bg-gray-900"
                    >
                      <div className="flex justify-between mb-3">
                        <div>
                          <p className="text-yellow-400 font-semibold text-sm">
                            {order.order_number || order.id}
                          </p>
                          <p className="text-xs text-gray-400">
                            {new Date(order.created_at).toLocaleString()}
                          </p>
                        </div>

                        <div className="flex flex-col gap-1">
                          <span className="text-xs bg-gray-700 px-2 py-1 rounded uppercase">
                            Pay: {order.payment_status}
                          </span>
                          <span className="text-xs bg-gray-700 px-2 py-1 rounded uppercase">
                            Status: {order.status}
                          </span>
                        </div>
                      </div>

                      {/* ITEMS LIST */}
                      {order.items?.length ? (
                        <div className="space-y-2">
                          {order.items.map((item, index) => (
                            <div
                              key={index}
                              className="flex items-center gap-3 p-2 bg-gray-800 rounded border border-gray-700"
                            >
                              {item.image && (
                                <img
                                  src={item.image}
                                  className="w-12 h-12 rounded object-cover"
                                />
                              )}
                              <div className="flex-1">
                                <p className="text-sm font-semibold text-white">
                                  {item.name}
                                </p>
                                <p className="text-xs text-gray-400">
                                  {item.sizes
                                    ?.map((s) => `${s.size} × ${s.quantity}`)
                                    .join(", ")}
                                </p>
                              </div>

                              <p className="text-green-400 text-sm font-semibold">
                                ₹{item.price}
                              </p>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-xs text-gray-500">No items</p>
                      )}

                      <div className="mt-3 flex justify-between border-t border-gray-800 pt-3">
                        <span className="text-sm text-gray-300">Total:</span>
                        <span className="text-yellow-400 font-bold">
                          ₹{order.total}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </DialogContent>
          </Dialog>

          {/* DELETE */}
          <Button
            size="sm"
            variant="destructive"
            onClick={() =>
              handleDeleteProfile(
                profile.id,
                `${profile.first_name} ${profile.last_name}`
              )
            }
          >
            <Trash2 size={16} /> Delete
          </Button>
        </div>
      </div>
    </Card>
  );

  return (
    <ModernAdminLayout title="Users">
      <div className="container mx-auto px-4 py-8 mt-10">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Customer Profiles</h1>

          <Button variant="outline" onClick={() => refetch()}>
            <Shield size={16} />
            Refresh
          </Button>
        </div>

        <Input
          placeholder="Search by name or email…"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-md mb-6"
        />

        {isLoading ? (
          <p className="text-center py-8">Loading…</p>
        ) : error ? (
          <p className="text-center text-red-500 py-8">
            Error loading profiles.
          </p>
        ) : (
          <>
            {usersWithOrders.length > 0 && (
              <>
                <h2 className="text-xl font-semibold text-yellow-400 underline mb-4">
                  Users With Orders
                </h2>
                <div className="space-y-4 border-b border-gray-700 pb-6">
                  {usersWithOrders.map(renderUserCard)}
                </div>
              </>
            )}

            {usersWithoutOrders.length > 0 && (
              <>
                <h2 className="text-xl font-semibold text-yellow-400 underline mt-8 mb-4">
                  Users Without Orders
                </h2>
                <div className="space-y-4">
                  {usersWithoutOrders.map(renderUserCard)}
                </div>
              </>
            )}
          </>
        )}

        <p className="text-right text-gray-300 font-semibold mt-6">
          Total Revenue:{" "}
          <span className="text-green-400">₹{totalRevenue.toFixed(2)}</span>
        </p>
      </div>
    </ModernAdminLayout>
  );
};

export default AdminProfiles;
