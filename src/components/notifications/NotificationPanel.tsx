import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  X,
  Bell,
  Package,
  CreditCard,
  ShoppingBag,
  FileText,
  CheckCheck,
  AlertTriangle,
  UserPlus,
} from 'lucide-react';
import { motion, Variants } from 'framer-motion';
import { useNotifications } from '@/hooks/useNotifications';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { formatDistanceToNow } from 'date-fns';


type NotificationType =
  | 'order_update'
  | 'payment_issue'
  | 'product_update'
  | 'article_update'
  | 'order_issue'
  | 'normal_notification'
  | 'new_user';

interface NotificationPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

const getNotificationIcon = (type: NotificationType) => {
  const base = 'h-5 w-5 drop-shadow-md';


  switch (type) {
    case 'order_update':
      return <Package className={`${base} text-blue-400`} />;
    case 'payment_issue':
      return <CreditCard className={`${base} text-red-400`} />;
    case 'product_update':
      return <ShoppingBag className={`${base} text-green-400`} />;
    case 'article_update':
      return <FileText className={`${base} text-purple-400`} />;
    case 'order_issue':
      return <AlertTriangle className={`${base} text-orange-400`} />;
    case 'new_user':
      return <UserPlus className={`${base} text-cyan-400`} />;
    default:
      return <Bell className={`${base} text-yellow-400`} />;
  }
};

const NotificationItem: React.FC<{
  notification: any;
  onRead: (id: string) => void;
  onNavigate: (link: string | null) => void;
}> = ({ notification, onRead, onNavigate }) => {
  const handleClick = () => {
    if (!notification.is_read) onRead(notification.id);
    if (notification.link) onNavigate(notification.link);
  };

  return (
    <motion.div
      whileTap={{ scale: 0.97 }}
      onClick={handleClick}
      className={`group relative p-4  mb-2 cursor-pointer transition-all duration-300 rounded-xl border border-white/10
        backdrop-blur-md bg-white/5 
        ${notification.is_read ? 'opacity-70' : 'backdrop-blur-xl bg-white/10'} 
        hover:bg-white/15 hover:shadow-lg`}
    >
      {!notification.is_read && (
        <span className="absolute right-3 top-3 h-2.5 w-2.5 bg-yellow-400 rounded-full animate-ping" />
      )}

      <div className="flex items-start gap-3">
        {getNotificationIcon(notification.type as NotificationType)}
        <div className="flex-1 min-w-0 ">
          <h4 className="text-sm font-semibold text-white truncate">{notification.title}</h4>
          <p className="text-xs text-gray-300 mt-1 line-clamp-2">{notification.message}</p>
          <span className="text-[10px] text-gray-400 mt-2 block">
            {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true })}
          </span>
        </div>
      </div>
    </motion.div>
  );
};

const panelVariants: Variants = {
  hidden: {
    x: '100%',
    opacity: 0,
    filter: 'blur(10px)',
  },
  visible: {
    x: 0,
    opacity: 1,
    filter: 'blur(0)',
    transition: {
      duration: 0.35,
      // use easing curve array (framer-motion expects number[] or easing function)
      ease: [0.25, 0.1, 0.25, 1],
    },
  },
  exit: {
    x: '100%',
    opacity: 0,
    filter: 'blur(10px)',
    transition: {
      duration: 0.28,
      ease: [0.4, 0, 1, 1],
    },
  },
};

const NotificationPanel: React.FC<NotificationPanelProps> = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const { notifications, unreadCount, loading, markAsRead, markAllAsRead } = useNotifications();


  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop intentionally NOT clickable (pointer-events-none) so clicking outside DOES NOT close */}
      <motion.div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 pointer-events-none"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      />

      {/* Panel: pointer-events-auto so panel itself is interactive */}
      <motion.div
        className="fixed top-0 right-0 h-full w-full max-w-sm bg-[#0f0f0f]/60 backdrop-blur-2xl border-l border-white/10 z-50 flex flex-col shadow-2xl pointer-events-auto"
        variants={panelVariants}
        initial="hidden"
        animate="visible"
        exit="exit"
        role="dialog"
        aria-label="Notifications"
      >
        <div className="sticky top-0 z-10 p-5 border-b border-white/10 flex justify-between items-center backdrop-blur-xl">
          <div className="flex items-center gap-3">
            <Bell className="h-6 w-6 text-yellow-400 drop-shadow-lg" />
            <h2 className="text-xl font-bold text-white">Notifications</h2>
            {unreadCount > 0 && (
              <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full">{unreadCount}</span>
            )}
          </div>
          <div className="flex gap-2">
            {unreadCount > 0 && (
              <Button size="sm" variant="ghost" onClick={markAllAsRead} className="text-yellow-300 hover:text-white">
                <CheckCheck size={16} />
              </Button>
            )}
            <button onClick={onClose} className="p-2 text-gray-300 hover:text-white" aria-label="Close notifications">
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        <ScrollArea className="flex-1 p-4 space-y-3">
          {loading ? (
            <div className="text-center mt-20 text-gray-300">
              <div className="animate-spin h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4" />
              Loading...
            </div>
          ) : notifications.length === 0 ? (
            <div className="text-center mt-24 text-gray-400">
              <Bell className="mx-auto mb-3 h-12 w-12 opacity-40" />
              <p className="text-lg">No Notifications</p>
              <p className="text-xs opacity-60">You're all caught up 🎉</p>
            </div>
          ) : (
            notifications.map((n) => (
              <NotificationItem
                key={n.id}
                notification={n}
                onRead={markAsRead}
                onNavigate={(link) => {
                  // Navigate but DO NOT auto-close the panel
                  if (link) navigate(link);
                }}
              />
            ))
          )}
        </ScrollArea>
      </motion.div>
    </>
  );
};

export default NotificationPanel;