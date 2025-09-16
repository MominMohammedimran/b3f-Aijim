import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

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
    const { waybill, orderId } = await req.json();

    if (!waybill) {
      return new Response(
        JSON.stringify({ error: 'Waybill number is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Tracking order ${orderId} with waybill: ${waybill}`);

    // Call Delhivery tracking API
    const trackingUrl = `https://track.delhivery.com/api/v1/packages/json/?waybill=${waybill}&ref_ids=${orderId}`;
    
    const trackingResponse = await fetch(trackingUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
    });

    if (!trackingResponse.ok) {
      console.error('Delhivery API error:', trackingResponse.status, trackingResponse.statusText);
      return new Response(
        JSON.stringify({ error: 'Failed to fetch tracking information' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const trackingData = await trackingResponse.json();
    console.log('Delhivery response:', JSON.stringify(trackingData, null, 2));

    // Extract tracking information
    let trackingStatus = 'unknown';
    let currentLocation = '';
    let history = [];

    if (trackingData && trackingData.ShipmentData && trackingData.ShipmentData.length > 0) {
      const shipment = trackingData.ShipmentData[0];
      
      // Map Delhivery status to our order status
      const statusMapping: { [key: string]: string } = {
        'Dispatched': 'shipped',
        'In transit': 'shipped',
        'Out for Delivery': 'out-for-delivery',
        'Delivered': 'delivered',
        'Undelivered': 'shipped',
        'RTO': 'return-picked',
        'Cancelled': 'cancelled'
      };

      trackingStatus = statusMapping[shipment.Status] || 'processing';
      currentLocation = shipment.Origin || '';
      
      // Build tracking history from scans
      if (shipment.Scans && Array.isArray(shipment.Scans)) {
        history = shipment.Scans.map((scan: any) => ({
          status: scan.ScanDetail || scan.Instructions || 'In Transit',
          location: scan.ScannedLocation || '',
          timestamp: scan.ScanDateTime || scan.StatusDateTime || new Date().toISOString(),
          instructions: scan.Instructions || ''
        }));
      }
    }

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Update or create order tracking
    const { data: existingTracking, error: fetchError } = await supabase
      .from('order_tracking')
      .select('*')
      .eq('order_id', orderId)
      .single();

    if (fetchError && fetchError.code !== 'PGRST116') {
      console.error('Error fetching existing tracking:', fetchError);
    }

    const trackingPayload = {
      order_id: orderId,
      status: trackingStatus,
      current_location: currentLocation,
      estimated_delivery: null,
      history: history,
      updated_at: new Date().toISOString()
    };

    if (existingTracking) {
      // Update existing tracking
      const { error: updateError } = await supabase
        .from('order_tracking')
        .update(trackingPayload)
        .eq('order_id', orderId);

      if (updateError) {
        console.error('Error updating tracking:', updateError);
        return new Response(
          JSON.stringify({ error: 'Failed to update tracking data' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    } else {
      // Create new tracking record
      const { error: insertError } = await supabase
        .from('order_tracking')
        .insert(trackingPayload);

      if (insertError) {
        console.error('Error inserting tracking:', insertError);
        return new Response(
          JSON.stringify({ error: 'Failed to create tracking data' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    }

    // Update order status if it has changed
    if (trackingStatus === 'delivered' || trackingStatus === 'out-for-delivery') {
      const { error: orderUpdateError } = await supabase
        .from('orders')
        .update({ 
          status: trackingStatus,
          updated_at: new Date().toISOString()
        })
        .eq('id', orderId);

      if (orderUpdateError) {
        console.error('Error updating order status:', orderUpdateError);
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        tracking: {
          status: trackingStatus,
          currentLocation: currentLocation,
          history: history,
          rawData: trackingData
        }
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in shipping-tracking function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});