import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { streamChat, type Msg, type MsgContent } from "@/lib/streamChat";
import ChatMessage from "@/components/ChatMessage";
import ChatInput from "@/components/ChatInput";
import Disclaimer from "@/components/Disclaimer";
import ChronosAvatar from "@/components/ChronosAvatar";
import HistoryPanel from "@/components/HistoryPanel";
import { useAuth } from "@/hooks/useAuth";
import { saveConversation } from "@/lib/historyStorage";
import { toast } from "sonner";
import { LogOut, MessageCircle, Clock, Heart, Camera, AlertTriangle, Stethoscope, Pill, Activity, Scan, Users } from "lucide-react";
import FirstAidCards from "@/components/FirstAidCards";
import InjuryTimeline from "@/components/InjuryTimeline";
import SymptomChecker from "@/components/SymptomChecker";
import EmergencySOS from "@/components/EmergencySOS";
import MedicationReminders from "@/components/MedicationReminders";
import HealthVitals from "@/components/HealthVitals";
import SkinAnalysis from "@/components/SkinAnalysis";
import FamilyProfiles from "@/components/FamilyProfiles";
import PremiumGate from "@/components/PremiumGate";
import { usePurchases } from "@/hooks/usePurchases";

interface DisplayMsg {
  role: "user" | "assistant";
  content: string;
  imageUrl?: string;
}

