
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
      <div style="max-width:600px;margin:auto;border:1px solid #333;background:#000;color:#fff;font-family:sans-serif;">
  <div style="background:#000;padding:20px;text-align:center;border-radius:8px 8px 0 0;">

  <table role="presentation" style="margin:auto;">

    <tr>

      <td style="vertical-align:middle;padding-right:10px;">

        <img src="http://aijim.shop/aijim-uploads/aijim.png" alt="Brand Logo" style="height:40px;width:auto;display:block;" />

      </td>

      <td style="vertical-align:middle;">

        <h2 style="color:#fff;margin:0;font-family:sans-serif;">

          ORDER ${emailType === "confirmation" ? "CONFIRMED" : "UPDATE"}

        </h2>

      </td>

    </tr>

  </table>

</div>


        <div style="padding:20px;">
          <div style="background:#111;color:#fff;padding:15px;border-radius:6px;text-align:center;">
  <div style="font-size:20px;font-weight:bold;background:#4ade80;color:#000;padding:8px 12px;border-radius:4px;display:inline-block;margin-bottom:10px;">
    Order #${orderId}
  </div>
  <div style="font-size:16px;">
    Hi ${customerName || "Customer"},<br/><br>

    Your order is now <strong style="color:#4ade80;">${status.toUpperCase()}</strong>.
  </div>
</div>

        <table style="width:100%;border-collapse:collapse;background:#000;color:#fff;">
  ${itemHtml}

  <!-- Coupon Row -->
  <tr style="background:#111;color:#fff;">
    <td colspan="2" style="padding:10px;font-weight:bold;">
      Coupon Applied 
    </td>
     <td colspan="2" style="padding:10px;font-weight:bold;">
      ${couponCode||"not applied"}
    </td>
  </tr>

  <!-- Reward Points Row -->
  <tr style="background:#111;color:#fff;">
    <td colspan="2" style="padding:10px;font-weight:bold;">
      Reward Points Used
    </td>
    <td style="padding:10px;font-weight:bold;color:#4ade80;">
       ${rewardPointsUsed || 0}
    </td>
  </tr>

  <!-- Delivery Fee Row -->
  ${
    deliveryFee === 0
      ? `<tr style="background:#000;color:#fff;">
           <td colspan="2" style="padding:10px;font-weight:bold;">
      Free shipping :
    </td>
    <td style="padding:10px;font-weight:bold;color:#4ade80;">
    0
    </td>
         </tr>`
      : `<tr style="background:#000;color:#fff;">
           <td colspan="2" style="padding:10px;font-weight:bold;">
             Delivery Fee 
           </td>
           <td colspan="2" style="padding:10px;font-weight:bold;">
           ${deliveryFee}
           </td>
         </tr>`
  }

  <!-- Total Row -->
  <tr style="background:#000;color:#fff;">
    <td colspan="2" style="padding:10px;font-weight:bold;">Total:</td>
    <td style="padding:10px;font-weight:bold;">₹${totalAmount || 0}</td>
  </tr>
</table>

          <p style="margin-top:16px;">Payment Method: ${paymentMethod}</p>

          ${
            shippingAddress?.zipCode
              ? `<p style="margin-top:16px;">Estimated Delivery: <strong style="color:red">7–10 Days</strong><br/>Track here: <a href="https://aijim.pages.dev/orders" target="_blank">Track Order</a></p>`
              : ""
          }

          <p style="margin-top:32px;font-size:14px;color:#666;">Thank you for shopping with Aijim!</p>
        </div>
      </div>
    `;

    console.log('📧 Preparing to send email via Brevo...');

    const mailPayload = {
      sender: {
        name: "Aijim",
        email: "b3f.prints.pages.dev@gmail.com"
      },
      to: [
  { email: shippingAddress?.email || userProfile?.email },
  ...(status === "confirmed"
    ? [{ email: "b3f.prints.pages.dev@gmail.com" }]
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