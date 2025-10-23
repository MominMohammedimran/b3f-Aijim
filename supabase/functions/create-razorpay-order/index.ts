import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface RequestBody {
  amount: number;
  currency: string;
  receipt: string;
  orderItems: any[];
  customerInfo: {
    name: string;
    email: string;
    contact: string;
    user_id?: string;
  };
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
   // console.log('=== Starting Razorpay Order Creation ===');
    
    const requestBody: RequestBody = await req.json();
   // console.log('Request body received:', requestBody);

    const { amount, currency, receipt, orderItems, customerInfo } = requestBody;

    // Validate required fields
    if (!amount || !currency || !receipt || !customerInfo) {
    //  console.error('Missing required fields');
      return new Response(JSON.stringify({ 
        success: false,
        error: 'Missing required fields: amount, currency, receipt, customerInfo' 
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Get environment variables
    const RAZORPAY_KEY_ID = Deno.env.get("RAZORPAY_KEY_ID");
    const RAZORPAY_KEY_SECRET = Deno.env.get("RAZORPAY_KEY_SECRET");

  {/* console.log('Environment check:', {
      hasRazorpayKeyId: !!RAZORPAY_KEY_ID,
      hasRazorpayKeySecret: !!RAZORPAY_KEY_SECRET,
      razorpayKeyId: RAZORPAY_KEY_ID ? `${RAZORPAY_KEY_ID.substring(0, 8)}...` : 'missing'
    });*/}

    if (!RAZORPAY_KEY_ID || !RAZORPAY_KEY_SECRET) {
      console.error('Missing Razorpay environment variables');
      return new Response(JSON.stringify({ 
        success: false,
        error: 'Payment gateway configuration error. Please contact support.' 
      }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Create Razorpay order
    const auth = btoa(`${RAZORPAY_KEY_ID}:${RAZORPAY_KEY_SECRET}`);
    
    const orderPayload = {
      amount,
      currency,
      receipt,
      notes: {
        customer_email: customerInfo.email,
        customer_name: customerInfo.name
      }
    };

   // console.log('Creating Razorpay order with payload:', orderPayload);

    const razorpayResponse = await fetch('https://api.razorpay.com/v1/orders', {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${auth}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(orderPayload)
    });

    if (!razorpayResponse.ok) {
      const errorText = await razorpayResponse.text();
      //console.error('Razorpay API error:', errorText);
      return new Response(JSON.stringify({ 
        success: false,
        error: `Payment gateway error: ${errorText}` 
      }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    const razorpayOrder = await razorpayResponse.json();
   // console.log('Razorpay order created successfully:', razorpayOrder.id);

    // Return success response
    const responseData = {
      success: true,
      order_id: razorpayOrder.id,
      amount: razorpayOrder.amount,
      currency: razorpayOrder.currency,
      key_id: RAZORPAY_KEY_ID,
      receipt: receipt
    };

  //  console.log('Sending success response:', responseData);

    return new Response(JSON.stringify(responseData), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Error in create-razorpay-order function:', error);
    
    return new Response(JSON.stringify({ 
      success: false,
      error: error.message || 'Internal server error',
      details: error.toString()
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});