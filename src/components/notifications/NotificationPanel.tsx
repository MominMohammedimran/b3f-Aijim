import React from 'react';
import { useNavigate } from 'react-router-dom';
import { X, Bell, Package, CreditCard, ShoppingBag, FileText, CheckCheck, AlertTriangle, UserPlus } from 'lucide-react';
// ⭐ Import motion from framer-motion
import { motion } from 'framer-motion'; 
import { useNotifications, Notification } from '@/hooks/useNotifications';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { formatDistanceToNow } from 'date-fns';

type NotificationType = 'order_update' | 'payment_issue' | 'product_update' | 'article_update' | 'order_issue' | 'normal_notification' | 'new_user';

interface NotificationPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

// ⭐ Updated getNotificationIcon to handle new types
const getNotificationIcon = (type: NotificationType) => {
  switch (type) {
    case 'order_update':
      return <Package className="h-5 w-5 text-blue-400" />;
    case 'payment_issue':
      return <CreditCard className="h-5 w-5 text-red-400" />;
    case 'product_update':
      return <ShoppingBag className="h-5 w-5 text-green-400" />;
    case 'article_update':
      return <FileText className="h-5 w-5 text-purple-400" />;
    case 'order_issue':
      return <AlertTriangle className="h-5 w-5 text-orange-400" />;
    case 'new_user':
      return <UserPlus className="h-5 w-5 text-cyan-400" />;
    case 'normal_notification':
    default:
      return <Bell className="h-5 w-5 text-yellow-400" />;
  }
};

const NotificationItem: React.FC<{
  notification: Notification;
  onRead: (id: string) => void;
  onNavigate: (link: string | null) => void;
}> = ({ notification, onRead, onNavigate }) => {
  const handleClick = () => {
    if (!notification.is_read) {
      onRead(notification.id);
    }
    if (notification.link) {
      onNavigate(notification.link);
    }
  };

  return (
    <div
      onClick={handleClick}
      className={`p-4 border-b border-gray-700 cursor-pointer transition-colors hover:bg-gray-800 ${
        !notification.is_read ? 'bg-gray-800/50' : ''
      }`}
    >
      <div className="flex items-start gap-3">
        {/* Note: I'm casting type here as Notification.type is likely 'string' but our function handles NotificationType */}
        <div className="mt-1">{getNotificationIcon(notification.type as NotificationType)}</div> 
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <h4 className={`text-sm font-medium truncate ${!notification.is_read ? 'text-white' : 'text-gray-300'}`}>
              {notification.title}
            </h4>
            {!notification.is_read && (
              <span className="h-2 w-2 bg-yellow-400 rounded-full flex-shrink-0" />
            )}
          </div>
          <p className="text-xs text-gray-400 mt-1 line-clamp-2">{notification.message}</p>
          <p className="text-xs text-gray-500 mt-2">
            {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true })}
          </p>

        </div>
      </div>
    </div>
  );
};

// Framer Motion Variants for the Panel
const panelVariants = {
  // Panel starts off-screen to the right (x: 100%)
  hidden: { x: '100%' },
  // Panel slides in to its final position (x: 0)
  visible: { x: 0 },
  // Panel slides out when closing (x: 100%)
  exit: { x: '100%' },
};

const NotificationPanel: React.FC<NotificationPanelProps> = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const { notifications, unreadCount, loading, markAsRead, markAllAsRead } = useNotifications();

  const handleNavigate = (link: string | null) => {
    if (link) {
      navigate(link);
      onClose();
    }
  };

  // 💡 Framer motion uses the AnimatePresence component (usually wrapped higher up)
  // to manage exit transitions. For simplicity here, we'll wrap the motion.div
  // with a conditional render that respects the 'exit' animation if the parent
  // component uses AnimatePresence.
  if (!isOpen) return null;


  return (
    <>
      {/* Backdrop - Simple Fade */}
      <motion.div
        className="fixed inset-0 bg-black/50 z-50"
        onClick={onClose}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      />

      {/* ⭐ Panel: Using motion.div with slide variants */}
      <motion.div
        className="fixed top-0 right-0 h-full w-full max-w-sm bg-gray-900 border-l border-gray-700 z-50 flex flex-col"
        variants={panelVariants}
        initial="hidden"
        animate="visible"
        exit="exit"
        transition={{ duration: 0.3, ease: 'easeInOut' }} // Match the old Tailwind duration
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-700">
          <div className="flex items-center gap-2">
            <Bell className="h-5 w-5 text-yellow-400" />
            <h2 className="text-lg font-semibold text-white">Notifications</h2>
            {unreadCount > 0 && (
              <span className="bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">
                {unreadCount}
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            {unreadCount > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={markAllAsRead}
                className="text-gray-400 hover:text-white"
              >
                <CheckCheck className="h-4 w-4 mr-1" />
                Mark all read
              </Button>
            )}
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-white transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Notifications List */}
        <ScrollArea className="flex-1">
          {loading ? (
            <div className="p-8 text-center text-gray-400">
              <div className="animate-spin h-8 w-8 border-2 border-yellow-400 border-t-transparent rounded-full mx-auto mb-2" />
              Loading...
            </div>
          ) : notifications.length === 0 ? (
            <div className="p-8 text-center text-gray-400">
              <Bell className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p>No notifications yet</p>
              <p className="text-sm mt-1">We'll notify you about order updates and more</p>
            </div>
          ) : (
            notifications.map((notification) => (
              <NotificationItem
                key={notification.id}
                notification={notification}
                onRead={markAsRead}
                onNavigate={handleNavigate}
              />
            ))
          )}
        </ScrollArea>
      </motion.div>
    </>
  );
};

export default NotificationPanel;