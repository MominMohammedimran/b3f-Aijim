import { supabase } from '@/integrations/supabase/client';
import { Json } from '@/integrations/supabase/types';

export type NotificationType = 'order_update' | 'payment_issue' | 'product_update' | 'article_update'|'order_issue'|'normal_notification'|'new_user';

interface CreateNotificationParams {
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  link?: string;
  metadata?: Record<string, Json>;

}

interface BroadcastNotificationParams {
  type: NotificationType;
  title: string;
  message: string;
  link?: string;
  metadata?: Record<string, Json>;
}

// Create notification for a specific user (called by admin)
export const createNotification = async (params: CreateNotificationParams): Promise<boolean> => {
  try {
    const { error } = await supabase.from('notifications').insert([{
      user_id: params.userId,
      type: params.type,
      title: params.title,
      message: params.message,
      link: params.link || null,
      metadata: (params.metadata || {}) as Json,
    }]);

    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error creating notification:', error);
    return false;
  }
};

// Broadcast notification to all users (called by admin) - **RETAINED FOR REFERENCE**
export const broadcastNotification = async (params: BroadcastNotificationParams): Promise<{ success: boolean; count: number }> => {
  try {
    // Get all user IDs from profiles
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('id');

    if (profilesError) throw profilesError;

    if (!profiles || profiles.length === 0) {
      return { success: true, count: 0 };
    }

    // Create notifications for all users
    const notifications = profiles.map(profile => ({
      user_id: profile.id,
      type: params.type,
      title: params.title,
      message: params.message,
      link: params.link || null,
      metadata: (params.metadata || {}) as Json,
    }));

    const { error } = await supabase.from('notifications').insert(notifications);

    if (error) throw error;
    return { success: true, count: notifications.length };
  } catch (error) {
    console.error('Error broadcasting notification:', error);
    return { success: false, count: 0 };
  }
};

// 🌟 NEW FUNCTION: broadcastGlobal - Fetches all users using select('*')
export const broadcastGlobal = async (
  params: BroadcastNotificationParams
): Promise<{ success: boolean; count: number }> => {
  try {
    const { error } = await supabase.from("global_notifications").insert([
      {
        type: params.type,
        title: params.title,
        message: params.message,
        link: params.link || null,
        metadata: params.metadata || {},
      },
    ]);

    if (error) throw error;

    return { success: true, count: 1 }; // only ONE global notification inserted
  } catch (error) {
    console.error("Error broadcasting global notification:", error);
    return { success: false, count: 0 };
  }
};



// Helper: Create order update notification
export const createOrderNotification = async (
  userId: string,
  orderNumber: string,
  status: string,
  orderId: string
): Promise<boolean> => {
  const statusMessages: Record<string, { title: string; message: string }> = {
    processing: {
      title: 'Order Processing',
      message: `Your order #${orderNumber} is now being processed.`,
    },
    confirmed: {
      title: 'Order Confirmed',
      message: `Your order #${orderNumber} has been confirmed!`,
    },
    shipped: {
      title: 'Order Shipped',
      message: `Your order #${orderNumber} has been shipped and is on its way!`,
    },
    delivered: {
      title: 'Order Delivered',
      message: `Your order #${orderNumber} has been delivered. Enjoy!`,
    },
    cancelled: {
      title: 'Order Cancelled',
      message: `Your order #${orderNumber} has been cancelled.`,
    },
    'return-acpt': {
      title: 'Return Accepted',
      message: `Return request for order #${orderNumber} has been accepted.`,
    },
    'payment-rf': {
      title: 'Refund Initiated',
      message: `Refund for order #${orderNumber} has been initiated.`,
    },
    'payment-rf-ss': {
      title: 'Refund Completed',
      message: `Refund for order #${orderNumber} has been completed successfully.`,
    },
  };

  const content = statusMessages[status] || {
    title: 'Order Update',
    message: `Your order #${orderNumber} status has been updated to ${status}.`,
  };

  return createNotification({
    userId,
    type: 'order_update',
    title: content.title,
    message: content.message,
    link: `/order-preview/${orderNumber}`,
    metadata: { orderNumber, orderId, status },
  });
};

