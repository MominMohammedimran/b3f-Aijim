
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
    console.log('🚀 Starting send-order-notification function');
    
    const requestBody = await req.json();
    console.log('📨 Request body:', JSON.stringify(requestBody, null, 2));

    const {
      orderId,
      customerEmail,
      customerName,
      status,
      orderItems,
      totalAmount,
      shippingAddress,
      emailType = "status_update",
      paymentMethod = "razorpay",
      deliveryFee,
      couponCode,
      rewardPointsUsed,
      discountApplied
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

    console.log('✅ All required fields present, generating email content...');

   
    const itemHtml = orderItems
      .map((item: any) => {
        const sizeDetails = Array.isArray(item.sizes)
          ? item.sizes
              .map((s: any) => `<li>${s.size?.toUpperCase() || 'N/A'} × ${s.quantity || 1}</li>`)
              .join("")
          : `<li>${item.size || "N/A"} × ${item.quantity || 1}</li>`;

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

    const emailSubject = emailType === "confirmation" 
      ? `Order Confirmed - ${orderId}` 
      : `Order Update - ${orderId} is now ${status.toUpperCase()}`;

    const emailHtml = `
     <div style="max-width:600px;margin:auto;border:1px solid #222;background:#000;color:#fff;font-family:Arial,Helvetica,sans-serif;">

  <!-- Header -->
  <div style="padding:20px;text-align:center;border-bottom:1px solid #222;">
    <h2 style="margin:0;color:#fff;letter-spacing:1px;">
      ORDER ${emailType === "confirmation" ? "CONFIRMED" : "UPDATE"}
    </h2>
  </div>

  <!-- Body -->
<div style="padding:5px 20px 20px;">

    <!-- Order Info -->
    <div style="text-align:center;margin-bottom:20px;">
      <div style="display:inline-block;background:#4ade80;color:#000;
        padding:8px 14px;border-radius:4px;font-weight:bold;font-size:16px;">
        Order #${orderId}
      </div>

      <p style="margin-top:14px;font-size:15px;line-height:1.6;">
        Hi <strong>${customerName || "Customer"}</strong>,<br/>
        Your order status is
       <span style="
  display:inline-block;
  background:#4ade80;
  color:#000;
  font-weight:bold;
  padding:4px 10px;
  border-radius:4px;
  font-size:14px;
  letter-spacing:0.5px;
">
  ${status.toUpperCase()}
</span>

      </p>
    </div>

    <!-- Items Table -->
    <table width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;">
      ${itemHtml}

      <!-- Coupon -->
      <tr style="background:#111;">
        <td style="padding:10px;font-weight:bold;">Coupon Code</td>
        <td style="padding:10px;text-align:right;">
  ${
    couponCode
      ? `<strong style="color:#4ade80;">${couponCode}</strong>`
      : `<span style="color:#6b7280;">Not used</span>`
  }
</td>

      </tr>

      <!-- Rewards -->
      <tr style="background:#111;">
        <td style="padding:10px;font-weight:bold;">Reward Points Used</td>
        <td style="padding:10px;text-align:right;color:#4ade80;">
          ${rewardPointsUsed || 0}
        </td>
      </tr>

      <!-- Delivery -->
      <tr>
        <td style="padding:10px;font-weight:bold;">
          Delivery Fee
        </td>
        <td style="padding:10px;text-align:right;
          color:${deliveryFee === 0 ? "#4ade80" : "#fff"};">
          ${deliveryFee === 0 ? "Free" : `₹${deliveryFee}`}
        </td>
      </tr>

      <!-- Total -->
      <tr style="border-top:1px solid #333;">
        <td style="padding:12px;font-weight:bold;font-size:16px;">
          Total
        </td>
        <td style="padding:12px;text-align:right;font-weight:bold;font-size:16px;">
          ₹${totalAmount || 0}
        </td>
      </tr>
    </table>

    <!-- Payment -->
    <p style="margin-top:18px;font-size:14px;">
      Payment Method: <strong>${paymentMethod||"Razorpay"}</strong>
    </p>

    <!-- Shipping -->
    ${
      shippingAddress?.zipCode
        ? `
          <p style="margin-top:12px;font-size:14px;">
            Estimated Delivery:
            <strong style="color:#f87171;">7–10 Days</strong><br/>
            <a href="https://aijim.shop/orders"
               style="color:#4ade80;text-decoration:none;font-weight:bold;"
               target="_blank">
              Track Your Order →
            </a>
          </p>
        `
        : ""
    }

    <!-- Footer -->
    <p style="margin-top:30px;font-size:13px;color:#777;text-align:center;">
      Thank you for shopping with <strong>Aijim</strong> 🖤
    </p>

  </div>
</div>

    `;

    console.log('📧 Preparing to send email via Brevo...');

    const mailPayload = {
      sender: {
        name: "Aijim",
        email: "aijim.official@gmail.com"
      },
      to: [
  { email: shippingAddress?.email || "Dear User" },
  ...(status === "confirmed"
    ? [{ email: "aijim.official@gmail.com" }]
    : [])
],

      subject: emailSubject,
      htmlContent: emailHtml,
    };

    console.log('📬 Sending email with payload:', JSON.stringify(mailPayload, null, 2));

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
      
      throw new Error(`Email send failed: ${errorBody}`);
    }

    const responseData = await res.json();
    console.log('✅ Email sent successfully:', responseData);

    return new Response(JSON.stringify({ success: true, data: responseData }), {
      status: 200,
      headers: {
        ...headers,
        "Content-Type": "application/json",
      },
    });
  } catch (err: any) {
    console.error("❌ Error in send-order-notification:", err);
    return new Response(JSON.stringify({ error: err.message, success: false }), {
      status: 500,
      headers: {
        ...headers,
        "Content-Type": "application/json",
      },
    });
  }
});