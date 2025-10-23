import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { Bell } from 'lucide-react';

const AdminNotificationSender = () => {
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [sending, setSending] = useState(false);

  const handleSendNotification = async () => {
    if (!title.trim() || !body.trim()) {
      toast.error('Please fill in both title and message');
      return;
    }

    setSending(true);
    try {
      const { data, error } = await supabase.functions.invoke('send-push-notification', {
        body: {
          title: title.trim(),
          body: body.trim(),
          icon: '/aijim-uploads/aijim-192.png',
          badge: '/aijim-uploads/aijim-192.png',
        },
      });

      if (error) {
       // console.error('Error sending notification:', error);
        toast.error('Failed to send notification');
      } else {
        const sent = data?.sent ?? 0;
const expired = data?.expired ?? 0;

toast.success(`Notification sent to ${sent} user${sent === 1 ? '' : 's'}`, {
  description:
    expired > 0
      ? `${expired} expired subscription${expired === 1 ? '' : 's'} removed.`
      : 'Notification delivered to active subscribers.',
});

        setTitle('');
        setBody('');
      }
    } catch (error) {
     // console.error('Error sending notification:', error);
      toast.error('Failed to send notification');
    } finally {
      setSending(false);
    }
  };

  return (
    <Card className="border border-gray-700 bg-card">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg font-semibold">
          <Bell className="h-5 w-5" />
          Send Push Notification
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label htmlFor="notification_title">Notification Title</Label>
          <Input
            id="notification_title"
            placeholder="e.g., New Product Launch!"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            maxLength={50}
          />
        </div>
        <div>
          <Label htmlFor="notification_body">Message</Label>
          <Textarea
            id="notification_body"
            placeholder="e.g., Check out our latest collection of streetwear..."
            value={body}
            onChange={(e) => setBody(e.target.value)}
            maxLength={150}
            rows={3}
          />
        </div>
        <Button
          onClick={handleSendNotification}
          disabled={sending || !title.trim() || !body.trim()}
          className="w-full bg-blue-600 hover:bg-blue-700"
        >
          {sending ? 'Sending...' : 'Send Notification to All Users'}
        </Button>
      </CardContent>
    </Card>
  );
};

export default AdminNotificationSender;
