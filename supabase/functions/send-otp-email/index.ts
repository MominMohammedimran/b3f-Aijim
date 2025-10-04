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
    console.log('🚀 Starting send-otp-email function');
    
    const requestBody = await req.json();
    console.log('📨 Request body:', JSON.stringify(requestBody, null, 2));

    const {
      email,
      otp,
      name
    } = requestBody;

    const BREVO_API_KEY = Deno.env.get("BREVO_API_KEY");
    if (!BREVO_API_KEY) {
      console.error('❌ Brevo API key is missing');
      throw new Error("Brevo API key is missing");
    }

    if (!email || !otp) {
      console.error('❌ Missing required fields:', { email, otp });
      throw new Error("Missing required fields");
    }

    console.log('✅ All required fields present, generating email content...');

    const emailSubject = "Your OTP Code for Account Verification";

    const emailHtml = `
      <div style="max-width:600px;margin:auto;border:1px solid #eee;font-family:sans-serif;">
        <div style="background:#d1fae5;padding:20px;text-align:center;border-radius:8px 8px 0 0;">
          <h2>Account Verification</h2>
        </div>
        <div style="padding:20px;">
          <p>Hi ${name || "there"},</p>
          <p>Thank you for signing up! Please use the following OTP code to verify your account:</p>
          
          <div style="background:#f0fdf4;padding:20px;text-align:center;margin:20px 0;border-radius:8px;">
            <h1 style="font-size:32px;color:#059669;letter-spacing:5px;margin:0;">${otp}</h1>
          </div>
          
          <p>This code will expire in 10 minutes. If you didn't request this verification, please ignore this email.</p>
          
          <p style="margin-top:32px;font-size:14px;color:#666;">Thank you for choosing B3F Prints!</p>
        </div>
      </div>
    `;

    console.log('📧 Preparing to send OTP email via Brevo...');

    const mailPayload = {
      sender: {
        name: "Aijim",
        email: "b3f.prints.pages.dev@gmail.com"
      },
      to: [{ email: email }],
      subject: emailSubject,
      htmlContent: emailHtml,
    };

    console.log('📬 Sending email with payload:', JSON.stringify(mailPayload, null, 2));

    const res = await fetch("https://api.brevo.com/v3/smtp/email", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "api-key": BREVO_API_KEY,
      },
      body: JSON.stringify(mailPayload),
    });

    console.log('📨 Brevo API response status:', res.status);

    if (!res.ok) {
      const errorBody = await res.text();
      console.error('❌ Brevo API error:', errorBody);
      throw new Error(`Email send failed: ${errorBody}`);
    }

    const responseData = await res.json();
    console.log('✅ OTP email sent successfully:', responseData);

    return new Response(JSON.stringify({ success: true, data: responseData }), {
      status: 200,
      headers: {
        ...headers,
        "Content-Type": "application/json",
      },
    });
  } catch (err: any) {
    console.error("❌ Error in send-otp-email:", err);
    return new Response(JSON.stringify({ error: err.message, success: false }), {
      status: 500,
      headers: {
        ...headers,
        "Content-Type": "application/json",
      },
    });
  }
});