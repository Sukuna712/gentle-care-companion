import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Verify user auth
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Not authenticated" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } }
    );

    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      return new Response(JSON.stringify({ error: "Invalid user" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { module_name, product_id } = await req.json();
    if (!module_name || !product_id) {
      return new Response(JSON.stringify({ error: "Missing module_name or product_id" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Check if already purchased
    const { data: existing } = await supabase
      .from("user_purchases")
      .select("id")
      .eq("user_id", user.id)
      .eq("module_name", module_name)
      .maybeSingle();

    if (existing) {
      return new Response(JSON.stringify({ error: "Module already purchased" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const DODO_API_KEY = Deno.env.get("DODO_PAYMENTS_API_KEY");
    if (!DODO_API_KEY) {
      return new Response(JSON.stringify({ error: "Payment not configured" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const DODO_BASE = Deno.env.get("DODO_PAYMENTS_ENV") === "live"
      ? "https://live.dodopayments.com"
      : "https://test.dodopayments.com";

    // Create checkout session via Dodo Payments API
    const checkoutRes = await fetch(`${DODO_BASE}/checkouts`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${DODO_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        product_cart: [{ product_id, quantity: 1 }],
        payment_link: true,
        return_url: `${req.headers.get("origin") || "https://id-preview--5aebe91d-a9c5-4174-b000-db347d82e13b.lovable.app"}?purchase_success=${module_name}`,
        metadata: {
          user_id: user.id,
          module_name,
        },
        customer: {
          email: user.email || "user@example.com",
          name: user.user_metadata?.full_name || "Customer",
        },
      }),
    });

    if (!checkoutRes.ok) {
      const errText = await checkoutRes.text();
      console.error("Dodo API error:", errText);
      return new Response(JSON.stringify({ error: "Failed to create checkout session" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const checkoutData = await checkoutRes.json();

    return new Response(JSON.stringify({
      checkout_url: checkoutData.checkout_url,
      session_id: checkoutData.session_id,
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("Checkout error:", e);
    return new Response(JSON.stringify({ error: "Internal error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
