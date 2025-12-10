import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";

interface Notification {
  id: string
  user_id: string | null
  type: string
  title: string
  message: string
  link: string | null
  is_read: boolean
  metadata: any | null   // FIXED
  created_at: string
}
interface GlobalNotification {
  id: string
  type: string
  title: string
  message: string
  link: string | null
  metadata: any | null   // FIXED
  created_at: string
}



export const useNotifications = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const { currentUser } = useAuth();

  const fetchNotifications = async () => {
    if (!currentUser) {
      setNotifications([]);
      setUnreadCount(0);
      setLoading(false);
      return;
    }

    try {
      // 1) Fetch GLOBAL from globalnotification table
      const { data: globalData, error: globalErr } = await supabase
        .from("global_notifications")
        .select("*")
        .order("created_at", { ascending: false });

      if (globalErr) throw globalErr;

      const formattedGlobal = (globalData || []).map((g) => ({
  ...g,
  user_id: null,
  is_read: false,
  metadata: g.metadata ?? null,
})) as Notification[];


      // 2) Fetch USER notifications
      const { data: userData, error: userErr } = await supabase
        .from("notifications")
        .select("*")
        .eq("user_id", currentUser.id)
        .order("created_at", { ascending: false });

      if (userErr) throw userErr;

      // 3) Merge global + user
      const merged = [...formattedGlobal, ...(userData || [])];

      // 4) Remove duplicates
      const unique = Array.from(new Map(merged.map(n => [n.id, n])).values());

      // 5) Sort by date
      unique.sort(
        (a, b) =>
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );

      // 6) Count unread
      const unread = unique.filter(n => !n.is_read).length;

      setNotifications(unique);
      setUnreadCount(unread);

    } catch (err) {
      console.error("Error loading notifications:", err);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (id: string) => {
    try {
      // Only user notifications stored in DB can be updated
      const { error } = await supabase
        .from("notifications")
        .update({ is_read: true })
        .eq("id", id);

      if (error) throw error;

      setNotifications(prev =>
        prev.map(n => (n.id === id ? { ...n, is_read: true } : n))
      );

      setUnreadCount(prev => Math.max(prev - 1, 0));
    } catch (err) {
      console.error("Error marking as read:", err);
    }
  };

  const markAllAsRead = async () => {
    if (!currentUser) return;

    try {
      const { error } = await supabase
        .from("notifications")
        .update({ is_read: true })
        .eq("user_id", currentUser.id)
        .eq("is_read", false);

      if (error) throw error;

      setNotifications(prev =>
        prev.map(n => ({ ...n, is_read: true }))
      );
      setUnreadCount(0);

    } catch (err) {
      console.error("Error marking all as read:", err);
    }
  };

  // --------------------
  // REAL-TIME UPDATES
  // --------------------
  useEffect(() => {
    if (!currentUser) return;

    fetchNotifications();

    // 1) Listen for new USER notifications
    const userChannel = supabase
      .channel("user-notifications")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "notifications",
          filter: `user_id=eq.${currentUser.id}`,
        },
        (payload) => {
          const newN = payload.new as Notification;
          setNotifications(prev => [newN, ...prev]);
          setUnreadCount(prev => prev + 1);
        }
      )
      .subscribe();

    // 2) Listen for new GLOBAL notifications
   const globalChannel = supabase
  .channel("global-notifications")
  .on(
    "postgres_changes",
    {
      event: "INSERT",
      schema: "public",
      table: "global_notifications",   // FIXED
    },
    (payload) => {
      const g = payload.new as GlobalNotification;

      const formatted: Notification = {
        ...g,
        user_id: null,
        is_read: false,
      };

      setNotifications(prev => [formatted, ...prev]);
      setUnreadCount(prev => prev + 1);
    }
  )
  .subscribe();


    return () => {
      supabase.removeChannel(userChannel);
      supabase.removeChannel(globalChannel);
    };

  }, [currentUser?.id]);

  return {
    notifications,
    unreadCount,
    loading,
    markAsRead,
    markAllAsRead,
    refetch: fetchNotifications,
  };
};
