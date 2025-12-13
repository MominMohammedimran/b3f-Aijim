import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
const VAPID_PUBLIC_KEY = "BDzuk_ZfPRI35ntZhosL6y7uCtje2I6D6oXVufJLcOMYT__Zr5gIGhIl-WMcA08ahCMbfwyXfpEDOLVYIXNW37c";
const VAPID_PRIVATE_KEY_RAW = "iNbCh4OGOrrE5pswZS5GUEMXuVCpmg-kqjzb5sfGOP0";
const VAPID_SUBJECT = "mailto:aijim.official@gmail.com";
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type"
};
// --- Helper functions ---
function base64UrlEncode(data) {
  const base64 = btoa(String.fromCharCode(...data));
  return base64.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}
function base64UrlDecode(base64url) {
  const base64 = base64url.replace(/-/g, "+").replace(/_/g, "/");
  const padding = "=".repeat((4 - base64.length % 4) % 4);
  const binary = atob(base64 + padding);
  return new Uint8Array([
    ...binary
  ].map((c)=>c.charCodeAt(0)));
}
async function generateVAPIDToken(audience) {
  const header = {
    typ: "JWT",
    alg: "ES256"
  };
  const exp = Math.floor(Date.now() / 1000) + 12 * 60 * 60;
  const payload = {
    aud: audience,
    exp,
    sub: VAPID_SUBJECT
  };
  const encoder = new TextEncoder();
  const headerB64 = base64UrlEncode(encoder.encode(JSON.stringify(header)));
  const payloadB64 = base64UrlEncode(encoder.encode(JSON.stringify(payload)));
  const unsigned = `${headerB64}.${payloadB64}`;
  // ✅ Import private key as JWK instead of pkcs8/raw
  const jwk = {
    kty: "EC",
    crv: "P-256",
    d: VAPID_PRIVATE_KEY_RAW,
    x: "PO6T9l89Ejfme1mGiwvrLu4K2N7YjoPqhdW58ktw4xg',",
    y: "T__Zr5gIGhIl-WMcA08ahCMbfwyXfpEDOLVYIXNW37c",
    ext: true
  };
  const key = await crypto.subtle.importKey("jwk", jwk, {
    name: "ECDSA",
    namedCurve: "P-256"
  }, false, [
    "sign"
  ]);
  const signature = await crypto.subtle.sign({
    name: "ECDSA",
    hash: "SHA-256"
  }, key, encoder.encode(unsigned));
  const sigB64 = base64UrlEncode(new Uint8Array(signature));
  return `${unsigned}.${sigB64}`;
}
// --- Send Push Notification ---
async function sendPushNotification(subscription, payload) {
  try {
    const endpoint = new URL(subscription.endpoint);
    const audience = `${endpoint.protocol}//${endpoint.host}`;
    const vapidToken = await generateVAPIDToken(audience);
    const isFCM = endpoint.host.includes("fcm.googleapis.com");
    const headers = {
      TTL: "86400",
      Authorization: `vapid t=${vapidToken}, k=${VAPID_PUBLIC_KEY}`,
      "Content-Type": isFCM ? "application/json" : "application/octet-stream"
    };
    const response = await fetch(subscription.endpoint, {
      method: "POST",
      headers,
      body: new TextEncoder().encode(payload)
    });
    // Only treat 404 or 410 as expired
    if (response.status === 404 || response.status === 410) {
      console.warn("❌ Subscription expired:", subscription.endpoint);
      return "expired";
    }
    if (!response.ok) {
      const text = await response.text();
      console.error(`⚠️ Push failed (${response.status}) for ${endpoint.host}: ${text}`);
      return "failed";
    }
    console.log(`✅ Push sent: ${endpoint.host}`);
    return "success";
  } catch (err) {
    console.error("Error sending push notification:", err);
    return "failed";
  }
}
// --- Main handler ---
serve(async (req)=>{
  if (req.method === "OPTIONS") {
    return new Response(null, {
      headers: corsHeaders
    });
  }
  try {
    const supabase = createClient(Deno.env.get("SUPABASE_URL") ?? "", Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "");
    const { title, body, icon, badge, data, actions, tag, requireInteraction, userId } = await req.json();
    let query = supabase.from("push_subscribers").select("*");
    if (userId) query = query.eq("user_id", userId);
    const { data: subs, error } = await query;
    if (error || !subs?.length) {
      return new Response(JSON.stringify({
        error: "No subscriptions",
        count: 0
      }), {
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json"
        }
      });
    }
    const notificationData = {
      title: title || "AIJIM",
      body: body || "You have a new notification",
      icon: icon || "/aijim-uploads/aijim-black.png",
      badge: badge || "/aijim-uploads/aijim-black.png",
      data: data || {},
      actions: actions || [],
      tag: tag || "default",
      requireInteraction: requireInteraction || false
    };
    const payloadString = JSON.stringify(notificationData);
    let sentCount = 0;
    const expired = [];
    for (const sub of subs){
      const result = await sendPushNotification(sub.subscription, payloadString);
      if (result === "success") sentCount++;
      else if (result === "expired") expired.push(sub.endpoint);
    }
    // Delete only expired ones
    if (expired.length) {
      const { error: delErr } = await supabase.from("push_subscribers").delete().in("endpoint", expired);
      if (delErr) console.error("❌ Failed deleting expired subscriptions:", delErr);
      else console.log(`🗑 Removed ${expired.length} expired subscriptions`);
    }
    return new Response(JSON.stringify({
      success: true,
      sent: sentCount,
      expired: expired.length,
      total: subs.length
    }), {
      headers: {
        ...corsHeaders,
        "Content-Type": "application/json"
      }
    });
  } catch (error) {
    console.error("💥 Edge function crash:", error);
    return new Response(JSON.stringify({
      error: error.message
    }), {
      headers: {
        ...corsHeaders,
        "Content-Type": "application/json"
      },
      status: 500
    });
  }
});