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
    // First try a CORS-friendly postal API
    const response = await fetch(`https://api.postalpincode.in/pincode/${pincode}`);
    const data = await response.json();

    if (data && data.length > 0 && data[0].Status === 'Success') {
      const postOffice = data[0].PostOffice;
      if (postOffice && postOffice.length > 0) {
        const location = postOffice[0];
        return {
          isServiceable: true,
          message: `Delivery available to ${location.District}, ${location.State}`
        };
      }
    }

    // Fallback to basic Indian pincode validation
    if (/^[1-9][0-9]{5}$/.test(pincode)) {
      // Basic Indian pincode format validation
      const stateMap: { [key: string]: string } = {
        '1': 'Delhi/North India',
        '2': 'Haryana/Punjab/Himachal Pradesh',
        '3': 'Rajasthan/Uttar Pradesh',
        '4': 'Uttar Pradesh/Bihar',
        '5': 'Uttarakhand/Uttar Pradesh',
        '6': 'Haryana/Punjab',
        '7': 'Rajasthan',
        '8': 'Gujarat/Rajasthan'
      };
      
      const firstDigit = pincode[0];
      const region = stateMap[firstDigit] || 'India';
      
      return {
        isServiceable: true,
        message: `Delivery available to ${region} region`
      };
    }

    return {
      isServiceable: false,
      message: 'Invalid PIN code format'
    };
  } catch (error) {
    console.error('Pincode validation error:', error);
    
    // Final fallback - basic format validation
    if (/^[1-9][0-9]{5}$/.test(pincode)) {
      return {
        isServiceable: true,
        message: 'Delivery available (verification pending)'
      };
    }
    
    return {
      isServiceable: false,
      message: 'Unable to verify PIN code. Please ensure it\'s a valid 6-digit Indian PIN code.',
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
};