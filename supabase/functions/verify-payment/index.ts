import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

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
    const { transactionRef } = await req.json();
    
    if (!transactionRef) {
      console.error("Missing transactionRef");
      return new Response(
        JSON.stringify({ error: "Missing transactionRef" }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Verifying payment for transactionRef: ${transactionRef}`);

    const apiUrl = `https://paytm.udayscripts.in/?mid=SzFThC49898719386494&id=${transactionRef}`;
    
    const response = await fetch(apiUrl);
    const data = await response.json();

    console.log(`Payment verification response:`, data);

    return new Response(
      JSON.stringify(data),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    console.error("Payment verification error:", errorMessage);
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
