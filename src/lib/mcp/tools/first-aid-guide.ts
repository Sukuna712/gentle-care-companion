import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";

const GUIDES: Record<string, { title: string; steps: string[]; red_flags: string[] }> = {
  cuts: {
    title: "Minor cuts and scrapes",
    steps: [
      "Wash your hands, then rinse the wound under clean running water.",
      "Apply gentle pressure with a clean cloth for 5–10 minutes to stop bleeding.",
      "Apply a thin layer of petroleum jelly and cover with a sterile bandage.",
      "Change the dressing daily and keep the area clean and dry.",
    ],
    red_flags: [
      "Bleeding will not stop after 15 minutes of pressure",
      "Wound is deep, gaping, or from a dirty/rusty object",
      "Signs of infection: increasing redness, warmth, pus, fever",
    ],
  },
  burns: {
    title: "Minor (first-degree) burns",
    steps: [
      "Cool the burn under cool (not cold) running water for 10–20 minutes.",
      "Remove tight items (rings, watches) before swelling starts.",
      "Cover loosely with a sterile non-stick dressing.",
      "Consider OTC pain relief per label instructions.",
    ],
    red_flags: [
      "Burn is larger than 3 inches / involves face, hands, feet, groin, or joints",
      "Blistering, charring, or white/leathery skin",
      "Chemical or electrical burn",
    ],
  },
  sprains: {
    title: "Sprains and soft-tissue injuries (PEACE & LOVE)",
    steps: [
      "Protect the area from further injury for 1–3 days.",
      "Elevate the limb above heart level when possible.",
      "Avoid anti-inflammatories in the very early phase; use ice sparingly for pain.",
      "After a few days, gradually load and move the joint as tolerated.",
    ],
    red_flags: [
      "Unable to bear any weight or use the limb",
      "Obvious deformity or a snap/pop at the time of injury",
      "Numbness, tingling, or the limb turning pale/cold",
    ],
  },
  headache: {
    title: "Tension headache",
    steps: [
      "Hydrate with water and rest in a quiet, dim room.",
      "Apply a cool cloth to the forehead or a warm pack to the neck.",
      "Consider OTC pain relief per label instructions.",
    ],
    red_flags: [
      "Sudden, severe 'worst ever' headache",
      "Headache with fever, stiff neck, confusion, weakness, or vision changes",
      "Headache after a head injury",
    ],
  },
  bite: {
    title: "Minor insect bite or sting",
    steps: [
      "Wash the area with soap and water.",
      "Apply a cold compress for 10 minutes to reduce swelling.",
      "Use an OTC antihistamine or hydrocortisone cream per label if itchy.",
    ],
    red_flags: [
      "Difficulty breathing, throat tightness, or facial swelling",
      "Widespread hives or dizziness",
      "Signs of infection developing over days",
    ],
  },
};

export default defineTool({
  name: "first_aid_guide",
  title: "Chronos first-aid guide",
  description:
    "Return Chronos Apex's general home-care guidance for a common minor issue. Not a medical diagnosis. Topics: cuts, burns, sprains, headache, bite.",
  inputSchema: {
    topic: z.enum(["cuts", "burns", "sprains", "headache", "bite"]).describe("Which first-aid topic to return."),
  },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: ({ topic }) => {
    const guide = GUIDES[topic];
    const disclaimer =
      "I am not a licensed physician. This is general information for minor issues only — not a diagnosis or treatment plan. Always consult a real doctor or seek emergency care if your condition worsens or you are unsure.";
    const text = [
      disclaimer,
      "",
      `**${guide.title}**`,
      "",
      "Steps:",
      ...guide.steps.map((s, i) => `${i + 1}. ${s}`),
      "",
      "Seek medical help if:",
      ...guide.red_flags.map((r) => `• ${r}`),
    ].join("\n");
    return {
      content: [{ type: "text", text }],
      structuredContent: { topic, disclaimer, ...guide },
    };
  },
});
