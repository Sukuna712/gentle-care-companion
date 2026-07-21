import { createClient } from "@supabase/supabase-js";
import { defineTool, type ToolContext } from "@lovable.dev/mcp-js";
import { z } from "zod";

function supabaseForUser(ctx: ToolContext) {
  return createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_PUBLISHABLE_KEY!, {
    global: { headers: { Authorization: `Bearer ${ctx.getToken()}` } },
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

export default defineTool({
  name: "update_profile",
  title: "Update my Chronos profile",
  description: "Update the signed-in user's display name and/or avatar URL.",
  inputSchema: {
    display_name: z.string().trim().min(1).max(120).optional().describe("New display name."),
    avatar_url: z.string().url().optional().describe("New avatar image URL."),
  },
  annotations: { readOnlyHint: false, destructiveHint: false, idempotentHint: true, openWorldHint: false },
  handler: async ({ display_name, avatar_url }, ctx) => {
    if (!ctx.isAuthenticated()) {
      return { content: [{ type: "text", text: "Not authenticated." }], isError: true };
    }
    if (display_name === undefined && avatar_url === undefined) {
      return { content: [{ type: "text", text: "Provide display_name or avatar_url." }], isError: true };
    }
    const patch: Record<string, unknown> = {};
    if (display_name !== undefined) patch.display_name = display_name;
    if (avatar_url !== undefined) patch.avatar_url = avatar_url;

    const sb = supabaseForUser(ctx);
    const { data, error } = await sb
      .from("profiles")
      .update(patch)
      .eq("id", ctx.getUserId())
      .select()
      .maybeSingle();
    if (error) return { content: [{ type: "text", text: error.message }], isError: true };
    return {
      content: [{ type: "text", text: `Updated profile: ${JSON.stringify(data)}` }],
      structuredContent: { profile: data },
    };
  },
});
