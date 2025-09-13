import { supabase } from '@/integrations/supabase/client';

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
    // Call the Supabase edge function to validate pincode
    const { data, error } = await supabase.functions.invoke('validate-pincode', {
      body: { pincode }
    });

    if (error) {
      console.error('Edge function error:', error);
      throw error;
    }

    return data as PincodeValidationResult;
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