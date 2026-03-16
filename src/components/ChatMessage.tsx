import ReactMarkdown from "react-markdown";
import ChronosAvatar from "./ChronosAvatar";

interface ChatMessageProps {
  role: "user" | "assistant";
  content: string;
  imageUrl?: string;
  isStreaming?: boolean;
  isSpeaking?: boolean;
}

const ChatMessage = ({ role, content, imageUrl, isStreaming = false, isSpeaking = false }: ChatMessageProps) => {
  const isUser = role === "user";

  return (
    <div
      className={`flex gap-3 animate-fade-slide-up ${isUser ? "flex-row-reverse" : "flex-row"}`}
    >
      {!isUser && <ChronosAvatar isThinking={isStreaming} isSpeaking={isSpeaking} />}

      <div
        className={`max-w-[80%] px-5 py-3.5 rounded-bubble shadow-soft ${
          isUser
            ? "bg-chronos-bubble-user text-primary-foreground"
            : "bg-card text-card-foreground"
        }`}
      >
        {imageUrl && (
          <img src={imageUrl} alt="Captured" className="rounded-lg mb-2 max-h-48 object-cover" />
        )}
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
