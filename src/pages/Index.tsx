import { useState, useRef, useEffect } from "react";
import { streamChat, type Msg } from "@/lib/streamChat";
import ChatMessage from "@/components/ChatMessage";
import ChatInput from "@/components/ChatInput";
import Disclaimer from "@/components/Disclaimer";
import BaymaxAvatar from "@/components/BaymaxAvatar";
import { toast } from "sonner";

const Index = () => {
  const [messages, setMessages] = useState<Msg[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages]);

  const send = async (input: string) => {
    const userMsg: Msg = { role: "user", content: input };
    const updatedMessages = [...messages, userMsg];
    setMessages(updatedMessages);
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
        messages: updatedMessages,
        onDelta: (chunk) => upsertAssistant(chunk),
        onDone: () => setIsLoading(false),
      });
    } catch (e: any) {
      console.error(e);
      toast.error(e.message || "Something went wrong");
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-background">
      {/* Header */}
      <header className="flex items-center justify-center gap-3 py-4 px-6 border-b border-border bg-card/80 backdrop-blur-sm">
        <BaymaxAvatar isThinking={isLoading} size={36} />
        <h1 className="text-xl font-display font-bold text-foreground tracking-tight">
          Chronos
        </h1>
      </header>

      {/* Chat area */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto">
        <div className="max-w-2xl mx-auto px-4 py-6 space-y-5">
          <Disclaimer />

          {messages.length === 0 && (
            <div className="flex flex-col items-center justify-center py-16 gap-4">
              <BaymaxAvatar isThinking={false} size={80} />
              <p className="text-muted-foreground text-center text-sm font-body max-w-sm">
                Hello. I am Baymax, your personal healthcare companion. Tell me what seems to be the problem.
              </p>
            </div>
          )}

          {messages.map((msg, i) => (
            <ChatMessage
              key={i}
              role={msg.role}
              content={msg.content}
              isStreaming={isLoading && i === messages.length - 1 && msg.role === "assistant"}
            />
          ))}

          {isLoading && messages[messages.length - 1]?.role === "user" && (
            <div className="flex gap-3 items-center animate-fade-slide-up">
              <BaymaxAvatar isThinking size={40} />
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
          <ChatInput onSend={send} disabled={isLoading} />
        </div>
      </div>
    </div>
  );
};

export default Index;
