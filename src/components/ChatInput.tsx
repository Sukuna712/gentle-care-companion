import { useState, useRef, KeyboardEvent } from "react";
import { Send } from "lucide-react";
import VoiceControl from "./VoiceControl";
import CameraCapture from "./CameraCapture";

interface ChatInputProps {
  onSend: (message: string) => void;
  onImageCapture: (base64: string) => void;
  disabled?: boolean;
  lastAssistantText?: string;
  onSpeakingChange?: (speaking: boolean) => void;
}

const ChatInput = ({ onSend, onImageCapture, disabled = false, lastAssistantText, onSpeakingChange }: ChatInputProps) => {
  const [input, setInput] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSend = () => {
    const trimmed = input.trim();
    if (!trimmed || disabled) return;
    onSend(trimmed);
    setInput("");
    if (textareaRef.current) textareaRef.current.style.height = "auto";
  };

  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleInput = () => {
    const el = textareaRef.current;
    if (el) {
      el.style.height = "auto";
      el.style.height = Math.min(el.scrollHeight, 120) + "px";
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <VoiceControl
          onTranscript={onSend}
          textToSpeak={lastAssistantText}
          disabled={disabled}
          onSpeakingChange={onSpeakingChange}
        />
        <CameraCapture onCapture={onImageCapture} disabled={disabled} />
      </div>
      <div className="flex items-end gap-2 bg-card rounded-bubble shadow-chronos p-2">
        <textarea
          ref={textareaRef}
          value={input}
          onChange={(e) => { setInput(e.target.value); handleInput(); }}
          onKeyDown={handleKeyDown}
          placeholder="Type or speak to Chronos..."
          disabled={disabled}
          rows={1}
          className="flex-1 resize-none bg-transparent outline-none px-3 py-2.5 text-sm font-body text-foreground placeholder:text-muted-foreground"
        />
        <button
          onClick={handleSend}
          disabled={disabled || !input.trim()}
          className="flex-shrink-0 w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center disabled:opacity-40 transition-opacity hover:opacity-90"
        >
          <Send size={18} />
        </button>
      </div>
    </div>
  );
};

export default ChatInput;
