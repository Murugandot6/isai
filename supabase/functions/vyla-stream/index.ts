// @ts-nocheck
import { serve } from "https://deno.land/std@0.190.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const url = new URL(req.url);
    const id = url.searchParams.get('id');
    const type = url.searchParams.get('type') || 'movie';
    const s = url.searchParams.get('s') || '1';
    const e = url.searchParams.get('e') || '1';

    if (!id) {
      return new Response(JSON.stringify({ error: "Missing id parameter" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }

    // Retrieve the securely stored Vyla API Key from Supabase secrets
    const vylaApiKey = Deno.env.get('VYLA_API_KEY');
    if (!vylaApiKey) {
      console.warn("[vyla-stream] VYLA_API_KEY secret is not set in Supabase Dashboard.");
      return new Response(JSON.stringify({ 
        error: "Missing VYLA_API_KEY. Please set the 'VYLA_API_KEY' secret in your Supabase Dashboard -> Project Settings -> Edge Functions -> Secrets." 
      }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }

    // Direct endpoints matching Vyla documentation
    const targetUrl = type === 'tv'
      ? `https://boysism-vyla.hf.space/tv?id=${id}&s=${s}&e=${e}`
      : `https://boysism-vyla.hf.space/movie?id=${id}`;

    console.log(`[vyla-stream] Securely proxying request to Vyla: ${targetUrl}`);

    const res = await fetch(targetUrl, {
      headers: {
        'Authorization': `Bearer ${vylaApiKey}`
      }
    });

    if (!res.ok) {
      const errText = await res.text();
      console.error(`[vyla-stream] Vyla API responded with status ${res.status}: ${errText}`);
      return new Response(JSON.stringify({ 
        error: `Vyla API returned status ${res.status}`,
        details: errText 
      }), {
        status: res.status,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }

    const data = await res.json();
    return new Response(JSON.stringify(data), {
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });

  } catch (error: any) {
    console.error("[vyla-stream] Unexpected error during request proxying:", error);
    return new Response(JSON.stringify({ error: error.message || "Internal server error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });
  }
});