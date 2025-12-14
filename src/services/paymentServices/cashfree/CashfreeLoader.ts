
/**
 * Load Cashfree SDK script
 */
export const loadCashfreeScript = (): Promise<boolean> => {
  return new Promise((resolve) => {
    // Check if script is already loaded
    if (window.Cashfree) {
      resolve(true);
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://sdk.cashfree.com/js/v3/cashfree.js';
    script.async = true;

    script.onload = () => {
      console.log('Cashfree SDK loaded successfully');
      resolve(true);
    };

    script.onerror = () => {
      console.error('Failed to load Cashfree SDK');
      resolve(false);
    };

    document.body.appendChild(script);
  });
};

// Extend Window interface
declare global {
  interface Window {
    Cashfree: any;
  }
}
