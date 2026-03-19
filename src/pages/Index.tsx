import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { streamChat, type Msg, type MsgContent } from "@/lib/streamChat";
import ChatMessage from "@/components/ChatMessage";
import ChatInput from "@/components/ChatInput";
import Disclaimer from "@/components/Disclaimer";
import ChronosAvatar from "@/components/ChronosAvatar";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { LogOut } from "lucide-react";

interface DisplayMsg {
  role: "user" | "assistant";
  content: string;
  imageUrl?: string;
}

const Index = () => {
  const { session, loading: authLoading, signOut } = useAuth();
  const navigate = useNavigate();
  const [messages, setMessages] = useState<DisplayMsg[]>([]);
  const [streamMessages, setStreamMessages] = useState<Msg[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!authLoading && !session) {
      navigate("/auth");
    }
  }, [authLoading, session, navigate]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages]);

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
            Chronos
          </h1>
        </div>
        <button
          onClick={signOut}
          className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors font-body"
          title="Sign out"
        >
          <LogOut size={16} />
          <span className="hidden sm:inline">Sign out</span>
        </button>
      </header>

      {/* Chat area */}
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
    </div>
  );
};

export default Index;
