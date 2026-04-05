import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";
import { hmac } from "https://deno.land/x/hmac@v2.0.1/mod.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body = await req.text();
    const webhookSecret = Deno.env.get("DODO_WEBHOOK_SECRET");
    
    // Verify webhook signature if secret is configured
    if (webhookSecret) {
      const signature = req.headers.get("x-dodo-signature") || req.headers.get("webhook-signature");
      if (signature) {
        const computed = hmac("sha256", webhookSecret, body, "utf8", "hex");
        if (computed !== signature) {
          console.error("Invalid webhook signature");
          return new Response(JSON.stringify({ error: "Invalid signature" }), {
            status: 401,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }
      }
    }

    const event = JSON.parse(body);
    console.log("Webhook event:", JSON.stringify(event));

    // Handle payment success events
    const eventType = event.type || event.event_type;
    if (eventType === "payment.succeeded" || eventType === "checkout.completed" || eventType === "order.succeeded") {
      const metadata = event.data?.metadata || event.metadata || {};
      const userId = metadata.user_id;
      const moduleName = metadata.module_name;
      const paymentId = event.data?.payment_id || event.data?.session_id || event.id || "unknown";

      if (!userId || !moduleName) {
        console.error("Missing user_id or module_name in metadata:", metadata);
        return new Response(JSON.stringify({ error: "Missing metadata" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      // Use service role to insert purchase
      const supabase = createClient(
        Deno.env.get("SUPABASE_URL")!,
        Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
      );

      const { error: insertError } = await supabase
        .from("user_purchases")
        .upsert(
          { user_id: userId, module_name: moduleName, payment_id: paymentId },
          { onConflict: "user_id,module_name" }
        );

      if (insertError) {
        console.error("Failed to record purchase:", insertError);
        return new Response(JSON.stringify({ error: "DB error" }), {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      console.log(`Purchase recorded: user=${userId}, module=${moduleName}`);
    }

    return new Response(JSON.stringify({ received: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("Webhook error:", e);
    return new Response(JSON.stringify({ error: "Internal error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
