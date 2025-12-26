import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import ModernAdminLayout from '../../components/admin/ModernAdminLayout';
import CouponManagement from '../../components/admin/CouponManagement';
import { createNormalMessageNotification } from "@/services/adminNotificationService";

interface Settings {
  site_name: string;
  site_description: string;
  contact_email: string;
  contact_phone: string;
  business_address: string;
  delivery_fee: number;
  min_order_amount: number;
}
interface AdminNotification {
  id: string;
  title: string;
  message: string;
  created_at: string;
}




const AdminSettings = () => {
  const [settings, setSettings] = useState<Settings>({
    site_name: 'Aijim',
    site_description: 'Premium oversized affordable tshirt',
    contact_email: 'aijim.official@gmail.com',
    contact_phone: '+91 7672080881',
    business_address: 'India',
    delivery_fee: 0,
    min_order_amount: 100
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  // Notification state
  const [notifications, setNotifications] = useState<AdminNotification[]>([]);
const [loadingNotifications, setLoadingNotifications] = useState(false);
  const [notificationTitle, setNotificationTitle] = useState('');
  const [notificationMessage, setNotificationMessage] = useState('');
  const [isSendingNotification, setIsSendingNotification] = useState(false);

  useEffect(() => {
    loadSettings();
    loadNotifications();
  }, []);

  const loadSettings = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.rpc('get_admin_settings');
      if (error) throw error;

      if (data && Array.isArray(data) && data.length > 0) {
        const settingsData = data[0];
        setSettings({
          site_name: settingsData.site_name || 'B3F Prints',
          site_description: settingsData.site_description || 'Custom printing services',
          contact_email: settingsData.contact_email || 'contact@b3fprints.com',
          contact_phone: settingsData.contact_phone || '+91 9999999999',
          business_address: settingsData.business_address || 'India',
          delivery_fee: Number(settingsData.delivery_fee) || 80,
          min_order_amount: Number(settingsData.min_order_amount) || 100
        });
        toast.success('Settings loaded from database');
      } else {
        toast.info('No settings found, using defaults');
      }
    } catch (error: any) {
      console.error('Error loading settings:', error);
      toast.error('Failed to load settings: ' + (error?.message || 'Unknown error'));
    } finally {
      setLoading(false);
    }
  };
  const loadNotifications = async () => {
    setLoadingNotifications(true);
    try {
      const { data, error } = await supabase
        .from("global_notifications")
        .select("id, title, message, created_at")
        .order("created_at", { ascending: false })
        .limit(10);
  
      if (error) throw error;
      setNotifications(data || []);
    } catch (err) {
      console.error("Failed to load notifications", err);
      toast.error("Failed to load notifications");
    } finally {
      setLoadingNotifications(false);
    }
  };
  
  const handleSave = async () => {
    setSaving(true);
    try {
      const { error } = await supabase.rpc('update_admin_settings', {
        p_site_name: settings.site_name,
        p_site_description: settings.site_description,
        p_contact_email: settings.contact_email,
        p_contact_phone: settings.contact_phone,
        p_business_address: settings.business_address,
        p_delivery_fee: settings.delivery_fee,
        p_min_order_amount: settings.min_order_amount
      });
      if (error) throw error;

      toast.success('Settings saved successfully!');
      setTimeout(() => window.location.reload(), 800);
    } catch (error: any) {
      console.error('Error saving settings:', error);
      toast.error('Error saving settings: ' + (error?.message || 'Unknown error'));
    } finally {
      setSaving(false);
    }
  };

  const handleInputChange = (field: keyof Settings, value: string | number) => {
    setSettings(prev => ({ ...prev, [field]: value }));
  };

  const handleNotificationSubmit = async () => {
    if (!notificationTitle.trim() || !notificationMessage.trim()) {
      toast.error('Title and Message cannot be empty.');
      return;
    }

    setIsSendingNotification(true);
    try {
      await createNormalMessageNotification(notificationTitle, notificationMessage);
      toast.success('Notification sent successfully!');
      setNotificationTitle('');
      setNotificationMessage('');
    } catch (notifErr: any) {
      console.error("Failed to send notification:", notifErr);
      toast.error('Failed to send notification: ' + (notifErr?.message || 'Unknown error'));
    } finally {
      setIsSendingNotification(false);
    }
  };
  const handleDeleteNotification = async (id: string) => {
    try {
      const { error } = await supabase
        .from("global_notifications")
        .delete()
        .eq("id", id);
  
      if (error) throw error;
  
      toast.success("Notification deleted");
      setNotifications(prev => prev.filter(n => n.id !== id));
    } catch (err) {
      console.error(err);
      toast.error("Failed to delete notification");
    }
  };
  

  return (
    <ModernAdminLayout title="Settings">
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <h2 className="text-2xl font-bold">Admin Settings</h2>
          <Button
            onClick={handleSave}
            disabled={saving}
            className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700"
          >
            {saving ? 'Saving...' : 'Save Settings'}
          </Button>
        </div>

        {loading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

            {/* Site Info */}
            <Card>
              <CardHeader><CardTitle>Site Information</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="site_name">Site Name</Label>
                  <Input
                    id="site_name"
                    value={settings.site_name}
                    onChange={(e) => handleInputChange('site_name', e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="site_description">Site Description</Label>
                  <Textarea
                    id="site_description"
                    value={settings.site_description}
                    onChange={(e) => handleInputChange('site_description', e.target.value)}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Contact Info */}
            <Card>
              <CardHeader><CardTitle>Contact Information</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="contact_email">Email</Label>
                  <Input
                    id="contact_email"
                    type="email"
                    value={settings.contact_email}
                    onChange={(e) => handleInputChange('contact_email', e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="contact_phone">Phone</Label>
                  <Input
                    id="contact_phone"
                    value={settings.contact_phone}
                    onChange={(e) => handleInputChange('contact_phone', e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="business_address">Address</Label>
                  <Textarea
                    id="business_address"
                    value={settings.business_address}
                    onChange={(e) => handleInputChange('business_address', e.target.value)}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Order Settings */}
            <Card>
              <CardHeader><CardTitle>Order Settings</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="delivery_fee">Delivery Fee (₹)</Label>
                  <Input
                    id="delivery_fee"
                    type="number"
                    value={settings.delivery_fee}
                    onChange={(e) => handleInputChange('delivery_fee', Number(e.target.value))}
                  />
                </div>
                <div>
                  <Label htmlFor="min_order_amount">Minimum Order Amount (₹)</Label>
                  <Input
                    id="min_order_amount"
                    type="number"
                    value={settings.min_order_amount}
                    onChange={(e) => handleInputChange('min_order_amount', Number(e.target.value))}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Notification Card */}
            <Card>
  <CardHeader>
    <CardTitle>📢 Send Notification</CardTitle>
  </CardHeader>

  <CardContent className="space-y-6">
    {/* Send Notification */}
    <div className="space-y-4">
      <div>
        <Label>Title</Label>
        <Input
          value={notificationTitle}
          onChange={(e) => setNotificationTitle(e.target.value)}
          placeholder="Important Update"
        />
      </div>

      <div>
        <Label>Message</Label>
        <Textarea
          value={notificationMessage}
          onChange={(e) => setNotificationMessage(e.target.value)}
          placeholder="Enter message for users..."
        />
      </div>

      <Button
        onClick={async () => {
          await handleNotificationSubmit();
          loadNotifications();
        }}
        disabled={isSendingNotification}
        className="w-full bg-purple-600 hover:bg-purple-700"
      >
        {isSendingNotification ? "Sending..." : "Send Notification"}
      </Button>
    </div>

    {/* Existing Notifications */}
    <div className="border-t pt-4 space-y-3">
      <h3 className="font-semibold text-sm text-muted-foreground">
        Recent Notifications
      </h3>

      {loadingNotifications ? (
        <p className="text-sm text-muted-foreground">Loading...</p>
      ) : notifications.length === 0 ? (
        <p className="text-sm text-muted-foreground">No notifications yet</p>
      ) : (
        notifications.map((notif) => (
          <div
            key={notif.id}
            className="flex justify-between items-start gap-3 rounded-md border p-3"
          >
            <div>
              <p className="font-medium">{notif.title}</p>
              <p className="text-sm text-muted-foreground line-clamp-2">
                {notif.message}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                {new Date(notif.created_at).toLocaleString()}
              </p>
            </div>

            <Button
              variant="destructive"
              size="sm"
              onClick={() => handleDeleteNotification(notif.id)}
            >
              Delete
            </Button>
          </div>
        ))
      )}
    </div>
  </CardContent>
</Card>


            {/* Coupon Management */}
            <div className="md:col-span-2">
              <CouponManagement />
            </div>
          </div>
        )}
      </div>
    </ModernAdminLayout>
  );
};

export default AdminSettings;
