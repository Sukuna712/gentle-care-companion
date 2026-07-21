import { createClient } from "@supabase/supabase-js";
import { defineTool, type ToolContext } from "@lovable.dev/mcp-js";

function supabaseForUser(ctx: ToolContext) {
  return createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_PUBLISHABLE_KEY!, {
    global: { headers: { Authorization: `Bearer ${ctx.getToken()}` } },
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

export default defineTool({
  name: "list_unlocked_modules",
  title: "List my unlocked modules",
  description: "List the premium Chronos Apex modules the signed-in user has purchased.",
  inputSchema: {},
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: async (_input, ctx) => {
    if (!ctx.isAuthenticated()) {
      return { content: [{ type: "text", text: "Not authenticated." }], isError: true };
    }
    const sb = supabaseForUser(ctx);
    const { data, error } = await sb
      .from("user_purchases")
      .select("module_name, created_at")
      .eq("user_id", ctx.getUserId())
      .order("created_at", { ascending: false });
    if (error) return { content: [{ type: "text", text: error.message }], isError: true };
    const modules = data ?? [];
    const text = modules.length
      ? modules.map((m) => `• ${m.module_name} (unlocked ${m.created_at})`).join("\n")
      : "No premium modules unlocked yet.";
    return {
      content: [{ type: "text", text }],
      structuredContent: { modules },
    };
  },
});
