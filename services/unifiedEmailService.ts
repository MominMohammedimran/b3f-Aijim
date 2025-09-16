
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface OrderEmailData {
  orderId: string;
  customerEmail: string;
  customerName: string;
  status: string;
  orderItems: any[];
  totalAmount: number;
  shippingAddress?: any;
  paymentMethod?: string;
  emailType?: 'confirmation' | 'status_update';
}

export const sendOrderEmail = async (orderData: OrderEmailData): Promise<boolean> => {
  try {
 

    // Validate required fields
    if (!orderData.customerEmail || orderData.customerEmail === 'N/A' || orderData.customerEmail.trim() === '') {
     
      toast.error('No valid customer email to send notification');
      return false;
    }

    if (!orderData.orderId) {
      
      toast.error('Missing order ID for email notification');
      return false;
    }

    const loadingToast = toast.loading('📧 Sending email notification...');

    // Call the Supabase edge function
    const { data, error } = await supabase.functions.invoke('send-order-notification', {
      body: {
        orderId: orderData.orderId,
        customerEmail: orderData.customerEmail.trim(),
        customerName: orderData.customerName || 'Customer',
        status: orderData.status,
        orderItems: orderData.orderItems || [],
        totalAmount: orderData.totalAmount,
        shippingAddress: orderData.shippingAddress,
        paymentMethod: orderData.paymentMethod || 'razorpay',
        emailType: orderData.emailType || 'status_update'
      }
    });

    toast.dismiss(loadingToast);

    if (error) {
     
      toast.error(`Failed to send email: ${error.message}`);
      return false;
    }

  
    toast.success(`✅ Email sent to ${orderData.customerEmail}`);
    return true;

  } catch (error: any) {
   
    toast.error('❌ Failed to send email notification');
    return false;
  }
};

// Convenience function for order confirmation emails
export const sendOrderConfirmationEmail = async (orderData: Omit<OrderEmailData, 'emailType'>): Promise<boolean> => {
  return await sendOrderEmail({
    ...orderData,
    status: 'confirmed',
    emailType: 'confirmation'
  });
};

// Convenience function for order status update emails
export const sendOrderStatusUpdateEmail = async (orderData: Omit<OrderEmailData, 'emailType'>): Promise<boolean> => {
  return await sendOrderEmail({
    ...orderData,
    emailType: 'status_update'
  });
};
