import ReactMarkdown from "react-markdown";
import BaymaxAvatar from "./BaymaxAvatar";

interface ChatMessageProps {
  role: "user" | "assistant";
  content: string;
  isStreaming?: boolean;
}

const ChatMessage = ({ role, content, isStreaming = false }: ChatMessageProps) => {
  const isUser = role === "user";

  return (
    <div
      className={`flex gap-3 animate-fade-slide-up ${isUser ? "flex-row-reverse" : "flex-row"}`}
    >
      {!isUser && <BaymaxAvatar isThinking={isStreaming} />}

      <div
        className={`max-w-[80%] px-5 py-3.5 rounded-bubble shadow-soft ${
          isUser
            ? "bg-chronos-bubble-user text-primary-foreground"
            : "bg-card text-card-foreground"
        }`}
      >
        {isUser ? (
          <p className="text-sm leading-relaxed font-body">{content}</p>
        ) : (
          <div className="prose prose-sm max-w-none text-card-foreground font-body">
            <ReactMarkdown>{content}</ReactMarkdown>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatMessage;
