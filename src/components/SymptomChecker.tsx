import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, ArrowRight, RotateCcw, Send } from "lucide-react";
import { streamChat, type Msg } from "@/lib/streamChat";
import { toast } from "sonner";
import ChronosAvatar from "./ChronosAvatar";

interface Answer {
  bodyPart: string;
  painType: string;
  severity: number;
  duration: string;
  additional: string;
}

const bodyParts = ["Head", "Chest", "Abdomen", "Back", "Arms", "Legs", "Hands/Feet", "Neck/Throat", "Skin", "Other"];
const painTypes = ["Sharp/Stabbing", "Dull/Aching", "Burning", "Throbbing", "Tingling/Numbness", "Cramping", "Pressure", "Itching", "Swelling", "Other"];
const durations = ["Just now", "A few hours", "1-2 days", "3-7 days", "1-2 weeks", "Over 2 weeks", "Recurring/Chronic"];

const SymptomChecker = () => {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Partial<Answer>>({});
  const [assessment, setAssessment] = useState("");
  const [loading, setLoading] = useState(false);

  const steps = [
    {
      title: "Where does it hurt?",
      subtitle: "Select the affected area",
      options: bodyParts,
      key: "bodyPart" as const,
    },
    {
      title: "What type of pain?",
      subtitle: "Describe the sensation",
      options: painTypes,
      key: "painType" as const,
    },
    {
      title: "How severe is it?",
      subtitle: "Rate from 1 (mild) to 10 (worst)",
      key: "severity" as const,
    },
    {
      title: "How long has this lasted?",
      subtitle: "Select duration",
      options: durations,
      key: "duration" as const,
    },
    {
      title: "Anything else to add?",
      subtitle: "Additional symptoms, context, or concerns",
      key: "additional" as const,
    },
  ];

  const canAdvance = () => {
    const s = steps[step];
    if (s.key === "additional") return true;
    return answers[s.key] !== undefined && answers[s.key] !== "";
  };

  const submitAssessment = async () => {
    setLoading(true);
    setStep(steps.length);

    const prompt = `You are Chronos, a healthcare AI companion. A user has completed a symptom assessment:
- Body part: ${answers.bodyPart}
- Pain type: ${answers.painType}
- Severity: ${answers.severity}/10
- Duration: ${answers.duration}
- Additional info: ${answers.additional || "None provided"}

Please provide:
1. A brief assessment of what this could indicate (list 2-3 possibilities)
2. Recommended home care steps
3. When to see a doctor (red flags)
4. A reassuring note

Keep it concise and clear. Use markdown formatting.`;

    const messages: Msg[] = [{ role: "user", content: prompt }];
    let result = "";

    try {
      await streamChat({
        messages,
        onDelta: (chunk) => {
          result += chunk;
          setAssessment(result);
        },
        onDone: () => setLoading(false),
      });
    } catch (e: any) {
      toast.error(e.message || "Something went wrong");
      setLoading(false);
    }
  };

  const reset = () => {
    setStep(0);
    setAnswers({});
    setAssessment("");
  };

  const currentStep = steps[step];

  return (
    <div className="flex flex-col h-full overflow-y-auto">
      <div className="px-4 pt-4 pb-2">
        <h2 className="text-lg font-display font-bold text-foreground">Symptom Checker</h2>
        <p className="text-xs text-muted-foreground font-body">Guided assessment in 5 steps</p>
      </div>

      {/* Progress bar */}
      {step < steps.length && (
        <div className="px-4 pb-3">
          <div className="flex gap-1">
            {steps.map((_, i) => (
              <div
                key={i}
                className={`h-1 flex-1 rounded-full transition-all ${
                  i <= step ? "bg-primary" : "bg-muted"
                }`}
              />
            ))}
          </div>
          <p className="text-xs text-muted-foreground font-body mt-1">Step {step + 1} of {steps.length}</p>
        </div>
      )}

      <div className="flex-1 px-4 pb-4">
        <AnimatePresence mode="wait">
          {step < steps.length ? (
            <motion.div
              key={step}
              initial={{ x: 50, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -50, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="space-y-4"
            >
              <div>
                <h3 className="text-base font-display font-bold text-foreground">{currentStep.title}</h3>
                <p className="text-xs text-muted-foreground font-body">{currentStep.subtitle}</p>
              </div>

              {currentStep.key === "severity" ? (
                <div className="space-y-3">
                  <input
                    type="range"
                    min="1"
                    max="10"
                    value={answers.severity || 5}
                    onChange={(e) => setAnswers((prev) => ({ ...prev, severity: Number(e.target.value) }))}
                    className="w-full accent-primary"
                  />
                  <div className="flex justify-between text-xs font-body text-muted-foreground">
                    <span>1 — Mild</span>
                    <span className="text-lg font-bold text-primary">{answers.severity || 5}</span>
                    <span>10 — Severe</span>
                  </div>
                </div>
              ) : currentStep.key === "additional" ? (
                <textarea
                  value={answers.additional || ""}
                  onChange={(e) => setAnswers((prev) => ({ ...prev, additional: e.target.value }))}
                  placeholder="e.g., Also have a slight fever, happened after exercise..."
                  rows={4}
                  className="w-full bg-secondary border border-border rounded-xl px-4 py-3 text-sm font-body text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary resize-none"
                />
              ) : (
                <div className="grid grid-cols-2 gap-2">
                  {currentStep.options?.map((opt) => (
                    <button
                      key={opt}
                      onClick={() => setAnswers((prev) => ({ ...prev, [currentStep.key]: opt }))}
                      className={`px-3 py-2.5 rounded-xl text-sm font-body font-medium transition-all text-left ${
                        answers[currentStep.key] === opt
                          ? "bg-primary/20 text-primary border border-primary/30"
                          : "bg-card border border-border text-foreground hover:border-primary/20"
                      }`}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              )}

              {/* Navigation */}
              <div className="flex gap-2 pt-2">
                {step > 0 && (
                  <button
                    onClick={() => setStep((s) => s - 1)}
                    className="flex items-center gap-1.5 px-4 py-2.5 bg-secondary text-foreground rounded-xl text-sm font-body"
                  >
                    <ArrowLeft size={14} /> Back
                  </button>
                )}
                {step < steps.length - 1 ? (
                  <button
                    onClick={() => setStep((s) => s + 1)}
                    disabled={!canAdvance()}
                    className="flex-1 flex items-center justify-center gap-1.5 bg-primary text-primary-foreground rounded-xl py-2.5 text-sm font-body font-medium disabled:opacity-40"
                  >
                    Next <ArrowRight size={14} />
                  </button>
                ) : (
                  <button
                    onClick={submitAssessment}
                    className="flex-1 flex items-center justify-center gap-1.5 bg-primary text-primary-foreground rounded-xl py-2.5 text-sm font-body font-medium"
                  >
                    <Send size={14} /> Get Assessment
                  </button>
                )}
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="result"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-4"
            >
              <div className="flex items-center gap-2">
                <ChronosAvatar isThinking={loading} size={36} />
                <h3 className="text-base font-display font-bold text-foreground">
                  {loading ? "Analyzing..." : "Assessment"}
                </h3>
              </div>

              <div className="bg-card border border-border rounded-xl p-4">
                <div className="text-sm font-body text-foreground/90 whitespace-pre-wrap prose prose-invert prose-sm max-w-none">
                  {assessment || "Thinking..."}
                </div>
              </div>

              {!loading && (
                <button
                  onClick={reset}
                  className="w-full flex items-center justify-center gap-2 bg-primary/10 hover:bg-primary/20 text-primary rounded-xl py-3 text-sm font-medium font-body transition-colors"
                >
                  <RotateCcw size={14} /> Start new assessment
                </button>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default SymptomChecker;