const Index = () => {
  const { session, loading: authLoading, signOut } = useAuth();
  const { isUnlocked, purchaseModule } = usePurchases();
  const navigate = useNavigate();
  const [messages, setMessages] = useState<DisplayMsg[]>([]);
  const [streamMessages, setStreamMessages] = useState<Msg[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [activeTab, setActiveTab] = useState<"chat" | "history" | "firstaid" | "timeline" | "symptoms" | "sos" | "meds" | "vitals" | "skin" | "family">("chat");
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Auth gate disabled for now
  }, [authLoading, session, navigate]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages]);

  // Auto-save conversation when it has content and user switches to history
  useEffect(() => {
    if (activeTab === "history" && messages.length >= 2) {
      saveConversation(messages);
    }
  }, [activeTab]);

  const startNewChat = () => {
    if (messages.length >= 2) {
      saveConversation(messages);
    }
    setMessages([]);
    setStreamMessages([]);
    setActiveTab("chat");
  };

  const restoreConversation = (msgs: DisplayMsg[]) => {
    setMessages(msgs);
    setStreamMessages(
      msgs.map((m) => ({ role: m.role, content: m.content }) as Msg)
    );
    setActiveTab("chat");
  };

  const sendText = async (input: string) => {
    const userDisplay: DisplayMsg = { role: "user", content: input };
    const userMsg: Msg = { role: "user", content: input };
    const updated = [...streamMessages, userMsg];
    setMessages((prev) => [...prev, userDisplay]);
    setStreamMessages(updated);
    setIsLoading(true);

    let assistantSoFar = "";
    const upsertAssistant = (chunk: string) => {
      assistantSoFar += chunk;
      setMessages((prev) => {
        const last = prev[prev.length - 1];
        if (last?.role === "assistant") {
          return prev.map((m, i) => (i === prev.length - 1 ? { ...m, content: assistantSoFar } : m));
        }
        return [...prev, { role: "assistant", content: assistantSoFar }];
      });
    };

    try {
      await streamChat({
        messages: updated,
        onDelta: (chunk) => upsertAssistant(chunk),
        onDone: () => {
          setIsLoading(false);
          setStreamMessages((prev) => [...prev, { role: "assistant", content: assistantSoFar }]);
        },
      });
    } catch (e: any) {
      console.error(e);
      toast.error(e.message || "Something went wrong");
      setIsLoading(false);
    }
  };

  const sendImage = async (base64: string) => {
    const userDisplay: DisplayMsg = { role: "user", content: "Please analyze this image of my injury and advise on treatment.", imageUrl: base64 };
    const userContent: MsgContent = [
      { type: "text", text: "Please analyze this image of my injury and advise on treatment." },
      { type: "image_url", image_url: { url: base64 } },
    ];
    const userMsg: Msg = { role: "user", content: userContent };
    const updated = [...streamMessages, userMsg];
    setMessages((prev) => [...prev, userDisplay]);
    setStreamMessages(updated);
    setIsLoading(true);

    let assistantSoFar = "";
    const upsertAssistant = (chunk: string) => {
      assistantSoFar += chunk;
      setMessages((prev) => {
        const last = prev[prev.length - 1];
        if (last?.role === "assistant") {
          return prev.map((m, i) => (i === prev.length - 1 ? { ...m, content: assistantSoFar } : m));
        }
        return [...prev, { role: "assistant", content: assistantSoFar }];
      });
    };

    try {
      await streamChat({
        messages: updated,
        onDelta: (chunk) => upsertAssistant(chunk),
        onDone: () => {
          setIsLoading(false);
          setStreamMessages((prev) => [...prev, { role: "assistant", content: assistantSoFar }]);
        },
      });
    } catch (e: any) {
      console.error(e);
      toast.error(e.message || "Something went wrong");
      setIsLoading(false);
    }
  };

  const lastAssistantMsg = [...messages].reverse().find((m) => m.role === "assistant");

  if (authLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-background">
        <ChronosAvatar isThinking size={64} />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-background">
      {/* Header */}
      <header className="flex items-center justify-between py-4 px-6 border-b border-border bg-card/60 backdrop-blur-xl">
        <div className="flex items-center gap-3">
          <ChronosAvatar isThinking={isLoading} isSpeaking={isSpeaking} size={36} />
          <h1 className="text-xl font-display font-bold text-foreground tracking-tight">
            Chronos Apex
          </h1>
        </div>

        <span className="text-xs text-muted-foreground font-body hidden sm:inline">Healthcare Companion</span>

        <button
          onClick={signOut}
          className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors font-body"
          title="Sign out"
        >
          <LogOut size={16} />
          <span className="hidden sm:inline">Sign out</span>
        </button>
      </header>

      {/* Content area */}
      {activeTab === "chat" ? (
        <>
          <div ref={scrollRef} className="flex-1 overflow-y-auto">
            <div className="max-w-2xl mx-auto px-4 py-6 space-y-5">
              <Disclaimer />

              {messages.length === 0 && (
                <div className="flex flex-col items-center justify-center py-16 gap-4">
                  <ChronosAvatar isThinking={false} size={80} />
                  <p className="text-muted-foreground text-center text-sm font-body max-w-sm">
                    Hello. I am Chronos, your personal healthcare companion. Tap the microphone to speak, or use the camera to scan an injury.
                  </p>
                </div>
              )}

              {messages.map((msg, i) => (
                <ChatMessage
                  key={i}
                  role={msg.role}
                  content={msg.content}
                  imageUrl={msg.imageUrl}
                  isStreaming={isLoading && i === messages.length - 1 && msg.role === "assistant"}
                  isSpeaking={isSpeaking && i === messages.length - 1 && msg.role === "assistant"}
                />
              ))}

              {isLoading && messages[messages.length - 1]?.role === "user" && (
                <div className="flex gap-3 items-center animate-fade-slide-up">
                  <ChronosAvatar isThinking size={40} />
                  <div className="bg-card rounded-bubble px-5 py-3.5 shadow-soft">
                    <div className="flex gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-muted-foreground/40 animate-bounce" style={{ animationDelay: "0ms" }} />
                      <span className="w-2 h-2 rounded-full bg-muted-foreground/40 animate-bounce" style={{ animationDelay: "150ms" }} />
                      <span className="w-2 h-2 rounded-full bg-muted-foreground/40 animate-bounce" style={{ animationDelay: "300ms" }} />
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Input */}
          <div className="border-t border-border bg-card/60 backdrop-blur-sm">
            <div className="max-w-2xl mx-auto px-4 py-3">
              <ChatInput
                onSend={sendText}
                onImageCapture={sendImage}
                disabled={isLoading}
                lastAssistantText={lastAssistantMsg?.content}
                onSpeakingChange={setIsSpeaking}
              />
            </div>
          </div>
        </>
      ) : activeTab === "history" ? (
        <div className="flex-1 overflow-y-auto">
          <div className="max-w-2xl mx-auto px-4 py-6">
            <HistoryPanel onRestore={restoreConversation} />
            {messages.length > 0 && (
              <button
                onClick={startNewChat}
                className="w-full mt-4 text-sm bg-primary/10 hover:bg-primary/20 text-primary rounded-xl py-3 font-medium transition-colors font-body"
              >
                + New conversation
              </button>
            )}
          </div>
        </div>
      ) : activeTab === "firstaid" ? (
        <div className="flex-1 overflow-hidden">
          <FirstAidCards />
        </div>
      ) : activeTab === "timeline" ? (
        <div className="flex-1 overflow-hidden">
          <InjuryTimeline />
        </div>
      ) : activeTab === "symptoms" ? (
        <div className="flex-1 overflow-hidden">
          <SymptomChecker />
        </div>
      ) : activeTab === "sos" ? (
        <div className="flex-1 overflow-hidden">
          <EmergencySOS />
        </div>
      ) : activeTab === "meds" ? (
        <div className="flex-1 overflow-hidden">
          <MedicationReminders />
        </div>
      ) : activeTab === "vitals" ? (
        <div className="flex-1 overflow-hidden">
          <HealthVitals />
        </div>
      ) : activeTab === "skin" ? (
        <div className="flex-1 overflow-hidden">
          <SkinAnalysis />
        </div>
      ) : activeTab === "family" ? (
        <div className="flex-1 overflow-hidden">
          <FamilyProfiles />
        </div>
      ) : null}

      {/* Bottom Navigation */}
      <nav className="border-t border-border bg-card/80 backdrop-blur-xl">
        <div className="max-w-2xl mx-auto overflow-x-auto scrollbar-hide">
          <div className="flex items-center py-1.5 px-2 min-w-max">
            {([
              { id: "chat", icon: MessageCircle, label: "Chat" },
              { id: "firstaid", icon: Heart, label: "First Aid" },
              { id: "symptoms", icon: Stethoscope, label: "Symptoms" },
              { id: "skin", icon: Scan, label: "Skin" },
              { id: "meds", icon: Pill, label: "Meds" },
              { id: "vitals", icon: Activity, label: "Vitals" },
              { id: "timeline", icon: Camera, label: "Timeline" },
              { id: "family", icon: Users, label: "Family" },
              { id: "history", icon: Clock, label: "History" },
              { id: "sos", icon: AlertTriangle, label: "SOS" },
            ] as const).map(({ id, icon: Icon, label }) => (
              <button
                key={id}
                onClick={() => setActiveTab(id)}
                className={`flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-lg transition-all shrink-0 ${
                  activeTab === id
                    ? id === "sos"
                      ? "text-destructive"
                      : "text-primary"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <Icon size={18} />
                <span className="text-[10px] font-body font-medium">{label}</span>
              </button>
            ))}
          </div>
        </div>
      </nav>
    </div>
  );
};

export default Index;
