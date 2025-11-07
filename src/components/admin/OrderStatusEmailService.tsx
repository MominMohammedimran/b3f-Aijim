import { supabase } from '@/integrations/supabase/client';
import { orderService } from '@/services/microservices/api';
import { toast } from 'sonner';


export interface OrderEmailData {
  orderId: string;
  customerEmail: string;
  customerName: string;
  status: string;
  orderItems: any[]; // Ensure it's array, not string
  totalAmount: number;
  shippingAddress?: any;
  paymentMethod?: string; 
  couponCode:string;
  couponDiscount:number;
  deliveryFee?:number;
  rewardPointsUsed:number;// razorpay / cod etc.
}

export const sendOrderStatusEmail = async (
  orderData: OrderEmailData,
  
): Promise<boolean> => {

  try {
   

    if (
      !orderData.customerEmail ||
      orderData.customerEmail === 'N/A' ||
      orderData.customerEmail.trim() === ''
    ) {
     // console.warn('❌ No valid customer email provided:', orderData.customerEmail);
      toast.error('No valid customer email to send status update');
      return false;
    }
    
    const loadingToast = toast.loading('📧 Sending order email...');
    

    const { data, error } = await supabase.functions.invoke('send-order-notification', {
      body: {
        orderId: orderData.orderId,
        customerEmail: orderData.customerEmail.trim(),
        customerName: orderData.customerName || 'Customer',
        status: orderData.status,
        orderItems: orderData.orderItems || [],
        totalAmount: orderData.totalAmount,
        shippingAddress: orderData.shippingAddress,
        paymentMethod: orderData.paymentMethod,
        emailType: 'status_update',
        couponCode:orderData.couponCode,
        couponDiscount:orderData.couponDiscount,
        rewardPointsUsed:orderData.rewardPointsUsed,
        deliveryFee:orderData.deliveryFee,
      }
    });

    toast.dismiss(loadingToast);

    if (error) {
     // console.error('❌ Supabase function error:', error);
      toast.error(`Failed to send status email: ${error.message}`);
      return false;
    }
    toast.success(`✅ Email sent to ${orderData.customerEmail}`);
 
    return true;
  } catch (error) {
    //console.error('💥 Failed to send status email:', error);
    toast.error('❌ Failed to send status email');
    return false;
  }
};

export async function notifyOrderStatusChange(
  orderId: string,
  newStatus: string,
  customerEmail: string,
  orderItems: any[],
  totalAmount: number,
  shippingAddress: {
    name: string;
    phone: string;
    email: string;
    address: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  },
  paymentMethod?: string,
  couponCode?:string,
  couponDiscount?:number,
 rewardPointsUsed?:number, 
 deliveryFee?:number,

) {
  const emailData: OrderEmailData = {
    orderId,
    customerEmail: customerEmail.trim(),
    customerName: shippingAddress.name || 'Customer',
    status: newStatus,
    orderItems,
    totalAmount,
    shippingAddress,
    paymentMethod,
    couponCode,
    couponDiscount,
    rewardPointsUsed,
    deliveryFee,
  };

  return await sendOrderStatusEmail(emailData);
}

export const sendOrderConfirmationEmail = async (
  orderData: OrderEmailData
): Promise<boolean> => {
  try {
   

    if (
      !orderData.customerEmail ||
      orderData.customerEmail === 'N/A' ||
      orderData.customerEmail.trim() === ''
    ) {
      toast.error('No valid customer email for confirmation');
      return false;
    }

   const loadingToast = toast.loading("📧 Sending confirmation email...");

const { data, error } = await supabase.functions.invoke("send-order-notification", {
  body: {
    userEmail: orderData.customerEmail?.trim(),
    orderDetails: {
      order_number: orderData.orderId,
      total: orderData.totalAmount,
      items: orderData.orderItems || [],
      shipping_address: orderData.shippingAddress,
      payment_details: { method: orderData.paymentMethod },
      coupon_code: orderData.couponCode,
      reward_points_used: orderData.rewardPointsUsed,
      delivery_fee: orderData.deliveryFee,
      status: orderData.status,
    },
  },
});

toast.dismiss(loadingToast);

    if (error) {
      toast.error(`Confirmation email failed: ${error.message}`);
      return false;
    }

    toast.success(`✅ Confirmation sent to ${orderData.customerEmail}`);
    return true;
  } catch (error) {
  //  console.error('💥 Confirmation email error:', error);
    toast.error('❌ Failed to send confirmation email');
    return false;
  }
};

export const sendReturnConfirmationEmail = async (
  orderData: OrderEmailData
): Promise<boolean> => {
  try {
   

    if (
      !orderData.customerEmail ||
      orderData.customerEmail === 'N/A' ||
      orderData.customerEmail.trim() === ''
    ) {
      toast.error('No valid customer email for confirmation');
      return false;
    }

    const loadingToast = toast.loading('📧 Sending return/refund confirmation email...');
    const { data, error } = await supabase.functions.invoke('send-return-payment-notification', {
      body: {
        orderId: orderData.orderId,
        customerEmail: orderData.customerEmail.trim(),
        customerName: orderData.customerName || 'Customer',
        status:orderData.status ,
        orderItems: orderData.orderItems || [],
        totalAmount: orderData.totalAmount,
        
        emailType: 'status_update',
        
      }
    });
    toast.dismiss(loadingToast);

    if (error) {
      toast.error(`Confirmation email failed: ${error.message}`);
      return false;
    }

    toast.success(`✅ Confirmation sent to ${orderData.customerEmail}`);
    return true;
  } catch (error) {
    //console.error('💥 Confirmation email error:', error);
    toast.error('❌ Failed to send confirmation email');
    return false;
  }
};