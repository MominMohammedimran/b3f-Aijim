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

  // -------------------------------------------
  // FETCH GLOBAL NOTIFICATIONS (ALWAYS)
  // -------------------------------------------
  const fetchGlobalNotifications = async () => {
    try {
      const { data, error } = await supabase
        .from("global_notifications")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;

      return (data || []).map((g) => ({
        ...g,
        user_id: null,
        is_read: false,
        metadata: g.metadata ?? null,
      })) as Notification[];

    } catch (err) {
      console.error("Error loading global notifications:", err);
      return [];
    }
  };

  // -------------------------------------------
  // FETCH USER NOTIFICATIONS (ONLY IF LOGGED IN)
  // -------------------------------------------
  const fetchUserNotifications = async () => {
    if (!currentUser) return [];

    try {
      const { data, error } = await supabase
        .from("notifications")
        .select("*")
        .eq("user_id", currentUser.id)
        .order("created_at", { ascending: false });

      if (error) throw error;

      return data || [];

    } catch (err) {
      console.error("Error loading user notifications:", err);
      return [];
    }
  };

  // -------------------------------------------
  // MERGE BOTH SOURCES
  // -------------------------------------------
  const fetchNotifications = async () => {
    setLoading(true);

    const [globalList, userList] = await Promise.all([
      fetchGlobalNotifications(),
      fetchUserNotifications(),
    ]);

    // Merge
    const merged = [...globalList, ...userList];

    // Deduplicate
    const unique = Array.from(new Map(merged.map(n => [n.id, n])).values());

    // Sort
    unique.sort(
      (a, b) =>
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );

    // Count unread (global + user)
    const unread = unique.filter(n => !n.is_read).length;

    setNotifications(unique);
    setUnreadCount(unread);
    setLoading(false);
  };

  // -------------------------------------------
  // MARK AS READ (Only for user notifications)
  // -------------------------------------------
  const markAsRead = async (id: string) => {
    try {
      const notif = notifications.find(n => n.id === id);

      // Global notifications cannot be updated
      if (!notif || notif.user_id === null) {
        setNotifications(prev =>
          prev.map(n => (n.id === id ? { ...n, is_read: true } : n))
        );
        setUnreadCount(prev => Math.max(prev - 1, 0));
        return;
      }

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

  // -------------------------------------------
  // MARK ALL USER NOTIFICATIONS AS READ
  // -------------------------------------------
  const markAllAsRead = async () => {
    try {
      if (currentUser) {
        await supabase
          .from("notifications")
          .update({ is_read: true })
          .eq("user_id", currentUser.id)
          .eq("is_read", false);
      }

      // Update frontend state
      setNotifications(prev =>
        prev.map(n => ({ ...n, is_read: true }))
      );
      setUnreadCount(0);

    } catch (err) {
      console.error("Error marking all as read:", err);
    }
  };

  // -------------------------------------------
  // REAL TIME LISTENING
  // -------------------------------------------
  useEffect(() => {
    fetchNotifications();

    // Listen to GLOBAL notifications ALWAYS
    const globalChannel = supabase
      .channel("realtime-global")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          table: "global_notifications",
          schema: "public",
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

    // Listen to USER notifications ONLY when logged in
    let userChannel: any = null;

    if (currentUser) {
      userChannel = supabase
        .channel("realtime-user")
        .on(
          "postgres_changes",
          {
            event: "INSERT",
            table: "notifications",
            schema: "public",
            filter: `user_id=eq.${currentUser.id}`,
          },
          (payload) => {
            const newN = payload.new as Notification;
            setNotifications(prev => [newN, ...prev]);
            setUnreadCount(prev => prev + 1);
          }
        )
        .subscribe();
    }

    return () => {
      supabase.removeChannel(globalChannel);
      if (userChannel) supabase.removeChannel(userChannel);
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

