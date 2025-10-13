import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
const VAPID_PUBLIC_KEY = 'BEZyguY1rRxan4xEdlHZ21O5x1XXZHS96WlokPAswM6TzeS7WdGzwTN1V4Tr3JLKN56iAZFZw3TJSIYNO7pvfi8';
const VAPID_PRIVATE_KEY_RAW = 'jn9XyRZj2hJzaaXw497GpBk2UZ23XenxRyO9JIaR5vg';
const VAPID_SUBJECT = 'mailto:aijim.official@gmail.com';
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type'
};
// Base64 URL encode/decode helpers
function base64UrlEncode(data) {
  const base64 = btoa(String.fromCharCode(...data));
  return base64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}
function base64UrlDecode(base64url) {
  const base64 = base64url.replace(/-/g, '+').replace(/_/g, '/');
  const padding = '='.repeat((4 - base64.length % 4) % 4);
  const binary = atob(base64 + padding);
  return new Uint8Array([
    ...binary
  ].map((char)=>char.charCodeAt(0)));
}
// Generate JWT for VAPID
async function generateVAPIDToken(audience) {
  const header = {
    typ: 'JWT',
    alg: 'ES256'
  };
  const exp = Math.floor(Date.now() / 1000) + 12 * 60 * 60; // 12 hours
  const payload = {
    aud: audience,
    exp: exp,
    sub: VAPID_SUBJECT
  };
  const encoder = new TextEncoder();
  const headerB64 = base64UrlEncode(encoder.encode(JSON.stringify(header)));
  const payloadB64 = base64UrlEncode(encoder.encode(JSON.stringify(payload)));
  const unsignedToken = `${headerB64}.${payloadB64}`;
  // Import VAPID private key
  const privateKeyBytes = base64UrlDecode(VAPID_PRIVATE_KEY_RAW);
  const privateKey = await crypto.subtle.importKey('raw', privateKeyBytes, {
    name: 'ECDSA',
    namedCurve: 'P-256'
  }, false, [
    'sign'
  ]);
  // Sign the token
  const signature = await crypto.subtle.sign({
    name: 'ECDSA',
    hash: 'SHA-256'
  }, privateKey, encoder.encode(unsignedToken));
  const signatureB64 = base64UrlEncode(new Uint8Array(signature));
  return `${unsignedToken}.${signatureB64}`;
}
// Send push notification using Web Push Protocol
async function sendPushNotification(subscription, payload) {
  try {
    const endpoint = new URL(subscription.endpoint);
    const audience = `${endpoint.protocol}//${endpoint.host}`;
    // Generate VAPID JWT token
    const vapidToken = await generateVAPIDToken(audience);
    // For FCM endpoints, we send the payload as JSON directly
    const isFCM = endpoint.host.includes('fcm.googleapis.com');
    const headers = {
      'TTL': '86400',
      'Authorization': `vapid t=${vapidToken}, k=${VAPID_PUBLIC_KEY}`
    };
    let body;
    if (isFCM) {
      // FCM accepts JSON payload directly
      headers['Content-Type'] = 'application/json';
      const encoder = new TextEncoder();
      body = encoder.encode(payload);
    } else {
      // For other push services, use encrypted payload
      headers['Content-Type'] = 'application/octet-stream';
      headers['Content-Encoding'] = 'aes128gcm';
      const encoder = new TextEncoder();
      body = encoder.encode(payload);
    }
    console.log(`Sending to ${isFCM ? 'FCM' : 'other'} endpoint:`, endpoint.host);
    // Send the push notification
    const response = await fetch(subscription.endpoint, {
      method: 'POST',
      headers: headers,
      body: body
    });
    if (response.status === 410 || response.status === 404) {
      console.log('Subscription expired or invalid:', response.status);
      return false;
    }
    if (!response.ok) {
      const errorText = await response.text();
      console.error('Push send failed:', response.status, errorText);
      return false;
    }
    console.log('Push sent successfully');
    return true;
  } catch (error) {
    console.error('Error sending push notification:', error);
    return false;
  }
}
serve(async (req)=>{
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      headers: corsHeaders
    });
  }
  try {
    const supabaseClient = createClient(Deno.env.get('SUPABASE_URL') ?? '', Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '');
    // Get notification payload from request
    const { title, body, icon, badge, data, actions, tag, requireInteraction, userId } = await req.json();
    console.log('Sending push notification:', {
      title,
      body,
      userId
    });
    // Fetch subscriptions - if userId provided, send only to that user, otherwise to all
    let query = supabaseClient.from('push_subscribers').select('*');
    if (userId) {
      query = query.eq('user_id', userId);
      console.log('Targeting specific user:', userId);
    } else {
      console.log('Broadcasting to all subscribers');
    }
    const { data: subscriptions, error: fetchError } = await query;
    if (fetchError) {
      console.error('Error fetching subscriptions:', fetchError);
      return new Response(JSON.stringify({
        error: 'Failed to fetch subscriptions'
      }), {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json'
        },
        status: 500
      });
    }
    if (!subscriptions || subscriptions.length === 0) {
      console.log('No subscriptions found');
      return new Response(JSON.stringify({
        message: 'No subscriptions found',
        sent: 0
      }), {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json'
        },
        status: 200
      });
    }
    console.log(`Found ${subscriptions.length} subscription(s)`);
    // Prepare notification payload
    const notificationData = {
      title: title || 'AIJIM',
      body: body || 'You have a new notification',
      icon: icon || '/aijim-uploads/aijim-192.png',
      badge: badge || '/aijim-uploads/aijim-192.png',
      data: data || {},
      actions: actions || [],
      tag: tag || 'default',
      requireInteraction: requireInteraction || false
    };
    const payloadString = JSON.stringify(notificationData);
    // Send notifications
    let sentCount = 0;
    const expiredEndpoints = [];
    for (const sub of subscriptions){
      const subscription = sub.subscription;
      const sent = await sendPushNotification(subscription, payloadString);
      if (sent) {
        sentCount++;
        console.log(`Successfully sent to endpoint: ${sub.endpoint.substring(0, 50)}...`);
      } else {
        expiredEndpoints.push(sub.endpoint);
        console.log(`Failed/expired endpoint: ${sub.endpoint.substring(0, 50)}...`);
      }
    }
    // Remove expired subscriptions
    if (expiredEndpoints.length > 0) {
      const { error: deleteError } = await supabaseClient.from('push_subscribers').delete().in('endpoint', expiredEndpoints);
      if (deleteError) {
        console.error('Error removing expired subscriptions:', deleteError);
      } else {
        console.log(`Removed ${expiredEndpoints.length} expired subscription(s)`);
      }
    }
    console.log(`Notification sent successfully: ${sentCount}/${subscriptions.length}`);
    return new Response(JSON.stringify({
      success: true,
      sent: sentCount,
      expired: expiredEndpoints.length,
      total: subscriptions.length
    }), {
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json'
      },
      status: 200
    });
  } catch (error) {
    console.error('Error in send-push-notification function:', error);
    return new Response(JSON.stringify({
      error: error.message
    }), {
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json'
      },
      status: 500
    });
  }
});
