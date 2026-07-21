import { auth, defineMcp } from "@lovable.dev/mcp-js";
import getProfile from "./tools/get-profile";
import updateProfile from "./tools/update-profile";
import listPurchases from "./tools/list-purchases";
import firstAidGuide from "./tools/first-aid-guide";

// Build the OAuth issuer from the Supabase project ref (not SUPABASE_URL, which
// on Lovable Cloud is the .lovable.cloud proxy). Vite inlines this at build
// time so the module stays import-safe.
const projectRef = import.meta.env.VITE_SUPABASE_PROJECT_ID ?? "project-ref-unset";

export default defineMcp({
  name: "chronos-apex-mcp",
  title: "Chronos Apex",
  version: "0.1.0",
  instructions:
    "Chronos Apex is a healthcare companion app. Use these tools to read the signed-in user's Chronos profile and unlocked premium modules, update their profile, or fetch general first-aid guidance for common minor issues. All medical guidance is general information only — never a diagnosis.",
  auth: auth.oauth.issuer({
    issuer: `https://${projectRef}.supabase.co/auth/v1`,
    acceptedAudiences: "authenticated",
  }),
  tools: [getProfile, updateProfile, listPurchases, firstAidGuide],
});
