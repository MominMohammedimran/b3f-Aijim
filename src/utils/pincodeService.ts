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
    // Using Delhivery API for pincode validation
    const apiKey = 'b90ea2d6b289d896ca461e054b69aa4ed2cfe4e9';
    const response = await fetch(`https://track.delhivery.com/c/api/pin-codes/json/?filter_codes=${pincode}`, {
      headers: {
        'Authorization': `Token ${apiKey}`,
        'Content-Type': 'application/json'
      }
    });
    const data = await response.json();

    if (data && data.delivery_codes && data.delivery_codes.length > 0) {
      const deliveryCode = data.delivery_codes[0];
      if (deliveryCode && deliveryCode.postal_code && deliveryCode.postal_code.pin === pincode) {
        const isServiceable = true; // Delhivery serviceable area
        return {
          isServiceable,
          message: isServiceable 
            ? `Delivery available to ${deliveryCode.postal_code.district}, ${deliveryCode.postal_code.state_or_province}`
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