// Helper: Create payment issue notification
export const createPaymentIssueNotification = async (
  userId: string,
  orderNumber: string,
  issueStatus: string
): Promise<boolean> => {
  const statusMessages: Record<string, { title: string; message: string }> = {
    'in-progress': {
      title: 'Payment Issue Update',
      message: `Your payment issue for order #${orderNumber} is being reviewed.`,
    },
    resolved: {
      title: 'Payment Issue Resolved',
      message: `Your payment issue for order #${orderNumber} has been resolved.`,
    },
    rejected: {
      title: 'Payment Issue Update',
      message: `Your payment issue for order #${orderNumber} has been reviewed.`,
    },
  };

  const content = statusMessages[issueStatus] || {
    title: 'Payment Issue Update',
    message: `Your payment issue for order #${orderNumber} has been updated.`,
  };

  return createNotification({
    userId,
    type: 'payment_issue',
    title: content.title,
    message: content.message,
    link: `/payment-issue?orderId=${orderNumber}`,
    metadata: { orderNumber, issueStatus },
  });
};

export const createOrderIssueNotification = async (
  userId: string,
  orderNumber: string,
  issueStatus: string
): Promise<boolean> => {
  const statusMessages: Record<string, { title: string; message: string }> = {
    'in-progress': {
      title: 'Order Issue Update',
      message: `Your order issue for order #${orderNumber} is being reviewed.`,
    },
    resolved: {
      title: 'Order Issue Resolved',
      message: `Your order issue for order #${orderNumber} has been resolved.`,
    },
    rejected: {
      title: 'Order Issue Update',
      message: `Your order issue for order #${orderNumber} has been reviewed.`,
    },
  };

  const content = statusMessages[issueStatus] || {
    title: 'Payment Issue Update',
    message: `Your payment issue for order #${orderNumber} has been updated.`,
  };

  return createNotification({
    userId,
    type: 'order_issue',
    title: content.title,
    message: content.message,
    link: `/order-related-issue?orderId=${orderNumber}`,
    metadata: { orderNumber, issueStatus },
  });
};


export const newUserNotification = async (
  userId: string,

 message:string,
): Promise<boolean> => {
  

  return createNotification({
    userId,
    type: 'new_user',
    title: 'Welcome to Aijim Family ❤️',
    message: message,
    link: `/`,
    metadata: { message},
  });
};

// Helper: Create normal message notification (broadcast) - **UPDATED to use broadcastGlobal**
export const createNormalMessageNotification = async (
 normalTitle: string,
  normalMessage: string
): Promise<{ success: boolean; count: number }> => {
  return broadcastGlobal({
    type: 'normal_notification',
    title: `${normalTitle}`,
    message: `${normalMessage}`,
    link: `/`,
    metadata: { normalTitle,normalMessage},
  });
};

// Helper: Create product update notification (broadcast) - **UPDATED to use broadcastGlobal**
export const createProductNotification = async (
  productName: string,

  updateType: 'new' | 'updated' | 'back_in_stock',
productCode:string,
  productSlug?: string
): Promise<{ success: boolean; count: number }> => {
  const messages: Record<string, { title: string; message: string }> = {
    new: {
      title: 'New Product Alert',
      message: `Check out our new product: ${productName}`,
    },
    updated: {
      title: 'Product Update',
      message: `${productName} has been updated with new details.`,
    },
    back_in_stock: {
      title: 'Back in Stock!',
      message: `${productName} is back in stock. Get yours now!`,
    },
  };

  const content = messages[updateType];

  return broadcastGlobal({
    type: 'product_update',
    title: content.title,
    message: content.message,
    link:  `/product/${productCode}`,
    metadata: { productName, updateType },
  });
};


// Helper: Create article notification (broadcast) - **UPDATED to use broadcastGlobal**
export const createArticleNotification = async (
  articleTitle: string,
  articleSlug: string
): Promise<{ success: boolean; count: number }> => {
  return broadcastGlobal({
    type: 'article_update',
    title: 'New Article Published',
    message: `New blog post: ${articleTitle}`,
    link: `/articles/${articleSlug}`,
    metadata: { articleTitle, articleSlug },
  });
};