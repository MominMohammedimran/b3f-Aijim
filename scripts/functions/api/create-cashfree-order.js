export async function onRequestPost(context) {
  try {
    const { amount, currency, customerInfo, orderNumber } = await context.request.json();

    const {
      CASHFREE_APP_ID,
      CASHFREE_SECRET_KEY,
      SUPABASE_URL,
      SUPABASE_SERVICE_ROLE_KEY,
    } = context.env;

    if (!CASHFREE_APP_ID || !CASHFREE_SECRET_KEY || !SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
      return new Response(JSON.stringify({ error: 'Missing env vars' }), { status: 500 });
    }

    // ✅ Step 1: Decode Supabase JWT to get user ID
    const authHeader = context.request.headers.get('Authorization') || '';
    const jwt = authHeader.replace('Bearer ', '').trim();

    let userId = null;
    if (jwt && jwt.length > 20) {
      try {
        const [_, payload] = jwt.split('.');
        const decodedPayload = JSON.parse(atob(payload));
        userId = decodedPayload.sub || null;
      } catch (err) {
        console.warn('Failed to decode JWT');
      }
    }

    if (!userId) {
      return new Response(JSON.stringify({ error: 'Invalid or missing Supabase token' }), { status: 401 });
    }

    // ✅ Step 2: Create Cashfree Order
    const cashfreeOrderPayload = {
      order_id: orderNumber,
      order_amount: amount,
      order_currency: currency,
      customer_details: {
        customer_id: userId,
        customer_name: customerInfo?.name || 'Customer',
        customer_email: customerInfo?.email || '',
        customer_phone: customerInfo?.phone || '9999999999'
      }
    };

    const cashfreeRes = await fetch('https://api.cashfree.com/pg/orders', {
      method: 'POST',
      headers: {
        'x-client-id': CASHFREE_APP_ID,
        'x-client-secret': CASHFREE_SECRET_KEY,
        'x-api-version': '2023-08-01',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(cashfreeOrderPayload),
    });

    if (!cashfreeRes.ok) {
      const errorText = await cashfreeRes.text();
      throw new Error(`Cashfree Error: ${errorText}`);
    }

    const cashfreeOrder = await cashfreeRes.json();

    // ✅ Step 3: Insert minimal order record into Supabase
    const orderInsertRes = await fetch(`${SUPABASE_URL}/rest/v1/orders`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
        apikey: SUPABASE_SERVICE_ROLE_KEY,
        'Content-Type': 'application/json',
        Prefer: 'return=representation',
      },
      body: JSON.stringify({
        order_number: orderNumber,
        user_id: userId,
        total: amount,
        status: 'pending',
        payment_method: 'cashfree',
        user_email: customerInfo?.email || '',
        payment_details: {
          cashfree_order_id: cashfreeOrder.order_id,
          payment_session_id: cashfreeOrder.payment_session_id,
          amount,
          currency,
        },
      }),
    });

    if (!orderInsertRes.ok) {
      const errorText = await orderInsertRes.text();
      throw new Error(`Supabase Error: ${errorText}`);
    }

    const dbOrder = await orderInsertRes.json();

    // ✅ Step 4: Return order info to frontend
    return new Response(
      JSON.stringify({
        order_id: cashfreeOrder.order_id,
        payment_session_id: cashfreeOrder.payment_session_id,
        amount: amount,
        currency: currency,
        order_number: orderNumber,
        db_order_id: dbOrder?.[0]?.id || null,
      }),
      { headers: { 'Content-Type': 'application/json' } }
    );
  } catch (err) {
    console.error('❌ create-cashfree-order error:', err);
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
}
