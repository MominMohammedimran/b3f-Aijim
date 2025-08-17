import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface RequestBody {
  amount: number;
  currency: string;
  receipt: string;
  cartItems: any[];
  shippingAddress: any;
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
    console.log('=== Starting Razorpay Order Creation ===');
    
    const requestBody: RequestBody = await req.json();
    console.log('Request body received:', requestBody);

    const { amount, currency, receipt, cartItems, shippingAddress, customerInfo } = requestBody;

    // Validate required fields
    if (!amount || !currency || !receipt || !customerInfo) {
      console.error('Missing required fields');
      return new Response(JSON.stringify({ 
        success: false,
        error: 'Missing required fields: amount, currency, receipt, customerInfo' 
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Get environment variables - using updated live credentials
    const RAZORPAY_KEY_ID = Deno.env.get("RAZORPAY_KEY_ID") || "rzp_live_2Mc4YyXZYcwqy8";
    const RAZORPAY_KEY_SECRET = Deno.env.get("RAZORPAY_KEY_SECRET") || "wKfkpZci09M6zYzr5H6DqOLv";
    const SUPABASE_URL = Deno.env.get('SUPABASE_URL');
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    console.log('Environment check:', {
      hasRazorpayKeyId: !!RAZORPAY_KEY_ID,
      hasRazorpayKeySecret: !!RAZORPAY_KEY_SECRET,
      hasSupabaseUrl: !!SUPABASE_URL,
      hasSupabaseServiceRole: !!SUPABASE_SERVICE_ROLE_KEY,
      razorpayKeyId: RAZORPAY_KEY_ID ? `${RAZORPAY_KEY_ID.substring(0, 8)}...` : 'missing'
    });

    if (!RAZORPAY_KEY_ID || !RAZORPAY_KEY_SECRET || !SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
      console.error('Missing environment variables');
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

    console.log('Creating Razorpay order with payload:', orderPayload);

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
      console.error('Razorpay API error:', errorText);
      return new Response(JSON.stringify({ 
        success: false,
        error: `Payment gateway error: ${errorText}` 
      }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    const razorpayOrder = await razorpayResponse.json();
    console.log('Razorpay order created successfully:', razorpayOrder.id);

    // Initialize Supabase client
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // Generate unique order number with timestamp and user_id to prevent duplicates
    const timestamp = Date.now();
    const userSuffix = customerInfo.user_id ? customerInfo.user_id.substring(0, 8) : 'guest';
    const randomSuffix = Math.floor(Math.random() * 10000);
    const orderNumber = receipt || `Aijim-${timestamp}-${userSuffix}-${randomSuffix}`;
    
    const orderData = {
      order_number: orderNumber,
      user_id: customerInfo.user_id || '00000000-0000-0000-0000-000000000000', // Default user for guest orders
      total: amount / 100,
      status: 'pending',
      items: cartItems,
      payment_method: 'razorpay',
      delivery_fee: 0,
      shipping_address: shippingAddress,
      user_email: customerInfo.email,
      payment_details: JSON.stringify({
        razorpay_order_id: razorpayOrder.id,
        amount: amount,
        currency: currency
      })
    };

    console.log('Storing order in database:', orderData);

    const { data: order, error: dbError } = await supabase
      .from('orders')
      .insert(orderData)
      .select()
      .single();

    if (dbError) {
      console.error('Supabase error:', dbError);
      return new Response(JSON.stringify({ 
        success: false,
        error: `Database error: ${dbError.message}` 
      }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    console.log('Order stored in database successfully:', order.id);

    // Return success response
    const responseData = {
      success: true,
      order_id: razorpayOrder.id,
      amount: razorpayOrder.amount,
      currency: razorpayOrder.currency,
      key_id: RAZORPAY_KEY_ID,
      receipt: orderNumber,
      db_order_id: order.id
    };

    console.log('Sending success response:', responseData);

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