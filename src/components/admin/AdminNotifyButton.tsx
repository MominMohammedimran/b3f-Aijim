import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';
import { Bell, Loader2, Send } from 'lucide-react';
import { 
  createNotification, 
  broadcastNotification,
  NotificationType 
} from '@/services/adminNotificationService';

interface AdminNotifyButtonProps {
  defaultUserId?: string;
  defaultType?: NotificationType;
  defaultTitle?: string;
  defaultMessage?: string;
  defaultLink?: string;
  variant?: 'default' | 'icon';
}

const AdminNotifyButton: React.FC<AdminNotifyButtonProps> = ({
  defaultUserId = '',
  defaultType = 'order_update',
  defaultTitle = '',
  defaultMessage = '',
  defaultLink = '',
  variant = 'default',
}) => {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [broadcastMode, setBroadcastMode] = useState(false);
  const [formData, setFormData] = useState({
    userId: defaultUserId,
    type: defaultType,
    title: defaultTitle,
    message: defaultMessage,
    link: defaultLink,
  });

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (broadcastMode) {
        const result = await broadcastNotification({
          type: formData.type,
          title: formData.title,
          message: formData.message,
          link: formData.link || undefined,
        });

        if (result.success) {
          toast.success(`Notification sent to ${result.count} user(s)`);
          setOpen(false);
          resetForm();
        } else {
          toast.error('Failed to send notification');
        }
      } else {
        if (!formData.userId) {
          toast.error('Please enter a User ID');
          setLoading(false);
          return;
        }

        const success = await createNotification({
          userId: formData.userId,
          type: formData.type,
          title: formData.title,
          message: formData.message,
          link: formData.link || undefined,
        });

        if (success) {
          toast.success('Notification sent successfully');
          setOpen(false);
          resetForm();
        } else {
          toast.error('Failed to send notification');
        }
      }
    } catch (error) {
      console.error('Error sending notification:', error);
      toast.error('Failed to send notification');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      userId: defaultUserId,
      type: defaultType,
      title: defaultTitle,
      message: defaultMessage,
      link: defaultLink,
    });
    setBroadcastMode(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {variant === 'icon' ? (
          <Button variant="ghost" size="icon" className="text-yellow-400 hover:bg-yellow-400/10">
            <Bell className="h-4 w-4" />
          </Button>
        ) : (
          <Button className="bg-yellow-400 hover:bg-yellow-500 text-black">
            <Bell className="w-4 h-4 mr-2" />
            Send Notification
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="bg-gray-900 text-white border-gray-700">
        <DialogHeader>
          <DialogTitle className="text-yellow-400 flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Send In-App Notification
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSend} className="space-y-4">
          <div className="flex items-center justify-between p-3 bg-gray-800 rounded-lg">
            <div>
              <Label className="text-sm">Broadcast to all users</Label>
              <p className="text-xs text-gray-400">Send to everyone instead of one user</p>
            </div>
            <Switch
              checked={broadcastMode}
              onCheckedChange={setBroadcastMode}
            />
          </div>

          {!broadcastMode && (
            <div>
              <Label>User ID *</Label>
              <Input
                required={!broadcastMode}
                value={formData.userId}
                onChange={(e) => setFormData({ ...formData, userId: e.target.value })}
                placeholder="Enter user ID"
                className="bg-black border-gray-700 text-white"
              />
            </div>
          )}

          <div>
            <Label>Notification Type</Label>
            <Select
              value={formData.type}
              onValueChange={(value: NotificationType) => setFormData({ ...formData, type: value })}
            >
              <SelectTrigger className="bg-black border-gray-700 text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="order_update">Order Update</SelectItem>
                <SelectItem value="payment_issue">Payment Issue</SelectItem>
                <SelectItem value="product_update">Product Update</SelectItem>
                <SelectItem value="article_update">Article Update</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>Title *</Label>
            <Input
              required
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="Notification title"
              className="bg-black border-gray-700 text-white"
            />
          </div>

          <div>
            <Label>Message *</Label>
            <Textarea
              required
              value={formData.message}
              onChange={(e) => setFormData({ ...formData, message: e.target.value })}
              placeholder="Notification message"
              rows={3}
              className="bg-black border-gray-700 text-white"
            />
          </div>

          <div>
            <Label>Link (optional)</Label>
            <Input
              value={formData.link}
              onChange={(e) => setFormData({ ...formData, link: e.target.value })}
              placeholder="/orders or /products/slug"
              className="bg-black border-gray-700 text-white"
            />
            <p className="text-xs text-gray-400 mt-1">
              Where the user will be redirected when clicking the notification
            </p>
          </div>

          <Button
            type="submit"
            disabled={loading}
            className="w-full bg-yellow-400 hover:bg-yellow-500 text-black"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Sending...
              </>
            ) : (
              <>
                <Send className="w-4 h-4 mr-2" />
                {broadcastMode ? 'Broadcast to All' : 'Send Notification'}
              </>
            )}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AdminNotifyButton;