export interface PincodeValidationResult {
  isServiceable: boolean;
  message: string;
  error?: string;
}

export const validatePincode = async (pincode: string): Promise<PincodeValidationResult> => {
  if (!pincode || pincode.length !== 6) {
    return {
      isServiceable: false,
      message: 'Please enter a valid 6-digit PIN code'
    };
  }

  try {
    // Using a more reliable Indian postal API
    const response = await fetch(`https://api.postalpincode.in/pincode/${pincode}`);
    const data = await response.json();

    if (data && data.length > 0 && data[0].Status === 'Success') {
      const postOffice = data[0].PostOffice;
      if (postOffice && postOffice.length > 0) {
        // Check if it's a major serviceable area (you can customize this logic)
        const isServiceable = true; // For now, all valid pincodes are serviceable
        return {
          isServiceable,
          message: isServiceable 
            ? `Delivery available to ${postOffice[0].District}, ${postOffice[0].State}`
            : 'Delivery not available to this location'
        };
      }
    }

    return {
      isServiceable: false,
      message: 'Invalid PIN code or delivery not available'
    };
  } catch (error) {
    console.error('Pincode validation error:', error);
    return {
      isServiceable: false,
      message: 'Unable to verify PIN code. Please try again.',
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
};