import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const allowedOrigins = [
  "https://aijim.shop",
  "http://localhost:8080",
  "https://zfdsrtwjxwzwbrtfgypm.supabase.co"
];

function getCORSHeaders(origin: string) {
  return {
    "Access-Control-Allow-Origin": allowedOrigins.includes(origin)
      ? origin
      : "*",
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Vary": "Origin",
  };
}

serve(async (req: Request) => {
  const origin = req.headers.get("origin") || "";
  const headers = getCORSHeaders(origin);

  if (req.method === "OPTIONS") {
    return new Response("OK", { status: 200, headers });
  }

  try {
    console.log('🚀 Starting send-admin-order-notification function');
    
    const requestBody = await req.json();
    console.log('📨 Request body:', JSON.stringify(requestBody, null, 2));

    const {
      orderId,
      orderNumber,
      customerName,
      customerEmail,
      customerPhone,
      orderItems,
      totalAmount,
      shippingAddress,
      paymentMethod = "Razorpay",
      deliveryFee = 0,
      couponCode,
      rewardPointsUsed = 0
    } = requestBody;

    const BREVO_API_KEY = Deno.env.get("BREVO_API_KEY2");
    if (!BREVO_API_KEY) {
      console.error('❌ Brevo API key is missing');
      throw new Error("Brevo API key is missing");
    }

    if (!customerEmail || !orderItems || orderItems.length === 0) {
      console.error('❌ Missing required fields:', { customerEmail, orderItemsLength: orderItems?.length });
      throw new Error("Missing required fields");
    }

    console.log('✅ All required fields present, generating admin email content...');

    // Generate order items HTML for admin
    const itemHtml = orderItems
      .map((item: any) => {
        const sizeDetails = Array.isArray(item.sizes)
          ? item.sizes
              .map((s: any) => `<li>Size: ${s.size?.toUpperCase() || 'N/A'} × Qty: ${s.quantity || 1}</li>`)
              .join("")
          : `<li>Size: ${item.size || "N/A"} × Qty: ${item.quantity || 1}</li>`;

        const imageUrl = item.image?.startsWith('http') 
          ? item.image 
          : item.image?.startsWith('/') 
            ? `https://aijim.shop${item.image}`
            : item.image || "https://via.placeholder.com/60";

        return `
          <tr style="border:1px solid #eee;">
            <td style="padding:10px;"><img src="${imageUrl}" width="60" alt="${item.name}" style="object-fit: cover;" /></td>
            <td style="padding:10px;">
              <strong>${item.name || 'Product'}</strong>
              <ul style="margin:0;padding-left:1em;font-size:13px;">${sizeDetails}</ul>
            </td>
            <td style="padding:10px;font-weight:bold;">₹${item.price || 0}</td>
          </tr>
        `;
      })
      .join("");

    const emailSubject = `🔔 New Order Received - ${orderNumber}`;

    const emailHtml = `
      <div style="max-width:700px;margin:auto;border:1px solid #333;background:#000;color:#fff;font-family:sans-serif;">
        <div style="background:#000;padding:20px;text-align:center;border-radius:8px 8px 0 0;">
          <table role="presentation" style="margin:auto;">
            <tr>
              <td style="vertical-align:middle;padding-right:10px;">
                <img src="https://aijim.shop/aijim-uploads/aijim.png" alt="AIJIM Logo" style="height:40px;width:auto;display:block;" />
              </td>
              <td style="vertical-align:middle;">
                <h2 style="color:#fff;margin:0;font-family:sans-serif;">
                  NEW ORDER RECEIVED
                </h2>
              </td>
            </tr>
          </table>
        </div>

        <div style="padding:20px;">
          <div style="background:#111;color:#fff;padding:15px;border-radius:6px;text-align:center;margin-bottom:20px;">
            <div style="font-size:20px;font-weight:bold;background:#4ade80;color:#000;padding:8px 12px;border-radius:4px;display:inline-block;margin-bottom:10px;">
              Order #${orderNumber}
            </div>
            <div style="font-size:16px;">
              New order from <strong style="color:#4ade80;">${customerName}</strong>
            </div>
          </div>

          <!-- Customer Information -->
          <div style="background:#111;color:#fff;padding:15px;border-radius:6px;margin-bottom:20px;">
            <h3 style="color:#4ade80;margin-top:0;">Customer Details</h3>
            <p><strong>Name:</strong> ${customerName}</p>
            <p><strong>Email:</strong> ${customerEmail}</p>
            <p><strong>Phone:</strong> ${customerPhone || 'Not provided'}</p>
          </div>

          <!-- Shipping Address -->
          ${shippingAddress ? `
          <div style="background:#111;color:#fff;padding:15px;border-radius:6px;margin-bottom:20px;">
            <h3 style="color:#4ade80;margin-top:0;">Shipping Address</h3>
            <p><strong>${shippingAddress.fullName || shippingAddress.name || 'N/A'}</strong></p>
            <p>${shippingAddress.address || shippingAddress.street || 'N/A'}</p>
            <p>${shippingAddress.city || 'N/A'}, ${shippingAddress.state || 'N/A'} ${shippingAddress.zipCode || shippingAddress.zip_code || 'N/A'}</p>
            <p>${shippingAddress.country || 'India'}</p>
            ${shippingAddress.phone ? `<p><strong>Phone:</strong> ${shippingAddress.phone}</p>` : ''}
          </div>
          ` : ''}

          <!-- Order Items -->
          <div style="background:#111;color:#fff;padding:15px;border-radius:6px;margin-bottom:20px;">
            <h3 style="color:#4ade80;margin-top:0;">Order Items</h3>
            <table style="width:100%;border-collapse:collapse;background:#000;color:#fff;">
              ${itemHtml}
            </table>
          </div>

          <!-- Order Summary -->
          <table style="width:100%;border-collapse:collapse;background:#000;color:#fff;margin-bottom:20px;">
            <!-- Coupon Row -->
            ${couponCode ? `
            <tr style="background:#111;color:#fff;">
              <td colspan="2" style="padding:10px;font-weight:bold;">
                Coupon Applied
              </td>
              <td style="padding:10px;font-weight:bold;color:#4ade80;">
                ${couponCode}
              </td>
            </tr>
            ` : ''}

            <!-- Reward Points Row -->
            ${rewardPointsUsed > 0 ? `
            <tr style="background:#111;color:#fff;">
              <td colspan="2" style="padding:10px;font-weight:bold;">
                Reward Points Used
              </td>
              <td style="padding:10px;font-weight:bold;color:#4ade80;">
                ${rewardPointsUsed}
              </td>
            </tr>
            ` : ''}

            <!-- Delivery Fee Row -->
            <tr style="background:#000;color:#fff;">
              <td colspan="2" style="padding:10px;font-weight:bold;">
                ${deliveryFee === 0 ? 'Free Shipping' : 'Delivery Fee'}
              </td>
              <td style="padding:10px;font-weight:bold;color:#4ade80;">
                ₹${deliveryFee}
              </td>
            </tr>

            <!-- Total Row -->
            <tr style="background:#000;color:#fff;border-top:2px solid #4ade80;">
              <td colspan="2" style="padding:15px;font-weight:bold;font-size:18px;">Total Amount:</td>
              <td style="padding:15px;font-weight:bold;font-size:18px;color:#4ade80;">₹${totalAmount || 0}</td>
            </tr>
          </table>

          <div style="background:#111;color:#fff;padding:15px;border-radius:6px;">
            <p><strong>Payment Method:</strong> ${paymentMethod}</p>
            <p style="margin-top:16px;font-size:14px;color:#888;">
              Please process this order and update the customer accordingly.
            </p>
          </div>
        </div>
      </div>
    `;

    console.log('📧 Preparing to send admin notification email via Brevo...');

    const mailPayload = {
      sender: {
        name: "AIJIM Order System",
        email: "aijim.official@gmail.com"
      },
      to: [
        { email: "aijim.official@gmail.com" }
      ],
      subject: emailSubject,
      htmlContent: emailHtml,
    };

    console.log('📬 Sending admin notification email...');

    const res = await fetch("https://api.brevo.com/v3/smtp/email", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "api-key": BREVO_API_KEY,
        "X-Forwarded-For": "203.0.113.1", 
      },
      body: JSON.stringify(mailPayload),
    });

    console.log('📨 Brevo API response status:', res.status);

    if (!res.ok) {
      const errorBody = await res.text();
      console.error('❌ Brevo API error:', errorBody);
      
      if (errorBody.includes('unrecognised IP address') || res.status === 401) {
        console.log('🔄 IP authorization issue detected, but proceeding with current key');
      }
      
      throw new Error(`Admin email send failed: ${errorBody}`);
    }

    const responseData = await res.json();
    console.log('✅ Admin notification email sent successfully:', responseData);

    return new Response(JSON.stringify({ success: true, data: responseData }), {
      status: 200,
      headers: {
        ...headers,
        "Content-Type": "application/json",
      },
    });
  } catch (err: any) {
    console.error("❌ Error in send-admin-order-notification:", err);
    return new Response(JSON.stringify({ error: err.message, success: false }), {
      status: 500,
      headers: {
        ...headers,
        "Content-Type": "application/json",
      },
    });
  }
});