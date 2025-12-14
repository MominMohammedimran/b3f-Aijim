
import { loadCashfreeScript } from './CashfreeLoader';
import { getCashfreeConfig } from './CashfreeConfig';

declare global {
  interface Window {
    Cashfree: any;
  }
}

/**
 * Initialize and open Cashfree payment
 */
export const makeCashfreePayment = async (
  paymentSessionId: string,
  onSuccess: (orderId: string) => void,
  onFailure: (error: any) => void
): Promise<void> => {
  try {
    // Load Cashfree SDK
    const isLoaded = await loadCashfreeScript();
    if (!isLoaded) {
      throw new Error('Failed to load Cashfree SDK. Please check your internet connection and try again.');
    }

    if (!window.Cashfree) {
      throw new Error('Cashfree SDK not available. Please refresh the page and try again.');
    }

    const config = getCashfreeConfig();

    // Initialize Cashfree
    const cashfree = await window.Cashfree({
      mode: config.environment
    });

    const checkoutOptions = {
      paymentSessionId: paymentSessionId,
      redirectTarget: "_modal"
    };

    cashfree.checkout(checkoutOptions).then((result: any) => {
      if (result.error) {
        console.error('Cashfree payment error:', result.error);
        onFailure(result.error);
      } else if (result.paymentDetails) {
        console.log('Cashfree payment successful:', result.paymentDetails);
        onSuccess(result.paymentDetails.orderId);
      }
    });

  } catch (error) {
    console.error('Error in makeCashfreePayment:', error);
    throw error;
  }
};
