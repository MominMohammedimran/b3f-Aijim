
import { loadRazorpayScript } from './RazorpayLoader';
import { getRazorpayConfig, RazorpayOptions, RazorpayResponse } from './RazorpayConfig';

// Extend the Window interface to include Razorpay
declare global {
  interface Window {
    Razorpay: any;
  }
}

/**
 * Initialize and open Razorpay payment
 */
export const makePayment = async (
  amount: number,
  orderId: string,
  customerName: string = '',
  customerEmail: string = '',
  customerPhone: string = '',
  onSuccess: (paymentId: string, orderId: string, signature: string) => void,
  onCancel: () => void,
  customKey?: string // Add custom key parameter
): Promise<void> => {
  try {
    // Make sure script is loaded
    const isLoaded = await loadRazorpayScript();
    if (!isLoaded) {
      throw new Error('Failed to load payment gateway. Please check your internet connection and try again.');
    }

    if (!window.Razorpay) {
      throw new Error('Payment gateway not available. Please refresh the page and try again.');
    }

    // Get configuration
    const config = getRazorpayConfig();
    
    // Use custom key if provided, otherwise fall back to config key
    const keyToUse = customKey || config.apiKey;
  
  // Initialize Razorpay options
  const options: RazorpayOptions = {
    key: keyToUse,
    amount: amount * 100, // Razorpay expects amount in paise
    currency: 'INR',
    name: 'Aijim',
    description: `Payment for order ${orderId}`,
    order_id: orderId,
    prefill: {
      name: customerName,
      email: customerEmail,
      contact: customerPhone
    },
    theme: {
      color: '#3399cc'
    },
    modal: {
      ondismiss: onCancel,
      escape: true,
      animation: true
    },
    handler: function (response: RazorpayResponse) {
      onSuccess(
        response.razorpay_payment_id,
        response.razorpay_order_id,
        response.razorpay_signature
      );
    }
  };

    try {
      // Create Razorpay instance
      const rzpInstance = new window.Razorpay(options);
      
      // Set up error handling for Razorpay
      rzpInstance.on('payment.failed', function (response: any) {
        console.error('Payment failed:', response.error);
        onCancel();
      });
      
      // Open Razorpay checkout form
      rzpInstance.open();
      
     
    } catch (error) {
      console.error('Error initializing Razorpay:', error);
      throw new Error('Failed to initialize payment gateway. Please try again.');
    }
  } catch (error) {
    console.error('Error in makePayment:', error);
    throw error;
  }
};

/**
 * Verify Razorpay payment signature
 * Note: This should typically be done on the server side
 * This is a placeholder function for client-side verification in test mode
 */
export const verifyPaymentSignature = (
  orderId: string,
  paymentId: string,
  signature: string
): boolean => {
  // In a real implementation, this would be done server-side
  return true;
};
