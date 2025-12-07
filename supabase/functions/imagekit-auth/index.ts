import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import ImageKit from "npm:imagekit@5.0.1";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const imagekit = new ImageKit({
      publicKey: "public_fPWb/qD9WzG7PvEMuQddkKTj5ko=",
      privateKey: Deno.env.get("IMAGEKIT_PRIVATE_KEY") || "private_F6ONzyGdZ98faepEMrC/2FcNEKg=",
      urlEndpoint: "https://ik.imagekit.io/o5ewoek4p",
    });

    const authenticationParameters = imagekit.getAuthenticationParameters();

    return new Response(JSON.stringify(authenticationParameters), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('ImageKit auth error:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
