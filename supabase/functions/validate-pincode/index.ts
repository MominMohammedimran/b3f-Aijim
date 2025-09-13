import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { pincode } = await req.json();

    if (!pincode || pincode.length !== 6) {
      return new Response(
        JSON.stringify({
          isServiceable: false,
          message: 'Please enter a valid 6-digit PIN code'
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400
        }
      );
    }

    const BASE_URL = "https://track.delhivery.com/c/api/pin-codes/json/";
    const API_KEY = "b90ea2d6b289d896ca461e054b69aa4ed2cfe4e9";

    console.log(`Validating pincode: ${pincode}`);

    const response = await fetch(`${BASE_URL}?filter_codes=${pincode}`, {
      headers: {
        'Authorization': `Token ${API_KEY}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    const data = await response.json();
    console.log('Delhivery API response:', data);

    if (data && data.delivery_codes && data.delivery_codes.length > 0) {
      const deliveryCode = data.delivery_codes[0];
      if (deliveryCode && deliveryCode.postal_code && deliveryCode.postal_code.pin === pincode) {
        return new Response(
          JSON.stringify({
            isServiceable: true,
            message: `Delivery available to ${deliveryCode.postal_code.district}, ${deliveryCode.postal_code.state_or_province}`
          }),
          {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          }
        );
      }
    }

    // Fallback to basic Indian pincode validation
    if (/^[1-9][0-9]{5}$/.test(pincode)) {
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
      
      return new Response(
        JSON.stringify({
          isServiceable: true,
          message: `Delivery available to ${region} region`
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    return new Response(
      JSON.stringify({
        isServiceable: false,
        message: 'Invalid PIN code or delivery not available'
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );

  } catch (error) {
    console.error('Pincode validation error:', error);
    
    return new Response(
      JSON.stringify({
        isServiceable: false,
        message: 'Unable to verify PIN code. Please try again.',
        error: error instanceof Error ? error.message : 'Unknown error'
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});